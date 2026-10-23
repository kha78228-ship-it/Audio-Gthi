/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModeBadgeProvider, useModeBadges } from './context/ModeBadgeContext';
import { DisplayScaleProvider } from './context/DisplayScaleContext';
import { HaevyMoodProvider } from './context/HaevyMoodContext';
import { GiftEffectProvider } from './context/GiftEffectContext';
import { HaevyMoodBackground } from './components/mood/HaevyMoodBackground';
import { SubsystemLoadingFallback } from './components/common/SubsystemLoadingFallback';

// Core views loaded immediately for instant first-paint
import { HaevyEcosystemLandingView } from './components/HaevyEcosystemLandingView';
import { HomeView } from './components/HomeView';
import { AudioLibraryView } from './components/AudioLibraryView';
import type { HaevyGamesSubTab } from './components/HaevyGamesView';

// Subsystems loaded dynamically via React.lazy() to shrink initial bundle and boost rendering speed
const HaevyAIHubView = React.lazy(() => import('./components/HaevyAIHubView').then(m => ({ default: m.HaevyAIHubView })));
const MessagesFriendsView = React.lazy(() => import('./components/MessagesFriendsView').then(m => ({ default: m.MessagesFriendsView })));
const HaevyMorningView = React.lazy(() => import('./components/HaevyMorningView').then(m => ({ default: m.HaevyMorningView })));
const HaevyStudioView = React.lazy(() => import('./components/HaevyStudioView').then(m => ({ default: m.HaevyStudioView })));
const CoupleRomanceView = React.lazy(() => import('./components/CoupleRomanceView').then(m => ({ default: m.CoupleRomanceView })));
const FinanceView = React.lazy(() => import('./components/FinanceView').then(m => ({ default: m.FinanceView })));
const VipTopupView = React.lazy(() => import('./components/VipTopupView').then(m => ({ default: m.VipTopupView })));
const UserProfileView = React.lazy(() => import('./components/UserProfileView').then(m => ({ default: m.UserProfileView })));
const AdminDashboardView = React.lazy(() => import('./components/AdminDashboardView').then(m => ({ default: m.AdminDashboardView })));
const HaevySupportView = React.lazy(() => import('./components/HaevySupportView').then(m => ({ default: m.HaevySupportView })));
const HaevySpiritualView = React.lazy(() => import('./components/HaevySpiritualView').then(m => ({ default: m.HaevySpiritualView })));
const HaevyFamilyTreeView = React.lazy(() => import('./components/HaevyFamilyTreeView').then(m => ({ default: m.HaevyFamilyTreeView })));
const HaevyEduView = React.lazy(() => import('./components/HaevyEduView').then(m => ({ default: m.HaevyEduView })));
const HaevyMapsView = React.lazy(() => import('./components/maps/HaevyMapsView').then(m => ({ default: m.HaevyMapsView })));
const HaevyInternetView = React.lazy(() => import('./components/HaevyInternetView').then(m => ({ default: m.HaevyInternetView })));
const HaevyLiteHubView = React.lazy(() => import('./components/haevyLite/HaevyLiteHubView').then(m => ({ default: m.HaevyLiteHubView })));
const HaevyGamesView = React.lazy(() => import('./components/HaevyGamesView').then(m => ({ default: m.HaevyGamesView })));

// Modals loaded dynamically on-demand to keep initial JS payload minimal
const HaevyMoodModal = React.lazy(() => import('./components/mood/HaevyMoodModal').then(m => ({ default: m.HaevyMoodModal })));
const UserLevelPrivilegesModal = React.lazy(() => import('./components/UserLevelPrivilegesModal').then(m => ({ default: m.UserLevelPrivilegesModal })));
const UserLevelUpNotificationModal = React.lazy(() => import('./components/UserLevelUpNotificationModal').then(m => ({ default: m.UserLevelUpNotificationModal })));
const AuthorGiftShopModal = React.lazy(() => import('./components/AuthorGiftShopModal').then(m => ({ default: m.AuthorGiftShopModal })));
const AuthModal = React.lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const NotificationsModal = React.lazy(() => import('./components/NotificationsModal').then(m => ({ default: m.NotificationsModal })));
const InstallPwaModal = React.lazy(() => import('./components/InstallPwaModal').then(m => ({ default: m.InstallPwaModal })));
const GoogleOmnibarModal = React.lazy(() => import('./components/common/GoogleOmnibarModal').then(m => ({ default: m.GoogleOmnibarModal })));
const HaevyShortcutsModal = React.lazy(() => import('./components/HaevyShortcutsModal').then(m => ({ default: m.HaevyShortcutsModal })));
const HaevyEcosystemQuickSwitcherModal = React.lazy(() => import('./components/HaevyEcosystemQuickSwitcherModal').then(m => ({ default: m.HaevyEcosystemQuickSwitcherModal })));

import { HaevyAIFloatingWidget } from './components/HaevyAIFloatingWidget';
import { FloatingQuickNoteWidget } from './components/portal/FloatingQuickNoteWidget';
import {
  HaevyPortalOnboardingTour,
  ONBOARDING_COMPLETED_KEY,
  OnboardingStepId
} from './components/portal/HaevyPortalOnboardingTour';
import { AudioPlayer } from './components/AudioPlayer';
import { CommunityView } from './components/CommunityView';
import { BottomTaskbar } from './components/BottomTaskbar';
import { Navbar } from './components/Navbar';
import { DesktopSidebar } from './components/DesktopSidebar';
import { DesktopPlayerDock } from './components/desktop/DesktopPlayerDock';
import { MobileHeader } from './components/mobile/MobileHeader';
import { useDevicePlatform } from './hooks/useDevicePlatform';
import { HaevyVoiceNavigationHUD } from './components/HaevyVoiceNavigationHUD';
import { HaevyModeTransitionOverlay } from './components/HaevyModeTransitionOverlay';
import { HaevyGlobalToast } from './components/common/HaevyGlobalToast';
import { getSavedEcosystemMode, switchEcosystemMode, MODE_SYNC_EVENT, MODE_STORAGE_KEY } from './services/modeSyncService';
import { useVoiceCommander } from './hooks/useVoiceCommander';
import { haptics } from './utils/haptics';
import { motion, AnimatePresence } from 'motion/react';
import { Track, ActiveTab, EcosystemMode, InternetSubTab } from './types';
import { matchShortcut, DEFAULT_SHORTCUTS_CONFIG } from './data/defaultShortcuts';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient, useTracksQuery } from './services/tracksQueryService';
import { 
  Sparkles, 
  Home, 
  Moon, 
  Mic, 
  MessageSquare, 
  Heart, 
  Wallet, 
  Crown, 
  Boxes, 
  Smartphone,
  Maximize, 
  Minimize, 
  Bell, 
  LogIn, 
  User as UserIcon, 
  Coins, 
  ArrowLeft,
  X,
  ChevronDown,
  ShieldCheck,
  LifeBuoy,
  Check,
  BrainCircuit,
  Keyboard,
  GitFork,
  GraduationCap,
  MapPin,
  Globe,
  Gamepad2
} from 'lucide-react';

export type HaevyMode = 
  | 'portal'
  | 'audio'
  | 'games'
  | 'space'
  | 'messages'
  | 'studio'
  | 'finance'
  | 'admin'
  | 'couple'
  | 'vip'
  | 'support'
  | 'haevy_ai'
  | 'spiritual'
  | 'family_tree'
  | 'audio_library'
  | 'haevy_lite'
  | 'morning'
  | 'edu'
  | 'maps'
  | 'internet'
  | 'profile';

const MODES_CONFIG: {
  id: HaevyMode;
  name: string;
  shortName: string;
  icon: any;
  color: string;
  badge: string;
}[] = [
  { id: 'portal', name: 'Cổng Hệ Sinh Thái Haevy', shortName: 'Cổng Vũ Trụ', icon: Home, color: 'from-amber-500 to-yellow-600', badge: 'Cổng Trung Tâm' },
  { id: 'haevy_ai', name: 'Haevy AI Master', shortName: 'Haevy AI', icon: BrainCircuit, color: 'from-purple-500 via-indigo-500 to-pink-500', badge: 'AI Toàn Năng' },
  { id: 'edu', name: 'Haevy Edu (STEM & Lộ Trình)', shortName: 'Haevy Edu', icon: GraduationCap, color: 'from-emerald-500 via-teal-500 to-cyan-500', badge: 'STEM Lab' },
  { id: 'internet', name: 'Haevy Internet (Trình Duyệt & Web)', shortName: 'Haevy Internet', icon: Globe, color: 'from-sky-500 via-blue-600 to-indigo-600', badge: 'Web 4.0 🌐' },
  { id: 'audio', name: 'Haevy Audio', shortName: 'Haevy Audio', icon: Moon, color: 'from-indigo-500 to-purple-600', badge: 'Audio & Music' },
  { id: 'finance', name: 'Haevy Finance', shortName: 'Haevy Finance', icon: Wallet, color: 'from-emerald-500 to-green-600', badge: 'Thu Chi 6 Hũ' },
  { id: 'maps', name: 'Haevy Maps (Gia Đình & Bạn Đời)', shortName: 'Haevy Maps', icon: MapPin, color: 'from-emerald-500 via-teal-500 to-sky-500', badge: 'Live GPS 📍' },
  { id: 'space', name: 'Haevy Space', shortName: 'Haevy Space', icon: Sparkles, color: 'from-cyan-500 to-blue-600', badge: '3D AR' },
  { id: 'couple', name: 'I Love Haevy', shortName: 'I Love Haevy', icon: Heart, color: 'from-rose-500 to-red-600', badge: 'Cặp Đôi' },
  { id: 'spiritual', name: 'Haevy Spiritual', shortName: 'Haevy Spiritual', icon: Moon, color: 'from-purple-600 via-indigo-600 to-pink-600', badge: 'Tâm Linh Vũ Trụ' },
  { id: 'family_tree', name: 'Haevy Family Tree', shortName: 'Gia Phả', icon: GitFork, color: 'from-amber-600 via-yellow-600 to-amber-700', badge: 'Gia Phả Dòng Họ' },
  { id: 'messages', name: 'Haevy Message', shortName: 'Haevy Message', icon: MessageSquare, color: 'from-sky-500 to-blue-600', badge: 'Messages' },
  { id: 'studio', name: 'Haevy Studio', shortName: 'Haevy Studio', icon: Mic, color: 'from-rose-500 to-pink-600', badge: 'AI Voice' },
  { id: 'games', name: 'Haevy Games', shortName: 'Haevy Games', icon: Gamepad2, color: 'from-indigo-600 to-purple-600', badge: 'Đấu Trường Games' },
  { id: 'haevy_lite', name: 'Xu Haevy Lite & Combo Hoạt Ảnh', shortName: 'Xu Lite', icon: Sparkles, color: 'from-purple-600 via-indigo-600 to-pink-500', badge: 'Vũ Trụ 🌌' },
  { id: 'vip', name: 'Haevy VIP', shortName: 'Haevy VIP', icon: Crown, color: 'from-amber-400 to-yellow-500', badge: 'VIP Club' },
  { id: 'profile', name: 'Hồ Sơ Cá Nhân', shortName: 'Hồ Sơ', icon: UserIcon, color: 'from-teal-500 to-emerald-600', badge: 'Cá Nhân' },
  { id: 'support', name: 'Haevy Support', shortName: 'Haevy Support', icon: LifeBuoy, color: 'from-emerald-400 to-teal-500', badge: 'Hỗ Trợ 24/7' },
  { id: 'admin', name: 'Haevy Admin', shortName: 'Haevy Admin', icon: ShieldCheck, color: 'from-red-500 to-rose-600', badge: 'Quản Trị' }
];

