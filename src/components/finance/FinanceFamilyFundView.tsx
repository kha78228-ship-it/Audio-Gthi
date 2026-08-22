import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Heart, 
  Home, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  Calendar, 
  Sparkles, 
  ShoppingBag, 
  Zap, 
  GraduationCap, 
  Stethoscope, 
  Plane, 
  DollarSign, 
  Check, 
  ArrowUpRight, 
  ArrowDownLeft,
  Filter,
  Share2,
  Copy,
  CheckCircle2,
  QrCode,
  UserPlus,
  Percent,
  Sliders,
  Calculator,
  Edit3,
  Trash2,
  ExternalLink,
  MessageCircle,
  Send,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { FinanceWallet, FinanceTransaction, FamilyMember, FamilyBudgetCategory, FamilyFundConfig } from '../../types';

interface FinanceFamilyFundViewProps {
  wallets: FinanceWallet[];
  transactions: FinanceTransaction[];
  selectedMonth: string;
  onAddTransaction: (tx: Omit<FinanceTransaction, 'id' | 'createdAt'>) => void;
}

// Sample friends for instant invite
const SAMPLE_INVITE_CONTACTS = [
  { id: 'c_1', name: 'Ngọc Mai (Vợ yêu)', phone: '0901 234 567', avatar: '👩‍🦰', relation: 'Vợ / Thủ quỹ' },
  { id: 'c_2', name: 'Văn Hoàng (Anh trai)', phone: '0912 345 678', avatar: '👨‍💼', relation: 'Anh trai' },
  { id: 'c_3', name: 'Bảo Trâm (Em gái)', phone: '0988 765 432', avatar: '👧', relation: 'Em gái' },
  { id: 'c_4', name: 'Mẹ Lan', phone: '0933 112 233', avatar: '👵', relation: 'Mẹ' },
  { id: 'c_5', name: 'Bố Hùng', phone: '0944 556 677', avatar: '👴', relation: 'Bố' },
  { id: 'c_6', name: 'Minh Tuấn (Bạn thân)', phone: '0977 889 900', avatar: '🧑‍🦱', relation: 'Bạn cùng nhà' },
];

