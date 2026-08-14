import type { SQLiteDatabase } from 'expo-sqlite';
import type { TransactionRecord } from '../database/records';

type TransactionRow = {
  id: string;
  type: TransactionRecord['type'];
  account_id: string;
  category_id: string | null;
  merchant_name: string | null;
  amount: string;
  currency: string;
  transaction_date: string;
  note: string | null;
  source: string;
  status: string;
  transfer_group_id: string | null;
  transfer_leg: TransactionRecord['transferLeg'];
  original_transaction_id: string | null;
  adjustment_direction: TransactionRecord['adjustmentDirection'];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

function mapTransaction(row: TransactionRow): TransactionRecord {
  return {
    id: row.id,
    type: row.type,
    accountId: row.account_id,
    categoryId: row.category_id,
    merchantName: row.merchant_name,
    amount: row.amount,
    currency: row.currency,
    transactionDate: row.transaction_date,
    note: row.note,
    source: row.source,
    status: row.status,
    transferGroupId: row.transfer_group_id,
    transferLeg: row.transfer_leg,
    originalTransactionId: row.original_transaction_id,
    adjustmentDirection: row.adjustment_direction,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

const COLUMNS = `id, type, account_id, category_id, merchant_name, amount, currency,
  transaction_date, note, source, status, transfer_group_id, transfer_leg,
  original_transaction_id, adjustment_direction, created_at, updated_at, deleted_at`;

export class TransactionRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async list(limit = 100): Promise<TransactionRecord[]> {
    const rows = await this.db.getAllAsync<TransactionRow>(
      `SELECT ${COLUMNS} FROM transactions
       WHERE deleted_at IS NULL
       ORDER BY transaction_date DESC, created_at DESC
       LIMIT ?`,
      [limit],
    );
    return rows.map(mapTransaction);
  }

  async listByAccount(accountId: string): Promise<TransactionRecord[]> {
    const rows = await this.db.getAllAsync<TransactionRow>(
      `SELECT ${COLUMNS} FROM transactions
       WHERE account_id = ? AND deleted_at IS NULL
       ORDER BY transaction_date DESC, created_at DESC`,
      [accountId],
    );
    return rows.map(mapTransaction);
  }

  async listByDateRange(from: string, to: string): Promise<TransactionRecord[]> {
    const rows = await this.db.getAllAsync<TransactionRow>(
      `SELECT ${COLUMNS} FROM transactions
       WHERE deleted_at IS NULL AND transaction_date >= ? AND transaction_date <= ?
       ORDER BY transaction_date DESC, created_at DESC`,
      [from, to],
    );
    return rows.map(mapTransaction);
  }

  async getById(id: string): Promise<TransactionRecord | null> {
    const row = await this.db.getFirstAsync<TransactionRow>(
      `SELECT ${COLUMNS} FROM transactions WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );
    return row ? mapTransaction(row) : null;
  }

  async insert(record: TransactionRecord): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO transactions (
        id, type, account_id, category_id, merchant_name, amount, currency,
        transaction_date, note, source, status, transfer_group_id, transfer_leg,
        original_transaction_id, adjustment_direction, created_at, updated_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        record.type,
        record.accountId,
        record.categoryId,
        record.merchantName,
        record.amount,
        record.currency,
        record.transactionDate,
        record.note,
        record.source,
        record.status,
        record.transferGroupId,
        record.transferLeg,
        record.originalTransactionId,
        record.adjustmentDirection,
        record.createdAt,
        record.updatedAt,
        record.deletedAt,
      ],
    );
  }

  async update(record: TransactionRecord): Promise<void> {
    await this.db.runAsync(
      `UPDATE transactions SET
        type = ?, account_id = ?, category_id = ?, merchant_name = ?, amount = ?,
        currency = ?, transaction_date = ?, note = ?, source = ?, status = ?,
        transfer_group_id = ?, transfer_leg = ?, original_transaction_id = ?,
        adjustment_direction = ?, updated_at = ?, deleted_at = ?
      WHERE id = ?`,
      [
        record.type,
        record.accountId,
        record.categoryId,
        record.merchantName,
        record.amount,
        record.currency,
        record.transactionDate,
        record.note,
        record.source,
        record.status,
        record.transferGroupId,
        record.transferLeg,
        record.originalTransactionId,
        record.adjustmentDirection,
        record.updatedAt,
        record.deletedAt,
        record.id,
      ],
    );
  }

  async insertMany(records: TransactionRecord[]): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      for (const record of records) {
        await this.insert(record);
      }
    });
  }
}
