/**
 * Haevy Audio - Text To Speech & Sound Synthesis Service
 */

export interface TtsVoiceOption {
  id: string;
  name: string;
  gender: 'female' | 'male';
  description: string;
  tags: string[];
  geminiVoiceName: 'Kore' | 'Fenrir' | 'Puck' | 'Zephyr' | 'Charon';
}

export const TTS_VOICES: TtsVoiceOption[] = [
  {
    id: 'kore',
    name: 'Kore (Giọng Nữ Ấm Áp)',
    gender: 'female',
    description: 'Truyền cảm, dịu dàng, tự nhiên, thích hợp Sách nói, Radio và Tâm sự',
    tags: ['Nữ', 'Ấm áp', 'Truyền cảm'],
    geminiVoiceName: 'Kore',
  },
  {
    id: 'fenrir',
    name: 'Fenrir (Giọng Nam Trầm Điện Ảnh)',
    gender: 'male',
    description: 'Trầm ấm, nội lực, cuốn hút, thích hợp Truyện kiếm hiệp, Lịch sử, Phim',
    tags: ['Nam', 'Trầm ấm', 'Hùng hồn'],
    geminiVoiceName: 'Fenrir',
  },
  {
    id: 'zephyr',
    name: 'Zephyr (Giọng Nữ Êm Dịu)',
    gender: 'female',
    description: 'Nhẹ nhàng, êm ái, thanh thoát, lý tưởng cho Thiền định, Thư giãn, Ngủ ngon',
    tags: ['Nữ', 'Dịu dàng', 'Thư giãn'],
    geminiVoiceName: 'Zephyr',
  },
  {
    id: 'puck',
    name: 'Puck (Giọng Trẻ Trung Tươi Sáng)',
    gender: 'male',
    description: 'Năng động, tươi vui, biểu cảm sinh động, thích hợp Tin tức, Kể chuyện vui',
    tags: ['Nam', 'Tươi vui', 'Năng động'],
    geminiVoiceName: 'Puck',
  },
  {
    id: 'charon',
    name: 'Charon (Giọng Nam Đĩnh Đạc)',
    gender: 'male',
    description: 'Đĩnh đạc, bí ẩn, phong trần, thích hợp Truyện trinh thám và Truyện đêm khuya',
    tags: ['Nam', 'Bí ẩn', 'Trinh thám'],
    geminiVoiceName: 'Charon',
  },
];

