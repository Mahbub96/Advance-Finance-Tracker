import { useCallback, useEffect, useState } from 'react';
import type { RecurringRuleSummary } from '../features/recurring/services/recurring-rule-service';
import { useFinance } from '../providers/finance-provider';

export function useRecurringRules() {
  const { recurringRules, nonce } = useFinance();
  const [items, setItems] = useState<RecurringRuleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setItems(await recurringRules.summaries());
    } finally {
      setLoading(false);
    }
  }, [recurringRules]);

  useEffect(() => {
    void load();
  }, [load, nonce]);

  return { recurringRules: items, loading, reload: load };
}
