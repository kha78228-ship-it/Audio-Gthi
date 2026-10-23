import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Plus, 
  ArrowLeftRight, 
  PieChart, 
  Scale, 
  PiggyBank, 
  Users, 
  Repeat, 
  BarChart3, 
  Heart, 
  Calendar, 
  Download, 
  Upload, 
  Sparkles,
  ChevronDown,
  Filter,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Crown,
  Award,
  Mic
} from 'lucide-react';
import { 
  FinanceWallet, 
  FinanceTransaction, 
  FinanceCategory, 
  FinanceBudget, 
  FinanceSavingsGoal, 
  FinanceDebtRecord, 
  FinanceRecurringTransaction,
  FinanceAchievementBadge
} from '../types';
import { 
  DEFAULT_FINANCE_CATEGORIES, 
  DEFAULT_FINANCE_WALLETS, 
  DEFAULT_FINANCE_TRANSACTIONS, 
  DEFAULT_FINANCE_SAVINGS_GOALS, 
  DEFAULT_FINANCE_DEBTS, 
  DEFAULT_FINANCE_RECURRING,
  DEFAULT_FINANCE_BUDGET
} from '../data';
import { FinanceOverviewCards } from './finance/FinanceOverviewCards';
import { FinanceTransactionList } from './finance/FinanceTransactionList';
import { FinanceWalletsModal } from './finance/FinanceWalletsModal';
import { FinanceBudgetView } from './finance/FinanceBudgetView';
import { FinanceSavingsGoalsView } from './finance/FinanceSavingsGoalsView';
import { FinanceDebtTrackerView } from './finance/FinanceDebtTrackerView';
import { FinanceRecurringView } from './finance/FinanceRecurringView';
import { FinanceAnalyticsCharts } from './finance/FinanceAnalyticsCharts';
import { FinanceFamilyFundView } from './finance/FinanceFamilyFundView';
import { FinanceCalculatorsView } from './finance/FinanceCalculatorsView';
import { FinanceAddExpenseView } from './finance/FinanceAddExpenseView';
import { FinanceVoiceExpenseModal } from './finance/FinanceVoiceExpenseModal';
import { FinanceAIAdvisorModal } from './finance/FinanceAIAdvisorModal';
import { FinanceAchievementsSection } from './finance/FinanceAchievementsSection';
import { FinanceMilestoneToast } from './finance/FinanceMilestoneToast';
import { FinanceBadgeDetailModal } from './finance/FinanceBadgeDetailModal';
import { FinanceD3SunburstChart } from './finance/FinanceD3SunburstChart';
import { FinanceSixJarsSavingsGrowthChart } from './finance/FinanceSixJarsSavingsGrowthChart';
import { FinanceHeatmap } from './finance/FinanceHeatmap';
import { SavingsMilestoneConfettiCanvas, MilestoneCelebrationData } from './finance/SavingsMilestoneConfettiCanvas';
import { DEFAULT_SAVINGS_MILESTONES } from './finance/SavingsMilestonesInteractive';
import { computeFinanceAchievements, FINANCE_UNLOCKED_SEEN_KEY, setBadgeClaimed } from '../data/financeAchievements';
import { useAuth } from '../context/AuthContext';

interface FinanceViewProps {
  currentUserId?: string;
  isVip?: boolean;
  onUpgradeVip?: () => void;
  activePage?: 'page1' | 'page2' | 'page3' | 'page4' | 'page5';
  onSelectPage?: (page: 'page1' | 'page2' | 'page3' | 'page4' | 'page5') => void;
  initialPage2SubTab?: 'budget' | 'sunburst' | 'growth' | 'heatmap' | 'savings' | 'debts' | 'recurring';
  openWalletsTrigger?: number;
  openAddTransactionTrigger?: number;
}

