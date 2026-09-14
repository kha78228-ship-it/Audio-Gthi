import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  addDoc, 
  serverTimestamp, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { EcosystemMode } from '../types';

export interface ModeBadgeSummary {
  unreadCounts: Record<string, number>;
  subTabUnreadCounts: Record<string, number>;
  lastViewedAt: Record<string, string>;
  updatedAt?: string;
}

export interface ModeNotificationItem {
  id: string;
  modeId: string;
  subTabId?: string;
  title: string;
  message: string;
  category?: string;
  isRead: boolean;
  createdAt: any;
  linkTab?: string;
}

const DEFAULT_STARTER_COUNTS: Record<string, number> = {
  messages: 2,
  finance: 1,
  couple: 1,
  games: 1,
  haevy_ai: 1,
  spiritual: 1,
  family_tree: 1,
  haevy_lite: 1,
};

const DEFAULT_SUBTAB_COUNTS: Record<string, number> = {
  'messages:chat': 1,
  'messages:friends': 1,
  'finance:page1': 1,
  'couple:page1': 1,
  'games:quests': 1,
  'haevy_ai:overview': 1,
  'spiritual:tarot': 1,
  'family_tree:anniversaries': 1,
  'haevy_lite:shop': 1,
};

/**
 * Initializes default mode badge document for user if it doesn't exist yet
 */
export async function initializeModeBadgesIfMissing(userId: string): Promise<ModeBadgeSummary> {
  try {
    const docRef = doc(db, 'users', userId, 'modeBadges', 'summary');
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return snap.data() as ModeBadgeSummary;
    }

    const initialData: ModeBadgeSummary = {
      unreadCounts: { ...DEFAULT_STARTER_COUNTS },
      subTabUnreadCounts: { ...DEFAULT_SUBTAB_COUNTS },
      lastViewedAt: {},
      updatedAt: new Date().toISOString(),
    };

    await setDoc(docRef, initialData, { merge: true });

    // Seed starter friendly notifications
    const starterNotifs = [
      {
        modeId: 'messages',
        subTabId: 'chat',
        title: 'Tin nhắn chào mừng',
        message: 'Chào mừng bạn đến với Haevy Universe! Khám phá nhắn tin bảo mật thời gian thực.',
      },
      {
        modeId: 'finance',
        subTabId: 'page1',
        title: 'Tặng thưởng Xu Haevy',
        message: 'Ví tài chính của bạn đã sẵn sàng! Kiểm tra số dư và quỹ tiết kiệm.',
      },
      {
        modeId: 'haevy_ai',
        subTabId: 'overview',
        title: 'Trợ lý AI sẵn sàng',
        message: 'Haevy AI 3.5 đã được kích hoạt. Hãy đặt câu hỏi hoặc yêu cầu điều hướng!',
      },
      {
        modeId: 'games',
        subTabId: 'quests',
        title: 'Nhiệm vụ hàng ngày mới',
        message: 'Thử thách đoán giai điệu và vòng quay may mắn đã mở hôm nay.',
      },
      {
        modeId: 'spiritual',
        subTabId: 'tarot',
        title: 'Quẻ Tarot hôm nay',
        message: 'Thông điệp vũ trụ ngày mới đang chờ bạn rút bài.',
      },
      {
        modeId: 'couple',
        subTabId: 'page1',
        title: 'Không gian tình nhân',
        message: 'Khám phá album kỷ niệm, lịch chu kỳ và hộp quà tình yêu.',
      },
    ];

    const notifsColl = collection(db, 'users', userId, 'modeNotifications');
    for (const notif of starterNotifs) {
      try {
        await addDoc(notifsColl, {
          ...notif,
          isRead: false,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Could not seed notification item:', err);
      }
    }

    return initialData;
  } catch (error) {
    console.error('Error in initializeModeBadgesIfMissing:', error);
    return {
      unreadCounts: { ...DEFAULT_STARTER_COUNTS },
      subTabUnreadCounts: { ...DEFAULT_SUBTAB_COUNTS },
      lastViewedAt: {},
    };
  }
}

/**
 * Subscribes to real-time mode badge counts from Firestore
 */
export function subscribeToModeBadges(
  userId: string,
  onUpdate: (summary: ModeBadgeSummary) => void
): () => void {
  const docRef = doc(db, 'users', userId, 'modeBadges', 'summary');

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as ModeBadgeSummary;
        onUpdate({
          unreadCounts: data.unreadCounts || {},
          subTabUnreadCounts: data.subTabUnreadCounts || {},
          lastViewedAt: data.lastViewedAt || {},
          updatedAt: data.updatedAt,
        });
      } else {
        // Initialize if not present
        initializeModeBadgesIfMissing(userId).then(onUpdate);
      }
    },
    (error) => {
      console.warn('Firestore modeBadges listener error, falling back to local state:', error);
    }
  );

  return unsubscribe;
}

