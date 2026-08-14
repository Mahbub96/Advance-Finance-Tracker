import { derivePeriodTotals, formatMoneyDisplay, subtractMoney } from '@personal-finance/types';
import { Text } from 'react-native';
import { Card } from '../../src/components/Card';
import { Screen } from '../../src/components/Screen';
import { monthRange } from '../../src/lib/clock';
import { useFinance } from '../../src/providers/finance-provider';
import { useSettings } from '../../src/hooks/use-settings';
import { useTokens } from '../../src/theme/tokens';
import { useEffect, useState } from 'react';

export default function AnalyticsScreen() {
  const { colors, typography, spacing } = useTokens();
  const { transactions, nonce } = useFinance();
  const { settings } = useSettings();
  const currency = settings?.baseCurrency ?? 'BDT';
  const [totals, setTotals] = useState({ income: '0.00', expense: '0.00' });

  useEffect(() => {
    const { from, to } = monthRange();
    void transactions.listByDateRange(from, to).then((rows) => {
      setTotals(derivePeriodTotals(rows));
    });
  }, [transactions, nonce]);

  const net = subtractMoney(totals.income, totals.expense);

  return (
    <Screen>
      <Text style={[typography.title, { color: colors.textPrimary }]}>This month</Text>
      <Card style={{ gap: spacing.sm }}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>Income</Text>
        <Text style={[typography.numericLarge, { color: colors.income, fontSize: 24 }]}>
          {formatMoneyDisplay(totals.income, currency)}
        </Text>
      </Card>
      <Card style={{ gap: spacing.sm }}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>Expense</Text>
        <Text style={[typography.numericLarge, { color: colors.expense, fontSize: 24 }]}>
          {formatMoneyDisplay(totals.expense, currency)}
        </Text>
      </Card>
      <Card style={{ gap: spacing.sm }}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>Net</Text>
        <Text style={[typography.numericLarge, { color: colors.textPrimary, fontSize: 24 }]}>
          {formatMoneyDisplay(net, currency)}
        </Text>
      </Card>
    </Screen>
  );
}
