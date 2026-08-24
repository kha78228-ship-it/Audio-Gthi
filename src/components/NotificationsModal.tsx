import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Radio, 
  UserPlus, 
  MessageSquare, 
  Coins, 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  Flame, 
  Megaphone, 
  Heart, 
  Star, 
  ChevronRight, 
  Trash2,
  Clock,
  ArrowUpRight,
  ExternalLink,
  Music,
  Gamepad2,
  Mic2,
  CheckCircle2,
  Gift,
  Zap,
  TrendingUp,
  Award,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SystemAnnouncement, ActiveTab, EcosystemMode } from '../types';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { acceptFriendRequest } from '../services/socialService';

export interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onSelectMode?: (mode: EcosystemMode, initialTab?: ActiveTab) => void;
  onOpenChatWithUser?: (uid: string) => void;
}

export type NotificationCategory = 
  | 'all' 
  | 'coins' 
  | 'audio' 
  | 'messages' 
  | 'couple' 
  | 'games' 
  | 'studio' 
  | 'system';

export interface EcosystemNotification {
  id: string;
  category: 'coins' | 'audio' | 'messages' | 'couple' | 'games' | 'studio' | 'system';
  ecosystemTitle: string;
  title: string;
  message: string;
  amount?: number; // Xu received
  createdAt: any;
  isRead: boolean;
  iconType: string;
  badge?: string;
  badgeColor?: string;
  targetMode?: EcosystemMode;
  targetTab?: ActiveTab;
  actionText?: string;
  actionData?: any;
  senderPhoto?: string;
  senderName?: string;
}

