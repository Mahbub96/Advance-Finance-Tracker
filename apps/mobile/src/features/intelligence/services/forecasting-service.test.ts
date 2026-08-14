import { TransactionStatus, TransactionType } from '@personal-finance/types';
import type { BudgetRecord, TransactionRecord } from '../../../database/records';
import type { BudgetRepository } from '../../../repositories/budget-repository';
import type { TransactionRepository } from '../../../repositories/transaction-repository';
import { ForecastingService } from './forecasting-service';

describe('ForecastingService', () => {
  it('calculates daily burn rate and projects month-end spending', async () => {
    const transactions: TransactionRecord[] = [];
    const budgets: BudgetRecord[] = [];

    const txRepo = {
      async listByDateRange() {
        return transactions;
      },
    };

    const budgetRepo = {
      async list() {
        return budgets;
      },
    };

    const service = new ForecastingService(
      txRepo as unknown as TransactionRepository,
      budgetRepo as unknown as BudgetRepository,
    );

    // Spend 1500 in the first 10 days of August
    transactions.push({
      id: 'tx-1',
      type: TransactionType.EXPENSE,
      accountId: 'acc-1',
      categoryId: null,
      merchantName: null,
      amount: '1500.00',
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

    const testDate = new Date(Date.UTC(2026, 7, 10)); // Aug 10, 2026
    const forecast = await service.getMonthForecast(testDate);

    expect(forecast.currentSpend).toBe('1500.00');
    expect(forecast.dailyBurnRate).toBe('150.00'); // 1500 / 10 days
    expect(forecast.daysRemaining).toBe(21); // 31 - 10
    expect(forecast.projectedMonthEndSpend).toBe('4650.00'); // 1500 + (150 * 21) = 4650
  });

  it('predicts budget depletion exhaustion date when burn rate is excessive', async () => {
    const transactions: TransactionRecord[] = [];
    const budgets: BudgetRecord[] = [
      {
        id: 'b-dining',
        name: 'Dining Out',
        amount: '3000.00',
        currency: 'BDT',
        periodType: 'MONTHLY',
        startDate: '2026-08-01',
        endDate: '2026-08-31',
        categoryId: 'cat-food',
        alertThresholdPercent: 80,
        status: 'ACTIVE',
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
        deletedAt: null,
      },
    ];

    // Spent 2000 in 10 days on 3000 budget (200/day). Remaining 1000 will be exhausted in 5 days -> Aug 15.
    transactions.push({
      id: 'tx-2',
      type: TransactionType.EXPENSE,
      accountId: 'acc-1',
      categoryId: 'cat-food',
      merchantName: null,
      amount: '2000.00',
      currency: 'BDT',
      transactionDate: '2026-08-08',
      note: null,
      source: 'MANUAL',
      status: TransactionStatus.COMPLETED,
      transferGroupId: null,
      transferLeg: null,
      originalTransactionId: null,
      adjustmentDirection: null,
      createdAt: '2026-08-08T00:00:00.000Z',
      updatedAt: '2026-08-08T00:00:00.000Z',
      deletedAt: null,
    });

    const txRepo = {
      async listByDateRange() {
        return transactions;
      },
    };

    const budgetRepo = {
      async list() {
        return budgets;
      },
    };

    const service = new ForecastingService(
      txRepo as unknown as TransactionRepository,
      budgetRepo as unknown as BudgetRepository,
    );

    const testDate = new Date(Date.UTC(2026, 7, 10)); // Aug 10
    const risks = await service.getBudgetRisks(testDate);

    expect(risks.length).toBe(1);
    expect(risks[0]?.willExceed).toBe(true);
    expect(risks[0]?.projectedExhaustionDate).toBe('2026-08-15');
  });
});
