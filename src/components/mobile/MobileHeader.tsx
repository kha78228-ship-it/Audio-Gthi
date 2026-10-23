import React from 'react';
import {
  Bell,
  ChevronDown,
  Search
} from 'lucide-react';
import { EcosystemMode, ActiveTab } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { CosmicAvatarFX } from '../haevyLite/CosmicAvatarFX';
import { calculateLevelFromExp } from '../../data/levelMilestones';
import { haptics } from '../../utils/haptics';
import { HaevyUserDropdownMenu } from '../HaevyUserDropdownMenu';

interface MobileHeaderProps {
  currentMode: EcosystemMode;
  onOpenEcosystemDrawer: () => void;
  onSelectMode: (mode: EcosystemMode, initialTab?: ActiveTab | string) => void;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  unreadNotificationCount?: number;
  onOpenAuth: () => void;
  onToggleUserMenu?: () => void;
  isUserMenuOpen?: boolean;
  onOpenInstallPwa?: () => void;
}

const MODE_NAMES: Record<string, string> = {
  portal: 'Cổng Trung Tâm',
  internet: 'Haevy Internet',
  audio: 'Haevy Audio',
  messages: 'Tin Nhắn',
  couple: 'I Love Haevy',
  maps: 'Haevy Maps',
  finance: 'Haevy Finance',
  haevy_ai: 'Haevy AI',
  studio: 'Phòng Thu',
  games: 'Đấu Trường',
  spiritual: 'Chiêm Nghiệm',
  family_tree: 'Gia Phả',
  haevy_lite: 'Xu Lite',
  edu: 'Haevy Edu',
  vip: 'Hội Viên VIP',
  space: 'Không Gian 3D',
  morning: 'Buổi Sáng',
  support: 'Hỗ Trợ',
  profile: 'Hồ Sơ',
  admin: 'Quản Trị'
};

export function MobileHeader({
  currentMode,
  onOpenEcosystemDrawer,
  onSelectMode,
  onSelectTab,
  onOpenSearch,
  onOpenNotifications,
  unreadNotificationCount = 0,
  onOpenAuth,
  onToggleUserMenu,
  onOpenInstallPwa
}: MobileHeaderProps) {
  const {
    user,
    userProfile,
    displayName: authDisplayName,
    photoURL: authPhotoURL,
    levelExp,
    isVip
  } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const effectiveDisplayName =
    userProfile?.displayName ||
    authDisplayName ||
    user?.displayName ||
    user?.email?.split('@')[0] ||
    'Khách';
  const effectivePhotoURL = userProfile?.photoURL || authPhotoURL || user?.photoURL;
  const levelState = calculateLevelFromExp(levelExp ?? 0);
  const modeLabel = MODE_NAMES[currentMode] || 'Hệ Sinh Thái';

  return (
    <header className="w-full h-12 bg-[#09090b]/95 backdrop-blur-xl border-b border-white/8 sticky top-0 z-40 px-3.5 flex items-center justify-between gap-3 select-none">
      {/* Zone 1: Editorial Wordmark & Mode Switcher */}
      <button
        type="button"
        onClick={() => {
          haptics.selection();
          onOpenEcosystemDrawer();
        }}
        className="flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
        title="Chuyển phân hệ"
      >
        <span className="font-editorial text-lg font-semibold text-white tracking-tight">
          Haevy
        </span>
        <span className="text-zinc-600 text-xs" aria-hidden="true">
          /
        </span>
        <span className="text-xs font-medium text-zinc-300 flex items-center gap-1">
          <span>{modeLabel}</span>
          <ChevronDown size={13} className="text-zinc-500" />
        </span>
      </button>

      {/* Zone 3: Compact Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => {
            haptics.selection();
            onOpenSearch();
          }}
          className="w-8 h-8 rounded-lg bg-zinc-900/90 text-zinc-300 hover:text-white border border-white/8 flex items-center justify-center transition-colors"
          title="Tìm kiếm"
          aria-label="Tìm kiếm"
        >
          <Search size={15} />
        </button>

        <button
          type="button"
          onClick={() => {
            haptics.selection();
            onOpenNotifications();
          }}
          className="relative w-8 h-8 rounded-lg bg-zinc-900/90 text-zinc-300 hover:text-white border border-white/8 flex items-center justify-center transition-colors"
          title="Thông báo"
          aria-label="Thông báo"
        >
          <Bell size={15} />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono-tabular font-semibold text-[9px] flex items-center justify-center">
              {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
            </span>
          )}
        </button>

        {user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                haptics.selection();
                setIsDropdownOpen(!isDropdownOpen);
                if (onToggleUserMenu) onToggleUserMenu();
              }}
              className="flex items-center gap-1.5 pl-1 pr-2 h-8 rounded-lg bg-zinc-900/90 border border-white/10 cursor-pointer"
              title={effectiveDisplayName}
            >
              <CosmicAvatarFX
                photoURL={effectivePhotoURL || undefined}
                displayName={effectiveDisplayName}
                size="xxs"
                isVip={isVip}
                isCurrentUser
              />
              <span className="text-[11px] font-mono-tabular text-amber-300/90">
                Lv.{levelState.currentLevel}
              </span>
            </button>

            <HaevyUserDropdownMenu
              isOpen={isDropdownOpen}
              onClose={() => setIsDropdownOpen(false)}
              onSelectMode={(mode, tab) => {
                setIsDropdownOpen(false);
                onSelectMode(mode, tab);
              }}
              onSelectTab={(tab) => {
                setIsDropdownOpen(false);
                onSelectTab(tab);
              }}
              onOpenInstallPwa={onOpenInstallPwa}
              onOpenNotifications={onOpenNotifications}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              haptics.selection();
              onOpenAuth();
            }}
            className="h-8 px-3 rounded-lg bg-white text-zinc-950 text-xs font-semibold whitespace-nowrap shrink-0"
          >
            Đăng nhập
          </button>
        )}
      </div>
    </header>
  );
}
