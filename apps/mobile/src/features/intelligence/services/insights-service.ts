import { InsightType, type InsightType as InsightTypeEnum } from '@personal-finance/types';
import type { DebtService } from '../../debts/services/debt-service';
import type { GoalService } from '../../goals/services/goal-service';
import type { RecurringRuleService } from '../../recurring/services/recurring-rule-service';
import type { ForecastingService } from './forecasting-service';
import type { HealthService } from './health-service';

export type FinancialInsight = {
  id: string;
  type: InsightTypeEnum;
  title: string;
  description: string;
  actionLabel?: string;
  actionRoute?: string;
};

export class InsightsService {
  constructor(
    private readonly forecasting: ForecastingService,
    private readonly health: HealthService,
    private readonly recurringRules: RecurringRuleService,
    private readonly debts: DebtService,
    private readonly goals: GoalService,
  ) {}

  async generateInsights(today = new Date()): Promise<FinancialInsight[]> {
    const insights: FinancialInsight[] = [];

    const [
      healthData,
      forecastData,
      budgetRisks,
      recurringSummaries,
      debtSummaries,
      goalSummaries,
    ] = await Promise.all([
      this.health.calculateHealth(today),
      this.forecasting.getMonthForecast(today),
      this.forecasting.getBudgetRisks(today),
      this.recurringRules.summaries(today),
      this.debts.summaries(today),
      this.goals.summaries(today),
    ]);

    // 1. Budget Depletion Risks
    for (const risk of budgetRisks) {
      if (risk.willExceed) {
        insights.push({
          id: `budget-risk-${risk.budgetId}`,
          type: InsightType.WARNING,
          title: `Budget Risk: ${risk.budgetName}`,
          description: risk.projectedExhaustionDate
            ? `At your current pace, you are projected to exceed this budget around ${risk.projectedExhaustionDate}.`
            : `Projected spending (${risk.projectedSpend}) exceeds your limit of ${risk.budgetAmount}.`,
          actionLabel: 'View Budgets',
          actionRoute: '/budgets',
        });
      }
    }

    // 2. Upcoming Recurring Bills
    const dueRecurring = recurringSummaries.filter(
      (r) =>
        r.dueState === 'DUE' ||
        r.dueState === 'OVERDUE' ||
        (r.daysUntilDue <= 3 && r.daysUntilDue >= 0),
    );
    for (const rule of dueRecurring) {
      insights.push({
        id: `recurring-due-${rule.rule.id}`,
        type: rule.dueState === 'OVERDUE' ? InsightType.WARNING : InsightType.TIP,
        title: `Upcoming: ${rule.rule.name}`,
        description:
          rule.dueState === 'OVERDUE'
            ? `${rule.rule.name} is ${Math.abs(rule.daysUntilDue)}d overdue.`
            : `${rule.rule.name} is due ${rule.daysUntilDue === 0 ? 'today' : `in ${rule.daysUntilDue} days`} (${rule.rule.nextOccurrence}).`,
        actionLabel: 'Manage Recurring',
        actionRoute: '/recurring',
      });
    }

    // 3. Overdue Debts
    const overdueDebts = debtSummaries.filter((d) => d.isOverdue);
    for (const d of overdueDebts) {
      insights.push({
        id: `debt-overdue-${d.debt.id}`,
        type: InsightType.WARNING,
        title: `Overdue: ${d.debt.personName}`,
        description: `${d.debt.type === 'LENT' ? 'Repayment from' : 'Payment to'} ${d.debt.personName} of ${d.remainingAmount} was due on ${d.debt.dueDate}.`,
        actionLabel: 'View Debts',
        actionRoute: '/debts',
      });
    }

    // 4. Goal Achievements & Progress
    const completedGoals = goalSummaries.filter((g) => g.isCompleted);
    for (const g of completedGoals) {
      insights.push({
        id: `goal-complete-${g.goal.id}`,
        type: InsightType.ACHIEVEMENT,
        title: `Goal Achieved: ${g.goal.name}! 🎉`,
        description: `You have successfully reached your savings target of ${g.goal.targetAmount}.`,
        actionLabel: 'View Goals',
        actionRoute: '/goals',
      });
    }

    // 5. General Financial Health Tip
    if (healthData.score >= 80) {
      insights.push({
        id: 'health-excellent',
        type: InsightType.ACHIEVEMENT,
        title: 'Financial Health is Excellent (Score: ' + healthData.score + '/100)',
        description: 'You have strong savings habits and great budget adherence this month.',
      });
    } else if (forecastData.daysRemaining > 0) {
      insights.push({
        id: 'spend-velocity-tip',
        type: InsightType.TIP,
        title: 'Daily Spending Velocity',
        description: `Your average burn rate is ${forecastData.dailyBurnRate}/day, projecting ${forecastData.projectedMonthEndSpend} by month-end.`,
      });
    }

    return insights;
  }
}
