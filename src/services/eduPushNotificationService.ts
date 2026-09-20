/**
 * Haevy Edu - Web Push Notification & Scheduled Milestone Reminder Service
 * Dedicated to THPT 2027 Exam Preparation Roadmap & Daily Study Routine
 */

import { 
  EduThpt2027Milestone, 
  EduPushReminderConfig, 
  EduDailyReminderSlot, 
  EduDispatchedNotification 
} from '../types';

export const THPT_2027_EXAM_DATE = '2027-06-25'; // Target Exam Date: June 25, 2027

export const PRESET_THPT_2027_MILESTONES: EduThpt2027Milestone[] = [
  {
    id: 'm1_foundation',
    stageNumber: 1,
    title: 'Khởi Động Nền Tảng GDPT 2018 & Khái Niệm Gốc',
    subtitle: 'Xây chắc nền móng First Principles Lớp 10 & 11',
    targetDate: '2026-10-15',
    category: 'foundation',
    focusSummary: 'Bóc tách các tiên đề vật lý, bản chất dung dịch điện ly hóa học và quy luật di truyền sinh học. Hiểu cội nguồn logic, kiên quyết không học vẹt.',
    keyActions: [
      'Đọc tài liệu bản chất Động lực học Newton & Bảo toàn cơ năng',
      'Thực hiện thí nghiệm con lắc đơn và chuẩn độ pH trên Lab ảo',
      'Tập thói quen giải thích hiện tượng theo câu hỏi "Tại sao?"'
    ],
    recommendedSubject: 'stem_general',
    suggestedActionType: 'open_assistant',
    actionTargetPayload: {
      initialQuery: 'Giải thích nguyên lý đầu tiên về 3 định luật Newton và bản chất khối lượng quán tính'
    },
    badge: 'Nền Tảng Gốc'
  },
  {
    id: 'm2_gdpt_true_false',
    stageNumber: 2,
    title: 'Chinh Phục Câu Hỏi Đúng/Sai 4 Ý GDPT 2018',
    subtitle: 'Làm chủ dạng câu hỏi dễ mất điểm nhất trong đề thi mới',
    targetDate: '2026-12-15',
    category: 'question_types',
    focusSummary: 'Cấu trúc đề mới có phần Đúng/Sai (Đạt điểm tối đa cần đúng cả 4 ý a, b, c, d). Yêu cầu tư duy đa chiều và kiểm tra kỹ lưỡng từng mệnh đề.',
    keyActions: [
      'Luyện tập bộ 50 câu hỏi Đúng/Sai phân hóa môn Vật lý và Hóa học',
      'Phát hiện bẫy câu chữ: các từ tuyệt đối hóa "luôn luôn", "chỉ khi", "không đổi"',
      'Ghi chép các bẫy thường gặp vào Sổ tay nghiên cứu Edu'
    ],
    recommendedSubject: 'physics',
    suggestedActionType: 'open_exam',
    actionTargetPayload: {
      presetId: 'exam_phys_true_false_gdpt2018'
    },
    badge: 'Đúng / Sai GDPT'
  },
  {
    id: 'm3_hk1_casio',
    stageNumber: 3,
    title: 'Khảo Sát Học Kỳ & Rèn Tốc Độ Casio fx-880 BTG',
    subtitle: 'Tối ưu hóa thời gian bấm máy & giải nhanh 30 giây/câu',
    targetDate: '2027-01-10',
    category: 'casio_speed',
    focusSummary: 'Thành thạo các phím chức năng đột phá trên Casio fx-880 BTG: Bảng giá trị Table, Equation Solver, Thống kê xác suất, Ma trận số phức.',
    keyActions: [
      'Luyện thao tác quét nghiệm trên Bảng giá trị Table f(x) & g(x)',
      'Sử dụng tính năng giải hệ phương trình 4 ẩn và số phức',
      'Luyện đề thi tốc độ bấm giờ 30 phút chuyên đề Casio'
    ],
    recommendedSubject: 'math',
    suggestedActionType: 'open_exam',
    actionTargetPayload: {
      presetId: 'exam_casio_speed_880'
    },
    badge: 'fx-880 Siêu Tốc'
  },
  {
    id: 'm4_stem_labs',
    stageNumber: 4,
    title: 'Tăng Tốc Chuyên Đề & Thí Nghiệm Ảo STEM Thực Nghiệm',
    subtitle: 'Đột phá nhóm câu hỏi thực hành đạt điểm 8+ và 9+',
    targetDate: '2027-03-15',
    category: 'virtual_labs',
    focusSummary: 'Đề thi 2027 tăng cường câu hỏi gắn liền với thực hành thí nghiệm và đồ thị số liệu đo lường. Lab ảo giúp học sinh trực quan hóa hiện tượng.',
    keyActions: [
      'Thực hành mô phỏng chuẩn độ Axit - Bazơ xác định nồng độ dung dịch',
      'Khảo sát phản ứng kết tủa BaCl2 + Na2SO4 và đồ thị pH',
      'Quan sát tế bào thực vật và khung di truyền Men-đen trên Lab Sinh học'
    ],
    recommendedSubject: 'chemistry',
    suggestedActionType: 'open_lab',
    actionTargetPayload: {
      subject: 'chemistry',
      experimentId: 'titration'
    },
    badge: 'STEM Thực Nghiệm'
  },
  {
    id: 'm5_mock_timed',
    stageNumber: 5,
    title: 'Tổng Ôn Ma Trận Đề Bộ GD&ĐT & Thi Thử Áp Lực',
    subtitle: 'Mô phỏng 100% thời gian thực phòng thi 50 phút',
    targetDate: '2027-04-20',
    category: 'mock_exam',
    focusSummary: 'Làm quen với áp lực đồng hồ đếm ngược. Rèn chiến thuật: Làm chắc 18 câu trắc nghiệm nhiều lựa chọn, quét nhanh 4 câu Đúng/Sai, dồn lực giải 6 câu trả lời ngắn.',
    keyActions: [
      'Làm bài thi thử 50 phút không mở tài liệu mỗi tuần',
      'Phân bổ thời gian: 15 phút đầu cho trắc nghiệm chuẩn, 20 phút cho đúng sai, 15 phút cho trả lời ngắn',
      'Xem lại báo cáo điểm chi tiết để phát hiện điểm mù'
    ],
    recommendedSubject: 'physics',
    suggestedActionType: 'open_exam',
    actionTargetPayload: {
      presetId: 'exam_phys_speed_01'
    },
    badge: 'Phòng Thi Áp Lực'
  },
  {
    id: 'm6_sprint_30days',
    stageNumber: 6,
    title: 'Chiến Dịch 30 Ngày Nước Rút Về Đích THPT 2027',
    subtitle: 'Vá toàn bộ lỗ hổng, rèn tư duy Socratic & giữ vững phong độ',
    targetDate: '2027-05-25',
    category: 'final_sprint',
    focusSummary: 'Giai đoạn nước rút quyết định. Ôn lại các cạm bẫy học vẹt đã ghi nhận trong Sổ tay nghiên cứu, không nhồi nhét lý thuyết mới.',
    keyActions: [
      'Duyệt lại toàn bộ Sổ tay nghiên cứu First Principles',
      'Thực hiện mỗi ngày 1 bài test nhanh 15 câu với Trợ lý AI Socratic',
      'Giữ nhịp sinh hoạt chuẩn giờ thi (tỉnh táo vào các khung giờ 07h30 và 14h00)'
    ],
    recommendedSubject: 'stem_general',
    suggestedActionType: 'open_notebook',
    badge: '30 Ngày Nước Rút'
  },
  {
    id: 'm7_official_exam',
    stageNumber: 7,
    title: 'KỲ THI TỐT NGHIỆP THPT 2027 CHÍNH THỨC',
    subtitle: 'Tự tin bước vào phòng thi - Chiến thắng bằng tư duy bản chất!',
    targetDate: '2027-06-25',
    category: 'official_exam',
    focusSummary: 'Cột mốc vinh quang của khóa học sinh GDPT 2018. Bình tĩnh, đọc kỹ đề bài, kiểm tra cẩn thận từng bước lập luận.',
    keyActions: [
      'Chuẩn bị sẵn sàng máy tính Casio fx-880 BTG đã sạc pin đầy đủ',
      'Đọc lướt toàn bộ đề thi trong 2 phút đầu tiên',
      'Bình tĩnh và tự tin vào hành trình rèn luyện nguyên lý gốc!'
    ],
    recommendedSubject: 'stem_general',
    suggestedActionType: 'open_exam',
    badge: 'Chính Thức 2027'
  }
];

