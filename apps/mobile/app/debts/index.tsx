import { formatMoneyDisplay, moneyString, parseMoney } from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
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

  const totalLent = debts
    .filter((d) => d.debt.type === 'LENT')
    .reduce((sum, d) => moneyString(parseMoney(sum).plus(parseMoney(d.remainingAmount))), '0.00');

  const totalBorrowed = debts
    .filter((d) => d.debt.type === 'BORROWED')
    .reduce((sum, d) => moneyString(parseMoney(sum).plus(parseMoney(d.remainingAmount))), '0.00');

  const handleRepay = async () => {
    if (!selectedDebtId || !repayAmount) return;
    setBusy(true);
    try {
      await debtService.recordRepayment(selectedDebtId, {
        amount: repayAmount,
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
            LIABILITIES & RECEIVABLES
          </Text>
          <Text style={[typography.title, { color: colors.textPrimary }]}>Lending & Debts</Text>
        </View>
        <Button label="+ Record Loan" size="sm" onPress={() => router.push('/debts/new')} />
      </View>

      {/* Overview Totals Cards */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <StatCard
          label="You Lent"
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

      {/* Debts List */}
      <View style={{ gap: spacing.md }}>
        {debts.length === 0 ? (
          <EmptyState
            icon="🤝"
            title="No active loan records"
            description="Track money you lent to friends or colleagues, or personal money borrowed."
            actionLabel="Add Loan Record"
            onAction={() => router.push('/debts/new')}
          />
        ) : (
          debts.map(({ debt, totalRepaid, remainingAmount, progressPercent, isOverdue }) => {
            const isLent = debt.type === 'LENT';
            const typeColor = isLent ? colors.income : colors.danger;

            return (
              <Card key={debt.id} style={{ gap: spacing.md }}>
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
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {isLent ? 'Lent out on' : 'Borrowed on'} {debt.issueDate}
                      {debt.dueDate ? ` · Due ${debt.dueDate}` : ''}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
                    <Badge
                      label={isLent ? 'LENT' : 'BORROWED'}
                      variant={isLent ? 'success' : 'danger'}
                      size="sm"
                    />
                    {isOverdue && <Badge label="OVERDUE" variant="danger" size="sm" dot />}
                  </View>
                </View>

                {/* Progress bar */}
                <ProgressBar progressPercent={progressPercent} color={typeColor} height={8} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    Repaid {formatMoneyDisplay(totalRepaid, debt.currency)} ({progressPercent}%)
                  </Text>
                  <Text style={[typography.captionMedium, { color: colors.textPrimary }]}>
                    Remaining {formatMoneyDisplay(remainingAmount, debt.currency)}
                  </Text>
                </View>

                {/* Action row */}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md }}>
                  <Button
                    label="Repay"
                    variant="outline"
                    size="sm"
                    onPress={() => {
                      setSelectedDebtId(debt.id);
                      setRepayAmount(remainingAmount);
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
      {selectedDebtId ? (
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
              <SectionHeader title="Record Repayment" />
              <Input
                label="Repayment Amount"
                value={repayAmount}
                onChangeText={setRepayAmount}
                keyboardType="decimal-pad"
                prefix={currency}
              />

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
                        {acc.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {repayError ? (
                <Text style={{ color: colors.danger, fontSize: 13 }}>⚠️ {repayError}</Text>
              ) : null}

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
