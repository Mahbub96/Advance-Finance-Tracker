import { Text, View } from 'react-native';
import { Card } from '../../src/components/Card';
import { ScrollScreen } from '../../src/components/Screen';
import { TransactionRow } from '../../src/features/transactions/components/TransactionRow';
import { useTransactions } from '../../src/hooks/use-transactions';
import { useTokens } from '../../src/theme/tokens';

export default function TransactionsScreen() {
  const { colors, typography, spacing } = useTokens();
  const { transactions } = useTransactions();
  const visible = transactions.filter((tx) => tx.transferLeg !== 'IN');

  return (
    <ScrollScreen>
      <Text style={[typography.title, { color: colors.textPrimary }]}>Transactions</Text>
      <View style={{ gap: spacing.md }}>
        {visible.length === 0 ? (
          <Card>
            <Text style={{ color: colors.textSecondary }}>Nothing recorded yet.</Text>
          </Card>
        ) : (
          visible.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
        )}
      </View>
    </ScrollScreen>
  );
}
