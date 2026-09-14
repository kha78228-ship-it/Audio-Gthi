import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  arrayUnion, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { EcosystemMode, ActiveTab } from '../types';

export type HubNotificationCategory = 
  | 'all'
  | 'system'
  | 'friends'
  | 'finance'
  | 'family_tree'
  | 'audio'
  | 'couple'
  | 'games';

export interface HubNotification {
  id: string;
  userId?: string;
  category: 'system' | 'friends' | 'finance' | 'family_tree' | 'audio' | 'couple' | 'games';
  title: string;
  message: string;
  createdAt: any;
  isRead: boolean;
  source: 'firestore_user' | 'system_announcement' | 'friend_request' | 'friend_photo' | 'finance_tx' | 'family_event' | 'family_proposal';
  badgeText?: string;
  badgeColor?: string;
  iconType?: string;
  targetMode?: EcosystemMode;
  targetTab?: ActiveTab | string;
  actionText?: string;
  actionData?: any;
  metadata?: Record<string, any>;
  senderName?: string;
  senderPhoto?: string;
  amount?: number;
  lunarDate?: string;
}

const LOCAL_STORAGE_READ_PREFIX = 'haevy_hub_read_ids_';
const LOCAL_STORAGE_DISMISSED_PREFIX = 'haevy_hub_dismissed_ids_';

/**
 * Get locally stored read notification IDs
 */
export function getLocalReadIds(userId: string): string[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_READ_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Get locally stored dismissed notification IDs
 */
export function getLocalDismissedIds(userId: string): string[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_DISMISSED_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save locally stored read notification IDs
 */
export function saveLocalReadIds(userId: string, ids: string[]) {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_READ_PREFIX}${userId}`, JSON.stringify(ids));
  } catch (e) {
    console.warn('Failed saving local read ids', e);
  }
}

/**
 * Save locally stored dismissed notification IDs
 */
export function saveLocalDismissedIds(userId: string, ids: string[]) {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_DISMISSED_PREFIX}${userId}`, JSON.stringify(ids));
  } catch (e) {
    console.warn('Failed saving local dismissed ids', e);
  }
}

/**
 * Seed initial real-time personalized notifications if user collection is completely empty
 */
export async function seedInitialPersonalizedNotifications(userId: string, userName?: string) {
  if (!db || !userId) return;

  try {
    const notifsRef = collection(db, 'users', userId, 'notifications');
    const snap = await getDocs(query(notifsRef, limit(1)));
    if (!snap.empty) {
      return; // already has notifications
    }

    const now = new Date();
    const seedItems = [
      {
        id: 'init_welcome_hub',
        userId,
        category: 'system',
        title: 'Chào mừng bạn đến với Haevy Notification Hub',
        message: 'Trung tâm thông báo toàn diện kết nối thời gian thực: Cập nhật hệ thống, tương tác bạn bè, biến động tài chính và phả hệ dòng họ.',
        createdAt: now.toISOString(),
        isRead: false,
        source: 'firestore_user',
        badgeText: 'Hệ Thống',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        iconType: 'sparkles',
        targetMode: 'haevy_ai',
        targetTab: 'overview',
        actionText: 'Khám phá ngay'
      },
      {
        id: 'init_finance_alert',
        userId,
        category: 'finance',
        title: 'Cảnh báo tài chính & Ưu đãi Ví Xu',
        message: 'Ví tài khoản của bạn đã được liên kết với hệ thống quản lý chi tiêu và số dư Xu Haevy. Hãy thiết lập hạn mức ngân sách thông minh.',
        createdAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
        isRead: false,
        source: 'firestore_user',
        badgeText: 'Ví Xu',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        iconType: 'coins',
        amount: 10000,
        targetMode: 'finance',
        targetTab: 'page1',
        actionText: 'Quản lý tài chính'
      },
      {
        id: 'init_family_alert',
        userId,
        category: 'family_tree',
        title: 'Gia Phả Dòng Họ: Kích hoạt Lịch Giỗ & Phả Hệ',
        message: 'Hệ thống đã sẵn sàng kết nối cây phả hệ gia tộc. Xem và thêm các ngày lễ trọng, ngày giỗ Âm-Dương để nhận nhắc nhở sớm.',
        createdAt: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
        isRead: false,
        source: 'firestore_user',
        badgeText: 'Dòng Họ',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        iconType: 'git-fork',
        targetMode: 'family_tree',
        targetTab: 'anniversaries',
        actionText: 'Xem Lịch Giỗ'
      }
    ];

    for (const item of seedItems) {
      await setDoc(doc(db, 'users', userId, 'notifications', item.id), item);
    }
  } catch (err) {
    console.warn('Initial seed notifications skipped or error:', err);
  }
}

