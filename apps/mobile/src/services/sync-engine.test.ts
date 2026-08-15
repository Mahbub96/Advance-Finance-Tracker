import { SyncEngine } from './sync-engine';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { ApiClient } from '@personal-finance/api-client';

describe('SyncEngine', () => {
  it('instantiates and executes delta sync lifecycle', async () => {
    const executedQueries: string[] = [];

    const mockDb = {
      getFirstAsync: jest.fn(async () => null),
      getAllAsync: jest.fn(async (sql: string) => {
        executedQueries.push(sql);
        if (sql.includes('FROM transactions')) {
          return [
            {
              id: 'tx-1',
              type: 'EXPENSE',
              account_id: 'acc-1',
              amount: '150.00',
              currency: 'BDT',
              transaction_date: '2026-08-15',
              updated_at: '2026-08-15T12:00:00Z',
            },
          ];
        }
        return [];
      }),
      runAsync: jest.fn(async (sql: string) => {
        executedQueries.push(sql);
        return { changes: 1, lastInsertRowId: 1 };
      }),
    } as unknown as SQLiteDatabase;

    const mockApiClient = {
      sync: {
        uploadBatch: jest.fn(async () => ({
          processed: 1,
          results: [{ operationId: 'op-1', status: 'ACKNOWLEDGED' as const }],
          latestRevision: 1050,
        })),
        download: jest.fn(async () => ({
          changes: [
            {
              revision: 1051,
              entityType: 'TRANSACTION' as const,
              entityId: 'tx-remote-2',
              operation: 'CREATE' as const,
              entityVersion: 1,
              payload: {
                id: 'tx-remote-2',
                type: 'INCOME',
                accountId: 'acc-1',
                amount: '5000.00',
                currency: 'BDT',
              },
              changedAt: '2026-08-15T12:05:00Z',
            },
          ],
          latestRevision: 1051,
          hasMore: false,
        })),
      },
    } as unknown as ApiClient;

    const engine = new SyncEngine(mockDb, mockApiClient);
    const result = await engine.sync();

    expect(result.success).toBe(true);
    expect(result.uploaded).toBe(1);
    expect(result.downloaded).toBe(1);
    expect(result.latestRevision).toBe(1051);

    expect(mockApiClient.sync.uploadBatch).toHaveBeenCalledTimes(1);
    expect(mockApiClient.sync.download).toHaveBeenCalledTimes(1);
  });
});
