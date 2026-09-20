import React from 'react';
import { Flame, Zap, Award, ChevronRight, TrendingUp } from 'lucide-react';
import { EduStudentProfile } from '../../../types';

interface EduStreakXpWidgetProps {
  profile: EduStudentProfile;
  onClick: () => void;
}

export function EduStreakXpWidget({ profile, onClick }: EduStreakXpWidgetProps) {
  const currentLevelRange = profile.nextLevelXp - profile.prevLevelXp;
  const currentXpIntoLevel = profile.totalXp - profile.prevLevelXp;
  const progressPercent = currentLevelRange > 0 
    ? Math.min(100, Math.max(0, Math.round((currentXpIntoLevel / currentLevelRange) * 100)))
    : 100;

  const isTodayCompleted = profile.todayXp >= profile.dailyGoalXp;

  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-2 cursor-pointer group bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-emerald-500/50 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl transition-all shadow-md shrink-0 select-none"
      title="Bấm để xem chi tiết Chuỗi Ngày & Bảng Vàng Điểm Kinh Nghiệm"
    >
      {/* 1. STREAK PILL */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-500/30 text-orange-300">
        <div className="relative">
          <Flame size={16} className="text-orange-400 fill-orange-500/30 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-400 animate-ping opacity-75" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-mono font-black text-xs text-orange-200">
            {profile.streakDays}
          </span>
          <span className="text-[10px] font-semibold text-orange-300/80 hidden xs:inline">
            ngày
          </span>
        </div>
      </div>

      {/* 2. XP & LEVEL PILL */}
      <div className="flex flex-col justify-center px-2 py-0.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-200">
          <span className="text-emerald-400 flex items-center gap-0.5">
            <Zap size={13} className="fill-emerald-400/20" />
            <span className="font-mono font-black">{profile.totalXp.toLocaleString()}</span> XP
          </span>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <span className="text-amber-300 hidden sm:inline flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
            <span>{profile.levelBadgeIcon}</span>
            <span>Lv.{profile.level}</span>
          </span>
        </div>

        {/* Mini progress bar */}
        <div className="w-20 sm:w-28 h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1 relative">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3. QUICK ARROW / BADGE INDICATOR */}
      <div className="p-1 rounded-lg bg-zinc-800/80 group-hover:bg-emerald-500/20 text-zinc-400 group-hover:text-emerald-300 transition-colors hidden sm:block">
        <ChevronRight size={14} />
      </div>
    </div>
  );
}
