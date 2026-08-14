import {
  CategoryKind,
  RecurringFrequency,
  type RecurringFrequency as RecurringFrequencyType,
  TransactionType,
} from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { ScrollScreen } from '../../src/components/Screen';
import { SegmentedControl } from '../../src/components/SegmentedControl';
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

  const currency = settings?.baseCurrency ?? 'BDT';
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

  const selectedCategory = categoryId ?? categoryOptions[0]?.id;

  const modeOptions = [
    { id: 'EXPENSE' as const, label: '💸 Expense' },
    { id: 'INCOME' as const, label: '💰 Income' },
    { id: 'TRANSFER' as const, label: '🔁 Transfer' },
  ];

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Please provide a title for the recurring rule');
      return;
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!selectedAccount) {
      setError('Please choose a valid account');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      if (mode === 'TRANSFER' && !selectedDestination) {
        throw new Error('Please select a destination account');
      }

      await recurringRules.create({
        type:
          mode === 'TRANSFER'
            ? TransactionType.TRANSFER
            : mode === 'INCOME'
              ? TransactionType.INCOME
              : TransactionType.EXPENSE,
        name: name.trim(),
        amount: amount.trim(),
        currency,
        accountId: selectedAccount,
        destinationAccountId: selectedDestination,
        categoryId: mode === 'TRANSFER' ? null : (selectedCategory ?? null),
        frequency,
        startDate: startDate.trim(),
        note: note.trim() || undefined,
      });

      refresh();
      router.back();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not create recurring rule');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollScreen>
      <View style={{ gap: 2 }}>
        <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
          AUTOMATION & SCHEDULES
        </Text>
        <Text style={[typography.title, { color: colors.textPrimary }]}>New Recurring Rule</Text>
      </View>

      {/* Mode Switcher */}
      <SegmentedControl
        options={modeOptions}
        value={mode}
        onChange={(val) => {
          setMode(val);
          setCategoryId(undefined);
        }}
      />

      <Card style={{ gap: spacing.md, backgroundColor: colors.surfaceElevated }}>
        <Input
          label="Rule Title"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Internet Bill, Office Rent, Monthly Salary"
        />

        <Input
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="2000"
          prefix={currency}
        />

        <Input
          label="Start / Anchor Date (YYYY-MM-DD)"
          value={startDate}
          onChangeText={setStartDate}
        />

        {/* Frequency Chips */}
        <View style={{ gap: spacing.xs }}>
          <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>Frequency</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {Object.values(RecurringFrequency).map((item) => {
              const isSelected = frequency === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setFrequency(item as RecurringFrequencyType)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: radius.md,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isSelected ? colors.primaryForeground : colors.textPrimary,
                      fontWeight: isSelected ? '600' : '400',
                      fontSize: 13,
                    }}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Account Selection */}
        <View style={{ gap: spacing.xs }}>
          <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
            {mode === 'TRANSFER' ? 'From Account' : 'Account'}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {accounts.map((acc) => {
              const isSelected = selectedAccount === acc.id;
              return (
                <Pressable
                  key={acc.id}
                  onPress={() => setAccountId(acc.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: radius.md,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isSelected ? colors.primaryForeground : colors.textPrimary,
                      fontWeight: isSelected ? '600' : '400',
                      fontSize: 13,
                    }}
                  >
                    {acc.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Destination Account or Category */}
        {mode === 'TRANSFER' ? (
          <View style={{ gap: spacing.xs }}>
            <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
              To Account
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {accounts
                .filter((acc) => acc.id !== selectedAccount)
                .map((acc) => {
                  const isSelected = selectedDestination === acc.id;
                  return (
                    <Pressable
                      key={acc.id}
                      onPress={() => setDestinationId(acc.id)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surface,
                          borderColor: isSelected ? colors.primary : colors.border,
                          borderRadius: radius.md,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: isSelected ? colors.primaryForeground : colors.textPrimary,
                          fontWeight: isSelected ? '600' : '400',
                          fontSize: 13,
                        }}
                      >
                        {acc.name}
                      </Text>
                    </Pressable>
                  );
                })}
            </View>
          </View>
        ) : (
          <View style={{ gap: spacing.xs }}>
            <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
              Category
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {categoryOptions.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategoryId(cat.id)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: radius.md,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: isSelected ? colors.primaryForeground : colors.textPrimary,
                        fontWeight: isSelected ? '600' : '400',
                        fontSize: 13,
                      }}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        <Input
          label="Note (Optional)"
          value={note}
          onChangeText={setNote}
          placeholder="e.g. Due every 1st of month"
        />
      </Card>

      {error ? (
        <View
          style={{
            backgroundColor: colors.dangerMuted,
            padding: spacing.md,
            borderRadius: radius.md,
          }}
        >
          <Text style={{ color: colors.danger, fontSize: 13 }}>⚠️ {error}</Text>
        </View>
      ) : null}

      <Button
        label={busy ? 'Saving...' : 'Create Recurring Rule'}
        loading={busy}
        onPress={() => void handleCreate()}
        size="lg"
      />
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
