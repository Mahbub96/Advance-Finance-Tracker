import { formatMoneyDisplay } from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { Badge, type BadgeVariant } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { ScrollScreen } from '../../src/components/Screen';
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

export default function RecurringListScreen() {
  const { colors, typography, spacing } = useTokens();
  const { recurringRules, reload } = useRecurringRules();
  const { recurringRules: ruleService, refresh } = useFinance();
  const router = useRouter();

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
          <Text style={[typography.title, { color: colors.textPrimary }]}>Recurring Rules</Text>
        </View>
        <Button label="+ New Rule" size="sm" onPress={() => router.push('/recurring/new')} />
      </View>

      {/* Rules List */}
      <View style={{ gap: spacing.md }}>
        {recurringRules.length === 0 ? (
          <EmptyState
            icon="🔁"
            title="No recurring schedules"
            description="Automate monthly utilities, internet bills, rent, gym subscriptions, or salary deposits."
            actionLabel="Add Recurring Rule"
            onAction={() => router.push('/recurring/new')}
          />
        ) : (
          recurringRules.map(({ rule, daysUntilDue, dueState }) => {
            const isPaused = rule.status === 'PAUSED';
            const { label: dueLabel, variant: dueVariant } = getDueBadge(dueState, daysUntilDue);

            return (
              <Card key={rule.id} style={{ gap: spacing.md }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
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
                      {rule.type} · {rule.frequency.toLowerCase()} · Next: {rule.nextOccurrence}
                    </Text>
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
