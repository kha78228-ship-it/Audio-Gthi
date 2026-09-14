import React, { useEffect, useState } from 'react';
import { Sparkles, Trophy, X, ChevronRight, Coins } from 'lucide-react';
import { FinanceAchievementBadge } from '../../types';
import { FinanceBadgeEmblem } from './FinanceBadgeEmblem';

interface FinanceMilestoneToastProps {
  unlockedBadge: FinanceAchievementBadge | null;
  onClose: () => void;
  onViewBadge: (badge: FinanceAchievementBadge) => void;
}

export function FinanceMilestoneToast({
  unlockedBadge,
  onClose,
  onViewBadge
}: FinanceMilestoneToastProps) {
  if (!unlockedBadge) return null;

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
      <div 
        className="relative p-4 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-2 border-amber-500/50 shadow-2xl shadow-amber-500/20 flex items-center gap-3.5 overflow-hidden group cursor-pointer"
        onClick={() => onViewBadge(unlockedBadge)}
      >
        {/* Ambient Glow */}
        <div 
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-30 pointer-events-none animate-pulse"
          style={{ backgroundColor: unlockedBadge.accentColor }}
        />

        {/* Badge emblem */}
        <div className="shrink-0">
          <FinanceBadgeEmblem badge={unlockedBadge} size="sm" showLevel={false} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Trophy size={10} className="text-amber-400" />
              Mở Khóa Cột Mốc Mới!
            </span>
            <span className="text-[10px] font-extrabold text-amber-400 flex items-center gap-0.5">
              <Coins size={10} /> +{unlockedBadge.rewardXu} Xu
            </span>
          </div>

          <h4 className="text-sm font-black text-white truncate mt-1 group-hover:text-emerald-300 transition-colors">
            {unlockedBadge.title} • {unlockedBadge.subtitle}
          </h4>

          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
            {unlockedBadge.milestoneDescription}
          </p>
        </div>

        {/* Action arrow */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs font-bold text-emerald-400 hidden sm:inline-block">Xem</span>
          <ChevronRight size={16} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-full text-zinc-500 hover:text-white transition-colors ml-1"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
