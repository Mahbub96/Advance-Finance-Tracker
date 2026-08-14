import type { SQLiteDatabase } from 'expo-sqlite';
import { openDatabaseAsync } from 'expo-sqlite';
import { migrate } from './schema';

let databasePromise: Promise<SQLiteDatabase> | undefined;

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = (async () => {
      const db = await openDatabaseAsync('personal-finance.db');
      // Performance PRAGMAs for fast mobile storage
      await db.execAsync(`
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
        PRAGMA temp_store = MEMORY;
        PRAGMA cache_size = -64000;
      `);
      await migrate(db);
      return db;
    })();
  }
  return databasePromise;
}
