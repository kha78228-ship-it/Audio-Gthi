import React, { useState } from 'react';
import {
  Bookmark,
  BookOpen,
  BrainCircuit,
  Calculator,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Coins,
  Compass,
  Crown,
  Disc3,
  Flame,
  FlaskConical,
  FolderHeart,
  Gamepad2,
  Gem,
  Gift,
  GitFork,
  Globe,
  GraduationCap,
  Headphones,
  Heart,
  Home,
  KeyRound,
  Library,
  MapPin,
  MessageSquare,
  Moon,
  Music,
  Newspaper,
  Orbit,
  PenLine,
  PieChart,
  Plus,
  Radio,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Sun,
  User as UserIcon,
  Users,
  Wallet,
  Zap
} from 'lucide-react';
import { ActiveTab, EcosystemMode, Track } from '../types';
import { useAuth } from '../context/AuthContext';
import { useModeBadges } from '../context/ModeBadgeContext';
import { CosmicAvatarFX } from './haevyLite/CosmicAvatarFX';

interface DesktopSidebarProps {
  currentMode: EcosystemMode;
  onSelectMode: (mode: EcosystemMode, initialTab?: ActiveTab) => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAuth: () => void;
  onOpenAnonPass?: () => void;
  onOpenStudioAudio?: (tab?: 'tts' | 'publish' | 'ekyc' | 'my-tracks') => void;
  onOpenVipHub?: () => void;
  allTracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onTogglePlay: () => void;
  financeSubTab?: string;
  onSelectFinanceSubTab?: (page: any) => void;
  eduSubTab?: string;
  onSelectEduSubTab?: (tab: any) => void;
  messageSubTab?: string;
  onSelectMessageSubTab?: (tab: any) => void;
  coupleSubTab?: string;
  onSelectCoupleSubTab?: (tab: any) => void;
  gamesSubTab?: string;
  onSelectGamesSubTab?: (tab: any) => void;
  haevyAISubTab?: string;
  onSelectHaevyAISubTab?: (tab: any) => void;
  familyTreeSubTab?: string;
  onSelectFamilyTreeSubTab?: (tab: any) => void;
  spiritualSubTab?: string;
  onSelectSpiritualSubTab?: (tab: any) => void;
  haevyLiteSubTab?: string;
  onSelectHaevyLiteSubTab?: (tab: any) => void;
  adminSubTab?: string;
  onSelectAdminSubTab?: (tab: any) => void;
  studioSubTab?: string;
  onSelectStudioSubTab?: (tab: any) => void;
  mapsSubTab?: string;
  onSelectMapsSubTab?: (tab: any) => void;
  spaceSubTab?: string;
  onSelectSpaceSubTab?: (tab: any) => void;
  vipSubTab?: string;
  onSelectVipSubTab?: (page: any) => void;
  internetSubTab?: string;
  onSelectInternetSubTab?: (tab: any) => void;
}

interface SidebarModeItem {
  id: EcosystemMode;
  label: string;
  icon: any;
  defaultTab: ActiveTab;
}

