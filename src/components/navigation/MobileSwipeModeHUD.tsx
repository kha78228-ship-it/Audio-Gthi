import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Minimize2, 
  Maximize2, 
  LayoutGrid, 
  X, 
  Search, 
  Sparkles, 
  Check, 
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { SwipeFeedbackState, SwipeModeConfig } from '../../hooks/useMobileSwipeNavigation';
import { useTheme } from '../../context/ThemeContext';
import { haptics, triggerHaptic } from '../../utils/haptics';

interface MobileSwipeModeHUDProps {
  swipeFeedback: SwipeFeedbackState | null;
  isSwiping: boolean;
  dragOffset: number;
  isThresholdMet?: boolean;
  currentMode: string;
  modes: SwipeModeConfig[];
  currentIndex: number;
  targetPreviewMode?: SwipeModeConfig | null;
  onSelectMode: (modeId: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Blurred, grayscale preview of the upcoming screen (next or prev)
 * Displays behind the current mode icon as the user drags, providing a clearer visual queue.
 */
function UpcomingScreenMiniaturePreview({
  mode,
  isThresholdMet,
  direction,
}: {
  mode: SwipeModeConfig;
  isThresholdMet: boolean;
  direction: 'prev' | 'next';
}) {
  const IconComponent = mode.icon;

  return (
    <div
      className={`w-14 h-20 sm:w-16 sm:h-22 rounded-xl border shadow-2xl p-1.5 flex flex-col justify-between select-none pointer-events-none transition-all duration-200 overflow-hidden ${
        isThresholdMet
          ? 'border-amber-400/80 ring-2 ring-amber-400/40 shadow-amber-500/30 bg-zinc-950/95'
          : 'border-white/20 shadow-black/80 bg-zinc-950/90'
      }`}
      style={{
        filter: 'grayscale(100%) blur(1.2px)',
        transform: 'translateZ(0)',
      }}
    >
      {/* Mini Top Status Bar */}
      <div className="flex items-center justify-between w-full border-b border-white/10 pb-0.5">
        <div className="flex items-center gap-0.5">
          <div className="w-1 h-1 rounded-full bg-white/40" />
          <span className="text-[7px] font-mono text-zinc-400 leading-none">
            {direction === 'next' ? 'TIẾP' : 'TRƯỚC'}
          </span>
        </div>
        <span className="text-[6px] font-mono text-zinc-500 leading-none">
          {mode.badge}
        </span>
      </div>

      {/* Mini Screen Body Content tailored to upcoming mode */}
      <div className="flex-1 my-1 flex flex-col justify-center items-center w-full px-0.5">
        {mode.id === 'audio' ? (
          <div className="w-full flex flex-col items-center gap-1">
            <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center border border-white/10">
              <IconComponent size={10} className="text-zinc-300" />
            </div>
            <div className="w-full flex items-end justify-center gap-0.5 h-3">
              <div className="w-0.5 h-1.5 bg-zinc-400 rounded-full" />
              <div className="w-0.5 h-3 bg-zinc-300 rounded-full" />
              <div className="w-0.5 h-2 bg-zinc-400 rounded-full" />
              <div className="w-0.5 h-2.5 bg-zinc-300 rounded-full" />
              <div className="w-0.5 h-1 bg-zinc-500 rounded-full" />
            </div>
          </div>
        ) : mode.id === 'space' ? (
          <div className="w-full flex flex-col items-center gap-1">
            <div className="w-full h-8 rounded border border-dashed border-zinc-700 bg-zinc-900/60 flex items-center justify-center relative">
              <IconComponent size={10} className="text-zinc-300" />
              <div className="absolute inset-x-1 top-2 h-px bg-zinc-700/60" />
              <div className="absolute inset-y-1 left-3 w-px bg-zinc-700/60" />
            </div>
          </div>
        ) : mode.id === 'messages' ? (
          <div className="w-full flex flex-col gap-1 py-0.5">
            <div className="w-3/4 h-2 rounded bg-zinc-700 self-start" />
            <div className="w-2/3 h-2 rounded bg-zinc-500 self-end" />
            <div className="w-4/5 h-2 rounded bg-zinc-700 self-start" />
          </div>
        ) : mode.id === 'finance' ? (
          <div className="grid grid-cols-2 gap-0.5 w-full">
            <div className="h-3 rounded bg-zinc-800 border border-zinc-700" />
            <div className="h-3 rounded bg-zinc-800 border border-zinc-700" />
            <div className="h-3 rounded bg-zinc-800 border border-zinc-700" />
            <div className="h-3 rounded bg-zinc-800 border border-zinc-700" />
          </div>
        ) : mode.id === 'spiritual' ? (
          <div className="w-full flex flex-col items-center justify-center">
            <div className="w-7 h-7 rounded-full border border-dashed border-zinc-600 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full border border-zinc-500 flex items-center justify-center">
                <IconComponent size={8} className="text-zinc-300" />
              </div>
            </div>
          </div>
        ) : mode.id === 'haevy_ai' ? (
          <div className="w-full flex flex-col gap-1">
            <div className="w-full h-2 rounded bg-zinc-700" />
            <div className="w-3/4 h-1.5 rounded bg-zinc-600" />
            <div className="w-full h-2.5 rounded-sm bg-zinc-800 border border-zinc-700 flex items-center px-1">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            </div>
          </div>
        ) : mode.id === 'portal' ? (
          <div className="grid grid-cols-2 gap-0.5 w-full">
            <div className="h-3.5 rounded bg-zinc-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            </div>
            <div className="h-3.5 rounded bg-zinc-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            </div>
            <div className="h-3.5 rounded bg-zinc-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            </div>
            <div className="h-3.5 rounded bg-zinc-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            </div>
          </div>
        ) : mode.id === 'family_tree' ? (
          <div className="w-full flex flex-col items-center justify-center gap-1">
            <div className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center">
              <IconComponent size={7} className="text-zinc-300" />
            </div>
            <div className="w-px h-1.5 bg-zinc-600" />
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700" />
            </div>
          </div>
        ) : mode.id === 'couple' ? (
          <div className="w-full flex flex-col items-center justify-center gap-1">
            <div className="flex items-center gap-0.5">
              <div className="w-3.5 h-3.5 rounded-full bg-zinc-800 border border-rose-500/40 flex items-center justify-center">
                <IconComponent size={7} className="text-zinc-300" />
              </div>
              <div className="w-3.5 h-3.5 rounded-full bg-zinc-800 border border-pink-500/40 flex items-center justify-center" />
            </div>
            <div className="w-4/5 h-1.5 rounded-full bg-zinc-700" />
          </div>
        ) : mode.id === 'studio' ? (
          <div className="w-full flex flex-col items-center gap-1">
            <div className="w-5 h-5 rounded-md bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <IconComponent size={9} className="text-zinc-300" />
            </div>
            <div className="w-full h-2 rounded bg-zinc-900 border border-zinc-700 flex items-center px-1">
              <div className="w-1/2 h-1 bg-zinc-500 rounded" />
            </div>
          </div>
        ) : mode.id === 'vip' ? (
          <div className="w-full flex flex-col items-center justify-center gap-1">
            <div className="w-full h-7 rounded border border-amber-500/40 bg-zinc-900/80 flex flex-col items-center justify-center p-1">
              <IconComponent size={8} className="text-zinc-300 mb-0.5" />
              <div className="w-3/4 h-1 bg-zinc-700 rounded-xs" />
            </div>
          </div>
        ) : mode.id === 'haevy_lite' ? (
          <div className="w-full flex flex-col items-center justify-center gap-1">
            <div className="w-6 h-6 rounded-full border border-dashed border-zinc-600 flex items-center justify-center bg-zinc-900/60">
              <IconComponent size={9} className="text-zinc-300" />
            </div>
          </div>
        ) : mode.id === 'admin' ? (
          <div className="w-full flex flex-col items-center gap-1">
            <div className="w-5 h-5 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <IconComponent size={9} className="text-zinc-300" />
            </div>
            <div className="grid grid-cols-2 gap-0.5 w-full">
              <div className="h-1.5 rounded-xs bg-zinc-700" />
              <div className="h-1.5 rounded-xs bg-zinc-600" />
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <IconComponent size={10} className="text-zinc-300" />
            </div>
            <div className="w-4/5 h-1.5 rounded bg-zinc-700" />
            <div className="w-3/5 h-1 rounded bg-zinc-800" />
          </div>
        )}
      </div>

      {/* Mini Bottom Screen Label */}
      <div className="w-full text-center border-t border-white/10 pt-0.5">
        <span className="text-[7px] font-bold text-zinc-300 truncate block max-w-full">
          {mode.shortName || mode.name}
        </span>
      </div>
    </div>
  );
}

export function MobileSwipeModeHUD({
  swipeFeedback,
  isSwiping,
  dragOffset,
  isThresholdMet = false,
  currentMode,
  modes,
  currentIndex,
  targetPreviewMode,
  onSelectMode,
  onPrev,
  onNext,
}: MobileSwipeModeHUDProps) {
  const { effectiveTheme } = useTheme();
  const isLight = effectiveTheme === 'light';

  // Smart minimize / auto-fade state for clean screen UX
  // In Haevy Space, default to minimized to maximize 3D canvas area
  const [isExpanded, setIsExpanded] = useState(() => currentMode !== 'space');
  const [isQuickSwitcherOpen, setIsQuickSwitcherOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | '3d_ai' | 'media' | 'finance' | 'portal'>('all');
  
  const autoCollapseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentConfig = modes[currentIndex] || modes[0];
  const nextConfig = modes[(currentIndex + 1) % modes.length];
  const prevConfig = modes[(currentIndex - 1 + modes.length) % modes.length];

  /**
   * Safely trigger short haptic pulses via window.navigator.vibrate()
   * Supported on modern mobile browsers with graceful fallback.
   */
  const safeVibrate = useCallback((pattern: number | number[]) => {
    if (typeof window !== 'undefined' && 'navigator' in window && typeof window.navigator.vibrate === 'function') {
      try {
        window.navigator.vibrate(pattern);
      } catch {
        // Graceful fallback if vibration is blocked or unsupported
      }
    }
  }, []);

  // Enhanced Navigation Handlers
  const handleSelectMode = useCallback((modeId: string) => {
    onSelectMode(modeId);
  }, [onSelectMode]);

  const handlePrev = useCallback(() => {
    onPrev();
  }, [onPrev]);

  const handleNext = useCallback(() => {
    onNext();
  }, [onNext]);

  // Trigger short haptic pulse via window.navigator.vibrate() on successful mode switch
  const prevModeRef = useRef(currentMode);
  const isInitialMountRef = useRef(true);
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevModeRef.current = currentMode;
      return;
    }

    if (currentMode !== prevModeRef.current) {
      prevModeRef.current = currentMode;
      // Single clean tactile pulse via window.navigator.vibrate() when mode switch successfully completes
      safeVibrate([22, 35, 28]);
    }
  }, [currentMode, safeVibrate]);

