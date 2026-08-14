import React, { type ReactNode } from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { useTokens } from '../theme/tokens';

export function GradientCard({
  children,
  style,
  accent = false,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accent?: boolean;
}) {
  const { colors, radius, spacing } = useTokens();

  const startBg = accent
    ? colors.primaryDark || colors.primary
    : colors.gradientStart || colors.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: startBg,
          borderRadius: radius.xl,
          padding: spacing.lg,
          shadowColor: colors.primary,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
});
