import {
  assertPositiveAmount,
  BudgetPeriodType,
  BudgetStatus,
  compareMoney,
  moneyString,
  parseMoney,
  subtractMoney,
  TransactionType,
  type MoneyString,
} from '@personal-finance/types';
import type { BudgetRecord, CategoryRecord } from '../../../database/records';
import { monthRange, nowIso } from '../../../lib/clock';
import { createId } from '../../../lib/id';
import type { BudgetRepository } from '../../../repositories/budget-repository';
import type { CategoryRepository } from '../../../repositories/category-repository';
import type { TransactionRepository } from '../../../repositories/transaction-repository';

export type CreateBudgetInput = {
  name: string;
  amount: string;
  currency: string;
  periodType?: BudgetRecord['periodType'];
  startDate?: string;
  endDate?: string;
  categoryId?: string | null;
  alertThresholdPercent?: number;
};

export type BudgetSummary = {
  budget: BudgetRecord;
  category: CategoryRecord | null;
  spent: MoneyString;
  remaining: MoneyString;
  utilizationPercent: number;
  risk: 'ON_TRACK' | 'ATTENTION' | 'EXCEEDED';
};

export class BudgetService {
  constructor(
    private readonly budgets: BudgetRepository,
    private readonly categories: CategoryRepository,
    private readonly transactions: TransactionRepository,
  ) {}

  async list(includeArchived = false): Promise<BudgetRecord[]> {
    return this.budgets.list(includeArchived);
  }

  async summaries(): Promise<BudgetSummary[]> {
    const budgets = await this.budgets.list();
    const categories = await this.categories.list(true);
    return Promise.all(
      budgets.map(async (budget) => {
        const rows = await this.transactions.listByDateRange(budget.startDate, budget.endDate);
        const spent = rows
          .filter((tx) => tx.type === TransactionType.EXPENSE)
          .filter((tx) => !budget.categoryId || tx.categoryId === budget.categoryId)
          .reduce((total, tx) => moneyString(parseMoney(total).plus(parseMoney(tx.amount))), '0.00');
        const remaining = subtractMoney(budget.amount, spent);
        const utilizationPercent = parseMoney(budget.amount).isZero()
          ? 0
          : Math.min(999, parseMoney(spent).div(parseMoney(budget.amount)).times(100).round().toNumber());
        const risk =
          compareMoney(spent, budget.amount) > 0
            ? 'EXCEEDED'
            : utilizationPercent >= budget.alertThresholdPercent
              ? 'ATTENTION'
              : 'ON_TRACK';

        return {
          budget,
          category: categories.find((category) => category.id === budget.categoryId) ?? null,
          spent,
          remaining,
          utilizationPercent,
          risk,
        };
      }),
    );
  }

  async create(input: CreateBudgetInput): Promise<BudgetRecord> {
    const name = input.name.trim();
    if (!name) {
      throw new Error('Budget name is required');
    }
    if (input.categoryId) {
      const category = await this.categories.getById(input.categoryId);
      if (!category || category.type !== 'EXPENSE' || category.isArchived) {
        throw new Error('Budget category must be an active expense category');
      }
    }

    const now = nowIso();
    const range =
      input.periodType === BudgetPeriodType.CUSTOM
        ? { from: input.startDate ?? '', to: input.endDate ?? '' }
        : monthRange();

    if (!range.from || !range.to || range.from > range.to) {
      throw new Error('Budget period is invalid');
    }

    const record: BudgetRecord = {
      id: createId(),
      name,
      amount: assertPositiveAmount(input.amount),
      currency: input.currency,
      periodType: input.periodType ?? BudgetPeriodType.MONTHLY,
      startDate: range.from,
      endDate: range.to,
      categoryId: input.categoryId ?? null,
      status: BudgetStatus.ACTIVE,
      alertThresholdPercent: input.alertThresholdPercent ?? 80,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    await this.budgets.insert(record);
    return record;
  }

  async archive(id: string): Promise<BudgetRecord> {
    const current = await this.budgets.getById(id);
    if (!current) {
      throw new Error('Budget not found');
    }
    const next = { ...current, status: BudgetStatus.ARCHIVED, updatedAt: nowIso() };
    await this.budgets.update(next);
    return next;
  }
}