/**
 * Real-time listener for all user-specific and ecosystem updates:
 * 1. Personal notifications from users/{userId}/notifications
 * 2. Real-time System Announcements from systemAnnouncements
 * 3. Real-time Friend Requests from friendRequests
 * 4. Real-time Friend Photo Posts from friendPhotoPosts
 * 5. Real-time Point / Xu Transactions from users/{userId}/pointTransactions
 * 6. Real-time Family Tree Events (Death Anniversaries) from familyEvents
 * 7. Real-time Family Tree Proposals from familyProposals
 */
export function subscribeToHubNotifications(
  userId: string,
  isVip: boolean,
  isAuthorVerified: boolean,
  callback: (notifications: HubNotification[], unreadCount: number) => void
): () => void {
  if (!db || !userId) {
    callback([], 0);
    return () => {};
  }

  // Check and seed initial items asynchronously
  seedInitialPersonalizedNotifications(userId);

  // In-memory buckets
  let userNotifs: HubNotification[] = [];
  let systemNotifs: HubNotification[] = [];
  let friendReqNotifs: HubNotification[] = [];
  let friendPhotoNotifs: HubNotification[] = [];
  let financeTxNotifs: HubNotification[] = [];
  let familyEventNotifs: HubNotification[] = [];
  let familyProposalNotifs: HubNotification[] = [];

  // Firestore persistent read & dismissed state
  let persistentReadIds: string[] = getLocalReadIds(userId);
  let persistentDismissedIds: string[] = getLocalDismissedIds(userId);

  const notify = () => {
    // Combine and deduplicate
    const map = new Map<string, HubNotification>();

    const all = [
      ...userNotifs,
      ...systemNotifs,
      ...friendReqNotifs,
      ...friendPhotoNotifs,
      ...financeTxNotifs,
      ...familyEventNotifs,
      ...familyProposalNotifs
    ];

    for (const n of all) {
      if (persistentDismissedIds.includes(n.id)) continue;

      const isMarkedRead = n.isRead || persistentReadIds.includes(n.id);
      map.set(n.id, {
        ...n,
        isRead: isMarkedRead
      });
    }

    const merged = Array.from(map.values()).sort((a, b) => {
      const timeA = new Date(a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt).getTime() || 0;
      return timeB - timeA;
    });

    const unread = merged.filter((n) => !n.isRead).length;
    callback(merged, unread);
  };

  const unsubs: (() => void)[] = [];

  // 0. Persistent Notification State from Firestore
  try {
    const stateDocRef = doc(db, 'users', userId, 'security', 'notificationsState');
    const unsubState = onSnapshot(stateDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.readIds)) {
          persistentReadIds = Array.from(new Set([...persistentReadIds, ...data.readIds]));
          saveLocalReadIds(userId, persistentReadIds);
        }
        if (Array.isArray(data.dismissedIds)) {
          persistentDismissedIds = Array.from(new Set([...persistentDismissedIds, ...data.dismissedIds]));
          saveLocalDismissedIds(userId, persistentDismissedIds);
        }
        notify();
      }
    }, () => {});
    unsubs.push(unsubState);
  } catch (e) {
    console.warn('Failed subscribing to notifications state', e);
  }

  // 1. User Personal Firestore Notifications (users/{userId}/notifications)
  try {
    const userNotifsRef = collection(db, 'users', userId, 'notifications');
    const unsubUser = onSnapshot(query(userNotifsRef, limit(50)), (snap) => {
      const list: HubNotification[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          userId: data.userId || userId,
          category: data.category || 'system',
          title: data.title || 'Thông báo mới',
          message: data.message || '',
          createdAt: data.createdAt || new Date(),
          isRead: Boolean(data.isRead),
          source: 'firestore_user',
          badgeText: data.badgeText || 'Cá Nhân',
          badgeColor: data.badgeColor || 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          iconType: data.iconType || 'bell',
          targetMode: data.targetMode,
          targetTab: data.targetTab,
          actionText: data.actionText,
          actionData: data.actionData,
          amount: data.amount,
          metadata: data.metadata
        });
      });
      userNotifs = list;
      notify();
    }, (err) => {
      console.warn('Hub user notifications error:', err);
    });
    unsubs.push(unsubUser);
  } catch (e) {
    console.warn('Hub user notifications listener setup failed', e);
  }

  // 2. Real-time System Announcements (systemAnnouncements)
  try {
    const announcementsRef = collection(db, 'systemAnnouncements');
    const unsubAnnounce = onSnapshot(
      query(announcementsRef, where('isActive', '==', true), limit(20)),
      (snap) => {
        const list: HubNotification[] = [];
        snap.forEach((d) => {
          const data = d.data();
          // Filter target audience
          if (data.targetAudience === 'vip' && !isVip) return;
          if (data.targetAudience === 'authors' && !isAuthorVerified) return;

          let badgeText = 'Hệ Thống';
          let badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
          let iconType = 'megaphone';

          if (data.type === 'urgent') {
            badgeText = 'Khẩn Cấp ⚡';
            badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
            iconType = 'alert-triangle';
          } else if (data.type === 'maintenance') {
            badgeText = 'Bảo Trì 🛠️';
            badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
            iconType = 'tool';
          } else if (data.type === 'event') {
            badgeText = 'Sự Kiện 🎉';
            badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
            iconType = 'sparkles';
          }

          list.push({
            id: `ann_${d.id}`,
            category: 'system',
            title: data.title || 'Thông báo hệ thống Haevy',
            message: data.content || '',
            createdAt: data.createdAt || new Date(),
            isRead: persistentReadIds.includes(`ann_${d.id}`),
            source: 'system_announcement',
            badgeText,
            badgeColor,
            iconType,
            targetMode: 'audio',
            targetTab: 'home',
            actionText: 'Xem thông báo',
            actionData: { announcementId: d.id, ...data }
          });
        });
        systemNotifs = list;
        notify();
      },
      (err) => {
        console.warn('Hub system announcements error:', err);
      }
    );
    unsubs.push(unsubAnnounce);
  } catch (e) {
    console.warn('Hub announcements listener setup failed', e);
  }

  // 3. Real-time Friend Requests (friendRequests)
  try {
    const friendRequestsRef = collection(db, 'friendRequests');
    const unsubFriendReq = onSnapshot(
      query(friendRequestsRef, where('receiverUid', '==', userId), where('status', '==', 'pending'), limit(20)),
      (snap) => {
        const list: HubNotification[] = [];
        snap.forEach((d) => {
          const req = d.data();
          list.push({
            id: `freq_${d.id}`,
            category: 'friends',
            title: `Lời mời kết bạn từ ${req.senderName || 'Thành viên Haevy'}`,
            message: `${req.senderName || 'Người dùng'} muốn kết bạn và cùng nhau nghe nhạc, giao lưu trên Haevy.`,
            createdAt: req.createdAt || new Date(),
            isRead: persistentReadIds.includes(`freq_${d.id}`),
            source: 'friend_request',
            badgeText: req.isSenderVip ? 'VIP Bạn Bè' : 'Lời Mời',
            badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
            iconType: 'user-plus',
            targetMode: 'messages',
            targetTab: 'friends',
            actionText: 'Đồng ý kết bạn',
            actionData: { requestId: d.id, ...req },
            senderName: req.senderName,
            senderPhoto: req.senderPhoto
          });
        });
        friendReqNotifs = list;
        notify();
      },
      (err) => {
        console.warn('Hub friend requests error:', err);
      }
    );
    unsubs.push(unsubFriendReq);
  } catch (e) {
    console.warn('Hub friend requests listener setup failed', e);
  }

  // 4. Real-time Friend Photo Posts (friendPhotoPosts)
  try {
    const photoPostsRef = collection(db, 'friendPhotoPosts');
    const unsubPhotoPosts = onSnapshot(
      query(photoPostsRef, limit(10)),
      (snap) => {
        const list: HubNotification[] = [];
        snap.forEach((d) => {
          const post = d.data();
          if (post.authorId === userId) return; // ignore self
          list.push({
            id: `post_${d.id}`,
            category: 'friends',
            title: `${post.authorName || 'Bạn bè'} vừa đăng ảnh mới`,
            message: post.caption ? `"${post.caption.slice(0, 75)}${post.caption.length > 75 ? '...' : ''}"` : 'Đã đăng một khoảnh khắc mới lên trang tin ảnh bạn bè.',
            createdAt: post.createdAt || new Date(),
            isRead: persistentReadIds.includes(`post_${d.id}`),
            source: 'friend_photo',
            badgeText: 'Khoảnh Khắc',
            badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            iconType: 'image',
            targetMode: 'messages',
            targetTab: 'feed',
            actionText: 'Xem ảnh',
            actionData: { postId: d.id, ...post },
            senderName: post.authorName,
            senderPhoto: post.authorPhoto
          });
        });
        friendPhotoNotifs = list;
        notify();
      },
      () => {}
    );
    unsubs.push(unsubPhotoPosts);
  } catch (e) {
    console.warn('Hub photo posts listener setup failed', e);
  }

  // 5. Real-time Point / Xu Transactions (users/{userId}/pointTransactions)
  try {
    const txRef = collection(db, 'users', userId, 'pointTransactions');
    const unsubTx = onSnapshot(
      query(txRef, limit(15)),
      (snap) => {
        const list: HubNotification[] = [];
        snap.forEach((d) => {
          const tx = d.data();
          const amount = Number(tx.amount) || 0;
          const isPositive = amount >= 0;
          list.push({
            id: `tx_${d.id}`,
            category: 'finance',
            title: isPositive ? `+${amount.toLocaleString()} Xu Haevy` : `${amount.toLocaleString()} Xu Haevy`,
            message: tx.title || tx.description || tx.reason || (isPositive ? 'Bạn vừa nhận được Xu vào tài khoản.' : 'Giao dịch thanh toán hoặc quy đổi Xu.'),
            createdAt: tx.createdAt || new Date(),
            isRead: persistentReadIds.includes(`tx_${d.id}`),
            source: 'finance_tx',
            badgeText: isPositive ? 'Cộng Xu 🪙' : 'Chi Tiêu',
            badgeColor: isPositive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30',
            iconType: 'coins',
            amount,
            targetMode: 'finance',
            targetTab: 'page1',
            actionText: 'Xem ví tiền'
          });
        });
        financeTxNotifs = list;
        notify();
      },
      () => {}
    );
    unsubs.push(unsubTx);
  } catch (e) {
    console.warn('Hub point transactions listener setup failed', e);
  }

  // 6. Real-time Family Tree Events (familyEvents - Lịch Giỗ, Kỷ Niệm)
  try {
    const eventsRef = collection(db, 'familyEvents');
    const unsubFamilyEvt = onSnapshot(
      query(eventsRef, limit(15)),
      (snap) => {
        const list: HubNotification[] = [];
        snap.forEach((d) => {
          const evt = d.data();
          const isDeathAnniversary = evt.eventType === 'death_anniversary';
          list.push({
            id: `fevt_${d.id}`,
            category: 'family_tree',
            title: isDeathAnniversary ? `Lịch Giỗ Dòng Họ: ${evt.title}` : `Sự Kiện Gia Tộc: ${evt.title}`,
            message: `${evt.memberName ? `Dành cho: ${evt.memberName}. ` : ''}Ngày: ${evt.solarDate || ''}${evt.lunarDate ? ` (Âm lịch: ${evt.lunarDate})` : ''}. ${evt.location ? `Tại: ${evt.location}` : ''}`.trim(),
            createdAt: evt.createdAt || new Date(),
            isRead: persistentReadIds.includes(`fevt_${d.id}`),
            source: 'family_event',
            badgeText: isDeathAnniversary ? 'Lịch Giỗ 🕯️' : 'Gia Tộc 👑',
            badgeColor: isDeathAnniversary ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            iconType: 'calendar',
            targetMode: 'family_tree',
            targetTab: 'anniversaries',
            actionText: 'Xem Lịch Giỗ',
            actionData: { eventId: d.id, ...evt },
            lunarDate: evt.lunarDate
          });
        });
        familyEventNotifs = list;
        notify();
      },
      () => {}
    );
    unsubs.push(unsubFamilyEvt);
  } catch (e) {
    console.warn('Hub family events listener setup failed', e);
  }

  // 7. Real-time Family Tree Proposals (familyProposals - Đề xuất sửa đổi phả hệ)
  try {
    const proposalsRef = collection(db, 'familyProposals');
    const unsubProposals = onSnapshot(
      query(proposalsRef, where('status', '==', 'pending'), limit(10)),
      (snap) => {
        const list: HubNotification[] = [];
        snap.forEach((d) => {
          const prop = d.data();
          list.push({
            id: `fprop_${d.id}`,
            category: 'family_tree',
            title: `Đề xuất Gia Phả: ${prop.proposalType === 'edit_member' ? 'Cập nhật thông tin thành viên' : 'Thêm thành viên mới'}`,
            message: `${prop.proposedByName || 'Thành viên dòng họ'} vừa gửi đề xuất sửa đổi phả hệ chờ ban quản trị từ đường duyệt.`,
            createdAt: prop.createdAt || new Date(),
            isRead: persistentReadIds.includes(`fprop_${d.id}`),
            source: 'family_proposal',
            badgeText: 'Chờ Duyệt 📜',
            badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
            iconType: 'shield-check',
            targetMode: 'family_tree',
            targetTab: 'records',
            actionText: 'Xem đề xuất',
            actionData: { proposalId: d.id, ...prop }
          });
        });
        familyProposalNotifs = list;
        notify();
      },
      () => {}
    );
    unsubs.push(unsubProposals);
  } catch (e) {
    console.warn('Hub family proposals listener setup failed', e);
  }

  return () => {
    unsubs.forEach((u) => {
      try {
        u();
      } catch {}
    });
  };
}

