import { CategoryKind, type CategoryKind as Kind } from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { ScrollScreen } from '../../src/components/Screen';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

export default function NewCategoryScreen() {
  const { colors, spacing, typography, radius } = useTokens();
  const { categories, refresh } = useFinance();
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<Kind>(CategoryKind.EXPENSE);
  const [error, setError] = useState<string | null>(null);

  return (
    <ScrollScreen>
      <Text style={[typography.title, { color: colors.textPrimary }]}>New category</Text>
      <Input label="Name" value={name} onChangeText={setName} />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {([CategoryKind.EXPENSE, CategoryKind.INCOME] as const).map((item) => (
          <Pressable
            key={item}
            onPress={() => setType(item)}
            style={{
              flex: 1,
              padding: spacing.md,
              borderRadius: radius.md,
              backgroundColor: type === item ? colors.primary : colors.surfaceMuted,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: type === item ? colors.primaryForeground : colors.textPrimary }}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
      <Button
        label="Create"
        onPress={() => {
          void categories
            .create({ name, type })
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