export function FinanceView({ 
  currentUserId = 'user_haevy', 
  isVip = true, 
  onUpgradeVip,
  activePage,
  onSelectPage,
  initialPage2SubTab,
  openWalletsTrigger,
  openAddTransactionTrigger
}: FinanceViewProps) {
  const { addAudioPoints } = useAuth();

  // Active 5-Page System
  const [localPage, setLocalPage] = useState<'page1' | 'page2' | 'page3' | 'page4' | 'page5'>('page1');
  const currentPage = activePage || localPage;

  const handleSetPage = (p: 'page1' | 'page2' | 'page3' | 'page4' | 'page5') => {
    setLocalPage(p);
    if (onSelectPage) onSelectPage(p);
  };

  // Sub-tabs for Page 2 (Ngân Sách / Tiết Kiệm / Nợ Vay / Định Kỳ / Huy Hiệu / Sunburst / Tăng Trưởng 30 Ngày / Heatmap D3)
  const [page2SubTab, setPage2SubTab] = useState<'budget' | 'sunburst' | 'growth' | 'heatmap' | 'savings' | 'debts' | 'recurring' | 'achievements'>(initialPage2SubTab || 'budget');

  // Page 1 View Switcher (Transactions vs Achievements)
  const [page1Tab, setPage1Tab] = useState<'transactions' | 'achievements'>('transactions');
  const [refreshBadgesCounter, setRefreshBadgesCounter] = useState(0);
  const [toastBadge, setToastBadge] = useState<FinanceAchievementBadge | null>(null);
  const [selectedModalBadge, setSelectedModalBadge] = useState<FinanceAchievementBadge | null>(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);

  // React to initialPage2SubTab prop changes
  useEffect(() => {
    if (initialPage2SubTab) {
      setPage2SubTab(initialPage2SubTab);
    }
  }, [initialPage2SubTab]);

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Data Collections (Filtered from any legacy mock data)
  const [wallets, setWallets] = useState<FinanceWallet[]>(() => {
    const saved = localStorage.getItem('haevy_finance_wallets_v2');
    if (saved) return JSON.parse(saved);
    return DEFAULT_FINANCE_WALLETS;
  });

  const [transactions, setTransactions] = useState<FinanceTransaction[]>(() => {
    const saved = localStorage.getItem('haevy_finance_transactions_v2');
    if (saved) return JSON.parse(saved);
    return DEFAULT_FINANCE_TRANSACTIONS;
  });

  const [categories, setCategories] = useState<FinanceCategory[]>(() => {
    const saved = localStorage.getItem('haevy_finance_categories_v2');
    if (saved) return JSON.parse(saved);
    return DEFAULT_FINANCE_CATEGORIES;
  });

  const [budget, setBudget] = useState<FinanceBudget>(() => {
    const saved = localStorage.getItem('haevy_finance_budget_v2');
    if (saved) return JSON.parse(saved);
    return DEFAULT_FINANCE_BUDGET;
  });

  const [savingsGoals, setSavingsGoals] = useState<FinanceSavingsGoal[]>(() => {
    const saved = localStorage.getItem('haevy_finance_savings_v2');
    if (saved) return JSON.parse(saved);
    return DEFAULT_FINANCE_SAVINGS_GOALS;
  });

  const [debts, setDebts] = useState<FinanceDebtRecord[]>(() => {
    const saved = localStorage.getItem('haevy_finance_debts_v2');
    if (saved) return JSON.parse(saved);
    return DEFAULT_FINANCE_DEBTS;
  });

  const [recurringList, setRecurringList] = useState<FinanceRecurringTransaction[]>(() => {
    const saved = localStorage.getItem('haevy_finance_recurring_v2');
    if (saved) return JSON.parse(saved);
    return DEFAULT_FINANCE_RECURRING;
  });

  // Real-time evaluation of achievement badges based on user milestones
  const badges = React.useMemo(() => {
    return computeFinanceAchievements({
      wallets,
      transactions,
      budget,
      savingsGoals,
      debts,
      selectedMonth
    });
  }, [wallets, transactions, budget, savingsGoals, debts, selectedMonth, refreshBadgesCounter]);

  // Monitor newly reached milestones during the current session
  useEffect(() => {
    try {
      const seenRaw = sessionStorage.getItem(FINANCE_UNLOCKED_SEEN_KEY);
      const seenIds: string[] = seenRaw ? JSON.parse(seenRaw) : [];
      
      const newlyUnlocked = badges.find(b => b.isUnlocked && !seenIds.includes(b.id));
      if (newlyUnlocked) {
        const nextSeen = [...seenIds, newlyUnlocked.id];
        sessionStorage.setItem(FINANCE_UNLOCKED_SEEN_KEY, JSON.stringify(nextSeen));
        setToastBadge(newlyUnlocked);
      }
    } catch (e) {
      // ignore
    }
  }, [badges]);

  // Canvas-based Savings Milestone Confetti State
  const [savingsCelebration, setSavingsCelebration] = useState<MilestoneCelebrationData | null>(null);
  const prevSavingsPctRef = React.useRef<Record<string, number>>({});
  const isFirstRender = React.useRef(true);

  // Detect whenever any savings goal reaches a new milestone (25%, 50%, 75%, 100%)
  useEffect(() => {
    if (isFirstRender.current) {
      // Initialize map on initial mount without firing celebratory confetti
      const initialMap: Record<string, number> = {};
      savingsGoals.forEach(g => {
        const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
        initialMap[g.id] = pct;
      });
      prevSavingsPctRef.current = initialMap;
      isFirstRender.current = false;
      return;
    }

    // Check for newly achieved milestones
    for (const goal of savingsGoals) {
      const prevPct = prevSavingsPctRef.current[goal.id] ?? 0;
      const targetVal = Math.max(1, goal.targetAmount);
      const newPct = (goal.currentAmount / targetVal) * 100;

      // Find highest milestone crossed
      const crossed = [...DEFAULT_SAVINGS_MILESTONES]
        .reverse()
        .find(m => prevPct < m.percentage && newPct >= m.percentage);

      if (crossed) {
        setSavingsCelebration({
          goalId: goal.id,
          goalTitle: goal.title,
          goalColor: goal.color || '#06b6d4',
          milestonePercentage: crossed.percentage,
          badgeName: crossed.badgeName,
          icon: crossed.icon,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount
        });
        break;
      }
    }

    // Update tracked percentages
    const updatedMap: Record<string, number> = {};
    savingsGoals.forEach(g => {
      const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
      updatedMap[g.id] = pct;
    });
    prevSavingsPctRef.current = updatedMap;
  }, [savingsGoals]);

  // Modal Controls
  const [isWalletsModalOpen, setIsWalletsModalOpen] = useState(false);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);
  const [isVoiceExpenseModalOpen, setIsVoiceExpenseModalOpen] = useState(false);

  // Quick keyboard shortcut 'v' or 'V' to trigger voice logging in Finance mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        setIsVoiceExpenseModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (openWalletsTrigger && openWalletsTrigger > 0) {
      setIsWalletsModalOpen(true);
    }
  }, [openWalletsTrigger]);

  useEffect(() => {
    if (openAddTransactionTrigger && openAddTransactionTrigger > 0) {
      setIsAddTransactionModalOpen(true);
    }
  }, [openAddTransactionTrigger]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('haevy_finance_wallets_v2', JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem('haevy_finance_transactions_v2', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('haevy_finance_savings_v2', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem('haevy_finance_debts_v2', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('haevy_finance_recurring_v2', JSON.stringify(recurringList));
  }, [recurringList]);

  useEffect(() => {
    localStorage.setItem('haevy_finance_budget_v2', JSON.stringify(budget));
  }, [budget]);

  // Handler: Add Transaction
  const handleAddTransaction = (newTx: Omit<FinanceTransaction, 'id' | 'createdAt'>) => {
    const tx: FinanceTransaction = {
      ...newTx,
      id: `tx_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    // Update wallet balance
    setWallets(prev => prev.map(w => {
      if (w.id === tx.walletId) {
        const delta = tx.type === 'income' ? tx.amount : tx.type === 'expense' ? -tx.amount : 0;
        return { ...w, balance: Math.max(0, w.balance + delta) };
      }
      return w;
    }));

    setTransactions(prev => [tx, ...prev]);
  };

  // Handler: Edit Transaction
  const handleEditTransaction = (id: string, updated: Partial<FinanceTransaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
  };

  // Handler: Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      // Revert wallet balance
      setWallets(prev => prev.map(w => {
        if (w.id === tx.walletId) {
          const delta = tx.type === 'income' ? -tx.amount : tx.type === 'expense' ? tx.amount : 0;
          return { ...w, balance: Math.max(0, w.balance + delta) };
        }
        return w;
      }));
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Handler: Add Wallet
  const handleAddWallet = (newWallet: Omit<FinanceWallet, 'id' | 'createdAt'>) => {
    const wallet: FinanceWallet = {
      ...newWallet,
      id: `wallet_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setWallets(prev => [...prev, wallet]);
  };

  // Handler: Edit Wallet
  const handleEditWallet = (id: string, updated: Partial<FinanceWallet>) => {
    setWallets(prev => prev.map(w => w.id === id ? { ...w, ...updated } : w));
  };

  // Handler: Delete Wallet
  const handleDeleteWallet = (id: string) => {
    setWallets(prev => prev.filter(w => w.id !== id));
  };

  // Handler: Transfer Money between wallets
  const handleTransfer = (fromId: string, toId: string, amount: number, note: string) => {
    const fromWallet = wallets.find(w => w.id === fromId);
    const toWallet = wallets.find(w => w.id === toId);
    if (!fromWallet || !toWallet) return;

    // Deduct from source, add to destination
    setWallets(prev => prev.map(w => {
      if (w.id === fromId) return { ...w, balance: Math.max(0, w.balance - amount) };
      if (w.id === toId) return { ...w, balance: w.balance + amount };
      return w;
    }));

    // Record transfer transaction
    const transferTx: FinanceTransaction = {
      id: `tx_tr_${Date.now()}`,
      userId: currentUserId,
      walletId: fromId,
      walletName: fromWallet.name,
      categoryId: 'cat_transfer',
      categoryName: 'Chuyển tiền nội bộ',
      amount: amount,
      type: 'transfer',
      date: new Date().toISOString(),
      note: `${note} (Chuyển sang ${toWallet.name})`,
      toWalletId: toId,
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [transferTx, ...prev]);
  };

  // Handler: Deposit to savings goal
  const handleDepositToGoal = (goalId: string, walletId: string, amount: number) => {
    const wallet = wallets.find(w => w.id === walletId);
    const goal = savingsGoals.find(g => g.id === goalId);
    if (!wallet || !goal) return;

    // Update wallet balance
    setWallets(prev => prev.map(w => {
      if (w.id === walletId) return { ...w, balance: Math.max(0, w.balance - amount) };
      return w;
    }));

    // Update goal amount
    setSavingsGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const nextAmount = g.currentAmount + amount;
        return {
          ...g,
          currentAmount: nextAmount,
          isCompleted: nextAmount >= g.targetAmount
        };
      }
      return g;
    }));

    // Add transaction record
    const depositTx: FinanceTransaction = {
      id: `tx_goal_${Date.now()}`,
      userId: currentUserId,
      walletId: walletId,
      walletName: wallet.name,
      categoryId: 'cat_savings',
      categoryName: 'Gửi tiết kiệm',
      amount: amount,
      type: 'expense',
      date: new Date().toISOString(),
      note: `Nạp vào mục tiêu "${goal.title}"`,
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [depositTx, ...prev]);
  };

  // Handler: Repay Debt
  const handleRepayDebt = (debtId: string, amount: number, walletId: string) => {
    const debt = debts.find(d => d.id === debtId);
    const wallet = wallets.find(w => w.id === walletId);
    if (!debt || !wallet) return;

    const nextPaid = debt.paidAmount + amount;
    const isCompleted = nextPaid >= debt.amount;

    setDebts(prev => prev.map(d => {
      if (d.id === debtId) {
        return {
          ...d,
          paidAmount: nextPaid,
          status: isCompleted ? 'completed' : 'active'
        };
      }
      return d;
    }));

    // If lent -> we received money (income). If borrowed -> we paid money (expense).
    const isLent = debt.type === 'lent';
    setWallets(prev => prev.map(w => {
      if (w.id === walletId) {
        const delta = isLent ? amount : -amount;
        return { ...w, balance: Math.max(0, w.balance + delta) };
      }
      return w;
    }));

    const repayTx: FinanceTransaction = {
      id: `tx_debt_${Date.now()}`,
      userId: currentUserId,
      walletId: walletId,
      walletName: wallet.name,
      categoryId: isLent ? 'cat_salary' : 'cat_bills',
      categoryName: isLent ? 'Thu hồi nợ' : 'Trả nợ vay',
      amount: amount,
      type: isLent ? 'income' : 'expense',
      date: new Date().toISOString(),
      note: isLent ? `Thu nợ từ ${debt.personName}` : `Trả nợ cho ${debt.personName}`,
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [repayTx, ...prev]);
  };

  // Handler: Export CSV
  const handleExportCSV = () => {
    const headers = ['Mã GD', 'Ngày', 'Loại', 'Danh mục', 'Ví/Tài khoản', 'Số tiền (VND)', 'Ghi chú', 'Quỹ đôi'];
    const rows = transactions.map(t => [
      t.id,
      t.date,
      t.type === 'income' ? 'Thu' : t.type === 'expense' ? 'Chi' : 'Chuyển tiền',
      t.categoryName || t.categoryId,
      t.walletName || t.walletId,
      t.amount.toString(),
      `"${(t.note || '').replace(/"/g, '""')}"`,
      t.isCoupleShared ? 'Có' : 'Không'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Haevy_Finance_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Month navigation options
  const monthOptions = [
    { value: '2026-08', label: 'Tháng 08/2026' },
    { value: '2026-07', label: 'Tháng 07/2026' },
    { value: '2026-06', label: 'Tháng 06/2026' },
    { value: '2026-05', label: 'Tháng 05/2026' },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-24 selection:bg-emerald-500 selection:text-black">
      {/* Top Controls Bar (Month Switcher & Wallet Manager) */}
      <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Month Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 hidden sm:inline-block">Kỳ Báo Cáo:</span>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-zinc-900 border border-zinc-700/80 rounded-2xl px-3.5 py-1.5 text-xs font-black text-emerald-300 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
              >
                {monthOptions.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Voice Expense, AI Advisor & Wallet Manager Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVoiceExpenseModalOpen(true)}
              className="px-3.5 py-1.5 sm:py-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:opacity-95 text-zinc-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-500/25 transition-all cursor-pointer whitespace-nowrap group active:scale-95"
              title="Ghi chép nhanh chi tiêu bằng giọng nói tiếng Việt"
            >
              <Mic size={14} className="text-zinc-950 animate-pulse group-hover:scale-110 transition-transform" />
              <span>Nói Ghi Chi Tiêu</span>
            </button>

            <button
              onClick={() => setIsAiAdvisorOpen(true)}
              className="px-3.5 py-1.5 sm:py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:opacity-95 text-zinc-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap group"
            >
              <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
              <span>AI Dự Báo 6 Hũ</span>
            </button>

            <button
              onClick={() => setIsWalletsModalOpen(true)}
              className="px-3.5 py-1.5 sm:py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-sm"
            >
              <Wallet size={14} className="text-emerald-400" />
              <span>Ví &amp; Tài Khoản ({wallets.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: 5 Dedicated Pages */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* ================= PAGE 1: TỔNG QUAN VÀ LỊCH SỬ GIAO DỊCH ================= */}
        {currentPage === 'page1' && (
          <div className="space-y-6">
            <FinanceOverviewCards
              wallets={wallets}
              transactions={transactions}
              budget={budget}
              selectedMonth={selectedMonth}
              badges={badges}
              onOpenWallets={() => setIsWalletsModalOpen(true)}
              onOpenBudget={() => handleSetPage('page2')}
              onOpenHeatmap={() => { handleSetPage('page2'); setPage2SubTab('heatmap'); }}
              onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
              onOpenAchievements={() => setPage1Tab('achievements')}
              onOpenVoiceExpense={() => setIsVoiceExpenseModalOpen(true)}
            />

            {/* Page 1 Sub-Tab Switcher: Transactions vs Achievements */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-2">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setPage1Tab('transactions')}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    page1Tab === 'transactions'
                      ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <span>📋 Sổ Nhật Ký &amp; Giao Dịch</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 font-bold">
                    {transactions.length}
                  </span>
                </button>

                <button
                  onClick={() => setPage1Tab('achievements')}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    page1Tab === 'achievements'
                      ? 'bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Award size={14} className="text-amber-400" />
                  <span>Cột Mốc &amp; Huy Hiệu</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                    {badges.filter(b => b.isUnlocked).length}/{badges.length} Đã Đạt
                  </span>
                </button>
              </div>

              {page1Tab === 'achievements' && (
                <button
                  onClick={() => setPage1Tab('transactions')}
                  className="text-xs text-zinc-400 hover:text-emerald-400 font-bold transition-colors cursor-pointer self-start sm:self-auto"
                >
                  ← Trở lại sổ giao dịch
                </button>
              )}
            </div>

            {/* Achievements View on Page 1 */}
            {page1Tab === 'achievements' ? (
              <FinanceAchievementsSection
                badges={badges}
                onRefreshBadges={() => setRefreshBadgesCounter(c => c + 1)}
              />
            ) : (
              /* Quick Mini Charts & Full Transactions */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <FinanceTransactionList
                    transactions={transactions}
                    categories={categories}
                    wallets={wallets}
                    selectedMonth={selectedMonth}
                    onAddTransaction={handleAddTransaction}
                    onEditTransaction={handleEditTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                    onExportCSV={handleExportCSV}
                    onOpenVoiceExpense={() => setIsVoiceExpenseModalOpen(true)}
                  />
                </div>

                {/* Sidebar Quick Shortcuts */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Milestone Achievements Quick Peek */}
                  <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                        <Award size={15} className="text-amber-400" />
                        Cột Mốc Huy Hiệu Nổi Bật
                      </h4>
                      <button
                        onClick={() => setPage1Tab('achievements')}
                        className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
                      >
                        Tất cả ({badges.length})
                      </button>
                    </div>

                    {badges.slice(0, 2).map(badge => (
                      <div 
                        key={badge.id}
                        onClick={() => {
                          setSelectedModalBadge(badge);
                          setIsBadgeModalOpen(true);
                        }}
                        className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-amber-500/40 transition-all cursor-pointer space-y-1.5 group"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                            <span>{badge.isUnlocked ? '🏆' : '🔒'}</span>
                            <span>{badge.title}</span>
                          </span>
                          <span className={`text-[11px] font-black ${badge.isUnlocked ? 'text-emerald-400' : 'text-zinc-400'}`}>
                            {badge.progressPercent}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              badge.isUnlocked ? 'bg-gradient-to-r from-amber-400 to-emerald-400' : 'bg-zinc-700'
                            }`}
                            style={{ width: `${Math.min(badge.progressPercent, 100)}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-zinc-400 truncate">
                          {badge.milestoneDescription}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Savings Goal Quick Peek */}
                  <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                        <PiggyBank size={15} className="text-cyan-400" />
                        Mục Tiêu Tích Lũy
                      </h4>
                      <button
                        onClick={() => handleSetPage('page2')}
                        className="text-[11px] font-bold text-cyan-400 hover:underline cursor-pointer"
                      >
                        Xem tất cả ({savingsGoals.length})
                      </button>
                    </div>

                    {savingsGoals.slice(0, 2).map(goal => (
                      <div key={goal.id} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{goal.title}</span>
                          <span className="text-cyan-400 font-extrabold">
                            {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 rounded-full"
                            style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Debt & Loan Summary Peek */}
                  <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                        <Users size={15} className="text-teal-400" />
                        Sổ Vay Nợ Nhanh
                      </h4>
                      <button
                        onClick={() => handleSetPage('page2')}
                        className="text-[11px] font-bold text-teal-400 hover:underline cursor-pointer"
                      >
                        Chi tiết
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                        <span className="text-[10px] text-zinc-400">Cho vay</span>
                        <p className="text-xs font-black text-teal-300">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                            debts.filter(d => d.type === 'lent' && d.status !== 'completed').reduce((s, d) => s + (d.amount - d.paidAmount), 0)
                          )}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                        <span className="text-[10px] text-zinc-400">Đi vay</span>
                        <p className="text-xs font-black text-rose-400">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                            debts.filter(d => d.type === 'borrowed' && d.status !== 'completed').reduce((s, d) => s + (d.amount - d.paidAmount), 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Analytics Quick Peek */}
                  <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                        <BarChart3 size={15} className="text-emerald-400" />
                        Phân Bổ Chi Tiêu
                      </h4>
                      <button
                        onClick={() => handleSetPage('page5')}
                        className="text-[11px] font-bold text-emerald-400 hover:underline cursor-pointer"
                      >
                        Tính toán tài chính
                      </button>
                    </div>
                    <FinanceAnalyticsCharts
                      transactions={transactions}
                      categories={categories}
                      budget={budget}
                      selectedMonth={selectedMonth}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= PAGE 2: NGÂN SÁCH, TIẾT KIỆM & NỢ VAY ================= */}
        {currentPage === 'page2' && (
          <div className="space-y-6">
            {/* Sub-tab navigation for Page 2 */}
            <div className="flex items-center gap-2 p-1.5 bg-zinc-950 rounded-2xl border border-zinc-800 overflow-x-auto no-scrollbar">
              {[
                { id: 'budget', label: '⚖️ Ngân Sách 50/30/20 & 6 Hũ' },
                { id: 'heatmap', label: '🔥 Bản Đồ Nhiệt Chi Tiêu 30 Ngày (D3.js)' },
                { id: 'growth', label: '📈 Tăng Trưởng 6 Hũ (30 Ngày)' },
                { id: 'sunburst', label: '☀️ Sunburst 6 Hũ (D3.js)' },
                { id: 'savings', label: '🐷 Mục Tiêu Tiết Kiệm' },
                { id: 'debts', label: '👥 Sổ Vay Nợ & Trả Góp' },
                { id: 'recurring', label: '🔁 Hóa Đơn Định Kỳ' },
                { id: 'achievements', label: '🏆 Cột Mốc & Huy Hiệu' },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setPage2SubTab(sub.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    page2SubTab === sub.id
                      ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Sub-view: D3 Finance Heatmap (Food, Edu, Entertainment 30-Day Intensity) */}
            {page2SubTab === 'heatmap' && (
              <FinanceHeatmap
                transactions={transactions}
                categories={categories}
                budget={budget}
                onAddTransaction={handleAddTransaction}
                onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
              />
            )}

            {/* Sub-view: Recharts 6-Jars 30-Day Savings Growth */}
            {page2SubTab === 'growth' && (
              <FinanceSixJarsSavingsGrowthChart
                transactions={transactions}
                categories={categories}
                budget={budget}
                onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
              />
            )}

            {/* Sub-view: D3 Sunburst 6-Jars */}
            {page2SubTab === 'sunburst' && (
              <FinanceD3SunburstChart
                transactions={transactions}
                categories={categories}
                budget={budget}
                selectedMonth={selectedMonth}
                onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
              />
            )}

            {/* Sub-view: Achievements */}
            {page2SubTab === 'achievements' && (
              <FinanceAchievementsSection
                badges={badges}
                onRefreshBadges={() => setRefreshBadgesCounter(c => c + 1)}
              />
            )}

            {/* Sub-view: Budget */}
            {page2SubTab === 'budget' && (
              <FinanceBudgetView
                budget={budget}
                categories={categories}
                transactions={transactions}
                selectedMonth={selectedMonth}
                onSaveBudget={(updatedBudget) => {
                  setBudget(prev => ({ ...prev, ...updatedBudget }));
                }}
                onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
              />
            )}

            {/* Sub-view: Savings */}
            {page2SubTab === 'savings' && (
              <FinanceSavingsGoalsView
                goals={savingsGoals}
                wallets={wallets}
                onAddGoal={(g) => {
                  const newGoal: FinanceSavingsGoal = {
                    ...g,
                    id: `goal_${Date.now()}`,
                    createdAt: new Date().toISOString(),
                  };
                  setSavingsGoals(prev => [...prev, newGoal]);
                }}
                onEditGoal={(id, g) => {
                  setSavingsGoals(prev => prev.map(item => item.id === id ? { ...item, ...g } : item));
                }}
                onDeleteGoal={(id) => {
                  setSavingsGoals(prev => prev.filter(item => item.id !== id));
                }}
                onDepositToGoal={handleDepositToGoal}
              />
            )}

            {/* Sub-view: Debts */}
            {page2SubTab === 'debts' && (
              <FinanceDebtTrackerView
                debts={debts}
                wallets={wallets}
                onAddDebt={(d) => {
                  const newDebt: FinanceDebtRecord = {
                    ...d,
                    id: `debt_${Date.now()}`,
                    createdAt: new Date().toISOString(),
                  };
                  setDebts(prev => [...prev, newDebt]);
                }}
                onEditDebt={(id, d) => {
                  setDebts(prev => prev.map(item => item.id === id ? { ...item, ...d } : item));
                }}
                onDeleteDebt={(id) => {
                  setDebts(prev => prev.filter(item => item.id !== id));
                }}
                onRepayDebt={handleRepayDebt}
              />
            )}

            {/* Sub-view: Recurring */}
            {page2SubTab === 'recurring' && (
              <FinanceRecurringView
                recurringList={recurringList}
                categories={categories}
                wallets={wallets}
                onAddRecurring={(r) => {
                  const newRec: FinanceRecurringTransaction = {
                    ...r,
                    id: `rec_${Date.now()}`,
                  };
                  setRecurringList(prev => [...prev, newRec]);
                }}
                onToggleActive={(id, active) => {
                  setRecurringList(prev => prev.map(item => item.id === id ? { ...item, isActive: active } : item));
                }}
                onDeleteRecurring={(id) => {
                  setRecurringList(prev => prev.filter(item => item.id !== id));
                }}
              />
            )}
          </div>
        )}

        {/* ================= PAGE 3: THÊM CHI TIÊU NHANH ================= */}
        {currentPage === 'page3' && (
          <FinanceAddExpenseView
            wallets={wallets}
            categories={categories}
            currentUserId={currentUserId}
            onAddTransaction={handleAddTransaction}
            onSuccess={() => handleSetPage('page1')}
            onOpenVoiceExpense={() => setIsVoiceExpenseModalOpen(true)}
          />
        )}

        {/* ================= PAGE 4: QUỸ GIA ĐÌNH ================= */}
        {currentPage === 'page4' && (
          <FinanceFamilyFundView
            wallets={wallets}
            transactions={transactions}
            selectedMonth={selectedMonth}
            onAddTransaction={handleAddTransaction}
          />
        )}

        {/* ================= PAGE 5: CÔNG CỤ TÍNH LÃI & TOÁN TÀI CHÍNH ================= */}
        {currentPage === 'page5' && (
          <FinanceCalculatorsView />
        )}
      </div>

      {/* Wallets & Accounts Modal */}
      <FinanceWalletsModal
        isOpen={isWalletsModalOpen}
        onClose={() => setIsWalletsModalOpen(false)}
        wallets={wallets}
        onAddWallet={handleAddWallet}
        onEditWallet={handleEditWallet}
        onDeleteWallet={handleDeleteWallet}
        onTransfer={handleTransfer}
      />

      {/* Gemini AI 6-Jars & Spending Habits Advisor Modal */}
      <FinanceAIAdvisorModal
        isOpen={isAiAdvisorOpen}
        onClose={() => setIsAiAdvisorOpen(false)}
        transactions={transactions}
        wallets={wallets}
        budget={budget}
        categories={categories}
        selectedMonth={selectedMonth}
        savingsGoals={savingsGoals}
        debts={debts}
        onApplyBudget={(updatedCategoryLimits, monthlyLimit) => {
          setBudget(prev => ({
            ...prev,
            totalMonthlyLimit: monthlyLimit,
            categoryLimits: {
              ...(prev?.categoryLimits || {}),
              ...updatedCategoryLimits,
            },
          }));
        }}
      />

      {/* Newly Unlocked Milestone Toast Banner */}
      <FinanceMilestoneToast
        unlockedBadge={toastBadge}
        onClose={() => setToastBadge(null)}
        onViewBadge={(b) => {
          setSelectedModalBadge(b);
          setIsBadgeModalOpen(true);
          setToastBadge(null);
        }}
      />

      {/* Badge Detail & Reward Claim Modal */}
      <FinanceBadgeDetailModal
        badge={selectedModalBadge}
        isOpen={isBadgeModalOpen}
        onClose={() => {
          setIsBadgeModalOpen(false);
          setSelectedModalBadge(null);
        }}
        onClaimReward={async (badgeId) => {
          const target = badges.find(b => b.id === badgeId);
          if (target && target.isUnlocked && !target.isClaimed) {
            setBadgeClaimed(badgeId);
            if (addAudioPoints) {
              await addAudioPoints(
                target.rewardXu,
                `Thưởng Cột Mốc Tài Chính: ${target.title} (${target.subtitle})`,
                'bonus'
              );
            }
            setRefreshBadgesCounter(c => c + 1);
            if (selectedModalBadge) {
              setSelectedModalBadge(prev => prev ? { ...prev, isClaimed: true } : null);
            }
          }
        }}
      />

      {/* Canvas-Based Savings Milestone Celebration Confetti */}
      <SavingsMilestoneConfettiCanvas
        celebration={savingsCelebration}
        onClose={() => setSavingsCelebration(null)}
      />

      {/* Voice Expense Fast Auto-Logger Modal */}
      <FinanceVoiceExpenseModal
        isOpen={isVoiceExpenseModalOpen}
        onClose={() => setIsVoiceExpenseModalOpen(false)}
        wallets={wallets}
        categories={categories}
        currentUserId={currentUserId}
        onAddTransaction={handleAddTransaction}
        onNavigateToAll={() => handleSetPage('page1')}
      />
    </div>
  );
}
