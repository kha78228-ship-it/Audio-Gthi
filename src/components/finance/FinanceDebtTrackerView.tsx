import React, { useState } from 'react';
import { 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Phone, 
  Calendar, 
  X,
  Coins,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { FinanceDebtRecord, FinanceWallet } from '../../types';

interface FinanceDebtTrackerViewProps {
  debts: FinanceDebtRecord[];
  wallets: FinanceWallet[];
  onAddDebt: (debt: Omit<FinanceDebtRecord, 'id' | 'createdAt'>) => void;
  onEditDebt: (id: string, debt: Partial<FinanceDebtRecord>) => void;
  onDeleteDebt: (id: string) => void;
  onRepayDebt: (id: string, amount: number, walletId: string) => void;
}

export function FinanceDebtTrackerView({
  debts,
  wallets,
  onAddDebt,
  onEditDebt,
  onDeleteDebt,
  onRepayDebt
}: FinanceDebtTrackerViewProps) {
  const [filterType, setFilterType] = useState<'all' | 'lent' | 'borrowed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formType, setFormType] = useState<'lent' | 'borrowed'>('lent');
  const [formPersonName, setFormPersonName] = useState('');
  const [formPersonPhone, setFormPersonPhone] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formPaidAmount, setFormPaidAmount] = useState('0');
  const [formDueDate, setFormDueDate] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Repayment Modal
  const [repayDebtId, setRepayDebtId] = useState<string | null>(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayWalletId, setRepayWalletId] = useState(wallets[0]?.id || '');

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleOpenAdd = (type: 'lent' | 'borrowed' = 'lent') => {
    setEditingId(null);
    setFormType(type);
    setFormPersonName('');
    setFormPersonPhone('');
    setFormAmount('');
    setFormPaidAmount('0');
    // 30 days ahead
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setFormDueDate(d.toISOString().split('T')[0]);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (debt: FinanceDebtRecord) => {
    setEditingId(debt.id);
    setFormType(debt.type);
    setFormPersonName(debt.personName);
    setFormPersonPhone(debt.personPhone || '');
    setFormAmount(debt.amount.toString());
    setFormPaidAmount(debt.paidAmount.toString());
    setFormDueDate(debt.dueDate || '');
    setFormNotes(debt.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formAmount.replace(/[^0-9]/g, '')) || 0;
    const paidNum = parseFloat(formPaidAmount.replace(/[^0-9]/g, '')) || 0;

    if (!formPersonName.trim() || amountNum <= 0) {
      alert('Vui lòng nhập tên người liên quan và số tiền hợp lệ');
      return;
    }

    const isDone = paidNum >= amountNum;

    if (editingId) {
      onEditDebt(editingId, {
        type: formType,
        personName: formPersonName.trim(),
        personPhone: formPersonPhone.trim() || undefined,
        amount: amountNum,
        paidAmount: paidNum,
        dueDate: formDueDate || undefined,
        notes: formNotes || undefined,
        status: isDone ? 'completed' : 'active',
      });
    } else {
      onAddDebt({
        userId: 'current_user',
        type: formType,
        personName: formPersonName.trim(),
        personPhone: formPersonPhone.trim() || undefined,
        amount: amountNum,
        paidAmount: paidNum,
        dueDate: formDueDate || undefined,
        notes: formNotes || undefined,
        status: isDone ? 'completed' : 'active',
      });
    }

    setIsModalOpen(false);
  };

  const handleConfirmRepay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repayDebtId) return;
    const amountNum = parseFloat(repayAmount.replace(/[^0-9]/g, '')) || 0;
    if (amountNum <= 0) {
      alert('Vui lòng nhập số tiền thanh toán hợp lệ');
      return;
    }

    onRepayDebt(repayDebtId, amountNum, repayWalletId);
    setRepayDebtId(null);
    setRepayAmount('');
  };

  // Calculations
  const totalLent = debts
    .filter(d => d.type === 'lent' && d.status !== 'completed')
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  const totalBorrowed = debts
    .filter(d => d.type === 'borrowed' && d.status !== 'completed')
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  const filteredDebts = debts.filter(d => {
    if (filterType !== 'all' && d.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Lent Card (Người khác nợ mình) */}
        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
              <ArrowDownRight size={15} />
              Tiền Cho Vay (Người khác nợ bạn)
            </span>
            <h3 className="text-2xl font-black text-teal-300 tracking-tight">
              {formatVND(totalLent)}
            </h3>
            <p className="text-[11px] text-zinc-400">Các khoản người khác cần trả lại cho bạn</p>
          </div>
          <button
            onClick={() => handleOpenAdd('lent')}
            className="px-3.5 py-2 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold hover:bg-teal-500/30 transition-all cursor-pointer"
          >
            + Cho Vay Mới
          </button>
        </div>

        {/* Borrowed Card (Mình đi vay nợ) */}
        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <ArrowUpRight size={15} />
              Tiền Vay Nợ (Bạn cần trả)
            </span>
            <h3 className="text-2xl font-black text-rose-400 tracking-tight">
              {formatVND(totalBorrowed)}
            </h3>
            <p className="text-[11px] text-zinc-400">Các khoản vay bạn cần thanh toán đúng hạn</p>
          </div>
          <button
            onClick={() => handleOpenAdd('borrowed')}
            className="px-3.5 py-2 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/30 transition-all cursor-pointer"
          >
            + Vay Nợ Mới
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-2xl border border-zinc-800 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterType === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Tất cả ({debts.length})
          </button>
          <button
            onClick={() => setFilterType('lent')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterType === 'lent' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Cho vay ({debts.filter(d => d.type === 'lent').length})
          </button>
          <button
            onClick={() => setFilterType('borrowed')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterType === 'borrowed' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Đi vay ({debts.filter(d => d.type === 'borrowed').length})
          </button>
        </div>

        <button
          onClick={() => handleOpenAdd('lent')}
          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 text-xs font-black flex items-center gap-1 shadow-md cursor-pointer"
        >
          <Plus size={14} /> Ghi Khoản Mới
        </button>
      </div>

      {/* Debt List */}
      {filteredDebts.length === 0 ? (
        <div className="py-16 text-center bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-800 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800/60 flex items-center justify-center mx-auto text-zinc-500">
            <Users size={28} />
          </div>
          <h4 className="text-base font-bold text-zinc-300">Không có bản ghi vay nợ nào</h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Ghi chép các khoản cho bạn bè vay hoặc vay mượn người thân để nhắc nhở và quản lý trả nợ minh bạch.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDebts.map((debt) => {
            const isLent = debt.type === 'lent';
            const remaining = debt.amount - debt.paidAmount;
            const isCompleted = debt.status === 'completed' || remaining <= 0;
            const progress = Math.min(Math.round((debt.paidAmount / debt.amount) * 100), 100);

            return (
              <div
                key={debt.id}
                className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        isLent 
                          ? 'bg-teal-500/10 text-teal-300 border-teal-500/30' 
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      }`}>
                        {isLent ? 'Người khác nợ tôi' : 'Tôi nợ người khác'}
                      </span>

                      {isCompleted ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={11} /> Đã thanh toán xong
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                          <Clock size={11} /> Đang nợ
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(debt)}
                        className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                        title="Sửa"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn xóa bản ghi này không?`)) {
                            onDeleteDebt(debt.id);
                          }
                        }}
                        className="p-1 rounded-lg bg-rose-500/10 text-rose-400 hover:text-rose-300"
                        title="Xóa"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Person Name & Total */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{debt.personName}</h4>
                      {debt.personPhone && (
                        <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Phone size={10} /> {debt.personPhone}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`text-base font-black ${isLent ? 'text-teal-300' : 'text-rose-400'}`}>
                        {formatVND(debt.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Đã trả: <strong className="text-zinc-200">{formatVND(debt.paidAmount)}</strong> ({progress}%)</span>
                      <span>Còn lại: <strong className={isLent ? 'text-teal-300' : 'text-rose-400'}>{formatVND(remaining)}</strong></span>
                    </div>
                    <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isLent ? 'bg-teal-500' : 'bg-rose-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {debt.dueDate && (
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Calendar size={11} className="text-zinc-500" />
                      <span>Hạn trả: <strong>{new Date(debt.dueDate).toLocaleDateString('vi-VN')}</strong></span>
                    </div>
                  )}

                  {debt.notes && (
                    <p className="text-[11px] text-zinc-400 italic bg-zinc-950/50 p-2 rounded-xl border border-zinc-800/50">
                      "{debt.notes}"
                    </p>
                  )}
                </div>

                {/* Bottom Repay Action */}
                {!isCompleted && (
                  <button
                    onClick={() => {
                      setRepayDebtId(debt.id);
                      setRepayAmount(remaining.toString());
                    }}
                    className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Coins size={13} className="text-amber-400" />
                    <span>+ Ghi nhận trả nợ ({formatVND(remaining)})</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Repay Modal */}
      {repayDebtId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Coins size={16} className="text-amber-400" />
                Ghi Nhận Thanh Toán / Trả Nợ
              </h3>
              <button onClick={() => setRepayDebtId(null)} className="text-zinc-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmRepay} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Cộng/Trừ từ Ví *</label>
                <select
                  value={repayWalletId}
                  onChange={(e) => setRepayWalletId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-3 py-2 text-xs text-white"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({formatVND(w.balance)})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Số Tiền Trả Lần Này (VND) *</label>
                <input
                  type="number"
                  required
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-3.5 py-2.5 text-sm font-black text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRepayDebtId(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-xs font-bold text-zinc-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black"
                >
                  Xác Nhận Thanh Toán
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-black text-white">
                {editingId ? 'Chỉnh Sửa Bản Ghi' : 'Ghi Khoản Vay / Cho Vay Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-2xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setFormType('lent')}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    formType === 'lent' ? 'bg-teal-500 text-zinc-950 shadow-md' : 'text-zinc-400'
                  }`}
                >
                  Tôi Cho Vay (Thu về)
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('borrowed')}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    formType === 'borrowed' ? 'bg-rose-500 text-white shadow-md' : 'text-zinc-400'
                  }`}
                >
                  Tôi Đi Vay (Cần trả)
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Tên Người Liên Quan *</label>
                <input
                  type="text"
                  required
                  value={formPersonName}
                  onChange={(e) => setFormPersonName(e.target.value)}
                  placeholder="Ví dụ: Anh Nam bạn thân, Chị Hoa đồng nghiệp..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Số Tiền (VND) *</label>
                  <input
                    type="number"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="2000000"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Đã Trả Sẵn (VND)</label>
                  <input
                    type="number"
                    value={formPaidAmount}
                    onChange={(e) => setFormPaidAmount(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Số Điện Thoại</label>
                  <input
                    type="tel"
                    value={formPersonPhone}
                    onChange={(e) => setFormPersonPhone(e.target.value)}
                    placeholder="0988..."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Hạn Trả</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Ghi Chú</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Mượn tiền đóng tiền nhà, mua đồ..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-3 py-2 text-xs text-white"
                />
              </div>

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
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black"
                >
                  {editingId ? 'Cập Nhật' : 'Lưu Bản Ghi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
