import { BudgetPeriodType, CategoryKind } from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { ScrollScreen } from '../../src/components/Screen';
import { monthRange } from '../../src/lib/clock';
import { useCategories } from '../../src/hooks/use-categories';
import { useSettings } from '../../src/hooks/use-settings';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';

export default function NewBudgetScreen() {
  const { colors, spacing, typography, radius } = useTokens();
  const { budgets, refresh } = useFinance();
  const { categories } = useCategories();
  const { settings } = useSettings();
  const router = useRouter();
  const currentMonth = monthRange();
  const expenseCategories = categories.filter((category) => category.type === CategoryKind.EXPENSE);
  const [name, setName] = useState('Monthly spending');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(currentMonth.from);
  const [endDate, setEndDate] = useState(currentMonth.to);
  const [error, setError] = useState<string | null>(null);

  return (
    <ScrollScreen>
      <Text style={[typography.title, { color: colors.textPrimary }]}>New budget</Text>
      <Input label="Name" value={name} onChangeText={setName} />
      <Input
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="25000"
      />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Input label="Start date" value={startDate} onChangeText={setStartDate} />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="End date" value={endDate} onChangeText={setEndDate} />
        </View>
      </View>
      <Card style={{ gap: spacing.sm }}>
        <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>Scope</Text>
        <Pressable
          onPress={() => setCategoryId(null)}
          style={{
            padding: spacing.md,
            borderRadius: radius.md,
            backgroundColor: categoryId === null ? colors.primary : colors.surfaceMuted,
          }}
        >
          <Text style={{ color: categoryId === null ? colors.primaryForeground : colors.textPrimary }}>
            All expenses
          </Text>
        </Pressable>
        {expenseCategories.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => setCategoryId(category.id)}
            style={{
              padding: spacing.md,
              borderRadius: radius.md,
              backgroundColor: categoryId === category.id ? colors.primary : colors.surfaceMuted,
            }}
          >
            <Text style={{ color: categoryId === category.id ? colors.primaryForeground : colors.textPrimary }}>
              {category.name}
            </Text>
          </Pressable>
        ))}
      </Card>
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
      <Button
        label="Create"
        onPress={() => {
          void budgets
            .create({
              name,
              amount,
              currency: settings?.baseCurrency ?? 'BDT',
              periodType: BudgetPeriodType.CUSTOM,
              startDate,
              endDate,
              categoryId,
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
