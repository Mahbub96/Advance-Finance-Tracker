import { TransactionStatus, TransactionType } from '@personal-finance/types';
import type { CategoryRecord, TransactionRecord } from '../../../database/records';
import type { AccountRepository } from '../../../repositories/account-repository';
import type { BudgetRepository } from '../../../repositories/budget-repository';
import type { CategoryRepository } from '../../../repositories/category-repository';
import type { DebtRepository } from '../../../repositories/debt-repository';
import type { GoalRepository } from '../../../repositories/goal-repository';
import type { RecurringRuleRepository } from '../../../repositories/recurring-rule-repository';
import type { SettingsRepository } from '../../../repositories/settings-repository';
import type { TransactionRepository } from '../../../repositories/transaction-repository';
import { AnalyticsService } from './analytics-service';

function memoryRepos() {
  const transactions: TransactionRecord[] = [];
  const categories: CategoryRecord[] = [];

  const txRepo = {
    async listByDateRange(from: string, to: string) {
      return transactions.filter(
        (tx) => !tx.deletedAt && tx.transactionDate >= from && tx.transactionDate <= to,
      );
    },
    async list() {
      return transactions;
    },
  };

  const catRepo = {
    async list() {
      return categories;
    },
  };

  const emptyRepo = {
    async list() {
      return [];
    },
    async listAllRepayments() {
      return [];
    },
    async listAllContributions() {
      return [];
    },
  };

  return {
    transactions,
    categories,
    service: new AnalyticsService(
      emptyRepo as unknown as AccountRepository,
      catRepo as unknown as CategoryRepository,
      txRepo as unknown as TransactionRepository,
      emptyRepo as unknown as BudgetRepository,
      emptyRepo as unknown as RecurringRuleRepository,
      emptyRepo as unknown as DebtRepository,
      emptyRepo as unknown as GoalRepository,
      emptyRepo as unknown as SettingsRepository,
    ),
  };
}

describe('AnalyticsService', () => {
  it('calculates cash flow and savings rate accurately', async () => {
    const { transactions, service } = memoryRepos();

    transactions.push({
      id: 'tx-inc-1',
      type: TransactionType.INCOME,
      accountId: 'acc-1',
      categoryId: null,
      merchantName: null,
      amount: '50000.00',
      currency: 'BDT',
      transactionDate: '2026-08-05',
      note: null,
      source: 'MANUAL',
      status: TransactionStatus.COMPLETED,
      transferGroupId: null,
      transferLeg: null,
      originalTransactionId: null,
      adjustmentDirection: null,
      createdAt: '2026-08-05T00:00:00.000Z',
      updatedAt: '2026-08-05T00:00:00.000Z',
      deletedAt: null,
    });

    transactions.push({
      id: 'tx-exp-1',
      type: TransactionType.EXPENSE,
      accountId: 'acc-1',
      categoryId: 'cat-food',
      merchantName: null,
      amount: '20000.00',
      currency: 'BDT',
      transactionDate: '2026-08-10',
      note: null,
      source: 'MANUAL',
      status: TransactionStatus.COMPLETED,
      transferGroupId: null,
      transferLeg: null,
      originalTransactionId: null,
      adjustmentDirection: null,
      createdAt: '2026-08-10T00:00:00.000Z',
      updatedAt: '2026-08-10T00:00:00.000Z',
      deletedAt: null,
    });

    const flow = await service.getCashFlow('2026-08-01', '2026-08-31');
    expect(flow.totalIncome).toBe('50000.00');
    expect(flow.totalExpenses).toBe('20000.00');
    expect(flow.netSavings).toBe('30000.00');
    expect(flow.savingsRatePercent).toBe(60);
  });
});
