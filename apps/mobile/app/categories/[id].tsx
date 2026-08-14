import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { ScrollScreen } from '../../src/components/Screen';
import type { CategoryRecord } from '../../src/database/records';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

export default function EditCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { categories, refresh } = useFinance();
  const router = useRouter();
  const { colors, typography } = useTokens();
  const [category, setCategory] = useState<CategoryRecord | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void categories.get(id).then((item) => {
      setCategory(item);
      setName(item.name);
    });
  }, [categories, id]);

  if (!category) {
    return <Text>Loading…</Text>;
  }

  return (
    <ScrollScreen>
      <Text style={[typography.title, { color: colors.textPrimary }]}>Edit category</Text>
      <Input label="Name" value={name} onChangeText={setName} />
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
      <Button
        label="Save"
        onPress={() => {
          void categories
            .update(category.id, { name })
            .then(() => {
              refresh();
              router.back();
            })
            .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not save'));
        }}
      />
      <Button
        label={category.isArchived ? 'Restore' : 'Archive'}
        variant="secondary"
        onPress={() => {
          void (category.isArchived ? categories.restore(category.id) : categories.archive(category.id)).then(
            () => {
              refresh();
              router.back();
            },
          );
        }}
      />
    </ScrollScreen>
  );
}
