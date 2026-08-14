import { useCallback, useEffect, useState } from 'react';
import type { GoalSummary } from '../features/goals/services/goal-service';
import { useFinance } from '../providers/finance-provider';

export function useGoals() {
  const { goals, nonce } = useFinance();
  const [items, setItems] = useState<GoalSummary[]>([]);

  const load = useCallback(async () => {
    setItems(await goals.summaries());
  }, [goals]);

  useEffect(() => {
    void load();
  }, [load, nonce]);

  return { goals: items, reload: load };
}
