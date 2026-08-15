import { AccountType, DebtStatus, DebtType } from '@personal-finance/types';
import type { AccountRecord, DebtRecord, DebtRepaymentRecord } from '../../../database/records';
import type { AccountRepository } from '../../../repositories/account-repository';
import type { DebtRepository } from '../../../repositories/debt-repository';
import type { TransactionService } from '../../transactions/services/transaction-service';
import { DebtService } from './debt-service';

function memoryRepos() {
  const accounts: AccountRecord[] = [];
  const debts: DebtRecord[] = [];
  const repayments: DebtRepaymentRecord[] = [];

  const debtRepo = {
    async list(includeInactive = false) {
      return debts.filter(
        (d) => !d.deletedAt && (includeInactive || d.status === DebtStatus.ACTIVE),
      );
    },
    async getById(id: string) {
      return debts.find((d) => d.id === id && !d.deletedAt) ?? null;
    },
    async insert(record: DebtRecord) {
      debts.push(record);
    },
    async update(record: DebtRecord) {
      const idx = debts.findIndex((d) => d.id === record.id);
      if (idx >= 0) debts[idx] = record;
    },
    async listRepayments(debtId: string) {
      return repayments.filter((r) => r.debtId === debtId && !r.deletedAt);
    },
    async insertRepayment(record: DebtRepaymentRecord) {
      repayments.push(record);
    },
  };

  const accountRepo = {
    async getById(id: string) {
      return accounts.find((a) => a.id === id && !a.deletedAt) ?? null;
    },
  };

  const mockTxService = {
    createEntry: jest.fn().mockResolvedValue({ id: 'tx-1' }),
    createTransfer: jest.fn(),
  };

  return {
    accounts,
    debts,
    repayments,
    mockTxService,
    service: new DebtService(
      debtRepo as unknown as DebtRepository,
      accountRepo as unknown as AccountRepository,
      mockTxService as unknown as TransactionService,
    ),
  };
}

describe('DebtService', () => {
  it('creates a lent obligation and records partial and full repayments', async () => {
    const { accounts, debts, service, mockTxService } = memoryRepos();
    accounts.push({
      id: 'acc-1',
      name: 'Cash',
      type: AccountType.CASH,
      currency: 'BDT',
      openingBalance: '10000.00',
      openingBalanceDate: '2026-01-01',
      isArchived: false,
      displayOrder: 0,
      institutionName: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      deletedAt: null,
    });

    const debt = await service.create({
      type: DebtType.LENT,
      personName: 'Karim',
      amount: '5000',
      currency: 'BDT',
      accountId: 'acc-1',
      dueDate: '2026-09-01',
    });

    expect(debt.personName).toBe('Karim');
    expect(debt.amount).toBe('5000.00');
    expect(mockTxService.createEntry).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'EXPENSE', amount: '5000.00' }),
    );

    // Record partial repayment of 2000
    await service.recordRepayment(debt.id, {
      amount: '2000',
      accountId: 'acc-1',
    });

    const [summaryAfterPartial] = await service.summaries(new Date('2026-08-15'));
    expect(summaryAfterPartial?.totalRepaid).toBe('2000.00');
    expect(summaryAfterPartial?.remainingAmount).toBe('3000.00');
    expect(summaryAfterPartial?.progressPercent).toBe(40);
    expect(summaryAfterPartial?.debt.status).toBe(DebtStatus.ACTIVE);

    // Record final repayment of 3000
    await service.recordRepayment(debt.id, {
      amount: '3000',
      accountId: 'acc-1',
    });

    const storedDebt = debts.find((d) => d.id === debt.id);
    expect(storedDebt?.status).toBe(DebtStatus.REPAID);
  });

  it('supports optional email and email reminder configuration', async () => {
    const { service } = memoryRepos();

    // 1. Optional email (none provided)
    const debt1 = await service.create({
      type: DebtType.LENT,
      personName: 'Tanvir',
      amount: '1500',
      currency: 'BDT',
    });
    expect(debt1.email).toBeNull();
    expect(debt1.emailReminderEnabled).toBe(false);

    // 2. Valid email with email reminder enabled
    const debt2 = await service.create({
      type: DebtType.LENT,
      personName: 'Rahim',
      amount: '6000',
      currency: 'BDT',
      dueDate: '2026-09-20',
      email: 'rahim@example.com',
      emailReminderEnabled: true,
    });
    expect(debt2.email).toBe('rahim@example.com');
    expect(debt2.emailReminderEnabled).toBe(true);

    // 3. Reject invalid email when email reminder is enabled
    await expect(
      service.create({
        type: DebtType.LENT,
        personName: 'Karim',
        amount: '2000',
        currency: 'BDT',
        email: 'invalid-email-address',
        emailReminderEnabled: true,
      }),
    ).rejects.toThrow(/Valid recipient email/);
  });
});

