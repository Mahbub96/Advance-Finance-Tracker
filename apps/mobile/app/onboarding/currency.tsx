import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { useTokens } from '../../src/theme/tokens';

const CURRENCIES = ['BDT', 'USD', 'EUR', 'INR', 'GBP'];

export default function CurrencyScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const router = useRouter();
  const [currency, setCurrency] = useState('BDT');

  return (
    <Screen>
      <Text style={[typography.title, { color: colors.textPrimary }]}>Base currency</Text>
      <Text style={[typography.body, { color: colors.textSecondary }]}>
        Used for totals on Home. You can change this later.
      </Text>
      <View style={{ gap: spacing.sm }}>
        {CURRENCIES.map((code) => (
          <Pressable
            key={code}
            onPress={() => setCurrency(code)}
            style={{
              padding: spacing.md,
              borderRadius: radius.md,
              backgroundColor: currency === code ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                color: currency === code ? colors.primaryForeground : colors.textPrimary,
                fontWeight: '600',
              }}
            >
              {code}
            </Text>
          </Pressable>
        ))}
      </View>
      <Button
        label="Continue"
        onPress={() => router.push({ pathname: '/onboarding/account', params: { currency } })}
      />
    </Screen>
  );
}
