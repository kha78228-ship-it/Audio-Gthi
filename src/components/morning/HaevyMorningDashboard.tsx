import React, { useState, useEffect, useMemo } from 'react';
import { motion, type Variants } from 'motion/react';
import { 
  Sun, 
  Sparkles, 
  GraduationCap, 
  Wallet, 
  CheckCircle2, 
  Circle, 
  Flame, 
  TrendingUp, 
  AlertCircle, 
  ArrowRight, 
  Calendar, 
  Clock, 
  Target, 
  BookOpen, 
  FlaskConical, 
  Zap, 
  Calculator, 
  Timer, 
  ChevronRight, 
  DollarSign, 
  CreditCard, 
  PiggyBank, 
  ShieldCheck, 
  Layers, 
  RefreshCw,
  Plus,
  Compass,
  Heart
} from 'lucide-react';
import { useEduGamification } from '../../hooks/useEduGamification';
import { calculateThpt2027Countdown } from '../../services/eduPushNotificationService';
import { 
  FinanceBudget, 
  FinanceTransaction, 
  FinanceWallet 
} from '../../types';
import { 
  DEFAULT_FINANCE_BUDGET, 
  DEFAULT_FINANCE_WALLETS, 
  DEFAULT_FINANCE_TRANSACTIONS,
  DEFAULT_FINANCE_CATEGORIES
} from '../../data';
import { HaevyMorningWeatherWidget } from './HaevyMorningWeatherWidget';
import { HaevyMorningThemeSelector } from './HaevyMorningThemeSelector';
import { useHaevyMood } from '../../context/HaevyMoodContext';

interface HaevyMorningDashboardProps {
  onBackToPortal?: () => void;
  onNavigateToMode?: (mode: string, subTab?: string) => void;
  onSelectSubView?: (subView: 'portal' | 'canvas' | 'mascot' | 'magic_ar' | 'morning_dashboard') => void;
}

interface EduDailyTaskItem {
  id: string;
  title: string;
  subject: string;
  xpReward: number;
  completed: boolean;
  timeEstimate: string;
  tabTarget: 'labs' | 'quiz' | 'tools' | 'exam' | 'assistant' | 'roadmap';
  icon: any;
  color: string;
}

