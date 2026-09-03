// Web Audio Synthesizer for Tibetan Singing Bowls, Solfeggio Frequencies, Temple Bells & Chimes

class SpiritualAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private activeOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private activeToneLoop: { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null = null;
  private currentFrequency: number | null = null;

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // 1. Play Tibetan Singing Bowl Gong Strike (Rich resonant harmonics)
  public playSingingBowl(baseFreq: number = 216) {
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Harmonics ratio for authentic metal bowl resonance
      const harmonics = [
        { mult: 1.0, gain: 0.35, decay: 6.5 },
        { mult: 2.76, gain: 0.18, decay: 5.0 },
        { mult: 5.4, gain: 0.08, decay: 3.5 },
        { mult: 8.9, gain: 0.03, decay: 2.0 }
      ];

      harmonics.forEach(h => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * h.mult, now);
        
        // Slight natural vibrato
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(4.5, now);
        lfoGain.gain.setValueAtTime(baseFreq * 0.015, now);
        lfo.connect(osc.frequency);
        lfo.start(now);
        lfo.stop(now + h.decay);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(h.gain, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + h.decay);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + h.decay);
      });
    } catch {
      // Audio permission or unsupported browser
    }
  }

  // 2. Play Solfeggio Continuous Healing Tone (with subtle theta binaural beat)
  public startSolfeggioTone(freq: number, volume: number = 0.25) {
    const ctx = this.initCtx();
    if (!ctx) return;

    this.stopSolfeggioTone();

    try {
      const now = ctx.currentTime;
      const merger = ctx.createChannelMerger(2);
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(volume, now + 2.0);

      // Left Ear (Base frequency)
      const oscLeft = ctx.createOscillator();
      const gainLeft = ctx.createGain();
      oscLeft.type = 'sine';
      oscLeft.frequency.setValueAtTime(freq, now);
      gainLeft.gain.setValueAtTime(0.5, now);
      oscLeft.connect(gainLeft);
      gainLeft.connect(merger, 0, 0);

      // Right Ear (Base frequency + 4.5Hz Theta brainwave beat)
      const oscRight = ctx.createOscillator();
      const gainRight = ctx.createGain();
      oscRight.type = 'sine';
      oscRight.frequency.setValueAtTime(freq + 4.5, now);
      gainRight.gain.setValueAtTime(0.5, now);
      oscRight.connect(gainRight);
      gainRight.connect(merger, 0, 1);

      merger.connect(masterGain);
      masterGain.connect(ctx.destination);

      oscLeft.start(now);
      oscRight.start(now);

      this.activeToneLoop = {
        osc1: oscLeft,
        osc2: oscRight,
        gain: masterGain
      };
      this.currentFrequency = freq;
    } catch {
      // Ignore
    }
  }

  public stopSolfeggioTone() {
    if (this.activeToneLoop && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.activeToneLoop.gain.gain.setValueAtTime(this.activeToneLoop.gain.gain.value, now);
        this.activeToneLoop.gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
        setTimeout(() => {
          this.activeToneLoop?.osc1.stop();
          this.activeToneLoop?.osc2.stop();
          this.activeToneLoop = null;
          this.currentFrequency = null;
        }, 1100);
      } catch {
        this.activeToneLoop = null;
        this.currentFrequency = null;
      }
    }
  }

  public isTonePlaying(): boolean {
    return this.activeToneLoop !== null;
  }

  public getCurrentFrequency(): number | null {
    return this.currentFrequency;
  }

  // 3. Play Tarot Card Flip Shimmer Chime
  public playCardFlipChime() {
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.001, now + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.45);
      });
    } catch {
      // Ignore
    }
  }

  // 3b. Play Tarot Card Shuffle Sound
  public playCardShuffle() {
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      for (let i = 0; i < 5; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300 + Math.random() * 200, now + i * 0.04);

        gain.gain.setValueAtTime(0.001, now + i * 0.04);
        gain.gain.linearRampToValueAtTime(0.04, now + i * 0.04 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.12);
      }
    } catch {
      // Ignore
    }
  }

  // 4. Play Temple Bell Sound (Thanh tịnh)
  public playTempleBell() {
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now); // A4
      
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 4.6);
    } catch {
      // Ignore
    }
  }

  // 5. Play Wind Chime Random Gentle Tinkles
  public playWindChime() {
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const pentatonic = [1046.50, 1174.66, 1318.51, 1567.98, 1760.00, 2093.00];
      for (let i = 0; i < 4; i++) {
        const delay = Math.random() * 0.4;
        const note = pentatonic[Math.floor(Math.random() * pentatonic.length)];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, now + delay);

        gain.gain.setValueAtTime(0.001, now + delay);
        gain.gain.linearRampToValueAtTime(0.05, now + delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.65);
      }
    } catch {
      // Ignore
    }
  }

  // 6. Play Coin Drop / Toss (Gieo tiền đồng Kinh Dịch)
  public playCoinToss() {
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High metallic chime + bounce
      const coinFreqs = [2489, 3135, 4186];
      coinFreqs.forEach((freq, idx) => {
        const delay = idx * 0.08 + Math.random() * 0.03;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.8, now + delay + 0.3);

        gain.gain.setValueAtTime(0.001, now + delay);
        gain.gain.linearRampToValueAtTime(0.18, now + delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.4);
      });
    } catch {
      // Ignore
    }
  }

  // 7. Play Bamboo Shaking (Lắc ống xăm trúc)
  public playBambooShake() {
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      for (let i = 0; i < 5; i++) {
        const delay = i * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380 + Math.random() * 260, now + delay);

        gain.gain.setValueAtTime(0.001, now + delay);
        gain.gain.linearRampToValueAtTime(0.15, now + delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.1);
      }
    } catch {
      // Ignore
    }
  }

  // 8. Play Mystic Crystal Ball Resonator
  public playCrystalResonance() {
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(852, now); // 852Hz Awakens Intuition
      osc.frequency.exponentialRampToValueAtTime(963, now + 2.0); // 963Hz Crown Chakra

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 3.2);
    } catch {
      // Ignore
    }
  }
}

export const spiritualAudio = new SpiritualAudioSynthesizer();
