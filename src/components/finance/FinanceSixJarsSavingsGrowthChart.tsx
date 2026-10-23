import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  Sparkles,
  Info,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Eye,
  EyeOff,
  ShoppingBag,
  Landmark,
  GraduationCap,
  Gamepad2,
  HeartHandshake,
  PiggyBank,
  Flame,
  Zap,
  RefreshCw
} from 'lucide-react';
import { FinanceTransaction, FinanceCategory, FinanceBudget } from '../../types';

interface FinanceSixJarsSavingsGrowthChartProps {
  transactions: FinanceTransaction[];
  categories: FinanceCategory[];
  budget?: FinanceBudget;
  className?: string;
  onOpenAiAdvisor?: () => void;
}

// 6 Jars Meta Constants matching T. Harv Eker System
export const SIX_JARS_CONFIG = [
  {
    id: 'ffa',
    key: 'ffa',
    code: 'FFA',
    name: 'Tự Do Tài Chính (FFA)',
    shortName: 'Tự Do Tài Chính',
    pct: 10,
    color: '#f59e0b', // Amber / Gold
    accentColor: '#fbbf24',
    icon: TrendingUp,
    desc: 'Đầu tư sinh lời, chứng khoán, bất động sản, tài sản tạo dòng tiền',
    categoryIds: ['cat_invest'],
    isPureSavings: true,
  },
  {
    id: 'ltss',
    key: 'ltss',
    code: 'LTSS',
    name: 'Tiết Kiệm Dài Hạn (LTSS)',
    shortName: 'Tiết Kiệm Dài Hạn',
    pct: 10,
    color: '#10b981', // Emerald
    accentColor: '#34d399',
    icon: Landmark,
    desc: 'Quỹ khẩn cấp, mua nhà/xe, bảo hiểm tích lũy, chi tiêu lớn tương lai',
    categoryIds: ['cat_savings', 'cat_insurance'],
    isPureSavings: true,
  },
  {
    id: 'nec',
    key: 'nec',
    code: 'NEC',
    name: 'Chi Tiêu Cần Thiết (NEC)',
    shortName: 'Cần Thiết',
    pct: 55,
    color: '#0ea5e9', // Sky Blue
    accentColor: '#38bdf8',
    icon: ShoppingBag,
    desc: 'Ăn uống, thuê nhà, xăng xe, hóa đơn điện nước, chăm sóc sức khỏe',
    categoryIds: ['cat_food', 'cat_rent', 'cat_groceries', 'cat_bills', 'cat_transport', 'cat_health'],
    isPureSavings: false,
  },
  {
    id: 'edu',
    key: 'edu',
    code: 'EDU',
    name: 'Giáo Dục & Bản Thân (EDU)',
    shortName: 'Giáo Dục',
    pct: 10,
    color: '#8b5cf6', // Violet / Purple
    accentColor: '#a78bfa',
    icon: GraduationCap,
    desc: 'Sách, khóa học nâng cao năng lực, kỹ năng và tư duy',
    categoryIds: ['cat_education'],
    isPureSavings: false,
  },
  {
    id: 'play',
    key: 'play',
    code: 'PLAY',
    name: 'Hưởng Thụ & Thư Giãn (PLAY)',
    shortName: 'Hưởng Thụ',
    pct: 10,
    color: '#f43f5e', // Rose / Pink
    accentColor: '#fb7185',
    icon: Gamepad2,
    desc: 'Giải trí, cà phê, du lịch, mua sắm phục hồi năng lượng',
    categoryIds: ['cat_entertainment', 'cat_shopping', 'cat_couple_date'],
    isPureSavings: false,
  },
  {
    id: 'give',
    key: 'give',
    code: 'GIVE',
    name: 'Cho Đi & Thiện Nguyện (GIVE)',
    shortName: 'Cho Đi',
    pct: 5,
    color: '#ea580c', // Orange / Coral
    accentColor: '#fb923c',
    icon: HeartHandshake,
    desc: 'Biếu bố mẹ, từ thiện, quà mừng hiếu hỷ người thân',
    categoryIds: ['cat_gifts'],
    isPureSavings: false,
  },
];

