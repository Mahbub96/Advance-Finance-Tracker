import {
  assertPositiveAmount,
  DebtStatus,
  DebtType,
  moneyString,
  parseMoney,
  subtractMoney,
  type DebtType as DebtTypeType,
  type MoneyString,
} from '@personal-finance/types';

import type { DebtRecord, DebtRepaymentRecord } from '../../../database/records';
import { nowIso } from '../../../lib/clock';
import { createId } from '../../../lib/id';
import type { AccountRepository } from '../../../repositories/account-repository';
import type { DebtRepository } from '../../../repositories/debt-repository';
import type { TransactionService } from '../../transactions/services/transaction-service';

export type CreateDebtInput = {
  type: DebtTypeType;
  personName: string;
  amount: string;
  currency: string;
  accountId?: string | null;
  dueDate?: string | null;
  issueDate?: string;
  email?: string | null;
  emailReminderEnabled?: boolean;
  note?: string | null;
};


export type RecordDebtRepaymentInput = {
  amount: string;
  repaymentDate?: string;
  accountId?: string | null;
  note?: string | null;
};

export type DebtSummary = {
  debt: DebtRecord;
  repayments: DebtRepaymentRecord[];
  totalRepaid: MoneyString;
  remainingAmount: MoneyString;
  progressPercent: number;
  isOverdue: boolean;
  daysUntilDue: number | null;
};

export class DebtService {
  constructor(
    private readonly debts: DebtRepository,
    private readonly accounts: AccountRepository,
    private readonly transactions?: TransactionService,
  ) {}

  async list(includeInactive = false): Promise<DebtRecord[]> {
    return this.debts.list(includeInactive);
  }

  async getById(id: string): Promise<DebtRecord | null> {
    return this.debts.getById(id);
  }

  async getRepayments(debtId: string): Promise<DebtRepaymentRecord[]> {
    return this.debts.listRepayments(debtId);
  }

  async summaries(today = new Date()): Promise<DebtSummary[]> {
    const allDebts = await this.debts.list(false);
    const todayStr = today.toISOString().slice(0, 10);

    return Promise.all(
      allDebts.map(async (debt) => {
        const repayments = await this.debts.listRepayments(debt.id);
        const totalRepaid = repayments.reduce(
          (sum, rep) => moneyString(parseMoney(sum).plus(parseMoney(rep.amount))),
          '0.00',
        );
        const remainingAmount = subtractMoney(debt.amount, totalRepaid);
        const progressPercent = parseMoney(debt.amount).isZero()
          ? 100
          : Math.min(
              100,
              parseMoney(totalRepaid).div(parseMoney(debt.amount)).times(100).round().toNumber(),
            );

        let daysUntilDue: number | null = null;
        let isOverdue = false;

        if (debt.dueDate) {
          const diffMs = new Date(debt.dueDate).getTime() - new Date(todayStr).getTime();
          daysUntilDue = Math.round(diffMs / 86_400_000);
          isOverdue = daysUntilDue < 0 && parseMoney(remainingAmount).isPositive();
        }

        return {
          debt,
          repayments,
          totalRepaid,
          remainingAmount,
          progressPercent,
          isOverdue,
          daysUntilDue,
        };
      }),
    );
  }

  async create(input: CreateDebtInput): Promise<DebtRecord> {
    const personName = input.personName.trim();
    if (!personName) {
      throw new Error('Person name is required');
    }
    const amount = assertPositiveAmount(input.amount);
    if (input.accountId) {
      const account = await this.accounts.getById(input.accountId);
      if (!account || account.isArchived) {
        throw new Error('Account not found');
      }
    }

    const email = input.email?.trim() || null;
    const emailReminderEnabled = Boolean(input.emailReminderEnabled);

    if (emailReminderEnabled) {
      if (!email || !email.includes('@')) {
        throw new Error('Valid recipient email is required when email reminder is enabled');
      }
    }

    const now = nowIso();
    const issueDate = input.issueDate || now.slice(0, 10);

    const record: DebtRecord = {
      id: createId(),
      type: input.type,
      personName,
      amount,
      currency: input.currency,
      accountId: input.accountId ?? null,
      dueDate: input.dueDate ?? null,
      issueDate,
      status: DebtStatus.ACTIVE,
      email,
      emailReminderEnabled,
      note: input.note?.trim() || null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    await this.debts.insert(record);


    // If an account is linked, create initial cash out/in transaction
    if (input.accountId && this.transactions) {
      const isLent = input.type === DebtType.LENT;
      await this.transactions.createEntry({
        type: isLent ? 'EXPENSE' : 'INCOME',
        accountId: input.accountId,
        amount,
        transactionDate: issueDate,
        note: `${isLent ? 'Lent to' : 'Borrowed from'} ${personName}${record.note ? ` - ${record.note}` : ''}`,
      });
    }

    return record;
  }

  async recordRepayment(
    debtId: string,
    input: RecordDebtRepaymentInput,
  ): Promise<DebtRepaymentRecord> {
    const debt = await this.debts.getById(debtId);
    if (!debt || debt.status !== DebtStatus.ACTIVE) {
      throw new Error('Active debt not found');
    }

    const amount = assertPositiveAmount(input.amount);
    const existingRepayments = await this.debts.listRepayments(debtId);
    const alreadyRepaid = existingRepayments.reduce(
      (sum, rep) => moneyString(parseMoney(sum).plus(parseMoney(rep.amount))),
      '0.00',
    );
    const totalRepaidAfter = moneyString(parseMoney(alreadyRepaid).plus(parseMoney(amount)));

    const now = nowIso();
    const repaymentDate = input.repaymentDate || now.slice(0, 10);

    const repayment: DebtRepaymentRecord = {
      id: createId(),
      debtId,
      amount,
      repaymentDate,
      accountId: input.accountId ?? null,
      note: input.note?.trim() || null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    await this.debts.insertRepayment(repayment);

    // If fully repaid, update debt status
    if (parseMoney(totalRepaidAfter).gte(parseMoney(debt.amount))) {
      await this.debts.update({
        ...debt,
        status: DebtStatus.REPAID,
        updatedAt: now,
      });
    }

    // Auto-create ledger transaction if linked to an account
    if (input.accountId && this.transactions) {
      const isLent = debt.type === DebtType.LENT;
      await this.transactions.createEntry({
        type: isLent ? 'INCOME' : 'EXPENSE',
        accountId: input.accountId,
        amount,
        transactionDate: repaymentDate,
        note: `Repayment ${isLent ? 'from' : 'to'} ${debt.personName}${repayment.note ? ` - ${repayment.note}` : ''}`,
      });
    }

    return repayment;
  }

  async delete(id: string): Promise<void> {
    const debt = await this.debts.getById(id);
    if (!debt) {
      throw new Error('Debt not found');
    }
    const deletedAt = nowIso();
    await this.debts.update({
      ...debt,
      deletedAt,
      updatedAt: deletedAt,
    });
  }
}
