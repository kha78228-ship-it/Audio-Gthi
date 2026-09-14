import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Library, 
  Users, 
  MessageSquare, 
  Heart, 
  Wallet, 
  ShieldCheck, 
  Sparkles, 
  Gamepad2, 
  Crown, 
  Headphones, 
  Disc3, 
  Radio, 
  ChevronRight, 
  Search, 
  Plus, 
  Flame, 
  Coins, 
  Sliders, 
  User as UserIcon, 
  KeyRound, 
  Music, 
  TrendingUp, 
  Clock, 
  ExternalLink,
  ChevronLeft,
  Volume2,
  FolderHeart,
  Zap,
  ListMusic,
  BrainCircuit,
  GitFork,
  Orbit,
  Moon,
  GraduationCap
} from 'lucide-react';
import { ActiveTab, EcosystemMode, Track } from '../types';
import { useAuth } from '../context/AuthContext';
import { useModeBadges } from '../context/ModeBadgeContext';
import { HaevySpaceLogo } from './HaevySpaceLogo';
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
}

export function DesktopSidebar({
  currentMode,
  onSelectMode,
  activeTab,
  onSelectTab,
  onOpenAuth,
  onOpenAnonPass,
  onOpenStudioAudio,
  onOpenVipHub,
  allTracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onTogglePlay
}: DesktopSidebarProps) {
  const { 
    user, 
    isVip, 
    isAuthorVerified, 
    isAdmin, 
    audioPoints, 
    favorites,
    userProfile,
    displayName: authDisplayName,
    photoURL: authPhotoURL
  } = useAuth();
  const { getBadgeForMode, markModeAsViewed } = useModeBadges();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');

  const effectiveDisplayName = userProfile?.displayName || authDisplayName || user?.displayName || user?.email?.split('@')[0] || 'Thành Viên';
  const effectivePhotoURL = userProfile?.photoURL || authPhotoURL || user?.photoURL;

  // Primary Ecosystem Modes Navigation
  const ecosystemModes: Array<{
    id: EcosystemMode;
    label: string;
    subLabel: string;
    icon: any;
    colorClass: string;
    activeBg: string;
    defaultTab: ActiveTab;
    badge?: string;
  }> = [
    {
      id: 'portal',
      label: 'Hệ Sinh Thái Hub',
      subLabel: 'Trang chủ & Tổng hợp',
      icon: Sparkles,
      colorClass: 'text-amber-400',
      activeBg: 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold',
      defaultTab: 'portal',
      badge: 'Hub'
    },
    {
      id: 'haevy_ai',
      label: 'Haevy AI Master',
      subLabel: 'Tâm sự & Thông tin cập nhật',
      icon: BrainCircuit,
      colorClass: 'text-purple-400',
      activeBg: 'bg-purple-500/20 border-purple-500/50 text-purple-300 font-bold shadow-lg shadow-purple-900/30',
      defaultTab: 'haevy_ai',
      badge: 'AI Pro'
    },
    {
      id: 'audio',
      label: 'Haevy Audio',
      subLabel: 'Âm nhạc & Podcast Lossless',
      icon: Headphones,
      colorClass: 'text-amber-400',
      activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
      defaultTab: 'home',
      badge: 'Hi-Fi'
    },
    {
      id: 'messages',
      label: 'Haevy Message',
      subLabel: 'Tin nhắn & Bạn bè trực tuyến',
      icon: MessageSquare,
      colorClass: 'text-sky-400',
      activeBg: 'bg-sky-500/15 border-sky-500/40 text-sky-300',
      defaultTab: 'messages'
    },
    {
      id: 'couple',
      label: 'I Love Haevy',
      subLabel: 'Không gian tình nhân & Kỷ niệm',
      icon: Heart,
      colorClass: 'text-rose-400',
      activeBg: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
      defaultTab: 'couple',
      badge: 'Love'
    },
    {
      id: 'finance',
      label: 'Haevy Finance',
      subLabel: 'Sổ thu chi & Ví tiết kiệm',
      icon: Wallet,
      colorClass: 'text-emerald-400',
      activeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
      defaultTab: 'finance'
    },
    {
      id: 'studio',
      label: 'Haevy Studio',
      subLabel: 'Giọng đọc AI & Thu âm',
      icon: Sparkles,
      colorClass: 'text-purple-400',
      activeBg: 'bg-purple-500/15 border-purple-500/40 text-purple-300',
      defaultTab: 'studio',
      badge: 'AI'
    },
    {
      id: 'games',
      label: 'Haevy Games',
      subLabel: 'Game Center & Vòng quay',
      icon: Gamepad2,
      colorClass: 'text-indigo-400',
      activeBg: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300',
      defaultTab: 'games'
    },
    {
      id: 'morning',
      label: 'Haevy Space 🌌',
      subLabel: '3D Hologram & Air Studio',
      icon: Sparkles,
      colorClass: 'text-cyan-400',
      activeBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
      defaultTab: 'morning',
      badge: '3D'
    },
    {
      id: 'spiritual',
      label: 'Haevy Spiritual 🔮',
      subLabel: 'Tarot, Tử Vi 2026 & Chiêm Tinh',
      icon: Sparkles,
      colorClass: 'text-purple-400',
      activeBg: 'bg-purple-500/20 border-purple-500/50 text-purple-300 font-bold',
      defaultTab: 'spiritual',
      badge: 'Tâm Linh'
    },
    {
      id: 'family_tree',
      label: 'Haevy Family Tree 👑',
      subLabel: 'Cây Phả Hệ & Lịch Giỗ Dòng Tộc',
      icon: GitFork,
      colorClass: 'text-amber-400',
      activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold',
      defaultTab: 'family_tree',
      badge: 'Gia Phả'
    },
    {
      id: 'haevy_lite',
      label: 'Xu Haevy Lite ✨',
      subLabel: 'Combo Vũ Trụ & Hoạt Ảnh Động',
      icon: Orbit,
      colorClass: 'text-purple-400',
      activeBg: 'bg-purple-500/20 border-purple-500/50 text-purple-300 font-bold shadow-lg shadow-purple-900/30',
      defaultTab: 'haevy_lite' as any,
      badge: 'Xu Lite'
    },
    {
      id: 'edu',
      label: 'Haevy Edu 🎓',
      subLabel: 'Lab ảo & Lộ trình học tập',
      icon: GraduationCap,
      colorClass: 'text-emerald-400',
      activeBg: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold shadow-lg shadow-emerald-900/30',
      defaultTab: 'edu' as any,
      badge: 'STEM'
    },
    {
      id: 'vip',
      label: 'Haevy VIP Hub',
      subLabel: 'Đặc quyền thành viên & Nạp xu',
      icon: Crown,
      colorClass: 'text-amber-400',
      activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
      defaultTab: 'vip',
      badge: 'VIP'
    },
    {
      id: 'support',
      label: 'Haevy Hỗ Trợ',
      subLabel: 'Trung tâm trợ giúp & CSKH',
      icon: Headphones,
      colorClass: 'text-teal-400',
      activeBg: 'bg-teal-500/15 border-teal-500/40 text-teal-300',
      defaultTab: 'support'
    },
    {
      id: 'admin',
      label: 'Haevy Quản Trị',
      subLabel: 'Bảng điều khiển hệ thống',
      icon: ShieldCheck,
      colorClass: 'text-amber-400',
      activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
      defaultTab: 'admin'
    }
  ];

  // Quick Navigation Tabs for the Current Selected Mode
  const getSubTabs = () => {
    switch (currentMode) {
      case 'audio':
        return [
          { id: 'home' as ActiveTab, label: 'Khám Phá Nhạc', icon: Compass },
          { id: 'library' as ActiveTab, label: 'Kho Audio Lossless', icon: Library },
          { id: 'community' as ActiveTab, label: 'Thảo Luận Âm Nhạc', icon: Users },
          { id: 'player' as ActiveTab, label: 'Trình Phát Studio', icon: Disc3 },
          { id: 'vip' as ActiveTab, label: 'Nâng Cấp VIP Hub', icon: Crown }
        ];
      case 'messages':
        return [
          { id: 'messages' as ActiveTab, label: 'Tin Nhắn & Bạn Bè', icon: MessageSquare },
          { id: 'community' as ActiveTab, label: 'Cộng Đồng Chung', icon: Users }
        ];
      case 'couple':
        return [
          { id: 'couple' as ActiveTab, label: 'Không Gian Tình Yêu', icon: Heart },
          { id: 'library' as ActiveTab, label: 'Kho Nhạc Kỷ Niệm', icon: Disc3 }
        ];
      case 'finance':
        return [
          { id: 'finance' as ActiveTab, label: 'Sổ Sách & Thu Chi', icon: Wallet },
          { id: 'vip' as ActiveTab, label: 'Điểm Thưởng & Nạp VIP', icon: Coins }
        ];
      case 'studio':
        return [
          { id: 'studio' as ActiveTab, label: 'Bàn Trộn & Giọng Nói AI', icon: Sparkles },
          { id: 'library' as ActiveTab, label: 'Kho Nhạc Tác Quyền', icon: Library }
        ];
      case 'games':
        return [
          { id: 'games' as ActiveTab, label: 'Game Center & Mini Games', icon: Gamepad2 }
        ];
      case 'vip':
        return [
          { id: 'vip' as ActiveTab, label: 'Gói Hội Viên VIP', icon: Crown },
          { id: 'profile' as ActiveTab, label: 'Hồ Sơ & Ví Điểm', icon: UserIcon }
        ];
      case 'admin':
        return [
          { id: 'admin' as ActiveTab, label: 'Admin Dashboard', icon: ShieldCheck },
          { id: 'library' as ActiveTab, label: 'Quản Lý Audio', icon: Library }
        ];
      case 'haevy_ai':
        return [
          { id: 'haevy_ai' as ActiveTab, label: 'Haevy AI Master Hub', icon: BrainCircuit }
        ];
      case 'spiritual':
        return [
          { id: 'spiritual' as ActiveTab, label: 'Tâm Linh & Tử Vi 2026', icon: Moon }
        ];
      case 'support':
        return [
          { id: 'support' as ActiveTab, label: 'Trung Tâm Hỗ Trợ', icon: Headphones }
        ];
      case 'morning':
      case 'space':
        return [
          { id: 'morning' as ActiveTab, label: 'Không Gian 3D Air Studio', icon: Sparkles }
        ];
      case 'family_tree':
        return [
          { id: 'family_tree' as ActiveTab, label: 'Gia Phả Dòng Họ', icon: GitFork }
        ];
      case 'haevy_lite':
        return [
          { id: 'haevy_lite' as ActiveTab, label: 'Combo Vũ Trụ', icon: Orbit },
          { id: 'vip' as ActiveTab, label: 'Nạp VIP', icon: Crown }
        ];
      default:
        return [
          { id: 'home' as ActiveTab, label: 'Trang Chủ', icon: Compass },
          { id: 'library' as ActiveTab, label: 'Kho Audio', icon: Library }
        ];
    }
  };

  const subTabs = getSubTabs();

  // Favorite / Quick Tracks
  const favoriteTracks = allTracks.filter(t => favorites.includes(t.id)).slice(0, 6);
  const filteredQuickTracks = sidebarSearch.trim()
    ? allTracks.filter(t => 
        t.title.toLowerCase().includes(sidebarSearch.toLowerCase()) || 
        t.artist.toLowerCase().includes(sidebarSearch.toLowerCase())
      ).slice(0, 8)
    : favoriteTracks.length > 0 
      ? favoriteTracks 
      : allTracks.slice(0, 6);

  return (
    <aside 
      id="desktop-pro-sidebar"
      className={`hidden lg:flex flex-col shrink-0 bg-zinc-950/90 backdrop-blur-xl border-r border-zinc-800/80 transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-72 xl:w-80'
      }`}
      style={{ height: 'calc(100vh - 2rem)', position: 'sticky', top: '1rem' }}
    >
      {/* Sidebar Header & Toggle */}
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between gap-2">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-[1px] shadow-md shadow-amber-500/20">
              <div className="w-full h-full bg-zinc-950 rounded-xl flex items-center justify-center">
                <Music size={16} className="text-amber-400" />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                Haevy Universe
                <span className="text-[9px] bg-amber-500/20 text-amber-300 font-black px-1.5 py-0.2 rounded border border-amber-500/30">
                  DESKTOP
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400 truncate max-w-[140px]">
                Hệ Sinh Thái Đa Tiện Ích
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          id="collapse-sidebar-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer ml-auto"
          title={isCollapsed ? 'Mở rộng thanh menu (Desktop)' : 'Thu gọn thanh menu'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Scrollable Navigation Body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-5 custom-scrollbar">
        {/* SECTION 1: 6 ECOSYSTEM MODES */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Hệ Sinh Thái
              </span>
              <span className="text-[10px] text-zinc-600 font-mono">7 Không Gian</span>
            </div>
          )}

          <div className="space-y-1">
            {ecosystemModes.map((mode) => {
              const Icon = mode.icon;
              const isActive = currentMode === mode.id;
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all text-left cursor-pointer group border ${
                    isActive
                      ? `${mode.activeBg} font-bold shadow-lg shadow-black/40`
                      : 'border-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 hover:border-zinc-800/80'
                  }`}
                  title={`${mode.label}${unreadCount > 0 ? ` (${unreadCount} thông báo mới)` : ''}`}
                >
                  <div className={`relative p-1.5 rounded-xl transition-transform group-hover:scale-110 ${
                    isActive ? 'bg-black/30' : 'bg-zinc-900 border border-zinc-800'
                  }`}>
                    {mode.id === 'morning' ? (
                      <HaevySpaceLogo variant="icon" size="sm" animated={isActive} />
                    ) : (
                      <Icon size={18} className={mode.colorClass} />
                    )}
                    {unreadCount > 0 && isCollapsed && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-lg shadow-rose-500/50 border border-zinc-950 animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>

                  {!isCollapsed && (
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate flex items-center justify-between gap-1">
                        <span className="truncate">{mode.label}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white shadow-md shadow-rose-500/40 animate-pulse">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-500 truncate group-hover:text-zinc-400 transition-colors">
                        {mode.subLabel}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: SUB-NAVIGATION OF CURRENT MODE */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Menu Chức Năng
              </span>
            </div>
          )}

          <div className="space-y-1">
            {subTabs.map((tab) => {
              const TabIcon = tab.icon;
              const isTabActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  id={`sidebar-tab-${tab.id}`}
                  onClick={() => onSelectTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    isTabActive
                      ? 'bg-zinc-800 text-white border-zinc-700 shadow-sm'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                  title={tab.label}
                >
                  <TabIcon size={16} className={isTabActive ? 'text-amber-400' : 'text-zinc-500'} />
                  {!isCollapsed && <span className="truncate">{tab.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: QUICK DESKTOP PLAYLIST / FAVORITES */}
        {!isCollapsed && (
          <div className="pt-2 border-t border-zinc-800/80">
            <div className="px-2 mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <FolderHeart size={13} className="text-amber-400" />
                <span>{favorites.length > 0 ? 'Nhạc Yêu Thích & Gợi Ý' : 'Khám Phá Nhanh'}</span>
              </div>
              <span className="text-[10px] text-zinc-600 font-mono">
                {filteredQuickTracks.length} tracks
              </span>
            </div>

            {/* Micro search in sidebar */}
            <div className="px-1 mb-2">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="Tìm nhanh bài hát..."
                  className="w-full bg-zinc-900/80 border border-zinc-800/80 rounded-xl pl-7 pr-2.5 py-1 text-[11px] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            {/* Quick Tracks List */}
            <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {filteredQuickTracks.map((t) => {
                const isCurrent = currentTrack?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => onPlayTrack(t)}
                    className={`flex items-center gap-2 p-1.5 rounded-xl cursor-pointer transition-all group ${
                      isCurrent 
                        ? 'bg-amber-500/10 border border-amber-500/30' 
                        : 'hover:bg-zinc-900 border border-transparent'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg overflow-hidden bg-zinc-800 shrink-0 relative">
                      {t.coverUrl ? (
                        <img src={t.coverUrl} alt={t.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                          <Music size={12} />
                        </div>
                      )}
                      {isCurrent && isPlaying && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h5 className={`text-[11px] font-bold truncate ${
                        isCurrent ? 'text-amber-300' : 'text-zinc-300 group-hover:text-white'
                      }`}>
                        {t.title}
                      </h5>
                      <p className="text-[9px] text-zinc-500 truncate">{t.artist}</p>
                    </div>

                    {t.isVipOnly && (
                      <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-extrabold shrink-0">
                        VIP
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer: User Status & VIP Topup */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60">
        {!isCollapsed ? (
          <div className="space-y-2">
            {user ? (
              <div 
                onClick={() => onSelectTab('profile')}
                className="flex items-center gap-2.5 p-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-all cursor-pointer group"
                title="Bấm để xem hồ sơ cá nhân"
              >
                <div className="shrink-0">
                  <CosmicAvatarFX
                    photoURL={effectivePhotoURL}
                    displayName={effectiveDisplayName}
                    isVip={isVip}
                    size="xs"
                    showBadge={false}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                      {effectiveDisplayName}
                    </span>
                    {isVip && (
                      <Crown size={12} className="text-amber-400 fill-amber-400 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-400/90 font-mono">
                    <Coins size={10} />
                    <span>{audioPoints.toLocaleString('vi-VN')} điểm</span>
                  </div>
                </div>

                <ChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-400" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="sidebar-signin-btn"
                  onClick={onOpenAuth}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 text-black text-xs font-extrabold transition-all shadow-md cursor-pointer text-center"
                >
                  Đăng Nhập
                </button>
                {onOpenAnonPass && (
                  <button
                    type="button"
                    id="sidebar-anon-btn"
                    onClick={onOpenAnonPass}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-800 transition-all cursor-pointer"
                    title="Nhập mã thẻ VIP"
                  >
                    <KeyRound size={15} />
                  </button>
                )}
              </div>
            )}

            {/* Quick VIP Topup Promo */}
            {onOpenVipHub && !isVip && (
              <div 
                onClick={onOpenVipHub}
                className="p-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 flex items-center justify-between cursor-pointer hover:border-amber-500/40 transition-all"
                title="Mở gói nâng cấp Studio Lossless"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                  <Crown size={13} className="text-amber-400 fill-amber-400 animate-bounce" />
                  <span>Nâng VIP Studio</span>
                </div>
                <span className="text-[9px] bg-amber-500 text-black font-extrabold px-1.5 py-0.2 rounded">
                  24-bit Hi-Fi
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              id="sidebar-collapsed-profile-btn"
              onClick={() => onSelectTab('profile')}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 transition-colors cursor-pointer"
              title="Hồ sơ tài khoản"
            >
              <UserIcon size={18} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
