import type { AccountType } from '@personal-finance/types';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { AccountRecord } from '../database/records';

type AccountRow = {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  opening_balance: string;
  opening_balance_date: string;
  is_archived: number;
  display_order: number;
  institution_name: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

function mapAccount(row: AccountRow): AccountRecord {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    currency: row.currency,
    openingBalance: row.opening_balance,
    openingBalanceDate: row.opening_balance_date,
    isArchived: row.is_archived === 1,
    displayOrder: row.display_order,
    institutionName: row.institution_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export class AccountRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async list(includeArchived = false): Promise<AccountRecord[]> {
    const sql = includeArchived
      ? 'SELECT * FROM accounts WHERE deleted_at IS NULL ORDER BY display_order, name'
      : 'SELECT * FROM accounts WHERE deleted_at IS NULL AND is_archived = 0 ORDER BY display_order, name';
    const rows = await this.db.getAllAsync<AccountRow>(sql);
    return rows.map(mapAccount);
  }

  async getById(id: string): Promise<AccountRecord | null> {
    const row = await this.db.getFirstAsync<AccountRow>(
      'SELECT * FROM accounts WHERE id = ? AND deleted_at IS NULL',
      [id],
    );
    return row ? mapAccount(row) : null;
  }

  async insert(record: AccountRecord): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO accounts (
        id, name, type, currency, opening_balance, opening_balance_date,
        is_archived, display_order, institution_name, created_at, updated_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        record.name,
        record.type,
        record.currency,
        record.openingBalance,
        record.openingBalanceDate,
        record.isArchived ? 1 : 0,
        record.displayOrder,
        record.institutionName,
        record.createdAt,
        record.updatedAt,
        record.deletedAt,
      ],
    );
  }

  async update(record: AccountRecord): Promise<void> {
    await this.db.runAsync(
      `UPDATE accounts SET
        name = ?, type = ?, currency = ?, opening_balance = ?, opening_balance_date = ?,
        is_archived = ?, display_order = ?, institution_name = ?, updated_at = ?, deleted_at = ?
      WHERE id = ?`,
      [
        record.name,
        record.type,
        record.currency,
        record.openingBalance,
        record.openingBalanceDate,
        record.isArchived ? 1 : 0,
        record.displayOrder,
        record.institutionName,
        record.updatedAt,
        record.deletedAt,
        record.id,
      ],
    );
  }

  async hasTransactions(accountId: string): Promise<boolean> {
    const row = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM transactions WHERE account_id = ? AND deleted_at IS NULL',
      [accountId],
    );
    return (row?.count ?? 0) > 0;
  }
}
