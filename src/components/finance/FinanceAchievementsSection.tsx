import React, { useState } from 'react';
import { 
  Award, 
  Sparkles, 
  Coins, 
  CheckCircle2, 
  Filter, 
  Flame, 
  ChevronRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { FinanceAchievementBadge } from '../../types';
import { FinanceBadgeCard } from './FinanceBadgeCard';
import { FinanceBadgeDetailModal } from './FinanceBadgeDetailModal';
import { setBadgeClaimed } from '../../data/financeAchievements';
import { useAuth } from '../../context/AuthContext';

interface FinanceAchievementsSectionProps {
  badges: FinanceAchievementBadge[];
  onRefreshBadges: () => void;
}

export function FinanceAchievementsSection({
  badges,
  onRefreshBadges
}: FinanceAchievementsSectionProps) {
  const { addAudioPoints } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [selectedBadge, setSelectedBadge] = useState<FinanceAchievementBadge | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [claimToastMessage, setClaimToastMessage] = useState<string | null>(null);

  const unlockedCount = badges.filter(b => b.isUnlocked).length;
  const totalCount = badges.length;
  const unclaimedBadges = badges.filter(b => b.isUnlocked && !b.isClaimed);
  const totalUnclaimedXu = unclaimedBadges.reduce((sum, b) => sum + b.rewardXu, 0);

  const filteredBadges = badges.filter(b => {
    if (filter === 'unlocked') return b.isUnlocked;
    if (filter === 'locked') return !b.isUnlocked;
    return true;
  });

  // Handle claiming a single badge reward
  const handleClaim = async (badgeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetBadge = badges.find(b => b.id === badgeId);
    if (!targetBadge || !targetBadge.isUnlocked || targetBadge.isClaimed) return;

    // 1. Persist claimed
    setBadgeClaimed(badgeId);

    // 2. Award Audio Points / Haevy Xu in AuthContext
    try {
      if (addAudioPoints) {
        await addAudioPoints(
          targetBadge.rewardXu,
          `Thưởng Cột Mốc Tài Chính: ${targetBadge.title} (${targetBadge.subtitle})`,
          'bonus'
        );
      }
    } catch (err) {
      console.warn('Error adding badge reward points:', err);
    }

    setClaimToastMessage(`🎉 Đã nhận +${targetBadge.rewardXu} Xu Haevy cho danh hiệu ${targetBadge.title}!`);
    setTimeout(() => setClaimToastMessage(null), 4000);

    onRefreshBadges();
  };

  // Handle claiming all unclaimed rewards
  const handleClaimAll = async () => {
    if (unclaimedBadges.length === 0) return;

    let totalPoints = 0;
    unclaimedBadges.forEach(b => {
      setBadgeClaimed(b.id);
      totalPoints += b.rewardXu;
    });

    try {
      if (addAudioPoints && totalPoints > 0) {
        await addAudioPoints(
          totalPoints,
          `Thưởng tất cả ${unclaimedBadges.length} Cột Mốc Tài Chính Haevy`,
          'bonus'
        );
      }
    } catch (err) {
      console.warn('Error adding batch points:', err);
    }

    setClaimToastMessage(`🎉 Tuyệt vời! Bạn đã nhận toàn bộ +${totalPoints} Xu Haevy từ ${unclaimedBadges.length} cột mốc!`);
    setTimeout(() => setClaimToastMessage(null), 4500);

    onRefreshBadges();
  };

  return (
    <div className="space-y-4">
      {/* Toast feedback */}
      {claimToastMessage && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 text-zinc-950 font-black text-xs flex items-center justify-between shadow-xl animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <Sparkles size={16} />
            <span>{claimToastMessage}</span>
          </div>
          <button 
            onClick={() => setClaimToastMessage(null)}
            className="text-zinc-900 hover:text-black font-bold text-sm px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Container Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 shadow-xl space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-500/30 text-amber-400">
                <Award size={18} />
              </div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                Huy Hiệu &amp; Cột Mốc Tài Chính
              </h3>
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                {unlockedCount}/{totalCount} Đã Đạt
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
              Mở khóa các huy hiệu danh giá như <strong className="text-emerald-300">Master Saver</strong>, <strong className="text-cyan-300">Budget Ninja</strong> và <strong className="text-amber-300">Debt Crusher</strong> khi bạn chinh phục các mục tiêu tài chính cá nhân.
            </p>
          </div>

          {/* Claim All Button if rewards available */}
          {unclaimedBadges.length > 0 && (
            <button
              onClick={handleClaimAll}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:opacity-95 text-zinc-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-transform active:scale-95 cursor-pointer whitespace-nowrap animate-pulse"
            >
              <Sparkles size={14} />
              <span>Nhận Thưởng Tất Cả (+{totalUnclaimedXu} Xu)</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'all'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            Tất Cả ({totalCount})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'unlocked'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            🏆 Đã Mở Khóa ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'locked'
                ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            🔒 Đang Chinh Phục ({totalCount - unlockedCount})
          </button>
        </div>

        {/* Badges Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map((badge) => (
            <FinanceBadgeCard
              key={badge.id}
              badge={badge}
              onClick={() => {
                setSelectedBadge(badge);
                setIsDetailOpen(true);
              }}
              onClaimReward={(badgeId, e) => handleClaim(badgeId, e)}
            />
          ))}
        </div>
      </div>

      {/* Badge Detail Modal */}
      <FinanceBadgeDetailModal
        badge={selectedBadge}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedBadge(null);
        }}
        onClaimReward={(badgeId) => {
          handleClaim(badgeId);
          // update modal badge state
          if (selectedBadge && selectedBadge.id === badgeId) {
            setSelectedBadge(prev => prev ? { ...prev, isClaimed: true } : null);
          }
        }}
      />
    </div>
  );
}
