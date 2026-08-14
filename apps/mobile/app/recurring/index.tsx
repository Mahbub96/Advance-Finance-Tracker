import { formatMoneyDisplay } from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Badge, type BadgeVariant } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { ScrollScreen } from '../../src/components/Screen';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { useRecurringRules } from '../../src/hooks/use-recurring-rules';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

function getDueBadge(dueState: string, days: number): { label: string; variant: BadgeVariant } {
  if (dueState === 'OVERDUE') {
    return { label: `${Math.abs(days)}d OVERDUE`, variant: 'danger' };
  }
  if (dueState === 'DUE') {
    return { label: 'DUE TODAY', variant: 'warning' };
  }
  return { label: `Due in ${days}d`, variant: 'neutral' };
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
  const { recurringRules, reload } = useRecurringRules();
  const { recurringRules: ruleService, refresh } = useFinance();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<RecurringFilter>('UPCOMING');

  const visibleRules = useMemo(() => {
    if (activeTab === 'UPCOMING') {
      return recurringRules.filter((r) => r.rule.status === 'ACTIVE');
    }
    return recurringRules;
  }, [recurringRules, activeTab]);

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

  const handleDelete = async (id: string) => {
    await ruleService.delete(id);
    refresh();
    await reload();
  };

  return (
    <ScrollScreen>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 2 }}>
          <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
            SCHEDULED BILLS & SALARIES
          </Text>
          <Text style={[typography.title, { color: colors.textPrimary }]}>Recurring</Text>
        </View>
        <Button label="+ Add Recurring" size="sm" onPress={() => router.push('/recurring/new')} />
      </View>

      {/* Upcoming vs All Filter */}
      <SegmentedControl options={filterOptions} value={activeTab} onChange={setActiveTab} />

      {/* Rules List */}
      <View style={{ gap: spacing.md }}>
        {visibleRules.length === 0 ? (
          <EmptyState
            icon="🔁"
            title="No recurring schedules"
            description="Automate monthly utilities, internet bills, rent, gym subscriptions, or salary deposits."
            actionLabel="Add Recurring Rule"
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

                <Text
                  style={[typography.numericMedium, { color: colors.textPrimary, fontSize: 18 }]}
                >
                  {formatMoneyDisplay(rule.amount, rule.currency)}
                </Text>

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
                    onPress={() => void handleDelete(rule.id)}
                  />
                </View>
              </Card>
            );
          })
        )}
      </View>
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
