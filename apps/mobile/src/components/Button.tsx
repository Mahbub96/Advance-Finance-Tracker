import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTokens } from '../theme/tokens';

type Props = PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  disabled,
  loading = false,
  style,
  textStyle,
  ...rest
}: Props) {
  const { colors, radius, spacing, typography } = useTokens();

  const getVariantStyles = (): { bg: string; text: string; border?: string } => {
    switch (variant) {
      case 'secondary':
        return {
          bg: colors.surfaceMuted,
          text: colors.textPrimary,
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: colors.primary,
          border: colors.border,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          text: colors.textSecondary,
        };
      case 'danger':
        return {
          bg: colors.danger,
          text: '#FFFFFF',
        };
      case 'primary':
      default:
        return {
          bg: colors.primary,
          text: colors.primaryForeground,
        };
    }
  };

  const { bg, text, border } = getVariantStyles();

  const paddingVertical = size === 'sm' ? spacing.xs + 2 : size === 'lg' ? spacing.lg : spacing.md;
  const paddingHorizontal = size === 'sm' ? spacing.md : size === 'lg' ? spacing.xl : spacing.lg;
  const minHeight = size === 'sm' ? 36 : size === 'lg' ? 52 : 48;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderRadius: radius.md,
          paddingVertical,
          paddingHorizontal,
          minHeight,
          borderWidth: border ? 1.5 : 0,
          borderColor: border ?? 'transparent',
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={text} />
      ) : (
        <Text
          style={[
            typography.button,
            {
              color: text,
              fontSize: size === 'sm' ? 13 : size === 'lg' ? 17 : 15,
            },
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
