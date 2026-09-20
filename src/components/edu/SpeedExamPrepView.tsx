import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calculator,
  Award,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flag,
  ArrowRight,
  Zap,
  HelpCircle,
  FileCheck,
  Check,
  X,
  Clock,
  Layers,
  BarChart2,
  Bookmark,
  Share2,
  ExternalLink,
  SplitSquareVertical,
  SidebarOpen,
  SidebarClose,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SAMPLE_EXAM_PRESETS, 
  ExamPreset, 
  ExamQuestion, 
  ExamSubject, 
  ExamDifficulty,
  ExamQuestionType
} from '../../data/eduExamData';
import { Casio880Calculator, CasioMode } from './Casio880Calculator';

interface UserAnswerState {
  // For multiple_choice: selected index (0..3)
  selectedIndex?: number;
  // For true_false: record of sub-statement id -> boolean (true = Dung, false = Sai)
  trueFalseAnswers?: Record<string, boolean>;
  // For short_answer: entered string value
  shortAnswerText?: string;
  // Flagged for review
  isFlagged?: boolean;
}

interface ExamResultReport {
  presetId: string;
  presetTitle: string;
  totalQuestions: number;
  score: number; // 0..10
  percentage: number;
  timeSpentSeconds: number;
  correctCount: number;
  partialCount: number;
  wrongCount: number;
  questionResults: Array<{
    questionId: string;
    isFullyCorrect: boolean;
    pointsEarned: number;
    maxPoints: number;
  }>;
  completedAt: string;
}

interface SpeedExamPrepViewProps {
  onRecordActivity?: (params: {
    type: 'lab_run' | 'lab_adjust' | 'lab_export' | 'lab_switch';
    title: string;
    xpAmount?: number;
    category?: 'lab';
  }) => void;
  onOpenAiAssistant?: (prompt: string) => void;
  onSaveToNotebook?: (title: string, content: string, tags: string[]) => void;
  onOpenPushReminders?: () => void;
}

