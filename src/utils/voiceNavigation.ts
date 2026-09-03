/**
 * Haevy Ecosystem Intelligent Voice Navigation Engine
 * Utilizes the Web SpeechRecognition API to parse Vietnamese & English voice commands
 * and automatically navigate across all Haevy ecosystem modes and trigger actions.
 */

import { HaevyMode } from '../App';
import { triggerHaptic } from './haptics';

export interface VoiceCommandMatch {
  type: 'navigate' | 'action';
  mode?: HaevyMode | string;
  subTab?: string;
  action?: 'fullscreen' | 'notifications' | 'shortcuts' | 'auth' | 'stop_listening';
  label: string;
  feedbackText: string;
  confidence?: number;
}

// Sound synthesizer for audio cues
function playVoiceAudioCue(type: 'start' | 'match' | 'stop' | 'error') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'start') {
      // Ascending two-tone chime (Listening started)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'match') {
      // Pleasant triple harmonic chime (Command recognized & executed)
      [587.33, 739.99, 880.00].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.1, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.3);
      });
    } else if (type === 'stop') {
      // Soft descending tone (Stopped listening)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.15);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch {
    // Graceful fallback if web audio is not permitted
  }
}

// Remove Vietnamese accents & diacritics for ultra-flexible fuzzy matching
export function normalizeVietnameseString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Match a raw spoken transcript against Haevy ecosystem command rules
 */
