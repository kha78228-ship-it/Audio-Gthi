import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Crown, 
  Coins, 
  Gift, 
  TrendingUp, 
  Check, 
  Lock, 
  ChevronRight, 
  Award, 
  Zap, 
  ShieldCheck, 
  ArrowUpRight,
  Info,
  History,
  PartyPopper
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LEVEL_MILESTONES, calculateLevelFromExp, getUnclaimedLevelRewards } from '../data/levelMilestones';
import { haptics } from '../utils/haptics';

interface UserLevelPrivilegesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateMode?: (mode: string, params?: any) => void;
  onOpenGiftShop?: () => void;
}

export function UserLevelPrivilegesModal({
  isOpen,
  onClose,
  onNavigateMode,
  onOpenGiftShop
}: UserLevelPrivilegesModalProps) {
  const { 
    user, 
    levelExp = 0, 
    claimedLevelRewards = [], 
    claimLevelReward, 
    claimAllLevelRewards,
    isVip,
    audioPoints = 0
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'rewards' | 'how_to_earn' | 'history'>('rewards');
  const [filterMode, setFilterMode] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [claimingLevel, setClaimingLevel] = useState<number | null>(null);
  const [claimNotification, setClaimNotification] = useState<string | null>(null);
  const [isClaimingAll, setIsClaimingAll] = useState(false);

  const levelState = calculateLevelFromExp(levelExp);
  const { currentLevel, currentMilestone, nextMilestone, expInCurrentLevel, expRequiredForNext, progressPercentage, remainingExp } = levelState;
  const unclaimedMilestones = getUnclaimedLevelRewards(currentLevel, claimedLevelRewards);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClaim = async (level: number) => {
    haptics.selection();
    setClaimingLevel(level);
    try {
      const res = await claimLevelReward(level);
      if (res.success) {
        haptics.rewardClaim();
        setClaimNotification(res.message);
        setTimeout(() => setClaimNotification(null), 5000);
      } else {
        haptics.warning();
        setClaimNotification(res.message);
        setTimeout(() => setClaimNotification(null), 4000);
      }
    } finally {
      setClaimingLevel(null);
    }
  };

  const handleClaimAll = async () => {
    if (unclaimedMilestones.length === 0 || isClaimingAll) return;
    haptics.impact('medium');
    setIsClaimingAll(true);
    try {
      const res = await claimAllLevelRewards();
      if (res.success) {
        haptics.rewardClaim();
        setClaimNotification(res.message);
        setTimeout(() => setClaimNotification(null), 6000);
      }
    } finally {
      setIsClaimingAll(false);
    }
  };

  const filteredMilestones = LEVEL_MILESTONES.filter(m => {
    if (filterMode === 'unlocked') return m.level <= currentLevel;
    if (filterMode === 'locked') return m.level > currentLevel;
    return true;
  });

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-zinc-950 border border-zinc-800/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Background Glow */}
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-3xl pointer-events-none opacity-40 transition-all"
          style={{ background: currentMilestone.glowColor }}
        />

        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700/60 transition-colors"
          title="Đóng cửa sổ"
        >
          <X size={18} />
        </button>

        {/* ========================================================================= */}
        {/* HEADER: USER LEVEL & PROGRESS OVERVIEW                                    */}
        {/* ========================================================================= */}
        <div className="relative p-5 sm:p-6 pb-4 border-b border-zinc-800/80 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: Badge & Level Info */}
            <div className="flex items-center gap-3.5">
              <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${currentMilestone.badgeGradient} p-0.5 shadow-xl shrink-0 flex items-center justify-center`}>
                <div className="w-full h-full rounded-2xl bg-zinc-950/80 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl leading-none drop-shadow-md">{currentMilestone.icon}</span>
                  <span className="text-[10px] font-black text-amber-300 font-mono mt-0.5 tracking-wider">
                    LV.{currentLevel}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-zinc-950 shadow-md">
                  <Crown size={11} fill="currentColor" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {currentMilestone.title}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[11px] font-black tracking-wide">
                    Cấp {currentLevel}
                  </span>
                  {isVip && (
                    <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold flex items-center gap-1">
                      <Sparkles size={10} /> +20% EXP VIP
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {currentMilestone.subtitle}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1.5">
                  <span>Tổng EXP tích lũy: <strong className="text-amber-300 font-mono">{levelExp.toLocaleString()} EXP</strong></span>
                  <span>•</span>
                  <span>Xu hiện có: <strong className="text-amber-400 font-mono">{audioPoints.toLocaleString()}</strong></span>
                </div>
              </div>
            </div>

            {/* Right: Quick Claim All button if available */}
            {unclaimedMilestones.length > 0 && (
              <button
                type="button"
                onClick={handleClaimAll}
                disabled={isClaimingAll}
                className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 active:scale-95 transition-all animate-bounce"
              >
                <PartyPopper size={16} />
                <span>{isClaimingAll ? 'Đang nhận...' : `Nhận Tất Cả (${unclaimedMilestones.length} Quà Chờ)`}</span>
              </button>
            )}
          </div>

          {/* EXP Progress Bar */}
          <div className="mt-4 pt-3 border-t border-zinc-900">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 font-medium text-zinc-300">
                <TrendingUp size={13} className="text-amber-400" />
                <span>Tiến trình lên <strong>{nextMilestone ? `LV.${nextMilestone.level} (${nextMilestone.title})` : 'Cấp Tối Thượng'}</strong></span>
              </div>
              <div className="font-mono text-xs font-bold text-amber-300">
                {nextMilestone ? (
                  <>
                    <span>{levelExp.toLocaleString()}</span>
                    <span className="text-zinc-500"> / </span>
                    <span className="text-zinc-400">{nextMilestone.requiredExp.toLocaleString()} EXP</span>
                    <span className="ml-1.5 px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[10px]">
                      {progressPercentage}%
                    </span>
                  </>
                ) : (
                  <span className="text-emerald-400">Đã đạt mức tối đa!</span>
                )}
              </div>
            </div>

            {/* Visual Bar */}
            <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-500 shadow-sm relative overflow-hidden"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>

            {nextMilestone && (
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1.5">
                <span>Cần thêm <strong className="text-amber-300 font-mono font-bold">+{remainingExp.toLocaleString()} EXP</strong> để thăng cấp</span>
                <span className="text-zinc-400">Tặng quà, nạp Xu hoặc VIP để tích lũy EXP ↗</span>
              </div>
            )}

            {/* Horizontal Mini Tier Stepper Track */}
            <div className="mt-3 pt-2.5 border-t border-zinc-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {LEVEL_MILESTONES.map((m) => {
                const isPassed = currentLevel >= m.level;
                const isCurrent = currentLevel === m.level;
                const isClaimed = claimedLevelRewards.includes(m.level);
                const canClaim = isPassed && m.level > 1 && !isClaimed;

                return (
                  <button
                    key={m.level}
                    type="button"
                    onClick={() => {
                      haptics.selection();
                      setActiveTab('rewards');
                      setFilterMode('all');
                      setTimeout(() => {
                        const element = document.getElementById(`level-milestone-card-${m.level}`);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }, 50);
                    }}
                    className={`relative flex flex-col items-center justify-center min-w-[48px] px-2 py-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                      isCurrent
                        ? 'bg-amber-400 text-zinc-950 font-black border-amber-300 shadow-lg shadow-amber-400/30 scale-105 ring-2 ring-amber-300/40'
                        : canClaim
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 animate-pulse'
                        : isPassed
                        ? 'bg-zinc-900 border-zinc-700/80 text-zinc-300 hover:border-amber-400/50 hover:text-white'
                        : 'bg-zinc-950/60 border-zinc-850 text-zinc-600 hover:text-zinc-400'
                    }`}
                    title={`LV.${m.level} - ${m.title} (${m.requiredExp.toLocaleString()} EXP)`}
                  >
                    <span className="text-xs leading-none">{m.icon}</span>
                    <span className="text-[10px] font-mono font-bold mt-0.5">L{m.level}</span>
                    {canClaim && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-zinc-950 animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TABS NAVIGATION                                                           */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-1 px-5 pt-2 border-b border-zinc-800/80 bg-zinc-900/40 shrink-0">
          <button
            type="button"
            onClick={() => { haptics.selection(); setActiveTab('rewards'); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'rewards' 
                ? 'border-amber-400 text-amber-300 bg-amber-400/5' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Gift size={14} />
            <span>Đặc Quyền & Quà Tặng ({LEVEL_MILESTONES.length} Cấp)</span>
            {unclaimedMilestones.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-black animate-pulse">
                {unclaimedMilestones.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => { haptics.selection(); setActiveTab('how_to_earn'); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'how_to_earn' 
                ? 'border-amber-400 text-amber-300 bg-amber-400/5' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Zap size={14} />
            <span>Cách Kiếm EXP Tăng Cấp</span>
          </button>

          <button
            type="button"
            onClick={() => { haptics.selection(); setActiveTab('history'); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'history' 
                ? 'border-amber-400 text-amber-300 bg-amber-400/5' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <History size={14} />
            <span>Lịch Sử Nhận Quà</span>
          </button>
        </div>

        {/* Claim Alert Banner */}
        {claimNotification && (
          <div className="mx-5 mt-3 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
            <Check size={16} className="text-emerald-400 shrink-0" />
            <span>{claimNotification}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: LEVEL MILESTONES & PRIVILEGES                                      */}
        {/* ========================================================================= */}
        {activeTab === 'rewards' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-700">
            {/* Filter Pills */}
            <div className="flex items-center justify-between gap-2 pb-1">
              <span className="text-[11px] text-zinc-400 font-medium">Danh sách cấp bậc và phần thưởng:</span>
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                    filterMode === 'all' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('unlocked')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                    filterMode === 'unlocked' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Đã đạt
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('locked')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                    filterMode === 'locked' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Chưa đạt
                </button>
              </div>
            </div>

            {filteredMilestones.map((milestone) => {
              const isUnlocked = currentLevel >= milestone.level;
              const isCurrent = currentLevel === milestone.level;
              const isClaimed = claimedLevelRewards.includes(milestone.level);
              const canClaim = isUnlocked && milestone.level > 1 && !isClaimed;

              return (
                <div
                  key={milestone.level}
                  id={`level-milestone-card-${milestone.level}`}
                  className={`p-4 rounded-2xl border transition-all duration-200 ${
                    isCurrent 
                      ? 'bg-zinc-900/90 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-400/30' 
                      : isUnlocked 
                        ? 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700' 
                        : 'bg-zinc-950/60 border-zinc-800/40 opacity-70 hover:opacity-90'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Level Badge & Title */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${milestone.badgeGradient} p-0.5 shrink-0 flex items-center justify-center shadow-md`}>
                        <div className="w-full h-full rounded-[10px] bg-zinc-950/80 flex flex-col items-center justify-center">
                          <span className="text-base leading-none">{milestone.icon}</span>
                          <span className="text-[9px] font-black text-amber-300 font-mono mt-0.5">
                            L{milestone.level}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-sm text-white">
                            {milestone.title}
                          </h3>
                          <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] font-bold">
                            Yêu cầu: {milestone.requiredExp.toLocaleString()} EXP
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.2 rounded-full bg-amber-400 text-zinc-950 text-[9px] font-black tracking-wide">
                              CẤP HIỆN TẠI
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {milestone.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Action Button: Claim or Status */}
                    <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
                      {canClaim ? (
                        <button
                          type="button"
                          onClick={() => handleClaim(milestone.level)}
                          disabled={claimingLevel === milestone.level}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-zinc-950 font-black text-xs shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse"
                        >
                          <Gift size={14} />
                          <span>{claimingLevel === milestone.level ? 'Đang nhận...' : 'Nhận Quà Ngay!'}</span>
                        </button>
                      ) : isUnlocked ? (
                        milestone.level === 1 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                            <Check size={12} /> Đã kích hoạt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                            <Check size={12} /> Đã nhận quà
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-500 border border-zinc-800 text-[11px] font-semibold">
                          <Lock size={12} /> Còn thiếu {(milestone.requiredExp - levelExp).toLocaleString()} EXP
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rewards Row */}
                  <div className="mt-3 pt-2.5 border-t border-zinc-800/60">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-amber-400/90 mb-1.5 flex items-center gap-1">
                      <Gift size={11} />
                      <span>Vật phẩm tặng khi đạt cấp:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {milestone.rewards.map((reward) => (
                        <div
                          key={reward.id}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs hover:border-amber-500/30 transition-colors"
                          title={reward.description}
                        >
                          <span className="text-sm">{reward.icon}</span>
                          <span className="font-bold text-zinc-200 text-[11px]">{reward.name}</span>
                          <span className="text-[10px] text-zinc-500">({reward.description})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Privileges Row */}
                  <div className="mt-2.5 pt-2 border-t border-zinc-800/40">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-indigo-400/90 mb-1 flex items-center gap-1">
                      <ShieldCheck size={11} />
                      <span>Đặc quyền mở khóa:</span>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-zinc-400">
                      {milestone.privileges.map((privilege, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                          <span>{privilege}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: HOW TO GAIN EXP (SPECIFIED IN USER REQUEST)                         */}
        {/* ========================================================================= */}
        {activeTab === 'how_to_earn' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <div className="flex items-center gap-2 font-black text-sm text-amber-300 mb-1">
                <Info size={16} />
                <span>Quy tắc tích lũy EXP tăng Level trong Hệ Sinh Thái Haevy</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">
                Để đảm bảo tính vinh danh chân thực và đặc quyền tối cao cho các mạnh thường quân, <strong>Điểm kinh nghiệm (EXP) chỉ có thể kiếm được qua 3 hoạt động đóng góp giá trị cao</strong>: Tặng quà cho người khác, Nạp Xu Haevy và Mua/Tặng các Gói VIP.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Method 1: Gifting Others */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between hover:border-pink-500/40 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center text-xl mb-3">
                    🎁
                  </div>
                  <h4 className="font-extrabold text-sm text-white mb-1">
                    1. Tặng Quà Cho Người Khác
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                    Tặng hoa, cà phê, vương miện cho tác giả bài hát, chuyển Xu Haevy cho bạn bè hoặc gửi quà yêu thương cặp đôi.
                  </p>
                  <div className="space-y-1.5 text-[11px] text-zinc-300 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 mb-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Tặng quà Tác giả:</span>
                      <strong className="text-pink-300 font-mono">1 Xu = +1 EXP</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Chuyển Xu Bạn Bè:</span>
                      <strong className="text-pink-300 font-mono">1 Xu = +1 EXP</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Thành viên VIP:</span>
                      <strong className="text-amber-300 font-mono">+20% Bonus EXP</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenGiftShop) onOpenGiftShop();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs font-bold border border-pink-500/40 transition-colors"
                >
                  <span>Mở Cửa Hàng Quà Tác Giả</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>

              {/* Method 2: Coin Top-up */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl mb-3">
                    🪙
                  </div>
                  <h4 className="font-extrabold text-sm text-white mb-1">
                    2. Nạp Xu Haevy
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                    Nạp Xu Haevy để sử dụng trong toàn bộ hệ sinh thái. Toàn bộ Xu nạp được quy đổi trực tiếp thành EXP.
                  </p>
                  <div className="space-y-1.5 text-[11px] text-zinc-300 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 mb-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Gói 550 Xu:</span>
                      <strong className="text-amber-300 font-mono">+550 EXP</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Gói 1.400 Xu:</span>
                      <strong className="text-amber-300 font-mono">+1.400 EXP</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Gói 10.000 Xu:</span>
                      <strong className="text-amber-300 font-mono">+10.000 EXP</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigateMode) onNavigateMode('vip', { tab: 'coins' });
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 transition-colors"
                >
                  <span>Đến Trang Nạp Xu</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>

              {/* Method 3: VIP Subscription & Gifting */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between hover:border-purple-500/40 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl mb-3">
                    👑
                  </div>
                  <h4 className="font-extrabold text-sm text-white mb-1">
                    3. Mua & Tặng Gói VIP
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                    Mua gói VIP cho bản thân hoặc chuyển tặng gói VIP cho bạn bè người thân nhận lượng lớn EXP bứt phá cấp độ.
                  </p>
                  <div className="space-y-1.5 text-[11px] text-zinc-300 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 mb-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Gói VIP 1 Tháng:</span>
                      <strong className="text-purple-300 font-mono">+2.000 EXP</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Gói VIP 3 Tháng:</span>
                      <strong className="text-purple-300 font-mono">+6.000 EXP</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Gói VIP 1 Năm:</span>
                      <strong className="text-purple-300 font-mono">+25.000 EXP</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigateMode) onNavigateMode('vip', { tab: 'vip' });
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold border border-purple-500/40 transition-colors"
                >
                  <span>Nâng Cấp Gói VIP Ngay</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: HISTORY & REWARD LOG                                               */}
        {/* ========================================================================= */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 scrollbar-thin scrollbar-thumb-zinc-700">
            <div className="text-xs text-zinc-400 mb-2">
              Các mốc phần thưởng cấp độ bạn đã mở khóa và nhận vào tài khoản:
            </div>

            {claimedLevelRewards.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-zinc-400">
                <Gift size={32} className="mx-auto mb-2 text-zinc-600 opacity-60" />
                <p className="font-semibold text-sm">Chưa có phần thưởng cấp độ nào được nhận</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Khi tích lũy đủ EXP và thăng cấp, bạn có thể quay lại tab "Đặc Quyền & Quà Tặng" để nhận quà tặng tương ứng!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {claimedLevelRewards.map((lvl) => {
                  const milestone = LEVEL_MILESTONES.find(m => m.level === lvl);
                  if (!milestone) return null;

                  return (
                    <div 
                      key={lvl}
                      className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{milestone.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-white text-xs">Cấp {milestone.level}: {milestone.title}</strong>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                              Đã nhận
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">
                            {milestone.rewards.map(r => r.name).join(', ')}
                          </div>
                        </div>
                      </div>
                      <Check size={16} className="text-emerald-400 shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="p-3.5 sm:p-4 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <div className="flex items-center gap-2">
            <Award size={14} className="text-amber-400" />
            <span>Hệ Thống Thăng Cấp & Vinh Danh Haevy VIP</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
