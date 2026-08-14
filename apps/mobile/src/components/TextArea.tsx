import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTokens } from '../theme/tokens';

type Props = Omit<TextInputProps, 'multiline'> & {
  label: string;
  error?: string | null;
  helperText?: string;
  maxLength?: number;
  containerStyle?: StyleProp<ViewStyle>;
  clearable?: boolean;
  onClear?: () => void;
  minHeight?: number;
};

export function TextArea({
  label,
  error,
  helperText,
  maxLength,
  containerStyle,
  clearable,
  onClear,
  minHeight = 90,
  onFocus,
  onBlur,
  value = '',
  style,
  ...rest
}: Props) {
  const { colors, radius, spacing, typography } = useTokens();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error ? colors.danger : isFocused ? colors.primary : colors.border;
  const isShowClear = clearable && !!value && !rest.editable === false;
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <View style={[{ gap: spacing.xs }, containerStyle]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        {label ? (
          <Text
            style={[
              typography.captionMedium,
              { color: error ? colors.danger : colors.textSecondary },
            ]}
          >
            {label}
          </Text>
        ) : (
          <View />
        )}

        {maxLength ? (
          <Text
            style={[
              typography.micro,
              { color: currentLength > maxLength ? colors.danger : colors.textTertiary },
            ]}
          >
            {currentLength}/{maxLength}
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.container,
          {
            borderColor,
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            borderWidth: isFocused ? 1.5 : 1,
            minHeight,
            padding: spacing.sm,
          },
        ]}
      >
        <TextInput
          accessibilityLabel={label || undefined}
          accessibilityRole="text"
          placeholderTextColor={colors.textTertiary}
          value={value}
          multiline
          maxLength={maxLength}
          textAlignVertical="top"
          style={[
            styles.textInput,
            typography.body,
            {
              color: colors.textPrimary,
              minHeight: minHeight - 16,
            },
            style,
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

        {isShowClear ? (
          <Pressable
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={onClear}
            style={styles.clearBtn}
          >
            <Text style={{ color: colors.textTertiary, fontSize: 13 }}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <Text style={{ fontSize: 12 }}>⚠️</Text>
          <Text style={[typography.caption, { color: colors.danger, fontSize: 12 }]}>{error}</Text>
        </View>
      ) : helperText ? (
        <Text
          style={[typography.caption, { color: colors.textTertiary, fontSize: 12, marginTop: 2 }]}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  textInput: {
    padding: 0,
  },
  clearBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
});
