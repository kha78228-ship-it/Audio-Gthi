import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowLeftRight,
  Calendar, 
  Trash2, 
  Edit3, 
  Heart, 
  Tag, 
  FileSpreadsheet,
  Check, 
  X, 
  Sparkles,
  Utensils,
  Car,
  Receipt,
  Home,
  ShoppingCart,
  HeartPulse,
  ShoppingBag,
  Film,
  GraduationCap,
  Gift,
  PiggyBank,
  TrendingUp,
  Shield,
  Briefcase,
  Award,
  Laptop,
  LineChart,
  Headphones,
  PlusCircle,
  Copy,
  Eye,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Layers,
  ArrowUpDown,
  Download,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Clock,
  Mic,
  Wallet as WalletIcon
} from 'lucide-react';
import { FinanceTransaction, FinanceWallet, FinanceCategory } from '../../types';

interface FinanceTransactionListProps {
  transactions: FinanceTransaction[];
  wallets: FinanceWallet[];
  categories: FinanceCategory[];
  selectedMonth: string;
  onAddTransaction: (tx: Omit<FinanceTransaction, 'id' | 'createdAt'>) => void;
  onEditTransaction: (id: string, tx: Partial<FinanceTransaction>) => void;
  onDeleteTransaction: (id: string) => void;
  onExportCSV: () => void;
  onOpenVoiceExpense?: () => void;
}

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  Car,
  Receipt,
  Home,
  ShoppingCart,
  HeartPulse,
  ShoppingBag,
  Film,
  Heart,
  GraduationCap,
  Gift,
  PiggyBank,
  TrendingUp,
  Shield,
  Briefcase,
  Award,
  Laptop,
  LineChart,
  Headphones,
  PlusCircle,
};

