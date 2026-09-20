import { useState, useEffect, useCallback } from 'react';
import { EduStudentProfile, EduXpEvent, EduBadge, EduActivityCategory } from '../types';

const STORAGE_KEY = 'haevy_edu_student_profile_v2';

export const EDU_LEVELS = [
  { level: 1, title: 'Tập Sự Khám Phá', minXp: 0, icon: '🌱', desc: 'Bắt đầu hành trình học tập từ nguyên lý gốc' },
  { level: 2, title: 'Thực Nghiệm Viên Trẻ', minXp: 200, icon: '🔬', desc: 'Làm chủ các thao tác thí nghiệm ảo và quan sát hiện tượng' },
  { level: 3, title: 'Nhà Phân Tích Logic', minXp: 500, icon: '📐', desc: 'Suy luận bản chất từ định luật bảo toàn và hệ tọa độ' },
  { level: 4, title: 'Chuyên Gia Bản Chất', minXp: 1000, icon: '⚛️', desc: 'Bác bỏ học vẹt, thấu suốt chuỗi diễn dịch First Principles' },
  { level: 5, title: 'Nhà Khoa Học STEM', minXp: 1800, icon: '🧪', desc: 'Nắm vững mối liên kết đa ngành Lý - Hóa - Sinh' },
  { level: 6, title: 'Bậc Thầy Trực Giác', minXp: 3000, icon: '🌌', desc: 'Trực giác vật lý - hóa học nhạy bén, giải quyết bài toán phức tạp' },
  { level: 7, title: 'Viện Sĩ Tinh Hoa', minXp: 5000, icon: '👑', desc: 'Đỉnh cao tư duy khoa học và sáng tạo giải pháp' },
];

export const INITIAL_BADGES: EduBadge[] = [
  {
    id: 'first_lab',
    name: 'Bước Chân Đầu Tiên',
    description: 'Thực hiện thí nghiệm ảo STEM đầu tiên',
    icon: '⚡',
    unlocked: false,
    category: 'lab',
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'streak_3',
    name: 'Ngọn Lửa Tri Thức',
    description: 'Duy trì chuỗi học tập 3 ngày liên tiếp',
    icon: '🔥',
    unlocked: false,
    category: 'streak',
    progress: 0,
    maxProgress: 3
  },
  {
    id: 'streak_7',
    name: 'Chiến Binh Bền Bỉ',
    description: 'Duy trì chuỗi học tập 7 ngày liên tiếp',
    icon: '🏆',
    unlocked: false,
    category: 'streak',
    progress: 0,
    maxProgress: 7
  },
  {
    id: 'lab_explorer',
    name: 'Nhà Thám Hiểm Lab',
    description: 'Vận hành 5 thí nghiệm mô phỏng STEM khác nhau',
    icon: '🔬',
    unlocked: false,
    category: 'lab',
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'lab_master',
    name: 'Bậc Thầy Phòng Thí Nghiệm',
    description: 'Thực hiện tổng cộng 20 lần chạy và hiệu chỉnh thông số Lab',
    icon: '🧪',
    unlocked: false,
    category: 'lab',
    progress: 0,
    maxProgress: 20
  },
  {
    id: 'quiz_first',
    name: 'Thử Thách Trí Tuệ',
    description: 'Hoàn thành bài kiểm tra nhanh First Principles đầu tiên',
    icon: '🎯',
    unlocked: false,
    category: 'quiz',
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'quiz_perfect',
    name: 'Bác Bỏ Học Vẹt',
    description: 'Đạt điểm tuyệt đối 100% trong ít nhất 2 bài Quiz',
    icon: '🧠',
    unlocked: false,
    category: 'quiz',
    progress: 0,
    maxProgress: 2
  },
  {
    id: 'xp_1000',
    name: 'Tư Duy Lượng Tử',
    description: 'Tích lũy đạt mốc 1,000 điểm kinh nghiệm (XP)',
    icon: '⚛️',
    unlocked: false,
    category: 'xp',
    progress: 0,
    maxProgress: 1000
  }
];

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLevelInfo(xp: number) {
  let currentLevel = EDU_LEVELS[0];
  let nextLevel = EDU_LEVELS[1] || EDU_LEVELS[0];

  for (let i = EDU_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= EDU_LEVELS[i].minXp) {
      currentLevel = EDU_LEVELS[i];
      nextLevel = EDU_LEVELS[i + 1] || { ...currentLevel, minXp: currentLevel.minXp + 2500 };
      break;
    }
  }

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    icon: currentLevel.icon,
    desc: currentLevel.desc,
    minXp: currentLevel.minXp,
    nextLevelXp: nextLevel.minXp
  };
}

