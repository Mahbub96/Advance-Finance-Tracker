import { formatMoneyDisplay } from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { Badge, type BadgeVariant } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { ProgressBar } from '../../src/components/ProgressBar';
import { ScrollScreen } from '../../src/components/Screen';
import { useBudgets } from '../../src/hooks/use-budgets';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

function getRiskBadge(risk: string): { label: string; variant: BadgeVariant } {
  if (risk === 'EXCEEDED') return { label: 'Exceeded', variant: 'danger' };
  if (risk === 'ATTENTION') return { label: 'High Risk', variant: 'warning' };
  return { label: 'On Track', variant: 'success' };
}

export default function BudgetsListScreen() {
  const { colors, typography, spacing } = useTokens();
  const { budgets, reload } = useBudgets();
  const { budgets: budgetService, refresh } = useFinance();
  const router = useRouter();

  const handleArchive = async (id: string) => {
    await budgetService.archive(id);
    refresh();
    await reload();
  };

  const handleDelete = async (id: string) => {
    await budgetService.delete(id);
    refresh();
    await reload();
  };

  return (
    <ScrollScreen>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 2 }}>
          <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
            SPENDING LIMITS
          </Text>
          <Text style={[typography.title, { color: colors.textPrimary }]}>Budgets</Text>
        </View>
        <Button label="+ New Budget" size="sm" onPress={() => router.push('/budgets/new')} />
      </View>

      {/* Budget List */}
      <View style={{ gap: spacing.md }}>
        {budgets.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="No budgets configured"
            description="Create monthly limits to stay in control of dining, shopping, or overall expenses."
            actionLabel="Add First Budget"
            onAction={() => router.push('/budgets/new')}
          />
        ) : (
          budgets.map(({ budget, category, spent, remaining, utilizationPercent, risk }) => {
            const { label, variant } = getRiskBadge(risk);
            const isExceeded = risk === 'EXCEEDED';
            const barColor =
              risk === 'EXCEEDED'
                ? colors.danger
                : risk === 'ATTENTION'
                  ? colors.warning
                  : colors.income;

            return (
              <Card key={budget.id} style={{ gap: spacing.md }}>
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
                      {budget.name}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {category?.name ?? 'All Categories'} · {budget.startDate} to {budget.endDate}
                    </Text>
                  </View>
                  <Badge label={label} variant={variant} dot />
                </View>

                {/* Progress bar */}
                <ProgressBar progressPercent={utilizationPercent} color={barColor} height={8} />

                {/* Numbers */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>Spent</Text>
                    <Text
                      style={[
                        typography.numericMedium,
                        { color: colors.textPrimary, fontSize: 15 },
                      ]}
                    >
                      {formatMoneyDisplay(spent, budget.currency)} ({utilizationPercent}%)
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {isExceeded ? 'Over Budget' : 'Remaining'}
                    </Text>
                    <Text
                      style={[
                        typography.numericMedium,
                        { color: isExceeded ? colors.danger : colors.income, fontSize: 15 },
                      ]}
                    >
                      {formatMoneyDisplay(remaining, budget.currency)}
                    </Text>
                  </View>
                </View>

                {/* Action row */}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md }}>
                  <Button
                    label="Archive"
                    variant="outline"
                    size="sm"
                    onPress={() => void handleArchive(budget.id)}
                  />
                  <Button
                    label="Delete"
                    variant="ghost"
                    size="sm"
                    onPress={() => void handleDelete(budget.id)}
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