export const DEFAULT_DAILY_SLOTS: EduDailyReminderSlot[] = [
  {
    id: 'slot_morning',
    label: 'Buổi Sáng: Khởi Động Tư Duy',
    time: '07:30',
    enabled: true,
    topic: 'Khởi động não bộ với 1 câu hỏi bóc tách bản chất First Principles cùng Haevy AI.',
    actionType: 'open_assistant'
  },
  {
    id: 'slot_afternoon',
    label: 'Buổi Chiều: Thí Nghiệm Lab STEM',
    time: '14:30',
    enabled: true,
    topic: 'Kiểm chứng hiện tượng thực nghiệm trên Phòng Lab ảo 3D (Vật lý / Hóa học / Sinh học).',
    actionType: 'open_lab'
  },
  {
    id: 'slot_evening',
    label: 'Buổi Tối: Giờ Vàng Luyện Đề Casio',
    time: '20:00',
    enabled: true,
    topic: 'Thực hành đề thi thử bấm giờ với máy tính Casio fx-880 BTG chuẩn ma trận GDPT.',
    actionType: 'open_exam'
  },
  {
    id: 'slot_night',
    label: 'Đêm: Đúc Kết Sổ Tay Nghiên Cứu',
    time: '22:15',
    enabled: true,
    topic: 'Ghi chép đúc kết 3 nguyên lý gốc và điểm cạm bẫy học vẹt đã học trong ngày vào Sổ tay.',
    actionType: 'open_notebook'
  }
];

