import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { toast, ToastItem } from '../../utils/toast';

export function HaevyGlobalToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toast.subscribe((updated) => {
      setToasts(updated);
    });
  }, []);

  return (
    <div className="fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none w-full max-w-md px-3">
      <AnimatePresence>
        {toasts.map((item) => {
          const isError = item.type === 'error';
          const isSuccess = item.type === 'success';
          const isWarning = item.type === 'warning';

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border shadow-2xl backdrop-blur-2xl text-xs sm:text-sm font-semibold select-none w-full sm:w-auto ${
                isError
                  ? 'bg-rose-950/90 border-rose-500/50 text-rose-100 shadow-rose-950/50'
                  : isSuccess
                  ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100 shadow-emerald-950/50'
                  : isWarning
                  ? 'bg-amber-950/90 border-amber-500/50 text-amber-100 shadow-amber-950/50'
                  : 'bg-zinc-950/90 border-zinc-700/60 text-zinc-100 shadow-black/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="shrink-0">
                  {isError && <AlertCircle size={16} className="text-rose-400" />}
                  {isSuccess && <CheckCircle2 size={16} className="text-emerald-400" />}
                  {isWarning && <AlertTriangle size={16} className="text-amber-400" />}
                  {!isError && !isSuccess && !isWarning && <Info size={16} className="text-cyan-400" />}
                </div>
                <p className="truncate leading-snug">{item.message}</p>
              </div>

              <button
                type="button"
                onClick={() => toast.dismiss(item.id)}
                className="shrink-0 p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                title="Đóng thông báo"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
