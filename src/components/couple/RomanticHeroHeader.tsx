import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  Gift, 
  Copy, 
  Check, 
  Clock, 
  Award, 
  Palette, 
  Send, 
  Smile, 
  Settings,
  Coffee,
  Flame,
  UserCheck,
  Crown
} from 'lucide-react';
import { CoupleData, CoupleRelationshipType } from '../../types';

export type RomanceThemeKey = 'rose_romance' | 'starlight_galaxy' | 'sunset_amber' | 'sakura_blossom';

export const ROMANCE_THEMES: Record<RomanceThemeKey, {
  name: string;
  icon: string;
  gradientBg: string;
  cardBg: string;
  borderAccent: string;
  primaryGlow: string;
  accentText: string;
  badgeBg: string;
}> = {
  rose_romance: {
    name: 'Hoa Hồng Nhung',
    icon: '🌹',
    gradientBg: 'from-rose-950/70 via-zinc-950 to-zinc-950',
    cardBg: 'bg-gradient-to-br from-rose-950/40 via-zinc-900/90 to-zinc-900/90',
    borderAccent: 'border-rose-500/40 hover:border-rose-500/70',
    primaryGlow: 'from-rose-500 via-pink-500 to-amber-400',
    accentText: 'text-rose-300',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
  },
  starlight_galaxy: {
    name: 'Đêm Sao Tình Nhân',
    icon: '🌌',
    gradientBg: 'from-indigo-950/70 via-zinc-950 to-purple-950/40',
    cardBg: 'bg-gradient-to-br from-indigo-950/40 via-zinc-900/90 to-purple-900/30',
    borderAccent: 'border-indigo-500/40 hover:border-indigo-500/70',
    primaryGlow: 'from-indigo-400 via-purple-400 to-pink-400',
    accentText: 'text-indigo-300',
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
  },
  sunset_amber: {
    name: 'Hoàng Hôn Tình Yêu',
    icon: '🌅',
    gradientBg: 'from-amber-950/70 via-zinc-950 to-rose-950/40',
    cardBg: 'bg-gradient-to-br from-amber-950/40 via-zinc-900/90 to-rose-950/30',
    borderAccent: 'border-amber-500/40 hover:border-amber-500/70',
    primaryGlow: 'from-amber-400 via-orange-500 to-rose-500',
    accentText: 'text-amber-300',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  },
  sakura_blossom: {
    name: 'Anh Đào Mộng Mơ',
    icon: '🌸',
    gradientBg: 'from-pink-950/70 via-zinc-950 to-rose-950/30',
    cardBg: 'bg-gradient-to-br from-pink-950/40 via-zinc-900/90 to-rose-900/30',
    borderAccent: 'border-pink-500/40 hover:border-pink-500/70',
    primaryGlow: 'from-pink-400 via-rose-400 to-red-400',
    accentText: 'text-pink-300',
    badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/40'
  }
};

export const DAILY_LOVE_QUOTES = [
  "“Được ai đó yêu sâu sắc mang lại sức mạnh, yêu ai đó sâu sắc mang lại lòng dũng cảm.”",
  "“Tình yêu không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng.”",
  "“Bên em/anh, mỗi khoảnh khắc bình thường đều trở thành thước phim kỳ diệu nhất cuộc đời.”",
  "“Hạnh phúc lớn nhất là tìm được một người thấu hiểu cả những điều mình chưa từng nói ra.”",
  "“Cảm ơn vì đã luôn là chốn bình yên dịu dàng nhất để trở về sau những giông bão ngoài kia.”"
];

interface RomanticHeroHeaderProps {
  couple: CoupleData;
  userUid?: string;
  theme: RomanceThemeKey;
  onChangeTheme: (theme: RomanceThemeKey) => void;
  onSendLovePing: (type: 'kiss' | 'hug' | 'heartbeat' | 'rose' | 'coffee') => void;
  onOpenSettings: () => void;
  lovePoints: number;
}

