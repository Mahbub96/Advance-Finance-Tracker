import type { SQLiteDatabase } from 'expo-sqlite';
import type { BudgetRecord } from '../database/records';

type BudgetRow = {
  id: string;
  name: string;
  amount: string;
  currency: string;
  period_type: BudgetRecord['periodType'];
  start_date: string;
  end_date: string;
  category_id: string | null;
  status: BudgetRecord['status'];
  alert_threshold_percent: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

function mapBudget(row: BudgetRow): BudgetRecord {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    currency: row.currency,
    periodType: row.period_type,
    startDate: row.start_date,
    endDate: row.end_date,
    categoryId: row.category_id,
    status: row.status,
    alertThresholdPercent: row.alert_threshold_percent,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

const COLUMNS = `id, name, amount, currency, period_type, start_date, end_date,
  category_id, status, alert_threshold_percent, created_at, updated_at, deleted_at`;

export class BudgetRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async list(includeArchived = false): Promise<BudgetRecord[]> {
    const statusFilter = includeArchived ? '' : "AND status = 'ACTIVE'";
    const rows = await this.db.getAllAsync<BudgetRow>(
      `SELECT ${COLUMNS} FROM budgets
       WHERE deleted_at IS NULL ${statusFilter}
       ORDER BY start_date DESC, name`,
    );
    return rows.map(mapBudget);
  }

  async getById(id: string): Promise<BudgetRecord | null> {
    const row = await this.db.getFirstAsync<BudgetRow>(
      `SELECT ${COLUMNS} FROM budgets WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );
    return row ? mapBudget(row) : null;
  }

  async insert(record: BudgetRecord): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO budgets (
        id, name, amount, currency, period_type, start_date, end_date, category_id,
        status, alert_threshold_percent, created_at, updated_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        record.name,
        record.amount,
        record.currency,
        record.periodType,
        record.startDate,
        record.endDate,
        record.categoryId,
        record.status,
        record.alertThresholdPercent,
        record.createdAt,
        record.updatedAt,
        record.deletedAt,
      ],
    );
  }

  async update(record: BudgetRecord): Promise<void> {
    await this.db.runAsync(
      `UPDATE budgets SET
        name = ?, amount = ?, currency = ?, period_type = ?, start_date = ?, end_date = ?,
        category_id = ?, status = ?, alert_threshold_percent = ?, updated_at = ?, deleted_at = ?
       WHERE id = ?`,
      [
        record.name,
        record.amount,
        record.currency,
        record.periodType,
        record.startDate,
        record.endDate,
        record.categoryId,
        record.status,
        record.alertThresholdPercent,
        record.updatedAt,
        record.deletedAt,
        record.id,
      ],
    );
  }
}