export function FinanceTransactionList({
  transactions,
  wallets,
  categories,
  selectedMonth,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onExportCSV,
  onOpenVoiceExpense
}: FinanceTransactionListProps) {
  // View mode: 'table' (Haevy Admin style) vs 'cards' (Timeline cards)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income' | 'transfer'>('all');
  const [walletFilter, setWalletFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [fundFilter, setFundFilter] = useState<'all' | 'personal' | 'couple'>('all');
  const [amountRangeFilter, setAmountRangeFilter] = useState<'all' | 'under100k' | '100k_1m' | '1m_5m' | 'above5m'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Selected for Batch Operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Inspector & Modal States
  const [inspectingTx, setInspectingTx] = useState<FinanceTransaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [batchActionModal, setBatchActionModal] = useState<'delete' | 'change_category' | 'change_wallet' | null>(null);
  const [batchTargetCategory, setBatchTargetCategory] = useState<string>(categories[0]?.id || 'cat_food');
  const [batchTargetWallet, setBatchTargetWallet] = useState<string>(wallets[0]?.id || 'wallet_cash');

  // Form State
  const [formType, setFormType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formCategoryId, setFormCategoryId] = useState<string>('cat_food');
  const [formWalletId, setFormWalletId] = useState<string>(wallets[0]?.id || 'wallet_cash');
  const [formToWalletId, setFormToWalletId] = useState<string>(wallets[1]?.id || 'wallet_vcb');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formNote, setFormNote] = useState<string>('');
  const [formIsCoupleShared, setFormIsCoupleShared] = useState<boolean>(false);
  const [formSplitWithPartner, setFormSplitWithPartner] = useState<boolean>(false);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Month filtered
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Filtered and Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return monthTransactions.filter(tx => {
      // Search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchNote = tx.note?.toLowerCase().includes(q);
        const matchCat = tx.categoryName?.toLowerCase().includes(q) || tx.categoryId.toLowerCase().includes(q);
        const matchWallet = tx.walletName?.toLowerCase().includes(q) || tx.walletId.toLowerCase().includes(q);
        const matchId = tx.id.toLowerCase().includes(q);
        const matchAmount = tx.amount.toString().includes(q);
        if (!matchNote && !matchCat && !matchWallet && !matchId && !matchAmount) {
          return false;
        }
      }

      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) {
        return false;
      }

      // Wallet filter
      if (walletFilter !== 'all' && tx.walletId !== walletFilter && tx.toWalletId !== walletFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) {
        return false;
      }

      // Fund filter
      if (fundFilter === 'couple' && !tx.isCoupleShared) return false;
      if (fundFilter === 'personal' && tx.isCoupleShared) return false;

      // Amount range
      if (amountRangeFilter === 'under100k' && tx.amount >= 100000) return false;
      if (amountRangeFilter === '100k_1m' && (tx.amount < 100000 || tx.amount > 1000000)) return false;
      if (amountRangeFilter === '1m_5m' && (tx.amount < 1000000 || tx.amount > 5000000)) return false;
      if (amountRangeFilter === 'above5m' && tx.amount <= 5000000) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });
  }, [monthTransactions, searchTerm, typeFilter, walletFilter, categoryFilter, fundFilter, amountRangeFilter, sortBy]);

  // Summary statistics for current filtered records
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let transfer = 0;
    let couple = 0;

    filteredTransactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      if (t.type === 'expense') expense += t.amount;
      if (t.type === 'transfer') transfer += t.amount;
      if (t.isCoupleShared) couple += t.amount;
    });

    return {
      count: filteredTransactions.length,
      income,
      expense,
      net: income - expense,
      transfer,
      couple,
      avg: filteredTransactions.length > 0 ? Math.round((income + expense) / filteredTransactions.length) : 0
    };
  }, [filteredTransactions]);

  // Grouped by date for cards view
  const groupedByDate = useMemo(() => {
    const map: Record<string, FinanceTransaction[]> = {};
    filteredTransactions.forEach(tx => {
      const dateKey = tx.date.split('T')[0];
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(tx);
    });
    return map;
  }, [filteredTransactions]);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  // Batch Selection Handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map(t => t.id));
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} giao dịch đã chọn?`)) {
      selectedIds.forEach(id => onDeleteTransaction(id));
      setSelectedIds([]);
      setBatchActionModal(null);
    }
  };

  const handleBatchMarkCouple = (isCouple: boolean) => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach(id => {
      onEditTransaction(id, { isCoupleShared: isCouple });
    });
    setSelectedIds([]);
  };

  const handleBatchApplyCategory = () => {
    if (selectedIds.length === 0) return;
    const cat = categories.find(c => c.id === batchTargetCategory);
    selectedIds.forEach(id => {
      onEditTransaction(id, { 
        categoryId: batchTargetCategory, 
        categoryName: cat?.name || 'Chưa phân loại' 
      });
    });
    setSelectedIds([]);
    setBatchActionModal(null);
  };

  const handleBatchApplyWallet = () => {
    if (selectedIds.length === 0) return;
    const wal = wallets.find(w => w.id === batchTargetWallet);
    selectedIds.forEach(id => {
      onEditTransaction(id, { 
        walletId: batchTargetWallet, 
        walletName: wal?.name || 'Ví chính' 
      });
    });
    setSelectedIds([]);
    setBatchActionModal(null);
  };

  // Open Add / Edit Modal
  const handleOpenAddModal = (presetType: 'expense' | 'income' | 'transfer' = 'expense') => {
    setEditingId(null);
    setFormType(presetType);
    setFormAmount('');
    setFormCategoryId(presetType === 'income' ? 'inc_salary' : 'cat_food');
    setFormWalletId(wallets[0]?.id || 'wallet_cash');
    setFormToWalletId(wallets[1]?.id || 'wallet_vcb');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormNote('');
    setFormIsCoupleShared(false);
    setFormSplitWithPartner(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tx: FinanceTransaction) => {
    setEditingId(tx.id);
    setFormType(tx.type);
    setFormAmount(tx.amount.toString());
    setFormCategoryId(tx.categoryId);
    setFormWalletId(tx.walletId);
    setFormToWalletId(tx.toWalletId || wallets[1]?.id || 'wallet_vcb');
    setFormDate(tx.date.split('T')[0]);
    setFormNote(tx.note || '');
    setFormIsCoupleShared(Boolean(tx.isCoupleShared));
    setFormSplitWithPartner(Boolean(tx.splitWithPartner));
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(formAmount.replace(/[^0-9]/g, ''));
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ (> 0 VND)');
      return;
    }

    const selectedCat = categories.find(c => c.id === formCategoryId);
    const selectedWallet = wallets.find(w => w.id === formWalletId);
    const selectedToWallet = formType === 'transfer' ? wallets.find(w => w.id === formToWalletId) : undefined;

    if (editingId) {
      onEditTransaction(editingId, {
        amount: parsedAmount,
        type: formType,
        categoryId: formType === 'transfer' ? 'cat_transfer' : formCategoryId,
        categoryName: formType === 'transfer' ? 'Chuyển tiền nội bộ' : (selectedCat?.name || 'Chưa phân loại'),
        walletId: formWalletId,
        walletName: selectedWallet?.name || 'Ví chính',
        toWalletId: formType === 'transfer' ? formToWalletId : undefined,
        toWalletName: selectedToWallet?.name,
        date: formDate,
        note: formNote,
        isCoupleShared: formIsCoupleShared,
        splitWithPartner: formSplitWithPartner,
      });
    } else {
      onAddTransaction({
        userId: 'current_user',
        amount: parsedAmount,
        type: formType,
        categoryId: formType === 'transfer' ? 'cat_transfer' : formCategoryId,
        categoryName: formType === 'transfer' ? 'Chuyển tiền nội bộ' : (selectedCat?.name || 'Chưa phân loại'),
        walletId: formWalletId,
        walletName: selectedWallet?.name || 'Ví chính',
        toWalletId: formType === 'transfer' ? formToWalletId : undefined,
        toWalletName: selectedToWallet?.name,
        date: formDate,
        note: formNote,
        isCoupleShared: formIsCoupleShared,
        splitWithPartner: formSplitWithPartner,
      });
    }

    setIsModalOpen(false);
  };

  const handleAddPresetAmount = (addVal: number) => {
    const current = parseFloat(formAmount.replace(/[^0-9]/g, '')) || 0;
    setFormAmount((current + addVal).toString());
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Admin Control Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-emerald-500/30 p-5 sm:p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
              <ShieldCheck size={14} className="text-emerald-400" />
              Sổ Giao Dịch &amp; Kiểm Toán
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 flex-wrap">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Lịch Sử Dòng Tiền &amp; Biến Động Số Dư
              </span>
            </h2>
            <p className="text-xs text-zinc-400 max-w-xl">
              Tra cứu, tìm kiếm thông minh, lọc đa chiều và quản lý dữ liệu chi tiêu cá nhân &amp; gia đình.
            </p>
          </div>

          {/* Quick Actions & Export */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {onOpenVoiceExpense && (
              <button
                onClick={onOpenVoiceExpense}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/25 active:scale-95"
                title="Ghi chép chi tiêu bằng giọng nói tiếng Việt"
              >
                <Mic size={15} className="animate-pulse" />
                <span>Nói Ghi Chi Tiêu</span>
              </button>
            )}

            <button
              onClick={() => handleOpenAddModal('expense')}
              className="px-4 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Plus size={15} className="text-emerald-400" />
              <span>+ Thêm Giao Dịch</span>
            </button>

            <button
              onClick={onExportCSV}
              className="px-4 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              title="Xuất danh sách ra file CSV / Excel"
            >
              <FileSpreadsheet size={15} className="text-emerald-400" />
              <span>Xuất CSV / Excel</span>
            </button>
          </div>
        </div>

        {/* Quick Admin Audit Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-5 pt-5 border-t border-zinc-800/80">
          <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-2xl p-3">
            <span className="text-[11px] text-zinc-400 font-semibold block">Tổng Số Bản Ghi</span>
            <p className="text-lg font-black text-white font-mono mt-0.5">{stats.count}</p>
            <p className="text-[10px] text-zinc-500">Tháng {selectedMonth}</p>
          </div>

          <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-2xl p-3">
            <span className="text-[11px] text-teal-400 font-semibold block">Tổng Thu Nhập</span>
            <p className="text-base font-black text-teal-300 font-mono mt-0.5">+{formatVND(stats.income)}</p>
            <p className="text-[10px] text-zinc-500">Đã cộng vào ví</p>
          </div>

          <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-2xl p-3">
            <span className="text-[11px] text-rose-400 font-semibold block">Tổng Chi Tiêu</span>
            <p className="text-base font-black text-rose-300 font-mono mt-0.5">-{formatVND(stats.expense)}</p>
            <p className="text-[10px] text-zinc-500">Đã trừ khỏi ví</p>
          </div>

          <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-2xl p-3">
            <span className="text-[11px] text-emerald-400 font-semibold block">Dòng Tiền Ròng (Net)</span>
            <p className={`text-base font-black font-mono mt-0.5 ${stats.net >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
              {stats.net >= 0 ? '+' : ''}{formatVND(stats.net)}
            </p>
            <p className="text-[10px] text-zinc-500">Thặng dư tích lũy</p>
          </div>

          <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-2xl p-3">
            <span className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
              <Heart size={11} className="fill-rose-400" /> Quỹ Cặp Đôi
            </span>
            <p className="text-base font-black text-rose-200 font-mono mt-0.5">{formatVND(stats.couple)}</p>
            <p className="text-[10px] text-zinc-500">I Love Haevy</p>
          </div>

          <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-2xl p-3">
            <span className="text-[11px] text-cyan-400 font-semibold block">TB / Giao Dịch</span>
            <p className="text-base font-black text-cyan-300 font-mono mt-0.5">{formatVND(stats.avg)}</p>
            <p className="text-[10px] text-zinc-500">Mức chi trung bình</p>
          </div>
        </div>
      </div>

      {/* Admin Multi-Filter & Search Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        {/* Row 1: Search & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo ghi chú, danh mục, tên ví, mã ID (#tx_...)..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-2xl shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileText size={14} />
              <span>Bảng Quản Trị (Admin)</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers size={14} />
              <span>Thẻ Dòng Thời Gian</span>
            </button>
          </div>
        </div>

        {/* Row 2: Filter Pills & Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/80">
          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                typeFilter === 'all'
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              Tất Cả ({monthTransactions.length})
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                typeFilter === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'bg-zinc-950 text-rose-400 hover:text-rose-300 border border-zinc-800'
              }`}
            >
              <ArrowUpRight size={13} />
              <span>Chi Tiêu</span>
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                typeFilter === 'income'
                  ? 'bg-teal-500 text-black shadow-md shadow-teal-500/20'
                  : 'bg-zinc-950 text-teal-400 hover:text-teal-300 border border-zinc-800'
              }`}
            >
              <ArrowDownRight size={13} />
              <span>Thu Nhập</span>
            </button>
            <button
              onClick={() => setTypeFilter('transfer')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                typeFilter === 'transfer'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'bg-zinc-950 text-cyan-400 hover:text-cyan-300 border border-zinc-800'
              }`}
            >
              <ArrowLeftRight size={13} />
              <span>Chuyển Ví</span>
            </button>
          </div>

          {/* Advanced Dropdowns & Fund Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Wallet Dropdown */}
            <select
              value={walletFilter}
              onChange={(e) => setWalletFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">Tất cả ví ({wallets.length})</option>
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>

            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">Tất cả danh mục ({categories.length})</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Fund Filter */}
            <select
              value={fundFilter}
              onChange={(e) => setFundFilter(e.target.value as any)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">Tất cả nguồn quỹ</option>
              <option value="personal">Chỉ quỹ cá nhân</option>
              <option value="couple">Chỉ quỹ cặp đôi 💕</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-emerald-300 focus:outline-none focus:border-emerald-500 cursor-pointer font-bold"
            >
              <option value="date_desc">Mới nhất trước</option>
              <option value="date_asc">Cũ nhất trước</option>
              <option value="amount_desc">Số tiền lớn nhất</option>
              <option value="amount_asc">Số tiền nhỏ nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batch Operations Bar (Haevy Admin Style) */}
      {selectedIds.length > 0 && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-black text-xs">
              {selectedIds.length}
            </span>
            <div>
              <p className="text-xs font-bold text-white">Đang chọn {selectedIds.length} giao dịch</p>
              <p className="text-[11px] text-emerald-300">Thao tác quản trị hàng loạt dữ liệu</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleBatchMarkCouple(true)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Heart size={13} className="fill-rose-400" />
              <span>Gán Quỹ Đôi</span>
            </button>

            <button
              onClick={() => setBatchActionModal('change_category')}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Tag size={13} className="text-amber-400" />
              <span>Đổi Danh Mục</span>
            </button>

            <button
              onClick={() => setBatchActionModal('change_wallet')}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <WalletIcon size={13} className="text-cyan-400" />
              <span>Đổi Ví</span>
            </button>

            <button
              onClick={handleBatchDelete}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 size={13} />
              <span>Xóa ({selectedIds.length})</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-bold transition-colors cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Main Content: TABLE VIEW (Admin Style) */}
      {viewMode === 'table' ? (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          {filteredTransactions.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center mx-auto text-zinc-500">
                <Receipt size={32} />
              </div>
              <h4 className="text-base font-bold text-zinc-300">Không tìm thấy giao dịch nào</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Không có bản ghi phù hợp với bộ lọc hoặc từ khóa tìm kiếm trong tháng {selectedMonth}.
              </p>
              <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
                {onOpenVoiceExpense && (
                  <button
                    onClick={onOpenVoiceExpense}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-xs shadow-lg hover:from-emerald-400 hover:to-teal-300 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Mic size={15} />
                    <span>Nói Để Ghi Nhanh</span>
                  </button>
                )}
                <button
                  onClick={() => handleOpenAddModal('expense')}
                  className="px-5 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-750 text-white font-bold text-xs border border-zinc-700 transition-all cursor-pointer"
                >
                  + Ghi Thủ Công
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/70 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-10">
                      <button
                        onClick={handleSelectAll}
                        className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0 ? (
                          <CheckSquare size={16} className="text-emerald-400" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                    <th className="py-3.5 px-3">Mã GD &amp; Thời Gian</th>
                    <th className="py-3.5 px-3">Danh Mục &amp; Loại</th>
                    <th className="py-3.5 px-3">Tài Khoản / Ví</th>
                    <th className="py-3.5 px-3">Ghi Chú &amp; Chi Tiết</th>
                    <th className="py-3.5 px-3">Phân Loại Quỹ</th>
                    <th className="py-3.5 px-3 text-right">Số Tiền (VND)</th>
                    <th className="py-3.5 px-4 text-center w-28">Thao Tác Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {filteredTransactions.map((tx) => {
                    const isSelected = selectedIds.includes(tx.id);
                    const catObj = categories.find(c => c.id === tx.categoryId);
                    const IconComponent = catObj ? (CATEGORY_ICON_MAP[catObj.icon] || Tag) : Tag;
                    const dateFormatted = new Date(tx.date).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    });

                    return (
                      <tr
                        key={tx.id}
                        className={`group transition-colors hover:bg-zinc-800/50 ${
                          isSelected ? 'bg-emerald-950/20' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleSelect(tx.id)}
                            className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare size={16} className="text-emerald-400" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>

                        {/* ID & Date */}
                        <td className="py-3.5 px-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 font-mono text-[11px] text-zinc-300 font-bold">
                              <span>#{tx.id.slice(-8)}</span>
                              <button
                                onClick={() => handleCopy(tx.id, tx.id)}
                                className="text-zinc-500 hover:text-emerald-400 transition-colors"
                                title="Sao chép Mã Giao Dịch"
                              >
                                {copiedId === tx.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                              </button>
                            </div>
                            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                              <Calendar size={11} /> {dateFormatted}
                            </span>
                          </div>
                        </td>

                        {/* Category & Type */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border shadow-sm"
                              style={{ 
                                backgroundColor: `${catObj?.color || '#10b981'}18`,
                                borderColor: `${catObj?.color || '#10b981'}40`,
                                color: catObj?.color || '#10b981'
                              }}
                            >
                              <IconComponent size={14} />
                            </div>
                            <div>
                              <p className="font-bold text-white">{tx.categoryName || 'Chưa phân loại'}</p>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                                tx.type === 'income'
                                  ? 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                                  : tx.type === 'transfer'
                                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                              }`}>
                                {tx.type === 'income' ? 'Thu nhập' : tx.type === 'transfer' ? 'Chuyển tiền' : 'Chi tiêu'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Wallet */}
                        <td className="py-3.5 px-3">
                          <div className="space-y-0.5">
                            <span className="font-medium text-zinc-300">{tx.walletName || 'Ví chính'}</span>
                            {tx.type === 'transfer' && tx.toWalletName && (
                              <p className="text-[11px] text-cyan-400 flex items-center gap-1 font-bold">
                                ➔ {tx.toWalletName}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Note & Description */}
                        <td className="py-3.5 px-3 max-w-[200px]">
                          <p className="text-zinc-200 truncate font-medium" title={tx.note || ''}>
                            {tx.note || <span className="text-zinc-600 italic">Không có ghi chú</span>}
                          </p>
                          {tx.splitWithPartner && (
                            <span className="text-[10px] text-pink-300 font-bold">
                              Chia đôi 50/50 ({formatVND(Math.round(tx.amount / 2))})
                            </span>
                          )}
                        </td>

                        {/* Fund Tag */}
                        <td className="py-3.5 px-3">
                          {tx.isCoupleShared ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                              <Heart size={10} className="fill-rose-400 text-rose-400" />
                              Quỹ Đôi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-medium">
                              Cá Nhân
                            </span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-3 text-right">
                          <span className={`font-mono text-sm font-black tracking-tight ${
                            tx.type === 'income'
                              ? 'text-teal-400'
                              : tx.type === 'transfer'
                              ? 'text-cyan-300'
                              : 'text-rose-400'
                          }`}>
                            {tx.type === 'income' ? `+${formatVND(tx.amount)}` : tx.type === 'transfer' ? formatVND(tx.amount) : `-${formatVND(tx.amount)}`}
                          </span>
                        </td>

                        {/* Admin Action Buttons */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setInspectingTx(tx)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-emerald-300 transition-colors cursor-pointer"
                              title="Xem chi tiết kiểm toán"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(tx)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              title="Chỉnh sửa giao dịch"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Bạn có chắc chắn muốn xóa giao dịch #${tx.id.slice(-6)}?`)) {
                                  onDeleteTransaction(tx.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                              title="Xóa giao dịch"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* CARDS TIMELINE VIEW */
        <div className="space-y-5">
          {sortedDates.length === 0 ? (
            <div className="py-16 text-center bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-800/80 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center mx-auto text-zinc-500">
                <Receipt size={28} />
              </div>
              <h4 className="text-base font-bold text-zinc-300">Chưa có giao dịch nào</h4>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Hãy bắt đầu ghi chép các khoản chi tiêu hoặc thu nhập hàng ngày.
              </p>
            </div>
          ) : (
            sortedDates.map((dateStr) => {
              const dayTxs = groupedByDate[dateStr];
              const dayTotalExpense = dayTxs
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
              const dayTotalIncome = dayTxs
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

              const isToday = dateStr === new Date().toISOString().split('T')[0];
              const displayDate = new Date(dateStr).toLocaleDateString('vi-VN', {
                weekday: 'long',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });

              return (
                <div key={dateStr} className="space-y-2">
                  <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white capitalize">{displayDate}</span>
                      {isToday && (
                        <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Hôm nay
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-bold">
                      {dayTotalIncome > 0 && <span className="text-teal-400">+{formatVND(dayTotalIncome)}</span>}
                      {dayTotalExpense > 0 && <span className="text-rose-400">-{formatVND(dayTotalExpense)}</span>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {dayTxs.map((tx) => {
                      const catObj = categories.find(c => c.id === tx.categoryId);
                      const IconComponent = catObj ? (CATEGORY_ICON_MAP[catObj.icon] || Tag) : Tag;

                      return (
                        <div
                          key={tx.id}
                          className="group flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/70 hover:border-zinc-700 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm"
                              style={{ 
                                backgroundColor: `${catObj?.color || '#10b981'}15`,
                                borderColor: `${catObj?.color || '#10b981'}30`,
                                color: catObj?.color || '#10b981'
                              }}
                            >
                              <IconComponent size={18} />
                            </div>

                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                                  {tx.note || tx.categoryName}
                                </h5>
                                {tx.isCoupleShared && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 flex items-center gap-0.5">
                                    <Heart size={10} className="fill-rose-400 text-rose-400" /> Quỹ đôi
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                                <span>{tx.categoryName}</span>
                                <span>•</span>
                                <span className="text-zinc-300 font-medium">{tx.walletName}</span>
                                {tx.type === 'transfer' && tx.toWalletName && (
                                  <span className="text-cyan-300 flex items-center gap-1">
                                    → {tx.toWalletName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-sm font-black tracking-tight ${
                              tx.type === 'income' 
                                ? 'text-teal-400' 
                                : tx.type === 'transfer' 
                                ? 'text-cyan-300' 
                                : 'text-rose-400'
                            }`}>
                              {tx.type === 'income' ? `+${formatVND(tx.amount)}` : tx.type === 'transfer' ? formatVND(tx.amount) : `-${formatVND(tx.amount)}`}
                            </span>

                            <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setInspectingTx(tx)}
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                title="Xem chi tiết"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(tx)}
                                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                title="Sửa"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Bạn có chắc muốn xóa giao dịch này?')) {
                                    onDeleteTransaction(tx.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
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
              );
            })
          )}
        </div>
      )}

      {/* INSPECT TRANSACTION AUDIT MODAL (Admin Style) */}
      {inspectingTx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Chi Tiết Kiểm Toán Giao Dịch</h3>
                  <p className="text-[11px] text-zinc-400">Hồ sơ bản ghi tài chính hệ thống</p>
                </div>
              </div>
              <button
                onClick={() => setInspectingTx(null)}
                className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400 font-medium">Mã giao dịch (ID):</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-white">
                  <span>{inspectingTx.id}</span>
                  <button
                    onClick={() => handleCopy(inspectingTx.id, 'inspect-id')}
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    {copiedId === 'inspect-id' ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400 font-medium">Số tiền &amp; Dòng tiền:</span>
                <span className={`text-base font-black font-mono ${
                  inspectingTx.type === 'income' ? 'text-teal-400' : inspectingTx.type === 'transfer' ? 'text-cyan-300' : 'text-rose-400'
                }`}>
                  {inspectingTx.type === 'income' ? `+${formatVND(inspectingTx.amount)}` : inspectingTx.type === 'transfer' ? formatVND(inspectingTx.amount) : `-${formatVND(inspectingTx.amount)}`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block">Danh mục</span>
                  <p className="font-bold text-white mt-0.5">{inspectingTx.categoryName || 'Chưa phân loại'}</p>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block">Tài khoản / Ví</span>
                  <p className="font-bold text-white mt-0.5">{inspectingTx.walletName || 'Ví chính'}</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-zinc-500 text-[10px] block">Ghi chú</span>
                <p className="text-zinc-200 whitespace-pre-wrap">{inspectingTx.note || 'Không có ghi chú'}</p>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400 font-medium">Ngày ghi nhận:</span>
                <span className="font-bold text-white">{inspectingTx.date}</span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400 font-medium">Quỹ chung:</span>
                <span className="font-bold text-white">
                  {inspectingTx.isCoupleShared ? 'Quỹ Cặp Đôi (I Love Haevy) 💕' : 'Quỹ Cá Nhân'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => {
                  const toEdit = inspectingTx;
                  setInspectingTx(null);
                  handleOpenEditModal(toEdit);
                }}
                className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Edit3 size={14} /> Chỉnh Sửa
              </button>
              <button
                onClick={() => setInspectingTx(null)}
                className="px-5 py-2 rounded-xl bg-emerald-500 text-black font-extrabold text-xs hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH ACTION MODALS */}
      {batchActionModal === 'change_category' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Đổi Danh Mục Hàng Loạt</h3>
            <p className="text-xs text-zinc-400">Áp dụng cho {selectedIds.length} giao dịch đang chọn</p>
            <select
              value={batchTargetCategory}
              onChange={(e) => setBatchTargetCategory(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl p-3 text-xs text-white"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setBatchActionModal(null)}
                className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleBatchApplyCategory}
                className="flex-1 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold"
              >
                Áp Dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {batchActionModal === 'change_wallet' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Đổi Ví / Tài Khoản Hàng Loạt</h3>
            <p className="text-xs text-zinc-400">Áp dụng cho {selectedIds.length} giao dịch đang chọn</p>
            <select
              value={batchTargetWallet}
              onChange={(e) => setBatchTargetWallet(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl p-3 text-xs text-white"
            >
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setBatchActionModal(null)}
                className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleBatchApplyWallet}
                className="flex-1 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold"
              >
                Áp Dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT TRANSACTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  {editingId ? <Edit3 size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingId ? 'Chỉnh Sửa Bản Ghi Giao Dịch' : 'Ghi Giao Dịch Mới (Haevy Finance)'}
                  </h3>
                  <p className="text-[11px] text-zinc-400">Cập nhật số dư ví và nhật ký thu chi thời gian thực</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setFormType('expense')}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    formType === 'expense'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ArrowUpRight size={14} />
                  <span>Chi Tiêu</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('income')}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    formType === 'income'
                      ? 'bg-teal-500 text-black shadow-md shadow-teal-500/20'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ArrowDownRight size={14} />
                  <span>Thu Nhập</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('transfer')}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    formType === 'transfer'
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ArrowLeftRight size={14} />
                  <span>Chuyển Ví</span>
                </button>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  Số tiền ({formType === 'income' ? 'Thu' : formType === 'expense' ? 'Chi' : 'Chuyển'} - VND) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="0"
                    min="1"
                    required
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl px-4 py-3 text-lg font-mono font-black text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">
                    VND
                  </span>
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[50000, 100000, 200000, 500000, 1000000, 2000000, 5000000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleAddPresetAmount(val)}
                      className="px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[11px] font-mono font-bold transition-colors cursor-pointer"
                    >
                      +{val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Picker (if not transfer) */}
              {formType !== 'transfer' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Danh mục phân loại *</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {categories
                      .filter(c => formType === 'income' ? c.type === 'income' : c.type === 'expense')
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                  </select>
                </div>
              )}

              {/* Wallet Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    {formType === 'transfer' ? 'Từ Ví / Tài Khoản' : 'Ví Thanh Toán'} *
                  </label>
                  <select
                    value={formWalletId}
                    onChange={(e) => setFormWalletId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({formatVND(w.balance)})</option>
                    ))}
                  </select>
                </div>

                {formType === 'transfer' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Đến Ví / Tài Khoản *</label>
                    <select
                      value={formToWalletId}
                      onChange={(e) => setFormToWalletId(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {wallets.filter(w => w.id !== formWalletId).map(w => (
                        <option key={w.id} value={w.id}>{w.name} ({formatVND(w.balance)})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Ngày giao dịch *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Ghi chú / Chi tiết</label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Ví dụ: Cơm trưa văn phòng, tiền điện tháng 8..."
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Couple Shared Options */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsCoupleShared}
                    onChange={(e) => setFormIsCoupleShared(e.target.checked)}
                    className="rounded border-zinc-700 text-rose-500 focus:ring-rose-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-rose-300 flex items-center gap-1">
                    <Heart size={13} className="fill-rose-400" />
                    Đồng bộ vào Quỹ Chi Tiêu Chung Cặp Đôi (I Love Haevy)
                  </span>
                </label>

                {formIsCoupleShared && (
                  <label className="flex items-center gap-2 cursor-pointer pl-6">
                    <input
                      type="checkbox"
                      checked={formSplitWithPartner}
                      onChange={(e) => setFormSplitWithPartner(e.target.checked)}
                      className="rounded border-zinc-700 text-pink-500 focus:ring-pink-500 w-3.5 h-3.5"
                    />
                    <span className="text-[11px] text-zinc-400">
                      Tính năng chia đôi 50/50 mỗi người chịu một nửa
                    </span>
                  </label>
                )}
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 text-zinc-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  {editingId ? 'Cập Nhật Giao Dịch' : 'Lưu Giao Dịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
