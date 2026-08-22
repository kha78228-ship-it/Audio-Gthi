import React, { useState } from 'react';
import { 
  Repeat, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Bell, 
  X,
  Check,
  Zap
} from 'lucide-react';
import { FinanceRecurringTransaction, FinanceCategory, FinanceWallet } from '../../types';

interface FinanceRecurringViewProps {
  recurringList: FinanceRecurringTransaction[];
  categories: FinanceCategory[];
  wallets: FinanceWallet[];
  onAddRecurring: (rec: Omit<FinanceRecurringTransaction, 'id'>) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onDeleteRecurring: (id: string) => void;
}

export function FinanceRecurringView({
  recurringList,
  categories,
  wallets,
  onAddRecurring,
  onToggleActive,
  onDeleteRecurring
}: FinanceRecurringViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState<'expense' | 'income'>('expense');
  const [formCategoryId, setFormCategoryId] = useState('cat_bills');
  const [formWalletId, setFormWalletId] = useState(wallets[0]?.id || '');
  const [formDayOfRecurrence, setFormDayOfRecurrence] = useState(5);
  const [formAutoDeduct, setFormAutoDeduct] = useState(true);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleOpenAdd = () => {
    setFormTitle('');
    setFormAmount('');
    setFormType('expense');
    setFormCategoryId('cat_bills');
    setFormWalletId(wallets[0]?.id || '');
    setFormDayOfRecurrence(5);
    setFormAutoDeduct(true);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formAmount.replace(/[^0-9]/g, '')) || 0;
    if (!formTitle.trim() || amountNum <= 0) {
      alert('Vui lòng nhập tiêu đề và số tiền hợp lệ');
      return;
    }

    const today = new Date();
    let nextDate = new Date(today.getFullYear(), today.getMonth(), formDayOfRecurrence);
    if (nextDate.getTime() < today.getTime()) {
      nextDate = new Date(today.getFullYear(), today.getMonth() + 1, formDayOfRecurrence);
    }

    onAddRecurring({
      userId: 'current_user',
      title: formTitle.trim(),
      amount: amountNum,
      type: formType,
      categoryId: formCategoryId,
      walletId: formWalletId,
      frequency: 'monthly',
      dayOfRecurrence: formDayOfRecurrence,
      nextDueDate: nextDate.toISOString().split('T')[0],
      isActive: true,
      autoDeduct: formAutoDeduct,
    });

    setIsModalOpen(false);
  };

  const totalMonthlyRecurringExpense = recurringList
    .filter(r => r.type === 'expense' && r.isActive)
    .reduce((sum, r) => sum + r.amount, 0);

  const totalMonthlyRecurringIncome = recurringList
    .filter(r => r.type === 'income' && r.isActive)
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shadow-md">
            <Repeat size={22} />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>Hóa Đơn &amp; Giao Dịch Định Kỳ Hàng Tháng</span>
              <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {recurringList.length} Khoản
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Chi cố định: <strong className="text-rose-400 font-bold">{formatVND(totalMonthlyRecurringExpense)}</strong> / tháng | Thu cố định: <strong className="text-teal-400 font-bold">+{formatVND(totalMonthlyRecurringIncome)}</strong> / tháng
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-purple-500/20 cursor-pointer shrink-0"
        >
          <Plus size={15} />
          <span>+ Thêm Hóa Đơn Định Kỳ</span>
        </button>
      </div>

      {/* Recurring Cards Grid */}
      {recurringList.length === 0 ? (
        <div className="py-16 text-center bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-800 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800/60 flex items-center justify-center mx-auto text-zinc-500">
            <Repeat size={28} />
          </div>
          <h4 className="text-base font-bold text-zinc-300">Chưa có giao dịch định kỳ nào</h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Thêm các khoản chi cố định hàng tháng như tiền thuê nhà, tiền mạng, Netflix, gói tập gym để theo dõi ngân sách tự động.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-2xl bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 hover:bg-purple-500/30 transition-all cursor-pointer"
          >
            + Tạo hóa đơn đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recurringList.map((item) => {
            const cat = categories.find(c => c.id === item.categoryId);
            const wallet = wallets.find(w => w.id === item.walletId);
            const isExpense = item.type === 'expense';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 group relative ${
                  item.isActive ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700' : 'bg-zinc-950/40 border-zinc-900 opacity-60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                      isExpense 
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' 
                        : 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                    }`}>
                      {isExpense ? 'Chi định kỳ' : 'Thu định kỳ'}
                    </span>

                    <button
                      onClick={() => onToggleActive(item.id, !item.isActive)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                        item.isActive 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {item.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                    </button>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      {item.title}
                    </h4>
                    <p className={`text-base font-black mt-1 ${isExpense ? 'text-rose-400' : 'text-teal-400'}`}>
                      {isExpense ? `-${formatVND(item.amount)}` : `+${formatVND(item.amount)}`}
                    </p>
                  </div>

                  <div className="space-y-1 text-[11px] text-zinc-400 border-t border-zinc-800/60 pt-2.5">
                    <div className="flex items-center justify-between">
                      <span>Chu kỳ lặp:</span>
                      <strong className="text-zinc-200">Hàng tháng (Ngày {item.dayOfRecurrence})</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Ví thực hiện:</span>
                      <strong className="text-zinc-200">{wallet?.name || 'Ví chính'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Hạn kỳ tới:</span>
                      <strong className="text-amber-300 flex items-center gap-1">
                        <Clock size={11} /> {new Date(item.nextDueDate).toLocaleDateString('vi-VN')}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <Bell size={11} className="text-amber-400" /> Nhắc nhở trước 1 ngày
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn xóa lịch định kỳ "${item.title}" không?`)) {
                        onDeleteRecurring(item.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:text-rose-300"
                    title="Xóa lịch định kỳ"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Recurring Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-black text-white">Thêm Khoản Định Kỳ Mới</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-2xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setFormType('expense')}
                  className={`py-1.5 rounded-xl text-xs font-bold ${
                    formType === 'expense' ? 'bg-rose-500 text-white' : 'text-zinc-400'
                  }`}
                >
                  Chi Phí Định Kỳ
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('income')}
                  className={`py-1.5 rounded-xl text-xs font-bold ${
                    formType === 'income' ? 'bg-teal-500 text-white' : 'text-zinc-400'
                  }`}
                >
                  Thu Nhập Định Kỳ
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Tên Hóa Đơn / Khoản Thu *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ví dụ: Tiền thuê trọ, Netflix, Lương cứng..."
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
                    placeholder="3000000"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Ngày trong tháng (1 - 31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formDayOfRecurrence}
                    onChange={(e) => setFormDayOfRecurrence(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Danh Mục</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-3 py-2 text-xs text-white"
                  >
                    {categories.filter(c => c.type === formType).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Ví Thực Hiện</label>
                  <select
                    value={formWalletId}
                    onChange={(e) => setFormWalletId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-3 py-2 text-xs text-white"
                  >
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
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
                  className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-black"
                >
                  Lưu Khoản Định Kỳ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
