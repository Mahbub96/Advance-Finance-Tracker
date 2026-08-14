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

export const BudgetPeriodType = {
  MONTHLY: 'MONTHLY',
  CUSTOM: 'CUSTOM',
} as const;

export type BudgetPeriodType = (typeof BudgetPeriodType)[keyof typeof BudgetPeriodType];

export const BudgetStatus = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const;

export type BudgetStatus = (typeof BudgetStatus)[keyof typeof BudgetStatus];

export const RecurringFrequency = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
} as const;

export type RecurringFrequency = (typeof RecurringFrequency)[keyof typeof RecurringFrequency];

export const RecurringRuleStatus = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type RecurringRuleStatus =
  (typeof RecurringRuleStatus)[keyof typeof RecurringRuleStatus];

export const DebtType = {
  LENT: 'LENT',
  BORROWED: 'BORROWED',
} as const;

export type DebtType = (typeof DebtType)[keyof typeof DebtType];

export const DebtStatus = {
  ACTIVE: 'ACTIVE',
  REPAID: 'REPAID',
  CANCELLED: 'CANCELLED',
} as const;

export type DebtStatus = (typeof DebtStatus)[keyof typeof DebtStatus];

export const GoalStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  PAUSED: 'PAUSED',
  CANCELLED: 'CANCELLED',
} as const;

export type GoalStatus = (typeof GoalStatus)[keyof typeof GoalStatus];

export const InsightType = {
  WARNING: 'WARNING',
  TIP: 'TIP',
  ACHIEVEMENT: 'ACHIEVEMENT',
  ANOMALY: 'ANOMALY',
} as const;

export type InsightType = (typeof InsightType)[keyof typeof InsightType];

export const HealthRating = {
  EXCELLENT: 'EXCELLENT',
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  ATTENTION_NEEDED: 'ATTENTION_NEEDED',
} as const;

export type HealthRating = (typeof HealthRating)[keyof typeof HealthRating];

export const ACCOUNT_TYPES = Object.values(AccountType);
export const TRANSACTION_TYPES = Object.values(TransactionType);
export const CATEGORY_KINDS = Object.values(CategoryKind);
export const BUDGET_PERIOD_TYPES = Object.values(BudgetPeriodType);
export const BUDGET_STATUSES = Object.values(BudgetStatus);
export const RECURRING_FREQUENCIES = Object.values(RecurringFrequency);
export const RECURRING_RULE_STATUSES = Object.values(RecurringRuleStatus);
export const DEBT_TYPES = Object.values(DebtType);
export const DEBT_STATUSES = Object.values(DebtStatus);
export const GOAL_STATUSES = Object.values(GoalStatus);
export const INSIGHT_TYPES = Object.values(InsightType);
export const HEALTH_RATINGS = Object.values(HealthRating);