const CONFIG_STORAGE_KEY = 'haevy_edu_push_config_v1';
const HISTORY_STORAGE_KEY = 'haevy_edu_push_history_v1';

export const EDU_NOTIFICATION_CLICK_EVENT = 'haevy_edu_notification_click_event';

// Procedural Melodic Chime with Web Audio API
export function playEduReminderChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    
    // Note 1: D5 (587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.2, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Note 2: A5 (880.00 Hz) - pleasant fifth interval
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, now + 0.15);
    gain2.gain.setValueAtTime(0, now + 0.15);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.19);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.8);
  } catch (e) {
    console.warn('[Edu Chime] Web Audio playback ignored:', e);
  }
}

/**
 * Check if Web Notifications API is supported
 */
export function isWebNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isWebNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestEduNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isWebNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('[Edu Push] Permission request error:', err);
    return Notification.permission;
  }
}

/**
 * Get saved push reminder configuration
 */
export function getEduPushConfig(): EduPushReminderConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        pushEnabled: parsed.pushEnabled ?? true,
        soundEnabled: parsed.soundEnabled ?? true,
        frequency: parsed.frequency ?? 'daily',
        milestoneRemindersEnabled: parsed.milestoneRemindersEnabled ?? true,
        dailySlots: Array.isArray(parsed.dailySlots) && parsed.dailySlots.length > 0 
          ? parsed.dailySlots 
          : DEFAULT_DAILY_SLOTS,
        lastTriggeredDate: parsed.lastTriggeredDate,
        lastTriggeredSlots: parsed.lastTriggeredSlots || {}
      };
    }
  } catch (e) {
    console.warn('Failed reading edu push config', e);
  }

  return {
    pushEnabled: true,
    soundEnabled: true,
    frequency: 'daily',
    milestoneRemindersEnabled: true,
    dailySlots: DEFAULT_DAILY_SLOTS,
    lastTriggeredSlots: {}
  };
}

