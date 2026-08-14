import { useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { useTokens } from '../../src/theme/tokens';

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  const { colors, typography, spacing, radius } = useTokens();
  return (
    <View style={[styles.featureRow, { gap: spacing.md }]}>
      <View
        style={[
          styles.featureIcon,
          {
            backgroundColor: colors.surfaceMuted,
            borderRadius: radius.md,
          },
        ]}
      >
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[typography.sectionTitle, { color: colors.textPrimary, fontSize: 15 }]}>
          {title}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 13 }]}>
          {description}
        </Text>
      </View>
    </View>
  );
}

export default function WelcomeScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const router = useRouter();

  return (
    <Screen style={{ justifyContent: 'space-between', paddingVertical: spacing.xl }}>
      {/* Brand Hero */}
      <View style={{ alignItems: 'center', marginTop: spacing.lg, gap: spacing.sm }}>
        <View
          style={[
            styles.logoContainer,
            {
              backgroundColor: colors.primary,
              borderRadius: radius.xl,
              shadowColor: colors.primary,
            },
          ]}
        >
          <Text style={{ fontSize: 42 }}>👛</Text>
        </View>

        <Text
          style={[
            typography.display,
            { color: colors.textPrimary, fontSize: 32, marginTop: spacing.xs },
          ]}
        >
          FinTrack
        </Text>
        <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center' }]}>
          Take control of your money
        </Text>
        <Text style={[typography.captionMedium, { color: colors.primary, letterSpacing: 1.5 }]}>
          TRACK • PLAN • SAVE • GROW
        </Text>
      </View>

      {/* Feature Highlights Grid */}
      <View style={{ gap: spacing.md, paddingHorizontal: spacing.xs }}>
        <FeatureItem
          icon="⚡"
          title="Offline First"
          description="Works 100% without internet. Your data is always safe."
        />
        <FeatureItem
          icon="🛡️"
          title="Secure & Private"
          description="Bank-level local encryption directly on your device."
        />
        <FeatureItem
          icon="🤖"
          title="AI-Powered Insights"
          description="Smart advice, spending velocity and health scoring."
        />
        <FeatureItem
          icon="🎯"
          title="All-In-One Toolkit"
          description="Budgets, recurring bills, debts, and savings goals."
        />
      </View>

      {/* Action CTA */}
      <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
        <Button label="Get Started" size="lg" onPress={() => router.push('/onboarding/currency')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
