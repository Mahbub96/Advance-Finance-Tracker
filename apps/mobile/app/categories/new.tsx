import { CategoryKind, type CategoryKind as Kind } from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { ScrollScreen } from '../../src/components/Screen';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

export default function NewCategoryScreen() {
  const { colors, spacing, typography, radius } = useTokens();
  const { categories, refresh } = useFinance();
  const router = useRouter();

  const [name, setName] = useState('');
  const [type, setType] = useState<Kind>(CategoryKind.EXPENSE);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const typeOptions: Array<{ id: Kind; label: string }> = [
    { id: CategoryKind.EXPENSE, label: '💸 Expense' },
    { id: CategoryKind.INCOME, label: '💰 Income' },
  ];

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Please provide a category name');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await categories.create({ name: name.trim(), type });
      refresh();
      router.back();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save category');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollScreen>
      <View style={{ gap: 2 }}>
        <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>TAXONOMY</Text>
        <Text style={[typography.title, { color: colors.textPrimary }]}>New Category</Text>
      </View>

      <SegmentedControl options={typeOptions} value={type} onChange={setType} />

      <Card style={{ gap: spacing.md, backgroundColor: colors.surfaceElevated }}>
        <Input
          label="Category Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Groceries, Entertainment, Consulting"
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
        label={busy ? 'Saving...' : 'Create Category'}
        loading={busy}
        onPress={() => void handleCreate()}
        size="lg"
      />
    </ScrollScreen>
  );
}
