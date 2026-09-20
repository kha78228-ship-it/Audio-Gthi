// Web Audio Synthesizer for Haevy Edu Focus & Binaural Beats
let audioCtx: AudioContext | null = null;
let currentBinauralNodes: {
  oscL: OscillatorNode;
  oscR: OscillatorNode;
  merger: ChannelMergerNode;
  gain: GainNode;
} | null = null;

let currentNoiseNode: {
  source: AudioBufferSourceNode;
  gain: GainNode;
} | null = null;

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
 * Play a crystal bell chime when Pomodoro interval completes or milestone achieved
 */
export function playFocusBellSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const frequencies = [528, 1056, 1584]; // Solfeggio 528Hz Love & Transformation frequency

  frequencies.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12 / (idx + 1), now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 2.6);
  });
}

/**
 * Start Binaural Beats for study brainwave entrainment
 * @param waveType 'alpha' (10Hz focus relaxation) | 'beta' (18Hz active problem solving) | 'gamma' (40Hz peak cognitive)
 */
export function startBinauralBeat(waveType: 'alpha' | 'beta' | 'gamma') {
  stopBinauralBeat();
  const ctx = getAudioContext();
  if (!ctx) return;

  const baseFreq = 220; // A3 comfortable base pitch
  let beatFreq = 10;
  if (waveType === 'beta') beatFreq = 18;
  if (waveType === 'gamma') beatFreq = 40;

  // Left ear: baseFreq
  const oscL = ctx.createOscillator();
  oscL.type = 'sine';
  oscL.frequency.setValueAtTime(baseFreq, ctx.currentTime);

  // Right ear: baseFreq + beatFreq
  const oscR = ctx.createOscillator();
  oscR.type = 'sine';
  oscR.frequency.setValueAtTime(baseFreq + beatFreq, ctx.currentTime);

  const gainL = ctx.createGain();
  const gainR = ctx.createGain();
  gainL.gain.setValueAtTime(0.05, ctx.currentTime);
  gainR.gain.setValueAtTime(0.05, ctx.currentTime);

  // Channel merger for stereo separation
  const merger = ctx.createChannelMerger(2);
  oscL.connect(gainL);
  gainL.connect(merger, 0, 0); // Left channel

  oscR.connect(gainR);
  gainR.connect(merger, 0, 1); // Right channel

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1.0);

  merger.connect(masterGain);
  masterGain.connect(ctx.destination);

  oscL.start();
  oscR.start();

  currentBinauralNodes = {
    oscL,
    oscR,
    merger,
    gain: masterGain
  };
}

export function stopBinauralBeat() {
  if (currentBinauralNodes && audioCtx) {
    try {
      currentBinauralNodes.gain.gain.setValueAtTime(currentBinauralNodes.gain.gain.value, audioCtx.currentTime);
      currentBinauralNodes.gain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
      setTimeout(() => {
        try {
          currentBinauralNodes?.oscL.stop();
          currentBinauralNodes?.oscR.stop();
          currentBinauralNodes?.oscL.disconnect();
          currentBinauralNodes?.oscR.disconnect();
          currentBinauralNodes?.merger.disconnect();
          currentBinauralNodes = null;
        } catch {}
      }, 350);
    } catch {
      currentBinauralNodes = null;
    }
  }
}

/**
 * Start Pink Noise for deep concentration and blocking ambient distractions
 */
export function startFocusPinkNoise() {
  stopFocusPinkNoise();
  const ctx = getAudioContext();
  if (!ctx) return;

  const bufferSize = ctx.sampleRate * 2; // 2 seconds loop
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
    b6 = white * 0.115926;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1000, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1.0);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start();
  currentNoiseNode = { source, gain };
}

export function stopFocusPinkNoise() {
  if (currentNoiseNode && audioCtx) {
    try {
      currentNoiseNode.gain.gain.setValueAtTime(currentNoiseNode.gain.gain.value, audioCtx.currentTime);
      currentNoiseNode.gain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
      setTimeout(() => {
        try {
          currentNoiseNode?.source.stop();
          currentNoiseNode?.source.disconnect();
          currentNoiseNode = null;
        } catch {}
      }, 350);
    } catch {
      currentNoiseNode = null;
    }
  }
}
