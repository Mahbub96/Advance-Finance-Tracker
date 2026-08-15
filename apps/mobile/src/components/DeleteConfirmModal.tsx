import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTokens } from '../theme/tokens';

export interface DeleteConfirmModalProps {
  /** Controls visibility */
  visible: boolean;
  /** Bold heading shown at top, e.g. "Delete Transaction?" */
  title: string;
  /** One or two sentence body, e.g. "This will permanently remove 'Groceries – ৳500' from your records." */
  message: string;
  /** Label on the destructive button. Defaults to "Delete". */
  deleteLabel?: string;
  /** Called when the user taps the destructive button */
  onConfirm: () => void;
  /** Called when the user taps Cancel or the backdrop */
  onCancel: () => void;
  /** When true the delete button shows a loading state */
  loading?: boolean;
  /** Optional safety note shown above the action buttons. */
  noticeText?: string;
}

/**
 * DeleteConfirmModal
 *
 * A single, consistent danger-confirmation sheet used for every soft-delete
 * across the app. Never reuse native Alert for deletion — always use this.
 *
 * Usage:
 *   <DeleteConfirmModal
 *     visible={showConfirm}
 *     title="Delete Transaction?"
 *     message="This will remove the ৳500 Groceries entry. You can restore it later."
 *     onConfirm={handleDelete}
 *     onCancel={() => setShowConfirm(false)}
 *   />
 */
export function DeleteConfirmModal({
  visible,
  title,
  message,
  deleteLabel = 'Delete',
  onConfirm,
  onCancel,
  loading = false,
  noticeText = '🔒 Soft delete — data can be recovered',
}: DeleteConfirmModalProps) {
  const { colors, radius } = useTokens();

  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          speed: 28,
          bounciness: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.88);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              borderRadius: radius.xl,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
          // Stop backdrop tap from bubbling through the sheet
          onStartShouldSetResponder={() => true}
        >
          {/* Danger icon badge */}
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: colors.dangerMuted },
            ]}
          >
            <Text style={styles.iconEmoji}>🗑️</Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>

          {/* Message */}
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

          {/* Soft-delete notice */}
          <View
            style={[
              styles.noticePill,
              { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.noticeText, { color: colors.textTertiary }]}>
              {noticeText}
            </Text>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Action buttons */}
          <View style={styles.buttonRow}>
            {/* Cancel — safe action, always left */}
            <Pressable
              onPress={onCancel}
              style={[
                styles.btn,
                styles.btnCancel,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Cancel deletion"
            >
              <Text style={[styles.btnText, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>

            {/* Delete — destructive, always right */}
            <Pressable
              onPress={loading ? undefined : onConfirm}
              style={[
                styles.btn,
                styles.btnDelete,
                {
                  backgroundColor: loading ? colors.dangerMuted : colors.danger,
                  opacity: loading ? 0.75 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={deleteLabel}
            >
              <Text style={[styles.btnText, { color: '#FFFFFF' }]}>
                {loading ? 'Deleting…' : deleteLabel}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    padding: 24,
    gap: 12,
    borderWidth: 1,
    boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconEmoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '400',
  },
  noticePill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    marginTop: 2,
  },
  noticeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnCancel: {
    borderWidth: 1,
  },
  btnDelete: {
    borderWidth: 0,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
