import { formatMoneyDisplay } from '@personal-finance/types';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { Card } from '../../src/components/Card';
import { ScrollScreen } from '../../src/components/Screen';
import { TransactionRow } from '../../src/features/transactions/components/TransactionRow';
import { useAccounts } from '../../src/hooks/use-accounts';
import { useSettings } from '../../src/hooks/use-settings';
import { useTransactions } from '../../src/hooks/use-transactions';
import { useTokens } from '../../src/theme/tokens';

export default function HomeScreen() {
  const { colors, typography, spacing } = useTokens();
  const { settings } = useSettings();
  const { totalBalance } = useAccounts();
  const { transactions } = useTransactions();
  const currency = settings?.baseCurrency ?? 'BDT';
  const recent = transactions.filter((tx) => tx.transferLeg !== 'IN').slice(0, 8);

  return (
    <ScrollScreen>
      <Text style={[typography.caption, { color: colors.textSecondary }]}>Total balance</Text>
      <Text style={[typography.numericLarge, { color: colors.textPrimary }]}>
        {formatMoneyDisplay(totalBalance, currency)}
      </Text>
      <Link href="/(tabs)/add" style={{ color: colors.primary, fontWeight: '600' }}>
        Add transaction
      </Link>
      <View style={{ gap: spacing.md }}>
        <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Recent</Text>
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
