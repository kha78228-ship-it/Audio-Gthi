/**
 * Haptic Vibration Feedback Utility for Haevy Mobile Experience
 * Utilizes the Web Vibration API (navigator.vibrate) with safe fallbacks and graceful degradation.
 */

export type HapticType = 
  | 'selection' 
  | 'light' 
  | 'medium' 
  | 'heavy' 
  | 'toggle' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'modeSwitch' 
  | 'rewardClaim';

// Pre-defined haptic vibration patterns (in milliseconds)
export const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  // Ultra-light micro-tick (tab change, slider tick, chip click)
  selection: 8,

  // Crisp subtle tap (standard button click, icon toggle)
  light: 14,

  // Medium physical click (card selection, menu open, dialog confirm)
  medium: 24,

  // Heavy prominent impact (primary CTA, entering 3D space, chain lock toggle)
  heavy: 45,

  // Play/Pause audio toggle feedback
  toggle: 20,

  // Multi-pulse celebration (claiming coins, gift unlock, success modal)
  success: [15, 60, 25],

  // Distinct double pulse for warning / reminder
  warning: [30, 40, 30],

  // Rapid triple pulse for invalid input or error state
  error: [40, 50, 40, 50, 40],

  // Smooth double tap when switching ecosystem modes
  modeSwitch: [18, 40, 24],

  // Rich celebration rumble for rewards & 500 Coin Airdrop
  rewardClaim: [20, 50, 30, 60, 45],
};

/**
 * Triggers a vibration pattern if supported by the client device & browser.
 * Safely guards against non-supported environments, desktop, or iframe security limits.
 */
export function triggerHaptic(type: HapticType = 'light'): boolean {
  if (typeof window === 'undefined' || !('navigator' in window)) {
    return false;
  }

  try {
    if (typeof navigator.vibrate === 'function') {
      const pattern = HAPTIC_PATTERNS[type];
      return navigator.vibrate(pattern);
    }
  } catch (err) {
    // Silently ignore permission/sandbox errors on restricted iframes or devices
  }
  return false;
}

// Convenient shorthand helpers
export const haptics = {
  selection: () => triggerHaptic('selection'),
  light: () => triggerHaptic('light'),
  medium: () => triggerHaptic('medium'),
  heavy: () => triggerHaptic('heavy'),
  toggle: () => triggerHaptic('toggle'),
  success: () => triggerHaptic('success'),
  warning: () => triggerHaptic('warning'),
  error: () => triggerHaptic('error'),
  modeSwitch: () => triggerHaptic('modeSwitch'),
  rewardClaim: () => triggerHaptic('rewardClaim'),
  impact: (type: 'light' | 'medium' | 'heavy' = 'light') => triggerHaptic(type),
};

export default haptics;
