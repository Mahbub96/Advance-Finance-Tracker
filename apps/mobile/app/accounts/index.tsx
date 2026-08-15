import { formatMoneyDisplay } from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { ScrollScreen } from '../../src/components/Screen';
import { DonutChart, type DonutSegment } from '../../src/components/charts/DonutChart';
import { AccountsSkeleton } from '../../src/components/skeletons/AccountsSkeleton';
import { useAccounts } from '../../src/hooks/use-accounts';
import { useSettings } from '../../src/hooks/use-settings';
import { useTokens } from '../../src/theme/tokens';

function getAccountIcon(type: string): string {
  switch (type) {
    case 'CASH':
      return '💵';
    case 'BANK':
      return '🏦';
    case 'WALLET':
      return '📱';
    case 'SAVINGS':
      return '🐖';
    case 'CREDIT':
      return '💳';
    default:
      return '📂';
  }
}

const ACCOUNT_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B'];

export default function AccountsListScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { accounts, totalBalance, loading } = useAccounts(true);
  const { settings } = useSettings();
  const router = useRouter();

  const currency = settings?.baseCurrency ?? 'BDT';

  // Compute donut chart segments for accounts
  const segments: DonutSegment[] = useMemo(() => {
    const positiveAccounts = accounts.filter((a) => parseFloat(a.balance) > 0);
    const totalPositive = positiveAccounts.reduce((sum, a) => sum + parseFloat(a.balance), 0);

    if (totalPositive === 0) return [];

    return positiveAccounts.map((acc, idx) => {
      const val = parseFloat(acc.balance);
      const percentage = Math.round((val / totalPositive) * 100);
      return {
        label: acc.name,
        value: val,
        percentage,
        color: ACCOUNT_COLORS[idx % ACCOUNT_COLORS.length] || '#2563EB',
        formattedValue: formatMoneyDisplay(acc.balance, acc.currency),
      };
    });
  }, [accounts]);

  if (loading) {
    return <AccountsSkeleton />;
  }

  return (
    <ScrollScreen>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 2 }}>
          <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
            WALLETS & BALANCES
          </Text>
          <Text style={[typography.title, { color: colors.textPrimary }]}>Accounts</Text>
        </View>
        <Button label="+ Add Account" size="sm" onPress={() => router.push('/accounts/new')} />
      </View>

      {/* Hero Total Balance */}
      <Card
        style={{
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          gap: spacing.xs,
        }}
      >
        <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
          Total Balance
        </Text>
        <Text
          style={[
            typography.numericLarge,
            {
              color: colors.textPrimary,
              fontSize: 30,
            },
          ]}
        >
          {formatMoneyDisplay(totalBalance, currency)}
        </Text>
      </Card>

      {/* Account List Cards */}
      <View style={{ gap: spacing.sm }}>
        {accounts.length === 0 ? (
          <EmptyState
            icon="🏦"
            title="No accounts created"
            description="Add your daily cash wallet, bank accounts, bKash, or savings funds."
            actionLabel="Add First Account"
            onAction={() => router.push('/accounts/new')}
          />
        ) : (
          accounts.map((account, idx) => {
            const icon = getAccountIcon(account.type);
            const isNegative = parseFloat(account.balance) < 0;
            const accentColor = ACCOUNT_COLORS[idx % ACCOUNT_COLORS.length];

            return (
              <Pressable key={account.id} onPress={() => router.push(`/accounts/${account.id}`)}>
                {({ pressed }) => (
                  <Card
                    style={[
                      styles.card,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.md,
                        flex: 1,
                      }}
                    >
                      <View
                        style={[
                          styles.iconBox,
                          {
                            backgroundColor: accentColor + '20',
                            borderRadius: radius.md,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 20 }}>{icon}</Text>
                      </View>

                      <View style={{ flex: 1, gap: 2 }}>
                        <View
                          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
                        >
                          <Text
                            style={[
                              typography.sectionTitle,
                              { color: colors.textPrimary, fontSize: 16 },
                            ]}
                          >
                            {account.name}
                          </Text>
                          {account.isArchived && (
                            <Badge label="ARCHIVED" size="sm" variant="neutral" />
                          )}
                        </View>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                          {account.type}{' '}
                          {account.institutionName ? `· ${account.institutionName}` : ''}
                        </Text>
                      </View>

                      <View style={{ alignItems: 'flex-end', gap: 2 }}>
                        <Text
                          style={[
                            typography.numericMedium,
                            {
                              color: isNegative ? colors.danger : colors.textPrimary,
                              fontSize: 17,
                            },
                          ]}
                        >
                          {formatMoneyDisplay(account.balance, account.currency)}
                        </Text>
                        <Text
                          style={[typography.caption, { color: colors.textTertiary, fontSize: 11 }]}
                        >
                          Balance
                        </Text>
                      </View>
                    </View>
                  </Card>
                )}
              </Pressable>
            );
          })
        )}
      </View>

      {/* Account Distribution Summary Donut Chart */}
      {segments.length > 0 && (
        <Card
          style={{ backgroundColor: colors.surface, borderColor: colors.border, gap: spacing.md }}
        >
          <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
            Account Summary
          </Text>
          <DonutChart
            segments={segments}
            totalLabel="Total Assets"
            totalFormatted={formatMoneyDisplay(totalBalance, currency)}
            size={170}
          />
        </Card>
      )}
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
