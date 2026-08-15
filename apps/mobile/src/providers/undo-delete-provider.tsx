import React, { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTokens } from '../theme/tokens';

export interface PendingDeleteAction {
  id: string;
  message: string;
  onExecute: () => Promise<void> | void;
  onUndo?: () => void;
  durationMs?: number;
}

interface UndoDeleteContextValue {
  /** Schedule a deletion with a 3-second undo grace period */
  scheduleDelete: (action: PendingDeleteAction) => void;
  /** Check if a specific item ID is currently pending deletion */
  isPendingDelete: (id: string) => boolean;
  /** Immediately cancel any pending deletion */
  undo: () => void;
}

const UndoDeleteContext = createContext<UndoDeleteContextValue | null>(null);

export function UndoDeleteProvider({ children }: { children: ReactNode }) {
  const { colors, radius, typography } = useTokens();
  const [activeAction, setActiveAction] = useState<PendingDeleteAction | null>(null);
  const [undoStatus, setUndoStatus] = useState<'ACTIVE' | 'UNDONE' | 'EXECUTED'>('ACTIVE');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const clearCurrentTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const scheduleDelete = (action: PendingDeleteAction) => {
    // If there is an existing pending delete, execute it first immediately
    if (activeAction && timerRef.current) {
      clearCurrentTimer();
      void activeAction.onExecute();
    }

    const duration = action.durationMs ?? 3000;
    setActiveAction(action);
    setUndoStatus('ACTIVE');

    // Reset animations
    progressAnim.setValue(1);
    slideAnim.setValue(60);
    opacityAnim.setValue(0);

    // Slide in toast
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // Shrink progress bar over 3 seconds
    Animated.timing(progressAnim, {
      toValue: 0,
      duration,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    // Schedule actual soft-delete execution after 3 seconds
    timerRef.current = setTimeout(async () => {
      setUndoStatus('EXECUTED');
      try {
        await action.onExecute();
      } finally {
        dismissToast();
      }
    }, duration);
  };

  const handleUndo = () => {
    if (!activeAction || undoStatus !== 'ACTIVE') return;
    clearCurrentTimer();
    setUndoStatus('UNDONE');
    progressAnim.stopAnimation();

    if (activeAction.onUndo) {
      activeAction.onUndo();
    }

    setTimeout(() => {
      dismissToast();
    }, 900);
  };

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 60,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveAction(null);
    });
  };

  const isPendingDelete = (id: string) => {
    return activeAction?.id === id && undoStatus === 'ACTIVE';
  };

  useEffect(() => {
    return () => {
      clearCurrentTimer();
    };
  }, []);

  return (
    <UndoDeleteContext.Provider value={{ scheduleDelete, isPendingDelete, undo: handleUndo }}>
      {children}

      {/* Floating 3-Second Undo Toast */}
      {activeAction && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              backgroundColor: '#1E293B',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: radius.lg,
              transform: [{ translateY: slideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.contentRow}>
            <View style={styles.textWrap}>
              <Text style={{ fontSize: 16 }}>
                {undoStatus === 'UNDONE' ? '↩️' : undoStatus === 'EXECUTED' ? '🗑️' : '⏳'}
              </Text>
              <Text style={[typography.captionMedium, { color: '#F8FAFC', flex: 1 }]} numberOfLines={1}>
                {undoStatus === 'UNDONE'
                  ? 'Deletion cancelled'
                  : undoStatus === 'EXECUTED'
                    ? 'Deleted'
                    : activeAction.message}
              </Text>
            </View>

            {undoStatus === 'ACTIVE' && (
              <Pressable
                onPress={handleUndo}
                style={({ pressed }) => [
                  styles.undoButton,
                  {
                    backgroundColor: pressed ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.18)',
                    borderRadius: radius.md,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Undo delete"
              >
                <Text style={styles.undoText}>Undo</Text>
              </Pressable>
            )}
          </View>

          {/* 3-Second Countdown Progress Bar */}
          {undoStatus === 'ACTIVE' && (
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
          )}
        </Animated.View>
      )}
    </UndoDeleteContext.Provider>
  );
}

export function useUndoDelete() {
  const ctx = useContext(UndoDeleteContext);
  if (!ctx) {
    throw new Error('useUndoDelete must be used within an UndoDeleteProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 96,
    left: 16,
    right: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 24,
    zIndex: 9999,
    overflow: 'hidden',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  textWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  undoButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  undoText: {
    color: '#60A5FA',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  progressTrack: {
    height: 3,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressBar: {
    height: '100%',
  },
});
