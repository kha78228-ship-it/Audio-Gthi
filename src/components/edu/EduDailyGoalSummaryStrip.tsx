import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, Flame, Trophy, ChevronRight, Sparkles } from 'lucide-react';
import { 
  getDailyGoalsFromLocal, 
  getTodayDateString, 
  calculateCurrentDailyGoalStreak, 
  EDU_DAILY_GOALS_UPDATED_EVENT,
  EDU_EXAM_PREP_PILLARS
} from '../../services/eduDailyGoalService';
import { EduDailyGoalsRecord } from '../../types';

interface EduDailyGoalSummaryStripProps {
  onOpenGoalsTracker: () => void;
  onOpenCelebration?: () => void;
}

export function EduDailyGoalSummaryStrip({
  onOpenGoalsTracker,
  onOpenCelebration
}: EduDailyGoalSummaryStripProps) {
  const [record, setRecord] = useState<EduDailyGoalsRecord>(() =>
    getDailyGoalsFromLocal(getTodayDateString())
  );
  const [streakDays, setStreakDays] = useState<number>(calculateCurrentDailyGoalStreak);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      const updated = e.detail as EduDailyGoalsRecord;
      if (updated && updated.date === getTodayDateString()) {
        setRecord(updated);
        setStreakDays(calculateCurrentDailyGoalStreak());
      }
    };

    window.addEventListener(EDU_DAILY_GOALS_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(EDU_DAILY_GOALS_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  const total = record.totalCount || 7;
  const completed = record.completedCount || 0;
  const percent = Math.round((completed / total) * 100);
  const isAllDone = completed >= total;

  return (
    <div 
      onClick={onOpenGoalsTracker}
      className={`w-full px-3 sm:px-6 py-2 border-b cursor-pointer transition-all flex items-center justify-between gap-3 text-xs select-none ${
        isAllDone
          ? 'bg-gradient-to-r from-emerald-950/60 via-teal-950/50 to-amber-950/40 border-emerald-500/40 hover:bg-emerald-900/40'
          : 'bg-zinc-950/90 hover:bg-zinc-900/80 border-zinc-800/80'
      }`}
      title="Bấm để mở Bảng Theo Dõi Mục Tiêu Ngày (7 Trụ Cột GDPT 2018)"
    >
      {/* Left: Target Icon & Progress Readout */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
          isAllDone 
            ? 'bg-amber-400 text-zinc-950 shadow-sm shadow-amber-400/40' 
            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        }`}>
          {isAllDone ? <Trophy size={13} className="animate-pulse" /> : <Target size={13} />}
        </div>

        <div className="flex items-center gap-2 truncate">
          <span className="font-bold text-zinc-200 whitespace-nowrap flex items-center gap-1">
            <span>Mục Tiêu Ngày:</span>
            <span className={`font-mono ${isAllDone ? 'text-amber-300 font-black' : 'text-emerald-400 font-bold'}`}>
              {completed}/{total} Trụ Cột
            </span>
          </span>

          <span className="text-zinc-600 hidden xs:inline">•</span>

          <span className="text-zinc-400 hidden xs:inline truncate text-[11px]">
            {isAllDone ? (
              <span className="text-emerald-300 font-semibold flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                Đạt 100% tất cả 7 trụ cột!
              </span>
            ) : (
              <span>Còn {total - completed} cột mốc cần chinh phục</span>
            )}
          </span>
        </div>
      </div>

      {/* Middle: 7-Dot Mini Progress Indicator */}
      <div className="hidden sm:flex items-center gap-1">
        {EDU_EXAM_PREP_PILLARS.map((p) => {
          const done = !!record.items?.[p.id]?.isCompleted;
          return (
            <div
              key={p.id}
              className={`w-4 h-2 rounded-full transition-all ${
                done 
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400/40' 
                  : 'bg-zinc-800'
              }`}
              title={`${p.shortTitle}: ${done ? 'Đã đạt' : 'Chưa đạt'}`}
            />
          );
        })}
      </div>

      {/* Right: Percent Badge & Action */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Streak */}
        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-500/30">
          <Flame size={12} className="text-amber-400" />
          <span>{streakDays}d</span>
        </div>

        {/* Percent Pill */}
        <div className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold ${
          isAllDone 
            ? 'bg-emerald-500 text-zinc-950' 
            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
        }`}>
          {percent}%
        </div>

        {/* Link / Replay action */}
        {isAllDone && onOpenCelebration ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenCelebration();
            }}
            className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Vinh danh 🎉</span>
          </button>
        ) : (
          <span className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5">
            <span>Chi tiết</span>
            <ChevronRight size={12} />
          </span>
        )}
      </div>
    </div>
  );
}
