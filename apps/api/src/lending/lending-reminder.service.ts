import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import {
  LendingReminderType,
  ReminderDeliveryStatus,
  parseMoney,
  type LendingReminderJob,
  type LendingEmailPreviewRequest,
  type LendingEmailPreviewResponse,
  type MoneyString,
} from '@personal-finance/types';
import { isValidEmail } from '@personal-finance/validation';
import { EMAIL_PROVIDER, type IEmailProvider } from './email/email.interface';
import { renderLendingReminderEmail } from './email/templates/lending-reminder.templates';

export interface DebtScheduleInput {
  debtId: string;
  userId: string;
  personName: string;
  email?: string | null;
  emailReminderEnabled?: boolean;
  amount: MoneyString;
  remainingAmount?: MoneyString;
  currency: string;
  dueDate: string | null;
  status: string;
  note?: string | null;
  timezone?: string;
}

@Injectable()
export class LendingReminderService {
  private readonly jobs = new Map<string, LendingReminderJob>();

  constructor(
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: IEmailProvider,
  ) {}

  /**
   * Deterministic calendar calculation for 7-day, 3-day, and due-day dates.
   * Uses date arithmetic independent of the server's local timezone.
   */
  calculateSchedule(dueDateStr: string, _timezone = 'Asia/Dhaka'): {
    sevenDaysBefore: string;
    threeDaysBefore: string;
    dueDay: string;
  } {
    const cleanDue = dueDateStr.trim().slice(0, 10);
    const [year, month, day] = cleanDue.split('-').map(Number);
    if (!year || !month || !day) {
      throw new BadRequestException(`Invalid due date format: ${dueDateStr}`);
    }

    const dueUtc = new Date(Date.UTC(year, month - 1, day));
    if (isNaN(dueUtc.getTime())) {
      throw new BadRequestException(`Invalid due date: ${dueDateStr}`);
    }

    const minus7 = new Date(dueUtc.getTime() - 7 * 86400000);
    const minus3 = new Date(dueUtc.getTime() - 3 * 86400000);

    return {
      sevenDaysBefore: minus7.toISOString().slice(0, 10),
      threeDaysBefore: minus3.toISOString().slice(0, 10),
      dueDay: cleanDue,
    };
  }

