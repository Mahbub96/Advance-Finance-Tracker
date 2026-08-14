import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTokens } from '../../theme/tokens';
import type { PullIndicatorProps } from './types';

export function PullIndicator({
  progress,
  state,
  size = 28,
  strokeWidth = 2.8,
  color: colorProp,
  trackColor: trackColorProp,
  successColor: successColorProp,
  errorColor: errorColorProp,
  showLabel = true,
  style,
}: PullIndicatorProps) {
  const { colors, typography } = useTokens();

  const color = colorProp ?? colors.primary;
  const trackColor = trackColorProp ?? colors.surfaceMuted;
  const successColor = successColorProp ?? colors.income;
  const errorColor = errorColorProp ?? colors.expense;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Spin animation during refreshing
  const spinAnim = useRef(new Animated.Value(0)).current;
  // Pulse animation when 100% ready
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Success / error scale pop
  const popAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (state === 'refreshing') {
      const loop = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      loop.start();
      return () => {
        loop.stop();
        spinAnim.setValue(0);
      };
    } else {
      spinAnim.setValue(0);
    }
  }, [state, spinAnim]);

  useEffect(() => {
    if (state === 'ready') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.12,
            duration: 280,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 280,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => {
        pulse.stop();
        pulseAnim.setValue(1);
      };
    } else {
      pulseAnim.setValue(1);
    }
  }, [state, pulseAnim]);

  useEffect(() => {
    if (state === 'completed' || state === 'error') {
      Animated.spring(popAnim, {
        toValue: 1,
        bounciness: 12,
        speed: 18,
        useNativeDriver: true,
      }).start();
    } else {
      popAnim.setValue(0.8);
    }
  }, [state, popAnim]);

  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference * (1 - clampedProgress);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const activeColor =
    state === 'completed'
      ? successColor
      : state === 'error'
        ? errorColor
        : state === 'ready'
          ? color
          : color;

  const percentText = Math.round(clampedProgress * 100);

  return (
    <View
      style={[styles.wrapper, style]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percentText }}
      accessibilityLiveRegion="polite"
      accessibilityLabel={`Refresh status: ${state}, ${percentText} percent`}
    >
      <Animated.View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            transform: [{ scale: state === 'ready' ? pulseAnim : state === 'completed' || state === 'error' ? popAnim : 1 }],
          },
        ]}
      >
        {state === 'refreshing' ? (
          /* Indeterminate Spinner */
          <Animated.View
            style={{
              width: size,
              height: size,
              transform: [{ rotate: spin }],
            }}
          >
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={trackColor}
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={activeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={circumference * 0.65}
                strokeLinecap="round"
                fill="transparent"
              />
            </Svg>
          </Animated.View>
        ) : state === 'completed' ? (
          /* Checkmark on Success */
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={successColor}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <Path
              d={`M ${size * 0.28} ${size * 0.52} L ${size * 0.44} ${size * 0.68} L ${size * 0.72} ${size * 0.34}`}
              stroke={successColor}
              strokeWidth={strokeWidth * 1.1}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="transparent"
            />
          </Svg>
        ) : state === 'error' ? (
          /* Warning icon on error */
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={errorColor}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <Path
              d={`M ${size * 0.5} ${size * 0.28} L ${size * 0.5} ${size * 0.58} M ${size * 0.5} ${size * 0.72} L ${size * 0.5} ${size * 0.74}`}
              stroke={errorColor}
              strokeWidth={strokeWidth * 1.05}
              strokeLinecap="round"
              fill="transparent"
            />
          </Svg>
        ) : (
          /* Deterministic Progress Ring with Icon */
          <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <Svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              style={{ transform: [{ rotate: '-90deg' }] }}
            >
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={trackColor}
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={activeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </Svg>

            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <View style={styles.centerIconContainer}>
                <Svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none">
                  {state === 'ready' ? (
                    // Upward release chevron / spark
                    <Path
                      d="M12 19V5M12 5L6 11M12 5L18 11"
                      stroke={activeColor}
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    // Downward pull arrow
                    <Path
                      d="M12 5V19M12 19L6 13M12 19L18 13"
                      stroke={activeColor}
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </Svg>
              </View>
            </View>
          </View>
        )}
      </Animated.View>

      {/* Dynamic Status Text */}
      {showLabel && (
        <View style={styles.labelContainer}>
          {state === 'pulling' ? (
            <Text
              style={[
                typography.captionMedium,
                { color: colors.textSecondary, fontSize: 13, fontVariant: ['tabular-nums'] },
              ]}
            >
              Pull to refresh {percentText}%
            </Text>
          ) : state === 'ready' ? (
            <Text
              style={[
                typography.captionMedium,
                { color: activeColor, fontSize: 13, fontWeight: '700' },
              ]}
            >
              Release to reload! ✨
            </Text>
          ) : state === 'refreshing' ? (
            <Text
              style={[
                typography.captionMedium,
                { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
              ]}
            >
              Updating ledger...
            </Text>
          ) : state === 'completed' ? (
            <Text
              style={[
                typography.captionMedium,
                { color: successColor, fontSize: 13, fontWeight: '700' },
              ]}
            >
              Up to date ✓
            </Text>
          ) : state === 'error' ? (
            <Text
              style={[
                typography.captionMedium,
                { color: errorColor, fontSize: 13, fontWeight: '600' },
              ]}
            >
              Sync failed, tap to retry
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerIconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    justifyContent: 'center',
  },
});
