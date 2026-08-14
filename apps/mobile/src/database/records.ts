import type { AccountType, MoneyString } from '@personal-finance/types';

export type AccountRecord = {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  openingBalance: MoneyString;
  openingBalanceDate: string;
  isArchived: boolean;
  displayOrder: number;
  institutionName: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type CategoryRecord = {
  id: string;
  parentId: string | null;
  name: string;
  type: 'EXPENSE' | 'INCOME';
  icon: string | null;
  colorToken: string | null;
  displayOrder: number;
  isSystem: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type TransactionRecord = {
  id: string;
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER' | 'REFUND' | 'ADJUSTMENT';
  accountId: string;
  categoryId: string | null;
  merchantName: string | null;
  amount: MoneyString;
  currency: string;
  transactionDate: string;
  note: string | null;
  source: string;
  status: string;
  transferGroupId: string | null;
  transferLeg: 'OUT' | 'IN' | null;
  originalTransactionId: string | null;
  adjustmentDirection: 'INCREASE' | 'DECREASE' | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type SettingsRecord = {
  id: string;
  displayName: string | null;
  baseCurrency: string;
  locale: string;
  timezone: string;
  theme: string;
  onboardingCompleted: boolean;
  defaultAccountId: string | null;
  createdAt: string;
  updatedAt: string;
};
