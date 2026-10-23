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
  description: string;
  iconName: string;
  gains: number[]; // dB gains matching EQUALIZER_BANDS
  accentColor: string;
  badgeBg: string;
  bestFor: string;
}

export const EQUALIZER_PRESETS: Record<EqualizerPresetKey, PresetInfo> = {
  flat: {
    key: 'flat',
    name: 'Flat / Chuẩn',
    subtitle: 'Âm thanh gốc cân bằng, nguyên bản',
    description: 'Tất cả các dải tần số ở mức 0 dB, phản ánh trung thực bản gốc của tác giả.',
    iconName: 'Equal',
    gains: [0, 0, 0, 0, 0, 0],
    accentColor: '#94a3b8',
    badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    bestFor: 'Kiểm âm, phối khí & nghe mộc',
  },
  bass_boost: {
    key: 'bass_boost',
    name: 'Bass Boost',
    subtitle: 'Khuếch đại dải trầm uy lực, âm bass sâu chắc',
    description: 'Đẩy mạnh dải Sub-bass (60Hz +9dB) và Bass Kick (150Hz +6dB), mang lại nhịp đập mãnh liệt và rung động sâu.',
    iconName: 'Flame',
    gains: [9, 6, 2, 0, -1, -1],
    accentColor: '#f97316',
    badgeBg: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    bestFor: 'EDM, Hip-hop, Trap & Nhạc sàn sôi động',
  },
  vocal: {
    key: 'vocal',
    name: 'Vocal Clarity',
    subtitle: 'Tôn giọng hát ca sĩ & lời thoại rõ nét',
    description: 'Cắt nhẹ dải trầm (-3dB) để tránh ù, tăng cường độ hiện diện ở 1kHz (+7dB) và độ sáng 3.5kHz (+5dB) cho giọng ca trong vắt.',
    iconName: 'Mic',
    gains: [-3, 0, 2, 7, 5, 2],
    accentColor: '#a855f7',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    bestFor: 'Truyện audio, Podcast, Pop Ballad & Sách nói',
  },
  acoustic: {
    key: 'acoustic',
    name: 'Acoustic',
    subtitle: 'Trong trẻo, nổi bật tiếng đàn guitar, piano & dây',
    description: 'Làm nổi bật chi tiết mộc mạc của dây đàn và phím piano với âm sắc cao vút 10kHz (+8dB) và dải trung hài hòa.',
    iconName: 'Music',
    gains: [2, 1, 1, 4, 6, 8],
    accentColor: '#06b6d4',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    bestFor: 'Guitar acoustic, Piano, Indie, Folk & Nhạc cụ mộc',
  },
  electronic: {
    key: 'electronic',
    name: 'Electronic / EDM',
    subtitle: 'Âm thanh điện tử sôi động, bùng nổ năng lượng',
    description: 'Tăng cường cả hai đầu dải tần số (Bass & Treble) theo đường cong nụ cười (V-shaped EQ) đặc trưng.',
    iconName: 'Zap',
    gains: [8, 5, -2, 2, 5, 7],
    accentColor: '#ec4899',
    badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    bestFor: 'Synthwave, House, Future Bass & Dance',
  },
  rock: {
    key: 'rock',
    name: 'Rock & Metal',
    subtitle: 'Đậm chất rock với tiếng trống & guitar đanh thép',
    description: 'Đẩy mạnh âm bass và dải mid-high nhằm thể hiện độ sắc nét của guitar điện và tiếng cymbal trống.',
    iconName: 'Radio',
    gains: [6, 3, -1, 3, 6, 5],
    accentColor: '#eab308',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    bestFor: 'Rock, Alternative, Hard Rock & Heavy Metal',
  },
  custom: {
    key: 'custom',
    name: 'Tùy Chỉnh (Custom)',
    subtitle: 'Tự do tinh chỉnh từng dải tần số theo ý muốn',
    description: 'Chế độ chuyên gia cho phép bạn tự thiết lập giá trị gain từ -12dB đến +12dB cho từng dải tần.',
    iconName: 'Sliders',
    gains: [0, 0, 0, 0, 0, 0],
    accentColor: '#3b82f6',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    bestFor: 'Tự do sáng tạo & Tối ưu theo tai nghe riêng',
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
  private isAuditionPlaying: boolean = false;
  private auditionTimer: any = null;

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

  /**
   * Initializes or returns the Web Audio Context and filter pipeline
   */
  public ensureContext(): boolean {
    if (this.audioCtx && this.isInitialized) {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
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
        this.audioCtx.resume();
      }

      // Create Pre-Amp Gain Node
      this.preAmpGainNode = this.audioCtx.createGain();
      this.preAmpGainNode.gain.value = 1.0;

      // Create 6-Band BiquadFilter Nodes
      this.filterNodes = EQUALIZER_BANDS.map((band, idx) => {
        const filter = this.audioCtx!.createBiquadFilter();
        filter.type = band.type;
        filter.frequency.value = band.freq;
        filter.gain.value = this.isEnabled ? this.currentGains[idx] : 0;
        if (band.type === 'peaking') {
          filter.Q.value = 1.25;
        }
        return filter;
      });

      // Create Analyser Node for Real-Time Frequency Spectrum Visualizer
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.82;

      // Connect filters in series:
      // preAmpGainNode -> Filter 0 -> Filter 1 -> ... -> Filter 5 -> Analyser -> Destination
      let lastNode: AudioNode = this.preAmpGainNode;
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
      console.warn('Error creating Web Audio context:', err);
      return false;
    }
  }

  /**
   * Connect an HTML Audio Element to the Web Audio DSP filter chain
   */
  public init(audioElement: HTMLAudioElement): boolean {
    if (!audioElement) return false;
    if (this.attachedElement === audioElement && this.sourceNode) {
      return true;
    }

    const contextReady = this.ensureContext();
    if (!contextReady || !this.audioCtx || !this.preAmpGainNode) {
      return false;
    }

    try {
      // Connect audio element source to preAmp
      if (!this.sourceNode || this.attachedElement !== audioElement) {
        try {
          this.sourceNode = this.audioCtx.createMediaElementSource(audioElement);
          this.attachedElement = audioElement;
          this.sourceNode.connect(this.preAmpGainNode);
        } catch (e: any) {
          // If already attached, ignore error
          if (!this.sourceNode) {
            console.warn('MediaElementSource already exists or failed:', e);
          }
        }
      }

      this.notifyListeners();
      return true;
    } catch (err) {
      console.warn('Error attaching audio element to Web Audio Equalizer:', err);
      return false;
    }
  }

  public resume(): Promise<void> {
    this.ensureContext();
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

  /**
   * Generates a rich multi-layer harmonic sound preview directly through
   * the Web Audio filter chain, allowing users to audition Bass Boost,
   * Vocal Clarity, and Acoustic in real time even without an active track.
   */
  public playAuditionSample(presetOverride?: EqualizerPresetKey) {
    this.ensureContext();
    if (!this.audioCtx || !this.preAmpGainNode) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (presetOverride && presetOverride !== this.currentPreset) {
      this.setPreset(presetOverride);
    }

    const now = this.audioCtx.currentTime;
    const duration = 2.8;

    this.isAuditionPlaying = true;
    if (this.auditionTimer) clearTimeout(this.auditionTimer);
    this.auditionTimer = setTimeout(() => {
      this.isAuditionPlaying = false;
      this.notifyListeners();
    }, duration * 1000);
    this.notifyListeners();

    // Layer 1: Sub Bass Kick / Thump (sweeps 110Hz -> 50Hz) - Demonstrates Bass Boost
    const oscBass = this.audioCtx.createOscillator();
    const bassGain = this.audioCtx.createGain();
    oscBass.type = 'sine';
    oscBass.frequency.setValueAtTime(110, now);
    oscBass.frequency.exponentialRampToValueAtTime(45, now + 0.35);
    oscBass.frequency.setValueAtTime(80, now + 0.5);
    oscBass.frequency.exponentialRampToValueAtTime(40, now + 0.9);
    oscBass.frequency.setValueAtTime(65, now + 1.2);
    oscBass.frequency.exponentialRampToValueAtTime(38, now + 1.8);

    bassGain.gain.setValueAtTime(0.45, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

    oscBass.connect(bassGain);
    bassGain.connect(this.preAmpGainNode);
    oscBass.start(now);
    oscBass.stop(now + 2.5);

    // Layer 2: Vocal Formant Chords (A4 440Hz, C#5 554Hz, E5 659Hz) - Demonstrates Vocal Clarity
    const chordFreqs = [440, 554.37, 659.25, 880];
    chordFreqs.forEach((freq, idx) => {
      const oscVocal = this.audioCtx!.createOscillator();
      const vocalGain = this.audioCtx!.createGain();
      oscVocal.type = idx % 2 === 0 ? 'triangle' : 'sawtooth';
      oscVocal.frequency.setValueAtTime(freq, now + idx * 0.12);

      vocalGain.gain.setValueAtTime(0.0001, now + idx * 0.12);
      vocalGain.gain.linearRampToValueAtTime(0.12, now + idx * 0.12 + 0.08);
      vocalGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      oscVocal.connect(vocalGain);
      vocalGain.connect(this.preAmpGainNode!);
      oscVocal.start(now + idx * 0.12);
      oscVocal.stop(now + 2.3);
    });

    // Layer 3: Acoustic Chimes / Shimmer (high harmonic overtone bells) - Demonstrates Acoustic Highs
    const acousticChimes = [1760, 2637, 3520, 5274, 7040];
    acousticChimes.forEach((f, i) => {
      const oscChime = this.audioCtx!.createOscillator();
      const chimeGain = this.audioCtx!.createGain();
      oscChime.type = 'sine';
      oscChime.frequency.setValueAtTime(f, now + 0.4 + i * 0.15);

      chimeGain.gain.setValueAtTime(0.0001, now + 0.4 + i * 0.15);
      chimeGain.gain.linearRampToValueAtTime(0.07, now + 0.4 + i * 0.15 + 0.02);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4 + i * 0.15 + 0.8);

      oscChime.connect(chimeGain);
      chimeGain.connect(this.preAmpGainNode!);
      oscChime.start(now + 0.4 + i * 0.15);
      oscChime.stop(now + 0.4 + i * 0.15 + 0.85);
    });
  }

  public getIsAuditionPlaying(): boolean {
    return this.isAuditionPlaying;
  }

  public getAudioContext(): AudioContext | null {
    return this.audioCtx;
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
