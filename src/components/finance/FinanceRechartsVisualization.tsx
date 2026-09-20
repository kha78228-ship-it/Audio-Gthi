import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  PieChart as PieIcon,
  BarChart3,
  Target,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import { FinanceTransaction, FinanceCategory, FinanceBudget } from '../../types';

interface WeeklyTrendDataPoint {
  id: string;
  name: string;
  label: string;
  date?: string;
  start?: number;
  end?: number;
  income: number;
  expense: number;
  savings: number;
  cumulativeExpense: number;
  budgetQuota: number;
  plannedBurn: number;
  burnRatioPercent: number;
}

interface FinanceRechartsVisualizationProps {
  transactions: FinanceTransaction[];
  categories: FinanceCategory[];
  budget?: FinanceBudget;
  selectedMonth: string;
  className?: string;
  defaultTab?: 'weekly_trends' | 'budget_progress' | 'category_pie';
}

export function FinanceRechartsVisualization({
  transactions,
  categories,
  budget,
  selectedMonth,
  className = '',
  defaultTab = 'weekly_trends'
}: FinanceRechartsVisualizationProps) {
  const [activeTab, setActiveTab] = useState<'weekly_trends' | 'budget_progress' | 'category_pie'>(defaultTab);
  const [trendChartType, setTrendChartType] = useState<'area' | 'bar'>('area');
  const [timeframeMode, setTimeframeMode] = useState<'weeks' | 'days'>('weeks');

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatShortVND = (amount: number) => {
    if (Math.abs(amount) >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}Tr`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `${(amount / 1_000).toFixed(0)}k`;
    }
    return `${amount}₫`;
  };

  // 1. Filter transactions by selectedMonth
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date && t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const totalExpense = useMemo(() => {
    return monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const totalIncome = useMemo(() => {
    return monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const netSavings = totalIncome - totalExpense;

  // Monthly Budget Limit
  const monthlyLimit = budget?.totalMonthlyLimit || 15_000_000;
  const budgetBurnRate = monthlyLimit > 0 ? Math.round((totalExpense / monthlyLimit) * 100) : 0;
  const weeklyBudgetQuota = Math.round(monthlyLimit / 4.33);

  // ==========================================
  // 2. WEEKLY PERFORMANCE DATA CALCULATION
  // ==========================================
  const weeklyPerformanceData: WeeklyTrendDataPoint[] = useMemo(() => {
    // Parse year and month to find number of days in this month
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10) || new Date().getFullYear();
    const month = parseInt(monthStr, 10) || (new Date().getMonth() + 1);
    const daysInMonth = new Date(year, month, 0).getDate();

    if (timeframeMode === 'days') {
      const dailyMap: Record<string, { date: string; label: string; income: number; expense: number; budgetQuota: number }> = {};
      
      for (let day = 1; day <= Math.min(daysInMonth, 14); day++) {
        const dayStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
        const label = `N.${day}`;
        dailyMap[dayStr] = {
          date: dayStr,
          label,
          income: 0,
          expense: 0,
          budgetQuota: Math.round(monthlyLimit / daysInMonth)
        };
      }

      monthTransactions.forEach(t => {
        if (dailyMap[t.date]) {
          if (t.type === 'expense') dailyMap[t.date].expense += t.amount;
          if (t.type === 'income') dailyMap[t.date].income += t.amount;
        }
      });

      let runningDaily = 0;
      return Object.values(dailyMap).map((d, idx) => {
        runningDaily += d.expense;
        return {
          id: `day_${idx + 1}`,
          name: d.label,
          label: d.label,
          date: d.date,
          income: d.income,
          expense: d.expense,
          savings: d.income - d.expense,
          cumulativeExpense: runningDaily,
          budgetQuota: d.budgetQuota,
          plannedBurn: d.budgetQuota * (idx + 1),
          burnRatioPercent: d.budgetQuota > 0 ? Math.round((d.expense / d.budgetQuota) * 100) : 0
        };
      });
    }

    // Weekly Buckets:
    const weeks = [
      { id: 'w1', name: 'Tuần 1 (01-07)', label: 'Tuần 1', start: 1, end: 7, income: 0, expense: 0, savings: 0, cumulativeExpense: 0, budgetQuota: weeklyBudgetQuota, plannedBurn: weeklyBudgetQuota },
      { id: 'w2', name: 'Tuần 2 (08-14)', label: 'Tuần 2', start: 8, end: 14, income: 0, expense: 0, savings: 0, cumulativeExpense: 0, budgetQuota: weeklyBudgetQuota, plannedBurn: weeklyBudgetQuota * 2 },
      { id: 'w3', name: 'Tuần 3 (15-21)', label: 'Tuần 3', start: 15, end: 21, income: 0, expense: 0, savings: 0, cumulativeExpense: 0, budgetQuota: weeklyBudgetQuota, plannedBurn: weeklyBudgetQuota * 3 },
      { id: 'w4', name: 'Tuần 4 (22-28)', label: 'Tuần 4', start: 22, end: 28, income: 0, expense: 0, savings: 0, cumulativeExpense: 0, budgetQuota: weeklyBudgetQuota, plannedBurn: weeklyBudgetQuota * 4 },
      { id: 'w5', name: `Tuần 5 (29-${daysInMonth})`, label: 'Tuần 5', start: 29, end: daysInMonth, income: 0, expense: 0, savings: 0, cumulativeExpense: 0, budgetQuota: Math.round(weeklyBudgetQuota * ((daysInMonth - 28) / 7)), plannedBurn: monthlyLimit },
    ];

    monthTransactions.forEach(t => {
      const day = parseInt(t.date.split('-')[2], 10);
      if (isNaN(day)) return;

      const targetWeek = weeks.find(w => day >= w.start && day <= w.end);
      if (targetWeek) {
        if (t.type === 'expense') targetWeek.expense += t.amount;
        if (t.type === 'income') targetWeek.income += t.amount;
      }
    });

    let runningExpense = 0;
    return weeks.map(w => {
      runningExpense += w.expense;
      return {
        ...w,
        savings: w.income - w.expense,
        cumulativeExpense: runningExpense,
        burnRatioPercent: w.budgetQuota > 0 ? Math.round((w.expense / w.budgetQuota) * 100) : 0
      };
    });
  }, [monthTransactions, selectedMonth, timeframeMode, monthlyLimit, weeklyBudgetQuota]);

  // Peak spending week calculation
  const peakWeek = useMemo(() => {
    if (!weeklyPerformanceData || weeklyPerformanceData.length === 0) return null;
    return [...weeklyPerformanceData].sort((a, b) => b.expense - a.expense)[0];
  }, [weeklyPerformanceData]);

  // ==========================================
  // 3. BUDGET PROGRESS DATA CALCULATION
  // ==========================================
  const categoryBudgetData = useMemo(() => {
    const categoryLimits = budget?.categoryLimits || {};
    
    // Sum expenses by category
    const spentMap: Record<string, number> = {};
    monthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        spentMap[t.categoryId] = (spentMap[t.categoryId] || 0) + t.amount;
      });

    // Default categories if budget limits not fully set
    const defaultLimits: Record<string, number> = {
      cat_food: 4_500_000,
      cat_rent: 6_000_000,
      cat_transport: 1_200_000,
      cat_bills: 1_800_000,
      cat_groceries: 3_000_000,
      cat_shopping: 2_000_000,
      cat_entertainment: 1_500_000,
      cat_couple_date: 2_000_000,
    };

    return categories
      .filter(c => c.type === 'expense')
      .map(cat => {
        const limit = categoryLimits[cat.id] || cat.monthlyBudget || defaultLimits[cat.id] || 1_500_000;
        const spent = spentMap[cat.id] || 0;
        const remaining = Math.max(limit - spent, 0);
        const overspent = Math.max(spent - limit, 0);
        const progressPct = limit > 0 ? Math.round((spent / limit) * 100) : 0;

        let statusColor = '#10b981'; // Green (safe)
        let statusText = 'An toàn';
        if (progressPct >= 100) {
          statusColor = '#f43f5e'; // Rose/Red (over)
          statusText = 'Vượt hạn mức';
        } else if (progressPct >= 80) {
          statusColor = '#f59e0b'; // Amber (warning)
          statusText = 'Gần ngưỡng';
        }

        return {
          id: cat.id,
          name: cat.name,
          shortName: cat.name.length > 12 ? `${cat.name.slice(0, 10)}..` : cat.name,
          limit,
          spent,
          remaining,
          overspent,
          progressPct,
          statusColor,
          statusText,
          catColor: cat.color || '#3b82f6'
        };
      })
      .sort((a, b) => b.spent - a.spent);
  }, [categories, monthTransactions, budget]);

  // ==========================================
  // 4. CATEGORY PIE / DONUT DATA
  // ==========================================
  const categoryPieData = useMemo(() => {
    const map: Record<string, { name: string; value: number; color: string }> = {};

    monthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        const name = cat?.name || t.categoryName || 'Khác';
        const color = cat?.color || '#a1a1aa';
        if (!map[t.categoryId]) {
          map[t.categoryId] = { name, value: 0, color };
        }
        map[t.categoryId].value += t.amount;
      });

    return Object.values(map)
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [monthTransactions, categories]);

  // Custom Weekly Tooltip
  const CustomWeeklyTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const dataItem = payload[0]?.payload;
    const inc = dataItem?.income || 0;
    const exp = dataItem?.expense || 0;
    const sav = dataItem?.savings || 0;
    const quota = dataItem?.budgetQuota || 0;
    const burnRatio = quota > 0 ? Math.round((exp / quota) * 100) : 0;

    return (
      <div className="p-3.5 rounded-2xl bg-zinc-950/95 border border-zinc-700 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[210px] pointer-events-none z-50">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
          <span className="font-black text-white">{label || dataItem?.name}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            exp > quota ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {exp > quota ? `Vượt chuẩn (${burnRatio}%)` : `Chuẩn ngân sách (${burnRatio}%)`}
          </span>
        </div>

        <div className="space-y-1 text-[11px]">
          <div className="flex items-center justify-between text-rose-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Chi tiêu:
            </span>
            <span className="font-black">{formatVND(exp)}</span>
          </div>

          <div className="flex items-center justify-between text-emerald-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Thu nhập:
            </span>
            <span className="font-black">{formatVND(inc)}</span>
          </div>

          <div className="flex items-center justify-between text-cyan-300 border-t border-zinc-800/80 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              Dòng tiền ròng:
            </span>
            <span className={`font-black ${sav >= 0 ? 'text-cyan-300' : 'text-amber-400'}`}>
              {sav >= 0 ? `+${formatVND(sav)}` : `-${formatVND(Math.abs(sav))}`}
            </span>
          </div>

          <div className="flex items-center justify-between text-zinc-400 text-[10px] pt-0.5">
            <span>Định mức tuần:</span>
            <span className="font-mono text-zinc-300">{formatVND(quota)}</span>
          </div>
        </div>
      </div>
    );
  };

  // Custom Category Budget Tooltip
  const CustomBudgetTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0]?.payload;

    return (
      <div className="p-3.5 rounded-2xl bg-zinc-950/95 border border-zinc-700 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[220px] pointer-events-none z-50">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
          <span className="font-black text-white">{d?.name || label}</span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ backgroundColor: `${d?.statusColor}25`, color: d?.statusColor, borderColor: `${d?.statusColor}40`, borderWidth: 1 }}
          >
            {d?.statusText} ({d?.progressPct}%)
          </span>
        </div>

        <div className="space-y-1 text-[11px]">
          <div className="flex items-center justify-between text-zinc-400">
            <span>Hạn mức tháng:</span>
            <span className="font-bold text-zinc-200">{formatVND(d?.limit || 0)}</span>
          </div>
          <div className="flex items-center justify-between text-rose-300">
            <span>Đã thực chi:</span>
            <span className="font-black">{formatVND(d?.spent || 0)}</span>
          </div>
          <div className="flex items-center justify-between text-emerald-300 border-t border-zinc-800 pt-1">
            <span>{d?.spent > d?.limit ? 'Bội chi quá hạn:' : 'Hạn mức còn lại:'}</span>
            <span className={`font-black ${d?.spent > d?.limit ? 'text-rose-400' : 'text-emerald-300'}`}>
              {d?.spent > d?.limit ? `+${formatVND(d?.spent - d?.limit)}` : formatVND(d?.remaining || 0)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`p-5 sm:p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-6 ${className}`} id="recharts-finance-dashboard">
      {/* Top Header & Mode Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 flex items-center justify-center font-black shadow-md shadow-emerald-500/20">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>Trực Quan Hóa Dữ Liệu Recharts</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Live Analytics
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Xu hướng hiệu suất thu chi hàng tuần &amp; Tiến độ thực hiện ngân sách tháng {selectedMonth}
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
          <button
            id="btn-recharts-tab-weekly"
            onClick={() => setActiveTab('weekly_trends')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'weekly_trends'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 font-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <TrendingUp size={14} />
            <span>Xu Hướng Tuần</span>
          </button>

          <button
            id="btn-recharts-tab-budget"
            onClick={() => setActiveTab('budget_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'budget_progress'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 font-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Target size={14} />
            <span>Tiến Độ Ngân Sách</span>
          </button>

          <button
            id="btn-recharts-tab-category"
            onClick={() => setActiveTab('category_pie')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'category_pie'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 font-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <PieIcon size={14} />
            <span>Cơ Cấu Tỷ Trọng</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Tổng Chi Tiêu
          </span>
          <p className="text-base sm:text-lg font-black text-rose-300">{formatVND(totalExpense)}</p>
          <span className="text-[10px] text-zinc-500 font-mono">
            {monthTransactions.filter(t => t.type === 'expense').length} giao dịch chi
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Tổng Thu Nhập
          </span>
          <p className="text-base sm:text-lg font-black text-emerald-300">{formatVND(totalIncome)}</p>
          <span className="text-[10px] text-zinc-500 font-mono">
            {monthTransactions.filter(t => t.type === 'income').length} nguồn thu
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
            <Target size={12} className="text-amber-400" /> Hấp Thụ Ngân Sách
          </span>
          <div className="flex items-center gap-2">
            <p className={`text-base sm:text-lg font-black ${
              budgetBurnRate > 100 ? 'text-rose-400' : budgetBurnRate > 80 ? 'text-amber-300' : 'text-white'
            }`}>
              {budgetBurnRate}%
            </p>
            <span className="text-[10px] text-zinc-400">/ {formatShortVND(monthlyLimit)}</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetBurnRate > 100 ? 'bg-rose-500' : budgetBurnRate > 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(budgetBurnRate, 100)}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
            <Zap size={12} className="text-cyan-400" /> Tuần Đỉnh Chi Tiêu
          </span>
          <p className="text-base sm:text-lg font-black text-cyan-300">
            {peakWeek ? formatShortVND(peakWeek.expense) : '0₫'}
          </p>
          <span className="text-[10px] text-zinc-400 truncate block">
            {peakWeek ? peakWeek.name : 'Chưa có số liệu'}
          </span>
        </div>
      </div>

      {/* ==========================================
          TAB 1: WEEKLY PERFORMANCE TRENDS
      ========================================== */}
      {activeTab === 'weekly_trends' && (
        <div className="space-y-4">
          {/* Sub-toolbar: Chart Type & Timeframe Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <BarChart3 size={14} className="text-emerald-400" />
                Diễn Biến Theo Tuần &amp; Dòng Tiền Ròng:
              </span>
              <span className="text-[11px] text-zinc-400 hidden sm:inline">
                (Có vạch đối chiếu định mức tuần: <strong className="text-amber-300">{formatShortVND(weeklyBudgetQuota)}</strong>)
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Area vs Bar Toggle */}
              <div className="flex items-center p-0.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-bold">
                <button
                  onClick={() => setTrendChartType('area')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    trendChartType === 'area' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Miền Mượt (Area)
                </button>
                <button
                  onClick={() => setTrendChartType('bar')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    trendChartType === 'bar' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Cột Nhóm (Bar)
                </button>
              </div>

              {/* Weeks vs Days Toggle */}
              <div className="flex items-center p-0.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-bold">
                <button
                  onClick={() => setTimeframeMode('weeks')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    timeframeMode === 'weeks' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Theo Tuần
                </button>
                <button
                  onClick={() => setTimeframeMode('days')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    timeframeMode === 'days' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Theo Ngày
                </button>
              </div>
            </div>
          </div>

          {/* Recharts Main Canvas */}
          <div className="p-4 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 min-h-[340px] relative">
            <ResponsiveContainer width="100%" height={320} minWidth={100} minHeight={250}>
              {trendChartType === 'area' ? (
                <AreaChart
                  data={weeklyPerformanceData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey={timeframeMode === 'weeks' ? 'name' : 'label'}
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#3f3f46' }}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatShortVND}
                  />
                  <Tooltip content={<CustomWeeklyTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                    formatter={(value) => <span className="text-zinc-300 font-bold">{value}</span>}
                  />
                  {/* Reference Line for Weekly Budget Threshold */}
                  <ReferenceLine
                    y={weeklyBudgetQuota}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Định mức: ${formatShortVND(weeklyBudgetQuota)}`,
                      fill: '#fbbf24',
                      fontSize: 10,
                      position: 'insideTopRight'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Chi tiêu"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Thu nhập"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                  />
                  <Area
                    type="monotone"
                    dataKey="savings"
                    name="Thặng dư ròng"
                    stroke="#06b6d4"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    fillOpacity={1}
                    fill="url(#colorSavings)"
                  />
                </AreaChart>
              ) : (
                <BarChart
                  data={weeklyPerformanceData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey={timeframeMode === 'weeks' ? 'name' : 'label'}
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#3f3f46' }}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatShortVND}
                  />
                  <Tooltip content={<CustomWeeklyTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                    formatter={(value) => <span className="text-zinc-300 font-bold">{value}</span>}
                  />
                  <ReferenceLine
                    y={weeklyBudgetQuota}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Định mức: ${formatShortVND(weeklyBudgetQuota)}`,
                      fill: '#fbbf24',
                      fontSize: 10,
                      position: 'insideTopRight'
                    }}
                  />
                  <Bar dataKey="expense" name="Chi tiêu" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="income" name="Thu nhập" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Insight Card */}
          <div className="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
              <Sparkles size={16} />
            </div>
            <div className="space-y-1">
              <span className="font-bold text-white">Nhận xét tốc độ chi tiêu tuần:</span>
              <p className="text-zinc-400 leading-relaxed">
                {peakWeek && peakWeek.expense > weeklyBudgetQuota ? (
                  <>
                    ⚠️ <strong className="text-rose-300">{peakWeek.name}</strong> là tuần có mức chi tiêu cao nhất ({formatVND(peakWeek.expense)}), vượt định mức tuần ({formatVND(weeklyBudgetQuota)}). Hãy phân bổ lại các khoản chi không cấp bách sang tuần tiếp theo.
                  </>
                ) : (
                  <>
                    ✅ Tiến độ giải ngân các tuần đều nằm trong tầm kiểm soát an toàn. Dòng tiền thặng dư dự kiến đạt <strong>{formatVND(Math.max(netSavings, 0))}</strong> để bổ sung vào quỹ tiết kiệm.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 2: BUDGET PROGRESS & BURN-DOWN
      ========================================== */}
      {activeTab === 'budget_progress' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Target size={15} className="text-emerald-400" />
                So Sánh Hạn Mức Ngân Sách vs Thực Chi Từng Danh Mục
              </h4>
              <p className="text-[11px] text-zinc-400">
                Thanh màu thể hiện mức độ hấp thụ hạn mức (Xanh: An toàn &lt;80%, Vàng: Cảnh báo 80-99%, Đỏ: Bội chi &gt;=100%)
              </p>
            </div>
          </div>

          {/* Horizontal Bar Chart for Category Budgets */}
          <div className="p-4 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 min-h-[340px]">
            <ResponsiveContainer width="100%" height={320} minWidth={100} minHeight={250}>
              <BarChart
                layout="vertical"
                data={categoryBudgetData.slice(0, 8)}
                margin={{ top: 10, right: 25, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatShortVND}
                />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  stroke="#e4e4e7"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                  width={80}
                />
                <Tooltip content={<CustomBudgetTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }}
                  formatter={(value) => <span className="text-zinc-300 font-bold">{value}</span>}
                />
                <Bar dataKey="spent" name="Đã thực chi" radius={[0, 6, 6, 0]} maxBarSize={16}>
                  {categoryBudgetData.slice(0, 8).map((entry, index) => (
                    <Cell key={`cell-spent-${index}`} fill={entry.statusColor} />
                  ))}
                </Bar>
                <Bar dataKey="limit" name="Hạn mức kế hoạch" fill="#3f3f46" radius={[0, 6, 6, 0]} maxBarSize={16} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cumulative Budget Burn-Down Trajectory */}
          <div className="p-5 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-cyan-400" />
                Đường Đốt Ngân Sách Tích Lũy (Cumulative Burn Rate)
              </h5>
              <span className="text-[11px] text-zinc-400 font-mono">
                Mục tiêu tháng: {formatShortVND(monthlyLimit)}
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={weeklyPerformanceData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} tickFormatter={formatShortVND} />
                  <Tooltip
                    formatter={(value: any, name: any) => [formatVND(Number(value)), name === 'cumulativeExpense' ? 'Chi tiêu lũy kế' : 'Ngân sách kế hoạch']}
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#3f3f46', borderRadius: '12px', fontSize: '11px' }}
                  />
                  <Line
                    type="linear"
                    dataKey="plannedBurn"
                    name="Hạn mức lũy kế lý tưởng"
                    stroke="#71717a"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativeExpense"
                    name="Thực chi lũy kế"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.15}
                    strokeWidth={2.5}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 3: CATEGORY PIE / DONUT RECHARTS
      ========================================== */}
      {activeTab === 'category_pie' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Donut Chart Canvas */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center p-4 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 min-h-[300px] relative">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`donut-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [formatVND(Number(val)), name]}
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#3f3f46', borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Display */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Tổng chi</span>
              <span className="text-sm font-black text-white">{formatShortVND(totalExpense)}</span>
            </div>
          </div>

          {/* Category Share List */}
          <div className="lg:col-span-6 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {categoryPieData.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                Chưa có dữ liệu chi tiêu trong tháng này.
              </div>
            ) : (
              categoryPieData.map((cat, idx) => {
                const pct = totalExpense > 0 ? Math.round((cat.value / totalExpense) * 100) : 0;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/70 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="font-bold text-zinc-200">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-rose-300">{formatVND(cat.value)}</span>
                      <span className="text-[10px] font-bold text-zinc-400 ml-2">({pct}%)</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
