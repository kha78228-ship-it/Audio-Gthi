import React, { useState, useEffect, useMemo } from 'react';
import { 
  Atom, 
  CheckCircle2, 
  Circle, 
  Calculator, 
  FlaskConical, 
  Timer, 
  BookOpen, 
  Zap, 
  Trophy, 
  Flame, 
  Sparkles, 
  Edit3, 
  RotateCcw, 
  Check, 
  Calendar, 
  ArrowRight, 
  Info,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
  Save,
  X
} from 'lucide-react';
import { 
  EDU_EXAM_PREP_PILLARS, 
  getTodayDateString, 
  formatFriendlyDate, 
  loadGoalsForDate, 
  toggleGoalCompletion, 
  updatePillarGoal, 
  resetGoalsForDate, 
  markAllGoalsCompleted, 
  calculateCurrentDailyGoalStreak,
  EDU_DAILY_GOALS_UPDATED_EVENT
} from '../../services/eduDailyGoalService';
const EduCelebrationModal = React.lazy(() => import('./EduCelebrationModal').then(m => ({ default: m.EduCelebrationModal })));
import { 
  EduExamPrepPillarKey, 
  EduPillarDefinition, 
  EduDailyGoalsRecord, 
  EduSubTab, 
  EduLabSubject 
} from '../../types';

interface EduDailyGoalTrackerProps {
  userId?: string;
  onNavigateToTab?: (tab: EduSubTab, payload?: any) => void;
  onOpenLab?: (subject: EduLabSubject, experimentId: string) => void;
  onOpenExam?: (presetId?: string) => void;
  onOpenAssistant?: (prompt?: string) => void;
  onOpenTools?: (toolTab?: 'casio880' | 'calculator' | 'periodic') => void;
  onOpenNotebook?: () => void;
  onOpenQuiz?: () => void;
  onRecordActivity?: (params: {
    type: 'daily_goal_complete' | 'daily_all_goals_complete';
    title: string;
    xpAmount?: number;
    category?: 'streak';
  }) => void;
}

