import { AccountType, GoalStatus } from '@personal-finance/types';
import type { AccountRecord, GoalContributionRecord, GoalRecord } from '../../../database/records';
import type { AccountRepository } from '../../../repositories/account-repository';
import type { GoalRepository } from '../../../repositories/goal-repository';
import type { TransactionService } from '../../transactions/services/transaction-service';
import { GoalService } from './goal-service';

function memoryRepos() {
  const accounts: AccountRecord[] = [];
  const goals: GoalRecord[] = [];
  const contributions: GoalContributionRecord[] = [];

  const goalRepo = {
    async list(includeInactive = false) {
      return goals.filter(
        (g) => !g.deletedAt && (includeInactive || g.status === GoalStatus.IN_PROGRESS),
      );
    },
    async getById(id: string) {
      return goals.find((g) => g.id === id && !g.deletedAt) ?? null;
    },
    async insert(record: GoalRecord) {
      goals.push(record);
    },
    async update(record: GoalRecord) {
      const idx = goals.findIndex((g) => g.id === record.id);
      if (idx >= 0) goals[idx] = record;
    },
    async listContributions(goalId: string) {
      return contributions.filter((c) => c.goalId === goalId && !c.deletedAt);
    },
    async insertContribution(record: GoalContributionRecord) {
      contributions.push(record);
    },
  };

  const accountRepo = {
    async getById(id: string) {
      return accounts.find((a) => a.id === id && !a.deletedAt) ?? null;
    },
  };

  const mockTxService = {
    createEntry: jest.fn().mockResolvedValue({ id: 'tx-1' }),
    createTransfer: jest.fn(),
  };

  return {
    accounts,
    goals,
    contributions,
    mockTxService,
    service: new GoalService(
      goalRepo as unknown as GoalRepository,
      accountRepo as unknown as AccountRepository,
      mockTxService as unknown as TransactionService,
    ),
  };
}

describe('GoalService', () => {
  it('tracks progress and computes required monthly savings', async () => {
    const { accounts, goals, service } = memoryRepos();
    accounts.push({
      id: 'acc-savings',
      name: 'Savings',
      type: AccountType.SAVINGS,
      currency: 'BDT',
      openingBalance: '50000.00',
      openingBalanceDate: '2026-01-01',
      isArchived: false,
      displayOrder: 0,
      institutionName: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      deletedAt: null,
    });

    const goal = await service.create({
      name: 'MacBook Pro',
      targetAmount: '120000',
      currency: 'BDT',
      targetDate: '2026-12-31',
    });

    expect(goal.targetAmount).toBe('120000.00');

    // Deposit 30,000
    await service.recordContribution(goal.id, {
      amount: '30000',
      accountId: 'acc-savings',
    });

    const [summary] = await service.summaries(new Date('2026-08-01'));
    expect(summary?.savedAmount).toBe('30000.00');
    expect(summary?.remainingAmount).toBe('90000.00');
    expect(summary?.progressPercent).toBe(25);
    expect(summary?.isCompleted).toBe(false);
    expect(summary?.monthsRemaining).toBeGreaterThan(0);
    expect(summary?.requiredMonthlySavings).toBeDefined();

    // Deposit 90,000 to complete
    await service.recordContribution(goal.id, {
      amount: '90000',
      accountId: 'acc-savings',
    });

    const storedGoal = goals.find((g) => g.id === goal.id);
    expect(storedGoal?.status).toBe(GoalStatus.COMPLETED);
  });
});
