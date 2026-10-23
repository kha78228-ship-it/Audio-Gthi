import React from 'react';
import { 
  Sparkles, 
  Award, 
  Flame, 
  Trophy, 
  Lock, 
  CheckCircle2, 
  Gift, 
  ChevronRight,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface SavingsMilestone {
  percentage: number;
  label: string;
  badgeName: string;
  icon: string; // emoji or icon key
  description: string;
  perk: string;
  unlockedColor: string;
}

export const DEFAULT_SAVINGS_MILESTONES: SavingsMilestone[] = [
  {
    percentage: 25,
    label: 'Khởi Động Tiết Kiệm',
    badgeName: 'Tia Sáng Đầu Tiên',
    icon: '🌱',
    description: 'Chạm mốc 25% mục tiêu. Bước xuất phát tạo đà bứt phá cho thói quen tích lũy vững vàng.',
    perk: 'Mở khóa phân tích tốc độ tiết kiệm',
    unlockedColor: '#38bdf8'
  },
  {
    percentage: 50,
    label: 'Cột Mốc Nửa Đoạn Đường',
    badgeName: 'Bán Lộ Chiến Binh',
    icon: '⚡',
    description: 'Chinh phục 50% chặng đường! Bạn đã đi được một nửa chặng đường và vượt qua giai đoạn gian nan nhất.',
    perk: 'Huy hiệu Chiến Binh Tích Lũy 50%',
    unlockedColor: '#fbbf24'
  },
  {
    percentage: 75,
    label: 'Tăng Tốc Về Đích',
    badgeName: 'Ánh Kim Bứt Phá',
    icon: '🚀',
    description: 'Đạt 75% kế hoạch! Đích đến cận kề trước mắt, tinh thần kỷ luật tài chính đang ở đỉnh cao.',
    perk: 'Dự phóng ngày hoàn tất mục tiêu sớm',
    unlockedColor: '#a855f7'
  },
  {
    percentage: 100,
    label: 'Chinh Phục Đỉnh Cao',
    badgeName: 'Huyền Thoại Về Đích',
    icon: '👑',
    description: 'Hoàn thành 100% mục tiêu tiết kiệm! Thành tựu rực rỡ minh chứng cho ý chí và năng lực tài chính.',
    perk: 'Mở khóa chứng nhận & danh hiệu Vinh Danh',
    unlockedColor: '#10b981'
  }
];

interface SavingsMilestonesInteractiveProps {
  currentAmount: number;
  targetAmount: number;
  goalTitle: string;
  goalColor?: string;
  selectedMilestone: number | null;
  onSelectMilestone: (percentage: number | null) => void;
  onCelebrateMilestone?: (milestone: SavingsMilestone) => void;
  className?: string;
}

export const SavingsMilestonesInteractive: React.FC<SavingsMilestonesInteractiveProps> = ({
  currentAmount,
  targetAmount,
  goalTitle,
  goalColor = '#06b6d4',
  selectedMilestone,
  onSelectMilestone,
  onCelebrateMilestone,
  className = ''
}) => {
  const validTarget = Math.max(1, targetAmount);
  const currentRatio = currentAmount / validTarget;
  const currentPct = Math.min(100, Math.round(currentRatio * 100));

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const activeMilestone = DEFAULT_SAVINGS_MILESTONES.find(m => m.percentage === selectedMilestone);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
            <Trophy size={16} />
          </div>
          <div>
            <h5 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
              <span>Hệ Thống Cột Mốc & Huy Hiệu Mở Khóa</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                {DEFAULT_SAVINGS_MILESTONES.filter(m => currentPct >= m.percentage).length}/{DEFAULT_SAVINGS_MILESTONES.length} Đã Mở
              </span>
            </h5>
            <p className="text-[11px] text-zinc-400">
              Chạm hoặc nhấp vào từng mốc (25%, 50%, 75%, 100%) để xem chi tiết tiền thưởng & phần thưởng tinh thần
            </p>
          </div>
        </div>

        {selectedMilestone !== null && (
          <button
            onClick={() => onSelectMilestone(null)}
            className="self-start sm:self-center text-[11px] text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-all cursor-pointer"
          >
            Đóng chi tiết cột mốc ✕
          </button>
        )}
      </div>

      {/* Interactive Milestone Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {DEFAULT_SAVINGS_MILESTONES.map((milestone) => {
          const isUnlocked = currentPct >= milestone.percentage;
          const isSelected = selectedMilestone === milestone.percentage;
          const milestoneTargetAmount = (validTarget * milestone.percentage) / 100;
          const amountRemaining = Math.max(0, milestoneTargetAmount - currentAmount);

          return (
            <button
              key={milestone.percentage}
              onClick={() => onSelectMilestone(isSelected ? null : milestone.percentage)}
              className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer group ${
                isSelected
                  ? 'bg-zinc-850 border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/10'
                  : isUnlocked
                  ? 'bg-zinc-900/90 hover:bg-zinc-850 border-zinc-750 hover:border-zinc-600'
                  : 'bg-zinc-950/60 hover:bg-zinc-900/60 border-zinc-850 hover:border-zinc-750 opacity-80'
              }`}
            >
              {/* Top Row: Icon + Badge + Lock/Check */}
              <div className="flex items-center justify-between w-full">
                <div 
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm border transition-transform group-hover:scale-105 ${
                    isUnlocked
                      ? 'border-transparent shadow-md'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                  }`}
                  style={{
                    backgroundColor: isUnlocked ? `${milestone.unlockedColor}25` : undefined,
                    borderColor: isUnlocked ? `${milestone.unlockedColor}60` : undefined,
                  }}
                >
                  <span>{milestone.icon}</span>
                </div>

                <div className="flex items-center gap-1">
                  <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded-md ${
                    isUnlocked 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {milestone.percentage}%
                  </span>
                  {isUnlocked ? (
                    <CheckCircle2 size={13} className="text-emerald-400" />
                  ) : (
                    <Lock size={12} className="text-zinc-500" />
                  )}
                </div>
              </div>

              {/* Middle: Badge Title & Subtitle */}
              <div className="mt-2.5 space-y-0.5">
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-black truncate ${
                    isUnlocked ? 'text-white' : 'text-zinc-400'
                  }`}>
                    {milestone.badgeName}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  {formatVND(milestoneTargetAmount)}
                </div>
              </div>

              {/* Status footer inside card */}
              <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between w-full">
                <span className="text-[9px] font-bold">
                  {isUnlocked ? (
                    <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                      <Sparkles size={9} /> ĐÃ MỞ KHÓA
                    </span>
                  ) : (
                    <span className="text-zinc-500">
                      Còn {formatVND(amountRemaining)}
                    </span>
                  )}
                </span>
                <ChevronRight size={11} className={`text-zinc-500 transition-transform ${isSelected ? 'rotate-90 text-cyan-400' : ''}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Milestone Detail Popover / Panel */}
      <AnimatePresence>
        {activeMilestone && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div 
              className="p-4 sm:p-5 rounded-2xl border relative overflow-hidden space-y-3"
              style={{
                backgroundColor: '#121215',
                borderColor: `${activeMilestone.unlockedColor}50`
              }}
            >
              {/* Ambient Glow */}
              <div 
                className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
                style={{ backgroundColor: activeMilestone.unlockedColor }}
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg border shrink-0"
                    style={{
                      backgroundColor: `${activeMilestone.unlockedColor}20`,
                      borderColor: `${activeMilestone.unlockedColor}60`
                    }}
                  >
                    <span>{activeMilestone.icon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-black text-white">
                        Huy hiệu: {activeMilestone.badgeName} ({activeMilestone.percentage}%)
                      </span>
                      {currentPct >= activeMilestone.percentage ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 size={11} /> Đã Đạt
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 flex items-center gap-1">
                          <Lock size={11} /> Chưa mở khóa
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-300 mt-1 max-w-xl">
                      {activeMilestone.description}
                    </p>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-zinc-800 sm:pl-4 shrink-0">
                  <span className="text-[10px] font-bold text-zinc-400 block">Số tiền cần đạt</span>
                  <div className="text-sm sm:text-base font-black text-white font-mono">
                    {formatVND((validTarget * activeMilestone.percentage) / 100)}
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    {currentPct >= activeMilestone.percentage ? (
                      <span className="text-emerald-400 font-bold">Vượt qua {(currentPct - activeMilestone.percentage)}%</span>
                    ) : (
                      <span className="text-rose-400 font-semibold">Cần thêm {formatVND(Math.max(0, (validTarget * activeMilestone.percentage) / 100 - currentAmount))}</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Milestone Perk / Achievement Note & Celebrate Action */}
              <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs relative z-10">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Award size={14} className="text-amber-400 shrink-0" />
                  <span className="text-[11px]">
                    <strong className="text-white">Đặc quyền:</strong> {activeMilestone.perk}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {currentPct >= activeMilestone.percentage && onCelebrateMilestone && (
                    <button
                      onClick={() => onCelebrateMilestone(activeMilestone)}
                      className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-cyan-500/20 hover:from-amber-500/30 hover:to-cyan-500/30 text-amber-300 hover:text-white border border-amber-500/40 text-[11px] font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      title="Bắn pháo hoa ăn mừng cột mốc này"
                    >
                      <Sparkles size={12} className="text-amber-400 animate-spin" />
                      <span>Ăn Mừng Pháo Hoa</span>
                    </button>
                  )}
                  <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
                    Mục tiêu: {goalTitle}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
