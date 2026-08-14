import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTokens } from '../theme/tokens';

type Props = {
  progressPercent: number; // 0 to 100
  color?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

export function ProgressBar({ progressPercent, color, height = 8, style }: Props) {
  const { colors, radius } = useTokens();
  const clamped = Math.max(0, Math.min(100, isNaN(progressPercent) ? 0 : progressPercent));
  const fillColor = color ?? colors.primary;

  return (
    <View
      style={[
        {
          height,
          borderRadius: radius.pill,
          backgroundColor: colors.surfaceMuted,
          overflow: 'hidden',
          width: '100%',
        },
        style,
      ]}
    >
      <View
        style={{
          width: `${clamped}%`,
          height: '100%',
          borderRadius: radius.pill,
          backgroundColor: fillColor,
        }}
      />
    </View>
  );
}
