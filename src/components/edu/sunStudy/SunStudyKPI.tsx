import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  Award,
  ChevronRight,
  PieChart
} from 'lucide-react';
import { SunStudyState } from '../../../services/sunStudyStorageService';

interface SunStudyKPIProps {
  state: SunStudyState;
  onUpdateState: (updater: (prev: SunStudyState) => SunStudyState) => void;
}

export function SunStudyKPI({ state, onUpdateState }: SunStudyKPIProps) {
  const [goalInput, setGoalInput] = useState<number>(state.dailyGoalMinutes);
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);

  const handleSaveGoal = () => {
    onUpdateState(prev => ({
      ...prev,
      dailyGoalMinutes: Math.max(30, Number(goalInput) || 180)
    }));
    setIsEditingGoal(false);
  };

  const todayMinutes = state.todayStudyMinutes;
  const goalMinutes = state.dailyGoalMinutes;
  const kpiPercent = Math.min(100, Math.round((todayMinutes / goalMinutes) * 100));

  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const maxWeeklyMinutes = Math.max(...Object.values(state.weeklyStudyMinutes), 240);

  // Total weekly minutes
  const totalWeeklyMinutes = Object.values(state.weeklyStudyMinutes).reduce((a, b) => a + b, 0);
  const weeklyHours = (totalWeeklyMinutes / 60).toFixed(1);

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Header KPI Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 text-2xl shadow-inner">
            📊
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">Bảng Thống Kê KPI Học Tập</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                kpiPercent >= 100 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {kpiPercent >= 100 ? '🎉 Đạt KPI Ngày!' : `Đạt ${kpiPercent}% KPI`}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Minh bạch hóa giờ học thực tế, đo lường kỷ luật cá nhân và theo dõi độ phủ môn thi.
            </p>
          </div>
        </div>

        {/* Change Goal Button */}
        <div className="flex items-center gap-2">
          {isEditingGoal ? (
            <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-700">
              <span className="text-xs text-zinc-400">Mục tiêu (phút):</span>
              <input
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(Number(e.target.value))}
                className="w-16 bg-zinc-900 border border-zinc-600 rounded-lg px-2 py-1 text-xs text-white text-center font-mono"
                min={30}
                max={720}
              />
              <button
                onClick={handleSaveGoal}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold"
              >
                Lưu
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingGoal(true)}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition"
            >
              ⚙️ Đổi KPI ({goalMinutes}p)
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI Card 1: Today Progress */}
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span className="font-bold flex items-center gap-1.5 text-amber-300">
                <Clock size={14} /> KPI Hôm Nay
              </span>
              <span className="font-mono font-bold">{todayMinutes}/{goalMinutes}p</span>
            </div>
            <div className="text-3xl font-black text-white font-mono mt-1">
              {(todayMinutes / 60).toFixed(1)} <span className="text-base text-zinc-400 font-sans font-normal">giờ</span>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-1.5">
            <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${kpiPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-zinc-400 text-right">
              {kpiPercent >= 100 ? 'Đã hoàn thành xuất sắc! 🌟' : `Còn thiếu ${Math.max(0, goalMinutes - todayMinutes)} phút nữa`}
            </span>
          </div>
        </div>

        {/* KPI Card 2: Weekly Total Hours */}
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span className="font-bold flex items-center gap-1.5 text-cyan-300">
                <Calendar size={14} /> Tổng Giờ Học Tuần Này
              </span>
              <span className="font-mono font-bold">{weeklyHours}h</span>
            </div>
            <div className="text-3xl font-black text-white font-mono mt-1">
              {totalWeeklyMinutes} <span className="text-base text-zinc-400 font-sans font-normal">phút</span>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-[11px] text-zinc-300 flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-400 shrink-0" />
            <span>Trung bình: {Math.round(totalWeeklyMinutes / 7)} phút/ngày</span>
          </div>
        </div>

        {/* KPI Card 3: Streak & Status */}
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span className="font-bold flex items-center gap-1.5 text-orange-400">
                <Flame size={14} /> Chuỗi Ngày Chăm Chỉ
              </span>
              <span className="font-mono font-bold text-orange-400">Streak</span>
            </div>
            <div className="text-3xl font-black text-white font-mono mt-1">
              {state.currentStreakDays} <span className="text-base text-zinc-400 font-sans font-normal">ngày</span>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400 shrink-0" />
            <span>Kỷ luật là cầu nối giữa mục tiêu và thành tựu!</span>
          </div>
        </div>
      </div>

      {/* Charts Section: Weekly Bar Chart & Subject Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Bar Chart */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-amber-400" />
              <h4 className="text-sm font-bold text-white">Biểu Đồ Số Phút Học 7 Ngày Qua</h4>
            </div>
            <span className="text-xs text-zinc-400 font-mono">Đơn vị: Phút</span>
          </div>

          {/* Custom SVG/Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-44 pt-6 pb-2 px-2">
            {daysOfWeek.map((day) => {
              const minutes = state.weeklyStudyMinutes[day] || (day === 'CN' ? 180 : 150);
              const heightPercent = Math.min(100, Math.round((minutes / maxWeeklyMinutes) * 100));
              const isToday = day === 'T6'; // mock current day representation

              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 group-hover:text-amber-300">
                    {minutes}p
                  </span>

                  <div className="w-full max-w-[36px] bg-zinc-900 rounded-t-xl overflow-hidden h-full flex items-end border border-zinc-800">
                    <div 
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isToday 
                          ? 'bg-gradient-to-t from-amber-500 to-orange-400 shadow-lg shadow-amber-500/30' 
                          : 'bg-gradient-to-t from-cyan-600 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-400'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  <span className={`text-xs font-bold ${isToday ? 'text-amber-400 font-black' : 'text-zinc-500'}`}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Distribution */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <PieChart size={16} className="text-cyan-400" />
              <h4 className="text-sm font-bold text-white">Phân Bổ Thời Gian Theo Môn</h4>
            </div>
            <span className="text-xs text-zinc-400 font-mono">5 Môn</span>
          </div>

          <div className="flex flex-col gap-3">
            {Object.entries(state.subjectDistribution).map(([subj, mins], idx) => {
              const colors = ['bg-amber-500', 'bg-cyan-500', 'bg-rose-500', 'bg-emerald-500', 'bg-purple-500'];
              const color = colors[idx % colors.length];
              const totalMins = Object.values(state.subjectDistribution).reduce((a, b) => a + b, 0);
              const percent = totalMins > 0 ? Math.round((mins / totalMins) * 100) : 0;

              return (
                <div key={subj} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      <span>{subj}</span>
                    </span>
                    <span className="font-mono text-zinc-400 font-bold">{mins}p ({percent}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
