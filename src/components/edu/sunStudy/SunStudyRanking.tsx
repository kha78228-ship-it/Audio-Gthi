import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  Users, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Star, 
  ArrowUpRight, 
  ChevronRight,
  ShieldCheck,
  Gift
} from 'lucide-react';
import { 
  SunStudyState, 
  getRankTierForPoints, 
  getNextRankTier, 
  SUN_RANK_TIERS,
  SunQuest 
} from '../../../services/sunStudyStorageService';

interface SunStudyRankingProps {
  state: SunStudyState;
  onUpdateState: (updater: (prev: SunStudyState) => SunStudyState) => void;
  onOpenShop: () => void;
}

export function SunStudyRanking({ state, onUpdateState, onOpenShop }: SunStudyRankingProps) {
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'individual' | 'squads'>('individual');
  const [timeFilter, setTimeFilter] = useState<'day' | 'week'>('day');

  const currentRank = getRankTierForPoints(state.sunXp);
  const { nextTier, progressPercent } = getNextRankTier(state.sunXp);

  // Claim Quest Reward
  const handleClaimQuest = (questId: string) => {
    onUpdateState(prev => {
      const q = prev.quests.find(item => item.id === questId);
      if (!q || q.claimed || q.currentProgress < q.maxProgress) return prev;

      return {
        ...prev,
        sunCoins: prev.sunCoins + q.rewardCoins,
        sunXp: prev.sunXp + q.rewardXp,
        quests: prev.quests.map(item => item.id === questId ? { ...item, claimed: true } : item)
      };
    });
  };

  // Mock Leaderboard Individuals
  const topStudents = [
    { rank: 1, name: 'Hoàng Long (Chuyên Sư Phạm)', xp: 7420, hours: '6h45m', badge: '☀️ Mặt Trời', avatar: '👨‍🎓', isMe: false },
    { rank: 2, name: 'Thảo My (Chuyên Lê Hồng Phong)', xp: 6890, hours: '6h10m', badge: '👑 Kim Cương', avatar: '👩‍🎓', isMe: false },
    { rank: 3, name: 'Đức Huy (Chuyên Lam Sơn)', xp: 5940, hours: '5h50m', badge: '💎 Bạch Kim', avatar: '🧑‍💻', isMe: false },
    { rank: 4, name: 'Bạn (Người Dùng)', xp: state.sunXp, hours: `${(state.todayStudyMinutes / 60).toFixed(1)}h`, badge: currentRank.badge, avatar: '☀️', isMe: true },
    { rank: 5, name: 'Quỳnh Nga (K12)', xp: 2850, hours: '4h20m', badge: '🥇 Vàng', avatar: '🌸', isMe: false },
    { rank: 6, name: 'Bảo Long (K11)', xp: 2410, hours: '3h45m', badge: '🥇 Vàng', avatar: '⚡', isMe: false },
    { rank: 7, name: 'Hải Yến (K9)', xp: 1980, hours: '3h10m', badge: '🥈 Bạc', avatar: '🐱', isMe: false },
  ];

  // Mock Squad Leaderboard
  const topSquads = [
    { rank: 1, name: '☀️ Biệt Đội 27+ Khối A00', members: 48, totalHours: '198h', motto: 'Cày đề không ngủ, quyết đỗ Bách Khoa', icon: '🚀' },
    { rank: 2, name: '🩺 Hội Y Khoa Tương Lai', members: 35, totalHours: '164h', motto: 'Bản chất Hóa - Sinh, chạm ước mơ bác sĩ', icon: '💉' },
    { rank: 3, name: '🌸 Đội Sĩ Tử Chuyên Ngữ', members: 42, totalHours: '142h', motto: 'Vượt vũ môn vào trường mơ ước', icon: '📚' },
    { rank: 4, name: '⚡ Chiến Thần ĐGNL 950+', members: 29, totalHours: '118h', motto: 'Rèn tốc độ và tư duy logic phản biện', icon: '🧠' },
  ];

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-2xl shadow-inner">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">Hệ Thống Thi Đấu, Cày Rank & Đua Top</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                Mùa Giải Ánh Dương 2026-2027
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Học tập có thi đua, tích điểm Hạt Nắng ☀️ để đổi đồ game và thăng bậc Rank vinh quang!
            </p>
          </div>
        </div>

        <button
          onClick={onOpenShop}
          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 shrink-0"
        >
          <Gift size={14} />
          <span>Cửa Hàng Đổi Đồ Game ☀️</span>
        </button>
      </div>

      {/* User Current Rank Progression Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-amber-500/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/30 to-orange-500/20 border-2 border-amber-400/60 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/20 shrink-0">
            {currentRank.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Bậc Rank Hiện Tại:</span>
              <span className="px-2 py-0.2 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                {currentRank.badge}
              </span>
            </div>
            <h4 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {currentRank.name}
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Điểm rèn luyện: <span className="text-amber-300 font-bold font-mono">{state.sunXp} Sun XP</span> • Danh hiệu: <span className="text-zinc-200 font-medium">{currentRank.rewardTitle}</span>
            </p>
          </div>
        </div>

        {/* Progress to Next Rank */}
        <div className="w-full md:w-80 flex flex-col gap-2 bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-400">
              {nextTier ? `Lên ${nextTier.name.split(':')[0]}:` : 'Đã đạt bậc Rank tối thượng!'}
            </span>
            <span className="font-mono text-amber-400 font-bold">{progressPercent}%</span>
          </div>

          <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {nextTier && (
            <span className="text-[10px] text-zinc-500 text-right font-mono">
              Cần thêm {Math.max(0, nextTier.minPoints - state.sunXp)} XP nữa để thăng hạng 🚀
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Quests & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Quest System (Nhiệm Vụ Nhận Quà) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="p-5 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <h4 className="text-sm font-bold text-white">Nhiệm Vụ Nhận Hạt Nắng ☀️ & XP</h4>
              </div>
              <span className="text-xs text-zinc-400 font-mono">Làm mới 00:00</span>
            </div>

            <div className="flex flex-col gap-3">
              {state.quests.map(quest => {
                const isReadyToClaim = !quest.claimed && quest.currentProgress >= quest.maxProgress;
                const progressP = Math.min(100, Math.round((quest.currentProgress / quest.maxProgress) * 100));

                return (
                  <div
                    key={quest.id}
                    className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-white">{quest.title}</h5>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            quest.type === 'daily' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            {quest.type === 'daily' ? 'Ngày' : 'Tuần'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{quest.description}</p>
                      </div>

                      {/* Reward Badge */}
                      <div className="flex items-center gap-1.5 text-xs font-bold shrink-0">
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          +{quest.rewardCoins} ☀️
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          +{quest.rewardXp} XP
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar & Claim Button */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                            style={{ width: `${progressP}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {quest.currentProgress}/{quest.maxProgress} {quest.unit}
                        </span>
                      </div>

                      {quest.claimed ? (
                        <span className="px-3 py-1 rounded-xl bg-zinc-800 text-zinc-500 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Đã Nhận
                        </span>
                      ) : isReadyToClaim ? (
                        <button
                          onClick={() => handleClaimQuest(quest.id)}
                          className="px-3.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 text-xs font-black shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
                        >
                          Nhận Thưởng!
                        </button>
                      ) : (
                        <span className="px-3 py-1 rounded-xl bg-zinc-950 text-zinc-600 text-xs font-medium border border-zinc-800">
                          Đang Cày
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Leaderboard (Bảng Xếp Hạng Đua Top) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="p-5 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-xl flex flex-col gap-4">
            {/* Tab switch: Cá nhân vs Đua top nhóm */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setActiveLeaderboardTab('individual')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeLeaderboardTab === 'individual'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Cá Nhân 👤
                </button>
                <button
                  onClick={() => setActiveLeaderboardTab('squads')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeLeaderboardTab === 'squads'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Đua Top Nhóm 👥
                </button>
              </div>

              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => setTimeFilter('day')}
                  className={`px-2 py-0.5 rounded-lg font-semibold ${timeFilter === 'day' ? 'text-amber-400 font-bold' : 'text-zinc-500'}`}
                >
                  Hôm Nay
                </button>
                <span className="text-zinc-700">|</span>
                <button
                  onClick={() => setTimeFilter('week')}
                  className={`px-2 py-0.5 rounded-lg font-semibold ${timeFilter === 'week' ? 'text-amber-400 font-bold' : 'text-zinc-500'}`}
                >
                  Tuần Này
                </button>
              </div>
            </div>

            {/* Content List */}
            {activeLeaderboardTab === 'individual' ? (
              <div className="flex flex-col gap-2">
                {topStudents.map((st) => (
                  <div
                    key={st.rank}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                      st.isMe 
                        ? 'bg-amber-950/40 border-amber-500/40 shadow-md shadow-amber-500/10' 
                        : 'bg-zinc-900/70 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 text-center font-mono font-black text-sm ${
                        st.rank === 1 ? 'text-amber-400 text-lg' :
                        st.rank === 2 ? 'text-slate-300 text-base' :
                        st.rank === 3 ? 'text-amber-600 text-base' :
                        'text-zinc-500'
                      }`}>
                        {st.rank === 1 ? '🥇' : st.rank === 2 ? '🥈' : st.rank === 3 ? '🥉' : `#${st.rank}`}
                      </span>

                      <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-lg shadow-inner">
                        {st.avatar}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{st.name}</span>
                          {st.isMe && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px]">Bạn</span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-medium">{st.badge}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-amber-300 font-mono">{st.xp} XP</div>
                      <div className="text-[10px] text-zinc-500 font-mono">⏱️ {st.hours}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {topSquads.map((sq) => (
                  <div
                    key={sq.rank}
                    className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 text-center font-mono font-black text-sm ${
                        sq.rank === 1 ? 'text-amber-400 text-lg' : 'text-zinc-500'
                      }`}>
                        {sq.rank === 1 ? '🥇' : `#${sq.rank}`}
                      </span>

                      <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center text-xl shadow-inner">
                        {sq.icon}
                      </div>

                      <div>
                        <h5 className="text-xs font-bold text-white">{sq.name}</h5>
                        <p className="text-[10px] text-zinc-400 italic">"{sq.motto}"</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-cyan-300 font-mono">{sq.totalHours}</div>
                      <div className="text-[10px] text-zinc-500">{sq.members} bạn học</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
