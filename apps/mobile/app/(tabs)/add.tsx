import { TransactionType } from '@personal-finance/types';
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

export default function AddScreen() {
  const { colors, spacing, typography, radius } = useTokens();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { settings } = useSettings();
  const { transactions, refresh } = useFinance();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [accountId, setAccountId] = useState<string | undefined>();
  const [destinationId, setDestinationId] = useState<string | undefined>();
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const currency = settings?.baseCurrency ?? 'BDT';
  const selectedAccount = accountId ?? accounts[0]?.id;
  const selectedDestination = destinationId ?? accounts.find((a) => a.id !== selectedAccount)?.id;

  const categoryOptions = useMemo(
    () => categories.filter((c) => c.type === (mode === 'INCOME' ? 'INCOME' : 'EXPENSE')),
    [categories, mode],
  );

  const selectedCategory = categoryId ?? categoryOptions[0]?.id;

  const modeOptions = [
    { id: 'EXPENSE' as const, label: '💸 Expense' },
    { id: 'INCOME' as const, label: '💰 Income' },
    { id: 'TRANSFER' as const, label: '🔁 Transfer' },
  ];

  const handleSave = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!selectedAccount) {
      setError('Please select or create an account first');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      if (mode === 'TRANSFER') {
        if (!selectedDestination) {
          throw new Error('Please choose a destination account');
        }
        await transactions.createTransfer({
          sourceAccountId: selectedAccount,
          destinationAccountId: selectedDestination,
          amount,
          transactionDate: todayIsoDate(),
          note: note.trim() || undefined,
        });
      } else {
        await transactions.createEntry({
          type: mode === 'INCOME' ? TransactionType.INCOME : TransactionType.EXPENSE,
          accountId: selectedAccount,
          amount,
          transactionDate: todayIsoDate(),
          categoryId: selectedCategory ?? null,
          merchantName: merchantName.trim() || undefined,
          note: note.trim() || undefined,
        });
      }

      refresh();
      router.replace('/(tabs)/transactions');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not record transaction');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollScreen>
      {/* Screen Title */}
      <View style={{ gap: 2 }}>
        <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>RECORD ENTRY</Text>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Add Transaction</Text>
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

      {/* Amount Hero Input */}
      <Card style={{ backgroundColor: colors.surfaceElevated, gap: spacing.xs }}>
        <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>Amount</Text>
        <Input
          label=""
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          prefix={currency}
          style={{ fontSize: 24, fontWeight: '700' }}
        />
      </Card>

      {/* Account Selection */}
      <View style={{ gap: spacing.sm }}>
        <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
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
                    fontSize: 14,
                  }}
                >
                  {acc.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Transfer Destination or Category Selection */}
      {mode === 'TRANSFER' ? (
        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>To Account</Text>
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
                        fontSize: 14,
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
        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Category</Text>
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
                      fontSize: 14,
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

      {/* Merchant / Description */}
      {mode !== 'TRANSFER' && (
        <Input
          label="Merchant or Payee (Optional)"
          placeholder="e.g. Star Kebabs, Netflix, Supermarket"
          value={merchantName}
          onChangeText={setMerchantName}
        />
      )}

      <Input
        label="Note (Optional)"
        placeholder="Additional context..."
        value={note}
        onChangeText={setNote}
      />

      {/* Error Notice */}
      {error && (
        <View
          style={{
            backgroundColor: colors.dangerMuted,
            padding: spacing.md,
            borderRadius: radius.md,
          }}
        >
          <Text style={{ color: colors.danger, fontSize: 13 }}>⚠️ {error}</Text>
        </View>
      )}

      {/* Submit Button */}
      <Button
        label={busy ? 'Saving...' : `Save ${mode.toLowerCase()}`}
        loading={busy}
        onPress={() => void handleSave()}
        size="lg"
      />
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
