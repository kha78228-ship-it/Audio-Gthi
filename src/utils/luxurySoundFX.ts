// Web Audio Sound FX Synthesizer for Haevy Billionaire Luxury Experience
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
 * Sound of tapping or flipping the heavy metallic Centurion Obsidian Black Card
 */
export function playMetallicCardTapSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // High metallic chime/tap
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(2450, now);
  osc1.frequency.exponentialRampToValueAtTime(1800, now + 0.15);

  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(3200, now);
  osc2.frequency.exponentialRampToValueAtTime(2100, now + 0.12);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2800, now);
  filter.Q.setValueAtTime(5, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.3);
  osc2.stop(now + 0.3);
}

/**
 * Sound of Champagne Cork Pop & Luxurious Sparkling Fizz
 */
export function playChampagnePopSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Cork Pop (Low thump + short noise burst)
  const popOsc = ctx.createOscillator();
  const popGain = ctx.createGain();
  popOsc.type = 'sine';
  popOsc.frequency.setValueAtTime(220, now);
  popOsc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

  popGain.gain.setValueAtTime(0.001, now);
  popGain.gain.linearRampToValueAtTime(0.4, now + 0.005);
  popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  popOsc.connect(popGain);
  popGain.connect(ctx.destination);
  popOsc.start(now);
  popOsc.stop(now + 0.1);

  // 2. Cork friction whoosh
  const bufferSize = ctx.sampleRate * 0.06;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
  }
  const noiseNode = ctx.createBufferSource();
  noiseNode.buffer = buffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(1400, now);
  noiseFilter.Q.setValueAtTime(2, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.25, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  noiseNode.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseNode.start(now);

  // 3. Sparkling Champagne Fizz (Delicate bubbling noise)
  const fizzSize = ctx.sampleRate * 0.8;
  const fizzBuffer = ctx.createBuffer(1, fizzSize, ctx.sampleRate);
  const fizzData = fizzBuffer.getChannelData(0);
  for (let i = 0; i < fizzSize; i++) {
    fizzData[i] = (Math.random() * 2 - 1);
  }
  const fizzNode = ctx.createBufferSource();
  fizzNode.buffer = fizzBuffer;

  const fizzFilter = ctx.createBiquadFilter();
  fizzFilter.type = 'highpass';
  fizzFilter.frequency.setValueAtTime(4500, now + 0.04);

  const fizzGain = ctx.createGain();
  fizzGain.gain.setValueAtTime(0.001, now);
  fizzGain.gain.linearRampToValueAtTime(0.08, now + 0.06);
  fizzGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

  fizzNode.connect(fizzFilter);
  fizzFilter.connect(fizzGain);
  fizzGain.connect(ctx.destination);
  fizzNode.start(now + 0.04);
}

/**
 * Sound of Gold Coins Cascading & Clinking
 */
export function playGoldCoinRainSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const pitches = [1860, 2093, 2349, 2793, 3135, 3729];

  // Multiple randomized coin clinks
  for (let i = 0; i < 7; i++) {
    const delay = now + (i * 0.075) + (Math.random() * 0.03);
    const pitch = pitches[i % pitches.length] + (Math.random() * 80 - 40);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, delay);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.96, delay + 0.2);

    gain.gain.setValueAtTime(0.001, delay);
    gain.gain.linearRampToValueAtTime(0.12, delay + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, delay + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(delay);
    osc.stop(delay + 0.25);
  }
}

/**
 * Sound of Swiss Bank Vault Turn & Heavy Steel Lock Release
 */
export function playVaultUnlockSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Ratchet clicks
  for (let i = 0; i < 3; i++) {
    const clickTime = now + (i * 0.12);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(900 + (i * 180), clickTime);

    gain.gain.setValueAtTime(0.08, clickTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, clickTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(clickTime);
    osc.stop(clickTime + 0.05);
  }

  // 2. Heavy steel bolt thud & resonant chamber
  const boltTime = now + 0.42;
  const bassOsc = ctx.createOscillator();
  const bassGain = ctx.createGain();
  bassOsc.type = 'sine';
  bassOsc.frequency.setValueAtTime(90, boltTime);
  bassOsc.frequency.exponentialRampToValueAtTime(32, boltTime + 0.25);

  bassGain.gain.setValueAtTime(0.28, boltTime);
  bassGain.gain.exponentialRampToValueAtTime(0.001, boltTime + 0.35);

  bassOsc.connect(bassGain);
  bassGain.connect(ctx.destination);
  bassOsc.start(boltTime);
  bassOsc.stop(boltTime + 0.4);
}
