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
  FileText,
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
  Award,
  Gamepad2,
  Mic,
  Zap,
  Gift,
  BookOpen,
  Droplets,
  Sliders,
  Music,
  Flame,
  Dices,
  Target,
  Shuffle,
  Repeat,
  Repeat1,
  Sun,
  Camera,
  BrainCircuit,
  GitFork,
  ChevronDown,
  ChevronUp,
  Radio,
  Orbit,
  Tv,
  ShoppingBag,
  Gem,
  SlidersHorizontal,
  Moon,
  GraduationCap,
  FlaskConical,
  Video,
  Timer,
  MapPin,
  PenLine
} from 'lucide-react';
import { Track, ActiveTab, EcosystemMode } from '../types';
import { useAuth } from '../context/AuthContext';
import { calculateLevelFromExp } from '../data/levelMilestones';
import { useModeBadges } from '../context/ModeBadgeContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { HaevyGamesSubTab } from './HaevyGamesView';
import { haptics } from '../utils/haptics';

interface BottomTaskbarProps {
  currentMode: EcosystemMode;
  onSelectMode: (mode: EcosystemMode, initialTab?: ActiveTab) => void;
  onOpenModesSlider?: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  spaceSubTab?: 'portal' | 'canvas' | 'mascot' | 'magic_ar' | 'morning_dashboard';
  onSelectSpaceSubTab?: (subTab: 'portal' | 'canvas' | 'mascot' | 'magic_ar' | 'morning_dashboard') => void;
  messageSubTab?: 'chat' | 'feed' | 'friends';
  onSelectMessageSubTab?: (subTab: 'chat' | 'feed' | 'friends') => void;
  coupleSubTab?: 'page1' | 'page2' | 'page3' | 'page4' | 'page5';
  onSelectCoupleSubTab?: (subTab: 'page1' | 'page2' | 'page3' | 'page4' | 'page5') => void;
  financeSubTab?: 'page1' | 'page2' | 'page3' | 'page4' | 'page5';
  onSelectFinanceSubTab?: (subTab: 'page1' | 'page2' | 'page3' | 'page4' | 'page5') => void;
  adminSubTab?: 'page1' | 'page2' | 'page3' | 'page4' | 'page5' | 'page6' | 'page7';
  onSelectAdminSubTab?: (subTab: 'page1' | 'page2' | 'page3' | 'page4' | 'page5' | 'page6' | 'page7') => void;
  gamesSubTab?: HaevyGamesSubTab;
  onSelectGamesSubTab?: (subTab: HaevyGamesSubTab) => void;
  studioSubTab?: 'page1' | 'page2' | 'page3';
  onSelectStudioSubTab?: (subTab: 'page1' | 'page2' | 'page3') => void;
  vipSubTab?: 'page1' | 'page2' | 'page3' | 'page4' | 'page5' | 'page6';
  onSelectVipSubTab?: (subTab: 'page1' | 'page2' | 'page3' | 'page4' | 'page5' | 'page6') => void;
  haevyAISubTab?: 'overview' | 'chat' | 'updates' | 'troubleshoot' | 'modes';
  onSelectHaevyAISubTab?: (subTab: 'overview' | 'chat' | 'updates' | 'troubleshoot' | 'modes') => void;
  spiritualSubTab?: 'tarot' | 'tuvi' | 'astrology' | 'soundscapes' | 'crystal_oracle' | 'couple_spiritual';
  onSelectSpiritualSubTab?: (subTab: 'tarot' | 'tuvi' | 'astrology' | 'soundscapes' | 'crystal_oracle' | 'couple_spiritual') => void;
  familyTreeSubTab?: 'tree' | 'records' | 'anniversaries' | 'ancestors';
  onSelectFamilyTreeSubTab?: (subTab: 'tree' | 'records' | 'anniversaries' | 'ancestors') => void;
  haevyLiteSubTab?: 'shop' | 'customize' | 'topup_and_ads';
  onSelectHaevyLiteSubTab?: (subTab: 'shop' | 'customize' | 'topup_and_ads') => void;
  profileSubTab?: 'posts' | 'about' | 'audio' | 'media' | 'security' | 'transactions' | 'support';
  onSelectProfileSubTab?: (subTab: 'posts' | 'about' | 'audio' | 'media' | 'security' | 'transactions' | 'support') => void;
  eduSubTab?: 'assistant' | 'labs' | 'roadmap' | 'video' | 'notebook' | 'quiz' | 'tools' | 'exam';
  onSelectEduSubTab?: (subTab: 'assistant' | 'labs' | 'roadmap' | 'video' | 'notebook' | 'quiz' | 'tools' | 'exam') => void;
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
  shuffleMode?: 'off' | 'shuffle' | 'smart_shuffle';
  repeatMode?: 'off' | 'all' | 'one';
  onToggleShuffle?: () => void;
  onToggleRepeat?: () => void;
  onOpenSmartShuffleModal?: () => void;
}

