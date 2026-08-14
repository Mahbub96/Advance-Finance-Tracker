import {
  BudgetPeriodType,
  BudgetStatus,
  CategoryKind,
  type CategoryKind as CategoryKindType,
  TransactionStatus,
  TransactionType,
} from '@personal-finance/types';
import type { BudgetRecord, CategoryRecord, TransactionRecord } from '../../../database/records';
import type { BudgetRepository } from '../../../repositories/budget-repository';
import type { CategoryRepository } from '../../../repositories/category-repository';
import type { TransactionRepository } from '../../../repositories/transaction-repository';
import { BudgetService } from './budget-service';

function memoryRepos() {
  const budgets: BudgetRecord[] = [];
  const categories: CategoryRecord[] = [];
  const transactions: TransactionRecord[] = [];

  const budgetRepo = {
    async list() {
      return budgets.filter((budget) => !budget.deletedAt && budget.status === BudgetStatus.ACTIVE);
    },
    async getById(id: string) {
      return budgets.find((budget) => budget.id === id && !budget.deletedAt) ?? null;
    },
    async insert(record: BudgetRecord) {
      budgets.push(record);
    },
    async update(record: BudgetRecord) {
      const index = budgets.findIndex((budget) => budget.id === record.id);
      if (index >= 0) budgets[index] = record;
    },
  };

  const categoryRepo = {
    async list() {
      return categories.filter((category) => !category.deletedAt);
    },
    async getById(id: string) {
      return categories.find((category) => category.id === id && !category.deletedAt) ?? null;
    },
  };

  const txRepo = {
    async listByDateRange(from: string, to: string) {
      return transactions.filter(
        (tx) => !tx.deletedAt && tx.transactionDate >= from && tx.transactionDate <= to,
      );
    },
  };

  return {
    budgets,
    categories,
    transactions,
    service: new BudgetService(
      budgetRepo as unknown as BudgetRepository,
      categoryRepo as unknown as CategoryRepository,
      txRepo as unknown as TransactionRepository,
    ),
  };
}

function category(
  id: string,
  name: string,
  type: CategoryKindType = CategoryKind.EXPENSE,
): CategoryRecord {
  return {
    id,
    parentId: null,
    name,
    type,
    icon: null,
    colorToken: null,
    displayOrder: 0,
    isSystem: false,
    isArchived: false,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    deletedAt: null,
  };
}

function expense(id: string, categoryId: string, amount: string, date = '2026-08-10'): TransactionRecord {
  return {
    id,
    type: TransactionType.EXPENSE,
    accountId: 'cash',
    categoryId,
    merchantName: null,
    amount,
    currency: 'BDT',
    transactionDate: date,
    note: null,
    source: 'MANUAL',
    status: TransactionStatus.COMPLETED,
    transferGroupId: null,
    transferLeg: null,
    originalTransactionId: null,
    adjustmentDirection: null,
    createdAt: '2026-08-10T00:00:00.000Z',
    updatedAt: '2026-08-10T00:00:00.000Z',
    deletedAt: null,
  };
}

describe('BudgetService', () => {
  it('summarizes category spending and risk for a budget period', async () => {
    const { categories, transactions, service } = memoryRepos();
    categories.push(category('food', 'Food'), category('transport', 'Transport'));
    transactions.push(expense('tx-1', 'food', '400.00'));
    transactions.push(expense('tx-2', 'food', '500.00'));
    transactions.push(expense('tx-3', 'transport', '300.00'));

    await service.create({
      name: 'Food budget',
      amount: '1000',
      currency: 'BDT',
      periodType: BudgetPeriodType.CUSTOM,
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      categoryId: 'food',
    });

    const [summary] = await service.summaries();
    expect(summary?.category?.name).toBe('Food');
    expect(summary?.spent).toBe('900.00');
    expect(summary?.remaining).toBe('100.00');
    expect(summary?.utilizationPercent).toBe(90);
    expect(summary?.risk).toBe('ATTENTION');
  });

  it('aggregates expenses from subcategories under a parent category budget', async () => {
    const { categories, transactions, service } = memoryRepos();
    const parentCategory = category('food', 'Food');
    const childCategory: CategoryRecord = {
      ...category('groceries', 'Groceries'),
      parentId: 'food',
    };
    categories.push(parentCategory, childCategory);
    transactions.push(expense('tx-1', 'groceries', '600.00'));

    await service.create({
      name: 'Food budget',
      amount: '1000',
      currency: 'BDT',
      periodType: BudgetPeriodType.CUSTOM,
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      categoryId: 'food',
    });

    const [summary] = await service.summaries();
    expect(summary?.spent).toBe('600.00');
    expect(summary?.remaining).toBe('400.00');
  });

  it('deletes a budget softly', async () => {
    const { service } = memoryRepos();
    const record = await service.create({
      name: 'Temp budget',
      amount: '500',
      currency: 'BDT',
      periodType: BudgetPeriodType.CUSTOM,
      startDate: '2026-08-01',
      endDate: '2026-08-31',
    });

    await service.delete(record.id);
    const list = await service.list();
    expect(list.find((b) => b.id === record.id)).toBeUndefined();
  });

  it('rejects income categories for budgets', async () => {
    const { categories, service } = memoryRepos();
    categories.push(category('salary', 'Salary', CategoryKind.INCOME));

    await expect(
      service.create({
        name: 'Salary budget',
        amount: '1000',
        currency: 'BDT',
        periodType: BudgetPeriodType.CUSTOM,
        startDate: '2026-08-01',
        endDate: '2026-08-31',
        categoryId: 'salary',
      }),
    ).rejects.toThrow(/expense category/);
  });
});