/**
 * Mark a specific mode (and optionally sub-tab) as viewed in Firestore
 */
export async function markModeAsViewedInFirestore(
  userId: string,
  modeId: string,
  subTabId?: string
): Promise<void> {
  if (!userId || !modeId) return;

  try {
    const docRef = doc(db, 'users', userId, 'modeBadges', 'summary');
    const nowIso = new Date().toISOString();

    const updatePayload: Record<string, any> = {
      [`unreadCounts.${modeId}`]: 0,
      [`lastViewedAt.${modeId}`]: nowIso,
      updatedAt: nowIso,
    };

    if (subTabId) {
      updatePayload[`subTabUnreadCounts.${modeId}:${subTabId}`] = 0;
      updatePayload[`subTabUnreadCounts.${subTabId}`] = 0;
      updatePayload[`lastViewedAt.${modeId}:${subTabId}`] = nowIso;
    }

    await updateDoc(docRef, updatePayload).catch(async (err) => {
      // If doc didn't exist, set it
      if (err.code === 'not-found' || err.message?.includes('No document to update')) {
        await setDoc(
          docRef,
          {
            unreadCounts: { [modeId]: 0 },
            subTabUnreadCounts: subTabId ? { [`${modeId}:${subTabId}`]: 0 } : {},
            lastViewedAt: { [modeId]: nowIso },
            updatedAt: nowIso,
          },
          { merge: true }
        );
      }
    });

    // Mark notifications in subcollection as read
    try {
      const notifsQuery = query(
        collection(db, 'users', userId, 'modeNotifications'),
        where('modeId', '==', modeId),
        where('isRead', '==', false)
      );
      const snap = await getDocs(notifsQuery);
      const batchPromises = snap.docs.map((docSnap) =>
        updateDoc(docSnap.ref, { isRead: true })
      );
      await Promise.all(batchPromises);
    } catch (e) {
      // Non-critical, ignore if permissions/network
    }
  } catch (error) {
    console.error('Error marking mode as viewed in Firestore:', error);
  }
}

/**
 * Mark all modes as viewed in Firestore
 */
export async function markAllModesAsViewedInFirestore(userId: string): Promise<void> {
  if (!userId) return;

  try {
    const docRef = doc(db, 'users', userId, 'modeBadges', 'summary');
    const nowIso = new Date().toISOString();

    await setDoc(
      docRef,
      {
        unreadCounts: {},
        subTabUnreadCounts: {},
        lastViewedAt: { all: nowIso },
        updatedAt: nowIso,
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error marking all modes viewed:', error);
  }
}

/**
 * Increment badge count for a mode in Firestore and create an unread notification
 */
export async function sendModeNotificationToFirestore(
  userId: string,
  modeId: string,
  title: string,
  message: string,
  subTabId?: string
): Promise<void> {
  if (!userId || !modeId) return;

  try {
    const docRef = doc(db, 'users', userId, 'modeBadges', 'summary');
    const notifsColl = collection(db, 'users', userId, 'modeNotifications');

    // 1. Add notification item
    await addDoc(notifsColl, {
      modeId,
      subTabId: subTabId || null,
      title,
      message,
      isRead: false,
      createdAt: serverTimestamp(),
    });

    // 2. Fetch current counts and increment
    const snap = await getDoc(docRef);
    const data = snap.exists() ? (snap.data() as ModeBadgeSummary) : { unreadCounts: {}, subTabUnreadCounts: {}, lastViewedAt: {} };
    
    const currentModeCount = (data.unreadCounts?.[modeId] || 0) + 1;
    const updatePayload: Record<string, any> = {
      [`unreadCounts.${modeId}`]: currentModeCount,
      updatedAt: new Date().toISOString(),
    };

    if (subTabId) {
      const subKey = `${modeId}:${subTabId}`;
      const currentSubCount = (data.subTabUnreadCounts?.[subKey] || 0) + 1;
      updatePayload[`subTabUnreadCounts.${subKey}`] = currentSubCount;
      updatePayload[`subTabUnreadCounts.${subTabId}`] = currentSubCount;
    }

    await setDoc(docRef, updatePayload, { merge: true });
  } catch (error) {
    console.error('Error sending mode notification to Firestore:', error);
  }
}
