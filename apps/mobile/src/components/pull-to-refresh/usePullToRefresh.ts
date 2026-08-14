import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Animated,
  AccessibilityInfo,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  DEFAULT_THRESHOLD,
  DEFAULT_MAX_PULL,
  DEFAULT_RESISTANCE,
  calculateElasticPull,
  calculateProgress,
} from './physics';
import type { RefreshState, PullPhysicsConfig } from './types';

export interface UsePullToRefreshOptions extends PullPhysicsConfig {
  onRefresh: () => Promise<void> | void;
  refreshing?: boolean;
  enabled?: boolean;
  onStateChange?: (state: RefreshState) => void;
}

export function usePullToRefresh({
  onRefresh,
  refreshing: controlledRefreshing,
  enabled = true,
  threshold = DEFAULT_THRESHOLD,
  maxPull = DEFAULT_MAX_PULL,
  resistance = DEFAULT_RESISTANCE,
  springBounciness = 8,
  springSpeed = 16,
  refreshingRestHeight = 64,
  enableHaptics = true,
  reducedMotion: reducedMotionProp,
  onStateChange,
}: UsePullToRefreshOptions) {
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const [state, setStateRaw] = useState<RefreshState>('idle');
  const [progress, setProgress] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(Boolean(reducedMotionProp));

  const isRefreshing = controlledRefreshing ?? internalRefreshing;
  const isRefreshingRef = useRef(isRefreshing);
  isRefreshingRef.current = isRefreshing;

  const pullAnim = useRef(new Animated.Value(0)).current;
  const isReadyToTriggerRef = useRef(false);
  const hasTriggeredReadyHapticRef = useRef(false);
  const currentProgressRef = useRef(0);
  currentProgressRef.current = progress;

  // Track current vertical scroll position of the inner ScrollView
  const scrollYRef = useRef(0);

  // Listen to system reduced-motion settings if not explicitly overridden
  useEffect(() => {
    if (reducedMotionProp !== undefined) {
      setIsReducedMotion(reducedMotionProp);
      return;
    }
    let isMounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) setIsReducedMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (enabled) => {
      setIsReducedMotion(enabled);
    });
    return () => {
      isMounted = false;
      sub?.remove?.();
    };
  }, [reducedMotionProp]);

  const setState = useCallback(
    (newState: RefreshState) => {
      setStateRaw(newState);
      onStateChange?.(newState);
    },
    [onStateChange],
  );

  // Safe Haptic feedback helpers
  const triggerImpact = useCallback(
    (style: Haptics.ImpactFeedbackStyle) => {
      if (!enableHaptics) return;
      try {
        void Haptics.impactAsync(style);
      } catch {
        // Fallback for non-mobile platforms / simulator
      }
    },
    [enableHaptics],
  );

  const triggerNotification = useCallback(
    (type: Haptics.NotificationFeedbackType) => {
      if (!enableHaptics) return;
      try {
        void Haptics.notificationAsync(type);
      } catch {
        // Fallback
      }
    },
    [enableHaptics],
  );

  // Animate resting position when entering refreshing/completed/idle states
  useEffect(() => {
    if (state === 'refreshing' || state === 'completed') {
      if (isReducedMotion) {
        Animated.timing(pullAnim, {
          toValue: refreshingRestHeight,
          duration: 150,
          useNativeDriver: false,
        }).start();
      } else {
        Animated.spring(pullAnim, {
          toValue: refreshingRestHeight,
          useNativeDriver: false,
          bounciness: springBounciness,
          speed: springSpeed,
        }).start();
      }
    } else if (state === 'idle' || state === 'cancelled') {
      if (isReducedMotion) {
        Animated.timing(pullAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: false,
        }).start();
      } else {
        Animated.spring(pullAnim, {
          toValue: 0,
          useNativeDriver: false,
          bounciness: springBounciness + 1,
          speed: springSpeed + 2,
        }).start();
      }
    }
  }, [state, pullAnim, refreshingRestHeight, springBounciness, springSpeed, isReducedMotion]);

  // Main execution routine
  const executeRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;

    setState('refreshing');
    setInternalRefreshing(true);
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await onRefresh();

      // Successful completion phase
      setState('completed');
      triggerNotification(Haptics.NotificationFeedbackType.Success);
      await new Promise((resolve) => setTimeout(resolve, 650));
    } catch {
      // Error handling phase
      setState('error');
      triggerNotification(Haptics.NotificationFeedbackType.Error);
      await new Promise((resolve) => setTimeout(resolve, 800));
    } finally {
      setInternalRefreshing(false);
      setState('idle');
      setProgress(0);
      isReadyToTriggerRef.current = false;
      hasTriggeredReadyHapticRef.current = false;
    }
  }, [onRefresh, setState, triggerImpact, triggerNotification]);

  // Synchronize controlled refreshing prop
  useEffect(() => {
    if (controlledRefreshing && state === 'idle') {
      setState('refreshing');
    } else if (!controlledRefreshing && state === 'refreshing' && !internalRefreshing) {
      setState('idle');
    }
  }, [controlledRefreshing, state, internalRefreshing, setState]);

  // Scroll event listener for native scroll position tracking & iOS overscroll indicator
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      scrollYRef.current = offsetY;

      if (!enabled || isRefreshingRef.current) return;

      if (offsetY < 0) {
        const rawPull = Math.abs(offsetY);
        const elasticDistance = calculateElasticPull(rawPull, maxPull, resistance);
        pullAnim.setValue(elasticDistance);

        const currentProg = calculateProgress(rawPull, threshold);
        setProgress(currentProg);

        if (currentProg >= 1.0) {
          if (!hasTriggeredReadyHapticRef.current) {
            triggerImpact(Haptics.ImpactFeedbackStyle.Heavy);
            hasTriggeredReadyHapticRef.current = true;
          }
          isReadyToTriggerRef.current = true;
          setState('ready');
        } else {
          hasTriggeredReadyHapticRef.current = false;
          isReadyToTriggerRef.current = false;
          setState('pulling');
        }
      } else if (offsetY >= 0 && state !== 'refreshing' && state !== 'completed' && state !== 'error') {
        if (state !== 'idle') {
          setState('idle');
          setProgress(0);
          isReadyToTriggerRef.current = false;
          hasTriggeredReadyHapticRef.current = false;
          pullAnim.setValue(0);
        }
      }
    },
    [enabled, state, maxPull, resistance, threshold, pullAnim, setState, triggerImpact],
  );

  // Drag release event listener (for iOS native bounce release)
  const onScrollEndDrag = useCallback(
    (_event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isRefreshingRef.current || !enabled) return;

      if (isReadyToTriggerRef.current && currentProgressRef.current >= 1.0) {
        void executeRefresh();
      } else {
        triggerImpact(Haptics.ImpactFeedbackStyle.Light);
        setState('cancelled');
        setProgress(0);
        isReadyToTriggerRef.current = false;
        hasTriggeredReadyHapticRef.current = false;

        if (isReducedMotion) {
          Animated.timing(pullAnim, {
            toValue: 0,
            duration: 120,
            useNativeDriver: false,
          }).start(() => setState('idle'));
        } else {
          Animated.spring(pullAnim, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: springBounciness + 1,
            speed: springSpeed + 2,
          }).start(() => setState('idle'));
        }
      }
    },
    [enabled, executeRefresh, isReducedMotion, pullAnim, setState, springBounciness, springSpeed, triggerImpact],
  );

  // Programmatic manual refresh for accessibility / external actions / RefreshControl
  const triggerManualRefresh = useCallback(() => {
    if (isRefreshingRef.current) return;
    void executeRefresh();
  }, [executeRefresh]);

  return {
    state,
    progress,
    pullAnim,
    isRefreshing,
    isReducedMotion,
    onScroll,
    onScrollEndDrag,
    triggerManualRefresh,
  };
}
