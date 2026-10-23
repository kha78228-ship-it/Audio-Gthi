import { ShortcutItemConfig, ShortcutsConfig } from '../types';

export const DEFAULT_SHORTCUTS_CONFIG: ShortcutsConfig = {
  mode_space: {
    id: 'mode_space',
    action: 'mode_space',
    label: 'Haevy Space',
    desc: '🌌 Chuyển sang Haevy Space (3D AR Vũ Trụ)',
    category: 'navigation',
    code: 'Digit1',
    keyChar: '1',
    allowAltOrCtrl: true,
    enabled: true
  },
  mode_finance: {
    id: 'mode_finance',
    action: 'mode_finance',
    label: 'Haevy Finance',
    desc: '💰 Chuyển sang Haevy Finance (Tài Chính & Hũ Tiền)',
    category: 'navigation',
    code: 'Digit2',
    keyChar: '2',
    allowAltOrCtrl: true,
    enabled: true
  },
  mode_haevy_ai: {
    id: 'mode_haevy_ai',
    action: 'mode_haevy_ai',
    label: 'Haevy AI Master',
    desc: '🧠 Chuyển sang Haevy AI Master (Trợ Lý Toàn Năng)',
    category: 'navigation',
    code: 'Digit3',
    keyChar: '3',
    allowAltOrCtrl: true,
    enabled: true
  },
  mode_morning: {
    id: 'mode_morning',
    action: 'mode_morning',
    label: 'Haevy Morning',
    desc: '☀️ Chuyển sang Haevy Morning (Năng Lượng Buổi Sáng)',
    category: 'navigation',
    code: 'Digit4',
    keyChar: '4',
    allowAltOrCtrl: true,
    enabled: true
  },
  mode_spiritual: {
    id: 'mode_spiritual',
    action: 'mode_spiritual',
    label: 'Haevy Spiritual',
    desc: '🔮 Chuyển sang Haevy Spiritual (Tarot, Tử Vi & Chiêm Tinh)',
    category: 'navigation',
    code: 'Digit5',
    keyChar: '5',
    allowAltOrCtrl: true,
    enabled: true
  },
  mode_couple: {
    id: 'mode_couple',
    action: 'mode_couple',
    label: 'I Love Haevy',
    desc: '💖 Chuyển sang I Love Haevy (Không Gian Cặp Đôi)',
    category: 'navigation',
    code: 'Digit6',
    keyChar: '6',
    allowAltOrCtrl: true,
    enabled: true
  },
  mode_studio: {
    id: 'mode_studio',
    action: 'mode_studio',
    label: 'Haevy Studio',
    desc: '🎙️ Chuyển sang Haevy Studio (Phòng Thu & Voice AI)',
    category: 'navigation',
    code: 'Digit7',
    keyChar: '7',
    allowAltOrCtrl: true,
    enabled: true
  },
  mode_games: {
    id: 'mode_games',
    action: 'mode_games',
    label: 'Haevy Games',
    desc: '🎮 Chuyển sang Haevy Games (Đấu Trường Âm Nhạc)',
    category: 'navigation',
    code: 'Digit8',
    keyChar: '8',
    allowAltOrCtrl: true,
    enabled: true
  },
  mode_vip: {
    id: 'mode_vip',
    action: 'mode_vip',
    label: 'Haevy VIP Club',
    desc: '👑 Chuyển sang Haevy VIP Club',
    category: 'navigation',
    code: 'Digit9',
    keyChar: '9',
    allowAltOrCtrl: true,
    enabled: true
  },
  mode_portal: {
    id: 'mode_portal',
    action: 'mode_portal',
    label: 'Haevy Portal',
    desc: '🪐 Về Cổng Sinh Thái Trung Tâm (Portal)',
    category: 'navigation',
    code: 'Digit0',
    keyChar: '0',
    allowAltOrCtrl: true,
    enabled: true
  },
  mode_next: {
    id: 'mode_next',
    action: 'mode_next',
    label: 'Chuyển Phân Hệ Kế Tiếp',
    desc: '➡️ Chuyển sang phân hệ kế tiếp trong hệ sinh thái (Alt + ►)',
    category: 'navigation',
    code: 'ArrowRight',
    keyChar: '→',
    allowAltOrCtrl: true,
    altKey: true,
    enabled: true
  },
  mode_prev: {
    id: 'mode_prev',
    action: 'mode_prev',
    label: 'Chuyển Phân Hệ Trước Đó',
    desc: '⬅️ Chuyển về phân hệ trước đó trong hệ sinh thái (Alt + ◄)',
    category: 'navigation',
    code: 'ArrowLeft',
    keyChar: '←',
    allowAltOrCtrl: true,
    altKey: true,
    enabled: true
  },
  open_mode_switcher: {
    id: 'open_mode_switcher',
    action: 'open_mode_switcher',
    label: 'Bảng Chuyển Đổi Chế Độ',
    desc: '📱 Mở Bảng Khám Phá Tất Cả Chế Độ (Mode Switcher)',
    category: 'navigation',
    code: 'KeyK',
    keyChar: 'K',
    ctrlKey: true,
    enabled: true
  },
  finance_jars: {
    id: 'finance_jars',
    action: 'finance_jars',
    label: '6 Hũ Tiền & Ngân Sách',
    desc: '🏺 Mở Trực Tiếp "6 Hũ Tiền & Ngân Sách 50/30/20"',
    category: 'finance',
    code: 'KeyG',
    keyChar: 'G',
    ctrlKey: true,
    allowAltOrCtrl: true,
    enabled: true
  },
  finance_add: {
    id: 'finance_add',
    action: 'finance_add',
    label: 'Thêm Khoản Thu Chi Mới',
    desc: '➕ Mở Màn Hình Thêm Khoản Chi Tiêu / Thu Nhập Mới',
    category: 'finance',
    code: 'KeyN',
    keyChar: 'N',
    altKey: true,
    enabled: true
  },
  finance_wallets: {
    id: 'finance_wallets',
    action: 'finance_wallets',
    label: 'Danh Sách Ví & Ngân Hàng',
    desc: '💳 Quản Lý Danh Sách Ví Tiền & Tài Khoản Ngân Hàng',
    category: 'finance',
    code: 'KeyW',
    keyChar: 'W',
    altKey: true,
    enabled: true
  },
  finance_savings: {
    id: 'finance_savings',
    action: 'finance_savings',
    label: 'Mục Tiêu Tiết Kiệm',
    desc: '🐷 Mục Tiêu Tiết Kiệm & Tích Lũy Dài Hạn',
    category: 'finance',
    code: 'KeyS',
    keyChar: 'S',
    altKey: true,
    enabled: true
  },
  finance_debts: {
    id: 'finance_debts',
    action: 'finance_debts',
    label: 'Sổ Quản Lý Nợ',
    desc: '👥 Sổ Quản Lý Vay Nợ, Cho Vay & Trả Góp',
    category: 'finance',
    code: 'KeyD',
    keyChar: 'D',
    altKey: true,
    enabled: true
  },
  finance_calculators: {
    id: 'finance_calculators',
    action: 'finance_calculators',
    label: 'Máy Tính Lãi Kép',
    desc: '🧮 Máy Tính Lãi Kép & Hoạch Định Tài Chính',
    category: 'finance',
    code: 'KeyC',
    keyChar: 'C',
    altKey: true,
    enabled: true
  },
  finance_family: {
    id: 'finance_family',
    action: 'finance_family',
    label: 'Quỹ Chung Gia Đình',
    desc: '👨‍👩‍👧 Quỹ Chung Gia Đình & Người Yêu',
    category: 'finance',
    code: 'KeyF',
    keyChar: 'F',
    altKey: true,
    enabled: true
  },
  media_play_pause: {
    id: 'media_play_pause',
    action: 'media_play_pause',
    label: 'Phát / Tạm Dừng',
    desc: '⏯️ Phát / Tạm dừng bài hát hiện tại',
    category: 'media',
    code: 'Space',
    keyChar: 'Space',
    enabled: true
  },
  media_mute: {
    id: 'media_mute',
    action: 'media_mute',
    label: 'Tắt / Bật Âm Thanh',
    desc: '🔇 Bật / Tắt âm thanh (Mute / Unmute)',
    category: 'media',
    code: 'KeyM',
    keyChar: 'M',
    enabled: true
  },
  media_fullscreen: {
    id: 'media_fullscreen',
    action: 'media_fullscreen',
    label: 'Toàn Màn Hình',
    desc: '⛶ Bật / Tắt chế độ Toàn màn hình (Fullscreen)',
    category: 'media',
    code: 'KeyF',
    keyChar: 'F',
    enabled: true
  },
  media_next: {
    id: 'media_next',
    action: 'media_next',
    label: 'Bài Tiếp Theo',
    desc: '⏭️ Chuyển sang bài hát tiếp theo',
    category: 'media',
    code: 'ArrowRight',
    keyChar: '→',
    allowAltOrCtrl: true,
    enabled: true
  },
  media_prev: {
    id: 'media_prev',
    action: 'media_prev',
    label: 'Bài Trước Đó',
    desc: '⏮️ Quay lại bài hát trước đó',
    category: 'media',
    code: 'ArrowLeft',
    keyChar: '←',
    allowAltOrCtrl: true,
    enabled: true
  },
  media_volume_up: {
    id: 'media_volume_up',
    action: 'media_volume_up',
    label: 'Tăng Âm Lượng',
    desc: '🔊 Tăng âm lượng (+10%)',
    category: 'media',
    code: 'ArrowUp',
    keyChar: '↑',
    shiftKey: true,
    enabled: true
  },
  media_volume_down: {
    id: 'media_volume_down',
    action: 'media_volume_down',
    label: 'Giảm Âm Lượng',
    desc: '🔉 Giảm âm lượng (-10%)',
    category: 'media',
    code: 'ArrowDown',
    keyChar: '↓',
    shiftKey: true,
    enabled: true
  },
  toggle_mode_switcher: {
    id: 'toggle_mode_switcher',
    action: 'toggle_mode_switcher',
    label: 'Đồng Bộ Chuyển Phân Hệ',
    desc: '🌐 Mở Bảng Đồng Bộ Chuyển Chế Độ Toàn Hệ Sinh Thái (Alt + M)',
    category: 'navigation',
    code: 'KeyM',
    keyChar: 'M',
    allowAltOrCtrl: true,
    enabled: true
  },
  toggle_shortcuts: {
    id: 'toggle_shortcuts',
    action: 'toggle_shortcuts',
    label: 'Bảng Phím Tắt',
    desc: '⌨️ Mở / Đóng Bảng Tra Cứu & Tùy Chỉnh Phím Tắt',
    category: 'system',
    code: 'Slash',
    keyChar: '?',
    enabled: true
  },
  close_modal: {
    id: 'close_modal',
    action: 'close_modal',
    label: 'Đóng Modal',
    desc: '❌ Đóng cửa sổ pop-up / modal đang mở',
    category: 'system',
    code: 'Escape',
    keyChar: 'Esc',
    enabled: true
  }
};

