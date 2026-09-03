import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Compass, 
  Sun, 
  Radio, 
  Award, 
  Coins, 
  Flame, 
  Moon, 
  Zap,
  Info,
  Volume2,
  VolumeX,
  RefreshCw,
  Gift,
  Heart,
  Share2,
  Check,
  Eye,
  Scroll,
  Hash,
  BookOpen
} from 'lucide-react';
import { HaevyTarotView } from './spiritual/HaevyTarotView';
import { HaevyTuViView } from './spiritual/HaevyTuViView';
import { HaevyAstrologyView } from './spiritual/HaevyAstrologyView';
import { HaevySoundscapesView } from './spiritual/HaevySoundscapesView';
import { HaevyCoupleSpiritualView } from './spiritual/HaevyCoupleSpiritualView';
import { HaevyPalmistryView } from './spiritual/HaevyPalmistryView';
import { HaevyDivinationView } from './spiritual/HaevyDivinationView';
import { HaevyNumerologyView } from './spiritual/HaevyNumerologyView';
import { HaevyCrystalOracleView } from './spiritual/HaevyCrystalOracleView';
import { HaevyFocusReaderView } from './spiritual/HaevyFocusReaderView';
import { SpiritualShareModal } from './spiritual/SpiritualShareModal';
import { SpiritualShareAttachment } from '../types';
import { spiritualAudio } from '../utils/spiritualAudioSynthesizer';
import { haptics } from '../utils/haptics';

export type SpiritualSubTab = 
  | 'tarot' 
  | 'palmistry' 
  | 'divination' 
  | 'numerology' 
  | 'crystal_oracle' 
  | 'couple_spiritual' 
  | 'tuvi' 
  | 'astrology' 
  | 'focus_reader'
  | 'soundscapes';

interface HaevySpiritualViewProps {
  onEarnCoins?: (amount: number, reason: string) => void;
  initialSubTab?: SpiritualSubTab;
  onNavigateToMode?: (mode: string, subTab?: string) => void;
}

