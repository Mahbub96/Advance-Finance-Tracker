import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Screen } from '../../src/components/Screen';
import { useTokens } from '../../src/theme/tokens';

const CURRENCIES = [
  { code: 'BDT', symbol: '৳', label: 'Bangladeshi Taka' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
];

export default function CurrencyScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const router = useRouter();
  const [currency, setCurrency] = useState('BDT');
  const [name, setName] = useState('Ahmed');

  return (
    <Screen style={{ justifyContent: 'space-between', paddingVertical: spacing.lg }}>
      <View style={{ gap: spacing.lg }}>
        {/* Header */}
        <View style={{ gap: spacing.xs }}>
          <Text style={[typography.title, { color: colors.textPrimary, fontSize: 24 }]}>
            Personalize Your Experience
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            Set your preferred display name and base currency.
          </Text>
        </View>

        {/* Name input */}
        <Input label="Your Name" placeholder="e.g. Ahmed" value={name} onChangeText={setName} />

        {/* Currency selection list */}
        <View style={{ gap: spacing.xs }}>
          <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
            Base Currency
          </Text>
          <View style={{ gap: spacing.sm }}>
            {CURRENCIES.map((c) => {
              const isSelected = currency === c.code;
              return (
                <Pressable
                  key={c.code}
                  onPress={() => setCurrency(c.code)}
                  style={[
                    styles.currencyRow,
                    {
                      backgroundColor: isSelected ? colors.primaryMuted : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: radius.md,
                      padding: spacing.md,
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <View
                      style={[
                        styles.symbolCircle,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surfaceMuted,
                          borderRadius: radius.pill,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: isSelected ? colors.primaryForeground : colors.textPrimary,
                          fontSize: 16,
                          fontWeight: '700',
                        }}
                      >
                        {c.symbol}
                      </Text>
                    </View>
                    <View style={{ gap: 2 }}>
                      <Text
                        style={[
                          typography.sectionTitle,
                          { color: colors.textPrimary, fontSize: 15 },
                        ]}
                      >
                        {c.code}
                      </Text>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        {c.label}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      color: isSelected ? colors.primary : colors.textTertiary,
                      fontWeight: '700',
                    }}
                  >
                    {isSelected ? '✓' : ''}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <Button
        label="Continue to Account Setup →"
        size="lg"
        onPress={() =>
          router.push({
            pathname: '/onboarding/account',
            params: { currency, displayName: name.trim() || 'Ahmed' },
          })
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
  },
  symbolCircle: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
