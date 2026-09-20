import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, 
  Home, 
  Library, 
  Disc3, 
  MessageSquare, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  ChevronDown, 
  Check,
  Crown,
  Coins,
  Sparkles,
  ShieldCheck,
  KeyRound,
  Copy,
  Users,
  Heart,
  Mic,
  MicOff,
  Radio,
  Wallet,
  DollarSign,
  Layers,
  Compass,
  Headphones,
  Sliders,
  Sparkle,
  Gamepad2,
  Trophy,
  Bell,
  Maximize,
  Minimize,
  Smartphone,
  Download,
  Sun,
  LayoutGrid,
  Boxes,
  BrainCircuit,
  GitFork,
  Orbit,
  GraduationCap,
  Search,
  Command
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calculateLevelFromExp } from '../data/levelMilestones';
import { useModeBadges } from '../context/ModeBadgeContext';
import { ActiveTab, EcosystemMode, Track } from '../types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { HaevyAllModesInfoModal } from './HaevyAllModesInfoModal';
import { HaevyUserDropdownMenu } from './HaevyUserDropdownMenu';
import { CosmicAvatarFX } from './haevyLite/CosmicAvatarFX';
import { NotificationsModal } from './NotificationsModal';
import { HaevySpaceLogo } from './HaevySpaceLogo';
import { GoogleOmnibarModal } from './common/GoogleOmnibarModal';

interface NavbarProps {
  currentMode: EcosystemMode;
  onSelectMode: (mode: EcosystemMode, initialTab?: ActiveTab) => void;
  onOpenEcosystemDrawer?: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAuth: () => void;
  onOpenAnonPass?: () => void;
  onOpenStudioAudio?: (tab?: 'tts' | 'publish' | 'ekyc' | 'my-tracks') => void;
  onOpenNotifications?: () => void;
  unreadNotificationCount?: number;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  onOpenInstallPwa?: () => void;
  onOpenShortcuts?: () => void;
  onToggleVoiceListen?: () => void;
  isVoiceListening?: boolean;
  onUserMenuToggle?: (isOpen: boolean) => void;
  tracks?: Track[];
  onPlayTrack?: (track: Track) => void;
}

