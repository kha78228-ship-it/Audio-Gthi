import React, { useState } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Home, 
  Target, 
  Flame, 
  Receipt, 
  PieChart, 
  Coins, 
  Percent, 
  HelpCircle, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
  CheckCircle2,
  Calendar
} from 'lucide-react';

type CalcType = 'compound' | 'loan' | 'goal' | 'inflation' | 'fire' | 'tax' | 'allocation';

export function FinanceCalculatorsView() {
  const [activeCalc, setActiveCalc] = useState<CalcType>('compound');

  // Format currency
  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Math.round(val));
  };

  // -------------------------------------------------------------
  // 1. COMPOUND INTEREST (LÃI KÉP & TÍCH LŨY ĐỊNH KỲ)
  // -------------------------------------------------------------
  const [initialCapital, setInitialCapital] = useState<number>(50000000); // 50 tr
  const [monthlyContribution, setMonthlyContribution] = useState<number>(5000000); // 5 tr/tháng
  const [annualRate, setAnnualRate] = useState<number>(10); // 10%/năm
  const [investmentYears, setInvestmentYears] = useState<number>(10); // 10 năm

  // Calculate compound interest
  const months = investmentYears * 12;
  const monthlyRate = annualRate / 100 / 12;
  let totalFutureValue = initialCapital * Math.pow(1 + monthlyRate, months);
  if (monthlyRate > 0) {
    totalFutureValue += monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  } else {
    totalFutureValue += monthlyContribution * months;
  }
  const totalPrincipal = initialCapital + (monthlyContribution * months);
  const totalInterest = Math.max(0, totalFutureValue - totalPrincipal);

  // Yearly progression breakdown
  const compoundYearlyRows = [];
  let curVal = initialCapital;
  for (let yr = 1; yr <= investmentYears; yr++) {
    for (let m = 1; m <= 12; m++) {
      curVal = curVal * (1 + monthlyRate) + monthlyContribution;
    }
    const principalAtYr = initialCapital + (monthlyContribution * yr * 12);
    compoundYearlyRows.push({
      year: yr,
      principal: principalAtYr,
      interest: Math.max(0, curVal - principalAtYr),
      total: curVal
    });
  }

  // -------------------------------------------------------------
  // 2. LOAN & MORTGAGE (VAY TRẢ GÓP & DƯ NỢ GIẢM DẦN)
  // -------------------------------------------------------------
  const [loanAmount, setLoanAmount] = useState<number>(500000000); // 500 tr
  const [loanRateAnnual, setLoanRateAnnual] = useState<number>(9.5); // 9.5%/năm
  const [loanTermMonths, setLoanTermMonths] = useState<number>(60); // 5 năm (60 tháng)
  const [loanMethod, setLoanMethod] = useState<'reducing' | 'flat'>('reducing'); // Dư nợ giảm dần vs Cố định

  // Calculate Loan
  const monthlyPrincipal = loanAmount / (loanTermMonths || 1);
  const loanMonthlyRate = (loanRateAnnual / 100) / 12;
  
  // Method 1: Reducing balance
  let totalInterestReducing = 0;
  const firstMonthPayReducing = monthlyPrincipal + (loanAmount * loanMonthlyRate);
  const lastMonthPayReducing = monthlyPrincipal + (monthlyPrincipal * loanMonthlyRate);
  for (let i = 0; i < loanTermMonths; i++) {
    const remaining = loanAmount - (monthlyPrincipal * i);
    totalInterestReducing += remaining * loanMonthlyRate;
  }
  const totalPayReducing = loanAmount + totalInterestReducing;

  // Method 2: Flat rate
  const monthlyInterestFlat = loanAmount * loanMonthlyRate;
  const monthlyPayFlat = monthlyPrincipal + monthlyInterestFlat;
  const totalInterestFlat = monthlyInterestFlat * loanTermMonths;
  const totalPayFlat = loanAmount + totalInterestFlat;

  // -------------------------------------------------------------
  // 3. SAVINGS GOAL PLANNER (MỤC TIÊU TIẾT KIỆM)
  // -------------------------------------------------------------
  const [goalTargetAmount, setGoalTargetAmount] = useState<number>(300000000); // 300 tr
  const [goalTimeMonths, setGoalTimeMonths] = useState<number>(24); // 2 năm
  const [goalRateAnnual, setGoalRateAnnual] = useState<number>(6.0); // 6%/năm gửi tiết kiệm

  const goalMonthlyRate = (goalRateAnnual / 100) / 12;
  const requiredMonthlySavings = goalMonthlyRate > 0
    ? (goalTargetAmount * goalMonthlyRate) / (Math.pow(1 + goalMonthlyRate, goalTimeMonths) - 1)
    : goalTargetAmount / (goalTimeMonths || 1);

  // -------------------------------------------------------------
  // 4. INFLATION IMPACT (TÁC ĐỘNG CỦA LẠM PHÁT)
  // -------------------------------------------------------------
  const [inflationPresentValue, setInflationPresentValue] = useState<number>(100000000); // 100 tr
  const [inflationRate, setInflationRate] = useState<number>(4.5); // 4.5%/năm
  const [inflationYears, setInflationYears] = useState<number>(10); // 10 năm

  const realPurchasingPower = inflationPresentValue / Math.pow(1 + (inflationRate / 100), inflationYears);
  const purchasingPowerLossPercent = ((inflationPresentValue - realPurchasingPower) / inflationPresentValue) * 100;
  const equivalentFutureCost = inflationPresentValue * Math.pow(1 + (inflationRate / 100), inflationYears);

  // -------------------------------------------------------------
  // 5. FIRE CALCULATOR (TỰ DO TÀI CHÍNH)
  // -------------------------------------------------------------
  const [monthlyExpenseFire, setMonthlyExpenseFire] = useState<number>(20000000); // 20 tr/tháng
  const [currentNetWorth, setCurrentNetWorth] = useState<number>(150000000); // 150 tr có sẵn
  const [monthlyFireSavings, setMonthlyFireSavings] = useState<number>(15000000); // Tiết kiệm 15 tr/tháng
  const [fireRealReturnRate, setFireRealReturnRate] = useState<number>(7.0); // 7%/năm sau lạm phát

  const annualExpenseFire = monthlyExpenseFire * 12;
  const fireTargetNumber = annualExpenseFire * 25; // 4% rule
  
  // Calculate years to FIRE
  let fireYears = 0;
  let simulatedWealth = currentNetWorth;
  const fireMonthlyRate = (fireRealReturnRate / 100) / 12;
  while (simulatedWealth < fireTargetNumber && fireYears < 50) {
    for (let m = 0; m < 12; m++) {
      simulatedWealth = simulatedWealth * (1 + fireMonthlyRate) + monthlyFireSavings;
    }
    fireYears++;
  }

  // -------------------------------------------------------------
  // 6. PIT TAX CALCULATOR (THUẾ THU NHẬP CÁ NHÂN VIỆT NAM)
  // -------------------------------------------------------------
  const [grossIncome, setGrossIncome] = useState<number>(30000000); // 30 tr/tháng
  const [dependentsCount, setDependentsCount] = useState<number>(1); // 1 người phụ thuộc
  const [insuranceSalary, setInsuranceSalary] = useState<number>(grossIncome); // Lương đóng BH

  // Insurance rates (BHXH: 8%, BHYT: 1.5%, BHTN: 1%) = 10.5%
  const cappedInsuranceSalary = Math.min(insuranceSalary, 46800000); // max 20 x lương cơ sở
  const insuranceDeduction = cappedInsuranceSalary * 0.105;
  const personalDeduction = 11000000; // 11 tr
  const dependentDeduction = dependentsCount * 4400000; // 4.4 tr / người
  const totalDeductions = insuranceDeduction + personalDeduction + dependentDeduction;

  const assessableIncome = Math.max(0, grossIncome - totalDeductions); // Thu nhập tính thuế

  // 7 tax brackets
  let pitTax = 0;
  if (assessableIncome <= 5000000) {
    pitTax = assessableIncome * 0.05;
  } else if (assessableIncome <= 10000000) {
    pitTax = 5000000 * 0.05 + (assessableIncome - 5000000) * 0.10;
  } else if (assessableIncome <= 18000000) {
    pitTax = 5000000 * 0.05 + 5000000 * 0.10 + (assessableIncome - 10000000) * 0.15;
  } else if (assessableIncome <= 32000000) {
    pitTax = 5000000 * 0.05 + 5000000 * 0.10 + 8000000 * 0.15 + (assessableIncome - 18000000) * 0.20;
  } else if (assessableIncome <= 52000000) {
    pitTax = 5000000 * 0.05 + 5000000 * 0.10 + 8000000 * 0.15 + 14000000 * 0.20 + (assessableIncome - 32000000) * 0.25;
  } else if (assessableIncome <= 80000000) {
    pitTax = 5000000 * 0.05 + 5000000 * 0.10 + 8000000 * 0.15 + 14000000 * 0.20 + 20000000 * 0.25 + (assessableIncome - 52000000) * 0.30;
  } else {
    pitTax = 5000000 * 0.05 + 5000000 * 0.10 + 8000000 * 0.15 + 14000000 * 0.20 + 20000000 * 0.25 + 28000000 * 0.30 + (assessableIncome - 80000000) * 0.35;
  }

  const netIncome = grossIncome - insuranceDeduction - pitTax;

  // -------------------------------------------------------------
  // 7. FINANCIAL ALLOCATION (50/30/20 & 6 HŨ TÀI CHÍNH)
  // -------------------------------------------------------------
  const [allocationMonthlyIncome, setAllocationMonthlyIncome] = useState<number>(25000000); // 25 tr

  const calcTabs = [
    { id: 'compound', label: 'Lãi Kép & Đầu Tư', icon: TrendingUp, badge: 'Hot' },
    { id: 'loan', label: 'Vay & Trả Góp (EMI)', icon: Home },
    { id: 'goal', label: 'Kế Hoạch Tiết Kiệm', icon: Target },
    { id: 'fire', label: 'Tự Do Tài Chính (FIRE)', icon: Flame, badge: 'Mới' },
    { id: 'tax', label: 'Thuế TNCN Việt Nam', icon: Receipt },
    { id: 'inflation', label: 'Lạm Phát & Sức Mua', icon: Coins },
    { id: 'allocation', label: 'Quy Tắc 50/30/20 & 6 Hũ', icon: PieChart },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-tr from-zinc-900 via-zinc-900 to-emerald-950/40 border border-emerald-500/30 shadow-xl space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center shadow-lg">
            <Calculator size={24} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>Bộ Công Cụ Tính Toán Tài Chính Toàn Diện</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Chính Xác 100%
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Tính lãi kép, lịch trả nợ vay ngân hàng, hoạch định mục tiêu, tự do tài chính FIRE, thuế TNCN và phân bổ dòng tiền.
            </p>
          </div>
        </div>
      </div>

      {/* Sub Calculator Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {calcTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeCalc === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCalc(tab.id as CalcType)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-black shadow-lg shadow-emerald-500/25 scale-[1.02]'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                  isActive ? 'bg-zinc-950 text-emerald-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. LÃI KÉP & ĐẦU TƯ TÍCH LŨY */}
      {/* ------------------------------------------------------------- */}
      {activeCalc === 'compound' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              <span>Tham số đầu tư tích lũy</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400">Số vốn ban đầu (VNĐ)</label>
              <input
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(Math.max(0, Number(e.target.value)))}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-2xl px-4 py-2.5 text-sm font-bold text-white outline-none"
              />
              <span className="text-[11px] text-emerald-400 font-mono">{formatVND(initialCapital)}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400">Số tiền tích lũy thêm mỗi tháng (VNĐ)</label>
              <input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Math.max(0, Number(e.target.value)))}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-2xl px-4 py-2.5 text-sm font-bold text-white outline-none"
              />
              <span className="text-[11px] text-emerald-400 font-mono">{formatVND(monthlyContribution)} / tháng</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">Lãi suất kỳ vọng (%/năm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-2xl px-4 py-2.5 text-sm font-bold text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">Thời gian đầu tư (Năm)</label>
                <input
                  type="number"
                  value={investmentYears}
                  onChange={(e) => setInvestmentYears(Math.max(1, Math.min(50, Number(e.target.value))))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-2xl px-4 py-2.5 text-sm font-bold text-white outline-none"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
              <div className="font-bold text-zinc-300 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-400" />
                <span>Kỳ quan số 8 của nhân loại (Lãi kép):</span>
              </div>
              <p>Tiền lãi sinh ra tiếp tục được gộp vào gốc để sinh lãi lớn hơn theo thời gian.</p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {/* Big Result Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-emerald-950/50 via-zinc-900 to-zinc-900 border border-emerald-500/40 shadow-xl space-y-4">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Tổng tài sản sau {investmentYears} năm</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono tracking-tight">
                {formatVND(totalFutureValue)}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400">Tổng tiền gốc đã bỏ ra</span>
                  <p className="text-sm font-bold text-white font-mono">{formatVND(totalPrincipal)}</p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-950/80 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400">Tổng tiền lãi thực nhận 🔥</span>
                  <p className="text-sm font-black text-emerald-400 font-mono">+{formatVND(totalInterest)}</p>
                </div>
              </div>

              {/* Visual Proportion Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-zinc-400">Tiền gốc ({Math.round((totalPrincipal / totalFutureValue) * 100)}%)</span>
                  <span className="text-emerald-400">Tiền lãi ({Math.round((totalInterest / totalFutureValue) * 100)}%)</span>
                </div>
                <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-zinc-600 h-full transition-all" 
                    style={{ width: `${(totalPrincipal / totalFutureValue) * 100}%` }} 
                  />
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all" 
                    style={{ width: `${(totalInterest / totalFutureValue) * 100}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Yearly Table Preview */}
            <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-3">
              <h4 className="text-xs font-black text-white">Lộ trình tăng trưởng theo từng năm</h4>
              <div className="max-h-60 overflow-y-auto scrollbar-thin space-y-1.5 pr-1">
                {compoundYearlyRows.map(row => (
                  <div key={row.year} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300">Năm {row.year}</span>
                    <div className="text-right">
                      <span className="font-black text-emerald-300 font-mono">{formatVND(row.total)}</span>
                      <span className="text-[10px] text-zinc-500 block">Lãi: +{formatVND(row.interest)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. VAY TRẢ GÓP & DƯ NỢ GIẢM DẦN */}
      {/* ------------------------------------------------------------- */}
      {activeCalc === 'loan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Home size={18} className="text-teal-400" />
              <span>Thông tin khoản vay ngân hàng</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400">Số tiền cần vay (VNĐ)</label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-teal-500 rounded-2xl px-4 py-2.5 text-sm font-bold text-white outline-none"
              />
              <span className="text-[11px] text-teal-400 font-mono">{formatVND(loanAmount)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">Lãi suất (%/năm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={loanRateAnnual}
                  onChange={(e) => setLoanRateAnnual(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-teal-500 rounded-2xl px-4 py-2.5 text-sm font-bold text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">Thời hạn vay (Tháng)</label>
                <input
                  type="number"
                  value={loanTermMonths}
                  onChange={(e) => setLoanTermMonths(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-teal-500 rounded-2xl px-4 py-2.5 text-sm font-bold text-white outline-none"
                />
                <span className="text-[10px] text-zinc-500">{(loanTermMonths / 12).toFixed(1)} năm</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400">Phương thức trả lãi</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLoanMethod('reducing')}
                  className={`p-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                    loanMethod === 'reducing'
                      ? 'bg-teal-500 text-zinc-950 border-teal-400 font-black shadow-md'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  Dư nợ giảm dần (Phổ biến)
                </button>
                <button
                  type="button"
                  onClick={() => setLoanMethod('flat')}
                  className={`p-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                    loanMethod === 'flat'
                      ? 'bg-teal-500 text-zinc-950 border-teal-400 font-black shadow-md'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  Dư nợ ban đầu (Cố định)
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-teal-950/40 via-zinc-900 to-zinc-900 border border-teal-500/40 shadow-xl space-y-4">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                Phương án: {loanMethod === 'reducing' ? 'Theo dư nợ giảm dần' : 'Theo dư nợ ban đầu (cố định)'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[11px] text-zinc-400">
                    {loanMethod === 'reducing' ? 'Tháng đầu trả nhiều nhất' : 'Số tiền trả đều mỗi tháng'}
                  </span>
                  <p className="text-lg font-black text-white font-mono">
                    {formatVND(loanMethod === 'reducing' ? firstMonthPayReducing : monthlyPayFlat)}
                  </p>
                  <span className="text-[10px] text-zinc-500 block">
                    Gốc: {formatVND(monthlyPrincipal)} / tháng
                  </span>
                </div>

                {loanMethod === 'reducing' && (
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                    <span className="text-[11px] text-zinc-400">Tháng cuối cùng trả ít nhất</span>
                    <p className="text-lg font-black text-teal-300 font-mono">
                      {formatVND(lastMonthPayReducing)}
                    </p>
                    <span className="text-[10px] text-zinc-500 block">
                      Tiền lãi giảm dần theo số nợ còn lại
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                <div className="p-3 rounded-2xl bg-zinc-950">
                  <span className="text-[10px] text-zinc-400">Tổng tiền lãi phải trả</span>
                  <p className="text-sm font-black text-rose-400 font-mono">
                    {formatVND(loanMethod === 'reducing' ? totalInterestReducing : totalInterestFlat)}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-950">
                  <span className="text-[10px] text-zinc-400">Tổng số tiền gốc + lãi</span>
                  <p className="text-sm font-black text-white font-mono">
                    {formatVND(loanMethod === 'reducing' ? totalPayReducing : totalPayFlat)}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Bank Advice */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-1">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <Info size={14} />
                <span>Lời khuyên tài chính khi vay ngân hàng:</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Nên giữ tổng khoản trả nợ hàng tháng không vượt quá <strong>40% - 50%</strong> tổng thu nhập để đảm bảo an toàn tài chính và khả năng chi trả sinh hoạt.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. KẾ HOẠCH TIẾT KIỆM MỤC TIÊU */}
      {/* ------------------------------------------------------------- */}
      {activeCalc === 'goal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Target size={18} className="text-cyan-400" />
              <span>Thiết lập mục tiêu</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400">Số tiền mục tiêu cần đạt (VNĐ)</label>
              <input
                type="number"
                value={goalTargetAmount}
                onChange={(e) => setGoalTargetAmount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-2xl px-4 py-2.5 text-sm font-bold text-white outline-none"
              />
              <span className="text-[11px] text-cyan-400 font-mono">{formatVND(goalTargetAmount)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">Thời gian (Tháng)</label>
                <input
                  type="number"
                  value={goalTimeMonths}
                  onChange={(e) => setGoalTimeMonths(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-2xl px-4 py-2.5 text-sm font-bold text-white outline-none"
                />
                <span className="text-[10px] text-zinc-500">{(goalTimeMonths / 12).toFixed(1)} năm</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">Lãi suất gửi (%/năm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={goalRateAnnual}
                  onChange={(e) => setGoalRateAnnual(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-2xl px-4 py-2.5 text-sm font-bold text-white outline-none"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-cyan-950/40 via-zinc-900 to-zinc-900 border border-cyan-500/40 shadow-xl space-y-4">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Mỗi tháng bạn cần tiết kiệm chính xác
              </span>

              <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
                {formatVND(requiredMonthlySavings)} <span className="text-sm font-normal text-zinc-400">/ tháng</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800 text-xs">
                <div className="p-3 rounded-2xl bg-zinc-950">
                  <span className="text-[10px] text-zinc-400">Tổng số tiền gốc tự bỏ ra</span>
                  <p className="font-bold text-white font-mono">{formatVND(requiredMonthlySavings * goalTimeMonths)}</p>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-950">
                  <span className="text-[10px] text-cyan-400">Tiền lãi ngân hàng hỗ trợ thêm</span>
                  <p className="font-bold text-cyan-400 font-mono">
                    +{formatVND(Math.max(0, goalTargetAmount - (requiredMonthlySavings * goalTimeMonths)))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. TỰ DO TÀI CHÍNH FIRE (FINANCIAL INDEPENDENCE) */}
      {/* ------------------------------------------------------------- */}
      {activeCalc === 'fire' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Flame size={18} className="text-amber-400 fill-amber-400" />
              <span>Chỉ số FIRE cá nhân</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400">Chi tiêu sinh hoạt mỗi tháng (VNĐ)</label>
              <input
                type="number"
                value={monthlyExpenseFire}
                onChange={(e) => setMonthlyExpenseFire(Math.max(0, Number(e.target.value)))}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-2xl px-4 py-2.5 text-sm font-bold text-white outline-none"
              />
              <span className="text-[11px] text-amber-400 font-mono">{formatVND(monthlyExpenseFire)} / tháng</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400">Tài sản tích lũy hiện có (VNĐ)</label>
              <input
                type="number"
                value={currentNetWorth}
                onChange={(e) => setCurrentNetWorth(Math.max(0, Number(e.target.value)))}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-2xl px-4 py-2.5 text-sm font-bold text-white outline-none"
              />
              <span className="text-[11px] text-zinc-400 font-mono">{formatVND(currentNetWorth)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">Tiết kiệm/Đầu tư mỗi tháng</label>
                <input
                  type="number"
                  value={monthlyFireSavings}
                  onChange={(e) => setMonthlyFireSavings(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-2xl px-4 py-2.5 text-sm font-bold text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">Lợi suất thực sau lạm phát (%/năm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={fireRealReturnRate}
                  onChange={(e) => setFireRealReturnRate(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-2xl px-4 py-2.5 text-sm font-bold text-white outline-none"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/40 shadow-xl space-y-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Cột Mốc Tự Do Tài Chính (FIRE Number - Quy tắc 4%)
              </span>

              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                {formatVND(fireTargetNumber)}
              </div>
              <p className="text-xs text-zinc-400">
                Khi đạt số tiền này, bạn có thể rút 4% mỗi năm ({formatVND(annualExpenseFire)}) để sinh sống suốt đời mà không lo cạn kiệt tài sản.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                <div className="p-3 rounded-2xl bg-zinc-950">
                  <span className="text-[10px] text-zinc-400">Thời gian dự kiến đạt FIRE</span>
                  <p className="text-base font-black text-white font-mono">
                    ~ {fireYears} năm nữa
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-950">
                  <span className="text-[10px] text-zinc-400">Tiến độ hiện tại</span>
                  <p className="text-base font-black text-amber-400 font-mono">
                    {Math.min(100, Math.round((currentNetWorth / fireTargetNumber) * 100))}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. THUẾ THU NHẬP CÁ NHÂN VIỆT NAM */}
      {/* ------------------------------------------------------------- */}
      {activeCalc === 'tax' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Receipt size={18} className="text-rose-400" />
              <span>Thu nhập & Giảm trừ gia cảnh</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400">Thu nhập Gross hàng tháng (VNĐ)</label>
              <input
                type="number"
                value={grossIncome}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value));
                  setGrossIncome(val);
                  setInsuranceSalary(val);
                }}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-2xl px-4 py-2.5 text-sm font-bold text-white outline-none"
              />
              <span className="text-[11px] text-rose-400 font-mono">{formatVND(grossIncome)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">Số người phụ thuộc</label>
                <input
                  type="number"
                  value={dependentsCount}
                  onChange={(e) => setDependentsCount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-2xl px-4 py-2.5 text-sm font-bold text-white outline-none"
                />
                <span className="text-[10px] text-zinc-500">Giảm {formatVND(dependentsCount * 4400000)}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">Mức lương đóng BH (VNĐ)</label>
                <input
                  type="number"
                  value={insuranceSalary}
                  onChange={(e) => setInsuranceSalary(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-2xl px-4 py-2.5 text-sm font-bold text-white outline-none"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-rose-950/40 via-zinc-900 to-zinc-900 border border-rose-500/40 shadow-xl space-y-4">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Lương NET Thực Nhận Hàng Tháng
              </span>

              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {formatVND(netIncome)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-zinc-800 text-xs">
                <div className="p-3 rounded-2xl bg-zinc-950">
                  <span className="text-[10px] text-zinc-400">Bảo hiểm bắt buộc (10.5%)</span>
                  <p className="font-bold text-amber-300 font-mono">-{formatVND(insuranceDeduction)}</p>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-950">
                  <span className="text-[10px] text-zinc-400">Thuế TNCN tạm nộp</span>
                  <p className="font-bold text-rose-400 font-mono">-{formatVND(pitTax)}</p>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-950">
                  <span className="text-[10px] text-zinc-400">Tổng khấu trừ</span>
                  <p className="font-bold text-zinc-300 font-mono">-{formatVND(insuranceDeduction + pitTax)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. TÁC ĐỘNG CỦA LẠM PHÁT */}
      {/* ------------------------------------------------------------- */}
      {activeCalc === 'inflation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Coins size={18} className="text-amber-400" />
              <span>Chỉ số lạm phát</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400">Số tiền hiện tại (VNĐ)</label>
              <input
                type="number"
                value={inflationPresentValue}
                onChange={(e) => setInflationPresentValue(Math.max(0, Number(e.target.value)))}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-2xl px-4 py-2.5 text-sm font-bold text-white outline-none"
              />
              <span className="text-[11px] text-amber-400 font-mono">{formatVND(inflationPresentValue)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">Tỷ lệ lạm phát (%/năm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-2xl px-4 py-2.5 text-sm font-bold text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">Số năm sau (Năm)</label>
                <input
                  type="number"
                  value={inflationYears}
                  onChange={(e) => setInflationYears(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-2xl px-4 py-2.5 text-sm font-bold text-white outline-none"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/40 shadow-xl space-y-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Sức Mua Thực Tế Sau {inflationYears} Năm (Nếu Giữ Tiền Mặt)
              </span>

              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                {formatVND(realPurchasingPower)}
              </div>
              <p className="text-xs text-rose-400 font-bold">
                ⚠️ Mất đi {purchasingPowerLossPercent.toFixed(1)}% giá trị sức mua do lạm phát!
              </p>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300">
                <span className="text-zinc-400 block text-[11px]">Để mua được giỏ hàng có giá {formatVND(inflationPresentValue)} hiện nay, sau {inflationYears} năm bạn sẽ cần chi:</span>
                <span className="text-base font-black text-white font-mono mt-1 block">{formatVND(equivalentFutureCost)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. PHÂN BỔ 50/30/20 & 6 HŨ TÀI CHÍNH */}
      {/* ------------------------------------------------------------- */}
      {activeCalc === 'allocation' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <PieChart size={18} className="text-emerald-400" />
                  <span>Quy tắc phân bổ dòng tiền thông minh</span>
                </h3>
                <p className="text-xs text-zinc-400">Nhập tổng thu nhập mỗi tháng để tự động chia tiền theo các phương pháp chuẩn quốc tế</p>
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="number"
                  value={allocationMonthlyIncome}
                  onChange={(e) => setAllocationMonthlyIncome(Math.max(0, Number(e.target.value)))}
                  placeholder="Nhập thu nhập..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-2xl px-4 py-2 text-sm font-black text-emerald-400 outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 50/30/20 Rule */}
            <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white">Quy tắc 50 / 30 / 20</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-bold">Elizabeth Warren</span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-emerald-500/30 space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-emerald-400">50% - Nhu cầu thiết yếu (Needs)</span>
                    <span className="text-white font-mono">{formatVND(allocationMonthlyIncome * 0.5)}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Tiền nhà, ăn uống, đi lại, điện nước, y tế cơ bản.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-cyan-500/30 space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-cyan-400">30% - Phong cách sống & Sở thích (Wants)</span>
                    <span className="text-white font-mono">{formatVND(allocationMonthlyIncome * 0.3)}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Mua sắm, cà phê, xem phim, du lịch, giải trí.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-amber-500/30 space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-amber-400">20% - Tiết kiệm & Tích lũy (Savings/Invest)</span>
                    <span className="text-white font-mono">{formatVND(allocationMonthlyIncome * 0.2)}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Quỹ khẩn cấp, gửi tiết kiệm, đầu tư chứng khoán/vàng/BĐS.</p>
                </div>
              </div>
            </div>

            {/* 6 Jars Rule */}
            <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white">Hệ thống 6 Chiếc Hũ (JARS)</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-bold">T. Harv Eker</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-emerald-400 font-bold">NEC (55%) - Thiết yếu</span>
                  <p className="font-mono font-bold text-white">{formatVND(allocationMonthlyIncome * 0.55)}</p>
                </div>

                <div className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-amber-400 font-bold">FFA (10%) - Tự do tài chính</span>
                  <p className="font-mono font-bold text-white">{formatVND(allocationMonthlyIncome * 0.10)}</p>
                </div>

                <div className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-cyan-400 font-bold">LTSS (10%) - Tiết kiệm dài hạn</span>
                  <p className="font-mono font-bold text-white">{formatVND(allocationMonthlyIncome * 0.10)}</p>
                </div>

                <div className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-purple-400 font-bold">EDU (10%) - Giáo dục học tập</span>
                  <p className="font-mono font-bold text-white">{formatVND(allocationMonthlyIncome * 0.10)}</p>
                </div>

                <div className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-pink-400 font-bold">PLAY (10%) - Hưởng thụ</span>
                  <p className="font-mono font-bold text-white">{formatVND(allocationMonthlyIncome * 0.10)}</p>
                </div>

                <div className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-teal-400 font-bold">GIVE (5%) - Cho đi & Giúp đỡ</span>
                  <p className="font-mono font-bold text-white">{formatVND(allocationMonthlyIncome * 0.05)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
