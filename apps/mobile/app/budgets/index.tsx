import { formatMoneyDisplay, moneyString, parseMoney } from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View, Pressable } from 'react-native';
import { Badge, type BadgeVariant } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { DeleteConfirmModal } from '../../src/components/DeleteConfirmModal';
import { EmptyState } from '../../src/components/EmptyState';
import { ProgressBar } from '../../src/components/ProgressBar';
import { ScrollScreen } from '../../src/components/Screen';
import { BudgetsSkeleton } from '../../src/components/skeletons/BudgetsSkeleton';
import { useBudgets } from '../../src/hooks/use-budgets';
import { useSettings } from '../../src/hooks/use-settings';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

function getRiskBadge(risk: string): { label: string; variant: BadgeVariant } {
  if (risk === 'EXCEEDED') return { label: 'Exceeded', variant: 'danger' };
  if (risk === 'ATTENTION') return { label: 'High Risk', variant: 'warning' };
  return { label: 'On Track', variant: 'success' };
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function BudgetsListScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { budgets, loading, reload } = useBudgets();
  const { budgets: budgetService, refresh } = useFinance();
  const { settings } = useSettings();
  const router = useRouter();

  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
  const currentYear = new Date().getFullYear();
  const currency = settings?.baseCurrency ?? 'BDT';

  // Delete confirm state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Aggregated totals across all active budgets
  const summary = useMemo(() => {
    if (budgets.length === 0) return null;
    let totalTarget = parseMoney('0');
    let totalSpent = parseMoney('0');

    for (const b of budgets) {
      totalTarget = totalTarget.plus(parseMoney(b.budget.amount));
      totalSpent = totalSpent.plus(parseMoney(b.spent));
    }

    const targetStr = moneyString(totalTarget);
    const spentStr = moneyString(totalSpent);
    const remaining = moneyString(totalTarget.minus(totalSpent));
    const percent = totalTarget.gt(0)
      ? Math.min(100, Math.round((totalSpent.toNumber() / totalTarget.toNumber()) * 100))
      : 0;

    return {
      target: targetStr,
      spent: spentStr,
      remaining: parseFloat(remaining) >= 0 ? remaining : '0.00',
      percent,
      isExceeded: totalSpent.gt(totalTarget),
    };
  }, [budgets]);

  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) => (prev === 0 ? 11 : prev - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => (prev === 11 ? 0 : prev + 1));
  };

  const handleArchive = async (id: string) => {
    await budgetService.archive(id);
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
      await budgetService.delete(deletingId);
      refresh();
      await reload();
    } finally {
      setDeleteLoading(false);
      setDeletingId(null);
      setDeletingName('');
    }
  };

  if (loading) {
    return <BudgetsSkeleton />;
  }

  return (
    <ScrollScreen>
      {/* Header & Month Navigation */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 2 }}>
          <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
            SPENDING LIMITS
          </Text>
          <Text style={[typography.title, { color: colors.textPrimary }]}>Budgets</Text>
        </View>
        <Button label="+ Create Budget" size="sm" onPress={() => router.push('/budgets/new')} />
      </View>

      {/* Month Navigator Bar */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        }}
      >
        <Pressable onPress={handlePrevMonth} style={{ padding: 4 }}>
          <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '700' }}>‹</Text>
        </Pressable>
        <Text style={[typography.sectionTitle, { color: colors.textPrimary, fontSize: 15 }]}>
          {MONTHS[currentMonthIndex]} {currentYear}
        </Text>
        <Pressable onPress={handleNextMonth} style={{ padding: 4 }}>
          <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '700' }}>›</Text>
        </Pressable>
      </View>

      {/* Overall Month Budget Summary Hero Card */}
      {summary && (
        <Card
          style={{
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
            gap: spacing.md,
          }}
        >
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <View style={{ gap: 2 }}>
              <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                Total Monthly Budget
              </Text>
              <Text style={[typography.numericLarge, { color: colors.textPrimary, fontSize: 22 }]}>
                {formatMoneyDisplay(summary.spent, currency)} of{' '}
                {formatMoneyDisplay(summary.target, currency)}
              </Text>
            </View>
            <Badge
              label={`${summary.percent}%`}
              variant={
                summary.percent > 90 ? 'danger' : summary.percent > 75 ? 'warning' : 'success'
              }
            />
          </View>

          <ProgressBar
            progressPercent={summary.percent}
            color={
              summary.percent > 90
                ? colors.danger
                : summary.percent > 75
                  ? colors.warning
                  : colors.income
            }
            height={8}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {summary.isExceeded ? 'Over limit' : 'Remaining to spend:'}
            </Text>
            <Text
              style={[
                typography.captionMedium,
                { color: summary.isExceeded ? colors.danger : colors.income },
              ]}
            >
              {formatMoneyDisplay(summary.remaining, currency)}
            </Text>
          </View>
        </Card>
      )}

      {/* Category Budget List */}
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
              <Card
                key={budget.id}
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
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: radius.md,
                        backgroundColor: colors.surfaceMuted,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 18 }}>{category?.icon || '🎯'}</Text>
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text
                        style={[
                          typography.sectionTitle,
                          { color: colors.textPrimary, fontSize: 16 },
                        ]}
                      >
                        {budget.name}
                      </Text>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        {category?.name ?? 'All Categories'} · {budget.startDate} to{' '}
                        {budget.endDate}
                      </Text>
                    </View>
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
                    onPress={() => confirmDelete(budget.id, budget.name)}
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
        title="Delete Budget?"
        message={`"${deletingName}" and all its tracking data will be soft-deleted. Your past transactions are unaffected.`}
        deleteLabel="Delete Budget"
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
