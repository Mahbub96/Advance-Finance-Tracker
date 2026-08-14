import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { ScrollScreen } from '../../src/components/Screen';
import { useSettings } from '../../src/hooks/use-settings';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

export default function NewGoalScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { goals, refresh } = useFinance();
  const { settings } = useSettings();
  const router = useRouter();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const currency = settings?.baseCurrency ?? 'BDT';

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Please enter a goal title');
      return;
    }
    if (!targetAmount || isNaN(parseFloat(targetAmount)) || parseFloat(targetAmount) <= 0) {
      setError('Please enter a valid target amount');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await goals.create({
        name: name.trim(),
        targetAmount: targetAmount.trim(),
        currency,
        targetDate: targetDate.trim() || null,
        note: note.trim() || undefined,
      });
      refresh();
      router.back();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not create goal');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollScreen>
      <View style={{ gap: 2 }}>
        <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>SAVINGS PLAN</Text>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Create New Goal</Text>
      </View>

      <Card style={{ gap: spacing.md, backgroundColor: colors.surfaceElevated }}>
        <Input
          label="Goal Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. MacBook Pro, Emergency Fund, Tokyo Trip"
        />

        <Input
          label="Target Amount"
          value={targetAmount}
          onChangeText={setTargetAmount}
          keyboardType="decimal-pad"
          placeholder="150000"
          prefix={currency}
        />

        <Input
          label="Target Date (Optional, YYYY-MM-DD)"
          value={targetDate}
          onChangeText={setTargetDate}
          placeholder="2026-12-31"
          helperText="Used to calculate recommended monthly savings pace."
        />

        <Input
          label="Note (Optional)"
          value={note}
          onChangeText={setNote}
          placeholder="e.g. For career upgrade"
        />
      </Card>

      {error ? (
        <View
          style={{
            backgroundColor: colors.dangerMuted,
            padding: spacing.md,
            borderRadius: radius.md,
          }}
        >
          <Text style={{ color: colors.danger, fontSize: 13 }}>⚠️ {error}</Text>
        </View>
      ) : null}

      <Button
        label={busy ? 'Creating...' : 'Create Goal'}
        loading={busy}
        onPress={() => void handleCreate()}
        size="lg"
      />
    </ScrollScreen>
  );
}
