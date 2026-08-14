import React from 'react';
import { View, StyleSheet } from 'react-native';

export function SparklineChart({
  data = [20, 35, 28, 45, 38, 55, 60, 52, 68, 75, 70, 85],
  color = '#10B981',
  height = 40,
  fillColor,
}: {
  data?: number[];
  color?: string;
  height?: number;
  fillColor?: string;
}) {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.chartWrapper}>
        {data.map((val, idx) => {
          const normalized = (val - min) / range;
          const barHeight = Math.max(4, normalized * (height - 8));
          const isLast = idx === data.length - 1;

          return (
            <View key={idx} style={styles.column}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: isLast ? color : color + 'CC',
                    transform: [{ translateY: -(barHeight / 2) }],
                  },
                ]}
              />
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: fillColor || color + '33',
                    borderTopColor: color,
                    borderTopWidth: 2,
                  },
                ]}
              />
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
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 3,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginBottom: -2,
  },
});
