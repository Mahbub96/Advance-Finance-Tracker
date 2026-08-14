import { DebtType, type DebtType as DebtTypeEnum } from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { ScrollScreen } from '../../src/components/Screen';
import { SegmentedControl } from '../../src/components/SegmentedControl';
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
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const currency = settings?.baseCurrency ?? 'BDT';

  const typeOptions: Array<{ id: DebtTypeEnum; label: string }> = [
    { id: DebtType.LENT, label: '🤝 I Lent Money' },
    { id: DebtType.BORROWED, label: '⏳ I Borrowed' },
  ];

  const handleCreate = async () => {
    if (!personName.trim()) {
      setError('Please provide person name');
      return;
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setBusy(true);
    setError(null);

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
      setError(err instanceof Error ? err.message : 'Could not save debt record');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollScreen>
      <View style={{ gap: 2 }}>
        <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
          LOAN RECORDING
        </Text>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Record Loan / Debt</Text>
      </View>

      {/* Segmented Loan Type */}
      <SegmentedControl options={typeOptions} value={type} onChange={setType} />

      <Card style={{ gap: spacing.md, backgroundColor: colors.surfaceElevated }}>
        <Input
          label={
            type === DebtType.LENT ? 'Borrower Name (Who took money)' : 'Lender Name (Who lent you)'
          }
          value={personName}
          onChangeText={setPersonName}
          placeholder="e.g. Tanvir, Rahim, Acme Bank"
        />

        <Input
          label="Principal Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="5000"
          prefix={currency}
        />

        <Input
          label="Expected Due Date (Optional, YYYY-MM-DD)"
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="2026-09-30"
          helperText="Used to track pending repayments and overdue alerts."
        />

        <Input
          label="Note (Optional)"
          value={note}
          onChangeText={setNote}
          placeholder="e.g. Shared dinner split, Project advance"
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
                No cash impact
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
                    {acc.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
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
        label={busy ? 'Saving...' : 'Record Loan'}
        loading={busy}
        onPress={() => void handleCreate()}
        size="lg"
      />
    </ScrollScreen>
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
