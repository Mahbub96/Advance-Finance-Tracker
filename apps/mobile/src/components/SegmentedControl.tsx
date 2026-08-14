import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTokens } from '../theme/tokens';

export type SegmentOption<T extends string> = {
  id: T;
  label: string;
  count?: number;
};

type Props<T extends string> = {
  options: Array<SegmentOption<T>>;
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
};

export function SegmentedControl<T extends string>({ options, value, onChange, style }: Props<T>) {
  const { colors, radius, spacing, typography } = useTokens();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          backgroundColor: colors.surfaceMuted,
          borderRadius: radius.md,
          padding: 3,
          gap: 2,
        },
        style,
      ]}
    >
      {options.map((option) => {
        const isSelected = value === option.id;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(option.id)}
            style={{
              flex: 1,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.sm,
              borderRadius: radius.sm,
              backgroundColor: isSelected ? colors.surface : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: spacing.xs,
              borderWidth: isSelected ? 1 : 0,
              borderColor: isSelected ? colors.border : 'transparent',
            }}
          >
            <Text
              style={[
                typography.captionMedium,
                {
                  color: isSelected ? colors.textPrimary : colors.textSecondary,
                  fontWeight: isSelected ? '600' : '400',
                },
              ]}
            >
              {option.label}
            </Text>
            {option.count !== undefined && (
              <View
                style={{
                  paddingHorizontal: 6,
                  paddingVertical: 1,
                  borderRadius: radius.pill,
                  backgroundColor: isSelected ? colors.primaryMuted : colors.surfaceMuted,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: isSelected ? colors.primary : colors.textTertiary,
                  }}
                >
                  {option.count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
