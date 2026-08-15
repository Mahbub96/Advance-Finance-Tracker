import {
  formatMoneyDisplay,
  LendingReminderType,
  moneyString,
  parseMoney,
} from '@personal-finance/types';

import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { DeleteConfirmModal } from '../../src/components/DeleteConfirmModal';
import { Input } from '../../src/components/Input';
import { ProgressBar } from '../../src/components/ProgressBar';
import { ScrollScreen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { StatCard } from '../../src/components/StatCard';
import { DebtsSkeleton } from '../../src/components/skeletons/DebtsSkeleton';
import type { DebtRecord } from '../../src/database/records';
import { useAccounts } from '../../src/hooks/use-accounts';
import { useDebts } from '../../src/hooks/use-debts';
import { useSettings } from '../../src/hooks/use-settings';
import { useFinance } from '../../src/providers/finance-provider';
import { useUndoDelete } from '../../src/providers/undo-delete-provider';
import { useTokens } from '../../src/theme/tokens';

const QUICK_REPAY_INCREMENTS = [500, 1000, 2000, 5000];

function getDueLabel(dueDate: string | null): { label: string; isOverdue: boolean } {
  if (!dueDate) return { label: 'Flexible timeline', isOverdue: false };
  const target = new Date(dueDate).getTime();
  const now = Date.now();
  const diffDays = Math.round((target - now) / 86400000);

  if (diffDays < 0) {
    return { label: `Overdue by ${Math.abs(diffDays)} days`, isOverdue: true };
  } else if (diffDays === 0) {
    return { label: 'Due today', isOverdue: false };
  } else {
    return { label: `Due in ${diffDays} days`, isOverdue: false };
  }
}

export default function DebtsListScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { debts, loading, reload } = useDebts();
  const { debts: debtService, db, refresh } = useFinance();

  const { scheduleDelete, isPendingDelete } = useUndoDelete();
  const { accounts } = useAccounts();
  const { settings } = useSettings();
  const router = useRouter();

  const currency = settings?.baseCurrency ?? 'BDT';

  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayAccountId, setRepayAccountId] = useState<string | null>(null);
  const [repayError, setRepayError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Delete confirm state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState('');

  // Email Reminder Preview state
  const [previewDebt, setPreviewDebt] = useState<DebtRecord | null>(null);
  const [previewRemaining, setPreviewRemaining] = useState('0.00');
  const [previewStage, setPreviewStage] = useState<LendingReminderType>(
    LendingReminderType.LENDING_DUE_7_DAYS,
  );

  const moneyOwedToYou = useMemo(
    () => debts.filter((d) => d.debt.type === 'LENT' && !isPendingDelete(d.debt.id)),
    [debts, isPendingDelete],
  );
  const moneyYouOwe = useMemo(
    () => debts.filter((d) => d.debt.type === 'BORROWED' && !isPendingDelete(d.debt.id)),
    [debts, isPendingDelete],
  );

  if (loading) {
    return <DebtsSkeleton />;
  }

  const activeDebt = debts.find((d) => d.debt.id === selectedDebtId);

  const totalLent = moneyOwedToYou.reduce(
    (sum, d) => moneyString(parseMoney(sum).plus(parseMoney(d.remainingAmount))),
    '0.00',
  );

  const totalBorrowed = moneyYouOwe.reduce(
    (sum, d) => moneyString(parseMoney(sum).plus(parseMoney(d.remainingAmount))),
    '0.00',
  );

  const handleRemind = async (personName: string, remaining: string, curr: string) => {
    try {
      void Haptics.selectionAsync();
      const msg = `Hi ${personName}! Just a friendly reminder regarding the ${formatMoneyDisplay(remaining, curr)} personal balance. Whenever you get a moment to settle, please let me know. Thanks!`;
      await Share.share({
        message: msg,
        title: `Friendly Reminder for ${personName}`,
      });
    } catch {
      // ignore
    }
  };

  const handleRepay = async () => {
    if (!selectedDebtId || !activeDebt) return;

    const parsed = parseFloat(repayAmount);
    if (isNaN(parsed) || parsed <= 0) {
      setRepayError('Enter a valid repayment amount');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const max = parseFloat(activeDebt.remainingAmount);
    if (parsed > max) {
      setRepayError(`Amount cannot exceed remaining balance of ${formatMoneyDisplay(activeDebt.remainingAmount, activeDebt.debt.currency)}`);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setBusy(true);
    try {
      await debtService.recordRepayment(selectedDebtId, {
        amount: repayAmount.trim(),
        accountId: repayAccountId,
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSelectedDebtId(null);
      setRepayAmount('');
      setRepayAccountId(null);
      setRepayError(null);
      refresh();
      await reload();
    } catch (err: unknown) {
      setRepayError(err instanceof Error ? err.message : 'Failed to record repayment');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = (id: string, name: string) => {
    void Haptics.selectionAsync();
    setDeletingId(id);
    setDeletingName(name);
  };

  const handleDelete = () => {
    if (!deletingId) return;
    const debtId = deletingId;
    const targetName = deletingName;
    setDeletingId(null);
    setDeletingName('');

    scheduleDelete({
      id: debtId,
      message: `Deleted debt for "${targetName}"`,
      onExecute: async () => {
        await db.runAsync('UPDATE debts SET deleted_at = ? WHERE id = ?', [
          new Date().toISOString(),
          debtId,
        ]);
        refresh();
      },
      onUndo: () => {
        refresh();
        void reload();
      },
    });
  };

  const getTemplateContent = (debt: DebtRecord, remaining: string, stage: LendingReminderType) => {
    const pName = debt.personName.trim();
    const formattedAmount = `${debt.currency} ${remaining}`;
    const dDate = debt.dueDate?.trim() || '(Due Date)';
    const noteSuffix = debt.note?.trim() ? `\n\nNote: ${debt.note.trim()}` : '';

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

  return (
    <ScrollScreen
      style={{ gap: spacing.lg }}
      onRefresh={async () => {
        refresh();
        await reload();
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ gap: 2 }}>
          <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
            DEBT MANAGEMENT
          </Text>
          <Text style={[typography.title, { color: colors.textPrimary }]}>Lending & Debts</Text>
        </View>

        <Button
          label="+ Record Loan"
          size="sm"
          onPress={() => {
            void Haptics.selectionAsync();
            router.push('/debts/new');
          }}
        />
      </View>

      {/* Hero Summary Cards */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <StatCard
          label="You Are Owed"
          value={formatMoneyDisplay(totalLent, currency)}
          indicatorColor={colors.income}
          icon="🤝"
        />
        <StatCard
          label="You Owe"
          value={formatMoneyDisplay(totalBorrowed, currency)}
          indicatorColor={colors.expense}
          icon="⏳"
        />
      </View>


      {/* Section 1: Money Others Owe You */}
      <View style={{ gap: spacing.xs }}>
        <SectionHeader title="Money Others Owe You" />
        {moneyOwedToYou.length === 0 ? (
          <Card style={{ backgroundColor: colors.surface, padding: spacing.md }}>
            <Text style={[typography.caption, { color: colors.textTertiary }]}>
              No outstanding money lent to others.
            </Text>
          </Card>
        ) : (
          moneyOwedToYou.map(({ debt, totalRepaid, remainingAmount, progressPercent }) => {
            const dueInfo = getDueLabel(debt.dueDate);

            return (
              <Card key={debt.id} style={{ gap: spacing.md, backgroundColor: colors.surface }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text
                      style={[typography.sectionTitle, { color: colors.textPrimary, fontSize: 16 }]}
                    >
                      {debt.personName}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' }}>
                      <Text
                        style={[
                          typography.caption,
                          {
                            color: dueInfo.isOverdue ? colors.danger : colors.textSecondary,
                            fontWeight: dueInfo.isOverdue ? '600' : '400',
                          },
                        ]}
                      >
                        {dueInfo.label} · Lent on {debt.issueDate}
                      </Text>
                      {debt.emailReminderEnabled && debt.email && (
                        <Badge label="✉️ REMINDER ON" variant="primary" size="sm" />
                      )}
                    </View>
                  </View>

                  <Badge
                    label={dueInfo.isOverdue ? 'OVERDUE' : 'LENT'}
                    variant={dueInfo.isOverdue ? 'danger' : 'success'}
                    size="sm"
                  />
                </View>

                {/* Progress bar */}
                <ProgressBar progressPercent={progressPercent} color={colors.income} height={7} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    Repaid {formatMoneyDisplay(totalRepaid, debt.currency)} ({progressPercent}%)
                  </Text>
                  <Text style={[typography.captionMedium, { color: colors.textPrimary }]}>
                    Remaining {formatMoneyDisplay(remainingAmount, debt.currency)}
                  </Text>
                </View>

                {/* Human-friendly action row with Remind CTA */}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, flexWrap: 'wrap' }}>
                  {debt.emailReminderEnabled && debt.email && (
                    <Button
                      label="✉️ Email Preview"
                      variant="outline"
                      size="sm"
                      onPress={() => {
                        void Haptics.selectionAsync();
                        setPreviewDebt(debt);
                        setPreviewRemaining(remainingAmount);
                      }}
                    />
                  )}
                  <Button
                    label="💬 Share"
                    variant="outline"
                    size="sm"
                    onPress={() =>
                      void handleRemind(debt.personName, remainingAmount, debt.currency)
                    }
                  />
                  <Button
                    label="Repay"
                    variant="secondary"
                    size="sm"
                    onPress={() => {
                      void Haptics.selectionAsync();
                      setSelectedDebtId(debt.id);
                      setRepayAmount(remainingAmount);
                      setRepayError(null);
                    }}
                  />
                  <Button
                    label="Delete"
                    variant="ghost"
                    size="sm"
                    onPress={() => confirmDelete(debt.id, debt.personName)}
                  />
                </View>
              </Card>
            );
          })
        )}
      </View>

      {/* Section 2: Money You Owe */}
      <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
        <SectionHeader title="Money You Owe" />
        {moneyYouOwe.length === 0 ? (
          <Card style={{ backgroundColor: colors.surface, padding: spacing.md }}>
            <Text style={[typography.caption, { color: colors.textTertiary }]}>
              You have no outstanding borrowed debt.
            </Text>
          </Card>
        ) : (
          moneyYouOwe.map(({ debt, totalRepaid, remainingAmount, progressPercent }) => {
            const dueInfo = getDueLabel(debt.dueDate);

            return (
              <Card key={debt.id} style={{ gap: spacing.md, backgroundColor: colors.surface }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text
                      style={[typography.sectionTitle, { color: colors.textPrimary, fontSize: 16 }]}
                    >
                      {debt.personName}
                    </Text>
                    <Text
                      style={[
                        typography.caption,
                        {
                          color: dueInfo.isOverdue ? colors.danger : colors.textSecondary,
                          fontWeight: dueInfo.isOverdue ? '600' : '400',
                        },
                      ]}
                    >
                      {dueInfo.label} · Borrowed on {debt.issueDate}
                    </Text>
                  </View>

                  <Badge
                    label={dueInfo.isOverdue ? 'OVERDUE' : 'BORROWED'}
                    variant={dueInfo.isOverdue ? 'danger' : 'warning'}
                    size="sm"
                  />
                </View>

                {/* Progress bar */}
                <ProgressBar progressPercent={progressPercent} color={colors.expense} height={7} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    Repaid {formatMoneyDisplay(totalRepaid, debt.currency)} ({progressPercent}%)
                  </Text>
                  <Text style={[typography.captionMedium, { color: colors.textPrimary }]}>
                    Remaining {formatMoneyDisplay(remainingAmount, debt.currency)}
                  </Text>
                </View>

                {/* Action Row */}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm }}>
                  <Button
                    label="Record Repayment"
                    variant="secondary"
                    size="sm"
                    onPress={() => {
                      void Haptics.selectionAsync();
                      setSelectedDebtId(debt.id);
                      setRepayAmount(remainingAmount);
                      setRepayError(null);
                    }}
                  />
                  <Button
                    label="Delete"
                    variant="ghost"
                    size="sm"
                    onPress={() => confirmDelete(debt.id, debt.personName)}
                  />
                </View>
              </Card>
            );
          })
        )}
      </View>

      {/* Partial / Full Repay Modal */}
      {selectedDebtId && activeDebt ? (
        <Modal transparent animationType="fade" visible={!!selectedDebtId}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              padding: spacing.lg,
            }}
          >
            <Card style={{ gap: spacing.md, backgroundColor: colors.surfaceElevated }}>
              <SectionHeader
                title={`Record Repayment: ${activeDebt.debt.personName}`}
              />

              <Input
                label="Repayment Amount"
                value={repayAmount}
                onChangeText={(t) => {
                  setRepayAmount(t);
                  setRepayError(null);
                }}
                keyboardType="decimal-pad"
                placeholder="Amount"
                prefix={activeDebt.debt.currency}
                error={repayError}
                clearable
                onClear={() => setRepayAmount('')}
              />

              {/* Quick Increment Buttons */}
              <View style={{ gap: spacing.xs }}>
                <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                  Quick Fill
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                  {QUICK_REPAY_INCREMENTS.map((inc) => (
                    <Pressable
                      key={inc}
                      onPress={() => {
                        void Haptics.selectionAsync();
                        setRepayAmount(String(inc));
                        setRepayError(null);
                      }}
                      style={[
                        styles.incrementChip,
                        {
                          backgroundColor: colors.surfaceMuted,
                          borderColor: colors.border,
                          borderRadius: radius.sm,
                        },
                      ]}
                    >
                      <Text style={[typography.caption, { color: colors.textPrimary }]}>
                        +{inc}
                      </Text>
                    </Pressable>
                  ))}
                  <Pressable
                    onPress={() => {
                      void Haptics.selectionAsync();
                      setRepayAmount(activeDebt.remainingAmount);
                      setRepayError(null);
                    }}
                    style={[
                      styles.incrementChip,
                      {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                        borderRadius: radius.sm,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.captionMedium,
                        { color: colors.primaryForeground, fontWeight: '600' },
                      ]}
                    >
                      Full ({formatMoneyDisplay(activeDebt.remainingAmount, activeDebt.debt.currency)})
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Linked Settlement Account */}
              <View style={{ gap: spacing.xs }}>
                <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                  Impact Bank / Cash Account (Optional)
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                  <Pressable
                    onPress={() => {
                      void Haptics.selectionAsync();
                      setRepayAccountId(null);
                    }}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: spacing.sm,
                      borderRadius: radius.sm,
                      borderWidth: 1,
                      borderColor: repayAccountId === null ? colors.primary : colors.border,
                      backgroundColor:
                        repayAccountId === null ? colors.primary : colors.surfaceMuted,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          repayAccountId === null
                            ? colors.primaryForeground
                            : colors.textPrimary,
                        fontSize: 12,
                        fontWeight: repayAccountId === null ? '600' : '400',
                      }}
                    >
                      None (Track record only)
                    </Text>
                  </Pressable>

                  {accounts.map((acc) => (
                    <Pressable
                      key={acc.id}
                      onPress={() => {
                        void Haptics.selectionAsync();
                        setRepayAccountId(repayAccountId === acc.id ? null : acc.id);
                      }}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: spacing.sm,
                        borderRadius: radius.sm,
                        borderWidth: 1,
                        borderColor: repayAccountId === acc.id ? colors.primary : colors.border,
                        backgroundColor:
                          repayAccountId === acc.id ? colors.primary : colors.surfaceMuted,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            repayAccountId === acc.id
                              ? colors.primaryForeground
                              : colors.textPrimary,
                          fontSize: 12,
                          fontWeight: repayAccountId === acc.id ? '600' : '400',
                        }}
                      >
                        {acc.name} ({formatMoneyDisplay(acc.balance, acc.currency)})
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Cancel"
                    variant="secondary"
                    onPress={() => setSelectedDebtId(null)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label={busy ? 'Saving...' : 'Confirm'}
                    loading={busy}
                    onPress={() => void handleRepay()}
                  />
                </View>
              </View>
            </Card>
          </View>
        </Modal>
      ) : null}

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        visible={!!deletingId}
        title="Delete Debt Record?"
        message={`The debt record for "${deletingName}" will be soft-deleted. Repayment history will be preserved but hidden.`}
        deleteLabel="Delete Debt"
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          setDeletingId(null);
          setDeletingName('');
        }}
      />

      {/* Multi-Stage Email Preview Modal for existing debt */}
      {previewDebt && (
        <Modal transparent animationType="fade" visible={!!previewDebt}>
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

              {(() => {
                const template = getTemplateContent(previewDebt, previewRemaining, previewStage);
                return (
                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
                    <View style={{ gap: 2 }}>
                      <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                        To: <Text style={{ color: colors.textPrimary }}>{previewDebt.email}</Text>
                      </Text>
                      <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                        Subject: <Text style={{ color: colors.textPrimary }}>{template.subject}</Text>
                      </Text>
                    </View>

                    {/* Rendered Body preview */}
                    <Card style={{ backgroundColor: colors.surfaceSubtle, borderColor: colors.border, padding: spacing.md }}>
                      <Text style={[typography.body, { color: colors.textPrimary, lineHeight: 20 }]}>
                        {template.body}
                      </Text>
                    </Card>

                    <View style={{ gap: 2 }}>
                      <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                        Outstanding Balance: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{formatMoneyDisplay(previewRemaining, previewDebt.currency)}</Text>
                      </Text>
                      <Text style={[typography.caption, { color: colors.textTertiary }]}>
                        Reminders are cancelled automatically once this loan is fully repaid.
                      </Text>
                    </View>
                  </ScrollView>
                );
              })()}

              <Button
                label="Close Preview"
                variant="secondary"
                onPress={() => setPreviewDebt(null)}
              />
            </Card>
          </View>
        </Modal>
      )}
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  incrementChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  previewChip: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
