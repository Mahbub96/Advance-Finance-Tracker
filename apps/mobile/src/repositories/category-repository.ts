import type { SQLiteDatabase } from 'expo-sqlite';
import type { CategoryRecord } from '../database/records';

type CategoryRow = {
  id: string;
  parent_id: string | null;
  name: string;
  type: 'EXPENSE' | 'INCOME';
  icon: string | null;
  color_token: string | null;
  display_order: number;
  is_system: number;
  is_archived: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

function mapCategory(row: CategoryRow): CategoryRecord {
  return {
    id: row.id,
    parentId: row.parent_id,
    name: row.name,
    type: row.type,
    icon: row.icon,
    colorToken: row.color_token,
    displayOrder: row.display_order,
    isSystem: row.is_system === 1,
    isArchived: row.is_archived === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export class CategoryRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async list(includeArchived = false): Promise<CategoryRecord[]> {
    const sql = includeArchived
      ? 'SELECT * FROM categories WHERE deleted_at IS NULL ORDER BY type, display_order, name'
      : 'SELECT * FROM categories WHERE deleted_at IS NULL AND is_archived = 0 ORDER BY type, display_order, name';
    const rows = await this.db.getAllAsync<CategoryRow>(sql);
    return rows.map(mapCategory);
  }

  async getById(id: string): Promise<CategoryRecord | null> {
    const row = await this.db.getFirstAsync<CategoryRow>(
      'SELECT * FROM categories WHERE id = ? AND deleted_at IS NULL',
      [id],
    );
    return row ? mapCategory(row) : null;
  }

  async count(): Promise<number> {
    const row = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM categories WHERE deleted_at IS NULL',
    );
    return row?.count ?? 0;
  }

  async insert(record: CategoryRecord): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO categories (
        id, parent_id, name, type, icon, color_token, display_order,
        is_system, is_archived, created_at, updated_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        record.parentId,
        record.name,
        record.type,
        record.icon,
        record.colorToken,
        record.displayOrder,
        record.isSystem ? 1 : 0,
        record.isArchived ? 1 : 0,
        record.createdAt,
        record.updatedAt,
        record.deletedAt,
      ],
    );
  }

  async update(record: CategoryRecord): Promise<void> {
    await this.db.runAsync(
      `UPDATE categories SET
        parent_id = ?, name = ?, type = ?, icon = ?, color_token = ?,
        display_order = ?, is_system = ?, is_archived = ?, updated_at = ?, deleted_at = ?
      WHERE id = ?`,
      [
        record.parentId,
        record.name,
        record.type,
        record.icon,
        record.colorToken,
        record.displayOrder,
        record.isSystem ? 1 : 0,
        record.isArchived ? 1 : 0,
        record.updatedAt,
        record.deletedAt,
        record.id,
      ],
    );
  }
}
