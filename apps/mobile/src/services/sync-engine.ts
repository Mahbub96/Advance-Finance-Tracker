import type { SQLiteDatabase } from 'expo-sqlite';
import type { ApiClient } from '@personal-finance/api-client';
import type {
  SyncOperationRecord,
  SyncChangeItem,
  SyncEntityType,
} from '@personal-finance/types';
import { AuthRepository } from '../repositories/auth-repository';

export interface SyncSummary {
  uploaded: number;
  downloaded: number;
  latestRevision: number;
  success: boolean;
  error?: string;
}

export class SyncEngine {
  private authRepo: AuthRepository;

  constructor(
    private readonly db: SQLiteDatabase,
    private readonly apiClient: ApiClient,
  ) {
    this.authRepo = new AuthRepository(db);
  }

  /**
   * Run full bidirectional synchronization (Push local changes + Pull remote changes).
   */
  async sync(): Promise<SyncSummary> {
    const session = await this.authRepo.getSession();
    let uploadedCount = 0;
    let downloadedCount = 0;
    let latestRevision = session?.lastSyncedRevision ?? 0;

    try {
      // 1. PUSH: Upload local records
      const operations = await this.collectLocalOperations();
      if (operations.length > 0) {
        const uploadRes = await this.apiClient.sync.uploadBatch({
          deviceId: session?.userId ? `device-${session.userId.slice(0, 8)}` : 'mobile-client',
          operations,
        });
        uploadedCount = uploadRes.processed;
        if (uploadRes.latestRevision > latestRevision) {
          latestRevision = uploadRes.latestRevision;
        }
      }

      // 2. PULL: Download remote delta changes
      const downloadRes = await this.apiClient.sync.download(session?.lastSyncedRevision ?? 0, 200);
      if (downloadRes && downloadRes.changes && downloadRes.changes.length > 0) {
        for (const change of downloadRes.changes) {
          await this.applyRemoteChange(change);
          downloadedCount++;
        }
        latestRevision = Math.max(latestRevision, downloadRes.latestRevision);
      }

      // 3. Save latest revision bookmark
      await this.authRepo.updateLastSyncedRevision(latestRevision);

      return {
        uploaded: uploadedCount,
        downloaded: downloadedCount,
        latestRevision,
        success: true,
      };
    } catch (err: unknown) {
      return {
        uploaded: uploadedCount,
        downloaded: downloadedCount,
        latestRevision,
        success: false,
        error: err instanceof Error ? err.message : 'Sync failed',
      };
    }
  }

  /**
   * Collects local active data to construct sync operations payload.
   */
  private async collectLocalOperations(): Promise<SyncOperationRecord[]> {
    const ops: SyncOperationRecord[] = [];
    const now = new Date().toISOString();

    // Accounts
    const accounts = await this.db.getAllAsync<Record<string, unknown>>('SELECT * FROM accounts');
    for (const acc of accounts) {
      ops.push({
        operationId: `op-acc-${acc.id}-${acc.updated_at || now}`,
        deviceId: 'mobile-client',
        entityType: 'ACCOUNT',
        entityId: String(acc.id),
        operationType: acc.deleted_at ? 'DELETE' : 'CREATE',
        entityVersion: 1,
        payload: acc,
        createdAt: String(acc.updated_at || now),
      });
    }

    // Transactions
    const txs = await this.db.getAllAsync<Record<string, unknown>>('SELECT * FROM transactions');
    for (const tx of txs) {
      ops.push({
        operationId: `op-tx-${tx.id}-${tx.updated_at || now}`,
        deviceId: 'mobile-client',
        entityType: 'TRANSACTION',
        entityId: String(tx.id),
        operationType: tx.deleted_at ? 'DELETE' : 'CREATE',
        entityVersion: 1,
        payload: tx,
        createdAt: String(tx.updated_at || now),
      });
    }

    // Budgets
    const budgets = await this.db.getAllAsync<Record<string, unknown>>('SELECT * FROM budgets');
    for (const b of budgets) {
      ops.push({
        operationId: `op-bg-${b.id}-${b.updated_at || now}`,
        deviceId: 'mobile-client',
        entityType: 'BUDGET',
        entityId: String(b.id),
        operationType: b.deleted_at ? 'DELETE' : 'CREATE',
        entityVersion: 1,
        payload: b,
        createdAt: String(b.updated_at || now),
      });
    }

    // Debts
    const debts = await this.db.getAllAsync<Record<string, unknown>>('SELECT * FROM debts');
    for (const d of debts) {
      ops.push({
        operationId: `op-db-${d.id}-${d.updated_at || now}`,
        deviceId: 'mobile-client',
        entityType: 'DEBT',
        entityId: String(d.id),
        operationType: d.deleted_at ? 'DELETE' : 'CREATE',
        entityVersion: 1,
        payload: d,
        createdAt: String(d.updated_at || now),
      });
    }

    // Goals
    const goals = await this.db.getAllAsync<Record<string, unknown>>('SELECT * FROM goals');
    for (const g of goals) {
      ops.push({
        operationId: `op-gl-${g.id}-${g.updated_at || now}`,
        deviceId: 'mobile-client',
        entityType: 'GOAL',
        entityId: String(g.id),
        operationType: g.deleted_at ? 'DELETE' : 'CREATE',
        entityVersion: 1,
        payload: g,
        createdAt: String(g.updated_at || now),
      });
    }

    return ops;
  }

