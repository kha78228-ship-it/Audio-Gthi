import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { MODE_TRANSITION_EVENT, ModeTransitionDetail } from '../services/modeSyncService';

export function HaevyModeTransitionOverlay() {
  const [activeTransition, setActiveTransition] = useState<ModeTransitionDetail | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleTransition = (e: Event) => {
      const detail = (e as CustomEvent<ModeTransitionDetail>).detail;
      if (!detail || !detail.config) return;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setActiveTransition(detail);

      timerRef.current = setTimeout(() => {
        setActiveTransition(null);
      }, 1100);
    };

    window.addEventListener(MODE_TRANSITION_EVENT, handleTransition);
    return () => {
      window.removeEventListener(MODE_TRANSITION_EVENT, handleTransition);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!activeTransition) return null;

  const { config } = activeTransition;
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 pointer-events-none z-[120] flex items-start justify-center pt-16 sm:pt-20 px-4">
      <AnimatePresence>
        <motion.div
          key={`mode-trans-${config.id}-${activeTransition.timestamp}`}
          initial={{ opacity: 0, y: -24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-md w-full pointer-events-auto select-none"
          onClick={() => setActiveTransition(null)}
        >
          {/* Ambient Glow Backdrop */}
          <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${config.color} opacity-35 blur-xl animate-pulse`} />

          {/* Card Container */}
          <div className="relative overflow-hidden rounded-2xl bg-zinc-950/95 border border-zinc-700/80 shadow-2xl p-3.5 sm:p-4 backdrop-blur-2xl flex items-center gap-3.5 ring-1 ring-white/10">
            
            {/* Animated Icon Avatar */}
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr ${config.color} p-0.5 shrink-0 shadow-lg shadow-black/40`}>
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 animate-pulse" />
                <Icon size={22} className={`${config.accentColor} relative z-10`} />
              </div>
            </div>

            {/* Content Details */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-400 shrink-0" />
                  Đồng bộ hệ sinh thái
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${config.badgeColor} shrink-0`}>
                  {config.badge}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <h4 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                  {config.name}
                </h4>
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              </div>

              <p className="text-[11px] text-zinc-300 truncate font-medium mt-0.5">
                {config.tagline}
              </p>
            </div>

            {/* Animated Loading Sweep Line at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-zinc-800">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.9, ease: 'linear' }}
                className={`h-full bg-gradient-to-r ${config.color}`}
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
