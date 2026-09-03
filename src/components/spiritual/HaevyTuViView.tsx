import React, { useState } from 'react';
import { 
  Compass, 
  Calendar, 
  User, 
  Sparkles, 
  ShieldCheck, 
  Coins, 
  Flame, 
  Heart, 
  Briefcase, 
  Activity, 
  BrainCircuit, 
  RefreshCw, 
  Award,
  ChevronRight,
  Sun,
  Moon,
  Info,
  Volume2,
  Share2,
  BookOpen,
  Copy
} from 'lucide-react';
import { TuViProfileInput, TuViFullChart, TuViPalace, SpiritualShareAttachment } from '../../types';
import { calculateTuViChart } from '../../utils/tuviCalculator';
import { SpiritualShareModal } from './SpiritualShareModal';
import { SpiritualTextReaderModal } from './SpiritualTextReaderModal';
import { spiritualAudio } from '../../utils/spiritualAudioSynthesizer';
import { haptics } from '../../utils/haptics';

interface HaevyTuViViewProps {
  onEarnCoins?: (amount: number, reason: string) => void;
  onNavigateToMode?: (mode: string, subTab?: string) => void;
}

export function HaevyTuViView({ onEarnCoins, onNavigateToMode }: HaevyTuViViewProps) {
  const [profileInput, setProfileInput] = useState<TuViProfileInput>({
    fullName: 'Nguyễn Văn An',
    gender: 'male',
    solarDay: 15,
    solarMonth: 8,
    solarYear: 1998,
    solarHour: 10,
    solarMinute: 30,
    isLunar: false
  });

  const [chart, setChart] = useState<TuViFullChart | null>(() => {
    return calculateTuViChart({
      fullName: 'Nguyễn Văn An',
      gender: 'male',
      solarDay: 15,
      solarMonth: 8,
      solarYear: 1998,
      solarHour: 10,
      solarMinute: 30,
      isLunar: false
    });
  });

  const [selectedPalace, setSelectedPalace] = useState<TuViPalace | null>(null);
  const [activeTab, setActiveTab] = useState<'laso' | 'vanhan2026' | 'phongthuy'>('laso');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenShareTuVi = () => {
    if (!chart) return;
    haptics.impact('medium');
    const attachment: SpiritualShareAttachment = {
      type: 'tuvi',
      title: `📜 Lá Số Tử Vi: ${profileInput.fullName}`,
      subtitle: `${chart.canChiYear} (${chart.menhNguHanh}) • Cục: ${chart.cuc}`,
      tuviSummary: {
        fullName: profileInput.fullName,
        menhNguHanh: chart.menhNguHanh,
        year2026Score: chart.yearFortune2026.overallScore,
        saoChieuMenh: chart.yearFortune2026.saoChieuMenh,
        generalAdvice: chart.yearFortune2026.overview,
        cungMenhAt: chart.cungMenhAt
      },
      tuViData: {
        fullName: profileInput.fullName,
        canChiYear: chart.canChiYear,
        menh: chart.menhNguHanh,
        cuc: chart.cuc,
        thanCu: chart.cungThanAt,
        palacesSummary: chart.palaces.map(p => `${p.name}: ${p.stars.filter(s => s.type === 'chinh_tinh').map(s => s.name).join(', ') || 'Vô chính diệu'}`).slice(0, 6)
      },
      aiVerdictExcerpt: aiAnalysisResult || `Bản mệnh: ${chart.menhNguHanh} - Cục: ${chart.cuc}. Cung Thân cư ${chart.cungThanAt}. Vận trình 2026 Bính Ngọ nhiều cơ hội chuyển mình tài lộc và sự nghiệp.`,
      createdAt: new Date().toISOString()
    };
    setShareAttachment(attachment);
    setIsShareModalOpen(true);
  };

  const handleGenerateChart = (e: React.FormEvent) => {
    e.preventDefault();
    haptics.impact('medium');
    spiritualAudio.playTempleBell();

    const newChart = calculateTuViChart(profileInput);
    setChart(newChart);
    setSelectedPalace(newChart.palaces[0]); // Default to Cung Menh
    setAiAnalysisResult(null);

    if (onEarnCoins) {
      onEarnCoins(50, 'Lập lá số Tử Vi trọn đời (+50 Xu)');
    }
  };

  const handleRequestAiTuVi = async () => {
    if (!chart) return;
    setIsAiAnalyzing(true);
    setAiAnalysisResult(null);

    try {
      const payload = {
        fullName: chart.profile.fullName,
        gender: chart.profile.gender === 'male' ? 'Nam Mạng' : 'Nữ Mạng',
        canChiYear: chart.canChiYear,
        menhNguHanh: chart.menhNguHanh,
        cuc: chart.cuc,
        cungMenhAt: chart.cungMenhAt,
        chuMenh: chart.chuMenh,
        saoChieuMenh2026: chart.yearFortune2026.saoChieuMenh
      };

      const res = await fetch('/api/spiritual/tuvi-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.analysis) {
          setAiAnalysisResult(data.analysis);
          setIsAiAnalyzing(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    // High quality local fallback analysis
    setTimeout(() => {
      const fallback = `### 📜 Luận Giải Toàn Diện Lá Số Tử Vi: ${chart.profile.fullName} (${chart.canChiYear} - ${chart.menhNguHanh})

#### 🌟 1. Tổng Quan Bản Mệnh & Cốt Cách:
Bản mệnh tọa tại **${chart.cungMenhAt}**, đắc thủ chính tinh **${chart.chuMenh}**, thuộc **${chart.cuc}**. Bạn là người có tư duy mưu lược, nội tâm sâu sắc, có chí tiến thủ và trọng chữ tín. Hậu vận sau 32 tuổi tài lộc vững chắc, công danh rực rỡ.

#### 💼 2. Công Danh & Sự Nghiệp:
Cung Quan Lộc hội tụ nhiều cát tinh tương trợ, thích hợp với các lĩnh vực quản lý, kinh doanh công nghệ, sáng tạo nội dung hoặc đầu tư chiến lược. Dễ gặp quý nhân phù trợ trong những thời khắc quan trọng.

#### 💰 3. Tài Lộc & Điền Sản:
Cung Tài Bạch hanh thông, nguồn thu đa dạng từ cả chính tài và phụ tài. Khả năng quản lý dòng tiền tốt, tuy nhiên trong các năm có hạn cần cẩn trọng cho vay mượn.

#### ❤️ 4. Tình Duyên & Gia Đạo:
Cung Phu Thê hòa hợp, người bạn đời có học thức, đồng điệu về tâm hồn và là điểm tựa vững chắc cho bạn cả trong công việc lẫn cuộc sống.

#### 🛡️ 5. Vận Hạn Năm 2026 (Bính Ngọ):
- **Sao Chiếu Mệnh**: ${chart.yearFortune2026.saoChieuMenh}
- **Đánh Giá**: Vận thế mở mang, có cơ hội bứt phá ngoạn mục. Nên duy trì tâm đức, làm nhiều việc thiện để chiêu tài đón lộc.`;

      setAiAnalysisResult(fallback);
      setIsAiAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="w-full flex flex-col items-center space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="w-full bg-gradient-to-r from-amber-950/70 via-orange-950/60 to-zinc-950 rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold mb-3">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              12 Cung Bàn Tử Vi Chuẩn Cổ Học Phương Đông
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              📜 Lập & Luận Giải Lá Số Tử Vi
            </h2>
            <p className="text-sm text-zinc-300 mt-1.5 max-w-2xl leading-relaxed">
              Giải mã vận mệnh, công danh, tài lộc, gia đạo trọn đời và chi tiết vận hạn năm 2026 (Bính Ngọ) cùng phong thủy ngũ hành tương sinh hộ mệnh.
            </p>
          </div>

          <button
            onClick={handleRequestAiTuVi}
            disabled={isAiAnalyzing}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-600/30 active:scale-95 disabled:opacity-50"
          >
            <BrainCircuit className="w-4 h-4" />
            {isAiAnalyzing ? 'Đang Luận Giải AI...' : 'Haevy AI Luận Toàn Quẻ'}
          </button>
        </div>
      </div>

      {/* Input Form Drawer */}
      <form onSubmit={handleGenerateChart} className="w-full bg-zinc-950/90 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Name */}
        <div className="lg:col-span-2 space-y-1.5">
          <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            Họ và Tên
          </label>
          <input
            type="text"
            required
            value={profileInput.fullName}
            onChange={e => setProfileInput({ ...profileInput, fullName: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
            placeholder="Nhập họ tên đầy đủ..."
          />
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-amber-300">Giới Tính</label>
          <select
            value={profileInput.gender}
            onChange={e => setProfileInput({ ...profileInput, gender: e.target.value as 'male' | 'female' })}
            className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
          >
            <option value="male">Nam Mạng</option>
            <option value="female">Nữ Mạng</option>
          </select>
        </div>

        {/* Birth Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Ngày Sinh (Dương)
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            <input
              type="number"
              min="1"
              max="31"
              value={profileInput.solarDay}
              onChange={e => setProfileInput({ ...profileInput, solarDay: parseInt(e.target.value) || 1 })}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2.5 text-xs text-center text-white"
              title="Ngày"
            />
            <input
              type="number"
              min="1"
              max="12"
              value={profileInput.solarMonth}
              onChange={e => setProfileInput({ ...profileInput, solarMonth: parseInt(e.target.value) || 1 })}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2.5 text-xs text-center text-white"
              title="Tháng"
            />
            <input
              type="number"
              min="1940"
              max="2030"
              value={profileInput.solarYear}
              onChange={e => setProfileInput({ ...profileInput, solarYear: parseInt(e.target.value) || 1998 })}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2.5 text-xs text-center text-white"
              title="Năm"
            />
          </div>
        </div>

        {/* Birth Hour */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-amber-300">Giờ Sinh</label>
          <select
            value={profileInput.solarHour}
            onChange={e => setProfileInput({ ...profileInput, solarHour: parseInt(e.target.value) })}
            className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-2.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value={0}>Giờ Tý (23h - 01h)</option>
            <option value={2}>Giờ Sửu (01h - 03h)</option>
            <option value={4}>Giờ Dần (03h - 05h)</option>
            <option value={6}>Giờ Mão (05h - 07h)</option>
            <option value={8}>Giờ Thìn (07h - 09h)</option>
            <option value={10}>Giờ Tỵ (09h - 11h)</option>
            <option value={12}>Giờ Ngọ (11h - 13h)</option>
            <option value={14}>Giờ Mùi (13h - 15h)</option>
            <option value={16}>Giờ Thân (15h - 17h)</option>
            <option value={18}>Giờ Dậu (17h - 19h)</option>
            <option value={20}>Giờ Tuất (19h - 21h)</option>
            <option value={22}>Giờ Hợi (21h - 23h)</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-600/30 active:scale-95 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Lập Lá Số
          </button>
        </div>
      </form>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 w-full pb-3">
        <button
          onClick={() => setActiveTab('laso')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'laso'
              ? 'bg-amber-600/30 border border-amber-400/50 text-amber-200'
              : 'text-zinc-400 hover:text-white bg-zinc-900/50'
          }`}
        >
          <Compass className="w-4 h-4" />
          12 Cung Bàn Tử Vi
        </button>
        <button
          onClick={() => setActiveTab('vanhan2026')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'vanhan2026'
              ? 'bg-amber-600/30 border border-amber-400/50 text-amber-200'
              : 'text-zinc-400 hover:text-white bg-zinc-900/50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Vận Hạn 2026 (Bính Ngọ)
        </button>
        <button
          onClick={() => setActiveTab('phongthuy')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'phongthuy'
              ? 'bg-amber-600/30 border border-amber-400/50 text-amber-200'
              : 'text-zinc-400 hover:text-white bg-zinc-900/50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Phong Thủy Hộ Mệnh
        </button>
      </div>

      {/* Content for TAB 1: 12 Palaces Lá Số Grid */}
      {activeTab === 'laso' && chart && (
        <div className="w-full space-y-6">
          {/* Summary Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-amber-500/20 text-center">
              <span className="text-[10px] text-zinc-400">Năm Sinh Can Chi</span>
              <p className="text-sm font-bold text-amber-300">{chart.canChiYear}</p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-amber-500/20 text-center">
              <span className="text-[10px] text-zinc-400">Bản Mệnh Nạp Âm</span>
              <p className="text-xs font-bold text-white line-clamp-1">{chart.menhNguHanh}</p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-amber-500/20 text-center">
              <span className="text-[10px] text-zinc-400">Cục Bản Số</span>
              <p className="text-sm font-bold text-emerald-300">{chart.cuc}</p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-amber-500/20 text-center">
              <span className="text-[10px] text-zinc-400">Cung Mệnh Tại</span>
              <p className="text-sm font-bold text-sky-300">Cung {chart.cungMenhAt}</p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-amber-500/20 text-center">
              <span className="text-[10px] text-zinc-400">Chủ Mệnh</span>
              <p className="text-sm font-bold text-purple-300">{chart.chuMenh}</p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-amber-500/20 text-center">
              <span className="text-[10px] text-zinc-400">Chủ Thân</span>
              <p className="text-sm font-bold text-pink-300">{chart.chuThan}</p>
            </div>
          </div>

          {/* 12 Palaces Grid (Traditional Layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {chart.palaces.map(palace => {
              const isSelected = selectedPalace?.id === palace.id;
              return (
                <button
                  key={palace.id}
                  onClick={() => {
                    haptics.impact('light');
                    spiritualAudio.playTempleBell();
                    setSelectedPalace(palace);
                  }}
                  className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-950/80 to-zinc-950 border-amber-400 ring-2 ring-amber-500/30 shadow-xl'
                      : 'bg-zinc-950/80 border-zinc-800 hover:border-amber-500/40 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {palace.heavenlyStem} {palace.earthlyBranch}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {palace.isThan && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
                          Thân Cư
                        </span>
                      )}
                      <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/30">
                        {palace.name}
                      </span>
                    </div>
                  </div>

                  {/* Stars in Palace */}
                  <div className="space-y-1">
                    {palace.stars.map((star, starIdx) => (
                      <div key={star.id || `${star.name}-${starIdx}`} className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white flex items-center gap-1">
                          <span className="text-amber-400">★</span>
                          {star.name}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                          star.brightness.includes('Miếu') ? 'bg-amber-500/20 text-amber-300' :
                          star.brightness.includes('Vượng') ? 'bg-emerald-500/20 text-emerald-300' :
                          star.brightness.includes('Đắc') ? 'bg-sky-500/20 text-sky-300' :
                          'bg-zinc-800 text-zinc-400'
                        }`}>
                          {star.brightness}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Độ Vượng: {palace.score}%</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Palace Inspector Box */}
          {selectedPalace && (
            <div className="w-full bg-zinc-950/90 border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-amber-400" />
                    Chi Tiết Cung {selectedPalace.name} ({selectedPalace.heavenlyStem} {selectedPalace.earthlyBranch})
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Chính tinh chủ trì: {selectedPalace.stars.map(s => `${s.name} (${s.brightness})`).join(', ')}
                  </p>
                </div>
                <div className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Vận Khí Cung: {selectedPalace.score}/100
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                  <h4 className="text-xs font-bold text-amber-300">Luận Giải Cung Vị</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">{selectedPalace.generalVerdict}</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                  <h4 className="text-xs font-bold text-emerald-300">Lời Khuyên & Hóa Giải</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">{selectedPalace.advice}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content for TAB 2: Vận Hạn 2026 */}
      {activeTab === 'vanhan2026' && chart && (
        <div className="w-full space-y-6 animate-fadeIn">
          {/* Year Score Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/80 via-orange-950/70 to-zinc-950 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Vận Trình Năm Bính Ngọ 2026
                </span>
                <button
                  id="btn_read_fortune_2026"
                  onClick={() => {
                    haptics.impact('medium');
                    const text = `# 🌟 TỔNG QUAN VẬN HẠN NĂM 2026 (BÍNH NGỌ) - ĐƯƠNG SỐ ${profileInput.fullName.toUpperCase()}

## 👑 Sao Chiếu Mệnh Năm 2026: ${chart.yearFortune2026.saoChieuMenh}
- **Điểm vận thế năm**: ${chart.yearFortune2026.overallScore} / 100 điểm
- **Tổng quan thời vận**: ${chart.yearFortune2026.overview}

---

## 🛡️ TÌNH TRẠNG 4 HẠN LỚN NĂM 2026
1. **Hạn Tam Tai**: ${chart.yearFortune2026.hanTamTai ? 'Phạm hạn Tam Tai. Cần cẩn trọng trong các quyết định khởi sự lớn và giữ gìn hòa khí gia đình.' : 'Không phạm Tam Tai. Mọi việc diễn tiến hanh thông thuận lợi.'}
2. **Hạn Kim Lâu**: ${chart.yearFortune2026.hanKimLau ? 'Phạm Kim Lâu. Không nên đứng tên động thổ xây nhà hoặc tổ chức hỷ sự đại sự.' : 'Không phạm Kim Lâu. Thích hợp mưu cầu đại sự.'}
3. **Hạn Hoang Ốc**: ${chart.yearFortune2026.hanHoangOc ? 'Có yếu tố cung xấu trong Hoang Ốc. Cần mượn tuổi hoặc chọn ngày hoàng đạo nếu làm nhà.' : 'Thuộc cung Cát Tường trong Hoang Ốc (Nhất Cát, Nhì Nghi, Tứ Tấn Tài).'}
4. **Hạn Thái Tuế**: ${chart.yearFortune2026.hanThaiTue ? 'Phạm hạn Thái Tuế (Trực/Xung/Hại Thái Tuế). Cần dĩ hòa vi quý, tránh thị phi tranh chấp.' : 'Bình hòa, không xung phạm Thái Tuế.'}

---

## 💼 CÔNG DANH & SỰ NGHIỆP 2026
${chart.yearFortune2026.careerAdvice}

---

## 💰 TÀI CHÍNH & TÀI LỘC 2026
${chart.yearFortune2026.wealthAdvice}

---

## ❤️ TÌNH DUYÊN & GIA ĐẠO 2026
${chart.yearFortune2026.loveAdvice}

---

## 🌿 SỨC KHỎE & BÌNH AN 2026
${chart.yearFortune2026.healthAdvice}

---

## ✨ LỜI KHUYÊN KHAI MỞ NĂM 2026:
Hãy giữ vững tâm thế chánh niệm, tích cực gieo mầm thiện lành, bao dung với mọi người xung quanh và kiên trì theo đuổi mục tiêu. Năm 2026 Bính Ngọ mang năng lượng Lửa nhiệt huyết sẽ biến mọi nỗ lực chân thành của bạn thành thành quả viên mãn.`;

                    setReaderContent({
                      title: `Vận Hạn 2026: ${profileInput.fullName}`,
                      subtitle: `Sao ${chart.yearFortune2026.saoChieuMenh} • Điểm Vận: ${chart.yearFortune2026.overallScore}/100`,
                      content: text
                    });
                    setIsReaderModalOpen(true);
                  }}
                  className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>🎙️ Nghe Đọc Toàn Bộ Vận Hạn</span>
                </button>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Sao Chiếu Mệnh: <span className="text-amber-400">{chart.yearFortune2026.saoChieuMenh}</span>
              </h3>
              <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
                {chart.yearFortune2026.overview}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-900/80 border border-amber-500/40 text-center min-w-[140px]">
              <span className="text-3xl font-black text-amber-300">{chart.yearFortune2026.overallScore}</span>
              <span className="text-[10px] text-zinc-400 uppercase font-bold mt-0.5">Điểm Vận Năm</span>
            </div>
          </div>

          {/* 4 Hạn Status Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border text-center ${
              chart.yearFortune2026.hanTamTai ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' : 'bg-zinc-950/80 border-zinc-800 text-emerald-400'
            }`}>
              <span className="text-xs font-bold">Hạn Tam Tai</span>
              <p className="text-sm font-black mt-1">{chart.yearFortune2026.hanTamTai ? 'Có Phạm Hạn' : 'Không Phạm'}</p>
            </div>
            <div className={`p-4 rounded-2xl border text-center ${
              chart.yearFortune2026.hanKimLau ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' : 'bg-zinc-950/80 border-zinc-800 text-emerald-400'
            }`}>
              <span className="text-xs font-bold">Hạn Kim Lâu</span>
              <p className="text-sm font-black mt-1">{chart.yearFortune2026.hanKimLau ? 'Phạm Kim Lâu' : 'Không Phạm'}</p>
            </div>
            <div className={`p-4 rounded-2xl border text-center ${
              chart.yearFortune2026.hanHoangOc ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' : 'bg-zinc-950/80 border-zinc-800 text-emerald-400'
            }`}>
              <span className="text-xs font-bold">Hạn Hoang Ốc</span>
              <p className="text-sm font-black mt-1">{chart.yearFortune2026.hanHoangOc ? 'Có Cung Xấu' : 'Cung Cát Tường'}</p>
            </div>
            <div className={`p-4 rounded-2xl border text-center ${
              chart.yearFortune2026.hanThaiTue ? 'bg-orange-950/40 border-orange-500/40 text-orange-300' : 'bg-zinc-950/80 border-zinc-800 text-emerald-400'
            }`}>
              <span className="text-xs font-bold">Hạn Thái Tuế</span>
              <p className="text-sm font-black mt-1">{chart.yearFortune2026.hanThaiTue ? 'Xung/Trực Thái Tuế' : 'Bình Hòa'}</p>
            </div>
          </div>

          {/* 4 Pillars of Life for 2026 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-2">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Công Danh & Sự Nghiệp 2026
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">{chart.yearFortune2026.careerAdvice}</p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-2">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Tài Chính & Lộc Tài 2026
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">{chart.yearFortune2026.wealthAdvice}</p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-2">
              <span className="text-xs font-bold text-rose-300 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Tình Cảm & Gia Đạo 2026
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">{chart.yearFortune2026.loveAdvice}</p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-2">
              <span className="text-xs font-bold text-sky-300 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Sức Khỏe & Bình An 2026
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">{chart.yearFortune2026.healthAdvice}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content for TAB 3: Phong Thủy Hộ Mệnh */}
      {activeTab === 'phongthuy' && chart && (
        <div className="w-full space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-zinc-950/90 border border-amber-500/30 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                Bản Mệnh: {chart.menhNguHanh}
              </h3>
              <button
                id="btn_read_fengshui_guide"
                onClick={() => {
                  haptics.impact('medium');
                  const text = `# 🧭 CẨM NANG PHONG THỦY HỘ MỆNH & KHAI VẬN - ĐƯƠNG SỐ ${profileInput.fullName.toUpperCase()}

## 🔮 1. Bản Mệnh Ngũ Hành & Khí Chất
- **Bản Mệnh**: ${chart.menhNguHanh}
- **Cục**: ${chart.cuc}
- **Cung Mệnh Tọa Tại**: ${chart.cungMenhAt} | **Chủ Mệnh**: ${chart.chuMenh}

---

## 🌿 2. Quy Luật Tương Sinh & Tương Khắc
### ✅ Ngũ Hành Tương Sinh (Trợ Lực Tốt):
${chart.fengShuiGuidance.nguHanhTuongSinh.map(s => `- **${s}**`).join('\n')}

### ⚠️ Ngũ Hành Tương Khắc (Cần Tiết Chế):
${chart.fengShuiGuidance.nguHanhTuongKhac.map(k => `- **${k}**`).join('\n')}

---

## 🎨 3. Màu Sắc May Mắn & Kích Tài Lộc
- **Màu sắc vượng khí**: ${chart.fengShuiGuidance.luckyColors.join(', ')}
- **Ý nghĩa**: Giúp cân bằng từ trường sinh học, thanh lọc tạp khí và thu hút nguồn năng lượng quý nhân.

---

## 🔢 4. Con Số Cát Tường Chiêu Tài
- **Các con số vượng khí**: ${chart.fengShuiGuidance.luckyNumbers.join(', ')}
- **Ứng dụng**: Ưu tiên lựa chọn số điện thoại, số tài khoản ngân hàng, biển số hoặc các cột mốc giao dịch tài chính.

---

## 🧭 5. Hướng Nhà & Bàn Làm Việc Đắc Địa
- **Phương hướng cát lợi**: ${chart.fengShuiGuidance.luckyDirections.join(', ')}
- **Bí quyết bài trí**: Đặt bàn làm việc quay mặt về hướng cát, phía sau có điểm tựa vững chắc (tường hoặc tủ sách) để công danh luôn thăng tiến.

---

## 💎 6. Đá Quý & Vật Phẩm Phong Thủy Hộ Thân
- **Đá quý tương sinh**: ${chart.fengShuiGuidance.auspiciousStones.join(', ')}
- **Lời khuyên**: Đeo vòng tay phong thủy hoặc đặt quả cầu thạch anh trên bàn làm việc để tụ khí sinh tài, tâm trí luôn minh mẫn sáng suốt.`;

                  setReaderContent({
                    title: `Cẩm Nang Phong Thủy: ${profileInput.fullName}`,
                    subtitle: `Bản Mệnh ${chart.menhNguHanh} • Cục ${chart.cuc}`,
                    content: text
                  });
                  setIsReaderModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>🎙️ Nghe Đọc Cẩm Nang Phong Thủy</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sinh Khắc */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-emerald-500/30 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400">Ngũ Hành Tương Sinh</h4>
                  <div className="flex flex-wrap gap-2">
                    {chart.fengShuiGuidance.nguHanhTuongSinh.map((item, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-emerald-950/60 text-emerald-200 text-xs border border-emerald-500/30">
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-rose-500/30 space-y-2">
                  <h4 className="text-xs font-bold text-rose-400">Ngũ Hành Tương Khắc (Cần Tiết Chế)</h4>
                  <div className="flex flex-wrap gap-2">
                    {chart.fengShuiGuidance.nguHanhTuongKhac.map((item, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-rose-950/60 text-rose-200 text-xs border border-rose-500/30">
                        ⚠ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Items & Colors */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                  <span className="text-xs font-bold text-amber-300">Màu Sắc May Mắn</span>
                  <p className="text-xs text-zinc-300">{chart.fengShuiGuidance.luckyColors.join(', ')}</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                  <span className="text-xs font-bold text-sky-300">Con Số Vượng Khí</span>
                  <p className="text-xs text-zinc-300">{chart.fengShuiGuidance.luckyNumbers.join(', ')}</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                  <span className="text-xs font-bold text-purple-300">Hướng Nhà & Bàn Làm Việc</span>
                  <p className="text-xs text-zinc-300">{chart.fengShuiGuidance.luckyDirections.join(', ')}</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
                  <span className="text-xs font-bold text-pink-300">Đá Quý Hộ Thân</span>
                  <p className="text-xs text-zinc-300">{chart.fengShuiGuidance.auspiciousStones.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Master Tu Vi Analysis Output Box */}
      {aiAnalysisResult && (
        <div className="w-full bg-gradient-to-r from-amber-950/80 via-orange-950/80 to-zinc-950 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/30">
            <div className="flex items-center gap-2.5">
              <BrainCircuit className="w-6 h-6 text-amber-400 animate-pulse" />
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                📜 Luận Giải Chuyên Sâu Từ Đại Sư Tử Vi Haevy AI
              </h3>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                id="btn_open_tuvi_reader"
                onClick={() => {
                  haptics.impact('medium');
                  setReaderContent({
                    title: `Luận Giải Tử Vi: ${profileInput.fullName}`,
                    subtitle: `Năm sinh: ${profileInput.solarYear} (${chart?.canChiYear}) • Bản Mệnh: ${chart?.menhNguHanh}`,
                    content: aiAnalysisResult
                  });
                  setIsReaderModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
                title="Mở giao diện đọc sách toàn màn hình & nghe giọng đọc AI"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>🎙️ Nghe Đọc / Đọc Sách</span>
              </button>

              <button
                onClick={handleOpenShareTuVi}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-zinc-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
                title="Chia sẻ lá số & luận giải qua Haevy Message / I Love Haevy"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Chia Sẻ</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`📜 LÁ SỐ TỬ VI HAEVY SPIRITUAL\n👤 Đương số: ${profileInput.fullName}\n📅 Năm sinh: ${profileInput.solarYear} (${chart?.canChiYear})\n🔮 Bản mệnh: ${chart?.menhNguHanh}\n\n${aiAnalysisResult}`);
                  haptics.impact('light');
                  showToast('Đã sao chép toàn bộ luận giải Tử Vi!');
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Sao chép bài luận giải"
              >
                <Copy className="w-3.5 h-3.5 text-amber-300" />
                <span>Sao Chép</span>
              </button>
            </div>
          </div>
          <div className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans space-y-3">
            {aiAnalysisResult}
          </div>
        </div>
      )}

      {/* Toast message popup */}
      {toastMessage && (
        <div className="fixed bottom-24 sm:bottom-20 right-4 z-50 bg-zinc-900/95 border border-amber-500/50 text-amber-200 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
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
        title={readerContent.title || `Tử Vi: ${profileInput.fullName}`}
        subtitle={readerContent.subtitle || `${chart?.canChiYear} • ${chart?.menhNguHanh}`}
        category="tuvi"
        contentMarkdown={readerContent.content || aiAnalysisResult || ''}
        onShare={handleOpenShareTuVi}
      />
    </div>
  );
}
