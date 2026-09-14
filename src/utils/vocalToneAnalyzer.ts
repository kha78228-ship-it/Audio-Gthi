import { SPIRITUAL_SOUNDSCAPES } from '../data/spiritualData';
import { FEATURED_PLAYLISTS } from '../data';
import { spiritualAudio } from './spiritualAudioSynthesizer';
import { haptics } from './haptics';

export type VocalToneType = 
  | 'stress_fatigue' 
  | 'calm_serene' 
  | 'deep_focus' 
  | 'energetic_joyful' 
  | 'romantic_tender' 
  | 'mystical_meditative';

export interface AcousticMetrics {
  pitchHz: number;
  rmsVolume: number;
  energyPercent: number;
  spectralCentroid?: number;
  stabilityScore: number;
}

export interface SuggestedAudioPlaylist {
  id: string;
  title: string;
  genre: string;
  description: string;
  coverUrl: string;
  reason: string;
}

export interface SuggestedSpiritualSoundscape {
  id: string;
  title: string;
  frequencyHz: number;
  frequencyLabel: string;
  chakraName: string;
  benefit: string;
  colorGradient: string;
  accentColor: string;
  reason: string;
  soundscapeType: 'solfeggio' | 'singing_bowl' | 'spatial';
}

export interface VocalToneAnalysisResult {
  tone: VocalToneType;
  toneLabel: string;
  emoji: string;
  badge: string;
  confidence: number;
  energyLevel: 'low' | 'balanced' | 'high';
  estimatedPitchHz: number;
  moodDescription: string;
  suggestedPlaylist: SuggestedAudioPlaylist;
  suggestedSoundscape: SuggestedSpiritualSoundscape;
}

