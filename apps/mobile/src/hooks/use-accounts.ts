import { addMoney, deriveAccountBalance, formatMoneyDisplay } from '@personal-finance/types';
import { useCallback, useEffect, useState } from 'react';
import type { AccountRecord, TransactionRecord } from '../database/records';
import { useFinance } from '../providers/finance-provider';

export function useAccounts(includeArchived = false) {
  const { accounts, transactions, nonce } = useFinance();
  const [items, setItems] = useState<AccountRecord[]>([]);
  const [txByAccount, setTxByAccount] = useState<Record<string, TransactionRecord[]>>({});

  const load = useCallback(async () => {
    const listed = await accounts.list(includeArchived);
    const map: Record<string, TransactionRecord[]> = {};
    for (const account of listed) {
      map[account.id] = await transactions.listByAccount(account.id);
    }
    setItems(listed);
    setTxByAccount(map);
  }, [accounts, transactions, includeArchived]);

  useEffect(() => {
    void load();
  }, [load, nonce]);

  const withBalances = items.map((account) => ({
    ...account,
    balance: deriveAccountBalance(account.openingBalance, txByAccount[account.id] ?? [], account.id),
  }));

  const totalBalance = withBalances.reduce((sum, account) => addMoney(sum, account.balance), '0.00');

  return { accounts: withBalances, totalBalance, reload: load };
}

export function useFormatMoney(currency: string, locale = 'en-US') {
  return useCallback(
    (value: string) => formatMoneyDisplay(value, currency, locale),
    [currency, locale],
  );
}
