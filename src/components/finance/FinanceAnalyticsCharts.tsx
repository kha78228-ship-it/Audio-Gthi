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
  HelpCircle,
  Activity,
  Flame
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend
} from 'recharts';
import { FinanceTransaction, FinanceCategory, FinanceBudget } from '../../types';
import { FinanceRechartsVisualization } from './FinanceRechartsVisualization';
import { FinanceD3SunburstChart } from './FinanceD3SunburstChart';
import { FinanceSixJarsSavingsGrowthChart } from './FinanceSixJarsSavingsGrowthChart';
import { FinanceHeatmap } from './FinanceHeatmap';

interface FinanceAnalyticsChartsProps {
  transactions: FinanceTransaction[];
  categories: FinanceCategory[];
  budget?: FinanceBudget;
  selectedMonth: string;
}

export function FinanceAnalyticsCharts({
  transactions,
  categories,
  budget,
  selectedMonth
}: FinanceAnalyticsChartsProps) {
  const [chartMode, setChartMode] = useState<'recharts' | 'heatmap' | 'growth' | 'sunburst' | 'category' | 'trend' | 'ranking'>('recharts');

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-1.5 bg-zinc-900/80 rounded-2xl border border-zinc-800">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
          <button
            onClick={() => setChartMode('recharts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              chartMode === 'recharts' 
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-black' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Activity size={14} />
            <span>Phân Tích Recharts (Tuần &amp; Ngân Sách)</span>
          </button>
          <button
            onClick={() => setChartMode('heatmap')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              chartMode === 'heatmap' 
                ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-zinc-950 shadow-md font-black' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flame size={14} className="text-amber-400" />
            <span>🔥 Heatmap 30 Ngày (D3.js)</span>
          </button>
          <button
            onClick={() => setChartMode('growth')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              chartMode === 'growth' 
                ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-zinc-950 shadow-md font-black' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <TrendingUp size={14} />
            <span>📈 Tăng Trưởng 6 Hũ (30 Ngày)</span>
          </button>
          <button
            onClick={() => setChartMode('sunburst')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              chartMode === 'sunburst' 
                ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-zinc-950 shadow-md font-black' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>☀️ Sunburst 6 Hũ (D3.js)</span>
          </button>
          <button
            onClick={() => setChartMode('category')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
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
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
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
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              chartMode === 'ranking' 
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-black' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <TrendingUp size={14} />
            <span>Top Khoản Chi Lớn Nhất</span>
          </button>
        </div>

        <span className="text-xs text-zinc-400 pr-2 hidden sm:inline whitespace-nowrap">
          Tháng đang xem: <strong className="text-white">{selectedMonth}</strong>
        </span>
      </div>

      {/* MODE 0: RECHARTS ADVANCED VISUALIZATION */}
      {chartMode === 'recharts' && (
        <FinanceRechartsVisualization
          transactions={transactions}
          categories={categories}
          budget={budget}
          selectedMonth={selectedMonth}
        />
      )}

      {/* MODE HEATMAP: D3.JS 30-DAY SPENDING HEATMAP */}
      {chartMode === 'heatmap' && (
        <FinanceHeatmap
          transactions={transactions}
          categories={categories}
          budget={budget}
        />
      )}

      {/* MODE GROWTH: RECHARTS 30-DAY 6-JARS SAVINGS GROWTH */}
      {chartMode === 'growth' && (
        <FinanceSixJarsSavingsGrowthChart
          transactions={transactions}
          categories={categories}
          budget={budget}
        />
      )}

      {/* MODE SUNBURST: D3.JS 6-JARS SUNBURST */}
      {chartMode === 'sunburst' && (
        <FinanceD3SunburstChart
          transactions={transactions}
          categories={categories}
          budget={budget}
          selectedMonth={selectedMonth}
        />
      )}

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

          {/* Recharts Bar Chart Area */}
          <div className="pt-2 pb-2 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={trendData}
                margin={{ top: 15, right: 15, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="label"
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
                  tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}Tr` : `${(val / 1000).toFixed(0)}k`}
                />
                <RechartsTooltip
                  formatter={(value: any, name: any) => [
                    formatVND(Number(value)),
                    name === 'income' ? 'Thu nhập' : 'Chi tiêu'
                  ]}
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderColor: '#3f3f46',
                    borderRadius: '14px',
                    fontSize: '11px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                />
                <RechartsLegend
                  wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }}
                  formatter={(value) => (
                    <span className="text-zinc-300 font-bold">
                      {value === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                    </span>
                  )}
                />
                <RechartsBar
                  dataKey="income"
                  name="income"
                  fill="#14b8a6"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
                <RechartsBar
                  dataKey="expense"
                  name="expense"
                  fill="#f43f5e"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              </RechartsBarChart>
            </ResponsiveContainer>
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
