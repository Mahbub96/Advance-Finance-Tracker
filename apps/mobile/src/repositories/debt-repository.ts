import type { SQLiteDatabase } from 'expo-sqlite';
import type { DebtRecord, DebtRepaymentRecord } from '../database/records';

type DebtRow = {
  id: string;
  type: DebtRecord['type'];
  person_name: string;
  amount: string;
  currency: string;
  account_id: string | null;
  due_date: string | null;
  issue_date: string;
  status: DebtRecord['status'];
  email: string | null;
  email_reminder_enabled: number;
  note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type DebtRepaymentRow = {
  id: string;
  debt_id: string;
  amount: string;
  repayment_date: string;
  account_id: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

function mapDebt(row: DebtRow): DebtRecord {
  return {
    id: row.id,
    type: row.type,
    personName: row.person_name,
    amount: row.amount,
    currency: row.currency,
    accountId: row.account_id,
    dueDate: row.due_date,
    issueDate: row.issue_date,
    status: row.status,
    email: row.email,
    emailReminderEnabled: Boolean(row.email_reminder_enabled),
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function mapRepayment(row: DebtRepaymentRow): DebtRepaymentRecord {
  return {
    id: row.id,
    debtId: row.debt_id,
    amount: row.amount,
    repaymentDate: row.repayment_date,
    accountId: row.account_id,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

const DEBT_COLUMNS = `id, type, person_name, amount, currency, account_id,
  due_date, issue_date, status, email, email_reminder_enabled, note, created_at, updated_at, deleted_at`;

const REPAYMENT_COLUMNS = `id, debt_id, amount, repayment_date, account_id,
  note, created_at, updated_at, deleted_at`;

export class DebtRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async list(includeInactive = false): Promise<DebtRecord[]> {
    const statusFilter = includeInactive ? '' : "AND status = 'ACTIVE'";
    const rows = await this.db.getAllAsync<DebtRow>(
      `SELECT ${DEBT_COLUMNS} FROM debts
       WHERE deleted_at IS NULL ${statusFilter}
       ORDER BY issue_date DESC, person_name`,
    );
    return rows.map(mapDebt);
  }

  async getById(id: string): Promise<DebtRecord | null> {
    const row = await this.db.getFirstAsync<DebtRow>(
      `SELECT ${DEBT_COLUMNS} FROM debts WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );
    return row ? mapDebt(row) : null;
  }

  async insert(record: DebtRecord): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO debts (
        id, type, person_name, amount, currency, account_id, due_date,
        issue_date, status, email, email_reminder_enabled, note, created_at, updated_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        record.type,
        record.personName,
        record.amount,
        record.currency,
        record.accountId,
        record.dueDate,
        record.issueDate,
        record.status,
        record.email ?? null,
        record.emailReminderEnabled ? 1 : 0,
        record.note,
        record.createdAt,
        record.updatedAt,
        record.deletedAt,
      ],
    );
  }

  async update(record: DebtRecord): Promise<void> {
    await this.db.runAsync(
      `UPDATE debts SET
        type = ?, person_name = ?, amount = ?, currency = ?, account_id = ?,
        due_date = ?, issue_date = ?, status = ?, email = ?, email_reminder_enabled = ?,
        note = ?, updated_at = ?, deleted_at = ?
       WHERE id = ?`,
      [
        record.type,
        record.personName,
        record.amount,
        record.currency,
        record.accountId,
        record.dueDate,
        record.issueDate,
        record.status,
        record.email ?? null,
        record.emailReminderEnabled ? 1 : 0,
        record.note,
        record.updatedAt,
        record.deletedAt,
        record.id,
      ],
    );
  }

  async listRepayments(debtId: string): Promise<DebtRepaymentRecord[]> {
    const rows = await this.db.getAllAsync<DebtRepaymentRow>(
      `SELECT ${REPAYMENT_COLUMNS} FROM debt_repayments
       WHERE debt_id = ? AND deleted_at IS NULL
       ORDER BY repayment_date DESC`,
      [debtId],
    );
    return rows.map(mapRepayment);
  }

  async listAllRepayments(): Promise<DebtRepaymentRecord[]> {
    const rows = await this.db.getAllAsync<DebtRepaymentRow>(
      `SELECT ${REPAYMENT_COLUMNS} FROM debt_repayments
       WHERE deleted_at IS NULL
       ORDER BY repayment_date DESC`,
    );
    return rows.map(mapRepayment);
  }

  async insertRepayment(record: DebtRepaymentRecord): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO debt_repayments (
        id, debt_id, amount, repayment_date, account_id, note,
        created_at, updated_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        record.debtId,
        record.amount,
        record.repaymentDate,
        record.accountId,
        record.note,
        record.createdAt,
        record.updatedAt,
        record.deletedAt,
      ],
    );
  }
}