export function BottomTaskbar({
  currentMode,
  onSelectMode,
  onOpenModesSlider,
  activeTab,
  onSelectTab,
  spaceSubTab = 'portal',
  onSelectSpaceSubTab,
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
  haevyAISubTab = 'overview',
  onSelectHaevyAISubTab,
  spiritualSubTab = 'tarot',
  onSelectSpiritualSubTab,
  familyTreeSubTab = 'tree',
  onSelectFamilyTreeSubTab,
  haevyLiteSubTab = 'shop',
  onSelectHaevyLiteSubTab,
  profileSubTab = 'posts',
  onSelectProfileSubTab,
  eduSubTab = 'assistant',
  onSelectEduSubTab,
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
  sleepTimerActive,
  shuffleMode = 'smart_shuffle',
  repeatMode = 'off',
  onToggleShuffle,
  onToggleRepeat,
  onOpenSmartShuffleModal,
}: BottomTaskbarProps) {
  const { 
    user, 
    isAdmin, 
    isSuperAdmin,
    levelExp = 0,
    unclaimedLevelRewardsCount = 0,
    setIsLevelModalOpen
  } = useAuth();

  const levelState = calculateLevelFromExp(levelExp);
  const { getBadgeForMode, getBadgeForSubTab, markModeAsViewed, totalBadgesCount } = useModeBadges();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [isPlayerStripCollapsed, setIsPlayerStripCollapsed] = useState(false);

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

  // Hide entire taskbar when user avatar menu is open
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  useEffect(() => {
    const handleUserMenu = (e: any) => {
      setIsUserMenuOpen(Boolean(e.detail));
    };
    window.addEventListener('haevy:user-menu-opened', handleUserMenu);
    return () => {
      window.removeEventListener('haevy:user-menu-opened', handleUserMenu);
    };
  }, []);

  // If user action panel is open, completely hide bottom taskbar
  if (isUserMenuOpen) {
    return null;
  }

  // Dynamic bottom dock tabs corresponding to the active mode
  const getDockNavItems = () => {
    if (activeTab === 'vip' || activeTab === 'topup') {
      return [
        { id: 'page1', label: 'Đặc Quyền', icon: Crown, isModeSubTab: true },
        { id: 'page2', label: 'Nạp VIP', icon: Zap, isModeSubTab: true },
        { id: 'page3', label: 'Nạp Xu', icon: Coins, isModeSubTab: true },
        { id: 'page4', label: 'Tặng Bạn', icon: Gift, isModeSubTab: true },
        { id: 'page5', label: 'AI VIP', icon: BrainCircuit, isModeSubTab: true },
        { id: 'page6', label: 'Thượng Lưu', icon: Gem, isModeSubTab: true },
      ];
    }

    switch (currentMode) {
      case 'audio':
        return [
          { id: 'home', label: 'Trang Chủ', icon: Compass, isModeSubTab: false, badge: getBadgeForSubTab('audio', 'home') || undefined },
          { id: 'library', label: 'Kho Audio', icon: Library, isModeSubTab: false, badge: getBadgeForSubTab('audio', 'library') || undefined },
          { id: 'community', label: 'Thảo Luận', icon: Users, isModeSubTab: false, badge: getBadgeForSubTab('audio', 'community') || undefined },
          { id: 'player', label: 'Phát Nhạc', icon: Headphones, isModeSubTab: false },
        ];
      case 'messages':
        return [
          { 
            id: 'chat', 
            label: 'Trang Chat', 
            icon: MessageSquare, 
            badge: (getBadgeForSubTab('messages', 'chat') || unreadCount) > 0 ? (getBadgeForSubTab('messages', 'chat') || unreadCount) : undefined,
            isModeSubTab: true 
          },
          { 
            id: 'feed', 
            label: 'Trang Tin Ảnh', 
            icon: ImageIcon,
            badge: getBadgeForSubTab('messages', 'feed') || undefined,
            isModeSubTab: true 
          },
          { 
            id: 'friends', 
            label: 'Kết Bạn', 
            icon: Users,
            badge: (getBadgeForSubTab('messages', 'friends') || pendingRequestsCount) > 0 ? (getBadgeForSubTab('messages', 'friends') || pendingRequestsCount) : undefined,
            isModeSubTab: true 
          },
        ];
      case 'couple':
        return [
          { 
            id: 'page1', 
            label: 'Yêu Thương 💕', 
            icon: Heart, 
            badge: getBadgeForSubTab('couple', 'page1') || undefined,
            isModeSubTab: true 
          },
          { 
            id: 'page2', 
            label: 'Chu Kỳ 🌸', 
            icon: Droplets, 
            badge: getBadgeForSubTab('couple', 'page2') || undefined,
            isModeSubTab: true 
          },
          { 
            id: 'page3', 
            label: 'Lịch & Nhật Ký 📅', 
            icon: Calendar, 
            badge: getBadgeForSubTab('couple', 'page3') || undefined,
            isModeSubTab: true 
          },
          { 
            id: 'page4', 
            label: 'Kỷ Niệm ✨', 
            icon: Sparkles, 
            badge: getBadgeForSubTab('couple', 'page4') || undefined,
            isModeSubTab: true 
          },
        ];
      case 'finance':
        return [
          { 
            id: 'page1', 
            label: 'Tổng Quan', 
            icon: PieChart, 
            badge: getBadgeForSubTab('finance', 'page1') || undefined,
            isModeSubTab: true 
          },
          { 
            id: 'page2', 
            label: 'Ngân Sách & Nợ', 
            icon: Scale, 
            badge: getBadgeForSubTab('finance', 'page2') || undefined,
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
            badge: getBadgeForSubTab('finance', 'page4') || undefined,
            isModeSubTab: true 
          },
          { 
            id: 'page5', 
            label: 'Tính Lãi & Toán', 
            icon: Calculator, 
            badge: getBadgeForSubTab('finance', 'page5') || undefined,
            isModeSubTab: true 
          },
        ];
      case 'admin':
        return [
          { id: 'page1', label: 'Tổng Quan', icon: Activity, isModeSubTab: true },
          { id: 'page2', label: 'Đặc Quyền', icon: Crown, isModeSubTab: true },
          { id: 'page3', label: 'Duyệt Tác Giả', icon: ShieldCheck, badge: getBadgeForSubTab('admin', 'page3') || undefined, isModeSubTab: true },
          { id: 'page4', label: 'Nuôi Admin', icon: Coins, isModeSubTab: true },
          { id: 'page5', label: 'Sửa Home', icon: Sliders, isModeSubTab: true },
          { id: 'page6', label: '×2 Đám Đông', icon: Zap, isModeSubTab: true },
          { id: 'page7', label: 'Sự Kiện', icon: Calendar, badge: getBadgeForSubTab('admin', 'page7') || undefined, isModeSubTab: true },
        ];
      case 'studio':
        return [
          { id: 'page1', label: 'Tổng Quan', icon: ShieldCheck, badge: getBadgeForSubTab('studio', 'page1') || undefined, isModeSubTab: true },
          { id: 'page2', label: 'Tính Năng', icon: Mic, isModeSubTab: true },
          { id: 'page3', label: 'Kho Tác Phẩm', icon: Layers, badge: getBadgeForSubTab('studio', 'page3') || undefined, isModeSubTab: true },
        ];
      case 'games':
        return [
          { id: 'home', label: 'Trang Game 🎮', icon: Gamepad2, isModeSubTab: true },
          { id: 'quests', label: 'Nhiệm Vụ 📜', icon: Flame, badge: getBadgeForSubTab('games', 'quests') || undefined, isModeSubTab: true },
          { id: 'leaderboard', label: 'Bảng Xếp Hạng 🏆', icon: Trophy, badge: getBadgeForSubTab('games', 'leaderboard') || undefined, isModeSubTab: true },
        ];
      case 'morning':
      case 'space':
        return [
          { id: 'morning_dashboard', label: 'Bảng Buổi Sáng ☀️', icon: Sun, badge: 'Mới', isModeSubTab: true },
          { id: 'portal', label: 'Cổng 3D 🌌', icon: Sparkles, isModeSubTab: true },
          { id: 'canvas', label: 'Vẽ 3D ✍️', icon: PenLine, isModeSubTab: true },
          { id: 'mascot', label: 'Linh Vật 🐲', icon: Flame, isModeSubTab: true },
          { id: 'magic_ar', label: 'Phép Thuật 🧙‍♂️', icon: Zap, isModeSubTab: true },
        ];
      case 'haevy_ai':
        return [
          { id: 'overview', label: 'Trợ Lý Hub 🧠', icon: BrainCircuit, badge: getBadgeForSubTab('haevy_ai', 'overview') || undefined, isModeSubTab: true },
          { id: 'chat', label: 'Tâm Sự 💖', icon: Heart, badge: getBadgeForSubTab('haevy_ai', 'chat') || undefined, isModeSubTab: true },
          { id: 'updates', label: 'Cập Nhật 🚀', icon: Sparkles, badge: getBadgeForSubTab('haevy_ai', 'updates') || undefined, isModeSubTab: true },
          { id: 'troubleshoot', label: 'Cứu Hộ 🛠️', icon: ShieldCheck, isModeSubTab: true },
          { id: 'modes', label: 'Lệnh Chế Độ ⚡', icon: Zap, isModeSubTab: true },
        ];
      case 'spiritual':
        return [
          { id: 'tarot', label: 'Tarot 3D 🔮', icon: Sparkles, badge: getBadgeForSubTab('spiritual', 'tarot') || undefined, isModeSubTab: true },
          { id: 'tuvi', label: 'Tử Vi 2026 📜', icon: Sun, isModeSubTab: true },
          { id: 'astrology', label: 'Bản Đồ Sao 🌌', icon: Compass, isModeSubTab: true },
          { id: 'soundscapes', label: 'Sóng Âm 🎧', icon: Radio, isModeSubTab: true },
          { id: 'couple_spiritual', label: 'Duyên Số 💖', icon: Heart, isModeSubTab: true },
        ];
      case 'family_tree':
        return [
          { id: 'tree', label: 'Cây Gia Phả 👑', icon: GitFork, isModeSubTab: true },
          { id: 'records', label: 'Sắc Phong 📜', icon: BookOpen, isModeSubTab: true },
          { id: 'anniversaries', label: 'Lịch Giỗ 📅', icon: Calendar, badge: getBadgeForSubTab('family_tree', 'anniversaries') || undefined, isModeSubTab: true },
          { id: 'ancestors', label: 'Tiền Nhân 👥', icon: Users, isModeSubTab: true },
        ];
      case 'haevy_lite':
        return [
          { id: 'shop', label: '1. Shop Bán 🛍️', icon: ShoppingBag, badge: getBadgeForSubTab('haevy_lite', 'shop') || undefined, isModeSubTab: true },
          { id: 'customize', label: '2. Tùy Chỉnh 🎨', icon: SlidersHorizontal, isModeSubTab: true },
          { id: 'topup_and_ads', label: '3. Nạp Xu & QC 🪙', icon: Coins, badge: getBadgeForSubTab('haevy_lite', 'topup_and_ads') || undefined, isModeSubTab: true },
        ];
      case 'edu':
        return [
          { id: 'assistant', label: 'AI Gia Sư', icon: BrainCircuit, isModeSubTab: true },
          { id: 'exam', label: 'Luyện Thi', icon: Timer, badge: '2027', isModeSubTab: true },
          { id: 'labs', label: 'Lab Ảo', icon: FlaskConical, badge: '11+', isModeSubTab: true },
          { id: 'tools', label: 'Tiện Ích', icon: Calculator, badge: 'fx-880', isModeSubTab: true },
          { id: 'roadmap', label: 'Lộ Trình', icon: Compass, isModeSubTab: true },
          { id: 'notebook', label: 'Sổ Tay', icon: FileText, isModeSubTab: true },
          { id: 'quiz', label: 'Quiz', icon: Zap, isModeSubTab: true },
        ];
      case 'maps':
        return [
          { id: 'all', label: 'Tất Cả 📍', icon: MapPin, isModeSubTab: true },
          { id: 'couple', label: 'Bạn Đời 💖', icon: Heart, isModeSubTab: true },
          { id: 'family', label: 'Gia Đình 🏡', icon: Home, isModeSubTab: true },
          { id: 'zones', label: 'Vùng An Toàn 🛡️', icon: ShieldCheck, isModeSubTab: true },
        ];
      case 'profile':
        return [
          { id: 'posts', label: 'Bài Đăng', icon: FileText, isModeSubTab: true },
          { id: 'about', label: 'Hồ Sơ & Bio', icon: UserIcon, isModeSubTab: true },
          { 
            id: 'level', 
            label: `Cấp LV.${levelState.currentLevel}`, 
            icon: Award, 
            isModeSubTab: true, 
            badge: unclaimedLevelRewardsCount > 0 ? `+${unclaimedLevelRewardsCount}` : undefined 
          },
          { id: 'security', label: 'Bảo Mật', icon: ShieldCheck, badge: '6/6', isModeSubTab: true },
          { id: 'transactions', label: 'Điểm & Xu', icon: Coins, isModeSubTab: true },
          { id: 'media', label: 'Kho Media', icon: ImageIcon, isModeSubTab: true },
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
    markModeAsViewed(currentMode, item.id);
    if (item.isCircularPlus) {
      haptics.medium();
    } else {
      haptics.selection();
    }
    if (activeTab === 'vip' || activeTab === 'topup') {
      if (item.isModeSubTab) {
        if (onSelectVipSubTab) {
          onSelectVipSubTab(item.id as 'page1' | 'page2' | 'page3' | 'page4' | 'page5' | 'page6');
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
          onSelectAdminSubTab(item.id as 'page1' | 'page2' | 'page3' | 'page4' | 'page5' | 'page6' | 'page7');
        }
      } else {
        onSelectTab(item.id as ActiveTab);
      }
    } else if (currentMode === 'games') {
      if (item.isModeSubTab) {
        onSelectTab('games');
        if (onSelectGamesSubTab) {
          onSelectGamesSubTab(item.id as HaevyGamesSubTab);
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
    } else if (currentMode === 'haevy_ai') {
      if (item.isModeSubTab) {
        onSelectTab('haevy_ai');
        if (onSelectHaevyAISubTab) {
          onSelectHaevyAISubTab(item.id as any);
        }
      } else {
        onSelectTab(item.id as ActiveTab);
      }
    } else if (currentMode === 'spiritual') {
      if (item.isModeSubTab) {
        onSelectTab('spiritual');
        if (onSelectSpiritualSubTab) {
          onSelectSpiritualSubTab(item.id as any);
        }
      } else {
        onSelectTab(item.id as ActiveTab);
      }
    } else if (currentMode === 'family_tree') {
      if (item.isModeSubTab) {
        onSelectTab('family_tree');
        if (onSelectFamilyTreeSubTab) {
          onSelectFamilyTreeSubTab(item.id as any);
        }
      } else {
        onSelectTab(item.id as ActiveTab);
      }
    } else if (currentMode === 'haevy_lite') {
      if (item.isModeSubTab) {
        onSelectTab('haevy_lite');
        if (onSelectHaevyLiteSubTab) {
          onSelectHaevyLiteSubTab(item.id as 'shop' | 'customize' | 'topup_and_ads');
        }
      } else {
        onSelectTab(item.id as ActiveTab);
      }
    } else if (currentMode === 'edu') {
      if (item.isModeSubTab) {
        onSelectTab('edu' as any);
        if (onSelectEduSubTab) {
          onSelectEduSubTab(item.id as any);
        }
      } else {
        onSelectTab(item.id as ActiveTab);
      }
    } else if (currentMode === 'profile') {
      if (item.id === 'level') {
        setIsLevelModalOpen(true);
        return;
      }
      if (item.isModeSubTab) {
        onSelectTab('profile' as any);
        if (onSelectProfileSubTab) {
          onSelectProfileSubTab(item.id as any);
        }
      } else {
        onSelectTab(item.id as ActiveTab);
      }
    } else if (currentMode === 'space' || currentMode === 'morning') {
      if (item.isModeSubTab) {
        onSelectTab('space' as any);
        if (onSelectSpaceSubTab) {
          onSelectSpaceSubTab(item.id as any);
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
      {currentTrack && activeTab !== 'player' && isPlayerStripCollapsed && (
        <div 
          id="mini-player-strip-collapsed"
          className="border-b border-zinc-800/80 px-3 sm:px-6 py-1.5 bg-gradient-to-r from-zinc-900/95 via-zinc-950/95 to-zinc-900/95 flex items-center justify-between gap-2 text-xs animate-fadeIn"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={onTogglePlay}
              className="p-1 rounded-full bg-amber-400 text-zinc-950 hover:bg-amber-300 transition shrink-0 cursor-pointer shadow-sm active:scale-95"
              title={isPlaying ? 'Tạm dừng' : 'Phát'}
            >
              {isPlaying ? <Pause size={12} className="fill-zinc-950" /> : <Play size={12} className="fill-zinc-950 ml-0.5" />}
            </button>
            <span className="font-bold text-white text-xs truncate max-w-[160px] sm:max-w-xs">
              {currentTrack.title}
            </span>
            <span className="text-zinc-500 text-[11px] truncate hidden xs:inline">
              • {currentTrack.artist}
            </span>
            <div className="flex-1 max-w-xs hidden md:block h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-400 rounded-full transition-all"
                style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsPlayerStripCollapsed(false)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white transition text-[11px] font-semibold cursor-pointer"
              title="Mở rộng bảng phát nhạc"
            >
              <ChevronUp size={13} />
              <span className="hidden sm:inline">Mở rộng</span>
            </button>
            {onCloseTrack && (
              <button
                type="button"
                onClick={onCloseTrack}
                className="p-1 text-zinc-400 hover:text-rose-300 transition cursor-pointer"
                title="Tắt nhạc"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {currentTrack && activeTab !== 'player' && !isPlayerStripCollapsed && (
        <div 
          id="mini-player-strip"
          className="border-b border-zinc-800/60 px-3 sm:px-6 py-2 bg-gradient-to-r from-zinc-900/95 via-zinc-950/95 to-zinc-900/95"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
            {/* Left Track Info */}
            <div 
              onClick={() => {
                haptics.medium();
                onOpenFullPlayer();
              }}
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
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Shuffle Button */}
                {onToggleShuffle && (
                  <button
                    type="button"
                    onClick={() => {
                      haptics.selection();
                      onToggleShuffle();
                    }}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      shuffleMode === 'smart_shuffle'
                        ? 'text-purple-300 bg-purple-500/20'
                        : shuffleMode === 'shuffle'
                        ? 'text-amber-400 bg-amber-500/20'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title={
                      shuffleMode === 'smart_shuffle'
                        ? '✨ Smart Shuffle AI (Ưu tiên theo gu) - Bấm để đổi'
                        : shuffleMode === 'shuffle'
                        ? '🔀 Ngẫu nhiên - Bấm để đổi'
                        : 'Phát tuần tự - Bấm để bật'
                    }
                  >
                    {shuffleMode === 'smart_shuffle' ? (
                      <Sparkles size={14} className="animate-pulse" />
                    ) : (
                      <Shuffle size={14} />
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    haptics.light();
                    onPlayPrev();
                  }}
                  className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-90"
                  title="Bài trước"
                >
                  <SkipBack size={16} fill="currentColor" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    haptics.toggle();
                    onTogglePlay();
                  }}
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
                  onClick={() => {
                    haptics.light();
                    onPlayNext();
                  }}
                  className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-90"
                  title="Bài tiếp theo"
                >
                  <SkipForward size={16} fill="currentColor" />
                </button>

                {/* Repeat Button */}
                {onToggleRepeat && (
                  <button
                    type="button"
                    onClick={() => {
                      haptics.selection();
                      onToggleRepeat();
                    }}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                      repeatMode === 'one'
                        ? 'text-amber-300 bg-amber-500/20'
                        : repeatMode === 'all'
                        ? 'text-emerald-300 bg-emerald-500/20'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title={
                      repeatMode === 'one'
                        ? '🔂 Đang lặp 1 bài - Bấm để đổi'
                        : repeatMode === 'all'
                        ? '🔁 Đang lặp toàn bộ - Bấm để đổi'
                        : 'Tắt lặp lại - Bấm để bật'
                    }
                  >
                    {repeatMode === 'one' ? <Repeat1 size={14} /> : <Repeat size={14} />}
                  </button>
                )}
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
                  onClick={() => {
                    haptics.selection();
                    onToggleMute();
                  }} 
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

              {/* Collapse Mini-Player Button */}
              <button
                type="button"
                onClick={() => {
                  haptics.light();
                  setIsPlayerStripCollapsed(true);
                }}
                className="p-1.5 sm:p-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl transition-all cursor-pointer"
                title="Thu nhỏ thanh phát nhạc (Để xem trọn vẹn màn hình)"
              >
                <ChevronDown size={14} className="sm:w-[15px] sm:h-[15px]" />
              </button>

              {/* Full Player Button */}
              <button
                type="button"
                onClick={() => {
                  haptics.medium();
                  onOpenFullPlayer();
                }}
                className="p-1.5 sm:p-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Mở toàn màn hình trình phát"
              >
                <Maximize2 size={14} className="sm:w-[15px] sm:h-[15px]" />
              </button>

              {/* Dismiss / Close Hi-Fi Player Button */}
              {onCloseTrack && (
                <button
                  type="button"
                  onClick={() => {
                    haptics.light();
                    onCloseTrack();
                  }}
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
      <div className="max-w-4xl mx-auto px-1.5 sm:px-6 py-2 flex items-center justify-around gap-1 sm:gap-2 overflow-x-auto no-scrollbar touch-pan-x">
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
            ? activeTab === 'games' && (gamesSubTab === item.id || (!gamesSubTab && item.id === 'home') || (item.id === 'home' && gamesSubTab !== 'leaderboard' && gamesSubTab !== 'quests'))
            : currentMode === 'studio'
            ? activeTab === 'studio' && studioSubTab === item.id
            : currentMode === 'haevy_ai'
            ? activeTab === 'haevy_ai' && (haevyAISubTab === item.id || (!haevyAISubTab && item.id === 'overview'))
            : currentMode === 'spiritual'
            ? activeTab === 'spiritual' && (spiritualSubTab === item.id || (!spiritualSubTab && item.id === 'tarot'))
            : currentMode === 'family_tree'
            ? activeTab === 'family_tree' && (familyTreeSubTab === item.id || (!familyTreeSubTab && item.id === 'tree'))
            : currentMode === 'haevy_lite'
            ? activeTab === 'haevy_lite' && (haevyLiteSubTab === item.id || (!haevyLiteSubTab && item.id === 'shop'))
            : currentMode === 'edu'
            ? activeTab === 'edu' && (eduSubTab === item.id || (!eduSubTab && item.id === 'assistant'))
            : currentMode === 'profile'
            ? activeTab === 'profile' && (profileSubTab === item.id || (!profileSubTab && item.id === 'posts'))
            : (currentMode === 'space' || currentMode === 'morning')
            ? (spaceSubTab === item.id || (!spaceSubTab && item.id === 'portal'))
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
              className={`relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-2 sm:px-3.5 rounded-2xl transition-all cursor-pointer min-w-0 shrink-0 sm:shrink sm:flex-1 ${
                isActive
                  ? currentMode === 'finance'
                    ? 'bg-emerald-500/20 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 dark:border-emerald-500/50 font-black shadow-lg shadow-emerald-500/10 scale-[1.02]'
                    : currentMode === 'edu'
                    ? 'bg-emerald-500/20 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 dark:border-emerald-500/50 font-black shadow-lg shadow-emerald-500/10 scale-[1.02]'
                    : currentMode === 'profile'
                    ? 'bg-blue-500/20 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-500/40 dark:border-blue-500/50 font-black shadow-lg shadow-blue-500/10 scale-[1.02]'
                    : currentMode === 'couple'
                    ? 'bg-rose-500/20 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/40 dark:border-rose-500/50 font-black shadow-lg shadow-rose-500/10 scale-[1.02]'
                    : currentMode === 'studio'
                    ? 'bg-purple-500/20 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-500/40 dark:border-purple-500/50 font-black shadow-lg shadow-purple-500/10 scale-[1.02]'
                    : currentMode === 'haevy_ai'
                    ? 'bg-purple-500/20 dark:bg-purple-500/25 text-purple-800 dark:text-purple-200 border border-purple-500/40 dark:border-purple-400/60 font-black shadow-lg shadow-purple-900/40 scale-[1.02]'
                    : currentMode === 'family_tree'
                    ? 'bg-amber-500/20 dark:bg-amber-500/25 text-amber-800 dark:text-amber-200 border border-amber-500/40 dark:border-amber-400/60 font-black shadow-lg shadow-amber-900/40 scale-[1.02]'
                    : currentMode === 'games'
                    ? 'bg-indigo-600/20 dark:bg-indigo-600/25 text-indigo-800 dark:text-indigo-300 border border-indigo-500/40 dark:border-indigo-500/50 font-black shadow-lg shadow-indigo-500/10 scale-[1.02]'
                    : (currentMode === 'morning' || currentMode === 'space')
                    ? 'bg-cyan-500/20 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-500/40 dark:border-cyan-500/50 font-black shadow-lg shadow-cyan-500/10 scale-[1.02]'
                    : currentMode === 'haevy_lite'
                    ? 'bg-purple-500/20 dark:bg-purple-500/25 text-purple-800 dark:text-purple-200 border border-purple-500/40 dark:border-purple-400/60 font-black shadow-lg shadow-purple-900/40 scale-[1.02]'
                    : 'bg-amber-500/15 dark:bg-zinc-800/95 text-amber-800 dark:text-amber-300 border border-amber-500/40 font-black shadow-lg shadow-amber-500/10 scale-[1.02]'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-900/70'
              }`}
            >
              {/* Active Indicator Glow Pill */}
              {isActive && (
                <span className={`absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-1 rounded-full ${
                  currentMode === 'finance'
                    ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]'
                    : currentMode === 'edu'
                    ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]'
                    : currentMode === 'profile'
                    ? 'bg-blue-400 shadow-[0_0_10px_#3b82f6]'
                    : currentMode === 'couple'
                    ? 'bg-rose-400 shadow-[0_0_10px_#f43f5e]'
                    : currentMode === 'studio'
                    ? 'bg-purple-400 shadow-[0_0_10px_#c084fc]'
                    : currentMode === 'haevy_ai'
                    ? 'bg-purple-400 shadow-[0_0_10px_#c084fc]'
                    : currentMode === 'games'
                    ? 'bg-indigo-400 shadow-[0_0_10px_#818cf8]'
                    : (currentMode === 'morning' || currentMode === 'space')
                    ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]'
                    : currentMode === 'haevy_lite'
                    ? 'bg-purple-400 shadow-[0_0_10px_#c084fc]'
                    : 'bg-amber-400 shadow-[0_0_10px_#f59e0b]'
                }`} />
              )}

              <div className="relative">
                <Icon 
                  size={16} 
                  className={
                    isActive 
                      ? currentMode === 'finance' 
                        ? 'text-emerald-400' 
                        : currentMode === 'edu'
                        ? 'text-emerald-400'
                        : currentMode === 'couple' 
                        ? 'text-rose-400' 
                        : currentMode === 'studio'
                        ? 'text-purple-400'
                        : currentMode === 'haevy_ai'
                        ? 'text-purple-300'
                        : currentMode === 'games'
                        ? 'text-indigo-400'
                        : (currentMode === 'morning' || currentMode === 'space')
                        ? 'text-cyan-400'
                        : 'text-amber-400' 
                      : 'text-zinc-400'
                  } 
                />
                {'badge' in item && item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-emerald-500 text-zinc-950 font-black text-[9px] px-1 py-0.2 rounded-full min-w-[14px] text-center leading-tight shadow-md">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap ${
                isActive 
                  ? currentMode === 'finance' || currentMode === 'edu'
                    ? 'text-emerald-300 font-black' 
                    : 'text-white'
                  : 'text-zinc-400'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </footer>
  );
}
