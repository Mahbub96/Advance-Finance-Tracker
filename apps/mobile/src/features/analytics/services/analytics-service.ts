import {
  moneyString,
  parseMoney,
  subtractMoney,
  TransactionType,
  type MoneyString,
} from '@personal-finance/types';
import type { AccountRepository } from '../../../repositories/account-repository';
import type { BudgetRepository } from '../../../repositories/budget-repository';
import type { CategoryRepository } from '../../../repositories/category-repository';
import type { DebtRepository } from '../../../repositories/debt-repository';
import type { GoalRepository } from '../../../repositories/goal-repository';
import type { RecurringRuleRepository } from '../../../repositories/recurring-rule-repository';
import type { SettingsRepository } from '../../../repositories/settings-repository';
import type { TransactionRepository } from '../../../repositories/transaction-repository';

export type CashFlowSummary = {
  totalIncome: MoneyString;
  totalExpenses: MoneyString;
  netSavings: MoneyString;
  savingsRatePercent: number;
};

export type CategoryBreakdownItem = {
  categoryId: string | null;
  categoryName: string;
  totalSpent: MoneyString;
  percentageOfExpenses: number;
};

export type MonthlyCashFlowPoint = {
  label: string;
  yearMonth: string;
  income: number;
  expense: number;
  net: number;
};

export type DailyTrajectoryPoint = {
  day: number;
  label: string;
  value: number;
};

export type FullExportData = {
  version: number;
  exportedAt: string;
  accounts: unknown[];
  categories: unknown[];
  transactions: unknown[];
  budgets: unknown[];
  recurringRules: unknown[];
  debts: unknown[];
  debtRepayments: unknown[];
  goals: unknown[];
  goalContributions: unknown[];
};

export class AnalyticsService {
  constructor(
    private readonly accounts: AccountRepository,
    private readonly categories: CategoryRepository,
    private readonly transactions: TransactionRepository,
    private readonly budgets: BudgetRepository,
    private readonly recurringRules: RecurringRuleRepository,
    private readonly debts: DebtRepository,
    private readonly goals: GoalRepository,
    private readonly settings: SettingsRepository,
  ) {}