/**
 * Save push reminder configuration
 */
export function saveEduPushConfig(config: EduPushReminderConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed saving edu push config', e);
  }
}

/**
 * Get notification history from local storage
 */
export function getEduNotificationHistory(): EduDispatchedNotification[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Add a dispatched notification to history
 */
export function addEduNotificationToHistory(notification: EduDispatchedNotification): void {
  try {
    const history = getEduNotificationHistory();
    const updated = [notification, ...history].slice(0, 40); // keep last 40
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed saving notification to history', e);
  }
}

/**
 * Mark a notification as read
 */
export function markEduNotificationAsRead(id: string): void {
  try {
    const history = getEduNotificationHistory();
    const updated = history.map(item => item.id === id ? { ...item, isRead: true } : item);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed marking notification read', e);
  }
}

/**
 * Clear all notification history
 */
export function clearEduNotificationHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed clearing notification history', e);
  }
}

/**
 * Calculate countdown statistics to THPT 2027 Exam Date
 */
export function calculateThpt2027Countdown() {
  const targetTime = new Date(`${THPT_2027_EXAM_DATE}T07:30:00+07:00`).getTime();
  const now = Date.now();
  const diff = targetTime - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPassed: true,
      totalDays: 0,
      nextMilestone: null
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // Find next upcoming milestone
  const todayStr = new Date().toISOString().slice(0, 10);
  const nextMilestone = PRESET_THPT_2027_MILESTONES.find(m => m.targetDate >= todayStr) 
    || PRESET_THPT_2027_MILESTONES[PRESET_THPT_2027_MILESTONES.length - 1];

  let daysToNextMilestone = 0;
  if (nextMilestone) {
    const msDiff = new Date(`${nextMilestone.targetDate}T00:00:00`).getTime() - now;
    daysToNextMilestone = Math.max(0, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    isPassed: false,
    totalDays: days,
    nextMilestone,
    daysToNextMilestone
  };
}

/**
 * Send an actual Web Push Notification to the browser desktop/mobile UI
 */
export function dispatchWebPushNotification(
  title: string, 
  body: string, 
  actionType: 'open_assistant' | 'open_exam' | 'open_lab' | 'open_notebook' = 'open_assistant',
  actionPayload: any = {}
): EduDispatchedNotification {
  const notificationItem: EduDispatchedNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title,
    body,
    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    category: 'daily_slot',
    actionType,
    actionPayload,
    isRead: false
  };

  // Play audio chime if sound enabled
  const config = getEduPushConfig();
  if (config.soundEnabled) {
    playEduReminderChime();
  }

  // Save to history
  addEduNotificationToHistory(notificationItem);

  // Dispatch Native Browser Notification if permitted
  if (isWebNotificationSupported() && Notification.permission === 'granted') {
    try {
      const nativeNotif = new Notification(title, {
        body,
        icon: '/icon.png',
        badge: '/icon.png',
        tag: `haevy_edu_${actionType}`,
        requireInteraction: false
      });

      nativeNotif.onclick = () => {
        window.focus();
        nativeNotif.close();
        // Dispatch custom browser event for HaevyEduView to navigate
        window.dispatchEvent(new CustomEvent(EDU_NOTIFICATION_CLICK_EVENT, {
          detail: { actionType, actionPayload }
        }));
      };
    } catch (e) {
      console.warn('[Edu Push] Native Notification call error:', e);
    }
  }

  return notificationItem;
}

/**
 * Trigger a sample test push notification immediately
 */
