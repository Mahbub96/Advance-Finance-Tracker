import { useState } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useTokens } from '../../theme/tokens';

export type TrendPoint = {
  label: string;
  value: number;
};

export function TrendLineChart({
  points = [
    { label: 'Jan', value: 42000 },
    { label: 'Feb', value: 48000 },
    { label: 'Mar', value: 52400 },
    { label: 'Apr', value: 49000 },
    { label: 'May', value: 45000 },
    { label: 'Jun', value: 51200 },
  ],
  height = 110,
  lineColor,
}: {
  points?: TrendPoint[];
  height?: number;
  lineColor?: string;
}) {
  const { colors, typography, radius, spacing } = useTokens();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const strokeColor = lineColor || colors.primary;

  const values = points.map((p) => p.value);
  const minVal = Math.min(...values) * 0.8;
  const maxVal = Math.max(...values) * 1.1;
  const range = maxVal - minVal || 1;

  const activePoint = selectedIdx !== null ? points[selectedIdx] : null;

  return (
    <View style={styles.container}>
      {/* Active Point Info Pill */}
      {activePoint ? (
        <View
          style={[
            styles.tooltipPill,
            {
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.border,
              borderRadius: radius.md,
              marginBottom: spacing.xs,
            },
          ]}
        >
          <Text style={[typography.captionMedium, { color: colors.textPrimary }]}>
            {activePoint.label}:
          </Text>
          <Text style={[typography.captionMedium, { color: strokeColor, fontWeight: '700' }]}>
            ৳{Math.round(activePoint.value).toLocaleString()}
          </Text>
        </View>
      ) : null}

      <View style={[styles.plotArea, { height }]}>
        {points.map((pt, idx) => {
          const normalized = (pt.value - minVal) / range;
          const pointHeight = Math.max(8, normalized * (height - 35));
          const isSelected = selectedIdx === idx;

          return (
            <Pressable
              key={idx}
              onPress={() => setSelectedIdx(isSelected ? null : idx)}
              style={styles.pointColumn}
            >
              {/* Point Dot */}
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: isSelected ? colors.primaryForeground : strokeColor,
                    borderColor: strokeColor,
                    borderWidth: isSelected ? 2 : 0,
                    width: isSelected ? 12 : 8,
                    height: isSelected ? 12 : 8,
                    transform: [{ translateY: -pointHeight }],
                    borderRadius: radius.pill,
                  },
                ]}
              />

              {/* Vertical Guide Fill */}
              <View
                style={[
                  styles.lineArea,
                  {
                    height: pointHeight,
                    backgroundColor: isSelected ? strokeColor + '40' : strokeColor + '20',
                    borderTopColor: strokeColor,
                    borderTopWidth: isSelected ? 3 : 2,
                  },
                ]}
              />

              {/* Label */}
              <Text
                style={[
                  typography.micro,
                  {
                    color: isSelected ? strokeColor : colors.textTertiary,
                    fontWeight: isSelected ? '700' : '400',
                    marginTop: 4,
                  },
                ]}
              >
                {pt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  tooltipPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  plotArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 10,
  },
  pointColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 2,
  },
  dot: {
    zIndex: 2,
    marginBottom: -4,
  },
  lineArea: {
    width: '100%',
    borderRadius: 4,
  },
});
