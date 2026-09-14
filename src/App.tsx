/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModeBadgeProvider, useModeBadges } from './context/ModeBadgeContext';
import { AuthModal } from './components/AuthModal';
import { NotificationsModal } from './components/NotificationsModal';
import { InstallPwaModal } from './components/InstallPwaModal';
import { HaevyEcosystemLandingView } from './components/HaevyEcosystemLandingView';
import { HaevyMorningView } from './components/HaevyMorningView';
import { HomeView } from './components/HomeView';
import { AudioLibraryView } from './components/AudioLibraryView';
import { HaevyStudioView } from './components/HaevyStudioView';
import { MessagesFriendsView } from './components/MessagesFriendsView';
import { CoupleRomanceView } from './components/CoupleRomanceView';
import { FinanceView } from './components/FinanceView';
import { VipTopupView } from './components/VipTopupView';
import { UserProfileView } from './components/UserProfileView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { HaevySupportView } from './components/HaevySupportView';
import { HaevyAIHubView } from './components/HaevyAIHubView';
import { HaevySpiritualView } from './components/HaevySpiritualView';
import { HaevyFamilyTreeView } from './components/HaevyFamilyTreeView';
import { HaevyEduView } from './components/HaevyEduView';
import { HaevyLiteHubView } from './components/haevyLite/HaevyLiteHubView';
import { HaevyGamesView, HaevyGamesSubTab } from './components/HaevyGamesView';
import { HaevyAIFloatingWidget } from './components/HaevyAIFloatingWidget';
import { AudioPlayer } from './components/AudioPlayer';
import { CommunityView } from './components/CommunityView';
import { BottomTaskbar } from './components/BottomTaskbar';
import { Navbar } from './components/Navbar';
import { DesktopSidebar } from './components/DesktopSidebar';
import { HaevyAllModesInfoModal } from './components/HaevyAllModesInfoModal';
import { HaevyShortcutsModal } from './components/HaevyShortcutsModal';
import { HaevyVoiceNavigationHUD } from './components/HaevyVoiceNavigationHUD';
import { HaevyModeTransitionOverlay } from './components/HaevyModeTransitionOverlay';
import { HaevyEcosystemQuickSwitcherModal } from './components/HaevyEcosystemQuickSwitcherModal';
import { getSavedEcosystemMode, switchEcosystemMode, MODE_SYNC_EVENT, MODE_STORAGE_KEY } from './services/modeSyncService';
import { useVoiceCommander } from './hooks/useVoiceCommander';
import { motion, AnimatePresence } from 'motion/react';
import { Track, ActiveTab, EcosystemMode } from './types';
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
  GraduationCap
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
  | 'profile';

const MODES_CONFIG: {
  id: HaevyMode;
  name: string;
  shortName: string;
  icon: any;
  color: string;
  badge: string;
}[] = [
  { id: 'edu', name: 'Haevy Edu (STEM & Lộ Trình)', shortName: 'Haevy Edu', icon: GraduationCap, color: 'from-emerald-500 via-teal-500 to-cyan-500', badge: 'STEM Lab' },
  { id: 'haevy_lite', name: 'Xu Haevy Lite & Combo Hoạt Ảnh', shortName: 'Xu Lite', icon: Sparkles, color: 'from-purple-600 via-indigo-600 to-pink-500', badge: 'Vũ Trụ 🌌' },
  { id: 'haevy_ai', name: 'Haevy AI Master', shortName: 'Haevy AI', icon: BrainCircuit, color: 'from-purple-500 via-indigo-500 to-pink-500', badge: 'AI Toàn Năng' },
  { id: 'family_tree', name: 'Haevy Family Tree', shortName: 'Gia Phả', icon: GitFork, color: 'from-amber-600 via-yellow-600 to-amber-700', badge: 'Gia Phả Dòng Họ' },
  { id: 'spiritual', name: 'Haevy Spiritual', shortName: 'Haevy Spiritual', icon: Moon, color: 'from-purple-600 via-indigo-600 to-pink-600', badge: 'Tâm Linh Vũ Trụ' },
  { id: 'audio', name: 'Haevy Audio', shortName: 'Haevy Audio', icon: Moon, color: 'from-indigo-500 to-purple-600', badge: 'Audio & Music' },
  { id: 'space', name: 'Haevy Space', shortName: 'Haevy Space', icon: Sparkles, color: 'from-cyan-500 to-blue-600', badge: '3D AR' },
  { id: 'messages', name: 'Haevy Message', shortName: 'Haevy Message', icon: MessageSquare, color: 'from-sky-500 to-blue-600', badge: 'Messages' },
  { id: 'studio', name: 'Haevy Studio', shortName: 'Haevy Studio', icon: Mic, color: 'from-rose-500 to-pink-600', badge: 'AI Voice' },
  { id: 'finance', name: 'Haevy Finance', shortName: 'Haevy Finance', icon: Wallet, color: 'from-emerald-500 to-green-600', badge: 'Thu Chi 6 Hũ' },
  { id: 'admin', name: 'Haevy Admin', shortName: 'Haevy Admin', icon: ShieldCheck, color: 'from-red-500 to-rose-600', badge: 'Quản Trị' },
  { id: 'couple', name: 'I Love Haevy', shortName: 'I Love Haevy', icon: Heart, color: 'from-rose-500 to-red-600', badge: 'Cặp Đôi' },
  { id: 'vip', name: 'Haevy VIP', shortName: 'Haevy VIP', icon: Crown, color: 'from-amber-400 to-yellow-500', badge: 'VIP Club' },
  { id: 'support', name: 'Haevy Support', shortName: 'Haevy Support', icon: LifeBuoy, color: 'from-emerald-400 to-teal-500', badge: 'Hỗ Trợ 24/7' }
];