/**
 * Check if a keyboard event matches a configured shortcut item
 */
export function matchShortcut(e: KeyboardEvent, item: ShortcutItemConfig): boolean {
  if (!item || !item.enabled) return false;

  const isCtrlOrMeta = e.ctrlKey || e.metaKey;
  const isAlt = e.altKey;
  const isShift = e.shiftKey;

  // Special match for Slash / ?
  if (item.code === 'Slash' || item.keyChar === '?') {
    if (e.key === '?' || (e.shiftKey && e.code === 'Slash') || (isCtrlOrMeta && e.code === 'Slash')) {
      return true;
    }
  }

  // Check code matching
  if (e.code !== item.code) {
    return false;
  }

  // Modifier checks
  if (item.allowAltOrCtrl) {
    if (!isCtrlOrMeta && !isAlt) return false;
  } else {
    if (Boolean(item.ctrlKey) !== isCtrlOrMeta) return false;
    if (Boolean(item.altKey) !== isAlt) return false;
  }

  if (item.shiftKey) {
    if (!isShift) return false;
  } else if (isShift && item.code !== 'Slash') {
    // If Shift is pressed but shortcut does not want Shift
    return false;
  }

  return true;
}

/**
 * Format shortcut key tags for displaying in UI
 */
export function getShortcutDisplayKeys(item: ShortcutItemConfig): string[] {
  const keys: string[] = [];

  if (item.allowAltOrCtrl) {
    keys.push('Ctrl / Alt');
  } else {
    if (item.ctrlKey) keys.push('Ctrl');
    if (item.altKey) keys.push('Alt');
  }

  if (item.shiftKey) {
    keys.push('Shift');
  }

  let char = item.keyChar;
  if (!char) {
    if (item.code.startsWith('Key')) {
      char = item.code.replace('Key', '');
    } else if (item.code.startsWith('Digit')) {
      char = item.code.replace('Digit', '');
    } else if (item.code === 'ArrowRight') {
      char = '→';
    } else if (item.code === 'ArrowLeft') {
      char = '←';
    } else if (item.code === 'ArrowUp') {
      char = '↑';
    } else if (item.code === 'ArrowDown') {
      char = '↓';
    } else if (item.code === 'Space') {
      char = 'Space';
    } else if (item.code === 'Escape') {
      char = 'Esc';
    } else {
      char = item.code;
    }
  }

  keys.push(char);
  return keys;
}
