import { formatMoneyDisplay, TransactionType } from '@personal-finance/types';
import { Text } from 'react-native';
import { Card } from '../../../components/Card';
import { useTokens } from '../../../theme/tokens';
import type { TransactionRecord } from '../../../database/records';

export function TransactionRow({
  tx,
  locale = 'en-US',
}: {
  tx: TransactionRecord;
  locale?: string;
}) {
  const { colors, typography, spacing } = useTokens();
  const color =
    tx.type === TransactionType.INCOME || tx.type === TransactionType.REFUND
      ? colors.income
      : tx.type === TransactionType.EXPENSE
        ? colors.expense
        : colors.transfer;
  const sign =
    tx.type === TransactionType.EXPENSE || tx.transferLeg === 'OUT' ? '−' : '+';

  return (
    <Card style={{ gap: spacing.xs }}>
      <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
        {tx.merchantName || tx.note || tx.type}
      </Text>
      <Text style={[typography.caption, { color: colors.textSecondary }]}>
        {tx.transactionDate} · {tx.type}
      </Text>
      <Text style={[typography.numericLarge, { color, fontSize: 20 }]}>
        {sign}
        {formatMoneyDisplay(tx.amount, tx.currency, locale)}
      </Text>
    </Card>
  );
}
