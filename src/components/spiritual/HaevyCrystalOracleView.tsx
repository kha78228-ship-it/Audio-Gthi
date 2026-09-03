import React, { useState } from 'react';
import { 
  Sparkles, 
  Eye, 
  HelpCircle, 
  Share2, 
  BookOpen, 
  RefreshCw, 
  Check, 
  Flame, 
  Heart, 
  Compass, 
  Volume2, 
  Zap,
  RotateCw
} from 'lucide-react';
import { OracleAnswer, SpiritualShareAttachment } from '../../types';
import { CRYSTAL_ORACLE_RESPONSES } from '../../data/palmistryAndDivinationData';
import { SpiritualShareModal } from './SpiritualShareModal';
import { SpiritualTextReaderModal } from './SpiritualTextReaderModal';
import { spiritualAudio } from '../../utils/spiritualAudioSynthesizer';
import { haptics } from '../../utils/haptics';

interface HaevyCrystalOracleViewProps {
  onEarnCoins?: (amount: number, reason: string) => void;
  onNavigateToMode?: (mode: string, subTab?: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'Tất Cả', icon: '✨' },
  { id: 'love', label: 'Tình Yêu', icon: '💖' },
  { id: 'career', label: 'Sự Nghiệp', icon: '💼' },
  { id: 'decision', label: 'Quyết Định', icon: '⚖️' },
  { id: 'wealth', label: 'Tài Chính', icon: '💰' }
];

