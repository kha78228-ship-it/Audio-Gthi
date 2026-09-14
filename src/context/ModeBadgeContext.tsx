import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  subscribeToModeBadges, 
  markModeAsViewedInFirestore, 
  markAllModesAsViewedInFirestore,
  sendModeNotificationToFirestore,
  ModeBadgeSummary 
} from '../services/modeBadgeService';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { EcosystemMode } from '../types';

interface ModeBadgeContextType {
  badgeCounts: Record<string, number>;
  subTabBadgeCounts: Record<string, number>;
  totalBadgesCount: number;
  markModeAsViewed: (modeId: string, subTabId?: string) => Promise<void>;
  markAllAsViewed: () => Promise<void>;
  sendModeNotification: (modeId: string, title: string, message: string, subTabId?: string) => Promise<void>;
  getBadgeForMode: (modeId: string) => number;
  getBadgeForSubTab: (modeId: string, subTabId: string) => number;
}

const LOCAL_STORAGE_KEY = 'haevy_mode_badge_counts';

const ModeBadgeContext = createContext<ModeBadgeContextType>({
  badgeCounts: {},
  subTabBadgeCounts: {},
  totalBadgesCount: 0,
  markModeAsViewed: async () => {},
  markAllAsViewed: async () => {},
  sendModeNotification: async () => {},
  getBadgeForMode: () => 0,
  getBadgeForSubTab: () => 0,
});

