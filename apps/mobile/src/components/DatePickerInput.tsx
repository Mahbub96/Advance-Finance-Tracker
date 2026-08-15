import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTokens } from '../theme/tokens';
import {
  formatDateForDisplay,
  isoDateToUtcDate,
  utcDateToIsoDate,
  validateIsoDate,
} from '../lib/form-validation';

type Shortcut = {
  label: string;
  date: string;
};

type Props = {
  label?: string;
  value: string;
  onChangeDate: (date: string) => void;
  error?: string | null;
  helperText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  minDate?: string;
  maxDate?: string;
  optional?: boolean;
  shortcuts?: Shortcut[];
};

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayIsoDate(): string {
  return new Date(Date.now() - 86400000).toISOString().slice(0, 10);
}

function endOfMonthIsoDate(): string {
  const d = new Date();
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

export function DatePickerInput({
  label = 'Date',
  value,
  onChangeDate,
  error,
  helperText,
  containerStyle,
  minDate,
  maxDate,
  optional,
  shortcuts,
}: Props) {
  const { colors, radius, spacing, typography } = useTokens();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const normalizedValue = value.trim();
  const selectedDate = isoDateToUtcDate(normalizedValue || todayIsoDate());
  const minimumDate = minDate ? isoDateToUtcDate(minDate) : undefined;
  const maximumDate = maxDate ? isoDateToUtcDate(maxDate) : undefined;

  const defaultShortcuts = useMemo<Shortcut[]>(
    () => [
      { label: 'Today', date: todayIsoDate() },
      { label: 'Yesterday', date: yesterdayIsoDate() },
      { label: 'End of Mo', date: endOfMonthIsoDate() },
    ],
    [],
  );

  const activeShortcuts = (shortcuts ?? defaultShortcuts).filter(
    (shortcut) =>
      validateIsoDate(shortcut.date, { min: minDate, max: maxDate, required: true }).valid,
  );

  const handlePickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setIsPickerOpen(false);
    }

    if (event.type === 'dismissed' || !date) return;
    onChangeDate(utcDateToIsoDate(date));
  };

  const fieldBorderColor = error ? colors.danger : isPickerOpen ? colors.primary : colors.border;
  const displayValue = normalizedValue ? formatDateForDisplay(normalizedValue) : 'Select date';

  return (
    <View style={[{ gap: spacing.xs }, containerStyle]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text
          style={[
            typography.captionMedium,
            { color: error ? colors.danger : colors.textSecondary },
          ]}
        >
          {label}
        </Text>
        {optional && normalizedValue ? (
          <Pressable
            accessibilityLabel={`Clear ${label}`}
            accessibilityRole="button"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={() => onChangeDate('')}
          >
            <Text style={[typography.captionMedium, { color: colors.primary }]}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={() => setIsPickerOpen(true)}
        style={({ pressed }) => [
          styles.field,
          {
            backgroundColor: pressed ? colors.surfaceSubtle : colors.surface,
            borderColor: fieldBorderColor,
            borderRadius: radius.md,
            borderWidth: isPickerOpen ? 1.5 : 1,
          },
        ]}
      >
        <Text style={[typography.bodyMedium, { color: isPickerOpen ? colors.primary : colors.textSecondary }]}>
          📅
        </Text>
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={[
              typography.body,
              { color: normalizedValue ? colors.textPrimary : colors.textTertiary },
            ]}
          >
            {displayValue}
          </Text>
          {normalizedValue ? (
            <Text style={[typography.caption, { color: colors.textTertiary, fontSize: 11 }]}>
              {normalizedValue}
            </Text>
          ) : null}
        </View>
        <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>Change</Text>
      </Pressable>

      {isPickerOpen ? (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handlePickerChange}
        />
      ) : null}

      {activeShortcuts.length > 0 ? (
        <View style={styles.chipRow}>
          {activeShortcuts.map((shortcut) => {
            const isSelected = normalizedValue === shortcut.date;
            return (
              <Pressable
                key={`${shortcut.label}-${shortcut.date}`}
                onPress={() => onChangeDate(shortcut.date)}
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
                  {shortcut.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

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
  field: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: -2,
  },
  chip: {
    borderWidth: 1,
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
});
