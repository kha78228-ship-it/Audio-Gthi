import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Library, 
  Disc3, 
  MessageSquare, 
  Image as ImageIcon,
  Users, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Maximize2, 
  Music2, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Heart, 
  Wallet,
  Coins,
  Crown,
  User as UserIcon,
  Layers,
  Compass,
  Headphones,
  X,
  Sparkles,
  Calendar,
  PieChart,
  Scale,
  PiggyBank,
  Plus,
  Calculator,
  Activity,
  UserCheck,
  Trophy,
  Gamepad2,
  Mic,
  Zap,
  Gift,
  BookOpen,
  Droplets
} from 'lucide-react';
import { Track, ActiveTab, EcosystemMode } from '../types';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface BottomTaskbarProps {
  currentMode: EcosystemMode;
  onSelectMode: (mode: EcosystemMode, initialTab?: ActiveTab) => void;
  onOpenModesSlider?: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  messageSubTab?: 'chat' | 'feed' | 'friends';
  onSelectMessageSubTab?: (subTab: 'chat' | 'feed' | 'friends') => void;
  coupleSubTab?: 'page1' | 'page2' | 'page3' | 'page4' | 'page5';
  onSelectCoupleSubTab?: (subTab: 'page1' | 'page2' | 'page3' | 'page4' | 'page5') => void;
  financeSubTab?: 'page1' | 'page2' | 'page3' | 'page4' | 'page5';
  onSelectFinanceSubTab?: (subTab: 'page1' | 'page2' | 'page3' | 'page4' | 'page5') => void;
  adminSubTab?: 'page1' | 'page2' | 'page3' | 'page4';
  onSelectAdminSubTab?: (subTab: 'page1' | 'page2' | 'page3' | 'page4') => void;
  gamesSubTab?: 'home' | 'leaderboard';
  onSelectGamesSubTab?: (subTab: 'home' | 'leaderboard') => void;
  studioSubTab?: 'page1' | 'page2' | 'page3';
  onSelectStudioSubTab?: (subTab: 'page1' | 'page2' | 'page3') => void;
  vipSubTab?: 'page1' | 'page2' | 'page3' | 'page4';
  onSelectVipSubTab?: (subTab: 'page1' | 'page2' | 'page3' | 'page4') => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  onTogglePlay: () => void;
  onPlayNext: () => void;
  onPlayPrev: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onOpenFullPlayer: () => void;
  onOpenAuth: () => void;
  onCloseTrack?: () => void;
  onQuickAction?: (action: string) => void;
  onOpenSleepTimer?: () => void;
  sleepTimerSecondsLeft?: number | null;
  sleepTimerActive?: boolean;
}

