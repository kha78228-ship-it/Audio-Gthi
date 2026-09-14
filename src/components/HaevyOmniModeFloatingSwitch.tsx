import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Grid,
  GripVertical,
  RotateCcw,
  X
} from 'lucide-react';
import { EcosystemMode, ActiveTab } from '../types';
import { ALL_ECOSYSTEM_MODES, getEcosystemModeConfig } from '../data/ecosystemModes';
import { switchEcosystemMode } from '../services/modeSyncService';
import { useModeBadges } from '../context/ModeBadgeContext';
import { triggerHaptic } from '../utils/haptics';

const POSITION_STORAGE_KEY = 'haevy_floating_switch_pos_v2';
const MINIMIZED_STORAGE_KEY = 'haevy_floating_switch_minimized';

interface Coordinates {
  x: number;
  y: number;
}

interface HaevyOmniModeFloatingSwitchProps {
  currentMode: EcosystemMode;
  onOpenQuickSwitcher: () => void;
  onSelectMode: (mode: EcosystemMode, initialTab?: ActiveTab | string) => void;
  onClose?: () => void;
  variant?: 'floating' | 'header_dock' | 'compact_pill';
  className?: string;
}

export function HaevyOmniModeFloatingSwitch({
  currentMode,
  onOpenQuickSwitcher,
  onSelectMode,
  onClose,
  variant = 'floating',
  className = '',
}: HaevyOmniModeFloatingSwitchProps) {
  const { totalBadgesCount } = useModeBadges();
  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(MINIMIZED_STORAGE_KEY) === 'true';
  });

  const widgetRef = useRef<HTMLDivElement>(null);

  // Default coordinate calculation based on viewport
  const getDefaultPosition = useCallback((minimized: boolean): Coordinates => {
    if (typeof window === 'undefined') return { x: 100, y: 74 };
    const width = window.innerWidth;
    const widgetWidth = minimized ? 52 : Math.min(290, width - 24);
    const defaultX = Math.max(12, width - widgetWidth - 16);
    const defaultY = 74;
    return { x: defaultX, y: defaultY };
  }, []);

  // Clamping within window viewport with safe margins
  const clampPosition = useCallback((x: number, y: number, minimized: boolean): Coordinates => {
    if (typeof window === 'undefined') return { x, y };
    const widgetWidth = minimized ? 52 : (widgetRef.current?.offsetWidth || 280);
    const widgetHeight = minimized ? 52 : (widgetRef.current?.offsetHeight || 48);

    const minX = 8;
    const minY = 8;
    const maxX = Math.max(minX, window.innerWidth - widgetWidth - 8);
    const maxY = Math.max(minY, window.innerHeight - widgetHeight - 8);

    return {
      x: Math.min(Math.max(minX, x), maxX),
      y: Math.min(Math.max(minY, y), maxY),
    };
  }, []);

  // Position state
  const [position, setPosition] = useState<Coordinates>(() => {
    if (typeof window === 'undefined') return { x: 100, y: 74 };
    try {
      const saved = localStorage.getItem(POSITION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return { x: Math.max(12, window.innerWidth - 306), y: 74 };
  });

  const latestPositionRef = useRef<Coordinates>(position);
  latestPositionRef.current = position;

  const [isDragging, setIsDragging] = useState(false);
  const dragInfoRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    hasMoved: boolean;
  }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    hasMoved: false,
  });

  const currentModeConfig = getEcosystemModeConfig(currentMode);
  const CurrentIcon = currentModeConfig.icon;
  const currentIndex = ALL_ECOSYSTEM_MODES.findIndex(m => m.id === currentMode);

  // Save minimized state to localStorage
  const handleToggleMinimize = (minimized: boolean) => {
    setIsMinimized(minimized);
    try {
      localStorage.setItem(MINIMIZED_STORAGE_KEY, String(minimized));
    } catch {
      // ignore
    }
  };

  // Reset position to default top-right
  const handleResetPosition = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    triggerHaptic('light');
    const defaultPos = getDefaultPosition(isMinimized);
    setPosition(defaultPos);
    latestPositionRef.current = defaultPos;
    try {
      localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(defaultPos));
    } catch {
      // ignore
    }
  };

  // Keep widget inside viewport on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => {
        const clamped = clampPosition(prev.x, prev.y, isMinimized);
        latestPositionRef.current = clamped;
        return clamped;
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampPosition, isMinimized]);

  // Pointer drag event handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only handle primary pointer (left mouse button or touch)
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    dragInfoRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: latestPositionRef.current.x,
      initialY: latestPositionRef.current.y,
      hasMoved: false,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - dragInfoRef.current.startX;
      const dy = moveEvent.clientY - dragInfoRef.current.startY;

      // Threshold to distinguish dragging from tapping
      if (!dragInfoRef.current.hasMoved && Math.hypot(dx, dy) > 4) {
        dragInfoRef.current.hasMoved = true;
        setIsDragging(true);
        triggerHaptic('selection');
      }

      if (dragInfoRef.current.hasMoved) {
        const nextX = dragInfoRef.current.initialX + dx;
        const nextY = dragInfoRef.current.initialY + dy;
        const clamped = clampPosition(nextX, nextY, isMinimized);
        latestPositionRef.current = clamped;
        setPosition(clamped);
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);

      if (dragInfoRef.current.hasMoved) {
        setIsDragging(false);
        triggerHaptic('light');
        // Persist final dragged coordinates
        try {
          localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(latestPositionRef.current));
        } catch {
          // ignore
        }
        // Small timeout to prevent child buttons from triggering click
        setTimeout(() => {
          dragInfoRef.current.hasMoved = false;
        }, 120);
      } else {
        setIsDragging(false);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  const handleGoPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dragInfoRef.current.hasMoved) return;
    triggerHaptic('modeSwitch');
    const prevIdx = currentIndex <= 0 ? ALL_ECOSYSTEM_MODES.length - 1 : currentIndex - 1;
    const target = ALL_ECOSYSTEM_MODES[prevIdx];
    switchEcosystemMode(target.id, target.defaultTab, 'omni_dock');
    onSelectMode(target.id, target.defaultTab);
  };

  const handleGoNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dragInfoRef.current.hasMoved) return;
    triggerHaptic('modeSwitch');
    const nextIdx = currentIndex >= ALL_ECOSYSTEM_MODES.length - 1 ? 0 : currentIndex + 1;
    const target = ALL_ECOSYSTEM_MODES[nextIdx];
    switchEcosystemMode(target.id, target.defaultTab, 'omni_dock');
    onSelectMode(target.id, target.defaultTab);
  };

  // Header dock variant (non-floating static layout)
  if (variant === 'header_dock') {
    return (
      <div className={`flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-lg backdrop-blur-xl shrink-0 ${className}`}>
        {/* Prev Mode */}
        <button
          type="button"
          onClick={handleGoPrev}
          className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all cursor-pointer active:scale-95"
          title="Chuyển sang phân hệ trước"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Center Mode Trigger */}
        <button
          type="button"
          onClick={onOpenQuickSwitcher}
          className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-700/60 hover:border-amber-500/50 text-left transition-all cursor-pointer group shadow-sm"
          title="Bấm để mở danh sách 13 phân hệ hệ sinh thái (Alt + M)"
        >
          <div className={`w-5 h-5 rounded-lg bg-gradient-to-tr ${currentModeConfig.color} p-0.5 shrink-0`}>
            <div className="w-full h-full bg-zinc-950 rounded-[6px] flex items-center justify-center">
              <CurrentIcon size={11} className={currentModeConfig.accentColor} />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-white group-hover:text-amber-300 transition-colors leading-tight">
              {currentModeConfig.shortName}
            </span>
            <span className="text-[9px] text-zinc-400 leading-tight">
              Đồng bộ phân hệ
            </span>
          </div>
          <Grid size={12} className="text-zinc-500 group-hover:text-amber-400 ml-1 shrink-0" />
        </button>

        {/* Next Mode */}
        <button
          type="button"
          onClick={handleGoNext}
          className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all cursor-pointer active:scale-95"
          title="Chuyển sang phân hệ tiếp theo"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  // =========================================================================
  // FLOATING DRAGGABLE VARIANT (MINIMIZED CIRCULAR BUBBLE)
  // =========================================================================
  if (isMinimized) {
    return (
      <div
        ref={widgetRef}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
        onDoubleClick={handleResetPosition}
        onClick={() => {
          if (dragInfoRef.current.hasMoved) return;
          triggerHaptic('selection');
          handleToggleMinimize(false);
        }}
        className={`z-[999] select-none cursor-grab active:cursor-grabbing ${className}`}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: isDragging ? 1.15 : 1,
            opacity: 1,
          }}
          transition={{ duration: 0.15 }}
          className={`relative flex items-center justify-center p-3 rounded-full bg-zinc-950/95 border backdrop-blur-2xl transition-all ${
            isDragging
              ? 'border-amber-400 ring-4 ring-amber-500/50 shadow-2xl shadow-amber-500/60 scale-110'
              : 'border-amber-500/70 hover:border-amber-400 text-amber-400 shadow-2xl hover:shadow-amber-500/30'
          }`}
          title="Biểu tượng chuyển ứng dụng Haevy • Kéo thả để di chuyển khắp màn hình • Bấm để mở rộng • Nhấp đúp để đặt lại"
        >
          {/* Subtle Outer Pulse Glow */}
          <span className="absolute -inset-1.5 rounded-full bg-amber-500/20 blur-md pointer-events-none" />

          {/* Current Mode Icon */}
          <div className={`w-7 h-7 rounded-full bg-gradient-to-tr ${currentModeConfig.color} p-0.5 shadow-md`}>
            <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center">
              <CurrentIcon size={14} className={currentModeConfig.accentColor} />
            </div>
          </div>

          {/* Unread Badges Counter */}
          {totalBadgesCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse border border-zinc-950 shadow-md shadow-rose-500/50 pointer-events-none">
              {totalBadgesCount > 99 ? '99+' : totalBadgesCount}
            </span>
          )}

          {/* Floating Indicator Dots */}
          <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse border-2 border-zinc-950 pointer-events-none" />
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // FLOATING DRAGGABLE VARIANT (EXPANDED DOCK PILL)
  // =========================================================================
  return (
    <div
      ref={widgetRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none',
      }}
      onPointerDown={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('button')) return;
        handlePointerDown(e);
      }}
      onDoubleClick={handleResetPosition}
      className={`z-[999] select-none ${className}`}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{
          scale: isDragging ? 1.03 : 1,
          opacity: 1,
        }}
        transition={{ duration: 0.15 }}
        className={`flex items-center gap-1 p-1 sm:p-1.5 rounded-2xl bg-zinc-950/95 border backdrop-blur-2xl transition-all ${
          isDragging
            ? 'border-amber-400 ring-4 ring-amber-500/30 shadow-2xl shadow-amber-500/40 cursor-grabbing'
            : 'border-zinc-800 hover:border-amber-500/50 shadow-2xl ring-1 ring-white/10'
        }`}
      >
        {/* Drag Handle Grip - Dedicated touch/mouse grab area */}
        <div
          onPointerDown={handlePointerDown}
          onDoubleClick={handleResetPosition}
          className="flex items-center justify-center px-1.5 py-1.5 cursor-grab active:cursor-grabbing text-amber-400 hover:text-amber-300 group/grip rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-all"
          title="Kéo thả để di chuyển biểu tượng khắp màn hình • Nhấp đúp để đặt lại góc trên"
        >
          <GripVertical size={15} className="group-hover/grip:scale-110 transition-transform" />
        </div>

        {/* Quick Prev Button */}
        <button
          type="button"
          onClick={handleGoPrev}
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center text-zinc-400 hover:text-amber-300 hover:bg-zinc-800/80 transition-all cursor-pointer active:scale-90"
          title="Chuyển sang phân hệ trước"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Center Pill Button (Opens full quick switcher modal) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (dragInfoRef.current.hasMoved) return;
            triggerHaptic('selection');
            onOpenQuickSwitcher();
          }}
          className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700 text-left transition-all cursor-pointer group shadow-inner"
          title="Bấm để mở bảng đồng bộ 13 phân hệ (Alt + M)"
        >
          <div className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${currentModeConfig.color} p-0.5 shrink-0 shadow-sm`}>
            <div className="w-full h-full bg-zinc-950 rounded-[6px] flex items-center justify-center">
              <CurrentIcon size={12} className={currentModeConfig.accentColor} />
            </div>
          </div>

          <div className="flex flex-col min-w-0 pr-0.5">
            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-white group-hover:text-amber-300 transition-colors truncate max-w-[105px] sm:max-w-[130px]">
                {currentModeConfig.shortName}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </div>
            <span className="text-[9px] text-zinc-400 font-medium truncate flex items-center gap-1">
              <span>Đồng bộ</span>
              <span className="text-amber-400/80 font-mono">({currentIndex + 1}/13)</span>
            </span>
          </div>

          <Grid size={13} className="text-zinc-500 group-hover:text-amber-400 transition-colors ml-0.5 shrink-0" />
        </button>

        {/* Quick Next Button */}
        <button
          type="button"
          onClick={handleGoNext}
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center text-zinc-400 hover:text-amber-300 hover:bg-zinc-800/80 transition-all cursor-pointer active:scale-90"
          title="Chuyển sang phân hệ tiếp theo"
        >
          <ChevronRight size={14} />
        </button>

        {/* Reset Position Button (Appears if user wants to reset to corner) */}
        <button
          type="button"
          onClick={handleResetPosition}
          className="p-1 text-zinc-500 hover:text-amber-400 hover:bg-zinc-900 rounded-lg transition-colors"
          title="Đặt lại vị trí góc màn hình"
        >
          <RotateCcw size={11} />
        </button>

        {/* Minimize Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (dragInfoRef.current.hasMoved) return;
            triggerHaptic('selection');
            handleToggleMinimize(true);
          }}
          className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded-lg transition-colors"
          title="Thu nhỏ thành bong bóng nổi (có thể kéo di chuyển)"
        >
          <Minimize2 size={11} />
        </button>

        {/* Close Button (Optional) */}
        {onClose && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (dragInfoRef.current.hasMoved) return;
              triggerHaptic('light');
              onClose();
            }}
            className="p-1 text-zinc-600 hover:text-rose-400 hover:bg-zinc-900 rounded-lg transition-colors ml-0.5"
            title="Đóng nút nổi"
          >
            <X size={11} />
          </button>
        )}
      </motion.div>
    </div>
  );
}
