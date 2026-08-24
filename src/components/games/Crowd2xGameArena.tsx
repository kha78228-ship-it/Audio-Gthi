import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trophy, 
  Coins, 
  Sparkles, 
  Zap, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  HelpCircle, 
  ShieldCheck, 
  ArrowRight, 
  RotateCcw, 
  TrendingUp, 
  Crown, 
  Scale, 
  Layers, 
  Award, 
  Plus, 
  Lock, 
  History, 
  Check, 
  AlertTriangle,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  setDoc, 
  serverTimestamp, 
  where, 
  increment, 
  runTransaction,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { CrowdGameQuestion, CrowdGameBet } from '../../types';

interface Crowd2xGameArenaProps {
  onOpenAuth?: () => void;
  onOpenVipHub?: () => void;
  onBackToLobby?: () => void;
}

const BET_PRESETS = [50, 100, 200, 500, 1000, 2000];

export function Crowd2xGameArena({
  onOpenAuth,
  onOpenVipHub,
  onBackToLobby
}: Crowd2xGameArenaProps) {
  const { user, isVip, audioPoints, accountId, performDailyCheckin } = useAuth();

  // Questions State
  const [questions, setQuestions] = useState<CrowdGameQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  // User's Bets State
  const [myBets, setMyBets] = useState<CrowdGameBet[]>([]);
  const [loadingBets, setLoadingBets] = useState(false);

  // Sub Tab inside Game Arena
  const [activeTab, setActiveTab] = useState<'arena' | 'my-bets' | 'rules'>('arena');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Selected Option & Bet Amount for Active Question
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B'>('A');
  const [betAmount, setBetAmount] = useState<number>(100);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Real-time listen to crowdQuestions
  useEffect(() => {
    const q = query(collection(db, 'crowdQuestions'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: CrowdGameQuestion[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      setQuestions(list);
      setLoadingQuestions(false);
    }, (err) => {
      console.warn('Error listening to crowdQuestions:', err);
      setLoadingQuestions(false);
    });

    return () => unsub();
  }, []);

  // Real-time listen to current user's bets
  useEffect(() => {
    if (!user?.uid) {
      setMyBets([]);
      return;
    }
    setLoadingBets(true);
    const q = query(
      collection(db, 'crowdBets'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const list: CrowdGameBet[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      setMyBets(list);
      setLoadingBets(false);
    }, (err) => {
      console.warn('Error listening to my bets:', err);
      setLoadingBets(false);
    });

    return () => unsub();
  }, [user?.uid]);

  // Handle Placing Bet
  const handlePlaceBet = async (question: CrowdGameQuestion) => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      showToast('Vui lòng đăng nhập để tham gia đặt cược ×2 Đám Đông!', 'error');
      return;
    }

    // Validation
    const amount = Number(betAmount);
    if (!amount || isNaN(amount) || amount < 10) {
      showToast('Mức cược tối thiểu là 10 Xu!', 'error');
      return;
    }

    if (amount > 2000) {
      showToast('Luật chơi: Mức cược tối đa là 2,000 Xu / lượt!', 'error');
      return;
    }

    if ((audioPoints || 0) < amount) {
      showToast(`Số dư không đủ! Bạn đang có ${(audioPoints || 0).toLocaleString('vi-VN')} Xu, cần ${amount.toLocaleString('vi-VN')} Xu.`, 'error');
      return;
    }

    // Check if user already placed a bet on this question
    const existingBet = myBets.find(b => b.questionId === question.id && b.status === 'pending');
    if (existingBet) {
      showToast(`Bạn đã đặt cược phe ${existingBet.chosenOption} (${existingBet.betAmount} Xu) ở vòng này rồi!`, 'error');
      return;
    }

    const chosenText = selectedOption === 'A' ? question.optionA.text : question.optionB.text;
    const confirmMsg = `XÁC NHẬN ĐẶT CƯỢC ×2 ĐÁM ĐÔNG:
Câu hỏi: "${question.question}"
👉 Phe chọn: PHE ${selectedOption} (${chosenText})
💰 Số Xu cược: ${amount.toLocaleString('vi-VN')} Xu
🎁 Nhận thưởng khi thắng: ${(amount * 2).toLocaleString('vi-VN')} Xu (x2 Xu cược)

Bạn có chắc chắn muốn đặt cược không?`;

    if (!window.confirm(confirmMsg)) return;

    setIsPlacingBet(true);
    try {
      // Run Firestore Atomic Transaction:
      // 1. Deduct points from user
      // 2. Create crowdBets ticket
      // 3. Increment totalBets and totalPool on crowdQuestions
      // 4. Create pointTransactions log
      const userRef = doc(db, 'users', user.uid);
      const questionRef = doc(db, 'crowdQuestions', question.id);
      const betRef = doc(collection(db, 'crowdBets'));
      const txRef = doc(collection(db, 'users', user.uid, 'pointTransactions'));

      const batch = writeBatch(db);

      // Deduct points
      batch.update(userRef, {
        audioPoints: increment(-amount)
      });

      // Create bet ticket
      batch.set(betRef, {
        questionId: question.id,
        questionTitle: question.question,
        userId: user.uid,
        userName: user.displayName || 'Người Chơi',
        userAccountId: accountId || 'AH-MEMBER',
        userPhoto: user.photoURL || '',
        isUserVip: isVip || false,
        chosenOption: selectedOption,
        chosenOptionText: chosenText,
        betAmount: amount,
        potentialReward: amount * 2,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Update question stats
      if (selectedOption === 'A') {
        batch.update(questionRef, {
          totalParticipants: increment(1),
          totalPool: increment(amount),
          'optionA.totalBets': increment(1),
          'optionA.totalPool': increment(amount)
        });
      } else {
        batch.update(questionRef, {
          totalParticipants: increment(1),
          totalPool: increment(amount),
          'optionB.totalBets': increment(1),
          'optionB.totalPool': increment(amount)
        });
      }

      // Point transaction log
      batch.set(txRef, {
        title: `Đặt cược ×2 Đám Đông: "${question.question}" (Phe ${selectedOption}: ${chosenText})`,
        amount: -amount,
        type: 'game_crowd_bet',
        createdAt: serverTimestamp()
      });

      await batch.commit();

      showToast(`🎉 Đặt cược thành công ${amount.toLocaleString('vi-VN')} Xu vào Phe ${selectedOption}! Chúc bạn thắng x2!`, 'success');
      setSelectedQuestionId(null);
    } catch (err: any) {
      console.error('Error placing bet:', err);
      showToast('Lỗi khi đặt cược: ' + (err.message || err), 'error');
    } finally {
      setIsPlacingBet(false);
    }
  };

  // Checkin quick action
  const handleQuickCheckin = async () => {
    try {
      const res = await performDailyCheckin();
      showToast(res.message, res.success ? 'success' : 'error');
    } catch (e: any) {
      showToast('Lỗi khi điểm danh: ' + (e.message || e), 'error');
    }
  };

  // Filter questions
  const openQuestions = questions.filter(q => q.status === 'open');
  const pastQuestions = questions.filter(q => q.status === 'settled' || q.status === 'closed');

  // Stats
  const myTotalBetsCount = myBets.length;
  const myWonBetsCount = myBets.filter(b => b.status === 'won').length;
  const myTotalWagered = myBets.reduce((acc, b) => acc + (b.betAmount || 0), 0);
  const myTotalWon = myBets.filter(b => b.status === 'won').reduce((acc, b) => acc + (b.rewardAmount || b.betAmount * 2), 0);
  const myNetProfit = myTotalWon - myTotalWagered;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back to Lobby Navigation Bar */}
      {onBackToLobby && (
        <div className="flex items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 px-4 shadow-lg backdrop-blur-md">
          <button
            type="button"
            onClick={onBackToLobby}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 px-3 py-2 rounded-xl transition-all cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>← Quay Lại Sảnh Game</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 hidden sm:inline">Đang chơi:</span>
            <span className="text-xs font-black text-white bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full">
              ×2 Đám Đông 🔥
            </span>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-3 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200 shadow-emerald-950/50'
              : 'bg-rose-950/95 border-rose-500/50 text-rose-200 shadow-rose-950/50'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={20} className="text-rose-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Cyber Prediction Arena Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-950/70 to-zinc-950 border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Zap size={14} className="text-amber-400 fill-amber-400 animate-pulse" />
                Chế Độ Mới: ×2 Đám Đông
              </span>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Flame size={13} className="text-rose-400" />
                Phe Số Đông Thắng x2 Xu
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Đấu Trường <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-indigo-300 bg-clip-text text-transparent">×2 Đám Đông</span> 🔥
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Chọn 1 trong 2 phương án đối đầu (Phe A vs Phe B). Bên nào được <strong className="text-amber-400">nhiều người đặt hơn sẽ giành chiến thắng</strong> và nhận trọn vẹn <strong className="text-emerald-400">×2 số Xu cược</strong>! Bên thiểu số sẽ mất trắng.
            </p>
          </div>

          {/* User Coin Balance & Quick Actions */}
          <div className="w-full md:w-auto shrink-0 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 shadow-xl backdrop-blur-md">
            <div>
              <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Ví Xu Haevy Của Bạn</p>
              <div className="flex items-center gap-2 mt-1">
                <Coins size={20} className="text-amber-400 shrink-0" />
                <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                  {(audioPoints || 0).toLocaleString('vi-VN')}
                </span>
                <span className="text-xs text-zinc-400 font-bold">Xu</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleQuickCheckin}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Sparkles size={13} />
                Điểm Danh +50 Xu
              </button>
              {onOpenVipHub && (
                <button
                  type="button"
                  onClick={onOpenVipHub}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus size={13} />
                  Nạp Xu
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sub-tab switcher */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 p-1 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('arena')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'arena'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black shadow-lg shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Zap size={15} className={activeTab === 'arena' ? 'text-black fill-black' : ''} />
              Đấu Trường Đang Mở ({openQuestions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('my-bets')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'my-bets'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <History size={15} />
              Lịch Sử Cược Của Tôi ({myBets.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'rules'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <HelpCircle size={15} />
              Luật Chơi & Thưởng
            </button>
          </div>

          <div className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
            <ShieldCheck size={14} className="text-emerald-400" />
            Cược tối đa: <strong className="text-amber-400 font-mono">2,000 Xu</strong> • Thắng ăn <strong className="text-emerald-400 font-mono">x2 Xu</strong>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: ĐẤU TRƯỜNG ĐANG MỞ CƯỢC */}
      {/* ========================================================================= */}
      {activeTab === 'arena' && (
        <div className="space-y-6">
          {loadingQuestions ? (
            <div className="py-16 text-center text-zinc-400 flex flex-col items-center gap-3">
              <RefreshCw className="animate-spin text-amber-400" size={28} />
              <p className="text-sm font-semibold">Đang cập nhật các vòng đấu ×2 Đám Đông...</p>
            </div>
          ) : openQuestions.length === 0 ? (
            <div className="py-16 text-center bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <Clock size={28} />
              </div>
              <h3 className="text-base font-bold text-white">Chưa Có Vòng Cược Nào Đang Mở</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Admin đang chuẩn bị các câu hỏi tranh luận hấp dẫn tiếp theo. Hãy quay lại sau ít phút hoặc xem lại lịch sử các vòng cược đã qua!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {openQuestions.map((q) => {
                const totalBetsA = q.optionA?.totalBets || 0;
                const totalBetsB = q.optionB?.totalBets || 0;
                const totalBets = totalBetsA + totalBetsB;
                const percentA = totalBets > 0 ? Math.round((totalBetsA / totalBets) * 100) : 50;
                const percentB = totalBets > 0 ? 100 - percentA : 50;

                // Check if current user has already placed a bet on this question
                const userBet = myBets.find(b => b.questionId === q.id);
                const isSelected = selectedQuestionId === q.id;

                return (
                  <div
                    key={q.id}
                    className="bg-zinc-900/90 border border-zinc-800 hover:border-indigo-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl transition-all space-y-6 relative overflow-hidden"
                  >
                    {/* Top Tag & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full text-xs font-black uppercase">
                          {q.category || 'Âm Nhạc'}
                        </span>
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          Đang Nhận Cược
                        </span>
                      </div>

                      <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                        <Coins size={14} className="text-amber-400" />
                        <span>Tổng quỹ cược: <strong className="text-amber-400 font-bold">{(q.totalPool || 0).toLocaleString('vi-VN')} Xu</strong></span>
                      </div>
                    </div>

                    {/* Question Statement */}
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                        {q.question}
                      </h3>
                      {q.description && (
                        <p className="text-xs text-zinc-400 mt-1">{q.description}</p>
                      )}
                    </div>

                    {/* Battle Arena Visual Box (Option A vs Option B) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Option A */}
                      <div
                        onClick={() => {
                          if (!userBet) {
                            setSelectedQuestionId(q.id);
                            setSelectedOption('A');
                          }
                        }}
                        className={`p-5 rounded-2xl border-2 transition-all relative overflow-hidden cursor-pointer ${
                          userBet?.chosenOption === 'A'
                            ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-400/30'
                            : isSelected && selectedOption === 'A'
                            ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-950/50'
                            : 'bg-zinc-950 border-zinc-800 hover:border-cyan-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-black text-sm shrink-0">
                              A
                            </span>
                            <div>
                              <div className="text-base font-bold text-white">{q.optionA?.text}</div>
                              <div className="text-xs text-zinc-400 mt-0.5">Phương án A</div>
                            </div>
                          </div>

                          {userBet?.chosenOption === 'A' && (
                            <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-black flex items-center gap-1">
                              <Check size={13} /> Đã Đặt
                            </span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                          <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                            <Users size={14} /> {totalBetsA} người ({percentA}%)
                          </span>
                          <span className="text-amber-400 font-bold">
                            {(q.optionA?.totalPool || 0).toLocaleString('vi-VN')} Xu
                          </span>
                        </div>
                      </div>

                      {/* Option B */}
                      <div
                        onClick={() => {
                          if (!userBet) {
                            setSelectedQuestionId(q.id);
                            setSelectedOption('B');
                          }
                        }}
                        className={`p-5 rounded-2xl border-2 transition-all relative overflow-hidden cursor-pointer ${
                          userBet?.chosenOption === 'B'
                            ? 'bg-rose-950/40 border-rose-400 ring-2 ring-rose-400/30'
                            : isSelected && selectedOption === 'B'
                            ? 'bg-rose-950/40 border-rose-400 shadow-lg shadow-rose-950/50'
                            : 'bg-zinc-950 border-zinc-800 hover:border-rose-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center font-black text-sm shrink-0">
                              B
                            </span>
                            <div>
                              <div className="text-base font-bold text-white">{q.optionB?.text}</div>
                              <div className="text-xs text-zinc-400 mt-0.5">Phương án B</div>
                            </div>
                          </div>

                          {userBet?.chosenOption === 'B' && (
                            <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-black flex items-center gap-1">
                              <Check size={13} /> Đã Đặt
                            </span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                          <span className="text-rose-400 font-bold flex items-center gap-1.5">
                            <Users size={14} /> {totalBetsB} người ({percentB}%)
                          </span>
                          <span className="text-amber-400 font-bold">
                            {(q.optionB?.totalPool || 0).toLocaleString('vi-VN')} Xu
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Crowd Distribution Meter */}
                    <div className="space-y-1.5">
                      <div className="h-3 w-full bg-zinc-950 rounded-full overflow-hidden flex border border-zinc-800 p-0.5">
                        <div
                          style={{ width: `${percentA}%` }}
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-l-full transition-all duration-500"
                        />
                        <div
                          style={{ width: `${percentB}%` }}
                          className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-r-full transition-all duration-500"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono px-1">
                        <span className="text-cyan-400 font-bold">Phe A: {percentA}% ({totalBetsA} người)</span>
                        <span className="text-zinc-500 font-normal">Quy tắc: Phe đông hơn ăn x2 Xu</span>
                        <span className="text-rose-400 font-bold">Phe B: {percentB}% ({totalBetsB} người)</span>
                      </div>
                    </div>

                    {/* If user ALREADY placed a bet */}
                    {userBet ? (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/90 via-purple-950/70 to-zinc-950 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black shrink-0">
                            <Zap size={20} />
                          </div>
                          <div>
                            <p className="text-xs text-zinc-300">
                              Bạn đã đặt cược: <strong className={userBet.chosenOption === 'A' ? 'text-cyan-400' : 'text-rose-400'}>Phe {userBet.chosenOption} ({userBet.chosenOptionText})</strong>
                            </p>
                            <p className="text-xs text-amber-400 font-bold mt-0.5 font-mono">
                              Mức cược: {userBet.betAmount.toLocaleString('vi-VN')} Xu • Thắng nhận x2: +{(userBet.betAmount * 2).toLocaleString('vi-VN')} Xu
                            </p>
                          </div>
                        </div>

                        <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 shrink-0">
                          <Clock size={13} />
                          Đang chờ Admin kết toán
                        </span>
                      </div>
                    ) : (
                      /* Betting Controls Form (If user has NOT placed bet yet) */
                      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Coins size={16} className="text-amber-400" />
                            <span className="text-xs font-bold text-white">Chọn số Xu cược (Tối đa 2,000 Xu):</span>
                          </div>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            Dự kiến nhận x2: <strong className="text-emerald-400 font-bold">{(Math.min(Math.max(Number(betAmount) || 0, 0), 2000) * 2).toLocaleString('vi-VN')} Xu</strong>
                          </span>
                        </div>

                        {/* Quick Presets */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {BET_PRESETS.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                setSelectedQuestionId(q.id);
                                setBetAmount(preset);
                              }}
                              className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                                isSelected && betAmount === preset
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-md shadow-amber-500/20'
                                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                              }`}
                            >
                              {preset.toLocaleString('vi-VN')} Xu
                            </button>
                          ))}
                        </div>

                        {/* Custom Input & Action Button */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                          <div className="relative w-full sm:w-48">
                            <input
                              type="number"
                              min={10}
                              max={2000}
                              value={isSelected ? betAmount : 100}
                              onChange={(e) => {
                                setSelectedQuestionId(q.id);
                                const val = Math.min(Math.max(Number(e.target.value) || 0, 0), 2000);
                                setBetAmount(val);
                              }}
                              placeholder="Nhập xu..."
                              className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 font-bold">
                              XU
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={isPlacingBet}
                            onClick={() => {
                              setSelectedQuestionId(q.id);
                              handlePlaceBet(q);
                            }}
                            className={`w-full sm:flex-1 py-2.5 px-5 rounded-xl font-black text-xs transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                              selectedOption === 'A'
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20'
                                : 'bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white shadow-rose-500/20'
                            }`}
                          >
                            {isPlacingBet && selectedQuestionId === q.id ? (
                              <>
                                <RefreshCw className="animate-spin" size={15} />
                                Đang Xác Nhận Cược...
                              </>
                            ) : (
                              <>
                                <Zap size={15} className="fill-current" />
                                Đặt Cược Phe {selectedOption} ({(isSelected ? betAmount : 100).toLocaleString('vi-VN')} Xu) • Thắng Ăn x2
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: LỊCH SỬ VÉ CƯỢC CỦA TÔI */}
      {/* ========================================================================= */}
      {activeTab === 'my-bets' && (
        <div className="space-y-5">
          {/* User Stat Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">Tổng Trận Tham Gia</div>
              <div className="text-xl font-black text-white font-mono mt-0.5">{myTotalBetsCount}</div>
            </div>
            <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">Số Trận Thắng x2</div>
              <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                {myWonBetsCount} <span className="text-xs text-zinc-400">({myTotalBetsCount > 0 ? Math.round((myWonBetsCount / myTotalBetsCount) * 100) : 0}%)</span>
              </div>
            </div>
            <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">Tổng Xu Đã Cược</div>
              <div className="text-xl font-black text-amber-400 font-mono mt-0.5">{myTotalWagered.toLocaleString('vi-VN')}</div>
            </div>
            <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">Lợi Nhuận Thu Về</div>
              <div className={`text-xl font-black font-mono mt-0.5 ${myNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {myNetProfit >= 0 ? `+${myNetProfit.toLocaleString('vi-VN')}` : myNetProfit.toLocaleString('vi-VN')} Xu
              </div>
            </div>
          </div>

          {/* Bets List */}
          {loadingBets ? (
            <div className="py-12 text-center text-zinc-400">
              <RefreshCw className="animate-spin mx-auto text-amber-400" size={24} />
              <p className="text-xs font-semibold mt-2">Đang tải lịch sử cược...</p>
            </div>
          ) : myBets.length === 0 ? (
            <div className="py-16 text-center bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                <History size={24} />
              </div>
              <h3 className="text-base font-bold text-white">Bạn chưa tham gia cược vòng nào</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Hãy chuyển sang tab "Đấu Trường Đang Mở" để chọn câu hỏi và đặt cược Xu Haevy ngay!
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('arena')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors cursor-pointer"
              >
                Vào Đấu Trường Ngay
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myBets.map((bet) => (
                <div
                  key={bet.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    bet.status === 'won'
                      ? 'bg-emerald-950/30 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                      : bet.status === 'lost'
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : 'bg-zinc-900/80 border-zinc-800'
                  }`}
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        bet.chosenOption === 'A'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        Phe {bet.chosenOption} ({bet.chosenOptionText})
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {bet.createdAt ? new Date(bet.createdAt?.seconds ? bet.createdAt.seconds * 1000 : bet.createdAt).toLocaleString('vi-VN') : 'Gần đây'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white">{bet.questionTitle}</p>
                    <p className="text-xs text-zinc-400 font-mono">
                      Cược: <strong className="text-amber-400 font-bold">{bet.betAmount.toLocaleString('vi-VN')} Xu</strong>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    {bet.status === 'won' && (
                      <div className="space-y-0.5">
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-black inline-flex items-center gap-1 shadow-sm">
                          <Trophy size={13} className="text-amber-400" />
                          Thắng +{(bet.rewardAmount || bet.betAmount * 2).toLocaleString('vi-VN')} Xu (x2)
                        </span>
                        <div className="text-[10px] text-emerald-400 font-bold">Lợi nhuận: +{bet.betAmount.toLocaleString('vi-VN')} Xu</div>
                      </div>
                    )}
                    {bet.status === 'lost' && (
                      <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold inline-flex items-center gap-1">
                        <AlertTriangle size={13} />
                        Thua mất trắng (-{bet.betAmount.toLocaleString('vi-VN')} Xu)
                      </span>
                    )}
                    {bet.status === 'pending' && (
                      <span className="px-3 py-1 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl text-xs font-bold inline-flex items-center gap-1">
                        <Clock size={13} />
                        Đang chờ kết toán
                      </span>
                    )}
                    {bet.status === 'refunded' && (
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold inline-flex items-center gap-1">
                        <RotateCcw size={13} />
                        Đã hoàn lại {bet.betAmount.toLocaleString('vi-VN')} Xu
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: LUẬT CHƠI & QUY ĐỊNH THƯỞNG */}
      {/* ========================================================================= */}
      {activeTab === 'rules' && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Quy Định & Luật Chơi Đấu Trường ×2 Đám Đông</h3>
              <p className="text-xs text-zinc-400">Minh bạch 100% • Tự động kết toán • Công bằng tuyệt đối</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Zap size={15} /> 1. Luật Chơi Cốt Lõi
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Mỗi câu hỏi có 2 phương án đối đầu (A vs B). Người chơi đặt cược Xu Haevy vào phe mình tin là có nhiều người lựa chọn nhất.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Trophy size={15} /> 2. Cơ Chế Thắng Thua
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Khi kết toán: Phe nào có <strong>tổng số lượt người đặt nhiều hơn</strong> sẽ chiến thắng và nhận <strong>×2 số Xu cược</strong>. Phe thiểu số sẽ <strong>mất trắng tiền cược</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <Coins size={15} /> 3. Giới Hạn Cược
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Mức cược tối thiểu là <strong>10 Xu</strong> và mức cược tối đa là <strong>2,000 Xu / lượt</strong> để bảo đảm tính giải trí công bằng cho mọi thành viên.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="text-xs font-black text-purple-400 uppercase tracking-wider flex items-center gap-2">
                <Scale size={15} /> 4. Trường Hợp Hòa
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Nếu số lượng người đặt của Phe A và Phe B bằng nhau 100%, hệ thống sẽ tự động <strong>hoàn trả 100% Xu cược</strong> về tài khoản của tất cả người chơi.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
