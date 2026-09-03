import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  BookOpen, 
  Share2, 
  Copy, 
  Check, 
  HelpCircle, 
  Flame, 
  Coins, 
  Volume2, 
  Zap, 
  Scroll, 
  Compass, 
  RefreshCw,
  Award
} from 'lucide-react';
import { IChingHexagramData, KhongMinhStickData, SpiritualShareAttachment } from '../../types';
import { I_CHING_KEY_HEXAGRAMS, I_CHING_TRIGRAMS, KHONG_MINH_STICKS } from '../../data/palmistryAndDivinationData';
import { SpiritualShareModal } from './SpiritualShareModal';
import { SpiritualTextReaderModal } from './SpiritualTextReaderModal';
import { spiritualAudio } from '../../utils/spiritualAudioSynthesizer';
import { haptics } from '../../utils/haptics';

interface HaevyDivinationViewProps {
  onEarnCoins?: (amount: number, reason: string) => void;
  onNavigateToMode?: (mode: string, subTab?: string) => void;
}

export function HaevyDivinationView({ onEarnCoins, onNavigateToMode }: HaevyDivinationViewProps) {
  const [divinationType, setDivinationType] = useState<'iching' | 'khongminh'>('iching');
  const [userQuestion, setUserQuestion] = useState('');

  // 1. I Ching 3 Coins State
  const [coinTossStep, setCoinTossStep] = useState(0); // 0 to 6
  const [coinValues, setCoinValues] = useState<number[]>([]); // 6 numbers (6, 7, 8, 9)
  const [isTossing, setIsTossing] = useState(false);
  const [currentTossCoins, setCurrentTossCoins] = useState<[boolean, boolean, boolean]>([true, false, true]); // true=Dương (3), false=Âm (2)
  const [selectedHexagram, setSelectedHexagram] = useState<IChingHexagramData | null>(null);
  const [isAiIChingLoading, setIsAiIChingLoading] = useState(false);
  const [aiIChingReading, setAiIChingReading] = useState<string | null>(null);

  // 2. Khổng Minh Sticks State
  const [isShakingTube, setIsShakingTube] = useState(false);
  const [drawnStick, setDrawnStick] = useState<KhongMinhStickData | null>(null);

  // Modals & UI states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareAttachment, setShareAttachment] = useState<SpiritualShareAttachment | null>(null);
  const [isReaderModalOpen, setIsReaderModalOpen] = useState(false);
  const [readerContent, setReaderContent] = useState('');
  const [readerTitle, setReaderTitle] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ==========================================
  // I CHING 3 COINS TOSS LOGIC
  // ==========================================
  const handleTossCoins = () => {
    if (isTossing || coinTossStep >= 6) return;
    setIsTossing(true);
    haptics.impact('medium');
    spiritualAudio.playCoinToss();

    // Randomize 3 coins: each coin is either Dương (3) or Âm (2)
    const coin1 = Math.random() > 0.5;
    const coin2 = Math.random() > 0.5;
    const coin3 = Math.random() > 0.5;
    setCurrentTossCoins([coin1, coin2, coin3]);

    const sum = (coin1 ? 3 : 2) + (coin2 ? 3 : 2) + (coin3 ? 3 : 2); // 6 (Lão Âm), 7 (Thiếu Dương), 8 (Thiếu Âm), 9 (Lão Dương)

    setTimeout(() => {
      const nextValues = [...coinValues, sum];
      setCoinValues(nextValues);
      const nextStep = coinTossStep + 1;
      setCoinTossStep(nextStep);
      setIsTossing(false);
      haptics.success();

      // When all 6 lines are completed
      if (nextStep === 6) {
        // Pick hexagram based on sum calculation
        const hexIndex = (sum + nextValues.reduce((a, b) => a + b, 0)) % I_CHING_KEY_HEXAGRAMS.length;
        const matched = I_CHING_KEY_HEXAGRAMS[hexIndex] || I_CHING_KEY_HEXAGRAMS[0];
        setSelectedHexagram(matched);
        spiritualAudio.playTempleBell();
        if (onEarnCoins) {
          onEarnCoins(50, 'Gieo quẻ Kinh Dịch 6 hào hoàn tất (+50 Xu)');
        }
        handleGenerateIChingAi(matched, nextValues);
      }
    }, 600);
  };

  const handleResetIChing = () => {
    haptics.light();
    setCoinTossStep(0);
    setCoinValues([]);
    setSelectedHexagram(null);
    setAiIChingReading(null);
  };

  const handleGenerateIChingAi = async (hex: IChingHexagramData, values: number[]) => {
    setIsAiIChingLoading(true);
    const changingLines = values
      .map((val, idx) => (val === 6 || val === 9 ? idx + 1 : null))
      .filter(Boolean) as number[];

    try {
      const res = await fetch('/api/spiritual/iching-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQuestion.trim() || 'Xin lời khuyên thời vận',
          hexagram: hex,
          changingYaoLines: changingLines
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reading) {
          setAiIChingReading(data.reading);
          setIsAiIChingLoading(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    const fallback = `### ☯️ Luận Giải Quẻ Kinh Dịch: ${hex.nameVi} (${hex.nameHán})

#### 📜 1. Bản Ý Của Quẻ:
Quẻ **${hex.nameVi}** kết hợp giữa Thượng Quái **${hex.upperTrigram}** và Hạ Quái **${hex.lowerTrigram}**.
*"${hex.thoanTu}"*

#### 🔍 2. Luận Giải Trọng Tâm:
- **Thời Vận**: Năng lượng thiên thời đang ủng hộ sự chính trực và quyết tâm của bạn.
- **Công Danh & Sự Nghiệp**: ${hex.aspects.career}
- **Tài Lộc**: ${hex.aspects.wealth}
- **Tình Duyên**: ${hex.aspects.love}

#### 💡 3. Lời Khuyên Hành Động:
${hex.actionAdvice}`;

    setAiIChingReading(fallback);
    setIsAiIChingLoading(false);
  };

  // ==========================================
  // KHỔNG MINH 100 STICKS LOGIC
  // ==========================================
  const handleDrawKhongMinhStick = () => {
    if (isShakingTube) return;
    setIsShakingTube(true);
    setDrawnStick(null);
    haptics.heavy();
    spiritualAudio.playBambooShake();

    setTimeout(() => {
      const randomIdx = Math.floor(Math.random() * KHONG_MINH_STICKS.length);
      const stick = KHONG_MINH_STICKS[randomIdx] || KHONG_MINH_STICKS[0];
      setDrawnStick(stick);
      setIsShakingTube(false);
      spiritualAudio.playSingingBowl(216);
      haptics.success();
      if (onEarnCoins) {
        onEarnCoins(40, 'Xin xăm Khổng Minh Thần Toán linh ứng (+40 Xu)');
      }
    }, 1200);
  };

  const handleShareIChing = () => {
    if (!selectedHexagram) return;
    haptics.light();
    setShareAttachment({
      type: 'iching',
      title: `☯️ Quẻ Kinh Dịch: ${selectedHexagram.nameVi}`,
      subtitle: `${selectedHexagram.upperTrigram} trên / ${selectedHexagram.lowerTrigram} dưới`,
      questionOrTheme: userQuestion || 'Gieo quẻ Kinh Dịch khai mở thời vận',
      aiVerdictExcerpt: selectedHexagram.overview,
      createdAt: new Date().toISOString()
    });
    setIsShareModalOpen(true);
  };

  const handleShareStick = () => {
    if (!drawnStick) return;
    haptics.light();
    setShareAttachment({
      type: 'khongminh_stick',
      title: `🎋 Xăm Khổng Minh Số ${drawnStick.number} (${drawnStick.tier})`,
      subtitle: drawnStick.poemVi.split('\n')[0],
      questionOrTheme: userQuestion || 'Xin quẻ xăm thần toán',
      aiVerdictExcerpt: drawnStick.overview,
      createdAt: new Date().toISOString()
    });
    setIsShareModalOpen(true);
  };

  const openReader = (title: string, content: string) => {
    setReaderTitle(title);
    setReaderContent(content);
    setIsReaderModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-red-950/60 via-amber-950/50 to-zinc-950/90 border border-amber-500/30 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-950/50 shrink-0">
              <span className="text-2xl sm:text-3xl">☯️</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-900/80 text-amber-200 border border-amber-400/40">
                  Cổ Học Đông Phương & Bát Quái
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">64 Quẻ Dịch & Thần Toán</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white mt-1">
                Gieo Quẻ Kinh Dịch & Xin Xăm Khổng Minh
              </h2>
              <p className="text-xs sm:text-sm text-amber-200/90 mt-0.5 max-w-2xl">
                Bói quẻ 3 đồng tiền cổ Âm Dương tìm kiếm lời dạy của Chu Dịch và lắc ống xăm Thần Toán dự đoán thời vận cầu danh, cầu tài, tình duyên.
              </p>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800 shadow-inner w-full md:w-auto">
            <button
              onClick={() => {
                haptics.impact('light');
                setDivinationType('iching');
              }}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                divinationType === 'iching'
                  ? 'bg-amber-500 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>☯️</span>
              <span>Gieo Quẻ Kinh Dịch (3 Đồng Tiền)</span>
            </button>
            <button
              onClick={() => {
                haptics.impact('light');
                setDivinationType('khongminh');
              }}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                divinationType === 'khongminh'
                  ? 'bg-red-600 text-white shadow-md font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🎋</span>
              <span>Xin Xăm Khổng Minh</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Question Input Box */}
      <div className="bg-zinc-950/90 border border-amber-500/20 p-4 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col sm:flex-row items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
          <HelpCircle size={16} />
        </div>
        <div className="flex-1 w-full">
          <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block mb-1">
            Tĩnh Tâm Đặt Câu Hỏi Trước Khi Gieo Quẻ:
          </label>
          <input
            type="text"
            value={userQuestion}
            onChange={e => setUserQuestion(e.target.value)}
            placeholder="VD: Dự định mở cửa hàng kinh doanh cuối năm nay có thuận lợi không?..."
            className="w-full bg-zinc-900/90 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. I CHING 3 COINS DIVINATION VIEW */}
      {/* ========================================================================= */}
      {divinationType === 'iching' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: 3 Coins Interactive Toss Stage (6 cols) */}
            <div className="lg:col-span-6 bg-zinc-950/90 border border-amber-500/20 rounded-2xl sm:rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    Gieo 3 Đồng Tiền Cổ ({coinTossStep}/6 Hào)
                  </h3>
                  {coinTossStep > 0 && (
                    <button
                      onClick={handleResetIChing}
                      className="text-xs text-zinc-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw size={12} /> Làm lại
                    </button>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Nhấn "Gieo Đồng Xu" 6 lần từ Hào 1 (dưới cùng) lên Hào 6 (trên cùng) để đúc kết 1 trong 64 quẻ Trùng Quái.
                </p>
              </div>

              {/* 3 Coins Visual Box */}
              <div className="relative py-8 bg-gradient-to-b from-amber-950/20 to-zinc-900/60 rounded-2xl border border-amber-500/30 flex items-center justify-center gap-4 sm:gap-6 shadow-inner">
                {currentTossCoins.map((isYang, idx) => (
                  <div
                    key={idx}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-400/80 flex items-center justify-center shadow-2xl transition-all duration-500 ${
                      isTossing ? 'animate-bounce scale-110 rotate-180' : 'scale-100 hover:scale-105'
                    } ${
                      isYang
                        ? 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-zinc-950 font-black'
                        : 'bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-900 text-amber-300 font-black'
                    }`}
                  >
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-sm border border-zinc-950/40 bg-zinc-950/20 flex items-center justify-center text-[10px]">
                      {isYang ? '☰' : '☷'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Toss Button */}
              <button
                onClick={handleTossCoins}
                disabled={isTossing || coinTossStep >= 6}
                className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                  coinTossStep >= 6
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-zinc-950 shadow-amber-500/20 active:scale-98'
                }`}
              >
                {isTossing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                    <span>Đang Tung Đồng Xu Leng Keng...</span>
                  </>
                ) : coinTossStep >= 6 ? (
                  <span>Đã Hoàn Thành 6 Hào Quẻ</span>
                ) : (
                  <>
                    <Coins className="w-4 h-4 text-zinc-950" />
                    <span>Gieo Hào {coinTossStep + 1} (Tung 3 Đồng Tiền)</span>
                  </>
                )}
              </button>
            </div>

            {/* Right: 6 Yao Lines Diagram (6 cols) */}
            <div className="lg:col-span-6 bg-zinc-950/90 border border-amber-500/20 rounded-2xl sm:rounded-3xl p-5 shadow-xl space-y-3">
              <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center justify-between">
                <span>Dựng Hình 6 Hào Quẻ Dịch</span>
                <span className="text-[10px] text-zinc-400">Từ dưới lên trên</span>
              </h3>

              <div className="space-y-2 py-2">
                {[5, 4, 3, 2, 1, 0].map(lineIdx => {
                  const val = coinValues[lineIdx];
                  const isFilled = val !== undefined;
                  const isYang = val === 7 || val === 9;
                  const isChanging = val === 6 || val === 9;

                  return (
                    <div
                      key={lineIdx}
                      className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                        isFilled
                          ? 'bg-zinc-900/90 border-amber-500/40 text-amber-200'
                          : 'bg-zinc-950/40 border-zinc-800/60 text-zinc-600'
                      }`}
                    >
                      <div className="text-[11px] font-bold w-16">Hào {lineIdx + 1}:</div>
                      
                      {/* Yao Line Visual */}
                      <div className="flex-1 max-w-xs mx-auto flex items-center justify-center">
                        {isFilled ? (
                          isYang ? (
                            // Dương ─── (Vạch liền)
                            <div className={`h-2.5 w-full rounded-full ${isChanging ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-amber-500'}`} />
                          ) : (
                            // Âm ─ ─ (Vạch đứt)
                            <div className="w-full flex justify-between gap-2">
                              <div className={`h-2.5 w-1/2 rounded-full ${isChanging ? 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-zinc-400'}`} />
                              <div className={`h-2.5 w-1/2 rounded-full ${isChanging ? 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-zinc-400'}`} />
                            </div>
                          )
                        ) : (
                          <div className="h-2 w-full border border-dashed border-zinc-700 rounded-full" />
                        )}
                      </div>

                      <div className="text-[10px] w-20 text-right font-medium">
                        {isFilled ? (
                          <span>
                            {val === 9 ? 'Lão Dương (9)' : val === 7 ? 'Dương (7)' : val === 6 ? 'Lão Âm (6)' : 'Âm (8)'}
                            {isChanging && ' ✨'}
                          </span>
                        ) : (
                          'Chờ gieo'
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Hexagram Revealed Card */}
          {selectedHexagram && (
            <div className="bg-zinc-950/90 border border-amber-500/40 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 font-black text-xl shadow-lg">
                    ☯️
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                      Quẻ Số {selectedHexagram.number} Trong 64 Quẻ
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                      {selectedHexagram.nameVi} ({selectedHexagram.nameHán})
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => openReader(`Quẻ Kinh Dịch: ${selectedHexagram.nameVi}`, aiIChingReading || selectedHexagram.meaning)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen size={14} /> Đọc Văn Bản
                  </button>
                  <button
                    onClick={handleShareIChing}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Share2 size={14} /> Chia Sẻ
                  </button>
                </div>
              </div>

              {/* Hexagram Thoán Từ & Tượng Truyện */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-zinc-900/80 p-3.5 rounded-2xl border border-zinc-800">
                  <span className="text-[10px] font-black uppercase text-amber-400">📜 Thoán Từ (Lời Thoán):</span>
                  <p className="text-xs text-zinc-300 italic mt-1">{selectedHexagram.thoanTu}</p>
                </div>
                <div className="bg-zinc-900/80 p-3.5 rounded-2xl border border-zinc-800">
                  <span className="text-[10px] font-black uppercase text-amber-400">🏛️ Tượng Truyện (Lời Tượng):</span>
                  <p className="text-xs text-zinc-300 italic mt-1">{selectedHexagram.tuongTu}</p>
                </div>
              </div>

              {/* Aspects Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80">
                  <div className="text-[10px] text-amber-300 font-bold">💼 Công Danh & Quan Lộc</div>
                  <div className="text-xs text-zinc-300 mt-0.5">{selectedHexagram.aspects.career}</div>
                </div>
                <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80">
                  <div className="text-[10px] text-emerald-300 font-bold">💰 Tài Lộc & Kinh Doanh</div>
                  <div className="text-xs text-zinc-300 mt-0.5">{selectedHexagram.aspects.wealth}</div>
                </div>
                <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80">
                  <div className="text-[10px] text-rose-300 font-bold">💖 Tình Duyên & Gia Đạo</div>
                  <div className="text-xs text-zinc-300 mt-0.5">{selectedHexagram.aspects.love}</div>
                </div>
              </div>

              {/* AI Reading Markdown */}
              {aiIChingReading && (
                <div className="mt-3 pt-3 border-t border-zinc-800">
                  <div className="text-xs font-black text-amber-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    Luận Giải Bậc Thầy Kinh Dịch AI:
                  </div>
                  <div className="prose prose-invert max-w-none text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/80 whitespace-pre-wrap">
                    {aiIChingReading}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. KHỔNG MINH 100 STICKS VIEW */}
      {/* ========================================================================= */}
      {divinationType === 'khongminh' && (
        <div className="space-y-6">
          <div className="bg-zinc-950/90 border border-red-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl text-center space-y-6">
            <div className="max-w-xl mx-auto space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-red-400 bg-red-950/70 px-3 py-1 rounded-full border border-red-500/40">
                100 Quẻ Xăm Thần Toán
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Ống Xăm Linh Ứng Khổng Minh Gia Cát Lượng
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400">
                Tĩnh tâm trong 3 giây, tập trung ý niệm vào việc muốn cầu rồi nhấn nút "Lắc Ống Xăm" để rút quẻ xăm linh thiêng.
              </p>
            </div>

            {/* Bamboo Tube Interactive Box */}
            <div className="relative w-36 h-48 sm:w-44 sm:h-56 mx-auto bg-gradient-to-b from-amber-900 via-amber-950 to-zinc-950 rounded-2xl border-2 border-amber-500/60 p-3 flex flex-col items-center justify-between shadow-2xl shadow-red-950/60 group">
              <div className="flex justify-center gap-1.5 overflow-hidden w-full pt-1">
                {[1, 2, 3, 4, 5, 6].map(s => (
                  <div
                    key={s}
                    className={`w-2.5 h-24 bg-gradient-to-t from-amber-700 to-amber-300 rounded-t-sm shadow-md transition-all duration-300 ${
                      isShakingTube ? 'animate-bounce' : 'group-hover:-translate-y-2'
                    }`}
                  />
                ))}
              </div>
              <div className="text-[11px] font-black uppercase text-amber-200 tracking-wider bg-red-950/80 px-2 py-0.5 rounded border border-red-500/40">
                Khổng Minh
              </div>
            </div>

            {/* Shake Button */}
            <button
              onClick={handleDrawKhongMinhStick}
              disabled={isShakingTube}
              className="px-8 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white shadow-xl shadow-red-900/40 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              {isShakingTube ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Đang Lắc Ống Xăm Linh Thiêng...</span>
                </>
              ) : (
                <>
                  <Scroll className="w-4 h-4 text-amber-300" />
                  <span>Lắc Ống Xăm & Rút Quẻ</span>
                </>
              )}
            </button>
          </div>

          {/* Stick Result Card */}
          {drawnStick && (
            <div className="bg-zinc-950/90 border border-red-500/40 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-400/50 flex items-center justify-center text-amber-300 font-black text-xl shadow-lg">
                    🎋
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-300 bg-red-950/60 px-2 py-0.5 rounded-full border border-red-500/30">
                      Cấp Bậc: {drawnStick.tier}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                      Thẻ Xăm Số {drawnStick.number}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => openReader(`Xăm Khổng Minh Số ${drawnStick.number}`, `${drawnStick.poemVi}\n\n${drawnStick.overview}`)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen size={14} /> Đọc To
                  </button>
                  <button
                    onClick={handleShareStick}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Share2 size={14} /> Chia Sẻ
                  </button>
                </div>
              </div>

              {/* Poems Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-400">📜 Chữ Hán Nôm:</span>
                  <p className="text-xs text-zinc-300 italic font-serif whitespace-pre-line leading-relaxed">
                    {drawnStick.poemHan}
                  </p>
                </div>
                <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-400">🌸 Dịch Thơ Tiếng Việt:</span>
                  <p className="text-xs text-amber-200 italic font-serif whitespace-pre-line leading-relaxed">
                    {drawnStick.poemVi}
                  </p>
                </div>
              </div>

              {/* Verdicts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80">
                  <div className="text-[10px] text-amber-300 font-bold">💰 Tài Lộc</div>
                  <div className="text-xs text-zinc-300 mt-0.5">{drawnStick.verdicts.taiLoc}</div>
                </div>
                <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80">
                  <div className="text-[10px] text-sky-300 font-bold">💼 Công Danh</div>
                  <div className="text-xs text-zinc-300 mt-0.5">{drawnStick.verdicts.congDanh}</div>
                </div>
                <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80">
                  <div className="text-[10px] text-rose-300 font-bold">💖 Hôn Nhân</div>
                  <div className="text-xs text-zinc-300 mt-0.5">{drawnStick.verdicts.honNhan}</div>
                </div>
                <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80">
                  <div className="text-[10px] text-emerald-300 font-bold">🚗 Xuất Hành</div>
                  <div className="text-xs text-zinc-300 mt-0.5">{drawnStick.verdicts.xuatHanh}</div>
                </div>
              </div>

              {/* Khuyên Học & Tích Đức */}
              <div className="bg-red-950/40 border border-red-500/30 p-3.5 rounded-2xl text-xs text-zinc-300 flex items-start gap-2">
                <span className="text-lg">🌿</span>
                <div>
                  <strong className="text-red-300">Lời Khuyên Của Khổng Minh: </strong>
                  {drawnStick.khuyenHoc}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Share Modal */}
      <SpiritualShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        attachment={shareAttachment}
        onNavigateToMode={onNavigateToMode}
      />

      {/* Text Reader Modal */}
      <SpiritualTextReaderModal
        isOpen={isReaderModalOpen}
        onClose={() => setIsReaderModalOpen(false)}
        title={readerTitle}
        contentMarkdown={readerContent}
      />
    </div>
  );
}
