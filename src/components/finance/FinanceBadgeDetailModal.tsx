import React from 'react';
import { 
  X, 
  Sparkles, 
  Coins, 
  CheckCircle, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  Share2,
  Award,
  Crown
} from 'lucide-react';
import { FinanceAchievementBadge } from '../../types';
import { FinanceBadgeEmblem } from './FinanceBadgeEmblem';

interface FinanceBadgeDetailModalProps {
  badge: FinanceAchievementBadge | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimReward: (badgeId: string) => void;
}

export function FinanceBadgeDetailModal({
  badge,
  isOpen,
  onClose,
  onClaimReward
}: FinanceBadgeDetailModalProps) {
  if (!isOpen || !badge) return null;

  const isUnlocked = badge.isUnlocked;
  const isClaimed = badge.isClaimed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-zinc-700/80 shadow-2xl p-6 sm:p-7 overflow-hidden space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: badge.accentColor }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer z-10"
        >
          <X size={18} />
        </button>

        {/* Badge Hero Presentation */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <FinanceBadgeEmblem badge={badge} size="xl" showLevel={true} />

          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-center gap-2">
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                  badge.rarity === 'legendary'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : badge.rarity === 'epic'
                    ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {badge.rarity}
              </span>
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                {badge.subtitle}
              </span>
            </div>

            <h3 className="text-2xl font-black text-white tracking-tight">
              {badge.title}
            </h3>

            <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed">
              {badge.description}
            </p>
          </div>
        </div>

        {/* Milestone Criteria Box */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-300 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              Điều Kiện Đạt Cột Mốc
            </span>
            <span className="font-black text-emerald-400 text-xs">
              {badge.progressPercent}% Hoàn Thành
            </span>
          </div>

          <div className="text-xs text-zinc-300 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
            {badge.milestoneDescription}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isUnlocked
                  ? `bg-gradient-to-r ${badge.gradient}`
                  : 'bg-zinc-700'
              }`}
              style={{ width: `${Math.min(badge.progressPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Milestone Levels Tier Breakdown */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Crown size={14} className="text-amber-400" />
            Các Bậc Cấp Độ Cột Mốc
          </h4>

          <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
            {[
              { level: 'Bronze', label: 'Cấp 1: Đồng', active: badge.badgeLevel >= 1 },
              { level: 'Silver', label: 'Cấp 2: Bạc', active: badge.badgeLevel >= 2 },
              { level: 'Gold', label: 'Cấp 3: Vàng', active: badge.badgeLevel >= 3 },
              { level: 'Diamond', label: 'Cấp 4: Kim Cương', active: badge.badgeLevel >= 4 }
            ].map((t) => (
              <div
                key={t.level}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                  t.active
                    ? 'bg-zinc-800/90 border-emerald-500/40 text-emerald-300 font-bold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${t.active ? 'bg-emerald-400' : 'bg-zinc-700'}`} />
                <span>{t.level}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reward & Footer Actions */}
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Coins size={18} />
            </div>
            <div>
              <div className="text-[10px] text-zinc-400 font-medium">Thưởng Cột Mốc</div>
              <div className="text-sm font-black text-amber-300">+{badge.rewardXu} Xu Haevy</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked ? (
              isClaimed ? (
                <div className="px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-400" />
                  <span>Đã Nhận Thưởng</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onClaimReward(badge.id);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 hover:opacity-95 text-zinc-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/25 cursor-pointer transition-transform active:scale-95 animate-pulse"
                >
                  <Sparkles size={14} />
                  <span>Nhận +{badge.rewardXu} Xu Ngay</span>
                </button>
              )
            ) : (
              <div className="px-4 py-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
                <Lock size={14} />
                <span>Chưa Mở Khóa</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
