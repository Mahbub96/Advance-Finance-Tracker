import { formatMoneyDisplay } from '@personal-finance/types';
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
import { useAccounts } from '../../src/hooks/use-accounts';
import { useGoals } from '../../src/hooks/use-goals';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

export default function GoalsListScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { goals, reload } = useGoals();
  const { goals: goalService, refresh } = useFinance();
  const { accounts } = useAccounts();
  const router = useRouter();

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionAccountId, setContributionAccountId] = useState<string | null>(null);
  const [contributionError, setContributionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleContribute = async () => {
    if (!selectedGoalId || !contributionAmount) return;
    setBusy(true);
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
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    await goalService.delete(id);
    refresh();
    await reload();
  };

  return (
    <ScrollScreen>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 2 }}>
          <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
            SAVINGS TARGETS
          </Text>
          <Text style={[typography.title, { color: colors.textPrimary }]}>Financial Goals</Text>
        </View>
        <Button label="+ New Goal" size="sm" onPress={() => router.push('/goals/new')} />
      </View>

      {/* Goal Cards */}
      <View style={{ gap: spacing.md }}>
        {goals.length === 0 ? (
          <EmptyState
            icon="🏆"
            title="No savings goals yet"
            description="Set savings targets for gadgets, emergencies, investments, or dream vacations."
            actionLabel="Create First Goal"
            onAction={() => router.push('/goals/new')}
          />
        ) : (
          goals.map(
            ({
              goal,
              savedAmount,
              remainingAmount,
              progressPercent,
              monthsRemaining,
              requiredMonthlySavings,
              isCompleted,
            }) => (
              <Card key={goal.id} style={{ gap: spacing.md }}>
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
                      {goal.name}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      Target: {formatMoneyDisplay(goal.targetAmount, goal.currency)}
                      {goal.targetDate ? ` · by ${goal.targetDate}` : ''}
                    </Text>
                  </View>
                  <Badge
                    label={isCompleted ? 'COMPLETED' : `${progressPercent}%`}
                    variant={isCompleted ? 'success' : 'primary'}
                  />
                </View>

                {/* Progress bar */}
                <ProgressBar
                  progressPercent={progressPercent}
                  color={isCompleted ? colors.income : colors.primary}
                  height={8}
                />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    Saved {formatMoneyDisplay(savedAmount, goal.currency)}
                  </Text>
                  <Text style={[typography.captionMedium, { color: colors.textPrimary }]}>
                    Remaining {formatMoneyDisplay(remainingAmount, goal.currency)}
                  </Text>
                </View>

                {requiredMonthlySavings && !isCompleted ? (
                  <View
                    style={{
                      backgroundColor: colors.surfaceMuted,
                      padding: spacing.sm,
                      borderRadius: radius.md,
                    }}
                  >
                    <Text style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 16 }}>
                      💡 Target pace: Save{' '}
                      {formatMoneyDisplay(requiredMonthlySavings, goal.currency)}/mo for{' '}
                      {monthsRemaining} mo.
                    </Text>
                  </View>
                ) : null}

                {/* Action row */}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md }}>
                  {!isCompleted && (
                    <Button
                      label="Deposit"
                      variant="outline"
                      size="sm"
                      onPress={() => {
                        setSelectedGoalId(goal.id);
                        setContributionAmount('');
                      }}
                    />
                  )}
                  <Button
                    label="Delete"
                    variant="ghost"
                    size="sm"
                    onPress={() => void handleDelete(goal.id)}
                  />
                </View>
              </Card>
            ),
          )
        )}
      </View>

      {/* Contribution Modal */}
      {selectedGoalId ? (
        <Modal transparent animationType="fade" visible={!!selectedGoalId}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              padding: spacing.lg,
            }}
          >
            <Card style={{ gap: spacing.md, backgroundColor: colors.surfaceElevated }}>
              <SectionHeader title="Record Goal Contribution" />
              <Input
                label="Deposit Amount"
                value={contributionAmount}
                onChangeText={setContributionAmount}
                keyboardType="decimal-pad"
                placeholder="1000.00"
              />

              <View style={{ gap: spacing.xs }}>
                <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                  Deduct from Wallet / Account (Optional)
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                  {accounts.map((acc) => (
                    <Pressable
                      key={acc.id}
                      onPress={() =>
                        setContributionAccountId(contributionAccountId === acc.id ? null : acc.id)
                      }
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: spacing.sm,
                        borderRadius: radius.sm,
                        borderWidth: 1,
                        borderColor:
                          contributionAccountId === acc.id ? colors.primary : colors.border,
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
                          fontWeight: contributionAccountId === acc.id ? '600' : '400',
                        }}
                      >
                        {acc.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {contributionError ? (
                <Text style={{ color: colors.danger, fontSize: 13 }}>⚠️ {contributionError}</Text>
              ) : null}

              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Cancel"
                    variant="secondary"
                    onPress={() => setSelectedGoalId(null)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label={busy ? 'Saving...' : 'Confirm'}
                    loading={busy}
                    onPress={() => void handleContribute()}
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