  /**
   * Applies an incoming remote change item to the local SQLite database.
   */
  private async applyRemoteChange(change: SyncChangeItem): Promise<void> {
    const { entityType, entityId, operation, payload } = change;

    if (operation === 'DELETE') {
      const table = this.resolveTable(entityType);
      if (table) {
        await this.db.runAsync(
          `UPDATE ${table} SET deleted_at = ? WHERE id = ?`,
          [new Date().toISOString(), entityId],
        );
      }
      return;
    }

    if (entityType === 'TRANSACTION') {
      const type = String(payload.type ?? 'EXPENSE');
      const accountId = String(payload.account_id ?? payload.accountId ?? '');
      const categoryId = payload.category_id || payload.categoryId ? String(payload.category_id || payload.categoryId) : null;
      const merchantName = payload.merchant_name || payload.merchantName ? String(payload.merchant_name || payload.merchantName) : null;
      const amount = String(payload.amount ?? '0.00');
      const currency = String(payload.currency ?? 'BDT');
      const txDate = String(payload.transaction_date ?? payload.transactionDate ?? new Date().toISOString().slice(0, 10));
      const note = payload.note ? String(payload.note) : null;
      const source = String(payload.source ?? 'SYNC');
      const transferLeg = payload.transfer_leg || payload.transferLeg ? String(payload.transfer_leg || payload.transferLeg) : null;
      const transferGroupId = payload.transfer_group_id || payload.transferGroupId ? String(payload.transfer_group_id || payload.transferGroupId) : null;
      const isCleared = payload.is_cleared ? 1 : 0;
      const createdAt = String(payload.created_at ?? payload.createdAt ?? new Date().toISOString());
      const updatedAt = String(payload.updated_at ?? payload.updatedAt ?? new Date().toISOString());
      const deletedAt = payload.deleted_at || payload.deletedAt ? String(payload.deleted_at || payload.deletedAt) : null;

      await this.db.runAsync(
        `INSERT INTO transactions (
          id, type, account_id, category_id, merchant_name, amount, currency,
          transaction_date, note, source, transfer_leg, transfer_group_id,
          is_cleared, created_at, updated_at, deleted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          type = excluded.type,
          account_id = excluded.account_id,
          category_id = excluded.category_id,
          merchant_name = excluded.merchant_name,
          amount = excluded.amount,
          currency = excluded.currency,
          transaction_date = excluded.transaction_date,
          note = excluded.note,
          source = excluded.source,
          transfer_leg = excluded.transfer_leg,
          transfer_group_id = excluded.transfer_group_id,
          is_cleared = excluded.is_cleared,
          updated_at = excluded.updated_at,
          deleted_at = excluded.deleted_at`,
        [
          entityId,
          type,
          accountId,
          categoryId,
          merchantName,
          amount,
          currency,
          txDate,
          note,
          source,
          transferLeg,
          transferGroupId,
          isCleared,
          createdAt,
          updatedAt,
          deletedAt,
        ],
      );
    } else if (entityType === 'ACCOUNT') {
      const name = String(payload.name ?? 'Account');
      const type = String(payload.type ?? 'CASH');
      const currency = String(payload.currency ?? 'BDT');
      const openingBalance = String(payload.opening_balance ?? payload.openingBalance ?? '0.00');
      const openingBalanceDate = String(payload.opening_balance_date ?? payload.openingBalanceDate ?? new Date().toISOString().slice(0, 10));
      const isArchived = payload.is_archived ? 1 : 0;
      const displayOrder = typeof payload.display_order === 'number' ? payload.display_order : 0;
      const institutionName = payload.institution_name || payload.institutionName ? String(payload.institution_name || payload.institutionName) : null;
      const createdAt = String(payload.created_at ?? payload.createdAt ?? new Date().toISOString());
      const updatedAt = String(payload.updated_at ?? payload.updatedAt ?? new Date().toISOString());
      const deletedAt = payload.deleted_at || payload.deletedAt ? String(payload.deleted_at || payload.deletedAt) : null;

      await this.db.runAsync(
        `INSERT INTO accounts (
          id, name, type, currency, opening_balance, opening_balance_date,
          is_archived, display_order, institution_name, created_at, updated_at, deleted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          type = excluded.type,
          currency = excluded.currency,
          opening_balance = excluded.opening_balance,
          opening_balance_date = excluded.opening_balance_date,
          is_archived = excluded.is_archived,
          display_order = excluded.display_order,
          institution_name = excluded.institution_name,
          updated_at = excluded.updated_at,
          deleted_at = excluded.deleted_at`,
        [
          entityId,
          name,
          type,
          currency,
          openingBalance,
          openingBalanceDate,
          isArchived,
          displayOrder,
          institutionName,
          createdAt,
          updatedAt,
          deletedAt,
        ],
      );
    }
  }

  private resolveTable(entityType: SyncEntityType): string | null {
    switch (entityType) {
      case 'TRANSACTION':
        return 'transactions';
      case 'ACCOUNT':
        return 'accounts';
      case 'CATEGORY':
        return 'categories';
      case 'BUDGET':
        return 'budgets';
      case 'DEBT':
        return 'debts';
      case 'GOAL':
        return 'goals';
      case 'RECURRING_RULE':
        return 'recurring_rules';
      default:
        return null;
    }
  }
}
