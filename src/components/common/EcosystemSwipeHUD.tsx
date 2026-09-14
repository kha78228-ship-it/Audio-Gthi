import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, Hand, Sparkles } from 'lucide-react';
import { SwipeEcosystemMode } from '../../hooks/useEcosystemSwipeNavigation';
import { useTheme } from '../../context/ThemeContext';
import { haptics } from '../../utils/haptics';

interface EcosystemSwipeHUDProps {
  isVisible: boolean;
  onClose: () => void;
  currentMode: SwipeEcosystemMode;
  prevMode?: SwipeEcosystemMode;
  nextMode?: SwipeEcosystemMode;
  onGoPrev: () => void;
  onGoNext: () => void;
  isSwiping: boolean;
  swipeDirection: 'left' | 'right' | null;
  targetPreviewMode: SwipeEcosystemMode | null;
  allModes: SwipeEcosystemMode[];
  currentIndex: number;
  onSelectModeByIndex?: (index: number) => void;
}

export const EcosystemSwipeHUD: React.FC<EcosystemSwipeHUDProps> = ({
  isVisible,
  onClose,
  currentMode,
  prevMode,
  nextMode,
  onGoPrev,
  onGoNext,
  isSwiping,
  swipeDirection,
  targetPreviewMode,
  allModes,
  currentIndex,
  onSelectModeByIndex
}) => {
  const { effectiveTheme } = useTheme();
  const isLight = effectiveTheme === 'light';

  const CurrentIcon = currentMode.icon;
  const TargetIcon = targetPreviewMode?.icon;

  return (
    <>
      {/* 1. Dynamic Edge Cue when actively swiping across screen */}
      <AnimatePresence>
        {isSwiping && targetPreviewMode && (
          <motion.div
            key={`edge-cue-${swipeDirection}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15 }}
            className={`fixed top-1/2 -translate-y-1/2 z-[80] pointer-events-none flex items-center gap-2 px-3.5 py-2.5 rounded-full shadow-2xl backdrop-blur-xl border ${
              swipeDirection === 'left' ? 'right-3 sm:right-6' : 'left-3 sm:left-6'
            } ${
              isLight
                ? 'bg-white/95 text-slate-900 border-slate-300 shadow-slate-900/15'
                : 'bg-zinc-950/95 text-white border-zinc-700/80 shadow-black/80'
            }`}
          >
            {swipeDirection === 'right' && (
              <ChevronLeft size={18} className="text-amber-400 animate-pulse shrink-0" />
            )}
            <div className={`p-1.5 rounded-xl bg-gradient-to-br ${targetPreviewMode.gradient} text-white shadow-sm shrink-0`}>
              {TargetIcon && <TargetIcon size={16} />}
            </div>
            <div className="flex flex-col min-w-0 pr-1">
              <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-400 uppercase tracking-wider">
                {swipeDirection === 'left' ? 'Kế tiếp' : 'Trước đó'}
              </span>
              <span className="text-xs font-bold truncate max-w-[130px]">
                {targetPreviewMode.shortName}
              </span>
            </div>
            {swipeDirection === 'left' && (
              <ChevronRight size={18} className="text-amber-400 animate-pulse shrink-0" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Floating Mode Switcher Navigation HUD & Pagination Rail */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            id="ecosystem-swipe-hud-container"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-[70] max-w-[95vw] sm:max-w-md w-full px-2 pointer-events-auto select-none"
          >
            <div
              id="ecosystem-swipe-hud-card"
              className={`relative overflow-hidden rounded-2xl p-2.5 sm:p-3 shadow-2xl backdrop-blur-2xl border transition-all ${
                isLight
                  ? 'bg-white/95 border-slate-300/90 text-slate-900 shadow-slate-900/20'
                  : 'bg-zinc-950/95 border-zinc-800/90 text-zinc-100 shadow-[0_12px_40px_rgba(0,0,0,0.85)]'
              }`}
            >
              {/* Subtle top indicator bar showing mode theme gradient */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${currentMode.gradient}`}
              />

              {/* Header: Mode Name & Navigation Controls */}
              <div className="flex items-center justify-between gap-1.5 sm:gap-2 pt-0.5">
                {/* Previous Mode Button */}
                <button
                  id="swipe-hud-btn-prev"
                  type="button"
                  onClick={() => {
                    haptics.selection();
                    onGoPrev();
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition active:scale-95 cursor-pointer shrink-0 ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700'
                      : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                  }`}
                  title={prevMode ? `Chuyển về ${prevMode.name}` : 'Chế độ trước'}
                >
                  <ChevronLeft size={15} className="text-amber-400" />
                  <span className="hidden xs:inline max-w-[70px] truncate text-[11px]">
                    {prevMode?.shortName}
                  </span>
                </button>

                {/* Current Active Mode Chip */}
                <div
                  id="swipe-hud-current-badge"
                  className="flex items-center gap-2 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/30 min-w-0 flex-1 justify-center shadow-inner"
                >
                  <div
                    className={`p-1.5 rounded-lg bg-gradient-to-br ${currentMode.gradient} text-white shadow-sm shrink-0`}
                  >
                    <CurrentIcon size={14} className="stroke-[2.5]" />
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-black tracking-tight truncate">
                        {currentMode.name}
                      </span>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-400 text-zinc-950 shrink-0 uppercase">
                        {currentMode.badge}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Next Mode Button */}
                <button
                  id="swipe-hud-btn-next"
                  type="button"
                  onClick={() => {
                    haptics.selection();
                    onGoNext();
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition active:scale-95 cursor-pointer shrink-0 ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700'
                      : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                  }`}
                  title={nextMode ? `Chuyển tới ${nextMode.name}` : 'Chế độ kế tiếp'}
                >
                  <span className="hidden xs:inline max-w-[70px] truncate text-[11px]">
                    {nextMode?.shortName}
                  </span>
                  <ChevronRight size={15} className="text-amber-400" />
                </button>

                {/* Close Button */}
                <button
                  id="swipe-hud-btn-close"
                  type="button"
                  onClick={() => {
                    haptics.light();
                    onClose();
                  }}
                  className={`p-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                    isLight
                      ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                  title="Ẩn thông báo"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Sub-bar: Pagination Dots & Quick Gesture Tip */}
              <div className="flex items-center justify-between gap-2 mt-2 px-1 pt-1.5 border-t border-zinc-800/40 dark:border-zinc-800/40">
                {/* Gesture hint */}
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                  <Hand size={11} className="text-amber-400 animate-bounce" />
                  <span>Vuốt ngang để chuyển nhanh</span>
                </div>

                {/* Micro Pagination Dots */}
                <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar max-w-[170px]">
                  {allModes.map((mode, idx) => {
                    const isCur = idx === currentIndex;
                    return (
                      <button
                        key={mode.id}
                        id={`swipe-hud-dot-${mode.id}`}
                        type="button"
                        onClick={() => {
                          if (onSelectModeByIndex) {
                            haptics.selection();
                            onSelectModeByIndex(idx);
                          }
                        }}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          isCur
                            ? 'w-4 bg-amber-400 shadow-sm shadow-amber-400/50'
                            : 'w-1.5 bg-zinc-600/60 hover:bg-zinc-400'
                        }`}
                        title={mode.name}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default EcosystemSwipeHUD;
