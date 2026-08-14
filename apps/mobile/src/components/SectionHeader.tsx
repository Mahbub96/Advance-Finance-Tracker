import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTokens } from '../theme/tokens';

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  badge?: string;
  style?: StyleProp<ViewStyle>;
};

export function SectionHeader({ title, actionLabel, onAction, badge, style }: Props) {
  const { colors, spacing, typography, radius } = useTokens();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
        <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
        {badge ? (
          <View
            style={{
              paddingHorizontal: spacing.sm,
              paddingVertical: 2,
              borderRadius: radius.pill,
              backgroundColor: colors.surfaceMuted,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textSecondary }}>
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} onPress={onAction}>
          <Text style={[typography.captionMedium, { color: colors.primary }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
