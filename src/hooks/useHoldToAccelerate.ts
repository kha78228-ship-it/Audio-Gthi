import { useRef, useState, useCallback, useEffect } from 'react';
import { haptics } from '../utils/haptics';

export interface UseHoldToAccelerateOptions {
  /**
   * Callback fired on each step.
   * @param stepMultiplier Scaled multiplier based on how long the user has held down (1, 1.8, 2.5, 3.5).
   * @param speedLevel Integer speed tier (1 = normal, 2 = fast, 3 = very fast, 4 = turbo).
   */
  onStep: (stepMultiplier: number, speedLevel: 1 | 2 | 3 | 4) => void;
  /**
   * Delay in milliseconds before continuous auto-repeat begins (default 260ms).
   */
  initialDelayMs?: number;
  /**
   * Initial repeat interval in milliseconds (default 130ms).
   */
  baseIntervalMs?: number;
  /**
   * Minimum repeat interval at maximum acceleration in milliseconds (default 30ms).
   */
  minIntervalMs?: number;
  /**
   * Whether the action is disabled.
   */
  disabled?: boolean;
}

export interface UseHoldToAccelerateReturn {
  isHolding: boolean;
  speedLevel: 1 | 2 | 3 | 4;
  bind: {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
    onTouchCancel: () => void;
    onContextMenu: (e: React.MouseEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onKeyUp: (e: React.KeyboardEvent) => void;
  };
  stop: () => void;
}

/**
 * Reusable hook to handle press-and-hold (long-press) with dynamic acceleration.
 * When the user holds down, the interval between steps decreases and the step multiplier ramps up,
 * allowing effortless and swift adjustment without repeated clicking.
 */
export function useHoldToAccelerate({
  onStep,
  initialDelayMs = 260,
  baseIntervalMs = 130,
  minIntervalMs = 30,
  disabled = false,
}: UseHoldToAccelerateOptions): UseHoldToAccelerateReturn {
  const [isHolding, setIsHolding] = useState(false);
  const [speedLevel, setSpeedLevel] = useState<1 | 2 | 3 | 4>(1);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const holdActiveRef = useRef<boolean>(false);
  const stepCountRef = useRef<number>(0);
  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    holdActiveRef.current = false;
    setIsHolding(false);
    setSpeedLevel(1);
    stepCountRef.current = 0;
  }, []);

  const scheduleNextTick = useCallback(() => {
    if (!holdActiveRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    
    // Dynamic acceleration curves:
    // Tier 1 (0ms - 550ms): 1x speed, interval ~120ms, multiplier 1.0
    // Tier 2 (550ms - 1300ms): 2x speed, interval ~70ms, multiplier 1.8
    // Tier 3 (1300ms - 2200ms): 3x speed, interval ~45ms, multiplier 2.5
    // Tier 4 (> 2200ms): 4x turbo speed, interval ~28ms, multiplier 3.8
    let interval = baseIntervalMs;
    let currentSpeed: 1 | 2 | 3 | 4 = 1;
    let stepMultiplier = 1;

    if (elapsed > 2200) {
      currentSpeed = 4;
      interval = minIntervalMs;
      stepMultiplier = 3.8;
    } else if (elapsed > 1300) {
      currentSpeed = 3;
      interval = Math.max(minIntervalMs, 45);
      stepMultiplier = 2.5;
    } else if (elapsed > 550) {
      currentSpeed = 2;
      interval = Math.max(minIntervalMs, 70);
      stepMultiplier = 1.8;
    } else {
      currentSpeed = 1;
      interval = baseIntervalMs;
      stepMultiplier = 1;
    }

    setSpeedLevel(currentSpeed);

    timerRef.current = setTimeout(() => {
      if (!holdActiveRef.current) return;

      stepCountRef.current += 1;
      onStepRef.current(stepMultiplier, currentSpeed);

      // Light haptic feedback periodically while accelerating
      if (stepCountRef.current % 2 === 0) {
        haptics.selection();
      }

      scheduleNextTick();
    }, interval);
  }, [baseIntervalMs, minIntervalMs]);

  const start = useCallback(() => {
    if (disabled) return;

    stop(); // Reset any existing timer
    holdActiveRef.current = true;
    setIsHolding(true);
    setSpeedLevel(1);
    startTimeRef.current = Date.now();
    stepCountRef.current = 0;

    // Apply immediate single step
    onStepRef.current(1, 1);
    haptics.selection();

    // Begin repeat loop after initial delay
    timerRef.current = setTimeout(() => {
      scheduleNextTick();
    }, initialDelayMs);
  }, [disabled, initialDelayMs, scheduleNextTick, stop]);

  // Global window listeners to ensure release is caught anywhere
  useEffect(() => {
    const handleGlobalRelease = () => {
      if (holdActiveRef.current) {
        stop();
      }
    };

    window.addEventListener('mouseup', handleGlobalRelease);
    window.addEventListener('touchend', handleGlobalRelease);
    window.addEventListener('touchcancel', handleGlobalRelease);
    window.addEventListener('blur', handleGlobalRelease);

    return () => {
      window.removeEventListener('mouseup', handleGlobalRelease);
      window.removeEventListener('touchend', handleGlobalRelease);
      window.removeEventListener('touchcancel', handleGlobalRelease);
      window.removeEventListener('blur', handleGlobalRelease);
      stop();
    };
  }, [stop]);

  return {
    isHolding,
    speedLevel,
    stop,
    bind: {
      onMouseDown: (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Primary click only
        start();
      },
      onMouseUp: stop,
      onMouseLeave: stop,
      onTouchStart: () => {
        start();
      },
      onTouchEnd: stop,
      onTouchCancel: stop,
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (!holdActiveRef.current) {
            e.preventDefault();
            start();
          }
        }
      },
      onKeyUp: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          stop();
        }
      }
    }
  };
}
