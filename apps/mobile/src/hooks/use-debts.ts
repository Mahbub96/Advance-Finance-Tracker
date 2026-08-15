import { useCallback, useEffect, useState } from 'react';
import type { DebtSummary } from '../features/debts/services/debt-service';
import { useFinance } from '../providers/finance-provider';

export function useDebts() {
  const { debts, nonce } = useFinance();
  const [items, setItems] = useState<DebtSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setItems(await debts.summaries());
    } finally {
      setLoading(false);
    }
  }, [debts]);

  useEffect(() => {
    void load();
  }, [load, nonce]);

  return { debts: items, loading, reload: load };
}
