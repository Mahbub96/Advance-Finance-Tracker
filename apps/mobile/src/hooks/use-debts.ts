import { useCallback, useEffect, useState } from 'react';
import type { DebtSummary } from '../features/debts/services/debt-service';
import { useFinance } from '../providers/finance-provider';

export function useDebts() {
  const { debts, nonce } = useFinance();
  const [items, setItems] = useState<DebtSummary[]>([]);

  const load = useCallback(async () => {
    setItems(await debts.summaries());
  }, [debts]);

  useEffect(() => {
    void load();
  }, [load, nonce]);

  return { debts: items, reload: load };
}