export function SpeedExamPrepView({
  onRecordActivity,
  onOpenAiAssistant,
  onSaveToNotebook,
  onOpenPushReminders
}: SpeedExamPrepViewProps) {
  // Main view modes: 'lobby' | 'exam' | 'result'
  const [viewMode, setViewMode] = useState<'lobby' | 'exam' | 'result'>('lobby');
  
  // Selected Exam Preset
  const [selectedPreset, setSelectedPreset] = useState<ExamPreset>(SAMPLE_EXAM_PRESETS[0]);
  const [subjectFilter, setSubjectFilter] = useState<'all' | ExamSubject>('all');

  // Exam Active States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswerState>>({});
  
  // Timer States
  const [remainingSeconds, setRemainingSeconds] = useState<number>(30 * 60);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [initialDurationSeconds, setInitialDurationSeconds] = useState<number>(30 * 60);
  const timerIntervalRef = useRef<any>(null);

  // Casio fx-880 Integrated State
  const [isCasioOpen, setIsCasioOpen] = useState<boolean>(true);
  const [casioLayout, setCasioLayout] = useState<'split' | 'dock'>('split');
  const [injectedMode, setInjectedMode] = useState<CasioMode>('calculate');
  const [injectedFormula, setInjectedFormula] = useState<string>('');
  const [injectedParams, setInjectedParams] = useState<Record<string, any>>({});
  const [injectKey, setInjectKey] = useState<number>(0);
  const [casioToast, setCasioToast] = useState<string | null>(null);

  // Submit Modal Confirmation
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);

  // Exam Result
  const [examResult, setExamResult] = useState<ExamResultReport | null>(null);

  // Exam History in local state
  const [examHistory, setExamHistory] = useState<ExamResultReport[]>(() => {
    try {
      const saved = localStorage.getItem('haevy_speed_exam_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Filtered Presets
  const filteredPresets = useMemo(() => {
    if (subjectFilter === 'all') return SAMPLE_EXAM_PRESETS;
    return SAMPLE_EXAM_PRESETS.filter(p => p.subject === subjectFilter);
  }, [subjectFilter]);

  // Current Question Object
  const currentQuestion: ExamQuestion | undefined = selectedPreset.questions[currentQuestionIndex];

  // Count answered questions
  const answeredCount = useMemo(() => {
    let count = 0;
    selectedPreset.questions.forEach(q => {
      const ans = userAnswers[q.id];
      if (!ans) return;
      if (q.type === 'multiple_choice' && typeof ans.selectedIndex === 'number') {
        count++;
      } else if (q.type === 'true_false' && ans.trueFalseAnswers && Object.keys(ans.trueFalseAnswers).length > 0) {
        count++;
      } else if (q.type === 'short_answer' && ans.shortAnswerText && ans.shortAnswerText.trim() !== '') {
        count++;
      }
    });
    return count;
  }, [selectedPreset, userAnswers]);

  // Timer Countdown Effect
  useEffect(() => {
    if (viewMode !== 'exam' || isTimerPaused) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [viewMode, isTimerPaused]);

  // Start Exam
  const handleStartExam = (preset: ExamPreset, customMinutes?: number) => {
    setSelectedPreset(preset);
    const duration = (customMinutes || preset.durationMinutes) * 60;
    setInitialDurationSeconds(duration);
    setRemainingSeconds(duration);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsTimerPaused(false);
    setViewMode('exam');
    setIsCasioOpen(true);

    // Initial inject if question 1 has Casio tips
    if (preset.questions[0]?.casioInject) {
      injectIntoCasio(preset.questions[0]);
    }

    if (onRecordActivity) {
      onRecordActivity({
        type: 'lab_run',
        title: `Bắt đầu Luyện thi cấp tốc: ${preset.title}`,
        xpAmount: 20
      });
    }
  };

  // Inject current question formula/mode into Casio fx-880 BTG
  const injectIntoCasio = (q: ExamQuestion) => {
    if (!isCasioOpen) {
      setIsCasioOpen(true);
    }
    if (q.casioInject) {
      setInjectedMode(q.casioInject.mode);
      if (q.casioInject.formula) {
        setInjectedFormula(q.casioInject.formula);
      }
      if (q.casioInject.params) {
        setInjectedParams(q.casioInject.params);
      }
      setInjectKey(prev => prev + 1);
      
      setCasioToast(`Đã nạp công thức Câu ${q.number} vào Casio fx-880!`);
      setTimeout(() => setCasioToast(null), 3000);
    } else {
      setInjectedMode('calculate');
      setCasioToast(`Đã mở Casio fx-880 cho Câu ${q.number}`);
      setTimeout(() => setCasioToast(null), 2500);
    }
  };

  // Answer handler for multiple choice
  const handleSelectOption = (qId: string, optIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        selectedIndex: optIndex
      }
    }));
  };

  // Answer handler for True/False sub-statements
  const handleToggleTrueFalse = (qId: string, subId: string, val: boolean) => {
    setUserAnswers(prev => {
      const currentTF = prev[qId]?.trueFalseAnswers || {};
      return {
        ...prev,
        [qId]: {
          ...prev[qId],
          trueFalseAnswers: {
            ...currentTF,
            [subId]: val
          }
        }
      };
    });
  };

  // Answer handler for Short answer input
  const handleShortAnswerChange = (qId: string, text: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        shortAnswerText: text
      }
    }));
  };

  // Toggle flag for question review
  const handleToggleFlag = (qId: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        isFlagged: !prev[qId]?.isFlagged
      }
    }));
  };

  // Auto submit when time runs out
  const handleAutoSubmit = () => {
    calculateAndShowResult();
  };

  // User confirmed manual submit
  const handleConfirmSubmit = () => {
    setIsSubmitModalOpen(false);
    calculateAndShowResult();
  };

  // Grading Algorithm based on Vietnam High School Graduation Exam 2027
  const calculateAndShowResult = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const timeSpent = initialDurationSeconds - remainingSeconds;
    let earnedPoints = 0;
    let correctCount = 0;
    let partialCount = 0;
    let wrongCount = 0;

    const questionResults = selectedPreset.questions.map(q => {
      const ans = userAnswers[q.id];
      let qEarned = 0;
      let isFullyCorrect = false;

      if (q.type === 'multiple_choice') {
        if (ans && ans.selectedIndex === q.correctIndex) {
          qEarned = q.points;
          isFullyCorrect = true;
          correctCount++;
        } else {
          wrongCount++;
        }
      } else if (q.type === 'true_false' && q.subStatements) {
        // Bộ GD quy định thang điểm đúng-sai: 1 ý đúng = 0.1, 2 ý = 0.25, 3 ý = 0.5, 4 ý = 1.0 (nhân hệ số điểm câu)
        let correctSubCount = 0;
        const totalSubs = q.subStatements.length;
        const userTF = ans?.trueFalseAnswers || {};

        q.subStatements.forEach(sub => {
          if (userTF[sub.id] === sub.isCorrect) {
            correctSubCount++;
          }
        });

        if (correctSubCount === 4) {
          qEarned = q.points;
          isFullyCorrect = true;
          correctCount++;
        } else if (correctSubCount === 3) {
          qEarned = q.points * 0.5;
          partialCount++;
        } else if (correctSubCount === 2) {
          qEarned = q.points * 0.25;
          partialCount++;
        } else if (correctSubCount === 1) {
          qEarned = q.points * 0.1;
          partialCount++;
        } else {
          wrongCount++;
        }
      } else if (q.type === 'short_answer') {
        const userVal = parseFloat((ans?.shortAnswerText || '').replace(',', '.').trim());
        const expected = q.correctAnswerNumber ?? 0;
        const tol = q.tolerance ?? 0.05;

        if (!isNaN(userVal) && Math.abs(userVal - expected) <= tol) {
          qEarned = q.points;
          isFullyCorrect = true;
          correctCount++;
        } else {
          wrongCount++;
        }
      }

      earnedPoints += qEarned;
      return {
        questionId: q.id,
        isFullyCorrect,
        pointsEarned: Math.round(qEarned * 100) / 100,
        maxPoints: q.points
      };
    });

    const finalScore = Math.min(10, Math.round((earnedPoints / selectedPreset.totalPoints) * 10 * 10) / 10);
    const percentage = Math.round((earnedPoints / selectedPreset.totalPoints) * 100);

    const report: ExamResultReport = {
      presetId: selectedPreset.id,
      presetTitle: selectedPreset.title,
      totalQuestions: selectedPreset.totalQuestions,
      score: finalScore,
      percentage,
      timeSpentSeconds: timeSpent,
      correctCount,
      partialCount,
      wrongCount,
      questionResults,
      completedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
    };

    setExamResult(report);
    setViewMode('result');

    // Save to history
    try {
      const updatedHistory = [report, ...examHistory.slice(0, 9)];
      setExamHistory(updatedHistory);
      localStorage.setItem('haevy_speed_exam_history', JSON.stringify(updatedHistory));
    } catch (e) {
      // ignore storage error
    }

    // Award Gamification XP
    const xpReward = Math.round(100 + finalScore * 20);
    if (onRecordActivity) {
      onRecordActivity({
        type: 'lab_run',
        title: `Hoàn thành ${selectedPreset.title} (${finalScore}/10 điểm)`,
        xpAmount: xpReward,
        category: 'lab'
      });
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Timer color indicator
  const timerColorClass = useMemo(() => {
    if (remainingSeconds < 60) return 'text-rose-400 border-rose-500/50 bg-rose-950/40 animate-pulse';
    if (remainingSeconds < 300) return 'text-amber-400 border-amber-500/50 bg-amber-950/30';
    return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';
  }, [remainingSeconds]);

  // =========================================================================
  // RENDER: LOBBY VIEW
  // =========================================================================
  if (viewMode === 'lobby') {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* HERO BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-emerald-500/30 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
                  <Zap size={14} className="text-emerald-400 fill-emerald-400" />
                  LUYỆN THI CẤP TỐC THPT 2027
                </span>
                <span className="px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-mono font-bold flex items-center gap-1.5">
                  <Calculator size={14} />
                  Tích hợp Casio fx-880 BTG
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Luyện Đề Bấm Giờ & Thực Chiến Casio fx-880
              </h1>
              
              <p className="text-sm text-zinc-300 leading-relaxed">
                Hệ thống đề thi thử bám sát 100% cấu trúc GDPT 2018 mới nhất (Trắc nghiệm nhiều lựa chọn, Trắc nghiệm Đúng/Sai và Trả lời ngắn). Làm bài thi song song trực tiếp với máy tính Casio fx-880 BTG chuẩn phòng thi.
              </p>
            </div>

            {/* Quick stats & action */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto">
              <button
                onClick={() => handleStartExam(SAMPLE_EXAM_PRESETS[3])} // Casio speed test
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-sm tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap size={18} className="fill-black" />
                <span>Bấm Máy Siêu Tốc 15 Phút</span>
              </button>

              <button
                onClick={() => handleStartExam(SAMPLE_EXAM_PRESETS[0])}
                className="px-6 py-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <FileCheck size={18} className="text-emerald-400" />
                <span>Thi Thử Toán 12 (30 Phút)</span>
              </button>

              {onOpenPushReminders && (
                <button
                  onClick={onOpenPushReminders}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm"
                  title="Cài đặt thông báo đẩy nhắc nhở định kỳ theo 7 cột mốc ôn thi THPT 2027"
                >
                  <Bell size={14} className="text-amber-400 animate-pulse" />
                  <span>Nhắc Nhở Cột Mốc THPT 2027</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SUBJECT FILTER TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'all', label: 'Tất Cả Đề Thi' },
            { id: 'math', label: '📐 Toán Học 12' },
            { id: 'physics', label: '⚡ Vật Lý 12' },
            { id: 'chemistry', label: '🧪 Hóa Học 12' },
            { id: 'casio_speed', label: '🚀 Siêu Tốc fx-880' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSubjectFilter(tab.id as any)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                subjectFilter === tab.id
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* PRESET CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPresets.map(preset => (
            <div
              key={preset.id}
              className="group flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 hover:border-emerald-500/50 transition-all duration-300 shadow-lg hover:shadow-emerald-500/10"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                    {preset.badge}
                  </span>
                  <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-emerald-400" />
                      {preset.durationMinutes} phút
                    </span>
                    <span className="flex items-center gap-1">
                      <FileCheck size={14} className="text-teal-400" />
                      {preset.totalQuestions} câu hỏi
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {preset.title}
                  </h3>
                  <p className="text-xs text-emerald-400/90 font-medium mt-0.5">
                    {preset.subtitle}
                  </p>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>

                {/* Highlights of questions */}
                <div className="p-3 rounded-2xl bg-black/40 border border-zinc-800/80 text-[11px] text-zinc-300 space-y-1">
                  <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Calculator size={13} />
                    Mẹo bấm máy trọng tâm:
                  </div>
                  <p className="text-zinc-400 italic">
                    {preset.questions[0]?.casioTip.slice(0, 95)}...
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                <span className="text-xs font-mono text-zinc-500">
                  Thang điểm: <strong className="text-zinc-300">{preset.totalPoints}.0</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartExam(preset)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                  >
                    <span>Làm bài ngay</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* EXAM HISTORY */}
        {examHistory.length > 0 && (
          <div className="p-5 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Award size={16} className="text-amber-400" />
                Lịch sử làm bài gần nhất ({examHistory.length})
              </h3>
              <button
                onClick={() => {
                  localStorage.removeItem('haevy_speed_exam_history');
                  setExamHistory([]);
                }}
                className="text-[11px] text-zinc-500 hover:text-rose-400 cursor-pointer transition-colors"
              >
                Xóa lịch sử
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {examHistory.slice(0, 3).map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-black/40 border border-zinc-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-200 truncate pr-2">{item.presetTitle}</span>
                    <span className={`px-2 py-0.5 rounded-md font-mono font-black text-xs ${
                      item.score >= 8 ? 'bg-emerald-500/20 text-emerald-400' :
                      item.score >= 5 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {item.score}/10
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Đúng: {item.correctCount}/{item.totalQuestions} câu</span>
                    <span>{formatTime(item.timeSpentSeconds)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // RENDER: EXAM TAKING VIEW (WITH SPLIT CASIO FX-880 BTG)
  // =========================================================================
  if (viewMode === 'exam') {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-4">
        {/* EXAM TOP CONTROL BAR */}
        <div className="p-3 sm:p-4 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-black border border-emerald-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 sticky top-2 z-30 backdrop-blur-md">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <ChevronLeft size={16} />
              <span>Thoát</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white truncate max-w-xs sm:max-w-md">
                  {selectedPreset.title}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                  Câu {currentQuestionIndex + 1}/{selectedPreset.totalQuestions}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Đã hoàn thành: <strong className="text-emerald-400 font-mono">{answeredCount}/{selectedPreset.totalQuestions}</strong> câu
              </p>
            </div>
          </div>

          {/* Center: Timer & Controls */}
          <div className="flex items-center gap-2 self-center">
            <div className={`px-4 py-1.5 rounded-2xl border font-mono font-black text-lg sm:text-xl flex items-center gap-2 shadow-inner transition-all ${timerColorClass}`}>
              <Timer size={20} className={remainingSeconds < 60 ? 'animate-bounce' : ''} />
              <span>{formatTime(remainingSeconds)}</span>
            </div>

            <button
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs cursor-pointer transition-all"
              title={isTimerPaused ? 'Tiếp tục làm bài' : 'Tạm dừng bài thi'}
            >
              {isTimerPaused ? <Play size={16} className="text-emerald-400 fill-emerald-400" /> : <Pause size={16} />}
            </button>
          </div>

          {/* Right: Casio Calculator Toggle & Submit Button */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setIsCasioOpen(!isCasioOpen)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isCasioOpen
                  ? 'bg-emerald-500 text-black font-black border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-emerald-500/50'
              }`}
            >
              <Calculator size={15} />
              <span>{isCasioOpen ? 'Ẩn fx-880' : 'Mở fx-880'}</span>
            </button>

            {isCasioOpen && (
              <button
                onClick={() => setCasioLayout(casioLayout === 'split' ? 'dock' : 'split')}
                className="hidden lg:flex p-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                title={casioLayout === 'split' ? 'Chuyển sang dạng Bảng Trượt Dock' : 'Chuyển sang dạng Chia Đôi Split'}
              >
                <SplitSquareVertical size={16} />
              </button>
            )}

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <CheckCircle2 size={16} />
              <span>Nộp Bài</span>
            </button>
          </div>
        </div>

        {/* TOAST ALERT FOR CASIO INJECTION */}
        <AnimatePresence>
          {casioToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg max-w-md mx-auto"
            >
              <Sparkles size={15} />
              <span>{casioToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN SPLIT / DOCK CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* EXAM PAPER COLUMN (Questions & Navigator) */}
          <div className={`${isCasioOpen ? (casioLayout === 'split' ? 'lg:col-span-6 xl:col-span-7' : 'lg:col-span-8') : 'lg:col-span-12'} space-y-4`}>
            
            {/* QUESTION NUMBERS NAVIGATOR */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none touch-pan-x">
              <span className="text-xs font-mono text-zinc-400 shrink-0 font-bold">Danh sách câu:</span>
              <div className="flex items-center gap-1.5">
                {selectedPreset.questions.map((q, idx) => {
                  const ans = userAnswers[q.id];
                  const isAnswered = 
                    (q.type === 'multiple_choice' && typeof ans?.selectedIndex === 'number') ||
                    (q.type === 'true_false' && ans?.trueFalseAnswers && Object.keys(ans.trueFalseAnswers).length > 0) ||
                    (q.type === 'short_answer' && !!ans?.shortAnswerText?.trim());
                  const isCurrent = idx === currentQuestionIndex;
                  const isFlagged = ans?.isFlagged;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-8 h-8 rounded-xl font-mono text-xs font-bold transition-all relative cursor-pointer flex items-center justify-center ${
                        isCurrent
                          ? 'ring-2 ring-emerald-400 bg-white text-black font-black shadow-md'
                          : isAnswered
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-black" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTIVE QUESTION CARD */}
            {currentQuestion && (
              <div className="p-5 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-5">
                {/* Question Header */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-800 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-black text-xs font-mono font-black">
                      Câu {currentQuestion.number}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[11px] font-medium">
                      {currentQuestion.type === 'multiple_choice' && 'Trắc nghiệm 4 lựa chọn'}
                      {currentQuestion.type === 'true_false' && 'Trắc nghiệm Đúng / Sai'}
                      {currentQuestion.type === 'short_answer' && 'Trả lời ngắn (Điền số)'}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">
                      ({currentQuestion.points} điểm)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Inject into fx-880 button */}
                    <button
                      onClick={() => injectIntoCasio(currentQuestion)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                      title="Chuyển chế độ và nạp công thức câu này sang máy tính Casio fx-880"
                    >
                      <Zap size={14} className="text-emerald-400 fill-emerald-400" />
                      <span>Bấm máy trên fx-880</span>
                    </button>

                    {/* Flag for review button */}
                    <button
                      onClick={() => handleToggleFlag(currentQuestion.id)}
                      className={`p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                        userAnswers[currentQuestion.id]?.isFlagged
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                      }`}
                      title="Đánh dấu câu hỏi để kiểm tra lại trước khi nộp"
                    >
                      <Flag size={14} />
                    </button>
                  </div>
                </div>

                {/* Question Context if any */}
                {currentQuestion.context && (
                  <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-mono">
                    {currentQuestion.context}
                  </div>
                )}

                {/* Question Statement */}
                <div className="text-sm sm:text-base text-zinc-100 font-medium leading-relaxed">
                  {currentQuestion.question}
                </div>

                {/* Casio fx-880 Quick Hint Box */}
                <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300/90 flex items-start gap-2.5">
                  <Calculator size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-emerald-300">Hướng dẫn Casio fx-880:</span>
                    <p className="text-[11px] text-zinc-300 font-mono">
                      {currentQuestion.casioTip}
                    </p>
                  </div>
                </div>

                {/* ANSWER INTERFACE: MULTIPLE CHOICE */}
                {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                  <div className="space-y-2.5 pt-2">
                    {currentQuestion.options.map((option, optIdx) => {
                      const isSelected = userAnswers[currentQuestion.id]?.selectedIndex === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100 shadow-md font-bold'
                              : 'bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/50'
                          }`}
                        >
                          <span className="text-xs sm:text-sm">{option}</span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-emerald-400 bg-emerald-400 text-black' : 'border-zinc-600'
                          }`}>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* ANSWER INTERFACE: TRUE / FALSE (GDPT 2018 FORMAT) */}
                {currentQuestion.type === 'true_false' && currentQuestion.subStatements && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-12 text-[11px] font-bold text-zinc-400 px-3 pb-1 border-b border-zinc-800">
                      <div className="col-span-8">Nội dung mệnh đề</div>
                      <div className="col-span-2 text-center">ĐÚNG</div>
                      <div className="col-span-2 text-center">SAI</div>
                    </div>

                    {currentQuestion.subStatements.map(sub => {
                      const userTF = userAnswers[currentQuestion.id]?.trueFalseAnswers?.[sub.id];
                      return (
                        <div
                          key={sub.id}
                          className="grid grid-cols-12 items-center gap-2 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700"
                        >
                          <div className="col-span-8 text-xs text-zinc-200 pr-2">
                            <strong className="text-emerald-400 mr-1.5">{sub.label})</strong>
                            {sub.text}
                          </div>

                          {/* Button Dung */}
                          <div className="col-span-2 flex justify-center">
                            <button
                              onClick={() => handleToggleTrueFalse(currentQuestion.id, sub.id, true)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black transition-all cursor-pointer ${
                                userTF === true
                                  ? 'bg-emerald-500 text-black shadow-md'
                                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                              }`}
                            >
                              Đúng
                            </button>
                          </div>

                          {/* Button Sai */}
                          <div className="col-span-2 flex justify-center">
                            <button
                              onClick={() => handleToggleTrueFalse(currentQuestion.id, sub.id, false)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black transition-all cursor-pointer ${
                                userTF === false
                                  ? 'bg-rose-500 text-white shadow-md'
                                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                              }`}
                            >
                              Sai
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ANSWER INTERFACE: SHORT ANSWER (NUMERICAL) */}
                {currentQuestion.type === 'short_answer' && (
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-zinc-300">
                      Nhập kết quả số (theo chuẩn làm tròn đề bài):
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={userAnswers[currentQuestion.id]?.shortAnswerText || ''}
                        onChange={(e) => handleShortAnswerChange(currentQuestion.id, e.target.value)}
                        placeholder="Ví dụ: 15.65 hoặc 20"
                        className="flex-1 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-700 focus:border-emerald-500 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      {currentQuestion.unit && (
                        <span className="px-3 py-3 rounded-2xl bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 font-bold">
                          {currentQuestion.unit}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* QUESTION NAVIGATION BOTTOM BAR */}
                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-3">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <ChevronLeft size={16} />
                    <span>Câu trước</span>
                  </button>

                  <span className="text-xs font-mono text-zinc-500">
                    Câu {currentQuestionIndex + 1} / {selectedPreset.totalQuestions}
                  </span>

                  <button
                    disabled={currentQuestionIndex === selectedPreset.totalQuestions - 1}
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(selectedPreset.totalQuestions - 1, prev + 1))}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:pointer-events-none text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>Câu kế tiếp</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CASIO FX-880 BTG INTEGRATED COLUMN */}
          {isCasioOpen && (
            <div className={`${casioLayout === 'split' ? 'lg:col-span-6 xl:col-span-5' : 'lg:col-span-4'} sticky top-20 z-20`}>
              <div className="rounded-3xl border border-emerald-500/40 bg-zinc-950/95 shadow-2xl p-2 sm:p-3 overflow-hidden backdrop-blur-xl">
                <Casio880Calculator
                  compactMode={true}
                  hideHeaderBanner={true}
                  onCloseDock={() => setIsCasioOpen(false)}
                  injectedMode={injectedMode}
                  injectedFormula={injectedFormula}
                  injectedParams={injectedParams}
                  triggerInjectKey={injectKey}
                  onRecordActivity={onRecordActivity}
                  onOpenAiAssistant={onOpenAiAssistant}
                  onSaveToNotebook={onSaveToNotebook}
                />
              </div>
            </div>
          )}
        </div>

        {/* SUBMIT CONFIRMATION MODAL */}
        <AnimatePresence>
          {isSubmitModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <FileCheck size={26} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Xác nhận nộp bài thi?</h3>
                    <p className="text-xs text-zinc-400">
                      {selectedPreset.title}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/50 border border-zinc-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Thời gian còn lại:</span>
                    <strong className="font-mono text-emerald-400">{formatTime(remainingSeconds)}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Số câu đã làm:</span>
                    <strong className="font-mono text-white">{answeredCount} / {selectedPreset.totalQuestions} câu</strong>
                  </div>
                  {answeredCount < selectedPreset.totalQuestions && (
                    <div className="pt-2 text-amber-400 flex items-center gap-1.5 font-medium">
                      <AlertCircle size={14} />
                      <span>Bạn còn {selectedPreset.totalQuestions - answeredCount} câu chưa trả lời!</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs cursor-pointer transition-all"
                  >
                    Làm bài tiếp
                  </button>

                  <button
                    onClick={handleConfirmSubmit}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-md shadow-emerald-500/20 cursor-pointer transition-all"
                  >
                    Nộp bài & Chấm điểm
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // =========================================================================
  // RENDER: EXAM RESULT & ANALYTICS VIEW
  // =========================================================================
  if (viewMode === 'result' && examResult) {
    const isPass = examResult.score >= 5.0;
    const isExcellent = examResult.score >= 8.5;

    return (
      <div className="w-full max-w-5xl mx-auto space-y-6">
        {/* SCORE SUMMARY CARD */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-emerald-500/40 shadow-2xl space-y-6 text-center">
          <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Award size={40} className="text-emerald-400" />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold uppercase">
              KẾT QUẢ BÀI THI CẤP TỐC
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {examResult.presetTitle}
            </h1>
          </div>

          {/* Big Score Display */}
          <div className="flex items-center justify-center gap-4">
            <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-700 shadow-inner">
              <div className="text-4xl sm:text-6xl font-black font-mono text-emerald-400">
                {examResult.score}
                <span className="text-xl sm:text-2xl text-zinc-500">/10</span>
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-1">
                Điểm số chuẩn THPT
              </p>
            </div>

            <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-700 shadow-inner">
              <div className="text-4xl sm:text-6xl font-black font-mono text-teal-400">
                {examResult.percentage}%
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-1">
                Độ chính xác
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div className="max-w-md mx-auto">
            <span className={`px-4 py-1.5 rounded-xl text-xs font-bold ${
              isExcellent
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                : isPass
                ? 'bg-teal-500/20 border border-teal-500/50 text-teal-300'
                : 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
            }`}>
              {isExcellent && '🌟 XUẤT SẮC - Kỹ năng bấm máy & lý thuyết cực kỳ vững vàng!'}
              {!isExcellent && isPass && '👍 KHÁ TỐT - Tiếp tục duy trì phản xạ bấm Casio fx-880!'}
              {!isPass && '⚡ CẦN RÈN LUYỆN - Hãy xem kỹ lời giải & mẹo bấm máy bên dưới!'}
            </span>
          </div>

          {/* Detailed metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2 text-xs">
            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-zinc-400">Thời gian làm:</span>
              <p className="font-mono font-bold text-white text-sm mt-0.5">
                {formatTime(examResult.timeSpentSeconds)}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-zinc-400">Số câu đúng:</span>
              <p className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                {examResult.correctCount} câu
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-zinc-400">Đúng một phần:</span>
              <p className="font-mono font-bold text-amber-400 text-sm mt-0.5">
                {examResult.partialCount} câu
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-zinc-400">Số câu sai / bỏ:</span>
              <p className="font-mono font-bold text-rose-400 text-sm mt-0.5">
                {examResult.wrongCount} câu
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-3 pt-3 flex-wrap">
            <button
              onClick={() => handleStartExam(selectedPreset)}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <RotateCcw size={15} />
              <span>Làm lại đề này</span>
            </button>

            <button
              onClick={() => setViewMode('lobby')}
              className="px-5 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <BookOpen size={15} />
              <span>Chọn đề thi khác</span>
            </button>
          </div>
        </div>

        {/* DETAILED QUESTION-BY-QUESTION SOLUTIONS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <FileCheck size={20} className="text-emerald-400" />
              Chi Tiết Lời Giải & Mẹo Bấm Máy Casio fx-880
            </h2>
            <span className="text-xs text-zinc-400 font-mono">
              Tổng {selectedPreset.questions.length} câu
            </span>
          </div>

          {selectedPreset.questions.map((q, idx) => {
            const qResult = examResult.questionResults.find(r => r.questionId === q.id);
            const isCorrect = qResult?.isFullyCorrect;
            const ans = userAnswers[q.id];

            return (
              <div
                key={q.id}
                className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                  isCorrect
                    ? 'bg-zinc-900/60 border-emerald-500/30'
                    : 'bg-zinc-900/60 border-rose-500/30'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-800 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black ${
                      isCorrect ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
                    }`}>
                      Câu {q.number}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {isCorrect ? '✓ Đúng' : '✗ Chưa chính xác'}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">
                      ({qResult?.pointsEarned || 0} / {q.points} điểm)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenAiAssistant && (
                      <button
                        onClick={() => onOpenAiAssistant(`Hãy giải thích chi tiết bản chất của Câu ${q.number}: "${q.question}" và cách bấm máy Casio fx-880 BTG.`)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Sparkles size={12} className="text-amber-400" />
                        <span>Hỏi Haevy AI</span>
                      </button>
                    )}

                    {onSaveToNotebook && (
                      <button
                        onClick={() => onSaveToNotebook(
                          `Câu ${q.number}: ${q.question.slice(0, 40)}...`,
                          `Câu hỏi: ${q.question}\n\nMẹo Casio fx-880: ${q.casioTip}\n\nLời giải: ${q.explanation}\n\nBản chất: ${q.firstPrincipleEssence}`,
                          ['Luyện thi THPT 2027', 'Casio fx-880']
                        )}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Bookmark size={12} />
                        <span>Lưu sổ tay</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Question body */}
                <div className="text-sm font-medium text-zinc-200 mt-3">
                  {q.question}
                </div>

                {/* Multiple choice review */}
                {q.type === 'multiple_choice' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isOptionCorrect = optIdx === q.correctIndex;
                      const isUserChoice = ans?.selectedIndex === optIdx;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border flex items-center justify-between ${
                            isOptionCorrect
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                              : isUserChoice
                              ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                              : 'bg-black/30 border-zinc-800 text-zinc-400'
                          }`}
                        >
                          <span>{opt}</span>
                          {isOptionCorrect && <Check size={14} className="text-emerald-400" />}
                          {isUserChoice && !isOptionCorrect && <X size={14} className="text-rose-400" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* True / False review */}
                {q.type === 'true_false' && q.subStatements && (
                  <div className="space-y-1.5 mt-3 text-xs">
                    {q.subStatements.map(sub => {
                      const userTF = ans?.trueFalseAnswers?.[sub.id];
                      const isSubCorrect = userTF === sub.isCorrect;
                      return (
                        <div key={sub.id} className="p-2.5 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-between gap-3">
                          <div className="text-zinc-300">
                            <strong className="text-emerald-400 mr-1.5">{sub.label})</strong>
                            {sub.text}
                          </div>
                          <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                            <span>Bạn chọn: <strong className={isSubCorrect ? 'text-emerald-400' : 'text-rose-400'}>{userTF === true ? 'Đúng' : userTF === false ? 'Sai' : 'Chưa chọn'}</strong></span>
                            <span>| Đáp án: <strong className="text-emerald-300">{sub.isCorrect ? 'Đúng' : 'Sai'}</strong></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Short Answer review */}
                {q.type === 'short_answer' && (
                  <div className="mt-3 p-3 rounded-2xl bg-black/40 border border-zinc-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-zinc-400">Đáp án bạn nhập: </span>
                      <strong className="font-mono text-white">{ans?.shortAnswerText || '(bỏ trống)'}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400">Đáp án chuẩn: </span>
                      <strong className="font-mono text-emerald-400">{q.correctAnswerNumber} {q.unit}</strong>
                    </div>
                  </div>
                )}

                {/* Casio fx-880 BTG Master Tip Box */}
                <div className="mt-4 p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1 text-xs text-emerald-300">
                  <div className="flex items-center gap-2 font-bold text-emerald-400">
                    <Calculator size={15} />
                    <span>Mẹo bấm máy Casio fx-880 BTG:</span>
                  </div>
                  <p className="font-mono text-zinc-200 leading-relaxed">
                    {q.casioTip}
                  </p>
                </div>

                {/* Explanation & First Principles */}
                <div className="mt-3 p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-300 space-y-2">
                  <div>
                    <strong className="text-zinc-200">Lời giải chi tiết: </strong>
                    <span>{q.explanation}</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-800/80 text-emerald-400/90 italic">
                    <strong>Bản chất First Principles: </strong>
                    <span>{q.firstPrincipleEssence}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
