import { View, type ViewProps } from 'react-native';
import { useTokens } from '../theme/tokens';

export function Card({ style, ...rest }: ViewProps) {
  const { colors, radius, spacing } = useTokens();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
      {...rest}
    />
  );
}