export function FinanceFamilyFundView({
  wallets,
  transactions,
  selectedMonth,
  onAddTransaction,
}: FinanceFamilyFundViewProps) {
  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Math.round(val));
  };

  // State: Family Fund Config
  const [fundConfig, setFundConfig] = useState<FamilyFundConfig>(() => {
    const saved = localStorage.getItem('haevy_finance_family_config_v3');
    if (saved) return JSON.parse(saved);
    return {
      id: 'fund_main',
      fundName: 'Quỹ Sinh Hoạt Gia Đình',
      inviteCode: 'FAM-8869',
      inviteLink: `https://haevy.finance/join?code=FAM-8869`,
      splitMode: 'percentage', // percentage | proportional | equal | custom
      defaultSalaryPercent: 40, // 40% lương cứng mặc định
      createdAt: new Date().toISOString()
    };
  });

  // State: Family Members with Fixed Salary & % Split
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('haevy_finance_family_members_v3');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // State: Family Spending Allocations (Categories)
  const [familyAllocations, setFamilyAllocations] = useState<FamilyBudgetCategory[]>(() => {
    const saved = localStorage.getItem('haevy_finance_family_allocations_v3');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'fam_market', name: 'Tiền Chợ & Ăn Uống Gia Đình', allocated: 8000000, spent: 0, icon: '🛒', color: 'emerald' },
      { id: 'fam_bills', name: 'Điện, Nước, Internet & Chung Cư', allocated: 3500000, spent: 0, icon: '💡', color: 'amber' },
      { id: 'fam_education', name: 'Học Phí & Sách Vở Con Cái', allocated: 4000000, spent: 0, icon: '📚', color: 'cyan' },
      { id: 'fam_health', name: 'Y Tế, Thuốc & Sức Khỏe', allocated: 1500000, spent: 0, icon: '🏥', color: 'rose' },
      { id: 'fam_vacation', name: 'Dã Ngoại & Giải Trí Gia Đình', allocated: 2000000, spent: 0, icon: '✈️', color: 'purple' },
      { id: 'fam_emergency', name: 'Quỹ Dự Phòng Khẩn Cấp', allocated: 3000000, spent: 0, icon: '🛡️', color: 'teal' },
    ];
  });

  // Modals & UI Controls
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isJoinCodeModalOpen, setIsJoinCodeModalOpen] = useState(false);
  const [isSplitSettingsOpen, setIsSplitSettingsOpen] = useState(false);
  const [isAllocationsModalOpen, setIsAllocationsModalOpen] = useState(false);
  const [filterMemberId, setFilterMemberId] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string>('');

  // Form states: Deposit
  const [depositMemberId, setDepositMemberId] = useState<string>(() => familyMembers[0]?.id || '');
  const [depositWalletId, setDepositWalletId] = useState<string>(() => wallets[0]?.id || '');
  const [depositAmount, setDepositAmount] = useState<number>(2000000);
  const [depositNote, setDepositNote] = useState<string>('Nộp quỹ sinh hoạt hàng tháng');

  // Form states: Expense
  const [expenseMemberId, setExpenseMemberId] = useState<string>(() => familyMembers[0]?.id || '');
  const [expenseCategoryId, setExpenseCategoryId] = useState<string>(() => familyAllocations[0]?.id || '');
  const [expenseWalletId, setExpenseWalletId] = useState<string>(() => wallets[0]?.id || '');
  const [expenseAmount, setExpenseAmount] = useState<number>(350000);
  const [expenseNote, setExpenseNote] = useState<string>('Đi chợ mua thực phẩm');

  // Form states: Add/Edit Member
  const [memberName, setMemberName] = useState('');
  const [memberRelation, setMemberRelation] = useState('Chủ hộ');
  const [memberAvatar, setMemberAvatar] = useState('👨‍💼');
  const [memberSalary, setMemberSalary] = useState<number>(20000000);
  const [memberPercent, setMemberPercent] = useState<number>(40);
  const [memberRole, setMemberRole] = useState<'admin' | 'member'>('member');

  // Form state: Join via code
  const [inputJoinCode, setInputJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinRelation, setJoinRelation] = useState('Thành viên');
  const [joinAvatar, setJoinAvatar] = useState('🧑‍🦱');
  const [joinSalary, setJoinSalary] = useState<number>(18000000);
  const [joinPercent, setJoinPercent] = useState<number>(40);

  // Sync to local storage
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const saveConfig = (cfg: FamilyFundConfig) => {
    setFundConfig(cfg);
    localStorage.setItem('haevy_finance_family_config_v3', JSON.stringify(cfg));
  };

  const saveMembers = (mems: FamilyMember[]) => {
    setFamilyMembers(mems);
    localStorage.setItem('haevy_finance_family_members_v3', JSON.stringify(mems));
  };

  const saveAllocations = (alloc: FamilyBudgetCategory[]) => {
    setFamilyAllocations(alloc);
    localStorage.setItem('haevy_finance_family_allocations_v3', JSON.stringify(alloc));
  };

  // Calculations for Household Income & Splits
  const totalHouseholdSalary = familyMembers.reduce((sum, m) => sum + (m.fixedSalary || 0), 0);
  const totalMonthlyCommitment = familyMembers.reduce((sum, m) => sum + (m.monthlyCommitment || 0), 0);
  const totalFamilyContributed = familyMembers.reduce((sum, m) => sum + (m.contributedAmount || 0), 0);
  const totalFamilySpent = familyMembers.reduce((sum, m) => sum + (m.spentAmount || 0), 0);
  const totalAllocatedBudget = familyAllocations.reduce((sum, a) => sum + (a.allocated || 0), 0);
  const familyFundBalance = Math.max(0, totalFamilyContributed - totalFamilySpent);
  
  // Total percentage of household income assigned to family fund
  const householdFundRatio = totalHouseholdSalary > 0 
    ? Math.round((totalMonthlyCommitment / totalHouseholdSalary) * 100) 
    : 0;

  // Filter family transactions
  const familyTransactions = transactions.filter(t => 
    t.isFamilyFund ||
    t.isCoupleShared || 
    t.tags?.includes('family') || 
    t.tags?.includes('family_fund') ||
    t.note?.toLowerCase().includes('quỹ gia đình') || 
    t.note?.toLowerCase().includes('quỹ chung') ||
    t.categoryName?.toLowerCase().includes('quỹ gia đình')
  );

  const displayedTransactions = filterMemberId === 'all'
    ? familyTransactions
    : familyTransactions.filter(t => t.familyMemberId === filterMemberId || t.note?.includes(familyMembers.find(m => m.id === filterMemberId)?.name || ''));

  // Quick Copy Invite Link / Code
  const handleCopyLink = () => {
    navigator.clipboard.writeText(fundConfig.inviteLink);
    showToast('Đã sao chép liên kết mời tham gia quỹ gia đình!');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(fundConfig.inviteCode);
    showToast(`Đã sao chép mã mời: ${fundConfig.inviteCode}`);
  };

  // Share via Web Share API
  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Mời tham gia ${fundConfig.fundName}`,
          text: `Tham gia Quỹ Sinh Hoạt Gia Đình với mã mời [${fundConfig.inviteCode}]. Cùng quản lý thu chi và đóng góp theo % lương minh bạch!`,
          url: fundConfig.inviteLink,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  // Quick invite sample contact
  const handleInviteContact = (contact: typeof SAMPLE_INVITE_CONTACTS[0]) => {
    // Check if already in family
    const exists = familyMembers.some(m => m.name.toLowerCase() === contact.name.toLowerCase());
    if (exists) {
      showToast(`${contact.name} đã có trong danh sách thành viên!`);
      return;
    }

    const defaultSal = 20000000;
    const defaultPerc = fundConfig.defaultSalaryPercent || 40;
    const commit = Math.round((defaultSal * defaultPerc) / 100);

    const newM: FamilyMember = {
      id: `fm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: contact.name,
      relation: contact.relation,
      avatar: contact.avatar,
      fixedSalary: defaultSal,
      contributionPercent: defaultPerc,
      monthlyCommitment: commit,
      contributedAmount: 0,
      spentAmount: 0,
      phoneOrEmail: contact.phone,
      role: 'member',
      status: 'active',
      joinedAt: new Date().toISOString()
    };

    saveMembers([...familyMembers, newM]);
    showToast(`Đã thêm ${contact.name} vào Quỹ Gia Đình thành công!`);
  };

  // Handle Join with Code
  const handleJoinWithCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinName.trim()) {
      showToast('Vui lòng nhập họ tên của bạn');
      return;
    }

    const commitment = Math.round((joinSalary * joinPercent) / 100);

    const newM: FamilyMember = {
      id: `fm_${Date.now()}`,
      name: joinName.trim(),
      relation: joinRelation,
      avatar: joinAvatar,
      fixedSalary: joinSalary,
      contributionPercent: joinPercent,
      monthlyCommitment: commitment,
      contributedAmount: 0,
      spentAmount: 0,
      role: familyMembers.length === 0 ? 'admin' : 'member',
      status: 'active',
      joinedAt: new Date().toISOString()
    };

    saveMembers([...familyMembers, newM]);
    setIsJoinCodeModalOpen(false);
    setJoinName('');
    setInputJoinCode('');
    showToast(`Chào mừng ${newM.name} đã gia nhập ${fundConfig.fundName}!`);
  };

  // Handle Add Member Manual
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) return;

    const commitment = Math.round((memberSalary * memberPercent) / 100);

    const newM: FamilyMember = {
      id: `fm_${Date.now()}`,
      name: memberName.trim(),
      relation: memberRelation,
      avatar: memberAvatar,
      fixedSalary: memberSalary,
      contributionPercent: memberPercent,
      monthlyCommitment: commitment,
      contributedAmount: 0,
      spentAmount: 0,
      role: memberRole,
      status: 'active',
      joinedAt: new Date().toISOString()
    };

    saveMembers([...familyMembers, newM]);
    setIsAddMemberOpen(false);
    setMemberName('');
    showToast(`Đã thêm thành viên ${newM.name} vào Quỹ Gia Đình!`);
  };

  // Handle Edit Member
  const handleEditMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const commitment = Math.round((editingMember.fixedSalary * editingMember.contributionPercent) / 100);

    const updated = familyMembers.map(m => {
      if (m.id === editingMember.id) {
        return {
          ...editingMember,
          monthlyCommitment: commitment
        };
      }
      return m;
    });

    saveMembers(updated);
    setIsEditMemberOpen(false);
    setEditingMember(null);
    showToast(`Đã cập nhật thông tin & mức lương của ${editingMember.name}!`);
  };

  // Delete Member
  const handleDeleteMember = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa thành viên "${name}" khỏi Quỹ Gia Đình?`)) {
      saveMembers(familyMembers.filter(m => m.id !== id));
      showToast(`Đã xóa thành viên ${name}`);
    }
  };

  // Handle Deposit Submission
  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) return;

    const member = familyMembers.find(m => m.id === depositMemberId);
    const wallet = wallets.find(w => w.id === depositWalletId);

    // Update member contributed
    const updatedMembers = familyMembers.map(m => {
      if (m.id === depositMemberId) {
        return { ...m, contributedAmount: m.contributedAmount + depositAmount };
      }
      return m;
    });
    saveMembers(updatedMembers);

    // Add transaction to main ledger
    onAddTransaction({
      userId: 'user_haevy',
      amount: depositAmount,
      type: 'expense',
      categoryId: 'cat_savings',
      categoryName: 'Đóng Quỹ Gia Đình',
      walletId: depositWalletId,
      walletName: wallet?.name || 'Ví tiền',
      date: new Date().toISOString().slice(0, 10),
      note: `[Quỹ Gia Đình] ${member ? member.name : 'Thành viên'} đóng quỹ (${depositNote})`,
      isFamilyFund: true,
      familyMemberId: member?.id,
      familyMemberName: member?.name,
      isCoupleShared: true,
      tags: ['family', 'family_fund', 'contribution']
    });

    setIsDepositModalOpen(false);
    showToast(`Đã ghi nhận đóng góp ${formatVND(depositAmount)} từ ${member?.name || 'thành viên'}!`);
  };

  // Handle Expense From Family Fund Submission
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseAmount <= 0) return;

    const member = familyMembers.find(m => m.id === expenseMemberId);
    const category = familyAllocations.find(c => c.id === expenseCategoryId);
    const wallet = wallets.find(w => w.id === expenseWalletId);

    // Update member spent
    const updatedMembers = familyMembers.map(m => {
      if (m.id === expenseMemberId) {
        return { ...m, spentAmount: m.spentAmount + expenseAmount };
      }
      return m;
    });
    saveMembers(updatedMembers);

    // Update category spent
    const updatedAllocations = familyAllocations.map(c => {
      if (c.id === expenseCategoryId) {
        return { ...c, spent: c.spent + expenseAmount };
      }
      return c;
    });
    saveAllocations(updatedAllocations);

    // Add transaction
    onAddTransaction({
      userId: 'user_haevy',
      amount: expenseAmount,
      type: 'expense',
      categoryId: 'cat_family',
      categoryName: category?.name || 'Chi tiêu gia đình',
      walletId: expenseWalletId,
      walletName: wallet?.name || 'Quỹ Gia Đình',
      date: new Date().toISOString().slice(0, 10),
      note: `[Chi Quỹ Gia Đình] ${member ? member.name : 'Thành viên'} chi: ${expenseNote} (${category?.name})`,
      isFamilyFund: true,
      familyMemberId: member?.id,
      familyMemberName: member?.name,
      isCoupleShared: true,
      tags: ['family', 'family_fund', 'expense']
    });

    setIsExpenseModalOpen(false);
    showToast(`Đã ghi nhận khoản chi ${formatVND(expenseAmount)} do ${member?.name || 'thành viên'} thực hiện!`);
  };

  // Quick Apply Salary Split Modes
  const handleApplySplitMode = (mode: 'percentage' | 'proportional' | 'equal') => {
    let updated: FamilyMember[] = [];

    if (mode === 'percentage') {
      // Each contributes fixed % (e.g. 40%) of their own salary
      const perc = fundConfig.defaultSalaryPercent || 40;
      updated = familyMembers.map(m => ({
        ...m,
        contributionPercent: perc,
        monthlyCommitment: Math.round((m.fixedSalary * perc) / 100)
      }));
    } else if (mode === 'proportional') {
      // Target total budget e.g. totalAllocatedBudget or default
      const targetFund = totalAllocatedBudget || 20000000;
      updated = familyMembers.map(m => {
        const ratio = totalHouseholdSalary > 0 ? (m.fixedSalary / totalHouseholdSalary) : (1 / familyMembers.length);
        const commitment = Math.round(targetFund * ratio);
        const calculatedPerc = m.fixedSalary > 0 ? Math.round((commitment / m.fixedSalary) * 100) : 0;
        return {
          ...m,
          contributionPercent: calculatedPerc,
          monthlyCommitment: commitment
        };
      });
    } else if (mode === 'equal') {
      // Split target budget equally among all members
      const targetFund = totalAllocatedBudget || 20000000;
      const perHead = Math.round(targetFund / Math.max(1, familyMembers.length));
      updated = familyMembers.map(m => {
        const calculatedPerc = m.fixedSalary > 0 ? Math.round((perHead / m.fixedSalary) * 100) : 0;
        return {
          ...m,
          contributionPercent: calculatedPerc,
          monthlyCommitment: perHead
        };
      });
    }

    saveMembers(updated);
    saveConfig({ ...fundConfig, splitMode: mode });
    setIsSplitSettingsOpen(false);
    showToast(`Đã áp dụng phương án phân chia quỹ: ${
      mode === 'percentage' ? `Đồng đều ${fundConfig.defaultSalaryPercent}% lương cứng` :
      mode === 'proportional' ? 'Theo tỷ lệ thu nhập công bằng' : 'Chia đều 50/50'
    }`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-teal-500 text-zinc-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-2xl shadow-teal-500/40 animate-in slide-in-from-top-4">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HERO VAULT OVERVIEW & QUICK ACTIONS */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-tr from-teal-950/70 via-zinc-900 to-zinc-900 border border-teal-500/30 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-400 to-cyan-400 p-0.5 shadow-xl shadow-teal-500/20 shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-teal-400">
                <Home size={26} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {fundConfig.fundName}
                </h2>
                <button
                  onClick={handleCopyCode}
                  className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 flex items-center gap-1 cursor-pointer transition-all"
                  title="Bấm để sao chép mã mời"
                >
                  <span>Mã: <strong>{fundConfig.inviteCode}</strong></span>
                  <Copy size={10} />
                </button>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-300 mt-0.5">
                Phân bổ nguồn tiền theo <strong>% lương cứng</strong> của từng thành viên &amp; minh bạch dòng tiền
              </p>
            </div>
          </div>

          {/* Action Hub Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Share2 size={14} className="text-teal-400" />
              <span>Mời Bạn Bè</span>
            </button>

            <button
              onClick={() => setIsJoinCodeModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <UserPlus size={14} className="text-emerald-400" />
              <span>Gia Nhập Quỹ</span>
            </button>

            <button
              onClick={() => setIsExpenseModalOpen(true)}
              disabled={familyMembers.length === 0}
              className="px-3.5 py-2 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownLeft size={14} className="text-rose-400" />
              <span>- Chi Quỹ</span>
            </button>

            <button
              onClick={() => setIsDepositModalOpen(true)}
              disabled={familyMembers.length === 0}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 text-zinc-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-teal-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpRight size={15} />
              <span>+ Đóng Góp</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-2 border-t border-zinc-800/80">
          {/* Card 1: Fund Balance */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/80 border border-teal-500/30">
            <span className="text-[10px] sm:text-[11px] font-bold text-teal-400 uppercase tracking-wider block truncate">
              Số dư quỹ hiện tại
            </span>
            <div className="text-lg sm:text-xl font-black text-teal-300 font-mono mt-0.5 truncate">
              {formatVND(familyFundBalance)}
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5 block truncate">Khả dụng cho sinh hoạt</span>
          </div>

          {/* Card 2: Total Contributed */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800">
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 uppercase tracking-wider block truncate">
              Đã đóng nộp tháng
            </span>
            <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono mt-0.5 truncate">
              {formatVND(totalFamilyContributed)}
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5 block truncate">
              Mục tiêu: {formatVND(totalMonthlyCommitment)}
            </span>
          </div>

          {/* Card 3: Total Spent */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800">
            <span className="text-[10px] sm:text-[11px] font-bold text-rose-400 uppercase tracking-wider block truncate">
              Đã chi tiêu tháng
            </span>
            <div className="text-lg sm:text-xl font-black text-rose-400 font-mono mt-0.5 truncate">
              {formatVND(totalFamilySpent)}
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5 block truncate">
              {totalFamilyContributed > 0 ? `${Math.round((totalFamilySpent / totalFamilyContributed) * 100)}% quỹ đã chi` : 'Chưa có khoản chi'}
            </span>
          </div>

          {/* Card 4: Total Household Fixed Salary */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800">
            <span className="text-[10px] sm:text-[11px] font-bold text-cyan-400 uppercase tracking-wider block truncate">
              Tổng Lương Cứng
            </span>
            <div className="text-lg sm:text-xl font-black text-cyan-300 font-mono mt-0.5 truncate">
              {formatVND(totalHouseholdSalary)}
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5 block truncate">
              Trích {householdFundRatio}% cho quỹ chung
            </span>
          </div>
        </div>
      </div>

      {/* 2. SALARY % CONTRIBUTION FORMULA & HOUSEHOLD SPLIT DASHBOARD */}
      <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black">
              <Percent size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                Cơ Chế Phân Bổ Nguồn Tiền Theo % Lương Cứng
              </h3>
              <p className="text-[11px] text-zinc-400">
                Tự động tính hạn mức nộp quỹ từ thu nhập cố định của mỗi thành viên
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSplitSettingsOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-teal-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sliders size={13} />
              <span>Chọn Cơ Chế Chia Quỹ</span>
            </button>
          </div>
        </div>

        {/* Split Visualization Bar */}
        {familyMembers.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
              <span>Tỷ trọng đóng góp của từng thành viên vào quỹ:</span>
              <span className="font-mono text-teal-400">Tổng cam kết: {formatVND(totalMonthlyCommitment)}/tháng</span>
            </div>

            {/* Proportional visual stacked progress bar */}
            <div className="w-full h-4 bg-zinc-950 rounded-full overflow-hidden flex p-0.5 border border-zinc-800 gap-0.5">
              {familyMembers.map((m, idx) => {
                const sharePercent = totalMonthlyCommitment > 0 
                  ? Math.round((m.monthlyCommitment / totalMonthlyCommitment) * 100) 
                  : Math.round(100 / familyMembers.length);
                const colors = ['bg-teal-500', 'bg-emerald-500', 'bg-cyan-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500'];
                const bg = colors[idx % colors.length];
                return (
                  <div
                    key={m.id}
                    className={`h-full rounded-full transition-all flex items-center justify-center text-[9px] font-black text-zinc-950 ${bg}`}
                    style={{ width: `${Math.max(8, sharePercent)}%` }}
                    title={`${m.name}: ${sharePercent}% (${formatVND(m.monthlyCommitment)})`}
                  >
                    {sharePercent >= 15 ? `${sharePercent}%` : ''}
                  </div>
                );
              })}
            </div>

            {/* Quick breakdown labels */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
              {familyMembers.map((m, idx) => {
                const sharePercent = totalMonthlyCommitment > 0 
                  ? Math.round((m.monthlyCommitment / totalMonthlyCommitment) * 100) 
                  : 0;
                const remainingPersonalSalary = Math.max(0, m.fixedSalary - m.monthlyCommitment);
                return (
                  <div key={m.id} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-white truncate">
                      <span className="flex items-center gap-1 truncate">
                        <span>{m.avatar}</span>
                        <span className="truncate">{m.name}</span>
                      </span>
                      <span className="text-[10px] font-black text-teal-400 shrink-0 font-mono">
                        {m.contributionPercent}% lương
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-400 flex justify-between font-mono">
                      <span>Lương:</span>
                      <strong className="text-zinc-200">{formatVND(m.fixedSalary)}</strong>
                    </div>

                    <div className="text-[11px] text-teal-300 flex justify-between font-mono font-bold">
                      <span>Nộp quỹ:</span>
                      <span>{formatVND(m.monthlyCommitment)}</span>
                    </div>

                    <div className="text-[10px] text-zinc-500 flex justify-between font-mono pt-1 border-t border-zinc-900">
                      <span>Giữ chi tiêu riêng:</span>
                      <span className="text-zinc-400">{formatVND(remainingPersonalSalary)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-zinc-500 text-xs space-y-2">
            <p>Chưa có thành viên nào trong Quỹ Gia Đình.</p>
            <div className="flex justify-center gap-2 pt-1">
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-black text-xs transition-all cursor-pointer"
              >
                Mời Bạn Bè &amp; Người Thân
              </button>
              <button
                onClick={() => setIsAddMemberOpen(true)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-all cursor-pointer"
              >
                + Thêm Thành Viên Thủ Công
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. FAMILY MEMBERS ROSTER & DETAILED LEDGER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-teal-400" />
            <h3 className="text-sm font-black text-white">
              Bảng Theo Dõi Đóng - Chi Của Từng Thành Viên ({familyMembers.length})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-teal-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus size={13} />
              <span>Thêm Thành Viên</span>
            </button>
          </div>
        </div>

        {familyMembers.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs">
            Bấm "Mời Bạn Bè" hoặc "Thêm Thành Viên" để bắt đầu theo dõi thu chi gia đình.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {familyMembers.map((member) => {
              const percent = member.monthlyCommitment > 0 
                ? Math.min(100, Math.round((member.contributedAmount / member.monthlyCommitment) * 100))
                : 100;
              const isFulfilled = member.contributedAmount >= member.monthlyCommitment;
              const netBalance = member.contributedAmount - member.spentAmount;

              return (
                <div key={member.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl shrink-0">{member.avatar}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-white truncate">{member.name}</h4>
                          <span className="text-[10px] text-zinc-400 block truncate">
                            {member.relation} • {member.role === 'admin' ? '👑 Quản trị quỹ' : 'Thành viên'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingMember(member);
                            setIsEditMemberOpen(true);
                          }}
                          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
                          title="Sửa thông tin & mức lương"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id, member.name)}
                          className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-all cursor-pointer"
                          title="Xóa thành viên"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Salary & Formula */}
                    <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/60 space-y-1 text-[11px]">
                      <div className="flex justify-between text-zinc-400">
                        <span>Lương cứng:</span>
                        <strong className="text-white font-mono">{formatVND(member.fixedSalary)}</strong>
                      </div>
                      <div className="flex justify-between text-teal-300 font-bold">
                        <span>Trích quỹ ({member.contributionPercent}%):</span>
                        <span className="font-mono">{formatVND(member.monthlyCommitment)}/tháng</span>
                      </div>
                    </div>

                    {/* Contribution Progress */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-400">
                          Đã nộp quỹ: <strong className="text-emerald-400 font-mono">{formatVND(member.contributedAmount)}</strong>
                        </span>
                        <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                          isFulfilled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {percent}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isFulfilled ? 'bg-emerald-500' : 'bg-teal-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Member's Expense from Fund */}
                    <div className="flex justify-between items-center text-[11px] pt-1">
                      <span className="text-zinc-400">Đã chi từ quỹ chung:</span>
                      <strong className="text-rose-400 font-mono">{formatVND(member.spentAmount)}</strong>
                    </div>

                    <div className="flex justify-between items-center text-[11px] pt-1 border-t border-zinc-900">
                      <span className="text-zinc-500">Cân bằng (Đóng - Chi):</span>
                      <strong className={`font-mono ${netBalance >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                        {netBalance >= 0 ? '+' : ''}{formatVND(netBalance)}
                      </strong>
                    </div>
                  </div>

                  {/* Quick Action Button for this member */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setDepositMemberId(member.id);
                        setIsDepositModalOpen(true);
                      }}
                      className="w-full py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-teal-300 border border-teal-500/30 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <ArrowUpRight size={13} />
                      <span>Nộp Quỹ Cho {member.name.split(' ')[0]}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. FAMILY SPENDING ALLOCATIONS */}
      <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-teal-400" />
            <h3 className="text-sm font-black text-white">Hạn Mức Chi Tiêu Từng Khoản Gia Đình</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-zinc-400 hidden sm:inline-block">
              Tổng định mức: {formatVND(totalAllocatedBudget)}
            </span>
            <button
              onClick={() => setIsAllocationsModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-teal-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Edit3 size={13} />
              <span>Chỉnh Định Mức</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {familyAllocations.map(cat => {
            const usagePercent = Math.min(100, Math.round((cat.spent / (cat.allocated || 1)) * 100));
            const isNearLimit = usagePercent >= 85;
            return (
              <div key={cat.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-white truncate">
                    <span className="text-lg shrink-0">{cat.icon}</span>
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span className={`font-mono font-bold text-[11px] shrink-0 ${isNearLimit ? 'text-rose-400 font-black' : 'text-teal-300'}`}>
                    {usagePercent}%
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Đã chi: <strong className="text-white font-mono">{formatVND(cat.spent)}</strong></span>
                    <span>Định mức: {formatVND(cat.allocated)}</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isNearLimit ? 'bg-rose-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. RECENT FAMILY TRANSACTIONS WITH MEMBER FILTER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Calendar size={18} className="text-teal-400" />
            <span>Lịch Sử Giao Dịch Thu Chi Quỹ Gia Đình ({displayedTransactions.length})</span>
          </h3>

          {/* Filter by Member */}
          {familyMembers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Lọc theo:</span>
              <select
                value={filterMemberId}
                onChange={(e) => setFilterMemberId(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-xs font-bold text-teal-300 rounded-xl px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="all">Tất cả thành viên</option>
                {familyMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {displayedTransactions.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs">
            Chưa có giao dịch thu/chi nào thuộc quỹ gia đình trong danh sách.
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin pr-1">
            {displayedTransactions.map((tx) => (
              <div key={tx.id} className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                    tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{tx.note || tx.categoryName}</h4>
                    <span className="text-[10px] text-zinc-400 block truncate">
                      {tx.date} • {tx.walletName} {tx.familyMemberName ? `• Bởi ${tx.familyMemberName}` : ''}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono text-xs font-black shrink-0">
                  <span className={tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}>
                    {tx.type === 'income' ? '+' : '-'}{formatVND(tx.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. MODAL: INVITE FRIENDS / SHARE LINK */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Share2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Mời Bạn Bè &amp; Người Thân</h3>
                  <p className="text-[11px] text-zinc-400">Tham gia Quỹ Sinh Hoạt Gia Đình</p>
                </div>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-zinc-800"
              >
                Đóng
              </button>
            </div>

            {/* Invite Link & Code Box */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-teal-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                <span>MÃ MỜI THAM GIA:</span>
                <span className="font-mono text-base font-black text-teal-300 px-3 py-1 rounded-xl bg-teal-500/10 border border-teal-500/30">
                  {fundConfig.inviteCode}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-400">Đường dẫn mời trực tiếp:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={fundConfig.inviteLink}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 font-mono outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-black text-xs flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Copy size={13} />
                    <span>Sao Chép</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleShareNative}
                  className="py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 size={13} className="text-teal-400" />
                  <span>Chia Sẻ App</span>
                </button>
                <button
                  onClick={handleCopyCode}
                  className="py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy size={13} className="text-emerald-400" />
                  <span>Sao Chép Mã</span>
                </button>
              </div>
            </div>

            {/* Quick Invite From Contact List */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Users size={14} className="text-teal-400" />
                <span>Gợi ý mời nhanh từ danh bạ:</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_INVITE_CONTACTS.map((contact) => {
                  const isAdded = familyMembers.some(m => m.name.toLowerCase() === contact.name.toLowerCase());
                  return (
                    <div key={contact.id} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0">{contact.avatar}</span>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-white truncate">{contact.name}</h5>
                          <span className="text-[10px] text-zinc-400 block truncate">{contact.relation}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleInviteContact(contact)}
                        disabled={isAdded}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                          isAdded 
                            ? 'bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed' 
                            : 'bg-teal-500 hover:bg-teal-400 text-zinc-950 shadow-md shadow-teal-500/20'
                        }`}
                      >
                        {isAdded ? 'Đã thêm' : '+ Mời'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL: JOIN VIA CODE */}
      {isJoinCodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <UserPlus size={18} className="text-emerald-400" />
              <span>Gia Nhập Quỹ Gia Đình Bằng Mã / Link</span>
            </h3>

            <form onSubmit={handleJoinWithCodeSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Mã mời tham gia</label>
                <input
                  type="text"
                  value={inputJoinCode}
                  onChange={(e) => setInputJoinCode(e.target.value.toUpperCase())}
                  placeholder="VD: FAM-8869"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-white font-mono font-bold text-sm outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Họ và tên của bạn</label>
                <input
                  type="text"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="VD: Nguyễn Văn Minh"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-white font-bold outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-300">Quan hệ trong nhà</label>
                  <input
                    type="text"
                    value={joinRelation}
                    onChange={(e) => setJoinRelation(e.target.value)}
                    placeholder="VD: Vợ / Chồng / Con..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-300">Biểu tượng</label>
                  <select
                    value={joinAvatar}
                    onChange={(e) => setJoinAvatar(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-white outline-none cursor-pointer"
                  >
                    <option value="👨‍💼">👨‍💼 Bố / Chồng</option>
                    <option value="👩‍🦰">👩‍🦰 Mẹ / Vợ</option>
                    <option value="👦">👦 Con trai</option>
                    <option value="👧">👧 Con gái</option>
                    <option value="👴">👴 Ông</option>
                    <option value="👵">👵 Bà</option>
                    <option value="🧑‍🦱">🧑‍🦱 Thành viên</option>
                  </select>
                </div>
              </div>

              {/* Fixed Salary & Contribution % */}
              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-300">Mức lương cứng hàng tháng (VNĐ)</label>
                  <input
                    type="number"
                    value={joinSalary}
                    onChange={(e) => setJoinSalary(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono font-bold outline-none"
                  />
                  <span className="text-[11px] text-teal-400 font-mono block">{formatVND(joinSalary)}</span>
                </div>

                <div className="space-y-1 pt-1 border-t border-zinc-900">
                  <div className="flex justify-between text-zinc-300 font-bold">
                    <span>% Lương cam kết nộp quỹ:</span>
                    <span className="text-teal-400 font-mono font-black">{joinPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={joinPercent}
                    onChange={(e) => setJoinPercent(Number(e.target.value))}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>Số tiền cam kết: <strong>{formatVND(Math.round((joinSalary * joinPercent) / 100))}/tháng</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsJoinCodeModalOpen(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 text-zinc-950 font-black cursor-pointer shadow-lg shadow-teal-500/25"
                >
                  Tham Gia Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL: ADD MEMBER MANUAL */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Users size={18} className="text-teal-400" />
              <span>Thêm Thành Viên Vào Quỹ Gia Đình</span>
            </h3>

            <form onSubmit={handleAddMemberSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Họ và tên</label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="VD: Trần Bảo Anh"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-white font-bold outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-300">Quan hệ</label>
                  <input
                    type="text"
                    value={memberRelation}
                    onChange={(e) => setMemberRelation(e.target.value)}
                    placeholder="VD: Con trai, Mẹ..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-300">Biểu tượng</label>
                  <select
                    value={memberAvatar}
                    onChange={(e) => setMemberAvatar(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-white outline-none cursor-pointer"
                  >
                    <option value="👨‍💼">👨‍💼 Bố / Chồng</option>
                    <option value="👩‍🦰">👩‍🦰 Mẹ / Vợ</option>
                    <option value="👦">👦 Con trai</option>
                    <option value="👧">👧 Con gái</option>
                    <option value="👴">👴 Ông</option>
                    <option value="👵">👵 Bà</option>
                    <option value="🧑‍🦱">🧑‍🦱 Thành viên</option>
                  </select>
                </div>
              </div>

              {/* Salary & % Contribution */}
              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-300">Lương cứng hàng tháng (VNĐ)</label>
                  <input
                    type="number"
                    value={memberSalary}
                    onChange={(e) => setMemberSalary(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono font-bold outline-none"
                  />
                  <span className="text-[11px] text-teal-400 font-mono block">{formatVND(memberSalary)}</span>
                </div>

                <div className="space-y-1 pt-1 border-t border-zinc-900">
                  <div className="flex justify-between text-zinc-300 font-bold">
                    <span>% Lương cam kết nộp quỹ:</span>
                    <span className="text-teal-400 font-mono font-black">{memberPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={memberPercent}
                    onChange={(e) => setMemberPercent(Number(e.target.value))}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>Số tiền cam kết: <strong>{formatVND(Math.round((memberSalary * memberPercent) / 100))}/tháng</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-black cursor-pointer shadow-lg shadow-teal-500/25"
                >
                  Lưu Thành Viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL: EDIT MEMBER */}
      {isEditMemberOpen && editingMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Edit3 size={18} className="text-teal-400" />
              <span>Chỉnh Sửa Lương &amp; Thông Tin Thành Viên</span>
            </h3>

            <form onSubmit={handleEditMemberSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Họ và tên</label>
                <input
                  type="text"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-white font-bold outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-300">Quan hệ</label>
                  <input
                    type="text"
                    value={editingMember.relation}
                    onChange={(e) => setEditingMember({ ...editingMember, relation: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-300">Biểu tượng</label>
                  <select
                    value={editingMember.avatar}
                    onChange={(e) => setEditingMember({ ...editingMember, avatar: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-white outline-none cursor-pointer"
                  >
                    <option value="👨‍💼">👨‍💼 Bố / Chồng</option>
                    <option value="👩‍🦰">👩‍🦰 Mẹ / Vợ</option>
                    <option value="👦">👦 Con trai</option>
                    <option value="👧">👧 Con gái</option>
                    <option value="👴">👴 Ông</option>
                    <option value="👵">👵 Bà</option>
                    <option value="🧑‍🦱">🧑‍🦱 Thành viên</option>
                  </select>
                </div>
              </div>

              {/* Salary & % Contribution */}
              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-300">Lương cứng hàng tháng (VNĐ)</label>
                  <input
                    type="number"
                    value={editingMember.fixedSalary}
                    onChange={(e) => setEditingMember({ ...editingMember, fixedSalary: Math.max(0, Number(e.target.value)) })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono font-bold outline-none"
                  />
                  <span className="text-[11px] text-teal-400 font-mono block">{formatVND(editingMember.fixedSalary)}</span>
                </div>

                <div className="space-y-1 pt-1 border-t border-zinc-900">
                  <div className="flex justify-between text-zinc-300 font-bold">
                    <span>% Lương cam kết nộp quỹ:</span>
                    <span className="text-teal-400 font-mono font-black">{editingMember.contributionPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={editingMember.contributionPercent}
                    onChange={(e) => setEditingMember({ ...editingMember, contributionPercent: Number(e.target.value) })}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>Mục tiêu nộp: <strong>{formatVND(Math.round((editingMember.fixedSalary * editingMember.contributionPercent) / 100))}/tháng</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditMemberOpen(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-black cursor-pointer shadow-lg shadow-teal-500/25"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: DEPOSIT CONTRIBUTION */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <ArrowUpRight size={18} className="text-teal-400" />
              <span>Đóng Góp Tiền Vào Quỹ Gia Đình</span>
            </h3>

            <form onSubmit={handleDepositSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Thành viên đóng góp</label>
                <select
                  value={depositMemberId}
                  onChange={(e) => setDepositMemberId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-white font-bold outline-none cursor-pointer"
                >
                  {familyMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.avatar} {m.name} ({m.relation})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Trừ từ ví / tài khoản</label>
                <select
                  value={depositWalletId}
                  onChange={(e) => setDepositWalletId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-white font-bold outline-none cursor-pointer"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({formatVND(w.balance)})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Số tiền nộp (VNĐ)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-white font-black text-sm outline-none font-mono"
                  placeholder="Nhập số tiền..."
                  required
                />
                <span className="text-[11px] text-teal-400 font-mono block">{formatVND(depositAmount)}</span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Ghi chú</label>
                <input
                  type="text"
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-white outline-none"
                  placeholder="VD: Nộp tiền ăn & sinh hoạt tháng 8..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-black cursor-pointer shadow-lg shadow-teal-500/25"
                >
                  Xác Nhận Nạp Quỹ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: EXPENSE FROM VAULT BY MEMBER */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <ArrowDownLeft size={18} className="text-rose-400" />
              <span>Ghi Nhận Khoản Chi Từ Quỹ Gia Đình</span>
            </h3>

            <form onSubmit={handleExpenseSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Thành viên thực hiện chi</label>
                <select
                  value={expenseMemberId}
                  onChange={(e) => setExpenseMemberId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-white font-bold outline-none cursor-pointer"
                >
                  {familyMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.avatar} {m.name} ({m.relation})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Khoản mục chi tiêu</label>
                <select
                  value={expenseCategoryId}
                  onChange={(e) => setExpenseCategoryId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-white font-bold outline-none cursor-pointer"
                >
                  {familyAllocations.map(a => (
                    <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Trích xuất từ nguồn ví</label>
                <select
                  value={expenseWalletId}
                  onChange={(e) => setExpenseWalletId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-white font-bold outline-none cursor-pointer"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({formatVND(w.balance)})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Số tiền chi (VNĐ)</label>
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-white font-black text-sm outline-none font-mono"
                  placeholder="Nhập số tiền..."
                  required
                />
                <span className="text-[11px] text-rose-400 font-mono block">{formatVND(expenseAmount)}</span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300">Nội dung chi tiết</label>
                <input
                  type="text"
                  value={expenseNote}
                  onChange={(e) => setExpenseNote(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-white outline-none"
                  placeholder="VD: Đi chợ mua cá thịt rau, đóng tiền điện nước..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black cursor-pointer shadow-lg shadow-rose-500/25"
                >
                  Ghi Nhận Chi Tiền
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: SPLIT STRATEGY SELECTOR */}
      {isSplitSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Sliders size={18} className="text-teal-400" />
                <span>Phương Án Phân Bổ Nguồn Tiền</span>
              </h3>
              <button
                onClick={() => setIsSplitSettingsOpen(false)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 bg-zinc-800 rounded-lg"
              >
                Đóng
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              Chọn cơ chế tính toán định mức nộp quỹ tự động cho toàn bộ thành viên:
            </p>

            <div className="space-y-2.5">
              {/* Option 1: Fixed % of Salary */}
              <button
                onClick={() => handleApplySplitMode('percentage')}
                className="w-full p-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800/80 border border-teal-500/40 text-left transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-teal-300 flex items-center gap-1.5">
                    <Percent size={14} />
                    <span>Đồng Đều Theo % Lương Cứng (Khuyên dùng)</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300">
                    40% Lương
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Mỗi người trích đúng 40% (hoặc % tùy chọn) lương cứng của mình nộp vào quỹ chung. Thu nhập càng cao đóng càng nhiều nhưng tỷ lệ gánh vác bằng nhau.
                </p>
              </button>

              {/* Option 2: Proportional to Income */}
              <button
                onClick={() => handleApplySplitMode('proportional')}
                className="w-full p-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 text-left transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white flex items-center gap-1.5">
                    <Calculator size={14} className="text-cyan-400" />
                    <span>Theo Tỷ Trọng Thu Nhập Gia Đình</span>
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Định mức nộp được chia theo tỷ lệ thu nhập thực tế. Ví dụ: Chồng chiếm 60% tổng lương nhà thì gánh 60% ngân sách quỹ chung.
                </p>
              </button>

              {/* Option 3: Equal 50/50 Split */}
              <button
                onClick={() => handleApplySplitMode('equal')}
                className="w-full p-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 text-left transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white flex items-center gap-1.5">
                    <Users size={14} className="text-amber-400" />
                    <span>Chia Đều 50/50 Giữa Các Thành Viên</span>
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Mỗi thành viên nộp số tiền hoàn toàn bằng nhau bất kể mức thu nhập (ví dụ mỗi người 10.000.000đ).
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL: EDIT ALLOCATIONS */}
      {isAllocationsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <ShoppingBag size={18} className="text-teal-400" />
                <span>Chỉnh Định Mức Chi Tiêu Gia Đình</span>
              </h3>
              <button
                onClick={() => setIsAllocationsModalOpen(false)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 bg-zinc-800 rounded-lg"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-3">
              {familyAllocations.map((cat, idx) => (
                <div key={cat.id} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-1.5">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </span>
                    <span className="font-mono text-teal-400">{formatVND(cat.allocated)}</span>
                  </div>

                  <input
                    type="number"
                    value={cat.allocated}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value));
                      const updated = [...familyAllocations];
                      updated[idx].allocated = val;
                      saveAllocations(updated);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
                    placeholder="Nhập định mức tháng..."
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setIsAllocationsModalOpen(false);
                showToast('Đã cập nhật định mức chi tiêu các danh mục!');
              }}
              className="w-full py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-black text-xs cursor-pointer shadow-lg shadow-teal-500/25"
            >
              Lưu Định Mức
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
