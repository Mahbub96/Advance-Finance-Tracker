import {
  assertPositiveAmount,
  RecurringFrequency,
  RecurringRuleStatus,
  TransactionType,
} from '@personal-finance/types';
import type { RecurringRuleRecord, TransactionRecord } from '../../../database/records';
import { nowIso } from '../../../lib/clock';
import { createId } from '../../../lib/id';
import type { AccountRepository } from '../../../repositories/account-repository';
import type { CategoryRepository } from '../../../repositories/category-repository';
import type { RecurringRuleRepository } from '../../../repositories/recurring-rule-repository';
import type { TransactionService } from '../../transactions/services/transaction-service';

export type CreateRecurringRuleInput = {
  type: RecurringRuleRecord['type'];
  name: string;
  amount: string;
  currency: string;
  accountId: string;
  destinationAccountId?: string | null;
  categoryId?: string | null;
  frequency: RecurringRuleRecord['frequency'];
  intervalValue?: number;
  startDate: string;
  endDate?: string | null;
  autoCreate?: boolean;
  reminderEnabled?: boolean;
  note?: string | null;
};

export type RecurringRuleSummary = {
  rule: RecurringRuleRecord;
  daysUntilDue: number;
  dueState: 'UPCOMING' | 'DUE' | 'OVERDUE';
};

export class RecurringRuleService {
  constructor(
    private readonly rules: RecurringRuleRepository,
    private readonly accounts: AccountRepository,
    private readonly categories: CategoryRepository,
    private readonly transactions?: TransactionService,
  ) {}

  async list(includeInactive = false): Promise<RecurringRuleRecord[]> {
    return this.rules.list(includeInactive);
  }

  async summaries(today = new Date()): Promise<RecurringRuleSummary[]> {
    const date = dateKey(today);
    return (await this.rules.list()).map((rule) => {
      const daysUntilDue = diffDays(date, rule.nextOccurrence);
      return {
        rule,
        daysUntilDue,
        dueState: daysUntilDue < 0 ? 'OVERDUE' : daysUntilDue === 0 ? 'DUE' : 'UPCOMING',
      };
    });
  }

