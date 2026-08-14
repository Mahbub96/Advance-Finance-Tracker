import { formatMoneyDisplay, moneyString, parseMoney } from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, Text, View, StyleSheet, Share } from 'react-native';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { ProgressBar } from '../../src/components/ProgressBar';
import { ScrollScreen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { StatCard } from '../../src/components/StatCard';
import { useAccounts } from '../../src/hooks/use-accounts';
import { useDebts } from '../../src/hooks/use-debts';
import { useSettings } from '../../src/hooks/use-settings';
import { useFinance } from '../../src/providers/finance-provider';
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
  const { debts, reload } = useDebts();
  const { debts: debtService, refresh } = useFinance();
  const { accounts } = useAccounts();
  const { settings } = useSettings();
  const router = useRouter();

  const currency = settings?.baseCurrency ?? 'BDT';

  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayAccountId, setRepayAccountId] = useState<string | null>(null);
  const [repayError, setRepayError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const activeDebt = debts.find((d) => d.debt.id === selectedDebtId);

  const moneyOwedToYou = useMemo(() => debts.filter((d) => d.debt.type === 'LENT'), [debts]);
  const moneyYouOwe = useMemo(() => debts.filter((d) => d.debt.type === 'BORROWED'), [debts]);

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
      const msg = `Hi ${personName}! Just a friendly reminder regarding the ${formatMoneyDisplay(remaining, curr)} personal balance. Whenever you get a moment to settle, please let me know. Thanks!`;
      await Share.share({
        message: msg,
        title: `Friendly Reminder for ${personName}`,
      });
    } catch {
      // dismissed
    }
  };

  const handleAddIncrement = (inc: number) => {
    const cur = parseFloat(repayAmount) || 0;
    setRepayAmount(String(cur + inc));
  };

  const handleRepay = async () => {
    if (!selectedDebtId || !repayAmount) {
      setRepayError('Please enter a repayment amount');
      return;
    }
    const numAmt = parseFloat(repayAmount);
    if (isNaN(numAmt) || numAmt <= 0) {
      setRepayError('Amount must be greater than 0');
      return;
    }

    setBusy(true);
    try {
      await debtService.recordRepayment(selectedDebtId, {
        amount: repayAmount.trim(),
        accountId: repayAccountId,
      });
      setSelectedDebtId(null);
      setRepayAmount('');
      setRepayAccountId(null);
      setRepayError(null);
      refresh();
      await reload();
    } catch (err) {
      setRepayError(err instanceof Error ? err.message : 'Repayment recording failed');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    await debtService.delete(id);
    refresh();
    await reload();
  };

  return (
    <ScrollScreen>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 2 }}>
          <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
            PEOPLE & MONEY
          </Text>
          <Text style={[typography.title, { color: colors.textPrimary }]}>Lending & Debts</Text>
        </View>
        <Button label="+ Record Loan" size="sm" onPress={() => router.push('/debts/new')} />
      </View>

      {/* Overview Position Cards */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <StatCard
          label="Others Owe You"
          value={formatMoneyDisplay(totalLent, currency)}
          indicatorColor={colors.income}
          icon="🤝"
        />
        <StatCard
          label="You Owe"
          value={formatMoneyDisplay(totalBorrowed, currency)}
          indicatorColor={colors.danger}
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
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm }}>
                  <Button
                    label="💬 Remind"
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
                      setSelectedDebtId(debt.id);
                      setRepayAmount(remainingAmount);
                      setRepayError(null);
                    }}
                  />
                  <Button
                    label="Delete"
                    variant="ghost"
                    size="sm"
                    onPress={() => void handleDelete(debt.id)}
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
                    variant="danger"
                    size="sm"
                  />
                </View>

                {/* Progress bar */}
                <ProgressBar progressPercent={progressPercent} color={colors.danger} height={7} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    Repaid {formatMoneyDisplay(totalRepaid, debt.currency)} ({progressPercent}%)
                  </Text>
                  <Text style={[typography.captionMedium, { color: colors.textPrimary }]}>
                    Remaining {formatMoneyDisplay(remainingAmount, debt.currency)}
                  </Text>
                </View>

                {/* Action row */}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm }}>
                  <Button
                    label="Record Payment"
                    variant="secondary"
                    size="sm"
                    onPress={() => {
                      setSelectedDebtId(debt.id);
                      setRepayAmount(remainingAmount);
                      setRepayError(null);
                    }}
                  />
                  <Button
                    label="Delete"
                    variant="ghost"
                    size="sm"
                    onPress={() => void handleDelete(debt.id)}
                  />
                </View>
              </Card>
            );
          })
        )}
      </View>

      {/* Repayment Modal */}
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
              <SectionHeader title={`Record Repayment for ${activeDebt.debt.personName}`} />
              <Input
                label="Repayment Amount"
                value={repayAmount}
                onChangeText={setRepayAmount}
                keyboardType="decimal-pad"
                prefix={activeDebt.debt.currency}
                error={repayError}
                clearable
                onClear={() => setRepayAmount('')}
              />

              {/* Quick Increment Chips */}
              <View style={{ gap: spacing.xs }}>
                <Text style={[typography.micro, { color: colors.textSecondary }]}>
                  Quick Presets
                </Text>
                <View style={{ flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' }}>
                  {QUICK_REPAY_INCREMENTS.map((inc) => (
                    <Pressable
                      key={inc}
                      onPress={() => handleAddIncrement(inc)}
                      style={[
                        styles.incrementChip,
                        {
                          backgroundColor: colors.surfaceMuted,
                          borderColor: colors.border,
                          borderRadius: radius.pill,
                        },
                      ]}
                    >
                      <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '500' }}>
                        +{inc.toLocaleString()}
                      </Text>
                    </Pressable>
                  ))}
                  <Pressable
                    onPress={() => setRepayAmount(activeDebt.remainingAmount)}
                    style={[
                      styles.incrementChip,
                      {
                        backgroundColor: colors.primaryMuted,
                        borderColor: colors.primary,
                        borderRadius: radius.pill,
                      },
                    ]}
                  >
                    <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                      Full Remaining (
                      {formatMoneyDisplay(activeDebt.remainingAmount, activeDebt.debt.currency)})
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={{ gap: spacing.xs }}>
                <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                  Settlement Account (Optional)
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                  {accounts.map((acc) => (
                    <Pressable
                      key={acc.id}
                      onPress={() => setRepayAccountId(repayAccountId === acc.id ? null : acc.id)}
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
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  incrementChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
});
