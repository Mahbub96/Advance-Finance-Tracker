import { TransactionType } from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { ScrollScreen } from '../../src/components/Screen';
import { todayIsoDate } from '../../src/lib/clock';
import { useAccounts } from '../../src/hooks/use-accounts';
import { useCategories } from '../../src/hooks/use-categories';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

type Mode = 'EXPENSE' | 'INCOME' | 'TRANSFER';

export default function AddScreen() {
  const { colors, spacing, typography, radius } = useTokens();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { transactions, refresh } = useFinance();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [accountId, setAccountId] = useState<string | undefined>();
  const [destinationId, setDestinationId] = useState<string | undefined>();
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedAccount = accountId ?? accounts[0]?.id;
  const selectedDestination = destinationId ?? accounts.find((a) => a.id !== selectedAccount)?.id;
  const categoryOptions = useMemo(
    () => categories.filter((c) => c.type === mode),
    [categories, mode],
  );

  return (
    <ScrollScreen>
      <Text style={[typography.title, { color: colors.textPrimary }]}>Add</Text>
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
      <Input label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
      <ChipRow
        label={mode === 'TRANSFER' ? 'From' : 'Account'}
        options={accounts.map((a) => ({ id: a.id, name: a.name }))}
        value={selectedAccount}
        onChange={setAccountId}
      />
      {mode === 'TRANSFER' ? (
        <ChipRow
          label="To"
          options={accounts
            .filter((a) => a.id !== selectedAccount)
            .map((a) => ({ id: a.id, name: a.name }))}
          value={selectedDestination}
          onChange={setDestinationId}
        />
      ) : (
        <ChipRow
          label="Category"
          options={categoryOptions.map((c) => ({ id: c.id, name: c.name }))}
          value={categoryId ?? categoryOptions[0]?.id}
          onChange={setCategoryId}
        />
      )}
      <Input label="Note (optional)" value={note} onChangeText={setNote} />
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
      <Button
        label="Save"
        disabled={busy}
        onPress={() => {
          setBusy(true);
          setError(null);
          void (async () => {
            if (!selectedAccount) throw new Error('Create an account first');
            if (mode === 'TRANSFER') {
              if (!selectedDestination) throw new Error('Choose a destination account');
              await transactions.createTransfer({
                sourceAccountId: selectedAccount,
                destinationAccountId: selectedDestination,
                amount,
                transactionDate: todayIsoDate(),
                note,
              });
            } else {
              await transactions.createEntry({
                type: mode === 'INCOME' ? TransactionType.INCOME : TransactionType.EXPENSE,
                accountId: selectedAccount,
                amount,
                transactionDate: todayIsoDate(),
                categoryId: categoryId ?? categoryOptions[0]?.id ?? null,
                note,
              });
            }
            refresh();
            router.replace('/(tabs)/transactions');
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
