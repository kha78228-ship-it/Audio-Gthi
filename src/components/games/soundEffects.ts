// High quality Web Audio API sound synthesizer for Haevy Games
// Zero external assets, zero lag, reliable in all browsers

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a single frequency note with envelope
  playTone(freq: number, type: OscillatorType = 'sine', duration: number = 0.2, gainValue: number = 0.15) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Correct answer chime (ascending high notes)
  playCorrect() {
    if (this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.25, 0.2);
      }, idx * 60);
    });
  }

  // Wrong answer buzzer
  playWrong() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) {}
  }

  // Wheel tick sound
  playTick() {
    if (this.isMuted) return;
    this.playTone(800 + Math.random() * 200, 'sine', 0.04, 0.08);
  }

  // Rhythm Tap - Hit accuracy sounds
  playHitPerfect() {
    if (this.isMuted) return;
    this.playTone(880, 'sine', 0.1, 0.25);
    setTimeout(() => this.playTone(1320, 'triangle', 0.12, 0.2), 30);
  }

  playHitGreat() {
    if (this.isMuted) return;
    this.playTone(660, 'sine', 0.1, 0.18);
  }

  playHitMiss() {
    if (this.isMuted) return;
    this.playTone(180, 'square', 0.12, 0.12);
  }

  // Victory fanfare
  playVictory() {
    if (this.isMuted) return;
    const chords = [
      { freq: 523.25, delay: 0 },
      { freq: 659.25, delay: 100 },
      { freq: 783.99, delay: 200 },
      { freq: 1046.50, delay: 350 },
      { freq: 1318.51, delay: 500 },
      { freq: 1567.98, delay: 650 },
    ];
    chords.forEach(({ freq, delay }) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.4, 0.25);
      }, delay);
    });
  }

  // Play a sequence of melody notes for the Melody Quiz
  playMelodySequence(notes: Array<{ freq: number; duration: number }>, onComplete?: () => void) {
    if (this.isMuted) {
      if (onComplete) onComplete();
      return;
    }
    this.initContext();
    let currentDelay = 0;
    notes.forEach((note, index) => {
      setTimeout(() => {
        this.playTone(note.freq, 'triangle', note.duration, 0.25);
        if (index === notes.length - 1 && onComplete) {
          setTimeout(onComplete, note.duration * 1000);
        }
      }, currentDelay * 1000);
      currentDelay += note.duration + 0.05;
    });
  }

  // Drum kick for rhythm game
  playKick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) {}
  }

  // Snare for rhythm game
  playSnare() {
    if (this.isMuted) return;
    this.playTone(320, 'triangle', 0.08, 0.15);
    this.playTone(850, 'sawtooth', 0.06, 0.08);
  }

  // Card Game Sounds
  playCardDeal() {
    if (this.isMuted) return;
    this.playTone(1200 + Math.random() * 400, 'sine', 0.04, 0.12);
  }

  playCardPlay() {
    if (this.isMuted) return;
    this.playTone(600, 'triangle', 0.05, 0.2);
    setTimeout(() => this.playTone(900, 'sine', 0.04, 0.15), 25);
  }

  playCardFlip() {
    if (this.isMuted) return;
    this.playTone(450, 'sine', 0.06, 0.1);
  }

  playChips() {
    if (this.isMuted) return;
    const freqs = [1400, 1750, 2100];
    freqs.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'triangle', 0.05, 0.12), i * 40);
    });
  }

  playPass() {
    if (this.isMuted) return;
    this.playTone(280, 'sawtooth', 0.1, 0.08);
  }
}

export const sound = new SoundSynthesizer();