export function BottomTaskbar({
  currentMode,
  onSelectMode,
  onOpenModesSlider,
  activeTab,
  onSelectTab,
  messageSubTab = 'chat',
  onSelectMessageSubTab,
  coupleSubTab = 'page1',
  onSelectCoupleSubTab,
  financeSubTab = 'page1',
  onSelectFinanceSubTab,
  adminSubTab = 'page1',
  onSelectAdminSubTab,
  gamesSubTab = 'home',
  onSelectGamesSubTab,
  studioSubTab = 'page1',
  onSelectStudioSubTab,
  vipSubTab = 'page1',
  onSelectVipSubTab,
  currentTrack,
  isPlaying,
  progress,
  duration,
  volume,
  isMuted,
  onTogglePlay,
  onPlayNext,
  onPlayPrev,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onOpenFullPlayer,
  onOpenAuth,
  onCloseTrack,
  onQuickAction,
  onOpenSleepTimer,
  sleepTimerSecondsLeft,
  sleepTimerActive
}: BottomTaskbarProps) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // 1. Unread conversation badge
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const qConv = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubConv = onSnapshot(qConv, (snap) => {
      let total = 0;
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.unreadCounts && data.unreadCounts[user.uid]) {
          total += data.unreadCounts[user.uid] || 0;
        } else if (data.unreadCount && data.unreadCount[user.uid]) {
          total += data.unreadCount[user.uid] || 0;
        }
      });
      setUnreadCount(total);
    }, () => {});

    return () => unsubConv();
  }, [user]);

  // 2. Pending incoming friend requests badge
  useEffect(() => {
    if (!user) {
      setPendingRequestsCount(0);
      return;
    }

    const qRec = query(
      collection(db, 'friendRequests'),
      where('receiverUid', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubReq = onSnapshot(qRec, (snap) => {
      setPendingRequestsCount(snap.docs.length);
    }, () => {});

    return () => unsubReq();
  }, [user]);

  // Dynamic bottom dock tabs corresponding to the active mode
  const getDockNavItems = () => {
    if (activeTab === 'vip' || activeTab === 'topup') {
      return [
        { id: 'page1', label: 'Đặc Quyền VIP', icon: Crown, isModeSubTab: true },
        { id: 'page2', label: 'Nạp VIP', icon: Zap, isModeSubTab: true },
        { id: 'page3', label: 'Nạp Xu Haevy', icon: Coins, isModeSubTab: true },
        { id: 'page4', label: 'Tặng Bạn Bè', icon: Gift, isModeSubTab: true },
      ];
    }

    switch (currentMode) {
      case 'audio':
        return [
          { id: 'home', label: 'Trang Chủ', icon: Compass, isModeSubTab: false },
          { id: 'library', label: 'Kho Audio', icon: Library, isModeSubTab: false },
          { id: 'community', label: 'Thảo Luận', icon: Users, isModeSubTab: false },
          { id: 'player', label: 'Phát Nhạc', icon: Headphones, isModeSubTab: false },
        ];
      case 'messages':
        return [
          { 
            id: 'chat', 
            label: 'Trang Chat', 
            icon: MessageSquare, 
            badge: unreadCount > 0 ? unreadCount : undefined,
            isModeSubTab: true 
          },
          { 
            id: 'feed', 
            label: 'Trang Tin Ảnh', 
            icon: ImageIcon,
            isModeSubTab: true 
          },
          { 
            id: 'friends', 
            label: 'Kết Bạn', 
            icon: Users,
            badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
            isModeSubTab: true 
          },
        ];
      case 'couple':
        return [
          { 
            id: 'page1', 
            label: 'Yêu Thương 💕', 
            icon: Heart, 
            isModeSubTab: true 
          },
          { 
            id: 'page2', 
            label: 'Chu Kỳ 🌸', 
            icon: Droplets, 
            isModeSubTab: true 
          },
          { 
            id: 'page3', 
            label: 'Lịch Đôi 📅', 
            icon: Calendar, 
            isModeSubTab: true 
          },
          { 
            id: 'page4', 
            label: 'Nhật Ký 📖', 
            icon: BookOpen, 
            isModeSubTab: true 
          },
          { 
            id: 'page5', 
            label: 'Kỷ Niệm ✨', 
            icon: Sparkles, 
            isModeSubTab: true 
          },
        ];
      case 'finance':
        return [
          { 
            id: 'page1', 
            label: 'Tổng Quan', 
            icon: PieChart, 
            isModeSubTab: true 
          },
          { 
            id: 'page2', 
            label: 'Ngân Sách & Nợ', 
            icon: Scale, 
            isModeSubTab: true 
          },
          { 
            id: 'page3', 
            label: 'Thêm Thu Chi', 
            icon: Plus, 
            isCircularPlus: true,
            isModeSubTab: true 
          },
          { 
            id: 'page4', 
            label: 'Quỹ Gia Đình', 
            icon: Home, 
            isModeSubTab: true 
          },
          { 
            id: 'page5', 
            label: 'Tính Lãi & Toán', 
            icon: Calculator, 
            isModeSubTab: true 
          },
        ];
      case 'admin':
        return [
          { id: 'page1', label: 'Tổng Quan', icon: Activity, isModeSubTab: true },
          { id: 'page2', label: 'Đặc Quyền', icon: Crown, isModeSubTab: true },
          { id: 'page3', label: 'Duyệt Tác Giả', icon: ShieldCheck, isModeSubTab: true },
          { id: 'page4', label: 'Nuôi Admin', icon: Coins, isModeSubTab: true },
        ];
      case 'studio':
        return [
          { id: 'page1', label: 'Tổng Quan', icon: ShieldCheck, isModeSubTab: true },
          { id: 'page2', label: 'Tính Năng', icon: Mic, isModeSubTab: true },
          { id: 'page3', label: 'Kho Tác Phẩm', icon: Layers, isModeSubTab: true },
        ];
      case 'games':
        return [
          { id: 'home', label: 'Trang Chủ', icon: Gamepad2, isModeSubTab: true },
          { id: 'leaderboard', label: 'Bảng Xếp Hạng', icon: Trophy, isModeSubTab: true },
        ];
      default:
        return [
          { id: 'home', label: 'Trang Chủ', icon: Home, isModeSubTab: false },
          { id: 'library', label: 'Kho Audio', icon: Library, isModeSubTab: false },
          { id: 'community', label: 'Cộng Đồng', icon: Users, isModeSubTab: false },
        ];
    }
  };

  const navItems = getDockNavItems();

  const handleTabClick = (item: { id: string; isModeSubTab: boolean; isCircularPlus?: boolean }) => {
    if (activeTab === 'vip' || activeTab === 'topup') {
      if (item.isModeSubTab) {
        if (onSelectVipSubTab) {
          onSelectVipSubTab(item.id as 'page1' | 'page2' | 'page3' | 'page4');
        }
      } else {
        onSelectTab(item.id as ActiveTab);
      }
    } else if (currentMode === 'messages') {
      if (item.isModeSubTab) {
        onSelectTab('messages');
        if (onSelectMessageSubTab) {
          onSelectMessageSubTab(item.id as 'chat' | 'feed' | 'friends');
        }
      } else {
        onSelectTab(item.id as ActiveTab);
      }
    } else if (currentMode === 'couple') {
      if (item.isModeSubTab) {
        onSelectTab('couple');
        if (onSelectCoupleSubTab) {
          onSelectCoupleSubTab(item.id as 'page1' | 'page2' | 'page3');
        }
      } else {
        onSelectTab(item.id as ActiveTab);
      }
    } else if (currentMode === 'finance') {
      if (item.isModeSubTab) {
        onSelectTab('finance');
        if (onSelectFinanceSubTab) {
          onSelectFinanceSubTab(item.id as 'page1' | 'page2' | 'page3' | 'page4' | 'page5');
        }
      } else {
        onSelectTab(item.id as ActiveTab);
      }
    } else if (currentMode === 'admin') {
      if (item.isModeSubTab) {
        onSelectTab('admin');
        if (onSelectAdminSubTab) {
          onSelectAdminSubTab(item.id as 'page1' | 'page2' | 'page3' | 'page4');
        }
      } else {
        onSelectTab(item.id as ActiveTab);
      }
    } else if (currentMode === 'games') {
      if (item.isModeSubTab) {
        onSelectTab('games');
        if (onSelectGamesSubTab) {
          onSelectGamesSubTab(item.id as 'home' | 'leaderboard');
        }
      } else {
        onSelectTab(item.id as ActiveTab);
      }
    } else if (currentMode === 'studio') {
      if (item.isModeSubTab) {
        onSelectTab('studio');
        if (onSelectStudioSubTab) {
          onSelectStudioSubTab(item.id as 'page1' | 'page2' | 'page3');
        }
      } else {
        onSelectTab(item.id as ActiveTab);
      }
    } else {
      onSelectTab(item.id as ActiveTab);
    }
  };

  return (
    <footer 
      id="bottom-dock-taskbar"
      className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-2xl border-t border-zinc-800/90 shadow-[0_-10px_35px_rgba(0,0,0,0.85)] transition-all"
    >
      {/* Mini Player Strip (Docked directly above the bottom navigation tabs) */}
      {currentTrack && activeTab !== 'player' && (
        <div 
          id="mini-player-strip"
          className="border-b border-zinc-800/60 px-3 sm:px-6 py-2 bg-gradient-to-r from-zinc-900/95 via-zinc-950/95 to-zinc-900/95"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
            {/* Left Track Info */}
            <div 
              onClick={onOpenFullPlayer}
              className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 sm:flex-initial sm:w-1/3 cursor-pointer group"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-zinc-800 relative shrink-0 shadow-md border border-zinc-700/50">
                {currentTrack.coverUrl ? (
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500">
                    <Music2 size={16} />
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="flex gap-0.5 items-end h-3">
                      <div className="w-0.5 bg-amber-400 animate-[bounce_0.8s_infinite] h-full" />
                      <div className="w-0.5 bg-amber-400 animate-[bounce_1.2s_infinite] h-2/3" />
                      <div className="w-0.5 bg-amber-400 animate-[bounce_0.9s_infinite] h-4/5" />
                    </div>
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-amber-300 transition-colors">
                    {currentTrack.title}
                  </h4>
                  {currentTrack.isVipOnly && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 font-extrabold px-1 rounded border border-amber-500/40">
                      VIP
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-zinc-400 truncate">
                  {currentTrack.artist}
                </p>
              </div>
            </div>

            {/* Center Controls & Progress Bar */}
            <div className="flex flex-col items-center gap-1 flex-1 max-w-md">
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={onPlayPrev}
                  className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-90"
                  title="Bài trước"
                >
                  <SkipBack size={16} fill="currentColor" />
                </button>

                <button
                  type="button"
                  onClick={onTogglePlay}
                  className="p-2 sm:p-2.5 bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 text-black rounded-full transition-all shadow-md active:scale-95 cursor-pointer"
                  title={isPlaying ? 'Tạm dừng' : 'Phát'}
                >
                  {isPlaying ? (
                    <Pause size={16} fill="currentColor" />
                  ) : (
                    <Play size={16} fill="currentColor" className="ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={onPlayNext}
                  className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-90"
                  title="Bài tiếp theo"
                >
                  <SkipForward size={16} fill="currentColor" />
                </button>
              </div>

              {/* Progress Slider */}
              <div className="w-full flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                <span className="w-8 text-right">{formatTime(progress)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={progress}
                  onChange={(e) => onSeek(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400"
                />
                <span className="w-8">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls: Volume, Full Player & Close Player Button */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Volume Slider on desktop */}
              <div className="hidden md:flex items-center gap-1.5 mr-1">
                <button
                  type="button"
                  onClick={onToggleMute} 
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1"
                  title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
                >
                  {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="w-14 lg:w-20 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>

              {/* Full Player Button */}
              <button
                type="button"
                onClick={onOpenFullPlayer}
                className="p-1.5 sm:p-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Mở toàn màn hình trình phát"
              >
                <Maximize2 size={14} className="sm:w-[15px] sm:h-[15px]" />
              </button>

              {/* Dismiss / Close Hi-Fi Player Button */}
              {onCloseTrack && (
                <button
                  type="button"
                  onClick={onCloseTrack}
                  className="p-1.5 sm:p-2 bg-zinc-900/90 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-500/40 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 group"
                  title="Tắt / Xoá trình phát nhạc (Tránh che nội dung)"
                >
                  <X size={14} className="sm:w-[15px] sm:h-[15px] group-hover:rotate-90 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Consolidated Navigation Taskbar (Moved Down from Top) */}
      <div className="max-w-2xl mx-auto px-2 sm:px-6 py-2 flex items-center justify-around gap-1.5 sm:gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = (activeTab === 'vip' || activeTab === 'topup')
            ? vipSubTab === item.id
            : currentMode === 'messages'
            ? activeTab === 'messages' && messageSubTab === item.id
            : currentMode === 'couple'
            ? activeTab === 'couple' && coupleSubTab === item.id
            : currentMode === 'finance'
            ? activeTab === 'finance' && financeSubTab === item.id
            : currentMode === 'admin'
            ? activeTab === 'admin' && adminSubTab === item.id
            : currentMode === 'games'
            ? activeTab === 'games' && gamesSubTab === item.id
            : currentMode === 'studio'
            ? activeTab === 'studio' && studioSubTab === item.id
            : activeTab === item.id;

          // Special Circular Plus Button for Finance "Thêm Chi Tiêu"
          if ('isCircularPlus' in item && item.isCircularPlus) {
            return (
              <button
                key={item.id}
                id={`taskbar-tab-${item.id}`}
                type="button"
                onClick={() => handleTabClick(item)}
                className="relative flex flex-col items-center justify-center -mt-5 group cursor-pointer shrink-0 px-2 transition-transform duration-200"
                title={item.label}
              >
                <div className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform group-hover:scale-110 active:scale-95 ${
                  isActive 
                    ? 'bg-gradient-to-tr from-emerald-400 to-teal-300 text-zinc-950 ring-4 ring-emerald-500/40 shadow-emerald-500/50' 
                    : 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-zinc-950 ring-4 ring-zinc-900 shadow-emerald-500/30'
                }`}>
                  <Plus size={24} className="stroke-[3] transition-transform duration-300 group-hover:rotate-90 text-zinc-950" />
                </div>
                <span className={`text-[10px] sm:text-[11px] font-black mt-1 ${isActive ? 'text-emerald-400 font-black' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              id={`taskbar-tab-${item.id}`}
              type="button"
              onClick={() => handleTabClick(item)}
              className={`relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-2.5 sm:px-4 rounded-2xl transition-all cursor-pointer min-w-0 flex-1 ${
                isActive
                  ? currentMode === 'finance'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-black shadow-lg shadow-emerald-500/10 scale-[1.02]'
                    : currentMode === 'couple'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 font-black shadow-lg shadow-rose-500/10 scale-[1.02]'
                    : currentMode === 'studio'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 font-black shadow-lg shadow-purple-500/10 scale-[1.02]'
                    : 'bg-zinc-800/95 text-amber-300 border border-amber-500/40 font-black shadow-lg shadow-amber-500/10 scale-[1.02]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/70'
              }`}
            >
              {/* Active Indicator Glow Pill */}
              {isActive && (
                <span className={`absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-1 rounded-full ${
                  currentMode === 'finance'
                    ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]'
                    : currentMode === 'couple'
                    ? 'bg-rose-400 shadow-[0_0_10px_#f43f5e]'
                    : currentMode === 'studio'
                    ? 'bg-purple-400 shadow-[0_0_10px_#c084fc]'
                    : 'bg-amber-400 shadow-[0_0_10px_#f59e0b]'
                }`} />
              )}

              <div className="relative">
                <Icon 
                  size={17} 
                  className={
                    isActive 
                      ? currentMode === 'finance' 
                        ? 'text-emerald-400' 
                        : currentMode === 'couple' 
                        ? 'text-rose-400' 
                        : currentMode === 'studio'
                        ? 'text-purple-400'
                        : 'text-amber-400' 
                      : 'text-zinc-400'
                  } 
                />
                {'badge' in item && item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full min-w-[15px] text-center leading-tight shadow-md animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </footer>
  );
}
