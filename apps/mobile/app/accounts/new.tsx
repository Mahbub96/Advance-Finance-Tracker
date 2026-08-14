import { AccountType } from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { AccountForm } from '../../src/features/accounts/components/AccountForm';
import { useSettings } from '../../src/hooks/use-settings';
import { useFinance } from '../../src/providers/finance-provider';
import { todayIsoDate } from '../../src/lib/clock';

export default function NewAccountScreen() {
  const { accounts, refresh } = useFinance();
  const { settings } = useSettings();
  const router = useRouter();
  const currency = settings?.baseCurrency ?? 'BDT';

  return (
    <AccountForm
      title="New account"
      initial={{
        type: AccountType.CASH,
        currency,
        openingBalance: '0',
        openingBalanceDate: todayIsoDate(),
      }}
      submitLabel="Create"
      onSubmit={async (input) => {
        await accounts.create({ ...input, currency });
        refresh();
        router.back();
      }}
    />
  );
}
