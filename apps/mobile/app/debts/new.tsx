import { DebtType, type DebtType as DebtTypeEnum } from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { ScrollScreen } from '../../src/components/Screen';
import { useAccounts } from '../../src/hooks/use-accounts';
import { useSettings } from '../../src/hooks/use-settings';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

export default function NewDebtScreen() {
  const { colors, spacing, typography, radius } = useTokens();
  const { debts, refresh } = useFinance();
  const { accounts } = useAccounts();
  const { settings } = useSettings();
  const router = useRouter();

  const [type, setType] = useState<DebtTypeEnum>(DebtType.LENT);
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <ScrollScreen>
      <Text style={[typography.title, { color: colors.textPrimary }]}>Add Loan / Borrowing</Text>
      
      {/* Type toggle */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Pressable
          onPress={() => setType(DebtType.LENT)}
          style={{
            flex: 1,
            padding: spacing.md,
            borderRadius: radius.md,
            alignItems: 'center',
            backgroundColor: type === DebtType.LENT ? colors.income : colors.surfaceMuted,
          }}
        >
          <Text style={{ color: type === DebtType.LENT ? '#fff' : colors.textPrimary, fontWeight: '700' }}>
            I Lent Money
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setType(DebtType.BORROWED)}
          style={{
            flex: 1,
            padding: spacing.md,
            borderRadius: radius.md,
            alignItems: 'center',
            backgroundColor: type === DebtType.BORROWED ? colors.danger : colors.surfaceMuted,
          }}
        >
          <Text style={{ color: type === DebtType.BORROWED ? '#fff' : colors.textPrimary, fontWeight: '700' }}>
            I Borrowed Money
          </Text>
        </Pressable>
      </View>

      <Input label="Person Name" value={personName} onChangeText={setPersonName} placeholder="e.g. Rahim" />
      <Input label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="5000" />
      <Input label="Expected Due Date (Optional, YYYY-MM-DD)" value={dueDate} onChangeText={setDueDate} placeholder="2026-09-30" />
      <Input label="Note (Optional)" value={note} onChangeText={setNote} placeholder="e.g. For project materials" />

      {/* Account selection */}
      <Card style={{ gap: spacing.sm }}>
        <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Source / Destination Account</Text>
        <Pressable
          onPress={() => setAccountId(null)}
          style={{
            padding: spacing.md,
            borderRadius: radius.md,
            backgroundColor: accountId === null ? colors.primary : colors.surfaceMuted,
          }}
        >
          <Text style={{ color: accountId === null ? colors.primaryForeground : colors.textPrimary }}>
            None (No immediate cash movement)
          </Text>
        </Pressable>
        {accounts.map((acc) => (
          <Pressable
            key={acc.id}
            onPress={() => setAccountId(acc.id)}
            style={{
              padding: spacing.md,
              borderRadius: radius.md,
              backgroundColor: accountId === acc.id ? colors.primary : colors.surfaceMuted,
            }}
          >
            <Text style={{ color: accountId === acc.id ? colors.primaryForeground : colors.textPrimary }}>
              {acc.name} ({acc.currency})
            </Text>
          </Pressable>
        ))}
      </Card>

      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}

      <Button
        label="Save"
        onPress={() => {
          void debts
            .create({
              type,
              personName,
              amount,
              currency: settings?.baseCurrency ?? 'BDT',
              dueDate: dueDate || null,
              accountId,
              note,
            })
            .then(() => {
              refresh();
              router.back();
            })
            .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not save'));
        }}
      />
    </ScrollScreen>
  );
}
