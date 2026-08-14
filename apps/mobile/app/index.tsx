import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useSettings } from '../src/hooks/use-settings';
import { useFinance } from '../src/providers/finance-provider';
import { useTokens } from '../src/theme/tokens';

export default function Index() {
  const { colors } = useTokens();
  useFinance();
  const { settings, ready } = useSettings();

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!settings || !settings.onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
