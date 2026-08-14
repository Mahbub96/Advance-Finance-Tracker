import { formatMoneyDisplay } from '@personal-finance/types';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ScrollScreen } from '../../src/components/Screen';
import { useRecurringRules } from '../../src/hooks/use-recurring-rules';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

function dueText(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  return `Due in ${days}d`;
}

export default function RecurringListScreen() {
  const { colors, typography, spacing } = useTokens();
  const { recurringRules, reload } = useRecurringRules();
  const { recurringRules: ruleService, refresh } = useFinance();

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
      <Text style={[typography.title, { color: colors.textPrimary }]}>Recurring</Text>
      <Link href="/recurring/new" asChild>
        <Button label="Add recurring" />
      </Link>
      <View style={{ gap: spacing.md }}>
        {recurringRules.length === 0 ? (
          <Card>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>No recurring rules yet</Text>
            <Text style={{ color: colors.textSecondary }}>
              Add expected bills, subscriptions, salary, or transfers.
            </Text>
          </Card>
        ) : null}
        {recurringRules.map(({ rule, daysUntilDue, dueState }) => {
          const dueColor =
            dueState === 'OVERDUE' ? colors.danger : dueState === 'DUE' ? colors.warning : colors.textSecondary;
          const isPaused = rule.status === 'PAUSED';
          return (
            <Card key={rule.id} style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>{rule.name}</Text>
                  <Text style={{ color: colors.textSecondary }}>
                    {rule.type} · {rule.frequency.toLowerCase()} · next {rule.nextOccurrence}
                    {isPaused ? ' (Paused)' : ''}
                  </Text>
                </View>
                <Text style={[typography.caption, { color: dueColor }]}>{dueText(daysUntilDue)}</Text>
              </View>
              <Text style={[typography.body, { color: colors.textPrimary }]}>
                {formatMoneyDisplay(rule.amount, rule.currency)}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.xs }}>
                {!isPaused && (
                  <Pressable onPress={() => void handleExecute(rule.id)}>
                    <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Execute now</Text>
                  </Pressable>
                )}
                <Pressable onPress={() => void handleTogglePause(rule.id, isPaused)}>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{isPaused ? 'Resume' : 'Pause'}</Text>
                </Pressable>
                <Pressable onPress={() => void handleDelete(rule.id)}>
                  <Text style={{ color: colors.danger, fontSize: 13 }}>Delete</Text>
                </Pressable>
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollScreen>
  );
}

