import { 
  FinanceWallet, 
  FinanceTransaction, 
  FinanceBudget, 
  FinanceSavingsGoal, 
  FinanceDebtRecord, 
  FinanceAchievementBadge 
} from '../types';

export const FINANCE_CLAIMED_ACHIEVEMENTS_KEY = 'haevy_finance_claimed_achievements_v1';
export const FINANCE_UNLOCKED_SEEN_KEY = 'haevy_finance_unlocked_seen_v1';

export interface EvaluateFinanceParams {
  wallets: FinanceWallet[];
  transactions: FinanceTransaction[];
  budget?: FinanceBudget;
  savingsGoals: FinanceSavingsGoal[];
  debts: FinanceDebtRecord[];
  selectedMonth: string; // YYYY-MM
}

/**
 * Get IDs of already claimed badges
 */
export function getClaimedAchievementIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FINANCE_CLAIMED_ACHIEVEMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Persist claimed badge ID
 */
export function setBadgeClaimed(badgeId: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getClaimedAchievementIds();
    if (!current.includes(badgeId)) {
      const updated = [...current, badgeId];
      localStorage.setItem(FINANCE_CLAIMED_ACHIEVEMENTS_KEY, JSON.stringify(updated));
      return updated;
    }
    return current;
  } catch (e) {
    return [];
  }
}

/**
 * Formatter for currency
 */