  async getCashFlow(startDate: string, endDate: string): Promise<CashFlowSummary> {
    const rows = await this.transactions.listByDateRange(startDate, endDate);

    const totalIncome = rows
      .filter((tx) => tx.type === TransactionType.INCOME)
      .reduce((sum, tx) => moneyString(parseMoney(sum).plus(parseMoney(tx.amount))), '0.00');

    const totalExpenses = rows
      .filter((tx) => tx.type === TransactionType.EXPENSE)
      .reduce((sum, tx) => moneyString(parseMoney(sum).plus(parseMoney(tx.amount))), '0.00');

    const netSavings = subtractMoney(totalIncome, totalExpenses);
    const savingsRatePercent = parseMoney(totalIncome).isPositive()
      ? Math.max(
          0,
          Math.min(
            100,
            parseMoney(netSavings).div(parseMoney(totalIncome)).times(100).round().toNumber(),
          ),
        )
      : 0;

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRatePercent,
    };
  }

  async getCategoryBreakdown(startDate: string, endDate: string): Promise<CategoryBreakdownItem[]> {
    const rows = await this.transactions.listByDateRange(startDate, endDate);
    const allCategories = await this.categories.list(true);

    const expenseTransactions = rows.filter((tx) => tx.type === TransactionType.EXPENSE);
    const totalExpenseAmount = expenseTransactions.reduce(
      (sum, tx) => moneyString(parseMoney(sum).plus(parseMoney(tx.amount))),
      '0.00',
    );

    const categoryMap = new Map<string | null, string>();
    for (const tx of expenseTransactions) {
      const current = categoryMap.get(tx.categoryId) ?? '0.00';
      categoryMap.set(tx.categoryId, moneyString(parseMoney(current).plus(parseMoney(tx.amount))));
    }

    const result: CategoryBreakdownItem[] = [];
    for (const [categoryId, spent] of categoryMap.entries()) {
      const cat = allCategories.find((c) => c.id === categoryId);
      const percentageOfExpenses = parseMoney(totalExpenseAmount).isPositive()
        ? parseMoney(spent).div(parseMoney(totalExpenseAmount)).times(100).round().toNumber()
        : 0;

      result.push({
        categoryId,
        categoryName: cat?.name ?? 'Uncategorized',
        totalSpent: spent,
        percentageOfExpenses,
      });
    }

    return result.sort((a, b) => b.percentageOfExpenses - a.percentageOfExpenses);
  }

  /**
   * Computes real multi-month cash flow history from actual transaction records
   */
  async getMonthlyCashFlowHistory(monthsCount = 6): Promise<MonthlyCashFlowPoint[]> {
    const points: MonthlyCashFlowPoint[] = [];
    const now = new Date();

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthLabel = monthNames[month] ?? '';
      const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;

      const firstDay = `${yearMonth}-01`;
      const lastDayDate = new Date(year, month + 1, 0).getDate();
      const lastDay = `${yearMonth}-${String(lastDayDate).padStart(2, '0')}`;

      const summary = await this.getCashFlow(firstDay, lastDay);

      points.push({
        label: monthLabel,
        yearMonth,
        income: parseFloat(summary.totalIncome),
        expense: parseFloat(summary.totalExpenses),
        net: parseFloat(summary.netSavings),
      });
    }

    return points;
  }

  /**
   * Computes real daily spending trajectory for the current month
   */
  async getDailySpendingTrajectory(yearMonth?: string): Promise<DailyTrajectoryPoint[]> {
    const targetYM = yearMonth || new Date().toISOString().slice(0, 7);
    const [yearStr, monthStr] = targetYM.split('-');
    const year = parseInt(yearStr || '2026', 10);
    const month = parseInt(monthStr || '01', 10);

    const firstDay = `${targetYM}-01`;
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const lastDay = `${targetYM}-${String(lastDayOfMonth).padStart(2, '0')}`;

    const txs = await this.transactions.listByDateRange(firstDay, lastDay);
    const expenseTxs = txs.filter((tx) => tx.type === TransactionType.EXPENSE);

    // Group expenses by day
    const dayMap = new Map<number, number>();
    for (let d = 1; d <= lastDayOfMonth; d++) {
      dayMap.set(d, 0);
    }

    for (const tx of expenseTxs) {
      const day = parseInt(tx.transactionDate.slice(8, 10), 10);
      const current = dayMap.get(day) || 0;
      dayMap.set(day, current + parseFloat(tx.amount));
    }

    const isCurrentMonth = targetYM === new Date().toISOString().slice(0, 7);
    const currentDay = isCurrentMonth ? new Date().getDate() : lastDayOfMonth;

    // Build cumulative spending points
    const points: DailyTrajectoryPoint[] = [];
    let cumulative = 0;

    for (let d = 1; d <= currentDay; d++) {
      cumulative += dayMap.get(d) || 0;
      points.push({
        day: d,
        label: `Day ${d}`,
        value: cumulative,
      });
    }

    // If only 1 point or empty, ensure at least 2 points for visual rendering
    if (points.length === 1) {
      points.unshift({ day: 0, label: 'Day 0', value: 0 });
    }

    return points;
  }

  /**
   * Computes real net daily balance sparkline over the last N days
   */
  async getDailyBalanceSparkline(days = 14): Promise<number[]> {
    const allAccounts = await this.accounts.list(false);
    const openingSum = allAccounts.reduce((sum, a) => sum + parseFloat(a.openingBalance), 0);

    const now = new Date();
    const startDateObj = new Date(now.getTime() - (days - 1) * 86400000);
    const allTxs = await this.transactions.list(100000);

    const sparklineData: number[] = [];

    for (let i = 0; i < days; i++) {
      const targetDate = new Date(startDateObj.getTime() + i * 86400000).toISOString().slice(0, 10);

      // Sum all transactions up to this date
      let netDelta = 0;
      for (const tx of allTxs) {
        if (!tx.deletedAt && tx.transactionDate <= targetDate) {
          const val = parseFloat(tx.amount);
          if (tx.type === TransactionType.INCOME) {
            netDelta += val;
          } else if (tx.type === TransactionType.EXPENSE) {
            netDelta -= val;
          }
        }
      }

      const dayEndBalance = Math.max(0, Math.round(openingSum + netDelta));
      sparklineData.push(dayEndBalance);
    }

    return sparklineData.length > 0 ? sparklineData : [openingSum, openingSum];
  }

  async exportAllData(): Promise<FullExportData> {
    const [accs, cats, txs, bgs, rules, dbs, reps, gls, conts] = await Promise.all([
      this.accounts.list(true),
      this.categories.list(true),
      this.transactions.list(100000),
      this.budgets.list(true),
      this.recurringRules.list(true),
      this.debts.list(true),
      this.debts.listAllRepayments(),
      this.goals.list(true),
      this.goals.listAllContributions(),
    ]);

    return {
      version: 5,
      exportedAt: new Date().toISOString(),
      accounts: accs,
      categories: cats,
      transactions: txs,
      budgets: bgs,
      recurringRules: rules,
      debts: dbs,
      debtRepayments: reps,
      goals: gls,
      goalContributions: conts,
    };
  }
}
