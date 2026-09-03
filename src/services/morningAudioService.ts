/**
 * Web Audio Ambient & Synthesizer Engine for Haevy Morning
 * Provides procedural soothing sounds: Golden Dawn bird songs, Alpha 10Hz brainwave, Zen stream, Crystal bells
 */

import { MorningSoundscape } from '../types';

class MorningAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private activeNodes: { stop: () => void }[] = [];
  private currentMode: string = 'none';

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  public stopAll() {
    this.activeNodes.forEach(n => {
      try { n.stop(); } catch {}
    });
    this.activeNodes = [];
    this.isPlaying = false;
    this.currentMode = 'none';
  }

  /**
   * Soundscape 1: Golden Dawn with gentle birdsong chirps & warm chord pads
   */
  public playBirdsDawn() {
    this.initContext();
    this.stopAll();
    if (!this.ctx || !this.masterGain) return;
    this.isPlaying = true;
    this.currentMode = 'birds_dawn';

    // Warm ambient pad (F major chord with soft harmonics)
    const padFrequencies = [174.61, 220.00, 261.63, 349.23, 523.25]; // F3, A3, C4, F4, C5
    padFrequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04 / (idx + 1), this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start();

      this.activeNodes.push({
        stop: () => {
          try { osc.stop(); osc.disconnect(); gain.disconnect(); } catch {}
        }
      });
    });

    // Birdsong procedural scheduler
    let birdTimer: any = null;
    const triggerBirdChirp = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain || this.currentMode !== 'birds_dawn') return;
      
      const now = this.ctx.currentTime;
      const baseFreq = 2200 + Math.random() * 1200;
      const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 1.8];
      
      notes.forEach((f, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        const startT = now + i * 0.08;
        osc.frequency.setValueAtTime(f, startT);
        osc.frequency.exponentialRampToValueAtTime(f * 0.85, startT + 0.07);
        
        gain.gain.setValueAtTime(0.0001, startT);
        gain.gain.exponentialRampToValueAtTime(0.06, startT + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.07);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(startT);
        osc.stop(startT + 0.08);
      });

      const nextDelay = 1800 + Math.random() * 3200;
      birdTimer = setTimeout(triggerBirdChirp, nextDelay);
    };

    triggerBirdChirp();
    this.activeNodes.push({
      stop: () => {
        if (birdTimer) clearTimeout(birdTimer);
      }
    });
  }

  /**
   * Soundscape 2: Alpha 10Hz Binaural/Isochronic Awake Wave
   */
  public playAlphaWave() {
    this.initContext();
    this.stopAll();
    if (!this.ctx || !this.masterGain) return;
    this.isPlaying = true;
    this.currentMode = 'alpha_wave';

    const baseFreq = 216; // Sacred tuning A=432Hz subharmonic
    const alphaDifference = 10; // 10Hz Alpha brainwave (alert, clear-minded morning focus)

    // Left ear carrier
    const oscL = this.ctx.createOscillator();
    const gainL = this.ctx.createGain();
    const pannerL = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    gainL.gain.setValueAtTime(0.08, this.ctx.currentTime);
    if (pannerL) pannerL.pan.setValueAtTime(-0.8, this.ctx.currentTime);

    // Right ear carrier (+10Hz)
    const oscR = this.ctx.createOscillator();
    const gainR = this.ctx.createGain();
    const pannerR = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(baseFreq + alphaDifference, this.ctx.currentTime);
    gainR.gain.setValueAtTime(0.08, this.ctx.currentTime);
    if (pannerR) pannerR.pan.setValueAtTime(0.8, this.ctx.currentTime);

    if (pannerL && pannerR) {
      oscL.connect(gainL); gainL.connect(pannerL); pannerL.connect(this.masterGain);
      oscR.connect(gainR); gainR.connect(pannerR); pannerR.connect(this.masterGain);
    } else {
      oscL.connect(gainL); gainL.connect(this.masterGain);
      oscR.connect(gainR); gainR.connect(this.masterGain);
    }

    oscL.start();
    oscR.start();

    // Gentle 432Hz deep root tone
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(108, this.ctx.currentTime);
    subGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start();

    this.activeNodes.push({
      stop: () => {
        try {
          oscL.stop(); oscR.stop(); subOsc.stop();
          oscL.disconnect(); oscR.disconnect(); subOsc.disconnect();
        } catch {}
      }
    });
  }

  /**
   * Soundscape 3: Zen Stream with Singing Bowl Chimes
   */
  public playZenStream() {
    this.initContext();
    this.stopAll();
    if (!this.ctx || !this.masterGain) return;
    this.isPlaying = true;
    this.currentMode = 'zen_stream';

    // Pink/Brown noise generator for bubbling water stream
    const bufferSize = 2 * (this.ctx.sampleRate || 44100);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 2.5;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const streamFilter = this.ctx.createBiquadFilter();
    streamFilter.type = 'bandpass';
    streamFilter.frequency.setValueAtTime(650, this.ctx.currentTime);
    streamFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    const streamGain = this.ctx.createGain();
    streamGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

    whiteNoise.connect(streamFilter);
    streamFilter.connect(streamGain);
    streamGain.connect(this.masterGain);
    whiteNoise.start();

    // Singing bowl interval chime
    let bowlTimer: any = null;
    const triggerSingingBowl = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain || this.currentMode !== 'zen_stream') return;
      const now = this.ctx.currentTime;
      const bowlFreqs = [528, 528 * 1.5, 528 * 2.05]; // 528Hz Solfeggio Love frequency
      
      bowlFreqs.forEach((bf, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(bf, now);
        
        gain.gain.setValueAtTime(0.08 / (i + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 4.6);
      });

      bowlTimer = setTimeout(triggerSingingBowl, 6500 + Math.random() * 4000);
    };

    triggerSingingBowl();

    this.activeNodes.push({
      stop: () => {
        if (bowlTimer) clearTimeout(bowlTimer);
        try { whiteNoise.stop(); whiteNoise.disconnect(); } catch {}
      }
    });
  }

  /**
   * Soundscape 4: Acoustic Morning Sun Arpeggios
   */
  public playAcousticSun() {
    this.initContext();
    this.stopAll();
    if (!this.ctx || !this.masterGain) return;
    this.isPlaying = true;
    this.currentMode = 'acoustic_sun';

    const chords = [
      [261.63, 329.63, 392.00, 523.25], // C Major
      [220.00, 261.63, 329.63, 440.00], // A Minor
      [174.61, 220.00, 261.63, 349.23], // F Major
      [196.00, 246.94, 293.66, 392.00], // G Major
    ];

    let chordIdx = 0;
    let noteStep = 0;
    let arpTimer: any = null;

    const playNextNote = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain || this.currentMode !== 'acoustic_sun') return;
      const currentChord = chords[chordIdx];
      const freq = currentChord[noteStep % currentChord.length];

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 1.3);

      noteStep++;
      if (noteStep >= currentChord.length) {
        noteStep = 0;
        chordIdx = (chordIdx + 1) % chords.length;
      }

      arpTimer = setTimeout(playNextNote, 360);
    };

    playNextNote();

    this.activeNodes.push({
      stop: () => {
        if (arpTimer) clearTimeout(arpTimer);
      }
    });
  }

  /**
   * Soundscape 5: Ocean Waves & Sunrise Breeze
   */
  public playOceanWaves() {
    this.initContext();
    this.stopAll();
    if (!this.ctx || !this.masterGain) return;
    this.isPlaying = true;
    this.currentMode = 'ocean_waves';

    const bufferSize = 2 * (this.ctx.sampleRate || 44100);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const pinkSource = this.ctx.createBufferSource();
    pinkSource.buffer = noiseBuffer;
    pinkSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);

    // LFO for periodic wave swell (every 6 seconds)
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.16, this.ctx.currentTime); // ~6.2s period
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    pinkSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    pinkSource.start();
    lfo.start();

    this.activeNodes.push({
      stop: () => {
        try {
          pinkSource.stop(); pinkSource.disconnect();
          lfo.stop(); lfo.disconnect();
          filter.disconnect(); gain.disconnect();
        } catch {}
      }
    });
  }

  /**
   * Soundscape 6: Misty Forest Wind & Rustling Leaves
   */
  public playForestWind() {
    this.initContext();
    this.stopAll();
    if (!this.ctx || !this.masterGain) return;
    this.isPlaying = true;
    this.currentMode = 'forest_wind';

    const bufferSize = 2 * (this.ctx.sampleRate || 44100);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.05;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const bandFilter = this.ctx.createBiquadFilter();
    bandFilter.type = 'bandpass';
    bandFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
    bandFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);

    // Wind modulation
    const windLfo = this.ctx.createOscillator();
    windLfo.frequency.setValueAtTime(0.2, this.ctx.currentTime);
    const windModGain = this.ctx.createGain();
    windModGain.gain.setValueAtTime(200, this.ctx.currentTime);
    windLfo.connect(windModGain);
    windModGain.connect(bandFilter.frequency);

    noise.connect(bandFilter);
    bandFilter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    windLfo.start();

    this.activeNodes.push({
      stop: () => {
        try {
          noise.stop(); noise.disconnect();
          windLfo.stop(); windLfo.disconnect();
          bandFilter.disconnect(); gain.disconnect();
        } catch {}
      }
    });
  }

  /**
   * Interactive Sound Effects triggered by Hand Gestures
   */
  public triggerHeartPop() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const chord = [440, 554.37, 659.25, 880]; // A Major Heart Chord
    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.08, now + idx * 0.04 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.85);
    });
  }

  public triggerThumbsUpChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C High
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.09, now + idx * 0.05 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.55);
    });
  }

  public triggerPeaceRainbowChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const notes = [587.33, 739.99, 880.0, 1174.66]; // D F# A D
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.07, now + idx * 0.06 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.9);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.95);
    });
  }

  public triggerFistLightningSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  public triggerPrayerZenBowl() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, now); // Solfeggio 528Hz

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 3.1);
  }

  public triggerClearBoardSweep() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.42);
  }

  public triggerUndoSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.16);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public triggerEraserSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300 + Math.random() * 80, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public triggerEmojiPop(pitchMultiplier: number = 1.0) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const startFreq = 400 * pitchMultiplier;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 2.2, now + 0.12);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public triggerSupernovaSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Golden Chime Sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(880, now + 1.2);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 1.25);
  }

  public triggerStarDrawTone(pitchFactor: number = 0.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const freq = 500 + pitchFactor * 800;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public triggerHandBeamHum(intensity: number) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320 + intensity * 240, now);

    gain.gain.setValueAtTime(0.02 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public triggerEnergyCompletedSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C Major Triumph
    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.06 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 1.8);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 1.9);
    });
  }

  public triggerHaevySonHappy() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    // Cute high-pitched playful chirp arpeggio
    const notes = [659.25, 783.99, 987.77, 1318.51, 1567.98]; // E5 G5 B5 E6 G6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const startT = now + idx * 0.045;
      osc.frequency.setValueAtTime(freq, startT);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.08, startT + 0.08);

      gain.gain.setValueAtTime(0.0001, startT);
      gain.gain.exponentialRampToValueAtTime(0.09, startT + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(startT);
      osc.stop(startT + 0.3);
    });
  }

  public triggerHaevySonMagicBeam() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(2400, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.4);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  public triggerHaevySonFlip() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const startT = now + idx * 0.035;
      osc.frequency.setValueAtTime(freq, startT);

      gain.gain.setValueAtTime(0.0001, startT);
      gain.gain.exponentialRampToValueAtTime(0.08, startT + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(startT);
      osc.stop(startT + 0.4);
    });
  }

  public triggerStarPop() {
    this.triggerThumbsUpChime();
  }

  public triggerBrushStroke(pitchFactor: number = 0.5) {
    this.triggerStarDrawTone(pitchFactor);
  }

  public playSpatialBackground(soundscape: MorningSoundscape, volume: number = 0.5) {
    this.setMasterVolume(volume);
    switch (soundscape) {
      case 'birds_dawn':
        this.playBirdsDawn();
        break;
      case 'ocean_waves':
        this.playOceanWaves();
        break;
      case 'forest_wind':
        this.playForestWind();
        break;
      case 'alpha_wave':
        this.playAlphaWave();
        break;
      case 'zen_stream':
        this.playZenStream();
        break;
      case 'acoustic_sun':
        this.playAcousticSun();
        break;
      default:
        this.playOceanWaves();
        break;
    }
  }

  public triggerDragonBreathFire() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.6);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.7);
  }

  public triggerDragonSparkleBurst() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const freqs = [880, 1174.66, 1396.91, 1760, 2093];
    freqs.forEach((f, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.03);

      gain.gain.setValueAtTime(0.0001, now + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.06, now + i * 0.03 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.03 + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.03);
      osc.stop(now + i * 0.03 + 0.45);
    });
  }

  public triggerDragonShockwave() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.8);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.9);
  }

  /**
   * Dynamic Gaze & Engagement Interaction Audio
   */
  public triggerGazeLockChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const notes = [880, 1108.73, 1318.51, 1760]; // A5, C#6, E6, A6 sparkle
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const startT = now + idx * 0.04;
      osc.frequency.setValueAtTime(freq, startT);
      gain.gain.setValueAtTime(0.0001, startT);
      gain.gain.exponentialRampToValueAtTime(0.06, startT + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(startT);
      osc.stop(startT + 0.38);
    });
  }

  public triggerPetPurr() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(18, now); // 18Hz purr flutter
    lfoGain.gain.setValueAtTime(40, now);

    lfo.connect(osc.frequency);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.07, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.masterGain);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 0.65);
    osc.stop(now + 0.65);
  }

  public triggerOverjoyedTrill() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const freqs = [587.33, 739.99, 880, 1174.66, 1479.98, 1760, 2349.32]; // D Major Overjoyed cascade
    freqs.forEach((f, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const startT = now + i * 0.035;
      osc.frequency.setValueAtTime(f, startT);
      gain.gain.setValueAtTime(0.0001, startT);
      gain.gain.exponentialRampToValueAtTime(0.08, startT + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.28);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(startT);
      osc.stop(startT + 0.3);
    });
  }

  public triggerCuriousChirp() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(1050, now + 0.12);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  public triggerCuteFootstep(isLeft: boolean = true) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    const pitch = isLeft ? 480 : 540;
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.7, now + 0.05);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  public triggerHapticGestureBlip() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.06);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.04, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * ⚡ Tiếng sét lượng tử & hồ quang năng lượng vàng cam (Trạng thái 1: 2 tay chụm lại)
   */
  public triggerLightningArcCrackle() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    // Fast frequency jitter
    osc.frequency.setValueAtTime(160 + Math.random() * 220, now);
    osc.frequency.linearRampToValueAtTime(80 + Math.random() * 60, now + 0.08);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * 🛡️ Tiếng xoay vòng tròn phép thuật Doctor Strange thần bí (Trạng thái 2: 2 tay mở rộng)
   */
  public triggerDoctorStrangeShieldHum() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(220, now);
    osc1.frequency.exponentialRampToValueAtTime(440, now + 0.15);
    osc2.frequency.setValueAtTime(330, now);
    osc2.frequency.exponentialRampToValueAtTime(660, now + 0.15);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.24);
    osc2.stop(now + 0.24);
  }
}

export const morningAudio = new MorningAudioSynthesizer();