export function HaevyMorningDashboard({
  onBackToPortal,
  onNavigateToMode,
  onSelectSubView
}: HaevyMorningDashboardProps) {
  // 0. MOOD & DYNAMIC COLOR THEME
  const { morningThemeConfig } = useHaevyMood();

  // 1. EDU STATE & GAMIFICATION
  const { profile, recordActivity } = useEduGamification();
  const thptCountdown = useMemo(() => calculateThpt2027Countdown(), []);

  // Today's Date Formatting (Vietnamese)
  const todayFormatted = useMemo(() => {
    const now = new Date();
    const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = daysOfWeek[now.getDay()];
    const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${dayName}, ${dateStr}`;
  }, []);

  const currentMonthKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  // 2. FINANCE STATE (Loaded from localStorage or standard defaults)
  const [budget, setBudget] = useState<FinanceBudget>(() => {
    try {
      const saved = localStorage.getItem('haevy_finance_budget_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_FINANCE_BUDGET;
  });

  const [wallets, setWallets] = useState<FinanceWallet[]>(() => {
    try {
      const saved = localStorage.getItem('haevy_finance_wallets_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_FINANCE_WALLETS;
  });

  const [transactions, setTransactions] = useState<FinanceTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('haevy_finance_transactions_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_FINANCE_TRANSACTIONS;
  });

  // Reload finance state if updated elsewhere
  const refreshFinanceData = () => {
    try {
      const b = localStorage.getItem('haevy_finance_budget_v2');
      if (b) setBudget(JSON.parse(b));
      const w = localStorage.getItem('haevy_finance_wallets_v2');
      if (w) setWallets(JSON.parse(w));
      const t = localStorage.getItem('haevy_finance_transactions_v2');
      if (t) setTransactions(JSON.parse(t));
    } catch (e) {
      console.warn('Could not reload finance data', e);
    }
  };

  // 3. DAILY EDU TASKS CHECKLIST (Persistent in localStorage per date)
  const todayDateStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`haevy_morning_tasks_${todayDateStr}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const toggleTask = (taskId: string, xpReward: number) => {
    setCompletedTaskIds((prev) => {
      const isAlreadyCompleted = prev.includes(taskId);
      const next = isAlreadyCompleted ? prev.filter((id) => id !== taskId) : [...prev, taskId];
      try {
        localStorage.setItem(`haevy_morning_tasks_${todayDateStr}`, JSON.stringify(next));
      } catch {
        // safe ignore
      }
      if (!isAlreadyCompleted) {
        recordActivity({
          type: 'tool_use',
          title: `Nhiệm vụ sáng: ${taskId}`,
          xpAmount: xpReward,
          category: 'tool'
        });
      }
      return next;
    });
  };

  const dailyTasksList: EduDailyTaskItem[] = useMemo(() => [
    {
      id: 'task_stem_lab',
      title: 'Khám phá 1 thí nghiệm STEM ảo',
      subject: 'Vật Lý / Hóa Học / Sinh Học',
      xpReward: 35,
      completed: completedTaskIds.includes('task_stem_lab'),
      timeEstimate: '10 phút',
      tabTarget: 'labs',
      icon: FlaskConical,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'task_quiz_first_principles',
      title: 'Hoàn thành 1 bài trắc nghiệm First Principles',
      subject: 'Tư duy bản chất & Bác bỏ học vẹt',
      xpReward: 30,
      completed: completedTaskIds.includes('task_quiz_first_principles'),
      timeEstimate: '8 phút',
      tabTarget: 'quiz',
      icon: Zap,
      color: 'from-amber-500 to-orange-600'
    },
    {
      id: 'task_casio_practice',
      title: 'Ôn luyện phím tắt & giải nhanh Casio fx-880 BTG',
      subject: 'Công cụ toán học & Khoa học tự nhiên',
      xpReward: 25,
      completed: completedTaskIds.includes('task_casio_practice'),
      timeEstimate: '5 phút',
      tabTarget: 'tools',
      icon: Calculator,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'task_exam_milestone',
      title: `Theo dõi tiến độ lộ trình đếm ngược THPT 2027 (${thptCountdown.days} ngày)`,
      subject: 'Chương trình GDPT 2018 Mới',
      xpReward: 20,
      completed: completedTaskIds.includes('task_exam_milestone'),
      timeEstimate: '5 phút',
      tabTarget: 'exam',
      icon: Timer,
      color: 'from-purple-500 to-indigo-600'
    }
  ], [completedTaskIds, thptCountdown.days]);

  // 4. FINANCE CALCULATIONS FOR THIS MONTH
  const financeMetrics = useMemo(() => {
    // Current month expenses
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentDay = now.getDate();
    const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);

    const monthTransactions = transactions.filter((t) => {
      if (!t.date) return false;
      const tDate = new Date(t.date);
      return tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth;
    });

    const totalExpense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalIncome = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const monthlyLimit = budget.totalMonthlyLimit > 0 ? budget.totalMonthlyLimit : 15000000;
    const remainingBudget = Math.max(0, monthlyLimit - totalExpense);
    const spentPercentage = Math.min(100, Math.round((totalExpense / monthlyLimit) * 100));

    // Daily safe spending limit for remainder of month
    const dailySafeSpend = Math.round(remainingBudget / daysRemaining);

    // Total balance across all wallets
    const totalBalance = wallets.reduce((sum, w) => sum + (Number(w.balance) || 0), 0);

    // Budget Status evaluation
    let statusText = 'Ngân sách an toàn 🟢';
    let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (spentPercentage >= 100) {
      statusText = 'Đã vượt hạn mức tháng 🔴';
      statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    } else if (spentPercentage >= 80) {
      statusText = 'Cảnh báo: Đã dùng >80% 🟡';
      statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    } else if (spentPercentage >= 50) {
      statusText = 'Đang tiến độ chuẩn 🔵';
      statusColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    }

    return {
      monthlyLimit,
      totalExpense,
      totalIncome,
      remainingBudget,
      spentPercentage,
      dailySafeSpend,
      daysRemaining,
      totalBalance,
      statusText,
      statusColor
    };
  }, [budget, transactions, wallets]);

  // Overall Morning Progress
  const completedTasksCount = dailyTasksList.filter((t) => t.completed).length;
  const taskProgressPercent = Math.round((completedTasksCount / dailyTasksList.length) * 100);

  // Motion animation variants for smooth, cohesive staggered entrance
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 24
      }
    }
  };

  return (
    <motion.div 
      className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 text-white"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & GREETING CARD */}
      {/* ========================================================================= */}
      <motion.div 
        variants={cardVariants}
        className="relative rounded-3xl border p-5 sm:p-7 shadow-2xl backdrop-blur-xl mb-6 overflow-hidden transition-all duration-500"
        style={{
          background: morningThemeConfig.cardBgGradient,
          borderColor: morningThemeConfig.cardBorderColor,
          boxShadow: `0 20px 40px -10px rgba(0,0,0,0.6), 0 0 25px ${morningThemeConfig.accentGlow}`
        }}
      >
        <div 
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-colors duration-500" 
          style={{ backgroundColor: morningThemeConfig.glowOrb1 }}
        />
        <div 
          className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-colors duration-500" 
          style={{ backgroundColor: morningThemeConfig.glowOrb2 }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span 
                className="px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm border transition-colors duration-500"
                style={{
                  backgroundColor: morningThemeConfig.badgeBg,
                  color: morningThemeConfig.badgeText,
                  borderColor: morningThemeConfig.cardBorderColor
                }}
              >
                <Sun size={14} className="animate-spin" style={{ color: morningThemeConfig.accentColor }} />
                <span>CHẾ ĐỘ BUỔI SÁNG (MORNING MODE)</span>
              </span>
              <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                <Calendar size={13} className="text-zinc-500" />
                <span>{todayFormatted}</span>
              </span>
              <HaevyMorningWeatherWidget compact />
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Bảng Điều Khiển Buổi Sáng
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl mt-1 leading-relaxed">
              Tóm tắt chỉ số quan trọng đầu ngày: Tiến độ học tập & nhiệm vụ từ <strong>Haevy Edu</strong> cùng tình trạng ngân sách và ví tiền từ <strong>Haevy Finance</strong>.
            </p>
          </div>

          {/* Quick Sub-view Navigation Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Color Theme Selector for Morning Mood */}
            <HaevyMorningThemeSelector />

            <button
              onClick={() => onSelectSubView?.('portal')}
              className="px-3.5 py-2 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              title="Quay lại Cổng 3D"
            >
              <Compass size={14} className="text-cyan-400" />
              <span>Cổng 3D</span>
            </button>

            <button
              onClick={() => onSelectSubView?.('canvas')}
              className="px-3.5 py-2 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              title="Mở Bảng Vẽ Thư Pháp 3D"
            >
              <Sparkles size={14} className="text-cyan-400" />
              <span>Bảng Vẽ 3D</span>
            </button>

            <button
              onClick={refreshFinanceData}
              className="p-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all text-xs cursor-pointer"
              title="Làm mới số liệu"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Motivation Banner Pill */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <Flame size={15} className="text-amber-400 shrink-0" />
            <span>
              <strong>Thói quen buổi sáng:</strong> Hoàn thành 1 thí nghiệm STEM và kiểm tra số dư ví trước khi bắt đầu ngày mới!
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono font-bold text-zinc-400">
            <span>Đã làm: <strong className="text-amber-400">{completedTasksCount}/{dailyTasksList.length}</strong> việc</span>
            <span>XP hôm nay: <strong className="text-emerald-400">+{profile.todayXp} XP</strong></span>
          </div>
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* 2. REALTIME LOCAL WEATHER & HOURLY FORECAST WIDGET */}
      {/* ========================================================================= */}
      <div className="mb-6">
        <HaevyMorningWeatherWidget cardVariants={cardVariants} />
      </div>

      {/* ========================================================================= */}
      {/* 3. DUAL MAIN DASHBOARD PANELS (EDU & FINANCE SIDE-BY-SIDE) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* ======================================================================= */}
        {/* PANEL A: HAEVY EDU - NHIỆM VỤ HÀNG NGÀY & HỌC TẬP STEM */}
        {/* ======================================================================= */}
        <motion.div 
          variants={cardVariants}
          className="rounded-3xl border p-5 sm:p-6 shadow-xl flex flex-col justify-between backdrop-blur-xl transition-all duration-500"
          style={{
            background: morningThemeConfig.cardBgGradient,
            borderColor: morningThemeConfig.cardBorderColor,
            boxShadow: `0 20px 35px -10px rgba(0,0,0,0.5), 0 0 16px ${morningThemeConfig.accentGlow}`
          }}
        >
          <div>
            {/* Panel Header */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-800/80 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>Nhiệm Vụ Haevy Edu</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                      Hôm Nay
                    </span>
                  </h2>
                  <p className="text-[11px] text-zinc-400">Thí nghiệm mô phỏng STEM & Rèn luyện First Principles</p>
                </div>
              </div>

              {/* Edu Streak Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-black shadow-sm">
                <Flame size={15} className="text-amber-400 fill-amber-400 animate-pulse" />
                <span>{profile.streakDays || 1} Ngày Chuỗi</span>
              </div>
            </div>

            {/* XP Goal Progress Bar */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 mb-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                  <Target size={14} className="text-emerald-400" />
                  <span>Mục Tiêu XP Hôm Nay ({profile.todayXp} / {profile.dailyGoalXp} XP)</span>
                </span>
                <span className="font-mono font-black text-emerald-400">
                  {Math.min(100, Math.round((profile.todayXp / profile.dailyGoalXp) * 100))}%
                </span>
              </div>

              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (profile.todayXp / profile.dailyGoalXp) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-2 text-[10px] text-zinc-400">
                <span>Cấp độ: <strong>{profile.levelTitle} ({profile.levelBadgeIcon})</strong></span>
                <span>Tổng tích lũy: <strong>{profile.totalXp} XP</strong></span>
              </div>
            </div>

            {/* Tasks Interactive Checklist */}
            <div className="space-y-2.5 mb-5">
              <div className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                <span>Danh sách nhiệm vụ đề xuất ({completedTasksCount}/{dailyTasksList.length})</span>
                <span className="text-[10px] text-zinc-500 font-normal">Tích chọn để nhận XP</span>
              </div>

              {dailyTasksList.map((task) => {
                const IconComponent = task.icon;
                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      task.completed
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-zinc-300'
                        : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleTask(task.id, task.xpReward)}
                        className="p-1 text-emerald-400 hover:scale-110 transition-transform shrink-0"
                        title={task.completed ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
                      >
                        {task.completed ? (
                          <CheckCircle2 size={19} className="text-emerald-400 fill-emerald-400/20" />
                        ) : (
                          <Circle size={19} className="text-zinc-600 hover:text-zinc-400" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className={`text-xs font-bold truncate ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                          {task.title}
                        </div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>{task.subject}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {task.timeEstimate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono">
                        +{task.xpReward} XP
                      </span>

                      <button
                        onClick={() => onNavigateToMode?.('edu', task.tabTarget)}
                        className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all text-xs"
                        title="Vào thực hiện ngay trong Haevy Edu"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Edu Action Footer */}
          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3">
            <div className="text-xs text-zinc-400 flex items-center gap-1.5">
              <BookOpen size={14} className="text-emerald-400" />
              <span>Kỳ thi THPT 2027: <strong>còn {thptCountdown.days} ngày</strong></span>
            </div>

            <button
              onClick={() => onNavigateToMode?.('edu', 'assistant')}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Vào Haevy Edu</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>

        {/* ======================================================================= */}
        {/* PANEL B: HAEVY FINANCE - TÌNH TRẠNG NGÂN SÁCH & HẠN MỨC CHI TIÊU */}
        {/* ======================================================================= */}
        <motion.div 
          variants={cardVariants}
          className="rounded-3xl border p-5 sm:p-6 shadow-xl flex flex-col justify-between backdrop-blur-xl transition-all duration-500"
          style={{
            background: morningThemeConfig.cardBgGradient,
            borderColor: morningThemeConfig.cardBorderColor,
            boxShadow: `0 20px 35px -10px rgba(0,0,0,0.5), 0 0 16px ${morningThemeConfig.accentGlow}`
          }}
        >
          <div>
            {/* Panel Header */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-800/80 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <Wallet size={20} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>Ngân Sách Haevy Finance</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                      {currentMonthKey}
                    </span>
                  </h2>
                  <p className="text-[11px] text-zinc-400">Kiểm soát chi tiêu, hạn mức an toàn & phân bổ 50/30/20</p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className={`px-2.5 py-1 rounded-2xl text-[11px] font-bold border ${financeMetrics.statusColor}`}>
                {financeMetrics.statusText}
              </div>
            </div>

            {/* Key Financial Numbers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
              {/* Card 1: Remaining Safe Spend Today */}
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-zinc-900/80 border border-emerald-500/40 text-left">
                <span className="text-[10px] text-zinc-400 font-bold block mb-1">CHI AN TOÀN / NGÀY</span>
                <div className="text-sm sm:text-base font-black text-emerald-400 font-mono truncate">
                  {financeMetrics.dailySafeSpend.toLocaleString()} đ
                </div>
                <span className="text-[9px] text-zinc-500 mt-0.5 block">Còn {financeMetrics.daysRemaining} ngày trong tháng</span>
              </div>

              {/* Card 2: Spent This Month */}
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left">
                <span className="text-[10px] text-zinc-400 font-bold block mb-1">ĐÃ CHI THÁNG NÀY</span>
                <div className="text-sm sm:text-base font-black text-amber-300 font-mono truncate">
                  {financeMetrics.totalExpense.toLocaleString()} đ
                </div>
                <span className="text-[9px] text-zinc-500 mt-0.5 block">Đạt {financeMetrics.spentPercentage}% hạn mức</span>
              </div>

              {/* Card 3: Total Wallets Balance */}
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left col-span-2 sm:col-span-1">
                <span className="text-[10px] text-zinc-400 font-bold block mb-1">TỔNG SỐ DƯ CÁC VÍ</span>
                <div className="text-sm sm:text-base font-black text-cyan-300 font-mono truncate">
                  {financeMetrics.totalBalance.toLocaleString()} đ
                </div>
                <span className="text-[9px] text-zinc-500 mt-0.5 block">{wallets.length} ví hoạt động</span>
              </div>
            </div>

            {/* Monthly Budget Progress Bar */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 mb-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                  <CreditCard size={14} className="text-emerald-400" />
                  <span>Hạn Mức Chi Tiêu ({financeMetrics.totalExpense.toLocaleString()} / {financeMetrics.monthlyLimit.toLocaleString()} đ)</span>
                </span>
                <span className="font-mono font-black text-amber-300">
                  {financeMetrics.spentPercentage}%
                </span>
              </div>

              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    financeMetrics.spentPercentage >= 100 
                      ? 'bg-rose-500' 
                      : financeMetrics.spentPercentage >= 80 
                      ? 'bg-amber-500' 
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, financeMetrics.spentPercentage)}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-2 text-[10px] text-zinc-400">
                <span>Còn lại: <strong className="text-emerald-400 font-mono">{financeMetrics.remainingBudget.toLocaleString()} đ</strong></span>
                <span>Thu nhập tháng: <strong className="text-cyan-400 font-mono">{financeMetrics.totalIncome.toLocaleString()} đ</strong></span>
              </div>
            </div>

            {/* Wallet Balances Quick View */}
            <div className="space-y-2 mb-4">
              <div className="text-xs font-black text-zinc-300 uppercase tracking-wider">
                Trạng thái các nguồn tiền
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {wallets.slice(0, 4).map((w) => (
                  <div key={w.id} className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: w.color || '#10b981' }} />
                      <span className="text-zinc-300 truncate text-[11px]">{w.name}</span>
                    </div>
                    <span className="font-mono font-bold text-white text-[11px] shrink-0">
                      {(w.balance || 0).toLocaleString()} đ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Finance Action Footer */}
          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3">
            <div className="text-xs text-zinc-400 flex items-center gap-1.5">
              <PiggyBank size={14} className="text-emerald-400" />
              <span>Quy tắc: <strong>50% Thiết yếu • 30% Lối sống • 20% Tiết kiệm</strong></span>
            </div>

            <button
              onClick={() => onNavigateToMode?.('finance', 'page2')}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Xem Ngân Sách</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>

      </div>

      {/* ========================================================================= */}
      {/* 3. AI MORNING SYNERGY & ACTION CARD */}
      {/* ========================================================================= */}
      <motion.div 
        variants={cardVariants}
        className="rounded-3xl border p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl transition-all duration-500"
        style={{
          background: morningThemeConfig.cardBgGradient,
          borderColor: morningThemeConfig.cardBorderColor,
          boxShadow: `0 20px 35px -10px rgba(0,0,0,0.5), 0 0 20px ${morningThemeConfig.accentGlow}`
        }}
      >
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-cyan-500/30">
            <Sparkles size={22} className="text-yellow-300 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <span>Đồng Bộ AI Buổi Sáng (Morning Synergy)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono">
                AI Thông Minh
              </span>
            </h3>
            <p className="text-xs text-zinc-300 mt-1 max-w-3xl leading-relaxed">
              Hôm nay ngân sách an toàn của bạn là <strong className="text-emerald-300">{financeMetrics.dailySafeSpend.toLocaleString()} đ</strong>. 
              Hãy dành 15 phút rèn luyện <strong>1 Thí nghiệm STEM</strong> hoặc <strong>1 bài Quiz First Principles</strong> trên Haevy Edu để nhận thêm <strong>+35 XP</strong> và duy trì chuỗi học tập {profile.streakDays} ngày!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            onClick={() => onNavigateToMode?.('edu', 'quiz')}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Zap size={14} className="text-yellow-300" />
            <span>Làm Quiz Ngay (+30 XP)</span>
          </button>

          <button
            onClick={() => onNavigateToMode?.('finance', 'page1')}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} className="text-emerald-400" />
            <span>Ghi Chi Tiêu Sáng</span>
          </button>
        </div>
      </motion.div>

    </motion.div>
  );
}
