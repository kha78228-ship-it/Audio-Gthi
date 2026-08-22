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
  Crown
} from 'lucide-react';
import { 
  FinanceWallet, 
  FinanceTransaction, 
  FinanceCategory, 
  FinanceBudget, 
  FinanceSavingsGoal, 
  FinanceDebtRecord, 
  FinanceRecurringTransaction 
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

interface FinanceViewProps {
  currentUserId?: string;
  isVip?: boolean;
  onUpgradeVip?: () => void;
  activePage?: 'page1' | 'page2' | 'page3' | 'page4' | 'page5';
  onSelectPage?: (page: 'page1' | 'page2' | 'page3' | 'page4' | 'page5') => void;
}

export function FinanceView({ 
  currentUserId = 'user_haevy', 
  isVip = true, 
  onUpgradeVip,
  activePage,
  onSelectPage
}: FinanceViewProps) {
  // Active 5-Page System
  const [localPage, setLocalPage] = useState<'page1' | 'page2' | 'page3' | 'page4' | 'page5'>('page1');
  const currentPage = activePage || localPage;

  const handleSetPage = (p: 'page1' | 'page2' | 'page3' | 'page4' | 'page5') => {
    setLocalPage(p);
    if (onSelectPage) onSelectPage(p);
  };

  // Sub-tabs for Page 2 (Ngân Sách / Tiết Kiệm / Nợ Vay / Định Kỳ)
  const [page2SubTab, setPage2SubTab] = useState<'budget' | 'savings' | 'debts' | 'recurring'>('budget');

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

  // Modal Controls
  const [isWalletsModalOpen, setIsWalletsModalOpen] = useState(false);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);

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

          {/* Wallet Manager Button */}
          <div className="flex items-center gap-2">
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
              onOpenWallets={() => setIsWalletsModalOpen(true)}
              onOpenBudget={() => handleSetPage('page2')}
              onOpenAiAdvisor={() => handleSetPage('page5')}
            />

            {/* Quick Mini Charts & Full Transactions */}
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
                />
              </div>

              {/* Sidebar Quick Shortcuts */}
              <div className="lg:col-span-4 space-y-4">
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
                    selectedMonth={selectedMonth}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= PAGE 2: NGÂN SÁCH, TIẾT KIỆM & NỢ VAY ================= */}
        {currentPage === 'page2' && (
          <div className="space-y-6">
            {/* Sub-tab navigation for Page 2 */}
            <div className="flex items-center gap-2 p-1.5 bg-zinc-950 rounded-2xl border border-zinc-800 overflow-x-auto no-scrollbar">
              {[
                { id: 'budget', label: '⚖️ Ngân Sách 50/30/20' },
                { id: 'savings', label: '🐷 Mục Tiêu Tiết Kiệm' },
                { id: 'debts', label: '👥 Sổ Vay Nợ & Trả Góp' },
                { id: 'recurring', label: '🔁 Hóa Đơn Định Kỳ' },
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
    </div>
  );
}
