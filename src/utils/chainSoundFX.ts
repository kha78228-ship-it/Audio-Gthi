// Web Audio Sound FX Synthesizer for Haevy Admin 2 Chains & Master Padlock
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
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
}

/**
 * Plays the heavy metallic locking sound effect:
 * 1. Metallic scraping chains (filtered noise bursts)
 * 2. Heavy iron clank & padlock shackle snap
 * 3. Laser power-up hum
 */
export function playChainLockSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Initial Chain Rattling / Metallic friction
  for (let i = 0; i < 4; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320 + i * 280 + (Math.random() * 60), now + i * 0.08);
    osc.frequency.exponentialRampToValueAtTime(140 + i * 90, now + i * 0.08 + 0.18);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200 + i * 400, now);
    filter.Q.setValueAtTime(3.5, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + i * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + i * 0.08);
    osc.stop(now + i * 0.08 + 0.25);
  }

  // 2. Heavy Master Padlock Slam (Thump + High metallic clang)
  const heavyTime = now + 0.45;

  // Heavy bass impact
  const bassOsc = ctx.createOscillator();
  const bassGain = ctx.createGain();
  bassOsc.type = 'sine';
  bassOsc.frequency.setValueAtTime(160, heavyTime);
  bassOsc.frequency.exponentialRampToValueAtTime(38, heavyTime + 0.35);

  bassGain.gain.setValueAtTime(0.35, heavyTime);
  bassGain.gain.exponentialRampToValueAtTime(0.001, heavyTime + 0.35);

  bassOsc.connect(bassGain);
  bassGain.connect(ctx.destination);
  bassOsc.start(heavyTime);
  bassOsc.stop(heavyTime + 0.36);

  // Metallic ring
  const pingOsc = ctx.createOscillator();
  const pingGain = ctx.createGain();
  pingOsc.type = 'square';
  pingOsc.frequency.setValueAtTime(1850, heavyTime);
  pingOsc.frequency.exponentialRampToValueAtTime(980, heavyTime + 0.28);

  pingGain.gain.setValueAtTime(0.12, heavyTime);
  pingGain.gain.exponentialRampToValueAtTime(0.0001, heavyTime + 0.3);

  pingOsc.connect(pingGain);
  pingGain.connect(ctx.destination);
  pingOsc.start(heavyTime);
  pingOsc.stop(heavyTime + 0.32);

  // 3. Laser Scanner Hum
  const laserOsc = ctx.createOscillator();
  const laserGain = ctx.createGain();
  laserOsc.type = 'sawtooth';
  laserOsc.frequency.setValueAtTime(580, heavyTime + 0.2);
  laserOsc.frequency.linearRampToValueAtTime(1240, heavyTime + 0.7);

  laserGain.gain.setValueAtTime(0.001, heavyTime + 0.2);
  laserGain.gain.linearRampToValueAtTime(0.05, heavyTime + 0.4);
  laserGain.gain.exponentialRampToValueAtTime(0.0001, heavyTime + 0.75);

  laserOsc.connect(laserGain);
  laserGain.connect(ctx.destination);
  laserOsc.start(heavyTime + 0.2);
  laserOsc.stop(heavyTime + 0.76);
}

/**
 * Plays the crisp metallic unlocking & chain retraction sound:
 * 1. Shackle popping open with metallic click
 * 2. Harmonic ascending energy chime
 * 3. Chain pulling whoosh
 */
export function playChainUnlockSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Mechanical Latch Pop / Release Click
  const clickOsc = ctx.createOscillator();
  const clickGain = ctx.createGain();
  clickOsc.type = 'triangle';
  clickOsc.frequency.setValueAtTime(2400, now);
  clickOsc.frequency.exponentialRampToValueAtTime(650, now + 0.08);

  clickGain.gain.setValueAtTime(0.25, now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  clickOsc.connect(clickGain);
  clickGain.connect(ctx.destination);
  clickOsc.start(now);
  clickOsc.stop(now + 0.1);

  // 2. Ascending Cyber Authorization Chime (Emerald chord)
  const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + 0.06 + idx * 0.07);

    gain.gain.setValueAtTime(0.001, now + 0.06 + idx * 0.07);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.06 + idx * 0.07 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06 + idx * 0.07 + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + 0.06 + idx * 0.07);
    osc.stop(now + 0.06 + idx * 0.07 + 0.36);
  });

  // 3. Chain retract sliding friction sound
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400 + i * 200, now + 0.15 + i * 0.1);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.15 + i * 0.1 + 0.2);

    gain.gain.setValueAtTime(0.04, now + 0.15 + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15 + i * 0.1 + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + 0.15 + i * 0.1);
    osc.stop(now + 0.15 + i * 0.1 + 0.22);
  }
}