export const ModeBadgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();

  // Initial state loaded from localStorage if available
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      messages: 2,
      finance: 1,
      couple: 1,
      games: 1,
      haevy_ai: 1,
      spiritual: 1,
      family_tree: 1,
      haevy_lite: 1,
    };
  });

  const [subTabBadgeCounts, setSubTabBadgeCounts] = useState<Record<string, number>>({
    'messages:chat': 1,
    'messages:friends': 1,
    'finance:page1': 1,
    'couple:page1': 1,
    'games:quests': 1,
    'haevy_ai:overview': 1,
    'spiritual:tarot': 1,
    'family_tree:anniversaries': 1,
    'haevy_lite:shop': 1,
  });

  // Dynamic live counts from specific active Firestore collections
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [pendingFriendRequestsCount, setPendingFriendRequestsCount] = useState(0);
  const [pendingAuthorVerificationsCount, setPendingAuthorVerificationsCount] = useState(0);

  // 1. Listen to Firestore modeBadges/summary for authenticated user
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToModeBadges(user.uid, (summary: ModeBadgeSummary) => {
      setBadgeCounts((prev) => {
        const next = { ...prev, ...summary.unreadCounts };
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });

      if (summary.subTabUnreadCounts) {
        setSubTabBadgeCounts((prev) => ({
          ...prev,
          ...summary.subTabUnreadCounts,
        }));
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // 2. Real-time listener for user conversations (messages mode -> chat tab)
  useEffect(() => {
    if (!user?.uid) {
      setUnreadMessagesCount(0);
      return;
    }

    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        let count = 0;
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.unreadCounts && data.unreadCounts[user.uid]) {
            count += Number(data.unreadCounts[user.uid]);
          }
        });
        setUnreadMessagesCount(count);
      }, (err) => {
        console.warn('Conversations unread listener error:', err);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Error setting up conversations listener:', err);
    }
  }, [user?.uid]);

  // 3. Real-time listener for incoming pending friend requests (messages mode -> friends tab)
  useEffect(() => {
    if (!user?.uid) {
      setPendingFriendRequestsCount(0);
      return;
    }

    try {
      const q = query(
        collection(db, 'friendRequests'),
        where('receiverUid', '==', user.uid),
        where('status', '==', 'pending')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setPendingFriendRequestsCount(snapshot.docs.length);
      }, (err) => {
        console.warn('Friend requests listener error:', err);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Error setting up friend requests listener:', err);
    }
  }, [user?.uid]);

  // 4. Real-time listener for pending author verifications (admin mode -> page3 tab)
  useEffect(() => {
    if (!user?.uid || !isAdmin) {
      setPendingAuthorVerificationsCount(0);
      return;
    }

    try {
      const q = query(
        collection(db, 'authorVerifications'),
        where('status', '==', 'pending')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setPendingAuthorVerificationsCount(snapshot.docs.length);
      }, (err) => {
        console.warn('Author verifications listener error:', err);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Error setting up author verifications listener:', err);
    }
  }, [user?.uid, isAdmin]);

  // Compute aggregated effective badge counts merging summary + active live collections
  const effectiveBadgeCounts: Record<string, number> = { ...badgeCounts };
  
  // Messages mode aggregation
  const liveMessagesTotal = unreadMessagesCount + pendingFriendRequestsCount;
  if (liveMessagesTotal > 0) {
    effectiveBadgeCounts['messages'] = Math.max(effectiveBadgeCounts['messages'] || 0, liveMessagesTotal);
  }

  // Admin mode aggregation
  if (isAdmin && pendingAuthorVerificationsCount > 0) {
    effectiveBadgeCounts['admin'] = Math.max(effectiveBadgeCounts['admin'] || 0, pendingAuthorVerificationsCount);
  }

  // Sub-tab specific effective counts
  const effectiveSubTabCounts: Record<string, number> = { ...subTabBadgeCounts };
  if (unreadMessagesCount > 0) {
    effectiveSubTabCounts['messages:chat'] = unreadMessagesCount;
    effectiveSubTabCounts['chat'] = unreadMessagesCount;
  }
  if (pendingFriendRequestsCount > 0) {
    effectiveSubTabCounts['messages:friends'] = pendingFriendRequestsCount;
    effectiveSubTabCounts['friends'] = pendingFriendRequestsCount;
  }
  if (isAdmin && pendingAuthorVerificationsCount > 0) {
    effectiveSubTabCounts['admin:page3'] = pendingAuthorVerificationsCount;
    effectiveSubTabCounts['page3'] = pendingAuthorVerificationsCount;
  }

  // Total badges across all modes
  const totalBadgesCount = Object.values(effectiveBadgeCounts).reduce((sum, val) => sum + (val > 0 ? val : 0), 0);

  // Mark a mode (and subTab) as viewed
  const markModeAsViewed = useCallback(async (modeId: string, subTabId?: string) => {
    if (!modeId) return;

    // 1. Optimistically clear badge in local state
    setBadgeCounts((prev) => {
      const updated = { ...prev, [modeId]: 0 };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    if (subTabId) {
      setSubTabBadgeCounts((prev) => ({
        ...prev,
        [`${modeId}:${subTabId}`]: 0,
        [subTabId]: 0,
      }));
    }

    // 2. Persist to Firestore if logged in
    if (user?.uid) {
      await markModeAsViewedInFirestore(user.uid, modeId, subTabId);
    }
  }, [user?.uid]);

  // Mark all modes as viewed
  const markAllAsViewed = useCallback(async () => {
    setBadgeCounts({});
    setSubTabBadgeCounts({});
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // ignore
    }

    if (user?.uid) {
      await markAllModesAsViewedInFirestore(user.uid);
    }
  }, [user?.uid]);

  // Send a custom mode notification to Firestore
  const sendModeNotification = useCallback(async (
    modeId: string, 
    title: string, 
    message: string, 
    subTabId?: string
  ) => {
    // Optimistically increment locally
    setBadgeCounts((prev) => ({
      ...prev,
      [modeId]: (prev[modeId] || 0) + 1,
    }));

    if (subTabId) {
      setSubTabBadgeCounts((prev) => ({
        ...prev,
        [`${modeId}:${subTabId}`]: (prev[`${modeId}:${subTabId}`] || 0) + 1,
        [subTabId]: (prev[subTabId] || 0) + 1,
      }));
    }

    if (user?.uid) {
      await sendModeNotificationToFirestore(user.uid, modeId, title, message, subTabId);
    }
  }, [user?.uid]);

  // Helper getters
  const getBadgeForMode = useCallback((modeId: string) => {
    return effectiveBadgeCounts[modeId] || 0;
  }, [effectiveBadgeCounts]);

  const getBadgeForSubTab = useCallback((modeId: string, subTabId: string) => {
    const key = `${modeId}:${subTabId}`;
    return effectiveSubTabCounts[key] || effectiveSubTabCounts[subTabId] || 0;
  }, [effectiveSubTabCounts]);

  return (
    <ModeBadgeContext.Provider
      value={{
        badgeCounts: effectiveBadgeCounts,
        subTabBadgeCounts: effectiveSubTabCounts,
        totalBadgesCount,
        markModeAsViewed,
        markAllAsViewed,
        sendModeNotification,
        getBadgeForMode,
        getBadgeForSubTab,
      }}
    >
      {children}
    </ModeBadgeContext.Provider>
  );
};

export const useModeBadges = () => useContext(ModeBadgeContext);
