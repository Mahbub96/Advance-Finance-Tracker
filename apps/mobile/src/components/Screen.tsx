import { ScrollView, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTokens } from '../theme/tokens';

export function Screen({ children, ...rest }: ViewProps) {
  const { colors, spacing } = useTokens();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} {...rest}>
      <View style={{ flex: 1, padding: spacing.lg, gap: spacing.lg }}>{children}</View>
    </SafeAreaView>
  );
}

export function ScrollScreen({ children, ...rest }: ScrollViewProps) {
  const { colors, spacing } = useTokens();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl }}
        keyboardShouldPersistTaps="handled"
        {...rest}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
