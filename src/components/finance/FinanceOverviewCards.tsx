import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Award,
  ChevronRight,
  Mic,
  Flame
} from 'lucide-react';
import { FinanceWallet, FinanceTransaction, FinanceBudget, FinanceAchievementBadge } from '../../types';

interface FinanceOverviewCardsProps {
  wallets: FinanceWallet[];
  transactions: FinanceTransaction[];
  budget?: FinanceBudget;
  selectedMonth: string; // YYYY-MM
  badges?: FinanceAchievementBadge[];
  onOpenWallets: () => void;
  onOpenBudget: () => void;
  onOpenAiAdvisor: () => void;
  onOpenAchievements?: () => void;
  onOpenVoiceExpense?: () => void;
  onOpenHeatmap?: () => void;
}

export function FinanceOverviewCards({
  wallets,
  transactions,
  budget,
  selectedMonth,
  badges = [],
  onOpenWallets,
  onOpenBudget,
  onOpenAiAdvisor,
  onOpenAchievements,
  onOpenVoiceExpense,
  onOpenHeatmap
}: FinanceOverviewCardsProps) {
  // Format VND currency
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Filter transactions by selected month
  const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));

  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Total balance across all non-excluded wallets
  const totalBalance = wallets
    .filter(w => !w.isExcludedFromTotal)
    .reduce((sum, w) => sum + w.balance, 0);

  // Budget progress
  const monthlyLimit = budget?.totalMonthlyLimit || 15000000;
  const budgetSpentPercent = Math.min(Math.round((totalExpense / monthlyLimit) * 100), 200);
  const isBudgetWarning = budgetSpentPercent >= (budget?.alertThresholdPercent || 80);
  const isBudgetOver = totalExpense > monthlyLimit;

  return (
    <div className="space-y-6">
      {/* Top Banner Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Net Worth */}
        <div 
          onClick={onOpenWallets}
          className="group relative p-5 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 hover:border-emerald-500/50 shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
              <Wallet size={15} className="text-emerald-400" />
              Tổng Tài Sản Khả Dụng
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              {wallets.length} Ví
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-emerald-300 transition-colors">
              {formatVND(totalBalance)}
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
              <span>Bao gồm tiền mặt, ngân hàng &amp; ví điện tử</span>
            </p>
          </div>
        </div>

        {/* 2. Monthly Income */}
        <div 
          className="group relative p-5 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 hover:border-teal-500/50 shadow-xl transition-all overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
              <ArrowDownRight size={15} className="text-teal-400" />
              Tổng Thu Nhập Tháng
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
              Dòng Tiền Vào
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-teal-400 tracking-tight">
              +{formatVND(totalIncome)}
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1">
              Lương, thưởng, kinh doanh &amp; sáng tác
            </p>
          </div>
        </div>

        {/* 3. Monthly Expense */}
        <div 
          onClick={onOpenHeatmap || onOpenBudget}
          className="group relative p-5 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 hover:border-rose-500/50 shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
          title="Bấm để xem Bản đồ nhiệt chi tiêu 30 ngày (D3.js)"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
              <ArrowUpRight size={15} className="text-rose-400" />
              Tổng Chi Tiêu Tháng
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center gap-1 group-hover:bg-rose-500/20 transition-colors">
              <Flame size={10} className="text-amber-400 animate-pulse" />
              Xem Heatmap
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-rose-400 tracking-tight">
              -{formatVND(totalExpense)}
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between">
              <span>Ăn uống, sinh hoạt, mua sắm &amp; hóa đơn</span>
              <span className="text-rose-300 font-bold hidden group-hover:inline text-[10px]">D3.js →</span>
            </p>
          </div>
        </div>

        {/* 4. Net Savings & Rate */}
        <div 
          onClick={onOpenBudget}
          className="group relative p-5 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 hover:border-cyan-500/50 shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
              <PiggyBank size={15} className="text-cyan-400" />
              Tích Lũy / Tiết Kiệm Ròng
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
              netSavings >= 0 
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
            }`}>
              {savingsRate}% Thu Nhập
            </span>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-black tracking-tight ${netSavings >= 0 ? 'text-cyan-300' : 'text-rose-400'}`}>
              {netSavings >= 0 ? `+${formatVND(netSavings)}` : formatVND(netSavings)}
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1">
              Dòng tiền thực tế sau khi trừ chi tiêu
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Budget Progress & AI Smart Insight Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Budget Gauge */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-amber-400" />
              <span className="text-sm font-black text-white">Hạn Mức Ngân Sách Tháng {selectedMonth}</span>
            </div>
            <button
              onClick={onOpenBudget}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Thiết lập ngân sách →
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-zinc-300 font-medium">
                Đã tiêu <strong className="text-white font-bold">{formatVND(totalExpense)}</strong> / {formatVND(monthlyLimit)}
              </span>
              <span className={`font-extrabold ${isBudgetOver ? 'text-rose-400' : isBudgetWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                {budgetSpentPercent}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-3.5 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isBudgetOver 
                    ? 'bg-gradient-to-r from-rose-600 to-red-500' 
                    : isBudgetWarning 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                    : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400'
                }`}
                style={{ width: `${Math.min(budgetSpentPercent, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
            <div className="flex items-center gap-1.5">
              {isBudgetOver ? (
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <AlertTriangle size={13} /> Đã vượt ngân sách {formatVND(totalExpense - monthlyLimit)}!
                </span>
              ) : isBudgetWarning ? (
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <AlertTriangle size={13} /> Sắp chạm trần ngân sách (còn lại {formatVND(monthlyLimit - totalExpense)})
                </span>
              ) : (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck size={13} /> Ngân sách an toàn (còn lại {formatVND(monthlyLimit - totalExpense)})
                </span>
              )}
            </div>
            <span>Khuyến nghị chi tối đa: {formatVND(Math.max(0, Math.round((monthlyLimit - totalExpense) / 10)))} / ngày</span>
          </div>
        </div>

        {/* Right 1 Col: AI Advisor Shortcut Banner */}
        <div 
          onClick={onOpenAiAdvisor}
          className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/40 via-orange-950/20 to-zinc-900 border border-amber-500/30 hover:border-amber-400/60 shadow-xl transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-all pointer-events-none" />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                Gemini 3.7 Flash AI
              </span>
              <span className="text-[10px] text-zinc-400 font-semibold">6 Hũ Tiền</span>
            </div>
            <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors pt-1">
              Phân Tích Chi Tiêu &amp; Dự Báo 6 Hũ
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
              Gemini AI nhận diện thói quen chi tiêu, phát hiện điểm rò rỉ dòng tiền và dự báo phân bổ ngân sách 6 hũ tiền tháng tới.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
            <span>Bắt đầu phân tích AI</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </div>

      {/* Voice Expense Quick Action Banner */}
      {onOpenVoiceExpense && (
        <div 
          onClick={onOpenVoiceExpense}
          className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-teal-950/50 border border-emerald-500/40 hover:border-emerald-400 shadow-xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform shrink-0">
              <Mic size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                  Ghi Chép Chi Tiêu Siêu Tốc Bằng Giọng Nói
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Nhận Diện Tiếng Việt
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Chỉ cần đọc: <span className="text-zinc-200 font-semibold">"Ăn sáng 45k"</span>, <span className="text-zinc-200 font-semibold">"Đổ xăng 70 nghìn ví tiền mặt"</span>... Hệ thống tự động phân loại 6 Hũ và trừ số dư ví.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 group-hover:from-emerald-400 group-hover:to-teal-300 text-zinc-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <span>Nói Ngay</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      )}

      {/* Achievement Badges Milestone Quick Strip */}
      {badges.length > 0 && onOpenAchievements && (
        <div 
          onClick={onOpenAchievements}
          className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 hover:border-amber-500/40 shadow-xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 group-hover:scale-105 transition-transform shrink-0">
              <Award size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white group-hover:text-amber-300 transition-colors">
                  Cột Mốc &amp; Huy Hiệu Tài Chính
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {badges.filter(b => b.isUnlocked).length}/{badges.length} Đã Mở Khóa
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Chinh phục <span className="text-emerald-400 font-bold">Master Saver</span>, <span className="text-cyan-400 font-bold">Budget Ninja</span> &amp; nhận thưởng Xu Haevy.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="flex items-center -space-x-2">
              {badges.slice(0, 4).map((b) => (
                <div 
                  key={b.id}
                  title={`${b.title} (${b.isUnlocked ? 'Đã đạt' : 'Đang chinh phục'})`}
                  className={`w-7 h-7 rounded-full border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold shadow-md transition-transform group-hover:scale-110 ${
                    b.isUnlocked 
                      ? 'bg-gradient-to-tr from-amber-500 to-emerald-400 text-zinc-950 ring-1 ring-amber-400/50' 
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {b.isUnlocked ? '★' : '•'}
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Xem huy hiệu <ChevronRight size={14} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
