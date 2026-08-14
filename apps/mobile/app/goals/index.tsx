import { formatMoneyDisplay } from '@personal-finance/types';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { ScrollScreen } from '../../src/components/Screen';
import { useAccounts } from '../../src/hooks/use-accounts';
import { useGoals } from '../../src/hooks/use-goals';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

export default function GoalsListScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { goals, reload } = useGoals();
  const { goals: goalService, refresh } = useFinance();
  const { accounts } = useAccounts();

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionAccountId, setContributionAccountId] = useState<string | null>(null);
  const [contributionError, setContributionError] = useState<string | null>(null);

  const handleContribute = async () => {
    if (!selectedGoalId || !contributionAmount) return;
    try {
      await goalService.recordContribution(selectedGoalId, {
        amount: contributionAmount,
        accountId: contributionAccountId,
      });
      setSelectedGoalId(null);
      setContributionAmount('');
      setContributionAccountId(null);
      setContributionError(null);
      refresh();
      await reload();
    } catch (err) {
      setContributionError(err instanceof Error ? err.message : 'Contribution failed');
    }
  };

  const handleDelete = async (id: string) => {
    await goalService.delete(id);
    refresh();
    await reload();
  };

  return (
    <ScrollScreen>
      <Text style={[typography.title, { color: colors.textPrimary }]}>Financial Goals</Text>

      <Link href="/goals/new" asChild>
        <Button label="Add new goal" />
      </Link>

      <View style={{ gap: spacing.md }}>
        {goals.length === 0 ? (
          <Card>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>No active goals</Text>
            <Text style={{ color: colors.textSecondary }}>
              Set savings targets for gadgets, emergencies, travel, or education.
            </Text>
          </Card>
        ) : null}

        {goals.map(
          ({
            goal,
            savedAmount,
            remainingAmount,
            progressPercent,
            monthsRemaining,
            requiredMonthlySavings,
            isCompleted,
          }) => (
            <Card key={goal.id} style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>{goal.name}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                    Target: {formatMoneyDisplay(goal.targetAmount, goal.currency)}
                    {goal.targetDate ? ` · by ${goal.targetDate}` : ''}
                  </Text>
                </View>
                <Text
                  style={[
                    typography.caption,
                    {
                      color: isCompleted ? colors.income : colors.primary,
                      fontWeight: '700',
                    },
                  ]}
                >
                  {isCompleted ? 'COMPLETED' : `${progressPercent}%`}
                </Text>
              </View>

              {/* Progress bar */}
              <View style={{ height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted }}>
                <View
                  style={{
                    width: `${Math.min(100, progressPercent)}%`,
                    height: 8,
                    borderRadius: radius.pill,
                    backgroundColor: isCompleted ? colors.income : colors.primary,
                  }}
                />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                  Saved {formatMoneyDisplay(savedAmount, goal.currency)}
                </Text>
                <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13 }}>
                  Left {formatMoneyDisplay(remainingAmount, goal.currency)}
                </Text>
              </View>

              {requiredMonthlySavings && !isCompleted && (
                <View style={{ backgroundColor: colors.surfaceMuted, padding: spacing.xs, borderRadius: radius.sm }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    💡 Save {formatMoneyDisplay(requiredMonthlySavings, goal.currency)}/mo for {monthsRemaining} mo to hit target.
                  </Text>
                </View>
              )}

              {/* Action row */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md, marginTop: spacing.xs }}>
                {!isCompleted && (
                  <Pressable onPress={() => {
                    setSelectedGoalId(goal.id);
                    setContributionAmount('');
                  }}>
                    <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>
                      Add contribution
                    </Text>
                  </Pressable>
                )}
                <Pressable onPress={() => void handleDelete(goal.id)}>
                  <Text style={{ color: colors.danger, fontSize: 13 }}>Delete</Text>
                </Pressable>
              </View>
            </Card>
          ),
        )}
      </View>

      {/* Contribution Modal */}
      {selectedGoalId ? (
        <Modal transparent animationType="fade" visible={!!selectedGoalId}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.lg }}>
            <Card style={{ gap: spacing.md }}>
              <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Add Goal Contribution</Text>
              <Input
                label="Deposit Amount"
                value={contributionAmount}
                onChangeText={setContributionAmount}
                keyboardType="decimal-pad"
                placeholder="2000"
              />
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Deduct from Account (Optional):</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                {accounts.map((acc) => (
                  <Pressable
                    key={acc.id}
                    onPress={() =>
                      setContributionAccountId(
                        contributionAccountId === acc.id ? null : acc.id,
                      )
                    }
                    style={{
                      paddingVertical: spacing.xs,
                      paddingHorizontal: spacing.sm,
                      borderRadius: radius.sm,
                      backgroundColor:
                        contributionAccountId === acc.id ? colors.primary : colors.surfaceMuted,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          contributionAccountId === acc.id
                            ? colors.primaryForeground
                            : colors.textPrimary,
                        fontSize: 12,
                      }}
                    >
                      {acc.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {contributionError ? <Text style={{ color: colors.danger }}>{contributionError}</Text> : null}
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Button label="Cancel" variant="secondary" onPress={() => setSelectedGoalId(null)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button label="Confirm" onPress={() => void handleContribute()} />
                </View>
              </View>
            </Card>
          </View>
        </Modal>
      ) : null}
    </ScrollScreen>
  );
}