export interface DailyJarGrowthDataPoint {
  date: string; // YYYY-MM-DD
  dayLabel: string; // DD/MM
  dayIndex: number;
  fullDate: string; // DD/MM/YYYY
  // Cumulative Net Balance for each Jar (VND)
  ffa: number;
  ltss: number;
  nec: number;
  edu: number;
  play: number;
  give: number;
  // Summary Aggregates
  pureSavingsTotal: number; // FFA + LTSS
  totalNetWealth: number; // Sum of all 6 jars
  // Daily changes
  dailyIncome: number;
  dailyExpense: number;
  dailyNetSavings: number;
  dailyFfa: number;
  dailyLtss: number;
  dailyNec: number;
  dailyEdu: number;
  dailyPlay: number;
  dailyGive: number;
}

export function FinanceSixJarsSavingsGrowthChart({
  transactions,
  categories,
  budget,
  className = '',
  onOpenAiAdvisor,
}: FinanceSixJarsSavingsGrowthChartProps) {
  // View mode:
  // 'pure_savings': FFA (Financial Freedom) & LTSS (Long-Term Savings)
  // 'all_jars': All 6 jars individual growth lines
  // 'total_wealth': Total cumulative 6-jar net savings line with area fill
  // 'daily_flow': Daily net change rate (+/-)
  const [viewMode, setViewMode] = useState<'pure_savings' | 'all_jars' | 'total_wealth' | 'daily_flow'>('pure_savings');

  // Individual Jar visibility filter state
  const [visibleJars, setVisibleJars] = useState<Record<string, boolean>>({
    ffa: true,
    ltss: true,
    nec: true,
    edu: true,
    play: true,
    give: true,
  });

  const toggleJarVisibility = (jarKey: string) => {
    setVisibleJars(prev => ({
      ...prev,
      [jarKey]: !prev[jarKey],
    }));
  };

  const setAllJarsVisible = (visible: boolean) => {
    setVisibleJars({
      ffa: visible,
      ltss: visible,
      nec: visible,
      edu: visible,
      play: visible,
      give: visible,
    });
  };

  // Currency formatters
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatShortVND = (amount: number) => {
    if (Math.abs(amount) >= 1_000_000_000) {
      return `${(amount / 1_000_000_000).toFixed(1)}Tỷ`;
    }
    if (Math.abs(amount) >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}Tr`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `${(amount / 1_000).toFixed(0)}k`;
    }
    return `${amount}₫`;
  };

  // Build the 30-day timeline array ending at today (or latest transaction)
  const thirtyDaysData: DailyJarGrowthDataPoint[] = useMemo(() => {
    // Reference end date: today
    const now = new Date();
    const days: string[] = [];

    // Generate 30 consecutive ISO date strings (YYYY-MM-DD)
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      days.push(iso);
    }

    // Map categories to jar keys for fast lookup
    const catToJarMap: Record<string, string> = {};
    SIX_JARS_CONFIG.forEach(jar => {
      jar.categoryIds.forEach(cid => {
        catToJarMap[cid] = jar.key;
      });
    });

    // Group transactions by date
    const txByDate: Record<string, FinanceTransaction[]> = {};
    transactions.forEach(t => {
      if (!t.date) return;
      const dateKey = t.date.slice(0, 10);
      if (!txByDate[dateKey]) txByDate[dateKey] = [];
      txByDate[dateKey].push(t);
    });

    // Cumulative running balances
    let runFfa = 0;
    let runLtss = 0;
    let runNec = 0;
    let runEdu = 0;
    let runPlay = 0;
    let runGive = 0;

    // First, calculate any baseline prior to the 30-day window so chart reflects true wealth state
    const startDate = days[0];
    transactions.forEach(t => {
      if (!t.date || t.date >= startDate) return; // Only process prior transactions for baseline
      if (t.type === 'income') {
        runNec += (t.amount * 55) / 100;
        runFfa += (t.amount * 10) / 100;
        runLtss += (t.amount * 10) / 100;
        runEdu += (t.amount * 10) / 100;
        runPlay += (t.amount * 10) / 100;
        runGive += (t.amount * 5) / 100;
      } else if (t.type === 'expense') {
        const targetJar = catToJarMap[t.categoryId] || 'nec';
        if (targetJar === 'ffa') runFfa -= t.amount;
        else if (targetJar === 'ltss') runLtss -= t.amount;
        else if (targetJar === 'edu') runEdu -= t.amount;
        else if (targetJar === 'play') runPlay -= t.amount;
        else if (targetJar === 'give') runGive -= t.amount;
        else runNec -= t.amount;
      }
    });

    // Now iterate through the 30 days
    return days.map((dateStr, idx) => {
      const [year, month, day] = dateStr.split('-');
      const dayLabel = `${day}/${month}`;
      const fullDate = `${day}/${month}/${year}`;

      const dayTxs = txByDate[dateStr] || [];

      let dInc = 0;
      let dExp = 0;
      let dFfa = 0;
      let dLtss = 0;
      let dNec = 0;
      let dEdu = 0;
      let dPlay = 0;
      let dGive = 0;

      dayTxs.forEach(t => {
        if (t.type === 'income') {
          dInc += t.amount;
          // Allocate income to 6 jars
          const addNec = (t.amount * 55) / 100;
          const addFfa = (t.amount * 10) / 100;
          const addLtss = (t.amount * 10) / 100;
          const addEdu = (t.amount * 10) / 100;
          const addPlay = (t.amount * 10) / 100;
          const addGive = (t.amount * 5) / 100;

          dNec += addNec;
          dFfa += addFfa;
          dLtss += addLtss;
          dEdu += addEdu;
          dPlay += addPlay;
          dGive += addGive;

          runNec += addNec;
          runFfa += addFfa;
          runLtss += addLtss;
          runEdu += addEdu;
          runPlay += addPlay;
          runGive += addGive;
        } else if (t.type === 'expense') {
          dExp += t.amount;
          const targetJar = catToJarMap[t.categoryId] || 'nec';

          if (targetJar === 'ffa') {
            dFfa -= t.amount;
            runFfa -= t.amount;
          } else if (targetJar === 'ltss') {
            dLtss -= t.amount;
            runLtss -= t.amount;
          } else if (targetJar === 'edu') {
            dEdu -= t.amount;
            runEdu -= t.amount;
          } else if (targetJar === 'play') {
            dPlay -= t.amount;
            runPlay -= t.amount;
          } else if (targetJar === 'give') {
            dGive -= t.amount;
            runGive -= t.amount;
          } else {
            dNec -= t.amount;
            runNec -= t.amount;
          }
        }
      });

      const pureSavingsTotal = runFfa + runLtss;
      const totalNetWealth = runFfa + runLtss + runNec + runEdu + runPlay + runGive;

      return {
        date: dateStr,
        dayLabel,
        dayIndex: idx + 1,
        fullDate,
        ffa: Math.round(runFfa),
        ltss: Math.round(runLtss),
        nec: Math.round(runNec),
        edu: Math.round(runEdu),
        play: Math.round(runPlay),
        give: Math.round(runGive),
        pureSavingsTotal: Math.round(pureSavingsTotal),
        totalNetWealth: Math.round(totalNetWealth),
        dailyIncome: dInc,
        dailyExpense: dExp,
        dailyNetSavings: dInc - dExp,
        dailyFfa: Math.round(dFfa),
        dailyLtss: Math.round(dLtss),
        dailyNec: Math.round(dNec),
        dailyEdu: Math.round(dEdu),
        dailyPlay: Math.round(dPlay),
        dailyGive: Math.round(dGive),
      };
    });
  }, [transactions]);

  // Summary Metrics over the 30-day window
  const summaryMetrics = useMemo(() => {
    if (thirtyDaysData.length === 0) {
      return {
        startSavings: 0,
        currentSavings: 0,
        netSavingsGrowth: 0,
        growthRatePct: 0,
        currentFfa: 0,
        ffaGrowth: 0,
        currentLtss: 0,
        ltssGrowth: 0,
        totalIncome30d: 0,
        totalExpense30d: 0,
        avgDailySavings: 0,
        topJar: null,
      };
    }

    const first = thirtyDaysData[0];
    const last = thirtyDaysData[thirtyDaysData.length - 1];

    const startSavings = first.pureSavingsTotal;
    const currentSavings = last.pureSavingsTotal;
    const netSavingsGrowth = currentSavings - startSavings;

    const growthRatePct = startSavings !== 0 
      ? Math.round((netSavingsGrowth / Math.abs(startSavings)) * 100) 
      : (netSavingsGrowth > 0 ? 100 : 0);

    const ffaGrowth = last.ffa - first.ffa;
    const ltssGrowth = last.ltss - first.ltss;

    const totalIncome30d = thirtyDaysData.reduce((sum, d) => sum + d.dailyIncome, 0);
    const totalExpense30d = thirtyDaysData.reduce((sum, d) => sum + d.dailyExpense, 0);
    const avgDailySavings = Math.round(netSavingsGrowth / 30);

    // Identify top growing jar in 30 days
    const jarGrowths = [
      { name: 'Tự Do Tài Chính (FFA)', key: 'ffa', growth: ffaGrowth, color: '#f59e0b', icon: TrendingUp },
      { name: 'Tiết Kiệm Dài Hạn (LTSS)', key: 'ltss', growth: ltssGrowth, color: '#10b981', icon: Landmark },
      { name: 'Giáo Dục (EDU)', key: 'edu', growth: last.edu - first.edu, color: '#8b5cf6', icon: GraduationCap },
      { name: 'Cần Thiết (NEC)', key: 'nec', growth: last.nec - first.nec, color: '#0ea5e9', icon: ShoppingBag },
    ];
    jarGrowths.sort((a, b) => b.growth - a.growth);

    return {
      startSavings,
      currentSavings,
      netSavingsGrowth,
      growthRatePct,
      currentFfa: last.ffa,
      ffaGrowth,
      currentLtss: last.ltss,
      ltssGrowth,
      totalIncome30d,
      totalExpense30d,
      avgDailySavings,
      topJar: jarGrowths[0],
    };
  }, [thirtyDaysData]);

  // Custom Interactive Tooltip
  const CustomGrowthTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data: DailyJarGrowthDataPoint = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="p-4 rounded-2xl bg-zinc-950/95 border border-zinc-700 shadow-2xl backdrop-blur-md text-xs space-y-2.5 min-w-[240px] pointer-events-none z-50">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-1.5 font-black text-white">
            <Calendar size={13} className="text-amber-400" />
            <span>Ngày {data.fullDate}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
            Ngày {data.dayIndex}/30
          </span>
        </div>

        {/* Master Metrics for the day */}
        <div className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-300">
            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
              <PiggyBank size={12} />
              Quỹ Tiết Kiệm (FFA+LTSS):
            </span>
            <span className="font-black text-amber-300">{formatVND(data.pureSavingsTotal)}</span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-0.5 border-t border-zinc-800/60">
            <span>Biến động thu chi ngày:</span>
            <span className={`font-mono font-bold ${data.dailyNetSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data.dailyNetSavings >= 0 ? `+${formatVND(data.dailyNetSavings)}` : formatVND(data.dailyNetSavings)}
            </span>
          </div>
        </div>

        {/* Jars Breakdown */}
        <div className="space-y-1 pt-1">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Chi tiết số dư 6 hũ:
          </div>

          {SIX_JARS_CONFIG.map(jar => {
            const amount = (data as any)[jar.key] || 0;
            const isVisible = visibleJars[jar.key];
            if (!isVisible && viewMode !== 'all_jars') return null;

            return (
              <div key={jar.key} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: jar.color }} />
                  <span className="text-zinc-300">{jar.shortName}:</span>
                </div>
                <span className="font-mono font-bold text-white">{formatVND(amount)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Banner Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-900/90 border border-emerald-500/30 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-amber-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-inner">
            <TrendingUp size={24} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-white">
                Biểu Đồ Đường Tăng Trưởng 6 Hũ Tiền (Recharts 30 Ngày)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400 text-black font-extrabold uppercase tracking-wider">
                30 Days Growth
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Theo dõi quỹ đạo tích lũy tài sản &amp; tốc độ tăng trưởng của từng hũ tài chính trong 30 ngày qua
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 flex-wrap self-stretch lg:self-auto">
          <div className="flex items-center p-1 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs font-bold overflow-x-auto no-scrollbar">
            <button
              onClick={() => setViewMode('pure_savings')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'pure_savings'
                  ? 'bg-emerald-500 text-black shadow-md font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <PiggyBank size={13} />
              <span>Quỹ Tiết Kiệm (FFA &amp; LTSS)</span>
            </button>

            <button
              onClick={() => setViewMode('all_jars')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'all_jars'
                  ? 'bg-amber-400 text-black shadow-md font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers size={13} />
              <span>Đầy Đủ 6 Hũ</span>
            </button>

            <button
              onClick={() => setViewMode('total_wealth')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'total_wealth'
                  ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-black shadow-md font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ShieldCheck size={13} />
              <span>Tổng Tài Sản Ròng</span>
            </button>

            <button
              onClick={() => setViewMode('daily_flow')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'daily_flow'
                  ? 'bg-indigo-500 text-white shadow-md font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Zap size={13} />
              <span>Dòng Tiền Từng Ngày</span>
            </button>
          </div>

          {onOpenAiAdvisor && (
            <button
              onClick={onOpenAiAdvisor}
              className="px-3.5 py-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Nhờ Gemini AI phân tích quỹ đạo tiết kiệm 30 ngày"
            >
              <Sparkles size={13} />
              <span className="hidden sm:inline">AI Cố Vấn 30 Ngày</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Highlight Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 30-Day Net Savings Growth */}
        <div className="p-4 rounded-3xl bg-zinc-950/80 border border-emerald-500/30 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <PiggyBank size={14} className="text-emerald-400" />
              Tăng Trưởng Tiết Kiệm 30 Ngày
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-black flex items-center gap-0.5 ${
              summaryMetrics.netSavingsGrowth >= 0
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {summaryMetrics.netSavingsGrowth >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              {summaryMetrics.growthRatePct}%
            </span>
          </div>

          <div className="text-xl sm:text-2xl font-black text-white">
            {formatVND(summaryMetrics.netSavingsGrowth)}
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
            <span>Số dư quỹ hiện tại:</span>
            <span className="font-bold text-emerald-400">{formatVND(summaryMetrics.currentSavings)}</span>
          </div>
        </div>

        {/* Card 2: FFA Financial Freedom Jar */}
        <div className="p-4 rounded-3xl bg-zinc-950/80 border border-amber-500/30 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <TrendingUp size={14} className="text-amber-400" />
              Hũ Tự Do Tài Chính (FFA 10%)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
              Đầu tư
            </span>
          </div>

          <div className="text-xl sm:text-2xl font-black text-white">
            {formatVND(summaryMetrics.currentFfa)}
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
            <span>Tăng trong 30 ngày:</span>
            <span className="font-bold text-amber-400">+{formatVND(summaryMetrics.ffaGrowth)}</span>
          </div>
        </div>

        {/* Card 3: LTSS Long-Term Savings Jar */}
        <div className="p-4 rounded-3xl bg-zinc-950/80 border border-teal-500/30 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Landmark size={14} className="text-teal-400" />
              Hũ Tiết Kiệm Dài Hạn (LTSS 10%)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30 font-bold">
              Quỹ khẩn cấp
            </span>
          </div>

          <div className="text-xl sm:text-2xl font-black text-white">
            {formatVND(summaryMetrics.currentLtss)}
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
            <span>Tăng trong 30 ngày:</span>
            <span className="font-bold text-teal-400">+{formatVND(summaryMetrics.ltssGrowth)}</span>
          </div>
        </div>

        {/* Card 4: Daily Average Accumulation Pace */}
        <div className="p-4 rounded-3xl bg-zinc-950/80 border border-zinc-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Flame size={14} className="text-orange-400" />
              Tốc Độ Tích Lũy / Ngày
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold">
              30N Avg
            </span>
          </div>

          <div className="text-xl sm:text-2xl font-black text-white">
            {formatVND(summaryMetrics.avgDailySavings)}/ngày
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
            <span>Hũ tăng nhanh nhất:</span>
            <span className="font-bold text-amber-300 flex items-center gap-1">
              {summaryMetrics.topJar ? summaryMetrics.topJar.name.split('(')[0].trim() : 'FFA'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Recharts Card */}
      <div className="p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl space-y-5">
        {/* Interactive Filter Pills: Select which Jars to show on the Line Chart */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
              <Filter size={12} />
              Hiển thị đường:
            </span>

            {SIX_JARS_CONFIG.map(jar => {
              const Icon = jar.icon;
              const isVisible = visibleJars[jar.key];

              return (
                <button
                  key={jar.key}
                  type="button"
                  onClick={() => toggleJarVisibility(jar.key)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isVisible
                      ? 'bg-zinc-800/90 text-white shadow-sm'
                      : 'bg-zinc-950 text-zinc-600 border-zinc-900 opacity-60'
                  }`}
                  style={{
                    borderColor: isVisible ? jar.color : '#27272a',
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: isVisible ? jar.color : '#52525b' }}
                  />
                  <span>{jar.code}</span>
                  <span className="text-[10px] text-zinc-400">{jar.pct}%</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setAllJarsVisible(true)}
              className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Hiện tất cả
            </button>
            <span className="text-zinc-700">|</span>
            <button
              onClick={() => {
                setVisibleJars({
                  ffa: true,
                  ltss: true,
                  nec: false,
                  edu: false,
                  play: false,
                  give: false,
                });
              }}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              Chỉ Quỹ Tiết Kiệm (FFA/LTSS)
            </button>
          </div>
        </div>

        {/* Recharts Chart Canvas */}
        <div className="w-full h-[380px] sm:h-[420px] select-none">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'total_wealth' ? (
              <ComposedChart data={thirtyDaysData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="dayLabel"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={formatShortVND}
                  width={60}
                />
                <Tooltip content={<CustomGrowthTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ fontSize: '11px', fontWeight: '700' }}
                />
                <ReferenceLine y={0} stroke="#3f3f46" strokeDasharray="2 2" />

                <Area
                  type="monotone"
                  dataKey="totalNetWealth"
                  name="Tổng Giá Trị Ròng 6 Hũ"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#wealthGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="pureSavingsTotal"
                  name="Quỹ Tiết Kiệm Thuần (FFA + LTSS)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                  activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                />
              </ComposedChart>
            ) : viewMode === 'daily_flow' ? (
              <LineChart data={thirtyDaysData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="dayLabel"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={formatShortVND}
                  width={60}
                />
                <Tooltip content={<CustomGrowthTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ fontSize: '11px', fontWeight: '700' }}
                />
                <ReferenceLine y={0} stroke="#52525b" strokeWidth={1.5} />

                <Line
                  type="monotone"
                  dataKey="dailyNetSavings"
                  name="Thu Nhập - Chi Tiêu Ngày"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="dailyFfa"
                  name="Trích FFA Hôm Đó"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="dailyLtss"
                  name="Trích LTSS Hôm Đó"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            ) : (
              <LineChart data={thirtyDaysData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="dayLabel"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={formatShortVND}
                  width={60}
                />
                <Tooltip content={<CustomGrowthTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ fontSize: '11px', fontWeight: '700' }}
                />
                <ReferenceLine y={0} stroke="#3f3f46" strokeDasharray="2 2" />

                {/* Master Reference Line for Pure Savings */}
                <Line
                  type="monotone"
                  dataKey="pureSavingsTotal"
                  name="Tổng Quỹ Tiết Kiệm (FFA + LTSS)"
                  stroke="#facc15"
                  strokeWidth={3}
                  dot={{ r: 2 }}
                  activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                />

                {/* 6 Individual Jar Lines based on visibility state */}
                {visibleJars.ffa && (
                  <Line
                    type="monotone"
                    dataKey="ffa"
                    name="Tự Do Tài Chính (FFA - 10%)"
                    stroke="#f59e0b"
                    strokeWidth={2.2}
                    dot={{ r: 1.5 }}
                    activeDot={{ r: 5 }}
                  />
                )}

                {visibleJars.ltss && (
                  <Line
                    type="monotone"
                    dataKey="ltss"
                    name="Tiết Kiệm Dài Hạn (LTSS - 10%)"
                    stroke="#10b981"
                    strokeWidth={2.2}
                    dot={{ r: 1.5 }}
                    activeDot={{ r: 5 }}
                  />
                )}

                {visibleJars.nec && (
                  <Line
                    type="monotone"
                    dataKey="nec"
                    name="Chi Tiêu Cần Thiết (NEC - 55%)"
                    stroke="#0ea5e9"
                    strokeWidth={1.8}
                    dot={false}
                    strokeDasharray={viewMode === 'pure_savings' ? '3 3' : undefined}
                  />
                )}

                {visibleJars.edu && (
                  <Line
                    type="monotone"
                    dataKey="edu"
                    name="Giáo Dục (EDU - 10%)"
                    stroke="#8b5cf6"
                    strokeWidth={1.8}
                    dot={false}
                    strokeDasharray={viewMode === 'pure_savings' ? '3 3' : undefined}
                  />
                )}

                {visibleJars.play && (
                  <Line
                    type="monotone"
                    dataKey="play"
                    name="Hưởng Thụ (PLAY - 10%)"
                    stroke="#f43f5e"
                    strokeWidth={1.8}
                    dot={false}
                    strokeDasharray={viewMode === 'pure_savings' ? '3 3' : undefined}
                  />
                )}

                {visibleJars.give && (
                  <Line
                    type="monotone"
                    dataKey="give"
                    name="Cho Đi (GIVE - 5%)"
                    stroke="#ea580c"
                    strokeWidth={1.8}
                    dot={false}
                    strokeDasharray={viewMode === 'pure_savings' ? '3 3' : undefined}
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Bottom Legend & Harv Eker Rule Interpretation */}
        <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-400 gap-3">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-amber-400 shrink-0" />
            <span>
              Quỹ đạo 30 ngày tính từ thu nhập phân bổ theo tỷ lệ chuẩn 55/10/10/10/10/5 trừ đi chi phí từng nhóm danh mục.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-zinc-500 font-mono">
              30 ngày: {thirtyDaysData[0]?.dayLabel} ➔ {thirtyDaysData[thirtyDaysData.length - 1]?.dayLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