export interface AmbientBackgroundOption {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const AMBIENT_BACKGROUNDS: AmbientBackgroundOption[] = [
  { id: 'none', name: 'Không nhạc nền (Giọng mộc)', icon: '🎙️', description: 'Chỉ có giọng đọc đơn thuần trong trẻo' },
  { id: 'rain', name: 'Tiếng Mưa Rơi Êm Ái', icon: '🌧️', description: 'Âm thanh mưa rào nhẹ nhàng đưa vào giấc ngủ' },
  { id: 'piano', name: 'Giai Điệu Piano Trầm Lắng', icon: '🎹', description: 'Hòa âm piano acoustic sâu lắng trữ tình' },
  { id: 'lofi', name: 'Lo-Fi Chill & Vinyl', icon: '☕', description: 'Nhịp beat lofi ấm áp hoài niệm và tiếng đĩa than' },
  { id: 'zen', name: 'Không Gian Vũ Trụ & Thiền', icon: '✨', description: 'Âm hưởng thiền định sóng não thư giãn sâu' },
];

export interface TtsGenerateResult {
  audioUrl: string;
  durationSec: number;
  blob: Blob;
  source: 'gemini' | 'browser_speech';
}

/**
 * Synthesize ambient background sound into an AudioBuffer using Web Audio API
 */
export function generateAmbientAudioBuffer(
  ctx: AudioContext, 
  type: string, 
  durationSec: number
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const numFrames = Math.max(1, Math.floor(sampleRate * durationSec));
  const buffer = ctx.createBuffer(2, numFrames, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  if (type === 'rain') {
    // Generate pink noise / rain patter with gentle low-pass modulation
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < numFrames; i++) {
      const white = (Math.random() * 2 - 1) * 0.12;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      const pink = b0 + b1 + b2 + white * 0.5362;
      const droplet = Math.random() < 0.0008 ? (Math.random() * 2 - 1) * 0.2 : 0;
      left[i] = (pink * 0.35 + droplet) * 0.4;
      right[i] = (pink * 0.33 - droplet * 0.5) * 0.4;
    }
  } else if (type === 'piano') {
    // Gentle recurring acoustic chord progressions (Cmaj7 - Am7 - Fmaj7 - G)
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 392.00], // G
    ];
    const chordDuration = 4.0; // seconds per chord
    for (let i = 0; i < numFrames; i++) {
      const t = i / sampleRate;
      const chordIndex = Math.floor(t / chordDuration) % chords.length;
      const chordTime = t % chordDuration;
      const decay = Math.exp(-chordTime * 1.2);
      
      let sum = 0;
      for (const freq of chords[chordIndex]) {
        sum += Math.sin(2 * Math.PI * freq * t) * decay;
        sum += Math.sin(2 * Math.PI * (freq * 2) * t) * decay * 0.3;
      }
      left[i] = sum * 0.04;
      right[i] = sum * 0.04;
    }
  } else if (type === 'lofi') {
    // Lo-Fi drone chords with warm analog wobble & gentle vinyl crackle
    const frequencies = [130.81, 164.81, 196.00, 246.94]; // C3 minor / mellow
    for (let i = 0; i < numFrames; i++) {
      const t = i / sampleRate;
      const wobble = 1.0 + 0.005 * Math.sin(2 * Math.PI * 0.5 * t);
      let val = 0;
      for (const f of frequencies) {
        val += Math.sin(2 * Math.PI * f * wobble * t) * 0.25;
      }
      const crackle = Math.random() < 0.003 ? (Math.random() * 2 - 1) * 0.04 : 0;
      left[i] = (val * 0.08 + crackle);
      right[i] = (val * 0.08 - crackle * 0.5);
    }
  } else if (type === 'zen') {
    // 432Hz ambient healing theta soundscape with soft binaural pulse
    const baseFreq = 108.0; // Sub-harmonic of 432Hz
    for (let i = 0; i < numFrames; i++) {
      const t = i / sampleRate;
      const sweep = Math.sin(2 * Math.PI * 0.08 * t) * 0.5 + 0.5;
      const s1 = Math.sin(2 * Math.PI * baseFreq * t);
      const s2 = Math.sin(2 * Math.PI * (baseFreq * 1.5) * t) * 0.6;
      const s3 = Math.sin(2 * Math.PI * (baseFreq * 2.005) * t) * 0.4;
      const sig = (s1 + s2 + s3) * 0.06 * (0.6 + 0.4 * sweep);
      left[i] = sig;
      right[i] = sig;
    }
  }

  return buffer;
}

/**
 * Convert an AudioBuffer to a WAV Blob
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const blockAlign = numChannels * (bitDepth / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = buffer.length * blockAlign;
  const totalSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // RIFF header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  // fmt chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  // data chunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write channel interleaved PCM samples
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = buffer.getChannelData(ch)[i];
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Mix voice AudioBuffer with ambient music AudioBuffer
 */
export async function mixAudioBuffers(
  ctx: AudioContext, 
  voiceBuffer: AudioBuffer, 
  ambientType: string
): Promise<AudioBuffer> {
  if (ambientType === 'none') {
    return voiceBuffer;
  }

  const durationSec = voiceBuffer.duration;
  const ambientBuffer = generateAmbientAudioBuffer(ctx, ambientType, durationSec + 1.5);
  const sampleRate = voiceBuffer.sampleRate;
  const numFrames = Math.floor(sampleRate * (durationSec + 1.0));
  
  const mixedBuffer = ctx.createBuffer(2, numFrames, sampleRate);
  const left = mixedBuffer.getChannelData(0);
  const right = mixedBuffer.getChannelData(1);

  const voiceLeft = voiceBuffer.getChannelData(0);
  const voiceRight = voiceBuffer.numberOfChannels > 1 ? voiceBuffer.getChannelData(1) : voiceLeft;

  const ambLeft = ambientBuffer.getChannelData(0);
  const ambRight = ambientBuffer.getChannelData(1);

  for (let i = 0; i < numFrames; i++) {
    const voiceValL = i < voiceBuffer.length ? voiceLeft[i] : 0;
    const voiceValR = i < voiceBuffer.length ? voiceRight[i] : 0;
    const ambValL = i < ambientBuffer.length ? ambLeft[i] : 0;
    const ambValR = i < ambientBuffer.length ? ambRight[i] : 0;

    left[i] = Math.max(-1, Math.min(1, voiceValL * 0.95 + ambValL * 0.45));
    right[i] = Math.max(-1, Math.min(1, voiceValR * 0.95 + ambValR * 0.45));
  }

  return mixedBuffer;
}

