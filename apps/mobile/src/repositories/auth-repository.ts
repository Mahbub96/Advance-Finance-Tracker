import type { SQLiteDatabase } from 'expo-sqlite';

export interface AuthSessionRecord {
  id: string;
  userId: string;
  email: string;
  displayName: string | null;
  accessToken: string;
  refreshToken: string | null;
  lastSyncedRevision: number;
  createdAt: string;
  updatedAt: string;
}

type AuthSessionRow = {
  id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  access_token: string;
  refresh_token: string | null;
  last_synced_revision: number;
  created_at: string;
  updated_at: string;
};

function mapAuthSession(row: AuthSessionRow): AuthSessionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    displayName: row.display_name,
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    lastSyncedRevision: row.last_synced_revision ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class AuthRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async getSession(): Promise<AuthSessionRecord | null> {
    const row = await this.db.getFirstAsync<AuthSessionRow>(
      'SELECT * FROM auth_session ORDER BY updated_at DESC LIMIT 1',
    );
    return row ? mapAuthSession(row) : null;
  }

  async saveSession(record: AuthSessionRecord): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO auth_session (
        id, user_id, email, display_name, access_token, refresh_token,
        last_synced_revision, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        user_id = excluded.user_id,
        email = excluded.email,
        display_name = excluded.display_name,
        access_token = excluded.access_token,
        refresh_token = excluded.refresh_token,
        last_synced_revision = excluded.last_synced_revision,
        updated_at = excluded.updated_at`,
      [
        record.id,
        record.userId,
        record.email,
        record.displayName,
        record.accessToken,
        record.refreshToken,
        record.lastSyncedRevision,
        record.createdAt,
        record.updatedAt,
      ],
    );
  }

  async updateLastSyncedRevision(revision: number): Promise<void> {
    await this.db.runAsync(
      'UPDATE auth_session SET last_synced_revision = ?, updated_at = ?',
      [revision, new Date().toISOString()],
    );
  }

  async clearSession(): Promise<void> {
    await this.db.runAsync('DELETE FROM auth_session');
  }
}
