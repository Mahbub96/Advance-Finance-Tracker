import {
  assertPositiveAmount,
  GoalStatus,
  moneyString,
  parseMoney,
  subtractMoney,
  type MoneyString,
} from '@personal-finance/types';

import type { GoalContributionRecord, GoalRecord } from '../../../database/records';
import { nowIso } from '../../../lib/clock';
import { createId } from '../../../lib/id';
import type { AccountRepository } from '../../../repositories/account-repository';
import type { GoalRepository } from '../../../repositories/goal-repository';
import type { TransactionService } from '../../transactions/services/transaction-service';

export type CreateGoalInput = {
  name: string;
  targetAmount: string;
  currency: string;
  targetDate?: string | null;
  accountId?: string | null;
  note?: string | null;
};

export type RecordGoalContributionInput = {
  amount: string;
  contributionDate?: string;
  accountId?: string | null;
  note?: string | null;
};

export type GoalSummary = {
  goal: GoalRecord;
  contributions: GoalContributionRecord[];
  savedAmount: MoneyString;
  remainingAmount: MoneyString;
  progressPercent: number;
  monthsRemaining: number | null;
  requiredMonthlySavings: MoneyString | null;
  isCompleted: boolean;
};

export class GoalService {
  constructor(
    private readonly goals: GoalRepository,
    private readonly accounts: AccountRepository,
    private readonly transactions?: TransactionService,
  ) {}

  async list(includeInactive = false): Promise<GoalRecord[]> {
    return this.goals.list(includeInactive);
  }

  async getById(id: string): Promise<GoalRecord | null> {
    return this.goals.getById(id);
  }

  async getContributions(goalId: string): Promise<GoalContributionRecord[]> {
    return this.goals.listContributions(goalId);
  }

  async summaries(today = new Date()): Promise<GoalSummary[]> {
    const allGoals = await this.goals.list(false);
    const todayStr = today.toISOString().slice(0, 10);

    return Promise.all(
      allGoals.map(async (goal) => {
        const contributions = await this.goals.listContributions(goal.id);
        const savedAmount = contributions.reduce(
          (sum, c) => moneyString(parseMoney(sum).plus(parseMoney(c.amount))),
          '0.00',
        );
        const remainingAmount = parseMoney(goal.targetAmount).gt(parseMoney(savedAmount))
          ? subtractMoney(goal.targetAmount, savedAmount)
          : '0.00';
        const progressPercent = parseMoney(goal.targetAmount).isZero()
          ? 100
          : Math.min(
              100,
              parseMoney(savedAmount).div(parseMoney(goal.targetAmount)).times(100).round().toNumber(),
            );

        const isCompleted = parseMoney(savedAmount).gte(parseMoney(goal.targetAmount));
        let monthsRemaining: number | null = null;
        let requiredMonthlySavings: MoneyString | null = null;

        if (goal.targetDate && !isCompleted) {
          const diffMs = new Date(goal.targetDate).getTime() - new Date(todayStr).getTime();
          const days = Math.max(1, Math.round(diffMs / 86_400_000));
          monthsRemaining = Math.max(1, Math.ceil(days / 30));
          requiredMonthlySavings = moneyString(
            parseMoney(remainingAmount).div(monthsRemaining),
          );
        }


        return {
          goal,
          contributions,
          savedAmount,
          remainingAmount,
          progressPercent,
          monthsRemaining,
          requiredMonthlySavings,
          isCompleted,
        };
      }),
    );
  }

  async create(input: CreateGoalInput): Promise<GoalRecord> {
    const name = input.name.trim();
    if (!name) {
      throw new Error('Goal name is required');
    }
    const targetAmount = assertPositiveAmount(input.targetAmount);
    if (input.accountId) {
      const account = await this.accounts.getById(input.accountId);
      if (!account || account.isArchived) {
        throw new Error('Account not found');
      }
    }

    const now = nowIso();
    const record: GoalRecord = {
      id: createId(),
      name,
      targetAmount,
      currency: input.currency,
      targetDate: input.targetDate ?? null,
      accountId: input.accountId ?? null,
      status: GoalStatus.IN_PROGRESS,
      note: input.note?.trim() || null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    await this.goals.insert(record);
    return record;
  }

  async recordContribution(
    goalId: string,
    input: RecordGoalContributionInput,
  ): Promise<GoalContributionRecord> {
    const goal = await this.goals.getById(goalId);
    if (!goal || goal.status !== GoalStatus.IN_PROGRESS) {
      throw new Error('Active goal not found');
    }

    const amount = assertPositiveAmount(input.amount);
    const existing = await this.goals.listContributions(goalId);
    const alreadySaved = existing.reduce(
      (sum, c) => moneyString(parseMoney(sum).plus(parseMoney(c.amount))),
      '0.00',
    );
    const totalSavedAfter = moneyString(parseMoney(alreadySaved).plus(parseMoney(amount)));

    const now = nowIso();
    const contributionDate = input.contributionDate || now.slice(0, 10);

    const contribution: GoalContributionRecord = {
      id: createId(),
      goalId,
      amount,
      contributionDate,
      accountId: input.accountId ?? null,
      note: input.note?.trim() || null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    await this.goals.insertContribution(contribution);

    // Auto-complete goal if target reached
    if (parseMoney(totalSavedAfter).gte(parseMoney(goal.targetAmount))) {
      await this.goals.update({
        ...goal,
        status: GoalStatus.COMPLETED,
        updatedAt: now,
      });
    }

    // Auto-create ledger transaction if account was specified
    if (input.accountId && this.transactions) {
      await this.transactions.createEntry({
        type: 'EXPENSE',
        accountId: input.accountId,
        amount,
        transactionDate: contributionDate,
        note: `Goal Contribution: ${goal.name}${contribution.note ? ` - ${contribution.note}` : ''}`,
      });
    }

    return contribution;
  }

  async delete(id: string): Promise<void> {
    const goal = await this.goals.getById(id);
    if (!goal) {
      throw new Error('Goal not found');
    }
    const deletedAt = nowIso();
    await this.goals.update({
      ...goal,
      deletedAt,
      updatedAt: deletedAt,
    });
  }
}
