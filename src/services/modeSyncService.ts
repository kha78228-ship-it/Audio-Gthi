import { EcosystemMode, ActiveTab } from '../types';
import { triggerHaptic } from '../utils/haptics';
import { ALL_ECOSYSTEM_MODES, getEcosystemModeConfig, EcosystemModeConfig } from '../data/ecosystemModes';
import { recordModeInteraction } from './ecosystemUsageService';

export const MODE_STORAGE_KEY = 'haevy_active_ecosystem_mode';
export const MODE_PREV_STORAGE_KEY = 'haevy_prev_ecosystem_mode';
export const MODE_SYNC_EVENT = 'haevy-sync-mode-change';
export const MODE_TRANSITION_EVENT = 'haevy-show-mode-transition-hud';

export interface ModeTransitionDetail {
  mode: EcosystemMode;
  initialTab?: ActiveTab | string;
  source?: string;
  config: EcosystemModeConfig;
  timestamp: number;
}

// Gentle Web Audio API chime for mode transition (subtle, elegant, non-intrusive)
let audioCtx: AudioContext | null = null;
function playModeTransitionChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioCtx) {
      audioCtx = new AudioCtx();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, now); // 528Hz Solfeggio tone of transformation
    osc.frequency.exponentialRampToValueAtTime(792, now + 0.12);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch {
    // Graceful silence on restricted autoplay
  }
}

/**
 * Get initial ecosystem mode from localStorage or default to 'portal'
 */
export function getSavedEcosystemMode(): EcosystemMode {
  if (typeof window === 'undefined') return 'portal';
  try {
    const saved = localStorage.getItem(MODE_STORAGE_KEY);
    if (saved && ALL_ECOSYSTEM_MODES.some(m => m.id === saved)) {
      return saved as EcosystemMode;
    }
  } catch {
    // fallback
  }
  return 'portal';
}

/**
 * Switch ecosystem mode with synchronized state, transition HUD, audio feedback & haptics
 */
export function switchEcosystemMode(
  targetMode: EcosystemMode,
  initialTab?: ActiveTab | string,
  source: string = 'user_action'
) {
  if (typeof window === 'undefined') return;

  const currentMode = getSavedEcosystemMode();
  if (currentMode !== targetMode) {
    try {
      localStorage.setItem(MODE_PREV_STORAGE_KEY, currentMode);
      localStorage.setItem(MODE_STORAGE_KEY, targetMode);
    } catch {
      // ignore
    }
  }

  // Record telemetry interaction
  recordModeInteraction(targetMode);

  // 1. Trigger haptics
  triggerHaptic('modeSwitch');

  // 2. Play subtle chime
  playModeTransitionChime();

  const config = getEcosystemModeConfig(targetMode);

  // 3. Dispatch Synchronized Event across all components
  window.dispatchEvent(
    new CustomEvent(MODE_SYNC_EVENT, {
      detail: {
        mode: targetMode,
        initialTab,
        source,
        config,
        timestamp: Date.now(),
      } as ModeTransitionDetail,
    })
  );

  // 4. Dispatch Transition HUD Event for animated cross-mode feedback
  window.dispatchEvent(
    new CustomEvent(MODE_TRANSITION_EVENT, {
      detail: {
        mode: targetMode,
        initialTab,
        source,
        config,
        timestamp: Date.now(),
      } as ModeTransitionDetail,
    })
  );
}

/**
 * Get the previous mode if user wants to quickly hop back
 */
export function getPreviousEcosystemMode(): EcosystemMode | null {
  if (typeof window === 'undefined') return null;
  try {
    const prev = localStorage.getItem(MODE_PREV_STORAGE_KEY);
    if (prev && ALL_ECOSYSTEM_MODES.some(m => m.id === prev)) {
      return prev as EcosystemMode;
    }
  } catch {
    // ignore
  }
  return null;
}
