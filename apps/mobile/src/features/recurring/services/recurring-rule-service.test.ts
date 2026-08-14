import {
  AccountType,
  CategoryKind,
  RecurringFrequency,
  TransactionType,
} from '@personal-finance/types';
import type { AccountRecord, CategoryRecord, RecurringRuleRecord } from '../../../database/records';
import type { AccountRepository } from '../../../repositories/account-repository';
import type { CategoryRepository } from '../../../repositories/category-repository';
import type { RecurringRuleRepository } from '../../../repositories/recurring-rule-repository';
import type { TransactionService } from '../../transactions/services/transaction-service';
import { nextDate, RecurringRuleService } from './recurring-rule-service';


function memoryRepos() {
  const accounts: AccountRecord[] = [];
  const categories: CategoryRecord[] = [];
  const rules: RecurringRuleRecord[] = [];

  const accountRepo = {
    async getById(id: string) {
      return accounts.find((account) => account.id === id && !account.deletedAt) ?? null;
    },
  };
  const categoryRepo = {
    async getById(id: string) {
      return categories.find((category) => category.id === id && !category.deletedAt) ?? null;
    },
  };
  const ruleRepo = {
    async list() {
      return rules.filter((rule) => !rule.deletedAt && rule.status === 'ACTIVE');
    },
    async getById(id: string) {
      return rules.find((rule) => rule.id === id && !rule.deletedAt) ?? null;
    },
    async insert(record: RecurringRuleRecord) {
      rules.push(record);
    },
    async update(record: RecurringRuleRecord) {
      const index = rules.findIndex((rule) => rule.id === record.id);
      if (index >= 0) rules[index] = record;
    },
  };

  return {
    accounts,
    categories,
    rules,
    service: new RecurringRuleService(
      ruleRepo as unknown as RecurringRuleRepository,
      accountRepo as unknown as AccountRepository,
      categoryRepo as unknown as CategoryRepository,
    ),
  };
}

function account(id: string, currency = 'BDT'): AccountRecord {
  return {
    id,
    name: id,
    type: AccountType.CASH,
    currency,
    openingBalance: '0.00',
    openingBalanceDate: '2026-01-01',
    isArchived: false,
    displayOrder: 0,
    institutionName: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
  };
}

function category(id: string, type: CategoryKind): CategoryRecord {
  return {
    id,
    parentId: null,
    name: id,
    type,
    icon: null,
    colorToken: null,
    displayOrder: 0,
    isSystem: false,
    isArchived: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
  };
}

describe('RecurringRuleService', () => {
  it('advances monthly dates with month-end clamping', () => {
    expect(nextDate('2026-01-31', RecurringFrequency.MONTHLY, 1)).toBe('2026-02-28');
    expect(nextDate('2026-02-28', RecurringFrequency.MONTHLY, 1)).toBe('2026-03-28');
  });

  it('creates an income recurring rule with the start date as next occurrence', async () => {
    const { accounts, categories, service } = memoryRepos();
    accounts.push(account('bank'));
    categories.push(category('salary', CategoryKind.INCOME));

    const rule = await service.create({
      type: TransactionType.INCOME,
      name: 'Salary',
      amount: '50000',
      currency: 'BDT',
      accountId: 'bank',
      categoryId: 'salary',
      frequency: RecurringFrequency.MONTHLY,
      startDate: '2026-08-25',
    });

    expect(rule.amount).toBe('50000.00');
    expect(rule.nextOccurrence).toBe('2026-08-25');
  });

  it('executes a due recurring rule and advances its next occurrence', async () => {
    const { accounts, categories, rules } = memoryRepos();
    accounts.push(account('bank'));

    categories.push(category('rent', CategoryKind.EXPENSE));

    const mockTxService = {
      createEntry: jest.fn().mockResolvedValue({ id: 'tx-created-1', type: TransactionType.EXPENSE }),
      createTransfer: jest.fn(),
    };

    const serviceWithTx = new RecurringRuleService(
      {
        async list() {
          return rules.filter((r) => !r.deletedAt && r.status === 'ACTIVE');
        },
        async getById(id: string) {
          return rules.find((r) => r.id === id && !r.deletedAt) ?? null;
        },
        async insert(record: RecurringRuleRecord) {
          rules.push(record);
        },
        async update(record: RecurringRuleRecord) {
          const index = rules.findIndex((r) => r.id === record.id);
          if (index >= 0) rules[index] = record;
        },
      } as unknown as RecurringRuleRepository,
      {
        async getById(id: string) {
          return accounts.find((a) => a.id === id) ?? null;
        },
      } as unknown as AccountRepository,
      {
        async getById(id: string) {
          return categories.find((c) => c.id === id) ?? null;
        },
      } as unknown as CategoryRepository,
      mockTxService as unknown as TransactionService,
    );

    const rule = await serviceWithTx.create({
      type: TransactionType.EXPENSE,
      name: 'House Rent',
      amount: '15000',
      currency: 'BDT',
      accountId: 'bank',
      categoryId: 'rent',
      frequency: RecurringFrequency.MONTHLY,
      startDate: '2026-08-01',
      autoCreate: true,
    });

    const result = await serviceWithTx.processDueRules(new Date('2026-08-15'), true);
    expect(result.processed).toBe(1);
    expect(mockTxService.createEntry).toHaveBeenCalledTimes(1);

    const updatedRule = rules.find((r) => r.id === rule.id);
    expect(updatedRule?.nextOccurrence).toBe('2026-09-01');
  });

  it('rejects transfer rules without a valid destination account', async () => {
    const { accounts, service } = memoryRepos();
    accounts.push(account('cash'));

    await expect(
      service.create({
        type: TransactionType.TRANSFER,
        name: 'Savings move',
        amount: '1000',
        currency: 'BDT',
        accountId: 'cash',
        destinationAccountId: 'cash',
        frequency: RecurringFrequency.WEEKLY,
        startDate: '2026-08-20',
      }),
    ).rejects.toThrow(/destination/);
  });
});

