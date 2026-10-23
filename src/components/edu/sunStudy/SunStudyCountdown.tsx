import React, { useState, useEffect } from 'react';
import { 
  Timer, 
  Calendar, 
  Flame, 
  Sparkles, 
  Plus, 
  Trash2, 
  Clock, 
  AlertTriangle, 
  Award,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { DEFAULT_EXAMS, SunExam, SunStudyState } from '../../../services/sunStudyStorageService';

interface SunStudyCountdownProps {
  state: SunStudyState;
  onUpdateState: (updater: (prev: SunStudyState) => SunStudyState) => void;
  onJumpToExamPrep?: () => void;
}

export function SunStudyCountdown({ state, onUpdateState, onJumpToExamPrep }: SunStudyCountdownProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isAddingExam, setIsAddingExam] = useState<boolean>(false);

  // New Custom Exam Form
  const [examTitle, setExamTitle] = useState<string>('');
  const [examDate, setExamDate] = useState<string>('');
  const [examSubtitle, setExamSubtitle] = useState<string>('');

  // Update clock every second for precise real-time countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const allExams: SunExam[] = [...DEFAULT_EXAMS, ...state.customExams];

  const calculateTimeDiff = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime();
    const now = currentTime.getTime();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isPast: false };
  };

  const handleAddCustomExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || !examDate) return;

    const newExam: SunExam = {
      id: `custom_exam_${Date.now()}`,
      title: examTitle.trim(),
      type: 'custom',
      targetDate: new Date(examDate).toISOString(),
      subtitle: examSubtitle.trim() || 'Kỳ thi của riêng bạn',
      quote: 'Kiên trì mỗi ngày là chìa khóa mở cánh cửa đại học!',
      isCustom: true
    };

    onUpdateState(prev => ({
      ...prev,
      customExams: [newExam, ...prev.customExams]
    }));

    setExamTitle('');
    setExamDate('');
    setExamSubtitle('');
    setIsAddingExam(false);
  };

  const handleDeleteCustomExam = (examId: string) => {
    onUpdateState(prev => ({
      ...prev,
      customExams: prev.customExams.filter(e => e.id !== examId)
    }));
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-2xl shadow-inner">
            ⏳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">Áp Lực Thời Gian & Đồng Hồ Đếm Ngược</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                <Flame size={12} className="text-orange-400 animate-pulse" />
                Thời Gian Không Chờ Đợi
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Nhìn thẳng vào áp lực thời gian để luôn tự nhắc nhở bản thân không được lười biếng.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddingExam(!isAddingExam)}
          className="px-4 py-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 shrink-0"
        >
          <Plus size={15} />
          <span>Thêm Kỳ Thi Riêng</span>
        </button>
      </div>

      {/* Add Custom Exam Form */}
      {isAddingExam && (
        <form onSubmit={handleAddCustomExam} className="p-5 rounded-3xl bg-zinc-900 border border-amber-500/40 shadow-2xl flex flex-col gap-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <span>Thêm Kỳ Thi / Bài Kiểm Tra Của Bạn</span>
            </span>
            <button
              type="button"
              onClick={() => setIsAddingExam(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Hủy
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1 block">Tên kỳ thi:</label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="VD: Thi Học Kỳ 1, Thi Thử Chuyên..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1 block">Ngày & giờ diễn ra:</label>
              <input
                type="datetime-local"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1 block">Mục tiêu / Ghi chú:</label>
              <input
                type="text"
                value={examSubtitle}
                onChange={(e) => setExamSubtitle(e.target.value)}
                placeholder="VD: Mục tiêu đạt 9.0+ điểm"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingExam(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-xs text-zinc-300 font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!examTitle.trim() || !examDate}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 text-xs font-black disabled:opacity-40"
            >
              Tạo Đồng Hồ Đếm Ngược
            </button>
          </div>
        </form>
      )}

      {/* Big Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {allExams.map((exam) => {
          const diff = calculateTimeDiff(exam.targetDate);
          const isThpt = exam.type === 'thptqg';
          const isCap3 = exam.type === 'cap3';

          return (
            <div
              key={exam.id}
              className={`p-5 sm:p-6 rounded-3xl border flex flex-col justify-between shadow-2xl relative overflow-hidden group transition-all ${
                isThpt
                  ? 'bg-gradient-to-b from-amber-950/60 via-zinc-900 to-zinc-950 border-amber-500/50 shadow-amber-950/20'
                  : isCap3
                  ? 'bg-gradient-to-b from-rose-950/50 via-zinc-900 to-zinc-950 border-rose-500/40 shadow-rose-950/20'
                  : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Header Info */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    isThpt
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : isCap3
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  }`}>
                    {isThpt ? 'Kỳ Thi Trọng Đại' : isCap3 ? 'Thi Vào Lớp 10' : 'Kỳ Thi Đánh Giá'}
                  </span>

                  {exam.isCustom && (
                    <button
                      onClick={() => handleDeleteCustomExam(exam.id)}
                      className="text-zinc-600 hover:text-rose-400 p-1 transition"
                      title="Xóa kỳ thi này"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                <h4 className="text-base font-black text-white leading-snug">
                  {exam.title}
                </h4>
                <p className="text-xs text-zinc-400 mt-1">
                  {exam.subtitle}
                </p>
              </div>

              {/* Big Digital Countdown Blocks (Days, Hours, Minutes, Seconds) */}
              <div className="my-5 grid grid-cols-4 gap-2 text-center">
                <div className="p-2 sm:p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-inner">
                  <div className="font-mono text-2xl sm:text-3xl font-black text-amber-400">
                    {diff.days}
                  </div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold mt-0.5">Ngày</div>
                </div>

                <div className="p-2 sm:p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-inner">
                  <div className="font-mono text-2xl sm:text-3xl font-black text-zinc-200">
                    {String(diff.hours).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold mt-0.5">Giờ</div>
                </div>

                <div className="p-2 sm:p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-inner">
                  <div className="font-mono text-2xl sm:text-3xl font-black text-zinc-200">
                    {String(diff.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold mt-0.5">Phút</div>
                </div>

                <div className="p-2 sm:p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-inner">
                  <div className="font-mono text-2xl sm:text-3xl font-black text-orange-400 animate-pulse">
                    {String(diff.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold mt-0.5">Giây</div>
                </div>
              </div>

              {/* Motivation Quote */}
              <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-[11px] text-zinc-300 italic mb-4">
                "{exam.quote}"
              </div>

              {/* Quick Jump Action */}
              {onJumpToExamPrep && (
                <button
                  onClick={onJumpToExamPrep}
                  className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700 group-hover:border-amber-500/40"
                >
                  <BookOpen size={13} className="text-amber-400" />
                  <span>Vào Phòng Luyện Thi Cấp Tốc →</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
