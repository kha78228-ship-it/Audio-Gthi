import React, { useState } from 'react';
import { 
  Gamepad2, 
  Trophy, 
  Flame, 
  Sparkles, 
  Crown, 
  Coins, 
  Medal, 
  Target, 
  Zap, 
  Clock, 
  Award, 
  Star, 
  ChevronRight, 
  Play, 
  Users, 
  Music, 
  Dices, 
  ShieldCheck, 
  TrendingUp, 
  Radio, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  BarChart3,
  Calendar,
  Gift
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Crowd2xGameArena } from './games/Crowd2xGameArena';
import { MelodyQuizGame } from './games/MelodyQuizGame';
import { RhythmRushGame } from './games/RhythmRushGame';
import { LuckyWheelGame } from './games/LuckyWheelGame';
import { MusicTriviaGame } from './games/MusicTriviaGame';

export type HaevyGamesSubTab = 'home' | 'crowd2x' | 'melody_quiz' | 'rhythm_rush' | 'lucky_wheel' | 'trivia_master' | 'leaderboard' | 'quests';

interface HaevyGamesViewProps {
  activeSubTab?: HaevyGamesSubTab;
  onSelectSubTab?: (subTab: HaevyGamesSubTab) => void;
  onOpenAuth?: () => void;
  onOpenVipHub?: () => void;
}

