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
  Scale
} from 'lucide-react';
import { FinanceWallet, FinanceTransaction, FinanceBudget } from '../../types';

interface FinanceOverviewCardsProps {
  wallets: FinanceWallet[];
  transactions: FinanceTransaction[];
  budget?: FinanceBudget;
  selectedMonth: string; // YYYY-MM
  onOpenWallets: () => void;
  onOpenBudget: () => void;
  onOpenAiAdvisor: () => void;
}

export function FinanceOverviewCards({
  wallets,
  transactions,
  budget,
  selectedMonth,
  onOpenWallets,
  onOpenBudget,
  onOpenAiAdvisor
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
          className="group relative p-5 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 hover:border-rose-500/50 shadow-xl transition-all overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
              <ArrowUpRight size={15} className="text-rose-400" />
              Tổng Chi Tiêu Tháng
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
              Dòng Tiền Ra
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-rose-400 tracking-tight">
              -{formatVND(totalExpense)}
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1">
              Ăn uống, sinh hoạt, mua sắm &amp; hóa đơn
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
          className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-teal-950/20 to-zinc-900 border border-emerald-500/30 hover:border-emerald-400/60 shadow-xl transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl group-hover:bg-emerald-400/20 transition-all pointer-events-none" />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles size={11} className="text-emerald-400" />
                AI Smart Advisor
              </span>
              <span className="text-[10px] text-zinc-400 font-semibold">Quy tắc 50/30/20</span>
            </div>
            <h4 className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors pt-1">
              Phân Tích Sức Khỏe Tài Chính
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
              Nhận tư vấn thông minh, phân bổ dòng tiền và mẹo tiết kiệm cá nhân hóa theo thói quen chi tiêu của bạn.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
            <span>Bắt đầu phân tích AI</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </div>
    </div>
  );
}
