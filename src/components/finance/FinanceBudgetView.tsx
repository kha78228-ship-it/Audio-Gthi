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
  DollarSign,
  Layers,
  ShoppingBag,
  TrendingUp,
  Landmark,
  GraduationCap,
  Gamepad2,
  HeartHandshake,
  BarChart3
} from 'lucide-react';
import { FinanceBudget, FinanceCategory, FinanceTransaction } from '../../types';
import { FinanceRechartsVisualization } from './FinanceRechartsVisualization';

interface FinanceBudgetViewProps {
  budget?: FinanceBudget;
  categories: FinanceCategory[];
  transactions: FinanceTransaction[];
  selectedMonth: string;
  onSaveBudget: (budgetData: Partial<FinanceBudget>) => void;
  defaultMode?: '6jars' | '50_30_20' | 'recharts_progress';
  onOpenAiAdvisor?: () => void;
}

export function FinanceBudgetView({
  budget,
  categories,
  transactions,
  selectedMonth,
  onSaveBudget,
  defaultMode = '6jars',
  onOpenAiAdvisor
}: FinanceBudgetViewProps) {
  const [budgetFramework, setBudgetFramework] = useState<'6jars' | '50_30_20' | 'recharts_progress'>(defaultMode);
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

  const jarPercents = {
    nec: 55,
    ffa: 10,
    ltss: 10,
    edu: 10,
    play: 10,
    give: 5,
  };

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

  const activeBudgetBase = totalIncome > 0 ? totalIncome : monthlyLimit;

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

  // 6 Jars Spend Calculation
  const jarsList = [
    {
      id: 'nec',
      name: 'Hũ 1: Chi Tiêu Cần Thiết (NEC)',
      desc: 'Ăn uống, thuê nhà, xăng xe, hóa đơn điện nước',
      icon: ShoppingBag,
      pct: jarPercents.nec,
      color: 'from-blue-600 to-cyan-600',
      budget: (activeBudgetBase * jarPercents.nec) / 100,
      spent: essentialSpent,
    },
    {
      id: 'ffa',
      name: 'Hũ 2: Tự Do Tài Chính (FFA)',
      desc: 'Đầu tư chứng khoán, bất động sản, tạo dòng tiền thụ động',
      icon: TrendingUp,
      pct: jarPercents.ffa,
      color: 'from-amber-500 to-yellow-600',
      budget: (activeBudgetBase * jarPercents.ffa) / 100,
      spent: savingsSpent * 0.6,
    },
    {
      id: 'ltss',
      name: 'Hũ 3: Tiết Kiệm Dài Hạn (LTSS)',
      desc: 'Quỹ khẩn cấp, mua sắm tài sản lớn, du lịch tương lai',
      icon: Landmark,
      pct: jarPercents.ltss,
      color: 'from-emerald-500 to-teal-600',
      budget: (activeBudgetBase * jarPercents.ltss) / 100,
      spent: savingsSpent * 0.4,
    },
    {
      id: 'edu',
      name: 'Hũ 4: Giáo Dục & Bản Thân (EDU)',
      desc: 'Sách, khóa học nâng cao kỹ năng, hội thảo phát triển',
      icon: GraduationCap,
      pct: jarPercents.edu,
      color: 'from-purple-500 to-indigo-600',
      budget: (activeBudgetBase * jarPercents.edu) / 100,
      spent: lifestyleSpent * 0.25,
    },
    {
      id: 'play',
      name: 'Hũ 5: Hưởng Thụ & Thư Giãn (PLAY)',
      desc: 'Cà phê, giải trí, ăn uống sang chảnh, tái tạo năng lượng',
      icon: Gamepad2,
      pct: jarPercents.play,
      color: 'from-rose-500 to-pink-600',
      budget: (activeBudgetBase * jarPercents.play) / 100,
      spent: lifestyleSpent * 0.75,
    },
    {
      id: 'give',
      name: 'Hũ 6: Cho Đi & Thiện Nguyện (GIVE)',
      desc: 'Biếu bố mẹ, làm từ thiện, giúp đỡ bạn bè người thân',
      icon: HeartHandshake,
      pct: jarPercents.give,
      color: 'from-orange-500 to-amber-600',
      budget: (activeBudgetBase * jarPercents.give) / 100,
      spent: totalExpense * 0.05,
    },
  ];

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
      {/* Top Framework Selector (6 Hũ Tiền vs 50/30/20) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-3xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBudgetFramework('6jars')}
            className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              budgetFramework === '6jars'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 border border-amber-300 shadow-amber-500/20 scale-105'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Layers size={15} />
            <span>🏺 Phương Pháp 6 Hũ Tiền (6 Jars)</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-black/30 font-bold text-zinc-950">Ctrl+G</span>
          </button>

          <button
            onClick={() => setBudgetFramework('50_30_20')}
            className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              budgetFramework === '50_30_20'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 border border-emerald-300 shadow-emerald-500/20 scale-105'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <PieChart size={15} />
            <span>⚖️ Khung Ngân Sách 50/30/20</span>
          </button>

          <button
            onClick={() => setBudgetFramework('recharts_progress')}
            className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              budgetFramework === 'recharts_progress'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-zinc-950 border border-cyan-300 shadow-cyan-500/20 scale-105'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <BarChart3 size={15} />
            <span>📊 Tiến Độ Ngân Sách Recharts</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-black/30 font-bold text-zinc-950">Mới</span>
          </button>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer self-end sm:self-auto"
        >
          <Save size={14} />
          <span>Lưu Cài Đặt</span>
        </button>
      </div>

      {savedToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 font-bold flex items-center gap-2 animate-fadeIn">
          <Check size={16} /> Đã lưu thiết lập ngân sách &amp; hũ tiền thành công!
        </div>
      )}

      {/* ================= RECHARTS BUDGET PROGRESS VISUALIZATION ================= */}
      {budgetFramework === 'recharts_progress' && (
        <FinanceRechartsVisualization
          transactions={transactions}
          categories={categories}
          budget={budget}
          selectedMonth={selectedMonth}
          defaultTab="budget_progress"
        />
      )}

      {/* ================= 6 JARS (HŨ TIỀN) FRAMEWORK ================= */}
      {budgetFramework === '6jars' && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-amber-500/30 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-inner">
                <Layers size={22} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>Hệ Thống Quản Lý 6 Hũ Tiền (T. Harv Eker)</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Phím tắt: Ctrl+G
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Tự động phân bổ thu nhập ({formatVND(activeBudgetBase)}) vào 6 hũ để đạt tự do tài chính trọn đời
                </p>
              </div>
            </div>

            {onOpenAiAdvisor && (
              <button
                onClick={onOpenAiAdvisor}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:opacity-95 text-zinc-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer self-start sm:self-auto group"
              >
                <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
                <span>AI Phân Tích &amp; Dự Báo 6 Hũ</span>
              </button>
            )}
          </div>

          {/* 6 Jars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jarsList.map(jar => {
              const Icon = jar.icon;
              const spentPct = jar.budget > 0 ? Math.min(Math.round((jar.spent / jar.budget) * 100), 200) : 0;
              const isOver = jar.spent > jar.budget;
              const isNear = spentPct >= alertThreshold && !isOver;

              return (
                <div
                  key={jar.id}
                  className="p-5 rounded-3xl bg-zinc-950/90 border border-zinc-800/80 hover:border-amber-500/40 transition-all space-y-3 shadow-lg group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-2xl bg-gradient-to-tr ${jar.color} text-white flex items-center justify-center shadow-md`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">{jar.name}</h4>
                        <span className="text-[10px] text-zinc-400">{jar.pct}% Thu nhập</span>
                      </div>
                    </div>

                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      isOver ? 'bg-rose-500/20 text-rose-300' : isNear ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {spentPct}%
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-tight">{jar.desc}</p>

                  {/* Jar Visual Progress */}
                  <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver ? 'bg-rose-500' : isNear ? 'bg-amber-500' : 'bg-gradient-to-r from-amber-400 to-emerald-400'
                      }`}
                      style={{ width: `${Math.min(spentPct, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-900">
                    <span className="text-zinc-400">
                      Hạn mức: <strong className="text-amber-300">{formatVND(jar.budget)}</strong>
                    </span>
                    <span className="text-zinc-400">
                      Đã dùng: <strong className={isOver ? 'text-rose-400' : 'text-zinc-200'}>{formatVND(jar.spent)}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= 50/30/20 FRAMEWORK ================= */}
      {budgetFramework === '50_30_20' && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 shadow-xl space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <PieChart size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>Khung Ngân Sách Chuẩn 50 / 30 / 20</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Chuẩn Quốc Tế
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Phân bổ dòng tiền theo 3 trụ cột: Thiết yếu (50%), Linh hoạt (30%), Tích lũy (20%)
                </p>
              </div>
            </div>
          </div>

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
                  style={{ width: `${Math.min(essentialPct, 100)}%` }} 
                />
              </div>
              <p className="text-[11px] text-zinc-400">
                Tiền nhà, ăn uống, xăng xe, điện nước, sinh hoạt cơ bản
              </p>
            </div>

            {/* Pillar 2: 30% Lifestyle */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-purple-400">2. Mong Muốn &amp; Sở Thích (30%)</span>
                <span className={`text-xs font-black ${lifestylePct > 30 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {lifestylePct}% ({formatVND(lifestyleSpent)})
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full" 
                  style={{ width: `${Math.min(lifestylePct, 100)}%` }} 
                />
              </div>
              <p className="text-[11px] text-zinc-400">
                Mua sắm, cà phê, xem phim, giải trí, quà tặng, hẹn hò
              </p>
            </div>

            {/* Pillar 3: 20% Savings & Invest */}
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
        </div>
      )}

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
