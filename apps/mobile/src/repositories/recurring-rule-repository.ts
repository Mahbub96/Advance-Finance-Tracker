import type { SQLiteDatabase } from 'expo-sqlite';
import type { RecurringRuleRecord } from '../database/records';

type RecurringRuleRow = {
  id: string;
  type: RecurringRuleRecord['type'];
  name: string;
  amount: string;
  currency: string;
  account_id: string;
  destination_account_id: string | null;
  category_id: string | null;
  frequency: RecurringRuleRecord['frequency'];
  interval_value: number;
  start_date: string;
  end_date: string | null;
  next_occurrence: string;
  auto_create: number;
  reminder_enabled: number;
  status: RecurringRuleRecord['status'];
  note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

function mapRule(row: RecurringRuleRow): RecurringRuleRecord {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    amount: row.amount,
    currency: row.currency,
    accountId: row.account_id,
    destinationAccountId: row.destination_account_id,
    categoryId: row.category_id,
    frequency: row.frequency,
    intervalValue: row.interval_value,
    startDate: row.start_date,
    endDate: row.end_date,
    nextOccurrence: row.next_occurrence,
    autoCreate: row.auto_create === 1,
    reminderEnabled: row.reminder_enabled === 1,
    status: row.status,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

const COLUMNS = `id, type, name, amount, currency, account_id, destination_account_id,
  category_id, frequency, interval_value, start_date, end_date, next_occurrence,
  auto_create, reminder_enabled, status, note, created_at, updated_at, deleted_at`;

export class RecurringRuleRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async list(includeInactive = false): Promise<RecurringRuleRecord[]> {
    const statusFilter = includeInactive ? '' : "AND status = 'ACTIVE'";
    const rows = await this.db.getAllAsync<RecurringRuleRow>(
      `SELECT ${COLUMNS} FROM recurring_rules
       WHERE deleted_at IS NULL ${statusFilter}
       ORDER BY next_occurrence ASC, name`,
    );
    return rows.map(mapRule);
  }

  async getById(id: string): Promise<RecurringRuleRecord | null> {
    const row = await this.db.getFirstAsync<RecurringRuleRow>(
      `SELECT ${COLUMNS} FROM recurring_rules WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );
    return row ? mapRule(row) : null;
  }

  async insert(record: RecurringRuleRecord): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO recurring_rules (
        id, type, name, amount, currency, account_id, destination_account_id,
        category_id, frequency, interval_value, start_date, end_date, next_occurrence,
        auto_create, reminder_enabled, status, note, created_at, updated_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        record.type,
        record.name,
        record.amount,
        record.currency,
        record.accountId,
        record.destinationAccountId,
        record.categoryId,
        record.frequency,
        record.intervalValue,
        record.startDate,
        record.endDate,
        record.nextOccurrence,
        record.autoCreate ? 1 : 0,
        record.reminderEnabled ? 1 : 0,
        record.status,
        record.note,
        record.createdAt,
        record.updatedAt,
        record.deletedAt,
      ],
    );
  }

  async update(record: RecurringRuleRecord): Promise<void> {
    await this.db.runAsync(
      `UPDATE recurring_rules SET
        type = ?, name = ?, amount = ?, currency = ?, account_id = ?,
        destination_account_id = ?, category_id = ?, frequency = ?, interval_value = ?,
        start_date = ?, end_date = ?, next_occurrence = ?, auto_create = ?,
        reminder_enabled = ?, status = ?, note = ?, updated_at = ?, deleted_at = ?
       WHERE id = ?`,
      [
        record.type,
        record.name,
        record.amount,
        record.currency,
        record.accountId,
        record.destinationAccountId,
        record.categoryId,
        record.frequency,
        record.intervalValue,
        record.startDate,
        record.endDate,
        record.nextOccurrence,
        record.autoCreate ? 1 : 0,
        record.reminderEnabled ? 1 : 0,
        record.status,
        record.note,
        record.updatedAt,
        record.deletedAt,
        record.id,
      ],
    );
  }
}
