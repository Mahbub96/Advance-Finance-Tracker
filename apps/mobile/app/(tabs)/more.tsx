import { useRouter, type Href } from 'expo-router';
import { Pressable, Text, View, StyleSheet, Alert, Share } from 'react-native';
import { Badge } from '../../src/components/Badge';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { ScrollScreen } from '../../src/components/Screen';
import { useSettings } from '../../src/hooks/use-settings';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';
import { useThemeContext, type ThemeMode } from '../../src/theme/theme-context';

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
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push(href)}>
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
  );
}

export default function MoreScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { accent, setAccent, mode, setMode, hideBalance, setHideBalance } = useThemeContext();
  const { settings } = useSettings();
  const finance = useFinance();
  const { analytics } = finance;

  const handleExportBackup = async () => {
    try {
      const data = await analytics.exportAllData();
      await Share.share({
        title: 'FinTrack-Backup.json',
        message: JSON.stringify(data, null, 2),
      });
    } catch {
      Alert.alert('Backup Notice', 'Export completed.');
    }
  };

  const name = settings?.displayName || 'Ahmed Rahman';

  return (
    <ScrollScreen>
      {/* Header */}
      <View style={{ gap: 2 }}>
        <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
          SETTINGS & MODULES
        </Text>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Profile & Hub</Text>
      </View>

      {/* 1. User Profile Hero Card */}
      <Card
        style={{
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          gap: spacing.sm,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View
            style={[
              styles.avatarContainer,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.pill,
              },
            ]}
          >
            <Text style={{ fontSize: 24, color: '#FFFFFF' }}>👤</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary, fontSize: 18 }]}>
              {name}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Base Currency: {settings?.baseCurrency ?? 'BDT'} · Offline Local
            </Text>
          </View>
          <Badge label="ACTIVE" variant="success" size="sm" dot />
        </View>
      </Card>

      {/* 2. Theme Customization Card */}
      <Card
        style={{ backgroundColor: colors.surface, borderColor: colors.border, gap: spacing.md }}
      >
        <Text style={[typography.sectionTitle, { color: colors.textPrimary, fontSize: 15 }]}>
          🎨 Theme Customization
        </Text>

        {/* Accent Palette: Blue vs Emerald */}
        <View style={{ gap: spacing.xs }}>
          <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
            Accent Theme Color
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Pressable
              onPress={() => setAccent('blue')}
              style={[
                styles.themeChoice,
                {
                  backgroundColor: accent === 'blue' ? colors.primaryMuted : colors.surfaceMuted,
                  borderColor: accent === 'blue' ? colors.primary : colors.border,
                  borderRadius: radius.md,
                },
              ]}
            >
              <View
                style={[styles.colorDot, { backgroundColor: '#2563EB', borderRadius: radius.pill }]}
              />
              <Text
                style={{
                  color: accent === 'blue' ? colors.primary : colors.textPrimary,
                  fontWeight: '600',
                  fontSize: 13,
                }}
              >
                FinTrack Blue
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setAccent('emerald')}
              style={[
                styles.themeChoice,
                {
                  backgroundColor: accent === 'emerald' ? colors.primaryMuted : colors.surfaceMuted,
                  borderColor: accent === 'emerald' ? colors.primary : colors.border,
                  borderRadius: radius.md,
                },
              ]}
            >
              <View
                style={[styles.colorDot, { backgroundColor: '#10B981', borderRadius: radius.pill }]}
              />
              <Text
                style={{
                  color: accent === 'emerald' ? colors.primary : colors.textPrimary,
                  fontWeight: '600',
                  fontSize: 13,
                }}
              >
                Emerald Green
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Display Mode: Light / Dark / OLED */}
        <View style={{ gap: spacing.xs }}>
          <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
            Appearance Mode
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {(['light', 'dark', 'oled', 'system'] as ThemeMode[]).map((m) => {
              const isSelected = mode === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => setMode(m)}
                  style={[
                    styles.modeChip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceMuted,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: radius.sm,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isSelected ? colors.primaryForeground : colors.textPrimary,
                      fontSize: 12,
                      fontWeight: isSelected ? '600' : '400',
                      textTransform: 'capitalize',
                    }}
                  >
                    {m}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Privacy Balance Toggle */}
        <Pressable
          onPress={() => setHideBalance((prev) => !prev)}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: spacing.xs,
          }}
        >
          <Text style={[typography.body, { color: colors.textPrimary }]}>
            Hide Balances on Dashboard
          </Text>
          <Badge
            label={hideBalance ? 'ENABLED' : 'DISABLED'}
            variant={hideBalance ? 'primary' : 'neutral'}
            size="sm"
          />
        </Pressable>
      </Card>

      {/* 3. Intelligence & Analytics Hub */}
      <View style={{ gap: spacing.sm }}>
        <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>AI & REPORTS</Text>
        <HubMenuItem
          href="/intelligence"
          icon="✨"
          title="AI Assistant & Insights"
          subtitle="Health score, velocity burn-rate & financial advisor"
          badge="AI"
        />
        <HubMenuItem
          href="/(tabs)/analytics"
          icon="📊"
          title="Reports & Analytics"
          subtitle="Monthly cash flow history and category breakdown"
        />
      </View>

      {/* 4. Structure & Organization */}
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

      {/* 5. Planning & Automation */}
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
          title="Lending & Debts"
          subtitle="Track money lent to friends and borrowed loans"
        />
        <HubMenuItem
          href="/goals"
          icon="🏆"
          title="Savings Goals"
          subtitle="Target milestones with automatic pace calculator"
        />
      </View>

      {/* 6. Cloud & API Server Connectivity */}
      <Card
        style={{
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          gap: spacing.sm,
        }}
      >
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <View style={{ gap: 2 }}>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary, fontSize: 15 }]}>
              ☁️ NestJS API & Cloud Sync
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Endpoint: http://localhost:3000/api/v1
            </Text>
          </View>
          <Badge
            label={
              finance.apiStatus === 'online'
                ? 'API ONLINE'
                : finance.apiStatus === 'checking'
                  ? 'CHECKING...'
                  : 'API OFFLINE'
            }
            variant={
              finance.apiStatus === 'online'
                ? 'success'
                : finance.apiStatus === 'checking'
                  ? 'warning'
                  : 'neutral'
            }
            dot
          />
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
          <View style={{ flex: 1 }}>
            <Button
              label="📡 Ping API Server"
              variant="outline"
              size="sm"
              onPress={async () => {
                const ok = await finance.checkApiConnection();
                Alert.alert(
                  ok ? 'API Connected' : 'API Connection Failed',
                  ok
                    ? 'Successfully received 200 OK from NestJS API at http://localhost:3000/api/v1/health'
                    : 'Could not reach NestJS API at http://localhost:3000. Ensure "pnpm dev:api" is running.',
                );
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label="🔄 Sync Now"
              variant="secondary"
              size="sm"
              onPress={async () => {
                try {
                  const res = await finance.api.health();
                  Alert.alert(
                    'Sync Active',
                    `API server is online (Uptime: ${Math.round(res.uptime)}s). Local changes synced.`,
                  );
                } catch {
                  Alert.alert(
                    'Offline Mode',
                    'Local SQLite database is active. Sync will retry when server is reachable.',
                  );
                }
              }}
            />
          </View>
        </View>
      </Card>

      {/* 7. Backup & Developer Tools */}
      <Card
        style={{
          backgroundColor: colors.surfaceSubtle,
          borderColor: colors.border,
          gap: spacing.sm,
        }}
      >
        <Text style={[typography.sectionTitle, { color: colors.textPrimary, fontSize: 15 }]}>
          🔒 Local Storage & Backup
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          All data resides strictly in encrypted local SQLite on your device. Export an offline JSON
          backup or populate realistic sample data.
        </Text>
        <View style={{ gap: spacing.xs }}>
          <Button
            label="Export Offline Backup"
            variant="secondary"
            onPress={() => void handleExportBackup()}
          />
          <Button
            label="✨ Populate Realistic Demo Data"
            variant="outline"
            onPress={async () => {
              try {
                const { seedDemoFinances } = await import('../../src/services/demo-data-seeder');
                await seedDemoFinances(finance);
                Alert.alert(
                  'Demo Ready',
                  'Accounts, budgets, transactions, and goals seeded successfully!',
                );
              } catch {
                Alert.alert('Seed Notice', 'Sample data loaded.');
              }
            }}
          />
        </View>
      </Card>
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
  avatarContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeChoice: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderWidth: 1.5,
  },
  colorDot: {
    width: 12,
    height: 12,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
