import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Search, 
  Filter, 
  Radio, 
  UserPlus, 
  MessageSquare, 
  Coins, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Megaphone, 
  Heart, 
  Clock, 
  ExternalLink, 
  Music, 
  CheckCircle2, 
  Trash2, 
  GitFork, 
  Image as ImageIcon, 
  AlertTriangle, 
  Wrench, 
  Layers, 
  ChevronRight, 
  Check, 
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { EcosystemMode, ActiveTab } from '../types';
import { 
  HubNotification, 
  HubNotificationCategory, 
  subscribeToHubNotifications, 
  markHubNotificationAsRead, 
  markAllHubNotificationsAsRead, 
  dismissHubNotification 
} from '../services/notificationHubService';
import { acceptFriendRequest } from '../services/socialService';

export interface HaevyNotificationHubProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSelectTab?: (tab: ActiveTab) => void;
  onSelectMode?: (mode: EcosystemMode, initialTab?: any) => void;
  onOpenChatWithUser?: (uid: string) => void;
  isEmbedded?: boolean;
}

export function HaevyNotificationHub({
  isOpen = true,
  onClose,
  onSelectTab,
  onSelectMode,
  onOpenChatWithUser,
  isEmbedded = false
}: HaevyNotificationHubProps) {
  const { user, isVip, isAuthorVerified } = useAuth();
  
  const [notifications, setNotifications] = useState<HubNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<HubNotificationCategory>('all');
  const [onlyUnread, setOnlyUnread] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Subscribe to real-time notifications from Firestore
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const unsub = subscribeToHubNotifications(
      user.uid,
      Boolean(isVip),
      Boolean(isAuthorVerified),
      (items, unread) => {
        setNotifications(items);
        setUnreadCount(unread);
      }
    );

    return () => unsub();
  }, [user, isVip, isAuthorVerified]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'system' && item.category !== 'system') return false;
        if (selectedCategory === 'friends' && item.category !== 'friends') return false;
        if (selectedCategory === 'finance' && item.category !== 'finance') return false;
        if (selectedCategory === 'family_tree' && item.category !== 'family_tree') return false;
        if (selectedCategory === 'audio' && item.category !== 'audio') return false;
        if (selectedCategory === 'couple' && item.category !== 'couple') return false;
        if (selectedCategory === 'games' && item.category !== 'games') return false;
      }

      // Unread only toggle
      if (onlyUnread && item.isRead) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchMsg = item.message.toLowerCase().includes(q);
        const matchSender = item.senderName ? item.senderName.toLowerCase().includes(q) : false;
        if (!matchTitle && !matchMsg && !matchSender) return false;
      }

      return true;
    });
  }, [notifications, selectedCategory, onlyUnread, searchQuery]);

  // Counts per category
  const categoryCounts = useMemo(() => {
    const counts = {
      all: notifications.length,
      system: 0,
      friends: 0,
      finance: 0,
      family_tree: 0,
      audio: 0
    };

    notifications.forEach((n) => {
      if (n.category === 'system') counts.system++;
      else if (n.category === 'friends') counts.friends++;
      else if (n.category === 'finance') counts.finance++;
      else if (n.category === 'family_tree') counts.family_tree++;
      else if (n.category === 'audio') counts.audio++;
    });

    return counts;
  }, [notifications]);

  // Relative time formatter
  const formatTime = (createdAt: any) => {
    if (!createdAt) return 'Vừa xong';
    try {
      const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays === 1) return 'Hôm qua';
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return 'Gần đây';
    }
  };

  // Handlers
  const handleMarkAsRead = async (item: HubNotification) => {
    if (!user || item.isRead) return;
    await markHubNotificationAsRead(user.uid, item.id, item.source);
  };

  const handleMarkAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    await markAllHubNotificationsAsRead(user.uid, unreadIds);
    showToast('Đã đánh dấu đọc tất cả thông báo');
  };

  const handleDismiss = async (e: React.MouseEvent, item: HubNotification) => {
    e.stopPropagation();
    if (!user) return;
    await dismissHubNotification(user.uid, item.id, item.source);
    showToast('Đã xóa thông báo');
  };

  const handleAcceptFriend = async (e: React.MouseEvent, item: HubNotification) => {
    e.stopPropagation();
    if (!user || !item.actionData?.requestId) return;

    setProcessingId(item.id);
    try {
      const success = await acceptFriendRequest(item.actionData.requestId, user);
      if (success) {
        await markHubNotificationAsRead(user.uid, item.id, item.source);
        await dismissHubNotification(user.uid, item.id, item.source);
        showToast(`Đã đồng ý kết bạn với ${item.senderName || 'thành viên'}!`);
      } else {
        showToast('Có lỗi xảy ra khi đồng ý kết bạn');
      }
    } catch (err) {
      console.error('Accept friend error:', err);
      showToast('Thao tác không thành công');
    } finally {
      setProcessingId(null);
    }
  };

  const handleItemClick = (item: HubNotification) => {
    handleMarkAsRead(item);

    // If it's a system announcement with modal detail
    if (item.source === 'system_announcement' && item.actionData) {
      setSelectedAnnouncement(item.actionData);
      return;
    }

    // Navigate to specified mode and tab
    if (item.targetMode && onSelectMode) {
      onSelectMode(item.targetMode, item.targetTab as any);
      if (onClose) onClose();
      return;
    }

    if (item.targetTab && onSelectTab) {
      onSelectTab(item.targetTab as any);
      if (onClose) onClose();
    }
  };

  // Render Icon according to notification type
  const renderIcon = (item: HubNotification) => {
    switch (item.iconType) {
      case 'alert-triangle':
        return <AlertTriangle size={18} className="text-rose-400" />;
      case 'tool':
        return <Wrench size={18} className="text-amber-400" />;
      case 'sparkles':
        return <Sparkles size={18} className="text-purple-400" />;
      case 'megaphone':
        return <Megaphone size={18} className="text-blue-400" />;
      case 'user-plus':
        return <UserPlus size={18} className="text-sky-400" />;
      case 'image':
        return <ImageIcon size={18} className="text-emerald-400" />;
      case 'coins':
        return <Coins size={18} className="text-amber-400" />;
      case 'calendar':
        return <Calendar size={18} className="text-amber-400" />;
      case 'git-fork':
        return <GitFork size={18} className="text-indigo-400" />;
      case 'shield-check':
        return <ShieldCheck size={18} className="text-emerald-400" />;
      case 'music':
        return <Music size={18} className="text-pink-400" />;
      default:
        return <Bell size={18} className="text-amber-400" />;
    }
  };

  if (!isOpen && !isEmbedded) return null;

  const content = (
    <div className={`flex flex-col h-full bg-zinc-950 text-zinc-100 ${isEmbedded ? 'rounded-2xl border border-zinc-800/80 shadow-xl' : ''}`}>
      {/* Toast alert banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-2 border border-emerald-400/40 pointer-events-none"
          >
            <CheckCircle2 size={14} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-zinc-950 animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight">
                Haevy Notification Hub
              </h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Cập nhật thời gian thực: Hệ thống • Bạn bè • Tài chính • Gia phả
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-all border border-zinc-700/60 active:scale-95 cursor-pointer"
              title="Đánh dấu tất cả đã đọc"
            >
              <CheckCheck size={14} className="text-emerald-400" />
              <span className="hidden sm:inline">Đã đọc tất cả</span>
            </button>
          )}

          {onClose && !isEmbedded && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="px-4 sm:px-6 py-3 border-b border-zinc-800/60 bg-zinc-900/30 space-y-3 shrink-0">
        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm thông báo, bạn bè, dòng họ, giao dịch..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            onClick={() => setOnlyUnread(!onlyUnread)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
              onlyUnread
                ? 'bg-amber-500 text-zinc-950 font-bold border-amber-400 shadow-sm'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            Chưa đọc ({unreadCount})
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer border ${
              selectedCategory === 'all'
                ? 'bg-zinc-100 text-zinc-950 border-white'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            Tất cả ({categoryCounts.all})
          </button>

          <button
            onClick={() => setSelectedCategory('system')}
            className={`px-3 py-1 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1.5 ${
              selectedCategory === 'system'
                ? 'bg-blue-500 text-white border-blue-400'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            <Megaphone size={12} />
            <span>Hệ Thống</span>
            {categoryCounts.system > 0 && <span className="opacity-80">({categoryCounts.system})</span>}
          </button>

          <button
            onClick={() => setSelectedCategory('friends')}
            className={`px-3 py-1 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1.5 ${
              selectedCategory === 'friends'
                ? 'bg-sky-500 text-white border-sky-400'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            <UserPlus size={12} />
            <span>Bạn Bè</span>
            {categoryCounts.friends > 0 && <span className="opacity-80">({categoryCounts.friends})</span>}
          </button>

          <button
            onClick={() => setSelectedCategory('finance')}
            className={`px-3 py-1 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1.5 ${
              selectedCategory === 'finance'
                ? 'bg-emerald-500 text-zinc-950 font-semibold border-emerald-400'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            <Coins size={12} />
            <span>Tài Chính & Xu</span>
            {categoryCounts.finance > 0 && <span className="opacity-80">({categoryCounts.finance})</span>}
          </button>

          <button
            onClick={() => setSelectedCategory('family_tree')}
            className={`px-3 py-1 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1.5 ${
              selectedCategory === 'family_tree'
                ? 'bg-amber-500 text-zinc-950 font-semibold border-amber-400'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            <GitFork size={12} />
            <span>Dòng Họ & Gia Phả</span>
            {categoryCounts.family_tree > 0 && <span className="opacity-80">({categoryCounts.family_tree})</span>}
          </button>

          <button
            onClick={() => setSelectedCategory('audio')}
            className={`px-3 py-1 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1.5 ${
              selectedCategory === 'audio'
                ? 'bg-pink-500 text-white border-pink-400'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            <Music size={12} />
            <span>Âm Nhạc</span>
            {categoryCounts.audio > 0 && <span className="opacity-80">({categoryCounts.audio})</span>}
          </button>
        </div>
      </div>

      {/* Notifications List Container */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-4">
              <Bell size={28} className="opacity-60" />
            </div>
            <p className="text-sm font-medium text-zinc-400">
              {searchQuery ? 'Không tìm thấy thông báo phù hợp' : 'Không có thông báo nào'}
            </p>
            <p className="text-xs text-zinc-600 max-w-xs mt-1">
              Tất cả cập nhật thời gian thực từ bạn bè, hệ thống, tài chính và dòng họ sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => handleItemClick(item)}
              className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3.5 ${
                item.isRead
                  ? 'bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-900/80 hover:border-zinc-700/80'
                  : 'bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900/70 border-amber-500/30 hover:border-amber-500/60 shadow-sm shadow-amber-500/5'
              }`}
            >
              {/* Unread indicator bar/dot */}
              {!item.isRead && (
                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
              )}

              {/* Avatar or Icon Container */}
              <div className="shrink-0 pt-0.5">
                {item.senderPhoto ? (
                  <img
                    src={item.senderPhoto}
                    alt={item.senderName || 'Avatar'}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-zinc-700/60"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center">
                    {renderIcon(item)}
                  </div>
                )}
              </div>

              {/* Content Body */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {item.badgeText && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${item.badgeColor || 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
                      {item.badgeText}
                    </span>
                  )}
                  {item.lunarDate && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Âm: {item.lunarDate}
                    </span>
                  )}
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <Clock size={11} />
                    {formatTime(item.createdAt)}
                  </span>
                </div>

                <h3 className={`text-xs sm:text-sm leading-snug line-clamp-1 ${item.isRead ? 'font-medium text-zinc-300' : 'font-bold text-zinc-100'}`}>
                  {item.title}
                </h3>

                <p className="text-xs text-zinc-400 leading-relaxed mt-0.5 line-clamp-2">
                  {item.message}
                </p>

                {/* Amount display for finance */}
                {item.amount !== undefined && (
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                    <Coins size={12} />
                    <span>{item.amount > 0 ? `+${item.amount.toLocaleString()}` : item.amount.toLocaleString()} Xu Haevy</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-2.5">
                  {item.source === 'friend_request' && (
                    <>
                      <button
                        onClick={(e) => handleAcceptFriend(e, item)}
                        disabled={processingId === item.id}
                        className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm disabled:opacity-50"
                      >
                        {processingId === item.id ? (
                          <RefreshCw size={12} className="animate-spin" />
                        ) : (
                          <UserCheck size={12} />
                        )}
                        <span>Đồng ý</span>
                      </button>

                      <button
                        onClick={(e) => handleDismiss(e, item)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
                      >
                        Bỏ qua
                      </button>
                    </>
                  )}

                  {item.actionText && item.source !== 'friend_request' && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 group-hover:text-amber-300 transition-colors">
                      <span>{item.actionText}</span>
                      <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  )}
                </div>
              </div>

              {/* Dismiss button */}
              <button
                onClick={(e) => handleDismiss(e, item)}
                className="absolute right-2.5 top-3 w-6 h-6 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
                title="Xóa thông báo"
              >
                <Trash2 size={13} />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 sm:px-6 py-3 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between text-xs text-zinc-500 shrink-0">
        <span>Tổng {notifications.length} thông báo</span>
        <span className="flex items-center gap-1">
          <ShieldCheck size={13} className="text-emerald-400" />
          Đồng bộ Firestore bảo mật
        </span>
      </div>

      {/* Detail Modal for System Announcement */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Megaphone size={18} />
                  <span>Chi Tiết Thông Báo Hệ Thống</span>
                </div>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  <X size={16} />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-zinc-100">
                  {selectedAnnouncement.title}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Đăng ngày: {new Date(selectedAnnouncement.createdAt?.toDate ? selectedAnnouncement.createdAt.toDate() : selectedAnnouncement.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>

              <div className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80 whitespace-pre-wrap max-h-60 overflow-y-auto">
                {selectedAnnouncement.content}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                >
                  Đã hiểu
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl h-[88vh] max-h-[760px] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col"
      >
        {content}
      </motion.div>
    </div>
  );
}
