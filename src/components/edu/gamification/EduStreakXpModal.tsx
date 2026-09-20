import React, { useState } from 'react';
import { 
  Flame, 
  Zap, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  FlaskConical, 
  BrainCircuit, 
  Calendar, 
  Clock, 
  X, 
  ChevronRight, 
  ArrowRight,
  TrendingUp,
  Target,
  ShieldCheck,
  Check
} from 'lucide-react';
import { EduStudentProfile } from '../../../types';
import { EDU_LEVELS, getLocalDateString } from '../../../hooks/useEduGamification';

interface EduStreakXpModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: EduStudentProfile;
  onJumpToLabs: () => void;
  onJumpToQuiz: () => void;
}

export function EduStreakXpModal({
  isOpen,
  onClose,
  profile,
  onJumpToLabs,
  onJumpToQuiz
}: EduStreakXpModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'history'>('overview');

  if (!isOpen) return null;

  const currentLevelRange = profile.nextLevelXp - profile.prevLevelXp;
  const currentXpIntoLevel = profile.totalXp - profile.prevLevelXp;
  const progressPercent = currentLevelRange > 0 
    ? Math.min(100, Math.max(0, Math.round((currentXpIntoLevel / currentLevelRange) * 100)))
    : 100;
  const xpNeeded = Math.max(0, profile.nextLevelXp - profile.totalXp);

  // Generate 7-day rolling calendar
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday
  // Days of week labels in Vietnamese
  const weekDays = [
    { label: 'T2', offset: 1 },
    { label: 'T3', offset: 2 },
    { label: 'T4', offset: 3 },
    { label: 'T5', offset: 4 },
    { label: 'T6', offset: 5 },
    { label: 'T7', offset: 6 },
    { label: 'CN', offset: 0 }
  ];

  // Calculate dates for current week
  const currentMonday = new Date(today);
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
  currentMonday.setDate(today.getDate() + diffToMonday);

  const weekCalendar = weekDays.map((wd, index) => {
    const d = new Date(currentMonday);
    d.setDate(currentMonday.getDate() + index);
    const dateStr = getLocalDateString(d);
    const isToday = dateStr === profile.todayDate;
    const isCompleted = profile.historyDates.includes(dateStr);
    const isPast = d < today && !isToday;

    return {
      dayName: wd.label,
      dateNum: d.getDate(),
      dateStr,
      isToday,
      isCompleted,
      isPast
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER BANNER */}
        <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/40 p-5 sm:p-6 border-b border-zinc-800/80">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 p-0.5 shadow-lg shadow-orange-950/40 shrink-0">
                <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-orange-400">
                  <Flame size={26} className="fill-orange-500/20" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-zinc-100 tracking-tight">
                    Chuỗi Ngày & Điểm Kinh Nghiệm (XP)
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                    STEM Gamification
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Động lực học tập bền bỉ, tích lũy tri thức thông qua thực nghiệm và tư duy phản biện
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Đóng"
            >
              <X size={18} />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 border-t border-zinc-800/60 pt-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <TrendingUp size={14} />
              <span>Tổng Quan & Chuỗi</span>
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'badges'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Award size={14} />
              <span>Huy Hiệu ({profile.badges.filter(b => b.unlocked).length}/{profile.badges.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Clock size={14} />
              <span>Lịch Sử Hoạt Động</span>
            </button>
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {/* STREAK & LEVEL HERO CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. STREAK CARD */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-950/30 border border-orange-500/30 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1">
                      <Flame size={14} className="fill-orange-500/40 text-orange-400" />
                      Chuỗi Học Tập
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-mono font-bold">
                      {profile.streakDays >= 3 ? 'Đang Cháy Rực 🔥' : 'Khởi Động ✨'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-3xl sm:text-4xl font-black text-zinc-100 font-mono">
                      {profile.streakDays}
                    </span>
                    <span className="text-sm font-semibold text-zinc-400">
                      ngày liên tiếp
                    </span>
                  </div>

                  {/* 7-Day Calendar Dots */}
                  <div className="mt-4 pt-3 border-t border-zinc-800/80">
                    <div className="text-[11px] text-zinc-400 mb-2 flex items-center justify-between">
                      <span>Tuần Này:</span>
                      <span className="text-zinc-500 font-mono text-[10px]">
                        {profile.historyDates.length} ngày đã học
                      </span>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5 text-center">
                      {weekCalendar.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-bold text-zinc-500">
                            {item.dayName}
                          </span>
                          <div 
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-mono font-bold transition-all ${
                              item.isCompleted
                                ? 'bg-gradient-to-tr from-orange-500 to-amber-400 text-zinc-950 shadow-md shadow-orange-950/50'
                                : item.isToday
                                ? 'bg-zinc-800 border-2 border-orange-500 text-orange-300 animate-pulse'
                                : 'bg-zinc-900 border border-zinc-800 text-zinc-600'
                            }`}
                            title={`${item.dateStr}: ${item.isCompleted ? 'Đã học' : 'Chưa ghi nhận'}`}
                          >
                            {item.isCompleted ? (
                              <Check size={14} strokeWidth={3} />
                            ) : (
                              item.dateNum
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. LEVEL & XP CARD */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/30 border border-emerald-500/30 relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <Zap size={14} className="fill-emerald-500/30 text-emerald-400" />
                        Cấp Độ Tri Thức
                      </span>
                      <span className="text-xs font-bold text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                        {profile.levelBadgeIcon} Level {profile.level}
                      </span>
                    </div>

                    <div className="mt-2">
                      <h3 className="text-base sm:text-lg font-black text-zinc-100">
                        {profile.levelTitle}
                      </h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {EDU_LEVELS.find(l => l.level === profile.level)?.desc || 'Tư duy logic bản chất'}
                      </p>
                    </div>

                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                        {profile.totalXp.toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-zinc-400">
                        XP tích lũy
                      </span>
                    </div>
                  </div>

                  {/* Progress to next level */}
                  <div className="mt-3 pt-3 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                      <span className="text-zinc-400">Tiến độ thăng hạng Lv.{profile.level + 1}:</span>
                      <span className="text-emerald-400 font-mono">
                        {progressPercent}% (còn {xpNeeded} XP)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700/50">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* TODAY'S GOAL PROGRESS */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0">
                    <Target size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-100 flex items-center gap-2">
                      Mục Tiêu Học Tập Hôm Nay
                      {profile.todayXp >= profile.dailyGoalXp && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                          ✓ Đã Đạt
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Thu hoạch <span className="text-emerald-400 font-bold font-mono">{profile.todayXp}</span> / {profile.dailyGoalXp} XP mục tiêu ngày
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onJumpToLabs();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <FlaskConical size={14} />
                    <span>Làm Lab Ngay</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onJumpToQuiz();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <BrainCircuit size={14} />
                    <span>Làm Quiz Nhanh</span>
                  </button>
                </div>
              </div>

              {/* HOW TO EARN XP GUIDE */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" />
                  Quy Tắc Tích Lũy Điểm Kinh Nghiệm (XP)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-start gap-2.5">
                    <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 font-bold shrink-0">🔬</span>
                    <div>
                      <p className="font-bold text-zinc-200">Chạy Thí Nghiệm Lab</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        <span className="text-emerald-400 font-bold font-mono">+25 XP</span> khi bấm chạy mô phỏng, <span className="text-cyan-400 font-bold font-mono">+15 XP</span> khi tinh chỉnh thanh trượt thông số.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-start gap-2.5">
                    <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 font-bold shrink-0">🎯</span>
                    <div>
                      <p className="font-bold text-zinc-200">Bài Kiểm Tra Quiz Nhanh</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        <span className="text-emerald-400 font-bold font-mono">+20 XP</span> mỗi câu đúng, <span className="text-amber-400 font-bold font-mono">+100 XP</span> khi đạt điểm 100% hoàn hảo!
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-start gap-2.5">
                    <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-300 font-bold shrink-0">🔥</span>
                    <div>
                      <p className="font-bold text-zinc-200">Thưởng Chuỗi Liên Tục</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        <span className="text-orange-400 font-bold font-mono">+30 XP</span> cộng thêm trong bài thực hành đầu tiên mỗi ngày mới.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-start gap-2.5">
                    <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-300 font-bold shrink-0">📝</span>
                    <div>
                      <p className="font-bold text-zinc-200">Xuất Báo Cáo & Ghi Chép</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        <span className="text-teal-400 font-bold font-mono">+35 XP</span> khi lưu bản chất vào Sổ Tay Nghiên Cứu.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: BADGES */}
          {activeTab === 'badges' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Huy hiệu ghi nhận các cột mốc thực nghiệm và bứt phá tư duy:</span>
                <span className="font-mono text-amber-400 font-bold">
                  {profile.badges.filter(b => b.unlocked).length} / {profile.badges.length} đã mở
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.badges.map(badge => {
                  const percent = Math.min(100, Math.round((badge.progress / badge.maxProgress) * 100));

                  return (
                    <div 
                      key={badge.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                        badge.unlocked
                          ? 'bg-zinc-900/90 border-amber-500/40 shadow-lg shadow-amber-950/20'
                          : 'bg-zinc-950/60 border-zinc-800/80 opacity-70'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                        badge.unlocked
                          ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-600 grayscale'
                      }`}>
                        {badge.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-xs font-bold truncate ${badge.unlocked ? 'text-amber-200' : 'text-zinc-300'}`}>
                            {badge.name}
                          </h4>
                          {badge.unlocked ? (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold shrink-0">
                              Đã đạt
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                              {badge.progress}/{badge.maxProgress}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                          {badge.description}
                        </p>

                        {!badge.unlocked && (
                          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-2">
                            <div 
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVITY HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Dòng thời gian thu hoạch điểm kinh nghiệm gần đây:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {profile.recentXpEvents.length} sự kiện
                </span>
              </div>

              {profile.recentXpEvents.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  Chưa có hoạt động nào được ghi lại. Hãy bắt đầu một thí nghiệm hoặc Quiz!
                </div>
              ) : (
                <div className="space-y-2">
                  {profile.recentXpEvents.map(evt => (
                    <div 
                      key={evt.id}
                      className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-sm shrink-0">
                          {evt.category === 'lab' ? '🔬' : evt.category === 'quiz' ? '🎯' : evt.category === 'streak' ? '🔥' : '⚡'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-200 truncate">
                            {evt.title}
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            {evt.timestamp}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {evt.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                            {evt.badge}
                          </span>
                        )}
                        <span className="font-mono font-black text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                          +{evt.xp} XP
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between gap-3 text-xs">
          <div className="text-zinc-500 text-[11px] hidden sm:block">
            Tư duy First Principles: Hiểu thấu bản chất từng hiện tượng khoa học
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition-colors cursor-pointer ml-auto"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
