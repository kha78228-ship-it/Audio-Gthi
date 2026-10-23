import React, { useState } from 'react';
import { 
  PiggyBank, 
  Plus, 
  Target, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  Heart, 
  Sparkles, 
  Trash2, 
  Edit3, 
  Coins, 
  X,
  Check,
  Plane,
  Car,
  Laptop,
  Home,
  Shield,
  Gift,
  PieChart,
  Clock,
  Zap,
  Eye,
  Award,
  Trophy
} from 'lucide-react';
import { FinanceSavingsGoal, FinanceWallet } from '../../types';
import { D3SavingsProgressChart } from './D3SavingsProgressChart';
import { SavingsMilestonesInteractive, DEFAULT_SAVINGS_MILESTONES, SavingsMilestone } from './SavingsMilestonesInteractive';
import { SavingsMilestoneConfettiCanvas, MilestoneCelebrationData } from './SavingsMilestoneConfettiCanvas';

interface FinanceSavingsGoalsViewProps {
  goals: FinanceSavingsGoal[];
  wallets: FinanceWallet[];
  onAddGoal: (goal: Omit<FinanceSavingsGoal, 'id' | 'createdAt'>) => void;
  onEditGoal: (id: string, goal: Partial<FinanceSavingsGoal>) => void;
  onDeleteGoal: (id: string) => void;
  onDepositToGoal: (goalId: string, walletId: string, amount: number) => void;
}

const GOAL_ICONS = [
  { name: 'PiggyBank', icon: PiggyBank, label: 'Tiết kiệm' },
  { name: 'Home', icon: Home, label: 'Mua nhà' },
  { name: 'Car', icon: Car, label: 'Mua xe' },
  { name: 'Laptop', icon: Laptop, label: 'Thiết bị công nghệ' },
  { name: 'Plane', icon: Plane, label: 'Du lịch' },
  { name: 'Heart', icon: Heart, label: 'Đám cưới / Cặp đôi' },
  { name: 'Shield', icon: Shield, label: 'Quỹ khẩn cấp' },
  { name: 'Gift', icon: Gift, label: 'Quà tặng' },
];

const COLOR_PRESETS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#06b6d4'];

