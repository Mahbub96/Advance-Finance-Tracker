import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { FinanceProvider } from '../src/providers/finance-provider';
import { UndoDeleteProvider } from '../src/providers/undo-delete-provider';
import { ThemeProvider, useThemeContext } from '../src/theme/theme-context';

void SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore */
});

function NavigationStack() {
  const { isDark, colors } = useThemeContext();

  useEffect(() => {
    void SplashScreen.hideAsync().catch(() => {
      /* ignore */
    });
  }, []);
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="accounts" />
        <Stack.Screen name="budgets" />
        <Stack.Screen name="categories" />
        <Stack.Screen name="recurring" />
        <Stack.Screen name="debts" />
        <Stack.Screen name="goals" />
        <Stack.Screen name="intelligence" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <FinanceProvider>
        <UndoDeleteProvider>
          <NavigationStack />
        </UndoDeleteProvider>
      </FinanceProvider>
    </ThemeProvider>
  );
}
