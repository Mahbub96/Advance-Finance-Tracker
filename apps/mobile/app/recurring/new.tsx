import {
  CategoryKind,
  RecurringFrequency,
  type RecurringFrequency as RecurringFrequencyType,
  TransactionType,
} from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { ScrollScreen } from '../../src/components/Screen';
import { todayIsoDate } from '../../src/lib/clock';
import { useAccounts } from '../../src/hooks/use-accounts';
import { useCategories } from '../../src/hooks/use-categories';
import { useSettings } from '../../src/hooks/use-settings';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

type Mode = 'EXPENSE' | 'INCOME' | 'TRANSFER';

export default function NewRecurringScreen() {
  const { colors, spacing, typography, radius } = useTokens();
  const { recurringRules, refresh } = useFinance();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { settings } = useSettings();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('EXPENSE');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState(todayIsoDate());
  const [frequency, setFrequency] = useState<RecurringFrequencyType>(RecurringFrequency.MONTHLY);
  const [accountId, setAccountId] = useState<string | undefined>();
  const [destinationId, setDestinationId] = useState<string | undefined>();
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedAccount = accountId ?? accounts[0]?.id;
  const selectedDestination = destinationId ?? accounts.find((a) => a.id !== selectedAccount)?.id;
  const categoryOptions = useMemo(
    () =>
      categories.filter((category) =>
        mode === 'EXPENSE'
          ? category.type === CategoryKind.EXPENSE
          : category.type === CategoryKind.INCOME,
      ),
    [categories, mode],
  );

  return (
    <ScrollScreen>
      <Text style={[typography.title, { color: colors.textPrimary }]}>New recurring</Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {(['EXPENSE', 'INCOME', 'TRANSFER'] as const).map((item) => (
          <Pressable
            key={item}
            onPress={() => setMode(item)}
            style={{
              flex: 1,
              padding: spacing.sm,
              borderRadius: radius.md,
              backgroundColor: mode === item ? colors.primary : colors.surfaceMuted,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: mode === item ? colors.primaryForeground : colors.textPrimary }}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
      <Input label="Name" value={name} onChangeText={setName} placeholder="Rent, salary, subscription" />
      <Input label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
      <Input label="Start date" value={startDate} onChangeText={setStartDate} />
      <ChipRow
        label="Frequency"
        options={Object.values(RecurringFrequency).map((item) => ({ id: item, name: item }))}
        value={frequency}
        onChange={(value) => setFrequency(value as RecurringFrequencyType)}
      />
      <ChipRow
        label={mode === 'TRANSFER' ? 'From' : 'Account'}
        options={accounts.map((account) => ({ id: account.id, name: account.name }))}
        value={selectedAccount}
        onChange={setAccountId}
      />
      {mode === 'TRANSFER' ? (
        <ChipRow
          label="To"
          options={accounts
            .filter((account) => account.id !== selectedAccount)
            .map((account) => ({ id: account.id, name: account.name }))}
          value={selectedDestination}
          onChange={setDestinationId}
        />
      ) : (
        <ChipRow
          label="Category"
          options={categoryOptions.map((category) => ({ id: category.id, name: category.name }))}
          value={categoryId ?? categoryOptions[0]?.id}
          onChange={setCategoryId}
        />
      )}
      <Input label="Note (optional)" value={note} onChangeText={setNote} />
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
      <Button
        label="Create"
        disabled={busy}
        onPress={() => {
          setBusy(true);
          setError(null);
          void (async () => {
            if (!selectedAccount) throw new Error('Create an account first');
            if (mode === 'TRANSFER' && !selectedDestination) {
              throw new Error('Choose a destination account');
            }
            await recurringRules.create({
              type:
                mode === 'TRANSFER'
                  ? TransactionType.TRANSFER
                  : mode === 'INCOME'
                    ? TransactionType.INCOME
                    : TransactionType.EXPENSE,
              name,
              amount,
              currency: settings?.baseCurrency ?? 'BDT',
              accountId: selectedAccount,
              destinationAccountId: selectedDestination,
              categoryId: mode === 'TRANSFER' ? null : categoryId ?? categoryOptions[0]?.id ?? null,
              frequency,
              startDate,
              note,
            });
            refresh();
            router.back();
          })()
            .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not save'))
            .finally(() => setBusy(false));
        }}
      />
    </ScrollScreen>
  );
}

function ChipRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ id: string; name: string }>;
  value?: string;
  onChange: (id: string) => void;
}) {
  const { colors, spacing, typography, radius } = useTokens();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={[typography.caption, { color: colors.textSecondary }]}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {options.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: radius.pill,
              backgroundColor: value === option.id ? colors.primary : colors.surfaceMuted,
            }}
          >
            <Text style={{ color: value === option.id ? colors.primaryForeground : colors.textPrimary }}>
              {option.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
