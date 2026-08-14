import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTokens } from '../../theme/tokens';

export type DonutSegment = {
  label: string;
  value: number;
  percentage: number;
  color: string;
  formattedValue?: string;
};

export function DonutChart({
  segments,
  totalLabel = 'Total Expense',
  totalFormatted,
  size = 180,
}: {
  segments: DonutSegment[];
  totalLabel?: string;
  totalFormatted?: string;
  size?: number;
}) {
  const { colors, typography, spacing, radius } = useTokens();

  if (!segments || segments.length === 0) {
    return (
      <View style={[styles.emptyContainer, { height: size }]}>
        <Text style={[typography.caption, { color: colors.textTertiary }]}>No data to chart</Text>
      </View>
    );
  }

  const ringThickness = 22;
  const innerSize = size - ringThickness * 2;

  return (
    <View style={styles.container}>
      {/* Visual Multi-Segment Donut Ring Container */}
      <View style={[styles.donutContainer, { width: size, height: size }]}>
        {/* Outer Circular Ring Background */}
        <View
          style={[
            styles.outerCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.surfaceMuted,
            },
          ]}
        />

        {/* Multi-segment stacked gauge segments */}
        <View
          style={[
            styles.barStack,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              overflow: 'hidden',
              flexDirection: 'row',
            },
          ]}
        >
          {segments.map((seg, idx) => (
            <View
              key={idx}
              style={{
                flex: Math.max(1, seg.percentage),
                backgroundColor: seg.color,
                height: '100%',
              }}
            />
          ))}
        </View>

        {/* Center Cutout for Donut Hole */}
        <View
          style={[
            styles.innerHole,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: colors.surface,
            },
          ]}
        >
          {totalFormatted && (
            <Text
              style={[
                typography.numericLarge,
                { color: colors.textPrimary, fontSize: 18, textAlign: 'center' },
              ]}
              numberOfLines={1}
            >
              {totalFormatted}
            </Text>
          )}
          <Text
            style={[
              typography.micro,
              { color: colors.textTertiary, textAlign: 'center', marginTop: 2 },
            ]}
            numberOfLines={1}
          >
            {totalLabel}
          </Text>
        </View>
      </View>

      {/* Breakdown Segments Legend */}
      <View style={[styles.legendList, { gap: spacing.xs, marginTop: spacing.md }]}>
        {segments.map((seg, idx) => (
          <View key={idx} style={styles.legendRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 }}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: seg.color, borderRadius: radius.pill },
                ]}
              />
              <Text
                style={[typography.captionMedium, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {seg.label}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                {seg.percentage}%
              </Text>
              {seg.formattedValue && (
                <Text
                  style={[typography.numericMedium, { color: colors.textPrimary, fontSize: 13 }]}
                >
                  {seg.formattedValue}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerCircle: {
    position: 'absolute',
  },
  barStack: {
    position: 'absolute',
  },
  innerHole: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  legendList: {
    width: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  legendDot: {
    width: 10,
    height: 10,
  },
});
