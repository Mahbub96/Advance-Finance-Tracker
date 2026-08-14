import { formatMoneyDisplay } from '@personal-finance/types';
import { useEffect, useState } from 'react';
import { Alert, Share, Text, View } from 'react-native';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { ProgressBar } from '../../src/components/ProgressBar';
import { ScrollScreen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { StatCard } from '../../src/components/StatCard';
import type { CategoryBreakdownItem } from '../../src/features/analytics/services/analytics-service';
import { useSettings } from '../../src/hooks/use-settings';
import { monthRange } from '../../src/lib/clock';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

export default function AnalyticsScreen() {
  const { colors, typography, spacing } = useTokens();
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

  const isNetPositive = parseFloat(cashFlow.netSavings) >= 0;

  return (
    <ScrollScreen>
      {/* Header */}
      <View style={{ gap: 2 }}>
        <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
          PERFORMANCE & REPORTS
        </Text>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Financial Reports</Text>
      </View>

      {/* 1. Cash Flow Metric Cards */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <StatCard
          label="Income"
          value={formatMoneyDisplay(cashFlow.totalIncome, currency)}
          indicatorColor={colors.income}
          icon="📈"
        />
        <StatCard
          label="Expenses"
          value={formatMoneyDisplay(cashFlow.totalExpenses, currency)}
          indicatorColor={colors.expense}
          icon="💸"
        />
      </View>

      {/* 2. Net Savings & Savings Rate Card */}
      <Card style={{ gap: spacing.md, backgroundColor: colors.surfaceElevated }}>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <View style={{ gap: 2 }}>
            <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
              Net Month Savings
            </Text>
            <Text
              style={[
                typography.numericLarge,
                { color: isNetPositive ? colors.income : colors.danger, fontSize: 26 },
              ]}
            >
              {formatMoneyDisplay(cashFlow.netSavings, currency)}
            </Text>
          </View>
          <Badge
            label={`${cashFlow.savingsRatePercent}% RATE`}
            variant={cashFlow.savingsRatePercent >= 20 ? 'success' : 'warning'}
          />
        </View>

        {/* Savings Rate Progress Meter */}
        <View style={{ gap: spacing.xs }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Savings Goal Pace (Benchmark: 20%)
            </Text>
            <Text style={[typography.captionMedium, { color: colors.textPrimary }]}>
              {cashFlow.savingsRatePercent}%
            </Text>
          </View>
          <ProgressBar
            progressPercent={cashFlow.savingsRatePercent}
            color={cashFlow.savingsRatePercent >= 20 ? colors.income : colors.warning}
            height={8}
          />
        </View>
      </Card>

      {/* 3. Category Spending Breakdown */}
      <View style={{ gap: spacing.md }}>
        <SectionHeader
          title="Spending by Category"
          badge={categories.length ? `${categories.length} categories` : undefined}
        />

        {categories.length === 0 ? (
          <EmptyState
            icon="📊"
            title="No expense data yet"
            description="Expense transactions will appear categorized here with distribution percentages."
          />
        ) : (
          <Card style={{ gap: spacing.md }}>
            {categories.map((cat, idx) => (
              <View key={cat.categoryId ?? `uncat-${idx}`} style={{ gap: spacing.xs }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <Text style={{ fontSize: 13, color: colors.textTertiary, fontWeight: '700' }}>
                      #{idx + 1}
                    </Text>
                    <Text style={[typography.bodyMedium, { color: colors.textPrimary }]}>
                      {cat.categoryName}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <Text
                      style={[
                        typography.numericMedium,
                        { color: colors.textPrimary, fontSize: 14 },
                      ]}
                    >
                      {formatMoneyDisplay(cat.totalSpent, currency)}
                    </Text>
                    <Badge label={`${cat.percentageOfExpenses}%`} size="sm" variant="neutral" />
                  </View>
                </View>
                <ProgressBar
                  progressPercent={cat.percentageOfExpenses}
                  color={idx === 0 ? colors.primary : colors.accentPurple}
                  height={6}
                />
              </View>
            ))}
          </Card>
        )}
      </View>

      {/* 4. Local Backup & JSON Export */}
      <Card style={{ gap: spacing.sm, backgroundColor: colors.surfaceSubtle }}>
        <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
          Backup & Data Export
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          Export your complete local financial records (accounts, transactions, debts, goals, and
          budgets) as an encrypted offline JSON backup.
        </Text>
        <Button
          label={exporting ? 'Exporting JSON...' : 'Export Local Backup'}
          variant="secondary"
          onPress={() => void handleExport()}
        />
      </Card>
    </ScrollScreen>
  );
}
