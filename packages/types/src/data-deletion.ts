import type { DataDeletionScope, DataDeletionStatus } from './enums';

export type DeletionPreviewCounts = {
  transactions: number;
  accounts: number;
  budgets: number;
  goals: number;
  debts: number;
  debtRepayments: number;
  recurringRules: number;
  notifications: number;
  attachments: number;
  aiInsights: number;
};

export type DataDeletionPeriod = {
  startDate: string;
  endDate: string;
  timezone: string;
};

export type DataDeletionPreviewRequest = {
  scope: DataDeletionScope;
  timezone?: string;
};

export type DataDeletionPreviewResponse = {
  scope: DataDeletionScope;
  period: DataDeletionPeriod | null;
  counts: DeletionPreviewCounts;
  totalRecords: number;
  confirmationToken: string;
  accountEmail: string;
  expiresAt: string;
};

export type DataDeletionExecuteRequest = {
  scope: DataDeletionScope;
  confirmationToken: string;
  typedEmail: string;
};

export type DataDeletionExecuteResponse = {
  executionId: string;
  scope: DataDeletionScope;
  status: DataDeletionStatus;
  deletedCounts: DeletionPreviewCounts;
  totalDeleted: number;
  executedAt: string;
  message: string;
};

export type DataDeletionAuditRecord = {
  id: string;
  userId: string;
  scope: DataDeletionScope;
  status: DataDeletionStatus;
  periodStart?: string | null;
  periodEnd?: string | null;
  totalRecordsAffected: number;
  startedAt: string;
  completedAt?: string | null;
  failureReason?: string | null;
};
