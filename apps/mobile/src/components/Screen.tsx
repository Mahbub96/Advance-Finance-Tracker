import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ScrollView,
  View,
  type ScrollViewProps,
  type ViewProps,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  StyleSheet,
  Animated,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFinance } from '../providers/finance-provider';
import { useTokens } from '../theme/tokens';

type ScreenProps = ViewProps & {
  noPadding?: boolean;
};

export function Screen({ children, style, noPadding = false, ...rest }: ScreenProps) {
  const { colors, spacing } = useTokens();
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={StyleSheet.flatten([styles.container, { backgroundColor: colors.background }])}
    >
      <View
        style={StyleSheet.flatten([
          styles.container,
          {
            padding: noPadding ? 0 : spacing.lg,
            gap: spacing.lg,
          },
          style,
        ])}
        {...rest}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

type ScrollScreenProps = ScrollViewProps & {
  noPadding?: boolean;
  onRefresh?: () => Promise<void> | void;
  refreshing?: boolean;
  enablePullToRefresh?: boolean;
};

type SyncState = 'idle' | 'pulling' | 'ready' | 'syncing' | 'success';

export function ScrollScreen({
  children,
  contentContainerStyle,
  noPadding = false,
  style,
  onRefresh,
  refreshing: controlledRefreshing,
  enablePullToRefresh = true,
  ...rest
}: ScrollScreenProps) {
  const { colors, spacing, radius, typography } = useTokens();
  const finance = useFinance();

  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [progress, setProgress] = useState(0); // 0 to 1

  const isRefreshing = controlledRefreshing ?? internalRefreshing;
  const isRefreshingRef = useRef(isRefreshing);
  isRefreshingRef.current = isRefreshing;

  const pullAnim = useRef(new Animated.Value(0)).current;
  const isReadyToTriggerRef = useRef(false);

  // Animate pull distance during sync or return to 0
  useEffect(() => {
    if (syncState === 'syncing' || syncState === 'success') {
      Animated.spring(pullAnim, {
        toValue: 64,
        useNativeDriver: true,
        bounciness: 6,
        speed: 16,
      }).start();
    } else if (syncState === 'idle') {
      Animated.spring(pullAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 6,
        speed: 18,
      }).start();
    }
  }, [syncState, pullAnim]);

  const executeRefresh = useCallback(async () => {
    setSyncState('syncing');
    setInternalRefreshing(true);

    // 1. Deliberate 300ms tactile settle debounce
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        // Re-query local SQLite tables & sync with API
        finance.refresh();
        await finance.syncWithApi();
      }

      // Success phase
      setSyncState('success');
      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch {
      setSyncState('idle');
    } finally {
      setInternalRefreshing(false);
      setSyncState('idle');
      setProgress(0);
      isReadyToTriggerRef.current = false;
    }
  }, [onRefresh, finance]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!enablePullToRefresh || isRefreshingRef.current) {
      rest.onScroll?.(event);
      return;
    }

    const offsetY = event.nativeEvent.contentOffset.y;

    if (offsetY < 0) {
      const pullDist = Math.abs(offsetY);
      // Fill progress from 0 to 1 over 65px pull distance
      const curProgress = Math.min(pullDist / 65, 1);
      setProgress(curProgress);
      pullAnim.setValue(pullDist * 0.6); // Elastic screen translation

      if (curProgress >= 1.0) {
        isReadyToTriggerRef.current = true;
        setSyncState('ready');
      } else {
        isReadyToTriggerRef.current = false;
        setSyncState('pulling');
      }
    } else if (offsetY >= 0 && syncState !== 'syncing' && syncState !== 'success') {
      if (syncState !== 'idle') {
        setSyncState('idle');
        setProgress(0);
        isReadyToTriggerRef.current = false;
        pullAnim.setValue(0);
      }
    }

    rest.onScroll?.(event);
  };

  const handleScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isRefreshingRef.current) {
      rest.onScrollEndDrag?.(event);
      return;
    }

    // Only reload if and only if circular progress completed 100%
    if (isReadyToTriggerRef.current) {
      void executeRefresh();
    } else {
      // Released before completion -> DO NOT reload, spring back to 0
      setSyncState('idle');
      setProgress(0);
      isReadyToTriggerRef.current = false;
      Animated.spring(pullAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 6,
        speed: 18,
      }).start();
    }

    rest.onScrollEndDrag?.(event);
  };

  // Circular rotation calculation (0deg to 360deg)
  const rotationDeg = `${Math.round(progress * 360)}deg`;

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={StyleSheet.flatten([styles.container, { backgroundColor: colors.background }, style])}
    >
      <View style={styles.container}>
        {/* Modern Floating Circular Progress & Sync Header */}
        {enablePullToRefresh && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.floatingHeader,
              {
                opacity: pullAnim.interpolate({
                  inputRange: [0, 10, 45],
                  outputRange: [0, 0.6, 1],
                  extrapolate: 'clamp',
                }),
                transform: [
                  {
                    translateY: pullAnim.interpolate({
                      inputRange: [0, 70],
                      outputRange: [-50, 10],
                      extrapolate: 'clamp',
                    }),
                  },
                  {
                    scale: pullAnim.interpolate({
                      inputRange: [0, 45, 75],
                      outputRange: [0.8, 1, 1.06],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
                backgroundColor: colors.surfaceElevated,
                borderColor:
                  syncState === 'success'
                    ? colors.income
                    : syncState === 'ready'
                      ? colors.primary
                      : colors.border,
                borderRadius: radius.pill,
                shadowColor: colors.textPrimary,
              },
            ]}
          >
            {syncState === 'pulling' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {/* Circular Process Meter */}
                <View
                  style={[
                    styles.circleRing,
                    {
                      borderColor: colors.border,
                      borderTopColor: colors.primary,
                      borderRightColor: progress > 0.5 ? colors.primary : colors.border,
                      transform: [{ rotate: rotationDeg }],
                    },
                  ]}
                >
                  <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800' }}>↓</Text>
                </View>
                <Text
                  style={[typography.captionMedium, { color: colors.textPrimary, fontSize: 12 }]}
                >
                  Pull down ({Math.round(progress * 100)}%)
                </Text>
              </View>
            ) : syncState === 'ready' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {/* 100% Complete Circular Glow */}
                <View
                  style={[
                    styles.circleRing,
                    {
                      borderColor: colors.primary,
                      backgroundColor: colors.primaryMuted,
                    },
                  ]}
                >
                  <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '800' }}>⚡</Text>
                </View>
                <Text
                  style={[
                    typography.captionMedium,
                    { color: colors.primary, fontSize: 13, fontWeight: '700' },
                  ]}
                >
                  Release to sync now!
                </Text>
              </View>
            ) : syncState === 'syncing' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text
                  style={[typography.captionMedium, { color: colors.textPrimary, fontSize: 13 }]}
                >
                  ✨ Syncing API & SQLite...
                </Text>
              </View>
            ) : syncState === 'success' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ color: colors.income, fontSize: 14, fontWeight: '700' }}>✓</Text>
                <Text
                  style={[
                    typography.captionMedium,
                    { color: colors.income, fontSize: 13, fontWeight: '600' },
                  ]}
                >
                  All financial data up to date
                </Text>
              </View>
            ) : null}
          </Animated.View>
        )}

        {/* Physical Elastic Screen Content Body */}
        <Animated.View
          style={{
            flex: 1,
            transform: [{ translateY: pullAnim }],
          }}
        >
          <ScrollView
            contentContainerStyle={StyleSheet.flatten([
              {
                padding: noPadding ? 0 : spacing.lg,
                gap: spacing.lg,
                paddingBottom: spacing.xxxl,
              },
              contentContainerStyle,
            ])}
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={handleScroll}
            onScrollEndDrag={handleScrollEndDrag}
            bounces={true}
            overScrollMode="always"
            {...rest}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingHeader: {
    position: 'absolute',
    top: 6,
    alignSelf: 'center',
    zIndex: 9999,
    elevation: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  circleRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
