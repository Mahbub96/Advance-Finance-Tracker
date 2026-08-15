import { BudgetPeriodType, CategoryKind, formatMoneyDisplay } from '@personal-finance/types';
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
import {
  isPositiveMoney,
  moneyNumber,
  validateIsoDate,
  validatePercentage,
} from '../../src/lib/form-validation';
import { monthRange } from '../../src/lib/clock';
import { useCategories } from '../../src/hooks/use-categories';
import { useSettings } from '../../src/hooks/use-settings';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

export default function NewBudgetScreen() {
  const { colors, spacing, typography, radius } = useTokens();
  const { budgets, refresh } = useFinance();
  const { categories } = useCategories();
  const { settings } = useSettings();
  const router = useRouter();

  const currentMonth = monthRange();
  const expenseCategories = categories.filter((category) => category.type === CategoryKind.EXPENSE);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(currentMonth.from);
  const [endDate, setEndDate] = useState(currentMonth.to);
  const [threshold, setThreshold] = useState(80);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const currency = settings?.baseCurrency ?? 'BDT';

  // --- Real-time Field Validation ---
  const numAmount = moneyNumber(amount);
  const isAmountValid = isPositiveMoney(amount);
  const amountError = submitted && !isAmountValid ? 'Enter a valid positive budget amount' : null;
  const nameError = submitted && !name.trim() ? 'Budget title is required' : null;

  const startDateValidation = validateIsoDate(startDate, { required: true, label: 'Start date' });
  const endDateValidation = validateIsoDate(endDate, { required: true, label: 'End date' });
  const isDateRangeValid =
    startDateValidation.valid && endDateValidation.valid && startDate <= endDate;
  const thresholdValidation = validatePercentage(threshold);
  const dateError =
    submitted && !isDateRangeValid ? 'Start date must be on or before end date' : null;

  // Daily Allowance Calculation
  const dailyAllowance = useMemo(() => {
    if (!isAmountValid || !isDateRangeValid) return null;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
    const daily = numAmount / days;
    return { days, daily: daily.toFixed(2) };
  }, [numAmount, isAmountValid, isDateRangeValid, startDate, endDate]);

  const handleCreate = async () => {
    setSubmitted(true);

    if (!name.trim() || !isAmountValid || !isDateRangeValid || !thresholdValidation.valid) {
      return;
    }

    setBusy(true);

    try {
      await budgets.create({
        name: name.trim(),
        amount: amount.trim(),
        currency,
        periodType: BudgetPeriodType.CUSTOM,
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        categoryId,
        alertThresholdPercent: threshold,
      });
      refresh();
      router.back();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Could not create budget');
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
              SPENDING CONTROL
            </Text>
            <Text style={[typography.title, { color: colors.textPrimary }]}>Create Budget</Text>
          </View>

          {/* Form Card */}
          <Card style={{ gap: spacing.md, backgroundColor: colors.surfaceElevated }}>
            <Input
              label="Budget Title"
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (submitted) setSubmitted(false);
              }}
              placeholder="e.g. Food & Dining, Shopping, General"
              error={nameError}
              clearable
              onClear={() => setName('')}
            />

            <Input
              label="Monthly Limit Amount"
              value={amount}
              onChangeText={(t) => {
                setAmount(t);
                if (submitted) setSubmitted(false);
              }}
              keyboardType="decimal-pad"
              placeholder="15000"
              prefix={currency}
              error={amountError}
              clearable
              onClear={() => setAmount('')}
            />

            {/* Daily Allowance Estimate Pill */}
            {dailyAllowance ? (
              <View
                style={{
                  backgroundColor: colors.surfaceMuted,
                  padding: spacing.md,
                  borderRadius: radius.md,
                  borderLeftWidth: 3,
                  borderLeftColor: colors.primary,
                  gap: 2,
                }}
              >
                <Text style={[typography.captionMedium, { color: colors.textPrimary }]}>
                  💡 Daily Spending Allowance: {formatMoneyDisplay(dailyAllowance.daily, currency)}
                  /day
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Calculated over {dailyAllowance.days} days for this period.
                </Text>
              </View>
            ) : null}

            {/* Period Dates */}
            <View style={{ gap: spacing.sm }}>
              <DatePickerInput
                label="Start Date"
                value={startDate}
                onChangeDate={setStartDate}
                error={submitted && !startDateValidation.valid ? startDateValidation.message : dateError}
              />
              <DatePickerInput
                label="End Date"
                value={endDate}
                onChangeDate={setEndDate}
                minDate={startDateValidation.valid ? startDate : undefined}
                error={submitted && !endDateValidation.valid ? endDateValidation.message : null}
              />
            </View>

            {/* Alert Warning Threshold */}
            <View style={{ gap: spacing.xs }}>
              <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                Warning Alert Threshold ({threshold}%)
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                {[50, 75, 80, 90, 100].map((val) => {
                  const isSelected = threshold === val;
                  return (
                    <Pressable
                      key={val}
                      onPress={() => setThreshold(val)}
                      style={[
                        styles.thresholdChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surfaceMuted,
                          borderColor: isSelected ? colors.primary : colors.border,
                          borderRadius: radius.sm,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: isSelected ? colors.primaryForeground : colors.textPrimary,
                          fontSize: 12,
                          fontWeight: isSelected ? '600' : '400',
                        }}
                      >
                        {val}%
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Category Scope Chips */}
            <View style={{ gap: spacing.xs }}>
              <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                Category Scope
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                <Pressable
                  onPress={() => setCategoryId(null)}
                  style={[
                    styles.scopeChip,
                    {
                      backgroundColor: categoryId === null ? colors.primary : colors.surface,
                      borderColor: categoryId === null ? colors.primary : colors.border,
                      borderRadius: radius.md,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: categoryId === null ? colors.primaryForeground : colors.textPrimary,
                      fontWeight: categoryId === null ? '600' : '400',
                      fontSize: 13,
                    }}
                  >
                    🌐 All Expenses
                  </Text>
                </Pressable>

                {expenseCategories.map((category) => {
                  const isSelected = categoryId === category.id;
                  return (
                    <Pressable
                      key={category.id}
                      onPress={() => {
                        setCategoryId(category.id);
                        if (!name) setName(`${category.name} Budget`);
                      }}
                      style={[
                        styles.scopeChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surface,
                          borderColor: isSelected ? colors.primary : colors.border,
                          borderRadius: radius.md,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 13 }}>{category.icon || '🏷️'}</Text>
                      <Text
                        style={{
                          color: isSelected ? colors.primaryForeground : colors.textPrimary,
                          fontWeight: isSelected ? '600' : '400',
                          fontSize: 13,
                        }}
                      >
                        {category.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Card>

          {/* Action Button */}
          <Button
            label={busy ? 'Creating...' : 'Create Budget'}
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
  scopeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  thresholdChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
