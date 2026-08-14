import {
  calculateElasticPull,
  calculateProgress,
  DEFAULT_THRESHOLD,
  DEFAULT_MAX_PULL,
  DEFAULT_RESISTANCE,
} from './physics';
import type { RefreshState } from './types';

// Pure State Machine Controller representing the core logic of usePullToRefresh
class PullToRefreshStateMachine {
  public state: RefreshState = 'idle';
  public progress: number = 0;
  public pullDistance: number = 0;
  public isRefreshing: boolean = false;
  private isReadyToTrigger: boolean = false;
  private onRefresh: () => Promise<void> | void;
  private threshold: number;
  private maxPull: number;
  private resistance: number;

  constructor(options: {
    onRefresh: () => Promise<void> | void;
    threshold?: number;
    maxPull?: number;
    resistance?: number;
  }) {
    this.onRefresh = options.onRefresh;
    this.threshold = options.threshold ?? DEFAULT_THRESHOLD;
    this.maxPull = options.maxPull ?? DEFAULT_MAX_PULL;
    this.resistance = options.resistance ?? DEFAULT_RESISTANCE;
  }

  public onScroll(offsetY: number) {
    if (this.isRefreshing) return;

    if (offsetY < 0) {
      const rawPull = Math.abs(offsetY);
      this.pullDistance = calculateElasticPull(rawPull, this.maxPull, this.resistance);
      this.progress = calculateProgress(rawPull, this.threshold);

      if (this.progress >= 1.0) {
        this.isReadyToTrigger = true;
        this.state = 'ready';
      } else {
        this.isReadyToTrigger = false;
        this.state = 'pulling';
      }
    } else if (offsetY >= 0 && this.state !== 'refreshing' && this.state !== 'completed' && this.state !== 'error') {
      if (this.state !== 'idle') {
        this.state = 'idle';
        this.progress = 0;
        this.pullDistance = 0;
        this.isReadyToTrigger = false;
      }
    }
  }

  public async onScrollEndDrag() {
    if (this.isRefreshing) return;

    // CRITICAL: Only reload if 100% threshold was reached
    if (this.isReadyToTrigger && this.progress >= 1.0) {
      this.state = 'refreshing';
      this.isRefreshing = true;

      try {
        await this.onRefresh();
        this.state = 'completed';
      } catch {
        this.state = 'error';
      } finally {
        this.isRefreshing = false;
        this.state = 'idle';
        this.progress = 0;
        this.pullDistance = 0;
        this.isReadyToTrigger = false;
      }
    } else {
      // Released before threshold -> NO REFRESH
      this.state = 'cancelled';
      this.progress = 0;
      this.pullDistance = 0;
      this.isReadyToTrigger = false;
      this.state = 'idle';
    }
  }

  public triggerManualRefresh() {
    if (this.isRefreshing) return;
    this.isReadyToTrigger = true;
    this.progress = 1.0;
    return this.onScrollEndDrag();
  }
}

describe('PullToRefresh State Machine Transitions', () => {
  it('starts in idle with 0 progress and 0 pull distance', () => {
    const onRefresh = jest.fn();
    const sm = new PullToRefreshStateMachine({ onRefresh, threshold: 72 });

    expect(sm.state).toBe('idle');
    expect(sm.progress).toBe(0);
    expect(sm.pullDistance).toBe(0);
    expect(sm.isRefreshing).toBe(false);
  });

  it('transitions to pulling when dragged downward below threshold', () => {
    const onRefresh = jest.fn();
    const sm = new PullToRefreshStateMachine({ onRefresh, threshold: 72 });

    sm.onScroll(-36);

    expect(sm.state).toBe('pulling');
    expect(sm.progress).toBeCloseTo(0.5, 2);
    expect(sm.pullDistance).toBeGreaterThan(0);
  });

  it('transitions to ready when dragged at or beyond threshold', () => {
    const onRefresh = jest.fn();
    const sm = new PullToRefreshStateMachine({ onRefresh, threshold: 72 });

    sm.onScroll(-72);

    expect(sm.state).toBe('ready');
    expect(sm.progress).toBe(1);

    sm.onScroll(-100);
    expect(sm.state).toBe('ready');
    expect(sm.progress).toBe(1);
  });

  it('transitions back to pulling if user retreats back above threshold before release', () => {
    const onRefresh = jest.fn();
    const sm = new PullToRefreshStateMachine({ onRefresh, threshold: 72 });

    sm.onScroll(-80);
    expect(sm.state).toBe('ready');

    sm.onScroll(-30);
    expect(sm.state).toBe('pulling');
    expect(sm.progress).toBeLessThan(1);
  });

  it('CRITICAL RULE: Releasing before threshold cancels without triggering onRefresh', async () => {
    const onRefresh = jest.fn().mockResolvedValue(undefined);
    const sm = new PullToRefreshStateMachine({ onRefresh, threshold: 72 });

    sm.onScroll(-40); // 55% pull
    expect(sm.state).toBe('pulling');

    await sm.onScrollEndDrag();

    expect(onRefresh).not.toHaveBeenCalled();
    expect(sm.state).toBe('idle');
    expect(sm.progress).toBe(0);
  });

  it('CRITICAL RULE: Releasing at or above threshold executes onRefresh exactly once', async () => {
    const onRefresh = jest.fn().mockResolvedValue(undefined);
    const sm = new PullToRefreshStateMachine({ onRefresh, threshold: 72 });

    sm.onScroll(-75);
    expect(sm.state).toBe('ready');

    await sm.onScrollEndDrag();

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(sm.state).toBe('idle');
  });

  it('recovers gracefully to idle on refresh error without getting stuck', async () => {
    const onRefresh = jest.fn().mockRejectedValue(new Error('Network error'));
    const sm = new PullToRefreshStateMachine({ onRefresh, threshold: 72 });

    sm.onScroll(-80);
    expect(sm.state).toBe('ready');

    await sm.onScrollEndDrag();

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(sm.state).toBe('idle');
    expect(sm.isRefreshing).toBe(false);
  });

  it('prevents duplicate concurrent onRefresh executions', async () => {
    let resolveRefresh: () => void = () => {};
    const refreshPromise = new Promise<void>((resolve) => {
      resolveRefresh = resolve;
    });
    const onRefresh = jest.fn().mockReturnValue(refreshPromise);
    const sm = new PullToRefreshStateMachine({ onRefresh, threshold: 72 });

    sm.onScroll(-75);
    const firstExecution = sm.onScrollEndDrag();

    expect(onRefresh).toHaveBeenCalledTimes(1);

    // Attempt second scroll and trigger while still in flight
    sm.onScroll(-90);
    await sm.onScrollEndDrag();
    sm.triggerManualRefresh();

    expect(onRefresh).toHaveBeenCalledTimes(1);

    resolveRefresh();
    await firstExecution;
  });
});
