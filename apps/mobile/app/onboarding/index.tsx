import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { useTokens } from '../../src/theme/tokens';

export default function WelcomeScreen() {
  const { colors, typography, spacing } = useTokens();
  const router = useRouter();

  return (
    <Screen>
      <Text style={[typography.display, { color: colors.textPrimary, marginTop: spacing.xxl }]}>
        Personal Finance
      </Text>
      <Text style={[typography.body, { color: colors.textSecondary }]}>
        Track money on this device. No account required.
      </Text>
      <Button label="Get started" onPress={() => router.push('/onboarding/currency')} />
    </Screen>
  );
}
