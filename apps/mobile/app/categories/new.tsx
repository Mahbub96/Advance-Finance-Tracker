import { CategoryKind, type CategoryKind as Kind } from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { Screen } from '../../src/components/Screen';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

const CATEGORY_ICONS = [
  '🍔',
  '🛒',
  '🚗',
  '🏠',
  '⚡',
  '🎮',
  '✈️',
  '👔',
  '💊',
  '🎓',
  '💼',
  '💰',
  '🎁',
  '☕',
  '🍿',
  '📱',
];

export default function NewCategoryScreen() {
  const { colors, spacing, typography, radius } = useTokens();
  const { categories, refresh } = useFinance();
  const router = useRouter();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🍔');
  const [type, setType] = useState<Kind>(CategoryKind.EXPENSE);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const nameError = submitted && !name.trim() ? 'Category name is required' : null;

  const typeOptions: Array<{ id: Kind; label: string }> = [
    { id: CategoryKind.EXPENSE, label: '💸 Expense' },
    { id: CategoryKind.INCOME, label: '💰 Income' },
  ];

  const handleCreate = async () => {
    setSubmitted(true);
    if (!name.trim()) {
      return;
    }

    setBusy(true);
    try {
      await categories.create({
        name: name.trim(),
        type,
        icon,
      });
      refresh();
      router.back();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Could not save category');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.xxl }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: 2 }}>
            <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>TAXONOMY</Text>
            <Text style={[typography.title, { color: colors.textPrimary }]}>New Category</Text>
          </View>

          <SegmentedControl
            options={typeOptions}
            value={type}
            onChange={(t) => {
              setType(t);
              if (t === CategoryKind.INCOME) setIcon('💼');
              else setIcon('🍔');
            }}
          />

          <Card style={{ gap: spacing.md, backgroundColor: colors.surfaceElevated }}>
            <Input
              label="Category Name"
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (submitted) setSubmitted(false);
              }}
              placeholder="e.g. Groceries, Entertainment, Consulting"
              error={nameError}
              clearable
              onClear={() => setName('')}
            />

            {/* Icon Picker */}
            <View style={{ gap: spacing.xs }}>
              <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                Category Icon ({icon})
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {CATEGORY_ICONS.map((ic) => {
                  const isSelected = icon === ic;
                  return (
                    <Pressable
                      key={ic}
                      onPress={() => setIcon(ic)}
                      style={[
                        styles.iconChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surface,
                          borderColor: isSelected ? colors.primary : colors.border,
                          borderRadius: radius.md,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 20 }}>{ic}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Card>

          <Button
            label={busy ? 'Saving...' : 'Create Category'}
            loading={busy}
            onPress={() => void handleCreate()}
            size="lg"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconChip: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
