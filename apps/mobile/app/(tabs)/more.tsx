import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { Card } from '../../src/components/Card';
import { ScrollScreen } from '../../src/components/Screen';
import { useSettings } from '../../src/hooks/use-settings';
import { useTokens } from '../../src/theme/tokens';

export default function MoreScreen() {
  const { colors, typography, spacing } = useTokens();
  const { settings } = useSettings();

  return (
    <ScrollScreen>
      <Text style={[typography.title, { color: colors.textPrimary }]}>More</Text>
      <Text style={[typography.body, { color: colors.textSecondary }]}>
        Currency: {settings?.baseCurrency ?? '—'} · Offline-first
      </Text>
      <View style={{ gap: spacing.md }}>
        <Link href="/accounts" asChild>
          <Card>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Accounts</Text>
            <Text style={{ color: colors.textSecondary }}>Wallets and balances</Text>
          </Card>
        </Link>
        <Link href="/categories" asChild>
          <Card>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Categories</Text>
            <Text style={{ color: colors.textSecondary }}>Classify spending and income</Text>
          </Card>
        </Link>
        <Link href="/budgets" asChild>
          <Card>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Budgets</Text>
            <Text style={{ color: colors.textSecondary }}>Monthly spending limits</Text>
          </Card>
        </Link>
        <Link href="/recurring" asChild>
          <Card>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Recurring</Text>
            <Text style={{ color: colors.textSecondary }}>Expected bills and income</Text>
          </Card>
        </Link>
        <Link href="/debts" asChild>
          <Card>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Lending & Borrowing</Text>
            <Text style={{ color: colors.textSecondary }}>Track money lent and owed</Text>
          </Card>
        </Link>
        <Link href="/goals" asChild>
          <Card>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Financial Goals</Text>
            <Text style={{ color: colors.textSecondary }}>Savings targets and plans</Text>
          </Card>
        </Link>
        <Link href="/intelligence" asChild>
          <Card>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Intelligence Hub</Text>
            <Text style={{ color: colors.textSecondary }}>Financial health score, velocity & AI insights</Text>
          </Card>
        </Link>
      </View>
    </ScrollScreen>
  );
}



