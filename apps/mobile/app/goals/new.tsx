import { formatMoneyDisplay } from '@personal-finance/types';
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
import { TextArea } from '../../src/components/TextArea';
import {
  isPositiveMoney,
  moneyNumber,
  validateIsoDate,
} from '../../src/lib/form-validation';
import { todayIsoDate } from '../../src/lib/clock';
import { useSettings } from '../../src/hooks/use-settings';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

const GOAL_TEMPLATES = [
  { label: '🛡️ Emergency Fund', amount: '300000', months: 12 },
  { label: '💻 New Laptop', amount: '120000', months: 6 },
  { label: '✈️ Vacation Trip', amount: '80000', months: 8 },
  { label: '🚗 Vehicle / Bike', amount: '250000', months: 18 },
  { label: '🏠 Home / Furniture', amount: '150000', months: 10 },
];

export default function NewGoalScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { goals, refresh } = useFinance();
  const { settings } = useSettings();
  const router = useRouter();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const currency = settings?.baseCurrency ?? 'BDT';

  // --- Real-time Field Validation ---
  const numTarget = moneyNumber(targetAmount);
  const isAmountValid = isPositiveMoney(targetAmount);
  const amountError =
    submitted && !isAmountValid ? 'Enter a valid target amount greater than 0' : null;
  const nameError = submitted && !name.trim() ? 'Goal title is required' : null;

  const dateValidation = validateIsoDate(targetDate, { min: todayIsoDate(), label: 'Target date' });
  const dateError =
    submitted && !dateValidation.valid ? dateValidation.message : null;

  // Real-time Monthly Savings Pace Calculation
  const paceAdvice = useMemo(() => {
    if (!isAmountValid || !targetDate.trim() || !dateValidation.valid) return null;
    const targetTime = new Date(targetDate.trim()).getTime();
    const nowTime = Date.now();
    const diffDays = Math.max(1, Math.round((targetTime - nowTime) / (1000 * 60 * 60 * 24)));
    const months = Math.max(1, Math.ceil(diffDays / 30));
    const monthlyAmount = (numTarget / months).toFixed(2);
    return { months, monthlyAmount };
  }, [numTarget, isAmountValid, targetDate, dateValidation.valid]);

  const handleApplyTemplate = (tmpl: (typeof GOAL_TEMPLATES)[0]) => {
    setName(tmpl.label.replace(/^[^\s]+\s/, ''));
    setTargetAmount(tmpl.amount);
    const d = new Date();
    d.setMonth(d.getMonth() + tmpl.months);
    setTargetDate(d.toISOString().slice(0, 10));
    if (submitted) setSubmitted(false);
  };

  const handleCreate = async () => {
    setSubmitted(true);

    if (!name.trim() || !isAmountValid || !dateValidation.valid) {
      return;
    }

    setBusy(true);

    try {
      await goals.create({
        name: name.trim(),
        targetAmount: targetAmount.trim(),
        currency,
        targetDate: targetDate.trim() || null,
        note: note.trim() || undefined,
      });
      refresh();
      router.back();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Could not create goal');
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
              SAVINGS PLAN
            </Text>
            <Text style={[typography.title, { color: colors.textPrimary }]}>Create New Goal</Text>
          </View>

          {/* Quick Preset Templates */}
          <View style={{ gap: spacing.xs }}>
            <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
              Popular Goal Templates
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.xs }}
            >
              {GOAL_TEMPLATES.map((tmpl) => (
                <Pressable
                  key={tmpl.label}
                  onPress={() => handleApplyTemplate(tmpl)}
                  style={[
                    styles.templateChip,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radius.pill,
                    },
                  ]}
                >
                  <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '500' }}>
                    {tmpl.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Form Card */}
          <Card style={{ gap: spacing.md, backgroundColor: colors.surfaceElevated }}>
            <Input
              label="Goal Title"
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (submitted) setSubmitted(false);
              }}
              placeholder="e.g. MacBook Pro, Emergency Fund, Tokyo Trip"
              error={nameError}
              clearable
              onClear={() => setName('')}
            />

            <Input
              label="Target Amount"
              value={targetAmount}
              onChangeText={(t) => {
                setTargetAmount(t);
                if (submitted) setSubmitted(false);
              }}
              keyboardType="decimal-pad"
              placeholder="150000"
              prefix={currency}
              error={amountError}
              clearable
              onClear={() => setTargetAmount('')}
            />

            <DatePickerInput
              label="Target Completion Date (Optional)"
              value={targetDate}
              onChangeDate={(t) => {
                setTargetDate(t);
                if (submitted) setSubmitted(false);
              }}
              error={dateError}
              minDate={todayIsoDate()}
              optional
              helperText="Set a target deadline to calculate your required savings pace."
            />

            {/* Real-time Pace Calculation Advice */}
            {paceAdvice ? (
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
                  💡 Recommended Pace: Save {formatMoneyDisplay(paceAdvice.monthlyAmount, currency)}
                  /mo
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Based on {paceAdvice.months} months remaining until your target date.
                </Text>
              </View>
            ) : null}

            <TextArea
              label="Note (Optional)"
              value={note}
              onChangeText={setNote}
              placeholder="e.g. For career upgrade, high priority"
              maxLength={200}
              clearable
              onClear={() => setNote('')}
            />
          </Card>

          {/* Action Button */}
          <Button
            label={busy ? 'Creating Goal...' : 'Create Goal'}
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
  templateChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
});
