import { useCallback, useEffect, useState } from 'react';
import type { CategoryRecord } from '../database/records';
import { useFinance } from '../providers/finance-provider';

export function useCategories(includeArchived = false) {
  const { categories, nonce } = useFinance();
  const [items, setItems] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setItems(await categories.list(includeArchived));
    } finally {
      setLoading(false);
    }
  }, [categories, includeArchived]);

  useEffect(() => {
    void load();
  }, [load, nonce]);

  return { categories: items, loading, reload: load };
}