export function HaevyCrystalOracleView({ onEarnCoins, onNavigateToMode }: HaevyCrystalOracleViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userQuestion, setUserQuestion] = useState('');
  const [isGazing, setIsGazing] = useState(false);
  const [oracleAnswer, setOracleAnswer] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<OracleAnswer | null>(null);

  // Modals & UI states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareAttachment, setShareAttachment] = useState<SpiritualShareAttachment | null>(null);
  const [isReaderModalOpen, setIsReaderModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAskCrystalBall = async () => {
    if (isGazing) return;
    setIsGazing(true);
    setOracleAnswer(null);
    setSelectedPreset(null);
    haptics.heavy();
    spiritualAudio.playCrystalResonance();

    try {
      const res = await fetch('/api/spiritual/crystal-oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQuestion.trim() || 'Lời nhắn nhủ từ vũ trụ cho tôi hôm nay',
          category: selectedCategory
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setOracleAnswer(data.message);
          setIsGazing(false);
          spiritualAudio.playSingingBowl(216);
          if (onEarnCoins) {
            onEarnCoins(30, 'Nhận thông điệp từ Quả Cầu Pha Lê (+30 Xu)');
          }
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Preset fallback
    const randomPreset = CRYSTAL_ORACLE_RESPONSES[Math.floor(Math.random() * CRYSTAL_ORACLE_RESPONSES.length)];
    setSelectedPreset(randomPreset);
    setOracleAnswer(`### 🔮 Quả Cầu Pha Lê Soi Sáng: "${userQuestion || 'Thông điệp dẫn lối'}"\n\n✨ **Đáp án trực giác**: **${randomPreset.shortAnswer}**\n\n${randomPreset.cosmicMessage}\n\n🌿 **Lời khuyên hành động**: ${randomPreset.actionGuidance}\n\n💫 **Affirmation**: *"${randomPreset.affirmation}"*`);
    setIsGazing(false);
    spiritualAudio.playSingingBowl(216);
    if (onEarnCoins) {
      onEarnCoins(30, 'Nhận thông điệp từ Quả Cầu Pha Lê (+30 Xu)');
    }
  };

  const handleSelectPresetCard = (preset: OracleAnswer) => {
    haptics.light();
    setSelectedPreset(preset);
    spiritualAudio.playCrystalResonance();
    setOracleAnswer(`### 🔮 Lời Sấm Quả Cầu Pha Lê: ${preset.shortAnswer}\n\n${preset.cosmicMessage}\n\n🌿 **Lời khuyên hành động**: ${preset.actionGuidance}\n\n💫 **Khẳng định năng lượng**: *"${preset.affirmation}"*`);
  };

  const handleShareOracle = () => {
    haptics.light();
    setShareAttachment({
      type: 'crystal_oracle',
      title: '🔮 Quả Cầu Pha Lê Tiên Tri',
      subtitle: userQuestion || 'Thông điệp trực giác vũ trụ',
      questionOrTheme: userQuestion || 'Lời dẫn lối từ vũ trụ',
      aiVerdictExcerpt: oracleAnswer ? oracleAnswer.slice(0, 140) + '...' : 'Vũ trụ luôn dõi theo và che chở bạn.',
      createdAt: new Date().toISOString()
    });
    setIsShareModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-950/70 via-pink-950/50 to-zinc-950/90 border border-purple-500/30 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300 shadow-lg shadow-purple-950/50 shrink-0">
              <span className="text-2xl sm:text-3xl">🔮</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-900/80 text-pink-200 border border-purple-400/40">
                  Trực Giác Vũ Trụ & Năng Lượng Tinh Thể
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">Lời Nhắn Khai Sáng</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white mt-1">
                Quả Cầu Pha Lê & Cầu Cơ Tiên Tri
              </h2>
              <p className="text-xs sm:text-sm text-purple-200/90 mt-0.5 max-w-2xl">
                Tập trung tinh thần, chạm vào khối cầu thạch anh phát sáng để đón nhận thông điệp trực giác, lời hồi đáp cho những băn khoăn thầm kín.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Crystal Ball Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Glowing Crystal Ball (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-950/90 border border-purple-500/30 rounded-2xl sm:rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center text-center space-y-6">
          {/* Animated Crystal Ball Visual */}
          <div 
            onClick={handleAskCrystalBall}
            className={`relative w-44 h-44 sm:w-56 sm:h-56 rounded-full flex items-center justify-center cursor-pointer transition-all duration-700 select-none shadow-[0_0_50px_rgba(168,85,247,0.4)] ${
              isGazing 
                ? 'scale-110 shadow-[0_0_90px_rgba(236,72,153,0.8)] animate-pulse' 
                : 'hover:scale-105'
            } bg-gradient-to-tr from-purple-900 via-indigo-800 to-pink-600`}
          >
            {/* Inner Glowing Core */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-white/30 via-purple-300/20 to-transparent blur-sm flex items-center justify-center">
              <span className="text-5xl sm:text-6xl drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] animate-bounce">
                🔮
              </span>
            </div>

            {/* Orbiting particles */}
            <div className="absolute inset-0 rounded-full border border-purple-300/40 animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-2 rounded-full border border-pink-400/30 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }} />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-black text-purple-300 uppercase tracking-wider">
              {isGazing ? 'Đang Kết Nối Trực Giác...' : 'Chạm Vào Quả Cầu Để Soi Sáng'}
            </span>
            <p className="text-[11px] text-zinc-400 max-w-xs">
              Mỗi thông điệp là một gợi ý để bạn kết nối với nguồn thông tuệ bên trong.
            </p>
          </div>
        </div>

        {/* Right: Question Input & Presets (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-950/90 border border-purple-500/20 rounded-2xl sm:rounded-3xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            Đặt Câu Hỏi Cho Quả Cầu Pha Lê
          </h3>

          {/* Categories */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  haptics.light();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-md font-black'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Question Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-400">Câu hỏi hoặc điều bạn đang đắn đo:</label>
            <input
              type="text"
              value={userQuestion}
              onChange={e => setUserQuestion(e.target.value)}
              placeholder="VD: Tôi có nên bắt đầu dự án mới trong tuần này?..."
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Ask Button */}
          <button
            onClick={handleAskCrystalBall}
            disabled={isGazing}
            className="w-full py-3.5 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGazing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Quả Cầu Đang Truyền Tải Năng Lượng...</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-pink-300" />
                <span>Thỉnh Lời Tiên Tri Từ Quả Cầu</span>
              </>
            )}
          </button>

          {/* Preset Oracle Cards Deck */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <label className="text-xs font-bold text-zinc-400 block">Hoặc Chọn Trực Tiếp Thẻ Sấm Vũ Trụ:</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {CRYSTAL_ORACLE_RESPONSES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPresetCard(preset)}
                  className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-purple-950/40 border border-zinc-800 hover:border-purple-500/40 text-left transition-all cursor-pointer"
                >
                  <div className="text-xs font-black text-pink-300 truncate">✨ {preset.shortAnswer}</div>
                  <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5">{preset.cosmicMessage}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Result Display */}
      {oracleAnswer && (
        <div className="bg-zinc-950/90 border border-purple-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-pink-300 border border-purple-400/40 flex items-center justify-center font-black">
                🔮
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Thông Điệp Quả Cầu Pha Lê Tiên Tri
                </h3>
                <span className="text-[10px] text-pink-400 font-semibold">
                  Trực giác vũ trụ & Khai mở tâm trí
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
                onClick={handleShareOracle}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Share2 size={14} />
                <span>Chia Sẻ</span>
              </button>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/80 whitespace-pre-wrap">
            {oracleAnswer}
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
        title="Thông Điệp Quả Cầu Pha Lê"
        contentMarkdown={oracleAnswer || ''}
      />
    </div>
  );
}
