import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase } from '../database/client';
import { AccountRepository } from '../repositories/account-repository';
import { BudgetRepository } from '../repositories/budget-repository';
import { CategoryRepository } from '../repositories/category-repository';
import { DebtRepository } from '../repositories/debt-repository';
import { GoalRepository } from '../repositories/goal-repository';
import { RecurringRuleRepository } from '../repositories/recurring-rule-repository';
import { SettingsRepository } from '../repositories/settings-repository';
import { TransactionRepository } from '../repositories/transaction-repository';
import { AccountService } from '../features/accounts/services/account-service';
import { AnalyticsService } from '../features/analytics/services/analytics-service';
import { BudgetService } from '../features/budgets/services/budget-service';
import { CategoryService } from '../features/categories/services/category-service';
import { DebtService } from '../features/debts/services/debt-service';
import { GoalService } from '../features/goals/services/goal-service';
import { RecurringRuleService } from '../features/recurring/services/recurring-rule-service';
import { TransactionService } from '../features/transactions/services/transaction-service';

type FinanceServices = {
  db: SQLiteDatabase;
  accounts: AccountService;
  analytics: AnalyticsService;
  budgets: BudgetService;
  categories: CategoryService;
  debts: DebtService;
  goals: GoalService;
  recurringRules: RecurringRuleService;
  transactions: TransactionService;
  settings: SettingsRepository;
  refresh: () => void;
  nonce: number;
};

const FinanceContext = createContext<FinanceServices | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    void getDatabase().then(setDb);
  }, []);

  const value = useMemo(() => {
    if (!db) return null;
    const accountRepo = new AccountRepository(db);
    const budgetRepo = new BudgetRepository(db);
    const categoryRepo = new CategoryRepository(db);
    const debtRepo = new DebtRepository(db);
    const goalRepo = new GoalRepository(db);
    const recurringRuleRepo = new RecurringRuleRepository(db);
    const settingsRepo = new SettingsRepository(db);
    const transactionRepo = new TransactionRepository(db);
    const transactionService = new TransactionService(transactionRepo, accountRepo);
    const recurringRuleService = new RecurringRuleService(
      recurringRuleRepo,
      accountRepo,
      categoryRepo,
      transactionService,
    );
    const debtService = new DebtService(debtRepo, accountRepo, transactionService);
    const goalService = new GoalService(goalRepo, accountRepo, transactionService);
    const analyticsService = new AnalyticsService(
      accountRepo,
      categoryRepo,
      transactionRepo,
      budgetRepo,
      recurringRuleRepo,
      debtRepo,
      goalRepo,
      settingsRepo,
    );

    return {
      db,
      accounts: new AccountService(accountRepo),
      analytics: analyticsService,
      budgets: new BudgetService(budgetRepo, categoryRepo, transactionRepo),
      categories: new CategoryService(categoryRepo),
      debts: debtService,
      goals: goalService,
      recurringRules: recurringRuleService,
      transactions: transactionService,
      settings: settingsRepo,
      refresh: () => setNonce((n) => n + 1),
      nonce,
    };
  }, [db, nonce]);

  useEffect(() => {
    if (value) {
      void value.recurringRules.processDueRules(new Date(), true).then((res) => {
        if (res.processed > 0) {
          value.refresh();
        }
      });
    }
  }, [value]);

  if (!value) return null;
  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceServices {
  const ctx = useContext(FinanceContext);
  if (!ctx) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return ctx;
}

