/**
 * Haevy Edu - Daily Goal Tracker Service across 7 Exam Prep Pillars (GDPT 2018 & THPT 2027)
 * Provides state management, local/Firestore persistence, streak tracking, and celebratory audio fanfares.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  EduExamPrepPillarKey, 
  EduPillarDefinition, 
  EduDailyGoalItem, 
  EduDailyGoalsRecord 
} from '../types';

export const EDU_DAILY_GOALS_UPDATED_EVENT = 'haevy_edu_daily_goals_updated';
const LOCAL_STORAGE_PREFIX = 'haevy_edu_daily_goals_';
const STREAK_HISTORY_KEY = 'haevy_edu_completed_days_history';

/**
 * The 7 Flagship Exam Prep Pillars for CTGDPT 2018 & THPT 2027
 */
export const EDU_EXAM_PREP_PILLARS: EduPillarDefinition[] = [
  {
    id: 'pillar_foundation',
    orderNumber: 1,
    title: 'Trụ Cột 1: Nền Tảng GDPT 2018 & Khái Niệm Gốc',
    shortTitle: '1. Nền Tảng Gốc',
    subtitle: 'Bóc tách nguyên lý tự nhiên & tư duy First Principles',
    description: 'Nắm vững bản chất cội nguồn của các tiên đề cơ học Newton, bảo toàn năng lượng, thuyết va chạm & di truyền học, kiên quyết từ chối học vẹt công thức rập khuôn.',
    defaultGoalTitle: 'Bóc tách 1 nguyên lý tự nhiên gốc cùng AI Trợ lý Socratic',
    targetMinutes: 20,
    badge: 'First Principles',
    iconName: 'Atom',
    accentColor: 'emerald',
    gradientBg: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    textColor: 'text-emerald-400',
    tags: ['Bản Chất Logic', 'Tiên Đề Tự Nhiên', 'GDPT 2018'],
    action: {
      tab: 'assistant',
      label: 'Bóc Tách Cùng AI',
      payload: {
        initialQuery: 'Giải thích nguyên lý đầu tiên về 3 định luật Newton và bản chất khối lượng quán tính'
      }
    }
  },
  {
    id: 'pillar_true_false',
    orderNumber: 2,
    title: 'Trụ Cột 2: Chinh Phục Câu Hỏi Đúng/Sai 4 Ý GDPT 2018',
    shortTitle: '2. Đúng/Sai 4 Ý',
    subtitle: 'Làm chủ dạng câu hỏi phân hóa then chốt kỳ thi mới',
    description: 'Rèn luyện kỹ năng phân tích độc lập 4 phát biểu a, b, c, d; nhận diện chính xác bẫy ngôn từ tuyệt đối hóa ("luôn luôn", "chỉ khi", "không đổi").',
    defaultGoalTitle: 'Luyện 1 bộ câu hỏi Đúng/Sai 4 ý phân hóa môn Vật lý/Hóa học/Sinh học',
    targetMinutes: 25,
    badge: 'Đúng/Sai GDPT',
    iconName: 'CheckCircle2',
    accentColor: 'purple',
    gradientBg: 'from-purple-500/20 via-indigo-500/10 to-transparent',
    borderColor: 'border-purple-500/40 hover:border-purple-400',
    textColor: 'text-purple-400',
    tags: ['Đúng/Sai 4 Ý', 'Phân Hóa Điểm 8+', 'Bẫy Câu Từ'],
    action: {
      tab: 'exam',
      label: 'Luyện Đề Đúng/Sai',
      payload: {
        presetId: 'exam_phys_true_false_gdpt2018'
      }
    }
  },
  {
    id: 'pillar_casio_speed',
    orderNumber: 3,
    title: 'Trụ Cột 3: Tốc Độ Bấm Máy Casio fx-880 BTG',
    shortTitle: '3. Casio fx-880',
    subtitle: 'Tối ưu hóa thời gian bấm máy & giải nhanh 30 giây/câu',
    description: 'Thành thạo Bảng giá trị Table f(x), Equation Solver, Hệ phương trình 4 ẩn, Số phức và Thống kê xác suất trên dòng máy Casio fx-880 BTG chuẩn phòng thi.',
    defaultGoalTitle: 'Thực hành quét bảng Table hoặc giải hệ phương trình trên Casio fx-880',
    targetMinutes: 15,
    badge: 'fx-880 Siêu Tốc',
    iconName: 'Calculator',
    accentColor: 'amber',
    gradientBg: 'from-amber-500/20 via-orange-500/10 to-transparent',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    textColor: 'text-amber-400',
    tags: ['Casio fx-880', 'Table f(x)', 'Tốc Độ 30s/câu'],
    action: {
      tab: 'tools',
      label: 'Mở Casio fx-880',
      payload: {
        toolTab: 'casio880'
      }
    }
  },
  {
    id: 'pillar_virtual_labs',
    orderNumber: 4,
    title: 'Trụ Cột 4: Thực Hành Thí Nghiệm Ảo STEM Thực Nghiệm',
    shortTitle: '4. Thí Nghiệm Ảo',
    subtitle: 'Trực quan hóa hiện tượng qua 11+ mô phỏng tương tác',
    description: 'Vận hành con lắc đơn, chuẩn độ pH axit - bazơ, co nguyên sinh tế bào, cân bằng Hardy-Weinberg. Trực tiếp hiệu chỉnh thông số và phân tích đồ thị số liệu.',
    defaultGoalTitle: 'Chạy 1 mô phỏng thí nghiệm ảo (Con lắc đơn / Chuẩn độ pH / Co nguyên sinh)',
    targetMinutes: 20,
    badge: 'STEM Thực Nghiệm',
    iconName: 'FlaskConical',
    accentColor: 'cyan',
    gradientBg: 'from-cyan-500/20 via-teal-500/10 to-transparent',
    borderColor: 'border-cyan-500/40 hover:border-cyan-400',
    textColor: 'text-cyan-400',
    tags: ['Lab Ảo 11+', 'Đồ Thị Thực Nghiệm', 'Trực Quan Hóa'],
    action: {
      tab: 'labs',
      label: 'Vào Phòng Lab',
      payload: {
        subject: 'physics',
        experimentId: 'pendulum'
      }
    }
  },
  {
    id: 'pillar_timed_mock',
    orderNumber: 5,
    title: 'Trụ Cột 5: Thi Thử Bấm Giờ 50 Phút & Áp Lực Phòng Thi',
    shortTitle: '5. Thi Thử Áp Lực',
    subtitle: 'Mô phỏng 100% thời gian thực và chiến thuật phân bổ',
    description: 'Rèn luyện tâm lý phòng thi vững vàng dưới đồng hồ đếm ngược. Phân bổ chiến lược: 15 phút trắc nghiệm chuẩn, 20 phút đúng/sai, 15 phút dồn lực trả lời ngắn.',
    defaultGoalTitle: 'Luyện 1 đề thi tốc độ có bấm giờ áp lực phòng thi 20-50 phút',
    targetMinutes: 35,
    badge: 'Phòng Thi Áp Lực',
    iconName: 'Timer',
    accentColor: 'rose',
    gradientBg: 'from-rose-500/20 via-pink-500/10 to-transparent',
    borderColor: 'border-rose-500/40 hover:border-rose-400',
    textColor: 'text-rose-400',
    tags: ['Đếm Ngược 50 Phút', 'Chiến Thuật Phân Bổ', 'Áp Lực Phòng Thi'],
    action: {
      tab: 'exam',
      label: 'Bấm Giờ Thi Thử',
      payload: {
        presetId: 'exam_phys_speed_01'
      }
    }
  },
  {
    id: 'pillar_notebook_review',
    orderNumber: 6,
    title: 'Trụ Cột 6: Sổ Tay Nghiên Cứu & Vá Lỗ Hổng Kiến Thức',
    shortTitle: '6. Sổ Tay Chống Vẹt',
    subtitle: 'Lập luận bản chất, ghi chép bẫy đề & xuất Google Docs',
    description: 'Ghi chép các câu hỏi "Tại sao?", tổng kết các bẫy đề đã gặp, bóc tách công thức toán học và đồng bộ sơ đồ tư duy nguyên lý gốc sang Google Docs.',
    defaultGoalTitle: 'Ghi chép 1 cạm bẫy hoặc xuất 1 ghi chú tóm tắt vào Sổ tay nghiên cứu',
    targetMinutes: 15,
    badge: 'Anti-Rote Sổ Tay',
    iconName: 'BookOpen',
    accentColor: 'teal',
    gradientBg: 'from-teal-500/20 via-emerald-500/10 to-transparent',
    borderColor: 'border-teal-500/40 hover:border-teal-400',
    textColor: 'text-teal-400',
    tags: ['Sổ Tay Nghiên Cứu', 'Anti-Rote', 'Vá Lỗ Hổng'],
    action: {
      tab: 'notebook',
      label: 'Mở Sổ Tay',
      payload: {}
    }
  },
  {
    id: 'pillar_quick_eval',
    orderNumber: 7,
    title: 'Trụ Cột 7: Đánh Giá Năng Lực Nhanh & Phản Biện Socratic',
    shortTitle: '7. Quiz & Phản Biện',
    subtitle: 'Kiểm tra phản xạ tri thức với trắc nghiệm nhanh & AI',
    description: 'Thực hiện bài kiểm tra trắc nghiệm nhanh 5-10 câu bóc tách bản chất, sẵn sàng đối thoại và trả lời câu hỏi phản biện Socratic của Trợ lý AI.',
    defaultGoalTitle: 'Hoàn thành 1 bài trắc nghiệm nhanh 5 câu kiểm tra phản xạ bản chất',
    targetMinutes: 15,
    badge: 'Socratic Quiz',
    iconName: 'Zap',
    accentColor: 'amber',
    gradientBg: 'from-yellow-500/20 via-amber-500/10 to-transparent',
    borderColor: 'border-yellow-500/40 hover:border-yellow-400',
    textColor: 'text-yellow-400',
    tags: ['Quiz Nhanh', 'Phản Biện Socratic', 'Phản Xạ Tri Thức'],
    action: {
      tab: 'quiz',
      label: 'Làm Quiz Nhanh',
      payload: {}
    }
  }
];

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatFriendlyDate(dateStr: string): string {
  try {
    const today = getTodayDateString();
    if (dateStr === today) return 'Hôm nay';
    
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Generate fresh default daily goals record for a given date
 */
export function createDefaultGoalsRecord(dateStr: string): EduDailyGoalsRecord {
  const items: Record<EduExamPrepPillarKey, EduDailyGoalItem> = {
    pillar_foundation: {
      pillarKey: 'pillar_foundation',
      customGoalTitle: '',
      notes: '',
      isCompleted: false,
      targetMinutes: 20
    },
    pillar_true_false: {
      pillarKey: 'pillar_true_false',
      customGoalTitle: '',
      notes: '',
      isCompleted: false,
      targetMinutes: 25
    },
    pillar_casio_speed: {
      pillarKey: 'pillar_casio_speed',
      customGoalTitle: '',
      notes: '',
      isCompleted: false,
      targetMinutes: 15
    },
    pillar_virtual_labs: {
      pillarKey: 'pillar_virtual_labs',
      customGoalTitle: '',
      notes: '',
      isCompleted: false,
      targetMinutes: 20
    },
    pillar_timed_mock: {
      pillarKey: 'pillar_timed_mock',
      customGoalTitle: '',
      notes: '',
      isCompleted: false,
      targetMinutes: 35
    },
    pillar_notebook_review: {
      pillarKey: 'pillar_notebook_review',
      customGoalTitle: '',
      notes: '',
      isCompleted: false,
      targetMinutes: 15
    },
    pillar_quick_eval: {
      pillarKey: 'pillar_quick_eval',
      customGoalTitle: '',
      notes: '',
      isCompleted: false,
      targetMinutes: 15
    }
  };

  return {
    date: dateStr,
    items,
    allCompleted: false,
    completedCount: 0,
    totalCount: EDU_EXAM_PREP_PILLARS.length,
    completionCelebrated: false,
    streakCount: 0,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Get daily goals for date from localStorage synchronously
 */
export function getDailyGoalsFromLocal(dateStr: string): EduDailyGoalsRecord {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${dateStr}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure all 7 pillars exist even if saved record was partial
      const defaultRecord = createDefaultGoalsRecord(dateStr);
      let completedCount = 0;
      EDU_EXAM_PREP_PILLARS.forEach(p => {
        if (!parsed.items[p.id]) {
          parsed.items[p.id] = defaultRecord.items[p.id];
        } else if (parsed.items[p.id].isCompleted) {
          completedCount++;
        }
      });
      parsed.completedCount = completedCount;
      parsed.totalCount = EDU_EXAM_PREP_PILLARS.length;
      parsed.allCompleted = completedCount >= EDU_EXAM_PREP_PILLARS.length;
      return parsed;
    }
  } catch (e) {
    console.warn('[Edu Daily Goals] Failed to parse local goals:', e);
  }
  return createDefaultGoalsRecord(dateStr);
}

/**
 * Save daily goals to localStorage
 */
export function saveDailyGoalsToLocal(record: EduDailyGoalsRecord): void {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${record.date}`, JSON.stringify(record));
    
    // Update streak history if all completed
    if (record.allCompleted) {
      addCompletedDayToHistory(record.date);
    }

    // Broadcast update event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EDU_DAILY_GOALS_UPDATED_EVENT, { detail: record }));
    }
  } catch (e) {
    console.warn('[Edu Daily Goals] Failed to write local goals:', e);
  }
}

/**
 * History of days where all 7 pillars were completed
 */
export function getCompletedDaysHistory(): string[] {
  try {
    const raw = localStorage.getItem(STREAK_HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function addCompletedDayToHistory(dateStr: string): void {
  try {
    const history = getCompletedDaysHistory();
    if (!history.includes(dateStr)) {
      history.push(dateStr);
      history.sort();
      localStorage.setItem(STREAK_HISTORY_KEY, JSON.stringify(history));
    }
  } catch (e) {
    console.warn('Failed to update streak history:', e);
  }
}

/**
 * Calculate current streak of consecutive completed days ending today or yesterday
 */
export function calculateCurrentDailyGoalStreak(): number {
  const history = getCompletedDaysHistory();
  if (history.length === 0) return 0;

  const todayStr = getTodayDateString();
  const sortedDates = [...new Set(history)].sort();
  
  let streak = 0;
  let checkDate = new Date();
  
  // Check if today was completed
  const hasToday = sortedDates.includes(todayStr);
  if (!hasToday) {
    // Check if yesterday was completed
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = checkDate.toISOString().split('T')[0];
    if (!sortedDates.includes(yesterdayStr)) {
      return 0; // Streak broken
    }
  } else {
    streak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Count backwards
  while (true) {
    const dStr = checkDate.toISOString().split('T')[0];
    if (sortedDates.includes(dStr)) {
      if (dStr !== todayStr) streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Sync with Firestore if authenticated
 */
export async function syncGoalsWithFirestore(record: EduDailyGoalsRecord, userId?: string): Promise<void> {
  saveDailyGoalsToLocal(record);

  if (!userId || !db) return;

  try {
    const goalRef = doc(db, 'users', userId, 'eduDailyGoals', record.date);
    await setDoc(goalRef, {
      ...record,
      userId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('[Edu Daily Goals] Firestore sync notice (saved locally):', err);
  }
}

/**
 * Load goals from Firestore, fallback to local
 */
export async function loadGoalsForDate(dateStr: string, userId?: string): Promise<EduDailyGoalsRecord> {
  const localRecord = getDailyGoalsFromLocal(dateStr);

  if (!userId || !db) return localRecord;

  try {
    const goalRef = doc(db, 'users', userId, 'eduDailyGoals', dateStr);
    const snap = await getDoc(goalRef);
    if (snap.exists()) {
      const data = snap.data() as EduDailyGoalsRecord;
      // Merge with default to be robust
      const defaultRecord = createDefaultGoalsRecord(dateStr);
      const mergedItems = { ...defaultRecord.items, ...(data.items || {}) };
      let completedCount = 0;
      EDU_EXAM_PREP_PILLARS.forEach(p => {
        if (mergedItems[p.id]?.isCompleted) completedCount++;
      });

      const mergedRecord: EduDailyGoalsRecord = {
        ...data,
        items: mergedItems,
        completedCount,
        totalCount: EDU_EXAM_PREP_PILLARS.length,
        allCompleted: completedCount >= EDU_EXAM_PREP_PILLARS.length
      };
      saveDailyGoalsToLocal(mergedRecord);
      return mergedRecord;
    }
  } catch (e) {
    console.warn('[Edu Daily Goals] Firestore fetch fallback to local:', e);
  }

  return localRecord;
}

/**
 * Toggle completion of a specific pillar milestone
 */
export async function toggleGoalCompletion(
  dateStr: string,
  pillarKey: EduExamPrepPillarKey,
  userId?: string
): Promise<{ record: EduDailyGoalsRecord; justCompletedAll: boolean; wasCompleted: boolean }> {
  const record = getDailyGoalsFromLocal(dateStr);
  const currentItem = record.items[pillarKey] || {
    pillarKey,
    isCompleted: false,
    targetMinutes: 20
  };

  const willBeCompleted = !currentItem.isCompleted;
  record.items[pillarKey] = {
    ...currentItem,
    isCompleted: willBeCompleted,
    completedAt: willBeCompleted ? new Date().toISOString() : undefined
  };

  // Recompute counts
  let completedCount = 0;
  EDU_EXAM_PREP_PILLARS.forEach(p => {
    if (record.items[p.id]?.isCompleted) completedCount++;
  });

  const totalCount = EDU_EXAM_PREP_PILLARS.length;
  const wasAllCompletedBefore = record.allCompleted;
  const isAllCompletedNow = completedCount >= totalCount;

  record.completedCount = completedCount;
  record.totalCount = totalCount;
  record.allCompleted = isAllCompletedNow;
  record.updatedAt = new Date().toISOString();

  const justCompletedAll = !wasAllCompletedBefore && isAllCompletedNow;
  if (justCompletedAll) {
    record.completionCelebrated = false; // Flag to celebrate in UI
  }

  await syncGoalsWithFirestore(record, userId);

  return {
    record,
    justCompletedAll,
    wasCompleted: willBeCompleted
  };
}

/**
 * Update custom title, personal study notes, or target minutes
 */
export async function updatePillarGoal(
  dateStr: string,
  pillarKey: EduExamPrepPillarKey,
  updates: {
    customGoalTitle?: string;
    notes?: string;
    targetMinutes?: number;
    actualMinutes?: number;
  },
  userId?: string
): Promise<EduDailyGoalsRecord> {
  const record = getDailyGoalsFromLocal(dateStr);
  const currentItem = record.items[pillarKey] || {
    pillarKey,
    isCompleted: false,
    targetMinutes: 20
  };

  record.items[pillarKey] = {
    ...currentItem,
    ...updates
  };
  record.updatedAt = new Date().toISOString();

  await syncGoalsWithFirestore(record, userId);
  return record;
}

/**
 * Reset goals for date to initial pending state
 */
export async function resetGoalsForDate(dateStr: string, userId?: string): Promise<EduDailyGoalsRecord> {
  const freshRecord = createDefaultGoalsRecord(dateStr);
  await syncGoalsWithFirestore(freshRecord, userId);
  return freshRecord;
}

/**
 * Mark all 7 pillars as completed
 */
export async function markAllGoalsCompleted(dateStr: string, userId?: string): Promise<{ record: EduDailyGoalsRecord; justCompletedAll: boolean }> {
  const record = getDailyGoalsFromLocal(dateStr);
  const wasAllCompletedBefore = record.allCompleted;

  EDU_EXAM_PREP_PILLARS.forEach(p => {
    const existing = record.items[p.id];
    record.items[p.id] = {
      pillarKey: p.id,
      targetMinutes: existing ? existing.targetMinutes : p.targetMinutes,
      isCompleted: true,
      completedAt: (existing && existing.completedAt) ? existing.completedAt : new Date().toISOString()
    };
  });

  record.completedCount = EDU_EXAM_PREP_PILLARS.length;
  record.totalCount = EDU_EXAM_PREP_PILLARS.length;
  record.allCompleted = true;
  record.completionCelebrated = false;
  record.updatedAt = new Date().toISOString();

  await syncGoalsWithFirestore(record, userId);

  return {
    record,
    justCompletedAll: !wasAllCompletedBefore
  };
}

/**
 * A rich celebratory brass/chime chord fanfare using Web Audio API
 */
export function playEduCelebrationFanfare(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonious victory fanfare notes: C5 (523.25), E5 (659.25), G5 (783.99), B5 (987.77), C6 (1046.50)
    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.35, vol: 0.18 },
      { freq: 659.25, time: 0.12, dur: 0.35, vol: 0.20 },
      { freq: 783.99, time: 0.24, dur: 0.40, vol: 0.22 },
      { freq: 987.77, time: 0.38, dur: 0.45, vol: 0.25 },
      { freq: 1046.50, time: 0.52, dur: 1.1, vol: 0.32 },
      // Sub octave support
      { freq: 261.63, time: 0.52, dur: 1.2, vol: 0.20 }
    ];

    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Brass / bell wave shape
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, now + n.time);

      gain.gain.setValueAtTime(0, now + n.time);
      gain.gain.linearRampToValueAtTime(n.vol, now + n.time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  } catch (e) {
    console.warn('[Edu Fanfare] Audio playback ignored:', e);
  }
}
