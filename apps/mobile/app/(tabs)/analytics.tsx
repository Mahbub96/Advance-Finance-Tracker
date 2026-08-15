import { formatMoneyDisplay } from '@personal-finance/types';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Share, Text, View, Pressable } from 'react-native';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { ProgressBar } from '../../src/components/ProgressBar';
import { ScrollScreen } from '../../src/components/Screen';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { StatCard } from '../../src/components/StatCard';
import { AnalyticsSkeleton } from '../../src/components/skeletons/AnalyticsSkeleton';
import { DonutChart, type DonutSegment } from '../../src/components/charts/DonutChart';
import { CashFlowBarChart } from '../../src/components/charts/CashFlowBarChart';
import type { CategoryBreakdownItem } from '../../src/features/analytics/services/analytics-service';
import { useSettings } from '../../src/hooks/use-settings';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

const CATEGORY_PALETTE = [
  '#2563EB',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#64748B',
  '#84CC16',
  '#F97316',
];

type ReportTab = 'SPENDING' | 'INCOME' | 'CASH_FLOW';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function AnalyticsScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { analytics, nonce } = useFinance();
  const { settings } = useSettings();
  const currency = settings?.baseCurrency ?? 'BDT';

  const [activeTab, setActiveTab] = useState<ReportTab>('SPENDING');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
  const currentYear = new Date().getFullYear();
  const [loading, setLoading] = useState(true);
  const [cashFlow, setCashFlow] = useState({
    totalIncome: '0.00',
    totalExpenses: '0.00',
    netSavings: '0.00',
    savingsRatePercent: 0,
  });
  const [cashFlowHistory, setCashFlowHistory] = useState<
    Array<{ label: string; income: number; expense: number }>
  >([]);
  const [categories, setCategories] = useState<CategoryBreakdownItem[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<CategoryBreakdownItem[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const year = currentYear;
    const month = currentMonthIndex;
    const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
    const firstDay = `${yearMonth}-01`;
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const lastDay = `${yearMonth}-${String(lastDayOfMonth).padStart(2, '0')}`;

    setLoading(true);
    void Promise.all([
      analytics.getCashFlow(firstDay, lastDay),
      analytics.getCategoryBreakdown(firstDay, lastDay),
      analytics.getIncomeBreakdown(firstDay, lastDay),
      analytics.getMonthlyCashFlowHistory(6),
    ]).then(([cf, cats, incCats, history]) => {
      setCashFlow(cf);
      setCategories(cats);
      setIncomeCategories(incCats);
      setCashFlowHistory(history);
    }).finally(() => {
      setLoading(false);
    });
  }, [analytics, nonce, currentMonthIndex, currentYear]);

  const isNetPositive = parseFloat(cashFlow.netSavings) >= 0;

  // Expense Donut chart segments
  const donutSegments: DonutSegment[] = useMemo(() => {
    return categories.map((cat, idx) => ({
      label: cat.categoryName,
      value: parseFloat(cat.totalSpent),
      percentage: cat.percentageOfExpenses,
      color: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length] || '#2563EB',
      formattedValue: formatMoneyDisplay(cat.totalSpent, currency),
    }));
  }, [categories, currency]);

  // Income Donut chart segments
  const incomeDonutSegments: DonutSegment[] = useMemo(() => {
    return incomeCategories.map((cat, idx) => ({
      label: cat.categoryName,
      value: parseFloat(cat.totalSpent),
      percentage: cat.percentageOfExpenses,
      color: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length] || '#10B981',
      formattedValue: formatMoneyDisplay(cat.totalSpent, currency),
    }));
  }, [incomeCategories, currency]);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  const handleExportJson = async () => {
    setExporting(true);
    try {
      const data = await analytics.exportAllData();
      const jsonStr = JSON.stringify(data, null, 2);
      await Share.share({
        title: 'FinTrack-Report-Backup.json',
        message: jsonStr,
      });
    } catch {
      Alert.alert('Export Notice', 'Data export cancelled.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const year = currentYear;
      const month = currentMonthIndex;
      const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
      const firstDay = `${yearMonth}-01`;
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
      const lastDay = `${yearMonth}-${String(lastDayOfMonth).padStart(2, '0')}`;

      const csvData = await analytics.exportCsvReport(firstDay, lastDay);
      await Share.share({
        title: `FinTrack-Ledger-${yearMonth}.csv`,
        message: csvData,
      });
    } catch {
      Alert.alert('Export Notice', 'CSV export cancelled.');
    } finally {
      setExporting(false);
    }
  };

  const reportTabs = [
    { id: 'SPENDING' as const, label: 'Spending' },
    { id: 'INCOME' as const, label: 'Income' },
    { id: 'CASH_FLOW' as const, label: 'Cash Flow' },
  ];

  return (
    <ScrollScreen>
      {/* Header */}
      <View style={{ gap: 2 }}>
        <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
          PERFORMANCE & REPORTS
        </Text>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Reports & Analytics</Text>
      </View>

      {/* Segmented Tab Bar */}
      <SegmentedControl options={reportTabs} value={activeTab} onChange={setActiveTab} />

      {/* Month Selector Bar */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        }}
      >
        <Pressable
          onPress={() => setCurrentMonthIndex((prev) => (prev === 0 ? 11 : prev - 1))}
          style={{ padding: 4 }}
        >
          <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '700' }}>‹</Text>
        </Pressable>
        <Text style={[typography.sectionTitle, { color: colors.textPrimary, fontSize: 15 }]}>
          {MONTHS[currentMonthIndex]} {currentYear}
        </Text>
        <Pressable
          onPress={() => setCurrentMonthIndex((prev) => (prev === 11 ? 0 : prev + 1))}
          style={{ padding: 4 }}
        >
          <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '700' }}>›</Text>
        </Pressable>
      </View>

      {/* TAB 1: SPENDING (Category Breakdown & Donut Chart) */}
      {activeTab === 'SPENDING' && (
        <View style={{ gap: spacing.md }}>
          <StatCard
            label="Total Month Expenses"
            value={formatMoneyDisplay(cashFlow.totalExpenses, currency)}
            indicatorColor={colors.expense}
            icon="💸"
          />

          {categories.length === 0 ? (
            <EmptyState
              icon="📊"
              title="No expense data yet"
              description="Record expense transactions to see your interactive category distribution."
            />
          ) : (
            <Card
              style={{
                gap: spacing.md,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
                Expense by Category
              </Text>
              <DonutChart
                segments={donutSegments}
                totalLabel="Total Expense"
                totalFormatted={formatMoneyDisplay(cashFlow.totalExpenses, currency)}
                size={180}
              />
              <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
                {categories.map((cat, idx) => (
                  <View key={cat.categoryId ?? `cat-${idx}`} style={{ gap: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[typography.bodyMedium, { color: colors.textPrimary }]}>
                        {cat.categoryName}
                      </Text>
                      <Text style={[typography.captionMedium, { color: colors.textPrimary }]}>
                        {formatMoneyDisplay(cat.totalSpent, currency)} ({cat.percentageOfExpenses}%)
                      </Text>
                    </View>
                    <ProgressBar
                      progressPercent={cat.percentageOfExpenses}
                      color={CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length] || '#2563EB'}
                      height={6}
                    />
                  </View>
                ))}
              </View>
            </Card>
          )}
        </View>
      )}

      {/* TAB 2: INCOME */}
      {activeTab === 'INCOME' && (
        <View style={{ gap: spacing.md }}>
          <StatCard
            label="Total Month Income"
            value={formatMoneyDisplay(cashFlow.totalIncome, currency)}
            indicatorColor={colors.income}
            icon="📈"
          />

          {incomeCategories.length === 0 ? (
            <EmptyState
              icon="💰"
              title="No income recorded yet"
              description="Add salary, dividends, or freelance earnings to see income distribution."
            />
          ) : (
            <Card
              style={{ backgroundColor: colors.surface, borderColor: colors.border, gap: spacing.md }}
            >
              <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
                Income by Source
              </Text>
              <DonutChart
                segments={incomeDonutSegments}
                totalLabel="Total Income"
                totalFormatted={formatMoneyDisplay(cashFlow.totalIncome, currency)}
                size={180}
              />
              <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
                {incomeCategories.map((cat, idx) => (
                  <View key={cat.categoryId ?? `inc-${idx}`} style={{ gap: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[typography.bodyMedium, { color: colors.textPrimary }]}>
                        {cat.categoryName}
                      </Text>
                      <Text style={[typography.captionMedium, { color: colors.income }]}>
                        {formatMoneyDisplay(cat.totalSpent, currency)} ({cat.percentageOfExpenses}%)
                      </Text>
                    </View>
                    <ProgressBar
                      progressPercent={cat.percentageOfExpenses}
                      color={CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length] || '#10B981'}
                      height={6}
                    />
                  </View>
                ))}
              </View>
            </Card>
          )}
        </View>
      )}

      {/* TAB 3: CASH FLOW & BARS */}
      {activeTab === 'CASH_FLOW' && (
        <View style={{ gap: spacing.md }}>
          {/* Quick Metrics */}
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

          {/* Cash Flow Bar Chart */}
          <Card
            style={{ backgroundColor: colors.surface, borderColor: colors.border, gap: spacing.md }}
          >
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
              Cash Flow Trend
            </Text>
            <CashFlowBarChart
              data={
                cashFlowHistory.length > 0
                  ? cashFlowHistory
                  : [
                      {
                        label: 'Current',
                        income: parseFloat(cashFlow.totalIncome),
                        expense: parseFloat(cashFlow.totalExpenses),
                      },
                    ]
              }
              height={130}
            />
          </Card>

          {/* Net Savings & Savings Rate Card */}
          <Card
            style={{
              gap: spacing.md,
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
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
        </View>
      )}

      {/* Export Report CTAs */}
      <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
        <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
          EXPORT & STATEMENT TOOLS
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Button
              label={exporting ? 'Exporting...' : '📊 Export CSV'}
              variant="outline"
              size="md"
              loading={exporting}
              onPress={() => void handleExportCsv()}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label="🔒 Backup JSON"
              variant="secondary"
              size="md"
              loading={exporting}
              onPress={() => void handleExportJson()}
            />
          </View>
        </View>
      </View>
    </ScrollScreen>
  );
}
