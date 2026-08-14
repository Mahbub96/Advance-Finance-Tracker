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

    // 1. Spending on food / dining query
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
          text: `You have spent ${formatMoneyDisplay(
            foodBudget.spent,
            currency,
          )} on Food & Dining out of your ${formatMoneyDisplay(
            foodBudget.budget.amount,
            currency,
          )} budget (${foodBudget.utilizationPercent}% utilized). Remaining: ${formatMoneyDisplay(
            foodBudget.remaining,
            currency,
          )}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionRoute: '/budgets',
          actionLabel: 'View Food Budget',
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

    // 2. Budget status query
    if (q.includes('budget') || q.includes('on track') || q.includes('limit')) {
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
          actionRoute: '/budgets',
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
          actionRoute: '/budgets',
          actionLabel: 'View Budgets',
        };
      }

      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `🎉 Great news! All ${context.budgets.length} of your monthly budgets are currently well within their spending limits and on track.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionRoute: '/budgets',
        actionLabel: 'View Budgets',
      };
    }

    // 3. Savings trend / Net worth / Balance query
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

    // 4. Recommendations / How to save more
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
        actionRoute: '/goals',
        actionLabel: 'Check Savings Goals',
      };
    }

    // 5. Health Score Query
    if (q.includes('health') || q.includes('score') || q.includes('standing')) {
      const score = context.healthScore?.score ?? 75;
      const rating = context.healthScore?.rating ?? 'GOOD';
      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Your Financial Health Score is ${score}/100 (${rating}). Pillar summary: Savings, Budget Adherence, Debt-to-Income, and Runway are monitored locally on your device.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    // Default Fallback
    return {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: `I analyzed your finances: Total balance is ${totalBalanceFormatted} across ${context.accounts.length} accounts. You have ${context.budgets.length} active budgets. Feel free to ask about your budgets, food spending, savings pace, or monthly burn forecast!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
}
