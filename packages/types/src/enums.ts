export const AccountType = {
  CASH: 'CASH',
  BANK: 'BANK',
  WALLET: 'WALLET',
  SAVINGS: 'SAVINGS',
  CREDIT: 'CREDIT',
  OTHER: 'OTHER',
} as const;

export type AccountType = (typeof AccountType)[keyof typeof AccountType];

export const TransactionType = {
  EXPENSE: 'EXPENSE',
  INCOME: 'INCOME',
  TRANSFER: 'TRANSFER',
  REFUND: 'REFUND',
  ADJUSTMENT: 'ADJUSTMENT',
} as const;

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const CategoryKind = {
  EXPENSE: 'EXPENSE',
  INCOME: 'INCOME',
} as const;

export type CategoryKind = (typeof CategoryKind)[keyof typeof CategoryKind];

export const TransferLeg = {
  OUT: 'OUT',
  IN: 'IN',
} as const;

export type TransferLeg = (typeof TransferLeg)[keyof typeof TransferLeg];

export const AdjustmentDirection = {
  INCREASE: 'INCREASE',
  DECREASE: 'DECREASE',
} as const;

export type AdjustmentDirection = (typeof AdjustmentDirection)[keyof typeof AdjustmentDirection];

export const TransactionSource = {
  MANUAL: 'MANUAL',
} as const;

export type TransactionSource = (typeof TransactionSource)[keyof typeof TransactionSource];

export const TransactionStatus = {
  COMPLETED: 'COMPLETED',
} as const;

export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];

export const ACCOUNT_TYPES = Object.values(AccountType);
export const TRANSACTION_TYPES = Object.values(TransactionType);
export const CATEGORY_KINDS = Object.values(CategoryKind);
