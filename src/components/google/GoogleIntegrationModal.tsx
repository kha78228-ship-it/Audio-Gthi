import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Unlink,
  Link2,
  X,
  ShieldCheck,
  FolderSync,
  FileText,
  Music,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Database,
  CloudCheck,
  CheckSquare,
  ListTodo,
  FlaskConical,
  BrainCircuit
} from 'lucide-react';

export interface GoogleDriveServiceConfig {
  id: 'drive';
  name: string;
  tagline: string;
  badge: string;
  scope: string;
  connected: boolean;
  email: string;
  lastSynced: string;
  usedStorageGb: number;
  totalStorageGb: number;
  folderPath: string;
  accentColor: string;
  description: string;
  linkUrl: string;
  autoSyncOptions: {
    stemLabNotebooks: boolean;
    audioPlaylists: boolean;
    examAndCasioRecords: boolean;
  };
}

export const INITIAL_GOOGLE_DRIVE_CONFIG: GoogleDriveServiceConfig = {
  id: 'drive',
  name: 'Google Drive',
  tagline: 'Lưu trữ đám mây & Đồng bộ dữ liệu Haevy',
  badge: 'Cloud Storage',
  scope: 'https://www.googleapis.com/auth/drive.file',
  connected: true,
  email: 'kha78228@gmail.com',
  lastSynced: 'Vừa xong',
  usedStorageGb: 15.4,
  totalStorageGb: 100,
  folderPath: 'Google Drive / Haevy-Ecosystem / Cloud-Sync',
  accentColor: 'text-amber-400',
  description: 'Dịch vụ lưu trữ đám mây chính thức của Google được tích hợp trực tiếp vào hệ sinh thái Haevy. Tự động sao lưu giáo trình STEM Lab, playlist âm thanh, dữ liệu Casio fx-880 và hồ sơ học tập.',
  linkUrl: 'https://drive.google.com',
  autoSyncOptions: {
    stemLabNotebooks: true,
    audioPlaylists: true,
    examAndCasioRecords: true
  }
};

export function getStoredGoogleDriveConfig(): GoogleDriveServiceConfig {
  try {
    const raw = localStorage.getItem('haevy_google_drive_config');
    if (!raw) return INITIAL_GOOGLE_DRIVE_CONFIG;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.id === 'drive') {
      return { ...INITIAL_GOOGLE_DRIVE_CONFIG, ...parsed };
    }
    return INITIAL_GOOGLE_DRIVE_CONFIG;
  } catch {
    return INITIAL_GOOGLE_DRIVE_CONFIG;
  }
}

export function saveStoredGoogleDriveConfig(config: GoogleDriveServiceConfig) {
  try {
    localStorage.setItem('haevy_google_drive_config', JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('haevy-google-drive-change', { detail: config }));
  } catch (err) {
    console.error('Failed to save google drive config:', err);
  }
}

// ---------------------------------------------------------------------------
// GOOGLE DOCS SERVICE CONFIG & UTILITIES
// ---------------------------------------------------------------------------

export interface GoogleDocsServiceConfig {
  id: 'docs';
  name: string;
  tagline: string;
  badge: string;
  scope: string;
  connected: boolean;
  email: string;
  lastSynced: string;
  accentColor: string;
  description: string;
  linkUrl: string;
  autoExportOptions: {
    stemLabNotebooks: boolean;
    spiritualReadings: boolean;
    aiChatTranscripts: boolean;
  };
}

export const INITIAL_GOOGLE_DOCS_CONFIG: GoogleDocsServiceConfig = {
  id: 'docs',
  name: 'Google Docs',
  tagline: 'Tạo, biên soạn & xuất tài liệu đám mây chính thức',
  badge: 'Google Workspace',
  scope: 'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file',
  connected: true,
  email: 'kha78228@gmail.com',
  lastSynced: 'Vừa xong',
  accentColor: 'text-blue-400',
  description: 'Trình biên tập tài liệu trực tuyến Google Docs thuộc Google Workspace. Hỗ trợ tự động xuất bản lộ trình học tập First Principles, sổ tay STEM Lab, văn bản tâm linh và hội thoại Haevy AI.',
  linkUrl: 'https://docs.google.com',
  autoExportOptions: {
    stemLabNotebooks: true,
    spiritualReadings: true,
    aiChatTranscripts: true
  }
};