  // Direct swipe gesture interaction on the MobileSwipeModeHUD dock itself with threshold detection
  const dockTouchRef = useRef<{ startX: number; startY: number; time: number } | null>(null);
  const [dockDragOffset, setDockDragOffset] = useState(0);
  const [isDockThresholdMet, setIsDockThresholdMet] = useState(false);

  const handleDockTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    dockTouchRef.current = { startX: t.clientX, startY: t.clientY, time: Date.now() };
    setDockDragOffset(0);
    setIsDockThresholdMet(false);
  };

  const handleDockTouchMove = (e: React.TouchEvent) => {
    if (!dockTouchRef.current) return;
    const t = e.touches[0];
    const dx = t.clientX - dockTouchRef.current.startX;
    const dy = t.clientY - dockTouchRef.current.startY;

    // Ignore if primarily vertical gesture
    if (Math.abs(dy) > Math.abs(dx) * 1.4) return;

    const thresholdDistance = 28;
    const met = Math.abs(dx) >= thresholdDistance;
    setDockDragOffset(dx);
    setIsDockThresholdMet(met);
  };

  const handleDockTouchEnd = () => {
    if (!dockTouchRef.current) return;
    const dx = dockDragOffset;
    const absX = Math.abs(dx);
    const thresholdDistance = 28;

    if (absX >= thresholdDistance) {
      if (dx < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    dockTouchRef.current = null;
    setDockDragOffset(0);
    setIsDockThresholdMet(false);
  };

  // =========================================================================
  // SPRING-BASED PHYSICS ANIMATION CALCULATIONS FOR MODE ICONS DURING DRAG
  // Causes mode icons to slightly scale and follow user's finger before threshold
  // =========================================================================
  const effectiveDrag = dockDragOffset !== 0 ? dockDragOffset : (isSwiping ? (dragOffset || 0) : 0);
  const isDragging = isSwiping || dockDragOffset !== 0;
  const effectiveThresholdMet = Boolean(isThresholdMet || isDockThresholdMet);

  // Monitor threshold crossing across unified drag sources (dock drag + global swipe)
  const prevEffectiveThresholdMetRef = useRef(false);
  useEffect(() => {
    if (isDragging && effectiveThresholdMet && !prevEffectiveThresholdMetRef.current) {
      safeVibrate([18, 25, 18]);
    }
    prevEffectiveThresholdMetRef.current = effectiveThresholdMet;
  }, [isDragging, effectiveThresholdMet, safeVibrate]);

  // Active target mode preview based on swipe direction if not explicitly supplied
  const activeTargetMode = targetPreviewMode || (
    effectiveDrag < 0 ? nextConfig : prevConfig
  );

  // Approximate swipe threshold distance (around 32px for ergonomic navigation)
  const SWIPE_THRESHOLD_DISTANCE = 32;
  const rawProgress = Math.min(Math.abs(effectiveDrag) / SWIPE_THRESHOLD_DISTANCE, 1);
  const dragProgress = isDragging ? rawProgress : 0;

  // Spring Physics Scale:
  // Before threshold is reached: gently and smoothly scales up from 1.0 to ~1.20 following finger movement
  // Once threshold is reached: locks to an energized 1.24 snap state
  const iconScale = isDragging
    ? effectiveThresholdMet
      ? 1.24
      : 1 + dragProgress * 0.20
    : 1;

  // Spring Physics Translation: icons follow user's finger with elastic rubber-band resistance
  const iconTranslateX = isDragging
    ? Math.sign(effectiveDrag) * Math.pow(Math.abs(effectiveDrag), 0.85) * (dockDragOffset !== 0 ? 0.38 : 0.28)
    : 0;

  // Spring Physics Rotation: subtle dynamic tilt in direction of movement
  const iconRotate = isDragging
    ? Math.sign(effectiveDrag) * Math.min(Math.abs(effectiveDrag) * 0.2, 14)
    : 0;

  // Spring follower displacement for the on-screen active swipe pill
  const springFollowerX = isDragging
    ? Math.sign(effectiveDrag) * Math.min(Math.abs(effectiveDrag) * 0.52, 60)
    : 0;

  const springPhysicsConfig = useMemo(() => ({
    type: 'spring' as const,
    stiffness: 420,
    damping: 26,
    mass: 0.55,
  }), []);

  const hasBottomTaskbar =
    currentMode !== 'portal' &&
    currentMode !== 'space' &&
    currentMode !== 'haevy_ai' &&
    currentMode !== 'profile';

  // Automatically reset idle collapse timer whenever mode changes or swipe occurs
  useEffect(() => {
    if (currentMode === 'space') {
      // In Haevy Space, keep it compact and collapse quickly to free up drawing canvas
      if (autoCollapseTimerRef.current) clearTimeout(autoCollapseTimerRef.current);
      autoCollapseTimerRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 2500);
    } else {
      setIsExpanded(true);
      if (autoCollapseTimerRef.current) clearTimeout(autoCollapseTimerRef.current);
      autoCollapseTimerRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 3600);
    }

    return () => {
      if (autoCollapseTimerRef.current) clearTimeout(autoCollapseTimerRef.current);
    };
  }, [currentMode, isSwiping]);

  // Listen to custom event to open Quick Mode Switcher from anywhere (e.g., from Haevy Space top button)
  useEffect(() => {
    const handleOpenQuickSwitcher = () => {
      haptics.medium();
      setIsQuickSwitcherOpen(true);
    };
    window.addEventListener('haevy-open-quick-mode-switcher', handleOpenQuickSwitcher);
    return () => {
      window.removeEventListener('haevy-open-quick-mode-switcher', handleOpenQuickSwitcher);
    };
  }, []);

  // Categorize modes for the Quick Switcher Sheet
  const categorizedModes = useMemo(() => {
    return modes.filter(m => {
      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = m.name.toLowerCase().includes(q) || m.shortName.toLowerCase().includes(q);
        const matchesBadge = m.badge.toLowerCase().includes(q);
        if (!matchesName && !matchesBadge) return false;
      }

      // Filter by category
      if (selectedCategory === 'all') return true;
      if (selectedCategory === '3d_ai') {
        return ['space', 'haevy_ai', 'haevy_lite', 'spiritual'].includes(m.id);
      }
      if (selectedCategory === 'media') {
        return ['audio', 'messages', 'studio', 'couple', 'games'].includes(m.id);
      }
      if (selectedCategory === 'finance') {
        return ['finance', 'vip', 'admin', 'family_tree'].includes(m.id);
      }
      if (selectedCategory === 'portal') {
        return m.id === 'portal';
      }
      return true;
    });
  }, [modes, searchQuery, selectedCategory]);

  // Keyboard navigation when Quick Switcher is open
  useEffect(() => {
    if (!isQuickSwitcherOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsQuickSwitcherOpen(false);
        return;
      }

      // If user is typing in search input, allow typing but handle Enter to select first result
      const isInput = e.target instanceof HTMLInputElement;
      if (isInput) {
        if (e.key === 'Enter' && categorizedModes.length > 0) {
          e.preventDefault();
          handleSelectMode(categorizedModes[0].id);
          setIsQuickSwitcherOpen(false);
        }
        return;
      }

      // Direct numerical selection 1-9
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= 9 && num <= categorizedModes.length) {
        e.preventDefault();
        handleSelectMode(categorizedModes[num - 1].id);
        setIsQuickSwitcherOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isQuickSwitcherOpen, categorizedModes, handleSelectMode]);

  const handleToggleExpand = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    haptics.selection();
    setIsExpanded(prev => {
      const next = !prev;
      if (autoCollapseTimerRef.current) clearTimeout(autoCollapseTimerRef.current);
      if (next) {
        autoCollapseTimerRef.current = setTimeout(() => {
          setIsExpanded(false);
        }, currentMode === 'space' ? 3000 : 4500);
      }
      return next;
    });
  };

  const handleOpenSheet = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    haptics.medium();
    setIsQuickSwitcherOpen(true);
  };

  // Dynamic Positioning:
  // - In Haevy Space: Floating at top-4 sm:top-5 to completely avoid covering bottom 3D drawing tools!
  // - In Standard App Modes: Floating at bottom-[72px] sm:bottom-[76px] right above bottom navigation.
  // - In Portal / Profile: Floating at bottom-4.
  const dockPositionClasses = useMemo(() => {
    if (currentMode === 'space') {
      return 'top-3.5 sm:top-4 left-1/2 -translate-x-1/2';
    }
    if (hasBottomTaskbar) {
      return 'bottom-[72px] sm:bottom-[76px] left-1/2 -translate-x-1/2';
    }
    return 'bottom-4 left-1/2 -translate-x-1/2';
  }, [currentMode, hasBottomTaskbar]);

  // Vertical placement of upcoming screen preview behind dock icon:
  // In Space mode, dock is at top so preview floats downward (+44px); in standard modes dock is at bottom so preview floats upward (-46px)
  const previewVerticalOffset = currentMode === 'space' ? 44 : -46;

  return (
    <>
      {/* -1. Thin, Animated Horizontal Progress Indicator at the Very Top of the Screen */}
      <AnimatePresence>
        {isDragging && Math.abs(effectiveDrag) > 2 && (
          <motion.div
            id="mobile-swipe-top-progress-indicator"
            initial={{ opacity: 0, scaleY: 0.6 }}
            animate={{
              opacity: 1,
              scaleY: effectiveThresholdMet ? 1.4 : 1,
            }}
            exit={{ opacity: 0, scaleY: 0.5 }}
            transition={{ duration: 0.15 }}
            className="fixed top-0 left-0 right-0 w-full z-[150] pointer-events-none select-none h-[3px] bg-black/15 dark:bg-white/10 overflow-hidden"
          >
            {/* Animated Fill Bar */}
            <motion.div
              className={`absolute top-0 bottom-0 rounded-full transition-[width,background-color] duration-75 ${
                effectiveThresholdMet
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 shadow-[0_0_12px_rgba(251,191,36,0.95)]'
                  : activeTargetMode
                  ? `bg-gradient-to-r ${activeTargetMode.color} shadow-[0_0_8px_rgba(255,255,255,0.4)]`
                  : 'bg-gradient-to-r from-amber-400 to-amber-500'
              }`}
              style={{
                ...(effectiveDrag < 0 ? { right: 0 } : { left: 0 }),
                width: `${effectiveThresholdMet ? 100 : Math.min(100, Math.round(dragProgress * 100))}%`,
              }}
            >
              {/* Glowing leading edge pulse */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full blur-[2px] opacity-80 ${
                  effectiveThresholdMet ? 'bg-amber-200' : 'bg-white'
                }`}
                style={{
                  ...(effectiveDrag < 0 ? { left: '-2px' } : { right: '-2px' }),
                }}
              />
              {/* Subtle shimmer sheen */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-pulse" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 0. Dynamic Island Style HUD Feedback when mode changes or swipe occurs */}
      <AnimatePresence>
        {swipeFeedback && (
          <motion.div
            key={`mode-feedback-${swipeFeedback.timestamp}`}
            initial={{ opacity: 0, y: -28, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.94 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-[130] pointer-events-none select-none max-w-[92vw] sm:max-w-md"
          >
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-2xl border transition-all ${
              isLight
                ? 'bg-white/95 text-slate-900 border-slate-200/90 shadow-slate-900/15 ring-1 ring-slate-900/5'
                : 'bg-zinc-950/95 text-white border-zinc-700/80 shadow-black ring-1 ring-white/10'
            }`}>
              {/* Vibrant Gradient Icon */}
              <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${swipeFeedback.targetMode.color} flex items-center justify-center text-white shadow-md shrink-0`}>
                {React.createElement(swipeFeedback.targetMode.icon, { size: 16 })}
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500">
                    {swipeFeedback.direction === 'left' ? 'Chuyển Tiếp ➔' : '⮜ Chuyển Về'}
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-zinc-800 text-zinc-300'}`}>
                    {swipeFeedback.targetMode.badge}
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-black truncate text-slate-900 dark:text-white">
                  {swipeFeedback.targetMode.name}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 0.1 Active Drag Preview Pill with Spring-Based Physics Follower */}
      <AnimatePresence>
        {isSwiping && activeTargetMode && Math.abs(dragOffset) > 12 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -10 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: springFollowerX,
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={springPhysicsConfig}
            className="fixed top-18 sm:top-20 left-1/2 -translate-x-1/2 z-[125] pointer-events-none select-none"
          >
            <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full shadow-2xl backdrop-blur-2xl border font-bold text-xs transition-colors duration-150 ${
              effectiveThresholdMet
                ? 'bg-amber-500 text-black border-amber-300 ring-4 ring-amber-400/40 shadow-amber-500/40 scale-105'
                : isLight
                ? 'bg-white/95 text-slate-800 border-slate-200/90 shadow-slate-900/15'
                : 'bg-zinc-900/95 text-zinc-100 border-zinc-700/90 shadow-black ring-1 ring-white/10'
            }`}>
              {/* Origin Mode Icon with spring trailing physics */}
              <motion.div
                animate={{
                  scale: Math.max(0.75, 1 - dragProgress * 0.2),
                  x: iconTranslateX * 0.35,
                  opacity: Math.max(0.4, 0.85 - dragProgress * 0.4),
                }}
                transition={springPhysicsConfig}
                className={`w-5 h-5 rounded-full bg-gradient-to-tr ${currentConfig.color} flex items-center justify-center text-white shadow-xs shrink-0`}
              >
                {React.createElement(currentConfig.icon, { size: 10 })}
              </motion.div>

              <span className="text-[11px] opacity-70">{dragOffset > 0 ? '⮜' : '➔'}</span>

              {/* Target Mode Icon scaling and following finger with spring physics before threshold */}
              <div className="relative flex flex-col items-center">
                {/* Blurred, grayscale preview of upcoming screen behind target icon as user drags */}
                <AnimatePresence>
                  {isDragging && activeTargetMode && (
                    <motion.div
                      id="upcoming-screen-preview-pill"
                      initial={{ opacity: 0, scale: 0.72, y: -46 }}
                      animate={{
                        opacity: effectiveThresholdMet ? 0.96 : Math.min(0.88, 0.4 + dragProgress * 0.45),
                        scale: effectiveThresholdMet ? 1.05 : 0.88 + dragProgress * 0.12,
                        y: -48,
                      }}
                      exit={{ opacity: 0, scale: 0.72, y: -46 }}
                      transition={springPhysicsConfig}
                      className="absolute left-1/2 -translate-x-1/2 z-0 pointer-events-none"
                    >
                      <UpcomingScreenMiniaturePreview
                        mode={activeTargetMode}
                        isThresholdMet={effectiveThresholdMet}
                        direction={effectiveDrag < 0 ? 'next' : 'prev'}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  animate={{
                    scale: iconScale,
                    x: iconTranslateX * 0.75,
                    rotate: iconRotate,
                  }}
                  transition={springPhysicsConfig}
                  className={`relative z-10 w-6 h-6 rounded-full bg-gradient-to-tr ${activeTargetMode.color} flex items-center justify-center text-white shadow-md shrink-0 ring-1 ring-white/20`}
                >
                  {React.createElement(activeTargetMode.icon, { size: 12 })}
                </motion.div>

                {/* Target mode shortName directly below target mode icon when swipe threshold is met */}
                <AnimatePresence>
                  {effectiveThresholdMet && (
                    <motion.div
                      id="pill-target-mode-shortname-badge"
                      initial={{ opacity: 0, y: -3, scale: 0.8 }}
                      animate={{ opacity: 1, y: 2, scale: 1 }}
                      exit={{ opacity: 0, y: -3, scale: 0.8 }}
                      transition={springPhysicsConfig}
                      className="absolute top-full left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center"
                    >
                      <div className="w-1.5 h-1.5 rotate-45 bg-amber-400 -mb-0.5 shadow-xs" />
                      <span className="text-[9px] leading-tight font-black tracking-tight whitespace-nowrap px-1.5 py-0.5 rounded shadow-lg bg-amber-400 text-black border border-amber-300 font-mono">
                        {activeTargetMode.shortName || activeTargetMode.name}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold">
                  {activeTargetMode.shortName || activeTargetMode.name}
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                  effectiveThresholdMet 
                    ? 'bg-black/20 text-black font-bold' 
                    : isLight 
                    ? 'bg-slate-100 text-slate-600' 
                    : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {activeTargetMode.badge}
                </span>
              </div>

              <span className={`text-[10px] font-medium transition-colors ${
                effectiveThresholdMet ? 'font-black text-black' : 'text-zinc-400'
              }`}>
                {effectiveThresholdMet ? '• Thả để chuyển' : '• Vuốt tiếp'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Subtle Edge Indicator during active edge touch */}
      {isSwiping && Math.abs(dragOffset) > 12 && (
        <div
          id="mobile-swipe-live-edge-glow"
          className={`fixed inset-y-0 pointer-events-none z-[95] transition-all duration-75 ${
            dragOffset > 0 ? 'left-0' : 'right-0'
          }`}
          style={{
            width: `${Math.min(Math.abs(dragOffset) * 0.8, 36)}px`,
            background:
              dragOffset > 0
                ? isThresholdMet
                  ? 'linear-gradient(to right, rgba(245, 158, 11, 0.45), transparent)'
                  : isLight
                  ? 'linear-gradient(to right, rgba(245, 158, 11, 0.20), transparent)'
                  : 'linear-gradient(to right, rgba(245, 158, 11, 0.25), transparent)'
                : isThresholdMet
                ? 'linear-gradient(to left, rgba(245, 158, 11, 0.45), transparent)'
                : isLight
                ? 'linear-gradient(to left, rgba(245, 158, 11, 0.20), transparent)'
                : 'linear-gradient(to left, rgba(245, 158, 11, 0.25), transparent)',
          }}
        />
      )}

      {/* 2. Sleek, Space-Optimized Dynamic Mode Dock Capsule (Rendered only when bottom taskbar is absent and not in space or portal) */}
      {!hasBottomTaskbar && currentMode !== 'space' && currentMode !== 'portal' && (
        <nav
          id="mobile-mode-dock"
          data-mode-switcher-dock="true"
          aria-label="Thanh điều hướng chuyển chế độ hệ sinh thái"
          className={`fixed ${dockPositionClasses} z-[45] pointer-events-auto transition-all duration-300 mode-switcher-dock-el`}
        >
        {isExpanded ? (
          /* ========================================================================= */
          /* EXPANDED DOCK: Ultra-lean 36px capsule, highly space-efficient & ergonomic */
          /* ========================================================================= */
          <motion.div
            id="mobile-swipe-expanded-dock"
            onTouchStart={handleDockTouchStart}
            onTouchMove={handleDockTouchMove}
            onTouchEnd={handleDockTouchEnd}
            onTouchCancel={handleDockTouchEnd}
            animate={{
              x: dockDragOffset ? Math.sign(dockDragOffset) * Math.min(Math.abs(dockDragOffset) * 0.45, 24) : 0
            }}
            transition={springPhysicsConfig}
            className={`flex items-center gap-1 px-1.5 py-1 rounded-full backdrop-blur-2xl border shadow-xl transition-all ${
              isDockThresholdMet || isThresholdMet
                ? 'ring-2 ring-amber-400/60 border-amber-400/80 shadow-amber-500/20'
                : ''
            } ${
              isLight
                ? 'bg-white/95 text-slate-800 border-slate-200/90 shadow-slate-900/10'
                : 'bg-zinc-950/92 text-zinc-100 border-zinc-800/90 shadow-black/80 ring-1 ring-white/5'
            }`}
          >
            {/* Quick Prev Button with spring-based icon response */}
            <button
              id="btn-mode-dock-prev"
              type="button"
              onClick={handlePrev}
              className={`p-1.5 rounded-full transition-all active:scale-85 cursor-pointer ${
                isLight
                  ? 'text-slate-500 hover:text-amber-600 hover:bg-slate-100'
                  : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/80'
              }`}
              title={`Chế độ trước: ${prevConfig.name}`}
              aria-label="Chế độ trước"
            >
              <motion.div
                animate={{
                  scale: isDragging && effectiveDrag > 0 ? (1 + dragProgress * 0.22) : 1,
                  x: isDragging && effectiveDrag > 0 ? (iconTranslateX * 0.5) : 0,
                }}
                transition={springPhysicsConfig}
                className="flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                {isDragging && effectiveDrag > 10 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: 1,
                      scale: iconScale,
                      x: iconTranslateX * 0.3,
                    }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={springPhysicsConfig}
                    className={`w-4 h-4 rounded-full bg-gradient-to-tr ${prevConfig.color} flex items-center justify-center text-white shadow-xs shrink-0`}
                  >
                    {React.createElement(prevConfig.icon, { size: 9 })}
                  </motion.div>
                )}
              </motion.div>
            </button>

            {/* Mode Name & Center Trigger for Quick Switcher Sheet */}
            <button
              id="btn-mode-dock-center-sheet"
              type="button"
              onClick={handleOpenSheet}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-full transition-all active:scale-95 cursor-pointer ${
                isLight
                  ? 'hover:bg-slate-100/90 text-slate-800'
                  : 'hover:bg-zinc-900/90 text-zinc-100'
              }`}
              title="Chạm để mở Bảng Chọn Chế Độ Toàn Năng"
              aria-label="Mở bảng chọn chế độ"
            >
              {/* Vibrant gradient mode icon with Spring-Based Physics Animation (scales and follows finger before threshold) */}
              <div className="relative flex flex-col items-center">
                {/* Blurred, grayscale 'preview' of the upcoming screen (next or prev) behind the current mode icon as the user drags */}
                <AnimatePresence>
                  {isDragging && Math.abs(effectiveDrag) > 4 && activeTargetMode && (
                    <motion.div
                      id="upcoming-screen-preview-dock"
                      initial={{ 
                        opacity: 0, 
                        scale: 0.72,
                        x: effectiveDrag < 0 ? 18 : -18,
                        y: previewVerticalOffset,
                      }}
                      animate={{
                        opacity: effectiveThresholdMet ? 0.96 : Math.min(0.88, 0.32 + dragProgress * 0.55),
                        scale: effectiveThresholdMet ? 1.05 : 0.85 + dragProgress * 0.15,
                        x: (effectiveDrag < 0 ? 1 : -1) * (1 - dragProgress) * 10 + iconTranslateX * 0.35,
                        y: previewVerticalOffset,
                      }}
                      exit={{ 
                        opacity: 0, 
                        scale: 0.7,
                        x: effectiveDrag < 0 ? 14 : -14,
                        y: previewVerticalOffset,
                      }}
                      transition={springPhysicsConfig}
                      className="absolute left-1/2 -translate-x-1/2 z-0 pointer-events-none"
                    >
                      <UpcomingScreenMiniaturePreview
                        mode={activeTargetMode}
                        isThresholdMet={effectiveThresholdMet}
                        direction={effectiveDrag < 0 ? 'next' : 'prev'}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  animate={{
                    x: iconTranslateX,
                    scale: iconScale,
                    rotate: iconRotate,
                  }}
                  transition={springPhysicsConfig}
                  className={`relative z-10 w-5 h-5 rounded-full bg-gradient-to-tr ${currentConfig.color} flex items-center justify-center text-white shadow-sm shrink-0`}
                >
                  {React.createElement(currentConfig.icon, { size: 11 })}
                </motion.div>

                {/* Target mode shortName directly below active mode icon when swipe threshold is met */}
                <AnimatePresence>
                  {effectiveThresholdMet && activeTargetMode && (
                    <motion.div
                      id="dock-target-mode-shortname-badge"
                      initial={{ opacity: 0, y: -4, scale: 0.8 }}
                      animate={{ opacity: 1, y: 3, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.8 }}
                      transition={springPhysicsConfig}
                      className="absolute top-full left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center"
                    >
                      <div className="w-1.5 h-1.5 rotate-45 bg-amber-400 -mb-0.5 shadow-xs" />
                      <span className="text-[9px] leading-tight font-black tracking-tight whitespace-nowrap px-1.5 py-0.5 rounded-md shadow-xl bg-amber-400 text-black border border-amber-300 ring-2 ring-amber-500/40 font-mono">
                        {activeTargetMode.shortName || activeTargetMode.name}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mode Short Name */}
              <span className="text-xs font-bold truncate max-w-[110px] tracking-tight">
                {currentConfig.shortName || currentConfig.name}
              </span>

              {/* Mode Counter Badge */}
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-semibold ${
                isLight ? 'bg-slate-200/80 text-slate-700' : 'bg-zinc-800 text-zinc-300'
              }`}>
                {currentIndex + 1}/{modes.length}
              </span>
            </button>

            {/* Quick Next Button with spring-based icon response */}
            <button
              id="btn-mode-dock-next"
              type="button"
              onClick={handleNext}
              className={`p-1.5 rounded-full transition-all active:scale-85 cursor-pointer ${
                isLight
                  ? 'text-slate-500 hover:text-amber-600 hover:bg-slate-100'
                  : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/80'
              }`}
              title={`Chế độ kế tiếp: ${nextConfig.name}`}
              aria-label="Chế độ kế tiếp"
            >
              <motion.div
                animate={{
                  scale: isDragging && effectiveDrag < 0 ? (1 + dragProgress * 0.22) : 1,
                  x: isDragging && effectiveDrag < 0 ? (iconTranslateX * 0.5) : 0,
                }}
                transition={springPhysicsConfig}
                className="flex items-center gap-1"
              >
                {isDragging && effectiveDrag < -10 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: 1,
                      scale: iconScale,
                      x: iconTranslateX * 0.3,
                    }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={springPhysicsConfig}
                    className={`w-4 h-4 rounded-full bg-gradient-to-tr ${nextConfig.color} flex items-center justify-center text-white shadow-xs shrink-0`}
                  >
                    {React.createElement(nextConfig.icon, { size: 9 })}
                  </motion.div>
                )}
                <ChevronRight size={14} />
              </motion.div>
            </button>

            {/* Quick Switcher Grid Button */}
            <button
              id="btn-mode-dock-grid-sheet"
              type="button"
              onClick={handleOpenSheet}
              className={`p-1.5 rounded-full transition-all active:scale-85 cursor-pointer text-amber-500 hover:bg-amber-500/10`}
              title="Bảng chọn tất cả chế độ"
              aria-label="Bảng chọn tất cả chế độ"
            >
              <LayoutGrid size={13} />
            </button>

            {/* Minimize toggle */}
            <button
              id="btn-mode-dock-minimize"
              type="button"
              onClick={handleToggleExpand}
              className="p-1 rounded-full text-zinc-400 hover:text-zinc-200 transition-colors ml-0.5 cursor-pointer"
              title="Thu nhỏ thanh điều hướng"
              aria-label="Thu nhỏ thanh điều hướng"
            >
              <Minimize2 size={11} />
            </button>
          </motion.div>
        ) : (
          /* ========================================================================= */
          /* MINIMIZED MICRO-CAPSULE: 28px height, ultra-discreet, zero canvas clutter */
          /* ========================================================================= */
          <button
            id="btn-mode-dock-expand-micro"
            type="button"
            onClick={handleToggleExpand}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-xl border shadow-lg transition-all active:scale-95 cursor-pointer ${
              isLight
                ? 'bg-white/90 text-slate-700 border-slate-300/80 hover:bg-white'
                : 'bg-zinc-950/85 text-zinc-300 border-zinc-800/90 hover:bg-zinc-950 ring-1 ring-white/5'
            }`}
            title="Chạm để mở thanh điều hướng chế độ"
            aria-label="Mở thanh điều hướng chế độ"
          >
            <div className="relative flex flex-col items-center">
              <motion.div
                animate={{
                  x: iconTranslateX * 0.6,
                  scale: iconScale,
                }}
                transition={springPhysicsConfig}
                className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentConfig.color} shadow-sm animate-pulse`}
              />
              <AnimatePresence>
                {effectiveThresholdMet && activeTargetMode && (
                  <motion.div
                    id="micro-target-mode-shortname-badge"
                    initial={{ opacity: 0, y: -2, scale: 0.85 }}
                    animate={{ opacity: 1, y: 2, scale: 1 }}
                    exit={{ opacity: 0, y: -2, scale: 0.85 }}
                    transition={springPhysicsConfig}
                    className="absolute top-full left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center"
                  >
                    <div className="w-1 h-1 rotate-45 bg-amber-400 -mb-0.5" />
                    <span className="text-[8px] leading-tight font-black tracking-tight whitespace-nowrap px-1 py-0.2 rounded shadow bg-amber-400 text-black border border-amber-300 font-mono">
                      {activeTargetMode.shortName || activeTargetMode.name}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span className="text-[11px] font-bold tracking-tight truncate max-w-[100px]">
              {currentConfig.shortName || currentConfig.name}
            </span>
            <span className="text-[9px] text-amber-500 font-mono font-bold">
              {currentIndex + 1}/{modes.length}
            </span>
            <Maximize2 size={10} className="text-zinc-400 ml-0.5" />
          </button>
        )}
      </nav>
      )}

      {/* 3. High-Craft Quick Mode Switcher Sheet (Bảng chọn chế độ siêu tốc & tối ưu diện tích) */}
      <AnimatePresence>
        {isQuickSwitcherOpen && (
          <div
            id="quick-mode-switcher-backdrop"
            className="fixed inset-0 z-[120] flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsQuickSwitcherOpen(false)}
          >
            <motion.div
              id="quick-mode-switcher-sheet"
              initial={{ y: '100%', opacity: 0.9 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl border p-4 sm:p-5 shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden ${
                isLight
                  ? 'bg-white text-slate-900 border-slate-200 shadow-slate-900/20'
                  : 'bg-zinc-950 text-white border-zinc-800 shadow-black ring-1 ring-zinc-700/50'
              }`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between gap-2 pb-3 border-b mb-3 ${
                isLight ? 'border-slate-200' : 'border-zinc-800/60'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 shrink-0 shadow-inner">
                    <LayoutGrid size={16} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-black leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Chuyển Chế Độ Hệ Sinh Thái
                    </h3>
                    <p className={`text-[11px] leading-tight ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                      13 Chế độ đa nhiệm • Phím tắt 1-9 • Chạm để chuyển
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsQuickSwitcherOpen(false)}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-800' : 'hover:bg-zinc-800/60 text-zinc-400 hover:text-white'
                  }`}
                  aria-label="Đóng bảng chọn"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-3">
                <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isLight ? 'text-slate-400' : 'text-zinc-400'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm nhanh chế độ (3D, AI, Audio, Games, Thu chi...)"
                  className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium border outline-none transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white'
                      : 'bg-zinc-900/90 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/60'
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold ${
                      isLight ? 'text-slate-400 hover:text-slate-800' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Xoá
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-2 mb-3 shrink-0">
                {[
                  { id: 'all', label: 'Tất cả (13)' },
                  { id: '3d_ai', label: '🌌 3D & AI' },
                  { id: 'media', label: '🎵 Âm nhạc & MXH' },
                  { id: 'finance', label: '💼 Quản trị & VIP' },
                  { id: 'portal', label: '🏛️ Trang chủ' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      haptics.selection();
                      setSelectedCategory(cat.id as any);
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-amber-500 text-black shadow-sm'
                        : isLight
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Modes Grid */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2 min-h-0">
                {categorizedModes.map((mode, idx) => {
                  const isCurrent = mode.id === currentMode;
                  return (
                    <div
                      key={mode.id}
                      onClick={() => {
                        handleSelectMode(mode.id);
                        setIsQuickSwitcherOpen(false);
                      }}
                      className={`group relative flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${
                        isCurrent
                          ? isLight
                            ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/30 shadow-sm'
                            : 'bg-amber-500/10 border-amber-500/60 ring-2 ring-amber-500/30 shadow-sm'
                          : isLight
                          ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
                          : 'bg-zinc-900/70 hover:bg-zinc-800/80 border-zinc-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr ${mode.color} text-white shadow-md shrink-0 group-hover:scale-105 transition-transform`}
                        >
                          {React.createElement(mode.icon, { size: 17 })}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className={`text-xs font-bold leading-snug truncate ${
                            isCurrent
                              ? isLight ? 'text-amber-700 font-black' : 'text-amber-400 font-black'
                              : isLight
                              ? 'text-slate-900'
                              : 'text-zinc-100'
                          }`}>
                            {mode.name}
                          </span>
                          <span className={`text-[10px] leading-snug truncate ${
                            isLight ? 'text-slate-500' : 'text-zinc-400'
                          }`}>
                            {mode.badge}
                          </span>
                        </div>
                      </div>

                      {/* Right Action / Active Indicator & Shortcut Badge */}
                      <div className="shrink-0 ml-2 flex items-center gap-1.5">
                        {idx < 9 && (
                          <span className={`hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                            isLight ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                          }`}>
                            {idx + 1}
                          </span>
                        )}
                        {isCurrent ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black shadow-sm">
                            <Check size={11} className="stroke-[3]" />
                            Đang mở
                          </span>
                        ) : (
                          <span className={`text-[11px] transition-all ${
                            isLight ? 'text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5' : 'text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-0.5'
                          }`}>
                            <ArrowRight size={14} />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {categorizedModes.length === 0 && (
                  <div className={`col-span-full py-8 text-center text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    Không tìm thấy chế độ phù hợp với từ khoá "{searchQuery}".
                  </div>
                )}
              </div>

              {/* Bottom Quick-Action Bar */}
              <div className={`mt-3 pt-3 border-t flex items-center justify-between text-xs ${
                isLight ? 'border-slate-200 text-slate-500' : 'border-zinc-800/60 text-zinc-400'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickSwitcherOpen(false);
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('haevy-open-full-ecosystem-modal'));
                    }
                  }}
                  className={`text-[11px] transition-colors underline cursor-pointer font-medium ${
                    isLight ? 'text-slate-600 hover:text-amber-600' : 'text-zinc-400 hover:text-amber-400'
                  }`}
                >
                  📖 Thông tin chi tiết 13 chế độ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSelectMode(currentMode === 'space' ? 'audio' : 'space');
                    setIsQuickSwitcherOpen(false);
                  }}
                  className={`font-bold text-[11px] cursor-pointer flex items-center gap-1 ${
                    isLight ? 'text-amber-600 hover:text-amber-700' : 'text-amber-500 hover:text-amber-400'
                  }`}
                >
                  {currentMode === 'space' ? '🎧 Sang Audio' : '✨ Sang Haevy Space'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default MobileSwipeModeHUD;
