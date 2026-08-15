import { useCallback, useEffect, useState } from 'react';
import type { GoalSummary } from '../features/goals/services/goal-service';
import { useFinance } from '../providers/finance-provider';

export function useGoals() {
  const { goals, nonce } = useFinance();
  const [items, setItems] = useState<GoalSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setItems(await goals.summaries());
    } finally {
      setLoading(false);
    }
  }, [goals]);

  useEffect(() => {
    void load();
  }, [load, nonce]);

  return { goals: items, loading, reload: load };
}
