import { useState } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
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
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const defaultData: BarDataPoint[] = [
    { label: 'W1', income: 25000, expense: 12000 },
    { label: 'W2', income: 15000, expense: 18000 },
    { label: 'W3', income: 30000, expense: 14000 },
    { label: 'W4', income: 15600, expense: 8430 },
  ];

  const items = data && data.length > 0 ? data : defaultData;
  const maxVal = Math.max(...items.map((i) => Math.max(i.income, i.expense)), 1000);

  const activeItem = selectedIdx !== null ? items[selectedIdx] : null;
  const netSavings = activeItem ? activeItem.income - activeItem.expense : 0;

  return (
    <View style={styles.container}>
      {/* Active Selection Tooltip Banner */}
      {activeItem ? (
        <View
          style={[
            styles.tooltipBanner,
            {
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.border,
              borderRadius: radius.md,
              marginBottom: spacing.sm,
            },
          ]}
        >
          <Text style={[typography.captionMedium, { color: colors.textPrimary }]}>
            {activeItem.label} Summary:
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' }}>
            <Text style={[typography.caption, { color: colors.income }]}>
              +৳{Math.round(activeItem.income).toLocaleString()}
            </Text>
            <Text style={[typography.caption, { color: colors.expense }]}>
              -৳{Math.round(activeItem.expense).toLocaleString()}
            </Text>
            <Text
              style={[
                typography.captionMedium,
                { color: netSavings >= 0 ? colors.income : colors.danger },
              ]}
            >
              Net: {netSavings >= 0 ? '+' : ''}৳{Math.round(netSavings).toLocaleString()}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Visual Bars Container */}
      <View style={[styles.chartArea, { height }]}>
        {items.map((item, idx) => {
          const incHeight = Math.max(6, (item.income / maxVal) * (height - 35));
          const expHeight = Math.max(6, (item.expense / maxVal) * (height - 35));
          const isSelected = selectedIdx === idx;
          const isDimmed = selectedIdx !== null && !isSelected;

          return (
            <Pressable
              key={idx}
              onPress={() => setSelectedIdx(isSelected ? null : idx)}
              style={[
                styles.barGroup,
                {
                  opacity: isDimmed ? 0.35 : 1,
                  transform: [{ scale: isSelected ? 1.05 : 1 }],
                },
              ]}
            >
              <View style={styles.barPair}>
                {/* Income Bar (Green) */}
                <View
                  style={[
                    styles.singleBar,
                    {
                      height: incHeight,
                      backgroundColor: colors.income,
                      borderRadius: radius.xs,
                      borderWidth: isSelected ? 1.5 : 0,
                      borderColor: colors.textPrimary,
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
                      borderWidth: isSelected ? 1.5 : 0,
                      borderColor: colors.textPrimary,
                    },
                  ]}
                />
              </View>
              {/* Bottom Label */}
              <Text
                style={[
                  typography.micro,
                  {
                    color: isSelected ? colors.primary : colors.textTertiary,
                    fontWeight: isSelected ? '700' : '400',
                    marginTop: 4,
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
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
  tooltipBanner: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    paddingVertical: 2,
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