  async create(input: CreateRecurringRuleInput): Promise<RecurringRuleRecord> {
    const name = input.name.trim();
    if (!name) {
      throw new Error('Recurring rule name is required');
    }
    const account = await this.accounts.getById(input.accountId);
    if (!account || account.isArchived) {
      throw new Error('Account not found');
    }
    if (input.type === TransactionType.TRANSFER) {
      if (!input.destinationAccountId || input.destinationAccountId === input.accountId) {
        throw new Error('Transfer destination account is required');
      }
      const destination = await this.accounts.getById(input.destinationAccountId);
      if (!destination || destination.isArchived || destination.currency !== account.currency) {
        throw new Error('Transfer destination account is invalid');
      }
    }
    if (input.type !== TransactionType.TRANSFER && input.categoryId) {
      const category = await this.categories.getById(input.categoryId);
      if (!category || category.isArchived || category.type !== input.type) {
        throw new Error('Recurring category must match the rule type');
      }
    }

    const intervalValue = input.intervalValue ?? 1;
    if (!Number.isInteger(intervalValue) || intervalValue < 1) {
      throw new Error('Interval must be a positive whole number');
    }
    if (input.endDate && input.endDate < input.startDate) {
      throw new Error('End date cannot be before start date');
    }

    const now = nowIso();
    const record: RecurringRuleRecord = {
      id: createId(),
      type: input.type,
      name,
      amount: assertPositiveAmount(input.amount),
      currency: input.currency || account.currency,
      accountId: account.id,
      destinationAccountId: input.type === TransactionType.TRANSFER ? input.destinationAccountId ?? null : null,
      categoryId: input.type === TransactionType.TRANSFER ? null : input.categoryId ?? null,
      frequency: input.frequency,
      intervalValue,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      nextOccurrence: input.startDate,
      autoCreate: input.autoCreate ?? false,
      reminderEnabled: input.reminderEnabled ?? true,
      status: RecurringRuleStatus.ACTIVE,
      note: input.note?.trim() || null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    await this.rules.insert(record);
    return record;
  }

  async advance(id: string): Promise<RecurringRuleRecord> {
    const current = await this.rules.getById(id);
    if (!current) {
      throw new Error('Recurring rule not found');
    }
    const nextOccurrence = nextDate(
      current.nextOccurrence,
      current.frequency,
      current.intervalValue,
    );
    const next: RecurringRuleRecord = {
      ...current,
      nextOccurrence,
      status:
        current.endDate && nextOccurrence > current.endDate
          ? RecurringRuleStatus.ARCHIVED
          : current.status,
      updatedAt: nowIso(),
    };
    await this.rules.update(next);
    return next;
  }

  async executeRule(id: string, executionDate?: string): Promise<TransactionRecord[]> {
    const current = await this.rules.getById(id);
    if (!current) {
      throw new Error('Recurring rule not found');
    }
    if (current.status !== RecurringRuleStatus.ACTIVE) {
      throw new Error('Cannot execute an inactive recurring rule');
    }
    if (!this.transactions) {
      throw new Error('Transaction service is required to execute rules');
    }

    const txDate = executionDate || current.nextOccurrence;
    const note = current.note ? `${current.name} - ${current.note}` : current.name;
    let createdTx: TransactionRecord[] = [];

    if (current.type === TransactionType.TRANSFER) {
      if (!current.destinationAccountId) {
        throw new Error('Transfer destination account is missing');
      }
      createdTx = await this.transactions.createTransfer({
        sourceAccountId: current.accountId,
        destinationAccountId: current.destinationAccountId,
        amount: current.amount,
        transactionDate: txDate,
        note,
      });
    } else {
      const tx = await this.transactions.createEntry({
        type: current.type,
        accountId: current.accountId,
        categoryId: current.categoryId,
        amount: current.amount,
        transactionDate: txDate,
        note,
      });
      createdTx = [tx];
    }

    await this.advance(id);
    return createdTx;
  }

  async processDueRules(
    today = new Date(),
    autoOnly = false,
  ): Promise<{ processed: number; transactions: TransactionRecord[] }> {
    const dateStr = dateKey(today);
    const activeRules = await this.rules.list(false);
    const dueRules = activeRules.filter((rule) => {
      if (rule.nextOccurrence > dateStr) return false;
      if (autoOnly && !rule.autoCreate) return false;
      return true;
    });

    let processedCount = 0;
    const createdTransactions: TransactionRecord[] = [];

    for (const rule of dueRules) {
      const txs = await this.executeRule(rule.id, rule.nextOccurrence);
      processedCount += 1;
      createdTransactions.push(...txs);
    }

    return { processed: processedCount, transactions: createdTransactions };
  }

  async pause(id: string): Promise<RecurringRuleRecord> {
    return this.setStatus(id, RecurringRuleStatus.PAUSED);
  }

  async resume(id: string): Promise<RecurringRuleRecord> {
    return this.setStatus(id, RecurringRuleStatus.ACTIVE);
  }

  async delete(id: string): Promise<void> {
    const current = await this.rules.getById(id);
    if (!current) {
      throw new Error('Recurring rule not found');
    }
    const deletedAt = nowIso();
    await this.rules.update({
      ...current,
      deletedAt,
      updatedAt: deletedAt,
    });
  }

  private async setStatus(
    id: string,
    status: RecurringRuleRecord['status'],
  ): Promise<RecurringRuleRecord> {
    const current = await this.rules.getById(id);
    if (!current) {
      throw new Error('Recurring rule not found');
    }
    const next = { ...current, status, updatedAt: nowIso() };
    await this.rules.update(next);
    return next;
  }
}


export function nextDate(
  from: string,
  frequency: RecurringRuleRecord['frequency'],
  intervalValue: number,
): string {
  if (frequency === RecurringFrequency.DAILY) {
    return addDays(from, intervalValue);
  }
  if (frequency === RecurringFrequency.WEEKLY) {
    return addDays(from, intervalValue * 7);
  }
  if (frequency === RecurringFrequency.YEARLY) {
    return addMonths(from, intervalValue * 12);
  }
  return addMonths(from, intervalValue);
}

function addDays(from: string, days: number): string {
  const date = parseDate(from);
  date.setUTCDate(date.getUTCDate() + days);
  return dateKey(date);
}

function addMonths(from: string, months: number): string {
  const [year, month, day] = parts(from);
  const targetMonthIndex = month - 1 + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate();
  return dateKey(new Date(Date.UTC(targetYear, normalizedMonth, Math.min(day, lastDay))));
}

function diffDays(from: string, to: string): number {
  const ms = parseDate(to).getTime() - parseDate(from).getTime();
  return Math.round(ms / 86_400_000);
}

function parseDate(value: string): Date {
  const [year, month, day] = parts(value);
  return new Date(Date.UTC(year, month - 1, day));
}

function parts(value: string): [number, number, number] {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error('Date must use YYYY-MM-DD');
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