function MainApp() {
  const { 
    user, 
    isVip, 
    audioPoints, 
    isAdmin, 
    isSuperAdmin, 
    addAudioPoints, 
    shortcutsConfig,
    isLevelModalOpen,
    setIsLevelModalOpen
  } = useAuth();
  const { markModeAsViewed } = useModeBadges();
  const { effectiveTheme } = useTheme();
  
  // Dedicated Automatic Platform Detection (Desktop PC vs Mobile)
  const { isMobile, isDesktop } = useDevicePlatform();
  const [isOmnibarOpen, setIsOmnibarOpen] = useState(false);

  // App Navigation & Active Mode State
  const [currentMode, setCurrentMode] = useState<HaevyMode>(getSavedEcosystemMode);
  const [navDirection, setNavDirection] = useState<number>(1);
  const [isModeSwitcherOpen, setIsModeSwitcherOpen] = useState(false);
  const [modeSwitcherViewMode, setModeSwitcherViewMode] = useState<'quick' | 'detailed'>('quick');
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isGiftShopOpen, setIsGiftShopOpen] = useState(false);
  const [selectedGiftAuthor, setSelectedGiftAuthor] = useState<{
    uid: string;
    stageName: string;
    trackTitle?: string;
    trackId?: string;
  } | undefined>(undefined);

  const handleSetMode = (nextMode: HaevyMode) => {
    if (nextMode === currentMode) return;
    let dir = 1;
    if (nextMode === 'portal') {
      dir = -1;
    } else if (currentMode === 'portal') {
      dir = 1;
    } else {
      const prevIdx = MODES_CONFIG.findIndex(m => m.id === currentMode);
      const nextIdx = MODES_CONFIG.findIndex(m => m.id === nextMode);
      dir = nextIdx >= prevIdx ? 1 : -1;
    }
    setNavDirection(dir);
    setCurrentMode(nextMode);
  };
  
  // Sub-tabs for each ecosystem mode
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [messageSubTab, setMessageSubTab] = useState<'chat' | 'feed' | 'friends'>('chat');
  const [coupleSubTab, setCoupleSubTab] = useState<'page1' | 'page2' | 'page3' | 'page4' | 'page5'>('page1');
  const [financeSubTab, setFinanceSubTab] = useState<'page1' | 'page2' | 'page3' | 'page4' | 'page5'>('page1');
  const [adminSubTab, setAdminSubTab] = useState<'page1' | 'page2' | 'page3' | 'page4' | 'page5' | 'page6' | 'page7'>('page1');
  const [studioSubTab, setStudioSubTab] = useState<'page1' | 'page2' | 'page3'>('page1');
  const [vipSubTab, setVipSubTab] = useState<'page1' | 'page2' | 'page3' | 'page4' | 'page5' | 'page6'>('page1');
  const [spiritualSubTab, setSpiritualSubTab] = useState<'tarot' | 'palmistry' | 'divination' | 'numerology' | 'crystal_oracle' | 'couple_spiritual' | 'tuvi' | 'astrology' | 'soundscapes'>('tarot');
  const [haevyAISubTab, setHaevyAISubTab] = useState<'overview' | 'chat' | 'updates' | 'troubleshoot' | 'modes'>('overview');
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | null>(null);
  const [haevyLiteSubTab, setHaevyLiteSubTab] = useState<'shop' | 'rewards' | 'customize' | 'topup_and_ads'>('shop');
  const [gamesSubTab, setGamesSubTab] = useState<HaevyGamesSubTab>('home');
  const [familyTreeSubTab, setFamilyTreeSubTab] = useState<string>('tree');
  const [eduSubTab, setEduSubTab] = useState<'workspace' | 'sun_study' | 'assistant' | 'labs' | 'roadmap' | 'video' | 'notebook' | 'quiz' | 'tools' | 'exam' | 'goals'>('workspace');
  const [spaceSubTab, setSpaceSubTab] = useState<'portal' | 'canvas' | 'mascot' | 'magic_ar' | 'morning_dashboard'>('portal');
  const [profileSubTab, setProfileSubTab] = useState<'posts' | 'about' | 'audio' | 'media' | 'security' | 'transactions' | 'support'>('posts');
  const [mapsSubTab, setMapsSubTab] = useState<'all' | 'couple' | 'family' | 'zones'>('all');
  const [internetSubTab, setInternetSubTab] = useState<InternetSubTab>('browser');
  const [shuffleMode, setShuffleMode] = useState<'off' | 'shuffle' | 'smart_shuffle'>('smart_shuffle');
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  // Dynamic browser tab title synchronization
  useEffect(() => {
    const titles: Record<HaevyMode, string> = {
      portal: 'Cổng Hệ Sinh Thái Haevy',
      edu: 'Haevy Edu - STEM Lab & Lộ Trình Ôn Thi AI',
      finance: 'Haevy Finance - Sổ Thu Chi 6 Hũ Thông Minh',
      spiritual: 'Haevy Spiritual - Tâm Linh Vũ Trụ, Tử Vi & Tarot',
      maps: 'Haevy Maps - Bản Đồ Định Vị GPS Gia Đình & Bạn Đời',
      internet: 'Haevy Internet - Trình Duyệt Web & AI Reader',
      haevy_ai: 'Haevy AI Master - Trợ Lý Trí Tuệ Toàn Năng',
      space: 'Haevy Space - Không Gian 3D AR Studio',
      morning: 'Haevy Space - Bảng Buổi Sáng & Vũ Trụ',
      audio: 'Haevy Audio - Lossless Hi-Fi & Podcasts',
      audio_library: 'Kho Audio - Hệ Sinh Thái Haevy',
      messages: 'Haevy Message - Tin Nhắn & Bạn Bè',
      studio: 'Haevy Studio - Thu Âm & Giọng Đọc AI',
      couple: 'I Love Haevy - Không Gian Cặp Đôi',
      vip: 'Haevy VIP Club - Quyền Lợi & Hội Viên',
      haevy_lite: 'Xu Haevy Lite & Combo Vũ Trụ',
      games: 'Haevy Games - Đấu Trường Âm Nhạc',
      family_tree: 'Haevy Family Tree - Gia Phả Dòng Họ',
      admin: 'Haevy Admin - Quản Trị Hệ Thống',
      support: 'Haevy Support - Hỗ Trợ 24/7',
      profile: 'Hồ Sơ Cá Nhân - Hệ Sinh Thái Haevy'
    };
    const title = titles[currentMode] || 'Hệ Sinh Thái Haevy';
    document.title = `${title} | Haevy`;
  }, [currentMode, activeTab]);

  // Subtab application helper
  const applySubTabForMode = (mode: string, subTab?: string) => {
    if (mode === 'spiritual') {
      setActiveTab('spiritual');
      if (subTab) setSpiritualSubTab(subTab as any);
    } else if (mode === 'messages') {
      setActiveTab('messages');
      if (subTab) setMessageSubTab(subTab as any);
    } else if (mode === 'couple') {
      setActiveTab('couple');
      if (subTab) setCoupleSubTab(subTab as any);
    } else if (mode === 'finance') {
      setActiveTab('finance');
      if (subTab) setFinanceSubTab(subTab as any);
    } else if (mode === 'audio') {
      setActiveTab((subTab as any) || 'home');
    } else if (mode === 'vip') {
      setActiveTab('vip');
      if (subTab) setVipSubTab(subTab as any);
    } else if (mode === 'haevy_lite') {
      setActiveTab('haevy_lite' as any);
      if (subTab) setHaevyLiteSubTab(subTab as any);
    } else if (mode === 'edu') {
      setActiveTab('edu' as any);
      if (subTab) setEduSubTab(subTab as any);
    } else if (mode === 'games') {
      setActiveTab('games');
      if (subTab) setGamesSubTab(subTab as any);
    } else if (mode === 'family_tree') {
      setActiveTab('family_tree' as any);
      if (subTab) setFamilyTreeSubTab(subTab);
    } else if (mode === 'studio') {
      setActiveTab('studio');
      if (subTab) setStudioSubTab(subTab as any);
    } else if (mode === 'admin') {
      setActiveTab('admin');
      if (subTab) setAdminSubTab(subTab as any);
    } else if (mode === 'haevy_ai') {
      setActiveTab('haevy_ai');
      if (subTab) setHaevyAISubTab(subTab as any);
    } else if (mode === 'space' || mode === 'morning') {
      setActiveTab('space');
      if (subTab) setSpaceSubTab(subTab as any);
    } else if (mode === 'portal') {
      setActiveTab('portal');
    } else if (mode === 'maps') {
      setActiveTab('maps' as any);
      if (subTab) setMapsSubTab(subTab as any);
    } else if (mode === 'internet') {
      setActiveTab('internet' as any);
      if (subTab) setInternetSubTab(subTab as any);
    } else if (mode === 'profile') {
      setActiveTab('profile');
      if (subTab) setProfileSubTab(subTab as any);
    } else if (mode === 'support') {
      setActiveTab('support');
    }
  };

  // Browser History (PushState & PopState) for seamless browser back/forward buttons
  const isNavigatingHistoryRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.history && !window.history.state) {
      window.history.replaceState({ mode: currentMode, activeTab }, '', window.location.href);
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.mode) {
        isNavigatingHistoryRef.current = true;
        const targetMode = event.state.mode as HaevyMode;
        setCurrentMode(targetMode);
        if (event.state.subTab) {
          applySubTabForMode(targetMode, event.state.subTab);
        }
        setTimeout(() => {
          isNavigatingHistoryRef.current = false;
        }, 120);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Universal Cross-Ecosystem Mode & Sub-tab Navigator
  const handleNavigateToMode = (mode: string, subTab?: string) => {
    markModeAsViewed(mode, subTab);
    const targetMode = (mode === 'morning' ? 'space' : mode) as HaevyMode;
    handleSetMode(targetMode);
    switchEcosystemMode(mode as EcosystemMode, subTab);
    applySubTabForMode(mode, subTab);

    if (!isNavigatingHistoryRef.current && typeof window !== 'undefined' && window.history) {
      try {
        window.history.pushState({ mode: targetMode, subTab }, '', window.location.href);
      } catch {
        // ignore in sandboxed containers
      }
    }

    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // Ignore scroll errors in sandboxed containers
    }
  };

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'signin' | 'signup' | 'anonymous' | 'mcp_ai'>('signin');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isInstallPwaOpen, setIsInstallPwaOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isOnboardingTourOpen, setIsOnboardingTourOpen] = useState(false);
  const [shortcutHUD, setShortcutHUD] = useState<{ title: string; subtitle?: string } | null>(null);

  // Auto-launch Interactive Onboarding Walkthrough on first visit to Haevy Portal
  useEffect(() => {
    if (currentMode !== 'portal') return;
    try {
      const globalDone = localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
      const userDone =
        user?.uid && localStorage.getItem(`${ONBOARDING_COMPLETED_KEY}_${user.uid}`) === 'true';
      if (!globalDone && !userDone) {
        const timer = window.setTimeout(() => {
          setIsOnboardingTourOpen(true);
        }, 850);
        return () => window.clearTimeout(timer);
      }
    } catch {
      // ignore storage errors
    }
  }, [currentMode, user?.uid]);

  // Sub-triggers for Finance Quick Shortcuts
  const [financePage2SubTab, setFinancePage2SubTab] = useState<'budget' | 'savings' | 'debts' | 'recurring'>('budget');
  const [openWalletsTrigger, setOpenWalletsTrigger] = useState<number>(0);
  const [openAddTransactionTrigger, setOpenAddTransactionTrigger] = useState<number>(0);

  // Flash Floating Shortcut HUD Feedback
  const triggerShortcutHUD = (title: string, subtitle?: string) => {
    setShortcutHUD({ title, subtitle });
    setTimeout(() => {
      setShortcutHUD(prev => (prev?.title === title ? null : prev));
    }, 2400);
  };

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
      setIsInstallPwaOpen(true);
    }
  };

  const handleOpenAuth = (tab: 'signin' | 'signup' | 'anonymous' | 'mcp_ai' = 'signin') => {
    setAuthInitialTab(tab);
    setIsAuthOpen(true);
  };

  // Web Speech API Voice Commander for universal voice-controlled ecosystem navigation
  const {
    isListening: isVoiceListening,
    transcript: voiceTranscript,
    lastMatchedCommand: voiceLastMatched,
    errorMessage: voiceError,
    toggleListening: toggleVoiceListening,
    simulateCommand: simulateVoiceCommand
  } = useVoiceCommander({
    onNavigateMode: handleNavigateToMode,
    onToggleFullscreen: handleToggleFullscreen,
    onOpenNotifications: () => setIsNotificationsOpen(true),
    onOpenShortcuts: () => setIsShortcutsModalOpen(true),
    onOpenAuth: () => handleOpenAuth('signin'),
    onShowHUDFeedback: triggerShortcutHUD
  });

  // Audio Playback State with React Query caching & instant local cache paint
  const {
    tracks,
    isLoadingTracks,
    refetchTracks,
  } = useTracksQuery();

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('Tất cả');

  // Background refetch on custom events (e.g. after uploading or deleting a track)
  useEffect(() => {
    const handleInvalidate = () => {
      refetchTracks();
    };
    window.addEventListener('haevy-invalidate-tracks', handleInvalidate);
    return () => {
      window.removeEventListener('haevy-invalidate-tracks', handleInvalidate);
    };
  }, [refetchTracks]);

  // Sync fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Map mode selection from cards & menu with ecosystem synchronization
  const handleSelectMode = (modeKey: string, initialSubTab?: string) => {
    switchEcosystemMode(modeKey as EcosystemMode, initialSubTab);
    const targetMode = (modeKey === 'morning' ? 'space' : modeKey === 'audio_library' ? 'audio' : modeKey) as HaevyMode;
    handleSetMode(targetMode);

    if (!isNavigatingHistoryRef.current && typeof window !== 'undefined' && window.history) {
      try {
        window.history.pushState({ mode: targetMode, subTab: initialSubTab }, '', window.location.href);
      } catch {
        // ignore
      }
    }

    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // Ignore scroll errors in sandboxed containers
    }

    if (modeKey === 'haevy_ai') {
      setActiveTab('haevy_ai');
      if (initialSubTab) {
        setHaevyAISubTab(initialSubTab as any);
      }
    } else if (modeKey === 'spiritual') {
      setCurrentMode('spiritual');
      setActiveTab('spiritual');
      if (initialSubTab) {
        setSpiritualSubTab(initialSubTab as any);
      }
    } else if (modeKey === 'audio') {
      setCurrentMode('audio');
      setActiveTab(initialSubTab ? (initialSubTab as ActiveTab) : 'home');
    } else if (modeKey === 'games') {
      setCurrentMode('games');
      setActiveTab('games');
      if (initialSubTab) {
        setGamesSubTab(initialSubTab as any);
      }
    } else if (modeKey === 'space' || modeKey === 'morning') {
      setCurrentMode('space');
      setActiveTab('space');
      if (initialSubTab) {
        setSpaceSubTab(initialSubTab as any);
      }
    } else if (modeKey === 'messages') {
      setCurrentMode('messages');
      setActiveTab('messages');
      if (initialSubTab) {
        setMessageSubTab(initialSubTab as any);
      }
    } else if (modeKey === 'studio') {
      setCurrentMode('studio');
      setActiveTab('studio');
      if (initialSubTab) {
        setStudioSubTab(initialSubTab as any);
      }
    } else if (modeKey === 'finance') {
      setCurrentMode('finance');
      setActiveTab('finance');
      if (initialSubTab) {
        setFinanceSubTab(initialSubTab as any);
      }
    } else if (modeKey === 'admin') {
      setCurrentMode('admin');
      setActiveTab('admin');
      if (initialSubTab) {
        setAdminSubTab(initialSubTab as any);
      }
    } else if (modeKey === 'couple') {
      setCurrentMode('couple');
      setActiveTab('couple');
      if (initialSubTab) {
        setCoupleSubTab(initialSubTab as any);
      }
    } else if (modeKey === 'vip') {
      setCurrentMode('vip');
      setActiveTab('vip');
      if (initialSubTab) {
        setVipSubTab(initialSubTab as any);
      }
    } else if (modeKey === 'support') {
      setCurrentMode('support');
      setActiveTab('support');
    } else if (modeKey === 'profile') {
      setCurrentMode('profile');
      setActiveTab('profile');
      if (initialSubTab) {
        setProfileSubTab(initialSubTab as any);
      }
    } else if (modeKey === 'audio_library') {
      setCurrentMode('audio');
      setActiveTab('library');
    } else if (modeKey === 'family_tree') {
      setCurrentMode('family_tree');
      setActiveTab('family_tree' as any);
      if (initialSubTab) {
        setFamilyTreeSubTab(initialSubTab);
      }
    } else if (modeKey === 'haevy_lite') {
      setCurrentMode('haevy_lite');
      setActiveTab('haevy_lite' as any);
      if (initialSubTab) {
        setHaevyLiteSubTab(initialSubTab as any);
      } else {
        setHaevyLiteSubTab('shop');
      }
    } else if (modeKey === 'edu') {
      setCurrentMode('edu');
      setActiveTab('edu' as any);
      if (initialSubTab) {
        setEduSubTab(initialSubTab as any);
      }
    } else if (modeKey === 'maps') {
      setCurrentMode('maps');
      setActiveTab('maps' as any);
      if (initialSubTab) {
        setMapsSubTab(initialSubTab as any);
      }
    } else if (modeKey === 'internet') {
      setCurrentMode('internet');
      setActiveTab('internet' as any);
      if (initialSubTab) {
        setInternetSubTab(initialSubTab as any);
      }
    } else {
      setCurrentMode('portal');
      setActiveTab('portal');
    }
  };

  // Power User Fast Arrow Key Mode Navigation between Ecosystem Modes
  const navigateEcosystemMode = (direction: 'next' | 'prev') => {
    // Current index in MODES_CONFIG
    const currentIndex = MODES_CONFIG.findIndex(m => m.id === currentMode);
    const validCurrentIndex = currentIndex === -1 ? 0 : currentIndex;
    
    let nextIndex: number;
    if (direction === 'next') {
      nextIndex = (validCurrentIndex + 1) % MODES_CONFIG.length;
    } else {
      nextIndex = (validCurrentIndex - 1 + MODES_CONFIG.length) % MODES_CONFIG.length;
    }

    const nextModeConfig = MODES_CONFIG[nextIndex];
    if (!nextModeConfig) return;

    haptics.selection();
    setNavDirection(direction === 'next' ? 1 : -1);
    handleSelectMode(nextModeConfig.id);

    const arrowSymbol = direction === 'next' ? '→' : '←';
    triggerShortcutHUD(
      `${nextModeConfig.name}`,
      `Phân hệ ${nextIndex + 1}/${MODES_CONFIG.length} • Phím tắt ${arrowSymbol} (Alt + ${arrowSymbol})`
    );
  };

  // Shortcut Action Dispatcher (Callable from Keydown & Shortcut Modal)
  const handleShortcutAction = (action: string) => {
    switch (action) {
      case 'mode_next':
        navigateEcosystemMode('next');
        break;
      case 'mode_prev':
        navigateEcosystemMode('prev');
        break;
      case 'mode_edu':
        handleSelectMode('edu');
        triggerShortcutHUD('🎓 Haevy Edu', 'STEM Virtual Labs & Lộ Trình AI');
        break;
      case 'mode_internet':
        handleSelectMode('internet');
        triggerShortcutHUD('🌐 Haevy Internet', 'Trình Duyệt Web Đa Tab & AI Reader');
        break;
      case 'mode_haevy_lite':
        handleSelectMode('haevy_lite');
        triggerShortcutHUD('✨ Xu Haevy Lite', 'Combo Vũ Trụ & Hoạt Ảnh Động');
        break;
      case 'mode_family_tree':
        handleSelectMode('family_tree');
        triggerShortcutHUD('👑 Haevy Family Tree', 'Gia Phả Dòng Họ Thông Minh');
        break;
      case 'mode_space':
        handleSelectMode('space');
        triggerShortcutHUD('🌌 Haevy Space', 'Không gian 3D AR Vũ Trụ');
        break;
      case 'mode_finance':
        handleSelectMode('finance');
        triggerShortcutHUD('💰 Haevy Finance', 'Quản Lý Thu Chi & Tài Chính');
        break;
      case 'mode_haevy_ai':
        handleSelectMode('haevy_ai');
        triggerShortcutHUD('🧠 Haevy AI Master', 'Trợ Lý AI Toàn Năng');
        break;
      case 'mode_morning':
        setCurrentMode('audio');
        setActiveTab('morning');
        triggerShortcutHUD('☀️ Haevy Morning', 'Bắt đầu ngày mới tràn đầy năng lượng');
        break;
      case 'mode_spiritual':
        handleSelectMode('spiritual');
        triggerShortcutHUD('🔮 Haevy Spiritual', 'Tarot, Tử Vi & Sóng Âm');
        break;
      case 'mode_couple':
        handleSelectMode('couple');
        triggerShortcutHUD('💖 I Love Haevy', 'Không Gian Cặp Đôi Lãng Mạn');
        break;
      case 'mode_studio':
        handleSelectMode('studio');
        triggerShortcutHUD('🎙️ Haevy Studio', 'Phòng Thu AI Voice');
        break;
      case 'mode_games':
        handleSelectMode('games');
        triggerShortcutHUD('🎮 Haevy Games', 'Đấu Trường Giải Trí');
        break;
      case 'mode_vip':
        handleSelectMode('vip');
        triggerShortcutHUD('👑 Haevy VIP Club', 'Đặc Quyền Hội Viên');
        break;
      case 'mode_portal':
        handleSelectMode('portal');
        triggerShortcutHUD('🪐 Haevy Portal', 'Cổng Sinh Thái Toàn Diện');
        break;
      case 'open_mode_switcher':
        setIsModeSwitcherOpen(true);
        break;
      case 'finance_jars':
        setCurrentMode('finance');
        setActiveTab('finance');
        setFinanceSubTab('page2');
        setFinancePage2SubTab('budget');
        triggerShortcutHUD('🏺 6 Hũ Tiền & Ngân Sách 50/30/20', 'Phím tắt: Ctrl + G');
        break;
      case 'finance_add':
        setCurrentMode('finance');
        setActiveTab('finance');
        setOpenAddTransactionTrigger(Date.now());
        triggerShortcutHUD('➕ Thêm Khoản Thu Chi Mới', 'Phím tắt: Alt + N');
        break;
      case 'finance_wallets':
        setCurrentMode('finance');
        setActiveTab('finance');
        setOpenWalletsTrigger(Date.now());
        triggerShortcutHUD('💳 Quản Lý Danh Sách Ví & Tài Khoản', 'Phím tắt: Alt + W');
        break;
      case 'finance_savings':
        setCurrentMode('finance');
        setActiveTab('finance');
        setFinanceSubTab('page2');
        setFinancePage2SubTab('savings');
        triggerShortcutHUD('🐷 Mục Tiêu Tiết Kiệm & Tích Lũy', 'Phím tắt: Alt + S');
        break;
      case 'finance_debts':
        setCurrentMode('finance');
        setActiveTab('finance');
        setFinanceSubTab('page2');
        setFinancePage2SubTab('debts');
        triggerShortcutHUD('👥 Sổ Theo Dõi Vay Nợ & Trả Góp', 'Phím tắt: Alt + D');
        break;
      case 'finance_calculators':
        setCurrentMode('finance');
        setActiveTab('finance');
        setFinanceSubTab('page4');
        triggerShortcutHUD('🧮 Máy Tính Lãi Kép & Hoạch Định', 'Phím tắt: Alt + C');
        break;
      case 'finance_family':
        setCurrentMode('finance');
        setActiveTab('finance');
        setFinanceSubTab('page3');
        triggerShortcutHUD('👨‍👩‍👧 Quỹ Chung Gia Đình & Người Thương', 'Phím tắt: Alt + F');
        break;
      case 'media_play_pause':
        handleTogglePlay();
        break;
      case 'media_mute':
        setIsMuted(m => !m);
        triggerShortcutHUD(isMuted ? '🔊 Đã bật âm thanh' : '🔇 Đã tắt âm thanh');
        break;
      case 'media_fullscreen':
        handleToggleFullscreen();
        break;
      case 'media_next': {
        const idx = tracks.findIndex(t => t.id === currentTrack?.id);
        if (idx !== -1 && idx < tracks.length - 1) handlePlayTrack(tracks[idx + 1]);
        break;
      }
      case 'media_prev': {
        const idx = tracks.findIndex(t => t.id === currentTrack?.id);
        if (idx > 0) handlePlayTrack(tracks[idx - 1]);
        break;
      }
      case 'media_volume_up':
        setVolume(v => {
          const next = Math.min(1, Math.round((v + 0.1) * 10) / 10);
          triggerShortcutHUD(`🔊 Âm lượng: ${Math.round(next * 100)}%`);
          return next;
        });
        break;
      case 'media_volume_down':
        setVolume(v => {
          const next = Math.max(0, Math.round((v - 0.1) * 10) / 10);
          triggerShortcutHUD(`🔉 Âm lượng: ${Math.round(next * 100)}%`);
          return next;
        });
        break;
      case 'toggle_shortcuts':
        setIsShortcutsModalOpen(prev => !prev);
        break;
      case 'toggle_mode_switcher':
        setModeSwitcherViewMode('quick');
        setIsModeSwitcherOpen(prev => !prev);
        break;
      case 'close_modal':
        setIsShortcutsModalOpen(false);
        setIsModeSwitcherOpen(false);
        setIsAuthOpen(false);
        setIsNotificationsOpen(false);
        setIsInstallPwaOpen(false);
        setIsMoodModalOpen(false);
        break;
      default:
        break;
    }
  };

  // Keyboard shortcuts for desktop users (Customizable via Firestore shortcuts_config)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in inputs, textareas or contenteditable elements
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable || target.closest('input, textarea, [contenteditable="true"]'))) {
        return;
      }

      // Check if interactive full-screen modals are open that require arrow key isolation (e.g. search, auth, mood)
      const isInputModalOpen = isAuthOpen || isOmnibarOpen || isNotificationsOpen || isInstallPwaOpen || isMoodModalOpen || isLevelModalOpen || isGiftShopOpen;
      if (isInputModalOpen) {
        if (e.code === 'Escape') {
          setIsShortcutsModalOpen(false);
          setIsModeSwitcherOpen(false);
          setIsAuthOpen(false);
          setIsNotificationsOpen(false);
          setIsInstallPwaOpen(false);
          setIsMoodModalOpen(false);
          setIsLevelModalOpen(false);
          setIsGiftShopOpen(false);
          setIsOmnibarOpen(false);
        }
        return;
      }

      // Global shortcut Alt + M or Cmd + M: Unified Ecosystem Mode Switcher
      if ((e.altKey && (e.key === 'm' || e.key === 'M' || e.code === 'KeyM')) || (e.ctrlKey && e.shiftKey && (e.key === 'm' || e.key === 'M'))) {
        e.preventDefault();
        setModeSwitcherViewMode('quick');
        setIsModeSwitcherOpen(prev => !prev);
        return;
      }

      // -------------------------------------------------------------------------
      // Power User Desktop Arrow Key Navigation between Ecosystem Modes
      // Supported combinations:
      //  - Alt + ArrowRight / Alt + ArrowDown / Alt + ]: Next Mode
      //  - Alt + ArrowLeft  / Alt + ArrowUp   / Alt + [: Previous Mode
      //  - Ctrl + ArrowRight / Ctrl + ArrowDown / Ctrl + ] (outside text inputs)
      //  - Ctrl + ArrowLeft  / Ctrl + ArrowUp   / Ctrl + [ (outside text inputs)
      //  - Shift + Alt + ArrowRight / Shift + Alt + ArrowLeft
      //  - Standalone ArrowRight / ArrowLeft on Portal landing hub
      // -------------------------------------------------------------------------
      const isNextArrow = 
        (e.altKey && (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.code === 'ArrowRight' || e.code === 'ArrowDown' || e.code === 'BracketRight')) ||
        (e.ctrlKey && !e.shiftKey && (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.code === 'ArrowRight' || e.code === 'ArrowDown' || e.code === 'BracketRight')) ||
        (e.shiftKey && e.altKey && (e.key === 'ArrowRight' || e.code === 'ArrowRight')) ||
        (e.metaKey && (e.key === 'ArrowRight' || e.code === 'ArrowRight')) ||
        (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && currentMode === 'portal' && (e.key === 'ArrowRight' || e.code === 'ArrowRight'));

      const isPrevArrow = 
        (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.code === 'ArrowLeft' || e.code === 'ArrowUp' || e.code === 'BracketLeft')) ||
        (e.ctrlKey && !e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.code === 'ArrowLeft' || e.code === 'ArrowUp' || e.code === 'BracketLeft')) ||
        (e.shiftKey && e.altKey && (e.key === 'ArrowLeft' || e.code === 'ArrowLeft')) ||
        (e.metaKey && (e.key === 'ArrowLeft' || e.code === 'ArrowLeft')) ||
        (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && currentMode === 'portal' && (e.key === 'ArrowLeft' || e.code === 'ArrowLeft'));

      if (isNextArrow) {
        e.preventDefault();
        e.stopPropagation();
        navigateEcosystemMode('next');
        return;
      }

      if (isPrevArrow) {
        e.preventDefault();
        e.stopPropagation();
        navigateEcosystemMode('prev');
        return;
      }

      const activeConfig = shortcutsConfig || DEFAULT_SHORTCUTS_CONFIG;
      const configItems = Object.values(activeConfig);

      // Search matching dynamic shortcut
      for (const item of configItems) {
        if (matchShortcut(e, item)) {
          e.preventDefault();
          handleShortcutAction(item.action);
          return;
        }
      }

      // Fallback emergency handlers
      if (e.code === 'Escape') {
        setIsShortcutsModalOpen(false);
        setIsModeSwitcherOpen(false);
        setIsAuthOpen(false);
        setIsNotificationsOpen(false);
        setIsInstallPwaOpen(false);
        setIsMoodModalOpen(false);
        setIsLevelModalOpen(false);
        setIsGiftShopOpen(false);
        setIsOmnibarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const handleOpenFullModal = () => {
      setModeSwitcherViewMode('detailed');
      setIsModeSwitcherOpen(true);
    };
    const handleOpenQuick = () => {
      setModeSwitcherViewMode('quick');
      setIsModeSwitcherOpen(true);
    };
    const handleOpenMoodModal = () => {
      setIsMoodModalOpen(true);
    };
    const handleSyncEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.mode && detail.mode !== currentMode) {
        handleSelectMode(detail.mode, detail.initialTab);
      }
    };
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === MODE_STORAGE_KEY && e.newValue && e.newValue !== currentMode) {
        handleSelectMode(e.newValue);
      }
    };

    window.addEventListener('haevy-open-full-ecosystem-modal', handleOpenFullModal);
    window.addEventListener('haevy-open-quick-mode-switcher', handleOpenQuick);
    window.addEventListener('haevy-open-mood-modal', handleOpenMoodModal);
    window.addEventListener(MODE_SYNC_EVENT, handleSyncEvent);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('haevy-open-full-ecosystem-modal', handleOpenFullModal);
      window.removeEventListener('haevy-open-quick-mode-switcher', handleOpenQuick);
      window.removeEventListener('haevy-open-mood-modal', handleOpenMoodModal);
      window.removeEventListener(MODE_SYNC_EVENT, handleSyncEvent);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [
    currentTrack, 
    tracks, 
    isPlaying, 
    isMuted, 
    shortcutsConfig, 
    currentMode, 
    isAuthOpen, 
    isOmnibarOpen, 
    isNotificationsOpen, 
    isInstallPwaOpen, 
    isMoodModalOpen, 
    isLevelModalOpen, 
    isGiftShopOpen, 
    isModeSwitcherOpen, 
    isShortcutsModalOpen
  ]);

  const activeModeConfig = MODES_CONFIG.find(m => m.id === currentMode);

  // Tactile 'swipe-away' exit & entry animation properties for all ecosystem mode transitions
  const getSwipeMotionProps = () => ({
    initial: { 
      opacity: 0, 
      x: navDirection * 24, 
      scale: 0.99
    },
    animate: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: { 
        type: 'spring' as const, 
        damping: 32, 
        stiffness: 320, 
        mass: 0.65 
      } 
    },
    exit: { 
      opacity: 0, 
      x: -navDirection * 28, 
      scale: 0.99,
      transition: { 
        duration: 0.18, 
        ease: [0.32, 0.72, 0, 1] as const 
      } 
    },
  });

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden flex flex-col justify-start font-sans transition-colors duration-500 ease-in-out ${
      effectiveTheme === 'light'
        ? 'bg-slate-100/90 text-slate-900 selection:bg-amber-400/30 selection:text-amber-900'
        : 'bg-black text-zinc-100 selection:bg-amber-500/30 selection:text-amber-200'
    }`}>
      
      {/* ========================================================================= */}
      {/* HAEVY MOOD BACKGROUND ENGINE (ATMOSPHERIC CIRCADIAN & WEATHER BACKDROP)    */}
      {/* ========================================================================= */}
      <HaevyMoodBackground />
      <HaevyGlobalToast />

      {/* ========================================================================= */}
      {/* DEDICATED PLATFORM HEADERS (DESKTOP NAVBAR vs MOBILE TOUCH HEADER) */}
      {/* ========================================================================= */}
      {isDesktop ? (
        <header className="w-full bg-zinc-950/95 backdrop-blur-2xl border-b border-zinc-800/80 sticky top-0 z-[60] px-3 sm:px-6 shadow-xl">
          <Navbar
            currentMode={currentMode as EcosystemMode}
            onSelectMode={(mode, initialTab) => {
              handleSelectMode(mode, initialTab as string);
            }}
            onOpenEcosystemDrawer={() => {
              setModeSwitcherViewMode('quick');
              setIsModeSwitcherOpen(true);
            }}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenAuth={() => handleOpenAuth('signin')}
            onOpenStudioAudio={() => setCurrentMode('studio')}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onToggleFullscreen={handleToggleFullscreen}
            isFullscreen={isFullscreen}
            onOpenInstallPwa={() => setIsInstallPwaOpen(true)}
            onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
            onToggleVoiceListen={toggleVoiceListening}
            isVoiceListening={isVoiceListening}
            onUserMenuToggle={setIsUserMenuOpen}
            tracks={tracks}
            onPlayTrack={handlePlayTrack}
          />
        </header>
      ) : (
        <MobileHeader
          currentMode={currentMode as EcosystemMode}
          onOpenEcosystemDrawer={() => {
            setModeSwitcherViewMode('quick');
            setIsModeSwitcherOpen(true);
          }}
          onSelectMode={(mode, initialTab) => {
            handleSelectMode(mode, initialTab as string);
          }}
          onSelectTab={setActiveTab}
          onOpenSearch={() => setIsOmnibarOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenAuth={() => handleOpenAuth('signin')}
          onToggleUserMenu={() => setIsUserMenuOpen(prev => !prev)}
          isUserMenuOpen={isUserMenuOpen}
          onOpenInstallPwa={() => setIsInstallPwaOpen(true)}
        />
      )}

      {/* Global Synchronized Mode Transition HUD */}
      <HaevyModeTransitionOverlay />

      {/* Global Unified Synchronized Ecosystem Mode Switcher & Showcase Modal (Alt + M) */}
      <HaevyEcosystemQuickSwitcherModal
        isOpen={isModeSwitcherOpen}
        onClose={() => setIsModeSwitcherOpen(false)}
        currentMode={currentMode as EcosystemMode}
        initialViewMode={modeSwitcherViewMode}
        onSelectMode={(mode, initialTab) => {
          handleSelectMode(mode, initialTab as string);
          setIsModeSwitcherOpen(false);
        }}
      />

      {/* ========================================================================= */}
      {/* ACTIVE MODE VIEW RENDERING (WITH RESPONSIVE DESKTOP LAYOUT & SMOOTH MOTION) */}
      {/* ========================================================================= */}
      <AnimatePresence mode="wait" initial={false}>
        {currentMode === 'portal' ? (
          <motion.main
            key="mode-portal"
            {...getSwipeMotionProps()}
            className="w-full flex flex-col items-center flex-1"
          >
            {isDesktop ? (
              <div className="w-full flex-1 flex flex-row items-start justify-center max-w-[1700px] mx-auto px-0 lg:px-4">
                <DesktopSidebar
                  currentMode={currentMode as EcosystemMode}
                  onSelectMode={(mode, initialTab) => {
                    handleSelectMode(mode);
                    if (initialTab) setActiveTab(initialTab);
                  }}
                  activeTab={activeTab}
                  onSelectTab={setActiveTab}
                  onOpenAuth={() => handleOpenAuth('signin')}
                  onOpenAnonPass={() => handleOpenAuth('anonymous')}
                  onOpenStudioAudio={() => handleSelectMode('studio')}
                  onOpenVipHub={() => handleSelectMode('vip')}
                  allTracks={tracks}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayTrack={handlePlayTrack}
                  onTogglePlay={handleTogglePlay}
                  financeSubTab={financeSubTab}
                  onSelectFinanceSubTab={setFinanceSubTab}
                  eduSubTab={eduSubTab}
                  onSelectEduSubTab={setEduSubTab}
                  messageSubTab={messageSubTab}
                  onSelectMessageSubTab={setMessageSubTab}
                  coupleSubTab={coupleSubTab}
                  onSelectCoupleSubTab={setCoupleSubTab}
                  gamesSubTab={gamesSubTab}
                  onSelectGamesSubTab={setGamesSubTab}
                  haevyAISubTab={haevyAISubTab}
                  onSelectHaevyAISubTab={setHaevyAISubTab}
                  familyTreeSubTab={familyTreeSubTab as any}
                  onSelectFamilyTreeSubTab={(sub) => setFamilyTreeSubTab(sub as any)}
                  spiritualSubTab={spiritualSubTab as any}
                  onSelectSpiritualSubTab={(sub) => setSpiritualSubTab(sub as any)}
                  haevyLiteSubTab={haevyLiteSubTab}
                  onSelectHaevyLiteSubTab={setHaevyLiteSubTab}
                  adminSubTab={adminSubTab}
                  onSelectAdminSubTab={setAdminSubTab}
                  studioSubTab={studioSubTab}
                  onSelectStudioSubTab={setStudioSubTab}
                  mapsSubTab={mapsSubTab}
                  onSelectMapsSubTab={setMapsSubTab}
                  internetSubTab={internetSubTab}
                  onSelectInternetSubTab={setInternetSubTab}
                  spaceSubTab={spaceSubTab}
                  onSelectSpaceSubTab={setSpaceSubTab}
                  vipSubTab={vipSubTab}
                  onSelectVipSubTab={setVipSubTab}
                />
                <main className="w-full flex flex-col items-center flex-1 min-w-0 pb-28">
                  <HaevyEcosystemLandingView
                    onOpenAuth={handleOpenAuth}
                    onOpenNotifications={() => setIsNotificationsOpen(true)}
                    unreadNotificationCount={0}
                    onToggleFullscreen={handleToggleFullscreen}
                    isFullscreen={isFullscreen}
                    onSelectMode={handleSelectMode}
                    onToggleVoiceListen={toggleVoiceListening}
                    isVoiceListening={isVoiceListening}
                    isDesktop={true}
                    onOpenOnboardingTour={() => setIsOnboardingTourOpen(true)}
                  />
                </main>
              </div>
            ) : (
              <HaevyEcosystemLandingView
                onOpenAuth={handleOpenAuth}
                onOpenNotifications={() => setIsNotificationsOpen(true)}
                unreadNotificationCount={0}
                onToggleFullscreen={handleToggleFullscreen}
                isFullscreen={isFullscreen}
                onSelectMode={handleSelectMode}
                onToggleVoiceListen={toggleVoiceListening}
                isVoiceListening={isVoiceListening}
                isDesktop={false}
                onOpenOnboardingTour={() => setIsOnboardingTourOpen(true)}
              />
            )}

            {/* Floating Persistent Quick Note Input in Haevy Portal */}
            <FloatingQuickNoteWidget
              onNavigateToAI={(prompt, subTab) => {
                if (prompt) setAiInitialPrompt(prompt);
                if (subTab) setHaevyAISubTab(subTab as any);
                handleSelectMode('haevy_ai', subTab || 'chat');
              }}
            />

            {/* Step-by-Step Interactive Spotlight Onboarding Walkthrough */}
            <HaevyPortalOnboardingTour
              isOpen={isOnboardingTourOpen}
              onClose={() => setIsOnboardingTourOpen(false)}
              onToggleVoiceListen={toggleVoiceListening}
              isVoiceListening={isVoiceListening}
              onSimulateVoiceCommand={(cmd) => {
                triggerShortcutHUD(
                  `🎙️ Giọng nói AI: "${cmd}"`,
                  'Đã nhận diện lệnh mẫu · Kích hoạt không gian thính giác 24-bit'
                );
                if (tracks.length > 0 && !isPlaying) {
                  handlePlayTrack(tracks[0]);
                }
              }}
              onTriggerDemoAction={(stepId: OnboardingStepId) => {
                if (stepId === 'living-portrait') {
                  window.dispatchEvent(new CustomEvent('haevy-onboarding-demo-portrait'));
                  triggerShortcutHUD(
                    'Chân dung Sống động 3D',
                    'Đã chuyển bối cảnh & phát hợp âm tần số Chiaroscuro'
                  );
                } else if (stepId === 'floating-dock') {
                  window.dispatchEvent(new CustomEvent('haevy-onboarding-demo-dock'));
                  triggerShortcutHUD(
                    'Floating Dock Thông minh',
                    'Đã chuyển đổi chế độ Thu gọn / Mở rộng (Phím tắt Alt + M)'
                  );
                } else if (stepId === 'ecosystem-bento') {
                  window.dispatchEvent(new CustomEvent('haevy-onboarding-demo-bento'));
                  triggerShortcutHUD(
                    'Kiến trúc 12 Phân hệ',
                    'Đã chuyển bộ lọc nhóm không gian chuyên biệt'
                  );
                } else if (stepId === 'floating-widgets') {
                  window.dispatchEvent(new CustomEvent('haevy-onboarding-demo-quicknote'));
                  triggerShortcutHUD(
                    'Sổ tay Ghi chú Nhanh & AI Nổi',
                    'Đã bật khung ghi chú tức thì ở góc dưới màn hình'
                  );
                }
              }}
            />
          </motion.main>
        ) : currentMode === 'space' ? (
          <motion.main
            key="mode-space"
            {...getSwipeMotionProps()}
            className="w-full max-w-full flex flex-col items-center flex-1 no-swipe overflow-x-hidden select-none touch-pan-y overscroll-x-none"
            data-no-swipe="true"
          >
            <div className="w-full max-w-full h-full flex flex-col no-swipe overflow-x-hidden touch-pan-y overscroll-x-none" data-no-swipe="true">
              <React.Suspense fallback={<SubsystemLoadingFallback subsystemName="Haevy Space 3D" subtitle="Đang nạp không gian 3D AR & Three.js..." />}>
                <HaevyMorningView
                  allTracks={tracks}
                  currentTrack={currentTrack}
                  isPlayingTrack={isPlaying}
                  onPlayTrack={handlePlayTrack}
                  onToggleTrackPlay={handleTogglePlay}
                  onOpenAuth={() => handleOpenAuth('signin')}
                  onGoToAudioHome={() => setCurrentMode('audio')}
                  onShareToCommunity={() => setCurrentMode('messages')}
                  onOpenEcosystemDrawer={() => setIsModeSwitcherOpen(true)}
                  onOpenInstallPwa={() => setIsInstallPwaOpen(true)}
                  onOpenNotifications={() => setIsNotificationsOpen(true)}
                  onToggleFullscreen={handleToggleFullscreen}
                  isFullscreen={isFullscreen}
                  onSelectMode={handleSelectMode}
                  activeSubTab={spaceSubTab}
                />
              </React.Suspense>
            </div>
          </motion.main>
        ) : currentMode === 'haevy_ai' ? (
          <motion.main
            key="mode-haevy_ai"
            {...getSwipeMotionProps()}
            className="w-full flex-1 flex flex-col items-center p-0 m-0 overflow-hidden"
          >
            <React.Suspense fallback={
              <SubsystemLoadingFallback
                subsystemName="Haevy AI Super Hub"
                subtitle="Đang khởi tạo Gemini AI, trợ lý học tập & trung tâm tri thức..."
                icon={<BrainCircuit size={26} className="text-amber-400 animate-pulse" />}
              />
            }>
              <HaevyAIHubView
                onBackToPortal={() => setCurrentMode('portal')}
                onSelectMode={handleSelectMode}
                onSelectTab={(tab) => setActiveTab(tab as any)}
                onOpenAuth={() => handleOpenAuth('signin')}
                activeSubTab={haevyAISubTab}
                onSelectSubTab={setHaevyAISubTab}
                onPlayTrack={handlePlayTrack}
                onOpenEcosystemDrawer={() => setIsModeSwitcherOpen(true)}
                onOpenNotifications={() => setIsNotificationsOpen(true)}
                initialPrompt={aiInitialPrompt || undefined}
                onClearInitialPrompt={() => setAiInitialPrompt(null)}
              />
            </React.Suspense>
          </motion.main>
        ) : (
          <motion.div
            key="mode-standard-shell"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full flex-1 flex flex-row items-start justify-center max-w-[1700px] mx-auto px-0 lg:px-4"
          >
            {/* Desktop Intuitive Pro Sidebar (Rendered exclusively for Desktop platform) */}
            {isDesktop && (
              <DesktopSidebar
                currentMode={currentMode as EcosystemMode}
                onSelectMode={(mode, initialTab) => {
                  handleSelectMode(mode);
                  if (initialTab) setActiveTab(initialTab);
                }}
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                onOpenAuth={() => handleOpenAuth('signin')}
                onOpenAnonPass={() => {}}
                onOpenStudioAudio={() => handleSelectMode('studio')}
                onOpenVipHub={() => handleSelectMode('vip')}
                allTracks={tracks}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlayTrack={handlePlayTrack}
                onTogglePlay={handleTogglePlay}
                financeSubTab={financeSubTab}
                onSelectFinanceSubTab={setFinanceSubTab}
                eduSubTab={eduSubTab}
                onSelectEduSubTab={setEduSubTab}
                messageSubTab={messageSubTab}
                onSelectMessageSubTab={setMessageSubTab}
                coupleSubTab={coupleSubTab}
                onSelectCoupleSubTab={setCoupleSubTab}
                gamesSubTab={gamesSubTab}
                onSelectGamesSubTab={setGamesSubTab}
                haevyAISubTab={haevyAISubTab}
                onSelectHaevyAISubTab={setHaevyAISubTab}
                familyTreeSubTab={familyTreeSubTab as any}
                onSelectFamilyTreeSubTab={(sub) => setFamilyTreeSubTab(sub as any)}
                spiritualSubTab={spiritualSubTab as any}
                onSelectSpiritualSubTab={(sub) => setSpiritualSubTab(sub as any)}
                haevyLiteSubTab={haevyLiteSubTab}
                onSelectHaevyLiteSubTab={setHaevyLiteSubTab}
                adminSubTab={adminSubTab}
                onSelectAdminSubTab={setAdminSubTab}
                studioSubTab={studioSubTab}
                onSelectStudioSubTab={setStudioSubTab}
                mapsSubTab={mapsSubTab}
                onSelectMapsSubTab={setMapsSubTab}
                internetSubTab={internetSubTab}
                onSelectInternetSubTab={setInternetSubTab}
                spaceSubTab={spaceSubTab}
                onSelectSpaceSubTab={setSpaceSubTab}
                vipSubTab={vipSubTab}
                onSelectVipSubTab={setVipSubTab}
              />
            )}

            {/* Main Content Area for Desktop & Mobile with Smooth Mode Transitions */}
            <main className={`w-full flex flex-col items-center flex-1 min-w-0 ${currentTrack ? 'pb-44 sm:pb-36' : 'pb-36 sm:pb-28'}`}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentMode}
                  {...getSwipeMotionProps()}
                  className="w-full flex flex-col items-center"
                >
                  {/* 1. Haevy Audio */}
                  {currentMode === 'audio' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-36">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={activeTab}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.18 }}
                        >
                          {activeTab === 'home' && (
                            <HomeView
                              tracks={tracks}
                              currentTrack={currentTrack}
                              isPlaying={isPlaying}
                              onPlayTrack={handlePlayTrack}
                              onTogglePlay={handleTogglePlay}
                              isLoading={isLoadingTracks}
                              onSelectTab={(tab: ActiveTab) => {
                                if (tab === 'library') setActiveTab('library');
                                else if (tab === 'community') setActiveTab('community');
                                else if (tab === 'player') setActiveTab('player');
                                else if (tab === 'studio') setCurrentMode('studio');
                                else if (tab === 'messages') setCurrentMode('messages');
                                else if (tab === 'vip') setCurrentMode('vip');
                                else setActiveTab(tab);
                              }}
                              onFilterGenre={(genre) => {
                                setSelectedGenre(genre);
                                setActiveTab('library');
                              }}
                              onOpenAuth={() => handleOpenAuth('signin')}
                              onOpenPublishAudio={() => setCurrentMode('studio')}
                            />
                          )}

                          {activeTab === 'library' && (
                            <AudioLibraryView
                              tracks={tracks}
                              currentTrack={currentTrack}
                              isPlaying={isPlaying}
                              onPlayTrack={handlePlayTrack}
                              onTogglePlay={handleTogglePlay}
                              isLoading={isLoadingTracks}
                              onOpenAuth={() => handleOpenAuth('signin')}
                              onOpenPublishAudio={() => setCurrentMode('studio')}
                              selectedGenre={selectedGenre}
                              onSelectGenre={setSelectedGenre}
                              onRefreshCustomTracks={refetchTracks}
                            />
                          )}

                          {activeTab === 'community' && (
                            <CommunityView
                              tracks={tracks}
                              currentTrack={currentTrack}
                              isPlaying={isPlaying}
                              onPlayTrack={handlePlayTrack}
                              onOpenAuth={() => handleOpenAuth('signin')}
                            />
                          )}

                          {activeTab === 'player' && (
                            <AudioPlayer
                              playlist={tracks}
                              currentTrack={currentTrack}
                              isPlaying={isPlaying}
                              progress={progress}
                              duration={duration}
                              volume={volume}
                              isMuted={isMuted}
                              onTogglePlay={handleTogglePlay}
                              onPlayNext={() => {
                                const idx = tracks.findIndex(t => t.id === currentTrack?.id);
                                if (idx !== -1 && idx < tracks.length - 1) handlePlayTrack(tracks[idx + 1]);
                              }}
                              onPlayPrev={() => {
                                const idx = tracks.findIndex(t => t.id === currentTrack?.id);
                                if (idx > 0) handlePlayTrack(tracks[idx - 1]);
                              }}
                              onSeek={(val) => setProgress(val)}
                              onVolumeChange={(val) => setVolume(val)}
                              onToggleMute={() => setIsMuted(!isMuted)}
                              onSelectTrack={handlePlayTrack}
                              onOpenAuth={() => handleOpenAuth('signin')}
                              onOpenVipHub={() => setCurrentMode('vip')}
                              shuffleMode={shuffleMode}
                              repeatMode={repeatMode}
                              onToggleShuffle={() => setShuffleMode(s => s === 'smart_shuffle' ? 'shuffle' : s === 'shuffle' ? 'off' : 'smart_shuffle')}
                              onToggleRepeat={() => setRepeatMode(r => r === 'off' ? 'all' : r === 'all' ? 'one' : 'off')}
                              onOpenGiftShop={(authorData) => {
                                setSelectedGiftAuthor(authorData);
                                setIsGiftShopOpen(true);
                              }}
                            />
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  )}

                  {currentMode === 'audio_library' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-36">
                      <AudioLibraryView
                        tracks={tracks}
                        currentTrack={currentTrack}
                        isPlaying={isPlaying}
                        onPlayTrack={handlePlayTrack}
                        onTogglePlay={handleTogglePlay}
                        onOpenAuth={() => handleOpenAuth('signin')}
                        onOpenPublishAudio={() => setCurrentMode('studio')}
                        selectedGenre={selectedGenre}
                        onSelectGenre={setSelectedGenre}
                      />
                    </div>
                  )}

                  {/* 3. Haevy Message */}
                  {currentMode === 'messages' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-36">
                      <React.Suspense fallback={
                        <SubsystemLoadingFallback
                          subsystemName="Haevy Message & Bạn Bè"
                          subtitle="Đang kết nối danh bạ cộng đồng & tin nhắn..."
                          icon={<MessageSquare size={26} className="text-pink-400 animate-pulse" />}
                        />
                      }>
                        <MessagesFriendsView
                          tracks={tracks}
                          currentTrack={currentTrack}
                          onPlayTrack={handlePlayTrack}
                          onOpenAuth={() => handleOpenAuth('signin')}
                          activeSubTab={messageSubTab}
                          onSelectSubTab={setMessageSubTab}
                          onNavigateToMode={handleNavigateToMode}
                        />
                      </React.Suspense>
                    </div>
                  )}

                  {/* 4. Haevy Studio */}
                  {currentMode === 'studio' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-36">
                      <React.Suspense fallback={
                        <SubsystemLoadingFallback
                          subsystemName="Haevy Studio"
                          subtitle="Đang mở phòng thu & studio xuất bản âm nhạc..."
                          icon={<Sparkles size={26} className="text-amber-400" />}
                        />
                      }>
                        <HaevyStudioView
                          activeSubTab={studioSubTab}
                          onSelectSubTab={setStudioSubTab}
                        />
                      </React.Suspense>
                    </div>
                  )}

                  {/* 5. Haevy Finance */}
                  {currentMode === 'finance' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-36">
                      <React.Suspense fallback={
                        <SubsystemLoadingFallback
                          subsystemName="Haevy Finance"
                          subtitle="Đang đồng bộ hóa ví ngân sách & quản lý chi tiêu..."
                          icon={<Wallet size={26} className="text-emerald-400" />}
                        />
                      }>
                        <FinanceView
                          currentUserId={user?.uid}
                          isVip={isVip}
                          onUpgradeVip={() => setCurrentMode('vip')}
                          activePage={financeSubTab}
                          onSelectPage={setFinanceSubTab}
                          initialPage2SubTab={financePage2SubTab}
                          openWalletsTrigger={openWalletsTrigger}
                          openAddTransactionTrigger={openAddTransactionTrigger}
                        />
                      </React.Suspense>
                    </div>
                  )}

                  {/* 6. Haevy Admin */}
                  {currentMode === 'admin' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-36">
                      <React.Suspense fallback={
                        <SubsystemLoadingFallback
                          subsystemName="Haevy Admin Dashboard"
                          subtitle="Đang tải bảng điều khiển quản trị hệ thống..."
                          icon={<ShieldCheck size={26} className="text-amber-400" />}
                        />
                      }>
                        <AdminDashboardView
                          allTracks={tracks}
                          onPlayTrack={handlePlayTrack}
                          onBackToHome={() => setCurrentMode('portal')}
                          onOpenAuth={() => handleOpenAuth('signin')}
                          adminSubTab={adminSubTab}
                          onSelectAdminSubTab={setAdminSubTab}
                        />
                      </React.Suspense>
                    </div>
                  )}

                  {/* 7. I Love Haevy */}
                  {currentMode === 'couple' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-36">
                      <React.Suspense fallback={
                        <SubsystemLoadingFallback
                          subsystemName="I Love Haevy (Couple Romance)"
                          subtitle="Đang kết nối không gian tình yêu & kỷ niệm đôi lứa..."
                          icon={<Heart size={26} className="text-rose-400 fill-rose-400 animate-pulse" />}
                        />
                      }>
                        <CoupleRomanceView
                          tracks={tracks}
                          currentTrack={currentTrack}
                          onPlayTrack={handlePlayTrack}
                          onOpenAuth={() => handleOpenAuth('signin')}
                          activePage={coupleSubTab}
                          onSelectPage={setCoupleSubTab}
                          onNavigateToMode={handleNavigateToMode}
                        />
                      </React.Suspense>
                    </div>
                  )}

                  {/* 8. Haevy VIP */}
                  {currentMode === 'vip' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-36">
                      <React.Suspense fallback={
                        <SubsystemLoadingFallback
                          subsystemName="Haevy VIP Hub"
                          subtitle="Đang nạp cổng nạp sao & đặc quyền thành viên VIP..."
                          icon={<Crown size={26} className="text-amber-400 animate-bounce" />}
                        />
                      }>
                        <VipTopupView
                          onOpenAuth={() => handleOpenAuth('signin')}
                          onGoToProfile={() => setCurrentMode('profile')}
                          activePage={vipSubTab}
                          onSelectPage={setVipSubTab}
                          onNavigateMode={handleNavigateToMode}
                        />
                      </React.Suspense>
                    </div>
                  )}

                  {/* 9. Haevy Support */}
                  {currentMode === 'support' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-36">
                      <React.Suspense fallback={
                        <SubsystemLoadingFallback
                          subsystemName="Haevy Support Center"
                          subtitle="Đang tải cổng hỗ trợ kỹ thuật & hướng dẫn..."
                          icon={<LifeBuoy size={26} className="text-sky-400" />}
                        />
                      }>
                        <HaevySupportView
                          onBackToPortal={() => setCurrentMode('portal')}
                          onOpenAuth={() => handleOpenAuth('signin')}
                          onSelectMode={handleSelectMode}
                        />
                      </React.Suspense>
                    </div>
                  )}

                  {/* 10. Haevy Spiritual (Tarot, Tử Vi, Chiêm Tinh, Sóng Âm Solfeggio) */}
                  {currentMode === 'spiritual' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-36">
                      <React.Suspense fallback={
                        <SubsystemLoadingFallback
                          subsystemName="Haevy Spiritual Universe"
                          subtitle="Đang kết nối trường năng lượng Tarot, Tử Vi & sóng Solfeggio..."
                          icon={<Moon size={26} className="text-purple-400 animate-pulse" />}
                        />
                      }>
                        <HaevySpiritualView
                          initialSubTab={spiritualSubTab}
                          onSubTabChange={(tab) => setSpiritualSubTab(tab as any)}
                          onNavigateToMode={handleNavigateToMode}
                          onEarnCoins={(amount, reason) => {
                            if (addAudioPoints) {
                              addAudioPoints(amount, reason, 'bonus');
                            }
                          }}
                        />
                      </React.Suspense>
                    </div>
                  )}

                  {/* 11. Haevy Family Tree (Gia Phả Dòng Họ & Sơ Đồ Cây Tương Tác) */}
                  {currentMode === 'family_tree' && (
                    <div className="w-full max-w-7xl px-0 sm:px-4 py-2 pb-36">
                      <React.Suspense fallback={
                        <SubsystemLoadingFallback
                          subsystemName="Haevy Family Tree (Gia Phả Dòng Họ)"
                          subtitle="Đang tải sơ đồ cây phả hệ, AI Phả Tuệ & dữ liệu gia tộc..."
                          icon={<GitFork size={26} className="text-amber-400 animate-pulse" />}
                        />
                      }>
                        <HaevyFamilyTreeView
                          onBackToPortal={() => setCurrentMode('portal')}
                          tracks={tracks}
                          onPlayTrack={handlePlayTrack}
                          onNavigateToMode={handleNavigateToMode}
                          activeTabControlled={familyTreeSubTab}
                          onTabChange={(tab) => setFamilyTreeSubTab(tab)}
                        />
                      </React.Suspense>
                    </div>
                  )}

                  {/* 12. Haevy Lite Coins & Cosmic Theme Bundle Hub */}
                  {currentMode === 'haevy_lite' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-36">
                      <React.Suspense fallback={
                        <SubsystemLoadingFallback
                          subsystemName="Haevy Lite Hub"
                          subtitle="Đang tải bộ sưu tập giao diện & vũ trụ ngân hà..."
                          icon={<Coins size={26} className="text-amber-400" />}
                        />
                      }>
                        <HaevyLiteHubView
                          activeTabControlled={haevyLiteSubTab}
                          onTabChange={setHaevyLiteSubTab}
                          onBackToPortal={() => setCurrentMode('portal')}
                          onGoToProfile={() => setCurrentMode('profile')}
                          onOpenAuth={() => handleOpenAuth('signin')}
                        />
                      </React.Suspense>
                    </div>
                  )}

                  {/* 13. Haevy Games (Đấu Trường Mini-Game Âm Nhạc & Bài Hát) */}
                  {currentMode === 'games' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-36">
                      <React.Suspense fallback={
                        <SubsystemLoadingFallback
                          subsystemName="Haevy Games Arena"
                          subtitle="Đang nạp đấu trường âm nhạc & minigames giải trí..."
                          icon={<Gamepad2 size={26} className="text-violet-400 animate-pulse" />}
                        />
                      }>
                        <HaevyGamesView
                          activeSubTab={gamesSubTab}
                          onSelectSubTab={setGamesSubTab}
                          onOpenAuth={() => handleOpenAuth('signin')}
                          onOpenVipHub={() => handleSelectMode('vip')}
                        />
                      </React.Suspense>
                    </div>
                  )}

                  {/* 14. Haevy Edu (Phòng Lab STEM & Lộ Trình First Principles) */}
                  {currentMode === 'edu' && (
                    <div className="w-full max-w-7xl px-0 sm:px-4 py-2 pb-36 no-swipe touch-pan-y" data-no-swipe="true">
                      <React.Suspense fallback={
                        <SubsystemLoadingFallback
                          subsystemName="Haevy Edu & STEM Lab"
                          subtitle="Đang tải phòng thí nghiệm mô phỏng 3D & âm thanh tập trung..."
                          icon={<GraduationCap size={26} className="text-amber-400" />}
                        />
                      }>
                        <HaevyEduView
                          onBackToLanding={() => setCurrentMode('portal')}
                          activeTabControlled={eduSubTab}
                          onTabChange={setEduSubTab}
                          onOpenHaevyAi={() => setCurrentMode('haevy_ai')}
                        />
                      </React.Suspense>
                    </div>
                  )}

                  {/* 15. Haevy Maps (Bản Đồ Định Vị Gia Đình & Bạn Đời) */}
                  {currentMode === 'maps' && (
                    <div className="w-full max-w-7xl px-0 sm:px-4 py-2 pb-32 no-swipe" data-no-swipe="true">
                      <React.Suspense fallback={
                        <SubsystemLoadingFallback
                          subsystemName="Haevy Maps"
                          subtitle="Đang nạp định vị GPS & bản đồ tương tác gia đình..."
                          icon={<MapPin size={26} className="text-emerald-400 animate-bounce" />}
                        />
                      }>
                        <HaevyMapsView
                          activeCategoryControlled={mapsSubTab}
                          onCategoryChange={(cat) => setMapsSubTab(cat)}
                          onBackToPortal={() => setCurrentMode('portal')}
                        />
                      </React.Suspense>
                    </div>
                  )}

                  {/* 16. Haevy Internet (Trình Duyệt Web & AI Reader Tách Từ Haevy AI) */}
                  {currentMode === 'internet' && (
                    <div className="w-full max-w-7xl px-0 sm:px-4 py-2 pb-32 no-swipe" data-no-swipe="true">
                      <React.Suspense fallback={
                        <SubsystemLoadingFallback
                          subsystemName="Haevy Internet"
                          subtitle="Đang nạp trình duyệt web an toàn & AI Reader..."
                          icon={<Globe size={26} className="text-teal-400" />}
                        />
                      }>
                        <HaevyInternetView
                          initialSubTab={internetSubTab}
                          onSubTabChange={setInternetSubTab}
                          onBackToPortal={() => setCurrentMode('portal')}
                          onOpenAuth={() => handleOpenAuth('signin')}
                          onNavigateToMode={(mode, tab) => handleSelectMode(mode as EcosystemMode, tab as any)}
                          onAskAIAboutPage={(title, url, content) => {
                            setAiInitialPrompt(`Phân tích và tóm tắt chi tiết trang web sau:\nTiêu đề: ${title}\nURL: ${url}\nNội dung:\n${content.slice(0, 3000)}`);
                            handleSelectMode('haevy_ai');
                          }}
                        />
                      </React.Suspense>
                    </div>
                  )}

                  {/* User Profile subview */}
                  {currentMode === 'profile' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-36">
                      <React.Suspense fallback={
                        <SubsystemLoadingFallback
                          subsystemName="Hồ Sơ Cá Nhân"
                          subtitle="Đang nạp thông tin người dùng & đặc quyền cấp bậc..."
                          icon={<UserIcon size={26} className="text-amber-400" />}
                        />
                      }>
                        <UserProfileView
                          initialTab={profileSubTab}
                          onOpenAuth={(tab) => handleOpenAuth(tab || 'signin')}
                          onGoToTopup={() => setCurrentMode('vip')}
                          onGoToHome={() => setCurrentMode('portal')}
                          onGoToAudio={() => setCurrentMode('audio')}
                          tracks={tracks}
                          onPlayTrack={handlePlayTrack}
                          onTogglePlay={() => setIsPlaying(!isPlaying)}
                          currentTrack={currentTrack}
                          isPlaying={isPlaying}
                          onOpenAuthorStudio={() => handleSelectMode('studio')}
                          onOpenAdmin={() => setCurrentMode('admin')}
                          onGoToHaevyLite={() => handleSelectMode('haevy_lite')}
                        />
                      </React.Suspense>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Haevy AI Floating Assistant Widget (Available in all screens except full Haevy AI mode) */}
      {currentMode !== 'haevy_ai' && (
        <HaevyAIFloatingWidget
          currentMode={currentMode}
          activeTab={activeTab}
          onOpenFullAI={(subTab, prompt) => {
            if (prompt) {
              setAiInitialPrompt(prompt);
            }
            setHaevyAISubTab(subTab || 'chat');
            handleSelectMode('haevy_ai', subTab || 'chat');
          }}
          onSelectMode={handleSelectMode}
          onSelectTab={(tab) => setActiveTab(tab as any)}
          onToggleVoiceListening={toggleVoiceListening}
          isVoiceListening={isVoiceListening}
          hasActiveTrack={Boolean(currentTrack)}
        />
      )}

      {/* ========================================================================= */}
      {/* DEDICATED PLATFORM BOTTOM BARS (MOBILE DOCKED TASKBAR vs DESKTOP PRO PLAYER) */}
      {/* ========================================================================= */}

      {/* MOBILE ONLY: Consolidated Bottom Taskbar with Docked Subtabs & Mini Player */}
      {isMobile && currentMode !== 'portal' && currentMode !== 'space' && activeTab !== 'player' && !isUserMenuOpen && (
        <BottomTaskbar
          currentMode={currentMode as EcosystemMode}
          onSelectMode={(mode, initialTab) => {
            handleSelectMode(mode, initialTab as string);
          }}
          onOpenModesSlider={() => {
            setModeSwitcherViewMode('quick');
            setIsModeSwitcherOpen(true);
          }}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          messageSubTab={messageSubTab}
          onSelectMessageSubTab={setMessageSubTab}
          coupleSubTab={coupleSubTab}
          onSelectCoupleSubTab={setCoupleSubTab}
          financeSubTab={financeSubTab}
          onSelectFinanceSubTab={setFinanceSubTab}
          adminSubTab={adminSubTab}
          onSelectAdminSubTab={setAdminSubTab}
          studioSubTab={studioSubTab}
          onSelectStudioSubTab={setStudioSubTab}
          vipSubTab={vipSubTab}
          onSelectVipSubTab={setVipSubTab}
          haevyAISubTab={haevyAISubTab}
          onSelectHaevyAISubTab={setHaevyAISubTab}
          spiritualSubTab={spiritualSubTab as any}
          onSelectSpiritualSubTab={(tab) => setSpiritualSubTab(tab as any)}
          haevyLiteSubTab={haevyLiteSubTab}
          onSelectHaevyLiteSubTab={setHaevyLiteSubTab}
          profileSubTab={profileSubTab}
          onSelectProfileSubTab={setProfileSubTab}
          eduSubTab={eduSubTab}
          onSelectEduSubTab={setEduSubTab}
          mapsSubTab={mapsSubTab}
          onSelectMapsSubTab={setMapsSubTab}
          internetSubTab={internetSubTab}
          onSelectInternetSubTab={setInternetSubTab}
          spaceSubTab={spaceSubTab}
          onSelectSpaceSubTab={setSpaceSubTab}
          gamesSubTab={gamesSubTab}
          onSelectGamesSubTab={setGamesSubTab}
          familyTreeSubTab={familyTreeSubTab as any}
          onSelectFamilyTreeSubTab={(sub) => setFamilyTreeSubTab(sub as any)}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          progress={progress}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          onTogglePlay={handleTogglePlay}
          onPlayNext={() => {
            const idx = tracks.findIndex(t => t.id === currentTrack?.id);
            if (idx !== -1 && idx < tracks.length - 1) handlePlayTrack(tracks[idx + 1]);
          }}
          onPlayPrev={() => {
            const idx = tracks.findIndex(t => t.id === currentTrack?.id);
            if (idx > 0) handlePlayTrack(tracks[idx - 1]);
          }}
          onSeek={(val) => setProgress(val)}
          onVolumeChange={(val) => setVolume(val)}
          onToggleMute={() => setIsMuted(!isMuted)}
          onOpenFullPlayer={() => setActiveTab('player')}
          onOpenAuth={() => handleOpenAuth('signin')}
          onCloseTrack={() => {
            setCurrentTrack(null);
            setIsPlaying(false);
          }}
          shuffleMode={shuffleMode}
          repeatMode={repeatMode}
          onToggleShuffle={() => setShuffleMode(s => s === 'smart_shuffle' ? 'shuffle' : s === 'shuffle' ? 'off' : 'smart_shuffle')}
          onToggleRepeat={() => setRepeatMode(r => r === 'off' ? 'all' : r === 'all' ? 'one' : 'off')}
        />
      )}

      {/* DESKTOP ONLY: Pro Hi-Fi Media Bar (Docked at bottom of wide screen when track is active) */}
      {isDesktop && currentMode !== 'space' && activeTab !== 'player' && currentTrack && (
        <DesktopPlayerDock
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          progress={progress}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          onTogglePlay={handleTogglePlay}
          onPlayNext={() => {
            const idx = tracks.findIndex(t => t.id === currentTrack?.id);
            if (idx !== -1 && idx < tracks.length - 1) handlePlayTrack(tracks[idx + 1]);
          }}
          onPlayPrev={() => {
            const idx = tracks.findIndex(t => t.id === currentTrack?.id);
            if (idx > 0) handlePlayTrack(tracks[idx - 1]);
          }}
          onSeek={(val) => setProgress(val)}
          onVolumeChange={(val) => setVolume(val)}
          onToggleMute={() => setIsMuted(!isMuted)}
          onOpenFullPlayer={() => setActiveTab('player')}
          onCloseTrack={() => {
            setCurrentTrack(null);
            setIsPlaying(false);
          }}
          shuffleMode={shuffleMode}
          repeatMode={repeatMode}
          onToggleShuffle={() => setShuffleMode(s => s === 'smart_shuffle' ? 'shuffle' : s === 'shuffle' ? 'off' : 'smart_shuffle')}
          onToggleRepeat={() => setRepeatMode(r => r === 'off' ? 'all' : r === 'all' ? 'one' : 'off')}
        />
      )}

      {/* Universal Google Omnibar Modal (Accessible by both Desktop & Mobile) */}
      {isOmnibarOpen && (
        <React.Suspense fallback={null}>
          <GoogleOmnibarModal
            isOpen={isOmnibarOpen}
            onClose={() => setIsOmnibarOpen(false)}
            tracks={tracks}
            onPlayTrack={handlePlayTrack}
            onSelectMode={(mode, initialTab) => {
              setIsOmnibarOpen(false);
              handleSelectMode(mode, initialTab as string);
            }}
            onSelectTab={(tab) => {
              setIsOmnibarOpen(false);
              setActiveTab(tab);
            }}
          />
        </React.Suspense>
      )}

      {/* Global Notifications Modal */}
      {isNotificationsOpen && (
        <React.Suspense fallback={null}>
          <NotificationsModal
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            onSelectTab={() => {}}
            onSelectMode={(mode, initialTab) => {
              setIsNotificationsOpen(false);
              handleSelectMode(mode, initialTab as string);
            }}
            onOpenChatWithUser={() => {
              setIsNotificationsOpen(false);
              setCurrentMode('messages');
            }}
          />
        </React.Suspense>
      )}

      {/* Install PWA Fullscreen Modal */}
      {isInstallPwaOpen && (
        <React.Suspense fallback={null}>
          <InstallPwaModal
            isOpen={isInstallPwaOpen}
            onClose={() => setIsInstallPwaOpen(false)}
            onToggleFullscreen={handleToggleFullscreen}
            isFullscreen={isFullscreen}
          />
        </React.Suspense>
      )}

      {/* Global Keyboard Shortcuts Cheat Sheet Modal */}
      {isShortcutsModalOpen && (
        <React.Suspense fallback={null}>
          <HaevyShortcutsModal
            isOpen={isShortcutsModalOpen}
            onClose={() => setIsShortcutsModalOpen(false)}
            onSelectShortcutAction={handleShortcutAction}
          />
        </React.Suspense>
      )}

      {/* Universal Voice-Controlled Ecosystem Navigation HUD with Vocal Tone Detection & Smart Recommendations */}
      <HaevyVoiceNavigationHUD
        isListening={isVoiceListening}
        transcript={voiceTranscript}
        lastMatchedCommand={voiceLastMatched}
        errorMessage={voiceError}
        onToggleListening={toggleVoiceListening}
        onSelectSuggestion={simulateVoiceCommand}
        onNavigateToMode={handleNavigateToMode}
        onSelectPlaylist={(genre, playlistTitle) => {
          setSelectedGenre(genre);
          setCurrentMode('audio');
          setActiveTab('library');
          triggerShortcutHUD(`🎵 Playlist: ${playlistTitle}`, `Thể loại: ${genre}`);
        }}
        onPlayTrack={handlePlayTrack}
        tracks={tracks}
      />

      {/* Dynamic Heads-Up Display (HUD) for triggered shortcuts */}
      {shortcutHUD && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-fadeIn">
          <div className="px-5 py-2.5 rounded-2xl bg-zinc-950/95 border border-purple-500/50 text-white shadow-2xl backdrop-blur-xl flex items-center gap-3 shadow-purple-500/20">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
              <Keyboard size={16} />
            </div>
            <div>
              <p className="text-xs font-black text-white">{shortcutHUD.title}</p>
              {shortcutHUD.subtitle && (
                <p className="text-[10px] text-zinc-400 font-medium">{shortcutHUD.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Quick Shortcut Pill Button (Desktop bottom left to avoid clashing with AI floating widget) */}
      <button
        onClick={() => setIsShortcutsModalOpen(true)}
        className="fixed bottom-4 left-6 z-30 hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950/85 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800/80 hover:border-purple-500/40 backdrop-blur-md shadow-lg text-[11px] font-bold transition-all cursor-pointer group"
        title="Bấm ? hoặc click để xem bảng phím tắt toàn cục"
      >
        <Keyboard size={13} className="text-purple-400 group-hover:scale-110 transition-transform" />
        <span>Phím tắt</span>
        <kbd className="px-1.5 py-0.2 rounded bg-zinc-900 text-[9px] text-zinc-300 border border-zinc-700 font-mono">?</kbd>
      </button>

      {/* Auth Modal */}
      {isAuthOpen && (
        <React.Suspense fallback={null}>
          <AuthModal 
            isOpen={isAuthOpen} 
            initialTab={authInitialTab}
            onClose={() => setIsAuthOpen(false)} 
            onSelectMode={handleSelectMode}
          />
        </React.Suspense>
      )}

      {/* Haevy Mood Engine Modal */}
      {isMoodModalOpen && (
        <React.Suspense fallback={null}>
          <HaevyMoodModal
            isOpen={isMoodModalOpen}
            onClose={() => setIsMoodModalOpen(false)}
          />
        </React.Suspense>
      )}

      {/* User Level & EXP Privileges Modal */}
      {isLevelModalOpen && (
        <React.Suspense fallback={null}>
          <UserLevelPrivilegesModal
            isOpen={isLevelModalOpen}
            onClose={() => setIsLevelModalOpen(false)}
            onNavigateMode={(mode, tab) => handleSelectMode(mode as any, tab)}
            onOpenGiftShop={() => {
              setSelectedGiftAuthor(undefined);
              setIsGiftShopOpen(true);
            }}
          />
        </React.Suspense>
      )}

      {/* User Level Up Celebratory Notification Modal */}
      <React.Suspense fallback={null}>
        <UserLevelUpNotificationModal
          onOpenLevelCenter={() => setIsLevelModalOpen(true)}
        />
      </React.Suspense>

      {/* Author Gift Shop Modal */}
      {isGiftShopOpen && (
        <React.Suspense fallback={null}>
          <AuthorGiftShopModal
            isOpen={isGiftShopOpen}
            onClose={() => setIsGiftShopOpen(false)}
            onOpenAuth={() => handleOpenAuth('signin')}
            onGoToTopup={() => {
              setIsGiftShopOpen(false);
              handleSelectMode('vip');
            }}
            currentTrack={currentTrack || undefined}
            allTracks={tracks}
            preselectedAuthor={selectedGiftAuthor}
          />
        </React.Suspense>
      )}

    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <DisplayScaleProvider>
          <AuthProvider>
            <ModeBadgeProvider>
              <HaevyMoodProvider>
                <GiftEffectProvider>
                  <MainApp />
                </GiftEffectProvider>
              </HaevyMoodProvider>
            </ModeBadgeProvider>
          </AuthProvider>
        </DisplayScaleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