export function matchVoiceCommand(transcript: string): VoiceCommandMatch | null {
  if (!transcript || !transcript.trim()) return null;

  const raw = transcript.toLowerCase().trim();
  const normalized = normalizeVietnameseString(transcript);

  // 1. Stop Listening / Tắt Mic
  if (
    normalized.includes('tat mic') ||
    normalized.includes('dung nghe') ||
    normalized.includes('ngung nghe') ||
    normalized.includes('dong mic') ||
    raw.includes('stop listening') ||
    raw.includes('stop mic')
  ) {
    return {
      type: 'action',
      action: 'stop_listening',
      label: 'Dừng lắng nghe',
      feedbackText: 'Đã tắt chế độ lắng nghe giọng nói.'
    };
  }

  // 2. Haevy Finance (Sổ thu chi 6 hũ) - As requested: "Đi đến Haevy Finance", "Mở tài chính", v.v.
  if (
    normalized.includes('finance') ||
    normalized.includes('tai chinh') ||
    normalized.includes('so thu chi') ||
    normalized.includes('thu chi') ||
    normalized.includes('quan ly chi tieu') ||
    normalized.includes('quan ly tien') ||
    normalized.includes('6 hu') ||
    normalized.includes('ngan sach') ||
    normalized.includes('so chi tieu')
  ) {
    return {
      type: 'navigate',
      mode: 'finance',
      label: 'Haevy Finance',
      feedbackText: 'Đang chuyển đến Haevy Finance (Sổ Thu Chi 6 Hũ)...'
    };
  }

  // 3. Haevy Studio (Phòng thu AI) - As requested: "Mở phòng thu", "Đi đến Haevy Studio", v.v.
  if (
    normalized.includes('phong thu') ||
    normalized.includes('studio') ||
    normalized.includes('ai voice') ||
    normalized.includes('chuyen van ban thanh giong noi') ||
    normalized.includes('tao giong doc') ||
    normalized.includes('thu am') ||
    normalized.includes('long tieng') ||
    normalized.includes('doc van ban')
  ) {
    return {
      type: 'navigate',
      mode: 'studio',
      label: 'Haevy Studio',
      feedbackText: 'Đang mở Haevy Studio (Phòng Thu AI Voice)...'
    };
  }

  // 4. Haevy Spiritual (Tâm Linh Vũ Trụ: Tarot, Tử Vi, Chiêm Tinh, Tình Duyên)
  if (
    normalized.includes('spiritual') ||
    normalized.includes('tam linh') ||
    normalized.includes('boi bai') ||
    normalized.includes('tarot') ||
    normalized.includes('tu vi') ||
    normalized.includes('chiem tinh') ||
    normalized.includes('cung hoang dao') ||
    normalized.includes('ban do sao') ||
    normalized.includes('xem boi') ||
    normalized.includes('solfeggio') ||
    normalized.includes('am thanh thien')
  ) {
    if (normalized.includes('tarot') || normalized.includes('boi bai')) {
      return {
        type: 'navigate',
        mode: 'spiritual',
        subTab: 'tarot',
        label: 'Haevy Tarot 3D',
        feedbackText: 'Đang mở Bói Bài Tarot 3D Vũ Trụ...'
      };
    }
    if (normalized.includes('tu vi') || normalized.includes('la so')) {
      return {
        type: 'navigate',
        mode: 'spiritual',
        subTab: 'tuvi',
        label: 'Tử Vi Đẩu Số 2026',
        feedbackText: 'Đang mở Lá Số Tử Vi 2026 & Vận Hạn...'
      };
    }
    if (normalized.includes('chiem tinh') || normalized.includes('hoang dao') || normalized.includes('ban do sao')) {
      return {
        type: 'navigate',
        mode: 'spiritual',
        subTab: 'astrology',
        label: 'Chiêm Tinh Hoàng Đạo',
        feedbackText: 'Đang mở Chiêm Tinh & Bản Đồ Sao...'
      };
    }
    if (normalized.includes('tinh duyen') || normalized.includes('hop tuoi') || normalized.includes('synastry')) {
      return {
        type: 'navigate',
        mode: 'spiritual',
        subTab: 'couple_spiritual',
        label: 'Tâm Linh Tình Duyên Cặp Đôi',
        feedbackText: 'Đang mở Bói Tình Duyên & Hòa Hợp Cặp Đôi...'
      };
    }
    return {
      type: 'navigate',
      mode: 'spiritual',
      subTab: 'tarot',
      label: 'Haevy Spiritual',
      feedbackText: 'Đang mở Phân Hệ Tâm Linh Vũ Trụ...'
    };
  }

  // 5. I Love Haevy (Không gian cặp đôi)
  if (
    normalized.includes('i love haevy') ||
    normalized.includes('love haevy') ||
    normalized.includes('cap doi') ||
    normalized.includes('tinh yeu') ||
    normalized.includes('nhat ky tinh yeu') ||
    normalized.includes('ban gai') ||
    normalized.includes('nguoi yeu') ||
    normalized.includes('khong gian cap doi')
  ) {
    return {
      type: 'navigate',
      mode: 'couple',
      label: 'I Love Haevy',
      feedbackText: 'Đang mở Không Gian Cặp Đôi (I Love Haevy)...'
    };
  }

  // 6. Haevy Message (Hộp thư & Trò chuyện)
  if (
    normalized.includes('message') ||
    normalized.includes('tin nhan') ||
    normalized.includes('hop thu') ||
    normalized.includes('chat') ||
    normalized.includes('ban be') ||
    normalized.includes('goi thoai') ||
    normalized.includes('nhan tin')
  ) {
    return {
      type: 'navigate',
      mode: 'messages',
      label: 'Haevy Message',
      feedbackText: 'Đang mở Hộp Thư Tin Nhắn & Bạn Bè (Haevy Message)...'
    };
  }

  // 7. Haevy AI Master
  if (
    normalized.includes('haevy ai') ||
    normalized.includes('ai master') ||
    normalized.includes('tro ly ai') ||
    normalized.includes('tri tue nhan tao') ||
    normalized.includes('hoi ai') ||
    normalized.includes('mo ai')
  ) {
    return {
      type: 'navigate',
      mode: 'haevy_ai',
      label: 'Haevy AI Master',
      feedbackText: 'Đang kết nối Haevy AI Master...'
    };
  }

  // 8. Haevy Audio (Nghe nhạc & Thư viện âm thanh)
  if (
    normalized.includes('haevy audio') ||
    normalized.includes('nghe nhac') ||
    normalized.includes('mo nhac') ||
    normalized.includes('am nhac') ||
    normalized.includes('bai hat') ||
    normalized.includes('trang chu nhac') ||
    (normalized.includes('audio') && !normalized.includes('studio'))
  ) {
    return {
      type: 'navigate',
      mode: 'audio',
      label: 'Haevy Audio',
      feedbackText: 'Đang mở Trang Chủ Haevy Audio...'
    };
  }

  // 9. Haevy Space (Bảng vẽ 3D AR)
  if (
    normalized.includes('space') ||
    normalized.includes('khong gian 3d') ||
    normalized.includes('bang ve 3d') ||
    normalized.includes('3d ar') ||
    normalized.includes('ve 3d') ||
    normalized.includes('vu tru 3d')
  ) {
    return {
      type: 'navigate',
      mode: 'space',
      label: 'Haevy Space',
      feedbackText: 'Đang mở Không Gian Vẽ 3D AR (Haevy Space)...'
    };
  }

  // 10. Haevy VIP (Nạp điểm & Quyền lợi VIP)
  if (
    normalized.includes('vip') ||
    normalized.includes('nap xu') ||
    normalized.includes('nap diem') ||
    normalized.includes('nap tien') ||
    normalized.includes('mua vip') ||
    normalized.includes('nang cap vip')
  ) {
    return {
      type: 'navigate',
      mode: 'vip',
      label: 'Haevy VIP Club',
      feedbackText: 'Đang mở Haevy VIP & Nạp Điểm...'
    };
  }

  // 11. Haevy Admin (Quản trị hệ thống)
  if (
    normalized.includes('admin') ||
    normalized.includes('quan tri') ||
    normalized.includes('quan tri vien') ||
    normalized.includes('bang quan tri')
  ) {
    return {
      type: 'navigate',
      mode: 'admin',
      label: 'Haevy Admin',
      feedbackText: 'Đang mở Bảng Quản Trị Hệ Thống (Haevy Admin)...'
    };
  }

  // 12. Haevy Games
  if (
    normalized.includes('game') ||
    normalized.includes('choi game') ||
    normalized.includes('dau truong game') ||
    normalized.includes('tro choi')
  ) {
    return {
      type: 'navigate',
      mode: 'games',
      label: 'Haevy Games',
      feedbackText: 'Đang mở Đấu Trường Haevy Games...'
    };
  }

  // 13. Haevy Support
  if (
    normalized.includes('support') ||
    normalized.includes('ho tro') ||
    normalized.includes('cham soc khach hang') ||
    normalized.includes('tro giup') ||
    normalized.includes('lien he')
  ) {
    return {
      type: 'navigate',
      mode: 'support',
      label: 'Haevy Support',
      feedbackText: 'Đang mở Trung Tâm Hỗ Trợ Haevy 24/7...'
    };
  }

  // 14. Trang Chủ Hệ Sinh Thái (Portal)
  if (
    normalized.includes('trang chu') ||
    normalized.includes('he sinh thai') ||
    normalized.includes('portal') ||
    normalized.includes('hub') ||
    normalized.includes('ve trang chu')
  ) {
    return {
      type: 'navigate',
      mode: 'portal',
      label: 'Trang Chủ Hệ Sinh Thái',
      feedbackText: 'Đang quay về Cổng Hệ Sinh Thái Haevy...'
    };
  }

  // 15. Kho Audio Library
  if (
    normalized.includes('kho audio') ||
    normalized.includes('thu vien nhac') ||
    normalized.includes('audio library') ||
    normalized.includes('tat ca bai hat')
  ) {
    return {
      type: 'navigate',
      mode: 'audio_library',
      label: 'Kho Audio & Thư Viện',
      feedbackText: 'Đang mở Thư Viện Kho Audio...'
    };
  }

  // 16. Hồ Sơ Cá Nhân (Profile)
  if (
    normalized.includes('ho so') ||
    normalized.includes('trang ca nhan') ||
    normalized.includes('profile') ||
    normalized.includes('tai khoan cua toi')
  ) {
    return {
      type: 'navigate',
      mode: 'profile',
      label: 'Hồ Sơ Cá Nhân',
      feedbackText: 'Đang mở Hồ Sơ Cá Nhân...'
    };
  }

  // 17. Actions: Fullscreen, Notifications, Shortcuts, Auth
  if (
    normalized.includes('toan man hinh') ||
    normalized.includes('phong to') ||
    normalized.includes('thu nho')
  ) {
    return {
      type: 'action',
      action: 'fullscreen',
      label: 'Toàn Màn Hình',
      feedbackText: 'Đang chuyển đổi chế độ Toàn màn hình...'
    };
  }

  if (
    normalized.includes('thong bao') ||
    normalized.includes('xem thong bao')
  ) {
    return {
      type: 'action',
      action: 'notifications',
      label: 'Xem Thông Báo',
      feedbackText: 'Đang mở danh sách thông báo hệ thống...'
    };
  }

  if (
    normalized.includes('phim tat') ||
    normalized.includes('ban phim')
  ) {
    return {
      type: 'action',
      action: 'shortcuts',
      label: 'Bảng Phím Tắt',
      feedbackText: 'Đang mở danh mục phím tắt nhanh...'
    };
  }

  if (
    normalized.includes('dang nhap') ||
    normalized.includes('dang ky') ||
    normalized.includes('tai khoan')
  ) {
    return {
      type: 'action',
      action: 'auth',
      label: 'Đăng Nhập / Đăng Ký',
      feedbackText: 'Đang mở cửa sổ đăng nhập...'
    };
  }

  return null;
}

export { playVoiceAudioCue };
