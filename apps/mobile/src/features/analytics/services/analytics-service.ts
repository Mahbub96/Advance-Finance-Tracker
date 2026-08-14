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
