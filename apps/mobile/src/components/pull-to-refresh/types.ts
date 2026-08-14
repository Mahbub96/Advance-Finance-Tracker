import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

/**
 * State machine for the Pull-to-Refresh interaction lifecycle.
 *
 * Transitions:
 * - idle -> pulling (user begins downward drag)
 * - pulling -> ready (progress reaches 1.0 / threshold reached)
 * - ready -> pulling (user drags back up below threshold)
 * - pulling (released) -> cancelled -> idle (NO REFRESH TRIGGERED)
 * - ready (released) -> refreshing (REFRESH TRIGGERED)
 * - refreshing -> completed -> idle (success path)
 * - refreshing -> error -> idle (failure/exception path)
 */
export type RefreshState =
  | 'idle'
  | 'pulling'
  | 'ready'
  | 'refreshing'
  | 'completed'
  | 'cancelled'
  | 'error';

/**
 * Configuration options for the physical resistance and motion dynamics.
 */
export interface PullPhysicsConfig {
  /**
   * Distance in pixels of raw drag needed to reach 100% completion (ready state).
   * @default 72
   */
  threshold?: number;

  /**
   * Maximum translation limit for screen content in pixels.
   * @default 120
   */
  maxPull?: number;

  /**
   * Exponential resistance factor. Higher values make stretching stiffer.
   * Formula: effectivePull = maxPull * (1 - exp(-rawPull / resistance))
   * @default 110
   */
  resistance?: number;

  /**
   * Spring bounciness for resting animations (0-20).
   * @default 8
   */
  springBounciness?: number;

  /**
   * Spring speed for resting animations (1-50).
   * @default 16
   */
  springSpeed?: number;

  /**
   * Height in pixels that the content rests at while in the `refreshing` state.
   * @default 64
   */
  refreshingRestHeight?: number;

  /**
   * Whether haptic feedback is enabled.
   * @default true
   */
  enableHaptics?: boolean;

  /**
   * Override reduced motion preference. If undefined, system preference is respected.
   */
  reducedMotion?: boolean;
}

/**
 * Props for the visual PullIndicator component.
 */
export interface PullIndicatorProps {
  /**
   * Current normalized progress (0.0 to 1.0).
   */
  progress: number;

  /**
   * Current state of the refresh state machine.
   */
  state: RefreshState;

  /**
   * Outer diameter of the circular indicator in pixels.
   * @default 28
   */
  size?: number;

  /**
   * Stroke width of the circular progress ring.
   * @default 2.8
   */
  strokeWidth?: number;

  /**
   * Primary accent color for progress and active states.
   */
  color?: string;

  /**
   * Color for the circular background track.
   */
  trackColor?: string;

  /**
   * Color for success state (completed).
   */
  successColor?: string;

  /**
   * Color for error state.
   */
  errorColor?: string;

  /**
   * Custom message to show in the pill badge, or boolean to toggle text visibility.
   * @default true
   */
  showLabel?: boolean;

  /**
   * Additional style for the indicator container.
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * Props for the main PullToRefresh wrapper component.
 */
export interface PullToRefreshProps extends PullPhysicsConfig {
  /**
   * Asynchronous callback triggered only when released from the `ready` state.
   */
  onRefresh: () => Promise<void> | void;

  /**
   * Controlled refreshing state (optional).
   */
  refreshing?: boolean;

  /**
   * Whether pull to refresh is enabled.
   * @default true
   */
  enabled?: boolean;

  /**
   * Optional callback when state machine state changes.
   */
  onStateChange?: (state: RefreshState) => void;

  /**
   * Custom render function or replacement for the pull indicator.
   */
  renderIndicator?: (props: PullIndicatorProps) => ReactNode;

  /**
   * Custom style for the wrapper container.
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * Child content (typically a ScrollView, FlatList, or custom list).
   */
  children: ReactNode;

  /**
   * Accessibility label for screen readers.
   * @default "Pull down to refresh"
   */
  accessibilityLabel?: string;
}
