import { formatMoneyDisplay, moneyString, parseMoney } from '@personal-finance/types';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { ScrollScreen } from '../../src/components/Screen';
import { useAccounts } from '../../src/hooks/use-accounts';
import { useDebts } from '../../src/hooks/use-debts';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

export default function DebtsListScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { debts, reload } = useDebts();
  const { debts: debtService, refresh } = useFinance();
  const { accounts } = useAccounts();

  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayAccountId, setRepayAccountId] = useState<string | null>(null);
  const [repayError, setRepayError] = useState<string | null>(null);

  const totalLent = debts
    .filter((d) => d.debt.type === 'LENT')
    .reduce((sum, d) => moneyString(parseMoney(sum).plus(parseMoney(d.remainingAmount))), '0.00');

  const totalBorrowed = debts
    .filter((d) => d.debt.type === 'BORROWED')
    .reduce((sum, d) => moneyString(parseMoney(sum).plus(parseMoney(d.remainingAmount))), '0.00');

  const handleRepay = async () => {
    if (!selectedDebtId || !repayAmount) return;
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
      setRepayError(err instanceof Error ? err.message : 'Repayment failed');
    }
  };

  const handleDelete = async (id: string) => {
    await debtService.delete(id);
    refresh();
    await reload();
  };

  return (
    <ScrollScreen>
      <Text style={[typography.title, { color: colors.textPrimary }]}>Lending & Borrowing</Text>
      
      {/* Overview Totals */}
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Card style={{ flex: 1, backgroundColor: colors.surface }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>You Lent</Text>
          <Text style={[typography.title, { color: colors.income, fontSize: 20 }]}>
            {formatMoneyDisplay(totalLent, 'BDT')}
          </Text>
        </Card>
        <Card style={{ flex: 1, backgroundColor: colors.surface }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>You Owe</Text>
          <Text style={[typography.title, { color: colors.danger, fontSize: 20 }]}>
            {formatMoneyDisplay(totalBorrowed, 'BDT')}
          </Text>
        </Card>
      </View>

      <Link href="/debts/new" asChild>
        <Button label="Add loan / borrowing" />
      </Link>

      <View style={{ gap: spacing.md }}>
        {debts.length === 0 ? (
          <Card>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>No active records</Text>
            <Text style={{ color: colors.textSecondary }}>
              Track money you lent to friends or borrowed from others.
            </Text>
          </Card>
        ) : null}

        {debts.map(({ debt, totalRepaid, remainingAmount, progressPercent, isOverdue }) => {
          const isLent = debt.type === 'LENT';
          const typeColor = isLent ? colors.income : colors.danger;
          return (
            <Card key={debt.id} style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
                    {debt.personName}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                    {isLent ? 'Lent to' : 'Borrowed from'} · {debt.issueDate}
                    {debt.dueDate ? ` · Due ${debt.dueDate}` : ''}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[typography.caption, { color: typeColor, fontWeight: '700' }]}>
                    {isLent ? 'LENT' : 'BORROWED'}
                  </Text>
                  {isOverdue && (
                    <Text style={[typography.caption, { color: colors.danger, fontWeight: '600' }]}>
                      Overdue
                    </Text>
                  )}
                </View>
              </View>

              {/* Progress bar */}
              <View style={{ height: 6, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted }}>
                <View
                  style={{
                    width: `${Math.min(100, progressPercent)}%`,
                    height: 6,
                    borderRadius: radius.pill,
                    backgroundColor: typeColor,
                  }}
                />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                  Repaid {formatMoneyDisplay(totalRepaid, debt.currency)} ({progressPercent}%)
                </Text>
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                  Remaining {formatMoneyDisplay(remainingAmount, debt.currency)}
                </Text>
              </View>

              {/* Action row */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md, marginTop: spacing.xs }}>
                <Pressable onPress={() => {
                  setSelectedDebtId(debt.id);
                  setRepayAmount(remainingAmount);
                }}>
                  <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>
                    Record repayment
                  </Text>
                </Pressable>
                <Pressable onPress={() => void handleDelete(debt.id)}>
                  <Text style={{ color: colors.danger, fontSize: 13 }}>Delete</Text>
                </Pressable>
              </View>
            </Card>
          );
        })}
      </View>

      {/* Repayment Modal */}
      {selectedDebtId ? (
        <Modal transparent animationType="fade" visible={!!selectedDebtId}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.lg }}>
            <Card style={{ gap: spacing.md }}>
              <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Record Repayment</Text>
              <Input
                label="Repayment Amount"
                value={repayAmount}
                onChangeText={setRepayAmount}
                keyboardType="decimal-pad"
              />
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Settlement Account (Optional):</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                {accounts.map((acc) => (
                  <Pressable
                    key={acc.id}
                    onPress={() => setRepayAccountId(repayAccountId === acc.id ? null : acc.id)}
                    style={{
                      paddingVertical: spacing.xs,
                      paddingHorizontal: spacing.sm,
                      borderRadius: radius.sm,
                      backgroundColor: repayAccountId === acc.id ? colors.primary : colors.surfaceMuted,
                    }}
                  >
                    <Text style={{ color: repayAccountId === acc.id ? colors.primaryForeground : colors.textPrimary, fontSize: 12 }}>
                      {acc.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {repayError ? <Text style={{ color: colors.danger }}>{repayError}</Text> : null}
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Button label="Cancel" variant="secondary" onPress={() => setSelectedDebtId(null)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button label="Confirm" onPress={() => void handleRepay()} />
                </View>
              </View>
            </Card>
          </View>
        </Modal>
      ) : null}
    </ScrollScreen>
  );
}