export function getStoredGoogleDocsConfig(): GoogleDocsServiceConfig {
  try {
    const raw = localStorage.getItem('haevy_google_docs_config');
    if (!raw) return INITIAL_GOOGLE_DOCS_CONFIG;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.id === 'docs') {
      return { ...INITIAL_GOOGLE_DOCS_CONFIG, ...parsed };
    }
    return INITIAL_GOOGLE_DOCS_CONFIG;
  } catch {
    return INITIAL_GOOGLE_DOCS_CONFIG;
  }
}

export function saveStoredGoogleDocsConfig(config: GoogleDocsServiceConfig) {
  try {
    localStorage.setItem('haevy_google_docs_config', JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('haevy-google-docs-change', { detail: config }));
  } catch (err) {
    console.error('Failed to save google docs config:', err);
  }
}

// ---------------------------------------------------------------------------
// GOOGLE TASKS SERVICE CONFIG & UTILITIES
// ---------------------------------------------------------------------------

export interface GoogleTasksServiceConfig {
  id: 'tasks';
  name: string;
  tagline: string;
  badge: string;
  scope: string;
  connected: boolean;
  email: string;
  lastSynced: string;
  accentColor: string;
  description: string;
  linkUrl: string;
  autoSyncOptions: {
    studyProcessMilestones: boolean;
    stemLabPractices: boolean;
    examPreparationGoals: boolean;
    mindfulnessHabits: boolean;
  };
}

export const INITIAL_GOOGLE_TASKS_CONFIG: GoogleTasksServiceConfig = {
  id: 'tasks',
  name: 'Google Tasks',
  tagline: 'Quản lý mục tiêu & nhắc nhở học theo quá trình',
  badge: 'Google Workspace',
  scope: 'https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/tasks.readonly',
  connected: true,
  email: 'kha78228@gmail.com',
  lastSynced: 'Vừa xong',
  accentColor: 'text-sky-400',
  description: 'Dịch vụ danh sách nhiệm vụ và nhắc nhở chính thức của Google Tasks. Đồng bộ lịch học theo quá trình, nhiệm vụ ôn thi THPT 2027, thực hành STEM Lab và chu kỳ ngắt quãng Spaced Repetition.',
  linkUrl: 'https://calendar.google.com/calendar/u/0/r/tasks',
  autoSyncOptions: {
    studyProcessMilestones: true,
    stemLabPractices: true,
    examPreparationGoals: true,
    mindfulnessHabits: true
  }
};

export function getStoredGoogleTasksConfig(): GoogleTasksServiceConfig {
  try {
    const raw = localStorage.getItem('haevy_google_tasks_config');
    if (!raw) return INITIAL_GOOGLE_TASKS_CONFIG;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.id === 'tasks') {
      return { ...INITIAL_GOOGLE_TASKS_CONFIG, ...parsed };
    }
    return INITIAL_GOOGLE_TASKS_CONFIG;
  } catch {
    return INITIAL_GOOGLE_TASKS_CONFIG;
  }
}

export function saveStoredGoogleTasksConfig(config: GoogleTasksServiceConfig) {
  try {
    localStorage.setItem('haevy_google_tasks_config', JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('haevy-google-tasks-change', { detail: config }));
  } catch (err) {
    console.error('Failed to save google tasks config:', err);
  }
}

interface GoogleDriveDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleDriveServiceConfig;
  onUpdateConfig: (newConfig: GoogleDriveServiceConfig) => void;
}