export function Navbar({ 
  currentMode,
  onSelectMode,
  onOpenEcosystemDrawer,
  activeTab, 
  onSelectTab, 
  onOpenAuth,
  onOpenAnonPass,
  onOpenStudioAudio,
  onOpenNotifications,
  unreadNotificationCount: externalUnreadCount,
  onToggleFullscreen,
  isFullscreen = false,
  onOpenInstallPwa,
  onOpenShortcuts,
  onToggleVoiceListen,
  isVoiceListening = false,
  onUserMenuToggle,
  tracks = [],
  onPlayTrack
}: NavbarProps) {
  const { 
    user, 
    loading, 
    accountId, 
    isAdmin, 
    audioPoints, 
    isVip, 
    vipTier, 
    isAuthorVerified, 
    systemAnnouncements,
    logout,
    userProfile,
    displayName: authDisplayName,
    photoURL: authPhotoURL,
    authStatus,
    isAuthenticated,
    levelExp = 0,
    unclaimedLevelRewardsCount = 0
  } = useAuth();

  const levelState = calculateLevelFromExp(levelExp);

  const effectiveDisplayName = userProfile?.displayName || authDisplayName || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Thành viên');
  const effectivePhotoURL = userProfile?.photoURL || authPhotoURL || user?.photoURL || null;
  const { totalBadgesCount, getBadgeForMode } = useModeBadges();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEcosystemDrawerOpen, setIsEcosystemDrawerOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isOmnibarOpen, setIsOmnibarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [pendingFriendCount, setPendingFriendCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Global Ctrl + K / Cmd + K shortcut to open Google Omnibar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOmnibarOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    onUserMenuToggle?.(dropdownOpen);
  }, [dropdownOpen, onUserMenuToggle]);

  // Listen for unread messages & conversations
  useEffect(() => {
    if (!user) {
      setUnreadMessagesCount(0);
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
        }
      });
      setUnreadMessagesCount(total);
    }, () => {});

    return () => unsubConv();
  }, [user]);

  // Listen for pending friend requests
  useEffect(() => {
    if (!user) {
      setPendingFriendCount(0);
      return;
    }

    const qReq = query(
      collection(db, 'friendRequests'),
      where('receiverUid', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubReq = onSnapshot(qReq, (snap) => {
      setPendingFriendCount(snap.size);
    }, () => {});

    return () => unsubReq();
  }, [user]);

  // Calculate unread system announcements from localStorage
  const getUnreadAnnouncementsCount = () => {
    try {
      const stored = localStorage.getItem(`haevy_read_announcements_${user?.uid || 'guest'}`);
      const readIds: string[] = stored ? JSON.parse(stored) : [];
      const relevant = systemAnnouncements.filter((item) => {
        if (item.targetAudience === 'vip' && !isVip) return false;
        if (item.targetAudience === 'authors' && !isAuthorVerified) return false;
        return true;
      });
      return relevant.filter(a => !readIds.includes(a.id)).length;
    } catch {
      return 0;
    }
  };

  const calculatedTotalUnread = unreadMessagesCount + pendingFriendCount + getUnreadAnnouncementsCount() + totalBadgesCount;
  const totalNotifications = externalUnreadCount !== undefined ? externalUnreadCount : calculatedTotalUnread;

  const handleOpenNotifications = () => {
    if (onOpenNotifications) {
      onOpenNotifications();
    } else {
      setIsNotificationsModalOpen(true);
    }
  };

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!accountId) return;
    navigator.clipboard.writeText(accountId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Dedicated sub-navigation tabs for each of the 6 standalone ecosystem modes
  const getModeNavItems = () => {
    switch (currentMode) {
      case 'portal':
        return [
          { id: 'portal' as ActiveTab, label: 'Trang Chủ Hệ Sinh Thái', icon: Sparkles },
          { id: 'library' as ActiveTab, label: 'Kho Audio', icon: Library },
          { id: 'community' as ActiveTab, label: 'Cộng Đồng', icon: Users }
        ];
      case 'audio':
        return [
          { id: 'home' as ActiveTab, label: 'Trang Chủ', icon: Compass },
          { id: 'library' as ActiveTab, label: 'Kho Audio', icon: Library },
          { id: 'community' as ActiveTab, label: 'Thảo Luận Cộng Đồng', icon: Users }
        ];
      case 'messages':
        return [
          { 
            id: 'messages' as ActiveTab, 
            label: 'Hộp Thư & Bạn Bè', 
            icon: MessageSquare,
            badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined 
          },
          { id: 'community' as ActiveTab, label: 'Giao Lưu Âm Nhạc', icon: Users }
        ];
      case 'couple':
        return [
          { id: 'couple' as ActiveTab, label: 'Không Gian Cặp Đôi 💕', icon: Heart },
          { id: 'library' as ActiveTab, label: 'Kho Nhạc Đôi', icon: Disc3 }
        ];
      case 'finance':
        return [
          { id: 'finance' as ActiveTab, label: 'Sổ Thu Chi 💰', icon: Wallet },
          { id: 'topup' as ActiveTab, label: 'Nạp Điểm & VIP', icon: Coins }
        ];
      case 'admin':
        return [
          { id: 'admin' as ActiveTab, label: 'Bảng Quản Trị Server 🛡️', icon: ShieldCheck },
          { id: 'library' as ActiveTab, label: 'Kho Bài Hát', icon: Library }
        ];
      case 'studio':
        return [
          { id: 'studio' as ActiveTab, label: 'Haevy Studio 🎙️', icon: Sparkles }
        ];
      case 'games':
        return [
          { id: 'games' as ActiveTab, label: 'Đấu Trường Game 🎮', icon: Gamepad2 }
        ];
      case 'spiritual':
        return [
          { id: 'spiritual' as ActiveTab, label: 'Tâm Linh Vũ Trụ 🔮', icon: Sparkles }
        ];
      case 'family_tree':
        return [
          { id: 'family_tree' as ActiveTab, label: 'Gia Phả Dòng Họ 👑', icon: GitFork }
        ];
      case 'morning':
      case 'space':
        return [
          { id: 'morning' as ActiveTab, label: 'Haevy Space 🌌', icon: Sparkles }
        ];
      default:
        return [
          { id: 'home' as ActiveTab, label: 'Trang Chủ', icon: Home },
          { id: 'library' as ActiveTab, label: 'Kho Audio', icon: Library },
          { id: 'community' as ActiveTab, label: 'Cộng Đồng', icon: Users }
        ];
    }
  };

  const currentNavItems = getModeNavItems();

  const getModeBadgeInfo = () => {
    switch (currentMode) {
      case 'portal':
        return { name: 'Hệ Sinh Thái Haevy', icon: Sparkles, tag: 'Hub', color: 'from-red-500 via-rose-500 to-amber-500', badgeClass: 'bg-red-500/20 text-amber-300 border-red-500/40' };
      case 'haevy_ai':
        return { name: 'Haevy AI Master', icon: BrainCircuit, tag: 'AI Pro', color: 'from-purple-500 via-indigo-500 to-pink-500', badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'audio':
        return { name: 'Haevy Audio', icon: Headphones, tag: 'Audio', color: 'from-amber-400 to-yellow-400', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'messages':
        return { name: 'Haevy Message', icon: MessageSquare, tag: 'Chat', color: 'from-sky-400 to-blue-400', badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
      case 'couple':
        return { name: 'I Love Haevy', icon: Heart, tag: 'Love', color: 'from-rose-400 to-pink-400', badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'finance':
        return { name: 'Haevy Finance', icon: Wallet, tag: 'Finance', color: 'from-emerald-400 to-teal-400', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'admin':
        return { name: 'Haevy Admin', icon: ShieldCheck, tag: 'Admin', color: 'from-yellow-400 to-amber-500', badgeClass: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/40' };
      case 'studio':
        return { name: 'Haevy Studio', icon: Sparkles, tag: 'Studio', color: 'from-purple-400 to-pink-400', badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'games':
        return { name: 'Haevy Games', icon: Gamepad2, tag: 'Games', color: 'from-indigo-400 to-violet-500', badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
      case 'spiritual':
        return { name: 'Haevy Spiritual', icon: Sparkles, tag: 'Tâm Linh 🔮', color: 'from-purple-500 via-indigo-500 to-pink-500', badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'family_tree':
        return { name: 'Haevy Family Tree', icon: GitFork, tag: 'Gia Phả 👑', color: 'from-amber-400 via-yellow-500 to-amber-600', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'support':
        return { name: 'Haevy Support', icon: Headphones, tag: 'Hỗ Trợ', color: 'from-emerald-400 to-teal-500', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'profile':
        return { name: 'Hồ Sơ Cá Nhân', icon: UserIcon, tag: 'Profile', color: 'from-blue-400 to-indigo-500', badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'audio_library':
        return { name: 'Kho Audio', icon: Library, tag: 'Kho Nhạc', color: 'from-amber-400 to-yellow-400', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'haevy_lite':
        return { name: 'Xu Haevy Lite', icon: Orbit, tag: 'Combo Vũ Trụ 🌌', color: 'from-purple-400 via-pink-400 to-indigo-400', badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'morning':
      case 'space':
      default:
        return { name: 'Haevy Space', icon: Sparkles, tag: 'Space 🌌', color: 'from-cyan-400 to-indigo-500', badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
    }
  };

  const modeInfo = getModeBadgeInfo();
  const ModeIcon = modeInfo.icon;

  const handleOpenDrawer = () => {
    if (onOpenEcosystemDrawer) {
      onOpenEcosystemDrawer();
    } else {
      setIsEcosystemDrawerOpen(true);
    }
  };

  return (
    <header className="w-full max-w-6xl mx-auto flex items-center justify-between pb-3 sm:pb-4 border-b border-zinc-800/80 mb-4 sm:mb-5 gap-1.5 sm:gap-3 min-w-0">
      {/* Brand & Logo with Mode Switcher Trigger */}
      <div 
        onClick={handleOpenDrawer}
        className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group shrink-0 select-none"
        title="Bấm để mở bảng đồng bộ 13 Phân Hệ Hệ Sinh Thái Haevy (Alt + M)"
      >
        {currentMode === 'couple' ? (
          <>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 p-[1px] shadow-lg shadow-rose-500/25 group-hover:scale-105 transition-all shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-rose-500/10 animate-pulse" />
                <Heart size={16} className="fill-rose-500 text-rose-300 animate-bounce relative z-10 sm:scale-125" />
              </div>
            </div>
            <div className="flex items-center shrink-0">
              <span className="text-sm sm:text-lg font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors whitespace-nowrap">
                I Love <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-red-400 bg-clip-text text-transparent">Haevy</span>
              </span>
            </div>
          </>
        ) : currentMode === 'finance' ? (
          <>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 p-[1px] shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-all shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />
                <Wallet size={16} className="text-emerald-300 animate-pulse relative z-10 sm:scale-125" />
              </div>
            </div>
            <div className="flex items-center shrink-0">
              <span className="text-sm sm:text-lg font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors whitespace-nowrap">
                Haevy <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Finance</span>
              </span>
            </div>
          </>
        ) : currentMode === 'messages' ? (
          <>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-500 to-blue-600 p-[1px] shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-all shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/10 animate-pulse" />
                <MessageSquare size={16} className="text-sky-300 fill-indigo-500/30 animate-pulse relative z-10 sm:scale-125" />
              </div>
            </div>
            <div className="flex items-center shrink-0">
              <span className="text-sm sm:text-lg font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors whitespace-nowrap">
                Haevy <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-blue-400 bg-clip-text text-transparent">Message</span>
              </span>
            </div>
          </>
        ) : currentMode === 'haevy_ai' ? (
          <>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-pink-500 p-[1px] shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-all shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-purple-500/15 animate-pulse" />
                <BrainCircuit size={17} className="text-purple-300 animate-pulse relative z-10 sm:scale-125" />
              </div>
            </div>
            <div className="flex items-center shrink-0">
              <span className="text-sm sm:text-lg font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors whitespace-nowrap">
                Haevy <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">AI</span>
              </span>
            </div>
          </>
        ) : currentMode === 'admin' ? (
          <>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-[1px] shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-all shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-xl sm:rounded-2xl flex items-center justify-center relative">
                <ShieldCheck size={17} className="text-amber-400 animate-pulse sm:scale-125" />
              </div>
            </div>
            <div className="flex items-center shrink-0">
              <span className="text-sm sm:text-lg font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors whitespace-nowrap">
                Haevy <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">Admin</span>
              </span>
            </div>
          </>
        ) : currentMode === 'studio' ? (
          <>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-400 via-indigo-500 to-pink-600 p-[1px] shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-all shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden">
                <Sparkles size={16} className="text-purple-300 animate-pulse relative z-10 sm:scale-125" />
              </div>
            </div>
            <div className="flex items-center shrink-0">
              <span className="text-sm sm:text-lg font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors whitespace-nowrap">
                Haevy <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">Studio</span>
              </span>
            </div>
          </>
        ) : currentMode === 'games' ? (
          <>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-[1px] shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-all shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden">
                <Gamepad2 size={16} className="text-indigo-300 animate-pulse relative z-10 sm:scale-125" />
              </div>
            </div>
            <div className="flex items-center shrink-0">
              <span className="text-sm sm:text-lg font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors whitespace-nowrap">
                Haevy <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-purple-400 bg-clip-text text-transparent">Games</span>
              </span>
            </div>
          </>
        ) : currentMode === 'spiritual' ? (
          <>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-pink-600 p-[1px] shadow-md shadow-purple-500/20 group-hover:scale-105 transition-all shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-lg sm:rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-purple-500/15 animate-pulse" />
                <Sparkles size={14} className="text-purple-300 animate-pulse relative z-10" />
              </div>
            </div>
            <div className="flex items-center shrink-0">
              <span className="text-xs sm:text-base font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors whitespace-nowrap">
                Haevy <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">Spiritual 🔮</span>
              </span>
            </div>
          </>
        ) : currentMode === 'support' ? (
          <>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-[1px] shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-all shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden">
                <Headphones size={16} className="text-emerald-400 animate-pulse relative z-10 sm:scale-125" />
              </div>
            </div>
            <div className="flex items-center shrink-0">
              <span className="text-sm sm:text-lg font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors whitespace-nowrap">
                Haevy <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Support</span>
              </span>
            </div>
          </>
        ) : currentMode === 'profile' ? (
          <>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-all shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden">
                <UserIcon size={16} className="text-blue-400 animate-pulse relative z-10 sm:scale-125" />
              </div>
            </div>
            <div className="flex items-center shrink-0">
              <span className="text-sm sm:text-lg font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors whitespace-nowrap">
                Hồ Sơ <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Haevy</span>
              </span>
            </div>
          </>
        ) : currentMode === 'haevy_lite' ? (
          <>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-600 to-pink-600 p-[1px] shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-all shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden">
                <Orbit size={18} className="text-purple-400 animate-spin-slow relative z-10 sm:scale-125" />
              </div>
            </div>
            <div className="flex items-center shrink-0">
              <span className="text-sm sm:text-lg font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors whitespace-nowrap">
                Xu Lite & <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-indigo-400 bg-clip-text text-transparent">Combo Vũ Trụ 🌌</span>
              </span>
            </div>
          </>
        ) : currentMode === 'edu' ? (
          <>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-[1px] shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-all shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/15 animate-pulse" />
                <GraduationCap size={17} className="text-emerald-300 animate-pulse relative z-10 sm:scale-125" />
              </div>
            </div>
            <div className="flex items-center shrink-0">
              <span className="text-sm sm:text-lg font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors whitespace-nowrap">
                Haevy <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Edu 🎓</span>
              </span>
            </div>
          </>
        ) : currentMode === 'family_tree' ? (
          <>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-700 p-[1px] shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-all shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-amber-500/15 animate-pulse" />
                <GitFork size={17} className="text-amber-300 animate-pulse relative z-10 sm:scale-125" />
              </div>
            </div>
            <div className="flex items-center shrink-0">
              <span className="text-sm sm:text-lg font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors whitespace-nowrap">
                Haevy <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">Family Tree</span>
              </span>
            </div>
          </>
        ) : (currentMode === 'morning' || currentMode === 'space') ? (
          <HaevySpaceLogo variant="full" size="sm" showSubtitle={false} />
        ) : (activeTab === 'vip' || activeTab === 'topup') ? (
          <>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 p-[1px] shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-all shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-amber-500/15 animate-pulse" />
                <Crown size={17} className="fill-amber-400 text-amber-300 relative z-10 animate-bounce sm:scale-125" />
              </div>
            </div>
            <div className="flex items-center shrink-0">
              <span className="text-sm sm:text-lg font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors whitespace-nowrap">
                Haevy <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">VIP</span>
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 p-[1px] shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-all shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-xl sm:rounded-2xl flex items-center justify-center gap-[2px] px-1.5 sm:px-2.5">
                <span className="w-[2.5px] sm:w-[3px] h-2.5 sm:h-3.5 bg-gradient-to-t from-amber-500 to-amber-300 rounded-full animate-pulse" />
                <span className="w-[2.5px] sm:w-[3px] h-4 sm:h-5 bg-gradient-to-t from-amber-400 to-yellow-200 rounded-full" />
                <span className="w-[2.5px] sm:w-[3px] h-5 sm:h-6 bg-gradient-to-t from-amber-300 to-white rounded-full" />
                <span className="w-[2.5px] sm:w-[3px] h-3 sm:h-4 bg-gradient-to-t from-amber-400 to-yellow-300 rounded-full animate-pulse" />
                <span className="w-[2.5px] sm:w-[3px] h-2 sm:h-2.5 bg-gradient-to-t from-amber-500 to-amber-400 rounded-full" />
              </div>
            </div>
            <div className="flex items-center shrink-0">
              <span className="text-sm sm:text-lg font-black text-white tracking-tight group-hover:text-zinc-100 transition-colors whitespace-nowrap">
                Haevy <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">Audio</span>
              </span>
            </div>
          </>
        )}

        {/* Interactive Mode Switcher indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800/90 text-[10px] text-zinc-400 group-hover:border-amber-500/50 group-hover:text-amber-300 transition-all ml-1 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold">Đồng bộ</span>
          <ChevronDown size={11} className="group-hover:translate-y-0.5 transition-transform" />
        </div>
      </div>

      {/* Google Universal Omnibar Search Pill (Desktop & Tablet) */}
      <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md mx-2 hidden sm:block">
        <button
          type="button"
          id="navbar-google-omnibar-pill"
          onClick={() => setIsOmnibarOpen(true)}
          className="w-full flex items-center justify-between gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-amber-500/40 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer shadow-sm group"
          title="Tìm kiếm thông minh toàn hệ sinh thái (Ctrl + K)"
        >
          <div className="flex items-center gap-2 truncate">
            <Search size={14} className="text-zinc-500 group-hover:text-amber-400 transition-colors shrink-0" />
            <span className="text-xs text-zinc-500 group-hover:text-zinc-300 truncate font-medium">
              Tìm kiếm thông minh toàn hệ sinh thái...
            </span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono text-zinc-500 bg-zinc-800/80 border border-zinc-700/60 rounded">
            <Command size={9} />K
          </kbd>
        </button>
      </div>

      {/* Desktop Quick Nav Bar (Visible on lg/xl screens) */}
      <nav className="hidden md:flex items-center gap-1 bg-zinc-950/80 border border-zinc-800/80 px-2 py-1 rounded-2xl shadow-inner shrink-0">
        {currentNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              id={`navbar-desktop-tab-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-zinc-800 text-amber-300 shadow-sm border border-zinc-700/80'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-amber-400' : 'text-zinc-500'} />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-sky-500 text-white text-[9px] font-black">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Action Bar */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Unified Studio AI Direct Action Button */}
        {onOpenStudioAudio && (
          <button
            id="navbar-unified-studio-btn"
            onClick={() => onOpenStudioAudio('tts')}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all cursor-pointer shrink-0"
            title="Studio AI: Chuyển văn bản ra giọng đọc & phát hành audio"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>AI Voice</span>
          </button>
        )}

        {/* Account ID Pill with 1-Click Copy (Desktop Only) */}
        {accountId && (
          <div 
            onClick={handleCopyId}
            className="hidden 2xl:flex items-center gap-1 px-2 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer text-xs font-mono group shrink-0"
            title="Bấm để sao chép ID tài khoản của bạn"
          >
            <span className="text-[9px] text-zinc-500 group-hover:text-amber-400/70">ID:</span>
            <span className="font-bold">{accountId}</span>
            {copiedId ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} className="text-zinc-500 group-hover:text-amber-300" />}
          </div>
        )}

        {/* Anonymous Pass Quick Action if not logged in */}
        {!user && onOpenAnonPass && (
          <button
            id="navbar-anon-pass-btn"
            onClick={onOpenAnonPass}
            className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-amber-300 hover:text-amber-200 text-[11px] sm:text-xs font-semibold transition-all shadow-sm shrink-0 cursor-pointer"
            title="Nhập mã ẩn danh VIP (Không cần đăng nhập)"
          >
            <KeyRound size={12} className="text-amber-400 sm:scale-110" />
            <span className="hidden sm:inline">Mã VIP</span>
          </button>
        )}

        {/* Voice Navigation 'Listen' Button (SpeechRecognition) */}
        {onToggleVoiceListen && (
          <button
            id="navbar-voice-listen-btn"
            onClick={onToggleVoiceListen}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 relative group ${
              isVoiceListening
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white border-amber-300 font-bold shadow-lg shadow-rose-500/30 ring-2 ring-amber-400/50 animate-pulse'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 hover:border-amber-500/50 text-amber-400 hover:text-amber-300'
            }`}
            title={
              isVoiceListening 
                ? 'Đang lắng nghe giọng nói... Bấm để dừng (VD: "Đi đến Haevy Finance", "Mở phòng thu")' 
                : 'Điều khiển bằng giọng nói: "Đi đến Haevy Finance", "Mở phòng thu", "Mở Tử Vi"...'
            }
            aria-label="Lắng nghe giọng nói"
          >
            {isVoiceListening ? (
              <>
                <div className="relative flex items-center justify-center">
                  <Mic size={13} className="text-white animate-bounce" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                </div>
                <span className="text-[10px] sm:text-xs font-black tracking-tight hidden xs:inline text-white">
                  Đang nghe...
                </span>
              </>
            ) : (
              <>
                <Mic size={13} className="text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] sm:text-xs font-bold hidden md:inline text-zinc-300 group-hover:text-amber-300">
                  Lắng nghe
                </span>
              </>
            )}
          </button>
        )}

        {/* Fullscreen Mode Toggle Button - Miniaturized & Compact */}
        {onToggleFullscreen && (
          <button
            id="navbar-fullscreen-btn"
            onClick={onToggleFullscreen}
            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-xl border transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 ${
              isFullscreen
                ? 'bg-amber-400 text-black border-amber-300 font-bold shadow-amber-400/20'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white'
            }`}
            title={isFullscreen ? 'Thoát chế độ toàn màn hình (ESC)' : 'Bật chế độ toàn màn hình'}
            aria-label="Toàn màn hình"
          >
            {isFullscreen ? (
              <Minimize size={13} className="text-black" />
            ) : (
              <Maximize size={13} className="text-zinc-400 group-hover:text-white" />
            )}
          </button>
        )}

        {/* Ecosystem Mode Switcher Button (Đồng bộ chuyển phân hệ Haevy) */}
        <button
          id="navbar-ecosystem-modes-btn"
          onClick={() => {
            if (onOpenEcosystemDrawer) {
              onOpenEcosystemDrawer();
            } else {
              window.dispatchEvent(new CustomEvent('haevy-open-quick-mode-switcher'));
            }
          }}
          className="relative h-7 sm:h-8 px-2 sm:px-2.5 flex items-center gap-1.5 rounded-lg sm:rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 text-amber-400 hover:text-amber-300 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 group"
          title={`Đồng bộ chuyển chế độ Hệ Sinh Thái Haevy (Alt + M)${totalBadgesCount > 0 ? ` (${totalBadgesCount} thông báo)` : ''}`}
          aria-label="Chế độ hệ sinh thái"
        >
          <Layers size={13} className="text-amber-400 group-hover:rotate-12 transition-transform shrink-0" />
          <span className="hidden md:inline text-[11px] font-bold text-zinc-300 group-hover:text-white whitespace-nowrap">
            Phân hệ
          </span>
          {totalBadgesCount > 0 && (
            <span className="min-w-[14px] h-[14px] px-0.5 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center shadow-md shadow-rose-500/40 animate-pulse border border-zinc-950">
              {totalBadgesCount > 99 ? '99+' : totalBadgesCount}
            </span>
          )}
        </button>

        {/* Notification Bell Button right beside Avatar - Miniaturized */}
        <button
          id="navbar-notification-btn"
          onClick={handleOpenNotifications}
          className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 group shrink-0"
          title="Xem thông báo hệ thống, lời mời kết bạn & tin nhắn"
          aria-label="Thông báo"
        >
          <Bell size={13} className="text-zinc-400 group-hover:text-amber-400 transition-colors" />
          {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center shadow-md shadow-rose-500/40 animate-pulse border border-zinc-950">
              {totalNotifications > 99 ? '99+' : totalNotifications}
            </span>
          )}
        </button>

        {/* COMPACT AVATAR & POINTS (CLICKING OPENS PROFILE / VIP / SUPPORT MENU) */}
        {loading ? (
          <div className="w-14 sm:w-16 h-7 sm:h-8 rounded-full bg-zinc-800 animate-pulse shrink-0" />
        ) : user ? (
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              id="user-profile-unified-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-1 sm:gap-1.5 p-0.5 sm:p-1 pl-1 sm:pl-1.5 pr-1.5 sm:pr-2 rounded-full border transition-all text-left shadow-sm cursor-pointer group shrink-0 ${
                isVip
                  ? 'bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border-amber-500/40 hover:border-amber-400'
                  : 'bg-zinc-900 hover:bg-zinc-800/90 border-zinc-800 hover:border-zinc-700'
              }`}
              title="Xem thông tin Haevy VIP, Haevy Hỗ Trợ & Trang Cá Nhân"
            >
              {/* Avatar Icon with Cosmic / Haevy Lite Avatar Frame */}
              <div className="relative shrink-0 flex items-center justify-center">
                <CosmicAvatarFX
                  photoURL={effectivePhotoURL}
                  displayName={effectiveDisplayName}
                  isVip={isVip}
                  size="xxs"
                  showBadge={isVip}
                />
              </div>

              {/* Compact Points - Always clearly visible without wrapping or overflow */}
              <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-mono font-bold shrink-0">
                <Coins size={11} className="text-amber-400 shrink-0" />
                <span className={`whitespace-nowrap ${isVip ? 'text-amber-300 font-black' : 'text-zinc-100'}`}>
                  {(audioPoints ?? 0).toLocaleString()}
                </span>
              </div>

              {/* LV Badge Pill */}
              <div 
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/40 text-[9px] sm:text-[10px] font-black text-amber-300 shrink-0 shadow-sm"
                title={`Cấp Độ: LV.${levelState.currentLevel} (${levelState.currentMilestone.title})`}
              >
                <span>LV.{levelState.currentLevel}</span>
                {unclaimedLevelRewardsCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                )}
              </div>

              <ChevronDown 
                size={10} 
                className={`text-zinc-500 group-hover:text-amber-300 transition-transform shrink-0 ${dropdownOpen ? 'rotate-180 text-amber-400' : 'group-hover:translate-y-0.5'}`} 
              />
            </button>

            {/* Reusable Haevy VIP, Support & Profile Dropdown */}
            <HaevyUserDropdownMenu
              isOpen={dropdownOpen}
              onClose={() => setDropdownOpen(false)}
              onSelectMode={onSelectMode}
              onSelectTab={onSelectTab}
              onOpenInstallPwa={onOpenInstallPwa}
              onOpenNotifications={onOpenNotifications}
              onToggleFullscreen={onToggleFullscreen}
              isFullscreen={isFullscreen}
              onOpenShortcuts={onOpenShortcuts}
            />
          </div>
        ) : (
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              id="open-modes-btn-guest"
              onClick={handleOpenDrawer}
              className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-[11px] sm:text-xs font-bold px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl border border-zinc-800 hover:border-amber-500/40 transition-all cursor-pointer shadow-sm group"
              title="Khám phá 6 Chế độ Hệ sinh thái Haevy"
            >
              <Layers size={12} className="text-amber-400" />
              <span className="text-[10px] sm:text-[11px] font-bold">6 Chế Độ</span>
            </button>

            <button
              id="open-login-btn"
              onClick={onOpenAuth}
              className="flex items-center gap-1 bg-white hover:bg-zinc-200 text-black text-[11px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
            >
              <LogIn size={12} />
              <span className="text-[10px] sm:text-[11px]">Đăng nhập</span>
            </button>
          </div>
        )}
      </div>

      {/* Internal Haevy All Modes Info Modal Fallback if opened locally */}
      <HaevyAllModesInfoModal
        isOpen={isEcosystemDrawerOpen}
        onClose={() => setIsEcosystemDrawerOpen(false)}
        onSelectMode={(mode, initialTab) => {
          setIsEcosystemDrawerOpen(false);
          onSelectMode(mode, initialTab);
        }}
      />

      {/* Internal Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        onSelectTab={onSelectTab}
        onSelectMode={onSelectMode}
      />

      {/* Google Universal Omnibar Modal */}
      <GoogleOmnibarModal
        isOpen={isOmnibarOpen}
        onClose={() => setIsOmnibarOpen(false)}
        tracks={tracks}
        onPlayTrack={onPlayTrack}
        onSelectMode={onSelectMode}
        onSelectTab={onSelectTab}
      />
    </header>
  );
}
