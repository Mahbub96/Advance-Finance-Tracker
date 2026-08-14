import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FinanceProvider } from '../src/providers/finance-provider';

export default function RootLayout() {
  return (
    <FinanceProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="accounts" options={{ headerShown: true, title: 'Accounts' }} />
        <Stack.Screen name="budgets" options={{ headerShown: true, title: 'Budgets' }} />
        <Stack.Screen name="categories" options={{ headerShown: true, title: 'Categories' }} />
        <Stack.Screen name="recurring" options={{ headerShown: true, title: 'Recurring' }} />
      </Stack>
    </FinanceProvider>
  );
}