/**
 * Mark a single notification as read persistently in Firestore
 */
export async function markHubNotificationAsRead(
  userId: string,
  notificationId: string,
  source: HubNotification['source']
): Promise<void> {
  if (!userId || !notificationId) return;

  // 1. Update local cache immediately
  const localRead = getLocalReadIds(userId);
  if (!localRead.includes(notificationId)) {
    const updated = [...localRead, notificationId];
    saveLocalReadIds(userId, updated);
  }

  if (!db) return;

  try {
    // If it is a personal notification document
    if (source === 'firestore_user') {
      const notifDocRef = doc(db, 'users', userId, 'notifications', notificationId);
      await updateDoc(notifDocRef, { isRead: true }).catch(() => {});
    }

    // Persist to user's notificationsState doc in Firestore
    const stateDocRef = doc(db, 'users', userId, 'security', 'notificationsState');
    await setDoc(
      stateDocRef,
      {
        readIds: arrayUnion(notificationId),
        lastUpdatedAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('Failed marking notification read in Firestore', e);
  }
}

/**
 * Mark all notifications as read persistently
 */
export async function markAllHubNotificationsAsRead(
  userId: string,
  notificationIds: string[]
): Promise<void> {
  if (!userId || !notificationIds.length) return;

  // 1. Update local storage
  const localRead = getLocalReadIds(userId);
  const unioned = Array.from(new Set([...localRead, ...notificationIds]));
  saveLocalReadIds(userId, unioned);

  if (!db) return;

  try {
    const stateDocRef = doc(db, 'users', userId, 'security', 'notificationsState');
    await setDoc(
      stateDocRef,
      {
        readIds: unioned,
        allReadAt: serverTimestamp()
      },
      { merge: true }
    );

    // Also update any firestore_user docs
    const userNotifsRef = collection(db, 'users', userId, 'notifications');
    const snap = await getDocs(query(userNotifsRef, limit(50)));
    const updates: Promise<any>[] = [];
    snap.forEach((d) => {
      if (!d.data().isRead) {
        updates.push(updateDoc(d.ref, { isRead: true }).catch(() => {}));
      }
    });
    await Promise.all(updates);
  } catch (e) {
    console.warn('Failed marking all read in Firestore', e);
  }
}

/**
 * Dismiss / delete a notification persistently
 */
export async function dismissHubNotification(
  userId: string,
  notificationId: string,
  source: HubNotification['source']
): Promise<void> {
  if (!userId || !notificationId) return;

  // 1. Update local storage
  const localDismissed = getLocalDismissedIds(userId);
  if (!localDismissed.includes(notificationId)) {
    const updated = [...localDismissed, notificationId];
    saveLocalDismissedIds(userId, updated);
  }

  if (!db) return;

  try {
    // If it's a personal notification doc, delete it
    if (source === 'firestore_user') {
      const notifDocRef = doc(db, 'users', userId, 'notifications', notificationId);
      await deleteDoc(notifDocRef).catch(() => {});
    }

    const stateDocRef = doc(db, 'users', userId, 'security', 'notificationsState');
    await setDoc(
      stateDocRef,
      {
        dismissedIds: arrayUnion(notificationId),
        lastDismissedAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('Failed dismissing notification in Firestore', e);
  }
}

/**
 * Create a custom user alert in Firestore
 */
export async function createHubNotification(
  userId: string,
  notification: Omit<HubNotification, 'id' | 'isRead' | 'source' | 'createdAt'>
): Promise<string | null> {
  if (!db || !userId) return null;

  try {
    const newId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const ref = doc(db, 'users', userId, 'notifications', newId);
    const data: HubNotification = {
      ...notification,
      id: newId,
      userId,
      isRead: false,
      source: 'firestore_user',
      createdAt: new Date().toISOString()
    };
    await setDoc(ref, data);
    return newId;
  } catch (e) {
    console.error('Failed creating hub notification', e);
    return null;
  }
}
