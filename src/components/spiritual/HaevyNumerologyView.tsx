import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Hash, 
  Calendar, 
  User, 
  Share2, 
  BookOpen, 
  Copy, 
  Check, 
  RefreshCw, 
  Flame, 
  Compass, 
  Award, 
  Zap, 
  HelpCircle,
  TrendingUp,
  Heart,
  BrainCircuit
} from 'lucide-react';
import { SpiritualShareAttachment } from '../../types';
import { LIFE_PATH_PROFILES } from '../../data/palmistryAndDivinationData';
import { SpiritualShareModal } from './SpiritualShareModal';
import { SpiritualTextReaderModal } from './SpiritualTextReaderModal';
import { spiritualAudio } from '../../utils/spiritualAudioSynthesizer';
import { haptics } from '../../utils/haptics';

interface HaevyNumerologyViewProps {
  onEarnCoins?: (amount: number, reason: string) => void;
  onNavigateToMode?: (mode: string, subTab?: string) => void;
}

// Letter to Number Mapping (Pythagorean System)
const PYTHAGOREAN_MAP: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9
};

const VOWELS = ['A', 'E', 'I', 'O', 'U', 'Y'];

function normalizeVietnamese(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase();
}

function reduceToSingleDigitOrMaster(num: number): number {
  if (num === 11 || num === 22 || num === 33) return num;
  let sum = num;
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum
      .toString()
      .split('')
      .reduce((a, b) => a + parseInt(b, 10), 0);
  }
  return sum;
}

