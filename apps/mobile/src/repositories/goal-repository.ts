import type { SQLiteDatabase } from 'expo-sqlite';
import type { GoalContributionRecord, GoalRecord } from '../database/records';

type GoalRow = {
  id: string;
  name: string;
  target_amount: string;
  currency: string;
  target_date: string | null;
  account_id: string | null;
  status: GoalRecord['status'];
  note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type GoalContributionRow = {
  id: string;
  goal_id: string;
  amount: string;
  contribution_date: string;
  account_id: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

function mapGoal(row: GoalRow): GoalRecord {
  return {
    id: row.id,
    name: row.name,
    targetAmount: row.target_amount,
    currency: row.currency,
    targetDate: row.target_date,
    accountId: row.account_id,
    status: row.status,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function mapContribution(row: GoalContributionRow): GoalContributionRecord {
  return {
    id: row.id,
    goalId: row.goal_id,
    amount: row.amount,
    contributionDate: row.contribution_date,
    accountId: row.account_id,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

const GOAL_COLUMNS = `id, name, target_amount, currency, target_date, account_id,
  status, note, created_at, updated_at, deleted_at`;

const CONTRIBUTION_COLUMNS = `id, goal_id, amount, contribution_date, account_id,
  note, created_at, updated_at, deleted_at`;

export class GoalRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async list(includeInactive = false): Promise<GoalRecord[]> {
    const statusFilter = includeInactive ? '' : "AND status = 'IN_PROGRESS'";
    const rows = await this.db.getAllAsync<GoalRow>(
      `SELECT ${GOAL_COLUMNS} FROM goals
       WHERE deleted_at IS NULL ${statusFilter}
       ORDER BY created_at DESC, name`,
    );
    return rows.map(mapGoal);
  }

  async getById(id: string): Promise<GoalRecord | null> {
    const row = await this.db.getFirstAsync<GoalRow>(
      `SELECT ${GOAL_COLUMNS} FROM goals WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );
    return row ? mapGoal(row) : null;
  }

  async insert(record: GoalRecord): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO goals (
        id, name, target_amount, currency, target_date, account_id,
        status, note, created_at, updated_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        record.name,
        record.targetAmount,
        record.currency,
        record.targetDate,
        record.accountId,
        record.status,
        record.note,
        record.createdAt,
        record.updatedAt,
        record.deletedAt,
      ],
    );
  }

  async update(record: GoalRecord): Promise<void> {
    await this.db.runAsync(
      `UPDATE goals SET
        name = ?, target_amount = ?, currency = ?, target_date = ?, account_id = ?,
        status = ?, note = ?, updated_at = ?, deleted_at = ?
       WHERE id = ?`,
      [
        record.name,
        record.targetAmount,
        record.currency,
        record.targetDate,
        record.accountId,
        record.status,
        record.note,
        record.updatedAt,
        record.deletedAt,
        record.id,
      ],
    );
  }

  async listContributions(goalId: string): Promise<GoalContributionRecord[]> {
    const rows = await this.db.getAllAsync<GoalContributionRow>(
      `SELECT ${CONTRIBUTION_COLUMNS} FROM goal_contributions
       WHERE goal_id = ? AND deleted_at IS NULL
       ORDER BY contribution_date DESC`,
      [goalId],
    );
    return rows.map(mapContribution);
  }

  async listAllContributions(): Promise<GoalContributionRecord[]> {
    const rows = await this.db.getAllAsync<GoalContributionRow>(
      `SELECT ${CONTRIBUTION_COLUMNS} FROM goal_contributions
       WHERE deleted_at IS NULL
       ORDER BY contribution_date DESC`,
    );
    return rows.map(mapContribution);
  }

  async insertContribution(record: GoalContributionRecord): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO goal_contributions (
        id, goal_id, amount, contribution_date, account_id, note,
        created_at, updated_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        record.goalId,
        record.amount,
        record.contributionDate,
        record.accountId,
        record.note,
        record.createdAt,
        record.updatedAt,
        record.deletedAt,
      ],
    );
  }
}
