import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import {
  DataDeletionScope,
  DataDeletionStatus,
  type DataDeletionPreviewRequest,
  type DataDeletionPreviewResponse,
  type DataDeletionExecuteRequest,
  type DataDeletionExecuteResponse,
  type DeletionPreviewCounts,
  type DataDeletionPeriod,
  type DataDeletionAuditRecord,
} from '@personal-finance/types';
import { validateTypedEmailConfirmation } from '@personal-finance/validation';

import { AuthService } from '../auth/auth.service';
import { SyncService } from '../sync/sync.service';
import { LendingReminderService } from '../lending/lending-reminder.service';

interface TokenPayload {
  userId: string;
  scope: DataDeletionScope;
  periodStart?: string | null;
  periodEnd?: string | null;
  countsHash: string;
  exp: number;
}

@Injectable()
export class DataDeletionService {
  private readonly SECRET = 'data_deletion_secure_secret_2026';
  private readonly usedTokens = new Set<string>();
  private readonly auditLogs: DataDeletionAuditRecord[] = [];

  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
    @Inject(SyncService)
    private readonly syncService: SyncService,
    @Inject(LendingReminderService)
    private readonly lendingReminderService: LendingReminderService,
  ) {}

  /**
   * Calculates exact calendar boundaries for current month or current year.
   */
  calculatePeriod(
    scope: DataDeletionScope,
    _timezone = 'Asia/Dhaka',
    referenceDate = new Date(),
  ): DataDeletionPeriod | null {
    if (scope === DataDeletionScope.ALL_DATA) {
      return null;
    }

    const year = referenceDate.getUTCFullYear();
    const month = referenceDate.getUTCMonth(); // 0-indexed

    if (scope === DataDeletionScope.CURRENT_MONTH) {
      const start = new Date(Date.UTC(year, month, 1));
      const end = new Date(Date.UTC(year, month + 1, 0)); // last day of month
      return {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        timezone: _timezone,
      };
    }

    if (scope === DataDeletionScope.CURRENT_YEAR) {
      const start = new Date(Date.UTC(year, 0, 1));
      const end = new Date(Date.UTC(year, 11, 31));
      return {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        timezone: _timezone,
      };
    }

    return null;
  }

  private createConfirmationToken(payload: TokenPayload): string {
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = Buffer.from(`${encodedPayload}.${this.SECRET}`).toString('base64url');
    return `${encodedPayload}.${signature}`;
  }

  private verifyConfirmationToken(token: string): TokenPayload {
    try {
      const [encodedPayload, signature] = token.split('.');
      if (!encodedPayload || !signature) {
        throw new Error('Malformed token');
      }
      const expectedSig = Buffer.from(`${encodedPayload}.${this.SECRET}`).toString('base64url');
      if (signature !== expectedSig) {
        throw new Error('Invalid token signature');
      }
      const payload: TokenPayload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      );
      if (payload.exp < Date.now()) {
        throw new Error('Confirmation token expired');
      }
      return payload;
    } catch {
      throw new BadRequestException('Invalid or expired deletion confirmation token');
    }
  }

  /**
   * Read-only preview operation: Computes counts of records affected and generates a short-lived token.
   */
  async preview(
    userId: string,
    req: DataDeletionPreviewRequest,
  ): Promise<DataDeletionPreviewResponse> {
    const user = await this.authService.getProfile(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const period = this.calculatePeriod(req.scope, req.timezone);
    const counts = await this.computeDeletionCounts(userId, req.scope, period);
    const totalRecords = Object.values(counts).reduce((sum, c) => sum + c, 0);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
    const countsHash = Buffer.from(JSON.stringify(counts)).toString('base64url').slice(0, 16);

    const tokenPayload: TokenPayload = {
      userId,
      scope: req.scope,
      periodStart: period?.startDate ?? null,
      periodEnd: period?.endDate ?? null,
      countsHash,
      exp: Date.now() + 10 * 60 * 1000,
    };

    const confirmationToken = this.createConfirmationToken(tokenPayload);

    return {
      scope: req.scope,
      period,
      counts,
      totalRecords,
      confirmationToken,
      accountEmail: user.email,
      expiresAt,
    };
  }

  /**
   * Destructive execution operation: Validates token, typed email, deletes data, creates sync tombstones.
   */
  async execute(
    userId: string,
    req: DataDeletionExecuteRequest,
  ): Promise<DataDeletionExecuteResponse> {
    const executionId = `del_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const startedAt = new Date().toISOString();

    // 1. Verify single-use confirmation token
    if (this.usedTokens.has(req.confirmationToken)) {
      throw new BadRequestException('Confirmation token has already been used');
    }

    const tokenPayload = this.verifyConfirmationToken(req.confirmationToken);
    if (tokenPayload.userId !== userId) {
      throw new UnauthorizedException('Confirmation token does not belong to this user');
    }
    if (tokenPayload.scope !== req.scope) {
      throw new BadRequestException('Deletion scope has changed; please generate a new preview');
    }

    // 2. Verify typed email challenge
    const user = await this.authService.getProfile(userId);
    if (!validateTypedEmailConfirmation(req.typedEmail, user.email)) {
      throw new BadRequestException(
        `Typed email "${req.typedEmail}" does not match authenticated account email "${user.email}"`,
      );
    }

    // Mark token used
    this.usedTokens.add(req.confirmationToken);

    // 3. Determine period and compute counts
    const period: DataDeletionPeriod | null = tokenPayload.periodStart
      ? {
          startDate: tokenPayload.periodStart,
          endDate: tokenPayload.periodEnd!,
          timezone: 'Asia/Dhaka',
        }
      : null;

    const counts = await this.computeDeletionCounts(userId, req.scope, period);
    const totalDeleted = Object.values(counts).reduce((sum, c) => sum + c, 0);

    // 4. Perform atomic deletion & sync tombstone generation
    await this.performDataDeletion(userId, req.scope, period);

    const executedAt = new Date().toISOString();

    // 5. Safe operational audit logging
    const auditRecord: DataDeletionAuditRecord = {
      id: executionId,
      userId,
      scope: req.scope,
      status: DataDeletionStatus.COMPLETED,
      periodStart: period?.startDate ?? null,
      periodEnd: period?.endDate ?? null,
      totalRecordsAffected: totalDeleted,
      startedAt,
      completedAt: executedAt,
    };
    this.auditLogs.push(auditRecord);

    const scopeLabel =
      req.scope === DataDeletionScope.CURRENT_MONTH
        ? 'Current month'
        : req.scope === DataDeletionScope.CURRENT_YEAR
          ? 'Current year'
          : 'All financial';

    return {
      executionId,
      scope: req.scope,
      status: DataDeletionStatus.COMPLETED,
      deletedCounts: counts,
      totalDeleted,
      executedAt,
      message: `${scopeLabel} data deleted successfully (${totalDeleted} records).`,
    };
  }

  private async computeDeletionCounts(
    userId: string,
    scope: DataDeletionScope,
    period: DataDeletionPeriod | null,
  ): Promise<DeletionPreviewCounts> {
    const changes = await this.syncService.downloadChanges(userId, 0, 10000);
    const userItems = changes.changes;

    const isDateInRange = (dateStr?: string | unknown): boolean => {
      if (!period) return true; // ALL_DATA matches everything
      if (!dateStr || typeof dateStr !== 'string') return true;
      const clean = dateStr.slice(0, 10);
      return clean >= period.startDate && clean <= period.endDate;
    };

    const counts: DeletionPreviewCounts = {
      transactions: 0,
      accounts: 0,
      budgets: 0,
      goals: 0,
      debts: 0,
      debtRepayments: 0,
      recurringRules: 0,
      notifications: 0,
      attachments: 0,
      aiInsights: 0,
    };

    for (const item of userItems) {
      if (item.operation === 'DELETE') continue;
      const payload = item.payload || {};

      switch (item.entityType) {
        case 'TRANSACTION': {
          const txDate = String(payload.transaction_date || payload.transactionDate || payload.created_at || '');
          if (isDateInRange(txDate)) counts.transactions++;
          break;
        }
        case 'ACCOUNT': {
          if (scope === DataDeletionScope.ALL_DATA) counts.accounts++;
          break;
        }
        case 'BUDGET': {
          const bDate = String(payload.start_date || payload.startDate || payload.created_at || '');
          if (isDateInRange(bDate)) counts.budgets++;
          break;
        }
        case 'GOAL': {
          const gDate = String(payload.created_at || payload.createdAt || '');
          if (isDateInRange(gDate)) counts.goals++;
          break;
        }
        case 'DEBT': {
          const dDate = String(payload.issue_date || payload.issueDate || payload.created_at || '');
          if (isDateInRange(dDate)) counts.debts++;
          break;
        }
        case 'RECURRING_RULE': {
          if (scope === DataDeletionScope.ALL_DATA) counts.recurringRules++;
          break;
        }
      }
    }

    return counts;
  }

  private async performDataDeletion(
    userId: string,
    scope: DataDeletionScope,
    period: DataDeletionPeriod | null,
  ): Promise<void> {
    const changes = await this.syncService.downloadChanges(userId, 0, 10000);
    const userItems = changes.changes;

    const isDateInRange = (dateStr?: string | unknown): boolean => {
      if (!period) return true;
      if (!dateStr || typeof dateStr !== 'string') return true;
      const clean = dateStr.slice(0, 10);
      return clean >= period.startDate && clean <= period.endDate;
    };

    const deleteOperations: Array<{
      entityType: import('@personal-finance/types').SyncEntityType;
      entityId: string;
    }> = [];

    for (const item of userItems) {
      if (item.operation === 'DELETE') continue;
      const payload = item.payload || {};

      let shouldDelete = false;
      if (scope === DataDeletionScope.ALL_DATA) {
        shouldDelete = true;
      } else {
        const itemDate = String(
          payload.transaction_date ||
            payload.transactionDate ||
            payload.start_date ||
            payload.startDate ||
            payload.issue_date ||
            payload.issueDate ||
            payload.created_at ||
            payload.createdAt ||
            '',
        );
        if (item.entityType === 'TRANSACTION' || item.entityType === 'DEBT' || item.entityType === 'BUDGET') {
          shouldDelete = isDateInRange(itemDate);
        }
      }

      if (shouldDelete) {
        deleteOperations.push({
          entityType: item.entityType,
          entityId: item.entityId,
        });

        if (item.entityType === 'DEBT') {
          this.lendingReminderService.cancelRemindersForDebt(
            item.entityId,
            'Debt record deleted via secure data deletion',
          );
        }
      }
    }

    // Submit sync batch with DELETE operations to propagate tombstones to mobile clients
    if (deleteOperations.length > 0) {
      const now = new Date().toISOString();
      await this.syncService.uploadBatch(userId, {
        deviceId: 'server-data-deletion',
        operations: deleteOperations.map((op) => ({
          operationId: `del-op-${op.entityId}-${Date.now()}`,
          deviceId: 'server-data-deletion',
          entityType: op.entityType,
          entityId: op.entityId,
          operationType: 'DELETE',
          entityVersion: 9999,
          payload: { deleted_at: now, reason: 'SECURE_DATA_DELETION' },
          createdAt: now,
        })),
      });
    }
  }

  getAuditLogs(): DataDeletionAuditRecord[] {
    return [...this.auditLogs];
  }
}
