import { formatMoneyDisplay } from '@personal-finance/types';
import { useEffect, useState } from 'react';
import { Alert, Share, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ScrollScreen } from '../../src/components/Screen';
import type { CategoryBreakdownItem } from '../../src/features/analytics/services/analytics-service';
import { useSettings } from '../../src/hooks/use-settings';
import { monthRange } from '../../src/lib/clock';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

export default function AnalyticsScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { analytics, nonce } = useFinance();
  const { settings } = useSettings();
  const currency = settings?.baseCurrency ?? 'BDT';

  const [cashFlow, setCashFlow] = useState({
    totalIncome: '0.00',
    totalExpenses: '0.00',
    netSavings: '0.00',
    savingsRatePercent: 0,
  });
  const [categories, setCategories] = useState<CategoryBreakdownItem[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const { from, to } = monthRange();
    void analytics.getCashFlow(from, to).then(setCashFlow);
    void analytics.getCategoryBreakdown(from, to).then(setCategories);
  }, [analytics, nonce]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await analytics.exportAllData();
      const jsonStr = JSON.stringify(data, null, 2);
      await Share.share({
        title: 'Advance-Finance-Backup.json',
        message: jsonStr,
      });
    } catch {
      Alert.alert('Export Notice', 'Data formatted for export.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScrollScreen>
      <Text style={[typography.title, { color: colors.textPrimary }]}>Financial Reports</Text>
      
      {/* Cash Flow Summary */}
      <Card style={{ gap: spacing.md }}>
        <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>This Month Cash Flow</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Income</Text>
            <Text style={[typography.title, { color: colors.income, fontSize: 20 }]}>
              {formatMoneyDisplay(cashFlow.totalIncome, currency)}
            </Text>
          </View>
          <View>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Expenses</Text>
            <Text style={[typography.title, { color: colors.expense, fontSize: 20 }]}>
              {formatMoneyDisplay(cashFlow.totalExpenses, currency)}
            </Text>
          </View>
          <View>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Net Saved</Text>
            <Text style={[typography.title, { color: colors.textPrimary, fontSize: 20 }]}>
              {formatMoneyDisplay(cashFlow.netSavings, currency)}
            </Text>
          </View>
        </View>

        {/* Savings Rate Meter */}
        <View style={{ gap: spacing.xs, marginTop: spacing.xs }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Savings Rate</Text>
            <Text style={{ color: colors.income, fontWeight: '700', fontSize: 13 }}>
              {cashFlow.savingsRatePercent}%
            </Text>
          </View>
          <View style={{ height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted }}>
            <View
              style={{
                width: `${Math.min(100, cashFlow.savingsRatePercent)}%`,
                height: 8,
                borderRadius: radius.pill,
                backgroundColor: colors.income,
              }}
            />
          </View>
        </View>
      </Card>

      {/* Category Breakdown */}
      <Card style={{ gap: spacing.sm }}>
        <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Spending by Category</Text>
        {categories.length === 0 ? (
          <Text style={{ color: colors.textSecondary }}>No recorded expenses for this period.</Text>
        ) : null}
        {categories.map((cat) => (
          <View key={cat.categoryId ?? 'uncategorized'} style={{ gap: spacing.xs, marginVertical: spacing.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{cat.categoryName}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                {formatMoneyDisplay(cat.totalSpent, currency)} ({cat.percentageOfExpenses}%)
              </Text>
            </View>
            <View style={{ height: 6, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted }}>
              <View
                style={{
                  width: `${Math.min(100, cat.percentageOfExpenses)}%`,
                  height: 6,
                  borderRadius: radius.pill,
                  backgroundColor: colors.primary,
                }}
              />
            </View>
          </View>
        ))}
      </Card>

      {/* Data Export & Backup */}
      <Card style={{ gap: spacing.sm }}>
        <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Backup & Data Export</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
          Export your complete financial records (accounts, transactions, debts, goals, and budgets) as JSON.
        </Text>
        <Button
          label={exporting ? 'Exporting...' : 'Export Local Backup (JSON)'}
          variant="secondary"
          onPress={() => void handleExport()}
        />
      </Card>
    </ScrollScreen>
  );
}