const SIDEBAR_GROUPS: Array<{
  title: string;
  items: SidebarModeItem[];
}> = [
  {
    title: 'Trọng tâm',
    items: [
      { id: 'portal', label: 'Cổng Trung Tâm', icon: Home, defaultTab: 'portal' },
      { id: 'haevy_ai', label: 'Haevy AI Master', icon: BrainCircuit, defaultTab: 'haevy_ai' },
      { id: 'internet', label: 'Haevy Internet', icon: Globe, defaultTab: 'internet' as any },
      { id: 'edu', label: 'Haevy Edu & STEM', icon: GraduationCap, defaultTab: 'edu' as any }
    ]
  },
  {
    title: 'Gia đình & Đời sống',
    items: [
      { id: 'maps', label: 'Haevy Maps GPS', icon: MapPin, defaultTab: 'maps' as any },
      { id: 'couple', label: 'I Love Haevy', icon: Heart, defaultTab: 'couple' },
      { id: 'family_tree', label: 'Gia Phả Dòng Tộc', icon: GitFork, defaultTab: 'family_tree' },
      { id: 'finance', label: 'Tài Chính 6 Hũ', icon: Wallet, defaultTab: 'finance' },
      { id: 'messages', label: 'Tin Nhắn & Bạn Bè', icon: MessageSquare, defaultTab: 'messages' }
    ]
  },
  {
    title: 'Sáng tạo & Thư giãn',
    items: [
      { id: 'audio', label: 'Haevy Audio Hi-Fi', icon: Headphones, defaultTab: 'home' },
      { id: 'studio', label: 'Phòng Thu AI', icon: Sparkles, defaultTab: 'studio' },
      { id: 'space', label: 'Không Gian 3D AR', icon: Compass, defaultTab: 'space' as any },
      { id: 'spiritual', label: 'Chiêm Nghiệm', icon: Moon, defaultTab: 'spiritual' },
      { id: 'games', label: 'Đấu Trường Game', icon: Gamepad2, defaultTab: 'games' }
    ]
  },
  {
    title: 'Tài khoản & Hệ thống',
    items: [
      { id: 'haevy_lite', label: 'Cửa Hàng Xu Lite', icon: Orbit, defaultTab: 'haevy_lite' as any },
      { id: 'vip', label: 'Hội Viên VIP', icon: Crown, defaultTab: 'vip' },
      { id: 'support', label: 'Trung Tâm Hỗ Trợ', icon: Headphones, defaultTab: 'support' },
      { id: 'admin', label: 'Quản Trị Hệ Thống', icon: ShieldCheck, defaultTab: 'admin' }
    ]
  }
];

