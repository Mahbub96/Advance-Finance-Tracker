import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { EmptyState } from '../../src/components/EmptyState';
import { ScrollScreen } from '../../src/components/Screen';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { TransactionRow } from '../../src/features/transactions/components/TransactionRow';
import { useTransactions } from '../../src/hooks/use-transactions';
import { useTokens } from '../../src/theme/tokens';

type FilterType = 'ALL' | 'EXPENSE' | 'INCOME' | 'TRANSFER';

export default function TransactionsScreen() {
  const { colors, typography, spacing } = useTokens();
  const { transactions } = useTransactions();
  const router = useRouter();

  const [filter, setFilter] = useState<FilterType>('ALL');

  const visible = useMemo(() => {
    const base = transactions.filter((tx) => tx.transferLeg !== 'IN');
    if (filter === 'ALL') return base;
    return base.filter((tx) => tx.type === filter);
  }, [transactions, filter]);

  const counts = useMemo(() => {
    const base = transactions.filter((tx) => tx.transferLeg !== 'IN');
    return {
      ALL: base.length,
      EXPENSE: base.filter((tx) => tx.type === 'EXPENSE').length,
      INCOME: base.filter((tx) => tx.type === 'INCOME' || tx.type === 'REFUND').length,
      TRANSFER: base.filter((tx) => tx.type === 'TRANSFER').length,
    };
  }, [transactions]);

  const filterOptions = [
    { id: 'ALL' as const, label: 'All', count: counts.ALL },
    { id: 'EXPENSE' as const, label: 'Expenses', count: counts.EXPENSE },
    { id: 'INCOME' as const, label: 'Income', count: counts.INCOME },
    { id: 'TRANSFER' as const, label: 'Transfer', count: counts.TRANSFER },
  ];

  return (
    <ScrollScreen>
      {/* Header */}
      <View style={{ gap: 2 }}>
        <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>ACTIVITY LOG</Text>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Transactions</Text>
      </View>

      {/* Filter Segmented Control */}
      <SegmentedControl options={filterOptions} value={filter} onChange={setFilter} />

      {/* List */}
      <View style={{ gap: spacing.sm }}>
        {visible.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No records found"
            description={
              filter === 'ALL'
                ? 'No transactions logged yet. Start by recording your income or spending.'
                : `No ${filter.toLowerCase()} transactions recorded.`
            }
            actionLabel="Add Transaction"
            onAction={() => router.push('/(tabs)/add')}
          />
        ) : (
          visible.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
        )}
      </View>
    </ScrollScreen>
  );
}
