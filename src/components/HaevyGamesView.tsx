import React, { useState, useEffect } from 'react';
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
  Gift,
  ArrowLeft,
  RefreshCw,
  Check,
  Search,
  Headphones,
  Sliders
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Crowd2xGameArena } from './games/Crowd2xGameArena';
import { MelodyQuizGame } from './games/MelodyQuizGame';
import { RhythmRushGame } from './games/RhythmRushGame';
import { LuckyWheelGame } from './games/LuckyWheelGame';
import { MusicTriviaGame } from './games/MusicTriviaGame';
import { CardGameTable } from './games/cards/CardGameTable';
import { CardGameType } from './games/cards/cardTypes';

export type HaevyGamesSubTab = 
  | 'home' 
  | 'tienlen_nam'
  | 'tienlen_bac'
  | 'tan'
  | 'phom'
  | 'crowd2x' 
  | 'melody_quiz' 
  | 'rhythm_rush' 
  | 'lucky_wheel' 
  | 'trivia_master' 
  | 'leaderboard' 
  | 'quests';

interface HaevyGamesViewProps {
  activeSubTab?: HaevyGamesSubTab;
  onSelectSubTab?: (subTab: HaevyGamesSubTab) => void;
  onOpenAuth?: () => void;
  onOpenVipHub?: () => void;
}

interface RealLeaderboardUser {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  accountId: string;
  audioPoints: number;
  totalEarnedPoints?: number;
  totalListenedMinutes?: number;
  vipTier?: string;
  role?: string;
}

interface DailyQuestItem {
  id: string;
  title: string;
  desc: string;
  rewardPoints: number;
  rewardType: 'points' | 'spin' | 'vip';
  rewardLabel: string;
  icon: any;
  targetGameId?: 'tienlen_nam' | 'tienlen_bac' | 'tan' | 'phom' | 'crowd2x' | 'melody_quiz' | 'rhythm_rush' | 'lucky_wheel' | 'trivia_master';
  completed: boolean;
  claimed: boolean;
}

