import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Wallet, 
  Tag, 
  Calendar, 
  FileText, 
  Check, 
  Heart, 
  Sparkles, 
  Users, 
  TrendingDown, 
  TrendingUp,
  Receipt,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { FinanceWallet, FinanceCategory, FinanceTransaction, FamilyMember } from '../../types';

interface FinanceAddExpenseViewProps {
  wallets: FinanceWallet[];
  categories: FinanceCategory[];
  currentUserId?: string;
  onAddTransaction: (tx: Omit<FinanceTransaction, 'id' | 'createdAt'>) => void;
  onSuccess?: () => void;
}

export function FinanceAddExpenseView({
  wallets,
  categories,
  currentUserId = 'user_haevy',
  onAddTransaction,
  onSuccess,
}: FinanceAddExpenseViewProps) {
  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Math.round(val));
  };

  // Only Expense or Income (Chuyển khoản removed as requested)
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState<number>(50000);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(() => {
    const first = categories.find(c => c.type === 'expense');
    return first?.id || 'cat_food';
  });
  const [selectedWalletId, setSelectedWalletId] = useState<string>(() => wallets[0]?.id || 'wallet_cash');
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState<string>('');
  const [isFamilyShared, setIsFamilyShared] = useState<boolean>(false);
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState<string>('');
  const [isCoupleShared, setIsCoupleShared] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Load family members
  const [familyMembersList] = useState<FamilyMember[]>(() => {
    try {
      const saved = localStorage.getItem('haevy_finance_family_members_v3');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Set default member if available
  useEffect(() => {
    if (familyMembersList.length > 0 && !selectedFamilyMemberId) {
      setSelectedFamilyMemberId(familyMembersList[0].id);
    }
  }, [familyMembersList]);

  // Quick Amount chips optimized for fast mobile thumb taps
  const quickAmounts = [20000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000];

  const quickTags = ['#Ăn_uống', '#Tiền_chợ', '#Xăng_xe', '#Cà_phê', '#Gia_đình', '#Hẹn_hò', '#Mua_sắm', '#Hóa_đơn'];

  const filteredCategories = categories.filter(c => c.type === txType);

  // When switching type, automatically select appropriate first category
  const handleSwitchType = (type: 'expense' | 'income') => {
    setTxType(type);
    const first = categories.find(c => c.type === type);
    if (first) {
      setSelectedCategoryId(first.id);
    }
  };

  const handleAddQuickAmount = (val: number) => {
    setAmount(prev => prev + val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const currentWallet = wallets.find(w => w.id === selectedWalletId);
    const category = categories.find(c => c.id === selectedCategoryId);

    const fullNote = selectedTag ? `${note} ${selectedTag}`.trim() : note;

    const selectedMember = isFamilyShared ? familyMembersList.find(m => m.id === selectedFamilyMemberId) : undefined;

    // If family fund transaction, sync member spent/contributed
    if (isFamilyShared && selectedMember) {
      try {
        const saved = localStorage.getItem('haevy_finance_family_members_v3');
        if (saved) {
          const mems: FamilyMember[] = JSON.parse(saved);
          const updated = mems.map(m => {
            if (m.id === selectedMember.id) {
              if (txType === 'expense') {
                return { ...m, spentAmount: (m.spentAmount || 0) + amount };
              } else {
                return { ...m, contributedAmount: (m.contributedAmount || 0) + amount };
              }
            }
            return m;
          });
          localStorage.setItem('haevy_finance_family_members_v3', JSON.stringify(updated));
        }
      } catch (e) {}
    }

    onAddTransaction({
      userId: currentUserId,
      amount: amount,
      type: txType,
      categoryId: category?.id || 'cat_other',
      categoryName: category?.name || (txType === 'income' ? 'Thu nhập khác' : 'Chi tiêu khác'),
      walletId: selectedWalletId,
      walletName: currentWallet?.name || 'Ví tiền',
      date: date,
      note: fullNote || (txType === 'income' ? 'Khoản thu nhập' : 'Chi tiêu sinh hoạt'),
      isCoupleShared: isCoupleShared || isFamilyShared,
      isFamilyFund: isFamilyShared,
      familyMemberId: selectedMember?.id,
      familyMemberName: selectedMember?.name,
      tags: isFamilyShared ? ['family', 'family_fund'] : isCoupleShared ? ['couple'] : []
    });

    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      if (onSuccess) onSuccess();
    }, 1200);

    // Reset form to sensible defaults
    setAmount(50000);
    setNote('');
    setSelectedTag('');
  };

  return (
    <div className="w-full max-w-xl mx-auto px-1 sm:px-0 space-y-4 sm:space-y-5">
      {/* Toast */}
      {showSuccessToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-emerald-500 text-zinc-950 font-black text-sm flex items-center gap-2 shadow-2xl shadow-emerald-500/40 animate-in slide-in-from-top-4">
          <CheckCircle2 size={18} />
          <span>Đã lưu khoản {txType === 'expense' ? 'chi tiêu' : 'thu nhập'} thành công!</span>
        </div>
      )}

      {/* Main Form Card - Responsive & Mobile-Balanced */}
      <div className="p-4 sm:p-7 rounded-3xl bg-zinc-900/95 border border-zinc-800 shadow-2xl space-y-4 sm:space-y-6">
        {/* Title Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 flex items-center justify-center font-black shadow-md shadow-emerald-500/20">
              <Plus size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                {txType === 'expense' ? 'Ghi Khoản Chi Tiêu' : 'Ghi Khoản Thu Nhập'}
              </h2>
              <p className="text-[11px] text-zinc-400">Tự động cập nhật số dư ví &amp; ngân sách</p>
            </div>
          </div>

          <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${
            txType === 'expense' 
              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' 
              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
          }`}>
            {txType === 'expense' ? '🔻 Chi Tiền' : '🟢 Nhận Tiền'}
          </span>
        </div>

        {/* Transaction Type Segmented Switcher (2 Columns only: Chi Tiêu vs Thu Nhập) */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
          <button
            type="button"
            onClick={() => handleSwitchType('expense')}
            className={`py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              txType === 'expense'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-[1.01]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <TrendingDown size={16} />
            <span>Khoản Chi 🔻</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchType('income')}
            className={`py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              txType === 'income'
                ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/30 scale-[1.01]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <TrendingUp size={16} />
            <span>Khoản Thu 🟢</span>
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Amount Display & Input */}
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-zinc-950 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
              <span className="uppercase tracking-wider">Số tiền</span>
              <button 
                type="button" 
                onClick={() => setAmount(0)}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
              >
                Xóa số
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={amount === 0 ? '' : amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                className={`w-full bg-transparent font-mono text-3xl sm:text-4xl font-black outline-none ${
                  txType === 'income' ? 'text-emerald-400' : 'text-rose-400'
                }`}
                placeholder="0"
                required
                autoFocus
              />
              <span className="text-sm font-black text-zinc-500 font-mono shrink-0">VNĐ</span>
            </div>

            <div className="text-xs font-bold text-zinc-400 font-mono truncate">
              {formatVND(amount)}
            </div>

            {/* Quick Amount Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-zinc-900 scrollbar-none">
              {quickAmounts.map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddQuickAmount(val)}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-300 border border-zinc-800 text-[11px] sm:text-xs font-mono font-bold transition-all cursor-pointer shrink-0"
                >
                  +{val >= 1000000 ? `${val / 1000000}Tr` : `${val / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 flex items-center justify-between">
              <span>Danh Mục {txType === 'expense' ? 'Chi Tiêu' : 'Thu Nhập'}</span>
              <span className="text-[11px] text-emerald-400">Chọn 1 danh mục</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 sm:max-h-56 overflow-y-auto scrollbar-thin pr-1">
              {filteredCategories.map(cat => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`p-2.5 sm:p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center gap-2 min-w-0 ${
                      isSelected
                        ? 'bg-zinc-800 border-emerald-500 text-white font-bold shadow-md ring-1 ring-emerald-500/50'
                        : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-lg shrink-0">{cat.icon}</span>
                    <span className="text-xs truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wallets & Date Grid (Responsive on Mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                <Wallet size={13} className="text-emerald-400" />
                <span>{txType === 'income' ? 'Nạp vào Ví / Tài khoản' : 'Nguồn Tiền (Ví / Ngân hàng)'}</span>
              </label>
              <select
                value={selectedWalletId}
                onChange={(e) => setSelectedWalletId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-2xl px-3.5 py-3 text-xs font-bold text-white outline-none cursor-pointer"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({formatVND(w.balance)})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                <Calendar size={13} className="text-teal-400" />
                <span>Ngày Thực Hiện</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-2xl px-3.5 py-3 text-xs font-bold text-white outline-none"
              />
            </div>
          </div>

          {/* Note Input & Quick Tags */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 flex items-center gap-1">
              <FileText size={13} className="text-zinc-400" />
              <span>Ghi Chú Chi Tiết</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Ăn sáng, tiền xăng, chợ đầu mối, lương tháng..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-2xl px-3.5 py-3 text-xs text-white placeholder-zinc-500 outline-none"
            />

            {/* Quick Tag Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {quickTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                    selectedTag === tag
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                      : 'bg-zinc-950 text-zinc-500 border border-zinc-800 hover:text-zinc-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Shared Vault Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <label className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-teal-500/40 flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFamilyShared}
                onChange={(e) => setIsFamilyShared(e.target.checked)}
                className="w-4 h-4 rounded text-teal-500 focus:ring-0 cursor-pointer"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                  <Users size={14} className="text-teal-400 shrink-0" />
                  <span>Quỹ Chung Gia Đình</span>
                </span>
                <span className="text-[10px] text-zinc-400 block truncate">Đồng bộ vào báo cáo chi tiêu gia đình</span>
              </div>
            </label>

            <label className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-rose-500/40 flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isCoupleShared}
                onChange={(e) => setIsCoupleShared(e.target.checked)}
                className="w-4 h-4 rounded text-rose-500 focus:ring-0 cursor-pointer"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                  <Heart size={14} className="text-rose-400 fill-rose-500/20 shrink-0" />
                  <span>Quỹ Cặp Đôi (I Love Haevy)</span>
                </span>
                <span className="text-[10px] text-zinc-400 block truncate">Hẹn hò hoặc kế hoạch tương lai đôi</span>
              </div>
            </label>
          </div>

          {/* Big Action Submit Button */}
          <button
            type="submit"
            className={`w-full py-3.5 sm:py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer active:scale-[0.99] ${
              txType === 'expense'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 text-white shadow-rose-500/25'
                : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-zinc-950 shadow-emerald-500/25'
            }`}
          >
            <Check size={18} />
            <span>
              {txType === 'expense' ? 'Lưu Khoản Chi Tiêu 🔻' : 'Lưu Khoản Thu Nhập 🟢'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
