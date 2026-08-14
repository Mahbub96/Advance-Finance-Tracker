import { HealthRating, InsightType } from '@personal-finance/types';
import type { DebtService } from '../../debts/services/debt-service';
import type { GoalService } from '../../goals/services/goal-service';
import type { RecurringRuleService } from '../../recurring/services/recurring-rule-service';
import type { ForecastingService } from './forecasting-service';
import type { HealthService } from './health-service';
import { InsightsService } from './insights-service';

describe('InsightsService', () => {
  it('generates warnings for overdue debts, upcoming recurring bills, and budget depletion', async () => {
    const mockForecasting = {
      getMonthForecast: jest.fn().mockResolvedValue({
        currentSpend: '1000.00',
        dailyBurnRate: '100.00',
        projectedMonthEndSpend: '3100.00',
        daysRemaining: 21,
        totalDays: 31,
        currentDay: 10,
      }),
      getBudgetRisks: jest.fn().mockResolvedValue([
        {
          budgetId: 'b-1',
          budgetName: 'Groceries',
          budgetAmount: '2000.00',
          projectedSpend: '2800.00',
          projectedExhaustionDate: '2026-08-20',
          willExceed: true,
        },
      ]),
    };

    const mockHealth = {
      calculateHealth: jest.fn().mockResolvedValue({
        score: 75,
        rating: HealthRating.GOOD,
        positiveDrivers: [],
        attentionDrivers: [],
      }),
    };

    const mockRecurring = {
      summaries: jest.fn().mockResolvedValue([
        {
          rule: { id: 'r-1', name: 'Electricity Bill', nextOccurrence: '2026-08-12' },
          dueState: 'UPCOMING',
          daysUntilDue: 2,
        },
      ]),
    };

    const mockDebts = {
      summaries: jest.fn().mockResolvedValue([
        {
          debt: { id: 'd-1', personName: 'Alice', type: 'LENT', dueDate: '2026-08-01' },
          remainingAmount: '500.00',
          isOverdue: true,
        },
      ]),
    };

    const mockGoals = {
      summaries: jest.fn().mockResolvedValue([]),
    };

    const service = new InsightsService(
      mockForecasting as unknown as ForecastingService,
      mockHealth as unknown as HealthService,
      mockRecurring as unknown as RecurringRuleService,
      mockDebts as unknown as DebtService,
      mockGoals as unknown as GoalService,
    );

    const insights = await service.generateInsights();

    expect(insights.length).toBeGreaterThanOrEqual(3);
    const budgetWarning = insights.find((i) => i.id === 'budget-risk-b-1');
    expect(budgetWarning?.type).toBe(InsightType.WARNING);

    const recurringTip = insights.find((i) => i.id === 'recurring-due-r-1');
    expect(recurringTip).toBeDefined();

    const debtWarning = insights.find((i) => i.id === 'debt-overdue-d-1');
    expect(debtWarning?.type).toBe(InsightType.WARNING);
  });
});
