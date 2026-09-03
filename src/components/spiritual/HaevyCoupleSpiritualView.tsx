import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Sparkles, 
  Moon, 
  Sun, 
  Send, 
  BookOpen, 
  Share2, 
  RefreshCw, 
  Flame, 
  Award, 
  Calendar, 
  User, 
  ChevronRight, 
  Lock, 
  Loader2,
  CheckCircle2,
  BrainCircuit,
  MessageSquare,
  Copy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TarotCard, SpiritualShareAttachment } from '../../types';
import { TAROT_CARDS, ZODIAC_SIGNS } from '../../data/spiritualData';
import { calculateZodiacCompatibility } from '../../utils/astrologyCalculator';
import { spiritualAudio } from '../../utils/spiritualAudioSynthesizer';
import { haptics } from '../../utils/haptics';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { SpiritualShareModal } from './SpiritualShareModal';
import { SpiritualTextReaderModal } from './SpiritualTextReaderModal';

interface HaevyCoupleSpiritualViewProps {
  onEarnCoins?: (amount: number, reason: string) => void;
  onNavigateToMode?: (mode: string, subTab?: string) => void;
}

export function HaevyCoupleSpiritualView({
  onEarnCoins,
  onNavigateToMode
}: HaevyCoupleSpiritualViewProps) {
  const { user } = useAuth();

  // Couple status from I Love Haevy
  const [coupleData, setCoupleData] = useState<any | null>(null);
  const [isLoadingCouple, setIsLoadingCouple] = useState(true);

  // Profile forms
  const [partner1Name, setPartner1Name] = useState('Bạn');
  const [partner1Sign, setPartner1Sign] = useState('leo');
  const [partner2Name, setPartner2Name] = useState('Người Ấy');
  const [partner2Sign, setPartner2Sign] = useState('sagittarius');

  // Drawn Cards (3-card love spread)
  const [drawnCards, setDrawnCards] = useState<{
    card: TarotCard;
    isReversed: boolean;
    role: string;
    roleDesc: string;
  }[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [isAiInterpreting, setIsAiInterpreting] = useState(false);
  const [aiLoveReading, setAiLoveReading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Share modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareAttachment, setShareAttachment] = useState<SpiritualShareAttachment | null>(null);
  const [isReaderModalOpen, setIsReaderModalOpen] = useState(false);
  const [readerContent, setReaderContent] = useState<{ title: string; subtitle: string; content: string }>({
    title: '',
    subtitle: '',
    content: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch couple info from Firestore
  useEffect(() => {
    if (!user) {
      setIsLoadingCouple(false);
      return;
    }

    const fetchCouple = async () => {
      try {
        const q1 = query(collection(db, 'couples'), where('partner1.uid', '==', user.uid));
        const q2 = query(collection(db, 'couples'), where('partner2.uid', '==', user.uid));
        const snap1 = await getDocs(q1);
        if (!snap1.empty) {
          const d = snap1.docs[0].data();
          if (d.status !== 'cancelled') {
            setCoupleData({ id: snap1.docs[0].id, ...d });
            setPartner1Name(d.partner1?.nickname || d.partner1?.displayName || 'Bạn');
            setPartner2Name(d.partner2?.nickname || d.partner2?.displayName || 'Người Ấy');
            setIsLoadingCouple(false);
            return;
          }
        }
        const snap2 = await getDocs(q2);
        if (!snap2.empty) {
          const d = snap2.docs[0].data();
          if (d.status !== 'cancelled') {
            setCoupleData({ id: snap2.docs[0].id, ...d });
            setPartner1Name(d.partner2?.nickname || d.partner2?.displayName || 'Bạn');
            setPartner2Name(d.partner1?.nickname || d.partner1?.displayName || 'Người Ấy');
          }
        }
      } catch (err) {
        console.warn('Error fetching couple for spiritual view:', err);
      }
      setIsLoadingCouple(false);
    };

    fetchCouple();
  }, [user]);

  // Initial draw
  useEffect(() => {
    handleDrawLoveTarot();
  }, []);

  // Draw 3 cards for couple
  const handleDrawLoveTarot = () => {
    haptics.impact('medium');
    spiritualAudio.playCardShuffle();

    const shuffled = [...TAROT_CARDS].sort(() => 0.5 - Math.random());
    const cards = [
      {
        card: shuffled[0],
        isReversed: Math.random() > 0.65,
        role: `Năng Lượng Của ${partner1Name}`,
        roleDesc: 'Tâm tư, cảm xúc cốt lõi và mong muốn của bạn trong mối quan hệ.'
      },
      {
        card: shuffled[1],
        isReversed: Math.random() > 0.65,
        role: `Tâm Tư Của ${partner2Name}`,
        roleDesc: 'Năng lượng tiềm thức, suy nghĩ thầm kín và cảm nhận của đối phương.'
      },
      {
        card: shuffled[2],
        isReversed: Math.random() > 0.7,
        role: 'Sợi Dây Kết Nối & Tương Lai',
        roleDesc: 'Xu hướng tình duyên, cơ hội gắn kết và định mệnh của hai bạn.'
      }
    ];

    setDrawnCards(cards);
    setRevealedIndices([0, 1, 2]);
    setAiLoveReading(null);

    if (onEarnCoins) {
      onEarnCoins(30, 'Trải bài Tarot Tình Duyên Cặp Đôi (+30 Xu)');
    }
  };

  // Compatibility math
  const compResult = calculateZodiacCompatibility(partner1Sign, partner2Sign);

  // Request AI Master Reading for Couple
  const handleRequestAiReading = async () => {
    if (drawnCards.length < 3) return;
    setIsAiInterpreting(true);
    spiritualAudio.playSingingBowl(528);

    try {
      const payload = {
        partner1Name,
        partner1Sign,
        partner2Name,
        partner2Sign,
        cards: drawnCards.map(d => ({
          role: d.role,
          card: {
            nameVi: d.card.nameVi,
            uprightMeaning: d.card.uprightMeaning
          },
          isReversed: d.isReversed
        })),
        compatibilityScore: compResult.overallScore
      };

      const res = await fetch('/api/spiritual/couple-synastry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reading) {
          setAiLoveReading(data.reading);
          setIsAiInterpreting(false);
          spiritualAudio.playTempleBell();
          showToast('Đã nhận được luận giải tình duyên vũ trụ từ AI Master!');
          return;
        }
      }
    } catch (e) {
      console.warn('Couple AI reading fallback');
    }

    // Fallback reading
    const fallbackText = `### 💖 Luận Giải Tình Duyên Cặp Đôi: ${partner1Name} & ${partner2Name}\n\n` +
      `**1. Năng Lượng Đôi Lứa**: Lá **${drawnCards[0].card.nameVi}** cho thấy bạn đang tràn đầy mong muốn gắn kết và chân thành. Trong khi đó, **${drawnCards[1].card.nameVi}** phản ánh người ấy dành cho bạn sự trân quý sâu sắc.\n\n` +
      `**2. Điểm Số Tương Hợp 2026**: Sự kết hợp giữa hai bạn đạt **${compResult.overallScore}%** hòa hợp. ${compResult.cosmicVerdict}\n\n` +
      `**3. Định Mệnh & Lời Khuyên Vũ Trụ**: Lá **${drawnCards[2].card.nameVi}** nhắn nhủ hãy luôn lắng nghe, chia sẻ những tâm sự nhỏ mỗi ngày để ngọn lửa tình yêu luôn rực sáng.`;

    setAiLoveReading(fallbackText);
    setIsAiInterpreting(false);
    spiritualAudio.playTempleBell();
  };

  // Open Share Modal
  const handleOpenShare = () => {
    const attachment: SpiritualShareAttachment = {
      type: 'couple_synastry',
      title: `💖 Quẻ Tình Duyên & Hòa Hợp: ${partner1Name} & ${partner2Name}`,
      subtitle: `Điểm hòa hợp: ${compResult.overallScore}% • Trải bài Tarot Đôi`,
      questionOrTheme: `Phân tích tình duyên & tương hợp giữa ${partner1Name} (${partner1Sign}) và ${partner2Name} (${partner2Sign})`,
      tarotCards: drawnCards.map(d => ({
        nameVi: d.card.nameVi,
        nameEn: d.card.nameEn,
        imageUrl: d.card.imageUrl,
        isReversed: d.isReversed,
        positionName: d.role,
        keywords: d.card.keywords,
        meaning: d.isReversed ? d.card.reversedMeaning : d.card.uprightMeaning
      })),
      coupleSynastrySummary: {
        partner1Name,
        partner2Name,
        loveScore: compResult.overallScore,
        relationshipType: coupleData?.title || 'Cặp Đôi Tri Kỷ',
        synastryVerdict: compResult.cosmicVerdict,
        loveAdvice: compResult.advice
      },
      aiVerdictExcerpt: aiLoveReading || compResult.cosmicVerdict,
      createdAt: new Date().toISOString()
    };

    setShareAttachment(attachment);
    setIsShareModalOpen(true);
  };

  // Save directly to I Love Haevy Diary
  const handleDirectSaveDiary = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để lưu vào nhật ký!');
      return;
    }
    if (!coupleData) {
      alert('Bạn chưa ghép đôi trong I Love Haevy. Vui lòng kết nối trước nhé!');
      return;
    }

    try {
      haptics.impact('medium');
      spiritualAudio.playSingingBowl(528);

      const diariesCol = collection(db, 'couples', coupleData.id, 'diaries');
      await addDoc(diariesCol, {
        authorUid: user.uid,
        authorName: partner1Name,
        title: `🔮 [Quẻ Tình Duyên] Hòa hợp ${compResult.overallScore}% • ${partner1Name} & ${partner2Name}`,
        content: `**3 Lá Tarot Tình Yêu**:\n1. ${drawnCards[0]?.role}: ${drawnCards[0]?.card.nameVi}\n2. ${drawnCards[1]?.role}: ${drawnCards[1]?.card.nameVi}\n3. ${drawnCards[2]?.role}: ${drawnCards[2]?.card.nameVi}\n\n**Luận giải**:\n${aiLoveReading || compResult.cosmicVerdict}`,
        mood: 'in_love',
        weather: 'clear',
        category: 'spiritual_reading',
        createdAt: serverTimestamp()
      });

      spiritualAudio.playTempleBell();
      showToast('Đã lưu thành công vào Nhật Ký Tình Yêu của I Love Haevy! 💖');
    } catch (err) {
      console.error('Error saving to diary:', err);
      alert('Không thể lưu vào nhật ký.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* 1. Romantic Ecosystem Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-rose-950/80 via-purple-950/70 to-pink-950/80 border border-rose-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-rose-500/20 border border-rose-400/50 flex items-center justify-center text-rose-300 shadow-md shadow-rose-950/50 shrink-0">
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400/30 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-900/80 text-rose-200 border border-rose-400/40">
                  I Love Haevy x Haevy Spiritual
                </span>
                <span className="text-[10px] text-zinc-400">Đồng bộ hai chiều</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                Tình Duyên & Thần Số Cặp Đôi
              </h2>
              <p className="text-xs text-rose-200/90 mt-0.5 max-w-xl">
                Kết nối tâm linh, giải mã năng lượng tương hợp và bói quẻ Tarot tình yêu dành riêng cho 2 bạn.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {coupleData ? (
              <div className="px-3.5 py-2 rounded-2xl bg-black/40 border border-rose-500/30 text-xs text-rose-300 font-bold flex items-center gap-2">
                <CheckCircle2 size={14} className="text-rose-400" />
                <span>Đã kết nối cặp đôi: {coupleData.partner1?.nickname || 'Bạn'} ❤️ {coupleData.partner2?.nickname || 'Người Ấy'}</span>
              </div>
            ) : (
              onNavigateToMode && (
                <button
                  onClick={() => onNavigateToMode('couple')}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-500/20 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <Heart size={14} />
                  <span>Ghép Đôi Tại I Love Haevy</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* 2. Couple Information & Zodiac Selector */}
      <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-4">
        <h3 className="text-xs sm:text-sm font-black text-zinc-200 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-400" />
          <span>Thông Tin Cặp Đôi & Cung Hoàng Đạo</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Person 1 */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <User size={14} />
                <span>Người Thứ Nhất (Bạn)</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Tên / Biệt danh</label>
                <input
                  type="text"
                  value={partner1Name}
                  onChange={(e) => setPartner1Name(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-rose-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Cung hoàng đạo</label>
                <select
                  value={partner1Sign}
                  onChange={(e) => setPartner1Sign(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-rose-400 cursor-pointer"
                >
                  {ZODIAC_SIGNS.map(s => (
                    <option key={s.id} value={s.id}>{s.nameVi} ({s.symbol})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Person 2 */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                <Heart size={14} />
                <span>Người Thứ Hai (Người Ấy)</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Tên / Biệt danh</label>
                <input
                  type="text"
                  value={partner2Name}
                  onChange={(e) => setPartner2Name(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-pink-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Cung hoàng đạo</label>
                <select
                  value={partner2Sign}
                  onChange={(e) => setPartner2Sign(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-pink-400 cursor-pointer"
                >
                  {ZODIAC_SIGNS.map(s => (
                    <option key={s.id} value={s.id}>{s.nameVi} ({s.symbol})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Synastry Score Overview */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-purple-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider">
              Tương Hợp Chiêm Tinh & Thần Số Học
            </span>
            <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
              Độ Hòa Hợp Cặp Đôi: <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300 font-extrabold">{compResult.overallScore}%</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/40 font-bold">
              {compResult.overallScore >= 80 ? '🌟 Cặp Đôi Định Mệnh' : compResult.overallScore >= 60 ? '💖 Hòa Hợp & Bổ Khuyết' : '🌱 Cần Thấu Hiểu Thêm'}
            </span>
          </div>
        </div>

        {/* 4 Score Progress Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Đồng Điệu Cảm Xúc</span>
              <span className="font-bold text-rose-400">{compResult.emotionalScore}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div style={{ width: `${compResult.emotionalScore}%` }} className="h-full bg-rose-500 rounded-full" />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Giao Tiếp & Lắng Nghe</span>
              <span className="font-bold text-sky-400">{compResult.communicationScore}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div style={{ width: `${compResult.communicationScore}%` }} className="h-full bg-sky-500 rounded-full" />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Lãng Mạn & Hấp Dẫn</span>
              <span className="font-bold text-pink-400">{compResult.romanceScore}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div style={{ width: `${compResult.romanceScore}%` }} className="h-full bg-pink-500 rounded-full" />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Gắn Kết Bền Lâu</span>
              <span className="font-bold text-amber-400">{compResult.longTermScore}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div style={{ width: `${compResult.longTermScore}%` }} className="h-full bg-amber-500 rounded-full" />
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800">
          ✨ {compResult.cosmicVerdict}
        </p>
      </div>

      {/* 4. Love Synergy 3-Card Tarot Spread */}
      <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider">
              Trải Bài Tình Duyên 3 Lá
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              Love Synergy Spread
            </h3>
          </div>

          <button
            onClick={handleDrawLoveTarot}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw size={13} />
            <span>Bốc Quẻ Mới</span>
          </button>
        </div>

        {/* 3 Drawn Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {drawnCards.map((item, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/90 flex flex-col space-y-3 relative group hover:border-purple-500/50 transition-all shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-300">
                  {item.role}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono">
                  {item.isReversed ? 'Lá Ngược' : 'Lá Thuận'}
                </span>
              </div>

              {/* Card Image */}
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-black/50 border border-zinc-700 shadow-md">
                <img 
                  src={item.card.imageUrl} 
                  alt={item.card.nameVi}
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                    item.isReversed ? 'rotate-180' : ''
                  }`}
                />
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">
                  {item.card.nameVi} <span className="text-xs text-zinc-400 font-normal">({item.card.nameEn})</span>
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">
                  {item.isReversed ? item.card.reversedMeaning : item.card.uprightMeaning}
                </p>
              </div>

              <div className="flex flex-wrap gap-1 mt-auto pt-1">
                {item.card.keywords.slice(0, 3).map((kw, kIdx) => (
                  <span key={kIdx} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* AI Master Interpretation Button */}
        <div className="pt-2">
          {!aiLoveReading ? (
            <button
              onClick={handleRequestAiReading}
              disabled={isAiInterpreting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-950/40 cursor-pointer transition-all active:scale-98"
            >
              {isAiInterpreting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>AI Master Đang Luận Giải Tình Duyên Cặp Đôi...</span>
                </>
              ) : (
                <>
                  <BrainCircuit size={16} />
                  <span>Luận Giải Tình Duyên Toàn Diện Cùng Gemini AI Master</span>
                </>
              )}
            </button>
          ) : (
            <div className="p-4 sm:p-5 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-2">
                <span className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-300" />
                  Luận Giải Chi Tiết Cặp Đôi (Gemini AI Master)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    id="btn_open_couple_reader"
                    onClick={() => {
                      haptics.impact('medium');
                      setReaderContent({
                        title: `Tình Duyên: ${partner1Name} & ${partner2Name}`,
                        subtitle: `Độ hòa hợp: ${compResult.overallScore}% • ${partner1Sign} & ${partner2Sign}`,
                        content: aiLoveReading
                      });
                      setIsReaderModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-purple-600/40 hover:bg-purple-600/70 border border-purple-400/40 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Mở giao diện đọc sách toàn màn hình & nghe AI đọc"
                  >
                    <BookOpen size={12} />
                    <span>🎙️ Nghe Đọc</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`💖 LUẬN GIẢI TÌNH DUYÊN CẶP ĐÔI\n👤 ${partner1Name} & ${partner2Name}\n💞 Điểm hòa hợp: ${compResult.overallScore}%\n\n${aiLoveReading}`);
                      haptics.impact('light');
                      showToast('Đã sao chép luận giải tình duyên!');
                    }}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs"
                    title="Sao chép"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={handleRequestAiReading}
                    disabled={isAiInterpreting}
                    className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
                  >
                    <RefreshCw size={11} />
                    <span>Luận lại</span>
                  </button>
                </div>
              </div>

              <div className="text-xs text-zinc-200 leading-relaxed space-y-2 whitespace-pre-wrap">
                {aiLoveReading}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Cross-Ecosystem Action Bar */}
      <div className="p-4 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenShare}
            className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-sky-600/20 cursor-pointer transition-all active:scale-95"
          >
            <MessageSquare size={14} />
            <span>Gửi Bạn Bè / Người Ấy (Haevy Message)</span>
          </button>

          {coupleData && (
            <button
              onClick={handleDirectSaveDiary}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/20 cursor-pointer transition-all active:scale-95"
            >
              <BookOpen size={14} />
              <span>Lưu Vào Nhật Ký I Love Haevy</span>
            </button>
          )}
        </div>

        <button
          onClick={handleOpenShare}
          className="px-4 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 border border-zinc-700 cursor-pointer transition-all"
        >
          <Share2 size={14} />
          <span>Tùy Chọn Chia Sẻ Khác</span>
        </button>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 bg-emerald-950/90 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-2xl animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Universal Share Modal */}
      <SpiritualShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        attachment={shareAttachment}
        onNavigateToMode={onNavigateToMode}
      />

      {/* Spiritual Long-Text AI Audio Reader Modal */}
      <SpiritualTextReaderModal
        isOpen={isReaderModalOpen}
        onClose={() => setIsReaderModalOpen(false)}
        title={readerContent.title || `Tình Duyên: ${partner1Name} & ${partner2Name}`}
        subtitle={readerContent.subtitle || `Điểm hòa hợp ${compResult.overallScore}%`}
        category="couple"
        contentMarkdown={readerContent.content || aiLoveReading || ''}
        onShare={handleOpenShare}
      />
    </div>
  );
}
