import { DataDeletionScope } from '@personal-finance/types';
import {
  computeLocalDeletionPreview,
  executeLocalDataDeletion,
  getAllRecordsDeleteStatements,
  getLocalDeletionTombstones,
} from './data-deletion-local';

function createMockDb(countsBySql: Record<string, number> = {}) {
  return {
    getAllAsync: jest.fn(async (sql: string, _params?: unknown[]) => {
      const count = countsBySql[sql] ?? 0;
      return Array.from({ length: count }, (_, index) => ({ id: `row-${index}` }));
    }),
    runAsync: jest.fn(async (_sql: string, _params?: unknown[]) => undefined),
  };
}

describe('data-deletion-local', () => {
  it('deletes child tables before parent tables for all records', async () => {
    const db = createMockDb();

    await executeLocalDataDeletion(db as never, DataDeletionScope.ALL_DATA);

    expect(db.runAsync.mock.calls.map((call) => call[0])).toEqual([
      'DELETE FROM transactions',
      'DELETE FROM goal_contributions',
      'DELETE FROM debt_repayments',
      'DELETE FROM recurring_rules',
      'DELETE FROM budgets',
      'DELETE FROM goals',
      'DELETE FROM debts',
      'DELETE FROM accounts',
    ]);

    expect(getAllRecordsDeleteStatements().at(-1)).toBe('DELETE FROM accounts');
  });

  it('includes child tables in all-record local preview counts', async () => {
    const db = createMockDb({
      'SELECT id FROM transactions WHERE deleted_at IS NULL': 2,
      'SELECT id FROM accounts WHERE deleted_at IS NULL': 3,
      'SELECT id FROM budgets WHERE deleted_at IS NULL': 4,
      'SELECT id FROM goals WHERE deleted_at IS NULL': 5,
      'SELECT id FROM debts WHERE deleted_at IS NULL': 6,
      'SELECT id FROM debt_repayments WHERE deleted_at IS NULL': 7,
      'SELECT id FROM recurring_rules WHERE deleted_at IS NULL': 8,
    });

    const preview = await computeLocalDeletionPreview(db as never, DataDeletionScope.ALL_DATA);

    expect(preview.counts).toMatchObject({
      transactions: 2,
      accounts: 3,
      budgets: 4,
      goals: 5,
      debts: 6,
      debtRepayments: 7,
      recurringRules: 8,
    });
    expect(preview.periodText).toBe('All local financial records');
  });

  it('collects cloud tombstones for all synced top-level finance records', async () => {
    const db = createMockDb({
      'SELECT id FROM transactions WHERE deleted_at IS NULL': 2,
      'SELECT id FROM accounts WHERE deleted_at IS NULL': 1,
      'SELECT id FROM budgets WHERE deleted_at IS NULL': 1,
      'SELECT id FROM goals WHERE deleted_at IS NULL': 1,
      'SELECT id FROM debts WHERE deleted_at IS NULL': 1,
      'SELECT id FROM recurring_rules WHERE deleted_at IS NULL': 1,
    });

    const tombstones = await getLocalDeletionTombstones(db as never, DataDeletionScope.ALL_DATA);

    expect(tombstones).toEqual([
      { entityType: 'TRANSACTION', entityId: 'row-0' },
      { entityType: 'TRANSACTION', entityId: 'row-1' },
      { entityType: 'BUDGET', entityId: 'row-0' },
      { entityType: 'GOAL', entityId: 'row-0' },
      { entityType: 'DEBT', entityId: 'row-0' },
      { entityType: 'RECURRING_RULE', entityId: 'row-0' },
      { entityType: 'ACCOUNT', entityId: 'row-0' },
    ]);
  });

  it('collects only dated cloud tombstones for period scopes', async () => {
    const db = createMockDb({
      'SELECT id FROM transactions WHERE transaction_date >= ? AND transaction_date <= ? AND deleted_at IS NULL': 1,
      'SELECT id FROM debts WHERE issue_date >= ? AND issue_date <= ? AND deleted_at IS NULL': 1,
    });
    const now = new Date(2026, 7, 15);

    const tombstones = await getLocalDeletionTombstones(
      db as never,
      DataDeletionScope.CURRENT_MONTH,
      now,
    );

    expect(tombstones).toEqual([
      { entityType: 'TRANSACTION', entityId: 'row-0' },
      { entityType: 'DEBT', entityId: 'row-0' },
    ]);
    expect(db.getAllAsync).toHaveBeenCalledWith(
      'SELECT id FROM transactions WHERE transaction_date >= ? AND transaction_date <= ? AND deleted_at IS NULL',
      ['2026-08-01', '2026-08-31'],
    );
  });

  it('deletes dated child rows for period scopes', async () => {
    const db = createMockDb();
    const now = new Date(2026, 7, 15);

    await executeLocalDataDeletion(db as never, DataDeletionScope.CURRENT_MONTH, now);

    expect(db.runAsync).toHaveBeenCalledWith(
      'DELETE FROM transactions WHERE transaction_date >= ? AND transaction_date <= ?',
      ['2026-08-01', '2026-08-31'],
    );
    expect(db.runAsync).toHaveBeenCalledWith(
      'DELETE FROM debt_repayments WHERE repayment_date >= ? AND repayment_date <= ?',
      ['2026-08-01', '2026-08-31'],
    );
    expect(db.runAsync).toHaveBeenCalledWith(
      'DELETE FROM debts WHERE issue_date >= ? AND issue_date <= ?',
      ['2026-08-01', '2026-08-31'],
    );
  });
});
