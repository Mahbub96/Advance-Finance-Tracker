import type { SQLiteDatabase } from 'expo-sqlite';
import type { SettingsRecord } from '../database/records';

type SettingsRow = {
  id: string;
  display_name: string | null;
  base_currency: string;
  locale: string;
  timezone: string;
  theme: string;
  onboarding_completed: number;
  default_account_id: string | null;
  created_at: string;
  updated_at: string;
};

function mapSettings(row: SettingsRow): SettingsRecord {
  return {
    id: row.id,
    displayName: row.display_name,
    baseCurrency: row.base_currency,
    locale: row.locale,
    timezone: row.timezone,
    theme: row.theme,
    onboardingCompleted: row.onboarding_completed === 1,
    defaultAccountId: row.default_account_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SettingsRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async get(): Promise<SettingsRecord | null> {
    const row = await this.db.getFirstAsync<SettingsRow>(
      'SELECT * FROM user_settings LIMIT 1',
    );
    return row ? mapSettings(row) : null;
  }

  async upsert(record: SettingsRecord): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO user_settings (
        id, display_name, base_currency, locale, timezone, theme,
        onboarding_completed, default_account_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        display_name = excluded.display_name,
        base_currency = excluded.base_currency,
        locale = excluded.locale,
        timezone = excluded.timezone,
        theme = excluded.theme,
        onboarding_completed = excluded.onboarding_completed,
        default_account_id = excluded.default_account_id,
        updated_at = excluded.updated_at`,
      [
        record.id,
        record.displayName,
        record.baseCurrency,
        record.locale,
        record.timezone,
        record.theme,
        record.onboardingCompleted ? 1 : 0,
        record.defaultAccountId,
        record.createdAt,
        record.updatedAt,
      ],
    );
  }
}
