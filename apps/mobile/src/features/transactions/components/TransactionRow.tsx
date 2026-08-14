import { formatMoneyDisplay, TransactionType } from '@personal-finance/types';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { Card } from '../../../components/Card';
import { useTokens } from '../../../theme/tokens';
import type { TransactionRecord } from '../../../database/records';

function getTransactionIcon(type: string, note?: string | null, merchant?: string | null): string {
  const text = `${merchant ?? ''} ${note ?? ''}`.toLowerCase();
  if (
    text.includes('food') ||
    text.includes('dinner') ||
    text.includes('lunch') ||
    text.includes('restaurant') ||
    text.includes('coffee') ||
    text.includes('snack') ||
    text.includes('grocer') ||
    text.includes('bazar')
  )
    return '🍔';
  if (
    text.includes('uber') ||
    text.includes('ride') ||
    text.includes('fuel') ||
    text.includes('transport') ||
    text.includes('taxi')
  )
    return '🚗';
  if (
    text.includes('salary') ||
    text.includes('income') ||
    text.includes('bonus') ||
    text.includes('freelance') ||
    text.includes('consulting')
  )
    return '💰';
  if (
    text.includes('bill') ||
    text.includes('rent') ||
    text.includes('electric') ||
    text.includes('utility') ||
    text.includes('internet')
  )
    return '📄';
  if (
    text.includes('shop') ||
    text.includes('cloth') ||
    text.includes('amazon') ||
    text.includes('store') ||
    text.includes('market')
  )
    return '🛍️';
  if (
    text.includes('health') ||
    text.includes('doctor') ||
    text.includes('pharmacy') ||
    text.includes('medicine')
  )
    return '💊';
  if (
    text.includes('movie') ||
    text.includes('game') ||
    text.includes('netflix') ||
    text.includes('spotify')
  )
    return '🎬';
  if (type === TransactionType.TRANSFER) return '🔁';
  if (type === TransactionType.INCOME || type === TransactionType.REFUND) return '📈';
  return '💳';
}

export function TransactionRow({
  tx,
  accountName,
  locale = 'en-US',
  onPress,
}: {
  tx: TransactionRecord;
  accountName?: string;
  locale?: string;
  onPress?: () => void;
}) {
  const { colors, typography, spacing, radius } = useTokens();

  const isIncome = tx.type === TransactionType.INCOME || tx.type === TransactionType.REFUND;
  const isExpense = tx.type === TransactionType.EXPENSE;
  const isTransfer = tx.type === TransactionType.TRANSFER;

  const color = isIncome ? colors.income : isExpense ? colors.expense : colors.transfer;
  const bgColor = isIncome
    ? colors.incomeMuted
    : isExpense
      ? colors.expenseMuted
      : colors.transferMuted;

  const sign = isExpense || tx.transferLeg === 'OUT' ? '−' : '+';
  const icon = getTransactionIcon(tx.type, tx.note, tx.merchantName);
  const primaryTitle = tx.merchantName || tx.note || (isTransfer ? 'Account Transfer' : tx.type);
  const subtitle = [accountName, tx.merchantName && tx.note ? tx.note : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      {({ pressed }) => (
        <Card
          style={[
            styles.container,
            {
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.md,
              opacity: pressed ? 0.85 : 1,
              backgroundColor: colors.surface,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
            {/* Small category avatar icon */}
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: bgColor,
                  borderRadius: radius.md,
                },
              ]}
            >
              <Text style={{ fontSize: 17 }}>{icon}</Text>
            </View>

            {/* Title / Merchant & Account */}
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={[typography.sectionTitle, { color: colors.textPrimary, fontSize: 15 }]}
                numberOfLines={1}
              >
                {primaryTitle}
              </Text>
              <Text
                style={[typography.caption, { color: colors.textTertiary, fontSize: 12 }]}
                numberOfLines={1}
              >
                {subtitle || (isTransfer ? 'Transfer' : tx.type)}
              </Text>
            </View>

            {/* Amount with Income / Expense visual indication */}
            <View style={{ alignItems: 'flex-end', gap: 2 }}>
              <Text style={[typography.numericMedium, { color, fontSize: 16, fontWeight: '700' }]}>
                {sign}
                {formatMoneyDisplay(tx.amount, tx.currency, locale)}
              </Text>
              <Text
                style={[
                  typography.micro,
                  {
                    color: colors.textTertiary,
                    textTransform: 'uppercase',
                    fontSize: 10,
                  },
                ]}
              >
                {tx.type}
              </Text>
            </View>
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  iconContainer: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