function formatShortVND(val: number): string {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)} Tỷ ₫`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} Tr ₫`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k ₫`;
  return `${val} ₫`;
}

/**
 * Compute real-time achievement badges based on the user's financial activity & milestones
 */
export function computeFinanceAchievements({
  wallets,
  transactions,
  budget,
  savingsGoals,
  debts,
  selectedMonth
}: EvaluateFinanceParams): FinanceAchievementBadge[] {
  const claimedIds = getClaimedAchievementIds();

  // 1. Month-scoped calculations
  const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
  const monthExpenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthNetSavings = monthIncome - monthExpenses;
  const monthSavingsRate = monthIncome > 0 ? (monthNetSavings / monthIncome) * 100 : 0;

  // 2. Savings goals calculations
  const totalSavedInGoals = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const completedGoalsCount = savingsGoals.filter(g => g.isCompleted || (g.targetAmount > 0 && g.currentAmount >= g.targetAmount)).length;
  const effectiveSavingsTotal = Math.max(totalSavedInGoals, monthNetSavings > 0 ? monthNetSavings : 0);

  // 3. Total net worth
  const totalBalance = wallets
    .filter(w => !w.isExcludedFromTotal)
    .reduce((sum, w) => sum + w.balance, 0);

  // 4. Budget calculations
  const monthlyLimit = budget?.totalMonthlyLimit || 15_000_000;
  const budgetSpentPercent = monthlyLimit > 0 ? (monthExpenses / monthlyLimit) * 100 : 0;

  // 5. Debt calculations
  const completedDebtsCount = debts.filter(d => d.status === 'completed' || d.paidAmount >= d.amount).length;
  const remainingDebt = debts.filter(d => d.type === 'borrowed' && d.status !== 'completed').reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  // ==========================================
  // BADGE 1: MASTER SAVER (Bậc Thầy Tiết Kiệm)
  // Milestone: Tích lũy đạt 5,000,000 ₫ hoặc hoàn thành 1 mục tiêu tiết kiệm
  // ==========================================
  const masterSaverTarget = 5_000_000;
  const masterSaverCurrent = effectiveSavingsTotal;
  const isMasterSaverUnlocked = masterSaverCurrent >= masterSaverTarget || completedGoalsCount >= 1;
  const masterSaverPercent = isMasterSaverUnlocked 
    ? 100 
    : Math.min(Math.round((masterSaverCurrent / masterSaverTarget) * 100), 99);

  const masterSaverLevel = masterSaverCurrent >= 20_000_000 ? 4 : masterSaverCurrent >= 10_000_000 ? 3 : isMasterSaverUnlocked ? 2 : 1;
  const masterSaverLevelName = masterSaverLevel === 4 ? 'Diamond' : masterSaverLevel === 3 ? 'Gold' : masterSaverLevel === 2 ? 'Silver' : 'Bronze';

  const badgeMasterSaver: FinanceAchievementBadge = {
    id: 'master_saver',
    title: 'Master Saver',
    subtitle: 'Bậc Thầy Tích Lũy',
    description: 'Thành tựu vinh danh người dùng có kỷ luật tiết kiệm xuất sắc, hoàn thành mục tiêu tài chính hoặc tích lũy vượt 5.000.000 ₫.',
    category: 'savings',
    iconUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=300&q=80',
    fallbackSeed: 'mastersaver_badge',
    accentColor: '#10B981', // Emerald
    gradient: 'from-emerald-500 via-teal-400 to-amber-400',
    badgeLevel: masterSaverLevel,
    levelName: masterSaverLevelName,
    isUnlocked: isMasterSaverUnlocked,
    isClaimed: claimedIds.includes('master_saver'),
    currentValue: masterSaverCurrent,
    targetValue: masterSaverTarget,
    unit: '₫',
    progressPercent: masterSaverPercent,
    milestoneDescription: completedGoalsCount >= 1 
      ? `Đã hoàn thành ${completedGoalsCount} mục tiêu tiết kiệm!` 
      : `Đã tích lũy ${formatShortVND(masterSaverCurrent)} / ${formatShortVND(masterSaverTarget)}`,
    rewardXu: 100,
    rarity: 'legendary'
  };

  // ==========================================
  // BADGE 2: BUDGET NINJA (Ninja Ngân Sách)
  // Milestone: Duy trì tổng chi tiêu ≤ 100% ngân sách tháng với ít nhất 3 khoản chi
  // ==========================================
  const budgetNinjaTarget = 100; // percent max
  const hasExpensesLogged = monthTransactions.filter(t => t.type === 'expense').length >= 3;
  const isBudgetNinjaUnlocked = hasExpensesLogged && monthExpenses <= monthlyLimit;
  const budgetNinjaEfficiency = monthlyLimit > 0 ? Math.max(0, Math.round(100 - budgetSpentPercent)) : 0;
  const budgetNinjaPercent = isBudgetNinjaUnlocked 
    ? 100 
    : hasExpensesLogged 
    ? Math.max(0, Math.min(100, 100 - Math.max(0, Math.round(budgetSpentPercent - 100))))
    : 40;

  const budgetNinjaLevel = budgetSpentPercent <= 70 && hasExpensesLogged ? 4 : budgetSpentPercent <= 85 && hasExpensesLogged ? 3 : isBudgetNinjaUnlocked ? 2 : 1;
  const budgetNinjaLevelName = budgetNinjaLevel === 4 ? 'Diamond' : budgetNinjaLevel === 3 ? 'Gold' : budgetNinjaLevel === 2 ? 'Silver' : 'Bronze';

  const badgeBudgetNinja: FinanceAchievementBadge = {
    id: 'budget_ninja',
    title: 'Budget Ninja',
    subtitle: 'Ninja Ngân Sách',
    description: 'Thành tựu dành cho bậc thầy kiểm soát dòng tiền, tuân thủ nghiêm ngặt hạn mức ngân sách chi tiêu và không bao giờ bội chi.',
    category: 'budget',
    iconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    fallbackSeed: 'budgetninja_badge',
    accentColor: '#06B6D4', // Cyan
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    badgeLevel: budgetNinjaLevel,
    levelName: budgetNinjaLevelName,
    isUnlocked: isBudgetNinjaUnlocked,
    isClaimed: claimedIds.includes('budget_ninja'),
    currentValue: Math.round(budgetSpentPercent),
    targetValue: budgetNinjaTarget,
    unit: '%',
    progressPercent: budgetNinjaPercent,
    milestoneDescription: isBudgetNinjaUnlocked 
      ? `Chi tiêu kỷ luật ${Math.round(budgetSpentPercent)}% / 100% hạn mức (Dư ${budgetNinjaEfficiency}%)` 
      : hasExpensesLogged 
      ? `Hiện đang tiêu ${Math.round(budgetSpentPercent)}% hạn mức` 
      : 'Cần ghi chép tối thiểu 3 khoản chi trong tháng',
    rewardXu: 150,
    rarity: 'epic'
  };

  // ==========================================
  // BADGE 3: DEBT CRUSHER (Dũng Sĩ Xóa Nợ)
  // Milestone: Hoàn tất thanh toán 1 khoản nợ hoặc sạch nợ hoàn toàn
  // ==========================================
  const isDebtCrusherUnlocked = completedDebtsCount >= 1 || (debts.length > 0 && remainingDebt === 0) || (debts.length === 0 && wallets.length >= 2);
  const debtCrusherCurrent = completedDebtsCount;
  const debtCrusherTarget = 1;
  const debtCrusherPercent = isDebtCrusherUnlocked ? 100 : remainingDebt === 0 ? 100 : Math.min(Math.round((completedDebtsCount / 1) * 100), 50);

  const badgeDebtCrusher: FinanceAchievementBadge = {
    id: 'debt_crusher',
    title: 'Debt Crusher',
    subtitle: 'Dũng Sĩ Xóa Nợ',
    description: 'Vinh danh tinh thần giải phóng tài chính, thanh toán dứt điểm các khoản nợ vay và giữ bảng cân đối tài chính lành mạnh.',
    category: 'debt',
    iconUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=300&q=80',
    fallbackSeed: 'debtcrusher_badge',
    accentColor: '#F59E0B', // Amber
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    badgeLevel: completedDebtsCount >= 3 ? 4 : completedDebtsCount >= 2 ? 3 : isDebtCrusherUnlocked ? 2 : 1,
    levelName: completedDebtsCount >= 3 ? 'Diamond' : completedDebtsCount >= 2 ? 'Gold' : isDebtCrusherUnlocked ? 'Silver' : 'Bronze',
    isUnlocked: isDebtCrusherUnlocked,
    isClaimed: claimedIds.includes('debt_crusher'),
    currentValue: debtCrusherCurrent,
    targetValue: debtCrusherTarget,
    unit: 'khoản nợ',
    progressPercent: debtCrusherPercent,
    milestoneDescription: isDebtCrusherUnlocked 
      ? `Đã thanh toán dứt điểm khoản nợ, bảng tài chính an toàn!` 
      : `Còn nợ ${formatShortVND(remainingDebt)} cần thanh toán`,
    rewardXu: 120,
    rarity: 'rare'
  };

  // ==========================================
  // BADGE 4: WEALTH ARCHITECT (Kiến Trúc Sư Tài Sản)
  // Milestone: Sở hữu từ 3 ví tài khoản trở lên và tổng tài sản >= 10,000,000 ₫
  // ==========================================
  const wealthTarget = 10_000_000;
  const isWealthArchitectUnlocked = totalBalance >= wealthTarget && wallets.length >= 3;
  const wealthPercent = isWealthArchitectUnlocked ? 100 : Math.min(Math.round((totalBalance / wealthTarget) * 100), 99);

  const badgeWealthArchitect: FinanceAchievementBadge = {
    id: 'wealth_architect',
    title: 'Wealth Architect',
    subtitle: 'Kiến Trúc Sư Tài Sản',
    description: 'Xây dựng cấu trúc đa ví tài chính vững chắc, phân bổ tài sản thông minh và đạt quy mô tài sản khả dụng trên 10.000.000 ₫.',
    category: 'wealth',
    iconUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=300&q=80',
    fallbackSeed: 'wealtharchitect_badge',
    accentColor: '#8B5CF6', // Purple
    gradient: 'from-purple-500 via-violet-500 to-indigo-500',
    badgeLevel: totalBalance >= 50_000_000 ? 4 : totalBalance >= 25_000_000 ? 3 : isWealthArchitectUnlocked ? 2 : 1,
    levelName: totalBalance >= 50_000_000 ? 'Diamond' : totalBalance >= 25_000_000 ? 'Gold' : isWealthArchitectUnlocked ? 'Silver' : 'Bronze',
    isUnlocked: isWealthArchitectUnlocked,
    isClaimed: claimedIds.includes('wealth_architect'),
    currentValue: totalBalance,
    targetValue: wealthTarget,
    unit: '₫',
    progressPercent: wealthPercent,
    milestoneDescription: isWealthArchitectUnlocked 
      ? `Tổng tài sản đạt ${formatShortVND(totalBalance)} trên ${wallets.length} ví` 
      : `Tài sản ${formatShortVND(totalBalance)} / ${formatShortVND(wealthTarget)} (${wallets.length}/3 ví)`,
    rewardXu: 200,
    rarity: 'legendary'
  };

  // ==========================================
  // BADGE 5: CASHFLOW ALCHEMIST (Nhà Luyện Kim Dòng Tiền)
  // Milestone: Thu nhập tháng > Chi tiêu từ 3,000,000 ₫ và Tỷ lệ tiết kiệm > 20%
  // ==========================================
  const cashflowTarget = 3_000_000;
  const isCashflowUnlocked = monthNetSavings >= cashflowTarget && monthSavingsRate >= 20;
  const cashflowPercent = isCashflowUnlocked 
    ? 100 
    : monthNetSavings > 0 
    ? Math.min(Math.round((monthNetSavings / cashflowTarget) * 100), 99) 
    : 0;

  const badgeCashflow: FinanceAchievementBadge = {
    id: 'cashflow_alchemist',
    title: 'Cashflow Alchemist',
    subtitle: 'Nhà Luyện Kim Dòng Tiền',
    description: 'Chinh phục dòng tiền ròng dương mạnh mẽ, biến thu nhập thành giá trị tích lũy với tỷ suất thặng dư trên 20%.',
    category: 'cashflow',
    iconUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=300&q=80',
    fallbackSeed: 'cashflowalchemist_badge',
    accentColor: '#EC4899', // Pink
    gradient: 'from-pink-500 via-rose-500 to-amber-500',
    badgeLevel: monthSavingsRate >= 50 ? 4 : monthSavingsRate >= 35 ? 3 : isCashflowUnlocked ? 2 : 1,
    levelName: monthSavingsRate >= 50 ? 'Diamond' : monthSavingsRate >= 35 ? 'Gold' : isCashflowUnlocked ? 'Silver' : 'Bronze',
    isUnlocked: isCashflowUnlocked,
    isClaimed: claimedIds.includes('cashflow_alchemist'),
    currentValue: Math.max(0, monthNetSavings),
    targetValue: cashflowTarget,
    unit: '₫',
    progressPercent: cashflowPercent,
    milestoneDescription: isCashflowUnlocked 
      ? `Thặng dư +${formatShortVND(monthNetSavings)} (Tích lũy ${Math.round(monthSavingsRate)}%)` 
      : `Dòng tiền thặng dư ${formatShortVND(monthNetSavings)} / ${formatShortVND(cashflowTarget)}`,
    rewardXu: 80,
    rarity: 'rare'
  };

  // ==========================================
  // BADGE 6: DISCIPLINE DIAMOND (Kỷ Luật Kim Cương)
  // Milestone: Ghi chép từ 10 giao dịch thu chi trở lên trong tháng
  // ==========================================
  const disciplineTarget = 10;
  const disciplineCurrent = monthTransactions.length;
  const isDisciplineUnlocked = disciplineCurrent >= disciplineTarget;
  const disciplinePercent = isDisciplineUnlocked ? 100 : Math.min(Math.round((disciplineCurrent / disciplineTarget) * 100), 99);

  const badgeDiscipline: FinanceAchievementBadge = {
    id: 'discipline_diamond',
    title: 'Discipline Diamond',
    subtitle: 'Kỷ Luật Kim Cương',
    description: 'Kiên trì theo dõi mọi dòng tiền ra vào, ghi chép sổ sách kế toán cá nhân từ 10 giao dịch minh bạch trong tháng.',
    category: 'discipline',
    iconUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80',
    fallbackSeed: 'disciplinediamond_badge',
    accentColor: '#3B82F6', // Blue
    gradient: 'from-blue-500 via-cyan-400 to-emerald-400',
    badgeLevel: disciplineCurrent >= 30 ? 4 : disciplineCurrent >= 20 ? 3 : isDisciplineUnlocked ? 2 : 1,
    levelName: disciplineCurrent >= 30 ? 'Diamond' : disciplineCurrent >= 20 ? 'Gold' : isDisciplineUnlocked ? 'Silver' : 'Bronze',
    isUnlocked: isDisciplineUnlocked,
    isClaimed: claimedIds.includes('discipline_diamond'),
    currentValue: disciplineCurrent,
    targetValue: disciplineTarget,
    unit: 'giao dịch',
    progressPercent: disciplinePercent,
    milestoneDescription: isDisciplineUnlocked 
      ? `Đã ghi nhận ${disciplineCurrent} giao dịch minh bạch trong tháng` 
      : `Đã ghi chép ${disciplineCurrent} / ${disciplineTarget} giao dịch`,
    rewardXu: 90,
    rarity: 'common'
  };

  return [
    badgeMasterSaver,
    badgeBudgetNinja,
    badgeDebtCrusher,
    badgeWealthArchitect,
    badgeCashflow,
    badgeDiscipline
  ];
}
