import { AccountType } from '@personal-finance/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AccountForm } from '../../src/features/accounts/components/AccountForm';
import { useFinance } from '../../src/providers/finance-provider';
import { useSettings } from '../../src/hooks/use-settings';

export default function FirstAccountScreen() {
  const { currency = 'BDT', displayName = 'Ahmed' } = useLocalSearchParams<{
    currency: string;
    displayName?: string;
  }>();
  const { accounts, categories, refresh } = useFinance();
  const { completeOnboarding } = useSettings();
  const router = useRouter();

  return (
    <AccountForm
      title="Create Primary Account"
      initial={{
        name: 'Cash',
        type: AccountType.CASH,
        currency,
        openingBalance: '0',
        openingBalanceDate: new Date().toISOString().slice(0, 10),
      }}
      submitLabel="Get Started"
      onSubmit={async (input) => {
        await categories.seedIfEmpty();
        const created = await accounts.create({ ...input, currency });
        await completeOnboarding({
          baseCurrency: currency,
          defaultAccountId: created.id,
          displayName: displayName || undefined,
        });
        refresh();
        router.replace('/(tabs)');
      }}
    />
  );
}
