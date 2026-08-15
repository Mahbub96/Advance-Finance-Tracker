import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { DeleteConfirmModal } from '../../src/components/DeleteConfirmModal';
import { EmptyState } from '../../src/components/EmptyState';
import { Input } from '../../src/components/Input';
import { ScrollScreen } from '../../src/components/Screen';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { TransactionsSkeleton } from '../../src/components/skeletons/TransactionsSkeleton';
import { TransactionRow } from '../../src/features/transactions/components/TransactionRow';
import { useAccounts } from '../../src/hooks/use-accounts';
import { useTransactions } from '../../src/hooks/use-transactions';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';
import type { TransactionRecord } from '../../src/database/records';

type FilterType = 'ALL' | 'EXPENSE' | 'INCOME' | 'TRANSFER';

function getRelativeDateLabel(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return dateStr;
}

function buildTransactionSummary(tx: TransactionRecord): string {
  return [
    `Type: ${tx.type}`,
    `Amount: ${tx.amount} ${tx.currency}`,
    `Date: ${tx.transactionDate}`,
    tx.merchantName ? `Merchant: ${tx.merchantName}` : null,
    tx.note ? `Note: ${tx.note}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

export default function TransactionsScreen() {
  const { colors, typography, spacing } = useTokens();
  const { transactions, loading: loadingTransactions } = useTransactions();
  const { accounts } = useAccounts();
  const finance = useFinance();
  const router = useRouter();

  const [filter, setFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete confirm state
  const [pendingDeleteTx, setPendingDeleteTx] = useState<TransactionRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const visible = useMemo(() => {
    let list = transactions.filter((tx) => tx.transferLeg !== 'IN');
    if (filter !== 'ALL') {
      list = list.filter((tx) => tx.type === filter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (tx) =>
          (tx.merchantName && tx.merchantName.toLowerCase().includes(q)) ||
          (tx.note && tx.note.toLowerCase().includes(q)) ||
          tx.type.toLowerCase().includes(q),
      );
    }
    return list;
  }, [transactions, filter, searchQuery]);

  // Group transactions by transactionDate
  const grouped = useMemo(() => {
    const map = new Map<string, TransactionRecord[]>();
    for (const tx of visible) {
      const date = tx.transactionDate;
      const arr = map.get(date) || [];
      arr.push(tx);
      map.set(date, arr);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [visible]);

  const counts = useMemo(() => {
    const base = transactions.filter((tx) => tx.transferLeg !== 'IN');
    return {
      ALL: base.length,
      EXPENSE: base.filter((tx) => tx.type === 'EXPENSE').length,
      INCOME: base.filter((tx) => tx.type === 'INCOME' || tx.type === 'REFUND').length,
      TRANSFER: base.filter((tx) => tx.type === 'TRANSFER').length,
    };
  }, [transactions]);

  if (loadingTransactions) {
    return <TransactionsSkeleton />;
  }

  const filterOptions = [
    { id: 'ALL' as const, label: 'All', count: counts.ALL },
    { id: 'EXPENSE' as const, label: 'Expenses', count: counts.EXPENSE },
    { id: 'INCOME' as const, label: 'Income', count: counts.INCOME },
    { id: 'TRANSFER' as const, label: 'Transfer', count: counts.TRANSFER },
  ];

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteTx) return;
    setDeleteLoading(true);
    try {
      await finance.transactions.softDelete(pendingDeleteTx.id);
      finance.refresh();
    } finally {
      setDeleteLoading(false);
      setPendingDeleteTx(null);
    }
  };

  return (
    <ScrollScreen>
      {/* Header */}
      <View style={{ gap: 2 }}>
        <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>ACTIVITY LOG</Text>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Transactions</Text>
      </View>

      {/* Search Input */}
      <Input
        label=""
        placeholder="🔍 Search merchant, note or tag..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Filter Segmented Control */}
      <SegmentedControl options={filterOptions} value={filter} onChange={setFilter} />

      {/* Grouped Transaction List */}
      <View style={{ gap: spacing.md }}>
        {grouped.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No records found"
            description={
              searchQuery
                ? `No transactions match "${searchQuery}".`
                : filter === 'ALL'
                  ? 'No transactions logged yet. Start by recording your income or spending.'
                  : `No ${filter.toLowerCase()} transactions recorded.`
            }
            actionLabel="Add Transaction"
            onAction={() => router.push('/(tabs)/add')}
          />
        ) : (
          grouped.map(([date, txs]) => (
            <View key={date} style={{ gap: spacing.xs }}>
              {/* Date Group Header */}
              <View style={styles.dateHeader}>
                <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                  {getRelativeDateLabel(date)}
                </Text>
                <Text style={[typography.micro, { color: colors.textTertiary }]}>
                  {txs.length} {txs.length === 1 ? 'record' : 'records'}
                </Text>
              </View>

              {/* Transactions in this date */}
              {txs.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  accountName={accounts.find((a) => a.id === tx.accountId)?.name}
                  onPress={() => setPendingDeleteTx(tx)}
                />
              ))}
            </View>
          ))
        )}
      </View>

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        visible={!!pendingDeleteTx}
        title="Delete Transaction?"
        message={
          pendingDeleteTx
            ? `${buildTransactionSummary(pendingDeleteTx)}\n\nThis entry will be soft-deleted and removed from your activity log.`
            : ''
        }
        deleteLabel="Delete Transaction"
        loading={deleteLoading}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setPendingDeleteTx(null)}
      />
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 4,
  },
});
