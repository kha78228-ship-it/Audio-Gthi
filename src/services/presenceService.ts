import { useState, useEffect, useRef } from 'react';
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  serverTimestamp, 
  collection, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserPresence } from '../types';

/**
 * STRICT 10-SECOND ONLINE THRESHOLD
 * As specified: Any signal older than 10 seconds without refresh is considered OFFLINE.
 */
export const ONLINE_TIMEOUT_MS = 10000; // 10 seconds timeout
export const HEARTBEAT_INTERVAL_MS = 4000; // 4 seconds ping cycle to stay reliably fresh

/**
 * Check if a presence record is online based strictly on 10s timeout
 */
export function isPresenceOnline(presence: Partial<UserPresence> | null | undefined, currentTimeMs: number = Date.now()): boolean {
  if (!presence) return false;
  
  // 1. Get accurate lastSeen timestamp in ms
  let lastSeenMs = presence.lastSeenMs;
  if (!lastSeenMs && presence.lastSeen) {
    try {
      lastSeenMs = presence.lastSeen.toMillis 
        ? presence.lastSeen.toMillis() 
        : (presence.lastSeen.toDate ? presence.lastSeen.toDate().getTime() : new Date(presence.lastSeen).getTime());
    } catch {
      lastSeenMs = 0;
    }
  }

  if (!lastSeenMs) return false;

  const diffMs = currentTimeMs - lastSeenMs;
  // If the heartbeat signal is older than 10,000 ms (10s), user is offline!
  return diffMs >= 0 && diffMs <= ONLINE_TIMEOUT_MS;
}

/**
 * Get human-readable online / offline status detail
 */
export function getOnlineStatusDetails(presence: Partial<UserPresence> | null | undefined, currentTimeMs: number = Date.now()): {
  isOnline: boolean;
  statusText: string;
  badgeText: string;
  badgeColor: 'emerald' | 'zinc';
  lastSeenMs: number;
} {
  const online = isPresenceOnline(presence, currentTimeMs);
  
  let lastSeenMs = presence?.lastSeenMs || 0;
  if (!lastSeenMs && presence?.lastSeen) {
    try {
      lastSeenMs = presence.lastSeen.toMillis 
        ? presence.lastSeen.toMillis() 
        : (presence.lastSeen.toDate ? presence.lastSeen.toDate().getTime() : new Date(presence.lastSeen).getTime());
    } catch {
      lastSeenMs = 0;
    }
  }

  if (online) {
    return {
      isOnline: true,
      statusText: 'Đang hoạt động trực tuyến',
      badgeText: 'Online',
      badgeColor: 'emerald',
      lastSeenMs
    };
  }

  if (!lastSeenMs) {
    return {
      isOnline: false,
      statusText: 'Chưa trực tuyến gần đây',
      badgeText: 'Offline',
      badgeColor: 'zinc',
      lastSeenMs: 0
    };
  }

  const diff = Math.max(0, currentTimeMs - lastSeenMs);
  const diffSec = Math.floor(diff / 1000);
  const diffMin = Math.floor(diff / 60000);
  const diffHour = Math.floor(diff / 3600000);

  let statusText = 'Vừa mới truy cập';
  let badgeText = 'Vừa xong';

  if (diffSec < 60) {
    statusText = `Hoạt động ${diffSec}s trước`;
    badgeText = `${diffSec}s trước`;
  } else if (diffMin < 60) {
    statusText = `Hoạt động ${diffMin} phút trước`;
    badgeText = `${diffMin}p trước`;
  } else if (diffHour < 24) {
    statusText = `Hoạt động ${diffHour} giờ trước`;
    badgeText = `${diffHour}h trước`;
  } else {
    const d = new Date(lastSeenMs);
    statusText = `Hoạt động ngày ${d.toLocaleDateString('vi-VN')}`;
    badgeText = d.toLocaleDateString('vi-VN');
  }

  return {
    isOnline: false,
    statusText,
    badgeText,
    badgeColor: 'zinc',
    lastSeenMs
  };
}

/**
 * Send presence heartbeat ping to Firestore (both userPresence and users collections)
 */
export async function sendPresencePing(user: any, metadata?: {
  accountId?: string;
  isVip?: boolean;
  isAuthorVerified?: boolean;
  authorStageName?: string;
}): Promise<void> {
  if (!user?.uid) return;

  const nowMs = Date.now();
  const payload: UserPresence = {
    uid: user.uid,
    isOnline: true,
    lastSeenMs: nowMs,
    lastSeen: serverTimestamp(),
    displayName: user.displayName || user.stageName || 'Người Dùng',
    photoURL: user.photoURL || '',
    accountId: metadata?.accountId || user.accountId || 'HV-USER',
    isVip: Boolean(metadata?.isVip ?? user.isVip),
    isAuthorVerified: Boolean(metadata?.isAuthorVerified ?? user.isAuthorVerified),
    authorStageName: metadata?.authorStageName || user.authorStageName || user.stageName || '',
    activePlatform: 'web',
    updatedAt: serverTimestamp()
  };

  try {
    const presRef = doc(db, 'userPresence', user.uid);
    await setDoc(presRef, payload, { merge: true });

    // Also update users collection for backward compatibility
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      lastSeenMs: nowMs,
      lastSeen: serverTimestamp(),
      isOnline: true
    }, { merge: true });
  } catch (err) {
    console.warn('Presence ping notice:', err);
  }
}

/**
 * Mark user offline when logging out or unloading tab
 */
