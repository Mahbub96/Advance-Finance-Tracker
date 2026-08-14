import { formatMoneyDisplay } from '@personal-finance/types';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Card } from '../../src/components/Card';
import { ScrollScreen } from '../../src/components/Screen';
import { TransactionRow } from '../../src/features/transactions/components/TransactionRow';
import { useAccounts } from '../../src/hooks/use-accounts';
import { useIntelligence } from '../../src/hooks/use-intelligence';
import { useSettings } from '../../src/hooks/use-settings';
import { useTransactions } from '../../src/hooks/use-transactions';
import { useTokens } from '../../src/theme/tokens';

export default function HomeScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { settings } = useSettings();
  const { totalBalance } = useAccounts();
  const { transactions } = useTransactions();
  const { healthScore, insights } = useIntelligence();
  const currency = settings?.baseCurrency ?? 'BDT';
  const recent = transactions.filter((tx) => tx.transferLeg !== 'IN').slice(0, 8);
  const topInsight = insights[0];

  return (
    <ScrollScreen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Total balance</Text>
          <Text style={[typography.numericLarge, { color: colors.textPrimary, fontSize: 32 }]}>
            {formatMoneyDisplay(totalBalance, currency)}
          </Text>
        </View>
        
        {/* Health Score Pill */}
        {healthScore && (
          <Link href="/intelligence" asChild>
            <Pressable
              style={{
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.sm,
                borderRadius: radius.pill,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Health</Text>
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>
                {healthScore.score}/100
              </Text>
            </Pressable>
          </Link>
        )}
      </View>

      <Link href="/(tabs)/add" style={{ color: colors.primary, fontWeight: '600' }}>
        + Add transaction
      </Link>

      {/* Top AI Insight Banner */}
      {topInsight && (
        <Link href="/intelligence" asChild>
          <Pressable>
            <Card style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: spacing.xs }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <Text style={{ fontSize: 14 }}>
                  {topInsight.type === 'WARNING' ? '⚠️' : topInsight.type === 'ACHIEVEMENT' ? '🎉' : '💡'}
                </Text>
                <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '700', flex: 1 }]}>
                  {topInsight.title}
                </Text>
                <Text style={{ color: colors.primary, fontSize: 12 }}>View Hub →</Text>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }} numberOfLines={2}>
                {topInsight.description}
              </Text>
            </Card>
          </Pressable>
        </Link>
      )}

      <View style={{ gap: spacing.md }}>
        <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Recent Activity</Text>
        {recent.length === 0 ? (
          <Card>
            <Text style={{ color: colors.textSecondary }}>No transactions yet.</Text>
          </Card>
        ) : (
          recent.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
        )}
      </View>
    </ScrollScreen>
  );
}

