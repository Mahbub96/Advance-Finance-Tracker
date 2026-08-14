import { formatMoneyDisplay } from '@personal-finance/types';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ScrollScreen } from '../../src/components/Screen';
import { useRecurringRules } from '../../src/hooks/use-recurring-rules';
import { useTokens } from '../../src/theme/tokens';

function dueText(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  return `Due in ${days}d`;
}

export default function RecurringListScreen() {
  const { colors, typography, spacing } = useTokens();
  const { recurringRules } = useRecurringRules();

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
          return (
            <Card key={rule.id} style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>{rule.name}</Text>
                  <Text style={{ color: colors.textSecondary }}>
                    {rule.type} · {rule.frequency.toLowerCase()} · next {rule.nextOccurrence}
                  </Text>
                </View>
                <Text style={[typography.caption, { color: dueColor }]}>{dueText(daysUntilDue)}</Text>
              </View>
              <Text style={[typography.body, { color: colors.textPrimary }]}>
                {formatMoneyDisplay(rule.amount, rule.currency)}
              </Text>
            </Card>
          );
        })}
      </View>
    </ScrollScreen>
  );
}
