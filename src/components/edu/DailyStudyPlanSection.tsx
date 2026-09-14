import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Volume2,
  VolumeX,
  BookOpen,
  FlaskConical,
  BrainCircuit,
  Zap,
  Sparkles,
  HardDrive,
  BookmarkCheck,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Clock,
  RotateCw,
  AlertCircle,
  HelpCircle,
  Atom,
  TestTube,
  Dna,
  Share2
} from 'lucide-react';
import {
  EduDailyPlanItem,
  EduLabSubject,
  EduNotebookNote,
  EduQuizQuestion
} from '../../types';

interface DailyStudyPlanSectionProps {
  dailyPlan: EduDailyPlanItem[];
  totalDays?: number;
  fileName: string;
  subject: string;
  onOpenLabExperiment?: (subject: EduLabSubject, experimentId: string) => void;
  onOpenAiAssistant?: (prompt: string) => void;
  onInitiateDriveExport?: () => void;
  onRegenerateDailyPlan?: (days: number) => void;
  isRegenerating?: boolean;
}

export function DailyStudyPlanSection({
  dailyPlan,
  totalDays = 5,
  fileName,
  subject,
  onOpenLabExperiment,
  onOpenAiAssistant,
  onInitiateDriveExport,
  onRegenerateDailyPlan,
  isRegenerating = false
}: DailyStudyPlanSectionProps) {
  // Local persistence for day completion
  const [completedDays, setCompletedDays] = useState<Record<number, boolean>>(() => {
    try {
      const stored = localStorage.getItem(`haevy_edu_daily_completed_${fileName}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // User checked action items per day
  const [checkedActionItems, setCheckedActionItems] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(`haevy_edu_action_items_${fileName}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // User self-reflection answers per day
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<number, string>>(() => {
    try {
      const stored = localStorage.getItem(`haevy_edu_reflections_${fileName}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Active day filter ('all' or specific day number)
  const [activeDayFilter, setActiveDayFilter] = useState<number | 'all'>('all');

  // Text to speech narration state
  const [speakingDayNumber, setSpeakingDayNumber] = useState<number | null>(null);

  // Daily quiz user responses: key = `${dayNumber}-${questionId}`
  const [dailyQuizAnswers, setDailyQuizAnswers] = useState<Record<string, number>>({});

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom days selector state for regeneration
  const [customDaysCount, setCustomDaysCount] = useState<number>(totalDays || dailyPlan.length || 5);

  // Sync completed days to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`haevy_edu_daily_completed_${fileName}`, JSON.stringify(completedDays));
    } catch {
      // ignore
    }
  }, [completedDays, fileName]);

  // Sync action items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`haevy_edu_action_items_${fileName}`, JSON.stringify(checkedActionItems));
    } catch {
      // ignore
    }
  }, [checkedActionItems, fileName]);

  // Sync reflections to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`haevy_edu_reflections_${fileName}`, JSON.stringify(reflectionAnswers));
    } catch {
      // ignore
    }
  }, [reflectionAnswers, fileName]);

  // Stop speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleDayCompletion = (dayNum: number) => {
    setCompletedDays(prev => {
      const updated = { ...prev, [dayNum]: !prev[dayNum] };
      return updated;
    });
  };

  const toggleActionItem = (dayNum: number, itemIdx: number) => {
    const key = `${dayNum}-${itemIdx}`;
    setCheckedActionItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSpeechToggle = (dayNum: number, textToRead: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('Trình duyệt hiện tại chưa hỗ trợ đọc giọng nói');
      return;
    }

    if (speakingDayNumber === dayNum) {
      window.speechSynthesis.cancel();
      setSpeakingDayNumber(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'vi-VN';
      utterance.rate = 1.0;
      utterance.onend = () => setSpeakingDayNumber(null);
      utterance.onerror = () => setSpeakingDayNumber(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingDayNumber(dayNum);
      showToast(`Đang đọc to tóm tắt Ngày ${dayNum}...`);
    }
  };

  const handleSaveToNotebook = (item: EduDailyPlanItem) => {
    try {
      const stored = localStorage.getItem('haevy_edu_notebook_notes');
      const notes: EduNotebookNote[] = stored ? JSON.parse(stored) : [];

      const cleanSubj = subject.toLowerCase().includes('hóa')
        ? 'chemistry'
        : subject.toLowerCase().includes('sinh')
        ? 'biology'
        : 'physics';

      const newNote: EduNotebookNote = {
        id: `note-daily-${item.dayNumber}-${Date.now()}`,
        title: `[Lịch Học Ngày ${item.dayNumber}] ${item.title}`,
        subject: cleanSubj as any,
        tags: ['Kế Hoạch Từng Ngày', `Ngày ${item.dayNumber}`, 'STEM First Principles'],
        firstPrincipleEssence: item.corePrinciples?.[0] || 'Nguyên lý bản chất không thể bẻ gãy.',
        content: `[TỔNG HỢP LỘ TRÌNH VÀ TÀI LIỆU HỌC TẬP - NGÀY ${item.dayNumber}]
Tệp gốc: ${fileName}
Thời lượng dự kiến: ~${item.timeEstimateMinutes || 45} phút

📌 TÓM TẮT TÀI LIỆU TRONG NGÀY:
${item.documentSummary}

💡 NGUYÊN LÝ CỐT LÕI (FIRST PRINCIPLES):
${(item.corePrinciples || []).map(cp => `• ${cp}`).join('\n')}

⚡ NHIỆM VỤ THỰC HÀNH:
${(item.actionItems || []).map(act => `[ ] ${act}`).join('\n')}

💭 CÂU HỎI TỰ VẤN BẢN CHẤT:
${item.selfReflectionPrompt || 'Hiện tượng này diễn ra dựa trên định luật bảo toàn nào?'}

Suy ngẫm của học viên:
${reflectionAnswers[item.dayNumber] || '(Chưa ghi chú câu trả lời)'}`,
        source: 'roadmap',
        createdAt: new Date().toISOString()
      };

      notes.unshift(newNote);
      localStorage.setItem('haevy_edu_notebook_notes', JSON.stringify(notes));
      showToast(`Đã lưu tóm tắt Ngày ${item.dayNumber} vào Sổ Tay Nghiên Cứu!`);
    } catch (err) {
      console.warn('Failed to save daily note:', err);
      showToast('Lỗi khi lưu vào sổ tay.');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSelectDailyQuizOption = (dayNum: number, questionId: string, optionIdx: number) => {
    const key = `${dayNum}-${questionId}`;
    setDailyQuizAnswers(prev => ({
      ...prev,
      [key]: optionIdx
    }));
  };

  // Metrics
  const totalDaysCount = dailyPlan.length;
  const completedCount = Object.keys(completedDays).filter(
    k => completedDays[Number(k)] && dailyPlan.some(d => d.dayNumber === Number(k))
  ).length;
  const progressPercent = totalDaysCount > 0 ? Math.round((completedCount / totalDaysCount) * 100) : 0;

  // Filtered days
  const displayedDays = activeDayFilter === 'all'
    ? dailyPlan
    : dailyPlan.filter(d => d.dayNumber === activeDayFilter);

  const getSubjectIcon = () => {
    if (subject.toLowerCase().includes('hóa')) return <TestTube size={15} className="text-amber-400" />;
    if (subject.toLowerCase().includes('sinh')) return <Dna size={15} className="text-emerald-400" />;
    return <Atom size={15} className="text-cyan-400" />;
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-zinc-900 border border-emerald-500/50 text-emerald-200 text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Control & Progress Header */}
      <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1.5">
                <Calendar size={12} />
                Lộ Trình Từng Ngày (Daily Study Guide)
              </span>
              <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
                {getSubjectIcon()}
                <span>{subject}</span>
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-zinc-100">
              Kế Hoạch & Tóm Tắt Tài Liệu Từng Ngày - Tránh Học Vẹt
            </h3>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              AI chia nhỏ giáo trình thành từng lát cắt bài học mỗi ngày, trích xuất bản chất logic, 
              gắn bài tập phòng lab ảo và câu hỏi tự vấn để học hiểu cội nguồn.
            </p>
          </div>

          {/* Quick Stats & Primary Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Completion stats */}
            <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Tiến độ hoàn thành</span>
                <span className="text-sm font-mono font-bold text-emerald-400">
                  {completedCount} / {totalDaysCount} Ngày ({progressPercent}%)
                </span>
              </div>
              <div className="w-16 bg-zinc-800 h-2 rounded-full overflow-hidden shrink-0">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Google Drive Export Button */}
            {onInitiateDriveExport && (
              <button
                onClick={onInitiateDriveExport}
                className="px-3.5 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                title="Tóm gọn và xuất toàn bộ lịch học từng ngày lên Google Drive"
              >
                <HardDrive size={14} className="text-blue-400" />
                <span>Lưu Lịch Lên Google Drive</span>
              </button>
            )}
          </div>
        </div>

        {/* AI Custom Days Re-generation Toolbar */}
        <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="text-zinc-400 font-medium">Tùy chọn thời lượng học:</span>
            <div className="flex items-center gap-1.5">
              {[3, 5, 7, 14].map(days => (
                <button
                  key={days}
                  onClick={() => {
                    setCustomDaysCount(days);
                    onRegenerateDailyPlan?.(days);
                  }}
                  disabled={isRegenerating}
                  className={`px-2.5 py-1 rounded-lg border font-mono font-semibold transition-all ${
                    customDaysCount === days
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {days} Ngày
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isRegenerating ? (
              <div className="text-emerald-400 flex items-center gap-1.5 font-medium animate-pulse">
                <RotateCw size={13} className="animate-spin" />
                <span>Gemini AI đang phân bổ lại lát cắt tài liệu...</span>
              </div>
            ) : (
              <button
                onClick={() => onRegenerateDailyPlan?.(customDaysCount)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Sparkles size={13} className="text-emerald-400" />
                <span>Tái Tạo Lịch Bằng AI</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Day Filter Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-zinc-900">
          <button
            onClick={() => setActiveDayFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeDayFilter === 'all'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Tất Cả ({dailyPlan.length} Ngày)
          </button>
          {dailyPlan.map(d => {
            const isDone = completedDays[d.dayNumber];
            return (
              <button
                key={d.dayNumber}
                onClick={() => setActiveDayFilter(d.dayNumber)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeDayFilter === d.dayNumber
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : isDone
                    ? 'bg-zinc-900/80 text-emerald-400/80 border border-emerald-950'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 size={12} className="text-emerald-400" />
                ) : (
                  <Circle size={10} className="text-zinc-600" />
                )}
                <span>Ngày {d.dayNumber}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Cards List */}
      <div className="flex flex-col gap-5">
        {displayedDays.map(item => {
          const isDone = completedDays[item.dayNumber];
          const isSpeaking = speakingDayNumber === item.dayNumber;

          return (
            <div
              key={item.id || item.dayNumber}
              className={`p-5 sm:p-6 rounded-2xl border transition-all flex flex-col gap-4 shadow-xl ${
                isDone
                  ? 'bg-zinc-950/70 border-emerald-950/60 ring-1 ring-emerald-900/30'
                  : 'bg-zinc-900/70 border-zinc-800/90 hover:border-zinc-700'
              }`}
            >
              {/* Day Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-zinc-800/80 pb-4">
                <div className="flex items-start gap-3">
                  {/* Completion toggle checkbox */}
                  <button
                    onClick={() => toggleDayCompletion(item.dayNumber)}
                    className="mt-1 text-zinc-500 hover:text-emerald-400 transition-all cursor-pointer"
                    title={isDone ? 'Đánh dấu chưa hoàn thành ngày này' : 'Đánh dấu đã hoàn thành ngày này'}
                  >
                    {isDone ? (
                      <CheckCircle2 size={22} className="text-emerald-400" />
                    ) : (
                      <Circle size={22} />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono">
                        NGÀY {item.dayNumber}
                      </span>
                      <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                        <Clock size={12} />
                        ~{item.timeEstimateMinutes || 45} phút
                      </span>
                      {isDone && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 text-[11px] font-semibold border border-emerald-800/50">
                          ✓ Đã hoàn thành
                        </span>
                      )}
                    </div>
                    <h4 className={`text-base sm:text-lg font-bold ${isDone ? 'line-through text-zinc-400' : 'text-zinc-100'}`}>
                      {item.title}
                    </h4>
                  </div>
                </div>

                {/* Day Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-start">
                  {/* Speech synthesis button */}
                  <button
                    onClick={() => handleSpeechToggle(item.dayNumber, `${item.title}. Tóm tắt tài liệu: ${item.documentSummary}`)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                      isSpeaking
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse'
                        : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                    }`}
                    title="Đọc to tóm tắt bài học ngày hôm nay bằng giọng nói tiếng Việt"
                  >
                    {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                    <span>{isSpeaking ? 'Dừng đọc' : 'Nghe tóm tắt'}</span>
                  </button>

                  {/* Save to Notebook */}
                  <button
                    onClick={() => handleSaveToNotebook(item)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Lưu tóm tắt ngày này vào Sổ tay nghiên cứu để tra cứu lâu dài"
                  >
                    <BookmarkCheck size={13} className="text-amber-400" />
                    <span>Lưu Sổ Tay</span>
                  </button>

                  {/* Ask AI Assistant */}
                  {onOpenAiAssistant && (
                    <button
                      onClick={() => onOpenAiAssistant(`Tôi đang học Lịch học Ngày ${item.dayNumber}: "${item.title}". Tóm tắt tài liệu: "${item.documentSummary}". Hãy giải thích sâu hơn về bản chất và tại sao lại như vậy theo tư duy First Principles?`)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <MessageSquare size={13} />
                      <span>Hỏi AI</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 1. DOCUMENT SUMMARY (TÓM TẮT TÀI LIỆU TRONG NGÀY) */}
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col gap-2 shadow-inner">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <BookOpen size={14} />
                  <span>Tóm Tắt Tinh Gọn Phần Tài Liệu Ngày {item.dayNumber}</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal">
                  {item.documentSummary}
                </p>
              </div>

              {/* 2. CORE PRINCIPLES (NGUYÊN LÝ CỐT LÕI FIRST PRINCIPLES) */}
              {item.corePrinciples && item.corePrinciples.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                    <BrainCircuit size={14} />
                    <span>Nguyên Lý Bất Biến Ngày Hôm Nay (First Principles)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-100/90">
                    {item.corePrinciples.map((cp, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-amber-950/30 p-2 rounded-lg border border-amber-800/30">
                        <span className="text-amber-400 font-bold shrink-0">✦</span>
                        <span>{cp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. ACTION ITEMS CHECKLIST (NHIỆM VỤ HỌC TẬP HÔM NAY) */}
              {item.actionItems && item.actionItems.length > 0 && (
                <div className="p-4 rounded-xl bg-zinc-950/90 border border-zinc-800/80 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckSquare size={14} className="text-teal-400" />
                      <span>Nhiệm Vụ Học Tập Thực Chiến:</span>
                    </span>
                    <span className="text-[11px] text-zinc-500">Bấm để đánh dấu việc đã làm</span>
                  </div>

                  <div className="space-y-1.5">
                    {item.actionItems.map((action, actIdx) => {
                      const itemKey = `${item.dayNumber}-${actIdx}`;
                      const isChecked = checkedActionItems[itemKey];

                      return (
                        <div
                          key={actIdx}
                          onClick={() => toggleActionItem(item.dayNumber, actIdx)}
                          className={`p-2.5 rounded-lg border text-xs flex items-center gap-2.5 cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200 line-through'
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare size={16} className="text-emerald-400 shrink-0" />
                          ) : (
                            <Square size={16} className="text-zinc-500 shrink-0" />
                          )}
                          <span className="select-none leading-relaxed">{action}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. VIRTUAL LAB SIMULATION (PHÒNG THÍ NGHIỆM ẢO) */}
              {item.practiceLab && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/30 via-zinc-950 to-zinc-950 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold font-mono">
                        PHÒNG LAB ẢO
                      </span>
                      <span className="text-xs font-bold text-cyan-200">
                        {item.practiceLab.experimentName}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      <strong>Nhiệm vụ:</strong> {item.practiceLab.mission || 'Thực hành tương tác trực tiếp để kiểm chứng định luật'}
                    </p>
                  </div>

                  {onOpenLabExperiment && (
                    <button
                      onClick={() => onOpenLabExperiment(item.practiceLab!.subject, item.practiceLab!.experimentId)}
                      className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-sm self-start sm:self-center"
                    >
                      <FlaskConical size={14} />
                      <span>Vào Phòng Lab Ngay 🔬</span>
                    </button>
                  )}
                </div>
              )}

              {/* 5. DAILY QUICK QUIZ (BÀI KIỂM TRA NHANH TRONG NGÀY) */}
              {item.quickQuiz && item.quickQuiz.length > 0 && (
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <Zap size={14} />
                    <span>Bài Kiểm Tra Đánh Giá Nhanh Ngày {item.dayNumber}</span>
                  </div>

                  <div className="space-y-4">
                    {item.quickQuiz.map((q, qIdx) => {
                      const quizKey = `${item.dayNumber}-${q.id}`;
                      const selectedOpt = dailyQuizAnswers[quizKey];
                      const hasAnswered = selectedOpt !== undefined;
                      const isCorrect = selectedOpt === q.correctIndex;

                      return (
                        <div key={q.id} className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-2.5">
                          <p className="text-xs sm:text-sm font-semibold text-zinc-200">
                            Câu {qIdx + 1}: {q.question}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, optIdx) => {
                              const isOptSelected = selectedOpt === optIdx;
                              const isOptCorrect = q.correctIndex === optIdx;

                              let btnColor = 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800';
                              if (hasAnswered) {
                                if (isOptCorrect) {
                                  btnColor = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                                } else if (isOptSelected && !isCorrect) {
                                  btnColor = 'bg-rose-950/60 border-rose-500 text-rose-200';
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleSelectDailyQuizOption(item.dayNumber, q.id, optIdx)}
                                  className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${btnColor}`}
                                >
                                  <span>{opt}</span>
                                  {hasAnswered && isOptCorrect && (
                                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 ml-1.5" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {hasAnswered && (
                            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs space-y-1 animate-fadeIn">
                              <div className={`font-bold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isCorrect ? '✓ Chính xác tuyệt đối!' : '✗ Chưa chính xác. Xem bản chất bên dưới:'}
                              </div>
                              <p className="text-zinc-300">{q.explanation}</p>
                              {q.firstPrincipleNote && (
                                <div className="text-[11px] text-zinc-500 font-mono pt-1">
                                  Bản chất: {q.firstPrincipleNote}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 6. SELF-REFLECTION PROMPT (CÂU HỎI TỰ VẤN TƯ DUY PHẢN BIỆN) */}
              {item.selfReflectionPrompt && (
                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
                    <HelpCircle size={14} />
                    <span>Câu Hỏi Tự Vấn Tư Duy Phản Biện (Self-Reflection)</span>
                  </div>
                  <p className="text-xs text-purple-200 italic font-medium leading-relaxed">
                    "{item.selfReflectionPrompt}"
                  </p>

                  <div className="pt-1">
                    <textarea
                      value={reflectionAnswers[item.dayNumber] || ''}
                      onChange={e => setReflectionAnswers({ ...reflectionAnswers, [item.dayNumber]: e.target.value })}
                      placeholder="Ghi lại suy ngẫm hoặc câu trả lời của bạn theo góc nhìn nguyên lý gốc rễ..."
                      className="w-full p-2.5 rounded-lg bg-zinc-950/80 border border-purple-900/40 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none h-16"
                    />
                    <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500">
                      <span>Tự động lưu vào bộ nhớ học tập của thiết bị</span>
                      {reflectionAnswers[item.dayNumber] && (
                        <span className="text-emerald-400">✓ Đã lưu</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
