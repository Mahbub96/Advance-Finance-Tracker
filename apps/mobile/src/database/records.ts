import type { AccountType, MoneyString } from '@personal-finance/types';
import type { BudgetPeriodType, BudgetStatus } from '@personal-finance/types';
import type { RecurringFrequency, RecurringRuleStatus } from '@personal-finance/types';

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

export type BudgetRecord = {
  id: string;
  name: string;
  amount: MoneyString;
  currency: string;
  periodType: BudgetPeriodType;
  startDate: string;
  endDate: string;
  categoryId: string | null;
  status: BudgetStatus;
  alertThresholdPercent: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type RecurringRuleRecord = {
  id: string;
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  name: string;
  amount: MoneyString;
  currency: string;
  accountId: string;
  destinationAccountId: string | null;
  categoryId: string | null;
  frequency: RecurringFrequency;
  intervalValue: number;
  startDate: string;
  endDate: string | null;
  nextOccurrence: string;
  autoCreate: boolean;
  reminderEnabled: boolean;
  status: RecurringRuleStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
