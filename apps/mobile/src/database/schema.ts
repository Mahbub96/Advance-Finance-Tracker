import type { SQLiteDatabase } from 'expo-sqlite';

export const SCHEMA_VERSION = 5;

const MIGRATION_V1 = `
CREATE TABLE IF NOT EXISTS user_settings (
  id TEXT PRIMARY KEY,
  display_name TEXT,
  base_currency TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en-US',
  timezone TEXT NOT NULL DEFAULT 'Asia/Dhaka',
  theme TEXT NOT NULL DEFAULT 'system',
  onboarding_completed INTEGER NOT NULL DEFAULT 0,
  default_account_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  currency TEXT NOT NULL,
  opening_balance TEXT NOT NULL,
  opening_balance_date TEXT NOT NULL,
  is_archived INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  institution_name TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  parent_id TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  icon TEXT,
  color_token TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_system INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  account_id TEXT NOT NULL,
  category_id TEXT,
  merchant_name TEXT,
  amount TEXT NOT NULL,
  currency TEXT NOT NULL,
  transaction_date TEXT NOT NULL,
  note TEXT,
  source TEXT NOT NULL DEFAULT 'MANUAL',
  status TEXT NOT NULL DEFAULT 'COMPLETED',
  transfer_group_id TEXT,
  transfer_leg TEXT,
  original_transaction_id TEXT,
  adjustment_direction TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX IF NOT EXISTS idx_accounts_archived ON accounts(is_archived, deleted_at);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type, is_archived);
CREATE INDEX IF NOT EXISTS idx_transactions_account_date ON transactions(account_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date, deleted_at);
CREATE INDEX IF NOT EXISTS idx_transactions_transfer_group ON transactions(transfer_group_id);
`;

const MIGRATION_V2 = `
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  amount TEXT NOT NULL,
  currency TEXT NOT NULL,
  period_type TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  category_id TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  alert_threshold_percent INTEGER NOT NULL DEFAULT 80,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(start_date, end_date, status, deleted_at);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category_id, deleted_at);
`;

const MIGRATION_V3 = `
CREATE TABLE IF NOT EXISTS recurring_rules (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  amount TEXT NOT NULL,
  currency TEXT NOT NULL,
  account_id TEXT NOT NULL,
  destination_account_id TEXT,
  category_id TEXT,
  frequency TEXT NOT NULL,
  interval_value INTEGER NOT NULL DEFAULT 1,
  start_date TEXT NOT NULL,
  end_date TEXT,
  next_occurrence TEXT NOT NULL,
  auto_create INTEGER NOT NULL DEFAULT 0,
  reminder_enabled INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  FOREIGN KEY (destination_account_id) REFERENCES accounts(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX IF NOT EXISTS idx_recurring_rules_next ON recurring_rules(next_occurrence, status, deleted_at);
CREATE INDEX IF NOT EXISTS idx_recurring_rules_account ON recurring_rules(account_id, deleted_at);
`;

const MIGRATION_V4 = `
CREATE TABLE IF NOT EXISTS debts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  person_name TEXT NOT NULL,
  amount TEXT NOT NULL,
  currency TEXT NOT NULL,
  account_id TEXT,
  due_date TEXT,
  issue_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS debt_repayments (
  id TEXT PRIMARY KEY,
  debt_id TEXT NOT NULL,
  amount TEXT NOT NULL,
  repayment_date TEXT NOT NULL,
  account_id TEXT,
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (debt_id) REFERENCES debts(id),
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status, deleted_at);
CREATE INDEX IF NOT EXISTS idx_debts_due ON debts(due_date, status, deleted_at);
CREATE INDEX IF NOT EXISTS idx_debt_repayments_debt ON debt_repayments(debt_id, deleted_at);
`;

const MIGRATION_V5 = `
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target_amount TEXT NOT NULL,
  currency TEXT NOT NULL,
  target_date TEXT,
  account_id TEXT,
  status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS goal_contributions (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL,
  amount TEXT NOT NULL,
  contribution_date TEXT NOT NULL,
  account_id TEXT,
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (goal_id) REFERENCES goals(id),
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status, deleted_at);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_goal ON goal_contributions(goal_id, deleted_at);
`;

export async function migrate(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;

  if (current < 1) {
    await db.execAsync(MIGRATION_V1);
    await db.execAsync('PRAGMA user_version = 1');
  }

  if (current < 2) {
    await db.execAsync(MIGRATION_V2);
    await db.execAsync('PRAGMA user_version = 2');
  }

  if (current < 3) {
    await db.execAsync(MIGRATION_V3);
    await db.execAsync('PRAGMA user_version = 3');
  }

  if (current < 4) {
    await db.execAsync(MIGRATION_V4);
    await db.execAsync('PRAGMA user_version = 4');
  }

  if (current < 5) {
    await db.execAsync(MIGRATION_V5);
    await db.execAsync('PRAGMA user_version = 5');
  }
}

