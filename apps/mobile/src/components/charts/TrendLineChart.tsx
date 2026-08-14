import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
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
  const { colors, typography, radius } = useTokens();
  const strokeColor = lineColor || colors.primary;

  const values = points.map((p) => p.value);
  const minVal = Math.min(...values) * 0.8;
  const maxVal = Math.max(...values) * 1.1;
  const range = maxVal - minVal || 1;

  return (
    <View style={styles.container}>
      <View style={[styles.plotArea, { height }]}>
        {points.map((pt, idx) => {
          const normalized = (pt.value - minVal) / range;
          const pointHeight = Math.max(8, normalized * (height - 35));

          return (
            <View key={idx} style={styles.pointColumn}>
              {/* Point Dot */}
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: strokeColor,
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
                    backgroundColor: strokeColor + '20',
                    borderTopColor: strokeColor,
                    borderTopWidth: 2,
                  },
                ]}
              />

              {/* Label */}
              <Text style={[typography.micro, { color: colors.textTertiary, marginTop: 4 }]}>
                {pt.label}
              </Text>
            </View>
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
  },
  dot: {
    width: 8,
    height: 8,
    zIndex: 2,
    marginBottom: -4,
  },
  lineArea: {
    width: '100%',
    borderRadius: 4,
  },
});
