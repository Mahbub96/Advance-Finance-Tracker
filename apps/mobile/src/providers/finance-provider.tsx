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
import { CategoryRepository } from '../repositories/category-repository';
import { SettingsRepository } from '../repositories/settings-repository';
import { TransactionRepository } from '../repositories/transaction-repository';
import { AccountService } from '../features/accounts/services/account-service';
import { CategoryService } from '../features/categories/services/category-service';
import { TransactionService } from '../features/transactions/services/transaction-service';

type FinanceServices = {
  db: SQLiteDatabase;
  accounts: AccountService;
  categories: CategoryService;
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
    const categoryRepo = new CategoryRepository(db);
    const transactionRepo = new TransactionRepository(db);
    return {
      db,
      accounts: new AccountService(accountRepo),
      categories: new CategoryService(categoryRepo),
      transactions: new TransactionService(transactionRepo, accountRepo),
      settings: new SettingsRepository(db),
      refresh: () => setNonce((n) => n + 1),
      nonce,
    };
  }, [db, nonce]);

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
