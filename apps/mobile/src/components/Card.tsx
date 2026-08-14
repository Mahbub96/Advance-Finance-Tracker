import { View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { useTokens } from '../theme/tokens';

type Props = ViewProps & {
  variant?: 'default' | 'elevated' | 'subtle' | 'outlined';
  style?: StyleProp<ViewStyle>;
};

export function Card({ variant = 'default', style, ...rest }: Props) {
  const { colors, radius, spacing } = useTokens();

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.surfaceElevated,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'subtle':
        return {
          backgroundColor: colors.surfaceSubtle,
          borderWidth: 1,
          borderColor: colors.borderLight,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.border,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
    }
  };

  return (
    <View
      style={[
        {
          borderRadius: radius.lg,
          padding: spacing.lg,
        },
        getVariantStyles(),
        style,
      ]}
      {...rest}
    />
  );
}
