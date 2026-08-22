import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  Calendar, 
  Flame, 
  Award, 
  Clock, 
  Crown, 
  PartyPopper, 
  Copy, 
  Check, 
  Zap,
  Star
} from 'lucide-react';
import { CoupleData, CoupleRelationshipType } from '../../types';
import { RomanceThemeKey, ROMANCE_THEMES } from './RomanticHeroHeader';

interface AnniversaryDaysWidgetProps {
  couple: CoupleData;
  userUid?: string;
  theme?: RomanceThemeKey;
  onOpenSettings?: () => void;
  lovePoints?: number;
}

export function AnniversaryDaysWidget({
  couple,
  userUid,
  theme = 'rose_romance',
  onOpenSettings,
  lovePoints = 100
}: AnniversaryDaysWidgetProps) {
  const [displayMode, setDisplayMode] = useState<'days' | 'detailed' | 'milestone'>('days');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCopied, setIsCopied] = useState(false);

  // Live timer interval to update seconds seamlessly
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const themeConfig = ROMANCE_THEMES[theme] || ROMANCE_THEMES.rose_romance;
  const isMePartner1 = couple.partner1.uid === userUid;
  const me = isMePartner1 ? couple.partner1 : couple.partner2;
  const myPartner = isMePartner1 ? couple.partner2 : couple.partner1;

  // Calculate detailed date & time
  const calculateDuration = (anniversaryStr: string) => {
    if (!anniversaryStr) {
      return { totalDays: 0, years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const start = new Date(anniversaryStr).getTime();
    const now = currentTime.getTime();
    const diffMs = Math.max(0, now - start);

    const totalSeconds = Math.floor(diffMs / 1000);
    const totalDays = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = (totalDays % 365) % 30;

    return { totalDays, years, months, days, hours, minutes, seconds };
  };

  const duration = calculateDuration(couple.anniversaryDate || '');

  // Next Milestones
  const milestoneList = [30, 100, 200, 365, 500, 730, 1000, 1500, 2000, 2500, 3000, 3650, 5000];
  const nextMilestone = milestoneList.find(m => m > duration.totalDays) || (duration.totalDays + 100);
  const remainingDaysToMilestone = nextMilestone - duration.totalDays;
  const progressPercent = Math.min(100, Math.max(0, Math.round((duration.totalDays / nextMilestone) * 100)));

  // Title depending on relationship type
  const getWidgetTitle = (type: CoupleRelationshipType) => {
    switch (type) {
      case 'dating':
        return { main: 'Bên Nhau', sub: 'Ngày Yêu Nhau Say Đắm', icon: '💖' };
      case 'engaged':
        return { main: 'Hành Trình Đính Hôn', sub: 'Ngày Hứa Hẹn Chung Đôi', icon: '💍' };
      case 'married':
        return { main: 'Hôn Nhân Hạnh Phúc', sub: 'Ngày Cưới Ngọt Ngào', icon: '👑' };
    }
  };

  const titleInfo = getWidgetTitle(couple.relationshipType);

  // Personalized love badge message
  const getLoveStageMessage = (days: number) => {
    if (days < 30) return 'Những ngày khởi đầu ngọt ngào như mật ngọt';
    if (days < 100) return 'Tình yêu bùng cháy từng khoảnh khắc diệu kỳ';
    if (days < 365) return 'Cùng nhau vượt qua 4 mùa yêu thương tròn đầy';
    if (days < 730) return 'Hơn 1 năm đồng hành, thấu hiểu và gắn kết bền chặt';
    if (days < 1000) return 'Trăm năm một chữ duyên, ngàn ngày một tình yêu son sắt';
    return 'Tình yêu vàng son thử thách qua thời gian vĩnh cửu';
  };

  const handleCopyLoveSummary = () => {
    const text = `💕 ${couple.coupleTitle || 'Tình Yêu Chúng Mình'} • Đã bên nhau ${duration.totalDays} ngày (${duration.years} năm ${duration.months} tháng) từ ngày ${couple.anniversaryDate}. Cùng nhau mãi mãi! 💖`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl ${themeConfig.cardBg} border ${themeConfig.borderAccent} shadow-2xl p-4 sm:p-6 transition-all duration-300`}
    >
      {/* Background Animated Atmosphere */}
      <div className="absolute -right-20 -top-20 w-72 h-72 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Mini Hearts Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [-10, -50, -10],
            opacity: [0.2, 0.6, 0.2],
            scale: [0.8, 1.1, 0.8]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-1/4 left-8 text-rose-400/30 text-sm select-none"
        >
          💖
        </motion.div>
        <motion.div
          animate={{
            y: [-5, -40, -5],
            opacity: [0.15, 0.5, 0.15],
            scale: [0.9, 1.2, 0.9]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.5
          }}
          className="absolute top-1/3 right-12 text-pink-400/30 text-base select-none"
        >
          ✨
        </motion.div>
      </div>

      {/* Top Controls Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3.5 sm:mb-5">
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30"
          >
            <Heart size={16} className="fill-white" />
          </motion.div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs sm:text-sm font-black text-white tracking-wide flex items-center gap-1">
                <span>{couple.coupleTitle || 'Không Gian Đôi'}</span>
                <span className="text-xs">{titleInfo.icon}</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] sm:text-[10px] font-extrabold">
                {titleInfo.sub}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-400 font-medium">
              Ngày bắt đầu: <span className="font-mono text-rose-300 font-bold">{couple.anniversaryDate || 'Chưa đặt'}</span>
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-zinc-950/80 border border-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setDisplayMode('days')}
            className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
              displayMode === 'days'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Số Ngày
          </button>
          <button
            onClick={() => setDisplayMode('detailed')}
            className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
              displayMode === 'detailed'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Chi Tiết
          </button>
          <button
            onClick={() => setDisplayMode('milestone')}
            className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
              displayMode === 'milestone'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Cột Mốc
          </button>
          <button
            onClick={handleCopyLoveSummary}
            className="p-1 rounded-lg text-zinc-400 hover:text-rose-300 transition-colors ml-0.5 cursor-pointer"
            title="Sao chép tóm tắt ngày yêu"
          >
            {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Main Interactive Animated Content */}
      <AnimatePresence mode="wait">
        {displayMode === 'days' && (
          <motion.div
            key="days-view"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center"
          >
            {/* Left Big Prominent Days Counter with Heartbeat */}
            <div className="md:col-span-6 p-4 sm:p-5 rounded-2xl bg-zinc-950/85 border border-rose-500/30 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-rose-300/90 mb-1 flex items-center gap-1.5">
                <Flame size={13} className="text-rose-400 animate-bounce" />
                <span>Tổng Thời Gian Bên Nhau</span>
              </div>

              {/* Big Animated Digit */}
              <motion.div
                key={duration.totalDays}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="my-1"
              >
                <span className="text-4xl xs:text-5xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-rose-300 via-pink-400 to-amber-300 bg-clip-text text-transparent drop-shadow-md">
                  {duration.totalDays}
                </span>
                <span className="text-base sm:text-xl font-bold text-rose-300 ml-1.5">NGÀY</span>
              </motion.div>

              {/* Real-time live seconds pulse */}
              <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-zinc-400 font-mono mt-1 bg-zinc-900/90 px-3 py-1 rounded-full border border-zinc-800">
                <Clock size={11} className="text-rose-400 animate-spin" />
                <span>{duration.hours.toString().padStart(2, '0')}:{duration.minutes.toString().padStart(2, '0')}:{duration.seconds.toString().padStart(2, '0')}</span>
                <span className="text-rose-400/80 font-bold ml-1">• Trực tiếp</span>
              </div>

              <p className="text-[10px] sm:text-xs text-zinc-400 italic mt-2.5 max-w-xs">
                "{getLoveStageMessage(duration.totalDays)}"
              </p>
            </div>

            {/* Right Quick Breakdown & Partner Avatars */}
            <div className="md:col-span-6 space-y-2.5">
              {/* Partner Quick Glance */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-zinc-950/70 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full ring-2 ring-rose-500/60 bg-zinc-800 overflow-hidden flex items-center justify-center font-bold text-rose-300 text-sm">
                      {me?.photoURL ? (
                        <img src={me.photoURL} alt={me.name} className="w-full h-full object-cover" />
                      ) : (
                        me?.name?.charAt(0) || 'B'
                      )}
                    </div>
                  </div>

                  <motion.div
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="text-rose-400"
                  >
                    <Heart size={16} className="fill-rose-500 text-rose-500" />
                  </motion.div>

                  <div className="relative">
                    <div className="w-10 h-10 rounded-full ring-2 ring-pink-500/60 bg-zinc-800 overflow-hidden flex items-center justify-center font-bold text-pink-300 text-sm">
                      {myPartner?.photoURL ? (
                        <img src={myPartner.photoURL} alt={myPartner.name} className="w-full h-full object-cover" />
                      ) : (
                        myPartner?.name?.charAt(0) || 'N'
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 ml-1">
                    <div className="text-xs font-bold text-white truncate">
                      {me?.nickname || me?.name} & {myPartner?.nickname || myPartner?.name || 'Người ấy'}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      Tương thích: <strong className="text-amber-300">{lovePoints} Điểm Tình Cảm</strong>
                    </div>
                  </div>
                </div>

                {onOpenSettings && (
                  <button
                    onClick={onOpenSettings}
                    className="text-[10px] sm:text-xs font-bold text-rose-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer shrink-0"
                  >
                    Đổi ngày
                  </button>
                )}
              </div>

              {/* 3 Micro Stats: Years, Months, Next Target */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-white/5 text-center">
                  <div className="text-sm sm:text-lg font-black text-white">{duration.years}</div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase">Năm</div>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-white/5 text-center">
                  <div className="text-sm sm:text-lg font-black text-white">{duration.months}</div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase">Tháng</div>
                </div>
                <div className="p-2.5 rounded-xl bg-gradient-to-b from-rose-950/40 to-zinc-950 border border-rose-500/30 text-center">
                  <div className="text-sm sm:text-lg font-black text-rose-300">{remainingDaysToMilestone}</div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-rose-400 uppercase">Ngày tới mốc</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {displayMode === 'detailed' && (
          <motion.div
            key="detailed-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 sm:gap-2 text-center">
              <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="text-lg sm:text-2xl font-black text-white">{duration.years}</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase">Năm</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="text-lg sm:text-2xl font-black text-white">{duration.months}</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase">Tháng</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="text-lg sm:text-2xl font-black text-white">{duration.days}</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase">Ngày lẻ</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="text-lg sm:text-2xl font-black text-white font-mono">{duration.hours.toString().padStart(2, '0')}</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase">Giờ</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="text-lg sm:text-2xl font-black text-white font-mono">{duration.minutes.toString().padStart(2, '0')}</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase">Phút</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-b from-rose-950/60 to-zinc-950 border border-rose-500/40">
                <div className="text-lg sm:text-2xl font-black text-rose-400 font-mono animate-pulse">{duration.seconds.toString().padStart(2, '0')}</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-rose-300 uppercase">Giây</div>
              </div>
              <div className="col-span-2 sm:col-span-4 md:col-span-1 p-2.5 sm:p-3 rounded-xl bg-zinc-900 border border-amber-500/30">
                <div className="text-lg sm:text-2xl font-black text-amber-300">{duration.totalDays}</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-amber-400 uppercase">Tổng Ngày</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-rose-400" />
                <span>Mỗi giây phút bên nhau đều là kỷ niệm vô giá ghi dấu vào hành trình đôi</span>
              </span>
              <span className="font-mono text-rose-300 font-bold hidden sm:inline">∞ Yêu Thương</span>
            </div>
          </motion.div>
        )}

        {displayMode === 'milestone' && (
          <motion.div
            key="milestone-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white font-bold flex items-center gap-1.5">
                  <Award size={15} className="text-amber-400" />
                  <span>Cột mốc kế tiếp: <strong className="text-rose-300 font-mono">{nextMilestone} Ngày</strong></span>
                </span>
                <span className="text-rose-300 font-bold text-[11px] sm:text-xs">
                  Còn {remainingDaysToMilestone} ngày nữa 🎉
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full h-3 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 rounded-full relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </motion.div>
              </div>

              <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400">
                <span>Hiện tại: {duration.totalDays} ngày ({progressPercent}%)</span>
                <span>Mốc đích: {nextMilestone} ngày</span>
              </div>
            </div>

            {/* Previous and Next Milestone Badges */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-zinc-950/70 border border-zinc-800 text-zinc-400">
                <div className="text-[10px] text-zinc-500">Mốc đã qua</div>
                <div className="font-bold text-white">
                  {milestoneList.filter(m => m <= duration.totalDays).pop() || 0} Ngày ✨
                </div>
              </div>
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
                <div className="text-[10px] text-rose-400">Mục tiêu tới</div>
                <div className="font-bold">{nextMilestone} Ngày 🎯</div>
              </div>
              <div className="p-2 rounded-xl bg-zinc-950/70 border border-zinc-800 text-zinc-400">
                <div className="text-[10px] text-zinc-500">Mốc hoàng kim</div>
                <div className="font-bold text-amber-300">1000 Ngày 👑</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