// 6 Comprehensive Preset Tone Profiles with Tailored Playlists & Spiritual Soundscapes
export const VOCAL_TONE_PROFILES: Record<VocalToneType, Omit<VocalToneAnalysisResult, 'confidence' | 'estimatedPitchHz'>> = {
  stress_fatigue: {
    tone: 'stress_fatigue',
    toneLabel: 'Căng Thẳng & Cần Giải Tỏa',
    emoji: '🌿',
    badge: 'Stress Relief & Healing',
    energyLevel: 'low',
    moodDescription: 'Giọng nói có âm sắc mệt mỏi, nặng trĩu hoặc dồn nén. Tâm trí và cơ thể đang cần một khoảng lặng dịu êm để phục hồi năng lượng sinh học.',
    suggestedPlaylist: {
      id: 'f1',
      title: 'Lo-Fi Chill & Giải Tỏa Căng Thẳng',
      genre: 'Lo-Fi Chill',
      description: 'Những thanh âm êm dịu, ấm áp giúp xoa dịu hệ thần kinh và đưa bạn về trạng thái thư giãn tối đa.',
      coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
      reason: 'Tiết tấu chậm (60-70 BPM) giúp hạ nhịp tim, giảm cortisol và giải tỏa căng thẳng sau giờ làm việc.'
    },
    suggestedSoundscape: {
      id: 'solfeggio_432',
      title: '432 Hz - Tần Số Bình An Vũ Trụ',
      frequencyHz: 432,
      frequencyLabel: '432 Hz',
      chakraName: 'Hòa Hợp Toàn Thân & Đất Mẹ',
      benefit: 'Đồng bộ sóng não với nhịp đập tự nhiên (Schumann Resonance 8Hz), xua tan âu lo và áp lực dồn nén.',
      colorGradient: 'from-teal-500 via-emerald-600 to-cyan-900',
      accentColor: '#14b8a6',
      reason: 'Sóng âm 432Hz đưa não bộ vào trạng thái Alpha thư thái, xoa dịu các bó cơ căng thẳng.',
      soundscapeType: 'solfeggio'
    }
  },

  calm_serene: {
    tone: 'calm_serene',
    toneLabel: 'Trầm Tĩnh & Bình An',
    emoji: '🕊️',
    badge: 'Peaceful & Grounded',
    energyLevel: 'balanced',
    moodDescription: 'Âm sắc thanh thoát, ấm áp và từ tốn. Bạn đang duy trì trạng thái tâm lý cân bằng, tự tại và an yên tuyệt đối.',
    suggestedPlaylist: {
      id: 'f3',
      title: 'Acoustic Buổi Sáng Bình Yên',
      genre: 'Acoustic & Indie',
      description: 'Thanh âm mộc mạc của guitar gỗ và giai điệu trong trẻo mở ra ngày mới ngập tràn hy vọng.',
      coverUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80',
      reason: 'Giai điệu mộc mạc thuần khiết cộng hưởng hài hòa với tâm thế bình an của bạn.'
    },
    suggestedSoundscape: {
      id: 'solfeggio_528',
      title: '528 Hz - Tần Số Phép Màu & Tình Yêu',
      frequencyHz: 528,
      frequencyLabel: '528 Hz',
      chakraName: 'Luân Xa Tim (Anahata)',
      benefit: 'Tần số chuyển hóa kỳ diệu (Miracle Tone), tái tạo tế bào, lan tỏa tình yêu thương và sự hân hoan.',
      colorGradient: 'from-emerald-500 via-green-600 to-teal-900',
      accentColor: '#10b981',
      reason: 'Cộng hưởng với luân xa tim, khuếch đại năng lượng bình an và đón nhận năng lượng tích cực.',
      soundscapeType: 'solfeggio'
    }
  },

  deep_focus: {
    tone: 'deep_focus',
    toneLabel: 'Tập Trung Sâu & Tư Duy',
    emoji: '🧠',
    badge: 'Deep Flow & Focus',
    energyLevel: 'balanced',
    moodDescription: 'Giọng điệu rành mạch, dứt khoát, âm vực ổn định. Bạn đang bước vào trạng thái làm việc sâu (Deep Work / Flow State).',
    suggestedPlaylist: {
      id: 'f-focus',
      title: 'Lo-Fi Tập Trung Làm Việc & Coding',
      genre: 'Lo-Fi Chill',
      description: 'Nhịp beat không lời đều đặn giúp não bộ khóa chặt sự chú ý và tối ưu năng suất làm việc.',
      coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
      reason: 'Loại bỏ hoàn toàn tạp âm gây phân tâm, duy trì sóng não Beta-Alpha ổn định cho tư duy logic.'
    },
    suggestedSoundscape: {
      id: 'solfeggio_741',
      title: '741 Hz - Khai Mở Trực Giác & Thanh Tẩy Trí Tuệ',
      frequencyHz: 741,
      frequencyLabel: '741 Hz',
      chakraName: 'Luân Xa Cổ Họng & Trí Tuệ (Vishuddha)',
      benefit: 'Thanh lọc các suy nghĩ rối bời, kích thích khả năng phân tích logic và giải quyết vấn đề sắc bén.',
      colorGradient: 'from-cyan-500 via-blue-600 to-slate-900',
      accentColor: '#06b6d4',
      reason: 'Làm sạch trường thông tin tư duy, mở rộng khả năng tiếp thu kiến thức và sáng tạo.',
      soundscapeType: 'solfeggio'
    }
  },

  energetic_joyful: {
    tone: 'energetic_joyful',
    toneLabel: 'Hào Hứng & Năng Lượng Đỉnh Cao',
    emoji: '⚡',
    badge: 'High Energy & Uplift',
    energyLevel: 'high',
    moodDescription: 'Cao độ thanh âm sáng rực, tiết tấu nói nhanh, biên độ mạnh mẽ. Nguồn năng lượng tích cực và nhiệt huyết đang dâng trào.',
    suggestedPlaylist: {
      id: 'f2',
      title: 'Coding Night in Cyberpunk (Lossless VIP)',
      genre: 'Electronic & Cyberpunk',
      description: 'Bản phối Synthwave & Bassline điện tử bùng nổ năng lượng, kích thích trí não bức phá mọi giới hạn.',
      coverUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
      reason: 'Tiết tấu 128-135 BPM đẩy cao nhịp tim và dopamine, kích hoạt sự hưng phấn tột độ.'
    },
    suggestedSoundscape: {
      id: 'solfeggio_852',
      title: '852 Hz - Đánh Thức Năng Lượng Trực Giác',
      frequencyHz: 852,
      frequencyLabel: '852 Hz',
      chakraName: 'Luân Xa Con Mắt Thứ Ba (Ajna)',
      benefit: 'Đánh thức thị giác trực cảm, kết nối với nguồn cảm hứng vô tận và trí tuệ bản thể cao hơn.',
      colorGradient: 'from-indigo-500 via-purple-600 to-violet-950',
      accentColor: '#6366f1',
      reason: 'Nâng cao tần số rung động sinh học tương xứng với năng lượng rực lửa của bạn.',
      soundscapeType: 'solfeggio'
    }
  },

  romantic_tender: {
    tone: 'romantic_tender',
    toneLabel: 'Ngọt Ngào & Tình Cảm',
    emoji: '💖',
    badge: 'Romantic & Tender',
    energyLevel: 'balanced',
    moodDescription: 'Tông giọng mềm mại, ấm áp, nhịp điệu ngân nga tình cảm. Trái tim bạn đang rộng mở hướng về tình yêu và sự gắn kết tri kỷ.',
    suggestedPlaylist: {
      id: 'f5',
      title: 'I Love Haevy - Tình Ca Đôi Lứa Lãng Mạn',
      genre: 'Pop & Ballad',
      description: 'Những bản tình ca ngọt ngào dành riêng cho những khoảnh khắc yêu dấu, sưởi ấm trái tim đôi lứa.',
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      reason: 'Thăng hoa cảm xúc yêu thương, khơi gợi những ký ức ngọt ngào và rung động chân thành.'
    },
    suggestedSoundscape: {
      id: 'solfeggio_639',
      title: '639 Hz - Kết Nối Duyên Lành & Trắc Ẩn',
      frequencyHz: 639,
      frequencyLabel: '639 Hz',
      chakraName: 'Giao Tiếp & Hòa Hợp Quan Hệ',
      benefit: 'Hàn gắn các kết nối tâm hồn, nuôi dưỡng lòng trắc ẩn, gia tăng sự thấu cảm và thu hút nhân duyên tốt lành.',
      colorGradient: 'from-blue-500 via-indigo-600 to-purple-900',
      accentColor: '#3b82f6',
      reason: 'Mở rộng cầu nối thấu hiểu giữa hai tâm hồn, xóa tan khoảng cách cảm xúc.',
      soundscapeType: 'solfeggio'
    }
  },

  mystical_meditative: {
    tone: 'mystical_meditative',
    toneLabel: 'Tâm Linh & Huyền Bí',
    emoji: '🔮',
    badge: 'Spiritual Awakening',
    energyLevel: 'low',
    moodDescription: 'Âm sắc vang vọng chiều sâu, lắng đọng và giàu tính chiêm nghiệm. Bạn đang khát khao chạm tới chân lý và huyền học vũ trụ.',
    suggestedPlaylist: {
      id: 'f-story-1',
      title: 'Tuyển Tập Truyện Tiên Hiệp & Huyền Thuật Kỳ Ảo',
      genre: 'Truyện Tiên Hiệp & Kiếm Hiệp',
      description: 'Khám phá thế giới tu chân kỳ ảo, pháp bảo vạn năm và hành trình nghịch thiên thành tiên.',
      coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      reason: 'Dẫn dắt tâm thức phiêu du vào cõi vô cực, kích thích trí tưởng tượng huyền học kỳ vĩ.'
    },
    suggestedSoundscape: {
      id: 'solfeggio_963',
      title: '963 Hz - Vương Miện Thức Tỉnh & Vũ Trụ',
      frequencyHz: 963,
      frequencyLabel: '963 Hz',
      chakraName: 'Luân Xa Vương Miện (Sahasrara)',
      benefit: 'Đồng nhất với ý thức vũ trụ thuần khiết, trải nghiệm giác ngộ, bình an tối thượng và năng lượng đỉnh cao.',
      colorGradient: 'from-purple-500 via-pink-600 to-amber-900',
      accentColor: '#a855f7',
      reason: 'Tần số rung động cao nhất trong thang Solfeggio, kích hoạt luân xa đỉnh đầu kết nối cội nguồn.',
      soundscapeType: 'solfeggio'
    }
  }
};

