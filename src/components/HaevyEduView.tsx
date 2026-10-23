import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  FlaskConical, 
  Compass, 
  Film, 
  Atom, 
  TestTube, 
  Dna, 
  BookOpen, 
  BrainCircuit,
  Sparkles, 
  Zap, 
  Activity, 
  CheckCircle2, 
  ChevronRight, 
  Calculator, 
  Timer, 
  Globe, 
  Bell, 
  Calendar, 
  Target, 
  Sun,
  Headphones,
  UploadCloud,
  MessageSquare,
  Wallet,
  Gamepad2,
  Orbit,
  Music,
  ChevronDown,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// Lazy load heavy STEM Labs, Virtual Dashboard, and AI Study views to maximize mobile performance
const PhysicsLab = React.lazy(() => import('./edu/PhysicsLab').then(m => ({ default: m.PhysicsLab })));
const ChemistryLab = React.lazy(() => import('./edu/ChemistryLab').then(m => ({ default: m.ChemistryLab })));
const BiologyLab = React.lazy(() => import('./edu/BiologyLab').then(m => ({ default: m.BiologyLab })));
const DocumentRoadmapView = React.lazy(() => import('./edu/DocumentRoadmapView').then(m => ({ default: m.DocumentRoadmapView })));
const VideoLessonPlayer = React.lazy(() => import('./edu/VideoLessonPlayer').then(m => ({ default: m.VideoLessonPlayer })));
const VirtualLabDashboard = React.lazy(() => import('./edu/VirtualLabDashboard').then(m => ({ default: m.VirtualLabDashboard })));
const AiStudyAssistantView = React.lazy(() => import('./edu/AiStudyAssistantView').then(m => ({ default: m.AiStudyAssistantView })));
const ResearchNotebookView = React.lazy(() => import('./edu/ResearchNotebookView').then(m => ({ default: m.ResearchNotebookView })));
const StemQuickQuizView = React.lazy(() => import('./edu/StemQuickQuizView').then(m => ({ default: m.StemQuickQuizView })));
const EduUtilitySuiteView = React.lazy(() => import('./edu/EduUtilitySuiteView').then(m => ({ default: m.EduUtilitySuiteView })));
const SpeedExamPrepView = React.lazy(() => import('./edu/SpeedExamPrepView').then(m => ({ default: m.SpeedExamPrepView })));
const EduPushNotificationModal = React.lazy(() => import('./edu/EduPushNotificationModal').then(m => ({ default: m.EduPushNotificationModal })));
import { EduDailyGoalTracker } from './edu/EduDailyGoalTracker';
import { EduDailyGoalSummaryStrip } from './edu/EduDailyGoalSummaryStrip';
const EduCelebrationModal = React.lazy(() => import('./edu/EduCelebrationModal').then(m => ({ default: m.EduCelebrationModal })));
const SunStudyAppView = React.lazy(() => import('./edu/sunStudy/SunStudyAppView').then(m => ({ default: m.SunStudyAppView })));
const EduWorkspaceToolkitView = React.lazy(() => import('./edu/EduWorkspaceToolkitView').then(m => ({ default: m.EduWorkspaceToolkitView })));
import { EduMusicPlayer } from './edu/EduMusicPlayer';
import { calculateCurrentDailyGoalStreak, getTodayDateString } from '../services/eduDailyGoalService';
import { 
  evaluateScheduledReminders, 
  calculateThpt2027Countdown, 
  EDU_NOTIFICATION_CLICK_EVENT 
} from '../services/eduPushNotificationService';
import { useEduGamification } from '../hooks/useEduGamification';
import { EduStreakXpWidget } from './edu/gamification/EduStreakXpWidget';
import { EduXpNotificationToast } from './edu/gamification/EduXpNotificationToast';
const EduStreakXpModal = React.lazy(() => import('./edu/gamification/EduStreakXpModal').then(m => ({ default: m.EduStreakXpModal })));
import { EduLabSubject, EcosystemMode } from '../types';
import { switchEcosystemMode } from '../services/modeSyncService';

// Unified 5 Mega-Hubs + legacy compatibility keys
export type EduTab = 'workspace' | 'sun_study' | 'labs' | 'assistant' | 'tools' | 'roadmap' | 'video' | 'notebook' | 'quiz' | 'exam' | 'goals';

interface HaevyEduViewProps {
  onBackToLanding?: () => void;
  activeTabControlled?: EduTab;
  onTabChange?: (tab: EduTab) => void;
  onOpenHaevyAi?: () => void;
}

