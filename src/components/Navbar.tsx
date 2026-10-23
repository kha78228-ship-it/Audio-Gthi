import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  ChevronDown,
  Coins,
  Command,
  Compass,
  Crown,
  Gamepad2,
  GitFork,
  Globe,
  GraduationCap,
  Headphones,
  Heart,
  Layers,
  Library,
  LogIn,
  MapPin,
  Maximize,
  MessageSquare,
  Mic,
  Minimize,
  Orbit,
  Search,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  Users,
  Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calculateLevelFromExp } from '../data/levelMilestones';
import { useModeBadges } from '../context/ModeBadgeContext';
import { ActiveTab, EcosystemMode, Track } from '../types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { HaevyUserDropdownMenu } from './HaevyUserDropdownMenu';
import { CosmicAvatarFX } from './haevyLite/CosmicAvatarFX';
import { haptics } from '../utils/haptics';

const HaevyAllModesInfoModal = React.lazy(() =>
  import('./HaevyAllModesInfoModal').then((m) => ({ default: m.HaevyAllModesInfoModal }))
);
const NotificationsModal = React.lazy(() =>
  import('./NotificationsModal').then((m) => ({ default: m.NotificationsModal }))
);
const GoogleOmnibarModal = React.lazy(() =>
  import('./common/GoogleOmnibarModal').then((m) => ({ default: m.GoogleOmnibarModal }))
);

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

const MODE_LABELS: Record<string, string> = {
  portal: 'Cổng Trung Tâm',
  haevy_ai: 'Haevy AI',
  internet: 'Haevy Internet',
  edu: 'Haevy Edu',
  maps: 'Haevy Maps',
  audio: 'Haevy Audio',
  audio_library: 'Kho Audio',
  finance: 'Haevy Finance',
  couple: 'I Love Haevy',
  family_tree: 'Gia Phả',
  spiritual: 'Chiêm Nghiệm',
  messages: 'Tin Nhắn',
  studio: 'Phòng Thu AI',
  games: 'Đấu Trường',
  haevy_lite: 'Xu Lite',
  vip: 'Hội Viên VIP',
  space: 'Không Gian 3D',
  morning: 'Buổi Sáng',
  profile: 'Hồ Sơ',
  support: 'Hỗ Trợ',
  admin: 'Quản Trị'
};

