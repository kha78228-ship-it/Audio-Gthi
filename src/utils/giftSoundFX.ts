/**
 * Web Audio Sound FX Synthesizer for Haevy Gift Giving & Celebrations
 * Pure procedural Web Audio API - zero external assets required.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Play procedural sound effect corresponding to gift rarity
 */
export function playGiftCelebrationSound(rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common') {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (rarity === 'common') {
      // Gentle, sparkling harp bell arpeggio (C5 - E5 - G5 - C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.5);
      });
    } else if (rarity === 'rare') {
      // Crystal chime with harmonic overtone
      const freqs = [587.33, 739.99, 880.0, 1174.66];
      freqs.forEach((freq, idx) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, now + idx * 0.07);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 1.5, now + idx * 0.07);

        gain.gain.setValueAtTime(0.001, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.6);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now + idx * 0.07);
        osc2.start(now + idx * 0.07);
        osc1.stop(now + idx * 0.07 + 0.65);
        osc2.stop(now + idx * 0.07 + 0.65);
      });
    } else if (rarity === 'epic') {
      // Triumphant brass/synth fanfare chord + shimmer
      const chord = [392.0, 493.88, 587.33, 783.99, 987.77];
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(3200, now + 0.2);
        filter.frequency.exponentialRampToValueAtTime(1000, now + 0.9);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.0);
      });
    } else {
      // Legendary: Grand royal fanfare + deep bass impact + firework sparkle
      // 1. Sub Bass Impact
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(120, now);
      subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(0.3, now + 0.02);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.65);

      // 2. Royal Major Chord Fanfare (D4, A4, D5, F#5, A5, D6)
      const royalChord = [293.66, 440.0, 587.33, 739.99, 880.0, 1174.66];
      royalChord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.25);
      });

      // 3. Shimmering firework sparkle trail
      for (let s = 0; s < 5; s++) {
        const sparkTime = now + 0.15 + s * 0.09;
        const sparkOsc = ctx.createOscillator();
        const sparkGain = ctx.createGain();
        sparkOsc.type = 'sine';
        sparkOsc.frequency.setValueAtTime(1800 + s * 300, sparkTime);
        sparkOsc.frequency.exponentialRampToValueAtTime(2600 + s * 400, sparkTime + 0.08);

        sparkGain.gain.setValueAtTime(0.001, sparkTime);
        sparkGain.gain.linearRampToValueAtTime(0.05, sparkTime + 0.01);
        sparkGain.gain.exponentialRampToValueAtTime(0.0001, sparkTime + 0.15);

        sparkOsc.connect(sparkGain);
        sparkGain.connect(ctx.destination);
        sparkOsc.start(sparkTime);
        sparkOsc.stop(sparkTime + 0.18);
      }
    }
  } catch (err) {
    console.warn('Gift sound synthesis notice:', err);
  }
}

/**
 * Sound effect when combo multiplier increases (x2, x3, x5, etc.)
 */
export function playGiftComboSound(comboCount: number) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const baseFreq = 400 + Math.min(comboCount * 70, 800);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.15);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (err) {
    console.warn('Combo sound error:', err);
  }
}
