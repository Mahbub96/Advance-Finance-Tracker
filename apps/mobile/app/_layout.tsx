import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FinanceProvider } from '../src/providers/finance-provider';
import { ThemeProvider, useThemeContext } from '../src/theme/theme-context';

function NavigationStack() {
  const { isDark, colors } = useThemeContext();
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
        <Stack.Screen name="accounts" options={{ headerShown: true, title: 'Accounts' }} />
        <Stack.Screen name="budgets" options={{ headerShown: true, title: 'Budgets' }} />
        <Stack.Screen name="categories" options={{ headerShown: true, title: 'Categories' }} />
        <Stack.Screen name="recurring" options={{ headerShown: true, title: 'Recurring' }} />
        <Stack.Screen name="debts" options={{ headerShown: true, title: 'Lending & Debts' }} />
        <Stack.Screen name="goals" options={{ headerShown: true, title: 'Goals' }} />
        <Stack.Screen name="intelligence" options={{ headerShown: true, title: 'AI Assistant' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <FinanceProvider>
        <NavigationStack />
      </FinanceProvider>
    </ThemeProvider>
  );
}