export async function markUserOffline(uid: string): Promise<void> {
  if (!uid) return;
  try {
    const offlineTimestampMs = Date.now() - 15000; // Force timestamp to be > 10s ago immediately
    const presRef = doc(db, 'userPresence', uid);
    await setDoc(presRef, {
      isOnline: false,
      lastSeenMs: offlineTimestampMs,
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      isOnline: false,
      lastSeenMs: offlineTimestampMs,
      lastSeen: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Mark offline notice:', err);
  }
}

/**
 * Hook to track real-time presence of a single target user with 1-second auto-clocking
 */
export function useUserPresence(targetUid?: string | null) {
  const [presence, setPresence] = useState<UserPresence | null>(null);
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(Date.now());

  // 1. Clock timer running every 1 second to enforce exact 10s cut-off
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Real-time Firestore subscription to userPresence
  useEffect(() => {
    if (!targetUid) {
      setPresence(null);
      return;
    }

    const presRef = doc(db, 'userPresence', targetUid);
    const unsubscribe = onSnapshot(presRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserPresence;
        setPresence(data);
      } else {
        // Fallback: check users collection
        const userRef = doc(db, 'users', targetUid);
        getDoc(userRef).then((uSnap) => {
          if (uSnap.exists()) {
            const uData = uSnap.data();
            setPresence({
              uid: targetUid,
              isOnline: Boolean(uData.isOnline),
              lastSeenMs: uData.lastSeenMs || 0,
              lastSeen: uData.lastSeen,
              displayName: uData.displayName,
              photoURL: uData.photoURL
            });
          } else {
            setPresence(null);
          }
        }).catch(() => setPresence(null));
      }
    }, (err) => {
      console.warn('useUserPresence listener notice:', err);
    });

    return () => unsubscribe();
  }, [targetUid]);

  const isOnline = isPresenceOnline(presence, currentTimeMs);
  const statusDetails = getOnlineStatusDetails(presence, currentTimeMs);

  return {
    presence,
    isOnline,
    statusDetails,
    lastSeenMs: statusDetails.lastSeenMs,
    statusText: statusDetails.statusText,
    badgeText: statusDetails.badgeText,
    badgeColor: statusDetails.badgeColor
  };
}

/**
 * Hook to track real-time presence of a batch of users (friends, conversation partners)
 * with a single continuous 1-second auto-clocking tick.
 */
export function useBatchUserPresence(targetUids: string[]) {
  const [presenceMap, setPresenceMap] = useState<Record<string, UserPresence>>({});
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(Date.now());

  // 1. Clock timer running every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Real-time subscription to userPresence collection
  useEffect(() => {
    if (!targetUids || targetUids.length === 0) {
      setPresenceMap({});
      return;
    }

    const unsubscribes: Array<() => void> = [];
    const validUids = Array.from(new Set(targetUids.filter(Boolean)));

    validUids.forEach((uid) => {
      const presRef = doc(db, 'userPresence', uid);
      const unsub = onSnapshot(presRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data() as UserPresence;
          setPresenceMap((prev) => ({
            ...prev,
            [uid]: data
          }));
        }
      }, (err) => {
        console.warn('Batch presence listener notice for uid:', uid, err);
      });
      unsubscribes.push(unsub);
    });

    return () => {
      unsubscribes.forEach((fn) => fn());
    };
  }, [JSON.stringify(targetUids.filter(Boolean).sort())]);

  const getUserStatus = (uid: string) => {
    const pres = presenceMap[uid];
    const isOnline = isPresenceOnline(pres, currentTimeMs);
    const details = getOnlineStatusDetails(pres, currentTimeMs);
    return {
      isOnline,
      ...details
    };
  };

  return {
    presenceMap,
    currentTimeMs,
    getUserStatus,
    isUserOnline: (uid: string) => isPresenceOnline(presenceMap[uid], currentTimeMs)
  };
}

/**
 * Global Heartbeat hook: Automatically broadcasts user presence every 4 seconds
 * while active, and marks offline upon exit/beforeunload.
 */
export function useGlobalPresenceHeartbeat(
  user: any,
  meta?: {
    accountId?: string;
    isVip?: boolean;
    isAuthorVerified?: boolean;
    authorStageName?: string;
  }
) {
  const lastPingRef = useRef<number>(0);

  useEffect(() => {
    if (!user?.uid) return;

    // Immediate initial ping
    sendPresencePing(user, meta);
    lastPingRef.current = Date.now();

    // 1. Continuous Heartbeat every 4 seconds (well below the 10s threshold)
    const interval = setInterval(() => {
      sendPresencePing(user, meta);
      lastPingRef.current = Date.now();
    }, HEARTBEAT_INTERVAL_MS);

    // 2. Immediate ping on user interaction if > 2.5 seconds since last ping
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastPingRef.current > 2500) {
        sendPresencePing(user, meta);
        lastPingRef.current = now;
      }
    };

    window.addEventListener('mousemove', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('touchstart', handleUserActivity, { passive: true });
    window.addEventListener('focus', handleUserActivity);

    // 3. Tab visibility / Unload
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        sendPresencePing(user, meta);
        lastPingRef.current = Date.now();
      }
    };

    const handleBeforeUnload = () => {
      // Mark offline on tab close
      if (user?.uid) {
        markUserOffline(user.uid);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('focus', handleUserActivity);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user?.uid, meta?.accountId, meta?.isVip, meta?.isAuthorVerified, meta?.authorStageName]);
}
