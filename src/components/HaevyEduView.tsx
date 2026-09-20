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
  HelpCircle,
  Activity,
  CheckCircle2,
  ChevronRight,
  Calculator,
  Timer,
  Globe,
  Bell,
  ArrowLeft,
  Calendar
} from 'lucide-react';
import { PhysicsLab } from './edu/PhysicsLab';
import { ChemistryLab } from './edu/ChemistryLab';
import { BiologyLab } from './edu/BiologyLab';
import { DocumentRoadmapView } from './edu/DocumentRoadmapView';
import { VideoLessonPlayer } from './edu/VideoLessonPlayer';
import { VirtualLabDashboard } from './edu/VirtualLabDashboard';
import { AiStudyAssistantView } from './edu/AiStudyAssistantView';
import { ResearchNotebookView } from './edu/ResearchNotebookView';
import { StemQuickQuizView } from './edu/StemQuickQuizView';
import { EduUtilitySuiteView } from './edu/EduUtilitySuiteView';
import { SpeedExamPrepView } from './edu/SpeedExamPrepView';
import { EduPushNotificationModal } from './edu/EduPushNotificationModal';
import { 
  evaluateScheduledReminders, 
  calculateThpt2027Countdown, 
  EDU_NOTIFICATION_CLICK_EVENT 
} from '../services/eduPushNotificationService';
import { useEduGamification } from '../hooks/useEduGamification';
import { EduStreakXpWidget } from './edu/gamification/EduStreakXpWidget';
import { EduXpNotificationToast } from './edu/gamification/EduXpNotificationToast';
import { EduStreakXpModal } from './edu/gamification/EduStreakXpModal';
import { EduLabSubject } from '../types';

interface HaevyEduViewProps {
  onBackToLanding?: () => void;
  activeTabControlled?: 'labs' | 'assistant' | 'roadmap' | 'video' | 'notebook' | 'quiz' | 'tools' | 'exam';
  onTabChange?: (tab: 'labs' | 'assistant' | 'roadmap' | 'video' | 'notebook' | 'quiz' | 'tools' | 'exam') => void;
  onOpenHaevyAi?: () => void;
}

