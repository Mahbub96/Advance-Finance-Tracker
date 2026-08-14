import { ScrollView, View, type ScrollViewProps, type ViewProps, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTokens } from '../theme/tokens';

type ScreenProps = ViewProps & {
  noPadding?: boolean;
};

export function Screen({ children, style, noPadding = false, ...rest }: ScreenProps) {
  const { colors, spacing } = useTokens();
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.container,
          {
            padding: noPadding ? 0 : spacing.lg,
            gap: spacing.lg,
          },
          style,
        ]}
        {...rest}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

type ScrollScreenProps = ScrollViewProps & {
  noPadding?: boolean;
};

export function ScrollScreen({
  children,
  contentContainerStyle,
  noPadding = false,
  ...rest
}: ScrollScreenProps) {
  const { colors, spacing } = useTokens();
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          {
            padding: noPadding ? 0 : spacing.lg,
            gap: spacing.lg,
            paddingBottom: spacing.xxxl,
          },
          contentContainerStyle,
        ]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        {...rest}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
