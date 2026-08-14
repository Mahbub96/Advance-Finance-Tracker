import { CategoryKind } from '@personal-finance/types';

export const DEFAULT_CATEGORIES: Array<{
  name: string;
  type: typeof CategoryKind.EXPENSE | typeof CategoryKind.INCOME;
  colorToken: string;
}> = [
  { name: 'Food', type: CategoryKind.EXPENSE, colorToken: 'expense' },
  { name: 'Transport', type: CategoryKind.EXPENSE, colorToken: 'expense' },
  { name: 'Housing', type: CategoryKind.EXPENSE, colorToken: 'expense' },
  { name: 'Utilities', type: CategoryKind.EXPENSE, colorToken: 'expense' },
  { name: 'Health', type: CategoryKind.EXPENSE, colorToken: 'expense' },
  { name: 'Education', type: CategoryKind.EXPENSE, colorToken: 'expense' },
  { name: 'Shopping', type: CategoryKind.EXPENSE, colorToken: 'expense' },
  { name: 'Entertainment', type: CategoryKind.EXPENSE, colorToken: 'expense' },
  { name: 'Personal', type: CategoryKind.EXPENSE, colorToken: 'expense' },
  { name: 'Other expense', type: CategoryKind.EXPENSE, colorToken: 'expense' },
  { name: 'Salary', type: CategoryKind.INCOME, colorToken: 'income' },
  { name: 'Business', type: CategoryKind.INCOME, colorToken: 'income' },
  { name: 'Gift', type: CategoryKind.INCOME, colorToken: 'income' },
  { name: 'Other income', type: CategoryKind.INCOME, colorToken: 'income' },
];