export function HaevySpiritualView({ onEarnCoins, initialSubTab, onNavigateToMode }: HaevySpiritualViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<SpiritualSubTab>(initialSubTab || 'tarot');
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [dailyAffirmation, setDailyAffirmation] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [dailyShareAttachment, setDailyShareAttachment] = useState<SpiritualShareAttachment | null>(null);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const affirmations = [
    'Tâm bình vạn sự bình — Năng lượng vũ trụ đang chảy tràn trong từng suy nghĩ tích cực của bạn.',
    'Mỗi trải nghiệm hôm nay là một bài học khai mở trực giác và tiềm năng vô hạn bên trong bạn.',
    'Bạn luôn an toàn, được yêu thương và được dẫn lối bởi nguồn năng lượng thuần khiết nhất.',
    'Thu hút sự thịnh vượng, bình an và những cơ duyên tốt đẹp đến với cuộc sống mỗi ngày.'
  ];

  useEffect(() => {
    // Select daily affirmation based on day of year
    const day = new Date().getDate();
    setDailyAffirmation(affirmations[day % affirmations.length]);

    // Check if daily coin claimed today
    const lastClaim = localStorage.getItem('haevy_spiritual_daily_claim');
    const todayStr = new Date().toDateString();
    if (lastClaim === todayStr) {
      setDailyClaimed(true);
    }

    return () => {
      // Clean up ambient audio if playing
      spiritualAudio.stopSolfeggioTone();
    };
  }, []);

  const toggleAmbientHealing = () => {
    haptics.impact('medium');
    if (isAmbientPlaying) {
      spiritualAudio.stopSolfeggioTone();
      setIsAmbientPlaying(false);
    } else {
      spiritualAudio.startSolfeggioTone(528, 0.15); // 528Hz Solfeggio Love & Miracles
      spiritualAudio.playSingingBowl(216);
      setIsAmbientPlaying(true);
    }
  };

  const handleClaimDailyBlessing = () => {
    if (dailyClaimed) return;
    haptics.rewardClaim();
    spiritualAudio.playTempleBell();
    const todayStr = new Date().toDateString();
    localStorage.setItem('haevy_spiritual_daily_claim', todayStr);
    setDailyClaimed(true);
    if (onEarnCoins) {
      onEarnCoins(30, 'Nhận Năng Lượng Tâm Linh Đầu Ngày (+30 Xu)');
    }
  };

  const handleCopyAffirmation = () => {
    navigator.clipboard.writeText(dailyAffirmation);
    haptics.impact('light');
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const handleOpenShareAffirmation = () => {
    haptics.impact('light');
    setDailyShareAttachment({
      type: 'cosmic_affirmation',
      title: '✨ Thông Điệp Vũ Trụ Hôm Nay',
      subtitle: dailyAffirmation,
      affirmationText: dailyAffirmation,
      aiVerdictExcerpt: `Thông điệp ngày mới mang năng lượng thịnh vượng, an yên và khai mở trực giác: "${dailyAffirmation}"`,
      createdAt: new Date().toISOString()
    });
    setIsShareModalOpen(true);
  };

  const subTabs = [
    {
      id: 'tarot' as const,
      name: 'Bói Bài Tarot',
      badge: '78 Lá & AI',
      icon: Sparkles,
      color: 'from-purple-500 to-indigo-600',
      activeBorder: 'border-purple-400',
      activeGlow: 'bg-purple-600/30 text-purple-200'
    },
    {
      id: 'palmistry' as const,
      name: 'Xem Chỉ Tay',
      badge: 'Tướng Pháp & AI',
      icon: Eye,
      color: 'from-amber-500 to-yellow-600',
      activeBorder: 'border-amber-400',
      activeGlow: 'bg-amber-600/30 text-amber-200'
    },
    {
      id: 'divination' as const,
      name: 'Kinh Dịch & Xin Xăm',
      badge: '64 Quẻ & 100 Xăm',
      icon: Coins,
      color: 'from-red-500 to-amber-600',
      activeBorder: 'border-red-400',
      activeGlow: 'bg-red-600/30 text-red-200'
    },
    {
      id: 'numerology' as const,
      name: 'Thần Số Học',
      badge: 'Pythagoras',
      icon: Hash,
      color: 'from-indigo-500 to-pink-600',
      activeBorder: 'border-indigo-400',
      activeGlow: 'bg-indigo-600/30 text-indigo-200'
    },
    {
      id: 'crystal_oracle' as const,
      name: 'Quả Cầu Pha Lê',
      badge: 'Tiên Tri Vũ Trụ',
      icon: Moon,
      color: 'from-pink-500 to-purple-600',
      activeBorder: 'border-pink-400',
      activeGlow: 'bg-pink-600/30 text-pink-200'
    },
    {
      id: 'couple_spiritual' as const,
      name: 'Tình Duyên Cặp Đôi',
      badge: 'I Love Haevy',
      icon: Heart,
      color: 'from-rose-500 to-pink-600',
      activeBorder: 'border-rose-400',
      activeGlow: 'bg-rose-600/30 text-rose-200'
    },
    {
      id: 'tuvi' as const,
      name: 'Lá Số Tử Vi',
      badge: 'Vận Hạn 2026',
      icon: Compass,
      color: 'from-amber-500 to-orange-600',
      activeBorder: 'border-amber-400',
      activeGlow: 'bg-amber-600/30 text-amber-200'
    },
    {
      id: 'astrology' as const,
      name: 'Chiêm Tinh',
      badge: 'Bản Đồ Sao',
      icon: Sun,
      color: 'from-sky-500 to-indigo-600',
      activeBorder: 'border-sky-400',
      activeGlow: 'bg-sky-600/30 text-sky-200'
    },
    {
      id: 'focus_reader' as const,
      name: 'Đọc Tập Trung',
      badge: 'Zen Reader',
      icon: BookOpen,
      color: 'from-amber-400 to-yellow-600',
      activeBorder: 'border-amber-400',
      activeGlow: 'bg-amber-600/30 text-amber-200'
    },
    {
      id: 'soundscapes' as const,
      name: 'Chuông & Tần Số',
      badge: 'Solfeggio',
      icon: Radio,
      color: 'from-emerald-500 to-teal-600',
      activeBorder: 'border-emerald-400',
      activeGlow: 'bg-emerald-600/30 text-emerald-200'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Daily Cosmic Affirmation & Ambient Bar */}
      <div className="w-full bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-zinc-950/90 border border-purple-500/30 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center shrink-0 shadow-inner">
            <Moon className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-900/50 px-2 py-0.5 rounded-full border border-purple-400/30">
                Thông Điệp Vũ Trụ Hôm Nay
              </span>
              {copiedToast && (
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 animate-fadeIn">
                  <Check size={12} /> Đã sao chép
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
              <p 
                onClick={handleCopyAffirmation}
                className="text-xs sm:text-sm text-zinc-200 font-medium truncate cursor-pointer hover:text-purple-200 transition-colors"
                title="Nhấn để sao chép thông điệp này"
              >
                "{dailyAffirmation}"
              </p>
              <button
                onClick={handleOpenShareAffirmation}
                className="p-1 text-zinc-400 hover:text-purple-300 transition-colors shrink-0"
                title="Chia sẻ thông điệp vũ trụ qua Haevy Message"
              >
                <Share2 size={13} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
          {/* Ambient 528Hz Sound Toggle */}
          <button
            onClick={toggleAmbientHealing}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-md ${
              isAmbientPlaying
                ? 'bg-purple-600 text-white border-purple-400 shadow-purple-500/30 animate-pulse'
                : 'bg-zinc-900/90 hover:bg-zinc-800 text-purple-300 border-purple-500/30'
            }`}
            title="Bật/Tắt âm thanh sóng tần số Solfeggio 528Hz chữa lành nền"
          >
            {isAmbientPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>528Hz Đang Bật</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                <span>Nhạc Thiền 528Hz</span>
              </>
            )}
          </button>

          {/* Claim Daily Coin */}
          <button
            onClick={handleClaimDailyBlessing}
            disabled={dailyClaimed}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer shadow-md ${
              dailyClaimed
                ? 'bg-zinc-900 text-zinc-500 border-zinc-800 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 border-amber-300 shadow-amber-500/20 active:scale-95'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>{dailyClaimed ? 'Đã Nhận +30 Xu' : 'Nhận Lộc +30 Xu'}</span>
          </button>
        </div>
      </div>

      {/* Top Spiritual Ecosystem Navigation Bar */}
      <div className="w-full bg-zinc-950/90 backdrop-blur-xl border border-purple-500/30 p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-2xl flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-2">
          {subTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  haptics.impact('light');
                  setActiveSubTab(tab.id);
                }}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all duration-300 transform active:scale-95 cursor-pointer ${
                  isActive
                    ? `${tab.activeGlow} border ${tab.activeBorder} shadow-lg shadow-purple-900/40`
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse text-purple-300' : ''}`} />
                <span>{tab.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900/80 text-zinc-300 font-semibold border border-zinc-700/60 hidden sm:inline-block">
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden xl:flex items-center gap-2 pr-2 text-xs text-purple-300 font-semibold shrink-0">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Haevy Spiritual Matrix</span>
        </div>
      </div>

      {/* Main View Area */}
      <div className="w-full">
        {activeSubTab === 'tarot' && <HaevyTarotView onEarnCoins={onEarnCoins} onNavigateToMode={onNavigateToMode} />}
        {activeSubTab === 'palmistry' && <HaevyPalmistryView onEarnCoins={onEarnCoins} onNavigateToMode={onNavigateToMode} />}
        {activeSubTab === 'divination' && <HaevyDivinationView onEarnCoins={onEarnCoins} onNavigateToMode={onNavigateToMode} />}
        {activeSubTab === 'numerology' && <HaevyNumerologyView onEarnCoins={onEarnCoins} onNavigateToMode={onNavigateToMode} />}
        {activeSubTab === 'crystal_oracle' && <HaevyCrystalOracleView onEarnCoins={onEarnCoins} onNavigateToMode={onNavigateToMode} />}
        {activeSubTab === 'couple_spiritual' && (
          <HaevyCoupleSpiritualView onEarnCoins={onEarnCoins} onNavigateToMode={onNavigateToMode} />
        )}
        {activeSubTab === 'tuvi' && <HaevyTuViView onEarnCoins={onEarnCoins} onNavigateToMode={onNavigateToMode} />}
        {activeSubTab === 'astrology' && <HaevyAstrologyView onEarnCoins={onEarnCoins} onNavigateToMode={onNavigateToMode} />}
        {activeSubTab === 'focus_reader' && <HaevyFocusReaderView onEarnCoins={onEarnCoins} onNavigateToMode={onNavigateToMode} />}
        {activeSubTab === 'soundscapes' && <HaevySoundscapesView />}
      </div>

      {/* Daily Affirmation Share Modal */}
      <SpiritualShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        attachment={dailyShareAttachment}
        onNavigateToMode={onNavigateToMode}
      />
    </div>
  );
}

