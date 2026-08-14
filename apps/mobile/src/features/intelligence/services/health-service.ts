import {
  HealthRating,
  type HealthRating as HealthRatingType,
} from '@personal-finance/types';
import type { AnalyticsService } from '../../analytics/services/analytics-service';
import type { BudgetService } from '../../budgets/services/budget-service';
import type { DebtService } from '../../debts/services/debt-service';
import type { GoalService } from '../../goals/services/goal-service';
import { monthRange } from '../../../lib/clock';

export type FinancialHealthResult = {
  score: number;
  rating: HealthRatingType;
  positiveDrivers: string[];
  attentionDrivers: string[];
};

export class HealthService {
  constructor(
    private readonly analytics: AnalyticsService,
    private readonly budgets: BudgetService,
    private readonly debts: DebtService,
    private readonly goals: GoalService,
  ) {}

  async calculateHealth(today = new Date()): Promise<FinancialHealthResult> {
    const range = monthRange();
    const [cashFlow, budgetSummaries, debtSummaries, goalSummaries] = await Promise.all([
      this.analytics.getCashFlow(range.from, range.to),
      this.budgets.summaries(),
      this.debts.summaries(today),
      this.goals.summaries(today),
    ]);

    let score = 0;
    const positiveDrivers: string[] = [];
    const attentionDrivers: string[] = [];

    // 1. Savings Rate (Max 30 pts)
    const rate = cashFlow.savingsRatePercent;
    if (rate >= 25) {
      score += 30;
      positiveDrivers.push(`Outstanding savings rate of ${rate}% this month`);
    } else if (rate >= 15) {
      score += 24;
      positiveDrivers.push(`Healthy savings rate of ${rate}%`);
    } else if (rate > 0) {
      score += 15;
      attentionDrivers.push(`Savings rate is ${rate}%; aiming for 20%+ improves resilience`);
    } else {
      score += 5;
      attentionDrivers.push('Expenses exceed income this month; cash flow is negative');
    }

    // 2. Budget Adherence (Max 25 pts)
    if (budgetSummaries.length === 0) {
      score += 20; // neutral
    } else {
      const exceeded = budgetSummaries.filter((b) => b.risk === 'EXCEEDED').length;
      const attention = budgetSummaries.filter((b) => b.risk === 'ATTENTION').length;

      if (exceeded === 0 && attention === 0) {
        score += 25;
        positiveDrivers.push('All active budgets are strictly on track');
      } else if (exceeded === 0) {
        score += 18;
        attentionDrivers.push(`${attention} budget(s) nearing alert threshold`);
      } else {
        score += 8;
        attentionDrivers.push(`${exceeded} budget(s) have been exceeded`);
      }
    }

    // 3. Debt & Obligation Health (Max 25 pts)
    const overdueDebts = debtSummaries.filter((d) => d.isOverdue);
    if (overdueDebts.length === 0) {
      score += 25;
      positiveDrivers.push('No overdue loans or debt repayments');
    } else {
      score += 10;
      attentionDrivers.push(`${overdueDebts.length} debt obligation(s) are past due date`);
    }

    // 4. Goal Momentum (Max 20 pts)
    if (goalSummaries.length === 0) {
      score += 15; // neutral
    } else {
      const fundedGoals = goalSummaries.filter((g) => g.contributions.length > 0);
      if (fundedGoals.length === goalSummaries.length) {
        score += 20;
        positiveDrivers.push('Active contribution momentum across all financial goals');
      } else {
        score += 14;
        attentionDrivers.push('Some savings goals have not received contributions yet');
      }
    }

    score = Math.max(0, Math.min(100, score));

    let rating: HealthRatingType = HealthRating.FAIR;
    if (score >= 80) {
      rating = HealthRating.EXCELLENT;
    } else if (score >= 65) {
      rating = HealthRating.GOOD;
    } else if (score >= 50) {
      rating = HealthRating.FAIR;
    } else {
      rating = HealthRating.ATTENTION_NEEDED;
    }

    return {
      score,
      rating,
      positiveDrivers,
      attentionDrivers,
    };
  }
}
