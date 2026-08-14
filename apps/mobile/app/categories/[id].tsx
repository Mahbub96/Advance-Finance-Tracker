import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { ScrollScreen } from '../../src/components/Screen';
import type { CategoryRecord } from '../../src/database/records';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

export default function EditCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { categories, refresh } = useFinance();
  const { colors, typography, spacing, radius } = useTokens();
  const router = useRouter();
  const [category, setCategory] = useState<CategoryRecord | null>(null);
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    void categories.get(id).then((item) => {
      setCategory(item);
      setName(item.name);
    });
  }, [categories, id]);

  if (!category) {
    return (
      <ScrollScreen>
        <Text style={{ color: colors.textSecondary }}>Loading category…</Text>
      </ScrollScreen>
    );
  }

  const nameError = submitted && !name.trim() ? 'Category name is required' : null;

  const handleUpdate = async () => {
    setSubmitted(true);
    if (!name.trim()) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await categories.update(category.id, { name: name.trim() });
      refresh();
      router.back();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleArchive = async () => {
    setBusy(true);
    try {
      if (category.isArchived) {
        await categories.restore(category.id);
      } else {
        await categories.archive(category.id);
      }
      refresh();
      router.back();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not update archive status');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollScreen>
      <View style={{ gap: 2 }}>
        <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
          EDIT CATEGORY
        </Text>
        <Text style={[typography.title, { color: colors.textPrimary }]}>{category.name}</Text>
      </View>

      <Card style={{ gap: spacing.md, backgroundColor: colors.surfaceElevated }}>
        <Input
          label="Category Name"
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (submitted) setSubmitted(false);
          }}
          error={nameError}
          clearable
          onClear={() => setName('')}
        />
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          Type: {category.type} {category.isSystem ? '· System Default' : ''}
        </Text>
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
        label={busy ? 'Saving...' : 'Save Changes'}
        loading={busy}
        onPress={() => void handleUpdate()}
        size="lg"
      />

      <Button
        label={category.isArchived ? 'Restore Category' : 'Archive Category'}
        variant="secondary"
        onPress={() => void handleToggleArchive()}
        size="md"
      />
    </ScrollScreen>
  );
}
