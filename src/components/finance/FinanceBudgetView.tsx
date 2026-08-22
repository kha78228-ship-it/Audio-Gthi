import React, { useState } from 'react';
import { 
  Scale, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  PieChart, 
  Save, 
  Check, 
  Plus, 
  Sliders, 
  Info,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { FinanceBudget, FinanceCategory, FinanceTransaction } from '../../types';

interface FinanceBudgetViewProps {
  budget?: FinanceBudget;
  categories: FinanceCategory[];
  transactions: FinanceTransaction[];
  selectedMonth: string;
  onSaveBudget: (budgetData: Partial<FinanceBudget>) => void;
}

export function FinanceBudgetView({
  budget,
  categories,
  transactions,
  selectedMonth,
  onSaveBudget
}: FinanceBudgetViewProps) {
  const [monthlyLimit, setMonthlyLimit] = useState<number>(budget?.totalMonthlyLimit || 15000000);
  const [alertThreshold, setAlertThreshold] = useState<number>(budget?.alertThresholdPercent || 80);
  const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>(
    budget?.categoryLimits || {
      cat_food: 4500000,
      cat_rent: 6000000,
      cat_transport: 1200000,
      cat_bills: 1800000,
      cat_groceries: 3000000,
      cat_shopping: 2000000,
      cat_entertainment: 1500000,
      cat_couple_date: 2000000,
    }
  );
  const [savedToast, setSavedToast] = useState(false);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Filter transactions for month
  const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
  const totalExpense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Group spends by 50/30/20
  const essentialSpent = monthTransactions
    .filter(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      return cat?.group === 'essential' && t.type === 'expense';
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const lifestyleSpent = monthTransactions
    .filter(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      return cat?.group === 'lifestyle' && t.type === 'expense';
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsSpent = monthTransactions
    .filter(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      return cat?.group === 'savings_invest' && t.type === 'expense';
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate actual percentage of income or expense
  const basis = totalIncome > 0 ? totalIncome : (essentialSpent + lifestyleSpent + savingsSpent || 1);
  const essentialPct = Math.round((essentialSpent / basis) * 100);
  const lifestylePct = Math.round((lifestyleSpent / basis) * 100);
  const savingsPct = Math.round((savingsSpent / basis) * 100);

  const handleCategoryLimitChange = (catId: string, value: number) => {
    setCategoryLimits(prev => ({
      ...prev,
      [catId]: value
    }));
  };

  const handleSave = () => {
    onSaveBudget({
      month: selectedMonth,
      totalMonthlyLimit: monthlyLimit,
      alertThresholdPercent: alertThreshold,
      categoryLimits: categoryLimits
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 50/30/20 Rule Smart Breakdown Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <PieChart size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Khung Ngân Sách Chuẩn 50 / 30 / 20</span>
                <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Chuẩn Quốc Tế
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Phân bổ dòng tiền theo mục tiêu tài chính bền vững của chuyên gia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-zinc-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Save size={14} />
              <span>Lưu Thiết Lập Ngân Sách</span>
            </button>
          </div>
        </div>

        {savedToast && (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 font-bold flex items-center gap-2">
            <Check size={16} /> Đã lưu cài đặt ngân sách thành công!
          </div>
        )}

        {/* 3 Pillars of 50/30/20 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pillar 1: 50% Essential */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-400">1. Nhu Cầu Thiết Yếu (50%)</span>
              <span className={`text-xs font-black ${essentialPct > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {essentialPct}% ({formatVND(essentialSpent)})
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${Math.min(essentialPct * 2, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-400">
              Ăn uống, thuê nhà, điện nước, xăng xe, y tế
            </p>
          </div>

          {/* Pillar 2: 30% Lifestyle */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-purple-400">2. Phong Cách &amp; Hưởng Thụ (30%)</span>
              <span className={`text-xs font-black ${lifestylePct > 30 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {lifestylePct}% ({formatVND(lifestyleSpent)})
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full" 
                style={{ width: `${Math.min(lifestylePct * 3.33, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-400">
              Mua sắm, xem phim, du lịch, hẹn hò cặp đôi
            </p>
          </div>

          {/* Pillar 3: 20% Savings */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-400">3. Tiết Kiệm &amp; Đầu Tư (20%)</span>
              <span className={`text-xs font-black ${savingsPct >= 20 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {savingsPct}% ({formatVND(savingsSpent)})
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full" 
                style={{ width: `${Math.min(savingsPct * 5, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-400">
              Gửi tiết kiệm ngân hàng, chứng khoán, bảo hiểm
            </p>
          </div>
        </div>

        {/* Global Monthly Limit Setting Slider */}
        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Sliders size={14} className="text-emerald-400" />
              Tổng Hạn Mức Chi Tiêu Cho Tháng {selectedMonth}
            </span>
            <span className="text-sm font-black text-emerald-400">
              {formatVND(monthlyLimit)}
            </span>
          </div>

          <input
            type="range"
            min="3000000"
            max="100000000"
            step="500000"
            value={monthlyLimit}
            onChange={(e) => setMonthlyLimit(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Ngưỡng cảnh báo chi tiêu: <strong>{alertThreshold}%</strong></span>
            <span>Đã tiêu: <strong>{formatVND(totalExpense)}</strong> ({Math.round((totalExpense / monthlyLimit) * 100)}%)</span>
          </div>
        </div>
      </div>

      {/* Category Specific Budget Limits */}
      <div className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-white flex items-center gap-2">
            <Scale size={16} className="text-emerald-400" />
            Hạn Mức Ngân Sách Từng Danh Mục Chi Tiêu
          </h4>
          <span className="text-xs text-zinc-400">
            Chỉnh sửa trực tiếp số tiền giới hạn
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {categories
            .filter(c => c.type === 'expense')
            .map((cat) => {
              const allocatedBudget = categoryLimits[cat.id] || cat.monthlyBudget || 1000000;
              const catSpent = monthTransactions
                .filter(t => t.categoryId === cat.id && t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

              const spentPct = Math.min(Math.round((catSpent / allocatedBudget) * 100), 200);
              const isOver = catSpent > allocatedBudget;
              const isNearLimit = spentPct >= alertThreshold && !isOver;

              return (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: cat.color }} 
                      />
                      <span className="text-xs font-bold text-white">{cat.name}</span>
                    </div>

                    <span className={`text-xs font-black ${isOver ? 'text-rose-400' : isNearLimit ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {spentPct}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver ? 'bg-rose-500' : isNearLimit ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(spentPct, 100)}%` }}
                    />
                  </div>

                  {/* Numbers & Edit Input */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">
                      Đã chi: <strong className="text-zinc-200">{formatVND(catSpent)}</strong>
                    </span>

                    <div className="flex items-center gap-1">
                      <span className="text-zinc-400">Hạn mức:</span>
                      <input
                        type="number"
                        value={allocatedBudget}
                        onChange={(e) => handleCategoryLimitChange(cat.id, Number(e.target.value))}
                        className="w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-0.5 text-right text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
