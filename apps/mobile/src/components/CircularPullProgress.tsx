import { PullIndicator } from './pull-to-refresh/PullIndicator';
import type { RefreshState } from './pull-to-refresh/types';

interface CircularPullProgressProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color: string;
  trackColor: string;
  isSyncing?: boolean;
  isSuccess?: boolean;
  isReady?: boolean;
}

/**
 * Backward compatibility wrapper for CircularPullProgress pointing to the modernized PullIndicator.
 */
export function CircularPullProgress({
  progress,
  size = 28,
  strokeWidth = 2.8,
  color,
  trackColor,
  isSyncing = false,
  isSuccess = false,
  isReady = false,
}: CircularPullProgressProps) {
  let state: RefreshState = 'pulling';
  if (isSyncing) state = 'refreshing';
  else if (isSuccess) state = 'completed';
  else if (isReady) state = 'ready';
  else if (progress <= 0) state = 'idle';

  return (
    <PullIndicator
      progress={progress}
      state={state}
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      trackColor={trackColor}
      showLabel={false}
    />
  );
}
