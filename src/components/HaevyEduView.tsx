import React, { useState } from 'react';
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
  ArrowLeft,
  Sparkles,
  Zap,
  HelpCircle,
  Activity,
  CheckCircle2,
  ChevronRight,
  Calculator
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
import { EduLabSubject } from '../types';

interface HaevyEduViewProps {
  onBackToLanding?: () => void;
  activeTabControlled?: 'labs' | 'assistant' | 'roadmap' | 'video' | 'notebook' | 'quiz';
  onTabChange?: (tab: 'labs' | 'assistant' | 'roadmap' | 'video' | 'notebook' | 'quiz') => void;
}

export function HaevyEduView({ onBackToLanding, activeTabControlled, onTabChange }: HaevyEduViewProps) {
  // Main tab state: 'labs' | 'assistant' | 'roadmap' | 'video' | 'notebook' | 'quiz'
  const [internalTab, setInternalTab] = useState<'labs' | 'assistant' | 'roadmap' | 'video' | 'notebook' | 'quiz'>('assistant');
  const activeTab = activeTabControlled ?? internalTab;
  const setActiveTab = (tab: 'labs' | 'assistant' | 'roadmap' | 'video' | 'notebook' | 'quiz') => {
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

  // Handle cross-navigation from Roadmap or Video
  const handleOpenLab = (subject: EduLabSubject, experimentId: string) => {
    setActiveLabSubject(subject);
    setActiveExperimentId(experimentId);
    setActiveTab('labs');
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
      {/* Header Banner */}
      <header className="w-full bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/80 sticky top-0 z-30 px-3 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-sm group shrink-0"
              title="Quay lại Cổng Hệ Sinh Thái Haevy"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}

          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-950/50 shrink-0">
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-emerald-400">
              <GraduationCap size={22} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-zinc-100">
                Haevy <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Edu</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold tracking-wide uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                First Principles STEM
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-normal">
              Nghiên cứu khoa học bản chất • Thí nghiệm ảo tương tác • Tuyệt đối tránh học vẹt
            </p>
          </div>
        </div>

        {/* Primary Tab Navigation */}
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-2xl border border-zinc-800 shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('assistant')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'assistant'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <BrainCircuit size={15} className="text-emerald-400" />
            <span>AI Trợ Lý Học Tập</span>
          </button>

          <button
            onClick={() => setActiveTab('labs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'labs'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <FlaskConical size={15} className="text-cyan-400" />
            <span>Phòng Thí Nghiệm Ảo</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">11+</span>
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'roadmap'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Compass size={15} className="text-amber-400" />
            <span>Đọc File & Lộ Trình</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'video'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Film size={15} className="text-rose-400" />
            <span>Video Bài Giảng AI</span>
          </button>

          <button
            onClick={() => setActiveTab('notebook')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'notebook'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <BookOpen size={15} className="text-purple-400" />
            <span>Sổ Tay Nghiên Cứu</span>
          </button>

          <button
            onClick={() => handleOpenQuiz()}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Zap size={15} className="text-emerald-400" />
            <span>Bài Kiểm Tra Nhanh</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">Quiz</span>
          </button>
        </div>
      </header>

      {/* Fast Jump / Quick Access Bar for Core STEM Experiments */}
      <div className="w-full bg-zinc-950/60 border-b border-zinc-800/60 px-3 sm:px-6 py-2 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none text-[11px]">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-zinc-400 font-semibold flex items-center gap-1 text-[11px]">
            <Zap size={13} className="text-emerald-400" />
            <span>Thí nghiệm bản chất:</span>
          </span>
          <button
            onClick={() => handleOpenLab('physics', 'pendulum')}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-cyan-300 font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>⏱️ Con Lắc Đơn</span>
          </button>
          <button
            onClick={() => handleOpenLab('physics', 'free_fall')}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-cyan-300 font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>🪶 Rơi Tự Do L10</span>
          </button>
          <button
            onClick={() => handleOpenLab('physics', 'wave_interference')}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-cyan-300 font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>🌊 Giao Thoa Sóng L11</span>
          </button>
          <button
            onClick={() => handleOpenLab('chemistry', 'reaction_rate')}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-rose-300 font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>⏱️ Tốc Độ Phản Ứng L10</span>
          </button>
          <button
            onClick={() => handleOpenLab('chemistry', 'le_chatelier')}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-rose-300 font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>⚖️ Le Chatelier L11</span>
          </button>
          <button
            onClick={() => handleOpenLab('chemistry', 'electrochemical')}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-rose-300 font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>🔋 Pin Daniell L12</span>
          </button>
          <button
            onClick={() => handleOpenLab('biology', 'plasmolysis')}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-teal-300 font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>💧 Co Nguyên Sinh L10</span>
          </button>
          <button
            onClick={() => handleOpenLab('biology', 'hardy_weinberg')}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-teal-300 font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>📊 Hardy-Weinberg L12</span>
          </button>
          <button
            onClick={() => handleOpenLab('biology', 'microscope')}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-teal-300 font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>🔬 Kính Hiển Vi</span>
          </button>
          <button
            onClick={() => handleOpenLab('biology', 'genetics')}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-teal-300 font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1"
          >
            <span>🧬 Di Truyền Men-đen</span>
          </button>
          <button
            onClick={() => handleOpenQuiz()}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1"
          >
            <Zap size={12} className="text-emerald-400" />
            <span>🎯 Tự Đánh Giá Quiz</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3 shrink-0 text-zinc-400">
          <span className="flex items-center gap-1 text-[10px] text-emerald-400/90 font-mono">
            <Sparkles size={11} />
            Gemini 3.5 Flash Processor
          </span>
          <span className="text-zinc-600">•</span>
          <button
            onClick={() => setActiveTab('notebook')}
            className="text-amber-300/80 hover:text-amber-200 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
          >
            <Calculator size={12} />
            <span>Máy tính khoa học</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 pb-12">
        {/* TAB 0: AI STUDY ASSISTANT (FIRST PRINCIPLES) */}
        {activeTab === 'assistant' && (
          <AiStudyAssistantView
            onOpenLab={(subject, experimentId) => handleOpenLab(subject, experimentId)}
            onOpenVideo={(topic, summary) => handleOpenVideo(topic, summary)}
            onOpenNotebook={() => setActiveTab('notebook')}
            initialQuery={aiInitialQuery}
            onClearInitialQuery={() => setAiInitialQuery('')}
          />
        )}

        {/* TAB 1: VIRTUAL LABS */}
        {activeTab === 'labs' && (
          <div className="w-full flex flex-col gap-5">
            {/* Subject Selector & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveLabSubject('dashboard')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    activeLabSubject === 'dashboard'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-lg shadow-emerald-950/40'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <FlaskConical size={15} />
                  <span>Tổng Quan Dashboard</span>
                </button>

                <button
                  onClick={() => { setActiveLabSubject('physics'); setActiveExperimentId('pendulum'); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    activeLabSubject === 'physics'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-950/40'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Atom size={15} />
                  <span>Vật Lý (7 Thí Nghiệm • L10-L12)</span>
                </button>

                <button
                  onClick={() => { setActiveLabSubject('chemistry'); setActiveExperimentId('titration'); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    activeLabSubject === 'chemistry'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-lg shadow-rose-950/40'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <TestTube size={15} />
                  <span>Hóa Học (6 Thí Nghiệm • L10-L12)</span>
                </button>

                <button
                  onClick={() => { setActiveLabSubject('biology'); setActiveExperimentId('microscope'); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    activeLabSubject === 'biology'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50 shadow-lg shadow-teal-950/40'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Dna size={15} />
                  <span>Sinh Học (7 Thí Nghiệm • L10-L12)</span>
                </button>
              </div>

              {/* Action: Ask AI about current active experiment */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  onClick={() => handleAskAiAboutLab(activeLabSubject, activeExperimentId)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Gửi câu hỏi bóc tách nguyên lý của thí nghiệm này tới AI Trợ lý"
                >
                  <BrainCircuit size={14} className="text-emerald-400" />
                  <span>Hỏi AI về hiện tượng này</span>
                </button>
              </div>
            </div>

            {/* Active Lab Component */}
            {activeLabSubject === 'dashboard' && (
              <VirtualLabDashboard
                onOpenVideoLesson={(topic) => handleOpenVideo(topic)}
                onOpenRoadmapTopic={(topic) => handleOpenVideo(topic)}
                onOpenAiAssistant={() => setActiveTab('assistant')}
              />
            )}
            {activeLabSubject === 'physics' && (
              <PhysicsLab
                initialExperiment={activeExperimentId as any}
                onSelectExperiment={(id) => setActiveExperimentId(id)}
                onOpenVideoLesson={(topic) => handleOpenVideo(topic)}
                onOpenQuickQuiz={(subj, expId) => handleOpenQuiz(subj, expId)}
              />
            )}

            {activeLabSubject === 'chemistry' && (
              <ChemistryLab
                initialExperiment={activeExperimentId as any}
                onSelectExperiment={(id) => setActiveExperimentId(id)}
                onOpenVideoLesson={(topic) => handleOpenVideo(topic)}
                onOpenQuickQuiz={(subj, expId) => handleOpenQuiz(subj, expId)}
              />
            )}

            {activeLabSubject === 'biology' && (
              <BiologyLab
                initialExperiment={activeExperimentId as any}
                onSelectExperiment={(id) => setActiveExperimentId(id)}
                onOpenVideoLesson={(topic) => handleOpenVideo(topic)}
                onOpenQuickQuiz={(subj, expId) => handleOpenQuiz(subj, expId)}
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
          />
        )}
      </div>
    </div>
  );
}
