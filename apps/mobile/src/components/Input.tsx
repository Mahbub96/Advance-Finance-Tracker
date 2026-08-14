import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTokens } from '../theme/tokens';

type Props = TextInputProps & {
  label: string;
  error?: string | null;
  helperText?: string;
  prefix?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function Input({
  label,
  error,
  helperText,
  prefix,
  containerStyle,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const { colors, radius, spacing, typography } = useTokens();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error ? colors.danger : isFocused ? colors.primary : colors.border;

  return (
    <View style={[{ gap: spacing.xs }, containerStyle]}>
      <Text
        style={[typography.captionMedium, { color: error ? colors.danger : colors.textSecondary }]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            borderWidth: isFocused ? 1.5 : 1,
          },
        ]}
      >
        {prefix ? (
          <Text
            style={[
              typography.bodyMedium,
              { color: colors.textSecondary, paddingLeft: spacing.md, paddingRight: spacing.xs },
            ]}
          >
            {prefix}
          </Text>
        ) : null}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.textTertiary}
          style={[
            styles.input,
            typography.body,
            {
              color: colors.textPrimary,
              paddingHorizontal: prefix ? spacing.xs : spacing.md,
              paddingVertical: spacing.md,
            },
          ]}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
      </View>
      {error ? (
        <Text style={[typography.caption, { color: colors.danger, fontSize: 12 }]}>{error}</Text>
      ) : helperText ? (
        <Text style={[typography.caption, { color: colors.textTertiary, fontSize: 12 }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  input: {
    flex: 1,
    height: '100%',
  },
});
