import { formatMoneyDisplay, moneyString, parseMoney } from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Badge, type BadgeVariant } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { ScrollScreen } from '../../src/components/Screen';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { DeleteConfirmModal } from '../../src/components/DeleteConfirmModal';
import { RecurringSkeleton } from '../../src/components/skeletons/RecurringSkeleton';
import { useRecurringRules } from '../../src/hooks/use-recurring-rules';
import { useSettings } from '../../src/hooks/use-settings';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

function getDueBadge(dueState: string, days: number): { label: string; variant: BadgeVariant } {
  if (dueState === 'OVERDUE') {
    return { label: `${Math.abs(days)}d OVERDUE`, variant: 'danger' };
  }
  if (dueState === 'DUE' || days === 0) {
    return { label: 'DUE TODAY', variant: 'warning' };
  }
  if (days === 1) {
    return { label: 'Tomorrow', variant: 'warning' };
  }
  return { label: `in ${days} days`, variant: 'neutral' };
}

function getRecurringIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('internet') || n.includes('wifi') || n.includes('broadband')) return '📡';
  if (n.includes('gym') || n.includes('fitness') || n.includes('workout')) return '🏋️';
  if (n.includes('rent') || n.includes('house') || n.includes('apartment')) return '🏠';
  if (n.includes('spotify') || n.includes('netflix') || n.includes('stream') || n.includes('music'))
    return '🎵';
  if (n.includes('electric') || n.includes('gas') || n.includes('water') || n.includes('utility'))
    return '💡';
  if (n.includes('salary') || n.includes('deposit') || n.includes('payroll')) return '💰';
  return '🔁';
}

type RecurringFilter = 'UPCOMING' | 'ALL';

export default function RecurringListScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { recurringRules, loading, reload } = useRecurringRules();
  const { recurringRules: ruleService, refresh } = useFinance();
  const { settings } = useSettings();
  const router = useRouter();

  const currency = settings?.baseCurrency ?? 'BDT';
  const [activeTab, setActiveTab] = useState<RecurringFilter>('UPCOMING');

  // Delete confirm state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const visibleRules = useMemo(() => {
    if (activeTab === 'UPCOMING') {
      return recurringRules.filter((r) => r.rule.status === 'ACTIVE');
    }
    return recurringRules;
  }, [recurringRules, activeTab]);

  // Compute total monthly commitments
  const totalMonthlyCommitment = useMemo(() => {
    const active = recurringRules.filter((r) => r.rule.status === 'ACTIVE');
    const total = active.reduce((sum, r) => {
      const amt = parseMoney(r.rule.amount);
      if (r.rule.frequency === 'DAILY') return sum.plus(amt.times(30));
      if (r.rule.frequency === 'WEEKLY') return sum.plus(amt.times(4.33));
      if (r.rule.frequency === 'YEARLY') return sum.plus(amt.div(12));
      return sum.plus(amt);
    }, parseMoney('0'));
    return moneyString(total);
  }, [recurringRules]);

  if (loading) {
    return <RecurringSkeleton />;
  }

  const filterOptions = [
    {
      id: 'UPCOMING' as const,
      label: 'Upcoming',
      count: recurringRules.filter((r) => r.rule.status === 'ACTIVE').length,
    },
    { id: 'ALL' as const, label: 'All Rules', count: recurringRules.length },
  ];

  const handleExecute = async (id: string) => {
    await ruleService.executeRule(id);
    refresh();
    await reload();
  };

  const handleTogglePause = async (id: string, currentlyPaused: boolean) => {
    if (currentlyPaused) {
      await ruleService.resume(id);
    } else {
      await ruleService.pause(id);
    }
    refresh();
    await reload();
  };

  const confirmDelete = (id: string, name: string) => {
    setDeletingId(id);
    setDeletingName(name);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await ruleService.delete(deletingId);
      refresh();
      await reload();
    } finally {
      setDeleteLoading(false);
      setDeletingId(null);
      setDeletingName('');
    }
  };

  return (
    <ScrollScreen>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 2 }}>
          <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
            FINANCIAL COMMITMENTS
          </Text>
          <Text style={[typography.title, { color: colors.textPrimary }]}>Recurring</Text>
        </View>
        <Button label="+ Add Schedule" size="sm" onPress={() => router.push('/recurring/new')} />
      </View>

      {/* Monthly Commitments Hero Banner per Section 9 */}
      <Card
        style={{
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          gap: spacing.xs,
          padding: spacing.md,
        }}
      >
        <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
          Estimated Monthly Commitments
        </Text>
        <Text style={[typography.display, { color: colors.textPrimary, fontSize: 26 }]}>
          {formatMoneyDisplay(totalMonthlyCommitment, currency)}
        </Text>
        <Text style={[typography.micro, { color: colors.textTertiary }]}>
          {recurringRules.filter((r) => r.rule.status === 'ACTIVE').length} active subscriptions &
          recurring bills
        </Text>
      </Card>

      {/* Upcoming vs All Filter */}
      <SegmentedControl options={filterOptions} value={activeTab} onChange={setActiveTab} />

      {/* Rules List */}
      <View style={{ gap: spacing.sm }}>
        {visibleRules.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No commitments scheduled"
            description="Track upcoming internet bills, house rent, streaming subscriptions, and recurring income."
            actionLabel="Add Commitment"
            onAction={() => router.push('/recurring/new')}
          />
        ) : (
          visibleRules.map(({ rule, daysUntilDue, dueState }) => {
            const isPaused = rule.status === 'PAUSED';
            const { label: dueLabel, variant: dueVariant } = getDueBadge(dueState, daysUntilDue);
            const icon = getRecurringIcon(rule.name);

            return (
              <Card
                key={rule.id}
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
                    style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}
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
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                        <Text
                          style={[
                            typography.sectionTitle,
                            { color: colors.textPrimary, fontSize: 16 },
                          ]}
                        >
                          {rule.name}
                        </Text>
                        {isPaused && <Badge label="PAUSED" variant="neutral" size="sm" />}
                      </View>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        {rule.frequency.toLowerCase()} · {rule.nextOccurrence}
                      </Text>
                    </View>
                  </View>

                  {!isPaused && <Badge label={dueLabel} variant={dueVariant} size="sm" />}
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text style={[typography.caption, { color: colors.textTertiary }]}>
                    Commitment Amount
                  </Text>
                  <Text
                    style={[typography.numericMedium, { color: colors.textPrimary, fontSize: 18 }]}
                  >
                    {formatMoneyDisplay(rule.amount, rule.currency)}
                  </Text>
                </View>

                {/* Actions */}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm }}>
                  {!isPaused && (
                    <Button
                      label="Execute Now"
                      variant="outline"
                      size="sm"
                      onPress={() => void handleExecute(rule.id)}
                    />
                  )}
                  <Button
                    label={isPaused ? 'Resume' : 'Pause'}
                    variant="secondary"
                    size="sm"
                    onPress={() => void handleTogglePause(rule.id, isPaused)}
                  />
                  <Button
                    label="Delete"
                    variant="ghost"
                    size="sm"
                    onPress={() => confirmDelete(rule.id, rule.name)}
                  />
                </View>
              </Card>
            );
          })
        )}
      </View>
      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        visible={!!deletingId}
        title="Delete Schedule?"
        message={`"${deletingName}" will be soft-deleted and stop generating future entries. Existing transactions are unaffected.`}
        deleteLabel="Delete Schedule"
        loading={deleteLoading}
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
});
