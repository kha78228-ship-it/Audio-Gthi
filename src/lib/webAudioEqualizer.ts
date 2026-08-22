/**
 * Web Audio API Equalizer & Audio Processing Engine
 * Provides multi-band BiquadFilter equalizer with presets:
 * - Bass Boost
 * - Acoustic
 * - Vocal (Vocal Clarity)
 * - Electronic
 * - Rock
 * - Flat / Normal
 * - Custom Multi-Band Tuning
 */

export type EqualizerPresetKey = 
  | 'flat' 
  | 'bass_boost' 
  | 'acoustic' 
  | 'vocal' 
  | 'electronic' 
  | 'rock' 
  | 'custom';

export interface EqualizerBandConfig {
  freq: number;
  label: string;
  type: BiquadFilterType;
  description: string;
}

export const EQUALIZER_BANDS: EqualizerBandConfig[] = [
  { freq: 60, label: '60 Hz', type: 'lowshelf', description: 'Sub Bass' },
  { freq: 150, label: '150 Hz', type: 'peaking', description: 'Bass / Kick' },
  { freq: 400, label: '400 Hz', type: 'peaking', description: 'Low Mids / Body' },
  { freq: 1000, label: '1 kHz', type: 'peaking', description: 'Vocal Presence' },
  { freq: 3500, label: '3.5 kHz', type: 'peaking', description: 'High Mids / Clarity' },
  { freq: 10000, label: '10 kHz', type: 'highshelf', description: 'Treble / Air' },
];

export interface PresetInfo {
  key: EqualizerPresetKey;
  name: string;
  subtitle: string;
  iconName: string;
  gains: number[]; // dB gains matching EQUALIZER_BANDS
  accentColor: string;
  badgeBg: string;
}

