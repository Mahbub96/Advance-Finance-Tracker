import { Text, View, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import { useTokens } from '../theme/tokens';

export type BadgeVariant =
  'primary' | 'success' | 'danger' | 'warning' | 'info' | 'purple' | 'neutral';

type Props = {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Badge({
  label,
  variant = 'neutral',
  size = 'md',
  dot = false,
  style,
  textStyle,
}: Props) {
  const { colors, radius, spacing, typography } = useTokens();

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: colors.primaryMuted, text: colors.primary };
      case 'success':
        return { bg: colors.incomeMuted, text: colors.income };
      case 'danger':
        return { bg: colors.dangerMuted, text: colors.danger };
      case 'warning':
        return { bg: colors.warningMuted, text: colors.warning };
      case 'info':
        return { bg: colors.infoMuted, text: colors.info };
      case 'purple':
        return { bg: colors.accentPurpleMuted, text: colors.accentPurple };
      case 'neutral':
      default:
        return { bg: colors.surfaceMuted, text: colors.textSecondary };
    }
  };

  const { bg, text } = getColors();

  const isSmall = size === 'sm';
  const paddingVertical = isSmall ? 2 : spacing.xs;
  const paddingHorizontal = isSmall ? spacing.sm : spacing.md;
  const fontSize = isSmall ? 11 : 12;

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          backgroundColor: bg,
          borderRadius: radius.pill,
          paddingVertical,
          paddingHorizontal,
          gap: spacing.xs,
        },
        style,
      ]}
    >
      {dot && (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: text,
          }}
        />
      )}
      <Text
        style={[
          typography.micro,
          {
            color: text,
            fontSize,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}