export function DesktopSidebar({
  currentMode,
  onSelectMode,
  activeTab,
  onSelectTab,
  onOpenAuth,
  onOpenAnonPass,
  onOpenVipHub,
  allTracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  financeSubTab,
  onSelectFinanceSubTab,
  eduSubTab,
  onSelectEduSubTab,
  messageSubTab,
  onSelectMessageSubTab,
  coupleSubTab,
  onSelectCoupleSubTab,
  gamesSubTab,
  onSelectGamesSubTab,
  haevyAISubTab,
  onSelectHaevyAISubTab,
  familyTreeSubTab,
  onSelectFamilyTreeSubTab,
  spiritualSubTab,
  onSelectSpiritualSubTab,
  haevyLiteSubTab,
  onSelectHaevyLiteSubTab,
  adminSubTab,
  onSelectAdminSubTab,
  studioSubTab,
  onSelectStudioSubTab,
  mapsSubTab,
  onSelectMapsSubTab,
  spaceSubTab,
  onSelectSpaceSubTab,
  vipSubTab,
  onSelectVipSubTab,
  internetSubTab,
  onSelectInternetSubTab
}: DesktopSidebarProps) {
  const {
    user,
    isVip,
    audioPoints,
    favorites,
    userProfile,
    displayName: authDisplayName,
    photoURL: authPhotoURL
  } = useAuth();
  const { getBadgeForMode, markModeAsViewed } = useModeBadges();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');

  const effectiveDisplayName =
    userProfile?.displayName ||
    authDisplayName ||
    user?.displayName ||
    user?.email?.split('@')[0] ||
    'Thành Viên';
  const effectivePhotoURL = userProfile?.photoURL || authPhotoURL || user?.photoURL;

  const getSubTabs = () => {
    switch (currentMode) {
      case 'audio':
        return [
          { id: 'home' as ActiveTab, label: 'Khám Phá Nhạc', icon: Compass },
          { id: 'library' as ActiveTab, label: 'Kho Audio Lossless', icon: Library },
          { id: 'community' as ActiveTab, label: 'Thảo Luận Âm Nhạc', icon: Users },
          { id: 'player' as ActiveTab, label: 'Trình Phát Studio', icon: Disc3 },
          { id: 'vip' as ActiveTab, label: 'Hội Viên VIP', icon: Crown }
        ];
      case 'finance':
        return [
          { id: 'finance' as ActiveTab, subTabId: 'page1', label: '01. Tổng Quan Thu Chi', icon: Wallet },
          { id: 'finance' as ActiveTab, subTabId: 'page2', label: '02. Phân Bổ 6 Hũ', icon: PieChart },
          { id: 'finance' as ActiveTab, subTabId: 'page3', label: '03. Ghi Chép Giao Dịch', icon: Plus },
          { id: 'finance' as ActiveTab, subTabId: 'page4', label: '04. Quỹ Gia Đình', icon: Home },
          { id: 'finance' as ActiveTab, subTabId: 'page5', label: '05. Công Cụ Tính Lãi', icon: Calculator }
        ];
      case 'edu':
        return [
          { id: 'edu' as any, subTabId: 'workspace', label: '01. Bàn Học Tập Trung', icon: GraduationCap },
          { id: 'edu' as any, subTabId: 'sun_study', label: '02. Kỷ Luật & Xếp Hạng', icon: Sun },
          { id: 'edu' as any, subTabId: 'labs', label: '03. Phòng Lab 3D STEM', icon: FlaskConical },
          { id: 'edu' as any, subTabId: 'assistant', label: '04. AI Gia Sư Nguyên Lý', icon: BrainCircuit },
          { id: 'edu' as any, subTabId: 'tools', label: '05. Phòng Thi & Casio', icon: Calculator }
        ];
      case 'messages':
        return [
          { id: 'messages' as ActiveTab, subTabId: 'chat', label: 'Hộp Thư Trò Chuyện', icon: MessageSquare },
          { id: 'messages' as ActiveTab, subTabId: 'feed', label: 'Nhật Ký Khoảnh Khắc', icon: Sparkles },
          { id: 'messages' as ActiveTab, subTabId: 'friends', label: 'Danh Bạ Bạn Bè', icon: Users }
        ];
      case 'couple':
        return [
          { id: 'couple' as ActiveTab, subTabId: 'page1', label: '01. Hành Trình Yêu', icon: Heart },
          { id: 'couple' as ActiveTab, subTabId: 'page2', label: '02. Chu Kỳ & Chăm Sóc', icon: Calendar },
          { id: 'couple' as ActiveTab, subTabId: 'page3', label: '03. Lịch Hẹn & Kỷ Niệm', icon: BookOpen },
          { id: 'couple' as ActiveTab, subTabId: 'page4', label: '04. Hộp Thư Tình Yêu', icon: Sparkles }
        ];
      case 'haevy_ai':
        return [
          { id: 'haevy_ai' as ActiveTab, subTabId: 'chat', label: 'Đối Thoại Chuyên Sâu', icon: BrainCircuit },
          { id: 'haevy_ai' as ActiveTab, subTabId: 'overview', label: 'Tổng Quan Trí Tuệ', icon: Compass },
          { id: 'haevy_ai' as ActiveTab, subTabId: 'updates', label: 'Nhật Ký Hệ Thống', icon: Sparkles }
        ];
      case 'games':
        return [
          { id: 'games' as ActiveTab, subTabId: 'home', label: 'Sảnh Đấu Trường', icon: Gamepad2 },
          { id: 'games' as ActiveTab, subTabId: 'quests', label: 'Nhiệm Vụ Hằng Ngày', icon: Flame },
          { id: 'games' as ActiveTab, subTabId: 'leaderboard', label: 'Bảng Xếp Hạng', icon: Crown }
        ];
      case 'family_tree':
        return [
          { id: 'family_tree' as ActiveTab, subTabId: 'tree', label: 'Sơ Đồ Phả Hệ', icon: GitFork },
          { id: 'family_tree' as ActiveTab, subTabId: 'records', label: 'Gia Sử & Sắc Phong', icon: BookOpen },
          { id: 'family_tree' as ActiveTab, subTabId: 'anniversaries', label: 'Lịch Giỗ Tổ Tiên', icon: Calendar },
          { id: 'family_tree' as ActiveTab, subTabId: 'ancestors', label: 'Danh Mục Tiền Nhân', icon: Users }
        ];
      case 'spiritual':
        return [
          { id: 'spiritual' as ActiveTab, subTabId: 'tarot', label: 'Bài Tarot 3D', icon: Sparkles },
          { id: 'spiritual' as ActiveTab, subTabId: 'tuvi', label: 'Lá Số Tử Vi 2026', icon: Moon },
          { id: 'spiritual' as ActiveTab, subTabId: 'astrology', label: 'Bản Đồ Sao', icon: Compass },
          { id: 'spiritual' as ActiveTab, subTabId: 'soundscapes', label: 'Sóng Âm Thiền Định', icon: Radio }
        ];
      case 'haevy_lite':
        return [
          { id: 'haevy_lite' as ActiveTab, subTabId: 'shop', label: '01. Cửa Hàng Trang Bị', icon: ShoppingBag },
          { id: 'haevy_lite' as ActiveTab, subTabId: 'customize', label: '02. Tùy Chỉnh Hiệu Ứng', icon: SlidersHorizontal },
          { id: 'haevy_lite' as ActiveTab, subTabId: 'topup_and_ads', label: '03. Nạp Xu & Nhiệm Vụ', icon: Coins }
        ];
      case 'admin':
        return [
          { id: 'admin' as ActiveTab, subTabId: 'page1', label: 'Tổng Quan Máy Chủ', icon: ShieldCheck },
          { id: 'admin' as ActiveTab, subTabId: 'page2', label: 'Quản Lý Thành Viên', icon: Crown },
          { id: 'admin' as ActiveTab, subTabId: 'page3', label: 'Kiểm Duyệt Tác Giả', icon: ShieldCheck },
          { id: 'admin' as ActiveTab, subTabId: 'page4', label: 'Điều Phối Ngân Quỹ', icon: Coins }
        ];
      case 'studio':
        return [
          { id: 'studio' as ActiveTab, subTabId: 'page1', label: 'Bàn Trộn & Giọng AI', icon: Sparkles },
          { id: 'studio' as ActiveTab, subTabId: 'page2', label: 'Phòng Thu Trực Tiếp', icon: Radio },
          { id: 'studio' as ActiveTab, subTabId: 'page3', label: 'Tác Phẩm Đã Xuất Bản', icon: Library }
        ];
      case 'maps':
        return [
          { id: 'maps' as any, subTabId: 'all', label: 'Tất Cả Thành Viên', icon: MapPin },
          { id: 'maps' as any, subTabId: 'couple', label: 'Vị Trí Người Thương', icon: Heart },
          { id: 'maps' as any, subTabId: 'family', label: 'Vị Trí Gia Đình', icon: Home },
          { id: 'maps' as any, subTabId: 'zones', label: 'Vùng An Toàn & SOS', icon: ShieldCheck }
        ];
      case 'vip':
        return [
          { id: 'vip' as ActiveTab, subTabId: 'page1', label: '01. Đặc Quyền Hội Viên', icon: Crown },
          { id: 'vip' as ActiveTab, subTabId: 'page2', label: '02. Nâng Cấp Gói VIP', icon: Zap },
          { id: 'vip' as ActiveTab, subTabId: 'page3', label: '03. Nạp Xu Haevy', icon: Coins },
          { id: 'vip' as ActiveTab, subTabId: 'page4', label: '04. Quà Tặng Tri Ân', icon: Gift },
          { id: 'vip' as ActiveTab, subTabId: 'page5', label: '05. Đặc Quyền AI Pro', icon: BrainCircuit },
          { id: 'vip' as ActiveTab, subTabId: 'page6', label: '06. Phòng Hội Viên', icon: Gem }
        ];
      case 'internet':
        return [
          { id: 'internet' as any, subTabId: 'browser', label: '01. Trình Duyệt Đa Tab', icon: Globe },
          { id: 'internet' as any, subTabId: 'search', label: '02. Tìm Kiếm Nguyên Lý', icon: Search },
          { id: 'internet' as any, subTabId: 'bookmarks', label: '03. Dấu Trang Đã Lưu', icon: Bookmark },
          { id: 'internet' as any, subTabId: 'news', label: '04. Điểm Tin Chọn Lọc', icon: Newspaper },
          { id: 'internet' as any, subTabId: 'ai_reader', label: '05. Chế Độ Đọc Sạch', icon: BookOpen }
        ];
      case 'morning':
      case 'space':
        return [
          { id: 'space' as any, subTabId: 'morning_dashboard', label: 'Không Gian Buổi Sáng', icon: Sun },
          { id: 'space' as any, subTabId: 'portal', label: 'Cổng Không Gian 3D', icon: Sparkles },
          { id: 'space' as any, subTabId: 'canvas', label: 'Bảng Vẽ Chiều Sâu', icon: PenLine },
          { id: 'space' as any, subTabId: 'mascot', label: 'Linh Vật Tương Tác', icon: Flame },
          { id: 'space' as any, subTabId: 'magic_ar', label: 'Cử Chỉ Tay Camera AR', icon: Zap }
        ];
      default:
        return [];
    }
  };

  const handleSubTabClick = (tab: any) => {
    if (currentMode === 'finance') {
      if (tab.id === 'vip') {
        onSelectTab('vip');
      } else {
        onSelectTab('finance' as ActiveTab);
        if (onSelectFinanceSubTab && tab.subTabId) onSelectFinanceSubTab(tab.subTabId);
      }
    } else if (currentMode === 'edu') {
      onSelectTab('edu' as any);
      if (onSelectEduSubTab && tab.subTabId) onSelectEduSubTab(tab.subTabId);
    } else if (currentMode === 'messages') {
      onSelectTab('messages' as any);
      if (onSelectMessageSubTab && tab.subTabId) onSelectMessageSubTab(tab.subTabId);
    } else if (currentMode === 'couple') {
      onSelectTab('couple' as any);
      if (onSelectCoupleSubTab && tab.subTabId) onSelectCoupleSubTab(tab.subTabId);
    } else if (currentMode === 'games') {
      onSelectTab('games' as any);
      if (onSelectGamesSubTab && tab.subTabId) onSelectGamesSubTab(tab.subTabId);
    } else if (currentMode === 'haevy_ai') {
      onSelectTab('haevy_ai' as any);
      if (onSelectHaevyAISubTab && tab.subTabId) onSelectHaevyAISubTab(tab.subTabId);
    } else if (currentMode === 'family_tree') {
      onSelectTab('family_tree' as any);
      if (onSelectFamilyTreeSubTab && tab.subTabId) onSelectFamilyTreeSubTab(tab.subTabId);
    } else if (currentMode === 'spiritual') {
      onSelectTab('spiritual' as any);
      if (onSelectSpiritualSubTab && tab.subTabId) onSelectSpiritualSubTab(tab.subTabId);
    } else if (currentMode === 'haevy_lite') {
      onSelectTab('haevy_lite' as any);
      if (onSelectHaevyLiteSubTab && tab.subTabId) onSelectHaevyLiteSubTab(tab.subTabId);
    } else if (currentMode === 'admin') {
      onSelectTab('admin' as any);
      if (onSelectAdminSubTab && tab.subTabId) onSelectAdminSubTab(tab.subTabId);
    } else if (currentMode === 'studio') {
      onSelectTab('studio' as any);
      if (onSelectStudioSubTab && tab.subTabId) onSelectStudioSubTab(tab.subTabId);
    } else if (currentMode === 'maps') {
      onSelectTab('maps' as any);
      if (onSelectMapsSubTab && tab.subTabId) onSelectMapsSubTab(tab.subTabId);
    } else if (currentMode === 'space' || currentMode === 'morning') {
      onSelectTab('space' as any);
      if (onSelectSpaceSubTab && tab.subTabId) onSelectSpaceSubTab(tab.subTabId);
    } else if (currentMode === 'vip') {
      onSelectTab('vip' as any);
      if (onSelectVipSubTab && tab.subTabId) onSelectVipSubTab(tab.subTabId);
    } else if (currentMode === 'internet') {
      onSelectTab('internet' as any);
      if (onSelectInternetSubTab && tab.subTabId) onSelectInternetSubTab(tab.subTabId);
    } else {
      onSelectTab(tab.id);
    }
  };

  const subTabs = getSubTabs();

  const favoriteTracks = allTracks.filter((t) => favorites.includes(t.id)).slice(0, 5);
  const filteredQuickTracks = sidebarSearch.trim()
    ? allTracks
        .filter(
          (t) =>
            t.title.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
            t.artist.toLowerCase().includes(sidebarSearch.toLowerCase())
        )
        .slice(0, 6)
    : favoriteTracks.length > 0
    ? favoriteTracks
    : allTracks.slice(0, 5);

  return (
    <aside
      id="desktop-pro-sidebar"
      className={`flex flex-col shrink-0 bg-[#0b0c10] border-r border-white/7 transition-all duration-200 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-60 xl:w-64'
      }`}
      style={{ height: 'calc(100vh - 3.25rem)', position: 'sticky', top: '3.25rem' }}
    >
      {/* Top Rail Header */}
      <div className="px-3.5 py-3 border-b border-white/7 flex items-center justify-between gap-2">
        {!isCollapsed && (
          <span className="text-xs font-medium text-zinc-400 truncate">
            Không gian làm việc
          </span>
        )}
        <button
          type="button"
          id="collapse-sidebar-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-7 h-7 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/8 flex items-center justify-center transition-colors cursor-pointer ml-auto"
          title={isCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Scrollable Navigation Body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-5 custom-scrollbar">
        {/* Contextual Sub-Navigation when inside a specific subsystem */}
        {subTabs.length > 0 && (
          <div className="pb-3 border-b border-white/7">
            {!isCollapsed && (
              <div className="px-2.5 mb-1.5 text-[11px] font-medium text-amber-300/90">
                Mục đang mở
              </div>
            )}
            <div className="space-y-0.5">
              {subTabs.map((tab) => {
                const TabIcon = tab.icon;
                const isTabActive = (() => {
                  if (currentMode === 'finance') {
                    if (tab.id === 'vip') return activeTab === 'vip';
                    return financeSubTab
                      ? tab.subTabId === financeSubTab
                      : tab.subTabId === 'page1' && activeTab === 'finance';
                  }
                  if (currentMode === 'edu') {
                    return eduSubTab ? tab.subTabId === eduSubTab : tab.subTabId === 'workspace';
                  }
                  if (currentMode === 'messages') {
                    return messageSubTab ? tab.subTabId === messageSubTab : tab.id === activeTab;
                  }
                  if (currentMode === 'couple') {
                    return coupleSubTab ? tab.subTabId === coupleSubTab : tab.id === activeTab;
                  }
                  if (currentMode === 'games') {
                    return gamesSubTab ? tab.subTabId === gamesSubTab : tab.id === activeTab;
                  }
                  if (currentMode === 'haevy_ai') {
                    return haevyAISubTab ? tab.subTabId === haevyAISubTab : tab.id === activeTab;
                  }
                  if (currentMode === 'family_tree') {
                    return familyTreeSubTab
                      ? tab.subTabId === familyTreeSubTab
                      : tab.id === activeTab;
                  }
                  if (currentMode === 'spiritual') {
                    return spiritualSubTab ? tab.subTabId === spiritualSubTab : tab.id === activeTab;
                  }
                  if (currentMode === 'haevy_lite') {
                    return haevyLiteSubTab ? tab.subTabId === haevyLiteSubTab : tab.id === activeTab;
                  }
                  if (currentMode === 'admin') {
                    return adminSubTab ? tab.subTabId === adminSubTab : tab.id === activeTab;
                  }
                  if (currentMode === 'studio') {
                    return studioSubTab ? tab.subTabId === studioSubTab : tab.id === activeTab;
                  }
                  if (currentMode === 'maps') {
                    return mapsSubTab ? tab.subTabId === mapsSubTab : tab.subTabId === 'all';
                  }
                  if (currentMode === 'space' || currentMode === 'morning') {
                    return spaceSubTab ? tab.subTabId === spaceSubTab : tab.subTabId === 'portal';
                  }
                  if (currentMode === 'vip') {
                    return vipSubTab ? tab.subTabId === vipSubTab : tab.subTabId === 'page1';
                  }
                  if (currentMode === 'internet') {
                    return internetSubTab
                      ? tab.subTabId === internetSubTab
                      : tab.subTabId === 'browser';
                  }
                  return activeTab === tab.id;
                })();

                return (
                  <button
                    key={`${tab.id}-${tab.subTabId || ''}`}
                    type="button"
                    onClick={() => handleSubTabClick(tab)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      isTabActive
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/4'
                    }`}
                    title={tab.label}
                  >
                    <TabIcon
                      size={15}
                      className={isTabActive ? 'text-amber-300 shrink-0' : 'text-zinc-500 shrink-0'}
                    />
                    {!isCollapsed && <span className="truncate">{tab.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Categorized Ecosystem Navigation Groups */}
        {SIDEBAR_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 text-[11px] font-medium text-zinc-500">{group.title}</div>
            )}
            <div className="space-y-0.5">
              {group.items.map((mode) => {
                const Icon = mode.icon;
                const isActive =
                  currentMode === mode.id ||
                  (mode.id === 'space' && currentMode === 'morning');
                const unreadCount = getBadgeForMode(mode.id);

                return (
                  <button
                    key={mode.id}
                    type="button"
                    id={`sidebar-mode-${mode.id}`}
                    onClick={() => {
                      markModeAsViewed(mode.id, mode.defaultTab);
                      onSelectMode(mode.id, mode.defaultTab);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors text-left cursor-pointer group ${
                      isActive
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/4'
                    }`}
                    title={mode.label}
                  >
                    <Icon
                      size={16}
                      className={`shrink-0 transition-colors ${
                        isActive ? 'text-amber-300' : 'text-zinc-500 group-hover:text-zinc-300'
                      }`}
                    />
                    {!isCollapsed && (
                      <div className="min-w-0 flex-1 flex items-center justify-between gap-1.5">
                        <span className="truncate">{mode.label}</span>
                        {unreadCount > 0 && (
                          <span className="font-mono-tabular text-[10px] text-amber-300">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Quick Audio Queue (Only when expanded) */}
        {!isCollapsed && (
          <div className="pt-3 border-t border-white/7">
            <div className="px-2.5 mb-2 flex items-center justify-between text-[11px] text-zinc-500">
              <span className="font-medium">
                {favorites.length > 0 ? 'Bản âm yêu thích' : 'Gợi ý nghe nhanh'}
              </span>
              <span className="font-mono-tabular">{filteredQuickTracks.length}</span>
            </div>

            <div className="px-1.5 mb-2">
              <div className="relative">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  type="text"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="Lọc nhanh bản âm..."
                  className="w-full bg-zinc-900/70 border border-white/7 rounded-lg pl-7 pr-2.5 py-1 text-[11px] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white/20"
                />
              </div>
            </div>

            <div className="space-y-0.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
              {filteredQuickTracks.map((t) => {
                const isCurrent = currentTrack?.id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onPlayTrack(t)}
                    className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                      isCurrent ? 'bg-white/10 text-white' : 'hover:bg-white/4 text-zinc-300'
                    }`}
                  >
                    <div className="w-6 h-6 rounded bg-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                      {t.coverUrl ? (
                        <img
                          src={t.coverUrl}
                          alt={t.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music size={11} className="text-zinc-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-medium truncate">{t.title}</div>
                      <div className="text-[10px] text-zinc-500 truncate">{t.artist}</div>
                    </div>
                    {isCurrent && isPlaying && (
                      <span className="text-[10px] font-mono-tabular text-amber-300 shrink-0">
                        Đang phát
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-2.5 border-t border-white/7 bg-[#090a0d]">
        {!isCollapsed ? (
          user ? (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onSelectTab('profile')}
                className="flex-1 min-w-0 flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors text-left cursor-pointer"
                title="Mở hồ sơ cá nhân"
              >
                <CosmicAvatarFX
                  photoURL={effectivePhotoURL}
                  displayName={effectiveDisplayName}
                  isVip={isVip}
                  size="xxs"
                  showBadge={false}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-zinc-200 truncate">
                    {effectiveDisplayName}
                  </div>
                  <div className="text-[10px] font-mono-tabular text-zinc-400">
                    {audioPoints.toLocaleString('vi-VN')} Xu
                  </div>
                </div>
              </button>

              {onOpenVipHub && !isVip && (
                <button
                  type="button"
                  onClick={onOpenVipHub}
                  className="px-2.5 py-1.5 rounded-lg bg-white/8 hover:bg-white/14 text-amber-300 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Nâng VIP
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="sidebar-signin-btn"
                onClick={onOpenAuth}
                className="flex-1 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition-colors cursor-pointer text-center whitespace-nowrap"
              >
                Đăng nhập
              </button>
              {onOpenAnonPass && (
                <button
                  type="button"
                  id="sidebar-anon-btn"
                  onClick={onOpenAnonPass}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/8 transition-colors cursor-pointer"
                  title="Nhập mã thẻ VIP"
                >
                  <KeyRound size={14} />
                </button>
              )}
            </div>
          )
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              id="sidebar-collapsed-profile-btn"
              onClick={() => onSelectTab('profile')}
              className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/8 flex items-center justify-center transition-colors cursor-pointer"
              title="Hồ sơ cá nhân"
            >
              <UserIcon size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
