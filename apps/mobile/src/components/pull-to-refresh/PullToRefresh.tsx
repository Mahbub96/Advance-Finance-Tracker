import React from 'react';
import {
  View,
  StyleSheet,
  Animated,
  RefreshControl,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useTokens } from '../../theme/tokens';
import { usePullToRefresh } from './usePullToRefresh';
import { PullIndicator } from './PullIndicator';
import type { PullToRefreshProps } from './types';

export function PullToRefresh({
  children,
  onRefresh,
  refreshing,
  enabled = true,
  threshold,
  maxPull,
  resistance,
  springBounciness,
  springSpeed,
  refreshingRestHeight,
  enableHaptics,
  reducedMotion,
  onStateChange,
  renderIndicator,
  containerStyle,
  accessibilityLabel = 'Pull down to refresh',
}: PullToRefreshProps) {
  const { colors, radius } = useTokens();

  const {
    state,
    progress,
    pullAnim,
    isRefreshing,
    onScroll,
    onScrollEndDrag,
    triggerManualRefresh,
  } = usePullToRefresh({
    onRefresh,
    refreshing,
    enabled,
    threshold,
    maxPull,
    resistance,
    springBounciness,
    springSpeed,
    refreshingRestHeight,
    enableHaptics,
    reducedMotion,
    onStateChange,
  });

  // Inject scroll handlers + invisible native RefreshControl into children
  const renderChildren = () => {
    if (React.isValidElement(children)) {
      const childProps = children.props as {
        onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
        onScrollEndDrag?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
      };

      return React.cloneElement(children, {
        scrollEventThrottle: 16,
        bounces: true,
        overScrollMode: 'always',
        onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
          onScroll(e);
          childProps.onScroll?.(e);
        },
        onScrollEndDrag: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
          onScrollEndDrag(e);
          childProps.onScrollEndDrag?.(e);
        },
        // Native RefreshControl handles gesture capture on both iOS & Android
        // Made invisible so our custom floating indicator is the only visual
        refreshControl: enabled ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={triggerManualRefresh}
            tintColor="transparent"
            colors={['transparent']}
            progressBackgroundColor="transparent"
            style={styles.hiddenRefreshControl}
          />
        ) : undefined,
      } as Record<string, unknown>);
    }
    return children;
  };

  return (
    <View
      style={[styles.container, containerStyle]}
      accessibilityLabel={accessibilityLabel}
    >
      {/* Floating Pill Refresh Header */}
      {enabled && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.floatingHeader,
            {
              opacity: pullAnim.interpolate({
                inputRange: [0, 8, 36],
                outputRange: [0, 0.4, 1],
                extrapolate: 'clamp',
              }),
              transform: [
                {
                  translateY: pullAnim.interpolate({
                    inputRange: [0, 80],
                    outputRange: [-55, 12],
                    extrapolate: 'clamp',
                  }),
                },
                {
                  scale: pullAnim.interpolate({
                    inputRange: [0, 45, 80],
                    outputRange: [0.75, 1, 1.05],
                    extrapolate: 'clamp',
                  }),
                },
              ],
              backgroundColor: colors.surfaceElevated,
              borderColor:
                state === 'completed'
                  ? colors.income
                  : state === 'error'
                    ? colors.expense
                    : state === 'ready'
                      ? colors.primary
                      : colors.border,
              borderRadius: radius.pill,
              shadowColor: colors.textPrimary,
            },
          ]}
        >
          {renderIndicator ? (
            renderIndicator({ progress, state })
          ) : (
            <PullIndicator
              progress={progress}
              state={state}
              size={26}
              strokeWidth={2.8}
            />
          )}
        </Animated.View>
      )}

      {/* Content Viewport — no translateY; native RefreshControl manages content offset */}
      <View style={styles.contentViewport}>
        {renderChildren()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  floatingHeader: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    zIndex: 9999,
    elevation: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1.2,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
  },
  contentViewport: {
    flex: 1,
  },
  hiddenRefreshControl: {
    backgroundColor: 'transparent',
    height: 0,
  },
});
