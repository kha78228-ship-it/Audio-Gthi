import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Heart, 
  Coins, 
  X, 
  Volume2, 
  VolumeX, 
  Music, 
  Flame, 
  Crown, 
  CheckCircle2,
  Send,
  MessageSquare
} from 'lucide-react';
import { useGiftEffect } from '../../context/GiftEffectContext';

export function HaevyGiftCelebrationOverlay() {
  const { activeEffect, dismissGiftEffect, isSoundEnabled, toggleSound } = useGiftEffect();

  // Color palettes and configurations based on rarity
  const rarityConfig = useMemo(() => {
    if (!activeEffect) return null;
    const rarity = activeEffect.rarity || 'common';

    switch (rarity) {
      case 'legendary':
        return {
          title: 'QUÀ TẶNG HUYỀN THOẠI',
          glowGradient: 'radial-gradient(circle at center, rgba(245, 158, 11, 0.45) 0%, rgba(217, 119, 6, 0.2) 45%, transparent 75%)',
          borderRing: 'border-amber-400',
          badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950',
          textColor: 'text-amber-300',
          accentHex: '#f59e0b',
          burstParticles: ['👑', '⭐', '✨', '💎', '🔥', '🪙', '✨', '⭐', '🚀', '🌟']
        };
      case 'epic':
        return {
          title: 'QUÀ TẶNG SỬ THI',
          glowGradient: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.45) 0%, rgba(217, 70, 239, 0.2) 45%, transparent 75%)',
          borderRing: 'border-purple-400',
          badgeBg: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
          textColor: 'text-purple-300',
          accentHex: '#a855f7',
          burstParticles: ['🎙️', '🏆', '🎵', '🎶', '✨', '💜', '🌟', '🎸', '✨', '🔥']
        };
      case 'rare':
        return {
          title: 'QUÀ TẶNG CAO CẤP',
          glowGradient: 'radial-gradient(circle at center, rgba(14, 165, 233, 0.4) 0%, rgba(59, 130, 246, 0.18) 45%, transparent 75%)',
          borderRing: 'border-sky-400',
          badgeBg: 'bg-gradient-to-r from-sky-500 to-blue-500 text-white',
          textColor: 'text-sky-300',
          accentHex: '#0ea5e9',
          burstParticles: ['🎧', '🎸', '🎵', '💫', '✨', '💎', '🌊', '🌟', '🎶', '⚡']
        };
      case 'common':
      default:
        return {
          title: 'QUÀ TẶNG TRI ÂN',
          glowGradient: 'radial-gradient(circle at center, rgba(236, 72, 153, 0.35) 0%, rgba(244, 63, 94, 0.15) 45%, transparent 75%)',
          borderRing: 'border-rose-400/80',
          badgeBg: 'bg-gradient-to-r from-rose-500 to-amber-500 text-white',
          textColor: 'text-rose-300',
          accentHex: '#ec4899',
          burstParticles: ['🌹', '☕', '💖', '✨', '🌸', '✨', '🌷', '❤️', '🌟', '☕']
        };
    }
  }, [activeEffect]);

  // Deterministic 20 particle angles & distances
  const particles = useMemo(() => {
    if (!activeEffect || !rarityConfig) return [];
    return Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * 360) / 24;
      const rad = (angle * Math.PI) / 180;
      const distance = 140 + (i % 4) * 60; // 140 to 320px
      const x = Math.cos(rad) * distance;
      const y = Math.sin(rad) * distance;
      const emoji = rarityConfig.burstParticles[i % rarityConfig.burstParticles.length];
      const scale = 0.7 + (i % 3) * 0.35;
      const delay = 0.05 + (i % 5) * 0.04;
      return { id: i, x, y, emoji, scale, delay, angle };
    });
  }, [activeEffect, rarityConfig]);

  if (!activeEffect || !rarityConfig) return null;

  const combo = activeEffect.comboCount || 1;

  return (
    <AnimatePresence>
      <div 
        id="haevy-gift-celebration-overlay"
        className="fixed inset-0 z-[9999] pointer-events-none flex flex-col items-center justify-between p-4 sm:p-6 select-none overflow-hidden"
      >
        {/* Ambient Dark Dim & Radial Glow Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={dismissGiftEffect}
          className="absolute inset-0 bg-black/60 backdrop-blur-[6px] pointer-events-auto cursor-pointer"
          style={{ background: rarityConfig.glowGradient }}
        />

        {/* TOP: Floating Superchat / VIP Banner */}
        <motion.div
          initial={{ y: -80, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -60, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative z-10 w-full max-w-xl pointer-events-auto mt-2 sm:mt-6"
        >
          <div 
            className="rounded-3xl border shadow-2xl p-4 sm:p-5 backdrop-blur-2xl transition-all relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.88) 100%)',
              borderColor: `${rarityConfig.accentHex}66`,
              boxShadow: `0 20px 40px -10px rgba(0,0,0,0.8), 0 0 35px ${rarityConfig.accentHex}40`
            }}
          >
            {/* Top Light Ray Sheen */}
            <div className="absolute -top-24 -left-10 w-60 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${rarityConfig.badgeBg} shadow-sm`}>
                  {rarityConfig.title}
                </span>
                {activeEffect.pointsCost && (
                  <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    <Coins size={12} className="text-amber-400" />
                    {activeEffect.pointsCost.toLocaleString()} Xu / Điểm
                  </span>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleSound}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 transition-colors"
                  title={isSoundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
                >
                  {isSoundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                </button>
                <button
                  type="button"
                  onClick={dismissGiftEffect}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 transition-colors"
                  title="Đóng hiệu ứng"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Donor & Recipient Flow */}
            <div className="flex items-center justify-between gap-2.5 py-1">
              {/* Donor */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-sm shrink-0 shadow-md">
                  {activeEffect.senderAvatar ? (
                    <img src={activeEffect.senderAvatar} alt="Sender" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    activeEffect.senderName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-100 block truncate">
                    {activeEffect.senderName}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Người gửi tặng
                  </span>
                </div>
              </div>

              {/* Connecting Pulse Arrow */}
              <div className="flex flex-col items-center justify-center px-2 shrink-0">
                <motion.div 
                  animate={{ scale: [1, 1.25, 1], x: [0, 4, 0] }} 
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="text-amber-400 font-bold text-lg"
                >
                  ➔
                </motion.div>
                <span className="text-[9px] text-amber-300/80 font-bold uppercase tracking-wider">
                  Tặng Quà
                </span>
              </div>

              {/* Recipient Author */}
              <div className="flex items-center gap-2.5 min-w-0 text-right justify-end">
                <div className="min-w-0">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-xs font-bold text-white block truncate">
                      {activeEffect.recipientName}
                    </span>
                    <CheckCircle2 size={12} className="text-sky-400 shrink-0" />
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Nghệ sĩ / Tác giả
                  </span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md">
                  {activeEffect.recipientName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            {/* Track Info if available */}
            {activeEffect.trackTitle && (
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-300">
                <Music size={13} className="text-amber-400 shrink-0" />
                <span className="truncate">Tác phẩm: <strong className="text-white">{activeEffect.trackTitle}</strong></span>
              </div>
            )}

            {/* Attached heartfelt message */}
            {activeEffect.message && (
              <div className="mt-2.5 px-3 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/60 flex items-start gap-2 text-xs text-slate-200 shadow-inner">
                <MessageSquare size={13} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="italic text-[11px] sm:text-xs leading-relaxed">
                  "{activeEffect.message}"
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* CENTER: HERO ANIMATED GIFT ICON & SURROUNDING PARTICLES */}
        <div className="relative flex flex-col items-center justify-center my-auto pointer-events-none">
          {/* Rotating Sunburst Light Rays */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, ease: 'linear', duration: 16 }}
            className="absolute -inset-48 sm:-inset-64 opacity-40 pointer-events-none"
          >
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <defs>
                <radialGradient id="sunburstGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={rarityConfig.accentHex} stopOpacity="0.8" />
                  <stop offset="60%" stopColor={rarityConfig.accentHex} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={rarityConfig.accentHex} stopOpacity="0" />
                </radialGradient>
              </defs>
              <g fill="url(#sunburstGrad)">
                {Array.from({ length: 16 }).map((_, idx) => {
                  const deg = idx * (360 / 16);
                  return (
                    <polygon
                      key={idx}
                      points="200,200 185,0 215,0"
                      transform={`rotate(${deg} 200 200)`}
                    />
                  );
                })}
              </g>
            </svg>
          </motion.div>

          {/* Shockwave expanding ring */}
          <motion.div
            initial={{ scale: 0.3, opacity: 1 }}
            animate={{ scale: [0.5, 2.6], opacity: [0.9, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            className="absolute w-44 h-44 rounded-full border-2 border-dashed pointer-events-none"
            style={{ borderColor: rarityConfig.accentHex }}
          />

          {/* Radiating exploding particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
              animate={{
                x: p.x,
                y: p.y,
                scale: [0, p.scale * 1.3, p.scale],
                opacity: [0, 1, 0.85, 0],
                rotate: [0, p.angle]
              }}
              transition={{
                duration: 2.2,
                delay: p.delay,
                repeat: Infinity,
                repeatDelay: 0.6,
                ease: 'easeOut'
              }}
              className="absolute text-xl sm:text-2xl drop-shadow-lg select-none"
            >
              {p.emoji}
            </motion.div>
          ))}

          {/* Central Hero Emoji with Spring Bounce & Floating Bob */}
          <motion.div
            initial={{ scale: 0, rotate: -25, y: 80 }}
            animate={{ 
              scale: [0, 1.4, 0.95, 1],
              rotate: [-25, 12, -4, 0],
              y: [80, -20, 5, 0]
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 18,
              duration: 0.8
            }}
            className="relative z-20 flex flex-col items-center"
          >
            {/* Floating Bob */}
            <motion.div
              animate={{ y: [0, -14, 0], rotate: [0, 3, -3, 0] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
              className="relative p-6 sm:p-8 rounded-full flex items-center justify-center"
            >
              {/* Giant Glowing Halo */}
              <div 
                className="absolute inset-0 rounded-full blur-3xl opacity-70 animate-pulse"
                style={{ backgroundColor: rarityConfig.accentHex }}
              />

              <span className="text-8xl sm:text-9xl filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] select-none cursor-pointer transform hover:scale-110 transition-transform">
                {activeEffect.giftEmoji}
              </span>
            </motion.div>

            {/* Gift Title Pill */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-1 px-5 py-2 rounded-full backdrop-blur-xl border shadow-xl flex items-center gap-2"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                borderColor: rarityConfig.accentHex
              }}
            >
              <Sparkles size={16} style={{ color: rarityConfig.accentHex }} />
              <span className="text-sm sm:text-base font-black tracking-wide text-white uppercase">
                {activeEffect.giftName}
              </span>
              <Sparkles size={16} style={{ color: rarityConfig.accentHex }} />
            </motion.div>
          </motion.div>

          {/* COMBO MULTIPLIER STREAK BADGE */}
          {combo > 1 && (
            <motion.div
              initial={{ scale: 0, rotate: -20, y: 20 }}
              animate={{ 
                scale: [0, 1.5, 1],
                rotate: [-20, 15, -8],
                y: [20, -10, 0]
              }}
              transition={{ type: 'spring', stiffness: 450, damping: 14 }}
              className="absolute -right-8 sm:-right-16 top-1/4 z-30 pointer-events-none"
            >
              <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-orange-500 text-white font-black text-xl sm:text-3xl shadow-2xl border-2 border-yellow-300 flex items-center gap-1 transform rotate-6 animate-pulse">
                <Flame size={24} className="text-yellow-200 fill-yellow-300 animate-bounce" />
                <span>x{combo}</span>
                <span className="text-xs uppercase tracking-tighter ml-0.5 text-yellow-100">COMBO!</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* BOTTOM: Tap to dismiss & Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 w-full max-w-sm pointer-events-auto mb-3 text-center"
        >
          {/* Animated Countdown Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden mb-3 border border-slate-700/40">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ 
                duration: activeEffect.rarity === 'legendary' ? 4.6 : activeEffect.rarity === 'epic' ? 4.2 : 3.8,
                ease: 'linear'
              }}
              className="h-full rounded-full"
              style={{ backgroundColor: rarityConfig.accentHex }}
            />
          </div>

          <button
            type="button"
            onClick={dismissGiftEffect}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md transition-all shadow-lg cursor-pointer"
          >
            <span>Chạm bất kỳ đâu hoặc bấm để đóng</span>
            <X size={13} className="text-slate-400" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
export default HaevyGiftCelebrationOverlay;