export function EduDailyGoalTracker({
  userId,
  onNavigateToTab,
  onOpenLab,
  onOpenExam,
  onOpenAssistant,
  onOpenTools,
  onOpenNotebook,
  onOpenQuiz,
  onRecordActivity
}: EduDailyGoalTrackerProps) {
  // Selected date
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString);
  const [goalsRecord, setGoalsRecord] = useState<EduDailyGoalsRecord>(() => 
    loadGoalsForDate(getTodayDateString(), userId) as any
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [streakDays, setStreakDays] = useState<number>(calculateCurrentDailyGoalStreak);

  // Filter state: 'all' | 'pending' | 'completed'
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');

  // Celebration modal state
  const [isCelebrationModalOpen, setIsCelebrationModalOpen] = useState<boolean>(false);

  // Edit Milestone Dialog State
  const [editingPillar, setEditingPillar] = useState<EduPillarDefinition | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editMinutes, setEditMinutes] = useState<number>(20);

  // Load goals on date or user change
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    loadGoalsForDate(selectedDate, userId).then(rec => {
      if (isMounted) {
        setGoalsRecord(rec);
        setIsLoading(false);
        setStreakDays(calculateCurrentDailyGoalStreak());
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, userId]);

  // Listen to background goal update events
  useEffect(() => {
    const handleUpdate = (e: any) => {
      const updated = e.detail as EduDailyGoalsRecord;
      if (updated && updated.date === selectedDate) {
        setGoalsRecord(updated);
        setStreakDays(calculateCurrentDailyGoalStreak());
      }
    };

    window.addEventListener(EDU_DAILY_GOALS_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(EDU_DAILY_GOALS_UPDATED_EVENT, handleUpdate);
    };
  }, [selectedDate]);

  // Derived progress statistics
  const progressPercent = useMemo(() => {
    if (!goalsRecord || goalsRecord.totalCount === 0) return 0;
    return Math.round((goalsRecord.completedCount / goalsRecord.totalCount) * 100);
  }, [goalsRecord]);

  const totalPlannedMinutes = useMemo(() => {
    return EDU_EXAM_PREP_PILLARS.reduce((sum, p) => {
      const item = goalsRecord?.items?.[p.id];
      return sum + (item?.targetMinutes || p.targetMinutes);
    }, 0);
  }, [goalsRecord]);

  const completedMinutes = useMemo(() => {
    return EDU_EXAM_PREP_PILLARS.reduce((sum, p) => {
      const item = goalsRecord?.items?.[p.id];
      if (item?.isCompleted) {
        return sum + (item.targetMinutes || p.targetMinutes);
      }
      return sum;
    }, 0);
  }, [goalsRecord]);

  // Filtered pillars
  const displayedPillars = useMemo(() => {
    return EDU_EXAM_PREP_PILLARS.filter(pillar => {
      const item = goalsRecord?.items?.[pillar.id];
      const isDone = !!item?.isCompleted;
      if (filterMode === 'pending') return !isDone;
      if (filterMode === 'completed') return isDone;
      return true;
    });
  }, [goalsRecord, filterMode]);

  // Milestone check toggle
  const handleTogglePillar = async (pillarKey: EduExamPrepPillarKey) => {
    const pillarDef = EDU_EXAM_PREP_PILLARS.find(p => p.id === pillarKey);
    const { record, justCompletedAll, wasCompleted } = await toggleGoalCompletion(
      selectedDate,
      pillarKey,
      userId
    );
    setGoalsRecord(record);
    setStreakDays(calculateCurrentDailyGoalStreak());

    // Gamification XP Rewards
    if (wasCompleted && onRecordActivity && pillarDef) {
      onRecordActivity({
        type: 'daily_goal_complete',
        title: `Đạt mục tiêu: ${pillarDef.shortTitle}`,
        xpAmount: 25,
        category: 'streak'
      });
    }

    if (justCompletedAll) {
      if (onRecordActivity) {
        onRecordActivity({
          type: 'daily_all_goals_complete',
          title: 'Hoàn thành 7/7 Trụ Cột Mục Tiêu Ngày THPT 2027',
          xpAmount: 100,
          category: 'streak'
        });
      }
      setIsCelebrationModalOpen(true);
    }
  };

  // Open edit dialog
  const handleOpenEdit = (pillar: EduPillarDefinition) => {
    const item = goalsRecord?.items?.[pillar.id];
    setEditingPillar(pillar);
    setEditTitle(item?.customGoalTitle || pillar.defaultGoalTitle);
    setEditNotes(item?.notes || '');
    setEditMinutes(item?.targetMinutes || pillar.targetMinutes);
  };

  // Save customized milestone
  const handleSaveEdit = async () => {
    if (!editingPillar) return;
    const updated = await updatePillarGoal(
      selectedDate,
      editingPillar.id,
      {
        customGoalTitle: editTitle.trim(),
        notes: editNotes.trim(),
        targetMinutes: editMinutes
      },
      userId
    );
    setGoalsRecord(updated);
    setEditingPillar(null);
  };

  // Reset all for date
  const handleReset = async () => {
    if (window.confirm('Bạn có chắc muốn đặt lại toàn bộ mục tiêu của ngày này về trạng thái chưa làm?')) {
      const res = await resetGoalsForDate(selectedDate, userId);
      setGoalsRecord(res);
      setStreakDays(calculateCurrentDailyGoalStreak());
    }
  };

  // Mark all completed
  const handleMarkAll = async () => {
    const { record, justCompletedAll } = await markAllGoalsCompleted(selectedDate, userId);
    setGoalsRecord(record);
    setStreakDays(calculateCurrentDailyGoalStreak());

    if (justCompletedAll) {
      if (onRecordActivity) {
        onRecordActivity({
          type: 'daily_all_goals_complete',
          title: 'Hoàn thành 7/7 Trụ Cột Mục Tiêu Ngày THPT 2027',
          xpAmount: 100,
          category: 'streak'
        });
      }
      setIsCelebrationModalOpen(true);
    }
  };

  // Jump to specific tool action
  const handleActionClick = (pillar: EduPillarDefinition) => {
    const { action } = pillar;
    if (action.tab === 'assistant') {
      if (onOpenAssistant) {
        onOpenAssistant(action.payload?.initialQuery);
      } else if (onNavigateToTab) {
        onNavigateToTab('assistant', action.payload);
      }
    } else if (action.tab === 'exam') {
      if (onOpenExam) {
        onOpenExam(action.payload?.presetId);
      } else if (onNavigateToTab) {
        onNavigateToTab('exam', action.payload);
      }
    } else if (action.tab === 'labs') {
      if (onOpenLab) {
        onOpenLab(action.payload?.subject || 'physics', action.payload?.experimentId || 'pendulum');
      } else if (onNavigateToTab) {
        onNavigateToTab('labs', action.payload);
      }
    } else if (action.tab === 'tools') {
      if (onOpenTools) {
        onOpenTools(action.payload?.toolTab || 'casio880');
      } else if (onNavigateToTab) {
        onNavigateToTab('tools', action.payload);
      }
    } else if (action.tab === 'notebook') {
      if (onOpenNotebook) {
        onOpenNotebook();
      } else if (onNavigateToTab) {
        onNavigateToTab('notebook');
      }
    } else if (action.tab === 'quiz') {
      if (onOpenQuiz) {
        onOpenQuiz();
      } else if (onNavigateToTab) {
        onNavigateToTab('quiz');
      }
    } else if (onNavigateToTab) {
      onNavigateToTab(action.tab);
    }
  };

  // Change date +/- 1 day
  const handleShiftDate = (offsetDays: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + offsetDays);
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  // Render pillar icon
  const renderPillarIcon = (name: string, className = 'w-5 h-5') => {
    switch (name) {
      case 'Atom':
        return <Atom className={className} />;
      case 'CheckCircle2':
        return <CheckCircle2 className={className} />;
      case 'Calculator':
        return <Calculator className={className} />;
      case 'FlaskConical':
        return <FlaskConical className={className} />;
      case 'Timer':
        return <Timer className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  const isToday = selectedDate === getTodayDateString();

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Top Bar: Title & Date Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-lg">
        {/* Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-md">
            <Trophy size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-zinc-100 tracking-tight">
                Mục Tiêu Ngày • 7 Trụ Cột GDPT 2018
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                THPT 2027
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Thiết lập & theo dõi các cột mốc rèn luyện First Principles hàng ngày
            </p>
          </div>
        </div>

        {/* Date Selector & Action Tools */}
        <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
          {/* Streak Indicator */}
          <div className="px-2.5 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 flex items-center gap-1.5 text-xs font-bold shadow-sm">
            <Flame size={14} className="text-amber-400 animate-pulse" />
            <span>Chuỗi:</span>
            <span className="font-mono text-amber-200 bg-amber-500/20 px-1.5 py-0.2 rounded">
              {streakDays} ngày
            </span>
          </div>

          {/* Date Navigator */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => handleShiftDate(-1)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
              title="Ngày hôm trước"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={() => setSelectedDate(getTodayDateString())}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                isToday
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              {formatFriendlyDate(selectedDate)}
            </button>

            <button
              onClick={() => handleShiftDate(1)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
              title="Ngày tiếp theo"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Quick Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            className="px-2 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 cursor-pointer focus:outline-none focus:border-emerald-500"
            title="Chọn ngày cụ thể"
          />
        </div>
      </div>

      {/* Hero Visual Progress Bar & Statistics Bento */}
      <div className="w-full bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-black border border-zinc-800/90 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4">
          {/* Header Row: Big Stats & Replay Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Tiến Độ Rèn Luyện Toàn Diện
              </span>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                  {progressPercent}%
                </span>
                <span className="text-xs sm:text-sm font-semibold text-zinc-300">
                  • {goalsRecord?.completedCount || 0} / {goalsRecord?.totalCount || 7} Trụ Cột Đã Hoàn Thành
                </span>
              </div>
            </div>

            {/* Quick Actions Strip */}
            <div className="flex items-center gap-2 flex-wrap">
              {goalsRecord?.allCompleted && (
                <button
                  onClick={() => setIsCelebrationModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-black text-amber-300 bg-amber-950/60 hover:bg-amber-900/70 border border-amber-500/40 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm shadow-amber-950/50"
                >
                  <Trophy size={14} className="text-amber-400 animate-pulse" />
                  <span>Xem Lại Vinh Danh 🎉</span>
                </button>
              )}

              <button
                onClick={handleMarkAll}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                title="Đánh dấu đã hoàn thành toàn bộ 7 mục tiêu"
              >
                <Check size={13} />
                <span>Hoàn thành tất cả</span>
              </button>

              <button
                onClick={handleReset}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                title="Đặt lại mục tiêu"
              >
                <RotateCcw size={13} />
                <span>Đặt lại</span>
              </button>
            </div>
          </div>

          {/* Continuous Gradient Progress Bar */}
          <div className="w-full">
            <div className="w-full h-3.5 sm:h-4 bg-zinc-950 rounded-full p-0.5 border border-zinc-800/80 shadow-inner overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-300 transition-all duration-500 shadow-md relative"
                style={{ width: `${progressPercent}%` }}
              >
                {progressPercent > 8 && (
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-sm animate-ping" />
                )}
              </div>
            </div>
          </div>

          {/* 7-Segmented Interactive Pillar Pills */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
            {EDU_EXAM_PREP_PILLARS.map((pillar) => {
              const item = goalsRecord?.items?.[pillar.id];
              const isDone = !!item?.isCompleted;

              return (
                <button
                  key={pillar.id}
                  onClick={() => handleTogglePillar(pillar.id)}
                  className={`p-1.5 sm:p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer active:scale-95 ${
                    isDone 
                      ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-950/40' 
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                  title={`${pillar.title}: ${isDone ? 'Đã đạt' : 'Chưa đạt'}`}
                >
                  <div className="flex items-center justify-center">
                    {isDone ? (
                      <CheckCircle2 size={14} className="text-emerald-400" />
                    ) : (
                      <Circle size={14} className="text-zinc-600" />
                    )}
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold truncate max-w-full">
                    P{pillar.orderNumber}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Time & Motivational Readout */}
          <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/80 pt-3 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Clock size={13} className="text-teal-400" />
              <span>Thời gian ôn luyện ước tính:</span>
              <span className="font-mono text-zinc-100 font-bold">
                {completedMinutes} / {totalPlannedMinutes} phút
              </span>
            </div>

            <div className="text-[11px] italic text-zinc-400">
              {progressPercent === 100 ? (
                <span className="text-emerald-400 font-semibold">
                  🎉 Toàn bộ 7 trụ cột đã hoàn thành xuất sắc!
                </span>
              ) : progressPercent >= 50 ? (
                <span className="text-teal-300">
                  ⚡ Bạn đã đi được hơn nửa chặng đường. Tiếp tục bứt phá!
                </span>
              ) : (
                <span>
                  🌱 Mỗi mục tiêu hoàn thành là một bước tiến vững chắc về điểm số.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Segmented Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Tất Cả (7 Trụ Cột)
          </button>
          <button
            onClick={() => setFilterMode('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterMode === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Chưa Đạt ({goalsRecord?.totalCount ? goalsRecord.totalCount - goalsRecord.completedCount : 0})
          </button>
          <button
            onClick={() => setFilterMode('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterMode === 'completed'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Đã Đạt ({goalsRecord?.completedCount || 0})
          </button>
        </div>

        <div className="text-xs text-zinc-400 flex items-center gap-2">
          <Info size={13} className="text-zinc-500" />
          <span>Bấm vào thẻ để đổi trạng thái hoặc chỉnh sửa mục tiêu chi tiết</span>
        </div>
      </div>

      {/* 7 Pillar Milestone Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {displayedPillars.map((pillar) => {
          const item = goalsRecord?.items?.[pillar.id];
          const isDone = !!item?.isCompleted;
          const displayGoalTitle = item?.customGoalTitle || pillar.defaultGoalTitle;
          const targetMinutes = item?.targetMinutes || pillar.targetMinutes;

          return (
            <div
              key={pillar.id}
              className={`group relative rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-lg ${
                isDone 
                  ? 'bg-gradient-to-b from-zinc-900/90 via-zinc-950/90 to-black border-emerald-500/50 shadow-emerald-950/20'
                  : 'bg-zinc-900/70 hover:bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Pillar Ambient Glow */}
              <div 
                className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${pillar.gradientBg} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform`} 
              />

              {/* Card Header: Icon, Badge, Toggle Checkbox */}
              <div className="relative z-10 flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-zinc-900 border ${pillar.borderColor} flex items-center justify-center ${pillar.textColor} shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                    {renderPillarIcon(pillar.iconName, 'w-5 h-5')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-zinc-400">
                        TRỤ CỘT #{pillar.orderNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${pillar.borderColor} ${pillar.textColor} bg-zinc-950/60`}>
                        {pillar.badge}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors">
                      {pillar.shortTitle}
                    </h3>
                  </div>
                </div>

                {/* Big Interactive Checkbox */}
                <button
                  onClick={() => handleTogglePillar(pillar.id)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-90 shrink-0 ${
                    isDone
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-500/30'
                      : 'bg-zinc-950 text-zinc-500 border-zinc-700 hover:border-zinc-500 hover:text-zinc-300'
                  }`}
                  title={isDone ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
                >
                  {isDone ? <Check size={18} className="stroke-[3]" /> : <Circle size={18} />}
                </button>
              </div>

              {/* Card Body: Active Goal & Description */}
              <div className="relative z-10 flex-1 flex flex-col gap-2 my-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-[11px] text-zinc-400 font-semibold block mb-0.5">
                      Mục Tiêu Ngày:
                    </span>
                    <p className={`text-xs sm:text-sm font-semibold leading-snug ${isDone ? 'text-emerald-300 line-through decoration-emerald-500/50' : 'text-zinc-100'}`}>
                      {displayGoalTitle}
                    </p>
                  </div>

                  {/* Edit button */}
                  <button
                    onClick={() => handleOpenEdit(pillar)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors shrink-0"
                    title="Chỉnh sửa mục tiêu & ghi chú cá nhân"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>

                {/* Subtitle / Focus Summary */}
                <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                  {pillar.subtitle}
                </p>

                {/* Personal Notes (if any) */}
                {item?.notes && (
                  <div className="p-2 rounded-xl bg-zinc-950/70 border border-zinc-800 text-[11px] text-zinc-300 mt-1">
                    <span className="font-semibold text-emerald-400">Ghi chú của bạn: </span>
                    <span>{item.notes}</span>
                  </div>
                )}

                {/* Pillar Tags */}
                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  <span className="px-2 py-0.5 rounded-md bg-zinc-950 text-[10px] text-zinc-400 font-mono flex items-center gap-1 border border-zinc-800">
                    <Clock size={10} className="text-zinc-500" />
                    <span>{targetMinutes} phút</span>
                  </span>
                  {pillar.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-zinc-950 text-[10px] text-zinc-400 border border-zinc-800/80">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Fast Jump Action Button */}
              <div className="relative z-10 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2 mt-2">
                <span className="text-[11px] text-zinc-500">
                  {isDone ? '✓ Đã hoàn thành' : 'Chưa thực hiện'}
                </span>

                <button
                  onClick={() => handleActionClick(pillar)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    isDone
                      ? 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700'
                      : `bg-gradient-to-r from-zinc-800 to-zinc-900 ${pillar.textColor} hover:brightness-110 border ${pillar.borderColor}`
                  }`}
                  title={`Chuyển ngay tới học phần ${pillar.action.label}`}
                >
                  <span>{pillar.action.label}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Milestone Modal */}
      {editingPillar && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setEditingPillar(null)}
        >
          <div 
            className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-zinc-800 ${editingPillar.textColor}`}>
                  {renderPillarIcon(editingPillar.iconName, 'w-4 h-4')}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Tùy Chỉnh Mục Tiêu: {editingPillar.shortTitle}
                  </h3>
                  <span className="text-[11px] text-zinc-400">
                    Trụ Cột #{editingPillar.orderNumber} • {editingPillar.badge}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEditingPillar(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X size={16} />
              </button>
            </div>

            {/* Custom Goal Title */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Tiêu đề mục tiêu cụ thể hôm nay:
              </label>
              <textarea
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                placeholder={editingPillar.defaultGoalTitle}
              />
              <button
                onClick={() => setEditTitle(editingPillar.defaultGoalTitle)}
                className="text-[10px] text-emerald-400 hover:underline mt-1 block"
              >
                Khôi phục mục tiêu gợi ý mặc định
              </button>
            </div>

            {/* Target Study Time */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Thời lượng dự kiến (phút):
              </label>
              <div className="flex items-center gap-2">
                {[15, 20, 25, 30, 45].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setEditMinutes(m)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                      editMinutes === m
                        ? 'bg-emerald-500 text-zinc-950 font-bold'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Study Notes */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Ghi chú / Nhận xét / Cạm bẫy phát hiện:
              </label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                placeholder="VD: Cần chú ý bẫy từ 'không đổi' trong câu Đúng/Sai môn Lý..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setEditingPillar(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <Save size={14} />
                <span>Lưu Mục Tiêu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Celebration Modal */}
      {isCelebrationModalOpen && (
        <React.Suspense fallback={null}>
          <EduCelebrationModal
            isOpen={isCelebrationModalOpen}
            onClose={() => setIsCelebrationModalOpen(false)}
            streakCount={streakDays}
            dateStr={selectedDate}
            totalEstimatedMinutes={completedMinutes || totalPlannedMinutes}
            onOpenNotebook={onOpenNotebook}
          />
        </React.Suspense>
      )}
    </div>
  );
}
