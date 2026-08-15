import { TransactionType, formatMoneyDisplay, parseMoney } from '@personal-finance/types';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { DatePickerInput } from '../../src/components/DatePickerInput';
import { Input } from '../../src/components/Input';
import { TextArea } from '../../src/components/TextArea';
import { todayIsoDate } from '../../src/lib/clock';
import { useAccounts } from '../../src/hooks/use-accounts';
import { useCategories } from '../../src/hooks/use-categories';
import { useSettings } from '../../src/hooks/use-settings';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

type Mode = 'EXPENSE' | 'INCOME' | 'TRANSFER';

const QUICK_AMOUNTS = [50, 100, 500, 1000, 5000];

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

const MODE_CONFIG: Record<
  Mode,
  { label: string; icon: string; colorKey: 'expense' | 'income' | 'primary'; prefix: string; gradient: [string, string] }
> = {
  EXPENSE: {
    label: 'Expense',
    icon: '💸',
    colorKey: 'expense',
    prefix: '−',
    gradient: ['#DC2626', '#EF4444'],
  },
  INCOME: {
    label: 'Income',
    icon: '💰',
    colorKey: 'income',
    prefix: '+',
    gradient: ['#059669', '#10B981'],
  },
  TRANSFER: {
    label: 'Transfer',
    icon: '🔁',
    colorKey: 'primary',
    prefix: '⇄',
    gradient: ['#1D4ED8', '#3B82F6'],
  },
};