export function HaevyNumerologyView({ onEarnCoins, onNavigateToMode }: HaevyNumerologyViewProps) {
  const [fullName, setFullName] = useState('Nguyễn Văn An');
  const [birthDay, setBirthDay] = useState<number>(15);
  const [birthMonth, setBirthMonth] = useState<number>(8);
  const [birthYear, setBirthYear] = useState<number>(1998);

  const [selectedNumberTab, setSelectedNumberTab] = useState<number | null>(null);
  const [isAiCalculating, setIsAiCalculating] = useState(false);
  const [aiReportMarkdown, setAiReportMarkdown] = useState<string | null>(null);

  // Modals & UI states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareAttachment, setShareAttachment] = useState<SpiritualShareAttachment | null>(null);
  const [isReaderModalOpen, setIsReaderModalOpen] = useState(false);

  // Calculations
  const calculations = useMemo(() => {
    // 1. Life Path (Số Chủ Đạo)
    const dSum = birthDay.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
    const mSum = birthMonth.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
    const ySum = birthYear.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
    const lifePath = reduceToSingleDigitOrMaster(dSum + mSum + ySum);

    // 2. Destiny Number (All letters in name)
    const cleanName = normalizeVietnamese(fullName).replace(/[^A-Z]/g, '');
    let nameTotal = 0;
    let vowelTotal = 0;
    let consonantTotal = 0;

    for (const char of cleanName) {
      const val = PYTHAGOREAN_MAP[char] || 0;
      nameTotal += val;
      if (VOWELS.includes(char)) {
        vowelTotal += val;
      } else {
        consonantTotal += val;
      }
    }

    const destinyNumber = reduceToSingleDigitOrMaster(nameTotal) || 8;
    const soulUrgeNumber = reduceToSingleDigitOrMaster(vowelTotal) || 6;
    const personalityNumber = reduceToSingleDigitOrMaster(consonantTotal) || 2;

    // 3. Personal Year 2026
    const currentYear = 2026;
    const personalYearRaw = dSum + mSum + currentYear.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
    let personalYear = personalYearRaw;
    while (personalYear > 9) {
      personalYear = personalYear.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
    }

    // 4. Birth Chart Grid (1-9 count)
    const allBirthDigits = `${birthDay}${birthMonth}${birthYear}`.split('');
    const gridCount: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    allBirthDigits.forEach(d => {
      const n = parseInt(d, 10);
      if (n >= 1 && n <= 9) gridCount[n] = (gridCount[n] || 0) + 1;
    });

    // 5. 4 Pinnacles
    const p1Age = 36 - (lifePath > 9 ? (lifePath === 11 ? 2 : 4) : lifePath);
    const p2Age = p1Age + 9;
    const p3Age = p2Age + 9;
    const p4Age = p3Age + 9;

    const p1Num = reduceToSingleDigitOrMaster(dSum + mSum);
    const p2Num = reduceToSingleDigitOrMaster(dSum + ySum);
    const p3Num = reduceToSingleDigitOrMaster(p1Num + p2Num);
    const p4Num = reduceToSingleDigitOrMaster(mSum + ySum);

    return {
      lifePath,
      destinyNumber,
      soulUrgeNumber,
      personalityNumber,
      personalYear,
      gridCount,
      pinnacles: [
        { level: 1, age: p1Age, number: p1Num },
        { level: 2, age: p2Age, number: p2Num },
        { level: 3, age: p3Age, number: p3Num },
        { level: 4, age: p4Age, number: p4Num }
      ]
    };
  }, [fullName, birthDay, birthMonth, birthYear]);

  const activeProfile = useMemo(() => {
    const target = selectedNumberTab || calculations.lifePath;
    return LIFE_PATH_PROFILES[target] || LIFE_PATH_PROFILES[1];
  }, [selectedNumberTab, calculations.lifePath]);

  const handleGenerateAiReport = async () => {
    haptics.heavy();
    setIsAiCalculating(true);
    spiritualAudio.playCrystalResonance();

    try {
      const res = await fetch('/api/spiritual/numerology-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          birthDay,
          birthMonth,
          birthYear,
          lifePathNumber: calculations.lifePath,
          destinyNumber: calculations.destinyNumber,
          soulUrgeNumber: calculations.soulUrgeNumber,
          personalYear: calculations.personalYear
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.report) {
          setAiReportMarkdown(data.report);
          setIsAiCalculating(false);
          spiritualAudio.playTempleBell();
          if (onEarnCoins) {
            onEarnCoins(50, 'Khám phá bản đồ Thần Số Học Pythagoras (+50 Xu)');
          }
          return;
        }
      }
    } catch {
      // Fallback
    }

    const fallback = `### 🔢 Bản Đồ Thần Số Học Pythagoras: ${fullName}
*Ngày sinh: ${birthDay}/${birthMonth}/${birthYear} • Ngũ Hành: ${activeProfile.element}*

#### 🌟 1. Số Chủ Đạo: Số ${calculations.lifePath} - ${activeProfile.title}
${activeProfile.summary}

- **Thế mạnh vượt trội**: ${activeProfile.strengths.join(', ')}
- **Bài học trưởng thành**: ${activeProfile.challenges.join(', ')}
- **Nghề nghiệp lý tưởng**: ${activeProfile.careerSuggestions.join(', ')}
- **Tình duyên**: ${activeProfile.loveAdvice}

#### 💖 2. Số Sứ Mệnh & Tiếng Nói Linh Hồn:
- **Số Sứ Mệnh (${calculations.destinyNumber})**: Năng lượng dẫn dắt bạn đạt đến thành tựu trọn vẹn trong sự nghiệp và đời sống.
- **Số Linh Hồn (${calculations.soulUrgeNumber})**: Khao khát sâu kín nhất của bạn là sự tự do, sáng tạo và trao đi những giá trị nhân văn.

#### 📅 3. Dự Báo Năm Cá Nhân 2026 (Năm Số ${calculations.personalYear}):
${activeProfile.year2026Forecast}`;

    setAiReportMarkdown(fallback);
    setIsAiCalculating(false);
    spiritualAudio.playTempleBell();
    if (onEarnCoins) {
      onEarnCoins(50, 'Khám phá bản đồ Thần Số Học Pythagoras (+50 Xu)');
    }
  };

  const handleShareResult = () => {
    haptics.light();
    setShareAttachment({
      type: 'numerology',
      title: `🔢 Thần Số Học: Số Chủ Đạo ${calculations.lifePath}`,
      subtitle: `${fullName} • Năm Cá Nhân 2026: Số ${calculations.personalYear}`,
      questionOrTheme: `Bản thiết kế linh hồn & sứ mệnh cuộc đời cho ${fullName}`,
      aiVerdictExcerpt: activeProfile.title + ' - ' + activeProfile.summary,
      createdAt: new Date().toISOString()
    });
    setIsShareModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/50 to-zinc-950/90 border border-purple-500/30 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300 shadow-lg shadow-purple-950/50 shrink-0">
              <span className="text-2xl sm:text-3xl">🔢</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-900/80 text-purple-200 border border-purple-400/40">
                  Hệ Thống Pythagoras & Khoa Học Số
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">Bản Đồ Năng Lượng Linh Hồn</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white mt-1">
                Thần Số Học & Giải Mã 4 Đỉnh Cao Cuộc Đời
              </h2>
              <p className="text-xs sm:text-sm text-purple-200/90 mt-0.5 max-w-2xl">
                Tính toán Số Chủ Đạo, Số Sứ Mệnh, Biểu đồ ngày sinh 3x3 và 4 Kim Tự Tháp Đỉnh Cao để định hướng sự nghiệp, tình cảm và tài lộc.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Controls */}
      <div className="bg-zinc-950/90 border border-purple-500/20 rounded-2xl sm:rounded-3xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4" />
          Nhập Thông Tin Đương Số
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Full Name */}
          <div className="sm:col-span-6 space-y-1">
            <label className="text-xs font-bold text-zinc-400">Họ và Tên Đầy Đủ:</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Day */}
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-bold text-zinc-400">Ngày sinh:</label>
            <input
              type="number"
              min={1}
              max={31}
              value={birthDay}
              onChange={e => setBirthDay(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white text-center focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Month */}
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-bold text-zinc-400">Tháng sinh:</label>
            <input
              type="number"
              min={1}
              max={12}
              value={birthMonth}
              onChange={e => setBirthMonth(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white text-center focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Year */}
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-bold text-zinc-400">Năm sinh:</label>
            <input
              type="number"
              min={1920}
              max={2030}
              value={birthYear}
              onChange={e => setBirthYear(parseInt(e.target.value, 10) || 1998)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white text-center focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleGenerateAiReport}
          disabled={isAiCalculating}
          className="w-full py-3 sm:py-3.5 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-xl shadow-purple-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isAiCalculating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Chuyên Gia AI Đang Lập Bản Đồ Thần Số Học...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Phân Tích & Luận Giải Thần Số Học Pythagoras AI</span>
            </>
          )}
        </button>
      </div>

      {/* Core Numbers Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-950/90 border border-purple-500/30 p-4 rounded-2xl shadow-xl text-center space-y-1">
          <span className="text-[10px] font-bold text-purple-400 uppercase">🌟 Số Chủ Đạo</span>
          <div className="text-2xl sm:text-3xl font-black text-white">{calculations.lifePath}</div>
          <p className="text-[10px] text-zinc-400 truncate">{activeProfile.title}</p>
        </div>

        <div className="bg-zinc-950/90 border border-purple-500/30 p-4 rounded-2xl shadow-xl text-center space-y-1">
          <span className="text-[10px] font-bold text-pink-400 uppercase">🎯 Số Sứ Mệnh</span>
          <div className="text-2xl sm:text-3xl font-black text-white">{calculations.destinyNumber}</div>
          <p className="text-[10px] text-zinc-400 truncate">Từ Họ & Tên</p>
        </div>

        <div className="bg-zinc-950/90 border border-purple-500/30 p-4 rounded-2xl shadow-xl text-center space-y-1">
          <span className="text-[10px] font-bold text-rose-400 uppercase">💖 Số Linh Hồn</span>
          <div className="text-2xl sm:text-3xl font-black text-white">{calculations.soulUrgeNumber}</div>
          <p className="text-[10px] text-zinc-400 truncate">Khao khát nội tâm</p>
        </div>

        <div className="bg-zinc-950/90 border border-purple-500/30 p-4 rounded-2xl shadow-xl text-center space-y-1">
          <span className="text-[10px] font-bold text-amber-400 uppercase">📅 Năm Cá Nhân 2026</span>
          <div className="text-2xl sm:text-3xl font-black text-white">{calculations.personalYear}</div>
          <p className="text-[10px] text-zinc-400 truncate">Vận trình chu kỳ 9 năm</p>
        </div>
      </div>

      {/* Birth Chart 3x3 & 4 Pinnacles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Birth Chart Grid (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-950/90 border border-purple-500/20 rounded-2xl sm:rounded-3xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
            <BrainCircuit className="w-4 h-4" />
            Biểu Đồ Ngày Sinh (3x3 Grid)
          </h3>
          <p className="text-[11px] text-zinc-400">
            Trục 3-6-9 (Trí tuệ), Trục 2-5-8 (Cảm xúc tâm linh), Trục 1-4-7 (Thể chất hành động).
          </p>

          <div className="grid grid-cols-3 gap-2 py-2">
            {[3, 6, 9, 2, 5, 8, 1, 4, 7].map(num => {
              const count = calculations.gridCount[num] || 0;
              return (
                <div
                  key={num}
                  className={`aspect-square rounded-2xl border flex flex-col items-center justify-center p-2 transition-all ${
                    count > 0
                      ? 'bg-purple-950/40 border-purple-400/60 text-purple-200 shadow-md'
                      : 'bg-zinc-900/40 border-zinc-800 text-zinc-600'
                  }`}
                >
                  <span className="text-base sm:text-lg font-black">{num}</span>
                  <span className="text-[10px] mt-0.5">
                    {count > 0 ? `${count} lần (${num.toString().repeat(count)})` : 'Trống'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: 4 Pinnacles Pyramid (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-950/90 border border-purple-500/20 rounded-2xl sm:rounded-3xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            4 Kim Tự Tháp Đỉnh Cao Cuộc Đời
          </h3>
          <p className="text-[11px] text-zinc-400">
            Các mốc tuổi chuyển mình và đại vận thành công rực rỡ nhất trong cuộc đời bạn.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            {calculations.pinnacles.map(p => (
              <div
                key={p.level}
                className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center space-y-1.5"
              >
                <div className="text-[10px] font-black uppercase text-purple-400">
                  Đỉnh {p.level} ({p.age} tuổi)
                </div>
                <div className="text-2xl font-black text-amber-300">Số {p.number}</div>
                <div className="text-[10px] text-zinc-400">
                  {p.level === 1 ? 'Khởi nghiệp' : p.level === 2 ? 'Tích lũy' : p.level === 3 ? 'Trưởng thành' : 'Hậu vận'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Report Section */}
      {aiReportMarkdown && (
        <div className="bg-zinc-950/90 border border-purple-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/40 flex items-center justify-center font-black">
                ✨
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Bản Đồ Thần Số Học Toàn Diện
                </h3>
                <span className="text-[10px] text-purple-400 font-semibold">
                  Giải mã chi tiết bởi Chuyên Gia Pythagoras AI
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setIsReaderModalOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <BookOpen size={14} />
                <span>Đọc Văn Bản</span>
              </button>
              <button
                onClick={handleShareResult}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Share2 size={14} />
                <span>Chia Sẻ</span>
              </button>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/80 whitespace-pre-wrap">
            {aiReportMarkdown}
          </div>
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
        title={`Bản Đồ Thần Số Học Cho ${fullName}`}
        contentMarkdown={aiReportMarkdown || ''}
      />
    </div>
  );
}