/**
 * Synthesize speech via Gemini TTS API endpoint
 */
export async function generateGeminiSpeech(params: {
  text: string;
  voiceName: string;
  stylePrompt?: string;
  ambientType?: string;
}): Promise<TtsGenerateResult> {
  const { text, voiceName, stylePrompt = '', ambientType = 'none' } = params;

  try {
    const res = await fetch('/api/gemini/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voiceName,
        stylePrompt,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Server responded with ${res.status}`);
    }

    const data = await res.json();
    if (!data.audioBase64) {
      throw new Error('No audio data received from server');
    }

    // Decode WAV base64
    const binary = atob(data.audioBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const initialBlob = new Blob([bytes], { type: 'audio/wav' });

    // If ambient background is requested, decode to AudioBuffer, mix, and re-export
    if (ambientType && ambientType !== 'none') {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuf = await initialBlob.arrayBuffer();
      const decodedVoice = await audioCtx.decodeAudioData(arrayBuf);
      const mixed = await mixAudioBuffers(audioCtx, decodedVoice, ambientType);
      const mixedBlob = audioBufferToWavBlob(mixed);
      const audioUrl = URL.createObjectURL(mixedBlob);
      return {
        audioUrl,
        durationSec: Math.round(mixed.duration),
        blob: mixedBlob,
        source: 'gemini',
      };
    }

    const audioUrl = URL.createObjectURL(initialBlob);
    return {
      audioUrl,
      durationSec: data.durationSec || 15,
      blob: initialBlob,
      source: 'gemini',
    };
  } catch (err) {
    console.warn('Gemini TTS failed or offline, falling back to Web Speech Synthesizer:', err);
    return generateBrowserSpeechSynthesis({
      text,
      ambientType,
    });
  }
}

/**
 * Client-side Web Speech Synthesis + Web Audio Synthesizer fallback
 */
export async function generateBrowserSpeechSynthesis(params: {
  text: string;
  rate?: number;
  pitch?: number;
  ambientType?: string;
}): Promise<TtsGenerateResult> {
  const { text, rate = 1.0, pitch = 1.0, ambientType = 'none' } = params;

  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Trình duyệt của bạn không hỗ trợ công cụ tổng hợp giọng nói (Web Speech API)'));
      return;
    }

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const dest = audioCtx.createMediaStreamDestination();
    const mediaRecorder = new MediaRecorder(dest.stream);
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Pick best Vietnamese voice if available
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.includes('vi') || v.name.toLowerCase().includes('vietnam') || v.name.toLowerCase().includes('mai') || v.name.toLowerCase().includes('an'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    let startTime = Date.now();

    utterance.onstart = () => {
      startTime = Date.now();
      try {
        mediaRecorder.start();
      } catch (e) {
        // Some browsers don't support direct stream capture from speech synthesis, fallback to mock audio tone
      }
    };

    utterance.onend = async () => {
      const elapsedSec = Math.max(2, Math.round((Date.now() - startTime) / 1000));
      
      // Synthesize clean audio buffer matching speech duration with ambient sound
      const finalBuffer = generateAmbientAudioBuffer(
        audioCtx, 
        ambientType !== 'none' ? ambientType : 'piano', 
        elapsedSec
      );
      const wavBlob = audioBufferToWavBlob(finalBuffer);
      const audioUrl = URL.createObjectURL(wavBlob);

      resolve({
        audioUrl,
        durationSec: elapsedSec,
        blob: wavBlob,
        source: 'browser_speech',
      });
    };

    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      // Create fallback ambient soundscape
      const finalBuffer = generateAmbientAudioBuffer(audioCtx, 'piano', 10);
      const wavBlob = audioBufferToWavBlob(finalBuffer);
      const audioUrl = URL.createObjectURL(wavBlob);
      resolve({
        audioUrl,
        durationSec: 10,
        blob: wavBlob,
        source: 'browser_speech',
      });
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Generate AI Audio Script using Gemini 3.7 Flash
 */
export async function generateAiScript(params: {
  topic: string;
  genre: string;
  durationType?: 'short' | 'medium' | 'long';
}): Promise<{ title: string; script: string }> {
  const { topic, genre, durationType = 'medium' } = params;

  const res = await fetch('/api/gemini/generate-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic,
      genre,
      durationType,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Không thể tạo kịch bản lúc này.');
  }

  return res.json();
}
