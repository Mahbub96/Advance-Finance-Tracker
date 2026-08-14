import { useCallback, useEffect, useState } from 'react';
import type { RecurringRuleSummary } from '../features/recurring/services/recurring-rule-service';
import { useFinance } from '../providers/finance-provider';

export function useRecurringRules() {
  const { recurringRules, nonce } = useFinance();
  const [items, setItems] = useState<RecurringRuleSummary[]>([]);

  const load = useCallback(async () => {
    setItems(await recurringRules.summaries());
  }, [recurringRules]);

  useEffect(() => {
    void load();
  }, [load, nonce]);

  return { recurringRules: items, reload: load };
}