export function HaevyEduView({ onBackToLanding, activeTabControlled, onTabChange, onOpenHaevyAi }: HaevyEduViewProps) {
  // Gamification Engine (Streak & XP System)
  const { profile, recordActivity, latestXpToast, clearToast } = useEduGamification();
  const [isGamificationModalOpen, setIsGamificationModalOpen] = useState<boolean>(false);

  // Main tab state: 'labs' | 'assistant' | 'roadmap' | 'video' | 'notebook' | 'quiz' | 'tools' | 'exam'
  const [internalTab, setInternalTab] = useState<'labs' | 'assistant' | 'roadmap' | 'video' | 'notebook' | 'quiz' | 'tools' | 'exam'>('assistant');
  const activeTab = activeTabControlled ?? internalTab;
  const setActiveTab = (tab: 'labs' | 'assistant' | 'roadmap' | 'video' | 'notebook' | 'quiz' | 'tools' | 'exam') => {
    setInternalTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Sub-tab state for labs: 'dashboard' | 'physics' | 'chemistry' | 'biology'
  const [activeLabSubject, setActiveLabSubject] = useState<EduLabSubject>('dashboard');
  const [activeExperimentId, setActiveExperimentId] = useState<string>('pendulum');

  // Quick Quiz target module
  const [quizTargetSubject, setQuizTargetSubject] = useState<EduLabSubject | undefined>(undefined);
  const [quizTargetExpId, setQuizTargetExpId] = useState<string | undefined>(undefined);

  // Video player state when requested from roadmap
  const [videoTopic, setVideoTopic] = useState<string>('Con Lắc Đơn & Bảo Toàn Năng Lượng');
  const [videoSummary, setVideoSummary] = useState<string>('');

  // AI Assistant cross-navigation prompt state
  const [aiInitialQuery, setAiInitialQuery] = useState<string>('');

  // Quick Lab Selector Dropdown Popover State
  const [isQuickLabDropdownOpen, setIsQuickLabDropdownOpen] = useState<boolean>(false);

  // Selected Utility Suite Tab (defaults to Casio fx-880 BTG for THPT 2027)
  const [selectedToolsTab, setSelectedToolsTab] = useState<'casio880' | 'calculator' | 'periodic' | 'converter' | 'pomodoro' | 'flashcards' | 'deconstructor'>('casio880');

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
        setActiveTab('exam');
      } else if (detail.actionType === 'open_lab') {
        const subj = detail.actionPayload?.subject || 'physics';
        const expId = detail.actionPayload?.experimentId || 'pendulum';
        handleOpenLab(subj as EduLabSubject, expId);
      } else if (detail.actionType === 'open_assistant') {
        if (detail.actionPayload?.initialQuery) {
          setAiInitialQuery(detail.actionPayload.initialQuery);
        }
        setActiveTab('assistant');
      } else if (detail.actionType === 'open_notebook') {
        setActiveTab('notebook');
      }
    };

    window.addEventListener(EDU_NOTIFICATION_CLICK_EVENT, handleNotifClick);
    return () => {
      clearInterval(interval);
      window.removeEventListener(EDU_NOTIFICATION_CLICK_EVENT, handleNotifClick);
    };
  }, []);

  // Handle cross-navigation from Roadmap or Video
  const handleOpenLab = (subject: EduLabSubject, experimentId: string) => {
    setActiveLabSubject(subject);
    setActiveExperimentId(experimentId);
    setActiveTab('labs');
    setIsQuickLabDropdownOpen(false);
  };

  const handleOpenQuiz = (subject?: EduLabSubject, experimentId?: string) => {
    setQuizTargetSubject(subject);
    setQuizTargetExpId(experimentId);
    setActiveTab('quiz');
  };

  const handleOpenVideo = (topic: string, summary: string = '') => {
    setVideoTopic(topic);
    setVideoSummary(summary);
    setActiveTab('video');
  };

  const handleAskAiAboutLab = (subject: EduLabSubject, expId: string) => {
    let query = '';
    if (subject === 'physics') {
      if (expId === 'pendulum') {
        query = 'Giải thích bản chất First Principles: Tại sao chu kỳ con lắc đơn T = 2π√(L/g) không phụ thuộc vào khối lượng quả lắc m? Cạm bẫy học vẹt thường gặp là gì?';
      } else if (expId === 'free_fall') {
        query = 'Bản chất rơi tự do (Vật lý 10 CTGDPT 2018): Tại sao trong chân không một chiếc lông vũ rơi nhanh bằng hòn đá (g không đổi)? Giải thích sự khác biệt giữa khối lượng quán tính (m_i) và khối lượng hấp dẫn (m_g) của Einstein.';
      } else if (expId === 'wave_interference') {
        query = 'Bản chất giao thoa sóng (Vật lý 11 CTGDPT 2018): Tại sao hai nguồn sóng kết hợp cùng pha lại tạo ra các vân cực đại có hiệu đường đi d2 - d1 = kλ và cực tiểu (k + 0.5)λ? Bản chất sự chồng chập năng lượng dao động.';
      } else if (expId === 'thermodynamics') {
        query = 'Bản chất nhiệt động lực học (Vật lý 12 CTGDPT 2018): Giải thích định luật I ΔU = Q + A và định luật II qua bản chất vi mô của chuyển động nhiệt phân tử và entropy.';
      } else if (expId === 'optics') {
        query = 'Bản chất quang học: Giải thích nguyên lý khúc xạ ánh sáng theo định luật Snell và hiện tượng phản xạ toàn phần từ bản chất tốc độ ánh sáng thay đổi trong môi trường chiết quang.';
      } else if (expId === 'circuits') {
        query = 'Bản chất định luật Ohm: Tại sao hiệu điện thế U là nguyên nhân đẩy electron tự do tạo dòng điện I? Sự khác nhau bản chất giữa mắc nối tiếp và song song.';
      } else {
        query = 'Bản chất chuyển động ném ngang và xiên: Tại sao chuyển động theo phương ngang và phương thẳng đứng lại độc lập với nhau?';
      }
    } else if (subject === 'chemistry') {
      if (expId === 'reaction_rate') {
        query = 'Bản chất tốc độ phản ứng (Hóa học 10 CTGDPT 2018): Tại sao tăng nhiệt độ lên 10°C tốc độ tăng từ 2-4 lần (Hệ số Van t Hoff γ)? Thuyết va chạm hoạt động và năng lượng hoạt hóa Ea giải thích điều này như thế nào?';
      } else if (expId === 'le_chatelier') {
        query = 'Bản chất nguyên lý chuyển dịch cân bằng Le Chatelier (Hóa học 11 CTGDPT 2018): Khi tăng áp suất hoặc làm lạnh hệ 2NO2 (nâu đỏ) ⇌ N2O4 (không màu), vì sao cân bằng lại tự điều chỉnh chống lại tác động bên ngoài? Bản chất tốc độ phản ứng thuận/nghịch.';
      } else if (expId === 'electrochemical') {
        query = 'Bản chất pin điện hóa Galvanic Daniell Zn-Cu (Hóa học 12 CTGDPT 2018): Tại sao thế điện cực chuẩn E°(Zn2+/Zn) = -0.76V và E°(Cu2+/Cu) = +0.34V lại tạo ra suất điện động 1.10V? Vai trò thực chất của cầu muối KNO3.';
      } else if (expId === 'titration') {
        query = 'Bản chất chuẩn độ axit - bazơ: Tại sao lại xuất hiện bước nhảy pH đột ngột quanh điểm tương đương 25ml mặc dù ta nhỏ từng giọt buret đều đặn?';
      } else if (expId === 'reaction') {
        query = 'Bản chất phản ứng trao đổi ion: Giải thích tại sao BaCl2 + Na2SO4 tạo kết tủa BaSO4, vai trò thực sự của các ion tham gia và spectator ions.';
      } else {
        query = 'Bản chất định luật khí lý tưởng PV = nRT: Mối liên hệ vi mô giữa va chạm phân tử khí và áp suất đo được.';
      }
    } else if (subject === 'biology') {
      if (expId === 'plasmolysis') {
        query = 'Bản chất thẩm thấu & co nguyên sinh (Sinh học 10 CTGDPT 2018): Tại sao khi ngâm tế bào biểu bì củ hành vào nước muối ưu trương, nước lại thoát ra ngoài làm màng sinh chất co rúm? Áp suất thẩm thấu và thế nước Ψ chi phối hiện tượng này ra sao?';
      } else if (expId === 'transpiration') {
        query = 'Bản chất thoát hơi nước & động học khí khổng (Sinh học 11 CTGDPT 2018): Tại sao thoát hơi nước ở mặt dưới của lá lại nhanh hơn mặt trên? Cơ chế bơm ion K+ đóng mở lỗ khí theo nhịp sinh học.';
      } else if (expId === 'hardy_weinberg') {
        query = 'Bản chất cân bằng di truyền Hardy - Weinberg (Sinh học 12 CTGDPT 2018): Tại sao trong quần thể ngẫu phối vô hạn và không có chọn lọc, tần số p²AA + 2pqAa + q²aa = 1 lại bất biến qua mọi thế hệ? Tiến hóa diễn ra khi nào?';
      } else if (expId === 'microscope') {
        query = 'Bản chất tế bào học: Phân biệt cấu trúc thành tế bào cellulose thực vật và màng sinh chất tế bào động vật qua kính hiển vi.';
      } else if (expId === 'genetics') {
        query = 'Bản chất quy luật di truyền Men-đen: Tại sao phép lai Aa x Aa lại phân ly kiểu hình theo tỉ lệ 3 trội : 1 lặn? Bản chất xác suất trong khung Punnett.';
      } else if (expId === 'photosynthesis') {
        query = 'Bản chất quang hợp: Ánh sáng kích thích electron trong diệp lục như thế nào để chuyển đổi năng lượng photon thành liên kết hóa học ATP/NADPH?';
      } else {
        query = 'Bản chất phân tử DNA: Tại sao cấu trúc xoắn kép theo nguyên tắc bổ sung A-T và G-C lại là cơ chế hoàn hảo để sao chép thông tin di truyền không bị sai lệch?';
      }
    } else {
      query = 'Hãy giải thích tổng quan các định luật bảo toàn nền tảng chi phối toàn bộ thế giới vật lý và hóa học (First Principles).';
    }

    setAiInitialQuery(query);
    setActiveTab('assistant');
  };

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-100 flex flex-col no-swipe touch-pan-y" data-no-swipe="true">
      {/* Header Banner - Executive Academic Header without crowded nav tabs (Taskbar moved down to Bottom) */}
      <header className="w-full bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/80 sticky top-0 z-30 px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
        {/* Left: Branding & Academic Profile */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="p-1.5 sm:p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 transition-all cursor-pointer active:scale-95"
                title="Quay về Cổng Hệ Sinh Thái"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-950/40 shrink-0">
              <GraduationCap size={20} className="sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-zinc-100 flex items-center gap-1">
                  Haevy <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Edu</span>
                </h1>
                <span className="text-zinc-600 text-xs hidden sm:inline">•</span>
                <span className="hidden sm:inline-block text-xs text-zinc-400 font-medium">Hệ Thống Nghiên Cứu STEM</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold tracking-wide">
                  GDPT 2018
                </span>
                <span className="hidden xs:inline-block px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                  THPT 2027
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 font-normal truncate max-w-[220px] xs:max-w-md sm:max-w-none">
                Tư duy First Principles • Thí nghiệm ảo 11+ • Casio fx-880 BTG • Thông báo đẩy ôn thi
              </p>
            </div>
          </div>

          {/* Mobile Streak & XP Widget */}
          <div className="md:hidden shrink-0">
            <EduStreakXpWidget profile={profile} onClick={() => setIsGamificationModalOpen(true)} />
          </div>
        </div>

        {/* Right side: Academic Actions & Widgets */}
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar justify-between md:justify-end py-0.5 touch-pan-x">
          {/* THPT 2027 Interactive Milestone Countdown */}
          <button
            onClick={() => setIsPushReminderModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 shadow-sm"
            title="Nhắc nhở học tập định kỳ bằng thông báo đẩy theo 7 cột mốc ôn thi THPT 2027"
          >
            <Bell size={13} className="text-amber-400 shrink-0 animate-pulse" />
            <span>Đếm ngược THPT 2027:</span>
            <span className="font-mono text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded font-black text-[11px]">
              {countdownDays} ngày
            </span>
          </button>

          {/* Tra cứu ngoài (Google Search Grounding) */}
          <button
            onClick={() => {
              setActiveTab('assistant');
              setAiInitialQuery('Tra cứu thông tin bên ngoài: ');
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-300 hover:text-blue-200 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/40 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 shadow-sm"
            title="Tra cứu trực tiếp kiến thức bên ngoài qua Google Search"
          >
            <Globe size={13} className="text-blue-400 shrink-0" />
            <span className="hidden xs:inline">Tra Cứu</span>
            <span>Ngoài</span>
          </button>

          {/* Desktop Streak & XP Widget */}
          <div className="hidden md:block shrink-0">
            <EduStreakXpWidget profile={profile} onClick={() => setIsGamificationModalOpen(true)} />
          </div>

          {/* Haevy AI Hub Button */}
          {onOpenHaevyAi && (
            <button
              onClick={onOpenHaevyAi}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer bg-gradient-to-r from-purple-950/80 to-indigo-950/80 hover:from-purple-900/90 hover:to-indigo-900/90 text-purple-200 hover:text-white border border-purple-500/40 hover:border-purple-300 shadow-sm active:scale-95"
              title="Mở Không Gian Haevy AI Toàn Năng"
            >
              <Sparkles size={13} className="text-purple-400" />
              <span className="hidden sm:inline">Haevy</span>
              <span>AI Hub</span>
            </button>
          )}
        </div>
      </header>

      {/* Contextual Academic Sub-Bar (Mobile Responsive & Academic Focus) */}
      <div className="w-full bg-zinc-950/80 border-b border-zinc-800/80 px-2.5 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none text-xs touch-pan-x">
        {/* Left: Dynamic Academic Scope Breadcrumb */}
        <div className="flex items-center gap-1.5 shrink-0 text-zinc-300 font-medium">
          <span className="text-zinc-500 font-mono text-[10px] sm:text-[11px]">HỌC PHẦN:</span>
          {activeTab === 'assistant' && (
            <span className="flex items-center gap-1.5 text-zinc-200 font-semibold">
              <BrainCircuit size={13} className="text-emerald-400 shrink-0" />
              <span>AI Trợ Lý First Principles</span>
              <span className="hidden md:inline text-zinc-400 font-normal"> • Phân Tích Bản Chất & Trích Xuất Giáo Trình</span>
            </span>
          )}
          {activeTab === 'exam' && (
            <span className="flex items-center gap-1.5 text-zinc-200 font-semibold">
              <Timer size={13} className="text-amber-400 shrink-0" />
              <span>Luyện Thi GDPT 2018</span>
              <span className="hidden md:inline text-zinc-400 font-normal"> • Bấm Giờ & Casio fx-880 BTG</span>
            </span>
          )}
          {activeTab === 'labs' && (
            <span className="flex items-center gap-1.5 text-zinc-200 font-semibold">
              <FlaskConical size={13} className="text-cyan-400 shrink-0" />
              <span>Phòng Thí Nghiệm Ảo</span>
              <span className="hidden md:inline text-zinc-400 font-normal"> • 11+ Mô Phỏng (L10 - L12)</span>
            </span>
          )}
          {activeTab === 'tools' && (
            <span className="flex items-center gap-1.5 text-zinc-200 font-semibold">
              <Calculator size={13} className="text-emerald-400 shrink-0" />
              <span>Tiện Ích STEM Đa Năng</span>
              <span className="hidden md:inline text-zinc-400 font-normal"> • fx-880, Đồ Thị, Bảng Tuần Hoàn 2026</span>
            </span>
          )}
          {activeTab === 'roadmap' && (
            <span className="flex items-center gap-1.5 text-zinc-200 font-semibold">
              <Compass size={13} className="text-amber-400 shrink-0" />
              <span>Lộ Trình Tri Thức STEM</span>
              <span className="hidden md:inline text-zinc-400 font-normal"> • Bóc Tách Bản Chất Đa Cấp Độ</span>
            </span>
          )}
          {activeTab === 'notebook' && (
            <span className="flex items-center gap-1.5 text-zinc-200 font-semibold">
              <BookOpen size={13} className="text-purple-400 shrink-0" />
              <span>Sổ Tay Nghiên Cứu</span>
              <span className="hidden md:inline text-zinc-400 font-normal"> • Lưu Trữ Nguyên Lý & Cheat Sheet</span>
            </span>
          )}
          {activeTab === 'video' && (
            <span className="flex items-center gap-1.5 text-zinc-200 font-semibold">
              <Film size={13} className="text-rose-400 shrink-0" />
              <span>Video Bài Giảng AI</span>
              <span className="hidden md:inline text-zinc-400 font-normal"> • Trực Quan Hóa Tự Nhiên</span>
            </span>
          )}
          {activeTab === 'quiz' && (
            <span className="flex items-center gap-1.5 text-zinc-200 font-semibold">
              <Zap size={13} className="text-emerald-400 shrink-0" />
              <span>Đánh Giá Năng Lực Nhanh</span>
              <span className="hidden md:inline text-zinc-400 font-normal"> • Phản Biện Bản Chất</span>
            </span>
          )}
        </div>

        {/* Right: Integrated Fast Jump Tools Dock & Lab Selector Popover */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center gap-1 sm:gap-1.5 bg-zinc-900/90 px-1.5 sm:px-2 py-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setIsPushReminderModalOpen(true)}
              className="px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-amber-950/50 border border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap active:scale-95"
              title="Nhắc nhở học tập định kỳ bằng thông báo đẩy theo 7 cột mốc ôn thi THPT 2027"
            >
              <Bell size={12} className="text-amber-400 shrink-0 animate-pulse" />
              <span>Nhắc THPT 2027</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono hidden sm:inline">
                {countdownDays}d
              </span>
            </button>

            <span className="text-zinc-700">|</span>

            <button
              onClick={() => {
                setActiveTab('assistant');
                setAiInitialQuery('Tra cứu thông tin bên ngoài: ');
              }}
              className="px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-blue-300 hover:text-blue-200 hover:bg-blue-950/50 border border-blue-500/30 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap active:scale-95"
              title="Tra cứu trực tiếp thông tin bên ngoài phục vụ học tập qua Google Search"
            >
              <Globe size={12} className="text-blue-400 shrink-0" />
              <span>Tra Cứu Ngoài</span>
            </button>

            <span className="text-zinc-700">|</span>

            <button
              onClick={() => setActiveTab('exam')}
              className="px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-zinc-300 hover:text-amber-300 hover:bg-zinc-800 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap active:scale-95"
              title="Chuyển nhanh tới phòng thi thử bấm giờ"
            >
              <Timer size={12} className="text-amber-400 shrink-0" />
              <span>Thi Thử</span>
            </button>

            <span className="text-zinc-700">|</span>

            <button
              onClick={() => { setSelectedToolsTab('casio880'); setActiveTab('tools'); }}
              className="px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-zinc-300 hover:text-emerald-300 hover:bg-zinc-800 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap active:scale-95"
              title="Mở máy tính Casio fx-880 BTG"
            >
              <Calculator size={12} className="text-emerald-400 shrink-0" />
              <span>fx-880</span>
            </button>

            <span className="text-zinc-700 hidden xs:inline">|</span>

            <button
              onClick={() => { setSelectedToolsTab('calculator'); setActiveTab('tools'); }}
              className="hidden xs:flex px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-zinc-300 hover:text-teal-300 hover:bg-zinc-800 transition-all items-center gap-1 cursor-pointer whitespace-nowrap active:scale-95"
              title="Khảo sát hàm số & đồ thị"
            >
              <span>Đồ Thị</span>
            </button>

            <span className="text-zinc-700">|</span>

            {/* Quick Lab Popover Selector */}
            <div className="relative">
              <button
                onClick={() => setIsQuickLabDropdownOpen(!isQuickLabDropdownOpen)}
                className="px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold text-cyan-300 hover:bg-cyan-500/10 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap active:scale-95"
                title="Mở danh sách thí nghiệm ảo 11+"
              >
                <FlaskConical size={12} className="text-cyan-400 shrink-0" />
                <span>Lab ▾</span>
              </button>

              {isQuickLabDropdownOpen && (
                <div 
                  className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-24px)] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-3 z-50 flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <FlaskConical size={14} className="text-cyan-400" />
                      Phòng Thí Nghiệm Ảo (11+)
                    </span>
                    <button
                      onClick={() => setIsQuickLabDropdownOpen(false)}
                      className="text-zinc-400 hover:text-white text-xs p-1 rounded-md hover:bg-zinc-800"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Physics Labs */}
                  <div>
                    <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">Vật Lý (L10 - L12)</div>
                    <div className="grid grid-cols-1 gap-1 text-[11px]">
                      <button
                        onClick={() => handleOpenLab('physics', 'pendulum')}
                        className="text-left px-2 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-between"
                      >
                        <span>Con Lắc Đơn & Cơ Năng</span>
                        <span className="text-[9px] text-zinc-500 font-mono">T=2π√(L/g)</span>
                      </button>
                      <button
                        onClick={() => handleOpenLab('physics', 'free_fall')}
                        className="text-left px-2 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-between"
                      >
                        <span>Rơi Tự Do Trong Chân Không</span>
                        <span className="text-[9px] text-zinc-500 font-mono">L10</span>
                      </button>
                      <button
                        onClick={() => handleOpenLab('physics', 'wave_interference')}
                        className="text-left px-2 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-between"
                      >
                        <span>Giao Thoa Sóng Cơ Học</span>
                        <span className="text-[9px] text-zinc-500 font-mono">L11</span>
                      </button>
                    </div>
                  </div>

                  {/* Chemistry Labs */}
                  <div>
                    <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">Hóa Học (L10 - L12)</div>
                    <div className="grid grid-cols-1 gap-1 text-[11px]">
                      <button
                        onClick={() => handleOpenLab('chemistry', 'reaction_rate')}
                        className="text-left px-2 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-between"
                      >
                        <span>Tốc Độ Phản Ứng & Nhiệt Độ</span>
                        <span className="text-[9px] text-zinc-500 font-mono">L10</span>
                      </button>
                      <button
                        onClick={() => handleOpenLab('chemistry', 'le_chatelier')}
                        className="text-left px-2 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-between"
                      >
                        <span>Cân Bằng Le Chatelier (NO2)</span>
                        <span className="text-[9px] text-zinc-500 font-mono">L11</span>
                      </button>
                      <button
                        onClick={() => handleOpenLab('chemistry', 'electrochemical')}
                        className="text-left px-2 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-between"
                      >
                        <span>Pin Điện Hóa Daniell (Zn-Cu)</span>
                        <span className="text-[9px] text-zinc-500 font-mono">L12</span>
                      </button>
                    </div>
                  </div>

                  {/* Biology Labs */}
                  <div>
                    <div className="text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-1">Sinh Học (L10 - L12)</div>
                    <div className="grid grid-cols-1 gap-1 text-[11px]">
                      <button
                        onClick={() => handleOpenLab('biology', 'plasmolysis')}
                        className="text-left px-2 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-between"
                      >
                        <span>Co Nguyên Sinh Tế Bào</span>
                        <span className="text-[9px] text-zinc-500 font-mono">L10</span>
                      </button>
                      <button
                        onClick={() => handleOpenLab('biology', 'hardy_weinberg')}
                        className="text-left px-2 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-between"
                      >
                        <span>Di Truyền Hardy - Weinberg</span>
                        <span className="text-[9px] text-zinc-500 font-mono">L12</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-zinc-400 pl-2 border-l border-zinc-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[10px]">Gemini 3.5 Flash</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-5 lg:p-6 pb-28 sm:pb-16">
        {/* TAB 0: AI STUDY ASSISTANT (FIRST PRINCIPLES) */}
        {activeTab === 'assistant' && (
          <AiStudyAssistantView
            onOpenLab={(subject, experimentId) => handleOpenLab(subject, experimentId)}
            onOpenVideo={(topic, summary) => handleOpenVideo(topic, summary)}
            onOpenNotebook={() => setActiveTab('notebook')}
            onOpenTools={(toolTab) => {
              if (toolTab) setSelectedToolsTab(toolTab);
              setActiveTab('tools');
            }}
            onOpenExam={() => setActiveTab('exam')}
            onOpenHaevyAi={onOpenHaevyAi}
            initialQuery={aiInitialQuery}
            onClearInitialQuery={() => setAiInitialQuery('')}
          />
        )}

        {/* TAB 1: VIRTUAL LABS */}
        {activeTab === 'labs' && (
          <div className="w-full flex flex-col gap-5">
            {/* Subject Selector & Quick Actions (Unified Segmented Control) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800/90 overflow-x-auto scrollbar-none -mx-2.5 px-2.5 sm:mx-0 sm:px-0 touch-pan-x">
                <button
                  onClick={() => setActiveLabSubject('dashboard')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 ${
                    activeLabSubject === 'dashboard'
                      ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <FlaskConical size={14} className={activeLabSubject === 'dashboard' ? 'text-emerald-400' : 'text-zinc-400'} />
                  <span>Tổng Quan Dashboard</span>
                </button>

                <button
                  onClick={() => { setActiveLabSubject('physics'); setActiveExperimentId('pendulum'); }}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 ${
                    activeLabSubject === 'physics'
                      ? 'bg-zinc-800 text-cyan-300 border border-zinc-700/80 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <Atom size={14} className={activeLabSubject === 'physics' ? 'text-cyan-400' : 'text-zinc-400'} />
                  <span>Vật Lý</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-950/60 text-zinc-400 font-mono">7 mô phỏng</span>
                </button>

                <button
                  onClick={() => { setActiveLabSubject('chemistry'); setActiveExperimentId('titration'); }}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 ${
                    activeLabSubject === 'chemistry'
                      ? 'bg-zinc-800 text-rose-300 border border-zinc-700/80 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <TestTube size={14} className={activeLabSubject === 'chemistry' ? 'text-rose-400' : 'text-zinc-400'} />
                  <span>Hóa Học</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-950/60 text-zinc-400 font-mono">6 mô phỏng</span>
                </button>

                <button
                  onClick={() => { setActiveLabSubject('biology'); setActiveExperimentId('microscope'); }}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95 ${
                    activeLabSubject === 'biology'
                      ? 'bg-zinc-800 text-teal-300 border border-zinc-700/80 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <Dna size={14} className={activeLabSubject === 'biology' ? 'text-teal-400' : 'text-zinc-400'} />
                  <span>Sinh Học</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-950/60 text-zinc-400 font-mono">7 mô phỏng</span>
                </button>
              </div>

              {/* Action: Ask AI about current active experiment */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  onClick={() => handleAskAiAboutLab(activeLabSubject, activeExperimentId)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                  title="Gửi câu hỏi bóc tách nguyên lý của thí nghiệm này tới AI Trợ lý"
                >
                  <BrainCircuit size={14} className="text-emerald-400" />
                  <span>Hỏi AI Về Hiện Tượng</span>
                </button>
              </div>
            </div>

            {/* Active Lab Component */}
            {activeLabSubject === 'dashboard' && (
              <VirtualLabDashboard
                onOpenVideoLesson={(topic) => handleOpenVideo(topic)}
                onOpenRoadmapTopic={(topic) => handleOpenVideo(topic)}
                onOpenAiAssistant={() => setActiveTab('assistant')}
                onRecordActivity={recordActivity}
              />
            )}
            {activeLabSubject === 'physics' && (
              <PhysicsLab
                initialExperiment={activeExperimentId as any}
                onSelectExperiment={(id) => setActiveExperimentId(id)}
                onOpenVideoLesson={(topic) => handleOpenVideo(topic)}
                onOpenQuickQuiz={(subj, expId) => handleOpenQuiz(subj, expId)}
                onRecordActivity={recordActivity}
              />
            )}

            {activeLabSubject === 'chemistry' && (
              <ChemistryLab
                initialExperiment={activeExperimentId as any}
                onSelectExperiment={(id) => setActiveExperimentId(id)}
                onOpenVideoLesson={(topic) => handleOpenVideo(topic)}
                onOpenQuickQuiz={(subj, expId) => handleOpenQuiz(subj, expId)}
                onRecordActivity={recordActivity}
              />
            )}

            {activeLabSubject === 'biology' && (
              <BiologyLab
                initialExperiment={activeExperimentId as any}
                onSelectExperiment={(id) => setActiveExperimentId(id)}
                onOpenVideoLesson={(topic) => handleOpenVideo(topic)}
                onOpenQuickQuiz={(subj, expId) => handleOpenQuiz(subj, expId)}
                onRecordActivity={recordActivity}
              />
            )}
          </div>
        )}

        {/* TAB 2: DOCUMENT ROADMAP VIEW */}
        {activeTab === 'roadmap' && (
          <DocumentRoadmapView
            onOpenLabExperiment={(subj, expId) => handleOpenLab(subj, expId)}
            onGenerateVideoFromDoc={(title, summary) => handleOpenVideo(title, summary)}
            onOpenQuickQuiz={(subj, expId) => handleOpenQuiz(subj, expId)}
            onOpenAiAssistant={(prompt) => {
              if (prompt) setAiInitialQuery(prompt);
              setActiveTab('assistant');
            }}
          />
        )}

        {/* TAB 3: VIDEO LESSON PLAYER */}
        {activeTab === 'video' && (
          <VideoLessonPlayer
            initialTopic={videoTopic}
            initialSummary={videoSummary}
            onOpenLabExperiment={(subj, expId) => handleOpenLab(subj as any, expId)}
          />
        )}

        {/* TAB 4: RESEARCH NOTEBOOK & CHEAT SHEET */}
        {activeTab === 'notebook' && (
          <ResearchNotebookView
            onOpenLab={(subj, expId) => handleOpenLab(subj, expId)}
            onOpenAiAssistant={(prompt) => {
              if (prompt) setAiInitialQuery(prompt);
              setActiveTab('assistant');
            }}
          />
        )}

        {/* TAB 5: STEM QUICK QUIZ (FIRST PRINCIPLES SELF-ASSESSMENT) */}
        {activeTab === 'quiz' && (
          <StemQuickQuizView
            initialSubject={quizTargetSubject}
            initialExperimentId={quizTargetExpId}
            onOpenLab={(subj, expId) => handleOpenLab(subj, expId)}
            onOpenAiAssistant={(prompt) => {
              if (prompt) setAiInitialQuery(prompt);
              setActiveTab('assistant');
            }}
            onRecordActivity={recordActivity}
          />
        )}

        {/* TAB 6: STEM UTILITY SUITE & CASIO FX-880 BTG */}
        {activeTab === 'tools' && (
          <EduUtilitySuiteView
            onOpenLab={(subj, expId) => handleOpenLab(subj, expId)}
            onOpenAiAssistant={(prompt) => {
              if (prompt) setAiInitialQuery(prompt);
              setActiveTab('assistant');
            }}
            onOpenExamPrep={() => setActiveTab('exam')}
            onRecordActivity={recordActivity}
            initialUtilityTab={selectedToolsTab}
          />
        )}

        {/* TAB 7: SPEED EXAM PREP (LUYỆN THI CẤP TỐC TÍCH HỢP TRỰC TIẾP CASIO FX-880 BTG) */}
        {activeTab === 'exam' && (
          <SpeedExamPrepView
            onRecordActivity={recordActivity}
            onOpenAiAssistant={(prompt) => {
              if (prompt) setAiInitialQuery(prompt);
              setActiveTab('assistant');
            }}
            onSaveToNotebook={() => {
              setActiveTab('notebook');
            }}
            onOpenPushReminders={() => setIsPushReminderModalOpen(true)}
          />
        )}
      </div>

      {/* Realtime Floating XP & Streak Notification */}
      <EduXpNotificationToast toast={latestXpToast} onDismiss={clearToast} />

      {/* Student Streak & XP Profile Modal */}
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

      {/* THPT 2027 Milestone Study Reminders & Push Notification Modal */}
      <EduPushNotificationModal
        isOpen={isPushReminderModalOpen}
        onClose={() => setIsPushReminderModalOpen(false)}
        onNavigateToTab={(tab, payload) => {
          if (tab === 'assistant') {
            if (payload?.initialQuery) setAiInitialQuery(payload.initialQuery);
            setActiveTab('assistant');
          } else if (tab === 'exam') {
            setActiveTab('exam');
          } else if (tab === 'labs') {
            setActiveTab('labs');
          } else if (tab === 'notebook') {
            setActiveTab('notebook');
          }
        }}
        onOpenLab={(subj, expId) => handleOpenLab(subj, expId)}
        onOpenExam={() => setActiveTab('exam')}
        onOpenAssistant={(prompt) => {
          if (prompt) setAiInitialQuery(prompt);
          setActiveTab('assistant');
        }}
      />
    </div>
  );
}
