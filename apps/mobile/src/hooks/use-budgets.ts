import { useCallback, useEffect, useState } from 'react';
import type { BudgetSummary } from '../features/budgets/services/budget-service';
import { useFinance } from '../providers/finance-provider';

export function useBudgets() {
  const { budgets, nonce } = useFinance();
  const [items, setItems] = useState<BudgetSummary[]>([]);

  const load = useCallback(async () => {
    setItems(await budgets.summaries());
  }, [budgets]);

  useEffect(() => {
    void load();
  }, [load, nonce]);

  return { budgets: items, reload: load };
}
