import type { SQLiteDatabase } from 'expo-sqlite';
import { openDatabaseAsync } from 'expo-sqlite';
import { migrate } from './schema';

let databasePromise: Promise<SQLiteDatabase> | undefined;

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = (async () => {
      const db = await openDatabaseAsync('personal-finance.db');
      await db.execAsync('PRAGMA foreign_keys = ON');
      await migrate(db);
      return db;
    })();
  }
  return databasePromise;
}
