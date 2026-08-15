import type { LendingReminderType, ReminderDeliveryStatus } from './enums';
import type { MoneyString } from './money';

export type LendingReminderSchedule = {
  debtId: string;
  recipientName: string;
  recipientEmail: string;
  dueDate: string;
  timezone: string;
  sevenDaysBefore: string;
  threeDaysBefore: string;
  dueDay: string;
  enabled: boolean;
};

export type LendingEmailTemplateData = {
  recipientName: string;
  amount: MoneyString;
  currency: string;
  dueDate: string;
  daysRemaining?: number;
  daysOverdue?: number;
  userNote?: string | null;
  appName?: string;
};

export type RenderedEmail = {
  subject: string;
  textBody: string;
  htmlBody?: string;
};

export type LendingReminderJob = {
  id: string;
  debtId: string;
  userId: string;
  reminderType: LendingReminderType;
  scheduledFor: string;
  recipientEmail: string;
  recipientName: string;
  amount: MoneyString;
  currency: string;
  dueDate: string;
  deduplicationKey: string;
  status: ReminderDeliveryStatus;
  attemptCount: number;
  lastAttemptAt?: string | null;
  sentAt?: string | null;
  failureReason?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LendingEmailPreviewRequest = {
  recipientName: string;
  recipientEmail: string;
  amount: MoneyString;
  currency: string;
  dueDate: string;
  reminderType?: LendingReminderType;
  userNote?: string | null;
  timezone?: string;
};

export type LendingEmailPreviewResponse = {
  recipient: string;
  reminderType: LendingReminderType;
  subject: string;
  body: string;
  calculatedSchedule: {
    sevenDaysBefore: string;
    threeDaysBefore: string;
    dueDay: string;
  };
};
