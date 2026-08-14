import {
  DebtType,
  type DebtType as DebtTypeEnum,
  formatMoneyDisplay,
} from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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
import { useAccounts } from '../../src/hooks/use-accounts';
import { useSettings } from '../../src/hooks/use-settings';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

export default function NewDebtScreen() {
  const { colors, spacing, typography, radius } = useTokens();
  const { debts, refresh } = useFinance();
  const { accounts } = useAccounts();
  const { settings } = useSettings();
  const router = useRouter();

  const [type, setType] = useState<DebtTypeEnum>(DebtType.LENT);
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const currency = settings?.baseCurrency ?? 'BDT';

  // --- Real-time Validation ---
  const numAmount = parseFloat(amount);
  const isAmountValid = !isNaN(numAmount) && numAmount > 0;
  const amountError = submitted && !isAmountValid ? 'Enter a valid amount greater than 0' : null;
  const nameError = submitted && !personName.trim() ? 'Name of person or entity is required' : null;
  const isDateValid = !dueDate.trim() || /^\d{4}-\d{2}-\d{2}$/.test(dueDate.trim());
  const dateError = submitted && !isDateValid ? 'Use valid date format YYYY-MM-DD' : null;

  const typeOptions: Array<{ id: DebtTypeEnum; label: string }> = [
    { id: DebtType.LENT, label: '🤝 I Lent Money' },
    { id: DebtType.BORROWED, label: '⏳ I Borrowed' },
  ];

  const handleCreate = async () => {
    setSubmitted(true);

    if (!personName.trim() || !isAmountValid || !isDateValid) {
      return;
    }

    setBusy(true);

    try {
      await debts.create({
        type,
        personName: personName.trim(),
        amount: amount.trim(),
        currency,
        dueDate: dueDate.trim() || null,
        accountId,
        note: note.trim() || undefined,
      });
      refresh();
      router.back();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Could not save debt record');
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
              LOAN RECORDING
            </Text>
            <Text style={[typography.title, { color: colors.textPrimary }]}>
              Record Loan / Debt
            </Text>
          </View>

          {/* Segmented Loan Type */}
          <SegmentedControl
            options={typeOptions}
            value={type}
            onChange={(t) => {
              setType(t);
              if (submitted) setSubmitted(false);
            }}
          />

          {/* Form Card */}
          <Card style={{ gap: spacing.md, backgroundColor: colors.surfaceElevated }}>
            <Input
              label={
                type === DebtType.LENT
                  ? 'Borrower Name (Who took money)'
                  : 'Lender Name (Who lent you)'
              }
              value={personName}
              onChangeText={(t) => {
                setPersonName(t);
                if (submitted) setSubmitted(false);
              }}
              placeholder="e.g. Tanvir, Rahim, City Bank"
              error={nameError}
              clearable
              onClear={() => setPersonName('')}
            />

            <Input
              label="Principal Amount"
              value={amount}
              onChangeText={(t) => {
                setAmount(t);
                if (submitted) setSubmitted(false);
              }}
              keyboardType="decimal-pad"
              placeholder="5000"
              prefix={currency}
              error={amountError}
              clearable
              onClear={() => setAmount('')}
            />

            <DatePickerInput
              label="Expected Due Date (Optional)"
              value={dueDate}
              onChangeDate={(t) => {
                setDueDate(t);
                if (submitted) setSubmitted(false);
              }}
              error={dateError}
              helperText="Used to track pending repayments and overdue alerts."
            />

            <TextArea
              label="Note (Optional)"
              value={note}
              onChangeText={setNote}
              placeholder="e.g. Shared dinner split, Project advance"
              maxLength={200}
              clearable
              onClear={() => setNote('')}
            />

            {/* Account selection */}
            <View style={{ gap: spacing.xs }}>
              <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                Settlement Account (Optional)
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                <Pressable
                  onPress={() => setAccountId(null)}
                  style={[
                    styles.accountChip,
                    {
                      backgroundColor: accountId === null ? colors.primary : colors.surface,
                      borderColor: accountId === null ? colors.primary : colors.border,
                      borderRadius: radius.md,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: accountId === null ? colors.primaryForeground : colors.textPrimary,
                      fontWeight: accountId === null ? '600' : '400',
                      fontSize: 13,
                    }}
                  >
                    No cash balance impact
                  </Text>
                </Pressable>

                {accounts.map((acc) => {
                  const isSelected = accountId === acc.id;
                  return (
                    <Pressable
                      key={acc.id}
                      onPress={() => setAccountId(acc.id)}
                      style={[
                        styles.accountChip,
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
          </Card>

          {/* Submit Action */}
          <Button
            label={busy ? 'Saving...' : 'Record Loan'}
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
  accountChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