export function sendTestPushNotification(): EduDispatchedNotification {
  const countdown = calculateThpt2027Countdown();
  const title = `🔔 Haevy Edu: Kiểm tra Thông Báo Đẩy THPT 2027`;
  const body = `Hệ thống nhắc nhở định kỳ hoạt động hoàn hảo! Còn ${countdown.days} ngày nữa đến Kỳ thi THPT 2027. Hãy giữ vững mục tiêu chinh phục 9+!`;
  
  const notif = dispatchWebPushNotification(title, body, 'open_assistant', {
    initialQuery: 'Lập kế hoạch tự học 15 phút hôm nay dựa trên nguyên lý First Principles'
  });
  notif.category = 'test';
  return notif;
}

/**
 * Check and evaluate whether daily scheduled slots should fire right now
 */
export function evaluateScheduledReminders(
  onTriggered?: (notif: EduDispatchedNotification) => void
): EduDispatchedNotification | null {
  const config = getEduPushConfig();
  if (!config.pushEnabled) return null;

  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
  const todayDateStr = now.toISOString().slice(0, 10);
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  // Frequency check
  if (config.frequency === 'weekdays' && (currentDayOfWeek === 0 || currentDayOfWeek === 6)) {
    return null;
  }
  if (config.frequency === 'weekends' && currentDayOfWeek >= 1 && currentDayOfWeek <= 5) {
    return null;
  }

  const lastTriggered = config.lastTriggeredSlots || {};

  // Check matching daily slot
  for (const slot of config.dailySlots) {
    if (!slot.enabled) continue;

    // Check if time matches (within the current minute)
    if (slot.time === currentTimeStr) {
      // Check if already fired today for this specific slot
      if (lastTriggered[slot.id] === todayDateStr) {
        continue;
      }

      // Fire notification
      const countdown = calculateThpt2027Countdown();
      const title = `⏰ Haevy Edu [${slot.label}]: Nhắc nhở ôn thi THPT 2027`;
      const body = `${slot.topic} (Còn ${countdown.days} ngày đến kỳ thi chính thức)`;

      const dispatched = dispatchWebPushNotification(title, body, slot.actionType);

      // Record last triggered
      lastTriggered[slot.id] = todayDateStr;
      config.lastTriggeredSlots = lastTriggered;
      config.lastTriggeredDate = todayDateStr;
      saveEduPushConfig(config);

      if (onTriggered) onTriggered(dispatched);
      return dispatched;
    }
  }

  // Milestone proximity reminder check (e.g. once per day at 08:00 if milestone is in 30, 15, 7, 3, or 1 days)
  if (config.milestoneRemindersEnabled && currentTimeStr === '08:00') {
    const milestoneTriggerKey = `milestone_check_${todayDateStr}`;
    if (lastTriggered[milestoneTriggerKey] !== todayDateStr) {
      const countdown = calculateThpt2027Countdown();
      const nextM = countdown.nextMilestone;
      if (nextM && [30, 15, 7, 3, 1, 0].includes(countdown.daysToNextMilestone)) {
        const title = `🎯 Cột mốc THPT 2027: ${nextM.title}`;
        const body = countdown.daysToNextMilestone === 0 
          ? `Hôm nay là hạn cột mốc: ${nextM.subtitle}! Hãy hoàn thành bài ôn tập trọng tâm.`
          : `Còn đúng ${countdown.daysToNextMilestone} ngày đến cột mốc "${nextM.subtitle}". Đã sẵn sàng chưa?`;

        const dispatched = dispatchWebPushNotification(title, body, nextM.suggestedActionType, nextM.actionTargetPayload);
        dispatched.category = 'milestone';
        dispatched.milestoneId = nextM.id;

        lastTriggered[milestoneTriggerKey] = todayDateStr;
        config.lastTriggeredSlots = lastTriggered;
        saveEduPushConfig(config);

        if (onTriggered) onTriggered(dispatched);
        return dispatched;
      }
    }
  }

  return null;
}
