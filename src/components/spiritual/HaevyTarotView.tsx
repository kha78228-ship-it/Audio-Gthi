import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  Eye, 
  HelpCircle, 
  Clock, 
  Heart, 
  Briefcase, 
  Coins, 
  Compass, 
  Check, 
  Layers, 
  BookOpen, 
  ChevronRight, 
  Volume2,
  RefreshCw,
  Share2,
  BrainCircuit,
  Flame,
  Award,
  Copy
} from 'lucide-react';
import { TarotCard, TarotSpread, TarotDrawnCard, TarotReadingHistoryItem, SpiritualShareAttachment } from '../../types';
import { TAROT_CARDS, TAROT_SPREADS } from '../../data/spiritualData';
import { SpiritualShareModal } from './SpiritualShareModal';
import { SpiritualTextReaderModal } from './SpiritualTextReaderModal';
import { spiritualAudio } from '../../utils/spiritualAudioSynthesizer';
import { haptics } from '../../utils/haptics';

interface HaevyTarotViewProps {
  onEarnCoins?: (amount: number, reason: string) => void;
  onNavigateToMode?: (mode: string, subTab?: string) => void;
}

export function HaevyTarotView({ onEarnCoins, onNavigateToMode }: HaevyTarotViewProps) {
  const [selectedSpread, setSelectedSpread] = useState<TarotSpread>(TAROT_SPREADS[0]);
  const [userQuestion, setUserQuestion] = useState('');
  const [readingPhase, setReadingPhase] = useState<'setup' | 'shuffling' | 'picking' | 'revealed'>('setup');
  const [drawnCards, setDrawnCards] = useState<TarotDrawnCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [activeCardDetail, setActiveCardDetail] = useState<TarotDrawnCard | null>(null);
  const [isAiInterpreting, setIsAiInterpreting] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null);
  const [history, setHistory] = useState<TarotReadingHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareAttachment, setShareAttachment] = useState<SpiritualShareAttachment | null>(null);
  const [isReaderModalOpen, setIsReaderModalOpen] = useState(false);

  // Load reading history
  useEffect(() => {
    try {
      const saved = localStorage.getItem('haevy_tarot_history_v1');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Start Shuffle
  const handleStartShuffle = () => {
    haptics.impact('medium');
    spiritualAudio.playWindChime();
    setReadingPhase('shuffling');
    setDrawnCards([]);
    setFlippedCards({});
    setActiveCardDetail(null);
    setAiInterpretation(null);

    // Shuffle for 1.8s then go to picking phase
    setTimeout(() => {
      setReadingPhase('picking');
      spiritualAudio.playSingingBowl(340);
    }, 1800);
  };

  // Pick a card from fan deck
  const handlePickCard = (fanIndex: number) => {
    if (drawnCards.length >= selectedSpread.cardCount) return;

    haptics.impact('light');
    spiritualAudio.playCardFlipChime();

    // Randomize from TAROT_CARDS
    const remainingDeck = TAROT_CARDS.filter(
      c => !drawnCards.some(d => d.card.id === c.id)
    );
    const randomCard = remainingDeck[Math.floor(Math.random() * remainingDeck.length)] || TAROT_CARDS[0];
    const isReversed = Math.random() < 0.3; // 30% chance reversed
    const positionIndex = drawnCards.length;
    const posInfo = selectedSpread.positions[positionIndex] || { name: `Lá ${positionIndex + 1}`, desc: 'Ý nghĩa vị trí' };

    const newDrawn: TarotDrawnCard = {
      card: randomCard,
      isReversed,
      positionIndex,
      positionName: posInfo.name,
      positionDesc: posInfo.desc
    };

    const updated = [...drawnCards, newDrawn];
    setDrawnCards(updated);
    setFlippedCards(prev => ({ ...prev, [positionIndex]: true }));

    // If all cards picked, transition to revealed
    if (updated.length === selectedSpread.cardCount) {
      setTimeout(() => {
        setReadingPhase('revealed');
        setActiveCardDetail(updated[0]);
        spiritualAudio.playTempleBell();
        if (onEarnCoins) {
          onEarnCoins(50, 'Bốc quẻ Tarot thông điệp vũ trụ (+50 Xu)');
        }
        // Auto trigger AI reading
        handleGenerateAiReading(updated);
      }, 600);
    }
  };

  // AI Interpretation
  const handleGenerateAiReading = async (cardsToAnalyze = drawnCards) => {
    if (cardsToAnalyze.length === 0) return;
    setIsAiInterpreting(true);
    setAiInterpretation(null);

    const question = userQuestion.trim() || 'Lời khuyên và thông điệp vũ trụ dành cho tôi lúc này';

    try {
      const payload = {
        question,
        spreadName: selectedSpread.name,
        cards: cardsToAnalyze.map(d => ({
          nameVi: d.card.nameVi,
          nameEn: d.card.nameEn,
          isReversed: d.isReversed,
          positionName: d.positionName,
          keywords: d.card.keywords,
          meaning: d.isReversed ? d.card.reversedMeaning : d.card.uprightMeaning
        }))
      };

      const res = await fetch('/api/spiritual/tarot-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reading) {
          setAiInterpretation(data.reading);
          saveToHistory(cardsToAnalyze, data.reading);
          setIsAiInterpreting(false);
          return;
        }
      }
    } catch {
      // Fallback local interpretation
    }

    // High quality local fallback interpretation
    setTimeout(() => {
      const cardsSummary = cardsToAnalyze.map(c => 
        `• **Vị trí ${c.positionName}**: **${c.card.nameVi}** (${c.isReversed ? 'Chiều Ngược / Reversed' : 'Chiều Xuôi / Upright'})\n  👉 *${c.isReversed ? c.card.reversedMeaning : c.card.uprightMeaning}*`
      ).join('\n\n');

      const localResult = `### 🔮 Luận Giải Quẻ Tarot: "${question}"

${cardsSummary}

---

#### ✨ Tổng Quan Dòng Chảy Năng Lượng:
Quẻ bài mang thông điệp tích cực về sự chuyển hóa và khai mở tiềm năng. Vũ trụ đang mời gọi bạn giữ vững niềm tin, lắng nghe tiếng nói sâu thẳm của trực giác và không ngần ngại bước qua những thử thách tạm thời.

#### 💡 Lời Khuyên Hành Động:
1. **Thấu hiểu nội tâm**: Dành 5-10 phút tĩnh lặng mỗi ngày để kết nối lại với mục tiêu chân thật của bạn.
2. **Quyết đoán hành động**: Khi thời cơ đến, hãy can đảm tiến bước với sự chuẩn bị chu đáo và tâm thế bình thản.
3. **Lan tỏa năng lượng thiện lành**: Mọi sự chân thành gieo xuống hôm nay đều sẽ nở hoa thành phúc lộc cho tương lai.`;

      setAiInterpretation(localResult);
      saveToHistory(cardsToAnalyze, localResult);
      setIsAiInterpreting(false);
    }, 1200);
  };

  // Save to history
  const saveToHistory = (cards: TarotDrawnCard[], aiText?: string) => {
    const newItem: TarotReadingHistoryItem = {
      id: `tarot_${Date.now()}`,
      spreadId: selectedSpread.id,
      spreadName: selectedSpread.name,
      question: userQuestion.trim() || 'Thông điệp vũ trụ dẫn lối',
      cards,
      aiAnalysis: aiText,
      createdAt: new Date().toISOString()
    };
    const updatedHistory = [newItem, ...history.slice(0, 19)];
    setHistory(updatedHistory);
    localStorage.setItem('haevy_tarot_history_v1', JSON.stringify(updatedHistory));
  };

  const handleOpenShareTarot = () => {
    haptics.impact('medium');
    const attachment: SpiritualShareAttachment = {
      type: 'tarot',
      title: `🔮 Quẻ Bói Tarot: ${selectedSpread.name}`,
      subtitle: userQuestion ? `Câu hỏi: "${userQuestion}"` : `Trải bài ${selectedSpread.cardCount} lá`,
      questionOrTheme: userQuestion || 'Thông điệp năng lượng vũ trụ',
      tarotCards: drawnCards.map(d => ({
        nameVi: d.card.nameVi,
        nameEn: d.card.nameEn,
        imageUrl: d.card.imageUrl || '',
        imageSymbol: d.card.imageSymbol,
        isReversed: d.isReversed,
        positionName: d.positionName,
        keywords: d.card.keywords,
        meaning: d.isReversed ? d.card.reversedMeaning : d.card.uprightMeaning
      })),
      aiVerdictExcerpt: aiInterpretation || drawnCards.map(d => `• ${d.positionName}: ${d.card.nameVi} (${d.isReversed ? 'Ngược' : 'Xuôi'}) - ${d.card.keywords.join(', ')}`).join('\n'),
      createdAt: new Date().toISOString()
    };

    setShareAttachment(attachment);
    setIsShareModalOpen(true);
  };

  return (
    <div className="w-full flex flex-col items-center space-y-6 animate-fadeIn pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-purple-400/30 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="w-full bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-zinc-950 rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              78 Lá Bài Chuẩn Rider-Waite & AI Luận Giải
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              🔮 Bói Bài Tarot 3D Vũ Trụ
            </h2>
            <p className="text-sm text-zinc-300 mt-1.5 max-w-2xl leading-relaxed">
              Khai mở thông điệp tâm linh, soi tỏ ngã rẽ tình duyên, sự nghiệp và tài lộc qua từng lá bài huyền bí với sự hướng dẫn của Trí Tuệ Nhân Tạo Haevy AI.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2.5 rounded-2xl bg-zinc-900/80 hover:bg-purple-900/40 border border-purple-500/30 text-purple-200 text-xs font-semibold flex items-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <Clock className="w-4 h-4 text-purple-400" />
              Lịch Sử Quẻ ({history.length})
            </button>
            <button
              onClick={handleStartShuffle}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-600/30 active:scale-95"
            >
              <RotateCw className="w-4 h-4" />
              Trải Quẻ Mới
            </button>
          </div>
        </div>
      </div>

      {/* History Drawer Modal */}
      {showHistory && (
        <div className="w-full bg-zinc-900/95 border border-purple-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl animate-fadeIn">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Lịch Sử Bói Bài Tarot Đã Lưu
            </h3>
            <button
              onClick={() => setShowHistory(false)}
              className="text-xs text-zinc-400 hover:text-white px-3 py-1 rounded-xl bg-zinc-800"
            >
              Đóng
            </button>
          </div>

          {history.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-6">Chưa có quẻ bài nào được lưu. Hãy trải một quẻ mới ngay!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {history.map(item => (
                <div key={item.id} className="p-4 rounded-2xl bg-zinc-950/80 border border-purple-500/20 hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-purple-300 font-semibold mb-1">
                      <span>{item.spreadName}</span>
                      <span className="text-zinc-500">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <p className="text-sm font-bold text-white line-clamp-1">"{item.question}"</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.cards.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-purple-900/40 text-purple-200 text-xs border border-purple-500/20">
                          {c.card.nameVi} {c.isReversed ? '(Ngược)' : '(Xuôi)'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setDrawnCards(item.cards);
                      setSelectedSpread(TAROT_SPREADS.find(s => s.id === item.spreadId) || TAROT_SPREADS[0]);
                      setUserQuestion(item.question);
                      setAiInterpretation(item.aiAnalysis || null);
                      setReadingPhase('revealed');
                      setActiveCardDetail(item.cards[0]);
                      setShowHistory(false);
                      showToast('Đã tải lại quẻ bài từ lịch sử!');
                    }}
                    className="w-full py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Xem Chi Tiết Quẻ Này
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Spread Selection & Question Input (Phase: Setup) */}
      {readingPhase === 'setup' && (
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Spreads */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              1. Chọn Kiểu Trải Bài
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {TAROT_SPREADS.map(spread => {
                const isSelected = selectedSpread.id === spread.id;
                return (
                  <button
                    key={spread.id}
                    onClick={() => {
                      haptics.impact('light');
                      setSelectedSpread(spread);
                    }}
                    className={`p-4 rounded-2xl text-left transition-all border relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-zinc-950 border-purple-400 ring-2 ring-purple-500/30 shadow-xl'
                        : 'bg-zinc-950/80 border-zinc-800/80 hover:border-purple-500/40 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {spread.tag} • {spread.cardCount} Lá
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                      </div>
                      <h4 className="text-base font-bold text-white mb-1">{spread.name}</h4>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{spread.description}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
                      <span>{spread.englishName}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Col: Question & Quick Presets */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-indigo-300 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              2. Đặt Câu Hỏi Tâm Niệm
            </h3>

            <div className="bg-zinc-950/90 rounded-2xl p-4 border border-zinc-800 space-y-3.5 shadow-xl">
              <textarea
                value={userQuestion}
                onChange={e => setUserQuestion(e.target.value)}
                placeholder="Tập trung tâm trí và viết câu hỏi bạn đang băn khoăn (hoặc để trống để đón nhận thông điệp tổng quan)..."
                rows={3}
                className="w-full bg-zinc-900/90 border border-zinc-700/80 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
              />

              <div>
                <p className="text-xs text-zinc-400 mb-2 font-medium">Gợi ý câu hỏi phổ biến:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Tình duyên trong tháng này có bước tiến mới không?',
                    'Dự án công việc sắp tới có thuận lợi không?',
                    'Thông điệp và bài học vũ trụ dành cho tôi hôm nay?',
                    'Tài chính và dòng tiền tuần tới diễn biến ra sao?'
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setUserQuestion(preset)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-purple-900/30 text-zinc-300 hover:text-purple-200 border border-zinc-800 transition-all text-left"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStartShuffle}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 active:scale-98 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Bắt Đầu Xào Bài & Kết Nối Năng Lượng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shuffling Phase */}
      {readingPhase === 'shuffling' && (
        <div className="w-full min-h-[360px] flex flex-col items-center justify-center bg-zinc-950/80 rounded-3xl border border-purple-500/30 p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="relative w-32 h-44 flex items-center justify-center">
            {/* Animated deck shuffle effect */}
            <div className="absolute w-28 h-40 bg-gradient-to-br from-purple-800 to-indigo-950 rounded-2xl border-2 border-purple-400 shadow-2xl animate-pulse rotate-[-12deg]" />
            <div className="absolute w-28 h-40 bg-gradient-to-br from-indigo-800 to-purple-950 rounded-2xl border-2 border-indigo-400 shadow-2xl animate-spin rotate-[8deg]" />
            <div className="absolute w-28 h-40 bg-gradient-to-br from-pink-800 to-purple-950 rounded-2xl border-2 border-pink-400 shadow-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-300 animate-bounce" />
            </div>
          </div>

          <div className="space-y-2 max-w-md">
            <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <RotateCw className="w-5 h-5 text-purple-400 animate-spin" />
              Đang Xào 78 Lá Bài & Hòa Nhịp Tâm Thức...
            </h3>
            <p className="text-xs text-zinc-400">
              Hãy hít thở sâu, giữ tâm trí tĩnh tại và gửi gắm câu hỏi của bạn vào trường năng lượng vũ trụ.
            </p>
          </div>
        </div>
      )}

      {/* Card Picking Phase (Fan Deck) */}
      {readingPhase === 'picking' && (
        <div className="w-full flex flex-col items-center bg-zinc-950/90 rounded-3xl border border-purple-500/30 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">
              Đã bốc {drawnCards.length} / {selectedSpread.cardCount} lá
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {drawnCards.length < selectedSpread.cardCount
                ? `Hãy Chọn Lá Bài Cho Vị Trí: "${selectedSpread.positions[drawnCards.length]?.name || 'Lá Tiếp Theo'}"`
                : 'Đã Hoàn Tất Chọn Bài! Đang Mở Quẻ...'}
            </h3>
            <p className="text-xs text-zinc-400">
              Lướt và nhấp vào bất kỳ lá bài nào bạn cảm nhận được năng lượng kết nối mạnh mẽ nhất.
            </p>
          </div>

          {/* Fan Deck Container */}
          <div className="w-full overflow-x-auto py-8 px-4 flex items-center justify-center min-h-[220px] custom-scrollbar">
            <div className="flex items-center -space-x-4 sm:-space-x-6 hover:-space-x-2 transition-all">
              {Array.from({ length: 22 }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePickCard(idx)}
                  className="w-16 sm:w-20 h-28 sm:h-36 rounded-xl bg-gradient-to-b from-indigo-900 via-purple-950 to-zinc-950 border-2 border-purple-400/60 shadow-xl hover:-translate-y-5 hover:border-amber-300 hover:shadow-purple-500/50 hover:rotate-0 transition-all duration-300 transform active:scale-95 flex flex-col items-center justify-between p-2 cursor-pointer group"
                  style={{
                    transform: `rotate(${(idx - 11) * 3}deg)`
                  }}
                >
                  <div className="w-full flex justify-between items-center text-[10px] text-purple-300">
                    <span>✦</span>
                    <span>✦</span>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-purple-400/40 flex items-center justify-center text-purple-200 group-hover:text-amber-300 group-hover:scale-125 transition-all">
                    🔮
                  </div>
                  <div className="w-full text-center text-[8px] font-mono text-purple-400/60">
                    HAEVY
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Already Drawn Slots Preview */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-zinc-800/80 w-full">
            {selectedSpread.positions.map((pos, i) => {
              const drawn = drawnCards[i];
              return (
                <div
                  key={i}
                  className={`w-28 sm:w-32 h-40 sm:h-44 rounded-2xl border-2 p-2.5 flex flex-col items-center justify-between text-center transition-all ${
                    drawn
                      ? 'bg-purple-950/80 border-purple-400 shadow-lg shadow-purple-600/30'
                      : 'bg-zinc-900/50 border-dashed border-zinc-700 text-zinc-500'
                  }`}
                >
                  <span className="text-[10px] font-bold text-purple-300 line-clamp-1">{pos.name}</span>
                  {drawn ? (
                    <div className="flex flex-col items-center space-y-1">
                      <span className="text-2xl">{drawn.card.imageSymbol}</span>
                      <span className="text-xs font-bold text-white line-clamp-1">{drawn.card.nameVi}</span>
                      <span className="text-[10px] text-amber-300">{drawn.isReversed ? 'Ngược' : 'Xuôi'}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-1 text-zinc-600">
                      <HelpCircle className="w-6 h-6" />
                      <span className="text-[10px]">Chờ bốc...</span>
                    </div>
                  )}
                  <span className="text-[9px] text-zinc-500">Vị trí {i + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Revealed Phase (Reading Table & AI Analysis) */}
      {readingPhase === 'revealed' && drawnCards.length > 0 && (
        <div className="w-full space-y-6">
          {/* Question & Spread Re-cap Banner */}
          <div className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Trải Bài: {selectedSpread.name} ({selectedSpread.cardCount} Lá)
              </span>
              <p className="text-sm font-semibold text-white mt-0.5">
                "{userQuestion.trim() || 'Thông điệp và năng lượng vũ trụ dành cho bạn'}"
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGenerateAiReading()}
                disabled={isAiInterpreting}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAiInterpreting ? 'animate-spin' : ''}`} />
                {isAiInterpreting ? 'Đang Luận Giải...' : 'Luận Giải Lại'}
              </button>
              <button
                onClick={handleStartShuffle}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                Quẻ Khác
              </button>
            </div>
          </div>

          {/* Cards Spread Display Table */}
          <div className="w-full bg-gradient-to-b from-purple-950/40 via-zinc-950 to-zinc-950 p-6 rounded-3xl border border-purple-500/30 shadow-2xl">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {drawnCards.map((drawn, idx) => {
                const isSelected = activeCardDetail?.card.id === drawn.card.id;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      haptics.impact('light');
                      spiritualAudio.playCardFlipChime();
                      setActiveCardDetail(drawn);
                    }}
                    className={`w-36 sm:w-44 h-56 sm:h-64 rounded-2xl p-3 flex flex-col justify-between text-left transition-all duration-300 transform relative overflow-hidden border-2 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-b from-purple-900/90 via-indigo-950 to-zinc-950 border-amber-400 ring-4 ring-purple-500/30 -translate-y-2 shadow-2xl shadow-purple-600/50'
                        : 'bg-zinc-900/90 border-purple-500/40 hover:border-purple-300 hover:-translate-y-1 shadow-lg'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 font-mono">{drawn.card.romanNumeral}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30 font-medium">
                        {drawn.positionName}
                      </span>
                    </div>

                    {/* Center Artwork Symbol */}
                    <div className="my-auto flex flex-col items-center justify-center text-center">
                      <div className={`text-4xl sm:text-5xl transform transition-transform ${drawn.isReversed ? 'rotate-180' : ''}`}>
                        {drawn.card.imageSymbol}
                      </div>
                      <h4 className="text-sm font-bold text-white mt-2 line-clamp-1">{drawn.card.nameVi}</h4>
                      <p className="text-[10px] text-zinc-400 line-clamp-1">{drawn.card.nameEn}</p>
                    </div>

                    {/* Footer badge */}
                    <div className="flex items-center justify-between text-[10px] pt-2 border-t border-purple-500/20">
                      <span className="text-purple-300 font-semibold">{drawn.card.element}</span>
                      <span className={`font-bold px-1.5 py-0.5 rounded ${drawn.isReversed ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        {drawn.isReversed ? 'Chiếu Ngược' : 'Chiếu Xuôi'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Selected Card Inspection */}
          {activeCardDetail && (
            <div className="w-full bg-zinc-950/90 border border-purple-500/30 rounded-3xl p-6 shadow-2xl animate-fadeIn space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activeCardDetail.card.imageSymbol}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-black text-white">
                        {activeCardDetail.card.nameVi} ({activeCardDetail.card.romanNumeral})
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        activeCardDetail.isReversed ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {activeCardDetail.isReversed ? 'Chiều Ngược (Reversed)' : 'Chiều Xuôi (Upright)'}
                      </span>
                    </div>
                    <p className="text-xs text-purple-300">
                      Vị trí: <strong>{activeCardDetail.positionName}</strong> — {activeCardDetail.positionDesc}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {activeCardDetail.card.keywords.map((kw, i) => (
                    <span key={i} className="text-xs px-2.5 py-0.5 rounded-lg bg-purple-900/30 text-purple-200 border border-purple-500/20 font-medium">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Meanings breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Ý Nghĩa Chính
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {activeCardDetail.isReversed ? activeCardDetail.card.reversedMeaning : activeCardDetail.card.uprightMeaning}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                  <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" />
                    Tình Duyên & Cảm Xúc
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {activeCardDetail.card.loveDetail}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    Công Danh & Tài Lộc
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {activeCardDetail.card.careerDetail}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-start gap-3">
                <Award className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-purple-200">Lời Khuyên Hành Động:</h5>
                  <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">{activeCardDetail.card.advice}</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Master Interpretation Box */}
          <div className="w-full bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-zinc-950 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/30">
              <div className="flex items-center gap-2.5">
                <BrainCircuit className="w-6 h-6 text-purple-400 animate-pulse" />
                <h3 className="text-lg sm:text-xl font-extrabold text-white">
                  🔮 Luận Giải Tổng Hòa Từ Đại Sư Haevy AI
                </h3>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {isAiInterpreting ? (
                  <div className="flex items-center gap-2 text-xs text-purple-300">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                    Đang phân tích sâu...
                  </div>
                ) : aiInterpretation ? (
                  <>
                    <button
                      id="btn_open_tarot_reader"
                      onClick={() => {
                        haptics.impact('medium');
                        setIsReaderModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
                      title="Mở chế độ đọc sách tâm linh toàn màn hình & phát giọng đọc AI"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>🎙️ Nghe Đọc / Đọc Sách</span>
                    </button>

                    <button
                      onClick={handleOpenShareTarot}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
                      title="Chia sẻ kết quả qua Haevy Message hoặc I Love Haevy"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Chia Sẻ</span>
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`🔮 QUẺ BÓI TAROT HAEVY SPIRITUAL\n❓ Câu hỏi: ${userQuestion || 'Thông điệp vũ trụ'}\n🃏 Trải bài: ${selectedSpread.name}\n\n${aiInterpretation}`);
                        haptics.impact('light');
                        showToast('Đã sao chép toàn bộ bài luận giải!');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Sao chép bài luận giải"
                    >
                      <Copy className="w-3.5 h-3.5 text-purple-300" />
                      <span>Sao Chép</span>
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            {isAiInterpreting ? (
              <div className="py-8 text-center space-y-3">
                <RotateCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                <p className="text-sm text-zinc-300">
                  Haevy AI đang liên kết năng lượng các lá bài với câu hỏi của bạn để tạo ra bài luận giải sâu sắc nhất...
                </p>
              </div>
            ) : aiInterpretation ? (
              <div className="text-sm text-zinc-200 leading-relaxed space-y-3 whitespace-pre-wrap font-sans">
                {aiInterpretation}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Toast message popup */}
      {toastMessage && (
        <div className="fixed bottom-24 sm:bottom-20 right-4 z-50 bg-zinc-900/95 border border-purple-500/50 text-purple-200 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
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
        title={`Luận Giải Tarot: ${selectedSpread.name}`}
        subtitle={userQuestion ? `Câu hỏi: "${userQuestion}"` : 'Thông điệp vũ trụ dẫn lối cuộc sống'}
        category="tarot"
        contentMarkdown={aiInterpretation || ''}
        onShare={handleOpenShareTarot}
      />
    </div>
  );
}
