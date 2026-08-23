import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trophy, 
  Coins, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  HelpCircle, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Trash2, 
  RotateCcw, 
  Lock, 
  Unlock, 
  Search, 
  Filter, 
  Crown, 
  Scale,
  Flame,
  Layers,
  ChevronRight,
  TrendingUp,
  BarChart2,
  RefreshCw,
  Eye,
  AlertTriangle,
  Music,
  Gamepad2,
  Upload
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  where, 
  getDocs, 
  writeBatch,
  increment 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { CrowdGameQuestion, CrowdGameBet, UserAccountData } from '../../types';
import { AdminAudioQuizManager } from './AdminAudioQuizManager';

interface AdminPage6CrowdGameProps {
  usersList?: UserAccountData[];
  showToast: (text: string, type?: 'success' | 'error') => void;
}

const PRESET_TEMPLATES = [
  {
    category: 'Âm Nhạc',
    question: 'Ai sẽ phát hành ca khúc đạt Top 1 Trending Âm Nhạc tháng này?',
    optA: 'Sơn Tùng M-TP',
    optB: 'Soobin Hoàng Sơn',
  },
  {
    category: 'Showbiz',
    question: 'Concert âm nhạc nào sẽ cháy vé nhanh nhất trong năm 2026?',
    optA: 'Anh Trai Say Hi',
    optB: 'Anh Trai Vượt Ngàn Chông Gai',
  },
  {
    category: 'Âm Nhạc',
    question: 'Gu thưởng thức âm thanh nào mang lại trải nghiệm đỉnh cao hơn?',
    optA: 'Nhạc Số Lossless 24-bit Hi-Fi',
    optB: 'Đĩa Than Vinyl Cổ Điển',
  },
  {
    category: 'Xu Hướng',
    question: 'Thức uống nào xứng đáng là Thức Uống Quốc Dân năm nay?',
    optA: 'Cà Phê Muối Đậm Đà',
    optB: 'Trà Sữa Trân Châu Full Topping',
  },
  {
    category: 'Đời Sống',
    question: 'Phong cách hát Karaoke cùng bạn bè nào vui và nhiệt hơn?',
    optA: 'Hát Chuẩn Tone Ca Sĩ',
    optB: 'Hát Quẩy Sung Hết Mình',
  },
  {
    category: 'Thể Thao',
    question: 'Trận đại chiến bóng đá cuối tuần này: Phe nào sẽ chiến thắng?',
    optA: 'Đội Chủ Nhà',
    optB: 'Đội Khách',
  },
];

const CATEGORIES = [
  'Tất Cả',
  'Âm Nhạc',
  'Showbiz',
  'Xu Hướng',
  'Đời Sống',
  'Thể Thao',
  'Đố Vui',
  'Tranh Luận'
];

