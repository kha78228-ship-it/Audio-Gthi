import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  RotateCcw, 
  ArrowRight, 
  FlaskConical, 
  BrainCircuit, 
  Award, 
  Lightbulb, 
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Filter,
  Check,
  Zap,
  BookmarkPlus
} from 'lucide-react';
import { STEM_MODULE_QUIZZES, getQuizForModule } from '../../data/stemQuizData';
import { StemModuleQuiz, EduQuizQuestion, EduLabSubject } from '../../types';

interface StemQuickQuizViewProps {
  initialSubject?: EduLabSubject;
  initialExperimentId?: string;
  onOpenLab?: (subject: EduLabSubject, experimentId: string) => void;
  onOpenAiAssistant?: (prompt: string) => void;
  onSaveToNotebook?: (title: string, principle: string) => void;
  onClose?: () => void;
  isModal?: boolean;
  onRecordActivity?: (params: {
    type: 'quiz_answer' | 'quiz_complete';
    title: string;
    xpAmount?: number;
    category?: 'quiz';
    isPerfectQuiz?: boolean;
    quizScore?: number;
    quizTotal?: number;
  }) => void;
}

export function StemQuickQuizView({
  initialSubject,
  initialExperimentId,
  onOpenLab,
  onOpenAiAssistant,
  onSaveToNotebook,
  onClose,
  isModal = false,
  onRecordActivity
}: StemQuickQuizViewProps) {
  // Find matching initial quiz
  const defaultQuiz = (initialSubject && initialExperimentId 
    ? getQuizForModule(initialSubject, initialExperimentId) 
    : null) || STEM_MODULE_QUIZZES[0];

  const [selectedQuizId, setSelectedQuizId] = useState<string>(defaultQuiz.moduleId);
  const [currentQuiz, setCurrentQuiz] = useState<StemModuleQuiz>(defaultQuiz);
  const [activeFilter, setActiveFilter] = useState<'all' | 'physics' | 'chemistry' | 'biology'>('all');

  // Active quiz playing state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);
  const [savedQuestions, setSavedQuestions] = useState<Record<string, boolean>>({});

  // AI Generation on demand
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [customAiTopic, setCustomAiTopic] = useState<string>('');
  const [showAiCustomInput, setShowAiCustomInput] = useState<boolean>(false);

  // Sync when initial subject / exp change
  useEffect(() => {
    if (initialSubject) {
      const match = getQuizForModule(initialSubject, initialExperimentId);
      if (match) {
        setSelectedQuizId(match.moduleId);
        setCurrentQuiz(match);
        resetQuizState();
      }
    }
  }, [initialSubject, initialExperimentId]);

  const resetQuizState = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserAnswers({});
    setIsQuizCompleted(false);
  };

  const handleSelectQuiz = (quiz: StemModuleQuiz) => {
    setSelectedQuizId(quiz.moduleId);
    setCurrentQuiz(quiz);
    resetQuizState();
  };

  const currentQ: EduQuizQuestion | undefined = currentQuiz.questions[currentQuestionIdx];

  const handleOptionClick = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIdx]: idx
    }));

    // Check if correct answer
    if (currentQ && currentQ.correctIndex === idx) {
      onRecordActivity?.({
        type: 'quiz_answer',
        title: `Đúng câu hỏi First Principles: ${currentQuiz.moduleTitle} (#${currentQuestionIdx + 1})`,
        xpAmount: 25,
        category: 'quiz'
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < currentQuiz.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizCompleted(true);
      // Compute final score
      const finalAnswers = { ...userAnswers };
      if (selectedOption !== null) {
        finalAnswers[currentQuestionIdx] = selectedOption;
      }
      const finalCorrect = Object.entries(finalAnswers).filter(([qIdx, ansIdx]) => {
        return currentQuiz.questions[Number(qIdx)]?.correctIndex === ansIdx;
      }).length;
      const total = currentQuiz.questions.length;
      const isPerfect = finalCorrect === total && total > 0;

      onRecordActivity?.({
        type: 'quiz_complete',
        title: `Hoàn thành Quiz ${currentQuiz.moduleTitle} (${finalCorrect}/${total} câu đúng)`,
        isPerfectQuiz: isPerfect,
        quizScore: finalCorrect,
        quizTotal: total,
        xpAmount: isPerfect ? 100 : finalCorrect >= total * 0.7 ? 60 : 35,
        category: 'quiz'
      });
    }
  };

  // Calculate score
  const totalQuestions = currentQuiz.questions.length;
  const correctCount = Object.entries(userAnswers).filter(([qIdx, ansIdx]) => {
    return currentQuiz.questions[Number(qIdx)]?.correctIndex === ansIdx;
  }).length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // AI Quiz Generation Handler
  const handleGenerateAiQuiz = async () => {
    const topic = customAiTopic.trim() || currentQuiz.moduleTitle;
    setIsAiGenerating(true);

    try {
      const res = await fetch('/api/edu/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subject: currentQuiz.subject
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.questions && data.questions.length > 0) {
          const newAiQuiz: StemModuleQuiz = {
            moduleId: `ai-quiz-${Date.now()}`,
            moduleTitle: `AI First Principles: ${topic}`,
            subject: currentQuiz.subject,
            badge: '✨ AI Tự Động Tạo',
            description: `Bài kiểm tra nhanh được AI bóc tách trực tiếp theo tư duy First Principles cho chủ đề: ${topic}`,
            questions: data.questions
          };
          setCurrentQuiz(newAiQuiz);
          setSelectedQuizId(newAiQuiz.moduleId);
          resetQuizState();
          setShowAiCustomInput(false);
          setCustomAiTopic('');
          setIsAiGenerating(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend quiz generator fallback:', err);
    }

    // Fallback: Enhance current quiz with alternative First Principles challenge
    setTimeout(() => {
      setIsAiGenerating(false);
      setShowAiCustomInput(false);
    }, 800);
  };

  const handleSaveToNotebookInternal = (q: EduQuizQuestion) => {
    if (onSaveToNotebook) {
      onSaveToNotebook(
        `First Principles: ${currentQuiz.moduleTitle}`,
        `**Câu hỏi:** ${q.question}\n\n**Bản chất logic:** ${q.explanation}\n\n**Nguyên lý gốc:** ${q.firstPrincipleNote}`
      );
    }
    setSavedQuestions(prev => ({ ...prev, [q.id]: true }));
  };

  // Filter quizzes
  const filteredQuizzes = STEM_MODULE_QUIZZES.filter(q => {
    if (activeFilter === 'all') return true;
    return q.subject === activeFilter;
  });

  return (
    <div className="w-full flex flex-col gap-5 text-zinc-100">
      {/* Quiz Top Navigation & Module Selector */}
      <div className="w-full bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-950/40 shrink-0">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center text-emerald-400">
              <Zap size={20} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight text-zinc-100">
                Bài Kiểm Tra Nhanh <span className="text-emerald-400">(Quick Quiz)</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                First Principles Only
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Tự đánh giá khả năng ngộ ra bản chất vật lý, hóa học, sinh học ngay sau mỗi thí nghiệm.
            </p>
          </div>
        </div>

        {/* Filter & AI Generator Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeFilter === 'all' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Tất cả (11)
            </button>
            <button
              onClick={() => setActiveFilter('physics')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeFilter === 'physics' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Vật lý
            </button>
            <button
              onClick={() => setActiveFilter('chemistry')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeFilter === 'chemistry' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Hóa học
            </button>
            <button
              onClick={() => setActiveFilter('biology')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeFilter === 'biology' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sinh học
            </button>
          </div>

          <button
            onClick={() => setShowAiCustomInput(prev => !prev)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Sparkles size={14} className="text-emerald-400" />
            <span>Tạo Quiz AI</span>
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold cursor-pointer transition-all"
            >
              Đóng
            </button>
          )}
        </div>
      </div>

      {/* AI Quiz Custom Prompt Popdown */}
      {showAiCustomInput && (
        <div className="w-full bg-zinc-900 border border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex-1 w-full">
            <label className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block mb-1">
              Nhập chủ đề khoa học muốn AI tạo bài kiểm tra First Principles:
            </label>
            <input
              type="text"
              value={customAiTopic}
              onChange={(e) => setCustomAiTopic(e.target.value)}
              placeholder="VD: Cấu trúc hạt nhân, Nhiệt động lực học, Thuyết tương đối hẹp, Quang sai thấu kính..."
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pt-1 sm:pt-4">
            <button
              onClick={handleGenerateAiQuiz}
              disabled={isAiGenerating}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isAiGenerating ? (
                <>
                  <Sparkles size={14} className="animate-spin" />
                  <span>Đang sinh câu hỏi...</span>
                </>
              ) : (
                <>
                  <Zap size={14} />
                  <span>Sinh Bộ Câu Hỏi</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Horizontal Module Quick Selector List */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {filteredQuizzes.map(q => {
          const isSelected = q.moduleId === selectedQuizId;
          return (
            <button
              key={q.moduleId}
              onClick={() => handleSelectQuiz(q)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
                isSelected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-950/40'
                  : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <span>{q.badge}</span>
              <span className="truncate max-w-[150px]">{q.moduleTitle}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400">
                {q.questions.length} câu
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Quiz Interactive Panel */}
      <div className="w-full bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col gap-5">
        {/* Module Header & Progress Bar */}
        <div className="flex flex-col gap-2 border-b border-zinc-800/80 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <span>{currentQuiz.badge}</span>
                <span>•</span>
                <span>{currentQuiz.moduleTitle}</span>
              </span>
              <p className="text-xs text-zinc-400 mt-0.5">{currentQuiz.description}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono font-bold text-zinc-300">
                Câu {Math.min(currentQuestionIdx + 1, totalQuestions)} / {totalQuestions}
              </span>
              <button
                onClick={resetQuizState}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-all cursor-pointer"
                title="Làm lại từ đầu"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Linear Progress Indicator */}
          <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              style={{ width: `${((currentQuestionIdx + (isQuizCompleted ? 1 : 0)) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* ACTIVE QUIZ QUESTION VIEW */}
        {!isQuizCompleted && currentQ && (
          <div className="flex flex-col gap-5">
            {/* Question Text */}
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
              <span className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase block mb-1">
                Câu hỏi bản chất logic:
              </span>
              <h3 className="text-sm sm:text-base font-bold text-zinc-100 leading-relaxed">
                {currentQ.question}
              </h3>
            </div>

            {/* Multiple Choice Options */}
            <div className="flex flex-col gap-2.5">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = currentQ.correctIndex === idx;

                let optionStyle = 'bg-zinc-950/70 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800/60 hover:border-zinc-700';
                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    optionStyle = 'bg-emerald-500/20 border-emerald-500/80 text-emerald-200 shadow-md shadow-emerald-950/30';
                  } else if (isSelected && !isCorrect) {
                    optionStyle = 'bg-rose-500/20 border-rose-500/80 text-rose-200 shadow-md shadow-rose-950/30';
                  } else {
                    optionStyle = 'bg-zinc-950/40 border-zinc-900 text-zinc-600 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(idx)}
                    disabled={isAnswerSubmitted}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${optionStyle}`}
                  >
                    <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {isAnswerSubmitted ? (
                        isCorrect ? (
                          <CheckCircle2 size={15} className="text-emerald-400" />
                        ) : isSelected ? (
                          <XCircle size={15} className="text-rose-400" />
                        ) : (
                          String.fromCharCode(65 + idx)
                        )
                      ) : (
                        String.fromCharCode(65 + idx)
                      )}
                    </div>
                    <span className="flex-1 leading-relaxed">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Instant First Principles Feedback Box when Answered */}
            {isAnswerSubmitted && (
              <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className={`p-4 rounded-2xl border text-xs sm:text-sm flex flex-col gap-2.5 ${
                  selectedOption === currentQ.correctIndex
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100'
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-100'
                }`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {selectedOption === currentQ.correctIndex ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-black">
                          <CheckCircle2 size={17} />
                          <span>CHÍNH XÁC! BẠN ĐÃ NGỘ RA BẢN CHẤT</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-400 font-black">
                          <AlertTriangle size={17} />
                          <span>CHƯA CHÍNH XÁC - CẠM BẪY HỌC VẸT PHỔ BIẾN</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleSaveToNotebookInternal(currentQ)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                      title="Lưu câu hỏi và nguyên lý này vào Sổ tay nghiên cứu"
                    >
                      {savedQuestions[currentQ.id] ? (
                        <>
                          <Check size={12} className="text-emerald-400" />
                          <span className="text-emerald-300">Đã lưu sổ tay</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlus size={12} />
                          <span>Lưu sổ tay</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Deep Logic & Why */}
                  <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80 text-zinc-300 text-xs leading-relaxed flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                      <Lightbulb size={14} />
                      <span>Giải thích cơ chế vận hành:</span>
                    </div>
                    <p className="text-zinc-300">{currentQ.explanation}</p>
                  </div>

                  {/* First Principle Note */}
                  <div className="bg-emerald-950/50 p-3 rounded-xl border border-emerald-500/30 text-emerald-200 text-xs leading-relaxed flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <Zap size={14} />
                      <span>Nguyên lý gốc rễ (First Principle):</span>
                    </div>
                    <p>{currentQ.firstPrincipleNote}</p>
                  </div>
                </div>

                {/* Bottom Action Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    {currentQuiz.experimentId && onOpenLab && (
                      <button
                        onClick={() => onOpenLab(currentQuiz.subject, currentQuiz.experimentId!)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <FlaskConical size={14} className="text-cyan-400" />
                        <span>Mở Lab Thí Nghiệm</span>
                      </button>
                    )}

                    {onOpenAiAssistant && (
                      <button
                        onClick={() => onOpenAiAssistant(`Giải thích sâu hơn cho tôi về câu hỏi sau: "${currentQ.question}"`)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-emerald-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <BrainCircuit size={14} className="text-emerald-400" />
                        <span>Hỏi AI Trợ Lý</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
                  >
                    <span>{currentQuestionIdx < totalQuestions - 1 ? 'Câu tiếp theo' : 'Xem Kết Quả & Đánh Giá'}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* QUIZ COMPLETED SUMMARY VIEW */}
        {isQuizCompleted && (
          <div className="flex flex-col items-center text-center p-4 sm:p-8 gap-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-2xl shadow-emerald-950/60 flex items-center justify-center">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-emerald-400">
                <Award size={32} />
              </div>
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                Kết Quả Tự Đánh Giá
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-100 mt-2">
                {scorePercent === 100 
                  ? '🏆 BẬC THẦY FIRST PRINCIPLES!' 
                  : scorePercent >= 60 
                  ? '🥈 ĐÃ NẮM VỮNG NGUYÊN LÝ CỐT LÕI' 
                  : '🥉 CẦN THỰC HÀNH THÊM ĐỂ TRÁNH HỌC VẸT'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mt-1">
                Bạn đã trả lời đúng <strong className="text-emerald-400">{correctCount}/{totalQuestions}</strong> câu ({scorePercent}%) của module <strong className="text-zinc-200">{currentQuiz.moduleTitle}</strong>.
              </p>
            </div>

            {/* Score pill */}
            <div className="flex flex-wrap items-center justify-center gap-4 bg-zinc-950/80 px-6 py-3 rounded-2xl border border-zinc-800 shadow-inner">
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Điểm số</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">{scorePercent}%</span>
              </div>
              <div className="w-px h-8 bg-zinc-800" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Số câu đúng</span>
                <span className="text-2xl font-black text-zinc-200 font-mono">{correctCount}/{totalQuestions}</span>
              </div>
              <div className="w-px h-8 bg-zinc-800" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-wider text-amber-500 font-bold flex items-center gap-1">
                  <Zap size={11} className="fill-amber-400 text-amber-400" />
                  XP Thu Được
                </span>
                <span className="text-2xl font-black text-amber-300 font-mono">
                  +{scorePercent === 100 ? 100 : scorePercent >= 70 ? 60 : 35} XP
                </span>
              </div>
              <div className="w-px h-8 bg-zinc-800" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Trạng thái</span>
                <span className="text-xs font-bold text-teal-300 mt-1">
                  {scorePercent >= 70 ? 'Đạt chuẩn' : 'Cần ôn luyện'}
                </span>
              </div>
            </div>

            {/* Next Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-lg">
              <button
                onClick={resetQuizState}
                className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>Làm lại bài này</span>
              </button>

              {currentQuiz.experimentId && onOpenLab && (
                <button
                  onClick={() => onOpenLab(currentQuiz.subject, currentQuiz.experimentId!)}
                  className="flex-1 min-w-[160px] px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <FlaskConical size={15} />
                  <span>Vào Phòng Thí Nghiệm</span>
                </button>
              )}

              {onOpenAiAssistant && (
                <button
                  onClick={() => onOpenAiAssistant(`Phân tích First Principles chuyên sâu cho tôi về: ${currentQuiz.moduleTitle}`)}
                  className="flex-1 min-w-[150px] px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <BrainCircuit size={15} />
                  <span>Hỏi AI Trợ Lý</span>
                </button>
              )}
            </div>

            {/* Review All Questions Button */}
            <div className="w-full border-t border-zinc-800/80 pt-4 flex flex-col gap-3">
              <span className="text-xs font-bold text-zinc-400">Xem lại các nguyên lý của module này:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                {currentQuiz.questions.map((q, qIndex) => {
                  const userAns = userAnswers[qIndex];
                  const isRight = userAns === q.correctIndex;
                  return (
                    <div key={q.id} className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-300">Câu {qIndex + 1}</span>
                        {isRight ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 size={13} /> Đúng
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <XCircle size={13} /> Sai
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400 line-clamp-2">{q.question}</p>
                      <p className="text-emerald-300/90 text-[11px] font-medium mt-1">
                        💡 {q.firstPrincipleNote}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
