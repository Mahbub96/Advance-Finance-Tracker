import { useCallback } from 'react';
import {
  ScrollView,
  View,
  type ScrollViewProps,
  type ViewProps,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFinance } from '../providers/finance-provider';
import { useTokens } from '../theme/tokens';
import { PullToRefresh } from './pull-to-refresh';

type ScreenProps = ViewProps & {
  noPadding?: boolean;
};

export function Screen({ children, style, noPadding = false, ...rest }: ScreenProps) {
  const { colors, spacing } = useTokens();
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={StyleSheet.flatten([styles.container, { backgroundColor: colors.background }])}
    >
      <View
        style={StyleSheet.flatten([
          styles.container,
          {
            padding: noPadding ? 0 : spacing.lg,
            gap: spacing.lg,
          },
          style,
        ])}
        {...rest}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

type ScrollScreenProps = ScrollViewProps & {
  noPadding?: boolean;
  onRefresh?: () => Promise<void> | void;
  refreshing?: boolean;
  enablePullToRefresh?: boolean;
};

export function ScrollScreen({
  children,
  contentContainerStyle,
  noPadding = false,
  style,
  onRefresh,
  refreshing,
  enablePullToRefresh = true,
  ...rest
}: ScrollScreenProps) {
  const { colors, spacing } = useTokens();
  const finance = useFinance();

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      await onRefresh();
    } else {
      // Re-query local SQLite tables & sync with API
      finance.refresh();
      await finance.syncWithApi();
    }
  }, [onRefresh, finance]);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={StyleSheet.flatten([styles.container, { backgroundColor: colors.background }, style])}
    >
      <PullToRefresh
        enabled={enablePullToRefresh}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      >
        <ScrollView
          contentContainerStyle={StyleSheet.flatten([
            {
              padding: noPadding ? 0 : spacing.lg,
              gap: spacing.lg,
              paddingBottom: spacing.xxxl,
            },
            contentContainerStyle,
          ])}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...rest}
        >
          {children}
        </ScrollView>
      </PullToRefresh>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
