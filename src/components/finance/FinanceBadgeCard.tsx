import React from 'react';
import { Sparkles, Coins, CheckCircle, ChevronRight, Lock } from 'lucide-react';
import { FinanceAchievementBadge } from '../../types';
import { FinanceBadgeEmblem } from './FinanceBadgeEmblem';

interface FinanceBadgeCardProps {
  badge: FinanceAchievementBadge;
  onClick: () => void;
  onClaimReward: (badgeId: string, e: React.MouseEvent) => void;
}

export function FinanceBadgeCard({ badge, onClick, onClaimReward }: FinanceBadgeCardProps) {
  const isUnlocked = badge.isUnlocked;
  const isClaimed = badge.isClaimed;

  return (
    <div
      onClick={onClick}
      className={`group relative p-4 rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${
        isUnlocked
          ? 'bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-zinc-950 border-zinc-700/80 hover:border-emerald-500/60 shadow-lg hover:shadow-emerald-500/10'
          : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700 opacity-90'
      }`}
    >
      {/* Ambient Radial Accent */}
      {isUnlocked && (
        <div
          className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-30"
          style={{ backgroundColor: badge.accentColor }}
        />
      )}

      {/* Top Header Row */}
      <div className="flex items-start gap-3.5">
        <FinanceBadgeEmblem badge={badge} size="md" showLevel={true} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide ${
                badge.rarity === 'legendary'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : badge.rarity === 'epic'
                  ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {badge.rarity}
            </span>
            <span className="text-[10px] text-zinc-400 font-semibold truncate">
              {badge.subtitle}
            </span>
          </div>

          <h4 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors truncate mt-1">
            {badge.title}
          </h4>

          <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-relaxed">
            {badge.description}
          </p>
        </div>
      </div>

      {/* Progress & Milestone Row */}
      <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] text-zinc-300 font-medium flex items-center gap-1 truncate">
            {isUnlocked ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle size={13} /> Đã đạt cột mốc
              </span>
            ) : (
              <span className="text-zinc-400 flex items-center gap-1">
                <Lock size={12} /> Tiến độ cột mốc
              </span>
            )}
          </span>
          <span className="font-extrabold text-white text-xs">
            {badge.progressPercent}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isUnlocked
                ? `bg-gradient-to-r ${badge.gradient}`
                : 'bg-zinc-700'
            }`}
            style={{ width: `${Math.min(badge.progressPercent, 100)}%` }}
          />
        </div>

        {/* Criteria status note */}
        <div className="text-[10px] text-zinc-400 truncate">
          {badge.milestoneDescription}
        </div>
      </div>

      {/* Bottom Actions Row: Reward & View Details */}
      <div className="mt-3 flex items-center justify-between gap-2 pt-1">
        {/* Reward pill */}
        <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
          <Coins size={13} className="text-amber-400" />
          <span>+{badge.rewardXu} Xu</span>
        </div>

        {/* Claim / Status button */}
        {isUnlocked ? (
          isClaimed ? (
            <span className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
              <CheckCircle size={12} className="text-emerald-400" /> Đã nhận
            </span>
          ) : (
            <button
              onClick={(e) => onClaimReward(badge.id, e)}
              className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:opacity-90 text-zinc-950 text-[11px] font-black flex items-center gap-1 shadow-md shadow-amber-500/20 cursor-pointer transition-transform active:scale-95 animate-pulse"
            >
              <Sparkles size={12} />
              <span>Nhận Thưởng</span>
            </button>
          )
        ) : (
          <span className="text-[11px] text-zinc-500 flex items-center gap-0.5 font-medium group-hover:text-zinc-400">
            <span>Chi tiết</span>
            <ChevronRight size={13} />
          </span>
        )}
      </div>
    </div>
  );
}
