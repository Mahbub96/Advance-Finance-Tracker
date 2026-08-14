import { formatMoneyDisplay } from '@personal-finance/types';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState, useMemo } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Badge } from '../../src/components/Badge';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { GradientCard } from '../../src/components/GradientCard';
import { QuickActionGrid } from '../../src/components/QuickActionGrid';
import { ScrollScreen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { SparklineChart } from '../../src/components/charts/SparklineChart';
import { TransactionRow } from '../../src/features/transactions/components/TransactionRow';
import { useAccounts } from '../../src/hooks/use-accounts';
import { useIntelligence } from '../../src/hooks/use-intelligence';
import { useRecurringRules } from '../../src/hooks/use-recurring-rules';
import { useSettings } from '../../src/hooks/use-settings';
import { useTransactions } from '../../src/hooks/use-transactions';
import { monthRange } from '../../src/lib/clock';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';
import { useThemeContext } from '../../src/theme/theme-context';

function getGreeting(name?: string | null): { greeting: string; icon: string } {
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
  return {
    greeting: name ? `${text}, ${name}` : text,
    icon,
  };
}

function getAccountIcon(type: string): string {
  switch (type) {
    case 'CASH':
      return '💵';
    case 'BANK':
      return '🏦';
    case 'WALLET':
      return '📱';
    case 'SAVINGS':
      return '🐖';
    case 'CREDIT':
      return '💳';
    default:
      return '📂';
  }
}

export default function HomeScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { hideBalance, setHideBalance } = useThemeContext();
  const { settings } = useSettings();
  const { accounts, totalBalance } = useAccounts();
  const { transactions } = useTransactions();
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

  useEffect(() => {
    const { from, to } = monthRange();
    void analytics.getCashFlow(from, to).then(setCashFlow);
  }, [analytics, nonce]);

  const currency = settings?.baseCurrency ?? 'BDT';
  const recent = transactions.filter((tx) => tx.transferLeg !== 'IN').slice(0, 5);
  const topInsight = insights[0];
  const { greeting, icon: greetingIcon } = getGreeting(settings?.displayName);

  // Upcoming reminders (next 3 due rules)
  const upcomingReminders = useMemo(() => {
    return recurringRules.filter((r) => r.rule.status === 'ACTIVE').slice(0, 3);
  }, [recurringRules]);

  // Top accounts preview (first 3)
  const topAccounts = accounts.slice(0, 3);

  const maskedBalance = '••••••••';
  const displayedBalance = hideBalance ? maskedBalance : formatMoneyDisplay(totalBalance, currency);

  return (
    <ScrollScreen>
      {/* 1. Header Greeting & Status Bar */}
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View
            style={[
              styles.avatarCircle,
              {
                backgroundColor: colors.primaryMuted,
                borderColor: colors.border,
                borderRadius: radius.pill,
              },
            ]}
          >
            <Text style={{ fontSize: 18 }}>👤</Text>
          </View>
          <View style={{ gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Text style={[typography.title, { color: colors.textPrimary, fontSize: 18 }]}>
                {greeting}
              </Text>
              <Text style={{ fontSize: 16 }}>{greetingIcon}</Text>
            </View>
            <Text style={[typography.caption, { color: colors.textTertiary, fontSize: 12 }]}>
              Here's your financial overview
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Pressable
            onPress={() => setHideBalance((prev) => !prev)}
            style={[
              styles.eyeButton,
              {
                backgroundColor: colors.surfaceMuted,
                borderRadius: radius.pill,
              },
            ]}
          >
            <Text style={{ fontSize: 14 }}>{hideBalance ? '👁️' : '🔒'}</Text>
          </Pressable>
          <Badge label="Offline" variant="neutral" dot />
        </View>
      </View>

      {/* 2. Hero Total Balance Card with Gradient and Sparkline */}
      <GradientCard>
        <View style={{ gap: spacing.sm }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <View style={{ gap: 4 }}>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 13, fontWeight: '500' }}>
                Total Balance
              </Text>
              <Text
                style={[
                  typography.numericLarge,
                  {
                    color: '#FFFFFF',
                    fontSize: 32,
                    letterSpacing: -0.5,
                  },
                ]}
              >
                {displayedBalance}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: radius.pill,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>↑ +12.4%</Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 10 }}>vs last mo</Text>
            </View>
          </View>

          {/* Sparkline wave visualization inside hero */}
          <View style={{ marginTop: spacing.xs, opacity: 0.9 }}>
            <SparklineChart
              data={[25, 32, 28, 45, 40, 58, 52, 65, 70, 68, 80, 92]}
              color="#FFFFFF"
              fillColor="rgba(255, 255, 255, 0.15)"
              height={36}
            />
          </View>
        </View>
      </GradientCard>

      {/* 3. 3-Stat Metric Grid: Income | Expense | Savings */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {/* Income */}
        <View
          style={[
            styles.statBox,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.md,
            },
          ]}
        >
          <Text style={[typography.micro, { color: colors.textTertiary }]}>INCOME</Text>
          <Text
            style={[typography.numericMedium, { color: colors.income, fontSize: 15, marginTop: 2 }]}
            numberOfLines={1}
          >
            {hideBalance ? '•••' : `+${formatMoneyDisplay(cashFlow.totalIncome, currency)}`}
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
              padding: spacing.md,
            },
          ]}
        >
          <Text style={[typography.micro, { color: colors.textTertiary }]}>EXPENSE</Text>
          <Text
            style={[
              typography.numericMedium,
              { color: colors.expense, fontSize: 15, marginTop: 2 },
            ]}
            numberOfLines={1}
          >
            {hideBalance ? '•••' : `−${formatMoneyDisplay(cashFlow.totalExpenses, currency)}`}
          </Text>
        </View>

        {/* Savings */}
        <View
          style={[
            styles.statBox,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.md,
            },
          ]}
        >
          <Text style={[typography.micro, { color: colors.textTertiary }]}>SAVINGS</Text>
          <Text
            style={[
              typography.numericMedium,
              {
                color: parseFloat(cashFlow.netSavings) >= 0 ? colors.income : colors.danger,
                fontSize: 15,
                marginTop: 2,
              },
            ]}
            numberOfLines={1}
          >
            {hideBalance ? '•••' : formatMoneyDisplay(cashFlow.netSavings, currency)}
          </Text>
        </View>
      </View>

      {/* 4. Quick Actions Grid */}
      <QuickActionGrid />

      {/* 5. Top AI Insight Highlight */}
      {topInsight && (
        <Link href="/intelligence" asChild>
          <Pressable>
            <Card
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                gap: spacing.xs,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 }}
                >
                  <Text style={{ fontSize: 16 }}>
                    {topInsight.type === 'WARNING'
                      ? '⚠️'
                      : topInsight.type === 'ACHIEVEMENT'
                        ? '🎉'
                        : '💡'}
                  </Text>
                  <Text
                    style={[typography.captionMedium, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {topInsight.title}
                  </Text>
                </View>
                {healthScore && (
                  <Badge
                    label={`${healthScore.score} PTS`}
                    variant={healthScore.score >= 80 ? 'success' : 'primary'}
                    size="sm"
                  />
                )}
              </View>
              <Text
                style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}
                numberOfLines={2}
              >
                {topInsight.description}
              </Text>
            </Card>
          </Pressable>
        </Link>
      )}

      {/* 6. Accounts Preview List */}
      <View style={{ gap: spacing.sm }}>
        <SectionHeader
          title="Accounts"
          actionLabel="See all →"
          onAction={() => router.push('/accounts')}
        />
        {topAccounts.length === 0 ? (
          <EmptyState
            icon="🏦"
            title="No accounts"
            description="Add your first cash wallet, bKash, or bank account."
            actionLabel="Add Account"
            onAction={() => router.push('/accounts/new')}
          />
        ) : (
          topAccounts.map((acc) => (
            <Pressable key={acc.id} onPress={() => router.push('/accounts')}>
              <Card
                style={[
                  styles.accountRow,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                  },
                ]}
              >
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}
                >
                  <View
                    style={[
                      styles.accountIcon,
                      {
                        backgroundColor: colors.surfaceMuted,
                        borderRadius: radius.md,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 18 }}>{getAccountIcon(acc.type)}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 1 }}>
                    <Text
                      style={[typography.sectionTitle, { color: colors.textPrimary, fontSize: 14 }]}
                    >
                      {acc.name}
                    </Text>
                    <Text
                      style={[typography.caption, { color: colors.textTertiary, fontSize: 11 }]}
                    >
                      {acc.type} {acc.institutionName ? `· ${acc.institutionName}` : ''}
                    </Text>
                  </View>
                  <Text
                    style={[typography.numericMedium, { color: colors.textPrimary, fontSize: 15 }]}
                  >
                    {hideBalance ? '••••' : formatMoneyDisplay(acc.balance, acc.currency)}
                  </Text>
                </View>
              </Card>
            </Pressable>
          ))
        )}
      </View>

      {/* 7. Upcoming Reminders Widget */}
      {upcomingReminders.length > 0 && (
        <View style={{ gap: spacing.sm }}>
          <SectionHeader
            title="Upcoming Reminders"
            actionLabel="View All →"
            onAction={() => router.push('/recurring')}
          />
          {upcomingReminders.map(({ rule, daysUntilDue, dueState }) => (
            <Card
              key={rule.id}
              style={[
                styles.reminderCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                },
              ]}
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}
              >
                <View
                  style={[
                    styles.accountIcon,
                    {
                      backgroundColor: colors.warningMuted,
                      borderRadius: radius.md,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 16 }}>⏰</Text>
                </View>
                <View style={{ flex: 1, gap: 1 }}>
                  <Text
                    style={[typography.sectionTitle, { color: colors.textPrimary, fontSize: 14 }]}
                  >
                    {rule.name}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textTertiary, fontSize: 11 }]}>
                    Due in {daysUntilDue} days · {rule.nextOccurrence}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 2 }}>
                  <Text
                    style={[typography.numericMedium, { color: colors.textPrimary, fontSize: 14 }]}
                  >
                    {formatMoneyDisplay(rule.amount, rule.currency)}
                  </Text>
                  <Badge
                    label={dueState === 'DUE' ? 'DUE TODAY' : `In ${daysUntilDue}d`}
                    variant={dueState === 'DUE' ? 'warning' : 'neutral'}
                    size="sm"
                  />
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* 8. Recent Activity Section */}
      <View style={{ gap: spacing.sm }}>
        <SectionHeader
          title="Recent Transactions"
          actionLabel="See all →"
          onAction={() => router.push('/(tabs)/transactions')}
        />

        {recent.length === 0 ? (
          <EmptyState
            icon="💳"
            title="No transactions yet"
            description="Log your daily expenses, salary income, or transfers to start tracking."
            actionLabel="Add Transaction"
            onAction={() => router.push('/(tabs)/add')}
          />
        ) : (
          <View style={{ gap: spacing.xs }}>
            {recent.map((tx) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                onPress={() => router.push('/(tabs)/transactions')}
              />
            ))}
          </View>
        )}
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
  avatarCircle: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  eyeButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
  },
  accountRow: {
    borderWidth: 1,
  },
  reminderCard: {
    borderWidth: 1,
  },
  accountIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