export function FinanceSavingsGoalsView({
  goals,
  wallets,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onDepositToGoal
}: FinanceSavingsGoalsViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formTargetAmount, setFormTargetAmount] = useState('');
  const [formCurrentAmount, setFormCurrentAmount] = useState('0');
  const [formDeadline, setFormDeadline] = useState('');
  const [formColor, setFormColor] = useState('#10b981');
  const [formIcon, setFormIcon] = useState('PiggyBank');
  const [formIsCoupleShared, setFormIsCoupleShared] = useState(false);

  // Deposit Modal State
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositWalletId, setDepositWalletId] = useState<string>(wallets[0]?.id || '');
  const [depositAmount, setDepositAmount] = useState('');

  // Selected goal for D3 Circular Progress Chart
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);
  const [celebrationData, setCelebrationData] = useState<MilestoneCelebrationData | null>(null);
  const activeGoal = (selectedGoalId ? goals.find(g => g.id === selectedGoalId) : null) || goals[0] || null;
  const activeGoalDaysLeft = activeGoal
    ? Math.ceil((new Date(activeGoal.deadlineDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const getGoalIcon = (iconName?: string, iconSize = 18) => {
    switch (iconName) {
      case 'Home': return <Home size={iconSize} />;
      case 'Car': return <Car size={iconSize} />;
      case 'Laptop': return <Laptop size={iconSize} />;
      case 'Plane': return <Plane size={iconSize} />;
      case 'Heart': return <Heart size={iconSize} />;
      case 'Shield': return <Shield size={iconSize} />;
      case 'Gift': return <Gift size={iconSize} />;
      case 'PiggyBank':
      default:
        return <PiggyBank size={iconSize} />;
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormTitle('');
    setFormTargetAmount('');
    setFormCurrentAmount('0');
    // default 6 months ahead
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    setFormDeadline(d.toISOString().split('T')[0]);
    setFormColor('#10b981');
    setFormIcon('PiggyBank');
    setFormIsCoupleShared(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: FinanceSavingsGoal) => {
    setEditingId(goal.id);
    setFormTitle(goal.title);
    setFormTargetAmount(goal.targetAmount.toString());
    setFormCurrentAmount(goal.currentAmount.toString());
    setFormDeadline(goal.deadlineDate);
    setFormColor(goal.color || '#10b981');
    setFormIcon(goal.icon || 'PiggyBank');
    setFormIsCoupleShared(!!goal.isCoupleShared);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(formTargetAmount.replace(/[^0-9]/g, '')) || 0;
    const currentNum = parseFloat(formCurrentAmount.replace(/[^0-9]/g, '')) || 0;

    if (!formTitle.trim() || targetNum <= 0) {
      alert('Vui lòng nhập tên mục tiêu và số tiền đích hợp lệ');
      return;
    }

    if (editingId) {
      onEditGoal(editingId, {
        title: formTitle.trim(),
        targetAmount: targetNum,
        currentAmount: currentNum,
        deadlineDate: formDeadline,
        color: formColor,
        icon: formIcon,
        isCompleted: currentNum >= targetNum,
        isCoupleShared: formIsCoupleShared,
      });
    } else {
      onAddGoal({
        userId: 'current_user',
        title: formTitle.trim(),
        targetAmount: targetNum,
        currentAmount: currentNum,
        deadlineDate: formDeadline,
        color: formColor,
        icon: formIcon,
        isCompleted: currentNum >= targetNum,
        isCoupleShared: formIsCoupleShared,
      });
    }

    setIsModalOpen(false);
  };

  const handleConfirmDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoalId) return;
    const amountNum = parseFloat(depositAmount.replace(/[^0-9]/g, '')) || 0;
    if (amountNum <= 0) {
      alert('Vui lòng nhập số tiền nạp hợp lệ');
      return;
    }

    const targetGoal = goals.find(g => g.id === depositGoalId);
    if (targetGoal) {
      const prevAmount = targetGoal.currentAmount;
      const nextAmount = prevAmount + amountNum;
      const validTarget = Math.max(1, targetGoal.targetAmount);
      const prevPct = (prevAmount / validTarget) * 100;
      const nextPct = (nextAmount / validTarget) * 100;

      // Find highest milestone newly crossed (e.g., 25, 50, 75, 100)
      const crossedMilestone = [...DEFAULT_SAVINGS_MILESTONES]
        .reverse()
        .find(m => prevPct < m.percentage && nextPct >= m.percentage);

      if (crossedMilestone) {
        setCelebrationData({
          goalId: targetGoal.id,
          goalTitle: targetGoal.title,
          goalColor: targetGoal.color || '#06b6d4',
          milestonePercentage: crossedMilestone.percentage,
          badgeName: crossedMilestone.badgeName,
          icon: crossedMilestone.icon,
          targetAmount: targetGoal.targetAmount,
          currentAmount: nextAmount
        });
        setSelectedMilestone(crossedMilestone.percentage);
        setSelectedGoalId(targetGoal.id);
      }
    }

    onDepositToGoal(depositGoalId, depositWalletId, amountNum);
    setDepositGoalId(null);
    setDepositAmount('');
  };

  const totalSavedAllGoals = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTargetAllGoals = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-md">
            <Target size={22} />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>Mục Tiêu Tiết Kiệm &amp; Tích Lũy</span>
              <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {goals.length} Mục tiêu
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Đã tích lũy được: <strong className="text-cyan-300 font-bold">{formatVND(totalSavedAllGoals)}</strong> / {formatVND(totalTargetAllGoals)} ({totalTargetAllGoals > 0 ? Math.round((totalSavedAllGoals / totalTargetAllGoals) * 100) : 0}%)
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 text-zinc-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer shrink-0"
        >
          <Plus size={15} />
          <span>+ Thêm Mục Tiêu Mới</span>
        </button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="py-16 text-center bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-800 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800/60 flex items-center justify-center mx-auto text-zinc-500">
            <PiggyBank size={28} />
          </div>
          <h4 className="text-base font-bold text-zinc-300">Chưa có mục tiêu tiết kiệm nào</h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Đặt mục tiêu tài chính rõ ràng như mua xe, du lịch, lập gia đình hay quỹ khẩn cấp giúp bạn kiên định tiết kiệm hơn mỗi ngày.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-2xl bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30 hover:bg-cyan-500/30 transition-all cursor-pointer"
          >
            + Đặt mục tiêu đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Featured D3.js Circular Progress Showcase */}
          {activeGoal && (
            <div 
              id="d3-savings-showcase-panel"
              className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-zinc-950 border border-zinc-800 shadow-2xl space-y-5 relative overflow-hidden"
            >
              {/* Subtle background glow matching active goal color */}
              <div 
                className="absolute -top-16 -left-16 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-700"
                style={{ backgroundColor: activeGoal.color || '#06b6d4' }}
              />

              {/* Top Bar: Section Title & Goal Switcher Tabs */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-md shrink-0 transition-colors"
                    style={{
                      backgroundColor: `${activeGoal.color || '#06b6d4'}20`,
                      borderColor: `${activeGoal.color || '#06b6d4'}50`,
                      color: activeGoal.color || '#06b6d4'
                    }}
                  >
                    {getGoalIcon(activeGoal.icon, 20)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                        <span>Tiến Độ Mục Tiêu Trực Quan</span>
                      </h4>
                      <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                        <PieChart size={11} /> D3.js Engine
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Đang phân tích: <strong className="text-white">{activeGoal.title}</strong>
                    </p>
                  </div>
                </div>

                {/* Multiple goals selector tabs */}
                {goals.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    <span className="text-[11px] font-bold text-zinc-500 shrink-0 mr-1">Chọn mục tiêu:</span>
                    {goals.map((g) => {
                      const isSelected = g.id === activeGoal.id;
                      const gPct = Math.min(100, Math.round((g.currentAmount / Math.max(1, g.targetAmount)) * 100));
                      return (
                        <button
                          key={g.id}
                          onClick={() => setSelectedGoalId(g.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                            isSelected
                              ? 'bg-zinc-800 text-white border border-zinc-600 shadow-md ring-1 ring-cyan-500/40'
                              : 'bg-zinc-950/70 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:border-zinc-700'
                          }`}
                        >
                          <span 
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: g.color || '#06b6d4' }}
                          />
                          <span className="truncate max-w-[110px]">{g.title}</span>
                          <span className="text-[10px] font-mono opacity-80">({gPct}%)</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Visual Body: D3 Circular Progress Chart & Financial Intelligence */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
                {/* Left: D3 Circular Progress Chart with interactive milestones */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 shadow-inner">
                  <D3SavingsProgressChart
                    currentAmount={activeGoal.currentAmount}
                    targetAmount={activeGoal.targetAmount}
                    color={activeGoal.color || '#06b6d4'}
                    size={230}
                    strokeWidth={17}
                    title={activeGoal.title}
                    showMilestones={true}
                    interactive={true}
                    selectedMilestone={selectedMilestone}
                    onSelectMilestone={(m) => setSelectedMilestone(m)}
                    centerIcon={
                      <div 
                        className="p-2 rounded-xl border shadow-sm"
                        style={{
                          backgroundColor: `${activeGoal.color || '#06b6d4'}20`,
                          borderColor: `${activeGoal.color || '#06b6d4'}40`,
                          color: activeGoal.color || '#06b6d4'
                        }}
                      >
                        {getGoalIcon(activeGoal.icon, 20)}
                      </div>
                    }
                  />

                  {/* Milestones Legend / Guide */}
                  <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-zinc-400 font-medium text-center">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={12} className="text-amber-400 shrink-0" />
                      <span>Nhấp vào điểm nút 25%, 50%, 75%, 100% trên vòng cung để xem huy hiệu mở khóa</span>
                    </span>
                  </div>
                </div>

                {/* Right: Detailed Metric Breakdown & Smart Recommendations */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span 
                      className="px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5"
                      style={{
                        backgroundColor: `${activeGoal.color || '#06b6d4'}15`,
                        borderColor: `${activeGoal.color || '#06b6d4'}40`,
                        color: activeGoal.color || '#06b6d4'
                      }}
                    >
                      {getGoalIcon(activeGoal.icon, 14)}
                      <span>{activeGoal.title}</span>
                    </span>

                    {activeGoal.isCoupleShared && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <Heart size={12} className="fill-rose-400 text-rose-400" /> Quỹ đôi (I Love Haevy)
                      </span>
                    )}

                    {activeGoal.currentAmount >= activeGoal.targetAmount ? (
                      <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 size={13} /> Đã Về Đích Thành Công!
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1">
                        <Clock size={12} className="text-cyan-400" />
                        {activeGoalDaysLeft > 0 ? `Còn ${activeGoalDaysLeft} ngày (Hạn: ${activeGoal.deadlineDate})` : 'Đã đến hạn'}
                      </span>
                    )}
                  </div>

                  {/* 3 Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
                      <span className="text-[11px] font-bold text-zinc-400">Đã tích lũy</span>
                      <div className="text-sm font-black text-cyan-300 font-mono">
                        {formatVND(activeGoal.currentAmount)}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        Đạt {Math.min(100, Math.round((activeGoal.currentAmount / Math.max(1, activeGoal.targetAmount)) * 100))}% kế hoạch
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
                      <span className="text-[11px] font-bold text-zinc-400">Số tiền đích</span>
                      <div className="text-sm font-black text-white font-mono">
                        {formatVND(activeGoal.targetAmount)}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        Hạn chót: {activeGoal.deadlineDate || 'Chưa đặt'}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
                      <span className="text-[11px] font-bold text-zinc-400">Còn cần tích lũy</span>
                      <div className="text-sm font-black text-rose-300 font-mono">
                        {formatVND(Math.max(0, activeGoal.targetAmount - activeGoal.currentAmount))}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {activeGoal.currentAmount >= activeGoal.targetAmount ? 'Đã hoàn thành 100%' : 'Đang tiếp tục'}
                      </div>
                    </div>
                  </div>

                  {/* Smart Savings Pace Advisor */}
                  {activeGoal.currentAmount < activeGoal.targetAmount && activeGoalDaysLeft > 0 && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-zinc-900 to-zinc-950 border border-cyan-500/25 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Zap size={16} />
                      </div>
                      <div className="text-xs space-y-0.5">
                        <div className="font-black text-cyan-200 flex items-center gap-1.5">
                          <span>Gợi Ý Tốc Độ Tiết Kiệm Định Kỳ</span>
                        </div>
                        <p className="text-zinc-300 text-[11px] leading-relaxed">
                          Để về đích trước ngày <strong className="text-white">{activeGoal.deadlineDate}</strong> ({activeGoalDaysLeft} ngày nữa), bạn cần để dành trung bình khoảng{' '}
                          <strong className="text-cyan-300 font-mono font-bold">
                            {formatVND(Math.max(0, activeGoal.targetAmount - activeGoal.currentAmount) / activeGoalDaysLeft)}
                          </strong>{' '}
                          mỗi ngày (khoảng{' '}
                          <strong className="text-cyan-300 font-mono font-bold">
                            {formatVND((Math.max(0, activeGoal.targetAmount - activeGoal.currentAmount) / activeGoalDaysLeft) * 30)}
                          </strong>{' '}
                          mỗi tháng).
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Quick Action Controls */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      onClick={() => {
                        setDepositGoalId(activeGoal.id);
                        setDepositAmount('');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 text-zinc-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
                    >
                      <Coins size={14} />
                      <span>+ Nạp Tiền Vào Mục Tiêu Này</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(activeGoal)}
                      className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 border border-zinc-700 cursor-pointer transition-all"
                    >
                      <Edit3 size={13} />
                      <span>Chỉnh sửa thông số</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Milestones & Badges Breakdown Component */}
              <div className="pt-4 border-t border-zinc-800/80 relative z-10">
                <SavingsMilestonesInteractive
                  currentAmount={activeGoal.currentAmount}
                  targetAmount={activeGoal.targetAmount}
                  goalTitle={activeGoal.title}
                  goalColor={activeGoal.color || '#06b6d4'}
                  selectedMilestone={selectedMilestone}
                  onSelectMilestone={(m) => setSelectedMilestone(m)}
                  onCelebrateMilestone={(m) => {
                    setCelebrationData({
                      goalId: activeGoal.id,
                      goalTitle: activeGoal.title,
                      goalColor: activeGoal.color || '#06b6d4',
                      milestonePercentage: m.percentage,
                      badgeName: m.badgeName,
                      icon: m.icon,
                      targetAmount: activeGoal.targetAmount,
                      currentAmount: activeGoal.currentAmount
                    });
                  }}
                />
              </div>
            </div>
          )}

          {/* Section Divider & Grid Title */}
          <div className="flex items-center justify-between pt-2">
            <h4 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
              <span>Danh Sách Tất Cả Mục Tiêu</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                {goals.length}
              </span>
            </h4>
            <span className="text-xs text-zinc-500">
              Nhấp vào mục tiêu để hiển thị trên biểu đồ tròn D3
            </span>
          </div>

          {/* Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => {
              const pct = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
              const isFinished = goal.currentAmount >= goal.targetAmount;
              const isSelectedInD3 = activeGoal?.id === goal.id;
              
              // Calculate days left
              const today = new Date();
              const deadline = new Date(goal.deadlineDate);
              const diffTime = deadline.getTime() - today.getTime();
              const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={goal.id}
                  className={`p-5 rounded-3xl bg-zinc-900/60 border transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden ${
                    isSelectedInD3
                      ? 'border-cyan-500/80 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40'
                      : 'border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div 
                    className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20"
                    style={{ backgroundColor: goal.color }}
                  />

                  <div className="space-y-3">
                    {/* Top Badges & D3 Mini Progress Gauge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm"
                          style={{
                            backgroundColor: `${goal.color}20`,
                            borderColor: `${goal.color}40`,
                            color: goal.color
                          }}
                        >
                          {getGoalIcon(goal.icon, 18)}
                        </div>
                        {isSelectedInD3 && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            Đang xem D3
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {goal.isCoupleShared && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-0.5">
                            <Heart size={10} className="fill-rose-400 text-rose-400" /> Quỹ đôi
                          </span>
                        )}
                        {isFinished ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 size={10} /> Hoàn thành
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                            {daysLeft > 0 ? `Còn ${daysLeft} ngày` : 'Quá hạn'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Target with D3 Mini Ring */}
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {goal.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Đích: <strong className="text-white">{formatVND(goal.targetAmount)}</strong>
                        </p>
                      </div>

                      {/* Mini D3 Progress Ring */}
                      <div 
                        className="shrink-0 cursor-pointer"
                        title="Xem trên biểu đồ tròn D3"
                        onClick={() => setSelectedGoalId(goal.id)}
                      >
                        <D3SavingsProgressChart
                          currentAmount={goal.currentAmount}
                          targetAmount={goal.targetAmount}
                          color={goal.color || '#06b6d4'}
                          size={54}
                          strokeWidth={6}
                          showMilestones={false}
                          interactive={false}
                        />
                      </div>
                    </div>

                    {/* Progress Bar & Milestone Badges Track */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 text-[11px]">Đã có: <strong className="text-cyan-300">{formatVND(goal.currentAmount)}</strong></span>
                        <span className="font-extrabold text-cyan-300">{pct}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800 relative">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: goal.color || '#06b6d4'
                          }}
                        />
                      </div>

                      {/* Mini Threshold Badges Indicator */}
                      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 pt-0.5 px-0.5">
                        {[25, 50, 75, 100].map((th) => {
                          const reached = pct >= th;
                          return (
                            <button
                              key={th}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedGoalId(goal.id);
                                setSelectedMilestone(th);
                                const el = document.getElementById('d3-savings-showcase-panel');
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }}
                              className={`px-1.5 py-0.5 rounded transition-all flex items-center gap-0.5 cursor-pointer ${
                                reached 
                                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold' 
                                  : 'text-zinc-500 hover:text-zinc-300'
                              }`}
                              title={`Mốc ${th}% - ${reached ? 'Đã đạt' : 'Chưa đạt'}`}
                            >
                              <span>{th === 100 ? '👑' : th === 75 ? '🚀' : th === 50 ? '⚡' : '🌱'}</span>
                              <span>{th}%</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setDepositGoalId(goal.id);
                          setDepositAmount('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Coins size={13} />
                        <span>Nạp tiền</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedGoalId(goal.id);
                          const el = document.getElementById('d3-savings-showcase-panel');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                          isSelectedInD3
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-700/60'
                        }`}
                        title="Xem mục tiêu này trên biểu đồ D3"
                      >
                        <Eye size={12} />
                        <span>Biểu đồ D3</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(goal)}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                        title="Chỉnh sửa"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có muốn xóa mục tiêu "${goal.title}"?`)) {
                            onDeleteGoal(goal.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:text-rose-300"
                        title="Xóa"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {depositGoalId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Coins size={16} className="text-cyan-400" />
                Nạp Tiền Vào Mục Tiêu Tiết Kiệm
              </h3>
              <button onClick={() => setDepositGoalId(null)} className="text-zinc-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmDeposit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Trừ từ Ví / Tài Khoản *</label>
                <select
                  value={depositWalletId}
                  onChange={(e) => setDepositWalletId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-3 py-2 text-xs text-white"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} (Số dư: {formatVND(w.balance)})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Số Tiền Nạp (VND) *</label>
                <input
                  type="number"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Ví dụ: 500000"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-3.5 py-2.5 text-sm font-black text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDepositGoalId(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-xs font-bold text-zinc-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-black"
                >
                  Xác Nhận Nạp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-black text-white">
                {editingId ? 'Chỉnh Sửa Mục Tiêu' : 'Thêm Mục Tiêu Tiết Kiệm Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Tên Mục Tiêu *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ví dụ: Mua iPhone 16 Pro Max, Đi Hàn Quốc..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Số Tiền Đích (VND) *</label>
                  <input
                    type="number"
                    required
                    value={formTargetAmount}
                    onChange={(e) => setFormTargetAmount(e.target.value)}
                    placeholder="30000000"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Đã Có Sẵn (VND)</label>
                  <input
                    type="number"
                    value={formCurrentAmount}
                    onChange={(e) => setFormCurrentAmount(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Hạn Chót Dự Kiến *</label>
                <input
                  type="date"
                  required
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Color Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Màu Sắc</label>
                <div className="flex items-center gap-2">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      className={`w-6 h-6 rounded-lg ${formColor === c ? 'ring-2 ring-white scale-110' : 'opacity-80'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Couple checkbox */}
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsCoupleShared}
                  onChange={(e) => setFormIsCoupleShared(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500"
                />
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1">
                  <Heart size={12} className="fill-rose-400 text-rose-400" />
                  Mục tiêu chung cùng người thương (I Love Haevy)
                </span>
              </label>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-xs font-bold text-zinc-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-black"
                >
                  {editingId ? 'Cập Nhật' : 'Tạo Mục Tiêu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Canvas-Based Savings Milestone Celebration Confetti */}
      <SavingsMilestoneConfettiCanvas
        celebration={celebrationData}
        onClose={() => setCelebrationData(null)}
      />
    </div>
  );
}
