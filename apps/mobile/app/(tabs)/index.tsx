import { formatMoneyDisplay } from '@personal-finance/types';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Badge } from '../../src/components/Badge';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { ScrollScreen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { TransactionRow } from '../../src/features/transactions/components/TransactionRow';
import { useAccounts } from '../../src/hooks/use-accounts';
import { useIntelligence } from '../../src/hooks/use-intelligence';
import { useSettings } from '../../src/hooks/use-settings';
import { useTransactions } from '../../src/hooks/use-transactions';
import { monthRange } from '../../src/lib/clock';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

export default function HomeScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { settings } = useSettings();
  const { totalBalance } = useAccounts();
  const { transactions } = useTransactions();
  const { healthScore, insights } = useIntelligence();
  const { analytics, nonce } = useFinance();
  const router = useRouter();

  const [cashFlow, setCashFlow] = useState({
    totalIncome: '0.00',
    totalExpenses: '0.00',
  });

  useEffect(() => {
    const { from, to } = monthRange();
    void analytics.getCashFlow(from, to).then((res) => {
      setCashFlow({ totalIncome: res.totalIncome, totalExpenses: res.totalExpenses });
    });
  }, [analytics, nonce]);

  const currency = settings?.baseCurrency ?? 'BDT';
  const recent = transactions.filter((tx) => tx.transferLeg !== 'IN').slice(0, 6);
  const topInsight = insights[0];

  const healthRatingVariant =
    healthScore?.rating === 'EXCELLENT'
      ? 'success'
      : healthScore?.rating === 'GOOD'
        ? 'info'
        : healthScore?.rating === 'FAIR'
          ? 'warning'
          : 'danger';

  return (
    <ScrollScreen>
      {/* 1. Top Header Greeting */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 2 }}>
          <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
            FINANCIAL OVERVIEW
          </Text>
          <Text style={[typography.title, { color: colors.textPrimary, fontSize: 22 }]}>
            {settings?.displayName ? `Hello, ${settings.displayName}` : 'My Finances'}
          </Text>
        </View>
        <Badge label="Offline First" variant="neutral" dot />
      </View>

      {/* 2. Hero Net Worth & Cash Flow Card */}
      <Card
        style={[
          styles.heroCard,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
            gap: spacing.lg,
          },
        ]}
      >
        <View style={{ gap: spacing.xs }}>
          <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
            Total Net Balance
          </Text>
          <Text
            style={[
              typography.numericLarge,
              {
                color: colors.textPrimary,
                fontSize: 34,
              },
            ]}
          >
            {formatMoneyDisplay(totalBalance, currency)}
          </Text>
        </View>

        {/* Quick Cash Flow In / Out */}
        <View
          style={[
            styles.cashFlowBar,
            {
              backgroundColor: colors.surfaceMuted,
              borderRadius: radius.md,
              padding: spacing.md,
            },
          ]}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[typography.micro, { color: colors.textTertiary }]}>THIS MONTH IN</Text>
            <Text style={[typography.numericMedium, { color: colors.income, fontSize: 16 }]}>
              +{formatMoneyDisplay(cashFlow.totalIncome, currency)}
            </Text>
          </View>

          <View style={{ width: 1, height: '80%', backgroundColor: colors.border }} />

          <View style={{ flex: 1, gap: 2, paddingLeft: spacing.md }}>
            <Text style={[typography.micro, { color: colors.textTertiary }]}>THIS MONTH OUT</Text>
            <Text style={[typography.numericMedium, { color: colors.expense, fontSize: 16 }]}>
              −{formatMoneyDisplay(cashFlow.totalExpenses, currency)}
            </Text>
          </View>
        </View>

        {/* Quick Action Shortcuts */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Pressable
            onPress={() => router.push('/(tabs)/add')}
            style={[
              styles.quickAction,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.md,
              },
            ]}
          >
            <Text style={{ color: colors.primaryForeground, fontWeight: '600', fontSize: 13 }}>
              + Add Record
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/intelligence')}
            style={[
              styles.quickAction,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: radius.md,
              },
            ]}
          >
            <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 13 }}>
              ⚡ Hub {healthScore ? `(${healthScore.score}/100)` : ''}
            </Text>
          </Pressable>
        </View>
      </Card>

      {/* 3. AI Intelligence Insight / Health Score */}
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Text style={{ fontSize: 16 }}>
                    {topInsight.type === 'WARNING'
                      ? '⚠️'
                      : topInsight.type === 'ACHIEVEMENT'
                        ? '🎉'
                        : '💡'}
                  </Text>
                  <Text style={[typography.captionMedium, { color: colors.textPrimary }]}>
                    {topInsight.title}
                  </Text>
                </View>
                {healthScore && (
                  <Badge
                    label={`${healthScore.score} PTS`}
                    variant={healthRatingVariant}
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

      {/* 4. Recent Activity Section */}
      <View style={{ gap: spacing.md }}>
        <SectionHeader
          title="Recent Activity"
          actionLabel="View All →"
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
          <View style={{ gap: spacing.sm }}>
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
  heroCard: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cashFlowBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickAction: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