export function HaevyGamesView({
  activeSubTab = 'home',
  onSelectSubTab,
  onOpenAuth,
  onOpenVipHub
}: HaevyGamesViewProps) {
  const { user, isVip, audioPoints, accountId, addAudioPoints, performDailyCheckin, lastDailyCheckin } = useAuth();
  
  // Active playing game (null = inside Game Lobby list; string = inside active game arena)
  const [playingGameId, setPlayingGameId] = useState<
    'tienlen_nam' | 'tienlen_bac' | 'tan' | 'phom' | 'crowd2x' | 'melody_quiz' | 'rhythm_rush' | 'lucky_wheel' | 'trivia_master' | null
  >(
    (activeSubTab && activeSubTab !== 'home' && activeSubTab !== 'leaderboard' && activeSubTab !== 'quests')
      ? activeSubTab as any
      : null
  );

  const [selectedGameFilter, setSelectedGameFilter] = useState<
    'all' | 'card_all' | 'crowd' | 'quiz' | 'rhythm' | 'wheel'
  >('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Leaderboard State (REAL DATA ONLY - NO FAKE / MOCK PROFILES)
  const [leaderboardUsers, setLeaderboardUsers] = useState<RealLeaderboardUser[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState<boolean>(true);
  const [rankingMetric, setRankingMetric] = useState<'audioPoints' | 'totalEarnedPoints' | 'totalListenedMinutes'>('audioPoints');

  // Daily Quests Claim State (Persisted in localStorage with date key)
  const todayKey = new Date().toISOString().split('T')[0];
  const [claimedQuestIds, setClaimedQuestIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`haevy_quests_claimed_${todayKey}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dailyCheckinDoneToday, setDailyCheckinDoneToday] = useState<boolean>(() => {
    if (lastDailyCheckin) {
      const lastDate = new Date(lastDailyCheckin).toISOString().split('T')[0];
      return lastDate === todayKey;
    }
    return false;
  });

  // Sync if prop changes
  useEffect(() => {
    if (activeSubTab === 'home') {
      // Return to Lobby unless a specific game is being played
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (activeSubTab === 'leaderboard' || activeSubTab === 'quests') {
      setPlayingGameId(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (activeSubTab && [
      'tienlen_nam',
      'tienlen_bac',
      'tan',
      'phom',
      'crowd2x',
      'melody_quiz',
      'rhythm_rush',
      'lucky_wheel',
      'trivia_master'
    ].includes(activeSubTab)) {
      setPlayingGameId(activeSubTab as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeSubTab]);

  // Fetch REAL Leaderboard Users from Firestore
  useEffect(() => {
    setLeaderboardLoading(true);
    const usersCol = collection(db, 'users');
    const q = query(usersCol, orderBy(rankingMetric, 'desc'), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const usersList: RealLeaderboardUser[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          usersList.push({
            uid: docSnap.id,
            displayName: data.displayName || data.email?.split('@')[0] || `Tài Khoản ${data.accountId || 'AH'}`,
            email: data.email,
            photoURL: data.photoURL,
            accountId: data.accountId || `AH-${docSnap.id.slice(0, 6).toUpperCase()}`,
            audioPoints: Number(data.audioPoints) || 0,
            totalEarnedPoints: Number(data.totalEarnedPoints) || Number(data.audioPoints) || 0,
            totalListenedMinutes: Number(data.totalListenedMinutes) || 0,
            vipTier: data.vipTier || 'free',
            role: data.role || 'user'
          });
        });
        setLeaderboardUsers(usersList);
        setLeaderboardLoading(false);
      },
      (err) => {
        console.warn('Leaderboard fetch fallback:', err);
        setLeaderboardLoading(false);
      }
    );

    return () => unsubscribe();
  }, [rankingMetric]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Launch a game from lobby
  const handleLaunchGame = (
    gameId: 'tienlen_nam' | 'tienlen_bac' | 'tan' | 'phom' | 'crowd2x' | 'melody_quiz' | 'rhythm_rush' | 'lucky_wheel' | 'trivia_master'
  ) => {
    setPlayingGameId(gameId);
    if (onSelectSubTab) {
      onSelectSubTab(gameId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return to Game Lobby list
  const handleBackToLobby = () => {
    setPlayingGameId(null);
    if (onSelectSubTab) {
      onSelectSubTab('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle claiming quest rewards
  const handleClaimQuest = async (quest: DailyQuestItem) => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      showToast('Vui lòng đăng nhập để nhận Xu thưởng nhiệm vụ!');
      return;
    }

    if (claimedQuestIds.includes(quest.id)) {
      showToast('Bạn đã nhận phần thưởng nhiệm vụ này hôm nay rồi!');
      return;
    }

    try {
      await addAudioPoints(quest.rewardPoints, `Thưởng nhiệm vụ: ${quest.title}`, 'daily_checkin');
      const updated = [...claimedQuestIds, quest.id];
      setClaimedQuestIds(updated);
      try {
        localStorage.setItem(`haevy_quests_claimed_${todayKey}`, JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving quest state:', e);
      }
      showToast(`Chúc mừng! Bạn đã nhận +${quest.rewardPoints.toLocaleString('vi-VN')} Xu thưởng thành công! 🎉`);
    } catch (e) {
      showToast('Có lỗi xảy ra khi nhận thưởng. Vui lòng thử lại!');
    }
  };

  // Handle Daily Checkin in Quests Tab
  const handleQuestDailyCheckin = async () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      showToast('Vui lòng đăng nhập để điểm danh nhận Xu!');
      return;
    }

    const res = await performDailyCheckin();
    if (res.success) {
      setDailyCheckinDoneToday(true);
      showToast(res.message);
    } else {
      showToast(res.message);
    }
  };

  // Featured games list for catalog
  const gameCatalog = [
    {
      id: 'tienlen_nam' as const,
      title: 'Tiến Lên Miền Nam 🃏',
      subtitle: '13 Lá Tự Do - Chặt Heo Thả Ga',
      desc: 'Luật chơi 13 lá tự do truyền thống, đánh sảnh chéo, 3 đôi thông, 4 đôi thông, tứ quý chặt heo cực đã. Thách đấu bạn bè bằng mã phòng hoặc ghép bàn ngẫu nhiên!',
      category: 'card_tlmn',
      categoryLabel: '🃏 TL Miền Nam',
      difficulty: 'Đấu Trí & Đỉnh Cao',
      difficultyColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      icon: Sparkles,
      rewardText: 'Cược Tự Do & 0 Xu Miễn Phí',
      isHot: true,
      playersOnline: 2150,
      accentGradient: 'from-amber-500/20 via-yellow-950/40 to-zinc-950',
      borderAccent: 'border-amber-500/40 hover:border-amber-400',
      buttonBg: 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-amber-500/20'
    },
    {
      id: 'tienlen_bac' as const,
      title: 'Tiến Lên Miền Bắc 🎴',
      subtitle: 'Đồng Chất Đồng Màu - Chuẩn Luật MB',
      desc: 'Đòi hỏi sự tinh tế chuẩn mực: Đôi phải cùng màu đỏ/đen, sảnh phải đồng chất, chặn bài nghiêm ngặt theo luật Miền Bắc. Đấu trí đỉnh cao cùng các cao thủ!',
      category: 'card_tlmb',
      categoryLabel: '🎴 TL Miền Bắc',
      difficulty: 'Đồng Chất Đồng Màu',
      difficultyColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      icon: Trophy,
      rewardText: 'Cược Tự Do & 0 Xu Miễn Phí',
      isHot: true,
      playersOnline: 1680,
      accentGradient: 'from-rose-500/20 via-red-950/40 to-zinc-950',
      borderAccent: 'border-rose-500/30 hover:border-rose-400',
      buttonBg: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/30'
    },
    {
      id: 'tan' as const,
      title: 'Bài Tấn (Đấu Trưởng) ⚔️',
      subtitle: 'Xác Định Chất Trưởng - Tấn & Đỡ Kịch Tính',
      desc: 'Trò chơi kinh điển xác định quân Trưởng từ nọc. Tấn dồn dập, đỡ bài quyết liệt và bẫy đối thủ ôm trọn bộ bài trên bàn! Chơi cùng bạn bè hoặc đấu Bot!',
      category: 'card_tan',
      categoryLabel: '⚔️ Bài Tấn',
      difficulty: 'Tấn Công & Phòng Thủ',
      difficultyColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      icon: ShieldCheck,
      rewardText: 'Cược Tự Do & 0 Xu Miễn Phí',
      isHot: true,
      playersOnline: 1320,
      accentGradient: 'from-orange-500/20 via-amber-950/40 to-zinc-950',
      borderAccent: 'border-orange-500/30 hover:border-orange-400',
      buttonBg: 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-orange-600/30'
    },
    {
      id: 'phom' as const,
      title: 'Bài Phỏm (Tá Lả) 🀄',
      subtitle: 'Ăn Bài Tạo Phỏm - Bốc Nọc - Đền Ù Rực Rỡ',
      desc: 'Ăn bài tạo phỏm 3-4 cây cùng số hoặc sảnh đồng chất, đánh rác tính toán, gửi bài vào phỏm người khác và hạ điểm giật ngôi Quán Quân!',
      category: 'card_phom',
      categoryLabel: '🀄 Bài Phỏm',
      difficulty: 'Tính Toán Sâu Sắc',
      difficultyColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      icon: Target,
      rewardText: 'Cược Tự Do & 0 Xu Miễn Phí',
      isHot: true,
      playersOnline: 1890,
      accentGradient: 'from-purple-500/20 via-indigo-950/40 to-zinc-950',
      borderAccent: 'border-purple-500/30 hover:border-purple-400',
      buttonBg: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30'
    },
    {
      id: 'crowd2x' as const,
      title: 'Dự Đoán ×2 Đám Đông (Crowd 2X)',
      subtitle: 'Real-time Cyber Prediction Arena',
      desc: 'Sàn đấu dự đoán xu hướng câu hỏi thời gian thực cực nóng! Đặt cược Xu từ 20 đến 2,000 Xu, chọn phe A hoặc B. Bên đa số thắng nhận trọn x2 số Xu đặt cược!',
      category: 'crowd',
      categoryLabel: 'Sàn Đấu Trực Tuyến',
      difficulty: 'Thử Thách & Căng Thẳng',
      difficultyColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      icon: Zap,
      rewardText: 'Nhân Đôi ×2 Số Xu Đặt',
      isHot: true,
      playersOnline: 1420,
      accentGradient: 'from-amber-500/20 via-yellow-950/40 to-zinc-950',
      borderAccent: 'border-amber-500/40 hover:border-amber-400',
      buttonBg: 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-amber-500/20'
    },
    {
      id: 'melody_quiz' as const,
      title: 'Đoán Giai Điệu Bài Hát',
      subtitle: 'Audio Melody Guessing Arena',
      desc: 'Lắng nghe đoạn nhạc bản hit bí ẩn, chọn nhanh tên bài hát hoặc ca sĩ trong 10 giây. Đạt chuỗi Combo để nhân đôi số Xu thưởng!',
      category: 'quiz',
      categoryLabel: 'Đố Vui Âm Nhạc',
      difficulty: 'Trung Bình',
      difficultyColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      icon: Music,
      rewardText: '+50 ~ +200 Xu / Trận',
      isHot: false,
      playersOnline: 480,
      accentGradient: 'from-purple-500/20 via-indigo-950/40 to-zinc-950',
      borderAccent: 'border-purple-500/30 hover:border-purple-400',
      buttonBg: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30'
    },
    {
      id: 'rhythm_rush' as const,
      title: 'Đấu Nhịp Điệu (Rhythm Tap)',
      subtitle: 'Beat & Note Synchronization',
      desc: 'Chạm các phím [D] [F] [J] [K] hoặc chạm màn hình chính xác theo tiết tấu nốt nhạc đang rơi. Đạt Perfect để bứt phá bảng xếp hạng toàn server!',
      category: 'rhythm',
      categoryLabel: 'Phản Xạ Tiết Tấu',
      difficulty: 'Khó & Tốc Độ',
      difficultyColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      icon: Flame,
      rewardText: '+60 ~ +200 Xu / Màn',
      isHot: false,
      playersOnline: 620,
      accentGradient: 'from-cyan-500/20 via-blue-950/40 to-zinc-950',
      borderAccent: 'border-cyan-500/30 hover:border-cyan-400',
      buttonBg: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/30'
    },
    {
      id: 'lucky_wheel' as const,
      title: 'Vòng Quay May Mắn Audio',
      subtitle: 'Daily Lucky Wheel of Fortune',
      desc: 'Quay số rinh thưởng mỗi ngày: Cơ hội trúng gói VIP Hoàng Gia, Jackpot 1,500 Xu, thẻ đổi tên và hàng ngàn Xu thưởng giá trị!',
      category: 'wheel',
      categoryLabel: 'Vòng Quay Hàng Ngày',
      difficulty: 'Dễ Dàng May Mắn',
      difficultyColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      icon: Dices,
      rewardText: 'VIP Hoàng Gia & Tới 1,500 Xu',
      isHot: true,
      playersOnline: 940,
      accentGradient: 'from-emerald-500/20 via-teal-950/40 to-zinc-950',
      borderAccent: 'border-emerald-500/30 hover:border-emerald-400',
      buttonBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
    },
    {
      id: 'trivia_master' as const,
      title: 'Thử Tài Tri Thức Âm Nhạc',
      subtitle: 'Vietnamese & World Music Trivia',
      desc: 'Hàng trăm câu hỏi trắc nghiệm chuyên sâu về lịch sử âm nhạc, tiểu sử danh ca, các ca khúc bất hủ cùng 3 quyền trợ giúp thông minh.',
      category: 'quiz',
      categoryLabel: 'Kiến Thức & Trivia',
      difficulty: 'Thử Thách Trí Tuệ',
      difficultyColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
      icon: Target,
      rewardText: 'Lên Tới +1,500 Xu / Chuỗi',
      isHot: false,
      playersOnline: 310,
      accentGradient: 'from-sky-500/20 via-blue-950/40 to-zinc-950',
      borderAccent: 'border-sky-500/30 hover:border-sky-400',
      buttonBg: 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-sky-600/30'
    }
  ];

  // Daily Quests Definition
  const dailyQuests: DailyQuestItem[] = [
    {
      id: 'quest_login_lobby',
      title: 'Điểm Danh Sảnh Game',
      desc: 'Ghé thăm sảnh game Haevy Games mỗi ngày',
      rewardPoints: 50,
      rewardType: 'points',
      rewardLabel: '+50 Xu Audio',
      icon: Gamepad2,
      completed: true,
      claimed: claimedQuestIds.includes('quest_login_lobby')
    },
    {
      id: 'quest_card_tlmn',
      title: 'Sát Thủ Tiến Lên Miền Nam',
      desc: 'Tham gia 1 ván Tiến Lên Miền Nam hoặc chặt heo đối thủ',
      rewardPoints: 60,
      rewardType: 'points',
      rewardLabel: '+60 Xu Audio',
      icon: Sparkles,
      targetGameId: 'tienlen_nam',
      completed: false,
      claimed: claimedQuestIds.includes('quest_card_tlmn')
    },
    {
      id: 'quest_card_phom',
      title: 'Bậc Thầy Tá Lả Phỏm',
      desc: 'Ăn bài tạo phỏm hoặc hạ bài trong ván Phỏm Tá Lả',
      rewardPoints: 60,
      rewardType: 'points',
      rewardLabel: '+60 Xu Audio',
      icon: Trophy,
      targetGameId: 'phom',
      completed: false,
      claimed: claimedQuestIds.includes('quest_card_phom')
    },
    {
      id: 'quest_crowd_bet',
      title: 'Tham Gia Sàn Đấu ×2 Đám Đông',
      desc: 'Đặt 1 ván dự đoán theo số đông để thử tài phán đoán',
      rewardPoints: 40,
      rewardType: 'points',
      rewardLabel: '+40 Xu Audio',
      icon: Zap,
      targetGameId: 'crowd2x',
      completed: false,
      claimed: claimedQuestIds.includes('quest_crowd_bet')
    },
    {
      id: 'quest_melody_guess',
      title: 'Đôi Tai Vàng Giai Điệu',
      desc: 'Thử tài nghe và đoán đúng bài hát trong Đoán Giai Điệu',
      rewardPoints: 50,
      rewardType: 'points',
      rewardLabel: '+50 Xu Audio',
      icon: Music,
      targetGameId: 'melody_quiz',
      completed: false,
      claimed: claimedQuestIds.includes('quest_melody_guess')
    },
    {
      id: 'quest_rhythm_play',
      title: 'Chinh Phục Tiết Tấu',
      desc: 'Chơi 1 màn trong game Đấu Nhịp Điệu (Rhythm Tap)',
      rewardPoints: 50,
      rewardType: 'points',
      rewardLabel: '+50 Xu Audio',
      icon: Flame,
      targetGameId: 'rhythm_rush',
      completed: false,
      claimed: claimedQuestIds.includes('quest_rhythm_play')
    },
    {
      id: 'quest_lucky_spin',
      title: 'Thử Vận May Vòng Quay',
      desc: 'Quay 1 lượt trong Vòng Quay May Mắn Audio',
      rewardPoints: 30,
      rewardType: 'spin',
      rewardLabel: '+30 Xu & Free Spin',
      icon: Dices,
      targetGameId: 'lucky_wheel',
      completed: false,
      claimed: claimedQuestIds.includes('quest_lucky_spin')
    },
    {
      id: 'quest_trivia_knowledge',
      title: 'Nhà Thông Thái Âm Nhạc',
      desc: 'Trả lời đúng 3 câu hỏi Tri Thức Âm Nhạc',
      rewardPoints: 60,
      rewardType: 'points',
      rewardLabel: '+60 Xu Audio',
      icon: Target,
      targetGameId: 'trivia_master',
      completed: false,
      claimed: claimedQuestIds.includes('quest_trivia_knowledge')
    }
  ];

  // User's Real Rank Calculation
  const currentUserRankIndex = leaderboardUsers.findIndex(u => u.uid === user?.uid);
  const currentUserRank = currentUserRankIndex !== -1 ? currentUserRankIndex + 1 : null;

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
      {/* CASE 1: USER IS ACTIVELY PLAYING A GAME (OPENED FROM GAME HOME)           */}
      {/* ========================================================================= */}
      {playingGameId !== null ? (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Top Bar with Back Button */}
          <div className="flex items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 px-5 shadow-xl backdrop-blur-md">
            <button
              type="button"
              onClick={handleBackToLobby}
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 px-3.5 py-2 rounded-xl transition-all cursor-pointer group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>← Quay Lại Danh Sách Game</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
                <Coins size={15} className="text-amber-400 shrink-0" />
                <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
                  {(audioPoints || 0).toLocaleString('vi-VN')}
                </span>
                <span className="text-[10px] text-zinc-400">Xu</span>
              </div>
            </div>
          </div>

          {/* Active Game Component */}
          <div className="min-h-[500px]">
            {(playingGameId === 'tienlen_nam' || 
              playingGameId === 'tienlen_bac' || 
              playingGameId === 'tan' || 
              playingGameId === 'phom') && (
              <CardGameTable
                gameType={playingGameId}
                onExit={handleBackToLobby}
                onOpenAuth={onOpenAuth}
                onOpenVipHub={onOpenVipHub}
              />
            )}

            {playingGameId === 'crowd2x' && (
              <Crowd2xGameArena
                onBackToLobby={handleBackToLobby}
                onOpenAuth={onOpenAuth}
                onOpenVipHub={onOpenVipHub}
              />
            )}

            {playingGameId === 'melody_quiz' && (
              <MelodyQuizGame
                onBackToLobby={handleBackToLobby}
                onOpenAuth={onOpenAuth}
              />
            )}

            {playingGameId === 'rhythm_rush' && (
              <RhythmRushGame
                onBackToLobby={handleBackToLobby}
                onOpenAuth={onOpenAuth}
              />
            )}

            {playingGameId === 'lucky_wheel' && (
              <LuckyWheelGame
                onBackToLobby={handleBackToLobby}
                onOpenAuth={onOpenAuth}
                onOpenVipHub={onOpenVipHub}
              />
            )}

            {playingGameId === 'trivia_master' && (
              <MusicTriviaGame
                onBackToLobby={handleBackToLobby}
                onOpenAuth={onOpenAuth}
              />
            )}
          </div>
        </div>
      ) : activeSubTab === 'quests' ? (
        /* ========================================================================= */
        /* PAGE 2: TRANG NHIỆM VỤ (QUESTS & MISSIONS)                                 */
        /* ========================================================================= */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Quests Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/60 via-orange-950/30 to-zinc-950 p-6 sm:p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 w-fit shadow-sm">
                  <Flame size={14} className="text-amber-400 fill-amber-400 animate-pulse" />
                  Nhiệm Vụ & Thành Tựu
                </span>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                  Nhiệm Vụ Game Thủ Hàng Ngày 📜
                </h1>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Hoàn thành các nhiệm vụ chơi game mỗi ngày để tích lũy Xu Audio thật, mở khóa vòng quay miễn phí và ghi danh vào Bảng Xếp Hạng.
                </p>
              </div>

              {/* User Balance Box */}
              <div className="w-full md:w-auto shrink-0 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between md:flex-col md:items-end gap-3 shadow-xl">
                <div>
                  <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Ví Xu Của Bạn</p>
                  <p className="text-sm font-bold text-white mt-0.5">{user?.displayName || 'Khách Chơi Game'}</p>
                </div>
                <div className="flex items-center gap-2 bg-zinc-950 px-3.5 py-2 rounded-xl border border-zinc-800">
                  <Coins size={16} className="text-amber-400 shrink-0" />
                  <span className="text-base font-black text-amber-400 font-mono">{(audioPoints || 0).toLocaleString('vi-VN')}</span>
                  <span className="text-xs text-zinc-400 font-semibold">Xu</span>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Check-in Streak Section */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Calendar size={20} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">Điểm Danh Nhận Xu 7 Ngày Liên Tiếp</h2>
                  <p className="text-xs text-zinc-400">Điểm danh liên tục mỗi ngày để nhận số Xu tăng lũy tiến</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleQuestDailyCheckin}
                disabled={dailyCheckinDoneToday}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
                  dailyCheckinDoneToday
                    ? 'bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-amber-500/20 active:scale-95'
                }`}
              >
                {dailyCheckinDoneToday ? (
                  <>
                    <Check size={16} className="text-emerald-400" />
                    <span>Đã Điểm Danh Hôm Nay</span>
                  </>
                ) : (
                  <>
                    <Gift size={16} className="fill-black" />
                    <span>Điểm Danh Nhận +100 Xu</span>
                  </>
                )}
              </button>
            </div>

            {/* 7 Day Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 pt-2">
              {[
                { day: 'Ngày 1', points: 50, active: true },
                { day: 'Ngày 2', points: 70, active: true },
                { day: 'Ngày 3', points: 100, active: true },
                { day: 'Ngày 4', points: 120, active: false },
                { day: 'Ngày 5', points: 150, active: false },
                { day: 'Ngày 6', points: 200, active: false },
                { day: 'Ngày 7', points: 300, special: 'Jackpot', active: false },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between gap-2 transition-all ${
                    idx === 0
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300'
                  }`}
                >
                  <span className="text-[11px] font-bold text-zinc-400">{item.day}</span>
                  <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-amber-400 border border-zinc-800">
                    <Coins size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-amber-400 font-mono">+{item.points}</span>
                    {item.special && (
                      <span className="block text-[9px] font-bold text-emerald-400 mt-0.5">🎁 Thưởng Lớn</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Quests List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400" />
                Danh Sách Nhiệm Vụ Hàng Ngày
              </h2>
              <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                Làm mới lúc 00:00 hàng ngày
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dailyQuests.map((quest) => {
                const QuestIcon = quest.icon;
                const isClaimed = quest.claimed;

                return (
                  <div
                    key={quest.id}
                    className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700/80 transition-all flex flex-col justify-between gap-4 shadow-lg group"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                        <QuestIcon size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-bold text-white truncate">{quest.title}</h3>
                        <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{quest.desc}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-lg flex items-center gap-1 font-mono">
                            <Coins size={12} /> {quest.rewardLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/60">
                      {quest.targetGameId && !isClaimed && (
                        <button
                          type="button"
                          onClick={() => {
                            if (quest.targetGameId) {
                              handleLaunchGame(quest.targetGameId);
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Play size={13} className="fill-current" />
                          <span>Chơi Ngay</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleClaimQuest(quest)}
                        disabled={isClaimed}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                          isClaimed
                            ? 'bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-amber-500/20 active:scale-95'
                        }`}
                      >
                        {isClaimed ? (
                          <>
                            <Check size={14} className="text-emerald-400" />
                            <span>Đã Nhận Thưởng</span>
                          </>
                        ) : (
                          <>
                            <Gift size={14} className="fill-black" />
                            <span>Nhận Thưởng</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : activeSubTab === 'leaderboard' ? (
        /* ========================================================================= */
        /* PAGE 3: TRANG BẢNG XẾP HẠNG (LEADERBOARD - 100% REAL DATA FROM FIRESTORE) */
        /* ========================================================================= */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Leaderboard Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/70 via-yellow-950/30 to-zinc-950 p-6 sm:p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 w-fit shadow-sm">
                  <Trophy size={14} className="text-amber-400" />
                  Bảng Vinh Danh Toàn Server
                </span>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  Bảng Xếp Hạng Game Thủ 🏆
                </h1>
                <p className="text-xs sm:text-sm text-zinc-300">
                  Xếp hạng thời gian thực dựa trên dữ liệu người dùng thực tế từ hệ thống. Kiếm Xu từ các trò chơi âm nhạc để leo bảng vàng!
                </p>
              </div>

              {/* Metric filter buttons */}
              <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 p-1.5 rounded-2xl shrink-0">
                <button
                  type="button"
                  onClick={() => setRankingMetric('audioPoints')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    rankingMetric === 'audioPoints'
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black scale-[1.02]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Top Đại Gia Xu
                </button>
                <button
                  type="button"
                  onClick={() => setRankingMetric('totalEarnedPoints')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    rankingMetric === 'totalEarnedPoints'
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black scale-[1.02]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Top Tích Lũy
                </button>
                <button
                  type="button"
                  onClick={() => setRankingMetric('totalListenedMinutes')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    rankingMetric === 'totalListenedMinutes'
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black scale-[1.02]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Top Nghe Nhạc
                </button>
              </div>
            </div>
          </div>

          {/* Current User's Real Standing Card */}
          <div className="bg-gradient-to-r from-indigo-950/80 via-zinc-900 to-zinc-950 border border-indigo-500/30 rounded-3xl p-5 shadow-xl flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-black text-base sm:text-lg">
                {currentUserRank ? `#${currentUserRank}` : '#--'}
              </div>
              <div>
                <p className="text-xs text-zinc-400">Xếp Hạng Thực Tế Của Bạn</p>
                <h4 className="text-base font-black text-white flex items-center gap-2 mt-0.5">
                  {user?.displayName || 'Khách Chơi Game'}
                  <span className="text-xs font-mono font-normal text-zinc-400">({accountId || 'GUEST'})</span>
                  {isVip && <Crown size={15} className="text-amber-400 fill-amber-400" />}
                </h4>
                <p className="text-xs text-amber-400 font-mono font-bold mt-0.5">
                  {(audioPoints || 0).toLocaleString('vi-VN')} Xu Audio
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onSelectSubTab) onSelectSubTab('home');
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              Vào Chơi Game Kiếm Xu
            </button>
          </div>

          {/* Top 3 Podium (Derived strictly from real users) */}
          {leaderboardUsers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Top 2 - Silver */}
              {leaderboardUsers.length > 1 && (
                <div className="order-2 md:order-1 bg-zinc-900/70 border border-zinc-700/60 rounded-3xl p-5 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-3 left-3 px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-full text-[10px] font-black border border-zinc-600">
                    #2 Á QUÂN
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 p-1 shadow-lg shadow-cyan-500/20 mt-3">
                    {leaderboardUsers[1].photoURL ? (
                      <img
                        src={leaderboardUsers[1].photoURL}
                        alt={leaderboardUsers[1].displayName}
                        className="w-full h-full rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center text-lg font-black text-white">
                        {leaderboardUsers[1].displayName.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-black text-white mt-3 truncate max-w-[200px]">{leaderboardUsers[1].displayName}</h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">{leaderboardUsers[1].accountId}</p>
                  <div className="mt-3 py-1.5 px-4 bg-zinc-950 rounded-xl border border-zinc-800 text-sm font-black text-amber-400 font-mono">
                    {rankingMetric === 'totalListenedMinutes' 
                      ? `${(leaderboardUsers[1].totalListenedMinutes || 0).toLocaleString('vi-VN')} Phút`
                      : `${leaderboardUsers[1].audioPoints.toLocaleString('vi-VN')} Xu`}
                  </div>
                </div>
              )}

              {/* Top 1 - Gold (Centered & Elevated) */}
              {leaderboardUsers.length > 0 && (
                <div className="order-1 md:order-2 bg-gradient-to-b from-amber-950/50 to-zinc-900/90 border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden md:-translate-y-2">
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 bg-amber-500 text-black rounded-full text-[10px] font-black shadow-md flex items-center gap-1">
                    <Crown size={12} className="fill-black" />
                    #1 QUÁN QUÂN
                  </div>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 p-1 shadow-xl shadow-amber-500/30 mt-2">
                    {leaderboardUsers[0].photoURL ? (
                      <img
                        src={leaderboardUsers[0].photoURL}
                        alt={leaderboardUsers[0].displayName}
                        className="w-full h-full rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center text-2xl font-black text-amber-400">
                        {leaderboardUsers[0].displayName.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-white mt-3 flex items-center gap-1.5 truncate max-w-[220px]">
                    {leaderboardUsers[0].displayName}
                    <Crown size={16} className="text-amber-400 fill-amber-400 shrink-0" />
                  </h3>
                  <p className="text-xs text-amber-400 font-mono mt-0.5">{leaderboardUsers[0].accountId}</p>
                  <div className="mt-3 py-2 px-5 bg-amber-500/20 rounded-xl border border-amber-500/40 text-base font-black text-amber-300 font-mono">
                    {rankingMetric === 'totalListenedMinutes' 
                      ? `${(leaderboardUsers[0].totalListenedMinutes || 0).toLocaleString('vi-VN')} Phút`
                      : `${leaderboardUsers[0].audioPoints.toLocaleString('vi-VN')} Xu`}
                  </div>
                </div>
              )}

              {/* Top 3 - Bronze */}
              {leaderboardUsers.length > 2 && (
                <div className="order-3 md:order-3 bg-zinc-900/70 border border-zinc-700/60 rounded-3xl p-5 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-3 left-3 px-2 py-0.5 bg-amber-900/80 text-amber-300 rounded-full text-[10px] font-black border border-amber-700/60">
                    #3 QUÝ QUÂN
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-orange-700 p-1 shadow-lg shadow-orange-500/20 mt-3">
                    {leaderboardUsers[2].photoURL ? (
                      <img
                        src={leaderboardUsers[2].photoURL}
                        alt={leaderboardUsers[2].displayName}
                        className="w-full h-full rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center text-lg font-black text-white">
                        {leaderboardUsers[2].displayName.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-black text-white mt-3 truncate max-w-[200px]">{leaderboardUsers[2].displayName}</h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">{leaderboardUsers[2].accountId}</p>
                  <div className="mt-3 py-1.5 px-4 bg-zinc-950 rounded-xl border border-zinc-800 text-sm font-black text-amber-400 font-mono">
                    {rankingMetric === 'totalListenedMinutes' 
                      ? `${(leaderboardUsers[2].totalListenedMinutes || 0).toLocaleString('vi-VN')} Phút`
                      : `${leaderboardUsers[2].audioPoints.toLocaleString('vi-VN')} Xu`}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Real Leaderboard Table */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 size={18} className="text-amber-400" />
              Bảng Tổng Sắp Thành Viên Thực Tế
            </h3>

            {leaderboardLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
                <RefreshCw size={24} className="animate-spin text-amber-400" />
                <p className="text-xs">Đang tải bảng xếp hạng thực tế từ máy chủ...</p>
              </div>
            ) : leaderboardUsers.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 space-y-2">
                <Trophy size={36} className="mx-auto text-zinc-600" />
                <p className="text-sm font-bold text-zinc-300">Chưa có dữ liệu người chơi</p>
                <p className="text-xs">Hãy tham gia chơi các trò chơi âm nhạc để trở thành người đầu tiên đứng đầu bảng vàng!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboardUsers.map((player, idx) => {
                  const rank = idx + 1;
                  const isCurrent = player.uid === user?.uid;

                  return (
                    <div
                      key={player.uid}
                      className={`flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl transition-all ${
                        isCurrent
                          ? 'bg-amber-500/10 border-2 border-amber-500/50 shadow-md shadow-amber-500/10'
                          : 'bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="w-7 sm:w-8 text-center shrink-0 font-black text-sm sm:text-base font-mono">
                          {rank === 1 && <span className="text-amber-400">🥇</span>}
                          {rank === 2 && <span className="text-slate-300">🥈</span>}
                          {rank === 3 && <span className="text-amber-700">🥉</span>}
                          {rank > 3 && <span className="text-zinc-500">#{rank}</span>}
                        </div>

                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white overflow-hidden border border-zinc-700">
                          {player.photoURL ? (
                            <img
                              src={player.photoURL}
                              alt={player.displayName}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            player.displayName.slice(0, 1).toUpperCase()
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white truncate">{player.displayName}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 bg-amber-500 text-black rounded text-[9px] font-black">
                                BẠN
                              </span>
                            )}
                            {player.vipTier && player.vipTier !== 'free' && (
                              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[9px] font-bold flex items-center gap-0.5">
                                <Crown size={9} /> VIP
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-0.5">
                            <span>{player.accountId}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm sm:text-base font-black text-amber-400 font-mono">
                          {rankingMetric === 'totalListenedMinutes'
                            ? `${(player.totalListenedMinutes || 0).toLocaleString('vi-VN')} phút`
                            : `${player.audioPoints.toLocaleString('vi-VN')} Xu`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* PAGE 1: TRANG GAME / SẢNH GAME CATALOG (CHƯA VÀO GAME, CHỌN ĐỂ CHƠI)      */
        /* ========================================================================= */
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Hero Banner Sảnh Game */}
          <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/80 via-purple-950/40 to-zinc-950 p-6 sm:p-8 shadow-2xl">
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
                    5 Trò Chơi Sẵn Sàng
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                  Sảnh Trò Chơi Âm Nhạc 🎮
                </h1>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  Khám phá toàn bộ trò chơi tương tác giải trí trên Haevy! Nhấn <strong className="text-amber-400">"Chơi Ngay"</strong> trên bất kỳ game nào để bắt đầu so tài, tích lũy Xu và leo Bảng Xếp Hạng.
                </p>
              </div>

              {/* User Stat Card */}
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

          {/* Filter Bar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <Gamepad2 size={20} className="text-amber-400" />
                  Tất Cả Các Trò Chơi (Bấm Vào Để Chơi)
                </h2>
                <p className="text-xs text-zinc-400">Chọn một trò chơi bên dưới để tham gia sảnh thi đấu trực tiếp</p>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-1 max-w-full">
                {(
                  [
                    { id: 'all', label: 'Tất Cả Game' },
                    { id: 'card_all', label: '🃏 Game Bài' },
                    { id: 'crowd', label: '×2 Đám Đông' },
                    { id: 'quiz', label: 'Đố Vui Âm Nhạc' },
                    { id: 'rhythm', label: 'Phản Xạ Tiết Tấu' },
                    { id: 'wheel', label: 'Vòng Quay May Mắn' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedGameFilter(cat.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      selectedGameFilter === cat.id
                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of All Game Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {gameCatalog
                .filter((g) => {
                  if (selectedGameFilter === 'all') return true;
                  if (selectedGameFilter === 'card_all') {
                    return g.category === 'card_tlmn' || g.category === 'card_tlmb' || g.category === 'card_tan' || g.category === 'card_phom';
                  }
                  return g.category === selectedGameFilter;
                })
                .map((game) => {
                  const GameIcon = game.icon;

                  return (
                    <div
                      key={game.id}
                      className={`relative overflow-hidden rounded-3xl border ${game.borderAccent} bg-gradient-to-br ${game.accentGradient} p-6 shadow-xl transition-all duration-300 hover:scale-[1.01] group flex flex-col justify-between`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-center text-amber-400 shadow-inner group-hover:scale-110 transition-transform">
                              <GameIcon size={24} className={game.id === 'crowd2x' ? 'fill-amber-400' : 'text-current'} />
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
                              <h3 className="text-base sm:text-lg font-black text-white mt-1 group-hover:text-amber-300 transition-colors">
                                {game.title}
                              </h3>
                            </div>
                          </div>

                          {game.isHot && (
                            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-bold flex items-center gap-1 shrink-0 animate-pulse">
                              <Flame size={12} />
                              Hot Nhất
                            </span>
                          )}
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
                          type="button"
                          onClick={() => handleLaunchGame(game.id)}
                          className={`w-full py-3.5 rounded-2xl ${game.buttonBg} font-black text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98`}
                        >
                          <Play size={16} className="fill-current" />
                          <span>CHƠI NGAY (VÀO GAME)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
