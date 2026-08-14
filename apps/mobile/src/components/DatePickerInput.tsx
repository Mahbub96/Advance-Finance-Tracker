import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTokens } from '../theme/tokens';
import { Input } from './Input';

type Props = {
  label?: string;
  value: string;
  onChangeDate: (date: string) => void;
  error?: string | null;
  helperText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  allowFuture?: boolean;
  allowPast?: boolean;
};

export function DatePickerInput({
  label = 'Date',
  value,
  onChangeDate,
  error,
  helperText,
  containerStyle,
}: Props) {
  const { colors, radius, spacing, typography } = useTokens();

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const yesterday = useMemo(() => new Date(Date.now() - 86400000).toISOString().slice(0, 10), []);
  const endOfMonth = useMemo(() => {
    const d = new Date();
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  }, []);

  const shortcuts = [
    { label: 'Today', date: today },
    { label: 'Yesterday', date: yesterday },
    { label: 'End of Mo', date: endOfMonth },
  ];

  return (
    <View style={[{ gap: spacing.xs }, containerStyle]}>
      <Input
        label={label}
        value={value}
        onChangeText={onChangeDate}
        placeholder="YYYY-MM-DD"
        prefix="📅"
        error={error}
        helperText={helperText}
        keyboardType="numbers-and-punctuation"
        clearable
        onClear={() => onChangeDate(today)}
      />

      {/* Quick Date Shortcuts */}
      <View style={styles.chipRow}>
        {shortcuts.map((sc) => {
          const isSelected = value === sc.date;
          return (
            <Pressable
              key={sc.label}
              onPress={() => onChangeDate(sc.date)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surfaceMuted,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderRadius: radius.pill,
                },
              ]}
            >
              <Text
                style={[
                  typography.captionMedium,
                  {
                    color: isSelected ? colors.primaryForeground : colors.textSecondary,
                    fontSize: 11,
                  },
                ]}
              >
                {sc.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: -2,
  },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
});
