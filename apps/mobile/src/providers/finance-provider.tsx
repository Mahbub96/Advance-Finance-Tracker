import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import { AppSplashScreen } from '../components/AppSplashScreen';
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
import { ForecastingService } from '../features/intelligence/services/forecasting-service';
import { HealthService } from '../features/intelligence/services/health-service';
import { ApiClient, createApiClient } from '@personal-finance/api-client';
import { getAppConfig } from '@personal-finance/config';
import { InsightsService } from '../features/intelligence/services/insights-service';
import { RecurringRuleService } from '../features/recurring/services/recurring-rule-service';
import { TransactionService } from '../features/transactions/services/transaction-service';

import { AuthRepository } from '../repositories/auth-repository';
import { SyncEngine } from '../services/sync-engine';

type FinanceServices = {
  db: SQLiteDatabase;
  api: ApiClient;
  apiStatus: 'online' | 'offline' | 'checking';
  checkApiConnection: () => Promise<boolean>;
  syncWithApi: () => Promise<boolean>;
  accounts: AccountService;
  analytics: AnalyticsService;
  budgets: BudgetService;
  categories: CategoryService;
  debts: DebtService;
  forecasting: ForecastingService;
  goals: GoalService;
  health: HealthService;
  insights: InsightsService;
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
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  const authRepo = useMemo(() => (db ? new AuthRepository(db) : null), [db]);

  const apiClient = useMemo(() => {
    return createApiClient({
      baseUrl: getAppConfig().apiUrl,
      getAuthToken: async () => {
        if (!authRepo) return null;
        const current = await authRepo.getSession();
        return current?.accessToken ?? null;
      },
    });
  }, [authRepo]);

  const syncEngine = useMemo(() => {
    return db ? new SyncEngine(db, apiClient) : null;
  }, [db, apiClient]);

  const checkApiConnection = async (): Promise<boolean> => {
    try {
      const res = await apiClient.health();
      const isOnline = res.status === 'ok';
      setApiStatus(isOnline ? 'online' : 'offline');
      return isOnline;
    } catch {
      setApiStatus('offline');
      return false;
    }
  };

  const syncWithApi = async (): Promise<boolean> => {
    try {
      const isOnline = await checkApiConnection();
      if (!isOnline || !syncEngine) return false;
      const summary = await syncEngine.sync();
      if (summary.success) {
        setNonce((n) => n + 1);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Fast-path local database opening
    void getDatabase().then((database) => {
      if (isMounted) {
        setDb(database);
        // Defer cloud sync to run in background after UI is mounted
        setTimeout(() => {
          if (isMounted) {
            void syncWithApi();
          }
        }, 600);
      }
    });

    // Periodic background sync interval
    const interval = setInterval(() => {
      if (isMounted) {
        void syncWithApi();
      }
    }, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Automatic sync when local mutations occur (nonce increments)
  useEffect(() => {
    if (nonce > 0) {
      void syncWithApi();
    }
  }, [nonce]);

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
    const budgetService = new BudgetService(budgetRepo, categoryRepo, transactionRepo);
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
    const forecastingService = new ForecastingService(transactionRepo, budgetRepo);
    const healthService = new HealthService(
      analyticsService,
      budgetService,
      debtService,
      goalService,
    );
    const insightsService = new InsightsService(
      forecastingService,
      healthService,
      recurringRuleService,
      debtService,
      goalService,
    );

    return {
      db,
      api: apiClient,
      apiStatus,
      checkApiConnection,
      syncWithApi,
      accounts: new AccountService(accountRepo),
      analytics: analyticsService,
      budgets: budgetService,
      categories: new CategoryService(categoryRepo),
      debts: debtService,
      forecasting: forecastingService,
      goals: goalService,
      health: healthService,
      insights: insightsService,
      recurringRules: recurringRuleService,
      transactions: transactionService,
      settings: settingsRepo,
      refresh: () => setNonce((n) => n + 1),
      nonce,
    };
  }, [db, nonce, apiStatus, apiClient]);

  useEffect(() => {
    if (value) {
      void value.recurringRules.processDueRules(new Date(), true).then((res) => {
        if (res.processed > 0) {
          value.refresh();
        }
      });
    }
  }, [value]);

  if (!value) {
    return <AppSplashScreen statusText="Connecting encrypted SQLite engine..." />;
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceServices {
  const ctx = useContext(FinanceContext);
  if (!ctx) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return ctx;
}
