import { TransactionType, formatMoneyDisplay, parseMoney } from '@personal-finance/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { DatePickerInput } from '../../src/components/DatePickerInput';
import { Input } from '../../src/components/Input';
import { Screen } from '../../src/components/Screen';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { TextArea } from '../../src/components/TextArea';
import { todayIsoDate } from '../../src/lib/clock';
import { useAccounts } from '../../src/hooks/use-accounts';
import { useCategories } from '../../src/hooks/use-categories';
import { useSettings } from '../../src/hooks/use-settings';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

type Mode = 'EXPENSE' | 'INCOME' | 'TRANSFER';

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

function getAccountIcon(type: string): string {
  switch (type) {
    case 'CASH':
      return '💵';
    case 'BANK':
      return '🏦';
    case 'WALLET':
      return '📱';
    case 'SAVINGS':
      return '🐖';
    case 'CREDIT':
      return '💳';
    default:
      return '📂';
  }
}

export default function AddTransactionScreen() {
  const { colors, spacing, typography, radius } = useTokens();
  const { transactions, refresh } = useFinance();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { settings } = useSettings();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; initialAmount?: string }>();

  const amountInputRef = useRef<TextInput>(null);

  const [mode, setMode] = useState<Mode>(
    params.mode === 'INCOME' ? 'INCOME' : params.mode === 'TRANSFER' ? 'TRANSFER' : 'EXPENSE',
  );
  const [amount, setAmount] = useState(params.initialAmount ?? '');
  const [accountId, setAccountId] = useState<string | undefined>();
  const [destinationId, setDestinationId] = useState<string | undefined>();
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [merchantName, setMerchantName] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayIsoDate());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currency = settings?.baseCurrency ?? 'BDT';

  // Auto-focus the amount field on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      amountInputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const defaultAccount = accounts.find((a) => a.id === settings?.defaultAccountId) ?? accounts[0];
  const selectedAccount = accounts.find((a) => a.id === (accountId ?? defaultAccount?.id));

  const availableDestinations = accounts.filter((a) => a.id !== selectedAccount?.id);
  const selectedDestination = accounts.find(
    (a) => a.id === (destinationId ?? availableDestinations[0]?.id),
  );

  const categoryOptions = useMemo(() => {
    return categories.filter((category) =>
      mode === 'EXPENSE' ? category.type === 'EXPENSE' : category.type === 'INCOME',
    );
  }, [categories, mode]);

  const selectedCategory = categoryOptions.find(
    (c) => c.id === (categoryId ?? categoryOptions[0]?.id),
  );

  // Field Validations
  const numAmount = parseFloat(amount);
  const isAmountValid = !isNaN(numAmount) && numAmount > 0 && numAmount <= 100000000;
  const amountError = submitted && !isAmountValid ? 'Enter a valid amount greater than 0' : null;
  const accountError = submitted && !selectedAccount ? 'Select an account' : null;
  const categoryError =
    submitted && mode !== 'TRANSFER' && !selectedCategory ? 'Select a category' : null;
  const destinationError =
    submitted &&
    mode === 'TRANSFER' &&
    (!selectedDestination || selectedDestination.id === selectedAccount?.id)
      ? 'Choose a different destination'
      : null;

  // Real-time Balance Projection
  const projectedBalance = useMemo(() => {
    if (!selectedAccount || isNaN(numAmount) || numAmount <= 0) return null;
    const current = parseMoney(selectedAccount.balance);
    const delta = parseMoney(amount);

    if (mode === 'INCOME') {
      return current.plus(delta).toString();
    } else {
      return current.minus(delta).toString();
    }
  }, [selectedAccount, amount, numAmount, mode]);

  const modeOptions = [
    { id: 'EXPENSE' as const, label: '💸 Expense' },
    { id: 'INCOME' as const, label: '💰 Income' },
    { id: 'TRANSFER' as const, label: '🔁 Transfer' },
  ];

  const handleAddQuickAmount = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + val));
  };

  const handleSave = async () => {
    setSubmitted(true);

    if (!isAmountValid || !selectedAccount) {
      return;
    }

    if (mode !== 'TRANSFER' && !selectedCategory) {
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
      if (mode === 'TRANSFER') {
        await transactions.createTransfer({
          sourceAccountId: selectedAccount.id,
          destinationAccountId: selectedDestination!.id,
          amount: amount.trim(),
          transactionDate: date.trim(),
          note: note.trim() || undefined,
        });
      } else {
        await transactions.createEntry({
          type: mode === 'INCOME' ? TransactionType.INCOME : TransactionType.EXPENSE,
          accountId: selectedAccount.id,
          categoryId: selectedCategory?.id ?? null,
          merchantName: merchantName.trim() || undefined,
          amount: amount.trim(),
          transactionDate: date.trim(),
          note: note.trim() || undefined,
        });
      }

      refresh();
      setSavedSuccess(true);
      setTimeout(() => {
        router.back();
      }, 400);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Could not save transaction');
      setBusy(false);
    }
  };

  const modeActionLabel =
    mode === 'TRANSFER' ? 'Save Transfer' : mode === 'INCOME' ? 'Save Income' : 'Save Expense';

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xxl }}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar Header */}
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
              QUICK TRANSACTION
            </Text>
            <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>✕</Text>
            </Pressable>
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

          {/* 1. Calculator-Style Big Amount Input Display */}
          <Card
            style={[
              styles.amountCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: amountError ? colors.danger : colors.border,
              },
            ]}
          >
            <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
              Amount ({currency})
            </Text>

            <View style={styles.amountInputRow}>
              <Text
                style={[
                  styles.currencySymbol,
                  {
                    color:
                      mode === 'INCOME'
                        ? colors.income
                        : mode === 'TRANSFER'
                          ? colors.primary
                          : colors.expense,
                  },
                ]}
              >
                {mode === 'INCOME' ? '+' : mode === 'TRANSFER' ? '⇄' : '-'}{' '}
                {currency === 'BDT' ? '৳' : currency}
              </Text>
              <TextInput
                ref={amountInputRef}
                value={amount}
                onChangeText={(t) => {
                  setAmount(t);
                  if (submitted) setSubmitted(false);
                }}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textTertiary}
                style={[styles.bigAmountText, { color: colors.textPrimary }]}
                selectionColor={colors.primary}
              />
            </View>

            {/* Quick Increment Chips */}
            <View style={{ flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap', marginTop: 4 }}>
              {QUICK_AMOUNTS.map((val) => (
                <Pressable
                  key={val}
                  onPress={() => handleAddQuickAmount(val)}
                  style={[
                    styles.quickChip,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radius.pill,
                    },
                  ]}
                >
                  <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '500' }}>
                    +{val >= 1000 ? `${val / 1000}k` : val}
                  </Text>
                </Pressable>
              ))}
              {amount ? (
                <Pressable
                  onPress={() => setAmount('')}
                  style={[
                    styles.quickChip,
                    {
                      backgroundColor: colors.surfaceMuted,
                      borderColor: colors.border,
                      borderRadius: radius.pill,
                    },
                  ]}
                >
                  <Text style={{ color: colors.danger, fontSize: 12, fontWeight: '500' }}>
                    Clear
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {/* Projected Balance Preview */}
            {projectedBalance && selectedAccount ? (
              <View style={styles.projectionRow}>
                <Text style={[typography.micro, { color: colors.textTertiary }]}>
                  {selectedAccount.name} Balance:{' '}
                  {formatMoneyDisplay(selectedAccount.balance, selectedAccount.currency)} →
                </Text>
                <Text
                  style={[
                    typography.captionMedium,
                    {
                      color: parseFloat(projectedBalance) >= 0 ? colors.textPrimary : colors.danger,
                    },
                  ]}
                >
                  {formatMoneyDisplay(projectedBalance, selectedAccount.currency)}
                </Text>
              </View>
            ) : null}

            {amountError && (
              <Text style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>
                ⚠️ {amountError}
              </Text>
            )}
          </Card>

          {/* 2. Fast 1-Tap Category Selector */}
          {mode !== 'TRANSFER' && (
            <View style={{ gap: spacing.xs }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                  Category {selectedCategory ? `(${selectedCategory.name})` : ''}
                </Text>
              </View>
              {categoryError && (
                <Text style={{ color: colors.danger, fontSize: 12 }}>⚠️ {categoryError}</Text>
              )}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.xs }}
              >
                {categoryOptions.map((cat) => {
                  const isSelected = selectedCategory?.id === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => {
                        setCategoryId(cat.id);
                        if (submitted) setSubmitted(false);
                      }}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surface,
                          borderColor: isSelected ? colors.primary : colors.border,
                          borderRadius: radius.md,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 15 }}>{cat.icon || '🏷️'}</Text>
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
              </ScrollView>
            </View>
          )}

          {/* 3. Fast 1-Tap Account Selector */}
          <View style={{ gap: spacing.xs }}>
            <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
              {mode === 'TRANSFER' ? 'From Account' : 'Account'}{' '}
              {selectedAccount ? `(${selectedAccount.name})` : ''}
            </Text>
            {accountError && (
              <Text style={{ color: colors.danger, fontSize: 12 }}>⚠️ {accountError}</Text>
            )}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.xs }}
            >
              {accounts.map((acc) => {
                const isSelected = selectedAccount?.id === acc.id;
                const icon = getAccountIcon(acc.type);
                return (
                  <Pressable
                    key={acc.id}
                    onPress={() => {
                      setAccountId(acc.id);
                      if (submitted) setSubmitted(false);
                    }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: radius.md,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 15 }}>{icon}</Text>
                    <View>
                      <Text
                        style={{
                          color: isSelected ? colors.primaryForeground : colors.textPrimary,
                          fontWeight: isSelected ? '600' : '500',
                          fontSize: 13,
                        }}
                      >
                        {acc.name}
                      </Text>
                      <Text
                        style={{
                          color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textTertiary,
                          fontSize: 10,
                        }}
                      >
                        {formatMoneyDisplay(acc.balance, acc.currency)}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Destination Selector if Transfer */}
          {mode === 'TRANSFER' && (
            <View style={{ gap: spacing.xs }}>
              <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                To Destination Account
              </Text>
              {destinationError && (
                <Text style={{ color: colors.danger, fontSize: 12 }}>⚠️ {destinationError}</Text>
              )}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.xs }}
              >
                {availableDestinations.map((acc) => {
                  const isSelected = selectedDestination?.id === acc.id;
                  const icon = getAccountIcon(acc.type);
                  return (
                    <Pressable
                      key={acc.id}
                      onPress={() => {
                        setDestinationId(acc.id);
                        if (submitted) setSubmitted(false);
                      }}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surface,
                          borderColor: isSelected ? colors.primary : colors.border,
                          borderRadius: radius.md,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 15 }}>{icon}</Text>
                      <View>
                        <Text
                          style={{
                            color: isSelected ? colors.primaryForeground : colors.textPrimary,
                            fontWeight: isSelected ? '600' : '500',
                            fontSize: 13,
                          }}
                        >
                          {acc.name}
                        </Text>
                        <Text
                          style={{
                            color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textTertiary,
                            fontSize: 10,
                          }}
                        >
                          {formatMoneyDisplay(acc.balance, acc.currency)}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* 4. Date Shortcut Row */}
          <View style={{ gap: spacing.xs }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>Date</Text>
              <Text style={[typography.micro, { color: colors.textTertiary }]}>{date}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.xs }}>
              {[
                { label: 'Today', val: todayIsoDate() },
                {
                  label: 'Yesterday',
                  val: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
                },
              ].map((d) => {
                const isSelected = date === d.val;
                return (
                  <Pressable
                    key={d.label}
                    onPress={() => setDate(d.val)}
                    style={[
                      styles.dateChip,
                      {
                        backgroundColor: isSelected ? colors.surfaceElevated : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: radius.pill,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: isSelected ? colors.primary : colors.textSecondary,
                        fontSize: 12,
                        fontWeight: isSelected ? '600' : '400',
                      }}
                    >
                      {d.label}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                onPress={() => setShowAdvanced(true)}
                style={[
                  styles.dateChip,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.pill,
                  },
                ]}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Custom Date...</Text>
              </Pressable>
            </View>
          </View>

          {/* 5. Collapsible "More Details" Toggle */}
          <Pressable
            onPress={() => setShowAdvanced((prev) => !prev)}
            style={{
              paddingVertical: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Text style={[typography.captionMedium, { color: colors.primary }]}>
              {showAdvanced ? '▴ Hide Extra Details' : '▾ More Details (Merchant, Note, Date)'}
            </Text>
          </Pressable>

          {/* Advanced Details Accordion */}
          {showAdvanced && (
            <Card style={{ gap: spacing.md, backgroundColor: colors.surfaceElevated }}>
              <DatePickerInput label="Custom Date" value={date} onChangeDate={setDate} />

              {mode !== 'TRANSFER' && (
                <Input
                  label="Merchant / Payee (Optional)"
                  placeholder="e.g. Star Kebabs, Netflix, Supermarket"
                  value={merchantName}
                  onChangeText={setMerchantName}
                  clearable
                  onClear={() => setMerchantName('')}
                />
              )}

              <TextArea
                label="Note (Optional)"
                placeholder="Dinner with team, office split..."
                value={note}
                onChangeText={setNote}
                maxLength={200}
                clearable
                onClear={() => setNote('')}
              />
            </Card>
          )}

          {/* 6. Dominant, Big One-Tap Save Action Button */}
          <Button
            label={savedSuccess ? '✓ Saved!' : busy ? 'Saving...' : modeActionLabel}
            loading={busy}
            onPress={() => void handleSave()}
            size="lg"
            variant={savedSuccess ? 'secondary' : 'primary'}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  amountCard: {
    padding: 16,
    gap: 8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
  },
  bigAmountText: {
    flex: 1,
    fontSize: 36,
    fontWeight: '800',
    paddingVertical: 0,
  },
  quickChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderWidth: 1,
  },
  dateChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  projectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
});
