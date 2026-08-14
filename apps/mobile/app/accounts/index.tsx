import { formatMoneyDisplay } from '@personal-finance/types';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ScrollScreen } from '../../src/components/Screen';
import { useAccounts } from '../../src/hooks/use-accounts';
import { useTokens } from '../../src/theme/tokens';

export default function AccountsListScreen() {
  const { colors, typography, spacing } = useTokens();
  const { accounts } = useAccounts(true);

  return (
    <ScrollScreen>
      <Text style={[typography.title, { color: colors.textPrimary }]}>Accounts</Text>
      <Link href="/accounts/new" asChild>
        <Button label="Add account" />
      </Link>
      <View style={{ gap: spacing.md }}>
        {accounts.map((account) => (
          <Link key={account.id} href={`/accounts/${account.id}`} asChild>
            <Pressable>
              <Card>
                <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
                  {account.name}
                  {account.isArchived ? ' (archived)' : ''}
                </Text>
                <Text style={{ color: colors.textSecondary }}>{account.type}</Text>
                <Text style={[typography.body, { color: colors.textPrimary }]}>
                  {formatMoneyDisplay(account.balance, account.currency)}
                </Text>
              </Card>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollScreen>
  );
}
