import { Pressable, Text, type PressableProps, StyleSheet } from 'react-native';
import { useTokens } from '../theme/tokens';

type Props = PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
};

export function Button({ label, variant = 'primary', disabled, ...rest }: Props) {
  const { colors, radius, spacing, typography } = useTokens();
  const background =
    variant === 'danger'
      ? colors.danger
      : variant === 'secondary'
        ? colors.surfaceMuted
        : colors.primary;
  const color = variant === 'secondary' ? colors.textPrimary : colors.primaryForeground;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={[
        styles.base,
        {
          backgroundColor: background,
          borderRadius: radius.md,
          paddingVertical: spacing.md,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      {...rest}
    >
      <Text style={[typography.button, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
});
