import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTokens } from '../theme/tokens';
import { Button } from './Button';

type Props = {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({
  icon = '📂',
  title,
  description,
  actionLabel,
  onAction,
  style,
}: Props) {
  const { colors, spacing, typography, radius } = useTokens();

  return (
    <View
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: spacing.xxl,
          paddingHorizontal: spacing.xl,
          borderRadius: radius.lg,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.borderLight,
          gap: spacing.sm,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.xs,
        }}
      >
        <Text style={{ fontSize: 26 }}>{icon}</Text>
      </View>
      <Text style={[typography.sectionTitle, { color: colors.textPrimary, textAlign: 'center' }]}>
        {title}
      </Text>
      {description && (
        <Text
          style={[
            typography.caption,
            { color: colors.textSecondary, textAlign: 'center', maxWidth: 280 },
          ]}
        >
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <View style={{ marginTop: spacing.md, width: '100%', maxWidth: 200 }}>
          <Button label={actionLabel} size="sm" onPress={onAction} />
        </View>
      )}
    </View>
  );
}
