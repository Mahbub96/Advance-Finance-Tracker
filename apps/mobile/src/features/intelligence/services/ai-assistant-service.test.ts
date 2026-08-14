import { AIAssistantService } from './ai-assistant-service';
import { HealthRating } from '@personal-finance/types';

describe('AIAssistantService', () => {
  const baseContext = {
    userName: 'Ahmed',
    currency: 'BDT',
    totalBalance: '1245530.00',
    accounts: [],
    budgets: [],
    forecast: {
      currentSpend: '52400.00',
      dailyBurnRate: '1746.67',
      projectedMonthEndSpend: '54146.67',
      daysRemaining: 1,
      totalDays: 31,
      currentDay: 30,
    },
    healthScore: {
      score: 85,
      rating: HealthRating.EXCELLENT,
      positiveDrivers: ['Outstanding savings rate'],
      attentionDrivers: [],
    },
  };

  it('answers food spending questions with budget context', () => {
    const res = AIAssistantService.generateResponse('How much did I spend on food this month?', {
      ...baseContext,
      budgets: [
        {
          budget: {
            id: 'b-1',
            name: 'Food & Dining',
            amount: '15000.00',
            currency: 'BDT',
            periodType: 'MONTHLY' as const,
            startDate: '2026-08-01',
            endDate: '2026-08-31',
            categoryId: 'cat-1',
            status: 'ACTIVE' as const,
            alertThresholdPercent: 80,
            createdAt: '',
            updatedAt: '',
            deletedAt: null,
          },
          category: {
            id: 'cat-1',
            name: 'Food & Dining',
            type: 'EXPENSE' as const,
            icon: '🍔',
            colorToken: 'orange',
            displayOrder: 1,
            parentId: null,
            isSystem: true,
            isArchived: false,
            createdAt: '',
            updatedAt: '',
            deletedAt: null,
          },
          spent: '12400.00',
          remaining: '2600.00',
          utilizationPercent: 83,
          risk: 'ATTENTION' as const,
        },
      ],
    });

    expect(res.sender).toBe('ai');
    expect(res.text).toContain('Food & Dining');
    expect(res.text).toContain('83%');
  });

  it('answers budget health query when all budgets on track', () => {
    const res = AIAssistantService.generateResponse('Am I on track with my budget?', {
      ...baseContext,
      budgets: [
        {
          budget: {
            id: 'b-2',
            name: 'Transport',
            amount: '8000.00',
            currency: 'BDT',
            periodType: 'MONTHLY' as const,
            startDate: '2026-08-01',
            endDate: '2026-08-31',
            categoryId: null,
            status: 'ACTIVE' as const,
            alertThresholdPercent: 80,
            createdAt: '',
            updatedAt: '',
            deletedAt: null,
          },
          category: null,
          spent: '3200.00',
          remaining: '4800.00',
          utilizationPercent: 40,
          risk: 'ON_TRACK' as const,
        },
      ],
    });

    expect(res.text).toContain('on track');
  });

  it('answers general savings and balance inquiries', () => {
    const res = AIAssistantService.generateResponse('Show my savings trend', baseContext);
    expect(res.text).toContain('Total Balance');
    expect(res.text).toContain('daily average burn rate');
  });

  it('provides actionable savings advice', () => {
    const res = AIAssistantService.generateResponse('What can I do to save more?', baseContext);
    expect(res.text).toContain('recommendations');
  });
});
