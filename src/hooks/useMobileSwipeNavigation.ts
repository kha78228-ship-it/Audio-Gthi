import { useState, useEffect, useRef, useCallback } from 'react';
import { haptics } from '../utils/haptics';

export interface SwipeModeConfig {
  id: string;
  name: string;
  shortName: string;
  icon: any;
  color: string;
  badge: string;
}

export interface SwipeFeedbackState {
  targetMode: SwipeModeConfig;
  direction: 'left' | 'right';
  timestamp: number;
}

interface UseMobileSwipeNavigationOptions {
  currentMode: string;
  modes: SwipeModeConfig[];
  onSelectMode: (mode: string) => void;
  enabled?: boolean;
  minDistance?: number;
  maxTimeMs?: number;
}

/**
 * Mobile Touch Gesture Hook for Horizontal Swipe-to-Navigate between Ecosystem Modes
 * Optimized for mobile ergonomics with reduced drag distance and zero interference in 3D AR Space.
 */
export function useMobileSwipeNavigation({
  currentMode,
  modes,
  onSelectMode,
  enabled = true,
  minDistance = 30,
  maxTimeMs = 500,
}: UseMobileSwipeNavigationOptions) {
  const [swipeFeedback, setSwipeFeedback] = useState<SwipeFeedbackState | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isThresholdMet, setIsThresholdMet] = useState(false);

  // Tracking refs to avoid re-binding listeners
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isLockedVerticalRef = useRef(false);
  const isIgnoredTouchRef = useRef(false);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredThresholdHapticRef = useRef(false);

  // Current mode index
  const currentIndex = modes.findIndex(m => m.id === currentMode);

  // Helper to determine if element should ignore swipe navigation
  const shouldIgnoreTouchTarget = (target: EventTarget | null): boolean => {
    // In Haevy Space (3D AR / Air Studio / Canvas / Portal), horizontal dragging is strictly reserved for 3D camera & drawing!
    if (currentMode === 'space') {
      return true;
    }

    if (!target || !(target instanceof HTMLElement)) return false;

    // Strict non-swipe interactive controls or Haevy Space elements
    if (target.closest('#haevy-space-portal-hub, #haevy-spatial-canvas-root, .space-container, [data-space-canvas], .ar-camera-container')) {
      return true;
    }

    // Strict non-swipe interactive controls
    const ignoredSelector = [
      'input:not([type="button"]):not([type="submit"])',
      'textarea',
      'select',
      'canvas',
      '[contenteditable="true"]',
      '[data-no-swipe]',
      '.no-swipe',
      'input[type="range"]',
      '[role="slider"]',
      '.audio-scrubber',
      '.waveform-canvas',
      '[role="dialog"]',
      '.space-container',
      '#space-3d-canvas',
      '[data-space-canvas]',
      '.spatial-drawing-area',
      '.three-canvas',
      '.ar-camera-container',
      '.drawing-canvas'
    ].join(',');

    if (target.closest(ignoredSelector)) {
      return true;
    }

    // Check if user is touching inside a scrollable container that is currently scrollable horizontally
    let el: HTMLElement | null = target;
    while (el && el !== document.body) {
      if (el.hasAttribute('data-no-swipe') || el.classList.contains('no-swipe')) {
        return true;
      }
      const overflowX = window.getComputedStyle(el).overflowX;
      if ((overflowX === 'auto' || overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 5) {
        // Only ignore if the element has actual horizontal scroll room
        return true;
      }
      el = el.parentElement;
    }

    return false;
  };

  const getAdjacentMode = useCallback(
    (direction: 'next' | 'prev') => {
      if (modes.length === 0) return null;
      let targetIndex: number;
      if (currentIndex === -1) {
        targetIndex = 0;
      } else if (direction === 'next') {
        targetIndex = (currentIndex + 1) % modes.length;
      } else {
        targetIndex = (currentIndex - 1 + modes.length) % modes.length;
      }
      return modes[targetIndex];
    },
    [currentIndex, modes]
  );

  const triggerNavigation = useCallback(
    (direction: 'next' | 'prev') => {
      const target = getAdjacentMode(direction);
      if (!target || target.id === currentMode) return;

      // Set swipe feedback
      setSwipeDirection(direction === 'next' ? 'left' : 'right');
      setSwipeFeedback({
        targetMode: target,
        direction: direction === 'next' ? 'left' : 'right',
        timestamp: Date.now(),
      });

      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      feedbackTimeoutRef.current = setTimeout(() => {
        setSwipeFeedback(null);
        setSwipeDirection(null);
      }, 1400);

      onSelectMode(target.id);
    },
    [currentMode, getAdjacentMode, onSelectMode]
  );

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Only apply for touch-capable devices or mobile viewport (<= 1024px)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];

      // Check if starting touch is on an interactive/scrollable element
      if (shouldIgnoreTouchTarget(e.target)) {
        isIgnoredTouchRef.current = true;
        return;
      }

      // Avoid edge zones (first 15px) to respect native OS back/forward swipe gestures
      if (touch.clientX < 15 || touch.clientX > window.innerWidth - 15) {
        isIgnoredTouchRef.current = true;
        return;
      }

      isIgnoredTouchRef.current = false;
      isLockedVerticalRef.current = false;
      hasTriggeredThresholdHapticRef.current = false;
      setIsThresholdMet(false);
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      setIsSwiping(false);
      setDragOffset(0);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current || isIgnoredTouchRef.current) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // If already decided to be a vertical scroll, ignore completely
      if (isLockedVerticalRef.current) return;

      // Determine intent on movement
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Prioritize vertical scrolling: any slight upward or downward intent locks vertical immediately
      if (absY > 8 || (absY > 5 && absY >= absX * 0.6)) {
        isLockedVerticalRef.current = true;
        setIsSwiping(false);
        setDragOffset(0);
        setIsThresholdMet(false);
        return;
      }

      // Only enter swiping mode if horizontal movement is overwhelmingly dominant
      if (absX > 18 && absX > absY * 2.2) {
        setIsSwiping(true);
        // Fluid spring curve optimized for smaller phone screens: responsive with quick tactile feel
        const damped = Math.sign(deltaX) * (absX < 36 ? absX * 0.65 : 23.4 + Math.pow(absX - 36, 0.62));
        setDragOffset(damped);

        const thresholdReached = absX >= minDistance;
        setIsThresholdMet(thresholdReached);

        // Tactile threshold crossing feedback managed in MobileSwipeModeHUD to prevent duplicate vibrations
        if (thresholdReached && !hasTriggeredThresholdHapticRef.current) {
          hasTriggeredThresholdHapticRef.current = true;
        } else if (!thresholdReached && hasTriggeredThresholdHapticRef.current) {
          hasTriggeredThresholdHapticRef.current = false;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || isIgnoredTouchRef.current || isLockedVerticalRef.current) {
        touchStartRef.current = null;
        setIsSwiping(false);
        setDragOffset(0);
        setIsThresholdMet(false);
        hasTriggeredThresholdHapticRef.current = false;
        return;
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const elapsed = Date.now() - touchStartRef.current.time;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      const velocity = absX / elapsed;

      // Strict conditions for horizontal mode swipe on mobile:
      // Must NOT have vertical movement (> 15px is vertical scroll, never swipe mode)
      // Must be horizontally dominant (absX > absY * 2.2)
      // Distance must meet minDistance (or strong deliberate flick)
      const isVerticalMotion = absY > 15 || absY >= absX * 0.5;
      const isDistanceMet = absX >= Math.max(minDistance, 50);
      const isDeliberateFlick = velocity >= 0.35 && absX >= 35;
      const isHorizontalDominant = absX > absY * 2.2;
      const isWithinTime = elapsed <= maxTimeMs;

      if (!isVerticalMotion && (isDistanceMet || isDeliberateFlick) && isHorizontalDominant && isWithinTime) {
        if (deltaX < 0) {
          // Swipe Left -> Next mode
          triggerNavigation('next');
        } else {
          // Swipe Right -> Previous mode
          triggerNavigation('prev');
        }
      }

      touchStartRef.current = null;
      setIsSwiping(false);
      setDragOffset(0);
      setIsThresholdMet(false);
      hasTriggeredThresholdHapticRef.current = false;
    };

    const handleTouchCancel = () => {
      touchStartRef.current = null;
      isIgnoredTouchRef.current = false;
      isLockedVerticalRef.current = false;
      setIsSwiping(false);
      setDragOffset(0);
      setIsThresholdMet(false);
      hasTriggeredThresholdHapticRef.current = false;
    };

    // Attach passive listeners to document for full-screen edge-to-edge responsiveness
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    // Keyboard shortcuts: Alt + ArrowLeft (prev mode), Alt + ArrowRight (next mode)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, [contenteditable="true"]')) {
        return;
      }
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        triggerNavigation('prev');
      } else if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        triggerNavigation('next');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchCancel);
      window.removeEventListener('keydown', handleKeyDown);
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, [enabled, minDistance, maxTimeMs, triggerNavigation]);

  return {
    swipeFeedback,
    swipeDirection,
    isSwiping,
    dragOffset,
    isThresholdMet,
    currentIndex,
    totalModes: modes.length,
    nextMode: getAdjacentMode('next'),
    prevMode: getAdjacentMode('prev'),
    targetPreviewMode: isSwiping && Math.abs(dragOffset) > 12 
      ? (dragOffset < 0 ? getAdjacentMode('next') : getAdjacentMode('prev')) 
      : null,
    triggerNext: () => triggerNavigation('next'),
    triggerPrev: () => triggerNavigation('prev'),
    triggerFeedbackForMode: (modeId: string) => {
      const target = modes.find(m => m.id === modeId);
      if (target) {
        haptics.modeSwitch();
        setSwipeFeedback({
          targetMode: target,
          direction: 'left',
          timestamp: Date.now(),
        });
        if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = setTimeout(() => {
          setSwipeFeedback(null);
          setSwipeDirection(null);
        }, 1400);
      }
    },
  };
}
