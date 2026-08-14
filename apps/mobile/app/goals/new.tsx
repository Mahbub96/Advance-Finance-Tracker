import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { ScrollScreen } from '../../src/components/Screen';
import { useSettings } from '../../src/hooks/use-settings';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

export default function NewGoalScreen() {
  const { colors, typography } = useTokens();
  const { goals, refresh } = useFinance();
  const { settings } = useSettings();
  const router = useRouter();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <ScrollScreen>
      <Text style={[typography.title, { color: colors.textPrimary }]}>New Financial Goal</Text>
      <Input label="Goal Name" value={name} onChangeText={setName} placeholder="e.g. MacBook Pro, Emergency Fund" />
      <Input label="Target Amount" value={targetAmount} onChangeText={setTargetAmount} keyboardType="decimal-pad" placeholder="150000" />
      <Input label="Target Date (Optional, YYYY-MM-DD)" value={targetDate} onChangeText={setTargetDate} placeholder="2026-12-31" />
      <Input label="Note (Optional)" value={note} onChangeText={setNote} placeholder="e.g. For career upgrade" />

      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}

      <Button
        label="Create Goal"
        onPress={() => {
          void goals
            .create({
              name,
              targetAmount,
              currency: settings?.baseCurrency ?? 'BDT',
              targetDate: targetDate || null,
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