function playXpChime(type: 'gain' | 'levelup' | 'streak') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'levelup') {
      // Harmonic arpeggio (C5 -> E5 -> G5 -> C6)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      osc.frequency.setValueAtTime(1046.5, now + 0.3);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.start(now);
      osc.stop(now + 0.75);
    } else if (type === 'streak') {
      // Warm twin bell (A4 -> E5)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(659.25, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.55);
    } else {
      // Crisp pleasant ding (G5)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(783.99, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch {
    // AudioContext blocked or not supported - safe ignore
  }
}

export function useEduGamification() {
  const [profile, setProfile] = useState<EduStudentProfile>(() => {
    const todayStr = getLocalDateString();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Reset today's XP if it is a new day
        const isNewDay = parsed.todayDate !== todayStr;
        const levelInfo = getLevelInfo(parsed.totalXp || 0);
        return {
          totalXp: parsed.totalXp || 0,
          level: levelInfo.level,
          levelTitle: levelInfo.title,
          levelBadgeIcon: levelInfo.icon,
          nextLevelXp: levelInfo.nextLevelXp,
          prevLevelXp: levelInfo.minXp,
          streakDays: parsed.streakDays || 1,
          lastActiveDate: parsed.lastActiveDate || todayStr,
          historyDates: parsed.historyDates || [todayStr],
          todayXp: isNewDay ? 0 : (parsed.todayXp || 0),
          todayDate: todayStr,
          dailyGoalXp: parsed.dailyGoalXp || 150,
          activitiesCount: {
            labsCompleted: parsed.activitiesCount?.labsCompleted || 0,
            quizzesCompleted: parsed.activitiesCount?.quizzesCompleted || 0,
            simulationsRun: parsed.activitiesCount?.simulationsRun || 0,
            perfectQuizzes: parsed.activitiesCount?.perfectQuizzes || 0,
            parametersAdjusted: parsed.activitiesCount?.parametersAdjusted || 0,
          },
          recentXpEvents: parsed.recentXpEvents || [],
          badges: parsed.badges && parsed.badges.length > 0 ? parsed.badges : INITIAL_BADGES
        };
      }
    } catch (e) {
      console.warn('Failed to parse edu gamification state:', e);
    }

    // Default starting profile with welcome streak = 1
    const levelInfo = getLevelInfo(60);
    return {
      totalXp: 60,
      level: levelInfo.level,
      levelTitle: levelInfo.title,
      levelBadgeIcon: levelInfo.icon,
      nextLevelXp: levelInfo.nextLevelXp,
      prevLevelXp: levelInfo.minXp,
      streakDays: 1,
      lastActiveDate: todayStr,
      historyDates: [todayStr],
      todayXp: 60,
      todayDate: todayStr,
      dailyGoalXp: 150,
      activitiesCount: {
        labsCompleted: 0,
        quizzesCompleted: 0,
        simulationsRun: 0,
        perfectQuizzes: 0,
        parametersAdjusted: 0,
      },
      recentXpEvents: [
        {
          id: 'welcome_init',
          title: 'Khởi động hành trình Haevy STEM',
          xp: 60,
          category: 'bonus',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          badge: '🌱 Chào mừng'
        }
      ],
      badges: INITIAL_BADGES
    };
  });

  // Recent toast notification state
  const [latestXpToast, setLatestXpToast] = useState<{
    id: string;
    xp: number;
    title: string;
    category: EduActivityCategory;
    isLevelUp?: boolean;
    isStreakIncrease?: boolean;
  } | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save edu gamification state:', e);
    }
  }, [profile]);

  /**
   * Record a student activity in STEM Labs, Quizzes, or Utilities
   */
  const recordActivity = useCallback((params: {
    type: 'lab_run' | 'lab_adjust' | 'lab_export' | 'lab_switch' | 'quiz_answer' | 'quiz_complete' | 'tool_use';
    title: string;
    xpAmount?: number;
    category?: EduActivityCategory;
    isPerfectQuiz?: boolean;
    quizScore?: number;
    quizTotal?: number;
  }) => {
    const todayStr = getLocalDateString();
    
    // Default XP based on activity type
    let xp = params.xpAmount ?? 20;
    if (params.type === 'lab_run') xp = params.xpAmount ?? 25;
    else if (params.type === 'lab_adjust') xp = params.xpAmount ?? 15;
    else if (params.type === 'lab_export') xp = params.xpAmount ?? 35;
    else if (params.type === 'lab_switch') xp = params.xpAmount ?? 10;
    else if (params.type === 'quiz_answer') xp = params.xpAmount ?? 20;
    else if (params.type === 'quiz_complete') {
      if (params.isPerfectQuiz) xp = params.xpAmount ?? 100;
      else if ((params.quizScore || 0) >= (params.quizTotal || 1) * 0.7) xp = params.xpAmount ?? 60;
      else xp = params.xpAmount ?? 30;
    } else if (params.type === 'tool_use') xp = params.xpAmount ?? 20;

    setProfile(prev => {
      // 1. Streak Calculation
      let newStreak = prev.streakDays;
      let isStreakIncrease = false;
      const lastDate = prev.lastActiveDate;

      if (lastDate !== todayStr) {
        // Calculate days difference
        const prevTime = new Date(lastDate).getTime();
        const currTime = new Date(todayStr).getTime();
        const diffDays = Math.round((currTime - prevTime) / (1000 * 3600 * 24));

        if (diffDays === 1) {
          // Practiced yesterday! Streak continues
          newStreak = prev.streakDays + 1;
          isStreakIncrease = true;
          // Streak bonus XP
          xp += 30;
        } else if (diffDays > 1) {
          // Streak broke, restart at 1
          newStreak = 1;
        }
      }

      const updatedHistory = prev.historyDates.includes(todayStr) 
        ? prev.historyDates 
        : [...prev.historyDates, todayStr];

      // 2. XP & Level Up Calculation
      const isNewDay = prev.todayDate !== todayStr;
      const updatedTotalXp = prev.totalXp + xp;
      const updatedTodayXp = (isNewDay ? 0 : prev.todayXp) + xp;
      const oldLevelInfo = getLevelInfo(prev.totalXp);
      const newLevelInfo = getLevelInfo(updatedTotalXp);
      const isLevelUp = newLevelInfo.level > oldLevelInfo.level;

      // 3. Update Activity Counters
      const newCounters = { ...prev.activitiesCount };
      if (params.type === 'lab_run') {
        newCounters.simulationsRun += 1;
        newCounters.labsCompleted += 1;
      } else if (params.type === 'lab_adjust') {
        newCounters.parametersAdjusted += 1;
      } else if (params.type === 'lab_export') {
        newCounters.labsCompleted += 1;
      } else if (params.type === 'quiz_complete') {
        newCounters.quizzesCompleted += 1;
        if (params.isPerfectQuiz) {
          newCounters.perfectQuizzes += 1;
        }
      }

      // 4. Update Badges Progress
      const updatedBadges = prev.badges.map(b => {
        let currentProgress = b.progress;
        if (b.id === 'first_lab' && (params.type === 'lab_run' || params.type === 'lab_adjust')) {
          currentProgress = Math.max(currentProgress, 1);
        } else if (b.id === 'streak_3') {
          currentProgress = newStreak;
        } else if (b.id === 'streak_7') {
          currentProgress = newStreak;
        } else if (b.id === 'lab_explorer') {
          currentProgress = newCounters.labsCompleted;
        } else if (b.id === 'lab_master') {
          currentProgress = newCounters.simulationsRun + newCounters.parametersAdjusted;
        } else if (b.id === 'quiz_first' && (params.type === 'quiz_answer' || params.type === 'quiz_complete')) {
          currentProgress = Math.max(currentProgress, 1);
        } else if (b.id === 'quiz_perfect') {
          currentProgress = newCounters.perfectQuizzes;
        } else if (b.id === 'xp_1000') {
          currentProgress = updatedTotalXp;
        }

        const isNowUnlocked = currentProgress >= b.maxProgress;
        return {
          ...b,
          progress: currentProgress,
          unlocked: isNowUnlocked || b.unlocked,
          unlockedAt: (!b.unlocked && isNowUnlocked) ? new Date().toISOString() : b.unlockedAt
        };
      });

      // 5. XP Event Logging
      const newEvent: EduXpEvent = {
        id: `xp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: params.title,
        xp,
        category: params.category || (params.type.startsWith('lab') ? 'lab' : 'quiz'),
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        badge: isLevelUp ? '🎉 Lên Cấp!' : (isStreakIncrease ? '🔥 Tăng Chuỗi!' : undefined)
      };

      const updatedRecentEvents = [newEvent, ...prev.recentXpEvents].slice(0, 15);

      // Audio feedback
      if (isLevelUp) {
        playXpChime('levelup');
      } else if (isStreakIncrease) {
        playXpChime('streak');
      } else {
        playXpChime('gain');
      }

      // Show floating toast
      setLatestXpToast({
        id: newEvent.id,
        xp,
        title: params.title,
        category: newEvent.category,
        isLevelUp,
        isStreakIncrease
      });

      return {
        totalXp: updatedTotalXp,
        level: newLevelInfo.level,
        levelTitle: newLevelInfo.title,
        levelBadgeIcon: newLevelInfo.icon,
        nextLevelXp: newLevelInfo.nextLevelXp,
        prevLevelXp: newLevelInfo.minXp,
        streakDays: newStreak,
        lastActiveDate: todayStr,
        historyDates: updatedHistory,
        todayXp: updatedTodayXp,
        todayDate: todayStr,
        dailyGoalXp: prev.dailyGoalXp,
        activitiesCount: newCounters,
        recentXpEvents: updatedRecentEvents,
        badges: updatedBadges
      };
    });
  }, []);

  const clearToast = useCallback(() => {
    setLatestXpToast(null);
  }, []);

  return {
    profile,
    recordActivity,
    latestXpToast,
    clearToast
  };
}
