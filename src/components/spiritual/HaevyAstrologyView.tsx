import React, { useState } from 'react';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  Compass, 
  Heart, 
  BrainCircuit, 
  Flame, 
  Droplets, 
  Wind, 
  Mountain, 
  Share2, 
  RefreshCw,
  Award,
  ChevronRight,
  Zap,
  Users,
  BookOpen,
  Copy,
  Check
} from 'lucide-react';
import { ZodiacSignData, NatalChartResult, ZodiacCompatibilityResult, SpiritualShareAttachment } from '../../types';
import { ZODIAC_SIGNS } from '../../data/spiritualData';
import { calculateNatalChart, calculateZodiacCompatibility } from '../../utils/astrologyCalculator';
import { SpiritualShareModal } from './SpiritualShareModal';
import { SpiritualTextReaderModal } from './SpiritualTextReaderModal';
import { spiritualAudio } from '../../utils/spiritualAudioSynthesizer';
import { haptics } from '../../utils/haptics';

interface HaevyAstrologyViewProps {
  onEarnCoins?: (amount: number, reason: string) => void;
  onNavigateToMode?: (mode: string, subTab?: string) => void;
}

export function HaevyAstrologyView({ onEarnCoins, onNavigateToMode }: HaevyAstrologyViewProps) {
  const [activeTab, setActiveTab] = useState<'wheel' | 'natal' | 'compatibility'>('wheel');
  const [selectedSign, setSelectedSign] = useState<ZodiacSignData>(ZODIAC_SIGNS[0]);

  // Natal Chart inputs
  const [birthDate, setBirthDate] = useState('1998-08-15');
  const [birthTime, setBirthTime] = useState('10:30');
  const [birthPlace, setBirthPlace] = useState('Hà Nội, Việt Nam');
  const [natalResult, setNatalResult] = useState<NatalChartResult | null>(() => {
    return calculateNatalChart('1998-08-15', '10:30', 'Hà Nội, Việt Nam');
  });

  // Compatibility inputs
  const [compSign1, setCompSign1] = useState('leo');
  const [compSign2, setCompSign2] = useState('sagittarius');
  const [compResult, setCompResult] = useState<ZodiacCompatibilityResult>(() => {
    return calculateZodiacCompatibility('leo', 'sagittarius');
  });

  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiHoroscope, setAiHoroscope] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [shareAttachment, setShareAttachment] = useState<SpiritualShareAttachment | null>(null);
  const [isReaderModalOpen, setIsReaderModalOpen] = useState(false);
  const [readerContent, setReaderContent] = useState<{ title: string; subtitle: string; content: string }>({
    title: '',
    subtitle: '',
    content: ''
  });

  const handleOpenShareAstrology = (type: 'sign' | 'natal' | 'compatibility') => {
    haptics.impact('medium');
    let attachment: SpiritualShareAttachment;

    if (type === 'compatibility' && compResult) {
      attachment = {
        type: 'astrology_compatibility',
        title: `💞 Hòa Hợp Chiêm Tinh: ${compResult.sign1} & ${compResult.sign2}`,
        subtitle: `Độ hòa hợp: ${compResult.overallScore}% • Lãng mạn: ${compResult.romanceScore}%`,
        compatibilityScore: compResult.overallScore,
        astrologySummary: {
          sign1: compResult.sign1,
          sign2: compResult.sign2,
          score: compResult.overallScore,
          compatibilityVerdict: compResult.cosmicVerdict
        },
        aiVerdictExcerpt: compResult.cosmicVerdict + (compResult.advice ? `\nLời khuyên: ${compResult.advice}` : ''),
        createdAt: new Date().toISOString()
      };
    } else if (type === 'natal' && natalResult) {
      attachment = {
        type: 'astrology_natal',
        title: `🌌 Bản Đồ Sao Cá Nhân: Sun ${natalResult.sunSign}`,
        subtitle: `Moon: ${natalResult.moonSign} • Rising: ${natalResult.risingSign}`,
        astrologySummary: {
          sign1: natalResult.sunSign,
          sunSign: natalResult.sunSign,
          risingSign: natalResult.risingSign
        },
        astrologyData: {
          sunSign: natalResult.sunSign,
          moonSign: natalResult.moonSign,
          risingSign: natalResult.risingSign,
          elementDistribution: natalResult.elementDistribution
        },
        aiVerdictExcerpt: natalResult.aiAstrologyReading || `Mặt trời ${natalResult.sunSign}, Mặt trăng ${natalResult.moonSign}, Điểm mọc ${natalResult.risingSign}`,
        createdAt: new Date().toISOString()
      };
    } else {
      attachment = {
        type: 'astrology',
        title: `⭐ Cung Hoàng Đạo: ${selectedSign.nameVi} (${selectedSign.nameEn})`,
        subtitle: `${selectedSign.dateRange} • Nguyên tố: ${selectedSign.element}`,
        astrologySummary: {
          sign1: selectedSign.nameVi,
          sunSign: selectedSign.nameVi
        },
        astrologyData: {
          sunSign: selectedSign.nameVi,
          element: selectedSign.element,
          rulingPlanet: selectedSign.rulingPlanet
        },
        aiVerdictExcerpt: `Tổng quan: ${selectedSign.dailyHoroscope?.overview || selectedSign.nameVi}\nLời khuyên vũ trụ: ${selectedSign.dailyHoroscope?.cosmicAdvice || 'Hãy lắng nghe trực giác'}`,
        createdAt: new Date().toISOString()
      };
    }

    setShareAttachment(attachment);
    setIsShareModalOpen(true);
  };

  const handleCalculateNatal = (e: React.FormEvent) => {
    e.preventDefault();
    haptics.impact('medium');
    spiritualAudio.playSingingBowl(432);

    const res = calculateNatalChart(birthDate, birthTime, birthPlace);
    setNatalResult(res);
    setAiHoroscope(null);

    if (onEarnCoins) {
      onEarnCoins(50, 'Lập bản đồ sao chiêm tinh cá nhân (+50 Xu)');
    }
  };

  const handleCalculateComp = () => {
    haptics.impact('light');
    spiritualAudio.playCardFlipChime();
    const res = calculateZodiacCompatibility(compSign1, compSign2);
    setCompResult(res);
  };

  const handleGetAiHoroscope = async () => {
    if (!selectedSign) return;
    setIsAiAnalyzing(true);
    setAiHoroscope(null);

    try {
      const res = await fetch('/api/spiritual/astrology-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signName: selectedSign.nameVi,
          element: selectedSign.element,
          rulingPlanet: selectedSign.rulingPlanet
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reading) {
          setAiHoroscope(data.reading);
          setIsAiAnalyzing(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    setTimeout(() => {
      const fallback = `### 🌌 Thông Điệp Chiêm Tinh Cho ${selectedSign.nameVi} (${selectedSign.dateRangeVi || selectedSign.dateRange})

#### ✨ Năng Lượng Vũ Trụ Hiện Tại:
Chòm sao **${selectedSign.nameVi}** (${selectedSign.element}) đang đón nhận nguồn năng lượng hài hòa từ hành tinh bảo hộ **${selectedSign.rulingPlanet}**. Đây là thời điểm lý tưởng để bạn bứt phá khỏi những giới hạn cũ, tin tưởng vào trực giác và khẳng định bản sắc độc bản.

#### 💖 Tình Cảm & Kết Nối:
Sức hút tự nhiên của bạn đang ở mức đỉnh cao. Những cuộc gặp gỡ tình cờ đều mang theo hạt mầm của sự gắn kết lâu dài. Hãy cởi mở chia sẻ những ước mơ thầm kín với người bạn tin tưởng.

#### 🚀 Sự Nghiệp & Tài Chính:
Sự sáng tạo và kiên định sẽ mang lại những thành quả vượt mong đợi. Các cơ hội hợp tác mới đang dần xuất hiện, hãy chuẩn bị kế hoạch rõ ràng để nắm bắt.

#### 💎 Lời Khuyên Vũ Trụ:
*"Mỗi bước chân đi cùng lòng tin và tình yêu thương đều sẽ được vũ trụ nâng đỡ."*`;
      setAiHoroscope(fallback);
      setIsAiAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="w-full flex flex-col items-center space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="w-full bg-gradient-to-r from-sky-950/70 via-indigo-950/70 to-zinc-950 rounded-3xl p-6 sm:p-8 border border-sky-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-sky-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-semibold mb-3">
              <Sun className="w-3.5 h-3.5 text-amber-300" />
              12 Cung Hoàng Đạo & Bản Đồ Sao Phương Tây
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              🌌 Chiêm Tinh & Bản Đồ Sao Vũ Trụ
            </h2>
            <p className="text-sm text-zinc-300 mt-1.5 max-w-2xl leading-relaxed">
              Giải mã hành trình tâm thức qua Bản đồ sao Natal Chart (Sun, Moon, Rising), phân tích độ hòa hợp 12 chòm sao và đón nhận thông điệp vũ trụ mỗi ngày.
            </p>
          </div>

          <button
            onClick={handleGetAiHoroscope}
            disabled={isAiAnalyzing}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 hover:from-sky-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-sky-600/30 active:scale-95 disabled:opacity-50"
          >
            <BrainCircuit className="w-4 h-4" />
            {isAiAnalyzing ? 'Đang Luận Chiêm Tinh...' : `Thông Điệp ${selectedSign.nameVi}`}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 w-full pb-3">
        <button
          onClick={() => setActiveTab('wheel')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'wheel'
              ? 'bg-sky-600/30 border border-sky-400/50 text-sky-200'
              : 'text-zinc-400 hover:text-white bg-zinc-900/50'
          }`}
        >
          <Sun className="w-4 h-4" />
          12 Cung Hoàng Đạo
        </button>
        <button
          onClick={() => setActiveTab('natal')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'natal'
              ? 'bg-sky-600/30 border border-sky-400/50 text-sky-200'
              : 'text-zinc-400 hover:text-white bg-zinc-900/50'
          }`}
        >
          <Compass className="w-4 h-4" />
          Bản Đồ Sao Natal Chart
        </button>
        <button
          onClick={() => setActiveTab('compatibility')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'compatibility'
              ? 'bg-sky-600/30 border border-sky-400/50 text-sky-200'
              : 'text-zinc-400 hover:text-white bg-zinc-900/50'
          }`}
        >
          <Heart className="w-4 h-4" />
          Bói Độ Hòa Hợp (Synastry)
        </button>
      </div>

      {/* TAB 1: 12 Zodiac Signs Gallery & Deep Dive */}
      {activeTab === 'wheel' && (
        <div className="w-full space-y-6 animate-fadeIn">
          {/* 12 Signs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {ZODIAC_SIGNS.map(sign => {
              const isSelected = selectedSign.id === sign.id;
              return (
                <button
                  key={sign.id}
                  onClick={() => {
                    haptics.impact('light');
                    spiritualAudio.playCardFlipChime();
                    setSelectedSign(sign);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all text-center flex flex-col items-center justify-between space-y-2 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-sky-950/90 to-zinc-950 border-sky-400 ring-2 ring-sky-500/30 shadow-xl'
                      : 'bg-zinc-950/80 border-zinc-800 hover:border-sky-500/40 hover:bg-zinc-900/60'
                  }`}
                >
                  <span className="text-3xl">{sign.symbol}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{sign.nameVi}</h4>
                    <span className="text-[10px] text-zinc-400">{sign.dateRangeVi || sign.dateRange}</span>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                    sign.element === 'Lửa' ? 'bg-rose-500/20 text-rose-300' :
                    sign.element === 'Nước' ? 'bg-sky-500/20 text-sky-300' :
                    sign.element === 'Khí' ? 'bg-indigo-500/20 text-indigo-300' :
                    'bg-amber-500/20 text-amber-300'
                  }`}>
                    {sign.element} • {sign.modality}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Sign Detailed Profile */}
          {selectedSign && (
            <div className="w-full bg-zinc-950/90 border border-sky-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-sky-950/80 border border-sky-500/40 flex items-center justify-center text-4xl shadow-lg">
                    {selectedSign.symbol}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-black text-white">{selectedSign.nameVi} ({selectedSign.nameEn})</h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                        {selectedSign.dateRangeVi || selectedSign.dateRange}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      Hành tinh cai quản: <strong className="text-sky-300">{selectedSign.rulingPlanet}</strong> | Nhà hoàng đạo: <strong className="text-purple-300">{selectedSign.rulingHouse || `Nhà số ${selectedSign.houseNumber || 1}`}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(selectedSign.personalityTraits || selectedSign.traits).map((t, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-700/80 text-xs text-zinc-200">
                      ✦ {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trait breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Thế Mạnh Vượt Trội
                  </span>
                  <ul className="text-xs text-zinc-300 space-y-1">
                    {selectedSign.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" />
                    Tình Cảm & Năng Lượng Yêu
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">{selectedSign.loveStyle || selectedSign.dailyHoroscope.loveInsight}</p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    Sự Nghiệp & Tài Lộc
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">{selectedSign.careerStyle || selectedSign.dailyHoroscope.careerInsight}</p>
                </div>
              </div>

              {/* Compatibility & Lucky facts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/20 text-center">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold">Cung Hợp Cạ Nhất</span>
                  <p className="text-xs font-bold text-sky-200 mt-1">{selectedSign.compatibleSigns.join(', ')}</p>
                </div>
                <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/20 text-center">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold">Màu Sắc & Số May Mắn</span>
                  <p className="text-xs font-bold text-amber-200 mt-1">{selectedSign.luckyColors.join(', ')} • {selectedSign.luckyNumbers.join(', ')}</p>
                </div>
                <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/20 text-center">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold">Đá Phong Thủy</span>
                  <p className="text-xs font-bold text-pink-200 mt-1">{(selectedSign.luckyGems || selectedSign.luckyColors).join(', ')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Natal Chart Calculation */}
      {activeTab === 'natal' && (
        <div className="w-full space-y-6 animate-fadeIn">
          {/* Form */}
          <form onSubmit={handleCalculateNatal} className="w-full bg-zinc-950/90 border border-sky-500/30 rounded-3xl p-5 sm:p-6 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-sky-300">Ngày Sinh</label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-sky-300">Giờ Sinh</label>
              <input
                type="time"
                required
                value={birthTime}
                onChange={e => setBirthTime(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-sky-300">Nơi Sinh</label>
              <input
                type="text"
                value={birthPlace}
                onChange={e => setBirthPlace(e.target.value)}
                placeholder="Hà Nội, TP.HCM, ..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-sky-600/30 active:scale-95 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Lập Bản Đồ Sao
              </button>
            </div>
          </form>

          {/* Natal Big 3 Banner */}
          {natalResult && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/60 to-zinc-950 border border-amber-500/30 text-center space-y-1">
                  <span className="text-xs text-amber-300 font-bold uppercase">☉ Sun Sign (Mặt Trời)</span>
                  <p className="text-2xl font-black text-white">{natalResult.sunSign}</p>
                  <p className="text-[11px] text-zinc-400">Bản ngã, ý chí & năng lượng sống cốt lõi</p>
                </div>

                <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/60 to-zinc-950 border border-indigo-500/30 text-center space-y-1">
                  <span className="text-xs text-indigo-300 font-bold uppercase">☽ Moon Sign (Mặt Trăng)</span>
                  <p className="text-2xl font-black text-white">{natalResult.moonSign}</p>
                  <p className="text-[11px] text-zinc-400">Thế giới cảm xúc, trực giác & nội tâm</p>
                </div>

                <div className="p-5 rounded-3xl bg-gradient-to-br from-sky-950/60 to-zinc-950 border border-sky-500/30 text-center space-y-1">
                  <span className="text-xs text-sky-300 font-bold uppercase">Asc Rising Sign (Điểm Mọc)</span>
                  <p className="text-2xl font-black text-white">{natalResult.risingSign}</p>
                  <p className="text-[11px] text-zinc-400">Diện mạo, phong thái & ấn tượng đầu tiên</p>
                </div>
              </div>

              {/* Elements Balance Meter */}
              <div className="p-5 rounded-3xl bg-zinc-950/90 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Phân Bổ 4 Nguyên Tố Trong Bản Đồ Sao:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-rose-500/20 text-center">
                    <span className="text-xs text-rose-300 font-semibold flex items-center justify-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> Lửa (Fire)
                    </span>
                    <p className="text-lg font-bold text-white mt-0.5">{natalResult.elementDistribution.fire}%</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-amber-500/20 text-center">
                    <span className="text-xs text-amber-300 font-semibold flex items-center justify-center gap-1">
                      <Mountain className="w-3.5 h-3.5" /> Đất (Earth)
                    </span>
                    <p className="text-lg font-bold text-white mt-0.5">{natalResult.elementDistribution.earth}%</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-indigo-500/20 text-center">
                    <span className="text-xs text-indigo-300 font-semibold flex items-center justify-center gap-1">
                      <Wind className="w-3.5 h-3.5" /> Khí (Air)
                    </span>
                    <p className="text-lg font-bold text-white mt-0.5">{natalResult.elementDistribution.air}%</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-sky-500/20 text-center">
                    <span className="text-xs text-sky-300 font-semibold flex items-center justify-center gap-1">
                      <Droplets className="w-3.5 h-3.5" /> Nước (Water)
                    </span>
                    <p className="text-lg font-bold text-white mt-0.5">{natalResult.elementDistribution.water}%</p>
                  </div>
                </div>
              </div>

              {/* Planetary Placements Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {natalResult.planets.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1.5 hover:border-sky-500/30 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                        <span className="text-base font-mono">{p.symbol}</span>
                        {p.planetVi}
                      </span>
                      <span className="text-xs font-bold text-white px-2 py-0.5 rounded-lg bg-sky-950 border border-sky-500/30">
                        {p.zodiacSign} {p.degree}°
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{p.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Synastry / Zodiac Compatibility Matrix */}
      {activeTab === 'compatibility' && (
        <div className="w-full space-y-6 animate-fadeIn">
          {/* Pickers */}
          <div className="p-6 rounded-3xl bg-zinc-950/90 border border-sky-500/30 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white text-center">Chọn 2 Cung Hoàng Đạo Để Bói Độ Hòa Hợp</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-sky-300">Cung Của Bạn</label>
                <select
                  value={compSign1}
                  onChange={e => setCompSign1(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white"
                >
                  {ZODIAC_SIGNS.map(s => (
                    <option key={s.id} value={s.id}>{s.symbol} {s.nameVi} ({s.dateRangeVi || s.dateRange})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-pink-300">Cung Của Đối Phương</label>
                <select
                  value={compSign2}
                  onChange={e => setCompSign2(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white"
                >
                  {ZODIAC_SIGNS.map(s => (
                    <option key={s.id} value={s.id}>{s.symbol} {s.nameVi} ({s.dateRangeVi || s.dateRange})</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleCalculateComp}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-pink-600/30 active:scale-98 transition-all"
            >
              <Heart className="w-4 h-4 text-pink-200 fill-pink-200" />
              Soi Độ Hòa Hợp & Thần Giao Cách Cảm
            </button>
          </div>

          {/* Compatibility Breakdown Card */}
          {compResult && (
            <div className="w-full bg-zinc-950/90 border border-pink-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-4 border-b border-zinc-800">
                <div>
                  <span className="text-xs font-bold text-pink-300 uppercase">Cặp Đôi Vũ Trụ</span>
                  <h3 className="text-2xl font-black text-white mt-0.5">
                    {compResult.sign1} ❤️ {compResult.sign2}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenShareAstrology('compatibility')}
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                    title="Chia sẻ kết quả hòa hợp cặp đôi qua Haevy Message / I Love Haevy"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Chia Sẻ Cặp Đôi</span>
                  </button>
                  <div className="text-center p-3 rounded-2xl bg-pink-950/60 border border-pink-500/40 min-w-[120px]">
                    <span className="text-3xl font-black text-pink-300">{compResult.overallScore}%</span>
                    <span className="block text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Tổng Hòa Hợp</span>
                  </div>
                </div>
              </div>

              {/* 4 Score Meters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">Cảm Xúc</span>
                  <p className="text-lg font-bold text-pink-400">{compResult.emotionalScore}%</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">Giao Tiếp</span>
                  <p className="text-lg font-bold text-sky-400">{compResult.communicationScore}%</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">Lãng Mạn</span>
                  <p className="text-lg font-bold text-rose-400">{compResult.romanceScore}%</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">Gắn Kết Dài Lâu</span>
                  <p className="text-lg font-bold text-emerald-400">{compResult.longTermScore}%</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-pink-950/30 border border-pink-500/20 text-xs text-zinc-200 leading-relaxed">
                {compResult.cosmicVerdict}
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 leading-relaxed space-y-1">
                <span className="font-bold text-amber-300 block">💡 Lời Khuyên Gìn Giữ Tình Yêu:</span>
                <p>{compResult.advice}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Horoscope Master Box */}
      {aiHoroscope && (
        <div className="w-full bg-gradient-to-r from-sky-950/80 via-indigo-950/80 to-zinc-950 border border-sky-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-sky-500/30">
            <div className="flex items-center gap-2.5">
              <BrainCircuit className="w-6 h-6 text-sky-400 animate-pulse" />
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                🌌 Luận Giải Chiêm Tinh Từ Haevy AI
              </h3>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                id="btn_open_astrology_reader"
                onClick={() => {
                  haptics.impact('medium');
                  setReaderContent({
                    title: `Chiêm Tinh: ${selectedSign.nameVi} (${selectedSign.nameEn})`,
                    subtitle: `${selectedSign.dateRangeVi || selectedSign.dateRange} • Nguyên tố: ${selectedSign.element}`,
                    content: aiHoroscope
                  });
                  setIsReaderModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-sky-500/20 cursor-pointer active:scale-95"
                title="Mở giao diện đọc sách toàn màn hình & nghe giọng đọc AI"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>🎙️ Nghe Đọc / Đọc Sách</span>
              </button>

              <button
                onClick={() => handleOpenShareAstrology('sign')}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
                title="Chia sẻ kết quả qua Haevy Message / I Love Haevy"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Chia Sẻ</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`🌌 CHIÊM TINH VŨ TRỤ HAEVY SPIRITUAL\n⭐ Cung hoàng đạo: ${selectedSign.nameVi}\n\n${aiHoroscope}`);
                  haptics.impact('light');
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Sao chép bài luận giải"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Đã Chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-sky-300" />
                    <span>Sao Chép</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans space-y-3">
            {aiHoroscope}
          </div>
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
        title={readerContent.title || `Chiêm Tinh: ${selectedSign.nameVi}`}
        subtitle={readerContent.subtitle || `${selectedSign.element} • ${selectedSign.rulingPlanet}`}
        category="astrology"
        contentMarkdown={readerContent.content || aiHoroscope || ''}
        onShare={() => handleOpenShareAstrology('sign')}
      />
    </div>
  );
}