export function AdminPage6CrowdGame({
  usersList = [],
  showToast
}: AdminPage6CrowdGameProps) {
  const { user, isAdmin, isSuperAdmin, accountId, logSystemActivity } = useAuth();

  // Master Game Mode Switcher
  const [gameModule, setGameModule] = useState<'crowd2x' | 'audio_quiz'>('crowd2x');

  // Active Sub-view inside Page 6 (Crowd 2X)
  const [activeTab, setActiveTab] = useState<'rounds' | 'create' | 'bets'>('rounds');
  
  // Real-time questions state
  const [questions, setQuestions] = useState<CrowdGameQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  // Real-time bets state
  const [bets, setBets] = useState<CrowdGameBet[]>([]);
  const [loadingBets, setLoadingBets] = useState(true);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed' | 'settled' | 'cancelled'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('Tất Cả');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected question to inspect bets
  const [inspectQuestion, setInspectQuestion] = useState<CrowdGameQuestion | null>(null);

  // Form State for creating new question
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newCategory, setNewCategory] = useState('Âm Nhạc');
  const [newDescription, setNewDescription] = useState('');
  const [newOptAText, setNewOptAText] = useState('');
  const [newOptBText, setNewOptBText] = useState('');
  const [newMinBet, setNewMinBet] = useState(10);
  const [newMaxBet, setNewMaxBet] = useState(2000); // Rule: Max 2k xu
  const [newDeadline, setNewDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Action Loading states
  const [settlingQuestionId, setSettlingQuestionId] = useState<string | null>(null);

  // Listen to crowdQuestions collection
  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'crowdQuestions'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: CrowdGameQuestion[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      setQuestions(list);
      setLoadingQuestions(false);
    }, (err) => {
      console.error('Error fetching crowdQuestions:', err);
      setLoadingQuestions(false);
    });

    return () => unsub();
  }, [isAdmin]);

  // Listen to crowdBets collection
  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'crowdBets'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const list: CrowdGameBet[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      setBets(list);
      setLoadingBets(false);
    }, (err) => {
      console.error('Error fetching crowdBets:', err);
      setLoadingBets(false);
    });

    return () => unsub();
  }, [isAdmin]);

  // Handle Preset Selection
  const handleApplyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setNewCategory(preset.category);
    setNewQuestionText(preset.question);
    setNewOptAText(preset.optA);
    setNewOptBText(preset.optB);
    setNewMaxBet(2000);
    showToast(`Đã áp dụng mẫu: "${preset.question.slice(0, 30)}..."`, 'success');
  };

  // Create Question
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) {
      showToast('Vui lòng nhập nội dung câu hỏi!', 'error');
      return;
    }
    if (!newOptAText.trim() || !newOptBText.trim()) {
      showToast('Vui lòng nhập đầy đủ 2 phương án A và B!', 'error');
      return;
    }

    const maxBetVal = Math.min(Math.max(Number(newMaxBet) || 2000, 10), 2000); // Bound strictly to 2000 max

    setIsSubmitting(true);
    try {
      const questionData = {
        question: newQuestionText.trim(),
        category: newCategory,
        description: newDescription.trim() || 'Chọn 1 trong 2 phương án. Phe nào nhiều người đặt hơn sẽ thắng và nhận x2 số xu cược!',
        optionA: {
          id: 'A',
          text: newOptAText.trim(),
          totalBets: 0,
          totalPool: 0
        },
        optionB: {
          id: 'B',
          text: newOptBText.trim(),
          totalBets: 0,
          totalPool: 0
        },
        minBet: Math.max(Number(newMinBet) || 10, 1),
        maxBet: maxBetVal,
        status: 'open',
        totalParticipants: 0,
        totalPool: 0,
        winningOption: null,
        deadline: newDeadline || null,
        createdAt: serverTimestamp(),
        createdBy: user?.displayName || accountId || 'Admin'
      };

      const docRef = await addDoc(collection(db, 'crowdQuestions'), questionData);

      await logSystemActivity({
        action: 'system_config_update',
        actionTitle: 'Tạo Câu Hỏi ×2 Đám Đông Mới',
        targetType: 'setting',
        targetId: docRef.id,
        targetName: newQuestionText.trim(),
        details: `Admin đã tạo câu hỏi ×2 Đám Đông: "${newQuestionText.trim()}". Phương án A: "${newOptAText.trim()}" vs Phương án B: "${newOptBText.trim()}". Cược tối đa: ${maxBetVal} xu.`,
        severity: 'info'
      });

      showToast('Tạo câu hỏi ×2 Đám Đông thành công!', 'success');
      // Reset form
      setNewQuestionText('');
      setNewOptAText('');
      setNewOptBText('');
      setNewDescription('');
      setActiveTab('rounds');
    } catch (err: any) {
      console.error('Error creating question:', err);
      showToast('Lỗi khi tạo câu hỏi: ' + (err.message || err), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Settle Question & Distribute x2 Reward
  const handleSettleQuestion = async (question: CrowdGameQuestion) => {
    if (!isAdmin) return;
    const betsA = question.optionA?.totalBets || 0;
    const betsB = question.optionB?.totalBets || 0;

    let winningOpt: 'A' | 'B' | 'draw';
    let settlementNote = '';

    if (betsA > betsB) {
      winningOpt = 'A';
      settlementNote = `Phe A (${question.optionA.text}) thắng áp đảo với ${betsA} người đặt (so với ${betsB} người đặt phe B). Tất cả người chơi phe A nhận x2 tiền cược!`;
    } else if (betsB > betsA) {
      winningOpt = 'B';
      settlementNote = `Phe B (${question.optionB.text}) thắng áp đảo với ${betsB} người đặt (so với ${betsA} người đặt phe A). Tất cả người chơi phe B nhận x2 tiền cược!`;
    } else {
      winningOpt = 'draw';
      settlementNote = `Hòa số lượng người đặt (${betsA} người phe A == ${betsB} người phe B). Hoàn trả 100% xu cược cho tất cả người chơi!`;
    }

    const confirmMsg = `XÁC NHẬN KẾT TOÁN VÒNG ĐẤU:
Câu hỏi: "${question.question}"
- Phe A (${question.optionA.text}): ${betsA} người (${question.optionA.totalPool || 0} Xu)
- Phe B (${question.optionB.text}): ${betsB} người (${question.optionB.totalPool || 0} Xu)

👉 KẾT QUẢ: ${winningOpt === 'draw' ? 'HÒA (Hoàn 100% xu)' : `PHE ${winningOpt} THẮNG (Nhận x2 Xu)`}

Hệ thống sẽ tự động cộng thưởng x2 xu cho người thắng và ghi nhận kết quả. Bạn có chắc chắn muốn kết toán không?`;

    if (!window.confirm(confirmMsg)) return;

    setSettlingQuestionId(question.id);
    try {
      // 1. Fetch all bets for this question
      const qBets = query(collection(db, 'crowdBets'), where('questionId', '==', question.id));
      const betsSnap = await getDocs(qBets);

      const batch = writeBatch(db);
      let winnersCount = 0;
      let losersCount = 0;
      let totalPayout = 0;

      for (const betDoc of betsSnap.docs) {
        const betData = betDoc.data() as CrowdGameBet;
        const betRef = doc(db, 'crowdBets', betDoc.id);

        if (winningOpt === 'draw') {
          // Refund
          batch.update(betRef, {
            status: 'refunded',
            settledAt: serverTimestamp()
          });

          // Refund user points
          const userRef = doc(db, 'users', betData.userId);
          batch.update(userRef, {
            audioPoints: increment(betData.betAmount)
          });

          // Create PointTransaction
          const txRef = doc(collection(db, 'users', betData.userId, 'pointTransactions'));
          batch.set(txRef, {
            title: `Hoàn cược ×2 Đám Đông: "${question.question}" (Hòa số người đặt)`,
            amount: betData.betAmount,
            type: 'game_crowd_refund',
            createdAt: serverTimestamp()
          });
        } else if (betData.chosenOption === winningOpt) {
          // Winner: pays x2
          const reward = betData.betAmount * 2;
          winnersCount++;
          totalPayout += reward;

          batch.update(betRef, {
            status: 'won',
            rewardAmount: reward,
            settledAt: serverTimestamp()
          });

          // Credit x2 reward to user
          const userRef = doc(db, 'users', betData.userId);
          batch.update(userRef, {
            audioPoints: increment(reward),
            totalEarnedPoints: increment(reward - betData.betAmount)
          });

          // Create PointTransaction
          const txRef = doc(collection(db, 'users', betData.userId, 'pointTransactions'));
          batch.set(txRef, {
            title: `🏆 Thắng cược x2 Đám Đông: "${question.question}" (Phe ${winningOpt}: ${winningOpt === 'A' ? question.optionA.text : question.optionB.text})`,
            amount: reward,
            type: 'game_crowd_win',
            createdAt: serverTimestamp()
          });
        } else {
          // Loser: loses entire bet
          losersCount++;
          batch.update(betRef, {
            status: 'lost',
            settledAt: serverTimestamp()
          });
        }
      }

      // Update question status
      const questionRef = doc(db, 'crowdQuestions', question.id);
      batch.update(questionRef, {
        status: 'settled',
        winningOption: winningOpt,
        settledExplanation: settlementNote,
        settledAt: serverTimestamp(),
        settledBy: user?.displayName || accountId || 'Admin'
      });

      await batch.commit();

      await logSystemActivity({
        action: 'system_config_update',
        actionTitle: 'Kết Toán ×2 Đám Đông & Trả Thưởng',
        targetType: 'setting',
        targetId: question.id,
        targetName: question.question,
        details: `Admin đã kết toán câu hỏi "${question.question}". Bên thắng: Phe ${winningOpt}. ${winnersCount} người thắng (Tổng thưởng: ${totalPayout} Xu), ${losersCount} người thua.`,
        severity: 'info'
      });

      showToast(`Kết toán thành công! Phe ${winningOpt} chiến thắng với ${winnersCount} người nhận x2 xu!`, 'success');
    } catch (err: any) {
      console.error('Error settling question:', err);
      showToast('Lỗi khi kết toán: ' + (err.message || err), 'error');
    } finally {
      setSettlingQuestionId(null);
    }
  };

  // Toggle Close / Open Betting
  const handleToggleClose = async (question: CrowdGameQuestion) => {
    const newStatus = question.status === 'open' ? 'closed' : 'open';
    try {
      await updateDoc(doc(db, 'crowdQuestions', question.id), {
        status: newStatus
      });
      showToast(newStatus === 'closed' ? 'Đã đóng cược câu hỏi này!' : 'Đã mở lại cược cho câu hỏi!', 'success');
    } catch (err: any) {
      showToast('Lỗi khi đổi trạng thái: ' + (err.message || err), 'error');
    }
  };

  // Cancel Question & Refund All
  const handleCancelQuestion = async (question: CrowdGameQuestion) => {
    if (!window.confirm(`Bạn có chắc chắn muốn HỦY câu hỏi "${question.question}" và HOÀN TOÀN BỘ TIỀN CƯỢC cho tất cả người chơi?`)) return;

    try {
      const qBets = query(collection(db, 'crowdBets'), where('questionId', '==', question.id));
      const betsSnap = await getDocs(qBets);

      const batch = writeBatch(db);
      for (const betDoc of betsSnap.docs) {
        const betData = betDoc.data() as CrowdGameBet;
        if (betData.status === 'pending') {
          const betRef = doc(db, 'crowdBets', betDoc.id);
          batch.update(betRef, {
            status: 'refunded',
            settledAt: serverTimestamp()
          });

          const userRef = doc(db, 'users', betData.userId);
          batch.update(userRef, {
            audioPoints: increment(betData.betAmount)
          });

          const txRef = doc(collection(db, 'users', betData.userId, 'pointTransactions'));
          batch.set(txRef, {
            title: `Hoàn cược do hủy câu hỏi: "${question.question}"`,
            amount: betData.betAmount,
            type: 'game_crowd_refund',
            createdAt: serverTimestamp()
          });
        }
      }

      const qRef = doc(db, 'crowdQuestions', question.id);
      batch.update(qRef, {
        status: 'cancelled',
        settledExplanation: 'Câu hỏi đã bị Admin hủy và hoàn lại 100% xu cược.',
        settledAt: serverTimestamp()
      });

      await batch.commit();
      showToast('Đã hủy câu hỏi và hoàn trả toàn bộ xu cược cho người chơi!', 'success');
    } catch (err: any) {
      showToast('Lỗi khi hủy câu hỏi: ' + (err.message || err), 'error');
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (question: CrowdGameQuestion) => {
    if (question.status === 'open' && (question.totalParticipants || 0) > 0) {
      showToast('Câu hỏi đang mở cược và đã có người đặt, hãy Hủy Vòng hoặc Kết Toán trước khi Xóa!', 'error');
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn câu hỏi "${question.question}"?`)) return;

    try {
      await deleteDoc(doc(db, 'crowdQuestions', question.id));
      showToast('Đã xóa câu hỏi thành công!', 'success');
      if (inspectQuestion?.id === question.id) {
        setInspectQuestion(null);
      }
    } catch (err: any) {
      showToast('Lỗi khi xóa câu hỏi: ' + (err.message || err), 'error');
    }
  };

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    if (statusFilter !== 'all' && q.status !== statusFilter) return false;
    if (categoryFilter !== 'Tất Cả' && q.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();
      return (
        q.question.toLowerCase().includes(s) ||
        q.optionA?.text.toLowerCase().includes(s) ||
        q.optionB?.text.toLowerCase().includes(s) ||
        q.category?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  // Calculate Global Stats
  const totalQuestionsCount = questions.length;
  const openQuestionsCount = questions.filter(q => q.status === 'open').length;
  const totalBetsPlacedCount = bets.length;
  const totalCoinsWagered = bets.reduce((acc, b) => acc + (b.betAmount || 0), 0);
  const totalCoinsPaidOut = bets.filter(b => b.status === 'won').reduce((acc, b) => acc + (b.rewardAmount || b.betAmount * 2), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Master Game Selector Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl max-w-xl">
        <button
          type="button"
          onClick={() => setGameModule('crowd2x')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            gameModule === 'crowd2x'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-900/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Zap size={16} className={gameModule === 'crowd2x' ? 'text-amber-400 fill-amber-400' : ''} />
          <span>×2 Đám Đông</span>
        </button>

        <button
          type="button"
          onClick={() => setGameModule('melody_quiz')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            gameModule === 'melody_quiz'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Music size={16} className={gameModule === 'melody_quiz' ? 'text-purple-300' : ''} />
          <span>Tải Nhạc Đoán Bài Hát</span>
        </button>
      </div>

      {gameModule === 'melody_quiz' ? (
        <AdminAudioQuizManager showToast={showToast} />
      ) : (
        <>
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/70 via-purple-950/50 to-zinc-950 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-black uppercase tracking-wider">
              <Zap size={14} className="text-amber-400 fill-amber-400" />
              <span>Haevy Admin • Trang 6: Quản Lý Đấu Trường ×2 Đám Đông</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              Đấu Trường Dự Đoán <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-indigo-300 bg-clip-text text-transparent">×2 Đám Đông</span> 👑
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Đặt câu hỏi tranh luận với 2 phương án (A vs B). Người chơi đặt cược Xu Haevy (tối đa 2k xu). Phe nào có <strong className="text-amber-400">nhiều người đặt hơn sẽ thắng và nhận ×2 Xu</strong>, phe thiểu số mất trắng!
            </p>
          </div>

          {/* Quick Stats Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 shrink-0 min-w-[280px]">
            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">Đang Mở Cược</div>
              <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">{openQuestionsCount} / {totalQuestionsCount}</div>
            </div>
            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">Tổng Vé Cược</div>
              <div className="text-xl font-black text-indigo-300 font-mono mt-0.5">{totalBetsPlacedCount}</div>
            </div>
            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">Tổng Xu Đặt Cược</div>
              <div className="text-xl font-black text-amber-400 font-mono mt-0.5">{totalCoinsWagered.toLocaleString('vi-VN')}</div>
            </div>
            <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">Xu Đã Trả Thưởng</div>
              <div className="text-xl font-black text-yellow-300 font-mono mt-0.5">{totalCoinsPaidOut.toLocaleString('vi-VN')}</div>
            </div>
          </div>
        </div>

        {/* Sub Navigation Bar inside Page 6 */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 p-1 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('rounds')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'rounds'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BarChart2 size={15} />
              Quản Lý Vòng Đấu ({questions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Plus size={15} />
              Tạo Câu Hỏi Mới
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bets')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'bets'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Eye size={15} />
              Nhật Ký Vé Cược ({bets.length})
            </button>
          </div>

          <div className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
            <ShieldCheck size={14} className="text-amber-400" />
            Giới hạn cược tối đa: <strong className="text-amber-400 font-mono">2,000 Xu / lượt</strong>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: QUẢN LÝ VÒNG ĐẤU (DANH SÁCH & KẾT TOÁN TRẢ THƯỞNG) */}
      {/* ========================================================================= */}
      {activeTab === 'rounds' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <span className="text-xs text-zinc-400 font-semibold mr-1 flex items-center gap-1">
                <Filter size={13} />
                Lọc trạng thái:
              </span>
              {(['all', 'open', 'closed', 'settled', 'cancelled'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {st === 'all' && 'Tất cả'}
                  {st === 'open' && '🟢 Đang mở cược'}
                  {st === 'closed' && '🟡 Đã đóng cược'}
                  {st === 'settled' && '🏆 Đã trả thưởng'}
                  {st === 'cancelled' && '⚪ Đã hủy'}
                </button>
              ))}
            </div>

            {/* Search and Category Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm câu hỏi, phương án..."
                  className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Questions Grid */}
          {loadingQuestions ? (
            <div className="py-16 text-center text-zinc-400 flex flex-col items-center gap-3">
              <RefreshCw className="animate-spin text-indigo-400" size={28} />
              <p className="text-sm font-semibold">Đang tải danh sách câu hỏi ×2 Đám Đông...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="py-16 text-center bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                <HelpCircle size={28} />
              </div>
              <h3 className="text-base font-bold text-white">Chưa có câu hỏi nào phù hợp</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Hãy chuyển sang tab "Tạo Câu Hỏi Mới" để tạo các câu đố tranh luận 2 phương án hấp dẫn cho người chơi!
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <Plus size={15} />
                Tạo Câu Hỏi Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredQuestions.map((q) => {
                const totalBetsA = q.optionA?.totalBets || 0;
                const totalBetsB = q.optionB?.totalBets || 0;
                const totalBets = totalBetsA + totalBetsB;
                const percentA = totalBets > 0 ? Math.round((totalBetsA / totalBets) * 100) : 50;
                const percentB = totalBets > 0 ? 100 - percentA : 50;
                const poolA = q.optionA?.totalPool || 0;
                const poolB = q.optionB?.totalPool || 0;

                const isSettling = settlingQuestionId === q.id;

                return (
                  <div
                    key={q.id}
                    className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700/80 rounded-3xl p-5 sm:p-6 shadow-xl transition-all space-y-5"
                  >
                    {/* Top Meta */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold">
                          {q.category || 'Âm Nhạc'}
                        </span>
                        
                        {q.status === 'open' && (
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            Đang Mở Cược
                          </span>
                        )}
                        {q.status === 'closed' && (
                          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
                            <Lock size={12} />
                            Đã Đóng Cược (Chờ Kết Toán)
                          </span>
                        )}
                        {q.status === 'settled' && (
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
                            <Trophy size={12} className="text-amber-400" />
                            Đã Trả Thưởng (Phe {q.winningOption === 'draw' ? 'Hòa' : q.winningOption} Thắng)
                          </span>
                        )}
                        {q.status === 'cancelled' && (
                          <span className="px-3 py-1 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full text-xs font-bold">
                            Đã Hủy & Hoàn Cược
                          </span>
                        )}

                        <span className="text-[11px] text-zinc-500 font-mono">
                          Tối đa: {(q.maxBet || 2000).toLocaleString('vi-VN')} Xu
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setInspectQuestion(q)}
                          className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-bold border border-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye size={13} />
                          Xem Vé Cược ({totalBets})
                        </button>
                      </div>
                    </div>

                    {/* Question Title & Description */}
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                        {q.question}
                      </h3>
                      {q.description && (
                        <p className="text-xs text-zinc-400 mt-1">{q.description}</p>
                      )}
                    </div>

                    {/* Battle Arena Visualizer (Option A vs Option B) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {/* Option A Box */}
                      <div className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
                        q.winningOption === 'A'
                          ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                          : totalBetsA > totalBetsB
                          ? 'bg-cyan-950/30 border-cyan-500/40'
                          : 'bg-zinc-950/70 border-zinc-800'
                      }`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-black text-xs">
                              A
                            </span>
                            <span className="text-sm font-bold text-white">{q.optionA?.text}</span>
                          </div>
                          {q.winningOption === 'A' && (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-black uppercase">
                              🏆 Thắng x2
                            </span>
                          )}
                          {totalBetsA > totalBetsB && q.status !== 'settled' && (
                            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded text-[10px] font-bold">
                              🔥 Đang Áp Đảo
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs font-mono">
                          <span className="text-cyan-300 font-bold flex items-center gap-1">
                            <Users size={13} /> {totalBetsA} người đặt ({percentA}%)
                          </span>
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <Coins size={13} /> {poolA.toLocaleString('vi-VN')} Xu
                          </span>
                        </div>
                      </div>

                      {/* Option B Box */}
                      <div className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
                        q.winningOption === 'B'
                          ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                          : totalBetsB > totalBetsA
                          ? 'bg-rose-950/30 border-rose-500/40'
                          : 'bg-zinc-950/70 border-zinc-800'
                      }`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center font-black text-xs">
                              B
                            </span>
                            <span className="text-sm font-bold text-white">{q.optionB?.text}</span>
                          </div>
                          {q.winningOption === 'B' && (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-black uppercase">
                              🏆 Thắng x2
                            </span>
                          )}
                          {totalBetsB > totalBetsA && q.status !== 'settled' && (
                            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded text-[10px] font-bold">
                              🔥 Đang Áp Đảo
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs font-mono">
                          <span className="text-rose-300 font-bold flex items-center gap-1">
                            <Users size={13} /> {totalBetsB} người đặt ({percentB}%)
                          </span>
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <Coins size={13} /> {poolB.toLocaleString('vi-VN')} Xu
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Crowd Split Distribution Bar */}
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
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono px-1">
                        <span>Phe A: {percentA}% người chọn</span>
                        <span className="text-zinc-500">Tổng cược: {(poolA + poolB).toLocaleString('vi-VN')} Xu</span>
                        <span>Phe B: {percentB}% người chọn</span>
                      </div>
                    </div>

                    {/* Settlement Explanation (if settled) */}
                    {q.settledExplanation && (
                      <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-2.5">
                        <Trophy size={16} className="text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-white">Kết quả kết toán:</p>
                          <p className="text-zinc-300 mt-0.5">{q.settledExplanation}</p>
                        </div>
                      </div>
                    )}

                    {/* Admin Action Buttons */}
                    <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {/* Settle Action Button */}
                        {q.status !== 'settled' && q.status !== 'cancelled' && (
                          <button
                            type="button"
                            disabled={isSettling}
                            onClick={() => handleSettleQuestion(q)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isSettling ? (
                              <>
                                <RefreshCw className="animate-spin" size={14} />
                                Đang Kết Toán...
                              </>
                            ) : (
                              <>
                                <Trophy size={14} />
                                Kết Toán & Trả Thưởng ×2 Xu
                              </>
                            )}
                          </button>
                        )}

                        {/* Toggle Close / Open */}
                        {q.status !== 'settled' && q.status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => handleToggleClose(q)}
                            className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            {q.status === 'open' ? (
                              <>
                                <Lock size={13} />
                                Đóng Cược Sớm
                              </>
                            ) : (
                              <>
                                <Unlock size={13} />
                                Mở Lại Cược
                              </>
                            )}
                          </button>
                        )}

                        {/* Cancel & Refund */}
                        {q.status !== 'settled' && q.status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => handleCancelQuestion(q)}
                            className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw size={13} />
                            Hủy & Hoàn Tiền
                          </button>
                        )}
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q)}
                        className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Xóa câu hỏi này"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TẠO CÂU HỎI MỚI (VỚI BỘ MẪU CÓ SẴN) */}
      {/* ========================================================================= */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          {/* Preset Suggestions Library */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">Mẫu Câu Hỏi Hot Đề Xuất (Bấm để điền nhanh)</h3>
              </div>
              <span className="text-xs text-zinc-400">Tạo nhanh trong 1 giây</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {PRESET_TEMPLATES.map((tpl, i) => (
                <div
                  key={i}
                  onClick={() => handleApplyPreset(tpl)}
                  className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 hover:bg-zinc-900 transition-all cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                      {tpl.category}
                    </span>
                    <span className="text-amber-400 font-bold text-[10px] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Chọn mẫu <ChevronRight size={12} />
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white line-clamp-2">{tpl.question}</p>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium pt-1 border-t border-zinc-800/60">
                    <span className="text-cyan-400 font-bold">A: {tpl.optA}</span>
                    <span className="text-zinc-600">vs</span>
                    <span className="text-rose-400 font-bold">B: {tpl.optB}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Creation Form */}
          <form
            onSubmit={handleCreateQuestion}
            className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
              <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Plus size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Biểu Mẫu Thiết Lập Vòng Đấu ×2 Đám Đông</h3>
                <p className="text-xs text-zinc-400">Nhập nội dung câu hỏi và 2 phương án đối đầu cho người chơi đặt cược</p>
              </div>
            </div>

            {/* Category & Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Chủ Đề / Danh Mục</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
                >
                  <option value="Âm Nhạc">Âm Nhạc (Lossless, Hit, Ca Sĩ, Concert)</option>
                  <option value="Showbiz">Showbiz & Giải Trí</option>
                  <option value="Xu Hướng">Xu Hướng & Trend Giới Trẻ</option>
                  <option value="Đời Sống">Đời Sống & Phong Cách</option>
                  <option value="Thể Thao">Thể Thao & Esports</option>
                  <option value="Đố Vui">Đố Vui & Kiến Thức</option>
                  <option value="Tranh Luận">Tranh Luận Vui & Gu Thẩm Mỹ</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Hạn Chót Đặt Cược (Tùy chọn)</label>
                <input
                  type="datetime-local"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">
                Nội Dung Câu Hỏi Tranh Luận <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="VD: Giữa Sơn Tùng M-TP và Soobin Hoàng Sơn, ai sẽ có bản Hit đạt Top 1 Trending trước trong tháng này?"
                className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-zinc-500 resize-none font-medium leading-relaxed"
                required
              />
            </div>

            {/* Option A & Option B */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-cyan-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-cyan-400 uppercase tracking-wider">
                  <span className="w-5 h-5 rounded bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-[10px]">
                    A
                  </span>
                  Phương Án A <span className="text-rose-400">*</span>
                </div>
                <input
                  type="text"
                  value={newOptAText}
                  onChange={(e) => setNewOptAText(e.target.value)}
                  placeholder="VD: Sơn Tùng M-TP"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-cyan-500 font-bold"
                  required
                />
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-rose-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-rose-400 uppercase tracking-wider">
                  <span className="w-5 h-5 rounded bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-[10px]">
                    B
                  </span>
                  Phương Án B <span className="text-rose-400">*</span>
                </div>
                <input
                  type="text"
                  value={newOptBText}
                  onChange={(e) => setNewOptBText(e.target.value)}
                  placeholder="VD: Soobin Hoàng Sơn"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-rose-500 font-bold"
                  required
                />
              </div>
            </div>

            {/* Betting Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Cược Tối Thiểu (Xu)</label>
                <input
                  type="number"
                  min={1}
                  max={2000}
                  value={newMinBet}
                  onChange={(e) => setNewMinBet(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                  <span>Cược Tối Đa (Xu)</span>
                  <span className="text-amber-400 font-normal text-[11px]">Quy định: Tối đa 2,000 Xu</span>
                </label>
                <input
                  type="number"
                  min={10}
                  max={2000}
                  value={newMaxBet}
                  onChange={(e) => setNewMaxBet(Math.min(Number(e.target.value) || 2000, 2000))}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono font-bold text-amber-400"
                />
              </div>
            </div>

            {/* Extra Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Ghi Chú Luật Thêm (Tùy chọn)</label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="VD: Căn cứ bảng xếp hạng Top Trending Youtube / Zing MP3 vào 23:59 ngày Chủ Nhật."
                className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab('rounds')}
                className="px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    Đang Khởi Tạo Vòng Đấu...
                  </>
                ) : (
                  <>
                    <Zap size={16} className="text-amber-300 fill-amber-300" />
                    Phát Hành Câu Hỏi ×2 Đám Đông
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: NHẬT KÝ VÉ CƯỢC CỦA TOÀN SERVER */}
      {/* ========================================================================= */}
      {activeTab === 'bets' && (
        <div className="space-y-4">
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Eye size={18} className="text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Toàn Bộ Vé Đặt Cược ×2 Đám Đông ({bets.length})</h3>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              Tổng xu cược: <strong className="text-amber-400 font-bold">{totalCoinsWagered.toLocaleString('vi-VN')} Xu</strong>
            </span>
          </div>

          {loadingBets ? (
            <div className="py-12 text-center text-zinc-400">
              <RefreshCw className="animate-spin mx-auto text-indigo-400" size={24} />
              <p className="text-xs font-semibold mt-2">Đang tải nhật ký vé cược...</p>
            </div>
          ) : bets.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
              Chưa có người chơi nào đặt cược vé nào.
            </div>
          ) : (
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 text-[11px] uppercase tracking-wider font-bold">
                    <tr>
                      <th className="p-4">Người Chơi</th>
                      <th className="p-4">Câu Hỏi Tranh Luận</th>
                      <th className="p-4 text-center">Phe Chọn</th>
                      <th className="p-4 text-right">Xu Cược</th>
                      <th className="p-4 text-right">Dự Kiến / Thực Nhận</th>
                      <th className="p-4 text-center">Trạng Thái</th>
                      <th className="p-4 text-right">Thời Gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {bets.map((bet) => (
                      <tr key={bet.id} className="hover:bg-zinc-950/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {bet.userName?.slice(0, 1) || 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1">
                                {bet.userName}
                                {bet.isUserVip && <Crown size={12} className="text-amber-400" />}
                              </div>
                              <div className="text-[10px] text-zinc-500 font-mono">{bet.userAccountId}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 max-w-xs">
                          <p className="text-zinc-200 font-medium truncate" title={bet.questionTitle}>
                            {bet.questionTitle || 'Câu hỏi ×2'}
                          </p>
                        </td>

                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase inline-flex items-center gap-1 ${
                            bet.chosenOption === 'A'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}>
                            Phe {bet.chosenOption}
                          </span>
                        </td>

                        <td className="p-4 text-right font-mono font-bold text-amber-400">
                          {bet.betAmount?.toLocaleString('vi-VN')} Xu
                        </td>

                        <td className="p-4 text-right font-mono font-bold text-yellow-300">
                          {bet.status === 'won' ? (
                            <span className="text-emerald-400">+{bet.rewardAmount || bet.betAmount * 2} Xu</span>
                          ) : (
                            <span>{bet.potentialReward || bet.betAmount * 2} Xu</span>
                          )}
                        </td>

                        <td className="p-4 text-center">
                          {bet.status === 'pending' && (
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold border border-zinc-700">
                              ⏳ Đang Chờ
                            </span>
                          )}
                          {bet.status === 'won' && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase border border-emerald-500/40">
                              🏆 Thắng x2
                            </span>
                          )}
                          {bet.status === 'lost' && (
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/40">
                              ❌ Thua Mất Trắng
                            </span>
                          )}
                          {bet.status === 'refunded' && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                              🔄 Đã Hoàn Tiền
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right text-[11px] text-zinc-500 font-mono">
                          {bet.createdAt ? new Date(bet.createdAt?.seconds ? bet.createdAt.seconds * 1000 : bet.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL / DRAWER: INSPECT BETS FOR SPECIFIC QUESTION */}
      {/* ========================================================================= */}
      {inspectQuestion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-3xl rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">Chi Tiết Vé Cược Vòng Đấu</span>
                <h3 className="text-base font-black text-white line-clamp-1">{inspectQuestion.question}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectQuestion(null)}
                className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
              {(() => {
                const questionBets = bets.filter(b => b.questionId === inspectQuestion.id);
                if (questionBets.length === 0) {
                  return (
                    <div className="py-12 text-center text-zinc-500 text-xs">
                      Chưa có vé cược nào được đặt cho câu hỏi này.
                    </div>
                  );
                }

                return questionBets.map(b => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center">
                        {b.userName?.slice(0, 1)}
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {b.userName}
                          <span className="text-[10px] text-zinc-500 font-mono">({b.userAccountId})</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-2">
                          <span>Chọn: <strong className={b.chosenOption === 'A' ? 'text-cyan-400' : 'text-rose-400'}>Phe {b.chosenOption}</strong></span>
                          <span>•</span>
                          <span className="text-amber-400 font-bold">{b.betAmount?.toLocaleString('vi-VN')} Xu</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {b.status === 'won' && (
                        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-black">
                          +{b.rewardAmount || b.betAmount * 2} Xu 🏆
                        </span>
                      )}
                      {b.status === 'lost' && (
                        <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-bold">
                          Thua mất trắng ❌
                        </span>
                      )}
                      {b.status === 'pending' && (
                        <span className="px-2.5 py-1 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg text-xs font-bold">
                          Chờ kết toán...
                        </span>
                      )}
                      {b.status === 'refunded' && (
                        <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold">
                          Đã hoàn {b.betAmount} Xu
                        </span>
                      )}
                    </div>
                  </div>
                ));
              })()}
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectQuestion(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
