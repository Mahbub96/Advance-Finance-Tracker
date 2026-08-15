import {
  CategoryKind,
  RecurringFrequency,
  type RecurringFrequency as RecurringFrequencyType,
  TransactionType,
  formatMoneyDisplay,
} from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { DatePickerInput } from '../../src/components/DatePickerInput';
import { Input } from '../../src/components/Input';
import { Screen } from '../../src/components/Screen';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { TextArea } from '../../src/components/TextArea';
import { todayIsoDate } from '../../src/lib/clock';
import { isPositiveMoney, validateIsoDate } from '../../src/lib/form-validation';
import { useAccounts } from '../../src/hooks/use-accounts';
import { useCategories } from '../../src/hooks/use-categories';
import { useSettings } from '../../src/hooks/use-settings';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

type Mode = 'EXPENSE' | 'INCOME' | 'TRANSFER';

const RECURRING_PRESETS = [
  { name: 'Internet Bill', amount: '1200', freq: RecurringFrequency.MONTHLY, icon: '🌐' },
  { name: 'Electricity Bill', amount: '2500', freq: RecurringFrequency.MONTHLY, icon: '⚡' },
  { name: 'Mobile Recharge', amount: '500', freq: RecurringFrequency.MONTHLY, icon: '📱' },
  { name: 'Streaming Subscription', amount: '1100', freq: RecurringFrequency.MONTHLY, icon: '🎬' },
  { name: 'Gym Membership', amount: '2000', freq: RecurringFrequency.MONTHLY, icon: '🏋️' },
];

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
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const currency = settings?.baseCurrency ?? 'BDT';
  const selectedAccount = accounts.find((a) => a.id === (accountId ?? accounts[0]?.id));
  const availableDestinations = accounts.filter((a) => a.id !== selectedAccount?.id);
  const selectedDestination = accounts.find(
    (a) => a.id === (destinationId ?? availableDestinations[0]?.id),
  );

  const categoryOptions = useMemo(
    () =>
      categories.filter((category) =>
        mode === 'EXPENSE'
          ? category.type === CategoryKind.EXPENSE
          : category.type === CategoryKind.INCOME,
      ),
    [categories, mode],
  );

  const selectedCategory = categoryOptions.find(
    (c) => c.id === (categoryId ?? categoryOptions[0]?.id),
  );

  // --- Real-time Field Validation ---
  const isAmountValid = isPositiveMoney(amount);
  const amountError = submitted && !isAmountValid ? 'Enter a valid amount greater than 0' : null;
  const nameError = submitted && !name.trim() ? 'Rule title is required' : null;
  const dateValidation = validateIsoDate(startDate, { required: true, label: 'Start date' });
  const dateError = submitted && !dateValidation.valid ? dateValidation.message : null;
  const accountError = submitted && !selectedAccount ? 'Select an account' : null;

  const modeOptions = [
    { id: 'EXPENSE' as const, label: '💸 Expense' },
    { id: 'INCOME' as const, label: '💰 Income' },
    { id: 'TRANSFER' as const, label: '🔁 Transfer' },
  ];

  const handleApplyPreset = (preset: (typeof RECURRING_PRESETS)[0]) => {
    setName(preset.name);
    setAmount(preset.amount);
    setFrequency(preset.freq);
    if (submitted) setSubmitted(false);
  };

  const handleCreate = async () => {
    setSubmitted(true);

    if (!name.trim() || !isAmountValid || !dateValidation.valid || !selectedAccount) {
      return;
    }

    if (
      mode === 'TRANSFER' &&
      (!selectedDestination || selectedDestination.id === selectedAccount.id)
    ) {
      return;
    }

    setBusy(true);

    try {
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
        accountId: selectedAccount.id,
        destinationAccountId: mode === 'TRANSFER' ? selectedDestination?.id : undefined,
        categoryId: mode === 'TRANSFER' ? null : (selectedCategory?.id ?? null),
        frequency,
        startDate: startDate.trim(),
        note: note.trim() || undefined,
      });

      refresh();
      router.back();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Could not create recurring rule');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.xxl }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ gap: 2 }}>
            <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
              AUTOMATION & SCHEDULES
            </Text>
            <Text style={[typography.title, { color: colors.textPrimary }]}>
              New Recurring Rule
            </Text>
          </View>

          {/* Mode Switcher */}
          <SegmentedControl
            options={modeOptions}
            value={mode}
            onChange={(val) => {
              setMode(val);
              setCategoryId(undefined);
              if (submitted) setSubmitted(false);
            }}
          />

          {/* Preset Chips */}
          <View style={{ gap: spacing.xs }}>
            <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
              Common Recurring Bills
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.xs }}
            >
              {RECURRING_PRESETS.map((preset) => (
                <Pressable
                  key={preset.name}
                  onPress={() => handleApplyPreset(preset)}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radius.pill,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 13 }}>{preset.icon}</Text>
                  <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '500' }}>
                    {preset.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Form Card */}
          <Card style={{ gap: spacing.md, backgroundColor: colors.surfaceElevated }}>
            <Input
              label="Rule Title"
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (submitted) setSubmitted(false);
              }}
              placeholder="e.g. Internet Bill, Office Rent, Monthly Salary"
              error={nameError}
              clearable
              onClear={() => setName('')}
            />

            <Input
              label="Amount"
              value={amount}
              onChangeText={(t) => {
                setAmount(t);
                if (submitted) setSubmitted(false);
              }}
              keyboardType="decimal-pad"
              placeholder="2000"
              prefix={currency}
              error={amountError}
              clearable
              onClear={() => setAmount('')}
            />

            <DatePickerInput
              label="Start / Anchor Date"
              value={startDate}
              onChangeDate={setStartDate}
              error={dateError}
              helperText="The recurring rule countdown triggers from this date."
            />

            {/* Frequency Chips */}
            <View style={{ gap: spacing.xs }}>
              <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                Frequency Interval
              </Text>
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
              {accountError && (
                <Text style={{ color: colors.danger, fontSize: 12 }}>⚠️ {accountError}</Text>
              )}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {accounts.map((acc) => {
                  const isSelected = selectedAccount?.id === acc.id;
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
                        {acc.name} ({formatMoneyDisplay(acc.balance, acc.currency)})
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Destination or Category */}
            {mode === 'TRANSFER' ? (
              <View style={{ gap: spacing.xs }}>
                <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                  To Account
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {availableDestinations.map((acc) => {
                    const isSelected = selectedDestination?.id === acc.id;
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
                    const isSelected = selectedCategory?.id === cat.id;
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
                        <Text style={{ fontSize: 14 }}>{cat.icon || '🏷️'}</Text>
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

            <TextArea
              label="Note (Optional)"
              value={note}
              onChangeText={setNote}
              placeholder="e.g. Due every 1st of month"
              maxLength={200}
              clearable
              onClear={() => setNote('')}
            />
          </Card>

          {/* Submit Action */}
          <Button
            label={busy ? 'Saving...' : 'Create Recurring Rule'}
            loading={busy}
            onPress={() => void handleCreate()}
            size="lg"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
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
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
});
