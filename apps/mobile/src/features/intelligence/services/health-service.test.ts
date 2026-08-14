import { HealthRating } from '@personal-finance/types';
import type { AnalyticsService } from '../../analytics/services/analytics-service';
import type { BudgetService } from '../../budgets/services/budget-service';
import type { DebtService } from '../../debts/services/debt-service';
import type { GoalService } from '../../goals/services/goal-service';
import { HealthService } from './health-service';

describe('HealthService', () => {
  it('computes an excellent score when savings rate is high, budgets are clean, and debts are current', async () => {
    const mockAnalytics = {
      getCashFlow: jest.fn().mockResolvedValue({
        totalIncome: '100000.00',
        totalExpenses: '60000.00',
        netSavings: '40000.00',
        savingsRatePercent: 40,
      }),
    };

    const mockBudgets = {
      summaries: jest.fn().mockResolvedValue([
        { risk: 'ON_TRACK', spentAmount: '5000.00' },
      ]),
    };

    const mockDebts = {
      summaries: jest.fn().mockResolvedValue([]),
    };

    const mockGoals = {
      summaries: jest.fn().mockResolvedValue([
        { isCompleted: false, contributions: [{ id: 'c-1' }] },
      ]),
    };

    const service = new HealthService(
      mockAnalytics as unknown as AnalyticsService,
      mockBudgets as unknown as BudgetService,
      mockDebts as unknown as DebtService,
      mockGoals as unknown as GoalService,
    );

    const result = await service.calculateHealth();

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.rating).toBe(HealthRating.EXCELLENT);
    expect(result.positiveDrivers.length).toBeGreaterThan(0);
    expect(result.attentionDrivers.length).toBe(0);
  });
});
