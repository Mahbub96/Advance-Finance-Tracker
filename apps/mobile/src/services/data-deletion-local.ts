import {
  DataDeletionScope,
  type DeletionPreviewCounts,
  type SyncEntityType,
} from '@personal-finance/types';
import type { SQLiteBindValue, SQLiteDatabase } from 'expo-sqlite';

export type DateRange = {
  start: string;
  end: string;
};

export type LocalDeletionTombstone = {
  entityType: SyncEntityType;
  entityId: string;
};

export function getCurrentMonthRange(now = new Date()): DateRange {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return {
    start: `${year}-${month}-01`,
    end: `${year}-${month}-31`,
  };
}

export function getCurrentYearRange(now = new Date()): DateRange {
  const year = now.getFullYear();
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`,
  };
}

export function emptyDeletionCounts(): DeletionPreviewCounts {
  return {
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
}

export function getAllRecordsDeleteStatements(): string[] {
  return [
    'UPDATE transactions SET deleted_at = ?, updated_at = ? WHERE deleted_at IS NULL',
    'UPDATE goal_contributions SET deleted_at = ?, updated_at = ? WHERE deleted_at IS NULL',
    'UPDATE debt_repayments SET deleted_at = ?, updated_at = ? WHERE deleted_at IS NULL',
    'UPDATE recurring_rules SET deleted_at = ?, updated_at = ? WHERE deleted_at IS NULL',
    'UPDATE budgets SET deleted_at = ?, updated_at = ? WHERE deleted_at IS NULL',
    'UPDATE goals SET deleted_at = ?, updated_at = ? WHERE deleted_at IS NULL',
    'UPDATE debts SET deleted_at = ?, updated_at = ? WHERE deleted_at IS NULL',
    'UPDATE accounts SET deleted_at = ?, updated_at = ? WHERE deleted_at IS NULL',
  ];
}

async function countRows(
  db: SQLiteDatabase,
  sql: string,
  params: SQLiteBindValue[] = [],
): Promise<number> {
  const rows = await db.getAllAsync<{ id: string }>(sql, params);
  return rows.length;
}

async function collectTombstones(
  db: SQLiteDatabase,
  entityType: SyncEntityType,
  sql: string,
  params: SQLiteBindValue[] = [],
): Promise<LocalDeletionTombstone[]> {
  const rows = await db.getAllAsync<{ id: string }>(sql, params);
  return rows.map((row) => ({
    entityType,
    entityId: row.id,
  }));
}

export async function getLocalDeletionTombstones(
  db: SQLiteDatabase,
  scope: DataDeletionScope,
  now = new Date(),
): Promise<LocalDeletionTombstone[]> {
  if (scope === DataDeletionScope.ALL_DATA) {
    const groups = await Promise.all([
      collectTombstones(db, 'TRANSACTION', 'SELECT id FROM transactions WHERE deleted_at IS NULL'),
      collectTombstones(db, 'BUDGET', 'SELECT id FROM budgets WHERE deleted_at IS NULL'),
      collectTombstones(db, 'GOAL', 'SELECT id FROM goals WHERE deleted_at IS NULL'),
      collectTombstones(db, 'DEBT', 'SELECT id FROM debts WHERE deleted_at IS NULL'),
      collectTombstones(db, 'RECURRING_RULE', 'SELECT id FROM recurring_rules WHERE deleted_at IS NULL'),
      collectTombstones(db, 'ACCOUNT', 'SELECT id FROM accounts WHERE deleted_at IS NULL'),
    ]);

    return groups.flat();
  }

  const range =
    scope === DataDeletionScope.CURRENT_MONTH ? getCurrentMonthRange(now) : getCurrentYearRange(now);

  const groups = await Promise.all([
    collectTombstones(
      db,
      'TRANSACTION',
      'SELECT id FROM transactions WHERE transaction_date >= ? AND transaction_date <= ? AND deleted_at IS NULL',
      [range.start, range.end],
    ),
    collectTombstones(
      db,
      'DEBT',
      'SELECT id FROM debts WHERE issue_date >= ? AND issue_date <= ? AND deleted_at IS NULL',
      [range.start, range.end],
    ),
  ]);

  return groups.flat();
}

export async function computeLocalDeletionPreview(
  db: SQLiteDatabase,
  scope: DataDeletionScope,
  now = new Date(),
): Promise<{ counts: DeletionPreviewCounts; periodText: string }> {
  const counts = emptyDeletionCounts();

  if (scope === DataDeletionScope.ALL_DATA) {
    const [
      transactions,
      accounts,
      budgets,
      goals,
      debts,
      debtRepayments,
      recurringRules,
    ] = await Promise.all([
      countRows(db, 'SELECT id FROM transactions WHERE deleted_at IS NULL'),
      countRows(db, 'SELECT id FROM accounts WHERE deleted_at IS NULL'),
      countRows(db, 'SELECT id FROM budgets WHERE deleted_at IS NULL'),
      countRows(db, 'SELECT id FROM goals WHERE deleted_at IS NULL'),
      countRows(db, 'SELECT id FROM debts WHERE deleted_at IS NULL'),
      countRows(db, 'SELECT id FROM debt_repayments WHERE deleted_at IS NULL'),
      countRows(db, 'SELECT id FROM recurring_rules WHERE deleted_at IS NULL'),
    ]);

    return {
      counts: {
        ...counts,
        transactions,
        accounts,
        budgets,
        goals,
        debts,
        debtRepayments,
        recurringRules,
      },
      periodText: 'All local financial records',
    };
  }

  const range =
    scope === DataDeletionScope.CURRENT_MONTH ? getCurrentMonthRange(now) : getCurrentYearRange(now);

  const [transactions, debts, debtRepayments] = await Promise.all([
    countRows(
      db,
      'SELECT id FROM transactions WHERE transaction_date >= ? AND transaction_date <= ? AND deleted_at IS NULL',
      [range.start, range.end],
    ),
    countRows(
      db,
      'SELECT id FROM debts WHERE issue_date >= ? AND issue_date <= ? AND deleted_at IS NULL',
      [range.start, range.end],
    ),
    countRows(
      db,
      'SELECT id FROM debt_repayments WHERE repayment_date >= ? AND repayment_date <= ? AND deleted_at IS NULL',
      [range.start, range.end],
    ),
  ]);

  return {
    counts: {
      ...counts,
      transactions,
      debts,
      debtRepayments,
    },
    periodText: `${range.start} → ${range.end}`,
  };
}

export async function executeLocalDataDeletion(
  db: SQLiteDatabase,
  scope: DataDeletionScope,
  now = new Date(),
): Promise<void> {
  const timestamp = now.toISOString();

  if (scope === DataDeletionScope.ALL_DATA) {
    for (const sql of getAllRecordsDeleteStatements()) {
      await db.runAsync(sql, [timestamp, timestamp]);
    }
    return;
  }

  const range =
    scope === DataDeletionScope.CURRENT_MONTH ? getCurrentMonthRange(now) : getCurrentYearRange(now);

  await db.runAsync(
    'UPDATE transactions SET deleted_at = ?, updated_at = ? WHERE transaction_date >= ? AND transaction_date <= ? AND deleted_at IS NULL',
    [timestamp, timestamp, range.start, range.end],
  );
  await db.runAsync(
    'UPDATE debt_repayments SET deleted_at = ?, updated_at = ? WHERE repayment_date >= ? AND repayment_date <= ? AND deleted_at IS NULL',
    [timestamp, timestamp, range.start, range.end],
  );
  await db.runAsync(
    'UPDATE debts SET deleted_at = ?, updated_at = ? WHERE issue_date >= ? AND issue_date <= ? AND deleted_at IS NULL',
    [timestamp, timestamp, range.start, range.end],
  );
}
