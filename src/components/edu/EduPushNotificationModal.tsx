import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Volume2,
  VolumeX,
  Send,
  Trash2,
  ChevronRight,
  ExternalLink,
  Flame,
  Award,
  Layers,
  FlaskConical,
  GraduationCap,
  BookOpen,
  Check,
  X,
  Play,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import { 
  EduThpt2027Milestone, 
  EduPushReminderConfig, 
  EduDailyReminderSlot, 
  EduDispatchedNotification,
  EduLabSubject
} from '../../types';
import {
  PRESET_THPT_2027_MILESTONES,
  THPT_2027_EXAM_DATE,
  getEduPushConfig,
  saveEduPushConfig,
  getEduNotificationHistory,
  clearEduNotificationHistory,
  markEduNotificationAsRead,
  calculateThpt2027Countdown,
  requestEduNotificationPermission,
  getNotificationPermissionStatus,
  sendTestPushNotification,
  playEduReminderChime,
  dispatchWebPushNotification
} from '../../services/eduPushNotificationService';

interface EduPushNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string, payload?: any) => void;
  onOpenLab?: (subject: EduLabSubject, experimentId: string) => void;
  onOpenExam?: (presetId?: string) => void;
  onOpenAssistant?: (prompt: string) => void;
}

export function EduPushNotificationModal({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenLab,
  onOpenExam,
  onOpenAssistant
}: EduPushNotificationModalProps) {
  // Modal sub-tabs
  const [activeTab, setActiveTab] = useState<'milestones' | 'daily_schedule' | 'history'>('milestones');

  // Push notification state
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [config, setConfig] = useState<EduPushReminderConfig>(getEduPushConfig());
  const [history, setHistory] = useState<EduDispatchedNotification[]>(getEduNotificationHistory());
  const [testNotificationSent, setTestNotificationSent] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Live countdown state
  const [countdown, setCountdown] = useState(calculateThpt2027Countdown());

  // Update countdown every second
  useEffect(() => {
    if (!isOpen) return;
    setPermissionStatus(getNotificationPermissionStatus());
    setConfig(getEduPushConfig());
    setHistory(getEduNotificationHistory());

    const timer = setInterval(() => {
      setCountdown(calculateThpt2027Countdown());
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const status = await requestEduNotificationPermission();
    setPermissionStatus(status);
    if (status === 'granted') {
      setStatusMessage('Đã kích hoạt thành công quyền thông báo đẩy Web Push!');
      playEduReminderChime();
      setTimeout(() => setStatusMessage(null), 4000);
    } else if (status === 'denied') {
      setStatusMessage('Trình duyệt đang chặn thông báo. Vui lòng cho phép quyền thông báo ở thanh địa chỉ URL.');
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleTogglePush = (enabled: boolean) => {
    const updated = { ...config, pushEnabled: enabled };
    setConfig(updated);
    saveEduPushConfig(updated);
  };

  const handleToggleSound = (enabled: boolean) => {
    const updated = { ...config, soundEnabled: enabled };
    setConfig(updated);
    saveEduPushConfig(updated);
    if (enabled) {
      playEduReminderChime();
    }
  };

  const handleToggleMilestoneReminders = (enabled: boolean) => {
    const updated = { ...config, milestoneRemindersEnabled: enabled };
    setConfig(updated);
    saveEduPushConfig(updated);
  };

  const handleFrequencyChange = (freq: 'daily' | 'weekdays' | 'alternate_days' | 'weekends') => {
    const updated = { ...config, frequency: freq };
    setConfig(updated);
    saveEduPushConfig(updated);
  };

  const handleToggleSlot = (slotId: string) => {
    const updatedSlots = config.dailySlots.map(s => 
      s.id === slotId ? { ...s, enabled: !s.enabled } : s
    );
    const updated = { ...config, dailySlots: updatedSlots };
    setConfig(updated);
    saveEduPushConfig(updated);
  };

  const handleTimeChange = (slotId: string, newTime: string) => {
    const updatedSlots = config.dailySlots.map(s => 
      s.id === slotId ? { ...s, time: newTime } : s
    );
    const updated = { ...config, dailySlots: updatedSlots };
    setConfig(updated);
    saveEduPushConfig(updated);
  };

  const handleSendTestPush = () => {
    const notif = sendTestPushNotification();
    setHistory(getEduNotificationHistory());
    setTestNotificationSent(true);
    setStatusMessage('Đã phát thông báo đẩy thử nghiệm tới màn hình của bạn!');
    setTimeout(() => {
      setTestNotificationSent(false);
      setStatusMessage(null);
    }, 4000);
  };

  const handleClearHistory = () => {
    clearEduNotificationHistory();
    setHistory([]);
  };

  const handleActionClick = (item: { actionType?: string; actionPayload?: any; milestoneId?: string }) => {
    onClose();
    if (item.actionType === 'open_lab') {
      const subj = item.actionPayload?.subject || 'physics';
      const expId = item.actionPayload?.experimentId || 'pendulum';
      if (onOpenLab) onOpenLab(subj as EduLabSubject, expId);
      else if (onNavigateToTab) onNavigateToTab('labs');
    } else if (item.actionType === 'open_exam') {
      const presetId = item.actionPayload?.presetId;
      if (onOpenExam) onOpenExam(presetId);
      else if (onNavigateToTab) onNavigateToTab('exam');
    } else if (item.actionType === 'open_assistant') {
      const query = item.actionPayload?.initialQuery || 'Hỏi đáp First Principles';
      if (onOpenAssistant) onOpenAssistant(query);
      else if (onNavigateToTab) onNavigateToTab('assistant');
    } else if (item.actionType === 'open_notebook') {
      if (onNavigateToTab) onNavigateToTab('notebook');
    } else {
      if (onNavigateToTab) onNavigateToTab('assistant');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-zinc-900 border border-zinc-700/80 w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <BellRing size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-100">
                  Nhắc Nhở Học Tập & Cột Mốc THPT 2027
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                  GDPT 2018
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Thông báo đẩy định kỳ (Web Push) đồng hành từng mốc ôn luyện bứt phá điểm 9+
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Message Notification Bar */}
        {statusMessage && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-4 py-2 text-xs text-emerald-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-emerald-200">
              <X size={12} />
            </button>
          </div>
        )}

        {/* Hero Countdown Section */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-zinc-950 via-zinc-900 to-amber-950/20 border-b border-zinc-800 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
                <Flame size={14} className="animate-bounce text-amber-500" />
                <span>ĐẾM NGƯỢC CHIẾN DỊCH ÔN THI THPT 2027 (25/06/2027)</span>
              </div>
              <p className="text-xs text-zinc-400 max-w-xl">
                Cột mốc tiếp theo:{' '}
                <strong className="text-zinc-200">
                  {countdown.nextMilestone?.title || 'Kỳ thi THPT 2027'}
                </strong>{' '}
                (Còn {countdown.daysToNextMilestone} ngày)
              </p>
            </div>

            {/* Countdown Flip Counters */}
            <div className="flex items-center gap-2 font-mono">
              <div className="flex flex-col items-center bg-zinc-950 border border-amber-500/30 px-3 py-1.5 rounded-xl shadow-inner min-w-[54px]">
                <span className="text-xl sm:text-2xl font-black text-amber-400">{countdown.days}</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-sans">Ngày</span>
              </div>
              <span className="text-zinc-600 font-bold">:</span>
              <div className="flex flex-col items-center bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl shadow-inner min-w-[54px]">
                <span className="text-xl sm:text-2xl font-bold text-zinc-200">
                  {String(countdown.hours).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-sans">Giờ</span>
              </div>
              <span className="text-zinc-600 font-bold">:</span>
              <div className="flex flex-col items-center bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl shadow-inner min-w-[54px]">
                <span className="text-xl sm:text-2xl font-bold text-zinc-200">
                  {String(countdown.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-sans">Phút</span>
              </div>
              <span className="text-zinc-600 font-bold">:</span>
              <div className="flex flex-col items-center bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl shadow-inner min-w-[54px]">
                <span className="text-xl sm:text-2xl font-bold text-amber-500">
                  {String(countdown.seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-sans">Giây</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Controls & Permission Status Bar */}
        <div className="px-4 py-3 bg-zinc-950/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-zinc-400 font-medium">Trạng thái Web Push:</span>
            {permissionStatus === 'granted' ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                <CheckCircle2 size={12} /> Đã cấp quyền thông báo
              </span>
            ) : permissionStatus === 'denied' ? (
              <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                <AlertCircle size={12} /> Trình duyệt đang chặn
              </span>
            ) : (
              <button
                onClick={handleRequestPermission}
                className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Bell size={12} /> Bật Cấp Quyền Thông Báo
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Master Push Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-300 hover:text-white">
              <input
                type="checkbox"
                checked={config.pushEnabled}
                onChange={(e) => handleTogglePush(e.target.checked)}
                className="rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-[11px] font-medium">Bật Nhắc Nhở Đẩy</span>
            </label>

            {/* Sound Toggle */}
            <button
              onClick={() => handleToggleSound(!config.soundEnabled)}
              className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                config.soundEnabled 
                  ? 'bg-zinc-800 text-amber-400 border-amber-500/30' 
                  : 'bg-zinc-900 text-zinc-500 border-zinc-800'
              }`}
              title={config.soundEnabled ? 'Âm thanh chuông báo: Đang bật' : 'Âm thanh chuông báo: Tắt'}
            >
              {config.soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span className="text-[11px] hidden sm:inline">Âm thanh</span>
            </button>

            {/* Send Test Push */}
            <button
              onClick={handleSendTestPush}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Gửi thử một thông báo đẩy ngay lúc này để kiểm tra trên thiết bị"
            >
              <Send size={12} className={testNotificationSent ? 'text-emerald-400' : 'text-amber-400'} />
              <span>Gửi Thử Push</span>
            </button>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="px-4 pt-2 bg-zinc-900 border-b border-zinc-800 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('milestones')}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'milestones'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Calendar size={14} />
            <span>7 Cột Mốc THPT 2027</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
              7
            </span>
          </button>

          <button
            onClick={() => setActiveTab('daily_schedule')}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'daily_schedule'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Clock size={14} />
            <span>Lịch Nhắc Nhở Hằng Ngày</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 font-mono">
              {config.dailySlots.filter(s => s.enabled).length}/4
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bell size={14} />
            <span>Hộp Thư Thông Báo</span>
            {history.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                {history.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: 7 MILESTONES */}
          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-zinc-950/60 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-amber-400 shrink-0" />
                  <span className="text-xs text-zinc-300">
                    Lộ trình được thiết kế chuẩn cấu trúc đề thi tốt nghiệp THPT 2027 mới của Bộ GD&ĐT (Trắc nghiệm + Đúng/Sai + Trả lời ngắn).
                  </span>
                </div>
                <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={config.milestoneRemindersEnabled}
                    onChange={(e) => handleToggleMilestoneReminders(e.target.checked)}
                    className="rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-zinc-300 font-medium">Nhắc nhở tự động trước ngày đến hạn cột mốc</span>
                </label>
              </div>

              {/* Milestones List */}
              <div className="space-y-3">
                {PRESET_THPT_2027_MILESTONES.map((m) => {
                  const targetTime = new Date(`${m.targetDate}T00:00:00`).getTime();
                  const now = Date.now();
                  const daysLeft = Math.ceil((targetTime - now) / (1000 * 60 * 60 * 24));
                  const isPast = daysLeft < 0;
                  const isCurrentTarget = m.id === countdown.nextMilestone?.id;

                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCurrentTarget
                          ? 'bg-zinc-950 border-amber-500/60 ring-1 ring-amber-500/20 shadow-lg shadow-amber-950/20'
                          : isPast
                          ? 'bg-zinc-950/40 border-zinc-800/80 opacity-80'
                          : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                            isCurrentTarget
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : isPast
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                          }`}>
                            {isPast ? <Check size={16} /> : m.stageNumber}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-bold text-zinc-100">
                                {m.title}
                              </h3>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-medium">
                                {m.badge}
                              </span>
                              {isCurrentTarget && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold animate-pulse">
                                  Mốc Hiện Tại
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-amber-400/90 font-medium">
                              {m.subtitle}
                            </p>

                            <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                              {m.focusSummary}
                            </p>

                            {/* Key Actions Checklist */}
                            <div className="pt-2 space-y-1">
                              {m.keyActions.map((action, aIdx) => (
                                <div key={aIdx} className="flex items-center gap-2 text-[11px] text-zinc-300">
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                  <span>{action}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right side: Target Date & Quick Action Button */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-zinc-200 block">
                              {new Date(m.targetDate).toLocaleDateString('vi-VN')}
                            </span>
                            <span className={`text-[10px] font-mono ${
                              isPast ? 'text-zinc-500' : daysLeft <= 30 ? 'text-rose-400 font-bold' : 'text-amber-400'
                            }`}>
                              {isPast ? 'Đã hoàn thành' : `Còn ~${daysLeft} ngày`}
                            </span>
                          </div>

                          <button
                            onClick={() => handleActionClick({
                              actionType: m.suggestedActionType,
                              actionPayload: m.actionTargetPayload,
                              milestoneId: m.id
                            })}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
                          >
                            <Play size={12} fill="currentColor" />
                            <span>Học Mốc Này</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: DAILY SCHEDULE ROUTINE */}
          {activeTab === 'daily_schedule' && (
            <div className="space-y-4">
              {/* Frequency Selector */}
              <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">Tần Suất Bắn Thông Báo Đẩy</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Chọn các ngày trong tuần hệ thống sẽ tự động gửi thông điệp nhắc nhở
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => handleFrequencyChange('daily')}
                    className={`px-2.5 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                      config.frequency === 'daily'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    Hằng ngày (T2-CN)
                  </button>
                  <button
                    onClick={() => handleFrequencyChange('weekdays')}
                    className={`px-2.5 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                      config.frequency === 'weekdays'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    Ngày thường (T2-T6)
                  </button>
                  <button
                    onClick={() => handleFrequencyChange('alternate_days')}
                    className={`px-2.5 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                      config.frequency === 'alternate_days'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    Cách ngày (2-4-6)
                  </button>
                  <button
                    onClick={() => handleFrequencyChange('weekends')}
                    className={`px-2.5 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                      config.frequency === 'weekends'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    Cuối tuần (T7-CN)
                  </button>
                </div>
              </div>

              {/* 4 Daily Slots */}
              <div className="space-y-3">
                {config.dailySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      slot.enabled
                        ? 'bg-zinc-950/90 border-zinc-800 hover:border-zinc-700'
                        : 'bg-zinc-950/40 border-zinc-900 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <label className="mt-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={slot.enabled}
                            onChange={() => handleToggleSlot(slot.id)}
                            className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-0 cursor-pointer"
                          />
                        </label>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-zinc-100">
                              {slot.label}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                              {slot.actionType === 'open_assistant' ? '🤖 Trợ Lý First Principles' : slot.actionType === 'open_lab' ? '🔬 Lab Ảo STEM' : slot.actionType === 'open_exam' ? '⏱️ Thi Thử fx-880' : '📓 Sổ Tay Nghiên Cứu'}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1">
                            {slot.topic}
                          </p>
                        </div>
                      </div>

                      {/* Time Input Field */}
                      <div className="flex items-center gap-2 ml-7 sm:ml-0">
                        <span className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                          <Clock size={12} className="text-amber-400" />
                          Giờ nhắc:
                        </span>
                        <input
                          type="time"
                          value={slot.time}
                          onChange={(e) => handleTimeChange(slot.id, e.target.value)}
                          disabled={!slot.enabled}
                          className="bg-zinc-900 border border-zinc-700 focus:border-amber-400 rounded-xl px-2.5 py-1 text-xs text-amber-300 font-mono font-bold outline-none cursor-pointer disabled:opacity-40"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-zinc-400">
                  Danh sách các thông báo đã gửi tới thiết bị của bạn ({history.length}):
                </span>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-zinc-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={12} />
                    <span>Xóa toàn bộ</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="p-8 text-center bg-zinc-950/40 rounded-2xl border border-zinc-800/80">
                  <BellOff size={28} className="mx-auto text-zinc-600 mb-2" />
                  <p className="text-xs text-zinc-400">
                    Chưa có thông báo nào được gửi. Bấm "Gửi Thử Push" ở trên để kiểm tra ngay!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-zinc-950/80 border border-zinc-800/90 rounded-xl flex items-start justify-between gap-3 hover:border-zinc-700 transition-all"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Bell size={13} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-zinc-100">
                              {item.title}
                            </h4>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {item.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                            {item.body}
                          </p>
                        </div>
                      </div>

                      {item.actionType && (
                        <button
                          onClick={() => handleActionClick({
                            actionType: item.actionType,
                            actionPayload: item.actionPayload,
                            milestoneId: item.milestoneId
                          })}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] font-medium text-zinc-200 hover:text-white transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Mở</span>
                          <ExternalLink size={10} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Sparkles size={13} className="text-amber-400" />
            <span>Mỗi ngày 15 phút tư duy nguyên lý gốc tạo nên sự khác biệt vượt trội tại THPT 2027.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
