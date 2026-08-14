import { formatMoneyDisplay } from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { useEffect, useState, useMemo } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Badge } from '../../src/components/Badge';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { GradientCard } from '../../src/components/GradientCard';
import { ProgressBar } from '../../src/components/ProgressBar';
import { QuickActionGrid } from '../../src/components/QuickActionGrid';
import { ScrollScreen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { SparklineChart } from '../../src/components/charts/SparklineChart';
import { TransactionRow } from '../../src/features/transactions/components/TransactionRow';
import { useAccounts } from '../../src/hooks/use-accounts';
import { useBudgets } from '../../src/hooks/use-budgets';
import { useGoals } from '../../src/hooks/use-goals';
import { useIntelligence } from '../../src/hooks/use-intelligence';
import { useRecurringRules } from '../../src/hooks/use-recurring-rules';
import { useSettings } from '../../src/hooks/use-settings';
import { useTransactions } from '../../src/hooks/use-transactions';
import { monthRange } from '../../src/lib/clock';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';
import { useThemeContext } from '../../src/theme/theme-context';

function getGreeting(name?: string | null): { greeting: string; icon: string; dateStr: string } {
  const hour = new Date().getHours();
  let text = 'Good morning';
  let icon = '☀️';
  if (hour >= 12 && hour < 17) {
    text = 'Good afternoon';
    icon = '🌤️';
  } else if (hour >= 17 || hour < 5) {
    text = 'Good evening';
    icon = '🌙';
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  };
  const dateStr = new Date().toLocaleDateString('en-US', dateOptions);

  return {
    greeting: name ? `${text}, ${name}` : text,
    icon,
    dateStr,
  };
}

export default function HomeScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { hideBalance, setHideBalance } = useThemeContext();
  const { settings } = useSettings();
  const { accounts, totalBalance } = useAccounts();
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();
  const { goals } = useGoals();
  const { recurringRules } = useRecurringRules();
  const { healthScore, insights } = useIntelligence();
  const { analytics, nonce } = useFinance();
  const router = useRouter();

  const [cashFlow, setCashFlow] = useState({
    totalIncome: '0.00',
    totalExpenses: '0.00',
    netSavings: '0.00',
    savingsRatePercent: 0,
  });
  const [sparklinePoints, setSparklinePoints] = useState<number[]>([0, 0]);
  const [momDelta, setMomDelta] = useState<string>('+0.0%');

  useEffect(() => {
    const { from, to } = monthRange();
    void analytics.getCashFlow(from, to).then(setCashFlow);
    void analytics.getDailyBalanceSparkline(14).then(setSparklinePoints);

    // Calculate real month-over-month delta
    const now = new Date();
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevYearMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
    const prevFirst = `${prevYearMonth}-01`;
    const prevLast = `${prevYearMonth}-${String(new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;

    void Promise.all([
      analytics.getCashFlow(from, to),
      analytics.getCashFlow(prevFirst, prevLast),
    ]).then(([current, prev]) => {
      const curInc = parseFloat(current.totalIncome);
      const prevInc = parseFloat(prev.totalIncome);
      if (prevInc > 0) {
        const diff = Math.round(((curInc - prevInc) / prevInc) * 100);
        setMomDelta(diff >= 0 ? `↑ +${diff}%` : `↓ ${diff}%`);
      } else if (curInc > 0) {
        setMomDelta('↑ +100%');
      } else {
        setMomDelta('0%');
      }
    });
  }, [analytics, nonce]);

  const currency = settings?.baseCurrency ?? 'BDT';
  const recent = transactions.filter((tx) => tx.transferLeg !== 'IN').slice(0, 4);
  const { greeting, icon: greetingIcon, dateStr } = getGreeting(settings?.displayName);

  // Top 3 actionable insights per Section 12
  const topInsights = insights.slice(0, 3);

  // Upcoming commitments (next 3 due rules) per Section 9
  const upcomingReminders = useMemo(() => {
    return recurringRules.filter((r) => r.rule.status === 'ACTIVE').slice(0, 3);
  }, [recurringRules]);

  // Active budgets summary preview
  const primaryBudget = budgets[0];

  // Active goals preview
  const primaryGoal = goals[0];

  const maskedBalance = '••••••••';
  const displayedBalance = hideBalance ? maskedBalance : formatMoneyDisplay(totalBalance, currency);

  const quickActions = [
    {
      id: 'add-expense',
      icon: '💸',
      label: '+ Expense',
      onPress: () => router.push('/(tabs)/add?mode=EXPENSE'),
      bgColor: colors.expenseMuted,
    },
    {
      id: 'add-income',
      icon: '💰',
      label: '+ Income',
      onPress: () => router.push('/(tabs)/add?mode=INCOME'),
      bgColor: colors.incomeMuted,
    },
    {
      id: 'transfer',
      icon: '⇄',
      label: 'Transfer',
      onPress: () => router.push('/(tabs)/add?mode=TRANSFER'),
      bgColor: colors.transferMuted,
    },
    {
      id: 'goals',
      icon: '🏆',
      label: 'Add Goal',
      onPress: () => router.push('/goals/new'),
      bgColor: colors.primaryMuted,
    },
  ];

  return (
    <ScrollScreen>
      {/* 1. GREETING / DATE HEADER */}
      <View style={styles.headerRow}>
        <View style={{ gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 16 }}>{greetingIcon}</Text>
            <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
              {greeting}
            </Text>
          </View>
          <Text style={[typography.micro, { color: colors.textTertiary }]}>{dateStr}</Text>
        </View>

        {/* Privacy & Health Score Pill */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Pressable
            onPress={() => setHideBalance(!hideBalance)}
            accessibilityLabel={hideBalance ? 'Show balance' : 'Hide balance'}
            style={[
              styles.iconBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.pill,
              },
            ]}
          >
            <Text style={{ fontSize: 14 }}>{hideBalance ? '👁️' : '🔒'}</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/intelligence')}
            style={[
              styles.healthPill,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.pill,
              },
            ]}
          >
            <Text style={{ fontSize: 12 }}>⚡</Text>
            <Text style={[typography.captionMedium, { color: colors.textPrimary, fontSize: 12 }]}>
              {healthScore?.score ?? 85}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* 2. TOTAL FINANCIAL POSITION (VISUALLY DOMINANT) */}
      <GradientCard
        accent
        style={{
          borderRadius: radius.xl,
          padding: spacing.lg,
        }}
      >
        <View style={{ gap: spacing.sm }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text
              style={[
                typography.captionMedium,
                { color: 'rgba(255, 255, 255, 0.85)', letterSpacing: 0.5 },
              ]}
            >
              TOTAL FINANCIAL POSITION
            </Text>
            <View
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: radius.pill,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>{momDelta}</Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 10 }}>vs last mo</Text>
            </View>
          </View>

          <Text
            style={[
              typography.display,
              { color: '#FFFFFF', fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
            ]}
            numberOfLines={1}
          >
            {displayedBalance}
          </Text>

          {/* Sparkline wave visualization inside hero */}
          <View style={{ marginTop: 2, opacity: 0.9 }}>
            <SparklineChart
              data={sparklinePoints}
              color="#FFFFFF"
              fillColor="rgba(255, 255, 255, 0.15)"
              height={32}
            />
          </View>
        </View>
      </GradientCard>

      {/* 3. INCOME / EXPENSE / SAVED 3-METRIC ROW */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {/* Income */}
        <View
          style={[
            styles.statBox,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.lg,
            },
          ]}
        >
          <Text style={[typography.micro, { color: colors.textTertiary }]}>Income</Text>
          <Text style={[typography.numericMedium, { color: colors.income, fontSize: 15 }]}>
            {hideBalance ? maskedBalance : formatMoneyDisplay(cashFlow.totalIncome, currency)}
          </Text>
        </View>

        {/* Expense */}
        <View
          style={[
            styles.statBox,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.lg,
            },
          ]}
        >
          <Text style={[typography.micro, { color: colors.textTertiary }]}>Expense</Text>
          <Text style={[typography.numericMedium, { color: colors.expense, fontSize: 15 }]}>
            {hideBalance ? maskedBalance : formatMoneyDisplay(cashFlow.totalExpenses, currency)}
          </Text>
        </View>

        {/* Saved */}
        <View
          style={[
            styles.statBox,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.lg,
            },
          ]}
        >
          <Text style={[typography.micro, { color: colors.textTertiary }]}>Saved</Text>
          <Text style={[typography.numericMedium, { color: colors.textPrimary, fontSize: 15 }]}>
            {hideBalance ? maskedBalance : formatMoneyDisplay(cashFlow.netSavings, currency)}
          </Text>
        </View>
      </View>

      {/* 4. QUICK ACTIONS (1-2 TAP WORKFLOWS) */}
      <QuickActionGrid customActions={quickActions} />

      {/* 5. RECENT TRANSACTIONS */}
      <View style={{ gap: spacing.xs }}>
        <SectionHeader
          title="Recent Activity"
          actionLabel="See all"
          onAction={() => router.push('/(tabs)/transactions')}
        />

        {recent.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No recent records"
            description="Log your daily coffee, groceries or income to see live analytics."
            actionLabel="Add Transaction"
            onAction={() => router.push('/(tabs)/add')}
          />
        ) : (
          <View style={{ gap: spacing.xs }}>
            {recent.map((tx) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                accountName={accounts.find((a) => a.id === tx.accountId)?.name}
                onPress={() => router.push('/(tabs)/transactions')}
              />
            ))}
          </View>
        )}
      </View>

      {/* 6. BUDGET STATUS (VISUAL PROGRESS & REMAINING) */}
      {primaryBudget && (
        <View style={{ gap: spacing.xs }}>
          <SectionHeader
            title="Budget Status"
            actionLabel="View all"
            onAction={() => router.push('/(tabs)/budgets')}
          />

          <Card
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              gap: spacing.sm,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={{ gap: 2 }}>
                <Text
                  style={[typography.sectionTitle, { color: colors.textPrimary, fontSize: 15 }]}
                >
                  {primaryBudget.budget.name}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {formatMoneyDisplay(primaryBudget.spent, primaryBudget.budget.currency)} of{' '}
                  {formatMoneyDisplay(primaryBudget.budget.amount, primaryBudget.budget.currency)}
                </Text>
              </View>
              <Badge
                label={`${primaryBudget.utilizationPercent}% used`}
                variant={
                  primaryBudget.utilizationPercent > 90
                    ? 'danger'
                    : primaryBudget.utilizationPercent > 75
                      ? 'warning'
                      : 'success'
                }
              />
            </View>

            <ProgressBar
              progressPercent={primaryBudget.utilizationPercent}
              color={
                primaryBudget.utilizationPercent > 90
                  ? colors.danger
                  : primaryBudget.utilizationPercent > 75
                    ? colors.warning
                    : colors.income
              }
              height={7}
            />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={[typography.micro, { color: colors.textTertiary }]}>
                {primaryBudget.risk === 'EXCEEDED'
                  ? '⚠️ Over limit'
                  : `${formatMoneyDisplay(primaryBudget.remaining, primaryBudget.budget.currency)} remaining`}
              </Text>
              {primaryBudget.utilizationPercent > 80 && (
                <Text style={[typography.micro, { color: colors.danger, fontWeight: '600' }]}>
                  Projected to exceed limit
                </Text>
              )}
            </View>
          </Card>
        </View>
      )}

      {/* 7. UPCOMING OBLIGATIONS (RECURRING COMMITMENTS) */}
      {upcomingReminders.length > 0 && (
        <View style={{ gap: spacing.xs }}>
          <SectionHeader
            title="Upcoming Commitments"
            actionLabel="Schedule"
            onAction={() => router.push('/recurring')}
          />
          <View style={{ gap: spacing.xs }}>
            {upcomingReminders.map(({ rule }) => (
              <Card
                key={rule.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  backgroundColor: colors.surface,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Text style={{ fontSize: 18 }}>📅</Text>
                  <View style={{ gap: 2 }}>
                    <Text style={[typography.captionMedium, { color: colors.textPrimary }]}>
                      {rule.name}
                    </Text>
                    <Text style={[typography.micro, { color: colors.textTertiary }]}>
                      Due {rule.nextOccurrence} · {rule.frequency}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[typography.numericMedium, { color: colors.textPrimary, fontSize: 14 }]}
                >
                  {formatMoneyDisplay(rule.amount, rule.currency)}
                </Text>
              </Card>
            ))}
          </View>
        </View>
      )}

      {/* 8. GOALS (JOURNEY CARDS) */}
      {primaryGoal && (
        <View style={{ gap: spacing.xs }}>
          <SectionHeader
            title="Savings Journey"
            actionLabel="Goals"
            onAction={() => router.push('/(tabs)/goals')}
          />
          <Card
            style={{ backgroundColor: colors.surface, borderColor: colors.border, gap: spacing.sm }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={{ gap: 2 }}>
                <Text
                  style={[typography.sectionTitle, { color: colors.textPrimary, fontSize: 15 }]}
                >
                  {primaryGoal.goal.name}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {formatMoneyDisplay(primaryGoal.savedAmount, primaryGoal.goal.currency)} of{' '}
                  {formatMoneyDisplay(primaryGoal.goal.targetAmount, primaryGoal.goal.currency)} (
                  {primaryGoal.progressPercent}%)
                </Text>
              </View>
              <Badge
                label={primaryGoal.isCompleted ? 'COMPLETED' : `${primaryGoal.progressPercent}%`}
                variant={primaryGoal.isCompleted ? 'success' : 'primary'}
              />
            </View>

            <ProgressBar
              progressPercent={primaryGoal.progressPercent}
              color={primaryGoal.isCompleted ? colors.income : colors.primary}
              height={7}
            />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={[typography.micro, { color: colors.textTertiary }]}>
                Target: {primaryGoal.goal.targetDate || 'Flexible'}
              </Text>
              <Text style={[typography.micro, { color: colors.income, fontWeight: '600' }]}>
                {primaryGoal.monthsRemaining
                  ? `~${primaryGoal.monthsRemaining} mo remaining`
                  : 'On Track'}
              </Text>
            </View>
          </Card>
        </View>
      )}

      {/* 9. 3 THINGS WORTH KNOWING (ACTIONABLE INSIGHTS PER SECTION 12) */}
      <View style={{ gap: spacing.xs }}>
        <SectionHeader
          title="3 Things Worth Knowing"
          actionLabel="AI Hub"
          onAction={() => router.push('/intelligence')}
        />

        <View style={{ gap: spacing.xs }}>
          {topInsights.map((insight) => (
            <Card
              key={insight.id}
              style={{
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                gap: spacing.xs,
                borderLeftWidth: 3,
                borderLeftColor:
                  insight.type === 'TIP'
                    ? colors.income
                    : insight.type === 'WARNING' || insight.type === 'ANOMALY'
                      ? colors.danger
                      : colors.primary,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={[
                    typography.captionMedium,
                    { color: colors.textPrimary, fontWeight: '700' },
                  ]}
                >
                  {insight.title}
                </Text>
                <Text style={{ fontSize: 13 }}>
                  {insight.type === 'TIP'
                    ? '💡'
                    : insight.type === 'WARNING' || insight.type === 'ANOMALY'
                      ? '⚠️'
                      : '📊'}
                </Text>
              </View>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
                ]}
              >
                {insight.description}
              </Text>
              {insight.actionLabel && insight.actionRoute && (
                <Pressable
                  onPress={() => router.push(insight.actionRoute as never)}
                  style={{ alignSelf: 'flex-start', marginTop: 2 }}
                >
                  <Text style={[typography.captionMedium, { color: colors.primary, fontSize: 12 }]}>
                    {insight.actionLabel} →
                  </Text>
                </Pressable>
              )}
            </Card>
          ))}
        </View>
      </View>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  healthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
});