function MainApp() {
  const { user, isVip, audioPoints, isAdmin, isSuperAdmin, addAudioPoints, shortcutsConfig } = useAuth();
  const { markModeAsViewed } = useModeBadges();
  const { effectiveTheme } = useTheme();
  
  // App Navigation & Active Mode State
  const [currentMode, setCurrentMode] = useState<HaevyMode>(getSavedEcosystemMode);
  const [isModeSwitcherOpen, setIsModeSwitcherOpen] = useState(false);
  const [isQuickSwitcherOpen, setIsQuickSwitcherOpen] = useState(false);
  
  // Sub-tabs for each ecosystem mode
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [messageSubTab, setMessageSubTab] = useState<'chat' | 'feed' | 'friends'>('chat');
  const [coupleSubTab, setCoupleSubTab] = useState<'page1' | 'page2' | 'page3' | 'page4' | 'page5'>('page1');
  const [financeSubTab, setFinanceSubTab] = useState<'page1' | 'page2' | 'page3' | 'page4' | 'page5'>('page1');
  const [adminSubTab, setAdminSubTab] = useState<'page1' | 'page2' | 'page3' | 'page4' | 'page5' | 'page6' | 'page7'>('page1');
  const [studioSubTab, setStudioSubTab] = useState<'page1' | 'page2' | 'page3'>('page1');
  const [vipSubTab, setVipSubTab] = useState<'page1' | 'page2' | 'page3' | 'page4' | 'page5'>('page1');
  const [spiritualSubTab, setSpiritualSubTab] = useState<'tarot' | 'palmistry' | 'divination' | 'numerology' | 'crystal_oracle' | 'couple_spiritual' | 'tuvi' | 'astrology' | 'soundscapes'>('tarot');
  const [haevyAISubTab, setHaevyAISubTab] = useState<'overview' | 'chat' | 'updates' | 'troubleshoot' | 'modes'>('overview');
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | null>(null);
  const [haevyLiteSubTab, setHaevyLiteSubTab] = useState<'shop' | 'customize' | 'topup_and_ads'>('shop');
  const [gamesSubTab, setGamesSubTab] = useState<HaevyGamesSubTab>('home');
  const [familyTreeSubTab, setFamilyTreeSubTab] = useState<string>('tree');
  const [eduSubTab, setEduSubTab] = useState<'assistant' | 'labs' | 'roadmap' | 'video' | 'notebook' | 'quiz'>('assistant');
  const [shuffleMode, setShuffleMode] = useState<'off' | 'shuffle' | 'smart_shuffle'>('smart_shuffle');
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  // Universal Cross-Ecosystem Mode & Sub-tab Navigator
  const handleNavigateToMode = (mode: string, subTab?: string) => {
    markModeAsViewed(mode, subTab);
    const targetMode = (mode === 'morning' ? 'space' : mode) as HaevyMode;
    setCurrentMode(targetMode);
    switchEcosystemMode(mode as EcosystemMode, subTab);
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // Ignore scroll errors in sandboxed containers
    }

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
    } else if (mode === 'portal') {
      setActiveTab('portal');
    } else if (mode === 'profile') {
      setActiveTab('profile');
    } else if (mode === 'support') {
      setActiveTab('support');
    }
  };

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'signin' | 'signup' | 'anonymous'>('signin');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isInstallPwaOpen, setIsInstallPwaOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [shortcutHUD, setShortcutHUD] = useState<{ title: string; subtitle?: string } | null>(null);

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

  const handleOpenAuth = (tab: 'signin' | 'signup' | 'anonymous' = 'signin') => {
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
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // Ignore scroll errors in sandboxed containers
    }

    if (modeKey === 'haevy_ai') {
      setCurrentMode('haevy_ai');
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
    } else {
      setCurrentMode('portal');
      setActiveTab('portal');
    }
  };

  // Shortcut Action Dispatcher (Callable from Keydown & Shortcut Modal)
  const handleShortcutAction = (action: string) => {
    switch (action) {
      case 'mode_edu':
        handleSelectMode('edu');
        triggerShortcutHUD('🎓 Haevy Edu', 'STEM Virtual Labs & Lộ Trình AI');
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
        setIsQuickSwitcherOpen(prev => !prev);
        break;
      case 'close_modal':
        setIsShortcutsModalOpen(false);
        setIsModeSwitcherOpen(false);
        setIsQuickSwitcherOpen(false);
        setIsAuthOpen(false);
        setIsNotificationsOpen(false);
        setIsInstallPwaOpen(false);
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
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      // Global shortcut Alt + M or Cmd + M: Quick Ecosystem Mode Switcher
      if ((e.altKey && (e.key === 'm' || e.key === 'M' || e.code === 'KeyM')) || (e.ctrlKey && e.shiftKey && (e.key === 'm' || e.key === 'M'))) {
        e.preventDefault();
        setIsQuickSwitcherOpen(prev => !prev);
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
        setIsQuickSwitcherOpen(false);
        setIsAuthOpen(false);
        setIsNotificationsOpen(false);
        setIsInstallPwaOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const handleOpenFullModal = () => {
      setIsModeSwitcherOpen(true);
    };
    const handleOpenQuick = () => {
      setIsQuickSwitcherOpen(true);
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
    window.addEventListener(MODE_SYNC_EVENT, handleSyncEvent);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('haevy-open-full-ecosystem-modal', handleOpenFullModal);
      window.removeEventListener('haevy-open-quick-mode-switcher', handleOpenQuick);
      window.removeEventListener(MODE_SYNC_EVENT, handleSyncEvent);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentTrack, tracks, isPlaying, isMuted, shortcutsConfig, currentMode]);

  const activeModeConfig = MODES_CONFIG.find(m => m.id === currentMode);

  // Smooth, subtle fade & scale motion properties for ecosystem mode transitions (no directional jumping)
  const getSwipeMotionProps = () => ({
    initial: { opacity: 0, scale: 0.995, y: 6 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.995, y: -6 },
    transition: { duration: 0.20, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden flex flex-col justify-start font-sans transition-colors duration-500 ease-in-out ${
      effectiveTheme === 'light'
        ? 'bg-slate-100/90 text-slate-900 selection:bg-amber-400/30 selection:text-amber-900'
        : 'bg-black text-zinc-100 selection:bg-amber-500/30 selection:text-amber-200'
    }`}>
      
      {/* ========================================================================= */}
      {/* TOP NAVIGATION BAR FOR MODES (RESTORING EACH MODE'S AUTHENTIC LOGO) */}
      {/* ========================================================================= */}
      {currentMode !== 'portal' && currentMode !== 'space' && currentMode !== 'haevy_ai' && (
        <header className="w-full bg-zinc-950/95 backdrop-blur-2xl border-b border-zinc-800/80 sticky top-0 z-[60] px-3 sm:px-6 pt-3 pb-0 shadow-xl">
          <Navbar
            currentMode={currentMode as EcosystemMode}
            onSelectMode={(mode, initialTab) => {
              handleSelectMode(mode, initialTab as string);
            }}
            onOpenEcosystemDrawer={() => setIsQuickSwitcherOpen(true)}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenAuth={() => handleOpenAuth('signin')}
            onOpenStudioAudio={() => setCurrentMode('studio')}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onToggleFullscreen={handleToggleFullscreen}
            isFullscreen={isFullscreen}
            onOpenInstallPwa={() => setIsInstallPwaOpen(true)}
            onToggleVoiceListen={toggleVoiceListening}
            isVoiceListening={isVoiceListening}
            onUserMenuToggle={setIsUserMenuOpen}
            tracks={tracks}
            onPlayTrack={handlePlayTrack}
          />
        </header>
      )}

      {/* Global Synchronized Mode Transition HUD */}
      <HaevyModeTransitionOverlay />

      {/* Global Comprehensive All Modes Info Modal */}
      <HaevyAllModesInfoModal
        isOpen={isModeSwitcherOpen}
        onClose={() => setIsModeSwitcherOpen(false)}
        onSelectMode={(mode, initialTab) => {
          handleSelectMode(mode, initialTab as string);
          setIsModeSwitcherOpen(false);
        }}
      />

      {/* Global Synchronized Fast Ecosystem Quick Switcher Modal (Alt + M) */}
      <HaevyEcosystemQuickSwitcherModal
        isOpen={isQuickSwitcherOpen}
        onClose={() => setIsQuickSwitcherOpen(false)}
        currentMode={currentMode as EcosystemMode}
        onSelectMode={(mode, initialTab) => {
          handleSelectMode(mode, initialTab as string);
          setIsQuickSwitcherOpen(false);
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
            <HaevyEcosystemLandingView
              onOpenAuth={handleOpenAuth}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              unreadNotificationCount={0}
              onToggleFullscreen={handleToggleFullscreen}
              isFullscreen={isFullscreen}
              onSelectMode={handleSelectMode}
              onToggleVoiceListen={toggleVoiceListening}
              isVoiceListening={isVoiceListening}
            />
          </motion.main>
        ) : currentMode === 'space' ? (
          <motion.main
            key="mode-space"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-full flex flex-col items-center flex-1 no-swipe overflow-x-hidden select-none touch-pan-y overscroll-x-none"
            data-no-swipe="true"
          >
            <div className="w-full max-w-full h-full flex flex-col no-swipe overflow-x-hidden touch-pan-y overscroll-x-none" data-no-swipe="true">
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
              />
            </div>
          </motion.main>
        ) : currentMode === 'haevy_ai' ? (
          <motion.main
            key="mode-haevy_ai"
            {...getSwipeMotionProps()}
            className="w-full h-[100dvh] flex flex-col items-center flex-1 p-0 m-0 overflow-hidden"
          >
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
            {/* Desktop Intuitive Pro Sidebar */}
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
            />

            {/* Main Content Area for Desktop & Mobile with Smooth Mode Transitions */}
            <main className="w-full flex flex-col items-center flex-1 min-w-0">
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
                      <MessagesFriendsView
                        tracks={tracks}
                        currentTrack={currentTrack}
                        onPlayTrack={handlePlayTrack}
                        onOpenAuth={() => handleOpenAuth('signin')}
                        activeSubTab={messageSubTab}
                        onSelectSubTab={setMessageSubTab}
                        onNavigateToMode={handleNavigateToMode}
                      />
                    </div>
                  )}

                  {/* 4. Haevy Studio */}
                  {currentMode === 'studio' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-36">
                      <HaevyStudioView
                        activeSubTab={studioSubTab}
                        onSelectSubTab={setStudioSubTab}
                      />
                    </div>
                  )}

                  {/* 5. Haevy Finance */}
                  {currentMode === 'finance' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-36">
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
                    </div>
                  )}

                  {/* 6. Haevy Admin */}
                  {currentMode === 'admin' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-36">
                      <AdminDashboardView
                        allTracks={tracks}
                        onPlayTrack={handlePlayTrack}
                        onBackToHome={() => setCurrentMode('portal')}
                        onOpenAuth={() => handleOpenAuth('signin')}
                        adminSubTab={adminSubTab}
                        onSelectAdminSubTab={setAdminSubTab}
                      />
                    </div>
                  )}

                  {/* 7. I Love Haevy */}
                  {currentMode === 'couple' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-36">
                      <CoupleRomanceView
                        tracks={tracks}
                        currentTrack={currentTrack}
                        onPlayTrack={handlePlayTrack}
                        onOpenAuth={() => handleOpenAuth('signin')}
                        activePage={coupleSubTab}
                        onSelectPage={setCoupleSubTab}
                        onNavigateToMode={handleNavigateToMode}
                      />
                    </div>
                  )}

                  {/* 8. Haevy VIP */}
                  {currentMode === 'vip' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-36">
                      <VipTopupView
                        onOpenAuth={() => handleOpenAuth('signin')}
                        onGoToProfile={() => setCurrentMode('profile')}
                        activePage={vipSubTab}
                        onSelectPage={setVipSubTab}
                        onNavigateMode={handleNavigateToMode}
                      />
                    </div>
                  )}

                  {/* 9. Haevy Support */}
                  {currentMode === 'support' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-36">
                      <HaevySupportView
                        onBackToPortal={() => setCurrentMode('portal')}
                        onOpenAuth={() => handleOpenAuth('signin')}
                      />
                    </div>
                  )}

                  {/* 10. Haevy Spiritual (Tarot, Tử Vi, Chiêm Tinh, Sóng Âm Solfeggio) */}
                  {currentMode === 'spiritual' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-36">
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
                    </div>
                  )}

                  {/* 11. Haevy Family Tree (Gia Phả Dòng Họ & Sơ Đồ Cây Tương Tác) */}
                  {currentMode === 'family_tree' && (
                    <div className="w-full max-w-7xl px-0 sm:px-4 py-2 pb-36">
                      <HaevyFamilyTreeView
                        onBackToPortal={() => setCurrentMode('portal')}
                        tracks={tracks}
                        onPlayTrack={handlePlayTrack}
                        onNavigateToMode={handleNavigateToMode}
                        activeTabControlled={familyTreeSubTab}
                        onTabChange={(tab) => setFamilyTreeSubTab(tab)}
                      />
                    </div>
                  )}

                  {/* 12. Haevy Lite Coins & Cosmic Theme Bundle Hub */}
                  {currentMode === 'haevy_lite' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-36">
                      <HaevyLiteHubView
                        activeTabControlled={haevyLiteSubTab}
                        onTabChange={setHaevyLiteSubTab}
                        onBackToPortal={() => setCurrentMode('portal')}
                        onGoToProfile={() => setCurrentMode('profile')}
                        onOpenAuth={() => handleOpenAuth('signin')}
                      />
                    </div>
                  )}

                  {/* 13. Haevy Games (Đấu Trường Mini-Game Âm Nhạc & Bài Hát) */}
                  {currentMode === 'games' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-36">
                      <HaevyGamesView
                        activeSubTab={gamesSubTab}
                        onSelectSubTab={setGamesSubTab}
                        onOpenAuth={() => handleOpenAuth('signin')}
                        onOpenVipHub={() => handleSelectMode('vip')}
                      />
                    </div>
                  )}

                  {/* 14. Haevy Edu (Phòng Lab STEM & Lộ Trình First Principles) */}
                  {currentMode === 'edu' && (
                    <div className="w-full max-w-7xl px-0 sm:px-4 py-2 pb-8 no-swipe touch-pan-y" data-no-swipe="true">
                      <HaevyEduView
                        onBackToLanding={() => setCurrentMode('portal')}
                        activeTabControlled={eduSubTab}
                        onTabChange={setEduSubTab}
                      />
                    </div>
                  )}

                  {/* User Profile subview */}
                  {currentMode === 'profile' && (
                    <div className="w-full max-w-7xl px-3 sm:px-6 py-4 pb-12">
                      <UserProfileView
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

      {/* Consolidated Bottom Taskbar with Docked Subtabs & Mini Player for All Modes */}
      {currentMode !== 'portal' && currentMode !== 'space' && currentMode !== 'haevy_ai' && currentMode !== 'edu' && currentMode !== 'profile' && activeTab !== 'player' && !isUserMenuOpen && (
        <BottomTaskbar
          currentMode={currentMode as EcosystemMode}
          onSelectMode={(mode, initialTab) => {
            handleSelectMode(mode, initialTab as string);
          }}
          onOpenModesSlider={() => setIsQuickSwitcherOpen(true)}
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
          eduSubTab={eduSubTab}
          onSelectEduSubTab={setEduSubTab}
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

      {/* Global Notifications Modal */}
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

      {/* Install PWA Fullscreen Modal */}
      <InstallPwaModal
        isOpen={isInstallPwaOpen}
        onClose={() => setIsInstallPwaOpen(false)}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
      />

      {/* Global Keyboard Shortcuts Cheat Sheet Modal */}
      <HaevyShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        onSelectShortcutAction={handleShortcutAction}
      />

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

      {/* Global Quick Shortcut Pill Button (Bottom right floating) */}
      <button
        onClick={() => setIsShortcutsModalOpen(true)}
        className="fixed bottom-24 sm:bottom-28 right-4 z-40 hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950/80 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800/80 hover:border-purple-500/40 backdrop-blur-md shadow-lg text-[11px] font-bold transition-all cursor-pointer group"
        title="Bấm ? hoặc click để xem bảng phím tắt toàn cục"
      >
        <Keyboard size={13} className="text-purple-400 group-hover:scale-110 transition-transform" />
        <span>Phím tắt</span>
        <kbd className="px-1.5 py-0.2 rounded bg-zinc-900 text-[9px] text-zinc-300 border border-zinc-700 font-mono">?</kbd>
      </button>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        initialTab={authInitialTab}
        onClose={() => setIsAuthOpen(false)} 
      />

    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ModeBadgeProvider>
            <MainApp />
          </ModeBadgeProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