export function Navbar({
  currentMode,
  onSelectMode,
  onOpenEcosystemDrawer,
  activeTab,
  onSelectTab,
  onOpenAuth,
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
    isVip,
    isAuthorVerified,
    audioPoints,
    systemAnnouncements,
    userProfile,
    displayName: authDisplayName,
    photoURL: authPhotoURL,
    levelExp = 0
  } = useAuth();

  const levelState = calculateLevelFromExp(levelExp);
  const effectiveDisplayName =
    userProfile?.displayName ||
    authDisplayName ||
    user?.displayName ||
    (user?.email ? user.email.split('@')[0] : 'Thành viên');
  const effectivePhotoURL = userProfile?.photoURL || authPhotoURL || user?.photoURL || null;

  const { totalBadgesCount } = useModeBadges();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEcosystemDrawerOpen, setIsEcosystemDrawerOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isOmnibarOpen, setIsOmnibarOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [pendingFriendCount, setPendingFriendCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOmnibarOpen((prev) => !prev);
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

  useEffect(() => {
    if (!user) {
      setUnreadMessagesCount(0);
      return;
    }
    const qConv = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );
    const unsubConv = onSnapshot(
      qConv,
      (snap) => {
        let total = 0;
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.unreadCounts && data.unreadCounts[user.uid]) {
            total += data.unreadCounts[user.uid] || 0;
          }
        });
        setUnreadMessagesCount(total);
      },
      () => {}
    );
    return () => unsubConv();
  }, [user]);

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
    const unsubReq = onSnapshot(
      qReq,
      (snap) => {
        setPendingFriendCount(snap.size);
      },
      () => {}
    );
    return () => unsubReq();
  }, [user]);

  const getUnreadAnnouncementsCount = () => {
    try {
      const stored = localStorage.getItem(`haevy_read_announcements_${user?.uid || 'guest'}`);
      const readIds: string[] = stored ? JSON.parse(stored) : [];
      const relevant = systemAnnouncements.filter((item) => {
        if (item.targetAudience === 'vip' && !isVip) return false;
        if (item.targetAudience === 'authors' && !isAuthorVerified) return false;
        return true;
      });
      return relevant.filter((a) => !readIds.includes(a.id)).length;
    } catch {
      return 0;
    }
  };

  const calculatedTotalUnread =
    unreadMessagesCount + pendingFriendCount + getUnreadAnnouncementsCount() + totalBadgesCount;
  const totalNotifications =
    externalUnreadCount !== undefined ? externalUnreadCount : calculatedTotalUnread;

  const handleOpenNotifications = () => {
    if (onOpenNotifications) {
      onOpenNotifications();
    } else {
      setIsNotificationsModalOpen(true);
    }
  };

  const handleOpenDrawer = () => {
    if (onOpenEcosystemDrawer) {
      onOpenEcosystemDrawer();
    } else {
      setIsEcosystemDrawerOpen(true);
    }
  };

  // Top Bar Zone 2: 5 concise single-line navigation links
  const primaryNavLinks: Array<{
    id: EcosystemMode;
    label: string;
    defaultTab?: ActiveTab;
  }> = [
    { id: 'portal', label: 'Khám Phá', defaultTab: 'portal' },
    { id: 'haevy_ai', label: 'Haevy AI' },
    { id: 'edu', label: 'Học Tập' },
    { id: 'internet', label: 'Trình Duyệt' },
    { id: 'maps', label: 'Bản Đồ' }
  ];

  const currentModeLabel = MODE_LABELS[currentMode] || 'Hệ Sinh Thái';

  return (
    <div className="w-full max-w-[1640px] mx-auto flex items-center justify-between gap-8 py-2.5 min-w-0">
      {/* Zone 1: Single Clean Brand Wordmark & Breadcrumb Trigger */}
      <button
        type="button"
        onClick={handleOpenDrawer}
        className="flex items-center gap-2.5 text-left cursor-pointer group whitespace-nowrap shrink-0 focus:outline-none"
        title="Mở bảng chuyển nhanh 12+ phân hệ (Alt + M)"
      >
        <span className="font-editorial text-xl sm:text-2xl font-semibold tracking-tight text-white">
          Haevy
        </span>
        <span className="text-zinc-600 text-sm" aria-hidden="true">
          /
        </span>
        <span className="text-xs sm:text-sm font-medium text-zinc-300 group-hover:text-white transition-colors flex items-center gap-1">
          <span>{currentModeLabel}</span>
          <ChevronDown
            size={13}
            className="text-zinc-500 group-hover:text-zinc-300 transition-transform group-hover:translate-y-0.5"
          />
        </span>
      </button>

      {/* Zone 2: Clean Single-Line Text Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-zinc-400">
        {primaryNavLinks.map((item) => {
          const isActive = currentMode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                haptics.selection();
                onSelectMode(item.id, item.defaultTab);
              }}
              className={`relative py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isActive ? 'text-white font-semibold' : 'hover:text-zinc-200'
              }`}
            >
              <span>{item.label}</span>
              {isActive && (
                <span className="absolute inset-x-0 -bottom-1 h-[1.5px] bg-amber-300/90 rounded-full" />
              )}
            </button>
          );
        })}

        {currentMode === 'audio' && (
          <>
            <span className="text-zinc-700" aria-hidden="true">
              ·
            </span>
            <button
              type="button"
              onClick={() => onSelectTab('library')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'library' ? 'text-amber-300 font-semibold' : 'hover:text-zinc-200'
              }`}
            >
              Kho Audio
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('community')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'community' ? 'text-amber-300 font-semibold' : 'hover:text-zinc-200'
              }`}
            >
              Cộng Đồng
            </button>
          </>
        )}
      </nav>

      {/* Zone 3: Search Trigger & Account Action */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Universal Search Trigger (Cmd + K) */}
        <button
          type="button"
          id="navbar-google-omnibar-pill"
          onClick={() => setIsOmnibarOpen(true)}
          className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800/90 border border-white/8 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          title="Tìm kiếm toàn hệ sinh thái (Ctrl + K)"
        >
          <Search size={13} className="text-zinc-400" />
          <span className="text-xs">Tìm kiếm...</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono-tabular text-zinc-400 bg-black/40 border border-white/10 rounded">
            <Command size={9} />K
          </kbd>
        </button>

        {/* Voice Command Action */}
        {onToggleVoiceListen && (
          <button
            type="button"
            id="navbar-voice-listen-btn"
            onClick={onToggleVoiceListen}
            className={`h-8 px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              isVoiceListening
                ? 'bg-amber-300 text-zinc-950 border-amber-200 font-semibold'
                : 'bg-zinc-900/90 hover:bg-zinc-800 border-white/8 text-zinc-300 hover:text-white'
            }`}
            title="Điều khiển bằng giọng nói"
          >
            <Mic size={13} />
            <span className="hidden xl:inline">
              {isVoiceListening ? 'Đang nghe' : 'Giọng nói'}
            </span>
          </button>
        )}

        {/* All Modes Drawer Trigger */}
        <button
          type="button"
          id="navbar-ecosystem-modes-btn"
          onClick={handleOpenDrawer}
          className="h-8 px-2.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-white/8 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          title="Chuyển nhanh 12+ phân hệ (Alt + M)"
        >
          <Layers size={13} className="text-amber-300/90" />
          <span className="hidden lg:inline">Phân hệ</span>
        </button>

        {/* Notifications */}
        <button
          type="button"
          id="navbar-notification-btn"
          onClick={handleOpenNotifications}
          className="relative w-8 h-8 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-white/8 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          title="Thông báo"
          aria-label="Thông báo"
        >
          <Bell size={14} />
          {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-mono-tabular font-semibold flex items-center justify-center">
              {totalNotifications > 99 ? '99+' : totalNotifications}
            </span>
          )}
        </button>

        {/* Fullscreen */}
        {onToggleFullscreen && (
          <button
            type="button"
            id="navbar-fullscreen-btn"
            onClick={onToggleFullscreen}
            className="hidden sm:flex w-8 h-8 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-white/8 text-zinc-300 hover:text-white items-center justify-center transition-colors cursor-pointer shrink-0"
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
            aria-label="Toàn màn hình"
          >
            {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
          </button>
        )}

        {/* User Profile / Primary Auth CTA */}
        {loading ? (
          <div className="w-20 h-8 rounded-lg bg-zinc-900 animate-pulse shrink-0" />
        ) : user ? (
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              id="user-profile-unified-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 h-8 pl-1.5 pr-2.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Tài khoản, Ví Xu & Cài đặt"
            >
              <div className="relative shrink-0 flex items-center justify-center">
                <CosmicAvatarFX
                  photoURL={effectivePhotoURL}
                  displayName={effectiveDisplayName}
                  isVip={isVip}
                  size="xxs"
                  showBadge={isVip}
                />
              </div>

              <span className="text-xs font-mono-tabular font-semibold text-zinc-100">
                {(audioPoints ?? 0).toLocaleString()} Xu
              </span>

              <span className="text-zinc-600" aria-hidden="true">
                ·
              </span>

              <span className="text-[11px] font-mono-tabular text-amber-300/90">
                Lv.{levelState.currentLevel}
              </span>

              <ChevronDown
                size={12}
                className={`text-zinc-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

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
          <button
            type="button"
            id="open-login-btn"
            onClick={onOpenAuth}
            className="h-8 px-3.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <LogIn size={13} />
            <span>Đăng nhập</span>
          </button>
        )}
      </div>

      {isEcosystemDrawerOpen && (
        <React.Suspense fallback={null}>
          <HaevyAllModesInfoModal
            isOpen={isEcosystemDrawerOpen}
            onClose={() => setIsEcosystemDrawerOpen(false)}
            onSelectMode={(mode, initialTab) => {
              setIsEcosystemDrawerOpen(false);
              onSelectMode(mode, initialTab);
            }}
          />
        </React.Suspense>
      )}

      {isNotificationsModalOpen && (
        <React.Suspense fallback={null}>
          <NotificationsModal
            isOpen={isNotificationsModalOpen}
            onClose={() => setIsNotificationsModalOpen(false)}
            onSelectTab={onSelectTab}
            onSelectMode={onSelectMode}
          />
        </React.Suspense>
      )}

      {isOmnibarOpen && (
        <React.Suspense fallback={null}>
          <GoogleOmnibarModal
            isOpen={isOmnibarOpen}
            onClose={() => setIsOmnibarOpen(false)}
            tracks={tracks}
            onPlayTrack={onPlayTrack}
            onSelectMode={onSelectMode}
            onSelectTab={onSelectTab}
          />
        </React.Suspense>
      )}
    </div>
  );
}
