import React, { useRef, useEffect, useState } from 'react';
import {
  Crown,
  User as UserIcon,
  Coins,
  Gift,
  LogOut,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check,
  Copy,
  Moon,
  Maximize2,
  Minimize2,
  Bell,
  Keyboard,
  Smartphone,
  Eye,
  EyeOff,
  Sliders,
  Settings,
  Headphones,
  Layers,
  Globe,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Link2,
  Unlink,
  HardDrive,
  Database,
  CloudCheck,
  GraduationCap,
  Music,
  FolderSync,
  FolderOpen,
  Upload,
  BrainCircuit,
  FlaskConical,
  Compass,
  FileText,
  Plus,
  CheckSquare,
  ListTodo,
  Award,
  Zap,
  TrendingUp,
  Cpu,
  Type
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDisplayScale } from '../context/DisplayScaleContext';
import { haptics } from '../utils/haptics';
import { calculateLevelFromExp } from '../data/levelMilestones';
import { EcosystemMode, ActiveTab } from '../types';
import { ThemeSwitcher } from './common/ThemeSwitcher';
import { EduPushNotificationModal } from './edu/EduPushNotificationModal';
import {
  GoogleDriveServiceConfig,
  getStoredGoogleDriveConfig,
  saveStoredGoogleDriveConfig,
  GoogleDriveDetailModal,
  GoogleDocsServiceConfig,
  getStoredGoogleDocsConfig,
  saveStoredGoogleDocsConfig,
  GoogleDocsDetailModal,
  GoogleTasksServiceConfig,
  getStoredGoogleTasksConfig,
  saveStoredGoogleTasksConfig,
  GoogleTasksDetailModal
} from './google/GoogleIntegrationModal';
import { GoogleDocsExportModal } from './google/GoogleDocsExportModal';
import { GoogleDocExportOptions } from '../services/googleDocsService';
import { GoogleDriveDocumentPickerModal } from './google/GoogleDriveDocumentPickerModal';
import { GoogleTasksModal } from './google/GoogleTasksModal';
import {
  getAvailableGoogleDriveDocuments,
  GoogleDriveDocumentItem
} from '../services/googleDriveService';

interface HaevyUserDropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: EcosystemMode, initialTab?: ActiveTab | string) => void;
  onSelectTab?: (tab: ActiveTab) => void;
  onClaimGift?: () => void;
  onOpenInstallPwa?: () => void;
  onOpenNotifications?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  onOpenShortcuts?: () => void;
}

type MenuCategory = 'all' | 'settings' | 'security' | 'google';

