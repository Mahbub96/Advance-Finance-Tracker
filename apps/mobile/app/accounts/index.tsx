import { formatMoneyDisplay } from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { ScrollScreen } from '../../src/components/Screen';
import { useAccounts } from '../../src/hooks/use-accounts';
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

export default function AccountsListScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { accounts } = useAccounts(true);
  const router = useRouter();

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

      {/* Account List */}
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
          accounts.map((account) => {
            const icon = getAccountIcon(account.type);
            const isNegative = parseFloat(account.balance) < 0;

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
                            backgroundColor: colors.surfaceMuted,
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