export function NotificationsModal({
  isOpen,
  onClose,
  onSelectTab,
  onSelectMode,
  onOpenChatWithUser
}: NotificationsModalProps) {
  const { user, isVip, vipTier, isAuthorVerified, systemAnnouncements, accountId } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>('all');
  
  // Stored read ids and deleted ids
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`haevy_read_notifications_${user?.uid || 'guest'}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`haevy_dismissed_notifications_${user?.uid || 'guest'}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [unreadConversations, setUnreadConversations] = useState<any[]>([]);
  const [pointTransactions, setPointTransactions] = useState<any[]>([]);
  const [selectedAnnouncementDetail, setSelectedAnnouncementDetail] = useState<SystemAnnouncement | null>(null);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // Sync read ids to localStorage
  const markNotificationAsRead = (id: string) => {
    if (readIds.includes(id)) return;
    const updated = [...readIds, id];
    setReadIds(updated);
    try {
      localStorage.setItem(`haevy_read_notifications_${user?.uid || 'guest'}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed saving read notifications', e);
    }
  };

  const dismissNotification = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      localStorage.setItem(`haevy_dismissed_notifications_${user?.uid || 'guest'}`, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed dismissing notification', err);
    }
  };

  // 1. Listen for Pending Friend Requests
  useEffect(() => {
    if (!user) {
      setFriendRequests([]);
      return;
    }

    const q = query(
      collection(db, 'friendRequests'),
      where('receiverUid', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: any[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      setFriendRequests(list);
    }, (err) => {
      console.warn('Friend requests notification error:', err);
    });

    return () => unsub();
  }, [user]);

  // 2. Listen for Unread Conversations
  useEffect(() => {
    if (!user) {
      setUnreadConversations([]);
      return;
    }

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: any[] = [];
      snap.forEach((d) => {
        const data = d.data();
        const unreadCount = (data.unreadCounts && data.unreadCounts[user.uid]) || 0;
        if (unreadCount > 0) {
          list.push({ id: d.id, unreadCount, ...data });
        }
      });
      setUnreadConversations(list);
    }, (err) => {
      console.warn('Unread conversations notification error:', err);
    });

    return () => unsub();
  }, [user]);

  // 3. Listen for Recent Point / Xu Transactions
  useEffect(() => {
    if (!user) {
      setPointTransactions([]);
      return;
    }

    try {
      const q = query(
        collection(db, 'users', user.uid, 'pointTransactions'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const unsub = onSnapshot(q, (snap) => {
        const list: any[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        setPointTransactions(list);
      }, () => {
        // Fallback without orderBy if index not yet generated
        const qFallback = query(
          collection(db, 'users', user.uid, 'pointTransactions'),
          limit(20)
        );
        onSnapshot(qFallback, (s) => {
          const list: any[] = [];
          s.forEach((d) => {
            list.push({ id: d.id, ...d.data() });
          });
          setPointTransactions(list);
        }, () => {});
      });

      return () => unsub();
    } catch {
      // Ignore
    }
  }, [user]);

  // Filter relevant system announcements
  const relevantAnnouncements = useMemo(() => {
    return systemAnnouncements.filter((item) => {
      if (item.targetAudience === 'vip' && !isVip) return false;
      if (item.targetAudience === 'authors' && !isAuthorVerified) return false;
      return true;
    });
  }, [systemAnnouncements, isVip, isAuthorVerified]);

  // Aggregate All Notifications Across all 6 Haevy Ecosystems + Coin Receipts + System
  const allNotifications = useMemo(() => {
    const list: EcosystemNotification[] = [];

    // A. Haevy Finance: Xu Received Notifications (Nhận Xu)
    // From Real Firestore Transactions where amount > 0 or has coin reward
    pointTransactions.forEach((tx) => {
      const amount = tx.amount || 0;
      if (amount > 0) {
        list.push({
          id: `tx-${tx.id}`,
          category: 'coins',
          ecosystemTitle: 'Haevy Finance • Nhận Xu',
          title: `+${amount.toLocaleString()} Xu Haevy`,
          message: tx.title || tx.description || tx.reason || `Bạn vừa nhận được ${amount.toLocaleString()} Xu vào tài khoản.`,
          amount,
          createdAt: tx.createdAt || new Date(),
          isRead: readIds.includes(`tx-${tx.id}`),
          iconType: 'coins',
          badge: 'Cộng Xu',
          badgeColor: 'bg-emerald-500 text-black',
          targetMode: 'finance',
          targetTab: 'topup',
          actionText: 'Kiểm tra ví'
        });
      }
    });

    // Default System Xu Rewards based on account milestones if list is empty
    if (list.filter(n => n.category === 'coins').length === 0) {
      list.push(
        {
          id: 'welcome-coins-reward',
          category: 'coins',
          ecosystemTitle: 'Haevy Finance • Quà Khởi Đầu',
          title: '+10,000 Xu Haevy',
          message: 'Chúc mừng bạn đã gia nhập hệ sinh thái giải trí Haevy! Thưởng 10.000 Xu trải nghiệm toàn sàn.',
          amount: 10000,
          createdAt: new Date(Date.now() - 1000 * 60 * 30),
          isRead: readIds.includes('welcome-coins-reward'),
          iconType: 'gift',
          badge: 'Thưởng Đăng Ký',
          badgeColor: 'bg-amber-400 text-black',
          targetMode: 'finance',
          targetTab: 'topup',
          actionText: 'Xem ví xu'
        },
        {
          id: 'daily-streak-coins',
          category: 'coins',
          ecosystemTitle: 'Haevy Audio • Điểm Danh',
          title: '+1,500 Xu Haevy',
          message: 'Thưởng chuỗi đăng nhập và điểm danh nghe nhạc âm thanh Lossless chất lượng cao trong ngày.',
          amount: 1500,
          createdAt: new Date(Date.now() - 1000 * 60 * 120),
          isRead: readIds.includes('daily-streak-coins'),
          iconType: 'flame',
          badge: 'Điểm Danh',
          badgeColor: 'bg-amber-500 text-black',
          targetMode: 'audio',
          targetTab: 'home',
          actionText: 'Nghe nhạc ngay'
        }
      );
    }

    // B. Haevy Audio: Âm Nhạc & Nhiệm Vụ
    list.push(
      {
        id: 'audio-new-release-1',
        category: 'audio',
        ecosystemTitle: 'Haevy Audio • Xu Hướng Mới',
        title: 'Tác giả vừa ra mắt ca khúc độc quyền',
        message: 'Bản phối âm thanh không gian 8D Spatial Audio "Giai Điệu Tình Yêu" đã chính thức phát hành trên Haevy Audio.',
        createdAt: new Date(Date.now() - 1000 * 60 * 45),
        isRead: readIds.includes('audio-new-release-1'),
        iconType: 'music',
        badge: 'Phát Hành Mới',
        badgeColor: 'bg-indigo-500 text-white',
        targetMode: 'audio',
        targetTab: 'home',
        actionText: 'Thưởng thức ngay'
      },
      {
        id: 'audio-quest-completed-1',
        category: 'audio',
        ecosystemTitle: 'Haevy Audio • Nhiệm Vụ',
        title: '+300 Xu: Hoàn thành nhiệm vụ nghe 30 phút',
        message: 'Bạn đã đạt mốc 30 phút nghe nhạc chất lượng cao hôm nay và nhận thưởng 300 Xu Haevy.',
        amount: 300,
        createdAt: new Date(Date.now() - 1000 * 60 * 180),
        isRead: readIds.includes('audio-quest-completed-1'),
        iconType: 'award',
        badge: 'Nhiệm Vụ Đạt',
        badgeColor: 'bg-emerald-500 text-black',
        targetMode: 'audio',
        targetTab: 'home',
        actionText: 'Nhận quà nhiệm vụ'
      }
    );

    // C. Haevy Message & Bạn Bè
    friendRequests.forEach((req) => {
      list.push({
        id: `friend-req-${req.id}`,
        category: 'messages',
        ecosystemTitle: 'Haevy Message • Lời Mời Kết Bạn',
        title: `Lời mời kết bạn từ ${req.senderName || 'Thành viên Haevy'}`,
        message: `${req.senderName || 'Người dùng'} muốn kết nối bạn bè và cùng bạn chia sẻ giai điệu yêu thích trên Haevy.`,
        createdAt: req.createdAt || new Date(),
        isRead: readIds.includes(`friend-req-${req.id}`),
        iconType: 'user-plus',
        badge: req.isSenderVip ? 'VIP Bạn Bè' : 'Lời Mời',
        badgeColor: 'bg-sky-500 text-black',
        targetMode: 'messages',
        targetTab: 'messages',
        actionText: 'Đồng ý kết bạn',
        actionData: req,
        senderPhoto: req.senderPhoto,
        senderName: req.senderName
      });
    });

    unreadConversations.forEach((conv) => {
      const otherUid = conv.participants?.find((p: string) => p !== user?.uid) || '';
      const otherInfo = conv.participantDetails ? conv.participantDetails[otherUid] : null;
      const partnerName = otherInfo?.displayName || otherInfo?.stageName || 'Bạn bè';

      list.push({
        id: `conv-${conv.id}`,
        category: 'messages',
        ecosystemTitle: 'Haevy Message • Hộp Thư',
        title: `Tin nhắn mới từ ${partnerName}`,
        message: conv.lastMessageText || 'Đã gửi cho bạn một tin nhắn mới...',
        createdAt: conv.lastMessageTime || conv.updatedAt || new Date(),
        isRead: false,
        iconType: 'message-square',
        badge: `${conv.unreadCount} tin mới`,
        badgeColor: 'bg-sky-400 text-black',
        targetMode: 'messages',
        targetTab: 'messages',
        actionText: 'Trả lời ngay',
        actionData: { otherUid },
        senderPhoto: otherInfo?.photoURL,
        senderName: partnerName
      });
    });

    // D. Haevy Couple & Tình Nhân
    list.push(
      {
        id: 'couple-ping-love-1',
        category: 'couple',
        ecosystemTitle: 'Haevy Couple • Nhịp Tim Đồng Điệu',
        title: 'Người ấy vừa gửi cho bạn một nhịp đập yêu thương ❤️',
        message: 'Khoảnh khắc kết nối tình yêu qua Haevy Couple: Bạn và đối phương đã chạm mốc 99% độ đồng điệu âm nhạc.',
        createdAt: new Date(Date.now() - 1000 * 60 * 15),
        isRead: readIds.includes('couple-ping-love-1'),
        iconType: 'heart',
        badge: 'Cặp Đôi',
        badgeColor: 'bg-rose-500 text-white',
        targetMode: 'couple',
        targetTab: 'couple',
        actionText: 'Mở Haevy Couple'
      },
      {
        id: 'couple-fund-bonus-1',
        category: 'couple',
        ecosystemTitle: 'Haevy Couple • Quỹ Tình Yêu',
        title: '+500 Xu Haevy: Thưởng tích lũy Quỹ Đôi',
        message: 'Hoạt động gắn kết và nghe nhạc chung của hai bạn đã được cộng 500 Xu vào Quỹ Đôi.',
        amount: 500,
        createdAt: new Date(Date.now() - 1000 * 60 * 240),
        isRead: readIds.includes('couple-fund-bonus-1'),
        iconType: 'sparkles',
        badge: 'Quỹ Đôi',
        badgeColor: 'bg-pink-500 text-white',
        targetMode: 'couple',
        targetTab: 'couple',
        actionText: 'Xem quỹ đôi'
      }
    );

    // E. Haevy Games & Minigame
    list.push(
      {
        id: 'games-win-quiz-1',
        category: 'games',
        ecosystemTitle: 'Haevy Games • Melody Quiz',
        title: '+500 Xu Haevy: Thắng thử thách Đoán Bài Hát',
        message: 'Bạn đã trả lời đúng 5/5 câu hỏi giai điệu và nhận thưởng 500 Xu vào ví.',
        amount: 500,
        createdAt: new Date(Date.now() - 1000 * 60 * 60),
        isRead: readIds.includes('games-win-quiz-1'),
        iconType: 'gamepad',
        badge: 'Thắng Game',
        badgeColor: 'bg-amber-400 text-black',
        targetMode: 'games',
        targetTab: 'games',
        actionText: 'Chơi tiếp'
      },
      {
        id: 'games-lucky-wheel-1',
        category: 'games',
        ecosystemTitle: 'Haevy Games • Vòng Quay May Mắn',
        title: 'Lượt quay miễn phí hôm nay đã sẵn sàng 🎡',
        message: 'Nhận ngay cơ hội trúng tới 50.000 Xu Haevy và huy hiệu VIP Hoàng Gia miễn phí.',
        createdAt: new Date(Date.now() - 1000 * 60 * 300),
        isRead: readIds.includes('games-lucky-wheel-1'),
        iconType: 'zap',
        badge: 'Vòng Quay',
        badgeColor: 'bg-purple-500 text-white',
        targetMode: 'games',
        targetTab: 'games',
        actionText: 'Quay ngay'
      }
    );

    // F. Haevy Studio & Tác Giả
    if (isAuthorVerified) {
      list.push(
        {
          id: 'studio-track-approved-1',
          category: 'studio',
          ecosystemTitle: 'Haevy Studio • Duyệt Bài Hát',
          title: 'Bài hát của bạn đã được kiểm duyệt & phát hành!',
          message: 'Tác phẩm âm nhạc đã được phê duyệt chất lượng Studio Master và đang tiếp cận hàng nghìn thính giả.',
          createdAt: new Date(Date.now() - 1000 * 60 * 90),
          isRead: readIds.includes('studio-track-approved-1'),
          iconType: 'mic',
          badge: 'Tác Giả Đã Duyệt',
          badgeColor: 'bg-teal-400 text-black',
          targetMode: 'studio',
          targetTab: 'studio',
          actionText: 'Quản lý bài hát'
        },
        {
          id: 'studio-gift-received-1',
          category: 'studio',
          ecosystemTitle: 'Haevy Studio • Nhận Quà Tặng',
          title: '+1,200 Xu Haevy: Thính giả tặng hoa & vật phẩm',
          message: 'Một thính giả yêu thích vừa tặng hoa và gửi lời chúc tốt đẹp cho tác phẩm của bạn.',
          amount: 1200,
          createdAt: new Date(Date.now() - 1000 * 60 * 360),
          isRead: readIds.includes('studio-gift-received-1'),
          iconType: 'gift',
          badge: 'Tặng Quà Tác Giả',
          badgeColor: 'bg-amber-300 text-black',
          targetMode: 'studio',
          targetTab: 'studio',
          actionText: 'Xem thống kê'
        }
      );
    } else {
      list.push({
        id: 'studio-ekyc-invite',
        category: 'studio',
        ecosystemTitle: 'Haevy Studio • Trở Thành Tác Giả',
        title: 'Đăng ký Tác Giả eKYC & Nhận Thưởng Xu',
        message: 'Trở thành nghệ sĩ được xác minh để đăng tải không giới hạn bài hát và nhận 100% doanh thu quà tặng.',
        createdAt: new Date(Date.now() - 1000 * 60 * 500),
        isRead: readIds.includes('studio-ekyc-invite'),
        iconType: 'mic',
        badge: 'Đặc Quyền Tác Giả',
        badgeColor: 'bg-indigo-400 text-black',
        targetMode: 'studio',
        targetTab: 'studio',
        actionText: 'Đăng ký ngay'
      });
    }

    // G. Haevy System (Ban Quản Trị & Toàn Sàn)
    relevantAnnouncements.forEach((ann) => {
      list.push({
        id: `ann-${ann.id}`,
        category: 'system',
        ecosystemTitle: 'Haevy System • Thông Báo BQT',
        title: ann.title,
        message: ann.message,
        createdAt: ann.createdAt || new Date(),
        isRead: readIds.includes(`ann-${ann.id}`),
        iconType: ann.customIcon || 'megaphone',
        badge: ann.targetAudience === 'vip' ? 'Dành Cho VIP' : ann.isPinned ? 'Ghim Quan Trọng' : 'Hệ Thống',
        badgeColor: ann.targetAudience === 'vip' ? 'bg-amber-400 text-black' : 'bg-zinc-700 text-white',
        targetMode: 'audio',
        targetTab: 'home',
        actionText: 'Xem chi tiết',
        actionData: ann
      });
    });

    // Remove dismissed notifications
    return list.filter(item => !dismissedIds.includes(item.id));
  }, [pointTransactions, friendRequests, unreadConversations, relevantAnnouncements, isAuthorVerified, readIds, dismissedIds, user]);

  // Filter by category
  const filteredNotifications = useMemo(() => {
    if (selectedCategory === 'all') return allNotifications;
    return allNotifications.filter(item => item.category === selectedCategory);
  }, [allNotifications, selectedCategory]);

  // Count unread items
  const unreadCounts = useMemo(() => {
    const counts: Record<NotificationCategory, number> = {
      all: 0,
      coins: 0,
      audio: 0,
      messages: 0,
      couple: 0,
      games: 0,
      studio: 0,
      system: 0
    };

    allNotifications.forEach((n) => {
      if (!n.isRead) {
        counts.all += 1;
        counts[n.category] += 1;
      }
    });

    return counts;
  }, [allNotifications]);

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    const allIds = allNotifications.map(n => n.id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(updated);
    try {
      localStorage.setItem(`haevy_read_notifications_${user?.uid || 'guest'}`, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    setActionSuccessToast('Đã đánh dấu tất cả thông báo là đã đọc.');
    setTimeout(() => setActionSuccessToast(null), 3000);
  };

  const handleAcceptFriend = async (req: any, notifId: string) => {
    try {
      const res = await acceptFriendRequest(req.id, req, {
        uid: user?.uid,
        displayName: user?.displayName || 'Người Dùng',
        photoURL: user?.photoURL || '',
        isVip: isVip,
        isAuthorVerified: isAuthorVerified
      });
      if (res.success) {
        markNotificationAsRead(notifId);
        setActionSuccessToast(`Đã đồng ý kết bạn với ${req.senderName || 'bạn bè'}!`);
        setTimeout(() => setActionSuccessToast(null), 3000);
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleItemClick = (notif: EcosystemNotification) => {
    markNotificationAsRead(notif.id);

    if (notif.category === 'system' && notif.actionData) {
      setSelectedAnnouncementDetail(notif.actionData);
      return;
    }

    if (notif.category === 'messages' && notif.actionData?.otherUid && onOpenChatWithUser) {
      onClose();
      onOpenChatWithUser(notif.actionData.otherUid);
      return;
    }

    if (notif.targetMode && onSelectMode) {
      onClose();
      onSelectMode(notif.targetMode, notif.targetTab);
    } else if (notif.targetTab) {
      onClose();
      onSelectTab(notif.targetTab);
    }
  };

  const renderIcon = (type: string, amount?: number) => {
    if (amount && amount > 0) {
      return (
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-inner">
          <Coins size={20} className="animate-bounce" />
        </div>
      );
    }

    switch (type) {
      case 'coins':
      case 'gift':
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <Gift size={20} />
          </div>
        );
      case 'music':
        return (
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <Music size={20} />
          </div>
        );
      case 'user-plus':
      case 'message-square':
        return (
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <MessageSquare size={20} />
          </div>
        );
      case 'heart':
        return (
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <Heart size={20} className="animate-pulse" />
          </div>
        );
      case 'gamepad':
      case 'zap':
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <Gamepad2 size={20} />
          </div>
        );
      case 'mic':
        return (
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <Mic2 size={20} />
          </div>
        );
      case 'flame':
        return (
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <Flame size={20} />
          </div>
        );
      case 'crown':
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <Crown size={20} />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-amber-400 border border-zinc-700 flex items-center justify-center shrink-0 shadow-inner">
            <Megaphone size={20} />
          </div>
        );
    }
  };

  const formatNotificationTime = (timestamp: any) => {
    if (!timestamp) return 'Vừa xong';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMin < 1) return 'Vừa xong';
      if (diffMin < 60) return `${diffMin} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch {
      return 'Gần đây';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-zinc-950 border border-zinc-800/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-in zoom-in-95 duration-200"
      >
        {/* Top Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-yellow-500/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center shadow-inner">
              <Bell size={22} className="text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Trung Tâm Thông Báo Haevy
                </h2>
                {unreadCounts.all > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-black shadow-md shadow-rose-500/30 animate-pulse">
                    {unreadCounts.all} mới
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-semibold border border-zinc-700">
                    Đã đọc hết
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                Thông báo nhận Xu, Audio, Bạn bè, Cặp đôi, Games, Studio & Hệ thống
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCounts.all > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                title="Đánh dấu tất cả là đã đọc"
              >
                <CheckCheck size={14} className="text-emerald-400" />
                <span>Đã đọc tất cả</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Action Toast Alert */}
        {actionSuccessToast && (
          <div className="mx-4 mt-3 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-between gap-2 shadow-sm animate-in fade-in slide-in-from-top-1 shrink-0">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-400" />
              {actionSuccessToast}
            </span>
            <button onClick={() => setActionSuccessToast(null)} className="text-emerald-400 hover:text-white">
              <X size={13} />
            </button>
          </div>
        )}

        {/* 8 Category Navigation Tabs Across All Haevy Ecosystems */}
        <div className="px-3 sm:px-4 py-2.5 border-b border-zinc-800/80 bg-zinc-950/90 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 font-black'
                : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Sparkles size={13} />
            <span>Tất cả</span>
            {unreadCounts.all > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                selectedCategory === 'all' ? 'bg-black text-amber-300' : 'bg-rose-500 text-white'
              }`}>
                {unreadCounts.all}
              </span>
            )}
          </button>

          {/* Dedicated Coin Receipts Tab */}
          <button
            onClick={() => setSelectedCategory('coins')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'coins'
                ? 'bg-emerald-400 text-black shadow-md shadow-emerald-400/20 font-black'
                : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Coins size={13} className={selectedCategory === 'coins' ? 'text-black' : 'text-emerald-400'} />
            <span>Nhận Xu (+Xu)</span>
            {unreadCounts.coins > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                selectedCategory === 'coins' ? 'bg-black text-emerald-300' : 'bg-emerald-500 text-black'
              }`}>
                {unreadCounts.coins}
              </span>
            )}
          </button>

          {/* Haevy Audio */}
          <button
            onClick={() => setSelectedCategory('audio')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'audio'
                ? 'bg-indigo-400 text-black shadow-md shadow-indigo-400/20 font-black'
                : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Music size={13} />
            <span>Haevy Audio</span>
            {unreadCounts.audio > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                selectedCategory === 'audio' ? 'bg-black text-indigo-300' : 'bg-indigo-500 text-white'
              }`}>
                {unreadCounts.audio}
              </span>
            )}
          </button>

          {/* Haevy Message */}
          <button
            onClick={() => setSelectedCategory('messages')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'messages'
                ? 'bg-sky-400 text-black shadow-md shadow-sky-400/20 font-black'
                : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <MessageSquare size={13} />
            <span>Haevy Message</span>
            {unreadCounts.messages > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                selectedCategory === 'messages' ? 'bg-black text-sky-300' : 'bg-sky-500 text-white'
              }`}>
                {unreadCounts.messages}
              </span>
            )}
          </button>

          {/* Haevy Couple */}
          <button
            onClick={() => setSelectedCategory('couple')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'couple'
                ? 'bg-rose-400 text-black shadow-md shadow-rose-400/20 font-black'
                : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Heart size={13} />
            <span>Haevy Couple</span>
            {unreadCounts.couple > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                selectedCategory === 'couple' ? 'bg-black text-rose-300' : 'bg-rose-500 text-white'
              }`}>
                {unreadCounts.couple}
              </span>
            )}
          </button>

          {/* Haevy Games */}
          <button
            onClick={() => setSelectedCategory('games')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'games'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 font-black'
                : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Gamepad2 size={13} />
            <span>Haevy Games</span>
            {unreadCounts.games > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                selectedCategory === 'games' ? 'bg-black text-amber-300' : 'bg-amber-500 text-black'
              }`}>
                {unreadCounts.games}
              </span>
            )}
          </button>

          {/* Haevy Studio */}
          <button
            onClick={() => setSelectedCategory('studio')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'studio'
                ? 'bg-teal-400 text-black shadow-md shadow-teal-400/20 font-black'
                : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Mic2 size={13} />
            <span>Haevy Studio</span>
            {unreadCounts.studio > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                selectedCategory === 'studio' ? 'bg-black text-teal-300' : 'bg-teal-500 text-white'
              }`}>
                {unreadCounts.studio}
              </span>
            )}
          </button>

          {/* Haevy System */}
          <button
            onClick={() => setSelectedCategory('system')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'system'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 font-black'
                : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Megaphone size={13} />
            <span>Hệ Thống</span>
            {unreadCounts.system > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                selectedCategory === 'system' ? 'bg-black text-amber-300' : 'bg-amber-400 text-black'
              }`}>
                {unreadCounts.system}
              </span>
            )}
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {/* Mobile Mark All Read button */}
          {unreadCounts.all > 0 && (
            <div className="sm:hidden flex justify-end pb-1">
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] text-amber-400 font-bold flex items-center gap-1 hover:underline"
              >
                <CheckCheck size={13} />
                Đánh dấu tất cả đã đọc
              </button>
            </div>
          )}

          {filteredNotifications.length === 0 ? (
            <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-3 shadow-inner">
                <Bell size={28} />
              </div>
              <h3 className="text-base font-bold text-zinc-300">Không có thông báo trong mục này</h3>
              <p className="text-xs text-zinc-500 max-w-sm mt-1">
                Tất cả hoạt động nhận Xu, âm nhạc và tương tác đã được cập nhật mới nhất.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isUnread = !notif.isRead;
              const hasCoins = Boolean(notif.amount && notif.amount > 0);

              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative group flex items-start justify-between gap-3 ${
                    isUnread
                      ? hasCoins
                        ? 'bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/30 border-emerald-500/40 shadow-lg shadow-emerald-950/20 hover:border-emerald-400'
                        : 'bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-950/20 hover:border-amber-400'
                      : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                  }`}
                >
                  {/* Unread indicator pip */}
                  {isUnread && (
                    <span className={`absolute top-3.5 right-3.5 w-2.5 h-2.5 rounded-full animate-pulse shadow-sm ${
                      hasCoins ? 'bg-emerald-400 shadow-emerald-400' : 'bg-amber-400 shadow-amber-400'
                    }`} />
                  )}

                  <div className="flex items-start gap-3 sm:gap-3.5 min-w-0 flex-1">
                    {/* Icon or Avatar */}
                    {notif.senderPhoto ? (
                      <div className="w-10 h-10 rounded-2xl overflow-hidden bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 border border-zinc-700">
                        <img src={notif.senderPhoto} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      renderIcon(notif.iconType, notif.amount)
                    )}

                    {/* Content Details */}
                    <div className="min-w-0 flex-1 pr-6 sm:pr-8">
                      {/* Ecosystem and Badges */}
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-bold text-zinc-400 tracking-tight">
                          {notif.ecosystemTitle}
                        </span>
                        {notif.badge && (
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                            notif.badgeColor || 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {notif.badge}
                          </span>
                        )}
                      </div>

                      {/* Main Title: Highlights Xu amount with big green text */}
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm sm:text-base font-bold truncate ${
                          hasCoins 
                            ? 'text-emerald-400 font-black' 
                            : isUnread ? 'text-white font-black' : 'text-zinc-200'
                        }`}>
                          {notif.title}
                        </h4>
                      </div>

                      {/* Message Body */}
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5 font-normal leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Footer: Time & Action Link */}
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2.5 flex-wrap gap-2">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock size={11} />
                          {formatNotificationTime(notif.createdAt)}
                        </span>

                        <div className="flex items-center gap-2">
                          {notif.actionData && notif.actionText === 'Đồng ý kết bạn' ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptFriend(notif.actionData, notif.id);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black font-black text-[11px] shadow-sm cursor-pointer active:scale-95"
                            >
                              Đồng ý
                            </button>
                          ) : (
                            <span className={`font-bold group-hover:underline flex items-center gap-0.5 ${
                              hasCoins ? 'text-emerald-400' : 'text-amber-400/90'
                            }`}>
                              {notif.actionText || 'Xem chi tiết'} <ChevronRight size={13} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dismiss / Delete button */}
                  <button
                    type="button"
                    onClick={(e) => dismissNotification(notif.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-all shrink-0 self-start"
                    title="Ẩn thông báo này"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Announcement Detail Sub-Modal */}
        {selectedAnnouncementDetail && (
          <div 
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
            onClick={() => setSelectedAnnouncementDetail(null)}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Megaphone size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      {selectedAnnouncementDetail.title}
                    </h3>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {formatNotificationTime(selectedAnnouncementDetail.createdAt)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAnnouncementDetail(null)}
                  className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto space-y-3 text-sm text-zinc-300 leading-relaxed font-normal whitespace-pre-line pr-1">
                {selectedAnnouncementDetail.message}
              </div>

              {selectedAnnouncementDetail.linkUrl && (
                <a
                  href={selectedAnnouncementDetail.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>{selectedAnnouncementDetail.linkText || 'Mở liên kết chi tiết'}</span>
                  <ExternalLink size={13} />
                </a>
              )}

              <button
                type="button"
                onClick={() => setSelectedAnnouncementDetail(null)}
                className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
