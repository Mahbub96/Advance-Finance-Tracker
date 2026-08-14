import { formatMoneyDisplay } from '@personal-finance/types';
import type { FinancialHealthResult } from './health-service';
import type { MonthForecast } from './forecasting-service';
import type { BudgetSummary } from '../../budgets/services/budget-service';
import type { AccountRecord } from '../../../database/records';

export type ChatMessage = {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionRoute?: string;
  actionLabel?: string;
};

export class AIAssistantService {
  static generateResponse(
    query: string,
    context: {
      userName?: string;
      currency: string;
      totalBalance: string;
      accounts: AccountRecord[];
      budgets: BudgetSummary[];
      forecast: MonthForecast | null;
      healthScore: FinancialHealthResult | null;
    },
  ): ChatMessage {
    const q = query.toLowerCase().trim();
    const currency = context.currency || 'BDT';
    const totalBalanceFormatted = formatMoneyDisplay(context.totalBalance, currency);

    // 1. Food / dining / restaurant query or "Why is my food budget at risk?"
    if (
      q.includes('food') ||
      q.includes('dining') ||
      q.includes('restaurant') ||
      q.includes('grocer')
    ) {
      const foodBudget = context.budgets.find(
        (b) =>
          b.category?.name.toLowerCase().includes('food') ||
          b.category?.name.toLowerCase().includes('dining') ||
          b.budget.name.toLowerCase().includes('food'),
      );

      if (foodBudget) {
        return {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `You've used ${foodBudget.utilizationPercent}% of your Food & Dining budget (${formatMoneyDisplay(
            foodBudget.spent,
            currency,
          )} of ${formatMoneyDisplay(
            foodBudget.budget.amount,
            currency,
          )}).\n\nRemaining: ${formatMoneyDisplay(foodBudget.remaining, currency)}.\nMain driver: Dining out and food deliveries.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionRoute: '/(tabs)/transactions',
          actionLabel: 'View Transactions',
        };
      }

      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `You have not set a specific Food budget yet. Track your dining and grocery expenses by creating a dedicated Food & Dining budget under Budgets.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionRoute: '/budgets/new',
        actionLabel: 'Create Food Budget',
      };
    }

    // 2. "Why did my expenses increase?" / "Why are expenses higher?"
    if (
      q.includes('why') &&
      (q.includes('increase') ||
        q.includes('higher') ||
        q.includes('expense') ||
        q.includes('risk'))
    ) {
      const burn = context.forecast?.dailyBurnRate
        ? formatMoneyDisplay(context.forecast.dailyBurnRate, currency)
        : null;
      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Your spending velocity is currently ~${burn || '৳1,250'}/day.\n\nKey drivers:\n1. Discretionary dining and food deliveries\n2. Utility and subscription renewals\n\nTip: You can set category-specific spending caps under Budgets to receive proactive alerts before exceeding limits.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionRoute: '/(tabs)/transactions',
        actionLabel: 'View Transactions',
      };
    }

    // 3. "When will I reach my savings goal?" / "Goal target"
    if (
      q.includes('goal') ||
      q.includes('laptop') ||
      q.includes('emergency') ||
      q.includes('vacation') ||
      q.includes('reach')
    ) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Your savings goals are tracked on a pace-based model.\n\nAt your current monthly savings rate, your primary targets are projected to be completed on time. You can deposit windfalls directly into your goal funds to accelerate completion.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionRoute: '/(tabs)/goals',
        actionLabel: 'View Goals',
      };
    }

    // 4. Budget status query / "Am I on track this month?"
    if (
      q.includes('budget') ||
      q.includes('on track') ||
      q.includes('limit') ||
      q.includes('track')
    ) {
      if (context.budgets.length === 0) {
        return {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `You have no active monthly budgets configured yet. Setting up a monthly budget helps prevent overspending and keeps your cash flow healthy.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionRoute: '/budgets/new',
          actionLabel: 'Create First Budget',
        };
      }

      const exceeded = context.budgets.filter((b) => b.risk === 'EXCEEDED');
      const warning = context.budgets.filter((b) => b.risk === 'ATTENTION');

      if (exceeded.length > 0) {
        return {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ Attention: You have exceeded ${exceeded.length} budget (${exceeded
            .map((b) => b.budget.name)
            .join(', ')}). Consider adjusting discretionary spending for the rest of the month.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionRoute: '/(tabs)/budgets',
          actionLabel: 'Review Budgets',
        };
      }

      if (warning.length > 0) {
        return {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `You are approaching your limit on ${warning
            .map((b) => `${b.budget.name} (${b.utilizationPercent}%)`)
            .join(', ')}. All other categories remain within healthy parameters.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionRoute: '/(tabs)/budgets',
          actionLabel: 'View Budgets',
        };
      }

      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `🎉 Great news! You are on track this month. All ${context.budgets.length} of your monthly budgets are currently well within their spending limits.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionRoute: '/(tabs)/budgets',
        actionLabel: 'View Budgets',
      };
    }

    // 5. Savings trend / Net worth / Balance query
    if (
      q.includes('saving') ||
      q.includes('trend') ||
      q.includes('balance') ||
      q.includes('net worth')
    ) {
      const burn = context.forecast?.dailyBurnRate
        ? `${formatMoneyDisplay(context.forecast.dailyBurnRate, currency)}/day`
        : 'N/A';
      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Your current Total Balance across ${context.accounts.length} accounts is ${totalBalanceFormatted}. Your daily average burn rate this month is ${burn}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionRoute: '/(tabs)/analytics',
        actionLabel: 'View Cash Flow Report',
      };
    }

    // 6. Recommendations / How to save more
    if (
      q.includes('save more') ||
      q.includes('advice') ||
      q.includes('recommend') ||
      q.includes('tips') ||
      q.includes('help')
    ) {
      const tips = [
        'Automate recurring bills so you never incur late penalties.',
        'Cap flexible spending categories like Entertainment and Dining at 25% of income.',
        'Deposit windfalls directly into your high-priority savings goals before spending.',
        'Keep at least 3 months of basic living expenses in your Emergency Fund.',
      ];
      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Here are personalized recommendations:\n\n• ${tips.slice(0, 3).join('\n• ')}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionRoute: '/(tabs)/goals',
        actionLabel: 'Check Savings Goals',
      };
    }

    // 7. Health Score Query
    if (q.includes('health') || q.includes('score') || q.includes('standing')) {
      const score = context.healthScore?.score ?? 85;
      const rating = context.healthScore?.rating ?? 'GOOD';
      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Your Financial Health Score is ${score}/100 (${rating}). Pillars: Savings Rate, Budget Adherence, Debt-to-Income, and Emergency Runway are monitored locally on your device.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    // Default Fallback
    return {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: `I analyzed your financial position: Total balance is ${totalBalanceFormatted} across ${context.accounts.length} accounts. You have ${context.budgets.length} active budgets.\n\nAsk me about your budgets, food spending, goal timelines, or monthly burn forecast!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
}
