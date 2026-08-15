import { LendingReminderType, ReminderDeliveryStatus } from '@personal-finance/types';
import { MockEmailProvider } from './email/mock-email.provider';
import { LendingReminderService } from './lending-reminder.service';

describe('LendingReminderService', () => {
  let service: LendingReminderService;
  let mockEmail: MockEmailProvider;

  beforeEach(() => {
    mockEmail = new MockEmailProvider();
    service = new LendingReminderService(mockEmail);
  });

  describe('calculateSchedule', () => {
    it('calculates exact 7-day and 3-day reminder dates deterministically', () => {
      const schedule = service.calculateSchedule('2026-09-20', 'Asia/Dhaka');
      expect(schedule.dueDay).toBe('2026-09-20');
      expect(schedule.threeDaysBefore).toBe('2026-09-17');
      expect(schedule.sevenDaysBefore).toBe('2026-09-13');
    });

    it('handles month boundaries accurately', () => {
      const schedule = service.calculateSchedule('2026-03-05', 'UTC');
      expect(schedule.dueDay).toBe('2026-03-05');
      expect(schedule.threeDaysBefore).toBe('2026-03-02');
      expect(schedule.sevenDaysBefore).toBe('2026-02-26');
    });
  });

  describe('syncLendingRecordSchedule', () => {
    it('creates 3 scheduled reminder jobs when email reminder is enabled', async () => {
      const jobs = await service.syncLendingRecordSchedule({
        debtId: 'debt-101',
        userId: 'user-1',
        personName: 'Rahim',
        email: 'rahim@example.com',
        emailReminderEnabled: true,
        amount: '6000.00',
        currency: 'BDT',
        dueDate: '2026-09-20',
        status: 'ACTIVE',
      });

      expect(jobs.length).toBe(3);
      expect(jobs.map((j) => j.reminderType)).toEqual([
        LendingReminderType.LENDING_DUE_7_DAYS,
        LendingReminderType.LENDING_DUE_3_DAYS,
        LendingReminderType.LENDING_DUE,
      ]);
      expect(jobs[0]!.recipientEmail).toBe('rahim@example.com');
      expect(jobs[0]!.amount).toBe('6000.00');
    });


    it('cancels reminders when email reminder is disabled', async () => {
      // First enable
      await service.syncLendingRecordSchedule({
        debtId: 'debt-102',
        userId: 'user-1',
        personName: 'Karim',
        email: 'karim@example.com',
        emailReminderEnabled: true,
        amount: '3000.00',
        currency: 'BDT',
        dueDate: '2026-09-20',
        status: 'ACTIVE',
      });

      // Now disable
      const updated = await service.syncLendingRecordSchedule({
        debtId: 'debt-102',
        userId: 'user-1',
        personName: 'Karim',
        email: 'karim@example.com',
        emailReminderEnabled: false,
        amount: '3000.00',
        currency: 'BDT',
        dueDate: '2026-09-20',
        status: 'ACTIVE',
      });

      expect(updated.length).toBe(0);
      const allJobs = service.getJobs().filter((j) => j.debtId === 'debt-102');
      expect(allJobs.every((j) => j.status === ReminderDeliveryStatus.CANCELLED)).toBe(true);
    });

    it('cancels reminders when debt is fully repaid', async () => {
      await service.syncLendingRecordSchedule({
        debtId: 'debt-103',
        userId: 'user-1',
        personName: 'Rahim',
        email: 'rahim@example.com',
        emailReminderEnabled: true,
        amount: '5000.00',
        remainingAmount: '0.00',
        currency: 'BDT',
        dueDate: '2026-09-20',
        status: 'ACTIVE',
      });

      const allJobs = service.getJobs().filter((j) => j.debtId === 'debt-103');
      expect(allJobs.every((j) => j.status === ReminderDeliveryStatus.CANCELLED)).toBe(true);
    });

    it('updates job amount on partial repayments', async () => {
      await service.syncLendingRecordSchedule({
        debtId: 'debt-104',
        userId: 'user-1',
        personName: 'Rahim',
        email: 'rahim@example.com',
        emailReminderEnabled: true,
        amount: '6000.00',
        currency: 'BDT',
        dueDate: '2026-09-20',
        status: 'ACTIVE',
      });

      // Partial repayment: 2000 repaid, remaining 4000
      service.updateRemainingAmount('debt-104', '4000.00');

      const jobs = service.getJobs().filter((j) => j.debtId === 'debt-104');
      expect(jobs[0]!.amount).toBe('4000.00');
    });
  });

  describe('dispatchPendingReminders', () => {
    it('dispatches due reminder and sends email with polite template', async () => {
      await service.syncLendingRecordSchedule({
        debtId: 'debt-105',
        userId: 'user-1',
        personName: 'Rahim',
        email: 'rahim@example.com',
        emailReminderEnabled: true,
        amount: '6000.00',
        currency: 'BDT',
        dueDate: '2026-09-20',
        status: 'ACTIVE',
      });

      // 7 days before is 2026-09-13
      const res = await service.dispatchPendingReminders('2026-09-13');
      expect(res.dispatched).toBe(1);

      const sent = mockEmail.getSentMessages();
      expect(sent.length).toBe(1);
      expect(sent[0]!.to).toBe('rahim@example.com');
      expect(sent[0]!.subject).toBe('Friendly reminder about the repayment');
      expect(sent[0]!.text).toContain('BDT 6000.00');
      expect(sent[0]!.text).toContain('due in 7 days');
    });

    it('is idempotent: running dispatch twice does not send duplicate emails', async () => {
      await service.syncLendingRecordSchedule({
        debtId: 'debt-106',
        userId: 'user-1',
        personName: 'Rahim',
        email: 'rahim@example.com',
        emailReminderEnabled: true,
        amount: '6000.00',
        currency: 'BDT',
        dueDate: '2026-09-20',
        status: 'ACTIVE',
      });

      await service.dispatchPendingReminders('2026-09-13');
      const res2 = await service.dispatchPendingReminders('2026-09-13');

      expect(res2.dispatched).toBe(0);
      expect(mockEmail.getSentMessages().length).toBe(1);
    });

    it('handles temporary failure with retry attempt count', async () => {
      await service.syncLendingRecordSchedule({
        debtId: 'debt-107',
        userId: 'user-1',
        personName: 'Rahim',
        email: 'rahim@example.com',
        emailReminderEnabled: true,
        amount: '6000.00',
        currency: 'BDT',
        dueDate: '2026-09-20',
        status: 'ACTIVE',
      });

      mockEmail.simulateFailure('Network timeout', true);
      const res = await service.dispatchPendingReminders('2026-09-13');

      expect(res.failed).toBe(1);
      const jobs = service.getJobs().filter((j) => j.debtId === 'debt-107');
      expect(jobs[0]!.status).toBe(ReminderDeliveryStatus.SCHEDULED);
      expect(jobs[0]!.attemptCount).toBe(1);
    });
  });


  describe('previewReminder', () => {
    it('returns rendered preview and schedule', () => {
      const preview = service.previewReminder({
        recipientName: 'Rahim',
        recipientEmail: 'rahim@example.com',
        amount: '6000.00',
        currency: 'BDT',
        dueDate: '2026-09-20',
      });

      expect(preview.recipient).toBe('rahim@example.com');
      expect(preview.subject).toBe('Friendly reminder about the repayment');
      expect(preview.body).toContain('BDT 6000.00');
      expect(preview.calculatedSchedule.sevenDaysBefore).toBe('2026-09-13');
    });
  });
});
