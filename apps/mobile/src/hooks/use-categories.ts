import { useCallback, useEffect, useState } from 'react';
import type { CategoryRecord } from '../database/records';
import { useFinance } from '../providers/finance-provider';

export function useCategories(includeArchived = false) {
  const { categories, nonce } = useFinance();
  const [items, setItems] = useState<CategoryRecord[]>([]);

  const load = useCallback(async () => {
    setItems(await categories.list(includeArchived));
  }, [categories, includeArchived]);

  useEffect(() => {
    void load();
  }, [load, nonce]);

  return { categories: items, reload: load };
}
