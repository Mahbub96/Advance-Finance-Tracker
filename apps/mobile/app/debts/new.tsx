import {
  DebtType,
  type DebtType as DebtTypeEnum,
  formatMoneyDisplay,
  LendingReminderType,
} from '@personal-finance/types';
import { isValidEmail } from '@personal-finance/validation';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { DatePickerInput } from '../../src/components/DatePickerInput';
import { Input } from '../../src/components/Input';
import { Screen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
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
  const [email, setEmail] = useState('');
  const [emailReminderEnabled, setEmailReminderEnabled] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  // Email preview modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewStage, setPreviewStage] = useState<LendingReminderType>(
    LendingReminderType.LENDING_DUE_7_DAYS,
  );

  const currency = settings?.baseCurrency ?? 'BDT';

  // --- Real-time Validation ---
  const numAmount = parseFloat(amount);
  const isAmountValid = !isNaN(numAmount) && numAmount > 0;
  const amountError = submitted && !isAmountValid ? 'Enter a valid amount greater than 0' : null;
  const nameError = submitted && !personName.trim() ? 'Name of person or entity is required' : null;
  const isDateValid = !dueDate.trim() || /^\d{4}-\d{2}-\d{2}$/.test(dueDate.trim());
  const dateError = submitted && !isDateValid ? 'Use valid date format YYYY-MM-DD' : null;

  const isEmailValidState = !emailReminderEnabled || isValidEmail(email);
  const emailError =
    submitted && emailReminderEnabled && !isEmailValidState
      ? 'Please enter a valid recipient email address'
      : null;

  const typeOptions: Array<{ id: DebtTypeEnum; label: string }> = [
    { id: DebtType.LENT, label: '🤝 I Lent Money' },
    { id: DebtType.BORROWED, label: '⏳ I Borrowed' },
  ];

  // Calculate schedule dates for preview
  const getScheduleDates = () => {
    if (!dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate.trim())) {
      return {
        sevenDaysBefore: '7 days before due date',
        threeDaysBefore: '3 days before due date',
        dueDay: dueDate || 'Due date',
      };
    }
    const parts = dueDate.trim().split('-');
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    if (isNaN(y) || isNaN(m) || isNaN(d)) {
      return {
        sevenDaysBefore: '7 days before due date',
        threeDaysBefore: '3 days before due date',
        dueDay: dueDate.trim(),
      };
    }
    const dueUtc = new Date(Date.UTC(y, m - 1, d));
    const minus7 = new Date(dueUtc.getTime() - 7 * 86400000);
    const minus3 = new Date(dueUtc.getTime() - 3 * 86400000);
    return {
      sevenDaysBefore: minus7.toISOString().slice(0, 10),
      threeDaysBefore: minus3.toISOString().slice(0, 10),
      dueDay: dueDate.trim(),
    };
  };

  const scheduleDates = getScheduleDates();

  const getTemplateContent = (stage: LendingReminderType) => {
    const pName = personName.trim() || 'Friend';
    const formattedAmount = `${currency} ${amount.trim() || '0.00'}`;
    const dDate = dueDate.trim() || '(Due Date)';
    const noteSuffix = note.trim() ? `\n\nNote: ${note.trim()}` : '';

    switch (stage) {
      case LendingReminderType.LENDING_DUE_7_DAYS:
        return {
          subject: 'Friendly reminder about the repayment',
          body: `Hi ${pName},\n\nJust a friendly reminder that the ${formattedAmount} you borrowed is due in 7 days, on ${dDate}.\n\nPlease let me know if you expect any change in the timing.${noteSuffix}\n\nThank you.`,
        };
      case LendingReminderType.LENDING_DUE_3_DAYS:
        return {
          subject: 'A quick repayment reminder',
          body: `Hi ${pName},\n\nJust a quick reminder that the ${formattedAmount} repayment is due in 3 days, on ${dDate}.${noteSuffix}\n\nThanks!`,
        };
      case LendingReminderType.LENDING_DUE:
        return {
          subject: 'Repayment reminder for today',
          body: `Hi ${pName},\n\nJust a friendly reminder that the ${formattedAmount} repayment is due today (${dDate}).${noteSuffix}\n\nThank you.`,
        };
      case LendingReminderType.LENDING_OVERDUE:
        return {
          subject: 'Friendly repayment reminder',
          body: `Hi ${pName},\n\nJust a friendly reminder that the ${formattedAmount} repayment was due on ${dDate}.\n\nPlease let me know when you expect to be able to make the payment.${noteSuffix}\n\nThank you.`,
        };
    }
  };

  const activeTemplate = getTemplateContent(previewStage);

  const handleCreate = async () => {
    setSubmitted(true);

    if (!personName.trim() || !isAmountValid || !isDateValid || !isEmailValidState) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
        email: emailReminderEnabled ? email.trim() : null,
        emailReminderEnabled,
        accountId,
        note: note.trim() || undefined,
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
              void Haptics.selectionAsync();
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
              helperText="Used to track pending repayments and automated reminders."
            />

            {/* Email Reminders (Enabled for Lent money) */}
            {type === DebtType.LENT && (
              <Card
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  padding: spacing.md,
                  gap: spacing.sm,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[typography.sectionTitle, { color: colors.textPrimary, fontSize: 15 }]}>
                      ✉️ Email Reminder
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      Schedule polite reminder emails (7d, 3d, on due date)
                    </Text>
                  </View>
                  <Switch
                    value={emailReminderEnabled}
                    onValueChange={(val) => {
                      void Haptics.selectionAsync();
                      setEmailReminderEnabled(val);
                      if (submitted) setSubmitted(false);
                    }}
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>

                {emailReminderEnabled && (
                  <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
                    <Input
                      label="Recipient Email"
                      value={email}
                      onChangeText={(t) => {
                        setEmail(t);
                        if (submitted) setSubmitted(false);
                      }}
                      placeholder="e.g. rahim@example.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      error={emailError}
                      helperText="Reminders are sent politely and cancelled when repaid."
                      clearable
                      onClear={() => setEmail('')}
                    />

                    <Button
                      label="👁️ Preview Reminder Email"
                      variant="outline"
                      size="sm"
                      onPress={() => {
                        void Haptics.selectionAsync();
                        setShowPreviewModal(true);
                      }}
                    />
                  </View>
                )}
              </Card>
            )}

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
                  onPress={() => {
                    void Haptics.selectionAsync();
                    setAccountId(null);
                  }}
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
                      onPress={() => {
                        void Haptics.selectionAsync();
                        setAccountId(acc.id);
                      }}
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

      {/* Multi-Stage Email Preview Modal */}
      {showPreviewModal && (
        <Modal transparent animationType="fade" visible={showPreviewModal}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.6)',
              justifyContent: 'center',
              padding: spacing.lg,
            }}
          >
            <Card style={{ gap: spacing.md, backgroundColor: colors.surfaceElevated, maxHeight: '88%' }}>
              <SectionHeader title="✉️ Email Reminder Preview" />

              {/* Stage selector chips */}
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { id: LendingReminderType.LENDING_DUE_7_DAYS, label: '7 Days Before' },
                  { id: LendingReminderType.LENDING_DUE_3_DAYS, label: '3 Days Before' },
                  { id: LendingReminderType.LENDING_DUE, label: 'Due Date' },
                  { id: LendingReminderType.LENDING_OVERDUE, label: 'Overdue' },
                ].map((s) => {
                  const isSel = previewStage === s.id;
                  return (
                    <Pressable
                      key={s.id}
                      onPress={() => {
                        void Haptics.selectionAsync();
                        setPreviewStage(s.id);
                      }}
                      style={[
                        styles.previewChip,
                        {
                          backgroundColor: isSel ? colors.primary : colors.surfaceMuted,
                          borderColor: isSel ? colors.primary : colors.border,
                          borderRadius: radius.sm,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: isSel ? colors.primaryForeground : colors.textPrimary,
                          fontSize: 11,
                          fontWeight: isSel ? '700' : '500',
                        }}
                      >
                        {s.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
                <View style={{ gap: 2 }}>
                  <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                    To: <Text style={{ color: colors.textPrimary }}>{email || '(recipient email)'}</Text>
                  </Text>
                  <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                    Subject: <Text style={{ color: colors.textPrimary }}>{activeTemplate.subject}</Text>
                  </Text>
                </View>

                {/* Rendered Body preview */}
                <Card style={{ backgroundColor: colors.surfaceSubtle, borderColor: colors.border, padding: spacing.md }}>
                  <Text style={[typography.body, { color: colors.textPrimary, lineHeight: 20 }]}>
                    {activeTemplate.body}
                  </Text>
                </Card>

                {/* Schedule timing explanation */}
                <View style={{ gap: spacing.xs }}>
                  <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                    Automated Schedule Timing:
                  </Text>
                  <View style={styles.scheduleItem}>
                    <Badge label="7 DAYS BEFORE" variant="primary" size="sm" />
                    <Text style={[typography.caption, { color: colors.textPrimary }]}>
                      {scheduleDates.sevenDaysBefore}
                    </Text>
                  </View>
                  <View style={styles.scheduleItem}>
                    <Badge label="3 DAYS BEFORE" variant="warning" size="sm" />
                    <Text style={[typography.caption, { color: colors.textPrimary }]}>
                      {scheduleDates.threeDaysBefore}
                    </Text>
                  </View>
                  <View style={styles.scheduleItem}>
                    <Badge label="DUE DATE" variant="danger" size="sm" />
                    <Text style={[typography.caption, { color: colors.textPrimary }]}>
                      {scheduleDates.dueDay}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              <Button
                label="Close Preview"
                variant="secondary"
                onPress={() => setShowPreviewModal(false)}
              />
            </Card>
          </View>
        </Modal>
      )}
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
  previewChip: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
});
