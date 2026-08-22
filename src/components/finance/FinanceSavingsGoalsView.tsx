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
  Gift
} from 'lucide-react';
import { FinanceSavingsGoal, FinanceWallet } from '../../types';

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const pct = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
            const isFinished = goal.currentAmount >= goal.targetAmount;
            
            // Calculate days left
            const today = new Date();
            const deadline = new Date(goal.deadlineDate);
            const diffTime = deadline.getTime() - today.getTime();
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return (
              <div
                key={goal.id}
                className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden"
              >
                <div 
                  className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20"
                  style={{ backgroundColor: goal.color }}
                />

                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <div 
                      className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm"
                      style={{
                        backgroundColor: `${goal.color}20`,
                        borderColor: `${goal.color}40`,
                        color: goal.color
                      }}
                    >
                      <Target size={18} />
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

                  {/* Title & Target */}
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {goal.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Đích: <strong className="text-white">{formatVND(goal.targetAmount)}</strong>
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 text-[11px]">Đã có: <strong className="text-cyan-300">{formatVND(goal.currentAmount)}</strong></span>
                      <span className="font-extrabold text-cyan-300">{pct}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: goal.color || '#06b6d4'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setDepositGoalId(goal.id);
                      setDepositAmount('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Coins size={13} />
                    <span>Nạp tiền vào mục tiêu</span>
                  </button>

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
    </div>
  );
}