export function HaevyEduView({ activeTabControlled, onTabChange, onOpenHaevyAi }: HaevyEduViewProps) {
  // Gamification Engine (Streak & XP System)
  const { profile, recordActivity, latestXpToast, clearToast } = useEduGamification();
  const [isGamificationModalOpen, setIsGamificationModalOpen] = useState<boolean>(false);
  const [isCelebrationModalOpen, setIsCelebrationModalOpen] = useState<boolean>(false);

  // Music Player Bar Visibility (Default to compact toggle)
  const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState<boolean>(false);

  // Primary Active Tab: 'workspace' | 'sun_study' | 'labs' | 'assistant' | 'tools'
  const [internalTab, setInternalTab] = useState<EduTab>('workspace');
  const activeTabRaw = activeTabControlled ?? internalTab;

  // Resolve raw tab to one of 5 mega hubs
  const getPrimaryHub = (tab: EduTab): 'workspace' | 'sun_study' | 'labs' | 'assistant' | 'tools' => {
    if (tab === 'roadmap' || tab === 'notebook') return 'assistant';
    if (tab === 'video') return 'labs';
    if (tab === 'quiz' || tab === 'exam' || tab === 'goals') return 'tools';
    return tab;
  };

  const primaryHub = getPrimaryHub(activeTabRaw);

  const setActiveTab = (tab: EduTab) => {
    setInternalTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Sub-tabs inside Hub 2 (Phòng Lab 3D STEM): 'dashboard' | 'physics' | 'chemistry' | 'biology' | 'video'
  const [activeLabSubject, setActiveLabSubject] = useState<EduLabSubject | 'video'>('dashboard');
  const [activeExperimentId, setActiveExperimentId] = useState<string>('pendulum');

  // Sub-tabs inside Hub 3 (AI Gia Sư & Lộ Trình): 'assistant' | 'roadmap' | 'notebook'
  const [activeAiSubTab, setActiveAiSubTab] = useState<'assistant' | 'roadmap' | 'notebook'>('assistant');

  // Sub-tabs inside Hub 4 (Tiện Ích & Luyện Thi): 'casio880' | 'exam' | 'quiz' | 'goals'
  const [activeToolSubTab, setActiveToolSubTab] = useState<'casio880' | 'exam' | 'quiz' | 'goals'>('casio880');

  // Selected Utility Suite Tab for fx-880 & other utilities
  const [selectedToolsTab, setSelectedToolsTab] = useState<'casio880' | 'calculator' | 'periodic' | 'converter' | 'pomodoro' | 'flashcards' | 'deconstructor'>('casio880');

  // Quick Quiz target module
  const [quizTargetSubject, setQuizTargetSubject] = useState<EduLabSubject | undefined>(undefined);
  const [quizTargetExpId, setQuizTargetExpId] = useState<string | undefined>(undefined);

  // Video player topic state
  const [videoTopic, setVideoTopic] = useState<string>('Con Lắc Đơn & Bảo Toàn Năng Lượng');
  const [videoSummary, setVideoSummary] = useState<string>('');

  // AI Assistant cross-navigation prompt state
  const [aiInitialQuery, setAiInitialQuery] = useState<string>('');

  // THPT 2027 Web Push Notification & Milestone Reminders State
  const [isPushReminderModalOpen, setIsPushReminderModalOpen] = useState<boolean>(false);
  const [countdownDays, setCountdownDays] = useState<number>(() => calculateThpt2027Countdown().days);

  // Background ticker for scheduled push reminders & milestone alerts
  useEffect(() => {
    evaluateScheduledReminders();
    const interval = setInterval(() => {
      evaluateScheduledReminders();
      setCountdownDays(calculateThpt2027Countdown().days);
    }, 30000);

    const handleNotifClick = (e: any) => {
      const detail = e.detail;
      if (!detail) return;
      if (detail.actionType === 'open_exam') {
        setActiveTab('tools');
        setActiveToolSubTab('exam');
      } else if (detail.actionType === 'open_lab') {
        const subj = detail.actionPayload?.subject || 'physics';
        const expId = detail.actionPayload?.experimentId || 'pendulum';
        handleOpenLab(subj as EduLabSubject, expId);
      } else if (detail.actionType === 'open_assistant') {
        if (detail.actionPayload?.initialQuery) {
          setAiInitialQuery(detail.actionPayload.initialQuery);
        }
        setActiveTab('assistant');
        setActiveAiSubTab('assistant');
      } else if (detail.actionType === 'open_notebook') {
        setActiveTab('assistant');
        setActiveAiSubTab('notebook');
      }
    };

    window.addEventListener(EDU_NOTIFICATION_CLICK_EVENT, handleNotifClick);
    return () => {
      clearInterval(interval);
      window.removeEventListener(EDU_NOTIFICATION_CLICK_EVENT, handleNotifClick);
    };
  }, []);

  // Handle cross-navigation
  const handleOpenLab = (subject: EduLabSubject, experimentId: string) => {
    setActiveLabSubject(subject);
    setActiveExperimentId(experimentId);
    setActiveTab('labs');
  };

  const handleOpenQuiz = (subject?: EduLabSubject, experimentId?: string) => {
    setQuizTargetSubject(subject);
    setQuizTargetExpId(experimentId);
    setActiveToolSubTab('quiz');
    setActiveTab('tools');
  };

  const handleOpenVideo = (topic: string, summary: string = '') => {
    setVideoTopic(topic);
    setVideoSummary(summary);
    setActiveLabSubject('video');
    setActiveTab('labs');
  };

  const handleAskAiAboutLab = (subject: EduLabSubject | 'video', expId: string) => {
    let query = '';
    if (subject === 'physics') {
      if (expId === 'pendulum') {
        query = 'Giải thích bản chất First Principles: Tại sao chu kỳ con lắc đơn T = 2π√(L/g) không phụ thuộc vào khối lượng quả lắc m? Cạm bẫy học vẹt thường gặp là gì?';
      } else if (expId === 'free_fall') {
        query = 'Bản chất rơi tự do (Vật lý 10 CTGDPT 2018): Tại sao trong chân không một chiếc lông vũ rơi nhanh bằng hòn đá (g không đổi)? Giải thích sự khác biệt giữa khối lượng quán tính (m_i) và khối lượng hấp dẫn (m_g) của Einstein.';
      } else if (expId === 'wave_interference') {
        query = 'Bản chất giao thoa sóng (Vật lý 11 CTGDPT 2018): Tại sao hai nguồn sóng kết hợp cùng pha lại tạo ra các vân cực đại có hiệu đường đi d2 - d1 = kλ và cực tiểu (k + 0.5)λ? Bản chất sự chồng chập năng lượng dao động.';
      } else {
        query = 'Bản chất định luật Ohm: Tại sao hiệu điện thế U là nguyên nhân đẩy electron tự do tạo dòng điện I?';
      }
    } else if (subject === 'chemistry') {
      if (expId === 'reaction_rate') {
        query = 'Bản chất tốc độ phản ứng (Hóa học 10 CTGDPT 2018): Tại sao tăng nhiệt độ lên 10°C tốc độ tăng từ 2-4 lần (Hệ số Van t Hoff γ)?';
      } else if (expId === 'le_chatelier') {
        query = 'Bản chất nguyên lý chuyển dịch cân bằng Le Chatelier (Hóa học 11 CTGDPT 2018): Khi tăng áp suất hoặc làm lạnh hệ 2NO2 ⇌ N2O4, vì sao cân bằng tự điều chỉnh?';
      } else {
        query = 'Bản chất pin điện hóa Galvanic Daniell Zn-Cu (Hóa học 12 CTGDPT 2018): Vai trò thực chất của cầu muối KNO3.';
      }
    } else if (subject === 'biology') {
      if (expId === 'plasmolysis') {
        query = 'Bản chất thẩm thấu & co nguyên sinh (Sinh học 10 CTGDPT 2018): Tại sao khi ngâm tế bào biểu bì củ hành vào nước muối ưu trương, nước lại thoát ra ngoài?';
      } else {
        query = 'Bản chất cân bằng di truyền Hardy - Weinberg (Sinh học 12 CTGDPT 2018): Tại sao trong quần thể ngẫu phối, tần số alen lại bất biến?';
      }
    } else {
      query = 'Hãy giải thích tổng quan các định luật bảo toàn nền tảng chi phối toàn bộ thế giới vật lý và hóa học (First Principles).';
    }

    setAiInitialQuery(query);
    setActiveAiSubTab('assistant');
    setActiveTab('assistant');
  };

  // Top ecosystem mode switcher items for direct 1-tap switching across all Haevy apps
  const ecosystemModes = [
    { id: 'portal' as EcosystemMode, label: 'Cổng Tổng', icon: Sparkles },
    { id: 'edu' as EcosystemMode, label: 'Edu ☀️', icon: GraduationCap, active: true },
    { id: 'audio' as EcosystemMode, label: 'Audio 🎵', icon: Headphones },
    { id: 'internet' as EcosystemMode, label: 'Internet 🌐', icon: Globe },
    { id: 'messages' as EcosystemMode, label: 'Tin Nhắn 💬', icon: MessageSquare },
    { id: 'finance' as EcosystemMode, label: 'Thu Chi 💰', icon: Wallet },
    { id: 'games' as EcosystemMode, label: 'Games 🎮', icon: Gamepad2 },
    { id: 'space' as EcosystemMode, label: 'Space 🌌', icon: Orbit },
  ];

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-100 flex flex-col no-swipe touch-pan-y" data-no-swipe="true">
      {/* ========================================================================= */}
      {/* 1. STREAMLINED UNIFIED TOP COMMAND TASKBAR (SPACE OPTIMIZED + ANIMATIONS) */}
      {/* ========================================================================= */}
      <header className="w-full bg-zinc-950/95 backdrop-blur-2xl border-b border-zinc-800/80 sticky top-0 z-30 px-2 sm:px-4 py-2 shadow-lg space-y-2">
        {/* Row 1: Mode Switcher Strip + Utility Actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Ecosystem Mode Quick Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x flex-1 min-w-0 py-0.5">
            {ecosystemModes.map(item => (
              <button
                key={item.id}
                onClick={() => switchEcosystemMode(item.id)}
                className={`px-2.5 sm:px-3 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap ${
                  item.active
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 shadow-md shadow-emerald-500/25 font-black scale-[1.02]'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
                }`}
                title={`Chuyển sang chế độ ${item.label}`}
              >
                <item.icon size={13} className={item.active ? 'text-zinc-950' : 'text-zinc-400'} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Right Action Icons: Music Toggle, THPT 2027 Countdown, Streak XP */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsMusicPlayerOpen(!isMusicPlayerOpen)}
              className={`px-2 sm:px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                isMusicPlayerOpen
                  ? 'bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 text-amber-300 hover:text-amber-200 border border-amber-500/30'
              }`}
              title="Bật/Tắt thanh nhạc tập trung & tải nhạc lên"
            >
              <Music size={13} className={isMusicPlayerOpen ? 'animate-bounce' : ''} />
              <span className="hidden xs:inline">Nhạc Focus</span>
              <UploadCloud size={12} className="hidden sm:inline" />
            </button>

            <button
              onClick={() => setIsPushReminderModalOpen(true)}
              className="px-2 sm:px-2.5 py-1 rounded-xl text-[11px] font-bold text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 transition flex items-center gap-1 cursor-pointer active:scale-95"
              title="Đếm ngược kỳ thi THPT 2027"
            >
              <Bell size={12} className="text-amber-400 animate-pulse" />
              <span className="font-mono font-black">{countdownDays}d</span>
            </button>

            <EduStreakXpWidget profile={profile} onClick={() => setIsGamificationModalOpen(true)} />
          </div>
        </div>

        {/* Row 2: 5 Primary Mega-Hubs with Spring Sliding Tab Indicator */}
        <div className="flex items-center justify-between gap-2 border-t border-zinc-800/60 pt-1.5">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 w-full bg-zinc-950 p-1 rounded-xl border border-zinc-800/80">
            {[
              { id: 'workspace', label: 'Bàn Học 📚', desc: 'SRS & Mindmap', icon: Layers },
              { id: 'sun_study', label: 'Sun Study ☀️', desc: 'Kỷ Luật & Rank', icon: Sun },
              { id: 'labs', label: 'Lab STEM 🔬', desc: '20+ Mô Phỏng', icon: FlaskConical },
              { id: 'assistant', label: 'AI Gia Sư 🧠', desc: 'First Principles', icon: BrainCircuit },
              { id: 'tools', label: 'Luyện Thi 🛠️', desc: 'Casio & Đề Thi', icon: Calculator },
            ].map(hub => {
              const isSelected = primaryHub === hub.id;
              return (
                <button
                  key={hub.id}
                  onClick={() => setActiveTab(hub.id as any)}
                  className={`relative py-1.5 px-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                    isSelected ? 'text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeEduMegaHubIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg shadow-md shadow-amber-500/25 -z-0"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1 truncate">
                    <hub.icon size={14} className={isSelected ? 'text-zinc-950' : 'text-zinc-400'} />
                    <span className="truncate">{hub.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Sub-Feature Secondary Pill Navigation (Smoothly shown per active Mega-Hub) */}
        {primaryHub !== 'sun_study' && primaryHub !== 'workspace' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x text-[11px] pt-1"
          >
            {/* Sub-bar for HUB 2: LABS */}
            {primaryHub === 'labs' && (
              <>
                <span className="text-[10px] text-zinc-500 font-bold uppercase shrink-0">Bộ Môn Lab:</span>
                {[
                  { id: 'dashboard', label: '📊 Tổng Quan Dashboard' },
                  { id: 'physics', label: '⚛️ Vật Lý 10-12 (7 bài)' },
                  { id: 'chemistry', label: '🧪 Hóa Học 10-12 (6 bài)' },
                  { id: 'biology', label: '🧬 Sinh Học 10-12 (7 bài)' },
                  { id: 'video', label: '🎬 Video Bài Giảng AI' },
                ].map(sub => {
                  const isSelected = activeLabSubject === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setActiveLabSubject(sub.id as any)}
                      className={`relative px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer whitespace-nowrap active:scale-95 ${
                        isSelected ? 'text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="activeLabSubIndicator"
                          className="absolute inset-0 bg-cyan-400 rounded-lg shadow-sm -z-0"
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        />
                      )}
                      <span className="relative z-10">{sub.label}</span>
                    </button>
                  );
                })}

                <button
                  onClick={() => handleAskAiAboutLab(activeLabSubject, activeExperimentId)}
                  className="ml-auto px-2.5 py-1 rounded-lg text-emerald-300 bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/50 font-bold shrink-0 flex items-center gap-1 cursor-pointer whitespace-nowrap active:scale-95"
                >
                  <BrainCircuit size={12} className="text-emerald-400" />
                  <span>Hỏi AI Về Hiện Tượng</span>
                </button>
              </>
            )}

            {/* Sub-bar for HUB 3: AI ASSISTANT & ROADMAP */}
            {primaryHub === 'assistant' && (
              <>
                <span className="text-[10px] text-zinc-500 font-bold uppercase shrink-0">Mô-đun AI:</span>
                {[
                  { id: 'assistant', label: '🤖 AI Gia Sư First Principles' },
                  { id: 'roadmap', label: '🧭 Lộ Trình Tri Thức GDPT 2018' },
                  { id: 'notebook', label: '📓 Sổ Tay Nghiên Cứu' }
                ].map(sub => {
                  const isSelected = activeAiSubTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setActiveAiSubTab(sub.id as any)}
                      className={`relative px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer whitespace-nowrap active:scale-95 ${
                        isSelected ? 'text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="activeAiSubIndicator"
                          className="absolute inset-0 bg-purple-400 rounded-lg shadow-sm -z-0"
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        />
                      )}
                      <span className="relative z-10">{sub.label}</span>
                    </button>
                  );
                })}
              </>
            )}

            {/* Sub-bar for HUB 4: TOOLS & EXAM PREP */}
            {primaryHub === 'tools' && (
              <>
                <span className="text-[10px] text-zinc-500 font-bold uppercase shrink-0">Công Cụ:</span>
                {[
                  { id: 'casio880', label: '🧮 Máy Tính Casio fx-880 BTG' },
                  { id: 'exam', label: '⏱️ Phòng Thi Thử Bấm Giờ' },
                  { id: 'quiz', label: '⚡ Trắc Nghiệm Tư Duy Nhanh' },
                  { id: 'goals', label: '🎯 7 Trụ Cột Mục Tiêu Ngày' }
                ].map(sub => {
                  const isSelected = activeToolSubTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setActiveToolSubTab(sub.id as any)}
                      className={`relative px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer whitespace-nowrap active:scale-95 ${
                        isSelected ? 'text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="activeToolSubIndicator"
                          className="absolute inset-0 bg-emerald-400 rounded-lg shadow-sm -z-0"
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        />
                      )}
                      <span className="relative z-10">{sub.label}</span>
                    </button>
                  );
                })}
              </>
            )}
          </motion.div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. DOCKABLE EDU FOCUS MUSIC & USER AUDIO UPLOADER ENGINE (ANIMATED EXPAND)*/}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isMusicPlayerOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-7xl mx-auto px-2 sm:px-4 pt-2 overflow-hidden"
          >
            <EduMusicPlayer compact={false} className="border-amber-500/30 shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3. MAIN CONTENT AREA (ANIMATED VIEW TRANSITIONS WITH SPRING DYNAMICS)      */}
      {/* ========================================================================= */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 lg:p-6 pb-28 sm:pb-16 flex flex-col gap-4">
        {/* Daily Goal Milestone Summary Strip */}
        <EduDailyGoalSummaryStrip
          onOpenGoalsTracker={() => {
            setActiveTab('tools');
            setActiveToolSubTab('goals');
          }}
          onOpenCelebration={() => setIsCelebrationModalOpen(true)}
        />

        {/* Animated Primary Mega-Hubs Switcher */}
        <React.Suspense fallback={
          <div className="w-full min-h-[320px] flex flex-col items-center justify-center p-8 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 animate-pulse text-center">
            <div className="w-9 h-9 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3 shadow-lg shadow-amber-500/10" />
            <p className="text-xs text-amber-300 font-bold">Đang tải phòng học & không gian học tập Haevy Edu...</p>
            <p className="text-[11px] text-zinc-500 mt-1">Nạp bất đồng bộ theo phân hệ để tiết kiệm dung lượng RAM điện thoại</p>
          </div>
        }>
          <AnimatePresence mode="wait">
          {/* ---------------- MEGA-HUB 0: BÀN HỌC TẬP TRUNG ALL-IN-ONE ---------------- */}
          {primaryHub === 'workspace' && (
            <motion.div
              key="hub-workspace"
              initial={{ opacity: 0, y: 12, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.995 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <EduWorkspaceToolkitView
                onOpenAiAssistant={(prompt) => {
                  if (prompt) setAiInitialQuery(prompt);
                  setActiveTab('assistant');
                  setActiveAiSubTab('assistant');
                }}
                onOpenExamPrep={() => {
                  setActiveTab('tools');
                  setActiveToolSubTab('exam');
                }}
                onOpenCasio={() => {
                  setSelectedToolsTab('casio880');
                  setActiveTab('tools');
                  setActiveToolSubTab('casio880');
                }}
                onRecordActivity={recordActivity}
              />
            </motion.div>
          )}

          {/* ---------------- MEGA-HUB 1: SUN STUDY APP ---------------- */}
          {primaryHub === 'sun_study' && (
            <motion.div
              key="hub-sun_study"
              initial={{ opacity: 0, y: 12, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.995 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <SunStudyAppView
                onJumpToExamPrep={() => {
                  setActiveTab('tools');
                  setActiveToolSubTab('exam');
                }}
                onJumpToAiAssistant={() => {
                  setActiveTab('assistant');
                  setActiveAiSubTab('assistant');
                }}
              />
            </motion.div>
          )}

          {/* ---------------- MEGA-HUB 2: STEM VIRTUAL LABS & VIDEO ---------------- */}
          {primaryHub === 'labs' && (
            <motion.div
              key="hub-labs"
              initial={{ opacity: 0, y: 12, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.995 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col gap-4"
            >
              <AnimatePresence mode="wait">
                {activeLabSubject === 'dashboard' && (
                  <motion.div 
                    key="lab-dashboard"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <VirtualLabDashboard
                      onOpenVideoLesson={(topic) => handleOpenVideo(topic)}
                      onOpenRoadmapTopic={(topic) => handleOpenVideo(topic)}
                      onOpenAiAssistant={() => {
                        setActiveTab('assistant');
                        setActiveAiSubTab('assistant');
                      }}
                      onRecordActivity={recordActivity}
                    />
                  </motion.div>
                )}

                {activeLabSubject === 'physics' && (
                  <motion.div 
                    key="lab-physics"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <PhysicsLab
                      initialExperiment={activeExperimentId as any}
                      onSelectExperiment={(id) => setActiveExperimentId(id)}
                      onOpenVideoLesson={(topic) => handleOpenVideo(topic)}
                      onOpenQuickQuiz={(subj, expId) => handleOpenQuiz(subj, expId)}
                      onRecordActivity={recordActivity}
                    />
                  </motion.div>
                )}

                {activeLabSubject === 'chemistry' && (
                  <motion.div 
                    key="lab-chemistry"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <ChemistryLab
                      initialExperiment={activeExperimentId as any}
                      onSelectExperiment={(id) => setActiveExperimentId(id)}
                      onOpenVideoLesson={(topic) => handleOpenVideo(topic)}
                      onOpenQuickQuiz={(subj, expId) => handleOpenQuiz(subj, expId)}
                      onRecordActivity={recordActivity}
                    />
                  </motion.div>
                )}

                {activeLabSubject === 'biology' && (
                  <motion.div 
                    key="lab-biology"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <BiologyLab
                      initialExperiment={activeExperimentId as any}
                      onSelectExperiment={(id) => setActiveExperimentId(id)}
                      onOpenVideoLesson={(topic) => handleOpenVideo(topic)}
                      onOpenQuickQuiz={(subj, expId) => handleOpenQuiz(subj, expId)}
                      onRecordActivity={recordActivity}
                    />
                  </motion.div>
                )}

                {activeLabSubject === 'video' && (
                  <motion.div 
                    key="lab-video"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <VideoLessonPlayer
                      initialTopic={videoTopic}
                      initialSummary={videoSummary}
                      onOpenLabExperiment={(subj, expId) => handleOpenLab(subj as any, expId)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ---------------- MEGA-HUB 3: AI ASSISTANT, ROADMAP & NOTEBOOK ---------------- */}
          {primaryHub === 'assistant' && (
            <motion.div
              key="hub-assistant"
              initial={{ opacity: 0, y: 12, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.995 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col gap-4"
            >
              <AnimatePresence mode="wait">
                {activeAiSubTab === 'assistant' && (
                  <motion.div 
                    key="ai-assistant-view"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <AiStudyAssistantView
                      onOpenLab={(subject, experimentId) => handleOpenLab(subject, experimentId)}
                      onOpenVideo={(topic, summary) => handleOpenVideo(topic, summary)}
                      onOpenNotebook={() => setActiveAiSubTab('notebook')}
                      onOpenTools={(toolTab) => {
                        if (toolTab) setSelectedToolsTab(toolTab);
                        setActiveTab('tools');
                      }}
                      onOpenExam={() => {
                        setActiveTab('tools');
                        setActiveToolSubTab('exam');
                      }}
                      onOpenHaevyAi={onOpenHaevyAi}
                      initialQuery={aiInitialQuery}
                      onClearInitialQuery={() => setAiInitialQuery('')}
                    />
                  </motion.div>
                )}

                {activeAiSubTab === 'roadmap' && (
                  <motion.div 
                    key="ai-roadmap-view"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <DocumentRoadmapView
                      onOpenLabExperiment={(subj, expId) => handleOpenLab(subj, expId)}
                      onGenerateVideoFromDoc={(title, summary) => handleOpenVideo(title, summary)}
                      onOpenQuickQuiz={(subj, expId) => handleOpenQuiz(subj, expId)}
                      onOpenAiAssistant={(prompt) => {
                        if (prompt) setAiInitialQuery(prompt);
                        setActiveAiSubTab('assistant');
                      }}
                    />
                  </motion.div>
                )}

                {activeAiSubTab === 'notebook' && (
                  <motion.div 
                    key="ai-notebook-view"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <ResearchNotebookView
                      onOpenLab={(subj, expId) => handleOpenLab(subj, expId)}
                      onOpenAiAssistant={(prompt) => {
                        if (prompt) setAiInitialQuery(prompt);
                        setActiveAiSubTab('assistant');
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ---------------- MEGA-HUB 4: EXAM PREP, UTILITIES & CASIO FX-880 ---------------- */}
          {primaryHub === 'tools' && (
            <motion.div
              key="hub-tools"
              initial={{ opacity: 0, y: 12, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.995 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col gap-4"
            >
              <AnimatePresence mode="wait">
                {activeToolSubTab === 'casio880' && (
                  <motion.div 
                    key="tool-casio880"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <EduUtilitySuiteView
                      onOpenLab={(subj, expId) => handleOpenLab(subj, expId)}
                      onOpenAiAssistant={(prompt) => {
                        if (prompt) setAiInitialQuery(prompt);
                        setActiveTab('assistant');
                        setActiveAiSubTab('assistant');
                      }}
                      onOpenExamPrep={() => setActiveToolSubTab('exam')}
                      onRecordActivity={recordActivity}
                      initialUtilityTab={selectedToolsTab}
                    />
                  </motion.div>
                )}

                {activeToolSubTab === 'exam' && (
                  <motion.div 
                    key="tool-exam"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <SpeedExamPrepView
                      onRecordActivity={recordActivity}
                      onOpenAiAssistant={(prompt) => {
                        if (prompt) setAiInitialQuery(prompt);
                        setActiveTab('assistant');
                        setActiveAiSubTab('assistant');
                      }}
                      onSaveToNotebook={() => {
                        setActiveTab('assistant');
                        setActiveAiSubTab('notebook');
                      }}
                      onOpenPushReminders={() => setIsPushReminderModalOpen(true)}
                    />
                  </motion.div>
                )}

                {activeToolSubTab === 'quiz' && (
                  <motion.div 
                    key="tool-quiz"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <StemQuickQuizView
                      initialSubject={quizTargetSubject}
                      initialExperimentId={quizTargetExpId}
                      onOpenLab={(subj, expId) => handleOpenLab(subj, expId)}
                      onOpenAiAssistant={(prompt) => {
                        if (prompt) setAiInitialQuery(prompt);
                        setActiveTab('assistant');
                        setActiveAiSubTab('assistant');
                      }}
                      onRecordActivity={recordActivity}
                    />
                  </motion.div>
                )}

                {activeToolSubTab === 'goals' && (
                  <motion.div 
                    key="tool-goals"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <EduDailyGoalTracker
                      onNavigateToTab={(tab, payload) => {
                        if (tab === 'assistant') {
                          if (payload?.initialQuery) setAiInitialQuery(payload.initialQuery);
                          setActiveTab('assistant');
                          setActiveAiSubTab('assistant');
                        } else if (tab === 'exam') {
                          setActiveToolSubTab('exam');
                        } else if (tab === 'labs') {
                          if (payload?.subject && payload?.experimentId) {
                            handleOpenLab(payload.subject, payload.experimentId);
                          } else {
                            setActiveTab('labs');
                          }
                        } else if (tab === 'tools') {
                          if (payload?.toolTab) setSelectedToolsTab(payload.toolTab);
                          setActiveToolSubTab('casio880');
                        } else if (tab === 'notebook') {
                          setActiveTab('assistant');
                          setActiveAiSubTab('notebook');
                        } else if (tab === 'quiz') {
                          handleOpenQuiz();
                        } else {
                          setActiveTab(tab as any);
                        }
                      }}
                      onOpenLab={(subject, experimentId) => handleOpenLab(subject, experimentId)}
                      onOpenExam={() => setActiveToolSubTab('exam')}
                      onOpenAssistant={(prompt) => {
                        if (prompt) setAiInitialQuery(prompt);
                        setActiveTab('assistant');
                        setActiveAiSubTab('assistant');
                      }}
                      onOpenTools={(toolTab) => {
                        if (toolTab) setSelectedToolsTab(toolTab);
                        setActiveToolSubTab('casio880');
                      }}
                      onOpenNotebook={() => {
                        setActiveTab('assistant');
                        setActiveAiSubTab('notebook');
                      }}
                      onOpenQuiz={() => handleOpenQuiz()}
                      onRecordActivity={recordActivity}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        </React.Suspense>
      </div>

      {/* Realtime Floating XP & Streak Notification */}
      <EduXpNotificationToast toast={latestXpToast} onDismiss={clearToast} />

      {/* Student Streak & XP Profile Modal */}
      {isGamificationModalOpen && (
        <React.Suspense fallback={null}>
          <EduStreakXpModal
            isOpen={isGamificationModalOpen}
            onClose={() => setIsGamificationModalOpen(false)}
            profile={profile}
            onJumpToLabs={() => {
              setIsGamificationModalOpen(false);
              setActiveTab('labs');
            }}
            onJumpToQuiz={() => {
              setIsGamificationModalOpen(false);
              handleOpenQuiz();
            }}
          />
        </React.Suspense>
      )}

      {/* THPT 2027 Milestone Study Reminders & Push Notification Modal */}
      {isPushReminderModalOpen && (
        <React.Suspense fallback={null}>
          <EduPushNotificationModal
            isOpen={isPushReminderModalOpen}
            onClose={() => setIsPushReminderModalOpen(false)}
            onNavigateToTab={(tab, payload) => {
              if (tab === 'assistant') {
                if (payload?.initialQuery) setAiInitialQuery(payload.initialQuery);
                setActiveTab('assistant');
                setActiveAiSubTab('assistant');
              } else if (tab === 'exam') {
                setActiveTab('tools');
                setActiveToolSubTab('exam');
              } else if (tab === 'labs') {
                setActiveTab('labs');
              } else if (tab === 'notebook') {
                setActiveTab('assistant');
                setActiveAiSubTab('notebook');
              }
            }}
            onOpenLab={(subj, expId) => handleOpenLab(subj, expId)}
            onOpenExam={() => {
              setActiveTab('tools');
              setActiveToolSubTab('exam');
            }}
            onOpenAssistant={(prompt) => {
              if (prompt) setAiInitialQuery(prompt);
              setActiveTab('assistant');
              setActiveAiSubTab('assistant');
            }}
          />
        </React.Suspense>
      )}

      {/* 7 Exam Prep Pillars Daily All-Goals-Complete Celebration Modal */}
      {isCelebrationModalOpen && (
        <React.Suspense fallback={null}>
          <EduCelebrationModal
            isOpen={isCelebrationModalOpen}
            onClose={() => setIsCelebrationModalOpen(false)}
            dateStr={getTodayDateString()}
            streakCount={calculateCurrentDailyGoalStreak()}
            onOpenNotebook={() => {
              setIsCelebrationModalOpen(false);
              setActiveTab('assistant');
              setActiveAiSubTab('notebook');
            }}
          />
        </React.Suspense>
      )}
    </div>
  );
}
