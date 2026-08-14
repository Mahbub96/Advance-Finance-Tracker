import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTokens } from '../theme/tokens';
import { Card } from './Card';

type Props = {
  label: string;
  value: string;
  subtitle?: string;
  indicatorColor?: string;
  icon?: string;
  style?: StyleProp<ViewStyle>;
};

export function StatCard({ label, value, subtitle, indicatorColor, icon, style }: Props) {
  const { colors, spacing, typography, radius } = useTokens();

  return (
    <Card style={[{ gap: spacing.xs, flex: 1 }, style]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>{label}</Text>
        {icon ? (
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: radius.sm,
              backgroundColor: colors.surfaceMuted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 14 }}>{icon}</Text>
          </View>
        ) : null}
      </View>
      <Text
        style={[
          typography.numericMedium,
          { color: indicatorColor ?? colors.textPrimary, fontSize: 19 },
        ]}
      >
        {value}
      </Text>
      {subtitle ? (
        <Text style={[typography.caption, { color: colors.textTertiary, fontSize: 11 }]}>
          {subtitle}
        </Text>
      ) : null}
    </Card>
  );
}
