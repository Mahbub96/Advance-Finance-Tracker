import {
  AdjustmentDirection,
  type AdjustmentDirection as AdjustmentDirectionType,
  assertPositiveAmount,
  TransactionSource,
  TransactionStatus,
  TransactionType,
  TransferLeg,
} from '@personal-finance/types';
import type { TransactionRecord } from '../../../database/records';
import { nowIso } from '../../../lib/clock';
import { createId } from '../../../lib/id';
import type { AccountRepository } from '../../../repositories/account-repository';
import type { TransactionRepository } from '../../../repositories/transaction-repository';

export type CreateEntryInput = {
  type: 'EXPENSE' | 'INCOME' | 'REFUND' | 'ADJUSTMENT';
  accountId: string;
  amount: string;
  transactionDate: string;
  categoryId?: string | null;
  merchantName?: string | null;
  note?: string | null;
  originalTransactionId?: string | null;
  adjustmentDirection?: AdjustmentDirectionType | null;
};

export type CreateTransferInput = {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: string;
  transactionDate: string;
  note?: string | null;
};

export class TransactionService {
  constructor(
    private readonly transactions: TransactionRepository,
    private readonly accounts: AccountRepository,
  ) {}

  async list(limit?: number): Promise<TransactionRecord[]> {
    return this.transactions.list(limit);
  }

  async listByAccount(accountId: string): Promise<TransactionRecord[]> {
    return this.transactions.listByAccount(accountId);
  }

  async listByDateRange(from: string, to: string): Promise<TransactionRecord[]> {
    return this.transactions.listByDateRange(from, to);
  }

  async createEntry(input: CreateEntryInput): Promise<TransactionRecord> {
    const account = await this.requireAccount(input.accountId);
    const amount = assertPositiveAmount(input.amount);

    if (input.type === TransactionType.ADJUSTMENT && !input.adjustmentDirection) {
      throw new Error('Adjustment direction is required');
    }
    if (input.type === TransactionType.REFUND && input.originalTransactionId) {
      const original = await this.transactions.getById(input.originalTransactionId);
      if (!original || original.type !== TransactionType.EXPENSE) {
        throw new Error('Refund must reference an expense');
      }
    }

    const now = nowIso();
    const record: TransactionRecord = {
      id: createId(),
      type: input.type,
      accountId: account.id,
      categoryId: input.categoryId ?? null,
      merchantName: input.merchantName?.trim() || null,
      amount,
      currency: account.currency,
      transactionDate: input.transactionDate,
      note: input.note?.trim() || null,
      source: TransactionSource.MANUAL,
      status: TransactionStatus.COMPLETED,
      transferGroupId: null,
      transferLeg: null,
      originalTransactionId: input.originalTransactionId ?? null,
      adjustmentDirection:
        input.type === TransactionType.ADJUSTMENT
          ? (input.adjustmentDirection ?? AdjustmentDirection.INCREASE)
          : null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    await this.transactions.insert(record);
    return record;
  }

  async createTransfer(input: CreateTransferInput): Promise<TransactionRecord[]> {
    if (input.sourceAccountId === input.destinationAccountId) {
      throw new Error('Transfer accounts must be different');
    }
    const source = await this.requireAccount(input.sourceAccountId);
    const destination = await this.requireAccount(input.destinationAccountId);
    if (source.currency !== destination.currency) {
      throw new Error('Transfer accounts must share a currency');
    }
    const amount = assertPositiveAmount(input.amount);
    const now = nowIso();
    const groupId = createId();
    const note = input.note?.trim() || null;

    const outLeg: TransactionRecord = {
      id: createId(),
      type: TransactionType.TRANSFER,
      accountId: source.id,
      categoryId: null,
      merchantName: null,
      amount,
      currency: source.currency,
      transactionDate: input.transactionDate,
      note,
      source: TransactionSource.MANUAL,
      status: TransactionStatus.COMPLETED,
      transferGroupId: groupId,
      transferLeg: TransferLeg.OUT,
      originalTransactionId: null,
      adjustmentDirection: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    const inLeg: TransactionRecord = {
      ...outLeg,
      id: createId(),
      accountId: destination.id,
      transferLeg: TransferLeg.IN,
    };

    await this.transactions.insertMany([outLeg, inLeg]);
    return [outLeg, inLeg];
  }

  async softDelete(id: string): Promise<void> {
    const current = await this.transactions.getById(id);
    if (!current) {
      throw new Error('Transaction not found');
    }
    const deletedAt = nowIso();
    if (current.transferGroupId) {
      const siblings = (await this.transactions.list(1000)).filter(
        (tx) => tx.transferGroupId === current.transferGroupId,
      );
      for (const sibling of siblings) {
        await this.transactions.update({
          ...sibling,
          deletedAt,
          updatedAt: deletedAt,
        });
      }
      return;
    }
    await this.transactions.update({ ...current, deletedAt, updatedAt: deletedAt });
  }

  private async requireAccount(id: string) {
    const account = await this.accounts.getById(id);
    if (!account || account.isArchived) {
      throw new Error('Account not found');
    }
    return account;
  }
}
