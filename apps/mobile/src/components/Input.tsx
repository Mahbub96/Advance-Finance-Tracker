import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useTokens } from '../theme/tokens';

type Props = TextInputProps & {
  label: string;
};

export function Input({ label, ...rest }: Props) {
  const { colors, radius, spacing, typography } = useTokens();

  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[typography.caption, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textTertiary}
        style={[
          styles.input,
          typography.body,
          {
            color: colors.textPrimary,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
          },
        ]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    minHeight: 44,
  },
});