// Keyword sets for Vietnamese linguistic sentiment & intent detection
const TONE_KEYWORDS: Record<VocalToneType, string[]> = {
  stress_fatigue: [
    'mệt', 'mệt mỏi', 'áp lực', 'stress', 'lo lắng', 'căng thẳng', 'buồn', 'chán', 
    'đuối', 'khó thở', 'nhức đầu', 'oải', 'tối tăm', 'ngộp', 'bực', 'tức giận', 
    'thở dài', 'nản', 'đuối sức', 'kiệt sức', 'đau đầu', 'áp lực công việc', 'buồn ngủ'
  ],
  deep_focus: [
    'tập trung', 'làm việc', 'học', 'học tập', 'code', 'coding', 'nghiên cứu', 
    'suy nghĩ', 'dự án', 'deadline', 'báo cáo', 'tư duy', 'đọc sách', 'chiến lược', 
    'ghi nhớ', 'viết lách', 'flow', 'deep work', 'chuyên tâm'
  ],
  calm_serene: [
    'bình yên', 'thư giãn', 'tĩnh lặng', 'chill', 'nhẹ nhàng', 'êm dịu', 'thảnh thơi', 
    'an nhiên', 'nghỉ ngơi', 'thoải mái', 'thanh thản', 'yên tĩnh', 'thanh tịnh', 
    'ngủ ngon', 'êm ái', 'an lạc'
  ],
  energetic_joyful: [
    'vui', 'hào hứng', 'năng lượng', 'cháy', 'sôi động', 'quẩy', 'tuyệt vời', 
    'phấn khích', 'chiến', 'bùng nổ', 'quá đã', 'nhanh', 'hưng phấn', 'sung sức', 
    'vui vẻ', 'sảng khoái', 'tự tin', 'chiến thắng', 'bùng cháy'
  ],
  romantic_tender: [
    'yêu', 'nhớ', 'thương', 'người yêu', 'cặp đôi', 'ngọt ngào', 'lãng mạn', 
    'hẹn hò', 'bên nhau', 'tim', 'anh yêu', 'em yêu', 'hạnh phúc', 'nắm tay', 
    'duyên nợ', 'tỏ tình', 'kỷ niệm'
  ],
  mystical_meditative: [
    'thiền', 'tâm linh', 'tử vi', 'tarot', 'vũ trụ', 'luân xa', 'chuông', 
    'chuông xoay', 'chữa lành', 'tần số', 'solfeggio', 'nhân duyên', 'bát tự', 
    'phong thủy', 'chiêm tinh', 'giác ngộ', 'hào quang', 'tiên hiệp', 'đạo pháp'
  ]
};