export function HaevyUserDropdownMenu({
  isOpen,
  onClose,
  onSelectMode,
  onSelectTab,
  onClaimGift,
  onOpenInstallPwa,
  onOpenNotifications,
  onToggleFullscreen,
  isFullscreen = false,
  onOpenShortcuts
}: HaevyUserDropdownMenuProps) {
  const { 
    user, 
    isVip, 
    audioPoints, 
    haevyLiteCoins = 0, 
    accountId, 
    logout, 
    addAudioPoints,
    displayName: authDisplayName,
    photoURL: authPhotoURL,
    userProfile,
    vipSettings,
    updateVipSettings,
    levelExp = 0,
    unclaimedLevelRewardsCount = 0,
    setIsLevelModalOpen
  } = useAuth();
  const { isLargeDisplay, toggleDisplayScale, setDisplayScale } = useDisplayScale();
  
  const levelState = calculateLevelFromExp(levelExp);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const [claimedGift, setClaimedGift] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('all');
  const [isEduPushModalOpen, setIsEduPushModalOpen] = useState(false);

  // Privacy Mode State (defaults to true: hide sensitive balance & IDs in public)
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('haevy_profile_privacy_mode');
      return saved === null ? true : saved !== 'false';
    } catch {
      return true;
    }
  });

  // Local Sleep Timer preset selection
  const [sleepTimerPreset, setSleepTimerPreset] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('haevy_sleep_timer_preset');
      return saved ? parseInt(saved, 10) : null;
    } catch {
      return null;
    }
  });

  // Google Drive Integration State (Currently active cloud storage integration in Haevy)
  const [driveConfig, setDriveConfig] = useState<GoogleDriveServiceConfig>(getStoredGoogleDriveConfig);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState<boolean>(false);
  const [drivePickerTab, setDrivePickerTab] = useState<'browse' | 'upload' | 'settings'>('browse');
  const [driveDocuments, setDriveDocuments] = useState<GoogleDriveDocumentItem[]>([]);
  const [isDriveSyncing, setIsDriveSyncing] = useState<boolean>(false);
  const [driveSyncNotification, setDriveSyncNotification] = useState<string | null>(null);

  // Google Docs Workspace Integration State
  const [docsConfig, setDocsConfig] = useState<GoogleDocsServiceConfig>(getStoredGoogleDocsConfig);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState<boolean>(false);
  const [isDocsExportModalOpen, setIsDocsExportModalOpen] = useState<boolean>(false);
  const [docsExportOptions, setDocsExportOptions] = useState<GoogleDocExportOptions | null>(null);

  // Google Tasks Workspace Integration State
  const [tasksConfig, setTasksConfig] = useState<GoogleTasksServiceConfig>(getStoredGoogleTasksConfig);
  const [isTasksDetailModalOpen, setIsTasksDetailModalOpen] = useState<boolean>(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState<boolean>(false);

  // Sync Google Tasks with window events if changed elsewhere
  useEffect(() => {
    const handleTasksEvent = (e: any) => {
      if (e.detail && e.detail.id === 'tasks') {
        setTasksConfig(e.detail);
      }
    };
    window.addEventListener('haevy-google-tasks-change', handleTasksEvent);
    return () => window.removeEventListener('haevy-google-tasks-change', handleTasksEvent);
  }, []);

  const handleUpdateTasksConfig = (newConfig: GoogleTasksServiceConfig) => {
    setTasksConfig(newConfig);
    saveStoredGoogleTasksConfig(newConfig);
  };

  // Sync Google Docs with window events if changed elsewhere
  useEffect(() => {
    const handleDocsEvent = (e: any) => {
      if (e.detail && e.detail.id === 'docs') {
        setDocsConfig(e.detail);
      }
    };
    window.addEventListener('haevy-google-docs-change', handleDocsEvent);
    return () => window.removeEventListener('haevy-google-docs-change', handleDocsEvent);
  }, []);

  const handleUpdateDocsConfig = (newConfig: GoogleDocsServiceConfig) => {
    setDocsConfig(newConfig);
    saveStoredGoogleDocsConfig(newConfig);
  };

  // Load available documents from Google Drive
  useEffect(() => {
    setDriveDocuments(getAvailableGoogleDriveDocuments());
    const handleDocsUpdate = () => {
      setDriveDocuments(getAvailableGoogleDriveDocuments());
    };
    window.addEventListener('haevy-drive-docs-updated', handleDocsUpdate);
    return () => window.removeEventListener('haevy-drive-docs-updated', handleDocsUpdate);
  }, []);

  // Sync with window events if changed elsewhere
  useEffect(() => {
    const handleDriveUpdate = (e: any) => {
      if (e.detail && e.detail.id === 'drive') {
        setDriveConfig(e.detail);
      }
    };
    window.addEventListener('haevy-google-drive-change', handleDriveUpdate);
    return () => window.removeEventListener('haevy-google-drive-change', handleDriveUpdate);
  }, []);

  const handleSelectDocumentForAI = (doc: GoogleDriveDocumentItem) => {
    setIsDrivePickerOpen(false);
    onClose();
    onSelectMode('edu', 'assistant');
    // Broadcast selection event so AI Study Assistant immediately consumes it
    window.dispatchEvent(new CustomEvent('haevy-select-study-document', {
      detail: { doc, target: 'ai_study' }
    }));
  };

  const handleSelectDocumentForRoadmap = (doc: GoogleDriveDocumentItem) => {
    setIsDrivePickerOpen(false);
    onClose();
    onSelectMode('edu', 'roadmap');
    // Broadcast selection event so Document Roadmap immediately consumes it
    window.dispatchEvent(new CustomEvent('haevy-select-study-document', {
      detail: { doc, target: 'roadmap' }
    }));
  };

  const handleToggleDriveConnection = () => {
    const nextConnected = !driveConfig.connected;
    const updated: GoogleDriveServiceConfig = {
      ...driveConfig,
      connected: nextConnected,
      lastSynced: nextConnected ? 'Vừa xong' : 'Đã ngắt kết nối'
    };
    setDriveConfig(updated);
    saveStoredGoogleDriveConfig(updated);
    setDriveSyncNotification(
      nextConnected
        ? `Đã kích hoạt sao lưu với Google Drive (${driveConfig.email})`
        : 'Đã tạm dừng sao lưu Google Drive'
    );
    setTimeout(() => setDriveSyncNotification(null), 3500);
  };

  const handleSyncDrive = () => {
    setIsDriveSyncing(true);
    setTimeout(() => {
      const updated: GoogleDriveServiceConfig = {
        ...driveConfig,
        lastSynced: 'Vừa xong',
        usedStorageGb: Number((driveConfig.usedStorageGb + 0.1).toFixed(1))
      };
      setDriveConfig(updated);
      saveStoredGoogleDriveConfig(updated);
      setIsDriveSyncing(false);
      setDriveSyncNotification('Đã đồng bộ thành công giáo trình STEM & âm thanh lên Google Drive!');
      setTimeout(() => setDriveSyncNotification(null), 3500);
    }, 850);
  };

  const handleUpdateDriveConfig = (newConfig: GoogleDriveServiceConfig) => {
    setDriveConfig(newConfig);
    saveStoredGoogleDriveConfig(newConfig);
  };

  // Toggle privacy mode & persist
  const handleTogglePrivacy = () => {
    setIsPrivacyMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('haevy_profile_privacy_mode', String(next));
        window.dispatchEvent(new CustomEvent('haevy-privacy-mode-change', { detail: next }));
      } catch (err) {
        console.error('Failed to save privacy mode:', err);
      }
      return next;
    });
  };

  // Set sleep timer preset & notify audio player
  const handleSelectSleepTimer = (minutes: number | null) => {
    setSleepTimerPreset(minutes);
    try {
      if (minutes === null) {
        localStorage.removeItem('haevy_sleep_timer_preset');
      } else {
        localStorage.setItem('haevy_sleep_timer_preset', String(minutes));
      }
      window.dispatchEvent(new CustomEvent('haevy-set-sleep-timer', { detail: { minutes } }));
    } catch (err) {
      console.error('Failed to dispatch sleep timer:', err);
    }
  };

  // Synchronized Profile Display Information
  const effectiveDisplayName = userProfile?.displayName || authDisplayName || user?.displayName || user?.email?.split('@')[0] || 'Thành viên Haevy';
  const effectivePhotoURL = userProfile?.photoURL || authPhotoURL || user?.photoURL || null;

  // Reliable, permanent Account ID representation
  const effectiveAccountId = (accountId && accountId !== 'GUEST-000000') 
    ? accountId 
    : (user?.uid ? `AH-${user.uid.slice(0, 6).toUpperCase()}` : 'AH-MEMBER');

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (effectiveAccountId) {
      navigator.clipboard.writeText(effectiveAccountId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Broadcast menu state to hide bottom taskbars across modes
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('haevy:user-menu-opened', { detail: true }));
      if (menuRef.current) {
        menuRef.current.scrollTop = 0;
      }
    } else {
      window.dispatchEvent(new CustomEvent('haevy:user-menu-opened', { detail: false }));
    }
    return () => {
      window.dispatchEvent(new CustomEvent('haevy:user-menu-opened', { detail: false }));
    };
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const handleClaim = async () => {
    if (onClaimGift) {
      onClaimGift();
    } else {
      if (!claimedGift) {
        await addAudioPoints(500, 'Quà tặng Đại Lễ Hệ Sinh Thái Haevy', 'bonus');
        setClaimedGift(true);
      }
    }
  };

  const handleNavigate = (mode: EcosystemMode, subTab?: string) => {
    onClose();
    onSelectMode(mode, subTab as any);
    if (onSelectTab) {
      onSelectTab(subTab as any || mode as any);
    }
  };

  return (
    <>
      {/* Completely transparent overlay for outside clicks without dimming or blurring the background */}
      <div 
        className="fixed inset-0 z-[80] bg-transparent"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-hidden="true"
      />

      <div 
        ref={menuRef}
        id="haevy-user-action-task-panel"
        className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-full mt-1 sm:mt-2.5 w-[calc(100vw-16px)] sm:w-[410px] max-w-[430px] max-h-[calc(100vh-85px)] overflow-y-auto overscroll-contain rounded-3xl bg-zinc-950/98 backdrop-blur-2xl border border-zinc-800/90 p-3.5 sm:p-4 shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-150 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent pb-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* 1. STICKY USER PROFILE HEADER & ACCOUNT ID BAR                            */}
        {/* ========================================================================= */}
        <div className="sticky -top-3.5 sm:-top-4 -mt-3.5 sm:-mt-4 -mx-3.5 sm:-mx-4 p-3 sm:p-3.5 bg-zinc-950/98 backdrop-blur-2xl border-b border-zinc-800/80 mb-3 z-30 shadow-md">
          <div className="flex items-center justify-between gap-3">
            {/* Avatar & User Details */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-500 text-white font-black flex items-center justify-center text-sm ring-2 ring-white/20 shadow-md overflow-hidden">
                  {effectivePhotoURL ? (
                    <img 
                      src={effectivePhotoURL} 
                      alt={effectiveDisplayName || 'Avatar'} 
                      referrerPolicy="no-referrer" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    effectiveDisplayName?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                {isVip && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center text-black shadow-md ring-1 ring-zinc-950" title="Hội viên VIP">
                    <Crown size={9} fill="currentColor" />
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-zinc-950" title="Đang trực tuyến" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xs sm:text-sm text-white truncate">
                    {effectiveDisplayName}
                  </span>
                  {isVip ? (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[9px] font-black border border-amber-400/40 shrink-0">
                      VIP
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 text-[9px] font-semibold shrink-0">
                      MEMBER
                    </span>
                  )}
                </div>
                {user.email && (
                  <div className="text-[10px] text-zinc-400 truncate mt-0.5" title={user.email}>
                    {user.email}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Profile Edit Shortcut */}
            <button
              type="button"
              onClick={() => handleNavigate('profile', 'about')}
              className="p-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 border border-zinc-800 transition-colors shrink-0 cursor-pointer"
              title="Cài đặt thông tin & Tùy biến hồ sơ"
            >
              <Settings size={15} />
            </button>
          </div>

          {/* Dedicated Account ID Box with 1-click copy */}
          <div className="mt-2.5 flex items-center justify-between gap-2 bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/40 px-2.5 py-1.5 rounded-xl transition-all">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider shrink-0">ID Tài Khoản:</span>
              <span className="font-mono font-black text-xs text-amber-300 tracking-wider select-all truncate">
                {isPrivacyMode ? `${effectiveAccountId.slice(0, 4)}••••` : effectiveAccountId}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyId}
              className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-amber-300 bg-zinc-800/80 hover:bg-zinc-700/80 px-2 py-1 rounded-lg transition-colors shrink-0 cursor-pointer active:scale-95"
              title="Sao chép ID tài khoản"
            >
              {copiedId ? (
                <>
                  <Check size={11} className="text-emerald-400" />
                  <span className="text-emerald-400">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy size={11} />
                  <span>Sao chép</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. DUAL WALLET BALANCE BOX WITH PRIVACY SHIELD TOGGLE                    */}
        {/* ========================================================================= */}
        <div className="p-2.5 bg-zinc-900/90 rounded-2xl border border-zinc-800/90 mb-3 space-y-2 shadow-inner">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Coins size={14} className="text-amber-400" />
              <span className="text-zinc-400 text-[11px] font-medium">Điểm Audio:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-amber-300 font-mono text-xs">
                {isPrivacyMode ? '••••••' : (audioPoints ?? 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-400/80 font-bold">Điểm</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-zinc-800/70">
            <button
              type="button"
              onClick={() => handleNavigate('haevy_lite', 'shop')}
              className="flex items-center gap-1.5 hover:text-purple-300 transition-colors text-left group"
              title="Vào Hub Xu Lite đổi hiệu ứng"
            >
              <Sparkles size={14} className="text-purple-400 animate-pulse group-hover:scale-110 transition-transform" />
              <span className="text-zinc-400 text-[11px] font-medium group-hover:text-purple-300">Xu Haevy Lite:</span>
              <span className="font-extrabold text-purple-300 font-mono text-xs group-hover:underline ml-1">
                {isPrivacyMode ? '••••••' : (haevyLiteCoins ?? 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-purple-400/80 font-bold">Xu ↗</span>
            </button>

            {/* Privacy Shield Toggle Button */}
            <button
              type="button"
              onClick={handleTogglePrivacy}
              className={`p-1 px-1.5 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                isPrivacyMode 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
              }`}
              title={isPrivacyMode ? 'Đang ẩn số dư (Bấm để hiện)' : 'Đang hiện số dư (Bấm để ẩn)'}
            >
              {isPrivacyMode ? <EyeOff size={11} /> : <Eye size={11} />}
              <span>{isPrivacyMode ? 'Riêng tư' : 'Công khai'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2.5 USER LEVEL & EXP PRIVILEGES PROGRESS CARD                            */}
        {/* ========================================================================= */}
        <div 
          onClick={() => {
            setIsLevelModalOpen(true);
            onClose();
          }}
          className="group relative p-3 bg-gradient-to-br from-amber-500/10 via-zinc-900 to-purple-500/10 hover:from-amber-500/20 hover:to-purple-500/20 rounded-2xl border border-amber-500/30 hover:border-amber-400/60 mb-3 cursor-pointer transition-all shadow-md hover:shadow-amber-500/10 active:scale-[0.99]"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-black text-sm shadow-md shrink-0 ring-1 ring-white/20">
                {levelState.currentMilestone.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xs text-amber-300">
                    LV.{levelState.currentLevel}
                  </span>
                  <span className="text-[11px] font-bold text-white truncate">
                    {levelState.currentMilestone.title}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  {!levelState.nextMilestone 
                    ? 'Đạt Cấp Độ Tối Đa' 
                    : `${levelState.expInCurrentLevel.toLocaleString()} / ${levelState.expRequiredForNext.toLocaleString()} EXP (${levelState.progressPercentage}%)`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {unclaimedLevelRewardsCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[10px] font-black animate-pulse flex items-center gap-1 shadow-sm shadow-emerald-500/20">
                  <Gift size={10} />
                  <span>+{unclaimedLevelRewardsCount} Quà</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                  <Award size={10} />
                  <span>Đặc quyền</span>
                </span>
              )}
              <ChevronRight size={14} className="text-zinc-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 w-full bg-zinc-800/90 rounded-full overflow-hidden border border-zinc-700/50">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
              style={{ width: `${levelState.progressPercentage}%` }}
            />
          </div>

          {/* Micro hint */}
          <div className="mt-2 flex items-center justify-between text-[10px]">
            <span className="text-zinc-400 flex items-center gap-1">
              <Zap size={10} className="text-amber-400" />
              Tặng quà / Nạp Xu / VIP để +EXP
            </span>
            <span className="text-amber-300 font-semibold group-hover:underline flex items-center gap-0.5">
              Mở quà cấp độ →
            </span>
          </div>
        </div>


        {/* ========================================================================= */}
        {/* 3. CATEGORY SWITCHER PILLS (CÀI ĐẶT, BẢO MẬT & GOOGLE HUB)              */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800/80 mb-3 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-amber-500 text-zinc-950 font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Layers size={11} />
            <span>Tất cả</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('settings')}
            className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeCategory === 'settings'
                ? 'bg-indigo-600 text-white font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Sliders size={11} />
            <span>Cài đặt</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('security')}
            className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeCategory === 'security'
                ? 'bg-emerald-600 text-white font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <ShieldCheck size={11} />
            <span>Bảo mật</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('google')}
            className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeCategory === 'google'
                ? 'bg-blue-600 text-white font-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Link2 size={11} />
            <span>Liên kết</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 4. DYNAMIC LINKED SETTINGS CONTENT ACCORDING TO ACTIVE CATEGORY           */}
        {/* ========================================================================= */}
        <div className="space-y-2 mb-3">
          
          {/* ----------------------------------------------------------------------- */}
          {/* SECTION A: CÀI ĐẶT HỆ THỐNG & ÂM THANH HI-FI (SETTINGS)                 */}
          {/* ----------------------------------------------------------------------- */}
          {(activeCategory === 'all' || activeCategory === 'settings') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                <span>Cài Đặt Hệ Thống & Âm Thanh</span>
                <span className="text-indigo-400">Hi-Fi Audio</span>
              </div>

              {/* Theme Switcher Row (Sáng / Tối / Tự động) */}
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
                    <Sliders size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-200">Giao Diện Hệ Thống</div>
                    <div className="text-[10px] text-zinc-400">Sáng, Tối hoặc Tự Động theo máy</div>
                  </div>
                </div>
                <div className="shrink-0">
                  <ThemeSwitcher variant="compact" />
                </div>
              </div>

              {/* Haevy Mood Engine Row */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.dispatchEvent(new CustomEvent('haevy-open-mood-modal'));
                }}
                className="w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent border border-amber-500/30 hover:border-amber-400/60 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
                    <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <span>Haevy Mood Engine</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-bold">
                        AI Circadian
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Tự động đổi màu không gian theo giờ & thời tiết thực tế
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">
                  Tùy chỉnh ›
                </span>
              </button>

              {/* Hi-Fi Lossless Stream Quality Toggle */}
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    vipSettings?.hifiMode 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    <Headphones size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <span>Âm Thanh Hi-Fi Lossless</span>
                      <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">24-bit</span>
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {vipSettings?.hifiMode ? 'Đang bật: FLAC 320kbps phòng thu' : 'Chuẩn: 128kbps tiết kiệm dữ liệu'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (updateVipSettings) {
                      updateVipSettings({ hifiMode: !vipSettings?.hifiMode });
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black border transition-colors cursor-pointer ${
                    vipSettings?.hifiMode
                      ? 'bg-amber-500 text-zinc-950 border-amber-400'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  {vipSettings?.hifiMode ? 'Bật' : 'Tắt'}
                </button>
              </div>

              {/* Quick Sleep Timer Controls */}
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
                      <Moon size={14} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-200">Hẹn Giờ Tắt Nhạc</div>
                      <div className="text-[10px] text-zinc-400">Tự động dừng phát khi vào giấc ngủ</div>
                    </div>
                  </div>
                  {sleepTimerPreset && (
                    <span className="text-[10px] font-bold text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                      {sleepTimerPreset === -1 ? 'Hết bài' : `${sleepTimerPreset} phút`}
                    </span>
                  )}
                </div>

                {/* Sleep Timer Preset Chips */}
                <div className="grid grid-cols-5 gap-1 pt-1 border-t border-zinc-800/70 text-[10px] font-bold">
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleSelectSleepTimer(mins)}
                      className={`py-1 rounded-lg border transition-all text-center cursor-pointer ${
                        sleepTimerPreset === mins
                          ? 'bg-indigo-600 text-white border-indigo-400 font-black shadow-sm'
                          : 'bg-zinc-800/60 text-zinc-300 border-zinc-700/60 hover:bg-zinc-700'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleSelectSleepTimer(null)}
                    className={`py-1 rounded-lg border transition-all text-center cursor-pointer ${
                      sleepTimerPreset === null
                        ? 'bg-zinc-700 text-zinc-200 border-zinc-600'
                        : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:text-zinc-200'
                    }`}
                  >
                    Tắt
                  </button>
                </div>
              </div>

              {/* Cỡ Chữ & Kích Thước Hiển Thị Hệ Sinh Thái (Font Size & Display Scale Control) */}
              <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 hover:border-amber-500/30 transition-all space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs border transition-all ${
                      isLargeDisplay
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/20'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}>
                      <Type size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>Cỡ Chữ &amp; Giao Diện</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${
                          isLargeDisplay 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {isLargeDisplay ? 'Lớn (115%)' : 'Chuẩn (100%)'}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {isLargeDisplay ? 'Chữ to rõ nét, chống mỏi mắt' : 'Cỡ chữ gốc thanh thoát'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Segmented Dual Switcher */}
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      haptics.selection();
                      setDisplayScale('standard');
                    }}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      !isLargeDisplay
                        ? 'bg-gradient-to-r from-zinc-800 to-zinc-700 text-white border border-zinc-600 shadow-sm font-black'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-xs font-black">A</span>
                    <span>Cỡ Chuẩn</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.selection();
                      setDisplayScale('large');
                    }}
                    className={`py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isLargeDisplay
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 font-black shadow-md shadow-amber-500/20'
                        : 'text-zinc-400 hover:text-amber-300'
                    }`}
                  >
                    <span className="text-sm font-black">A+</span>
                    <span>Cỡ Lớn</span>
                  </button>
                </div>
              </div>

              {/* Install PWA & Fullscreen Row */}
              <div className="grid grid-cols-2 gap-2">
                {onOpenInstallPwa && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenInstallPwa();
                    }}
                    className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-cyan-500/50 text-left transition-all flex items-center gap-2 group cursor-pointer"
                    title="Cài đặt Haevy lên màn hình chính thiết bị"
                  >
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shrink-0">
                      <Smartphone size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-200 group-hover:text-cyan-300 transition-colors truncate">Cài PWA App</div>
                      <div className="text-[9px] text-zinc-400 truncate">Dùng offline mượt</div>
                    </div>
                  </button>
                )}

                {onToggleFullscreen && (
                  <button
                    type="button"
                    onClick={onToggleFullscreen}
                    className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-amber-500/50 text-left transition-all flex items-center gap-2 group cursor-pointer"
                    title="Bật/Tắt chế độ Toàn màn hình"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
                      {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-200 group-hover:text-amber-300 transition-colors truncate">
                        {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
                      </div>
                      <div className="text-[9px] text-zinc-400 truncate">Trải nghiệm không viền</div>
                    </div>
                  </button>
                )}
              </div>

              {/* Keyboard Shortcuts & System Push Alerts Row */}
              <div className="grid grid-cols-2 gap-2">
                {onOpenShortcuts && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenShortcuts();
                    }}
                    className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-purple-500/50 text-left transition-all flex items-center gap-2 group cursor-pointer"
                    title="Xem danh mục phím tắt toàn cục"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
                      <Keyboard size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-200 group-hover:text-purple-300 transition-colors truncate">Bảng Phím Tắt</div>
                      <div className="text-[9px] text-zinc-400 truncate">Nhấn ? hoặc Alt+M</div>
                    </div>
                  </button>
                )}

                {/* THPT 2027 Study Notification Setting */}
                <button
                  type="button"
                  onClick={() => setIsEduPushModalOpen(true)}
                  className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-emerald-500/50 text-left transition-all flex items-center gap-2 group cursor-pointer"
                  title="Cài đặt thông báo ôn thi THPT 2027"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Bell size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-zinc-200 group-hover:text-emerald-300 transition-colors truncate">Báo Thi 2027</div>
                    <div className="text-[9px] text-zinc-400 truncate">7 cột mốc đại học</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* SECTION B: BẢO MẬT & HỒ SƠ CÁ NHÂN (SECURITY & PROFILE)                  */}
          {/* ----------------------------------------------------------------------- */}
          {(activeCategory === 'all' || activeCategory === 'security') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1 pt-1">
                <span>Bảo Mật & Hồ Sơ Cá Nhân</span>
                <span className="text-emerald-400">E2EE 6-Layer</span>
              </div>

              {/* Six-Layer Security Shield Status */}
              <button
                type="button"
                onClick={() => handleNavigate('profile', 'security')}
                className="w-full p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 hover:from-emerald-900/60 hover:to-zinc-800/90 border border-emerald-500/40 hover:border-emerald-400 text-left transition-all flex items-center gap-2.5 group cursor-pointer shadow-sm active:scale-98"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-zinc-950 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <ShieldCheck size={16} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-xs font-black text-emerald-300 flex items-center justify-between">
                    <span>Bảo Mật 6 Lớp & Khóa Chuỗi</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">6/6 Lớp 🛡️</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">Mã hóa E2EE, ID số duy nhất, khóa Admin Chain</div>
                </div>
                <ChevronRight size={14} className="text-zinc-600 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Edit Profile, Identity & Cosmic Cover */}
              <button
                type="button"
                onClick={() => handleNavigate('profile', 'about')}
                className="w-full p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-blue-500/40 text-left transition-all flex items-center gap-2.5 group cursor-pointer shadow-sm active:scale-98"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <UserIcon size={16} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-xs font-black text-zinc-100 group-hover:text-blue-300 transition-colors flex items-center justify-between">
                    <span>Chỉnh Sửa Hồ Sơ & Tùy Biến</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">Ảnh Bìa & Khung</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">Đổi tên, bio, khung avatar động & ảnh bìa vũ trụ</div>
                </div>
                <ChevronRight size={14} className="text-zinc-600 group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Points & Transaction History */}
              <button
                type="button"
                onClick={() => handleNavigate('profile', 'transactions')}
                className="w-full p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-amber-500/40 text-left transition-all flex items-center gap-2.5 group cursor-pointer shadow-sm active:scale-98"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 text-zinc-950 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <Coins size={16} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-xs font-black text-zinc-100 group-hover:text-amber-300 transition-colors flex items-center justify-between">
                    <span>Lịch Sử Giao Dịch & Điểm Thưởng</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Sao Kê</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">Biến động điểm Audio, nạp xu, quà tặng bạn bè</div>
                </div>
                <ChevronRight size={14} className="text-zinc-600 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* SECTION C: MỤC LIÊN KẾT (GOOGLE DOCS, GOOGLE TASKS & GOOGLE DRIVE)      */}
          {/* ----------------------------------------------------------------------- */}
          {(activeCategory === 'all' || activeCategory === 'google') && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                <div className="flex items-center gap-1.5 text-zinc-200">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                  <span>Mục Liên Kết (Google Docs, Tasks & Drive)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-blue-400 font-mono text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/30">
                    Docs {docsConfig.connected ? '●' : '○'}
                  </span>
                  <span className="text-sky-400 font-mono text-[9px] px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/30">
                    Tasks {tasksConfig.connected ? '●' : '○'}
                  </span>
                  <span className="text-amber-400 font-mono text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                    Drive {driveConfig.connected ? '●' : '○'}
                  </span>
                </div>
              </div>

              {/* ================================================================= */}
              {/* GOOGLE DOCS WORKSPACE CARD (NẰM TRƯỚC GOOGLE DRIVE TRONG MỤC LIÊN KẾT) */}
              {/* ================================================================= */}
              <div
                className="p-3.5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 hover:border-blue-500/40 transition-all space-y-3 shadow-md group cursor-pointer"
                onClick={() => setIsDocsModalOpen(true)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform shrink-0">
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-zinc-100 group-hover:text-blue-300 transition-colors">
                          Google Docs Workspace
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30 font-bold">
                          Văn Bản
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono truncate max-w-[200px]">
                        {docsConfig.email}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0 ${
                    docsConfig.connected
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700/60'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${docsConfig.connected ? 'bg-blue-400 animate-pulse' : 'bg-zinc-600'}`}></span>
                    <span>{docsConfig.connected ? 'Đã liên kết' : 'Tạm ngắt'}</span>
                  </span>
                </div>

                {/* Sub-Export Capabilities Pills */}
                <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                  <div className="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80 text-center">
                    <div className="text-teal-400 font-bold flex items-center justify-center gap-1">
                      <GraduationCap size={10} />
                      <span>STEM Lab</span>
                    </div>
                    <div className="text-zinc-500 text-[8px] mt-0.5">Sổ tay thí nghiệm</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80 text-center">
                    <div className="text-purple-400 font-bold flex items-center justify-center gap-1">
                      <Sparkles size={10} />
                      <span>Tâm Linh</span>
                    </div>
                    <div className="text-zinc-500 text-[8px] mt-0.5">Xuất quẻ & kinh</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80 text-center">
                    <div className="text-amber-400 font-bold flex items-center justify-center gap-1">
                      <BrainCircuit size={10} />
                      <span>Haevy AI</span>
                    </div>
                    <div className="text-zinc-500 text-[8px] mt-0.5">Hội thoại AI</div>
                  </div>
                </div>

                {/* Google Docs Actions Bar */}
                <div className="pt-0.5 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <a
                      href="https://docs.google.com/document/create"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                    >
                      <Plus size={13} />
                      <span>Tạo Doc mới</span>
                      <ExternalLink size={10} className="text-blue-200" />
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setDocsExportOptions({
                          title: `[Haevy Workspace] Sổ Tay & Ghi Chép ${new Date().toLocaleDateString('vi-VN')}`,
                          contentMarkdown: `## SỔ TAY HỆ SINH THÁI HAEVY\n\n*Ngày tạo: ${new Date().toLocaleString('vi-VN')}*\n\nNội dung văn bản được đồng bộ và xuất trực tiếp từ Google Docs Workspace của Haevy.`,
                          category: 'haevy_general',
                          categoryLabel: 'Haevy - Workspace',
                          tags: ['HaevyEcosystem', 'GoogleDocs', 'Notes'],
                          summary: 'Tài liệu liên kết từ menu người dùng Haevy.',
                          sourceApp: 'haevy_general'
                        });
                        setIsDocsExportModalOpen(true);
                      }}
                      className="py-2 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer border border-zinc-700 active:scale-95"
                      title="Mở trình xuất tài liệu Google Docs"
                    >
                      <FileText size={13} className="text-blue-400" />
                      <span>Xuất Docs</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsDocsModalOpen(true)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-[10px] transition-all flex items-center justify-center cursor-pointer border border-zinc-700"
                      title="Cài đặt Google Docs"
                    >
                      <Settings size={12} />
                    </button>

                    <a
                      href={docsConfig.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all flex items-center justify-center border border-zinc-700"
                      title="Mở Google Docs"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* GOOGLE TASKS WORKSPACE CARD (NHIỆM VỤ & NHẮC NHỞ HỌC BÀI THEO QUÁ TRÌNH) */}
              {/* ================================================================= */}
              <div
                className="p-3.5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 hover:border-sky-500/40 transition-all space-y-3 shadow-md group cursor-pointer"
                onClick={() => setIsTasksDetailModalOpen(true)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform shrink-0">
                      <CheckSquare size={18} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-zinc-100 group-hover:text-sky-300 transition-colors">
                          Google Tasks Workspace
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30 font-bold">
                          Nhiệm Vụ
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono truncate max-w-[200px]">
                        {tasksConfig.email}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0 ${
                    tasksConfig.connected
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700/60'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${tasksConfig.connected ? 'bg-sky-400 animate-pulse' : 'bg-zinc-600'}`}></span>
                    <span>{tasksConfig.connected ? 'Đã liên kết' : 'Tạm ngắt'}</span>
                  </span>
                </div>

                {/* Capabilities Badges */}
                <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                  <div className="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80 text-center">
                    <div className="text-sky-400 font-bold flex items-center justify-center gap-1">
                      <GraduationCap size={10} />
                      <span>Học quá trình</span>
                    </div>
                    <div className="text-zinc-500 text-[8px] mt-0.5">Spaced Repetition</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80 text-center">
                    <div className="text-teal-400 font-bold flex items-center justify-center gap-1">
                      <FlaskConical size={10} />
                      <span>STEM & Casio</span>
                    </div>
                    <div className="text-zinc-500 text-[8px] mt-0.5">Thí nghiệm & Casio</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80 text-center">
                    <div className="text-amber-400 font-bold flex items-center justify-center gap-1">
                      <BrainCircuit size={10} />
                      <span>Luyện thi 2027</span>
                    </div>
                    <div className="text-zinc-500 text-[8px] mt-0.5">Đề tốc độ 25p</div>
                  </div>
                </div>

                {/* Google Tasks Action Buttons */}
                <div className="pt-0.5 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsTasksModalOpen(true)}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                    >
                      <ListTodo size={13} />
                      <span>Quản lý nhiệm vụ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsTasksDetailModalOpen(true)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-[10px] transition-all flex items-center justify-center cursor-pointer border border-zinc-700"
                      title="Cài đặt Google Tasks"
                    >
                      <Settings size={12} />
                    </button>

                    <a
                      href={tasksConfig.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all flex items-center justify-center border border-zinc-700"
                      title="Mở Google Tasks"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Google Drive Main Integration Card */}
              <div
                className="p-3.5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 hover:border-amber-500/40 transition-all space-y-3 shadow-md group cursor-pointer"
                onClick={() => setIsDriveModalOpen(true)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-emerald-500 to-blue-500 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform shrink-0">
                      <HardDrive size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-zinc-100 group-hover:text-amber-300 transition-colors">
                          Google Drive Sync
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                          Đám Mây
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono truncate max-w-[200px]">
                        {driveConfig.email}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0 ${
                    driveConfig.connected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700/60'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${driveConfig.connected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`}></span>
                    <span>{driveConfig.connected ? 'Đã liên kết' : 'Tạm ngắt'}</span>
                  </span>
                </div>

                {/* Quota Progress Bar */}
                <div className="space-y-1 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/60">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-400">Dung lượng sử dụng:</span>
                    <span className="font-mono text-zinc-200 font-bold">
                      {driveConfig.usedStorageGb} GB / {driveConfig.totalStorageGb} GB
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-blue-500 rounded-full"
                      style={{ width: `${Math.round((driveConfig.usedStorageGb / driveConfig.totalStorageGb) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-0.5">
                    <span>Đồng bộ: {driveConfig.lastSynced}</span>
                    <span className="text-amber-400/90 font-mono">/Haevy-Ecosystem/</span>
                  </div>
                </div>

                {/* Sub-Sync Status Pills */}
                <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                  <div className="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80 text-center">
                    <div className="text-teal-400 font-bold flex items-center justify-center gap-1">
                      <GraduationCap size={10} />
                      <span>STEM Lab</span>
                    </div>
                    <div className="text-zinc-500 text-[8px] mt-0.5">Tự động lưu</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80 text-center">
                    <div className="text-purple-400 font-bold flex items-center justify-center gap-1">
                      <Music size={10} />
                      <span>Audio</span>
                    </div>
                    <div className="text-zinc-500 text-[8px] mt-0.5">Đồng bộ Playlists</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80 text-center">
                    <div className="text-amber-400 font-bold flex items-center justify-center gap-1">
                      <Database size={10} />
                      <span>Casio & Điểm</span>
                    </div>
                    <div className="text-zinc-500 text-[8px] mt-0.5">Sao lưu an toàn</div>
                  </div>
                </div>

                {/* Google Drive Document Retrieval & Upload CTA */}
                <div className="pt-1 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDrivePickerTab('browse');
                        setIsDrivePickerOpen(true);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                    >
                      <HardDrive size={13} className="text-zinc-950" />
                      <span>Lấy file tài liệu từ Drive</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDrivePickerTab('upload');
                        setIsDrivePickerOpen(true);
                      }}
                      className="py-2 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer border border-zinc-700 active:scale-95"
                      title="Tải tệp mới từ máy lên Google Drive"
                    >
                      <Upload size={13} className="text-emerald-400" />
                      <span>Tải lên</span>
                    </button>
                  </div>

                  {/* Recent Documents on Google Drive */}
                  {driveDocuments.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-zinc-400 font-bold flex items-center gap-1">
                          <FolderOpen size={11} className="text-amber-400" />
                          <span>Tài liệu sẵn sàng trên Drive ({driveDocuments.length}):</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setDrivePickerTab('browse');
                            setIsDrivePickerOpen(true);
                          }}
                          className="text-amber-400 hover:underline text-[10px] font-semibold cursor-pointer"
                        >
                          Xem tất cả
                        </button>
                      </div>

                      <div className="space-y-1">
                        {driveDocuments.slice(0, 2).map((doc) => (
                          <div
                            key={doc.id}
                            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-2 hover:border-zinc-700 transition-colors"
                          >
                            <div className="truncate flex items-center gap-1.5">
                              <FileText size={11} className="text-zinc-400 shrink-0" />
                              <span className="text-[11px] text-zinc-200 font-semibold truncate max-w-[150px]">
                                {doc.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleSelectDocumentForAI(doc)}
                                className="px-1.5 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[9px] font-bold border border-purple-500/30 cursor-pointer"
                                title="Nạp vào AI học tập"
                              >
                                Vào AI
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectDocumentForRoadmap(doc)}
                                className="px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[9px] font-bold border border-emerald-500/30 cursor-pointer"
                                title="Tạo lộ trình học"
                              >
                                Lộ trình
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom Utilities Row */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={handleSyncDrive}
                      disabled={isDriveSyncing || !driveConfig.connected}
                      className="flex-1 py-1 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800/40 text-zinc-300 font-semibold text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={10} className={isDriveSyncing ? 'animate-spin' : ''} />
                      <span>{isDriveSyncing ? 'Đang đồng bộ...' : 'Đồng bộ lại'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsDriveModalOpen(true)}
                      className="py-1 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-[10px] transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Settings size={10} />
                      <span>Cài đặt</span>
                    </button>

                    <a
                      href={driveConfig.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all flex items-center justify-center"
                      title="Mở Google Drive"
                    >
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>

              {driveSyncNotification && (
                <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-200 font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                  <span className="truncate">{driveSyncNotification}</span>
                </div>
              )}

              {/* Note on official integration scope */}
              <div className="px-2 py-1 text-[10px] text-zinc-400 flex items-center gap-1.5 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0"></span>
                <span>Google Docs, Google Tasks & Google Drive là các dịch vụ Workspace chính thức đang liên kết trực tiếp vào hệ sinh thái Haevy.</span>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 5. FOOTER ACTIONS: REWARD CLAIM & SECURE LOGOUT                          */}
        {/* ========================================================================= */}
        <div className="pt-2 border-t border-zinc-800/80 space-y-2">
          {/* Gift Claim Button */}
          <button
            type="button"
            onClick={handleClaim}
            disabled={claimedGift}
            className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
              claimedGift 
                ? 'bg-zinc-900 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 active:scale-98'
            }`}
          >
            {claimedGift ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span>Đã nhận 500 Xu Đại Lễ!</span>
              </>
            ) : (
              <>
                <Gift size={13} className="text-amber-400 animate-bounce" />
                <span>Nhận Quà 500 Xu Đại Lễ</span>
              </>
            )}
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full py-2 rounded-xl bg-zinc-900/80 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-800/60 hover:border-rose-800/40 active:scale-98"
          >
            <LogOut size={13} />
            <span>Đăng xuất tài khoản an toàn</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. MODALS TRIGGERED DIRECTLY FROM THE AVATAR ACTION TASK PANEL           */}
      {/* ========================================================================= */}
      {isEduPushModalOpen && (
        <EduPushNotificationModal
          isOpen={isEduPushModalOpen}
          onClose={() => setIsEduPushModalOpen(false)}
          onNavigateToTab={(tab) => {
            setIsEduPushModalOpen(false);
            onClose();
            onSelectMode('edu', tab);
          }}
        />
      )}

      {/* Google Docs Workspace Detail Modal */}
      <GoogleDocsDetailModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
        config={docsConfig}
        onUpdateConfig={handleUpdateDocsConfig}
        onOpenExportModal={() => {
          setDocsExportOptions({
            title: `[Haevy Workspace] Sổ Tay & Ghi Chép ${new Date().toLocaleDateString('vi-VN')}`,
            contentMarkdown: `## SỔ TAY HỆ SINH THÁI HAEVY\n\n*Ngày tạo: ${new Date().toLocaleString('vi-VN')}*\n\nNội dung văn bản được đồng bộ và xuất trực tiếp từ Google Docs Workspace của Haevy.`,
            category: 'haevy_general',
            categoryLabel: 'Haevy - Workspace',
            tags: ['HaevyEcosystem', 'GoogleDocs', 'Notes'],
            summary: 'Tài liệu liên kết từ menu người dùng Haevy.',
            sourceApp: 'haevy_general'
          });
          setIsDocsExportModalOpen(true);
        }}
      />

      {/* Google Docs Direct Export Modal */}
      <GoogleDocsExportModal
        isOpen={isDocsExportModalOpen}
        onClose={() => setIsDocsExportModalOpen(false)}
        options={docsExportOptions}
      />

      {/* Google Tasks Workspace Detail Modal */}
      <GoogleTasksDetailModal
        isOpen={isTasksDetailModalOpen}
        onClose={() => setIsTasksDetailModalOpen(false)}
        config={tasksConfig}
        onUpdateConfig={handleUpdateTasksConfig}
        onOpenTasksModal={() => setIsTasksModalOpen(true)}
      />

      {/* Google Tasks Workspace Interactive Modal */}
      <GoogleTasksModal
        isOpen={isTasksModalOpen}
        onClose={() => setIsTasksModalOpen(false)}
        initialCategory="study"
      />

      <GoogleDriveDetailModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        config={driveConfig}
        onUpdateConfig={handleUpdateDriveConfig}
      />

      <GoogleDriveDocumentPickerModal
        isOpen={isDrivePickerOpen}
        onClose={() => setIsDrivePickerOpen(false)}
        config={driveConfig}
        onSelectDocumentForAI={handleSelectDocumentForAI}
        onSelectDocumentForRoadmap={handleSelectDocumentForRoadmap}
        initialTab={drivePickerTab}
      />


    </>
  );
}
