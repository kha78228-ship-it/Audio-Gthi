import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShieldCheck, 
  Check, 
  Send, 
  Bot, 
  PieChart, 
  DollarSign, 
  RefreshCw, 
  Zap, 
  Download, 
  Sliders, 
  ArrowRight,
  Target,
  Clock,
  HelpCircle,
  PiggyBank
} from 'lucide-react';
import { 
  FinanceTransaction, 
  FinanceWallet, 
  FinanceBudget, 
  FinanceCategory, 
  FinanceSavingsGoal, 
  FinanceDebtRecord 
} from '../../types';

interface FinanceAIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: FinanceTransaction[];
  wallets: FinanceWallet[];
  budget?: FinanceBudget;
  categories: FinanceCategory[];
  selectedMonth: string;
  savingsGoals?: FinanceSavingsGoal[];
  debts?: FinanceDebtRecord[];
  onApplyBudget?: (updatedLimits: Record<string, number>, monthlyLimit: number) => void;
}

export function FinanceAIAdvisorModal({
  isOpen,
  onClose,
  transactions,
  wallets,
  budget,
  categories,
  selectedMonth,
  savingsGoals = [],
  debts = [],
  onApplyBudget,
}: FinanceAIAdvisorModalProps) {
  const [loading, setLoading] = useState(false);
  const [focusArea, setFocusArea] = useState<'comprehensive' | '6jars_forecast' | 'spending_cuts' | 'wealth_acceleration'>('comprehensive');
  const [customIncome, setCustomIncome] = useState<number>(0);
  const [userQuery, setUserQuery] = useState('');
  const [aiData, setAiData] = useState<any | null>(null);
  const [appliedToast, setAppliedToast] = useState(false);
  const [customChatHistory, setCustomChatHistory] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  if (!isOpen) return null;

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const handleRunAnalysis = async (overrideQuery?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/finance/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions,
          wallets,
          budget,
          selectedMonth,
          savingsGoals,
          debts,
          userQuery: overrideQuery || userQuery,
          focusArea,
          customIncomeTarget: customIncome > 0 ? customIncome : undefined,
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        setAiData(json.data);
      }
    } catch (err) {
      console.error('Failed to run Finance AI analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFollowUp = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const question = chatInput.trim();
    setChatInput('');
    setCustomChatHistory(prev => [...prev, { role: 'user', text: question }]);
    setChatLoading(true);

    try {
      const response = await fetch('/api/finance/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions,
          wallets,
          budget,
          selectedMonth,
          savingsGoals,
          debts,
          userQuery: question,
          focusArea: 'comprehensive',
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        const reply = json.data.habitAnalysis?.summary 
          ? `${json.data.habitAnalysis.summary}\n\n💡 **Khuyến nghị:** ${json.data.actionRoadmap?.[0]?.action || 'Hãy duy trì quản lý 6 hũ tiền đều đặn.'}`
          : json.data.markdownReport || 'Đã phân tích xong câu hỏi của bạn!';
        setCustomChatHistory(prev => [...prev, { role: 'ai', text: reply }]);
      }
    } catch (err) {
      setCustomChatHistory(prev => [...prev, { role: 'ai', text: 'Xin lỗi, không thể kết nối tới máy chủ AI. Vui lòng thử lại sau giây lát.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleApplyRecommendedBudget = () => {
    if (!aiData || !onApplyBudget) return;
    const jars = aiData.jarsForecast || [];
    const totalRecommended = jars.reduce((sum: number, j: any) => sum + (j.recommendedBudget || 0), 0);
    
    // Convert 6 jars to category map
    const newCatLimits: Record<string, number> = {};
    const necJar = jars.find((j: any) => j.jarId === 'nec');
    const playJar = jars.find((j: any) => j.jarId === 'play');
    const eduJar = jars.find((j: any) => j.jarId === 'edu');
    
    if (necJar) {
      newCatLimits['cat_food'] = Math.round(necJar.recommendedBudget * 0.4);
      newCatLimits['cat_rent'] = Math.round(necJar.recommendedBudget * 0.4);
      newCatLimits['cat_transport'] = Math.round(necJar.recommendedBudget * 0.1);
      newCatLimits['cat_bills'] = Math.round(necJar.recommendedBudget * 0.1);
    }
    if (playJar) {
      newCatLimits['cat_entertainment'] = Math.round(playJar.recommendedBudget * 0.5);
      newCatLimits['cat_shopping'] = Math.round(playJar.recommendedBudget * 0.5);
    }

    onApplyBudget(newCatLimits, totalRecommended || 15000000);
    setAppliedToast(true);
    setTimeout(() => setAppliedToast(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-5xl max-h-[92vh] bg-zinc-950 border border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-inner">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Haevy Finance AI Advisor
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Zap size={10} /> Gemini 3.7 Flash
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Phân tích thói quen chi tiêu thực tế &amp; Dự báo dòng tiền hàng tháng trong 6 hũ tiền
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center border border-zinc-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          
          {/* Controls Bar: Quick Focus & Custom Simulation */}
          <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                <span className="text-xs font-bold text-zinc-400 whitespace-nowrap">Trọng tâm:</span>
                {[
                  { id: 'comprehensive', label: '🌟 Toàn diện' },
                  { id: '6jars_forecast', label: '🏺 Dự Báo 6 Hũ' },
                  { id: 'spending_cuts', label: '✂️ Cắt Giảm Rò Rỉ' },
                  { id: 'wealth_acceleration', label: '🚀 Tăng Tốc Tích Sản' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFocusArea(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      focusArea === f.id
                        ? 'bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/20'
                        : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleRunAnalysis()}
                disabled={loading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:opacity-95 text-zinc-950 text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Đang phân tích dữ liệu...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>{aiData ? 'Cập Nhật Dự Báo Mới' : 'Phân Tích & Dự Báo Ngay'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Custom Income Simulation Input */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800/80 text-xs text-zinc-400">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Sliders size={14} className="text-amber-400" />
                <span>Mô phỏng mức thu nhập tháng tới (VND):</span>
                <input
                  type="number"
                  placeholder="Mặc định theo thực tế"
                  value={customIncome || ''}
                  onChange={(e) => setCustomIncome(Number(e.target.value))}
                  className="w-40 bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                />
              </div>
              <span className="text-[11px] text-zinc-400">
                Kỳ đánh giá: <strong className="text-zinc-200 font-bold">{selectedMonth}</strong> • Giao dịch: <strong className="text-zinc-200 font-bold">{transactions.length}</strong>
              </span>
            </div>
          </div>

          {/* Toast Notification */}
          {appliedToast && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 font-bold flex items-center gap-2 animate-fadeIn">
              <Check size={16} /> Đã áp dụng hạn mức 6 hũ tiền do AI đề xuất vào Ngân sách thành công!
            </div>
          )}

          {/* Initial State Prompt if not run yet */}
          {!aiData && !loading && (
            <div className="p-10 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto shadow-inner">
                <Layers size={32} />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-base font-black text-white">Sẵn Sàng Phân Tích Dòng Tiền &amp; 6 Hũ</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Nhấn nút &ldquo;Phân Tích &amp; Dự Báo Ngay&rdquo; để Gemini AI đọc dữ liệu giao dịch của bạn, xác định thói quen chi tiêu, cảnh báo rò rỉ và lập bảng phân bổ 6 hũ tiền tháng tới.
                </p>
              </div>
              <button
                onClick={() => handleRunAnalysis()}
                className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black inline-flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Bắt Đầu Phân Tích Thông Minh</span>
              </button>
            </div>
          )}

          {/* AI Result Dashboard */}
          {aiData && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Top Score & Archetype Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Discipline Score */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                      <Target size={14} className="text-amber-400" />
                      Điểm Kỷ Luật Chi Tiêu
                    </span>
                    <h3 className="text-2xl font-black text-amber-300">
                      {aiData.disciplineScore || 85}/100
                    </h3>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {aiData.financialHealthLevel || 'Vững Vàng'}
                    </span>
                  </div>
                  <div className="w-14 h-14 rounded-full border-4 border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-sm">
                    {aiData.disciplineScore || 85}%
                  </div>
                </div>

                {/* 2. Spending Archetype */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 space-y-1 md:col-span-2 flex flex-col justify-center">
                  <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                    <Bot size={14} className="text-cyan-400" />
                    Chân Dung Tài Chính Nhận Diện:
                  </span>
                  <h4 className="text-base font-black text-white text-cyan-300">
                    &ldquo;{aiData.spendingArchetype || 'Nhà Tích Lũy Kỷ Luật & Cân Bằng'}&rdquo;
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {aiData.habitAnalysis?.summary}
                  </p>
                </div>
              </div>

              {/* Money Leaks & Habits Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Money Leaks Alerts */}
                <div className="p-5 rounded-3xl bg-zinc-900/80 border border-rose-500/30 space-y-3">
                  <h4 className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle size={15} className="text-rose-400" />
                    Điểm Rò Rỉ Dòng Tiền Phát Hiện (Money Leaks)
                  </h4>
                  <div className="space-y-2.5">
                    {(aiData.habitAnalysis?.moneyLeaks || []).map((leak: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{leak.title}</span>
                          <span className="text-rose-400 font-extrabold">
                            ~{formatVND(leak.estimatedLossMonthly)}/tháng
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">{leak.advice}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="p-5 rounded-3xl bg-zinc-900/80 border border-emerald-500/30 space-y-3">
                  <h4 className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck size={15} className="text-emerald-400" />
                    Điểm Mạnh &amp; Điểm Cần Tối Ưu
                  </h4>
                  <div className="space-y-2 text-xs">
                    {(aiData.habitAnalysis?.strengths || []).map((s: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-zinc-300">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{s}</span>
                      </div>
                    ))}
                    {(aiData.habitAnalysis?.weaknesses || []).map((w: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-zinc-400">
                        <span className="text-amber-400 font-bold">!</span>
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 6 JARS MONTHLY FORECAST (BẢNG DỰ BÁO 6 HŨ TIỀN HÀNG THÁNG) */}
              <div className="p-6 rounded-3xl bg-zinc-900/90 border border-amber-500/40 space-y-5 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Layers size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-white">
                        Dự Báo &amp; Khuyến Nghị Phân Bổ 6 Hũ Tiền Tháng Tiếp Theo
                      </h4>
                      <p className="text-xs text-zinc-400">
                        So sánh thực tế hiện tại vs Dự báo tháng tới vs Định mức chuẩn T. Harv Eker
                      </p>
                    </div>
                  </div>

                  {onApplyBudget && (
                    <button
                      onClick={handleApplyRecommendedBudget}
                      className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer self-start sm:self-auto"
                    >
                      <Check size={14} />
                      <span>Áp Dụng Định Mức Vào Ngân Sách</span>
                    </button>
                  )}
                </div>

                {/* 6 Jars Forecast Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {(aiData.jarsForecast || []).map((jar: any) => {
                    const isOver = jar.status === 'warning' || jar.currentSpent > jar.recommendedBudget;
                    return (
                      <div
                        key={jar.jarId}
                        className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-amber-500/40 transition-all space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-white">{jar.jarName}</h5>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isOver ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {jar.statusLabel || (isOver ? 'Cần chú ý' : 'Chuẩn')}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isOver ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-400 to-emerald-400'}`}
                            style={{ width: `${Math.min(jar.forecastPct ? (jar.forecastPct / jar.targetPct) * 100 : 80, 100)}%` }}
                          />
                        </div>

                        {/* Numbers Comparison */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-zinc-900">
                          <div>
                            <span className="text-zinc-400 block">Hiện tại:</span>
                            <strong className="text-zinc-200">{formatVND(jar.currentSpent)}</strong>
                          </div>
                          <div>
                            <span className="text-zinc-400 block">Dự báo tới:</span>
                            <strong className="text-amber-300">{formatVND(jar.forecastSpent)} ({jar.forecastPct}%)</strong>
                          </div>
                        </div>

                        <p className="text-[11px] text-zinc-400 leading-snug pt-1 border-t border-zinc-900">
                          💡 <span className="text-zinc-300">{jar.aiRecommendation}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Forecast Key Metrics */}
              {aiData.monthlyForecastMetrics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800 text-center">
                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                    <span className="text-[10px] text-zinc-400">Dự báo thu nhập</span>
                    <p className="text-sm font-black text-teal-400">
                      +{formatVND(aiData.monthlyForecastMetrics.forecastTotalIncome)}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                    <span className="text-[10px] text-zinc-400">Dự báo tổng chi</span>
                    <p className="text-sm font-black text-rose-400">
                      -{formatVND(aiData.monthlyForecastMetrics.forecastTotalExpense)}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                    <span className="text-[10px] text-zinc-400">Tích lũy ròng dự kiến</span>
                    <p className="text-sm font-black text-emerald-400">
                      +{formatVND(aiData.monthlyForecastMetrics.forecastNetSavings)} ({aiData.monthlyForecastMetrics.forecastSavingsRate}%)
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                    <span className="text-[10px] text-zinc-400">Đệm an toàn (Runway)</span>
                    <p className="text-sm font-black text-cyan-300">
                      {aiData.monthlyForecastMetrics.financialRunwayMonths || 5.0} Tháng
                    </p>
                  </div>
                </div>
              )}

              {/* Action Roadmap 4 Weeks */}
              {aiData.actionRoadmap && aiData.actionRoadmap.length > 0 && (
                <div className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-3">
                  <h4 className="text-xs font-black text-white flex items-center gap-2">
                    <Clock size={15} className="text-amber-400" />
                    Lộ Trình Hành Động 4 Tuần (Actionable Roadmap)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {aiData.actionRoadmap.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-start gap-2.5 text-xs">
                        <span className="font-extrabold px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] whitespace-nowrap">
                          {item.week}
                        </span>
                        <span className="text-zinc-300">{item.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Follow-Up Chat with Gemini */}
              <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-black text-white flex items-center gap-2">
                  <Bot size={15} className="text-cyan-400" />
                  Hỏi Đáp Chi Tiết Với Cố Vấn Tài Chính AI
                </h4>

                {customChatHistory.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs">
                    {customChatHistory.map((msg, i) => (
                      <div key={i} className={`p-2.5 rounded-xl ${msg.role === 'user' ? 'bg-amber-500/10 text-amber-200 ml-6' : 'bg-zinc-900 text-zinc-300 mr-6'}`}>
                        <strong>{msg.role === 'user' ? 'Bạn: ' : 'AI Advisor: '}</strong>
                        <span className="whitespace-pre-line">{msg.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendFollowUp()}
                    placeholder="Ví dụ: Tôi muốn tiết kiệm thêm 2 triệu tháng tới thì nên bớt hũ nào?..."
                    className="flex-1 bg-zinc-950 border border-zinc-700/80 rounded-2xl px-4 py-2 text-xs font-medium text-white focus:outline-none focus:border-amber-500 shadow-inner"
                  />
                  <button
                    onClick={handleSendFollowUp}
                    disabled={chatLoading || !chatInput.trim()}
                    className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
                  >
                    {chatLoading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                    <span>Gửi</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 border-t border-zinc-800/80 bg-zinc-950 flex items-center justify-between text-xs text-zinc-400">
          <span>Hệ thống phân bổ tài chính chuẩn mực theo 6 Hũ Tiền T. Harv Eker</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