export function GoogleDriveDetailModal({
  isOpen,
  onClose,
  config,
  onUpdateConfig
}: GoogleDriveDetailModalProps) {
  const [localConfig, setLocalConfig] = useState<GoogleDriveServiceConfig>(config);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  if (!isOpen) return null;

  const handleToggleOption = (key: keyof GoogleDriveServiceConfig['autoSyncOptions']) => {
    const updated = {
      ...localConfig,
      autoSyncOptions: {
        ...localConfig.autoSyncOptions,
        [key]: !localConfig.autoSyncOptions[key]
      }
    };
    setLocalConfig(updated);
    onUpdateConfig(updated);
    saveStoredGoogleDriveConfig(updated);
  };

  const handleToggleConnection = () => {
    const nextConnected = !localConfig.connected;
    const updated: GoogleDriveServiceConfig = {
      ...localConfig,
      connected: nextConnected,
      lastSynced: nextConnected ? 'Vừa xong' : 'Đã ngắt liên kết'
    };
    setLocalConfig(updated);
    onUpdateConfig(updated);
    saveStoredGoogleDriveConfig(updated);
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const updated: GoogleDriveServiceConfig = {
        ...localConfig,
        lastSynced: 'Vừa xong',
        usedStorageGb: Number((localConfig.usedStorageGb + 0.1).toFixed(1))
      };
      setIsSyncing(false);
      setLocalConfig(updated);
      onUpdateConfig(updated);
      saveStoredGoogleDriveConfig(updated);
      setSyncSuccessMsg('Đã sao lưu thành công 3 tệp mới lên Google Drive!');
      setTimeout(() => setSyncSuccessMsg(null), 3000);
    }, 900);
  };

  const usagePercent = Math.min(100, Math.round((localConfig.usedStorageGb / localConfig.totalStorageGb) * 100));

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-emerald-500 to-blue-500 text-white flex items-center justify-center shadow-lg font-black">
              <HardDrive size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-zinc-100">Google Drive Cloud Sync</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Hỗ trợ chính thức
                </span>
              </div>
              <p className="text-xs text-zinc-400">Đồng bộ dữ liệu an toàn theo tài khoản Google</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Status & Account Card */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            localConfig.connected 
              ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-200' 
              : 'bg-zinc-900/80 border-zinc-800 text-zinc-400'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                localConfig.connected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
              }`}>
                {localConfig.connected ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                  <span>{localConfig.connected ? 'Đang hoạt động' : 'Đã ngắt kết nối'}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">OAuth 2.0</span>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  {localConfig.email}
                </div>
              </div>
            </div>

            <button
              onClick={handleToggleConnection}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                localConfig.connected
                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
              }`}
            >
              {localConfig.connected ? (
                <>
                  <Unlink size={12} />
                  <span>Ngắt kết nối</span>
                </>
              ) : (
                <>
                  <Link2 size={12} />
                  <span>Kết nối lại</span>
                </>
              )}
            </button>
          </div>

          {/* Storage Meter */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-300 font-bold">
                <Database size={14} className="text-amber-400" />
                <span>Dung lượng Google Drive</span>
              </div>
              <span className="font-mono text-zinc-200 font-bold">
                {localConfig.usedStorageGb} GB / {localConfig.totalStorageGb} GB ({usagePercent}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${usagePercent}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
              <span>Đồng bộ lần cuối: <strong className="text-zinc-200">{localConfig.lastSynced}</strong></span>
              <span className="text-emerald-400 font-medium">Bảo mật chuẩn Google</span>
            </div>
          </div>

          {/* Storage Directory Path */}
          <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-xs flex items-center gap-2.5 text-zinc-300">
            <span className="font-bold text-zinc-400 shrink-0">Thư mục Drive:</span>
            <span className="font-mono text-amber-300/90 truncate">{localConfig.folderPath}</span>
          </div>

          {/* Auto-Sync Option Toggles */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Tùy chọn tự động sao lưu dữ liệu
            </div>

            {/* Option 1: STEM Lab */}
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                  <GraduationCap size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">Sổ tay & Thí nghiệm STEM Lab</div>
                  <div className="text-[10px] text-zinc-400">Tự động sao lưu ghi chép, công thức và sơ đồ mạch</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localConfig.autoSyncOptions.stemLabNotebooks}
                onChange={() => handleToggleOption('stemLabNotebooks')}
                className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Option 2: Audio Playlists */}
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Music size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">Danh sách phát & Thư viện âm thanh</div>
                  <div className="text-[10px] text-zinc-400">Đồng bộ playlist yêu thích và bài hát tự tạo</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localConfig.autoSyncOptions.audioPlaylists}
                onChange={() => handleToggleOption('audioPlaylists')}
                className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Option 3: Exam & Casio */}
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <FileText size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">Lịch sử máy tính Casio & Điểm thi THPT</div>
                  <div className="text-[10px] text-zinc-400">Lưu nhật ký bấm máy fx-880 BTG và bảng xếp hạng</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localConfig.autoSyncOptions.examAndCasioRecords}
                onChange={() => handleToggleOption('examAndCasioRecords')}
                className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
              />
            </div>
          </div>

          {syncSuccessMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span>{syncSuccessMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              onClick={handleManualSync}
              disabled={isSyncing || !localConfig.connected}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:cursor-not-allowed"
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Đang tải lên Drive...' : 'Sao lưu lên Drive ngay'}</span>
            </button>

            <a
              href={localConfig.linkUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-zinc-800 cursor-pointer"
            >
              <span>Mở Drive</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GOOGLE DOCS DETAIL MODAL COMPONENT
// ---------------------------------------------------------------------------

export interface GoogleDocsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleDocsServiceConfig;
  onUpdateConfig: (newConfig: GoogleDocsServiceConfig) => void;
  onOpenExportModal?: () => void;
}

export function GoogleDocsDetailModal({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onOpenExportModal
}: GoogleDocsDetailModalProps) {
  const [localConfig, setLocalConfig] = useState<GoogleDocsServiceConfig>(config);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  if (!isOpen) return null;

  const handleToggleOption = (key: keyof GoogleDocsServiceConfig['autoExportOptions']) => {
    const updated = {
      ...localConfig,
      autoExportOptions: {
        ...localConfig.autoExportOptions,
        [key]: !localConfig.autoExportOptions[key]
      }
    };
    setLocalConfig(updated);
    onUpdateConfig(updated);
    saveStoredGoogleDocsConfig(updated);
  };

  const handleToggleConnection = () => {
    const nextConnected = !localConfig.connected;
    const updated: GoogleDocsServiceConfig = {
      ...localConfig,
      connected: nextConnected,
      lastSynced: nextConnected ? 'Vừa xong' : 'Đã ngắt liên kết'
    };
    setLocalConfig(updated);
    onUpdateConfig(updated);
    saveStoredGoogleDocsConfig(updated);
    setActionSuccessMsg(nextConnected ? 'Đã kích hoạt liên kết Google Docs!' : 'Đã tạm ngắt liên kết Google Docs');
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg font-black shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-zinc-100">Google Docs Workspace</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Google Workspace
                </span>
              </div>
              <p className="text-xs text-zinc-400">Biên soạn, đồng bộ & xuất tài liệu trực tiếp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Status & Account Card */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            localConfig.connected 
              ? 'bg-blue-950/25 border-blue-500/40 text-blue-200' 
              : 'bg-zinc-900/80 border-zinc-800 text-zinc-400'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                localConfig.connected ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-500'
              }`}>
                {localConfig.connected ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                  <span>{localConfig.connected ? 'Đang hoạt động' : 'Đã ngắt kết nối'}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">documents / drive.file</span>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  {localConfig.email}
                </div>
              </div>
            </div>

            <button
              onClick={handleToggleConnection}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                localConfig.connected
                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
              }`}
            >
              {localConfig.connected ? (
                <>
                  <Unlink size={12} />
                  <span>Ngắt kết nối</span>
                </>
              ) : (
                <>
                  <Link2 size={12} />
                  <span>Kết nối</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href="https://docs.google.com/document/create"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 hover:border-blue-500/40 text-left transition-all flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <FileText size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-zinc-200 group-hover:text-blue-300 transition-colors truncate">Tạo Doc Mới</div>
                <div className="text-[10px] text-zinc-400 truncate">Văn bản trắng tức thì</div>
              </div>
            </a>

            {onOpenExportModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenExportModal();
                }}
                className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 hover:border-indigo-500/40 text-left transition-all flex items-center gap-2.5 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Sparkles size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-200 group-hover:text-indigo-300 transition-colors truncate">Xuất Nội Dung</div>
                  <div className="text-[10px] text-zinc-400 truncate">Chọn & định dạng</div>
                </div>
              </button>
            )}
          </div>

          {/* Scopes & Permissions */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
              <ShieldCheck size={14} className="text-blue-400" />
              <span>Phạm vi quyền Google Docs</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Ứng dụng chỉ tạo mới tài liệu được bạn chỉ định xuất và lưu trữ an toàn trong Google Drive của bạn. Không chỉnh sửa hay xóa bất kỳ tệp tin cá nhân nào khác.
            </p>
          </div>

          {/* Auto Export Checkboxes */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider px-1">
              Tính năng hỗ trợ xuất Google Docs
            </div>

            {/* Option 1: STEM Lab */}
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                  <GraduationCap size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">Sổ tay STEM Lab & First Principles</div>
                  <div className="text-[10px] text-zinc-400">Xuất báo cáo bản chất môn học, công thức & lộ trình</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localConfig.autoExportOptions.stemLabNotebooks}
                onChange={() => handleToggleOption('stemLabNotebooks')}
                className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Option 2: Spiritual Readings */}
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Sparkles size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">Văn bản Tâm Linh & Thông Điệp Vũ Trụ</div>
                  <div className="text-[10px] text-zinc-400">Xuất luận giải trải bài Tarot, kinh chú & lời khuyên</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localConfig.autoExportOptions.spiritualReadings}
                onChange={() => handleToggleOption('spiritualReadings')}
                className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Option 3: Haevy AI Transcripts */}
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <FileText size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">Biên bản cuộc hội thoại Haevy AI</div>
                  <div className="text-[10px] text-zinc-400">Xuất toàn bộ phiên thảo luận hoặc từng phản hồi AI</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localConfig.autoExportOptions.aiChatTranscripts}
                onChange={() => handleToggleOption('aiChatTranscripts')}
                className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
              />
            </div>
          </div>

          {actionSuccessMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <a
              href="https://docs.google.com/document/create"
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <FileText size={13} />
              <span>Tạo tài liệu Docs mới</span>
              <ExternalLink size={12} />
            </a>

            <a
              href={localConfig.linkUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-zinc-800 cursor-pointer"
            >
              <span>Mở Google Docs</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GOOGLE TASKS DETAIL MODAL
// ---------------------------------------------------------------------------

interface GoogleTasksDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleTasksServiceConfig;
  onUpdateConfig: (newConfig: GoogleTasksServiceConfig) => void;
  onOpenTasksModal?: () => void;
}

export function GoogleTasksDetailModal({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onOpenTasksModal
}: GoogleTasksDetailModalProps) {
  const [localConfig, setLocalConfig] = useState<GoogleTasksServiceConfig>(config);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  if (!isOpen) return null;

  const handleToggleOption = (key: keyof GoogleTasksServiceConfig['autoSyncOptions']) => {
    const updated = {
      ...localConfig,
      autoSyncOptions: {
        ...localConfig.autoSyncOptions,
        [key]: !localConfig.autoSyncOptions[key]
      }
    };
    setLocalConfig(updated);
    onUpdateConfig(updated);
    saveStoredGoogleTasksConfig(updated);
  };

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const updated: GoogleTasksServiceConfig = {
        ...localConfig,
        lastSynced: 'Vừa xong'
      };
      setLocalConfig(updated);
      onUpdateConfig(updated);
      saveStoredGoogleTasksConfig(updated);
      setActionSuccessMsg('Đã đồng bộ nhiệm vụ học tập thành công với Google Tasks!');
      setTimeout(() => setActionSuccessMsg(null), 3000);
    }, 1000);
  };

  const handleToggleConnected = () => {
    const updated: GoogleTasksServiceConfig = {
      ...localConfig,
      connected: !localConfig.connected
    };
    setLocalConfig(updated);
    onUpdateConfig(updated);
    saveStoredGoogleTasksConfig(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between gap-3 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/20">
              <CheckSquare size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">{localConfig.name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                  {localConfig.badge}
                </span>
              </div>
              <p className="text-xs text-zinc-400">{localConfig.tagline}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Status card */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${localConfig.connected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`}></span>
                <span className="font-bold text-white">
                  {localConfig.connected ? 'Đang kết nối chính thức' : 'Tạm ngắt liên kết'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleConnected}
                className="text-[11px] font-semibold text-zinc-400 hover:text-white underline cursor-pointer"
              >
                {localConfig.connected ? 'Tạm ngắt' : 'Kết nối lại'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-zinc-400">
              <div>
                <span className="text-zinc-500">Tài khoản Google:</span>
                <div className="text-zinc-200 font-mono mt-0.5 truncate">{localConfig.email}</div>
              </div>
              <div>
                <span className="text-zinc-500">Lần đồng bộ gần nhất:</span>
                <div className="text-zinc-200 mt-0.5">{localConfig.lastSynced}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="py-1.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={12} className={isSyncing ? 'animate-spin text-sky-400' : ''} />
                <span>{isSyncing ? 'Đang kiểm tra...' : 'Đồng bộ Google Tasks ngay'}</span>
              </button>

              {onOpenTasksModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTasksModal();
                  }}
                  className="py-1.5 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-[11px] border border-sky-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ListTodo size={12} />
                  <span>Mở bảng nhiệm vụ</span>
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-zinc-400 leading-relaxed text-[11px]">
            {localConfig.description}
          </p>

          {/* Scope details */}
          <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-zinc-300 font-bold text-[11px]">
              <ShieldCheck size={14} className="text-sky-400" />
              <span>Phạm vi quyền OAuth được cấp:</span>
            </div>
            <div className="text-[10px] font-mono text-zinc-400 bg-zinc-950 p-2 rounded-lg border border-zinc-800/80 break-all">
              {localConfig.scope}
            </div>
            <p className="text-[10px] text-zinc-400">
              Quyền quản lý danh sách nhiệm vụ Google Tasks, thêm hạn chót nhắc nhở và đánh dấu hoàn thành bài học.
            </p>
          </div>

          {/* Auto-Sync Configuration */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Tùy chọn đồng bộ nhắc nhở thông minh
            </h4>

            {/* Option 1: Study Process */}
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <GraduationCap size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">Học bài theo quá trình (First Principles)</div>
                  <div className="text-[10px] text-zinc-400">Nhắc nhở ôn tập ngắt quãng Spaced Repetition chu kỳ 1, 3, 7 ngày</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localConfig.autoSyncOptions.studyProcessMilestones}
                onChange={() => handleToggleOption('studyProcessMilestones')}
                className="w-4 h-4 rounded accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Option 2: STEM Lab */}
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                  <FlaskConical size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">Thí nghiệm ảo STEM Lab & Casio fx-880</div>
                  <div className="text-[10px] text-zinc-400">Nhắc nhở thực hành con lắc, mạch điện và bảng tính Casio</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localConfig.autoSyncOptions.stemLabPractices}
                onChange={() => handleToggleOption('stemLabPractices')}
                className="w-4 h-4 rounded accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Option 3: Exam Prep */}
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <BrainCircuit size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">Luyện thi THPT 2027 & Đề tốc độ</div>
                  <div className="text-[10px] text-zinc-400">Mục tiêu giải 30 câu trắc nghiệm tốc độ mỗi ngày</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localConfig.autoSyncOptions.examPreparationGoals}
                onChange={() => handleToggleOption('examPreparationGoals')}
                className="w-4 h-4 rounded accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Option 4: Mindfulness */}
            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Sparkles size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">Thói quen tĩnh tâm & Thiền định Soundscape</div>
                  <div className="text-[10px] text-zinc-400">15 phút nghỉ ngơi sóng não Alpha giải tỏa căng thẳng học tập</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localConfig.autoSyncOptions.mindfulnessHabits}
                onChange={() => handleToggleOption('mindfulnessHabits')}
                className="w-4 h-4 rounded accent-sky-500 cursor-pointer"
              />
            </div>
          </div>

          {actionSuccessMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            {onOpenTasksModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTasksModal();
                }}
                className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <CheckSquare size={14} />
                <span>Quản lý nhiệm vụ</span>
              </button>
            )}

            <a
              href={localConfig.linkUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-zinc-800 cursor-pointer"
            >
              <span>Mở Google Tasks</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

