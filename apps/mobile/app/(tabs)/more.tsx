import { Link, type Href } from 'expo-router';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Badge } from '../../src/components/Badge';
import { Card } from '../../src/components/Card';
import { ScrollScreen } from '../../src/components/Screen';
import { useSettings } from '../../src/hooks/use-settings';
import { useTokens } from '../../src/theme/tokens';

function HubMenuItem({
  href,
  icon,
  title,
  subtitle,
  badge,
}: {
  href: Href;
  icon: string;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  const { colors, typography, spacing, radius } = useTokens();

  return (
    <Link href={href} asChild>
      <Pressable>
        {({ pressed }) => (
          <Card
            style={[
              styles.menuCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: colors.surfaceMuted,
                    borderRadius: radius.md,
                  },
                ]}
              >
                <Text style={{ fontSize: 20 }}>{icon}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Text
                    style={[typography.sectionTitle, { color: colors.textPrimary, fontSize: 16 }]}
                  >
                    {title}
                  </Text>
                  {badge && <Badge label={badge} size="sm" variant="primary" />}
                </View>
                <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 12 }]}>
                  {subtitle}
                </Text>
              </View>
              <Text style={{ color: colors.textTertiary, fontSize: 16 }}>→</Text>
            </View>
          </Card>
        )}
      </Pressable>
    </Link>
  );
}

export default function MoreScreen() {
  const { colors, typography, spacing } = useTokens();
  const { settings } = useSettings();

  return (
    <ScrollScreen>
      {/* Header */}
      <View style={{ gap: 2 }}>
        <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
          SYSTEM & MODULES
        </Text>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Management Hub</Text>
      </View>

      {/* System Status Card */}
      <Card style={{ backgroundColor: colors.surfaceSubtle, gap: spacing.xs }}>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Text style={[typography.captionMedium, { color: colors.textPrimary }]}>
            Base Currency: {settings?.baseCurrency ?? 'BDT'}
          </Text>
          <Badge label="Local SQLite" variant="neutral" dot />
        </View>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          Zero server dependencies required. All data resides privately on your device.
        </Text>
      </Card>

      {/* Intelligence & Analytics Hub */}
      <View style={{ gap: spacing.sm }}>
        <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
          AI & FORECASTING
        </Text>
        <HubMenuItem
          href="/intelligence"
          icon="⚡"
          title="Intelligence Hub"
          subtitle="Health score, velocity burn-rate & AI recommendations"
          badge="PRO"
        />
      </View>

      {/* Structure & Organization */}
      <View style={{ gap: spacing.sm }}>
        <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
          STRUCTURE & LIMITS
        </Text>
        <HubMenuItem
          href="/accounts"
          icon="🏦"
          title="Accounts & Wallets"
          subtitle="Manage cash, bank accounts, and mobile wallets"
        />
        <HubMenuItem
          href="/categories"
          icon="🏷️"
          title="Categories"
          subtitle="Income & expense taxonomy and classification"
        />
        <HubMenuItem
          href="/budgets"
          icon="🎯"
          title="Monthly Budgets"
          subtitle="Set spending thresholds & risk alerts"
        />
      </View>

      {/* Automation & Future Planning */}
      <View style={{ gap: spacing.sm }}>
        <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
          PLANNING & AUTOMATION
        </Text>
        <HubMenuItem
          href="/recurring"
          icon="🔁"
          title="Recurring Transactions"
          subtitle="Subscriptions, bills, and scheduled income"
        />
        <HubMenuItem
          href="/debts"
          icon="🤝"
          title="Lending & Borrowing"
          subtitle="Track money lent to friends and borrowed loans"
        />
        <HubMenuItem
          href="/goals"
          icon="🏆"
          title="Savings Goals"
          subtitle="Target milestones with automatic pace calculator"
        />
      </View>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  menuCard: {
    justifyContent: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
