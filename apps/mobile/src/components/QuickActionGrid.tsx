import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTokens } from '../theme/tokens';

export type QuickActionItem = {
  id: string;
  icon: string;
  label: string;
  onPress: () => void;
  bgColor?: string;
};

export function QuickActionGrid({ customActions }: { customActions?: QuickActionItem[] }) {
  const { colors, typography, spacing, radius } = useTokens();
  const router = useRouter();

  const defaultActions: QuickActionItem[] = [
    {
      id: 'add-tx',
      icon: '➕',
      label: 'Add Record',
      onPress: () => router.push('/(tabs)/add'),
      bgColor: colors.primaryMuted,
    },
    {
      id: 'transfer',
      icon: '⇄',
      label: 'Transfer',
      onPress: () => router.push('/(tabs)/add'),
      bgColor: colors.transferMuted,
    },
    {
      id: 'budget',
      icon: '🎯',
      label: 'Budgets',
      onPress: () => router.push('/budgets'),
      bgColor: colors.warningMuted,
    },
    {
      id: 'goals',
      icon: '🏆',
      label: 'Goals',
      onPress: () => router.push('/goals'),
      bgColor: colors.incomeMuted,
    },
  ];

  const actions = customActions || defaultActions;

  return (
    <View style={[styles.container, { gap: spacing.sm }]}>
      {actions.map((act) => (
        <Pressable
          key={act.id}
          onPress={act.onPress}
          style={({ pressed }) => [
            styles.actionBtn,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.md,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: act.bgColor || colors.surfaceMuted,
                borderRadius: radius.pill,
              },
            ]}
          >
            <Text style={{ fontSize: 18 }}>{act.icon}</Text>
          </View>
          <Text
            style={[
              typography.captionMedium,
              { color: colors.textPrimary, fontSize: 12, textAlign: 'center' },
            ]}
            numberOfLines={1}
          >
            {act.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
  },
  iconCircle: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
