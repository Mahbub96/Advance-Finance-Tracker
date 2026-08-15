import { formatMoneyDisplay } from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, Text, View, StyleSheet } from 'react-native';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { DeleteConfirmModal } from '../../src/components/DeleteConfirmModal';
import { EmptyState } from '../../src/components/EmptyState';
import { Input } from '../../src/components/Input';
import { ProgressBar } from '../../src/components/ProgressBar';
import { ScrollScreen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { GoalsSkeleton } from '../../src/components/skeletons/GoalsSkeleton';
import { useAccounts } from '../../src/hooks/use-accounts';
import { useGoals } from '../../src/hooks/use-goals';
import { useFinance } from '../../src/providers/finance-provider';
import { useUndoDelete } from '../../src/providers/undo-delete-provider';
import { useTokens } from '../../src/theme/tokens';

function getGoalIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('emergency') || n.includes('safety') || n.includes('shield')) return '🛡️';
  if (n.includes('laptop') || n.includes('tech') || n.includes('phone') || n.includes('mac'))
    return '💻';
  if (n.includes('travel') || n.includes('vacation') || n.includes('trip') || n.includes('tour'))
    return '✈️';
  if (n.includes('home') || n.includes('renov') || n.includes('house')) return '🏠';
  if (n.includes('car') || n.includes('vehicle') || n.includes('bike')) return '🚗';
  if (n.includes('invest') || n.includes('stock')) return '📈';
  return '🎯';
}

const QUICK_INCREMENTS = [500, 1000, 5000, 10000];

export default function GoalsListScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { goals, loading, reload } = useGoals();
  const { goals: goalService, refresh } = useFinance();
  const { scheduleDelete, isPendingDelete } = useUndoDelete();
  const { accounts } = useAccounts();
  const router = useRouter();

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionAccountId, setContributionAccountId] = useState<string | null>(null);
  const [contributionError, setContributionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Delete confirm state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState('');

  const activeGoals = useMemo(() => {
    return goals.filter((g) => !isPendingDelete(g.goal.id));
  }, [goals, isPendingDelete]);

  if (loading) {
    return <GoalsSkeleton />;
  }

  const activeGoal = activeGoals.find((g) => g.goal.id === selectedGoalId);

  const handleAddIncrement = (inc: number) => {
    const cur = parseFloat(contributionAmount) || 0;
    setContributionAmount(String(cur + inc));
  };

  const handleContribute = async () => {
    if (!selectedGoalId || !contributionAmount) {
      setContributionError('Please enter a valid deposit amount');
      return;
    }
    const amt = parseFloat(contributionAmount);
    if (isNaN(amt) || amt <= 0) {
      setContributionError('Amount must be greater than 0');
      return;
    }

    setBusy(true);
    try {
      await goalService.recordContribution(selectedGoalId, {
        amount: contributionAmount.trim(),
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

  const confirmDelete = (id: string, name: string) => {
    setDeletingId(id);
    setDeletingName(name);
  };

  const handleDelete = () => {
    if (!deletingId) return;
    const idToDelete = deletingId;
    const nameToDelete = deletingName;
    setDeletingId(null);
    setDeletingName('');

    scheduleDelete({
      id: idToDelete,
      message: `Goal "${nameToDelete}" deleted`,
      onExecute: async () => {
        await goalService.delete(idToDelete);
        refresh();
        await reload();
      },
    });
  };

  return (
    <ScrollScreen>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 2 }}>
          <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
            SAVINGS TARGETS
          </Text>
          <Text style={[typography.title, { color: colors.textPrimary }]}>Goals</Text>
        </View>
        <Button label="+ Add Goal" size="sm" onPress={() => router.push('/goals/new')} />
      </View>

      {/* Goal Cards */}
      <View style={{ gap: spacing.md }}>
        {activeGoals.length === 0 ? (
          <EmptyState
            icon="🏆"
            title="No savings goals yet"
            description="Set savings targets for gadgets, emergencies, investments, or dream vacations."
            actionLabel="Create First Goal"
            onAction={() => router.push('/goals/new')}
          />
        ) : (
          activeGoals.map(
            ({
              goal,
              savedAmount,
              remainingAmount,
              progressPercent,
              monthsRemaining,
              requiredMonthlySavings,
              isCompleted,
            }) => {
              const icon = getGoalIcon(goal.name);

              return (
                <Card
                  key={goal.id}
                  style={{
                    gap: spacing.md,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.md,
                        flex: 1,
                      }}
                    >
                      <View
                        style={[
                          styles.iconCircle,
                          {
                            backgroundColor: colors.surfaceMuted,
                            borderRadius: radius.md,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 20 }}>{icon}</Text>
                      </View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text
                          style={[
                            typography.sectionTitle,
                            { color: colors.textPrimary, fontSize: 16 },
                          ]}
                        >
                          {goal.name}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                          {formatMoneyDisplay(savedAmount, goal.currency)} /{' '}
                          {formatMoneyDisplay(goal.targetAmount, goal.currency)}
                          {goal.targetDate ? ` · Target: ${goal.targetDate}` : ''}
                        </Text>
                      </View>
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
                  <View
                    style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md }}
                  >
                    {!isCompleted && (
                      <Button
                        label="Deposit"
                        variant="outline"
                        size="sm"
                        onPress={() => {
                          setSelectedGoalId(goal.id);
                          setContributionAmount('');
                          setContributionError(null);
                        }}
                      />
                    )}
                    <Button
                      label="Delete"
                      variant="ghost"
                      size="sm"
                      onPress={() => confirmDelete(goal.id, goal.name)}
                    />
                  </View>
                </Card>
              );
            },
          )
        )}
      </View>

      {/* Contribution Modal */}
      {selectedGoalId && activeGoal ? (
        <Modal transparent animationType="fade" visible={!!selectedGoalId}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              padding: spacing.lg,
            }}
          >
            <Card
              style={{
                gap: spacing.md,
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              }}
            >
              <SectionHeader title={`Deposit to ${activeGoal.goal.name}`} />

              <Input
                label="Deposit Amount"
                value={contributionAmount}
                onChangeText={setContributionAmount}
                keyboardType="decimal-pad"
                placeholder="1000.00"
                prefix={activeGoal.goal.currency}
                error={contributionError}
                clearable
                onClear={() => setContributionAmount('')}
              />

              {/* Quick Increment Chips */}
              <View style={{ gap: spacing.xs }}>
                <Text style={[typography.micro, { color: colors.textSecondary }]}>
                  Quick Presets
                </Text>
                <View style={{ flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' }}>
                  {QUICK_INCREMENTS.map((inc) => (
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
                    onPress={() => setContributionAmount(activeGoal.remainingAmount)}
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
                      {formatMoneyDisplay(activeGoal.remainingAmount, activeGoal.goal.currency)})
                    </Text>
                  </Pressable>
                </View>
              </View>

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

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        visible={!!deletingId}
        title="Delete Goal?"
        message={`"${deletingName}" and its contribution history will be soft-deleted. Your account balances are not affected.`}
        deleteLabel="Delete Goal"
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          setDeletingId(null);
          setDeletingName('');
        }}
      />
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incrementChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
});