/**
 * Intelligent Vocal Tone Analyzer:
 * Combines NLP transcript semantics with real-time acoustic pitch and energy metrics.
 */
export function analyzeVocalTone(
  transcript: string, 
  acousticMetrics?: Partial<AcousticMetrics>
): VocalToneAnalysisResult {
  const cleanText = (transcript || '').toLowerCase().trim();
  
  // 1. Calculate Keyword Scores
  const scores: Record<VocalToneType, number> = {
    stress_fatigue: 0,
    calm_serene: 0,
    deep_focus: 0,
    energetic_joyful: 0,
    romantic_tender: 0,
    mystical_meditative: 0
  };

  if (cleanText) {
    for (const [toneKey, keywords] of Object.entries(TONE_KEYWORDS) as [VocalToneType, string[]][]) {
      for (const kw of keywords) {
        if (cleanText.includes(kw)) {
          // Exact keyword hit
          scores[toneKey] += kw.includes(' ') ? 3.5 : 2.0;
        }
      }
    }
  }

  // 2. Incorporate Acoustic Features if available
  const pitch = acousticMetrics?.pitchHz || 170;
  const energy = acousticMetrics?.energyPercent || 50;
  const stability = acousticMetrics?.stabilityScore || 70;

  // High pitch (> 220Hz) + High energy (> 70%) strongly indicates high arousal: energetic or stress
  if (pitch > 220 && energy > 65) {
    if (scores.stress_fatigue > 0) {
      scores.stress_fatigue += 3;
    } else {
      scores.energetic_joyful += 2.5;
    }
  } 
  // Low pitch (< 140Hz) + Low energy (< 40%) indicates calmness or fatigue/meditation
  else if (pitch < 145 && energy < 45) {
    if (scores.mystical_meditative > 0) {
      scores.mystical_meditative += 2;
    } else if (scores.calm_serene > 0) {
      scores.calm_serene += 2;
    } else {
      scores.calm_serene += 1.5;
    }
  }
  // Moderate steady pitch with high stability indicates deep focus
  else if (stability > 75 && energy >= 40 && energy <= 65) {
    scores.deep_focus += 1.5;
  }

  // 3. Find highest scoring tone
  let bestTone: VocalToneType = 'calm_serene';
  let maxScore = -1;

  for (const [toneKey, score] of Object.entries(scores) as [VocalToneType, number][]) {
    if (score > maxScore) {
      maxScore = score;
      bestTone = toneKey;
    }
  }

  // If no strong signal was found from short speech, default to thoughtful calm_serene or deep_focus
  if (maxScore <= 0) {
    if (energy > 60) {
      bestTone = 'energetic_joyful';
    } else if (energy < 35) {
      bestTone = 'calm_serene';
    } else {
      bestTone = 'deep_focus';
    }
  }

  const profile = VOCAL_TONE_PROFILES[bestTone];
  const calculatedConfidence = Math.min(98, Math.max(78, 80 + Math.round(maxScore * 3.5)));

  return {
    ...profile,
    confidence: calculatedConfidence,
    estimatedPitchHz: Math.round(pitch),
    energyLevel: energy > 65 ? 'high' : energy < 38 ? 'low' : 'balanced'
  };
}