export function HaevyGamesView({
  activeSubTab = 'home',
  onSelectSubTab,
  onOpenAuth,
  onOpenVipHub
}: HaevyGamesViewProps) {
  const { user, isVip, audioPoints, accountId } = useAuth();
  const [selectedGameId, setSelectedGameId] = useState<HaevyGamesSubTab>(
    (activeSubTab && activeSubTab !== 'home' && activeSubTab !== 'leaderboard' && activeSubTab !== 'quests') ? activeSubTab : 'crowd2x'
  );
  const [selectedTimeframe, setSelectedTimeframe] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');
  const [selectedGameFilter, setSelectedGameFilter] = useState<'all' | 'quiz' | 'rhythm' | 'wheel'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync if prop changes
  React.useEffect(() => {
    if (activeSubTab === 'leaderboard') {
      const el = document.getElementById('haevy-games-leaderboard');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (activeSubTab === 'quests') {
      const el = document.getElementById('haevy-games-quests');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (activeSubTab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (activeSubTab) {
      setSelectedGameId(activeSubTab);
      const arenaElement = document.getElementById('haevy-active-game-arena');
      if (arenaElement) {
        arenaElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [activeSubTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectGame = (gameId: HaevyGamesSubTab) => {
    setSelectedGameId(gameId);
    if (onSelectSubTab) {
      onSelectSubTab(gameId);
    }
    // Smooth scroll to active arena
    const arenaElement = document.getElementById('haevy-active-game-arena');
    if (arenaElement) {
      arenaElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Mock Leaderboard Data for initial clean layout
  const leaderboardData = [
    {
      rank: 1,
      name: 'Vũ Minh Quân',
      accountId: 'AH-889922',
      tier: 'Đại Cao Thủ 👑',
      tierColor: 'from-amber-400 to-yellow-500 text-black',
      score: 18450,
      winRate: '92%',
      gamesPlayed: 148,
      isVip: true,
      avatarBg: 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-black',
      reward: 'Gói VIP 1 Tháng + 5,000 Xu'
    },
    {
      rank: 2,
      name: 'Trần Hoài Phương',
      accountId: 'AH-771144',
      tier: 'Kim Cương 💎',
      tierColor: 'from-cyan-400 to-blue-500 text-white',
      score: 15200,
      winRate: '88%',
      gamesPlayed: 120,
      isVip: true,
      avatarBg: 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-white',
      reward: 'Gói VIP 2 Tuần + 2,500 Xu'
    },
    {
      rank: 3,
      name: 'Nguyễn Thành Long',
      accountId: 'AH-552233',
      tier: 'Bạch Kim ⚔️',
      tierColor: 'from-emerald-400 to-teal-500 text-white',
      score: 12890,
      winRate: '84%',
      gamesPlayed: 98,
      isVip: false,
      avatarBg: 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white',
      reward: 'Gói VIP 1 Tuần + 1,000 Xu'
    },
    {
      rank: 4,
      name: 'Lê Thảo My',
      accountId: 'AH-991102',
      tier: 'Vàng 🛡️',
      tierColor: 'from-yellow-500 to-amber-600 text-white',
      score: 10450,
      winRate: '79%',
      gamesPlayed: 85,
      isVip: true,
      avatarBg: 'bg-gradient-to-tr from-purple-500 to-pink-500 text-white',
      reward: '500 Xu Thưởng'
    },
    {
      rank: 5,
      name: 'Đỗ Hải Đăng',
      accountId: 'AH-334411',
      tier: 'Vàng 🛡️',
      tierColor: 'from-yellow-500 to-amber-600 text-white',
      score: 8920,
      winRate: '76%',
      gamesPlayed: 72,
      isVip: false,
      avatarBg: 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white',
      reward: '300 Xu Thưởng'
    },
    {
      rank: 6,
      name: 'Phạm Quỳnh Anh',
      accountId: 'AH-119988',
      tier: 'Bạc ⚡',
      tierColor: 'from-zinc-400 to-zinc-500 text-white',
      score: 7450,
      winRate: '71%',
      gamesPlayed: 60,
      isVip: false,
      avatarBg: 'bg-gradient-to-tr from-indigo-500 to-blue-500 text-white',
      reward: '200 Xu Thưởng'
    }
  ];

  // Featured mini games with full playable engines
  const featuredGames = [
    {
      id: 'melody_quiz',
      title: 'Đoán Giai Điệu Bài Hát',
      subtitle: 'Audio Melody Guessing Arena',
      desc: 'Nghe giai điệu bản hit bí ẩn, chọn nhanh tên bài hát hoặc ca sĩ trong 10 giây. Đạt chuỗi Combo để nhân đôi Xu thưởng!',
      category: 'quiz',
      categoryLabel: 'Đố Vui Âm Nhạc',
      difficulty: 'Trung Bình',
      difficultyColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      icon: Music,
      rewardText: '+50 ~ +200 Xu / Trận',
      status: 'active',
      playersOnline: 348,
      accentGradient: 'from-amber-500/20 via-yellow-950/40 to-zinc-950',
      borderAccent: 'border-amber-500/30 hover:border-amber-400'
    },
    {
      id: 'rhythm_rush',
      title: 'Đấu Nhịp Điệu (Rhythm Tap)',
      subtitle: 'Beat & Note Synchronization',
      desc: 'Chạm các phím [D][F][J][K] theo tiết tấu bài hát đang phát. Đạt độ chính xác Perfect để leo bảng xếp hạng toàn server!',
      category: 'rhythm',
      categoryLabel: 'Phản Xạ Tiết Tấu',
      difficulty: 'Khó',
      difficultyColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      icon: Zap,
      rewardText: '+60 ~ +200 Xu / Màn',
      status: 'active',
      playersOnline: 512,
      accentGradient: 'from-purple-500/20 via-indigo-950/40 to-zinc-950',
      borderAccent: 'border-purple-500/30 hover:border-purple-400'
    },
    {
      id: 'lucky_wheel',
      title: 'Vòng Quay May Mắn Audio',
      subtitle: 'Daily Lucky Wheel of Fortune',
      desc: 'Quay số trúng thưởng mỗi ngày: Cơ hội rinh VIP Hoàng Gia, Jackpot 1,500 Xu, thẻ quà tặng và danh hiệu Huyền Thoại!',
      category: 'wheel',
      categoryLabel: 'Vòng Quay Hàng Ngày',
      difficulty: 'Dễ',
      difficultyColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      icon: Dices,
      rewardText: 'VIP Hoàng Gia & Tới 1,500 Xu',
      status: 'active',
      playersOnline: 890,
      accentGradient: 'from-emerald-500/20 via-teal-950/40 to-zinc-950',
      borderAccent: 'border-emerald-500/30 hover:border-emerald-400'
    },
    {
      id: 'trivia_master',
      title: 'Thử Tài Tri Thức Âm Nhạc',
      subtitle: 'Vietnamese & World Music Trivia',
      desc: 'Kho câu hỏi khổng lồ về lịch sử âm nhạc, tiểu sử nghệ sĩ, các bản hit đình đám và giải thưởng âm nhạc lớn với 3 quyền trợ giúp.',
      category: 'quiz',
      categoryLabel: 'Kiến Thức & Trivia',
      difficulty: 'Thử Thách',
      difficultyColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
      icon: Target,
      rewardText: 'Lên tới +1,500 Xu',
      status: 'active',
      playersOnline: 285,
      accentGradient: 'from-sky-500/20 via-blue-950/40 to-zinc-950',
      borderAccent: 'border-sky-500/30 hover:border-sky-400'
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-24 sm:pb-16 animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-3 duration-200 bg-indigo-950/95 border-indigo-500/50 text-indigo-200 shadow-indigo-950/50">
          <CheckCircle2 size={20} className="text-indigo-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: HERO HEADER BANNER & USER COINS */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/70 via-purple-950/40 to-zinc-950 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Gamepad2 size={14} className="text-indigo-400" />
                Haevy Games Hub
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <Flame size={13} className="text-emerald-400" />
                5 Game Đang Hoạt Động
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Đấu Trường Game Âm Nhạc 🎮
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Tất cả các trò chơi âm nhạc đã được quy tụ tại trang chủ! Lắng nghe giai điệu, thử tài nhịp điệu, quay thưởng và so tài dự đoán ×2 Đám Đông để rinh Xu đổi VIP Hoàng Gia.
            </p>
          </div>

          {/* User Stat Quick Card */}
          <div className="w-full md:w-auto shrink-0 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between md:flex-col md:items-end gap-3 shadow-xl">
            <div className="text-left md:text-right">
              <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Tài Khoản Của Bạn</p>
              <p className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                {user?.displayName || 'Khách Chơi Game'}
                {isVip && <Crown size={14} className="text-amber-400 fill-amber-400" />}
              </p>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{accountId || 'ID: AH-GUEST'}</p>
            </div>
            <div className="flex items-center gap-2 bg-zinc-950 px-3.5 py-2 rounded-xl border border-zinc-800">
              <Coins size={16} className="text-amber-400 shrink-0" />
              <span className="text-sm font-black text-amber-400 font-mono">{(audioPoints || 0).toLocaleString('vi-VN')}</span>
              <span className="text-[10px] text-zinc-400 font-semibold">Xu</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: FAST GAME SELECTOR BAR */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            Chọn Game Để Chơi Ngay
          </h2>
          <span className="text-xs text-zinc-400">Đang chọn: <strong className="text-indigo-400 capitalize">{selectedGameId === 'crowd2x' ? '×2 Đám Đông' : selectedGameId === 'melody_quiz' ? 'Đoán Giai Điệu' : selectedGameId === 'rhythm_rush' ? 'Đấu Nhịp Điệu' : selectedGameId === 'lucky_wheel' ? 'Vòng Quay May Mắn' : selectedGameId === 'trivia_master' ? 'Tri Thức Âm Nhạc' : 'Bảng Xếp Hạng'}</strong></span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 pt-1">
          <button
            type="button"
            onClick={() => handleSelectGame('crowd2x')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              selectedGameId === 'crowd2x'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/25 font-black scale-[1.02]'
                : 'bg-zinc-900/90 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <Zap size={16} className={selectedGameId === 'crowd2x' ? 'fill-black text-black' : 'text-amber-400'} />
            <span>×2 Đám Đông 🔥</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectGame('melody_quiz')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              selectedGameId === 'melody_quiz'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 font-black scale-[1.02]'
                : 'bg-zinc-900/90 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <Music size={16} className={selectedGameId === 'melody_quiz' ? 'text-purple-200' : 'text-purple-400'} />
            <span>Đoán Giai Điệu 🎵</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectGame('rhythm_rush')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              selectedGameId === 'rhythm_rush'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-600/30 font-black scale-[1.02]'
                : 'bg-zinc-900/90 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <Flame size={16} className={selectedGameId === 'rhythm_rush' ? 'text-cyan-200' : 'text-cyan-400'} />
            <span>Đấu Nhịp Điệu ⚡</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectGame('lucky_wheel')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              selectedGameId === 'lucky_wheel'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 font-black scale-[1.02]'
                : 'bg-zinc-900/90 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <Dices size={16} className={selectedGameId === 'lucky_wheel' ? 'text-emerald-200' : 'text-emerald-400'} />
            <span>Vòng Quay May Mắn 🎡</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectGame('trivia_master')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              selectedGameId === 'trivia_master'
                ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-600/30 font-black scale-[1.02]'
                : 'bg-zinc-900/90 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <Target size={16} className={selectedGameId === 'trivia_master' ? 'text-sky-200' : 'text-sky-400'} />
            <span>Tri Thức Âm Nhạc 🎯</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('haevy-games-leaderboard');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 bg-zinc-900/90 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-500/50"
          >
            <Trophy size={16} className="text-amber-400" />
            <span>Bảng Xếp Hạng 🏆</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: LIVE ACTIVE GAME ARENA (DIRECT PLAY IN HOMEPAGE) */}
      {/* ========================================================================= */}
      <div id="haevy-active-game-arena" className="scroll-mt-6">
        {selectedGameId === 'crowd2x' && (
          <div className="space-y-4">
            <Crowd2xGameArena
              onOpenAuth={onOpenAuth}
              onOpenVipHub={onOpenVipHub}
            />
          </div>
        )}

        {selectedGameId === 'melody_quiz' && (
          <MelodyQuizGame
            onBackToLobby={() => handleSelectGame('crowd2x')}
            onOpenAuth={onOpenAuth}
          />
        )}

        {selectedGameId === 'rhythm_rush' && (
          <RhythmRushGame
            onBackToLobby={() => handleSelectGame('crowd2x')}
            onOpenAuth={onOpenAuth}
          />
        )}

        {selectedGameId === 'lucky_wheel' && (
          <LuckyWheelGame
            onBackToLobby={() => handleSelectGame('crowd2x')}
            onOpenAuth={onOpenAuth}
            onOpenVipHub={onOpenVipHub}
          />
        )}

        {selectedGameId === 'trivia_master' && (
          <MusicTriviaGame
            onBackToLobby={() => handleSelectGame('crowd2x')}
            onOpenAuth={onOpenAuth}
          />
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: DAILY QUESTS & MISSIONS */}
      {/* ========================================================================= */}
      <div id="haevy-games-quests" className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 scroll-mt-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Flame size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Nhiệm Vụ Game Thủ Mỗi Ngày</h3>
              <p className="text-xs text-zinc-400">Hoàn thành nhiệm vụ để nhận Xu thưởng và vé quay miễn phí</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
            Làm mới hàng ngày
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-200">Đăng nhập vào sảnh Game</p>
              <p className="text-[11px] text-zinc-400">Nhận điểm danh game thủ</p>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                <Coins size={12} /> +50 Xu Audio
              </div>
            </div>
            <button
              onClick={() => showToast('Đã hoàn thành điểm danh game thủ hôm nay!')}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 transition-colors cursor-pointer shrink-0"
            >
              Nhận Thưởng
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-200">Chơi Vòng Quay May Mắn</p>
              <p className="text-[11px] text-zinc-400">Nhận 1 lượt quay miễn phí</p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <Dices size={12} /> 1 Lượt Free Spin
              </div>
            </div>
            <button
              onClick={() => handleSelectGame('lucky_wheel')}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              Quay Ngay
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-200">Đạt Top 10 Bảng Xếp Hạng</p>
              <p className="text-[11px] text-zinc-400">Đua top tuần hiện tại</p>
              <div className="flex items-center gap-1.5 text-xs text-purple-400 font-bold">
                <Crown size={12} /> Gói VIP 7 Ngày
              </div>
            </div>
            <button
              onClick={() => {
                const el = document.getElementById('haevy-games-leaderboard');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              Xem Bảng
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: ALL GAMES DISCOVERY GRID */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Gamepad2 size={20} className="text-indigo-400" />
              Khám Phá Tất Cả Các Game Trong Hệ Thống
            </h2>
            <p className="text-xs text-zinc-400">Nhấn vào bất kỳ trò chơi nào để chơi trực tiếp ngay trên trang chủ</p>
          </div>

          {/* Game Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-1">
            {(['all', 'quiz', 'rhythm', 'wheel'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedGameFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedGameFilter === cat
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {cat === 'all' && 'Tất Cả'}
                {cat === 'quiz' && 'Đố Vui'}
                {cat === 'rhythm' && 'Tiết Tấu'}
                {cat === 'wheel' && 'Vòng Quay'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Crowd 2X Featured Card */}
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 via-yellow-950/40 to-zinc-950 p-6 shadow-xl transition-all duration-300 hover:scale-[1.01] group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-center text-amber-400 shadow-inner group-hover:scale-110 transition-transform">
                    <Zap size={24} className="fill-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border text-amber-400 bg-amber-500/10 border-amber-500/30">
                        Đấu Trường Trực Tuyến
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Hot Nhất
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white mt-1 group-hover:text-amber-300 transition-colors">
                      Dự Đoán ×2 Đám Đông (Crowd 2X)
                    </h3>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-bold flex items-center gap-1 shrink-0 animate-pulse">
                  <Flame size={12} />
                  Phòng Đấu Trực Tiếp
                </span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Đấu trường dự đoán câu hỏi theo số đông độc đáo! Đặt cược Xu từ 20 đến 2,000 Xu, chọn phe A hoặc B và nhân đôi số Xu khi dự đoán chính xác cùng đám đông.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/80 text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Coins size={14} />
                  <span>Phần thưởng: ×2 Số Xu Đặt Cược</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
                  <Users size={13} />
                  <span>1,240 người đang chơi</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-2">
              <button
                onClick={() => handleSelectGame('crowd2x')}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-98"
              >
                <Play size={16} className="fill-current" />
                <span>CHƠI TRÒ NÀY (LÊN SÀN ĐẤU)</span>
              </button>
            </div>
          </div>

          {featuredGames
            .filter(g => selectedGameFilter === 'all' || g.category === selectedGameFilter)
            .map((game) => {
              const GameIcon = game.icon;
              return (
                <div
                  key={game.id}
                  className={`relative overflow-hidden rounded-3xl border ${game.borderAccent} bg-gradient-to-br ${game.accentGradient} p-6 shadow-xl transition-all duration-300 hover:scale-[1.01] group flex flex-col justify-between`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
                          <GameIcon size={24} className="text-indigo-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${game.difficultyColor}`}>
                              {game.categoryLabel}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {game.difficulty}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-white mt-1 group-hover:text-indigo-300 transition-colors">
                            {game.title}
                          </h3>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-bold flex items-center gap-1 shrink-0 animate-pulse">
                        <Flame size={12} />
                        Đang Mở
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                      {game.desc}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/80 text-xs">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                        <Coins size={14} />
                        <span>Phần thưởng: {game.rewardText}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
                        <Users size={13} />
                        <span>{game.playersOnline} người đang chơi</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-2">
                    <button
                      onClick={() => handleSelectGame(game.id as HaevyGamesSubTab)}
                      className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 active:scale-98"
                    >
                      <Play size={16} className="fill-current" />
                      <span>CHƠI TRÒ NÀY (LÊN SÀN ĐẤU)</span>
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 6: UNIFIED LEADERBOARD (BẢNG XẾP HẠNG TOÀN SERVER) */}
      {/* ========================================================================= */}
      <div id="haevy-games-leaderboard" className="space-y-6 pt-4 border-t border-zinc-800/80 scroll-mt-6">
        {/* Leaderboard Header */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/60 via-yellow-950/30 to-zinc-950 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 w-fit shadow-sm">
                <Trophy size={14} className="text-amber-400" />
                Bảng Vinh Danh Game Thủ
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Bảng Xếp Hạng Cao Thủ Toàn Server 🏆
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300">
                Đua top điểm số các trận đấu để nhận phần thưởng gói VIP Hoàng Gia và huy hiệu danh dự độc quyền mỗi tuần!
              </p>
            </div>

            {/* Timeframe Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 p-1.5 rounded-2xl shrink-0">
              {(['weekly', 'monthly', 'alltime'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedTimeframe === tf
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black scale-[1.02]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tf === 'weekly' && 'Tuần Này'}
                  {tf === 'monthly' && 'Tháng Này'}
                  {tf === 'alltime' && 'Tất Cả'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Top 3 Podium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Top 2 - Silver */}
          <div className="order-2 md:order-1 bg-zinc-900/70 border border-zinc-700/60 rounded-3xl p-5 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-3 left-3 px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-full text-[10px] font-black border border-zinc-600">
              #2 Á QUÂN
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 p-1 shadow-lg shadow-cyan-500/20 mt-3">
              <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center text-lg font-black text-white">
                {leaderboardData[1].name.slice(0, 1)}
              </div>
            </div>
            <h3 className="text-base font-black text-white mt-3">{leaderboardData[1].name}</h3>
            <p className="text-xs text-cyan-400 font-bold">{leaderboardData[1].tier}</p>
            <div className="mt-3 py-1.5 px-4 bg-zinc-950 rounded-xl border border-zinc-800 text-sm font-black text-amber-400 font-mono">
              {leaderboardData[1].score.toLocaleString('vi-VN')} Điểm
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">Thưởng: {leaderboardData[1].reward}</p>
          </div>

          {/* Top 1 - Gold (Centered & Elevated) */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-950/50 to-zinc-900/90 border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden md:-translate-y-2">
            <div className="absolute top-3 left-3 px-2.5 py-0.5 bg-amber-500 text-black rounded-full text-[10px] font-black shadow-md flex items-center gap-1">
              <Crown size={12} className="fill-black" />
              #1 QUÁN QUÂN
            </div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 p-1 shadow-xl shadow-amber-500/30 mt-2">
              <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center text-2xl font-black text-amber-400">
                {leaderboardData[0].name.slice(0, 1)}
              </div>
            </div>
            <h3 className="text-lg font-black text-white mt-3 flex items-center gap-1.5">
              {leaderboardData[0].name}
              <Crown size={16} className="text-amber-400 fill-amber-400" />
            </h3>
            <p className="text-xs text-amber-400 font-black">{leaderboardData[0].tier}</p>
            <div className="mt-3 py-2 px-5 bg-amber-500/20 rounded-xl border border-amber-500/40 text-base font-black text-amber-300 font-mono">
              {leaderboardData[0].score.toLocaleString('vi-VN')} Điểm
            </div>
            <p className="text-[11px] text-amber-300/80 font-bold mt-2">Thưởng: {leaderboardData[0].reward}</p>
          </div>

          {/* Top 3 - Bronze */}
          <div className="order-3 md:order-3 bg-zinc-900/70 border border-zinc-700/60 rounded-3xl p-5 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-3 left-3 px-2 py-0.5 bg-amber-900/80 text-amber-300 rounded-full text-[10px] font-black border border-amber-700/60">
              #3 QUÝ QUÂN
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-orange-700 p-1 shadow-lg shadow-orange-500/20 mt-3">
              <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center text-lg font-black text-white">
                {leaderboardData[2].name.slice(0, 1)}
              </div>
            </div>
            <h3 className="text-base font-black text-white mt-3">{leaderboardData[2].name}</h3>
            <p className="text-xs text-emerald-400 font-bold">{leaderboardData[2].tier}</p>
            <div className="mt-3 py-1.5 px-4 bg-zinc-950 rounded-xl border border-zinc-800 text-sm font-black text-amber-400 font-mono">
              {leaderboardData[2].score.toLocaleString('vi-VN')} Điểm
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">Thưởng: {leaderboardData[2].reward}</p>
          </div>
        </div>

        {/* Full Leaderboard Table */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 size={18} className="text-amber-400" />
            Bảng Tổng Sắp Hạng Toàn Server
          </h3>

          <div className="space-y-2">
            {leaderboardData.map((player) => (
              <div
                key={player.rank}
                className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-7 sm:w-8 text-center shrink-0 font-black text-sm sm:text-base font-mono">
                    {player.rank === 1 && <span className="text-amber-400">🥇</span>}
                    {player.rank === 2 && <span className="text-slate-300">🥈</span>}
                    {player.rank === 3 && <span className="text-amber-700">🥉</span>}
                    {player.rank > 3 && <span className="text-zinc-500">#{player.rank}</span>}
                  </div>

                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${player.avatarBg}`}>
                    {player.name.slice(0, 1)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white truncate">{player.name}</span>
                      {player.isVip && (
                        <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[9px] font-bold">
                          VIP
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-0.5">
                      <span>{player.accountId}</span>
                      <span>•</span>
                      <span className="text-zinc-300 font-medium">{player.tier}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm sm:text-base font-black text-amber-400 font-mono">
                    {player.score.toLocaleString('vi-VN')}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-medium">
                    Tỉ lệ thắng: {player.winRate} ({player.gamesPlayed} trận)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User's Current Standing Card */}
        <div className="bg-gradient-to-r from-indigo-950/80 via-zinc-900 to-zinc-950 border border-indigo-500/30 rounded-3xl p-5 shadow-xl flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-black text-lg">
              #--
            </div>
            <div>
              <p className="text-xs text-zinc-400">Xếp Hạng Hiện Tại Của Bạn</p>
              <h4 className="text-base font-black text-white flex items-center gap-2 mt-0.5">
                {user?.displayName || 'Chưa Xếp Hạng'}
                <span className="text-xs font-mono font-normal text-zinc-400">({accountId || 'GUEST'})</span>
              </h4>
              <p className="text-[11px] text-indigo-300 font-medium mt-0.5">
                Hãy tham gia trận đấu đầu tiên để ghi danh vào Bảng Xếp Hạng!
              </p>
            </div>
          </div>

          <button
            onClick={() => handleSelectGame('crowd2x')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            Lên Sàn Đấu Ngay
          </button>
        </div>
      </div>
    </div>
  );
}
