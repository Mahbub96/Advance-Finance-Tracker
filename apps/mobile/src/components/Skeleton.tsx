import { useEffect, useRef } from 'react';
import { Animated, type DimensionValue, type StyleProp, StyleSheet, type ViewStyle } from 'react-native';
import { useTokens } from '../theme/tokens';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Primitive pulsing skeleton block
 */
export function SkeletonBox({ width = '100%', height = 20, borderRadius, style }: SkeletonProps) {
  const { colors, radius } = useTokens();
  const opacityAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.85,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.box,
        {
          width,
          height,
          borderRadius: borderRadius ?? radius.sm,
          backgroundColor: colors.surfaceMuted,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
}

/**
 * Circular avatar/icon skeleton
 */
export function SkeletonCircle({ size = 44, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  return <SkeletonBox width={size} height={size} borderRadius={size / 2} style={style} />;
}

/**
 * Text line skeleton with pill-style edges
 */
export function SkeletonText({
  width = '100%',
  height = 14,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { radius } = useTokens();
  return <SkeletonBox width={width} height={height} borderRadius={radius.pill} style={style} />;
}

const styles = StyleSheet.create({
  box: {
    overflow: 'hidden',
  },
});