  /**
   * Synchronizes reminder jobs for a lending record.
   * Cancels future reminders if reminders are disabled, debt is fully repaid, or email is removed.
   */
  async syncLendingRecordSchedule(input: DebtScheduleInput): Promise<LendingReminderJob[]> {
    const remaining = input.remainingAmount ?? input.amount;
    const isFullyRepaid = parseMoney(remaining).lte(0);
    const isInactive = input.status !== 'ACTIVE';
    const isEmailValid = isValidEmail(input.email);

    // If disabled, repaid, inactive, or lacking a valid email or due date: cancel all pending
    if (
      !input.emailReminderEnabled ||
      !isEmailValid ||
      isFullyRepaid ||
      isInactive ||
      !input.dueDate
    ) {
      this.cancelRemindersForDebt(input.debtId, 'Reminders disabled or debt resolved');
      return [];
    }

    const schedule = this.calculateSchedule(input.dueDate, input.timezone);
    const recipientEmail = input.email!.trim().toLowerCase();
    const recipientName = input.personName.trim();
    const now = new Date().toISOString();

    const createdOrUpdatedJobs: LendingReminderJob[] = [];

    const reminderEvents: Array<{
      type: LendingReminderType;
      scheduledFor: string;
    }> = [
      {
        type: LendingReminderType.LENDING_DUE_7_DAYS,
        scheduledFor: schedule.sevenDaysBefore,
      },
      {
        type: LendingReminderType.LENDING_DUE_3_DAYS,
        scheduledFor: schedule.threeDaysBefore,
      },
      {
        type: LendingReminderType.LENDING_DUE,
        scheduledFor: schedule.dueDay,
      },
    ];

    for (const event of reminderEvents) {
      const deduplicationKey = `debt-${input.debtId}:${event.type}:${schedule.dueDay}:EMAIL`;
      const existing = this.jobs.get(deduplicationKey);

      if (existing) {
        // If already sent or failed permanently, do not reschedule
        if (existing.status === ReminderDeliveryStatus.SENT) {
          createdOrUpdatedJobs.push(existing);
          continue;
        }

        existing.amount = remaining;
        existing.recipientEmail = recipientEmail;
        existing.recipientName = recipientName;
        existing.scheduledFor = event.scheduledFor;
        existing.status = ReminderDeliveryStatus.SCHEDULED;
        existing.updatedAt = now;
        createdOrUpdatedJobs.push(existing);
      } else {
        const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const newJob: LendingReminderJob = {
          id: jobId,
          debtId: input.debtId,
          userId: input.userId,
          reminderType: event.type,
          scheduledFor: event.scheduledFor,
          recipientEmail,
          recipientName,
          amount: remaining,
          currency: input.currency,
          dueDate: schedule.dueDay,
          deduplicationKey,
          status: ReminderDeliveryStatus.SCHEDULED,
          attemptCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        this.jobs.set(deduplicationKey, newJob);
        createdOrUpdatedJobs.push(newJob);
      }
    }

    return createdOrUpdatedJobs;
  }

  cancelRemindersForDebt(debtId: string, reason?: string): void {
    const now = new Date().toISOString();
    for (const job of this.jobs.values()) {
      if (
        job.debtId === debtId &&
        job.status !== ReminderDeliveryStatus.SENT &&
        job.status !== ReminderDeliveryStatus.CANCELLED
      ) {
        job.status = ReminderDeliveryStatus.CANCELLED;
        job.failureReason = reason ?? 'Cancelled';
        job.updatedAt = now;
      }
    }
  }

  updateRemainingAmount(debtId: string, remainingAmount: MoneyString): void {
    const isFullyRepaid = parseMoney(remainingAmount).lte(0);
    if (isFullyRepaid) {
      this.cancelRemindersForDebt(debtId, 'Debt fully repaid');
      return;
    }

    const now = new Date().toISOString();
    for (const job of this.jobs.values()) {
      if (job.debtId === debtId && job.status === ReminderDeliveryStatus.SCHEDULED) {
        job.amount = remainingAmount;
        job.updatedAt = now;
      }
    }
  }

  async dispatchPendingReminders(
    referenceDateStr = new Date().toISOString().slice(0, 10),
  ): Promise<{ dispatched: number; failed: number; skipped: number }> {
    let dispatched = 0;
    let failed = 0;
    let skipped = 0;

    for (const job of this.jobs.values()) {
      if (job.status !== ReminderDeliveryStatus.SCHEDULED) {
        continue;
      }

      // Check if scheduled date has arrived
      if (job.scheduledFor > referenceDateStr) {
        skipped++;
        continue;
      }

      // Render polite template
      const templateData = {
        recipientName: job.recipientName,
        amount: job.amount,
        currency: job.currency,
        dueDate: job.dueDate,
        appName: 'Personal Finance',
      };

      const rendered = renderLendingReminderEmail(job.reminderType, templateData);

      job.status = ReminderDeliveryStatus.SENDING;
      job.attemptCount += 1;
      job.lastAttemptAt = new Date().toISOString();

      try {
        const result = await this.emailProvider.sendEmail({
          to: job.recipientEmail,
          subject: rendered.subject,
          text: rendered.textBody,
          metadata: {
            jobId: job.id,
            debtId: job.debtId,
            reminderType: job.reminderType,
          },
        });

        if (result.success) {
          job.status = ReminderDeliveryStatus.SENT;
          job.sentAt = new Date().toISOString();
          job.failureReason = null;
          dispatched++;
        } else {
          if (!result.retryable || job.attemptCount >= 3) {
            job.status = ReminderDeliveryStatus.FAILED;
            job.failureReason = result.error || 'Permanent delivery failure';
          } else {
            job.status = ReminderDeliveryStatus.SCHEDULED; // Retryable on next cycle
            job.failureReason = result.error || 'Transient failure';
          }
          failed++;
        }
      } catch (err: unknown) {
        job.status = job.attemptCount >= 3 ? ReminderDeliveryStatus.FAILED : ReminderDeliveryStatus.SCHEDULED;
        job.failureReason = err instanceof Error ? err.message : 'Unknown exception';
        failed++;
      }

      job.updatedAt = new Date().toISOString();
    }

    return { dispatched, failed, skipped };
  }

  previewReminder(request: LendingEmailPreviewRequest): LendingEmailPreviewResponse {
    if (!isValidEmail(request.recipientEmail)) {
      throw new BadRequestException('Valid recipient email address is required');
    }
    if (!request.recipientName || !request.recipientName.trim()) {
      throw new BadRequestException('Recipient name is required');
    }
    if (!request.dueDate) {
      throw new BadRequestException('Due date is required for reminder preview');
    }

    const schedule = this.calculateSchedule(request.dueDate, request.timezone);
    const reminderType = request.reminderType ?? LendingReminderType.LENDING_DUE_7_DAYS;

    const rendered = renderLendingReminderEmail(reminderType, {
      recipientName: request.recipientName.trim(),
      amount: request.amount,
      currency: request.currency,
      dueDate: schedule.dueDay,
      userNote: request.userNote,
    });

    return {
      recipient: request.recipientEmail.trim().toLowerCase(),
      reminderType,
      subject: rendered.subject,
      body: rendered.textBody,
      calculatedSchedule: schedule,
    };
  }

  getJobs(): LendingReminderJob[] {
    return Array.from(this.jobs.values());
  }

  clearJobs(): void {
    this.jobs.clear();
  }
}
