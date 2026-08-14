import { useCallback, useEffect, useState } from 'react';
import type { TransactionRecord } from '../database/records';
import { useFinance } from '../providers/finance-provider';

export function useTransactions() {
  const { transactions, nonce } = useFinance();
  const [items, setItems] = useState<TransactionRecord[]>([]);

  const load = useCallback(async () => {
    setItems(await transactions.list(200));
  }, [transactions]);

  useEffect(() => {
    void load();
  }, [load, nonce]);

  return { transactions: items, reload: load };
}