/**
 * Web Audio API Acoustic Listener:
 * Attaches an AnalyserNode to a media stream (Microphone) to extract live acoustic pitch and volume.
 */
export class WebAudioToneSensor {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  private onMetricsUpdate: ((metrics: AcousticMetrics) => void) | null = null;

  public async start(stream: MediaStream, onUpdate: (metrics: AcousticMetrics) => void) {
    try {
      this.onMetricsUpdate = onUpdate;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      this.audioCtx = new AudioContextClass();
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      this.microphone = this.audioCtx.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);

      this.isRunning = true;
      this.loop();
    } catch (err) {
      console.warn('WebAudioToneSensor initialization notice:', err);
    }
  }

  private loop = () => {
    if (!this.isRunning || !this.analyser) return;

    const bufferLength = this.analyser.fftSize;
    const timeData = new Float32Array(bufferLength);
    this.analyser.getFloatTimeDomainData(timeData);

    // Compute RMS Energy
    let sumSquares = 0;
    for (let i = 0; i < bufferLength; i++) {
      sumSquares += timeData[i] * timeData[i];
    }
    const rms = Math.sqrt(sumSquares / bufferLength);
    const energyPercent = Math.min(100, Math.round(rms * 400));

    // Pitch detection via Autocorrelation
    let pitchHz = 175; // Default speech average
    if (rms > 0.02) {
      pitchHz = this.autoCorrelate(timeData, this.audioCtx?.sampleRate || 44100);
      if (pitchHz === -1 || pitchHz < 60 || pitchHz > 600) {
        pitchHz = 175;
      }
    }

    if (this.onMetricsUpdate && rms > 0.005) {
      this.onMetricsUpdate({
        pitchHz: Math.round(pitchHz),
        rmsVolume: rms,
        energyPercent: Math.max(10, energyPercent),
        stabilityScore: Math.min(95, Math.max(40, 100 - Math.round(Math.abs(pitchHz - 180) * 0.3)))
      });
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private autoCorrelate(buffer: Float32Array, sampleRate: number): number {
    const SIZE = buffer.length;
    let sum = 0;
    for (let i = 0; i < SIZE; i++) {
      sum += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sum / SIZE);
    if (rms < 0.01) return -1;

    let r1 = 0;
    let r2 = SIZE - 1;
    const thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < thres) {
        r1 = i;
        break;
      }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < thres) {
        r2 = SIZE - i;
        break;
      }
    }

    const trimmedBuffer = buffer.slice(r1, r2);
    const c = new Array(trimmedBuffer.length).fill(0);
    for (let i = 0; i < trimmedBuffer.length; i++) {
      for (let j = 0; j < trimmedBuffer.length - i; j++) {
        c[i] = c[i] + trimmedBuffer[j] * trimmedBuffer[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1;
    let maxpos = -1;
    for (let i = d; i < trimmedBuffer.length; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    let T0 = maxpos;

    return sampleRate / T0;
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch {}
      this.audioCtx = null;
    }
  }
}

/**
 * Execute smart immediate playback of suggested Solfeggio soundscape
 */
export function playSuggestedSpiritualSoundscape(soundscape: SuggestedSpiritualSoundscape): boolean {
  try {
    haptics.impact('heavy');
    if (soundscape.soundscapeType === 'singing_bowl') {
      spiritualAudio.playSingingBowl(soundscape.frequencyHz);
    } else {
      spiritualAudio.startSolfeggioTone(soundscape.frequencyHz, 0.35);
    }
    return true;
  } catch (err) {
    console.warn('Playback error:', err);
    return false;
  }
}