export const EQUALIZER_PRESETS: Record<EqualizerPresetKey, PresetInfo> = {
  flat: {
    key: 'flat',
    name: 'Flat / Chuẩn',
    subtitle: 'Âm thanh gốc cân bằng, nguyên bản',
    iconName: 'Equal',
    gains: [0, 0, 0, 0, 0, 0],
    accentColor: '#94a3b8',
    badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  },
  bass_boost: {
    key: 'bass_boost',
    name: 'Bass Boost',
    subtitle: 'Khuếch đại dải trầm uy lực, âm bass sâu chắc',
    iconName: 'Flame',
    gains: [9, 6, 2, 0, -1, -1],
    accentColor: '#f97316',
    badgeBg: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  },
  acoustic: {
    key: 'acoustic',
    name: 'Acoustic',
    subtitle: 'Trong trẻo, nổi bật tiếng đàn guitar, piano & dây',
    iconName: 'Music',
    gains: [2, 1, 1, 4, 6, 8],
    accentColor: '#06b6d4',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  },
  vocal: {
    key: 'vocal',
    name: 'Vocal Clarity',
    subtitle: 'Tôn giọng hát ca sĩ & lời thoại rõ nét',
    iconName: 'Mic',
    gains: [-3, 0, 2, 7, 5, 2],
    accentColor: '#a855f7',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
  electronic: {
    key: 'electronic',
    name: 'Electronic / EDM',
    subtitle: 'Âm thanh điện tử sôi động, bùng nổ năng lượng',
    iconName: 'Zap',
    gains: [8, 5, -2, 2, 5, 7],
    accentColor: '#ec4899',
    badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
  },
  rock: {
    key: 'rock',
    name: 'Rock & Metal',
    subtitle: 'Đậm chất rock với tiếng trống & guitar đanh thép',
    iconName: 'Radio',
    gains: [6, 3, -1, 3, 6, 5],
    accentColor: '#eab308',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  custom: {
    key: 'custom',
    name: 'Tùy Chỉnh (Custom)',
    subtitle: 'Tự do tinh chỉnh từng dải tần số theo ý muốn',
    iconName: 'Sliders',
    gains: [0, 0, 0, 0, 0, 0],
    accentColor: '#3b82f6',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  },
};

class WebAudioEqualizerManager {
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private filterNodes: BiquadFilterNode[] = [];
  private analyserNode: AnalyserNode | null = null;
  private preAmpGainNode: GainNode | null = null;
  private attachedElement: HTMLAudioElement | null = null;
  private isEnabled: boolean = true;
  private currentPreset: EqualizerPresetKey = 'flat';
  private currentGains: number[] = [0, 0, 0, 0, 0, 0];
  private listeners: Set<() => void> = new Set();
  private isInitialized: boolean = false;

  constructor() {
    // Read cached EQ preset from localStorage if available
    try {
      const savedPreset = localStorage.getItem('haevy_eq_preset') as EqualizerPresetKey;
      if (savedPreset && EQUALIZER_PRESETS[savedPreset]) {
        this.currentPreset = savedPreset;
        this.currentGains = [...EQUALIZER_PRESETS[savedPreset].gains];
      }
      const savedGains = localStorage.getItem('haevy_eq_gains');
      if (savedGains) {
        const parsed = JSON.parse(savedGains);
        if (Array.isArray(parsed) && parsed.length === EQUALIZER_BANDS.length) {
          this.currentGains = parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  public init(audioElement: HTMLAudioElement): boolean {
    if (!audioElement) return false;
    if (this.attachedElement === audioElement && this.isInitialized) {
      return true;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API is not supported in this browser.');
        return false;
      }

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        // Will resume upon user gesture
        const resumeOnUserGesture = () => {
          if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
          }
          window.removeEventListener('click', resumeOnUserGesture);
          window.removeEventListener('keydown', resumeOnUserGesture);
        };
        window.addEventListener('click', resumeOnUserGesture, { once: true });
        window.addEventListener('keydown', resumeOnUserGesture, { once: true });
      }

      // Check if already connected to source
      if (!this.sourceNode || this.attachedElement !== audioElement) {
        try {
          this.sourceNode = this.audioCtx.createMediaElementSource(audioElement);
          this.attachedElement = audioElement;
        } catch (e: any) {
          // If source node is already attached to this audio element, that's fine
          if (!this.sourceNode) {
            console.warn('Could not create MediaElementSource:', e);
            return false;
          }
        }
      }

      // Create Pre-Amp Gain Node
      this.preAmpGainNode = this.audioCtx.createGain();
      this.preAmpGainNode.gain.value = 1.0;

      // Create Filter Nodes for each band
      this.filterNodes = EQUALIZER_BANDS.map((band, idx) => {
        const filter = this.audioCtx!.createBiquadFilter();
        filter.type = band.type;
        filter.frequency.value = band.freq;
        filter.gain.value = this.isEnabled ? this.currentGains[idx] : 0;
        if (band.type === 'peaking') {
          filter.Q.value = 1.2;
        }
        return filter;
      });

      // Create Analyser Node for Real-Time Visualizer
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.82;

      // Connect nodes in series:
      // Source -> PreAmp -> Filter 0 -> Filter 1 -> ... -> Filter N -> Analyser -> Destination
      let lastNode: AudioNode = this.sourceNode;
      lastNode.connect(this.preAmpGainNode);
      lastNode = this.preAmpGainNode;

      for (const filter of this.filterNodes) {
        lastNode.connect(filter);
        lastNode = filter;
      }

      lastNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioCtx.destination);

      this.isInitialized = true;
      this.notifyListeners();
      return true;
    } catch (err) {
      console.warn('Error setting up Web Audio Equalizer:', err);
      return false;
    }
  }

  public resume(): Promise<void> {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      return this.audioCtx.resume();
    }
    return Promise.resolve();
  }

  public setPreset(presetKey: EqualizerPresetKey) {
    this.currentPreset = presetKey;
    const preset = EQUALIZER_PRESETS[presetKey];
    if (preset && presetKey !== 'custom') {
      this.currentGains = [...preset.gains];
      this.applyGainsToFilters();
    }
    try {
      localStorage.setItem('haevy_eq_preset', presetKey);
      localStorage.setItem('haevy_eq_gains', JSON.stringify(this.currentGains));
    } catch {
      // ignore
    }
    this.notifyListeners();
  }

  public setBandGain(index: number, gainDb: number) {
    if (index < 0 || index >= this.currentGains.length) return;
    const clampedGain = Math.max(-12, Math.min(12, Math.round(gainDb * 10) / 10));
    this.currentGains[index] = clampedGain;
    this.currentPreset = 'custom';
    this.applyGainsToFilters();
    try {
      localStorage.setItem('haevy_eq_preset', 'custom');
      localStorage.setItem('haevy_eq_gains', JSON.stringify(this.currentGains));
    } catch {
      // ignore
    }
    this.notifyListeners();
  }

  public resetToFlat() {
    this.setPreset('flat');
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    this.applyGainsToFilters();
    this.notifyListeners();
  }

  private applyGainsToFilters() {
    if (!this.filterNodes.length) return;
    this.filterNodes.forEach((filter, index) => {
      const targetGain = this.isEnabled ? (this.currentGains[index] || 0) : 0;
      if (this.audioCtx && filter.gain) {
        try {
          filter.gain.setTargetAtTime(targetGain, this.audioCtx.currentTime, 0.05);
        } catch {
          filter.gain.value = targetGain;
        }
      }
    });
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyserNode;
  }

  public getFrequencyData(array: Uint8Array): void {
    if (this.analyserNode) {
      this.analyserNode.getByteFrequencyData(array);
    }
  }

  public getTimeDomainData(array: Uint8Array): void {
    if (this.analyserNode) {
      this.analyserNode.getByteTimeDomainData(array);
    }
  }

  public getCurrentPreset(): EqualizerPresetKey {
    return this.currentPreset;
  }

  public getCurrentGains(): number[] {
    return [...this.currentGains];
  }

  public getIsActive(): boolean {
    return this.isEnabled;
  }

  public getIsInitialized(): boolean {
    return this.isInitialized;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(fn => fn());
  }
}

export const webAudioEqualizer = new WebAudioEqualizerManager();
