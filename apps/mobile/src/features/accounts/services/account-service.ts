import {
  type AccountType,
  assertNonNegativeMoney,
  deriveAccountBalance,
  type MoneyString,
} from '@personal-finance/types';
import type { AccountRecord, TransactionRecord } from '../../../database/records';
import { nowIso } from '../../../lib/clock';
import { createId } from '../../../lib/id';
import type { AccountRepository } from '../../../repositories/account-repository';

export type CreateAccountInput = {
  name: string;
  type: AccountType;
  currency: string;
  openingBalance: string;
  openingBalanceDate: string;
  institutionName?: string | null;
};

export class AccountService {
  constructor(private readonly accounts: AccountRepository) {}

  async list(includeArchived = false): Promise<AccountRecord[]> {
    return this.accounts.list(includeArchived);
  }

  async get(id: string): Promise<AccountRecord> {
    const account = await this.accounts.getById(id);
    if (!account) {
      throw new Error('Account not found');
    }
    return account;
  }

  async create(input: CreateAccountInput): Promise<AccountRecord> {
    const name = input.name.trim();
    if (!name) {
      throw new Error('Account name is required');
    }

    const now = nowIso();
    const record: AccountRecord = {
      id: createId(),
      name,
      type: input.type,
      currency: input.currency,
      openingBalance: assertNonNegativeMoney(input.openingBalance || '0'),
      openingBalanceDate: input.openingBalanceDate,
      isArchived: false,
      displayOrder: 0,
      institutionName: input.institutionName?.trim() || null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    await this.accounts.insert(record);
    return record;
  }

  async update(
    id: string,
    patch: Partial<Pick<CreateAccountInput, 'name' | 'type' | 'institutionName'>>,
  ): Promise<AccountRecord> {
    const current = await this.get(id);
    const next: AccountRecord = {
      ...current,
      name: patch.name?.trim() || current.name,
      type: patch.type ?? current.type,
      institutionName:
        patch.institutionName === undefined
          ? current.institutionName
          : patch.institutionName?.trim() || null,
      updatedAt: nowIso(),
    };
    if (!next.name) {
      throw new Error('Account name is required');
    }
    await this.accounts.update(next);
    return next;
  }

  async archive(id: string): Promise<AccountRecord> {
    const current = await this.get(id);
    const next: AccountRecord = {
      ...current,
      isArchived: true,
      updatedAt: nowIso(),
    };
    await this.accounts.update(next);
    return next;
  }

  async restore(id: string): Promise<AccountRecord> {
    const current = await this.get(id);
    const next: AccountRecord = {
      ...current,
      isArchived: false,
      updatedAt: nowIso(),
    };
    await this.accounts.update(next);
    return next;
  }

  async remove(id: string): Promise<AccountRecord> {
    const current = await this.get(id);
    const now = nowIso();
    const next: AccountRecord = {
      ...current,
      deletedAt: now,
      updatedAt: now,
    };
    await this.accounts.update(next);
    await this.accounts.softDeleteTransactions(id, now);
    return next;
  }

  balance(account: AccountRecord, transactions: TransactionRecord[]): MoneyString {
    return deriveAccountBalance(account.openingBalance, transactions, account.id);
  }
}