export function RomanticHeroHeader({
  couple,
  userUid,
  theme,
  onChangeTheme,
  onSendLovePing,
  onOpenSettings,
  lovePoints
}: RomanticHeroHeaderProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);

  const themeConfig = ROMANCE_THEMES[theme] || ROMANCE_THEMES.rose_romance;
  const isMePartner1 = couple.partner1.uid === userUid;
  const me = isMePartner1 ? couple.partner1 : couple.partner2;
  const myPartner = isMePartner1 ? couple.partner2 : couple.partner1;

  // Relationship info
  const getRelationBadge = (type: CoupleRelationshipType) => {
    switch (type) {
      case 'dating':
        return { label: 'Đang Hẹn Hò 💕', icon: '💖' };
      case 'engaged':
        return { label: 'Đã Đính Hôn 💍', icon: '💍' };
      case 'married':
        return { label: 'Vợ Chồng Son 👰🤵', icon: '👑' };
    }
  };

  const badgeInfo = getRelationBadge(couple.relationshipType);

  // Time Calculation
  const calculateDaysAndDetails = (anniversary: string) => {
    if (!anniversary) return { days: 0, hours: 0, minutes: 0, seconds: 0, years: 0, months: 0 };
    const start = new Date(anniversary).getTime();
    const now = new Date().getTime();
    const diffMs = Math.max(0, now - start);

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);

    return { days, hours, minutes, seconds, years, months };
  };

  const coupleTime = calculateDaysAndDetails(couple.anniversaryDate || '');

  // Next Milestone
  const milestones = [30, 100, 200, 365, 500, 730, 1000, 1500, 2000, 3650, 5000];
  const nextMilestoneDays = milestones.find(m => m > coupleTime.days) || (coupleTime.days + 100);
  const remainingDays = nextMilestoneDays - coupleTime.days;
  const progressPercent = Math.min(100, Math.round((coupleTime.days / nextMilestoneDays) * 100));

  // Sync Level
  const syncPercentage = Math.min(100, 75 + Math.floor((couple.lovePoints || 100) / 20));

  const handleCopyCode = () => {
    if (!couple.pairCode) return;
    navigator.clipboard.writeText(couple.pairCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl ${themeConfig.cardBg} border ${themeConfig.borderAccent} p-3 xs:p-4 sm:p-7 shadow-2xl space-y-3.5 sm:space-y-6 transition-all duration-500`}>
      {/* Background glow orbs */}
      <div className="absolute -right-24 -top-24 w-96 h-96 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar: Badges, Themes & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-white/10 pb-2.5 sm:pb-3.5">
        {/* Badges Row */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className={`px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-full ${themeConfig.badgeBg} text-[10px] sm:text-xs font-extrabold flex items-center gap-1 shadow-sm shrink-0 whitespace-nowrap`}>
            <span>{badgeInfo.icon}</span>
            <span>{badgeInfo.label}</span>
          </span>

          <span className="px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] sm:text-xs font-extrabold flex items-center gap-1 shadow-sm shrink-0 whitespace-nowrap">
            <Crown size={12} className="text-amber-400" fill="currentColor" />
            <span>I Love Haevy VIP</span>
          </span>

          <span className="px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-full bg-zinc-950/80 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-extrabold flex items-center gap-1 shadow-sm shrink-0 whitespace-nowrap">
            <Gift size={12} className="text-amber-400" />
            <span>{lovePoints} Điểm</span>
          </span>

          {/* Sync Percentage Badge */}
          <span className="px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-full bg-zinc-950/80 border border-rose-500/30 text-rose-300 text-[10px] sm:text-xs font-extrabold flex items-center gap-1 shadow-sm shrink-0 whitespace-nowrap">
            <Sparkles size={12} className="text-rose-400 animate-spin" />
            <span>{syncPercentage}% Đồng Điệu</span>
          </span>
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 shrink-0 w-full sm:w-auto">
          {/* Theme Selector Dropdown / Buttons */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-zinc-950/90 border border-zinc-800 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl">
            {(Object.keys(ROMANCE_THEMES) as RomanceThemeKey[]).map(key => (
              <button
                key={key}
                onClick={() => onChangeTheme(key)}
                className={`p-1 xs:p-1.5 sm:px-2 sm:py-1 rounded-lg sm:rounded-xl text-xs transition-all cursor-pointer ${
                  theme === key ? 'bg-white/20 shadow-sm scale-105' : 'opacity-60 hover:opacity-100'
                }`}
                title={ROMANCE_THEMES[key].name}
              >
                <span>{ROMANCE_THEMES[key].icon}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Pair Code Copy */}
            <div className="flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[10px] sm:text-xs text-zinc-300">
              <span className="text-zinc-500 font-medium hidden xs:inline">Mã:</span>
              <span className="font-mono font-bold text-rose-300">{couple.pairCode}</span>
              <button 
                onClick={handleCopyCode}
                className="text-zinc-400 hover:text-white p-0.5 ml-0.5 cursor-pointer"
                title="Sao chép mã ghép đôi"
              >
                {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            </div>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-1 sm:p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer shrink-0"
              title="Cài đặt không gian đôi"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Center Hero: Dual Avatars & Interactive Digital Live Clock */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3.5 sm:gap-6">
        {/* Avatars with Connected Ring */}
        <div className="flex items-center justify-center gap-2 xs:gap-3 sm:gap-6 w-full lg:w-auto py-0.5 sm:py-1">
          {/* Me Avatar */}
          <div className="text-center space-y-0.5 sm:space-y-1 group shrink-0 min-w-[65px] xs:min-w-[75px] sm:min-w-[90px]">
            <div className="relative w-12 h-12 xs:w-14 xs:h-14 sm:w-20 sm:h-20 rounded-full ring-2 sm:ring-4 ring-rose-500/50 bg-zinc-800 overflow-hidden shadow-2xl mx-auto flex items-center justify-center group-hover:scale-105 transition-all">
              {me?.photoURL ? (
                <img src={me.photoURL} alt={me.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg xs:text-xl sm:text-3xl font-black text-rose-300">{me?.name?.charAt(0) || 'B'}</span>
              )}
            </div>
            <div className="text-[11px] xs:text-xs sm:text-sm font-extrabold text-white truncate max-w-[70px] xs:max-w-[85px] sm:max-w-[110px] mx-auto">{me?.nickname || me?.name}</div>
            <div className="text-[9px] xs:text-[10px] sm:text-[11px] text-zinc-400 font-mono truncate max-w-[70px] xs:max-w-[85px] sm:max-w-[110px] mx-auto">({me?.accountId})</div>
          </div>

          {/* Beating Heart Bridge */}
          <div className="flex flex-col items-center justify-center px-0.5 shrink-0">
            <div className="relative">
              <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-rose-500/30 to-pink-500/30 border border-rose-500/50 flex items-center justify-center text-rose-400 shadow-xl">
                <Heart size={15} className="fill-rose-500 animate-pulse text-rose-500 sm:w-[22px] sm:h-[22px]" />
              </div>
              <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-20 pointer-events-none" />
            </div>
            <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-black text-rose-300 uppercase tracking-widest mt-0.5 sm:mt-1">Trọn Đời</span>
          </div>

          {/* Partner Avatar */}
          <div className="text-center space-y-0.5 sm:space-y-1 group shrink-0 min-w-[65px] xs:min-w-[75px] sm:min-w-[90px]">
            <div className="relative w-12 h-12 xs:w-14 xs:h-14 sm:w-20 sm:h-20 rounded-full ring-2 sm:ring-4 ring-pink-500/50 bg-zinc-800 overflow-hidden shadow-2xl mx-auto flex items-center justify-center group-hover:scale-105 transition-all">
              {myPartner?.photoURL ? (
                <img src={myPartner.photoURL} alt={myPartner.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg xs:text-xl sm:text-3xl font-black text-pink-300">{myPartner?.name?.charAt(0) || 'N'}</span>
              )}
            </div>
            <div className="text-[11px] xs:text-xs sm:text-sm font-extrabold text-white truncate max-w-[70px] xs:max-w-[85px] sm:max-w-[110px] mx-auto">{myPartner?.nickname || myPartner?.name || 'Chờ kết nối'}</div>
            <div className="text-[9px] xs:text-[10px] sm:text-[11px] text-zinc-400 font-mono truncate max-w-[70px] xs:max-w-[85px] sm:max-w-[110px] mx-auto">({myPartner?.accountId || 'Chưa liên kết'})</div>
          </div>
        </div>

        {/* Digital Segmented Flip-style Live Clock */}
        <div className="w-full lg:w-auto p-2.5 xs:p-3 sm:p-5 rounded-xl sm:rounded-3xl bg-zinc-950/85 border border-white/10 backdrop-blur-md shadow-2xl space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between text-[10px] xs:text-[11px] sm:text-xs text-zinc-400 font-bold px-1 gap-2">
            <span className="truncate">{couple.coupleTitle || 'Tình Yêu Chúng Mình'}</span>
            <span className="text-rose-400 shrink-0">📅 {couple.anniversaryDate}</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 xs:gap-1.5 sm:gap-2 text-center">
            {coupleTime.years > 0 ? (
              <div className="p-1.5 xs:p-2 sm:p-2.5 rounded-lg sm:rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="text-base xs:text-xl sm:text-3xl font-black text-white">{coupleTime.years}</div>
                <div className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase">Năm</div>
              </div>
            ) : (
              <div className="p-1.5 xs:p-2 sm:p-2.5 rounded-lg sm:rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="text-base xs:text-xl sm:text-3xl font-black text-white">0</div>
                <div className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase">Năm</div>
              </div>
            )}
            {coupleTime.months > 0 ? (
              <div className="p-1.5 xs:p-2 sm:p-2.5 rounded-lg sm:rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="text-base xs:text-xl sm:text-3xl font-black text-white">{coupleTime.months}</div>
                <div className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase">Tháng</div>
              </div>
            ) : (
              <div className="p-1.5 xs:p-2 sm:p-2.5 rounded-lg sm:rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="text-base xs:text-xl sm:text-3xl font-black text-white">0</div>
                <div className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase">Tháng</div>
              </div>
            )}
            <div className="p-1.5 xs:p-2 sm:p-2.5 rounded-lg sm:rounded-2xl bg-gradient-to-b from-rose-950/60 to-zinc-900 border border-rose-500/40">
              <div className="text-base xs:text-xl sm:text-3xl font-black bg-gradient-to-r from-rose-300 via-pink-300 to-amber-300 bg-clip-text text-transparent">
                {coupleTime.days}
              </div>
              <div className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-rose-300 uppercase">Ngày</div>
            </div>
            <div className="p-1.5 xs:p-2 sm:p-2.5 rounded-lg sm:rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="text-base xs:text-xl sm:text-3xl font-black text-white font-mono">{coupleTime.hours.toString().padStart(2, '0')}</div>
              <div className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase">Giờ</div>
            </div>
            <div className="p-1.5 xs:p-2 sm:p-2.5 rounded-lg sm:rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="text-base xs:text-xl sm:text-3xl font-black text-white font-mono">{coupleTime.minutes.toString().padStart(2, '0')}</div>
              <div className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase">Phút</div>
            </div>
            <div className="p-1.5 xs:p-2 sm:p-2.5 rounded-lg sm:rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="text-base xs:text-xl sm:text-3xl font-black text-rose-400 font-mono animate-pulse">{coupleTime.seconds.toString().padStart(2, '0')}</div>
              <div className="text-[8px] xs:text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase">Giây</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Love Pings Reaction Bar */}
      <div className="p-2 xs:p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-950/70 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="text-[11px] sm:text-xs font-extrabold text-zinc-300 flex items-center gap-1.5 shrink-0">
          <Flame size={14} className="text-rose-400 animate-bounce" />
          <span>Gửi cử chỉ yêu thương tức thì:</span>
        </div>

        {/* 5 Quick Action Buttons in Responsive Grid / Flex */}
        <div className="grid grid-cols-5 gap-1 xs:gap-1.5 sm:flex sm:flex-wrap sm:gap-2 w-full sm:w-auto">
          <button
            onClick={() => onSendLovePing('kiss')}
            className="p-1.5 xs:p-2 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/30 text-rose-300 font-extrabold text-[9px] xs:text-[10px] sm:text-xs flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 cursor-pointer active:scale-95 transition-all text-center"
            title="Gửi Nụ Hôn"
          >
            <span className="text-xs sm:text-base">💋</span>
            <span className="truncate">Hôn</span>
          </button>
          <button
            onClick={() => onSendLovePing('hug')}
            className="p-1.5 xs:p-2 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-pink-500/20 hover:bg-pink-500/40 border border-pink-500/30 text-pink-300 font-extrabold text-[9px] xs:text-[10px] sm:text-xs flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 cursor-pointer active:scale-95 transition-all text-center"
            title="Gửi Cái Ôm"
          >
            <span className="text-xs sm:text-base">🫂</span>
            <span className="truncate">Ôm</span>
          </button>
          <button
            onClick={() => onSendLovePing('heartbeat')}
            className="p-1.5 xs:p-2 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-300 font-extrabold text-[9px] xs:text-[10px] sm:text-xs flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 cursor-pointer active:scale-95 transition-all text-center"
            title="Bắn Tim"
          >
            <span className="text-xs sm:text-base">💖</span>
            <span className="truncate">Bắn Tim</span>
          </button>
          <button
            onClick={() => onSendLovePing('rose')}
            className="p-1.5 xs:p-2 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/30 text-amber-300 font-extrabold text-[9px] xs:text-[10px] sm:text-xs flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 cursor-pointer active:scale-95 transition-all text-center"
            title="Tặng Hoa"
          >
            <span className="text-xs sm:text-base">🌹</span>
            <span className="truncate">Tặng Hoa</span>
          </button>
          <button
            onClick={() => onSendLovePing('coffee')}
            className="p-1.5 xs:p-2 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-amber-800/30 hover:bg-amber-800/50 border border-amber-600/30 text-amber-200 font-extrabold text-[9px] xs:text-[10px] sm:text-xs flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 cursor-pointer active:scale-95 transition-all text-center"
            title="Nhắc Uống Nước"
          >
            <span className="text-xs sm:text-base">☕</span>
            <span className="truncate">Nhắc Nước</span>
          </button>
        </div>
      </div>

      {/* Daily Love Quote & Milestone Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4 pt-0.5">
        {/* Quote */}
        <div 
          onClick={() => setQuoteIdx((quoteIdx + 1) % DAILY_LOVE_QUOTES.length)}
          className="p-2.5 xs:p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-950/60 border border-zinc-800 hover:border-rose-500/30 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-rose-300 mb-1">
            <span className="flex items-center gap-1">💌 Lời thì thầm hôm nay</span>
            <span className="text-zinc-500 hover:text-zinc-300 text-[9px] sm:text-[10px]">Đổi lời chúc ↻</span>
          </div>
          <p className="text-[11px] sm:text-xs text-zinc-300 italic leading-relaxed">
            {DAILY_LOVE_QUOTES[quoteIdx]}
          </p>
        </div>

        {/* Milestone */}
        <div className="p-2.5 xs:p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-[11px] sm:text-xs">
            <span className="text-zinc-300 font-bold flex items-center gap-1.5">
              <Award size={14} className="text-amber-400" />
              <span>Cột mốc: <strong className="text-white">{nextMilestoneDays} Ngày</strong></span>
            </span>
            <span className="text-rose-300 font-bold text-[10px] sm:text-xs">Còn {remainingDays} ngày</span>
          </div>
          <div className="w-full h-2 sm:h-2.5 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
            <div 
              className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
