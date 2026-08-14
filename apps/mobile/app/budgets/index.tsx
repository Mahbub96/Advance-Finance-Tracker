import { formatMoneyDisplay } from '@personal-finance/types';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ScrollScreen } from '../../src/components/Screen';
import { useBudgets } from '../../src/hooks/use-budgets';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

function riskLabel(risk: string): string {
  if (risk === 'EXCEEDED') return 'Exceeded';
  if (risk === 'ATTENTION') return 'Attention';
  return 'On track';
}

export default function BudgetsListScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { budgets, reload } = useBudgets();
  const { budgets: budgetService, refresh } = useFinance();

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
      <Text style={[typography.title, { color: colors.textPrimary }]}>Budgets</Text>
      <Link href="/budgets/new" asChild>
        <Button label="Add budget" />
      </Link>
      <View style={{ gap: spacing.md }}>
        {budgets.length === 0 ? (
          <Card>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>No budgets yet</Text>
            <Text style={{ color: colors.textSecondary }}>
              Create a monthly limit to compare planned and actual spending.
            </Text>
          </Card>
        ) : null}
        {budgets.map(({ budget, category, spent, remaining, utilizationPercent, risk }) => {
          const riskColor =
            risk === 'EXCEEDED' ? colors.danger : risk === 'ATTENTION' ? colors.warning : colors.income;
          return (
            <Card key={budget.id} style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>{budget.name}</Text>
                  <Text style={{ color: colors.textSecondary }}>
                    {category?.name ?? 'All expenses'} · {budget.startDate} to {budget.endDate}
                  </Text>
                </View>
                <Text style={[typography.caption, { color: riskColor }]}>{riskLabel(risk)}</Text>
              </View>
              <View style={{ height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted }}>
                <View
                  style={{
                    width: `${Math.min(100, utilizationPercent)}%`,
                    height: 8,
                    borderRadius: radius.pill,
                    backgroundColor: riskColor,
                  }}
                />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.textSecondary }}>
                  Spent {formatMoneyDisplay(spent, budget.currency)}
                </Text>
                <Text style={{ color: colors.textPrimary }}>
                  Left {formatMoneyDisplay(remaining, budget.currency)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.xs }}>
                <Pressable onPress={() => void handleArchive(budget.id)}>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Archive</Text>
                </Pressable>
                <Pressable onPress={() => void handleDelete(budget.id)}>
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

