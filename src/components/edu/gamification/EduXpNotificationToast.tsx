import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Flame, Award, Sparkles, CheckCircle2, FlaskConical } from 'lucide-react';
import { EduActivityCategory } from '../../../types';

interface EduXpNotificationToastProps {
  toast: {
    id: string;
    xp: number;
    title: string;
    category: EduActivityCategory;
    isLevelUp?: boolean;
    isStreakIncrease?: boolean;
  } | null;
  onDismiss: () => void;
}

export function EduXpNotificationToast({ toast, onDismiss }: EduXpNotificationToastProps) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.94 }}
          transition={{ type: 'spring', damping: 20, stiffness: 350 }}
          className="fixed top-16 right-4 sm:right-8 z-50 pointer-events-auto"
        >
          <div className={`p-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl max-w-sm sm:max-w-md ${
            toast.isLevelUp 
              ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 border-amber-500/50 text-amber-200'
              : toast.isStreakIncrease
              ? 'bg-gradient-to-r from-orange-500/20 via-red-500/20 to-amber-500/20 border-orange-500/50 text-orange-200'
              : 'bg-zinc-900/95 border-emerald-500/40 text-emerald-300'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
              toast.isLevelUp
                ? 'bg-amber-500/30 text-amber-300 border border-amber-400/40'
                : toast.isStreakIncrease
                ? 'bg-orange-500/30 text-orange-300 border border-orange-400/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {toast.isLevelUp ? (
                <Sparkles size={20} className="animate-spin text-amber-300" />
              ) : toast.isStreakIncrease ? (
                <Flame size={20} className="animate-pulse text-orange-400" />
              ) : toast.category === 'lab' ? (
                <FlaskConical size={20} className="text-cyan-400" />
              ) : (
                <Zap size={20} className="text-emerald-400" />
              )}
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  +{toast.xp} XP
                </span>
                {toast.isLevelUp && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 border border-amber-500/50 animate-pulse">
                    Thăng Hạng!
                  </span>
                )}
                {toast.isStreakIncrease && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-orange-500/30 text-orange-200 border border-orange-500/50">
                    Chuỗi +1 Ngày
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-zinc-100 truncate mt-0.5">
                {toast.title}
              </p>
            </div>

            <button
              onClick={onDismiss}
              className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg transition-colors cursor-pointer text-xs"
              title="Đóng"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
