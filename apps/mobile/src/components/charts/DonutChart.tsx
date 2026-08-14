import { useState } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
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
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (!segments || segments.length === 0) {
    return (
      <View style={[styles.emptyContainer, { height: size }]}>
        <Text style={[typography.caption, { color: colors.textTertiary }]}>No data to chart</Text>
      </View>
    );
  }

  const ringThickness = 22;
  const innerSize = size - ringThickness * 2;

  const activeSegment = selectedIdx !== null ? segments[selectedIdx] : null;
  const centerValue = activeSegment
    ? activeSegment.formattedValue || `${activeSegment.value}`
    : totalFormatted;
  const centerLabel = activeSegment
    ? `${activeSegment.label} (${activeSegment.percentage}%)`
    : totalLabel;

  return (
    <View style={styles.container}>
      {/* Visual Multi-Segment Donut Ring Container */}
      <Pressable
        onPress={() => setSelectedIdx(null)}
        style={[styles.donutContainer, { width: size, height: size }]}
      >
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
          {segments.map((seg, idx) => {
            const isDimmed = selectedIdx !== null && selectedIdx !== idx;
            return (
              <Pressable
                key={idx}
                onPress={() => setSelectedIdx(selectedIdx === idx ? null : idx)}
                style={{
                  flex: Math.max(1, seg.percentage),
                  backgroundColor: seg.color,
                  height: '100%',
                  opacity: isDimmed ? 0.35 : 1,
                }}
              />
            );
          })}
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
          {centerValue && (
            <Text
              style={[
                typography.numericLarge,
                {
                  color: activeSegment ? activeSegment.color : colors.textPrimary,
                  fontSize: 17,
                  textAlign: 'center',
                },
              ]}
              numberOfLines={1}
            >
              {centerValue}
            </Text>
          )}
          <Text
            style={[
              typography.micro,
              {
                color: colors.textTertiary,
                textAlign: 'center',
                marginTop: 2,
                paddingHorizontal: 4,
              },
            ]}
            numberOfLines={1}
          >
            {centerLabel}
          </Text>
        </View>
      </Pressable>

      {/* Breakdown Segments Interactive Legend */}
      <View style={[styles.legendList, { gap: spacing.xs, marginTop: spacing.md }]}>
        {segments.map((seg, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <Pressable
              key={idx}
              onPress={() => setSelectedIdx(selectedIdx === idx ? null : idx)}
              style={[
                styles.legendRow,
                {
                  backgroundColor: isSelected ? colors.surfaceElevated : 'transparent',
                  borderRadius: radius.sm,
                  paddingHorizontal: 6,
                  paddingVertical: 5,
                },
              ]}
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 }}
              >
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor: seg.color,
                      borderRadius: radius.pill,
                      width: isSelected ? 12 : 10,
                      height: isSelected ? 12 : 10,
                    },
                  ]}
                />
                <Text
                  style={[
                    typography.captionMedium,
                    {
                      color: isSelected ? colors.primary : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
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
                    style={[
                      typography.numericMedium,
                      {
                        color: colors.textPrimary,
                        fontSize: 13,
                        fontWeight: isSelected ? '700' : '400',
                      },
                    ]}
                  >
                    {seg.formattedValue}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
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
  },
  legendDot: {
    width: 10,
    height: 10,
  },
});
