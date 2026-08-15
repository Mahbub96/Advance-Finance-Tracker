import {
  formatMoneyDisplay,
  moneyString,
  parseMoney,
  TransactionType,
} from '@personal-finance/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { DeleteConfirmModal } from '../../src/components/DeleteConfirmModal';
import { EmptyState } from '../../src/components/EmptyState';
import { ScrollScreen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { SkeletonBox, SkeletonText } from '../../src/components/Skeleton';
import { StatCard } from '../../src/components/StatCard';
import { TransactionRow } from '../../src/features/transactions/components/TransactionRow';
import type { AccountRecord, TransactionRecord } from '../../src/database/records';
import { monthRange } from '../../src/lib/clock';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

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

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accounts, transactions: txService, refresh } = useFinance();
  const { colors, typography, spacing, radius } = useTokens();
  const router = useRouter();

  const [account, setAccount] = useState<AccountRecord | null>(null);
  const [txs, setTxs] = useState<TransactionRecord[]>([]);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [archiveBusy, setArchiveBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    void accounts.get(id).then(setAccount);
    void txService.listByAccount(id).then(setTxs);
  }, [accounts, txService, id]);

  const { from, to } = monthRange();

  // Compute live current balance
  const currentBalance = useMemo(() => {
    if (!account) return '0.00';
    let bal = parseMoney(account.openingBalance);
    for (const t of txs) {
      if (t.deletedAt) continue;
      if (
        t.type === TransactionType.INCOME ||
        t.type === TransactionType.REFUND ||
        t.transferLeg === 'IN'
      ) {
        bal = bal.plus(parseMoney(t.amount));
      } else if (t.type === TransactionType.EXPENSE || t.transferLeg === 'OUT') {
        bal = bal.minus(parseMoney(t.amount));
      }
    }
    return moneyString(bal);
  }, [account, txs]);

  // Compute this month's inflow, outflow, and net for this specific account
  const monthStats = useMemo(() => {
    const monthTxs = txs.filter(
      (t) => !t.deletedAt && t.transactionDate >= from && t.transactionDate <= to,
    );

    let inflow = parseMoney('0');
    let outflow = parseMoney('0');

    for (const t of monthTxs) {
      if (
        t.type === TransactionType.INCOME ||
        t.type === TransactionType.REFUND ||
        t.transferLeg === 'IN'
      ) {
        inflow = inflow.plus(parseMoney(t.amount));
      } else if (t.type === TransactionType.EXPENSE || t.transferLeg === 'OUT') {
        outflow = outflow.plus(parseMoney(t.amount));
      }
    }

    const net = inflow.minus(outflow);

    return {
      inflow: moneyString(inflow),
      outflow: moneyString(outflow),
      net: moneyString(net),
      isNetPositive: net.gte(0),
    };
  }, [txs, from, to]);

  if (!account) {
    return (
      <ScrollScreen>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <SkeletonText width={60} height={20} />
          <SkeletonBox width={70} height={22} borderRadius={radius.pill} />
        </View>

        {/* Hero Card Skeleton */}
        <Card style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, gap: spacing.md, padding: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <SkeletonBox width={48} height={48} borderRadius={radius.md} />
            <View style={{ flex: 1, gap: 6 }}>
              <SkeletonText width="55%" height={20} />
              <SkeletonText width="35%" height={13} />
            </View>
          </View>
          <View style={{ gap: 4, marginTop: spacing.xs }}>
            <SkeletonText width={90} height={12} />
            <SkeletonText width={180} height={32} />
          </View>
        </Card>

        {/* Performance Metric StatCards Skeleton */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {[1, 2, 3].map((i) => (
            <Card key={i} style={{ flex: 1, backgroundColor: colors.surface, padding: spacing.md, gap: 4 }}>
              <SkeletonText width={44} height={11} />
              <SkeletonText width={70} height={15} />
            </Card>
          ))}
        </View>

        {/* Action button skeleton */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <SkeletonBox width="60%" height={44} borderRadius={radius.md} />
          <SkeletonBox width="35%" height={44} borderRadius={radius.md} />
        </View>
      </ScrollScreen>
    );
  }

  const icon = getAccountIcon(account.type);

  const handleArchiveToggle = async () => {
    setArchiveBusy(true);
    try {
      if (account.isArchived) {
        await accounts.restore(account.id);
      } else {
        await accounts.archive(account.id);
      }
      refresh();
      setShowArchiveConfirm(false);
      router.back();
    } finally {
      setArchiveBusy(false);
    }
  };

  return (
    <ScrollScreen>
      {/* 1. Header & Navigation */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
            <Text style={{ fontSize: 18, color: colors.primary }}>‹ Back</Text>
          </Pressable>
        </View>
        <Badge
          label={account.isArchived ? 'ARCHIVED' : account.type}
          variant={account.isArchived ? 'neutral' : 'primary'}
        />
      </View>

      {/* 2. Dominant Account Position Card */}
      <Card
        style={{
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          gap: spacing.sm,
          padding: spacing.lg,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.surfaceMuted, borderRadius: radius.md },
            ]}
          >
            <Text style={{ fontSize: 24 }}>{icon}</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[typography.title, { color: colors.textPrimary, fontSize: 20 }]}>
              {account.name}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {account.institutionName || account.type} · Active Account
            </Text>
          </View>
        </View>

        <View style={{ marginTop: spacing.xs, gap: 2 }}>
          <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
            Current Balance
          </Text>
          <Text style={[typography.display, { color: colors.textPrimary, fontSize: 32 }]}>
            {formatMoneyDisplay(currentBalance, account.currency)}
          </Text>
        </View>
      </Card>

      {/* 3. This Month Performance Card (In | Out | Net) per Section 5 */}
      <View style={{ gap: spacing.xs }}>
        <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
          This Month Performance
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <StatCard
            label="Inflow"
            value={`+${formatMoneyDisplay(monthStats.inflow, account.currency)}`}
            indicatorColor={colors.income}
          />
          <StatCard
            label="Outflow"
            value={`-${formatMoneyDisplay(monthStats.outflow, account.currency)}`}
            indicatorColor={colors.expense}
          />
          <StatCard
            label="Net Change"
            value={`${monthStats.isNetPositive ? '+' : ''}${formatMoneyDisplay(monthStats.net, account.currency)}`}
            indicatorColor={monthStats.isNetPositive ? colors.income : colors.danger}
          />
        </View>
      </View>

      {/* 4. Action Bar */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Button
            label="+ Transaction"
            onPress={() => router.push(`/(tabs)/add?accountId=${account.id}` as never)}
            size="md"
          />
        </View>
        <Button
          label={account.isArchived ? 'Restore' : 'Archive'}
          variant="outline"
          size="md"
          onPress={() => {
            if (account.isArchived) {
              // Restore is safe — no warning needed
              void handleArchiveToggle();
            } else {
              setShowArchiveConfirm(true);
            }
          }}
        />
      </View>

      {/* 5. Account Transactions Ledger */}
      <View style={{ gap: spacing.xs }}>
        <SectionHeader title="Account Activity" />

        {txs.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No activity yet"
            description="No transactions recorded for this account."
            actionLabel="Add Transaction"
            onAction={() => router.push(`/(tabs)/add?accountId=${account.id}` as never)}
          />
        ) : (
          <View style={{ gap: spacing.xs }}>
            {txs.slice(0, 15).map((tx) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                accountName={account.name}
                onPress={() => router.push('/(tabs)/transactions')}
              />
            ))}
          </View>
        )}
      </View>

      {/* Archive confirmation modal */}
      <DeleteConfirmModal
        visible={showArchiveConfirm}
        title="Archive Account?"
        message={`"${account.name}" will be archived and hidden from the accounts list. Your transaction history is preserved.`}
        deleteLabel="Archive Account"
        loading={archiveBusy}
        onConfirm={() => void handleArchiveToggle()}
        onCancel={() => setShowArchiveConfirm(false)}
      />
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
