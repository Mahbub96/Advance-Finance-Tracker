import { DataDeletionScope, DataDeletionStatus } from '@personal-finance/types';
import { AuthService } from '../auth/auth.service';
import { SyncService } from '../sync/sync.service';
import { LendingReminderService } from '../lending/lending-reminder.service';
import { MockEmailProvider } from '../lending/email/mock-email.provider';
import { DataDeletionService } from './data-deletion.service';

describe('DataDeletionService', () => {
  let service: DataDeletionService;
  let authService: AuthService;
  let syncService: SyncService;
  let lendingReminderService: LendingReminderService;
  let userId: string;
  const userEmail = 'mahbub@example.com';

  beforeEach(async () => {
    authService = new AuthService();
    syncService = new SyncService();
    lendingReminderService = new LendingReminderService(new MockEmailProvider());
    service = new DataDeletionService(authService, syncService, lendingReminderService);

    const reg = await authService.register(userEmail, 'password123', 'Mahbub');
    userId = reg.user.id;

    // Seed some test data in sync service for this user
    await syncService.uploadBatch(userId, {
      deviceId: 'dev-1',
      operations: [
        {
          operationId: 'op-tx-1',
          deviceId: 'dev-1',
          entityType: 'TRANSACTION',
          entityId: 'tx-1',
          operationType: 'CREATE',
          entityVersion: 1,
          payload: {
            amount: '500.00',
            transaction_date: '2026-08-15',
          },
          createdAt: '2026-08-15T10:00:00Z',
        },
        {
          operationId: 'op-tx-2',
          deviceId: 'dev-1',
          entityType: 'TRANSACTION',
          entityId: 'tx-2',
          operationType: 'CREATE',
          entityVersion: 1,
          payload: {
            amount: '1200.00',
            transaction_date: '2026-05-10',
          },
          createdAt: '2026-05-10T10:00:00Z',
        },
        {
          operationId: 'op-db-1',
          deviceId: 'dev-1',
          entityType: 'DEBT',
          entityId: 'db-1',
          operationType: 'CREATE',
          entityVersion: 1,
          payload: {
            person_name: 'Rahim',
            amount: '6000.00',
            issue_date: '2026-08-01',
          },
          createdAt: '2026-08-01T10:00:00Z',
        },
      ],
    });
  });

  describe('preview', () => {
    it('generates a read-only preview with accurate counts and confirmation token', async () => {
      const preview = await service.preview(userId, {
        scope: DataDeletionScope.CURRENT_MONTH,
      });

      expect(preview.scope).toBe(DataDeletionScope.CURRENT_MONTH);
      expect(preview.accountEmail).toBe(userEmail);
      expect(preview.confirmationToken).toBeDefined();
      expect(preview.counts.transactions).toBe(1); // Only 2026-08-15
      expect(preview.counts.debts).toBe(1); // 2026-08-01
      expect(preview.totalRecords).toBe(2);
    });

    it('calculates full year scope counts accurately', async () => {
      const preview = await service.preview(userId, {
        scope: DataDeletionScope.CURRENT_YEAR,
      });

      expect(preview.counts.transactions).toBe(2); // Both Aug and May
      expect(preview.counts.debts).toBe(1);
    });
  });

  describe('execute', () => {
    it('executes deletion when typed email matches account email exactly', async () => {
      const preview = await service.preview(userId, {
        scope: DataDeletionScope.CURRENT_MONTH,
      });

      const res = await service.execute(userId, {
        scope: DataDeletionScope.CURRENT_MONTH,
        confirmationToken: preview.confirmationToken,
        typedEmail: userEmail,
      });

      expect(res.status).toBe(DataDeletionStatus.COMPLETED);
      expect(res.deletedCounts.transactions).toBe(1);
      expect(res.deletedCounts.debts).toBe(1);

      // Verify audit record logged
      const audits = service.getAuditLogs();
      expect(audits.length).toBe(1);
      expect(audits[0]!.scope).toBe(DataDeletionScope.CURRENT_MONTH);
    });


    it('rejects execution when typed email does not match authenticated account email', async () => {
      const preview = await service.preview(userId, {
        scope: DataDeletionScope.CURRENT_MONTH,
      });

      await expect(
        service.execute(userId, {
          scope: DataDeletionScope.CURRENT_MONTH,
          confirmationToken: preview.confirmationToken,
          typedEmail: 'wrong@example.com',
        }),
      ).rejects.toThrow(/does not match/);
    });

    it('rejects execution when confirmation token is reused', async () => {
      const preview = await service.preview(userId, {
        scope: DataDeletionScope.CURRENT_MONTH,
      });

      await service.execute(userId, {
        scope: DataDeletionScope.CURRENT_MONTH,
        confirmationToken: preview.confirmationToken,
        typedEmail: userEmail,
      });

      await expect(
        service.execute(userId, {
          scope: DataDeletionScope.CURRENT_MONTH,
          confirmationToken: preview.confirmationToken,
          typedEmail: userEmail,
        }),
      ).rejects.toThrow(/already been used/);
    });

    it('rejects execution when scope is altered after preview', async () => {
      const preview = await service.preview(userId, {
        scope: DataDeletionScope.CURRENT_MONTH,
      });

      await expect(
        service.execute(userId, {
          scope: DataDeletionScope.ALL_DATA, // Changed scope
          confirmationToken: preview.confirmationToken,
          typedEmail: userEmail,
        }),
      ).rejects.toThrow(/Deletion scope has changed/);
    });
  });
});
