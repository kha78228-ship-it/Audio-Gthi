import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { FinanceTransaction, FinanceCategory } from '../../types';

interface FinanceAnalyticsChartsProps {
  transactions: FinanceTransaction[];
  categories: FinanceCategory[];
  selectedMonth: string;
}

export function FinanceAnalyticsCharts({
  transactions,
  categories,
  selectedMonth
}: FinanceAnalyticsChartsProps) {
  const [chartMode, setChartMode] = useState<'category' | 'trend' | 'ranking'>('category');

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Month transactions
  const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));

  const totalExpense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Group expenses by category
  const expenseByCategory: Record<string, { name: string; amount: number; color: string }> = {};
  monthTransactions
    .filter(t => t.type === 'expense')
    .forEach((t) => {
      const cat = categories.find(c => c.id === t.categoryId);
      const name = cat?.name || t.categoryName || 'Khác';
      const color = cat?.color || '#94a3b8';
      if (!expenseByCategory[t.categoryId]) {
        expenseByCategory[t.categoryId] = { name, amount: 0, color };
      }
      expenseByCategory[t.categoryId].amount += t.amount;
    });

  const sortedCategories = Object.values(expenseByCategory).sort((a, b) => b.amount - a.amount);

  // Top 5 largest single expenses
  const topExpenses = [...monthTransactions]
    .filter(t => t.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);

  // 6 months trend calculation
  const getPastMonths = (count = 6) => {
    const months = [];
    const date = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const monthStr = d.toISOString().slice(0, 7); // YYYY-MM
      const label = `T${d.getMonth() + 1}/${d.getFullYear() % 100}`;
      
      const txs = transactions.filter(t => t.date.startsWith(monthStr));
      const inc = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const exp = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      months.push({ monthStr, label, income: inc, expense: exp });
    }
    return months;
  };

  const trendData = getPastMonths(6);
  const maxTrendAmount = Math.max(...trendData.flatMap(m => [m.income, m.expense]), 10000000);

  return (
    <div className="space-y-6">
      {/* Chart Navigation Switcher */}
      <div className="flex items-center justify-between p-1.5 bg-zinc-900/80 rounded-2xl border border-zinc-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setChartMode('category')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              chartMode === 'category' 
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-black' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <PieChart size={14} />
            <span>Cơ Cấu Tỷ Trọng Chi Tiêu</span>
          </button>
          <button
            onClick={() => setChartMode('trend')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              chartMode === 'trend' 
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-black' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <BarChart3 size={14} />
            <span>Xu Hướng Thu / Chi 6 Tháng</span>
          </button>
          <button
            onClick={() => setChartMode('ranking')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              chartMode === 'ranking' 
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-black' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <TrendingUp size={14} />
            <span>Top Khoản Chi Lớn Nhất</span>
          </button>
        </div>

        <span className="text-xs text-zinc-400 pr-2 hidden sm:inline">
          Tháng đang xem: <strong className="text-white">{selectedMonth}</strong>
        </span>
      </div>

      {/* MODE 1: CATEGORY BREAKDOWN */}
      {chartMode === 'category' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 shadow-xl">
          {/* Left Column: Interactive Visual Breakdown Bars & Donut Simulation */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <PieChart size={16} className="text-emerald-400" />
                Phân Bổ Theo Từng Danh Mục
              </h4>
              <span className="text-xs font-bold text-rose-400">
                Tổng chi: {formatVND(totalExpense)}
              </span>
            </div>

            {sortedCategories.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                Chưa có dữ liệu chi tiêu cho tháng này
              </div>
            ) : (
              <div className="space-y-3">
                {/* Horizontal Segmented Bar */}
                <div className="w-full h-4 bg-zinc-950 rounded-full overflow-hidden flex p-0.5 border border-zinc-800">
                  {sortedCategories.map((cat, idx) => {
                    const pct = totalExpense > 0 ? (cat.amount / totalExpense) * 100 : 0;
                    return (
                      <div
                        key={idx}
                        className="h-full first:rounded-l-full last:rounded-r-full transition-all hover:opacity-80"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: cat.color
                        }}
                        title={`${cat.name}: ${formatVND(cat.amount)} (${Math.round(pct)}%)`}
                      />
                    );
                  })}
                </div>

                {/* Categories List */}
                <div className="space-y-2 pt-2">
                  {sortedCategories.map((cat, idx) => {
                    const pct = totalExpense > 0 ? Math.round((cat.amount / totalExpense) * 100) : 0;
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-3.5 h-3.5 rounded-full shrink-0" 
                            style={{ backgroundColor: cat.color }} 
                          />
                          <span className="text-xs font-bold text-white">{cat.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-rose-300">{formatVND(cat.amount)}</span>
                          <span className="text-[10px] text-zinc-400 ml-2 font-bold">({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Financial Health Gauge & Observations */}
          <div className="lg:col-span-6 space-y-4">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              Đánh Giá Cấu Trúc Dòng Tiền
            </h4>

            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Tỷ lệ Tiết Kiệm / Thu Nhập:</span>
                <span className="text-emerald-400 font-black">
                  {totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}%
                </span>
              </div>

              <div className="space-y-2 text-xs text-zinc-300 leading-relaxed border-t border-zinc-800/80 pt-3">
                <p>
                  💡 <strong>Khoản chi lớn nhất:</strong> {sortedCategories[0]?.name || 'Chưa xác định'} chiếm <strong>{totalExpense > 0 && sortedCategories[0] ? Math.round((sortedCategories[0].amount / totalExpense) * 100) : 0}%</strong> tổng chi tiêu.
                </p>
                <p>
                  🎯 <strong>Gợi ý:</strong> Nên duy trì chi tiêu thiết yếu dưới 50% tổng thu nhập hàng tháng để tạo đệm an toàn dự phòng rủi ro.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: 6 MONTHS TREND */}
      {chartMode === 'trend' && (
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <BarChart3 size={16} className="text-emerald-400" />
              Biểu Đồ So Sánh Thu Nhập và Chi Tiêu 6 Tháng Gần Nhất
            </h4>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1 text-teal-400">
                <div className="w-3 h-3 rounded bg-teal-500" /> Thu nhập
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <div className="w-3 h-3 rounded bg-rose-500" /> Chi tiêu
              </span>
            </div>
          </div>

          {/* Bar Chart Area */}
          <div className="pt-6 pb-2 grid grid-cols-6 gap-3 sm:gap-6 items-end h-56 border-b border-zinc-800">
            {trendData.map((m, idx) => {
              const incomeHeight = Math.max(Math.round((m.income / maxTrendAmount) * 100), 4);
              const expenseHeight = Math.max(Math.round((m.expense / maxTrendAmount) * 100), 4);

              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="flex items-end gap-1 sm:gap-2 h-full w-full justify-center">
                    {/* Income Bar */}
                    <div
                      className="w-3 sm:w-6 bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-lg transition-all group-hover:brightness-110"
                      style={{ height: `${incomeHeight}%` }}
                      title={`Thu nhập ${m.label}: ${formatVND(m.income)}`}
                    />
                    {/* Expense Bar */}
                    <div
                      className="w-3 sm:w-6 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-lg transition-all group-hover:brightness-110"
                      style={{ height: `${expenseHeight}%` }}
                      title={`Chi tiêu ${m.label}: ${formatVND(m.expense)}`}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-zinc-400 group-hover:text-white transition-colors">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 3: TOP EXPENSES RANKING */}
      {chartMode === 'ranking' && (
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 shadow-xl space-y-4">
          <h4 className="text-sm font-black text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-amber-400" />
            Bảng Xếp Hạng Các Khoản Chi Tiêu Lớn Nhất Trong Tháng
          </h4>

          <div className="space-y-2.5">
            {topExpenses.map((tx, idx) => (
              <div
                key={tx.id}
                className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-zinc-900 text-amber-400 font-black text-xs flex items-center justify-center border border-zinc-800">
                    #{idx + 1}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-white">{tx.note || tx.categoryName}</h5>
                    <p className="text-[11px] text-zinc-400">{tx.categoryName} • {new Date(tx.date).toLocaleDateString('vi-VN')} • {tx.walletName}</p>
                  </div>
                </div>

                <span className="text-sm font-black text-rose-400">
                  -{formatVND(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
