import { useCallback, useEffect, useState } from 'react';
import type { BudgetSummary } from '../features/budgets/services/budget-service';
import { useFinance } from '../providers/finance-provider';

export function useBudgets() {
  const { budgets, nonce } = useFinance();
  const [items, setItems] = useState<BudgetSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setItems(await budgets.summaries());
    } finally {
      setLoading(false);
    }
  }, [budgets]);

  useEffect(() => {
    void load();
  }, [load, nonce]);

  return { budgets: items, loading, reload: load };
}