export default function AddTransactionScreen() {
  const { colors, spacing, radius } = useTokens();
  const { transactions, refresh } = useFinance();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { settings } = useSettings();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; initialAmount?: string }>();

  const amountInputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

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

  // Reset form & unblock submission whenever this screen gains focus
  useFocusEffect(
    useCallback(() => {
      setBusy(false);
      setSavedSuccess(false);
      setSubmitted(false);
      if (params.mode === 'INCOME' || params.mode === 'TRANSFER' || params.mode === 'EXPENSE') {
        setMode(params.mode);
      }
      if (params.initialAmount !== undefined) {
        setAmount(params.initialAmount);
      }
    }, [params.mode, params.initialAmount]),
  );

  const currency = settings?.baseCurrency ?? 'BDT';
  const modeConf = MODE_CONFIG[mode];
  const modeColor = colors[modeConf.colorKey];

  // Entry animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, speed: 22, bounciness: 5, useNativeDriver: true }),
    ]).start();
  }, []);

  // Auto-focus the amount field on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      amountInputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Re-animate on mode change
  const animateMode = () => {
    slideAnim.setValue(8);
    fadeAnim.setValue(0.6);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, speed: 30, bounciness: 4, useNativeDriver: true }),
    ]).start();
  };

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

  const handleAddQuickAmount = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + val));
  };

  const handleSave = async () => {
    setSubmitted(true);
    if (!isAmountValid || !selectedAccount) return;
    if (mode !== 'TRANSFER' && !selectedCategory) return;
    if (
      mode === 'TRANSFER' &&
      (!selectedDestination || selectedDestination.id === selectedAccount.id)
    )
      return;

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
        setBusy(false);
        setSavedSuccess(false);
        setSubmitted(false);
        setAmount('');
        setMerchantName('');
        setNote('');
        router.back();
      }, 350);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Could not save transaction');
      setBusy(false);
      setSavedSuccess(false);
    }
  };

  const modeActionLabel =
    mode === 'TRANSFER' ? 'Save Transfer' : mode === 'INCOME' ? 'Save Income' : 'Save Expense';

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── HERO HEADER ─────────────────────────────────────────────── */}
        <View
          style={[
            styles.hero,
            {
              backgroundColor: modeColor,
              paddingTop: spacing.md,
              paddingHorizontal: spacing.lg,
              paddingBottom: spacing.xl,
            },
          ]}
        >
          {/* Top row: title + close */}
          <View style={styles.heroTopRow}>
            <View style={styles.heroTitleGroup}>
              <Text style={styles.heroEyebrow}>NEW TRANSACTION</Text>
              <Text style={styles.heroTitle}>{modeConf.icon} Add {modeConf.label}</Text>
            </View>
            <Pressable
              onPress={() => router.back()}
              style={[styles.closeBtn, { backgroundColor: 'rgba(255,255,255,0.18)' }]}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>✕</Text>
            </Pressable>
          </View>

          {/* Mode pill switcher */}
          <View style={[styles.modeSwitcher, { backgroundColor: 'rgba(0,0,0,0.18)' }]}>
            {(['EXPENSE', 'INCOME', 'TRANSFER'] as Mode[]).map((m) => {
              const conf = MODE_CONFIG[m];
              const isActive = mode === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => {
                    setMode(m);
                    setCategoryId(undefined);
                    if (submitted) setSubmitted(false);
                    animateMode();
                  }}
                  style={[
                    styles.modeTab,
                    isActive && styles.modeTabActive,
                  ]}
                >
                  <Text style={{ fontSize: 13 }}>{conf.icon}</Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: isActive ? '700' : '500',
                      color: isActive ? '#1A1A2E' : 'rgba(255,255,255,0.75)',
                    }}
                  >
                    {conf.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Big amount display */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              marginTop: spacing.md,
            }}
          >
            <View style={styles.amountRow}>
              <Text style={styles.amountPrefix}>{modeConf.prefix}</Text>
              <Text style={styles.currencyCode}>
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
                placeholderTextColor="rgba(255,255,255,0.45)"
                style={styles.amountInput}
                selectionColor="rgba(255,255,255,0.7)"
              />
            </View>

            {/* Quick amount chips */}
            <View style={styles.quickRow}>
              {QUICK_AMOUNTS.map((val) => (
                <Pressable
                  key={val}
                  onPress={() => handleAddQuickAmount(val)}
                  style={styles.quickChip}
                >
                  <Text style={styles.quickChipText}>
                    +{val >= 1000 ? `${val / 1000}k` : val}
                  </Text>
                </Pressable>
              ))}
              {amount ? (
                <Pressable
                  onPress={() => setAmount('')}
                  style={[styles.quickChip, { backgroundColor: 'rgba(255,255,255,0.08)' }]}
                >
                  <Text style={[styles.quickChipText, { color: 'rgba(255,255,255,0.6)' }]}>
                    Clear
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {/* Validation hint */}
            {amountError && (
              <Text style={styles.heroError}>⚠️ {amountError}</Text>
            )}

            {/* Balance projection pill */}
            {projectedBalance && selectedAccount && (
              <View style={styles.projectionPill}>
                <Text style={styles.projectionText}>
                  {selectedAccount.name}:{' '}
                  {formatMoneyDisplay(selectedAccount.balance, selectedAccount.currency)}
                  {' → '}
                </Text>
                <Text
                  style={[
                    styles.projectionValue,
                    { color: parseFloat(projectedBalance) >= 0 ? '#A7F3D0' : '#FCA5A5' },
                  ]}
                >
                  {formatMoneyDisplay(projectedBalance, selectedAccount.currency)}
                </Text>
              </View>
            )}
          </Animated.View>
        </View>

        {/* ── FORM BODY ────────────────────────────────────────────────── */}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            gap: spacing.lg,
            padding: spacing.lg,
            paddingBottom: 120,
          }}
        >
          {/* Category Selector */}
          {mode !== 'TRANSFER' && (
            <View style={{ gap: spacing.sm }}>
              <View style={styles.sectionLabelRow}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                  Category
                </Text>
                {selectedCategory && (
                  <Text style={[styles.sectionSelected, { color: modeColor }]}>
                    {selectedCategory.icon || '🏷️'} {selectedCategory.name}
                  </Text>
                )}
              </View>
              {categoryError && (
                <Text style={[styles.fieldError, { color: colors.danger }]}>
                  ⚠️ {categoryError}
                </Text>
              )}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.sm }}
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
                        styles.selectorChip,
                        {
                          backgroundColor: isSelected ? modeColor : colors.surface,
                          borderColor: isSelected ? modeColor : colors.border,
                          borderRadius: radius.lg,
                          boxShadow: isSelected
                            ? `0 2px 8px ${modeColor}40`
                            : '0 1px 3px rgba(0,0,0,0.06)',
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 18 }}>{cat.icon || '🏷️'}</Text>
                      <Text
                        style={{
                          color: isSelected ? '#FFFFFF' : colors.textPrimary,
                          fontWeight: isSelected ? '700' : '400',
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

          {/* Account Selector */}
          <View style={{ gap: spacing.sm }}>
            <View style={styles.sectionLabelRow}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                {mode === 'TRANSFER' ? 'From Account' : 'Account'}
              </Text>
              {selectedAccount && (
                <Text style={[styles.sectionSelected, { color: colors.primary }]}>
                  {getAccountIcon(selectedAccount.type)} {selectedAccount.name}
                </Text>
              )}
            </View>
            {accountError && (
              <Text style={[styles.fieldError, { color: colors.danger }]}>⚠️ {accountError}</Text>
            )}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.sm }}
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
                      styles.accountChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: radius.lg,
                        boxShadow: isSelected
                          ? `0 2px 8px ${colors.primary}40`
                          : '0 1px 3px rgba(0,0,0,0.06)',
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 20 }}>{icon}</Text>
                    <View>
                      <Text
                        style={{
                          color: isSelected ? '#FFFFFF' : colors.textPrimary,
                          fontWeight: isSelected ? '700' : '500',
                          fontSize: 13,
                        }}
                      >
                        {acc.name}
                      </Text>
                      <Text
                        style={{
                          color: isSelected ? 'rgba(255,255,255,0.72)' : colors.textTertiary,
                          fontSize: 11,
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

          {/* Destination Selector (Transfer) */}
          {mode === 'TRANSFER' && (
            <View style={{ gap: spacing.sm }}>
              <View style={styles.sectionLabelRow}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                  To Account
                </Text>
                {selectedDestination && (
                  <Text style={[styles.sectionSelected, { color: colors.primary }]}>
                    {getAccountIcon(selectedDestination.type)} {selectedDestination.name}
                  </Text>
                )}
              </View>
              {destinationError && (
                <Text style={[styles.fieldError, { color: colors.danger }]}>
                  ⚠️ {destinationError}
                </Text>
              )}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.sm }}
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
                        styles.accountChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surface,
                          borderColor: isSelected ? colors.primary : colors.border,
                          borderRadius: radius.lg,
                          boxShadow: isSelected
                            ? `0 2px 8px ${colors.primary}40`
                            : '0 1px 3px rgba(0,0,0,0.06)',
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 20 }}>{icon}</Text>
                      <View>
                        <Text
                          style={{
                            color: isSelected ? '#FFFFFF' : colors.textPrimary,
                            fontWeight: isSelected ? '700' : '500',
                            fontSize: 13,
                          }}
                        >
                          {acc.name}
                        </Text>
                        <Text
                          style={{
                            color: isSelected ? 'rgba(255,255,255,0.72)' : colors.textTertiary,
                            fontSize: 11,
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

          {/* Date Shortcut Row */}
          <View style={{ gap: spacing.sm }}>
            <View style={styles.sectionLabelRow}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Date</Text>
              <Text style={[styles.sectionSelected, { color: colors.textTertiary }]}>{date}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {[
                { label: '📅 Today', val: todayIsoDate() },
                {
                  label: '⏪ Yesterday',
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
                        borderColor: isSelected ? modeColor : colors.border,
                        borderRadius: radius.pill,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: isSelected ? modeColor : colors.textSecondary,
                        fontSize: 13,
                        fontWeight: isSelected ? '700' : '400',
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
                <Text style={{ color: colors.textTertiary, fontSize: 13 }}>Custom…</Text>
              </Pressable>
            </View>
          </View>

          {/* More Details toggle */}
          <Pressable
            onPress={() => setShowAdvanced((prev) => !prev)}
            style={[
              styles.moreDetailsBtn,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            <Text style={{ fontSize: 14 }}>{showAdvanced ? '▴' : '▾'}</Text>
            <Text style={[styles.moreDetailsLabel, { color: colors.primary }]}>
              {showAdvanced ? 'Hide Details' : 'More Details  (Merchant, Note, Custom Date)'}
            </Text>
          </Pressable>

          {/* Advanced Details */}
          {showAdvanced && (
            <Animated.View
              style={[
                styles.advancedCard,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                  gap: spacing.md,
                },
              ]}
            >
              <DatePickerInput label="Custom Date" value={date} onChangeDate={setDate} />
              {mode !== 'TRANSFER' && (
                <Input
                  label="Merchant / Payee (Optional)"
                  placeholder="e.g. Pathao, Netflix, Supermarket"
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
            </Animated.View>
          )}
        </ScrollView>

        {/* ── STICKY SAVE FOOTER ─────────────────────────────────────── */}
        <SafeAreaView
          edges={['bottom']}
          style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}
        >
          <Button
            label={savedSuccess ? '✓ Saved!' : busy ? 'Saving...' : modeActionLabel}
            loading={busy}
            onPress={() => void handleSave()}
            size="lg"
            variant={savedSuccess ? 'secondary' : 'primary'}
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  // Hero
  hero: {
    gap: 0,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  heroTitleGroup: {
    gap: 2,
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 1.5,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Mode switcher
  modeSwitcher: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    gap: 2,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
  },
  // Amount
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amountPrefix: {
    fontSize: 28,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
  },
  currencyCode: {
    fontSize: 28,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
  },
  amountInput: {
    flex: 1,
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    paddingVertical: 0,
    letterSpacing: -1,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  quickChip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  quickChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  heroError: {
    color: '#FCA5A5',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  projectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 999,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 10,
    gap: 2,
  },
  projectionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '500',
  },
  projectionValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  // Form body
  sectionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionSelected: {
    fontSize: 12,
    fontWeight: '600',
  },
  fieldError: {
    fontSize: 12,
    fontWeight: '500',
  },
  selectorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  accountChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    minWidth: 120,
  },
  dateChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  moreDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderWidth: 1,
  },
  moreDetailsLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  advancedCard: {
    padding: 16,
    borderWidth: 1,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
  },
});
