import { useCallback, useEffect, useState } from 'react';
import type { TransactionRecord } from '../database/records';
import { useFinance } from '../providers/finance-provider';

export function useTransactions() {
  const { transactions, nonce } = useFinance();
  const [items, setItems] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setItems(await transactions.list(200));
    } finally {
      setLoading(false);
    }
  }, [transactions]);

  useEffect(() => {
    void load();
  }, [load, nonce]);

  return { transactions: items, loading, reload: load };
}
