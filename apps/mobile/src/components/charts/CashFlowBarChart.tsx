import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTokens } from '../../theme/tokens';

export type BarDataPoint = {
  label: string;
  income: number;
  expense: number;
};

export function CashFlowBarChart({
  data,
  height = 130,
}: {
  data?: BarDataPoint[];
  height?: number;
}) {
  const { colors, typography, spacing, radius } = useTokens();

  const defaultData: BarDataPoint[] = [
    { label: 'W1', income: 25000, expense: 12000 },
    { label: 'W2', income: 15000, expense: 18000 },
    { label: 'W3', income: 30000, expense: 14000 },
    { label: 'W4', income: 15600, expense: 8430 },
  ];

  const items = data && data.length > 0 ? data : defaultData;

  const maxVal = Math.max(...items.map((i) => Math.max(i.income, i.expense)), 1000);

  return (
    <View style={styles.container}>
      {/* Visual Bars Container */}
      <View style={[styles.chartArea, { height }]}>
        {items.map((item, idx) => {
          const incHeight = Math.max(6, (item.income / maxVal) * (height - 30));
          const expHeight = Math.max(6, (item.expense / maxVal) * (height - 30));

          return (
            <View key={idx} style={styles.barGroup}>
              <View style={styles.barPair}>
                {/* Income Bar (Green) */}
                <View
                  style={[
                    styles.singleBar,
                    {
                      height: incHeight,
                      backgroundColor: colors.income,
                      borderRadius: radius.xs,
                    },
                  ]}
                />
                {/* Expense Bar (Red/Orange) */}
                <View
                  style={[
                    styles.singleBar,
                    {
                      height: expHeight,
                      backgroundColor: colors.expense,
                      borderRadius: radius.xs,
                    },
                  ]}
                />
              </View>
              {/* Bottom Label */}
              <Text style={[typography.micro, { color: colors.textTertiary, marginTop: 4 }]}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={[styles.legend, { marginTop: spacing.sm }]}>
        <View style={styles.legendItem}>
          <View
            style={[styles.dot, { backgroundColor: colors.income, borderRadius: radius.pill }]}
          />
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.dot, { backgroundColor: colors.expense, borderRadius: radius.pill }]}
          />
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Expense</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
    paddingBottom: 4,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  barPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  singleBar: {
    width: 14,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
  },
});
