import { BudgetPeriodType, CategoryKind } from '@personal-finance/types';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
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

  const [name, setName] = useState('Monthly Spending Limit');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(currentMonth.from);
  const [endDate, setEndDate] = useState(currentMonth.to);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const currency = settings?.baseCurrency ?? 'BDT';

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Please provide a budget title');
      return;
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid budget amount');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await budgets.create({
        name: name.trim(),
        amount: amount.trim(),
        currency,
        periodType: BudgetPeriodType.CUSTOM,
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        categoryId,
      });
      refresh();
      router.back();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save budget');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollScreen>
      <View style={{ gap: 2 }}>
        <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
          SPENDING CONTROL
        </Text>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Create Budget</Text>
      </View>

      <Card style={{ gap: spacing.md, backgroundColor: colors.surfaceElevated }}>
        <Input
          label="Budget Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Dining Out Limit, Groceries Budget"
        />

        <Input
          label="Limit Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="25000"
          prefix={currency}
        />

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Input label="Start Date" value={startDate} onChangeText={setStartDate} />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="End Date" value={endDate} onChangeText={setEndDate} />
          </View>
        </View>

        {/* Category Scope Chips */}
        <View style={{ gap: spacing.xs }}>
          <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
            Category Scope
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            <Pressable
              onPress={() => setCategoryId(null)}
              style={[
                styles.scopeChip,
                {
                  backgroundColor: categoryId === null ? colors.primary : colors.surface,
                  borderColor: categoryId === null ? colors.primary : colors.border,
                  borderRadius: radius.md,
                },
              ]}
            >
              <Text
                style={{
                  color: categoryId === null ? colors.primaryForeground : colors.textPrimary,
                  fontWeight: categoryId === null ? '600' : '400',
                  fontSize: 13,
                }}
              >
                🌐 All Expenses
              </Text>
            </Pressable>

            {expenseCategories.map((category) => {
              const isSelected = categoryId === category.id;
              return (
                <Pressable
                  key={category.id}
                  onPress={() => setCategoryId(category.id)}
                  style={[
                    styles.scopeChip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: radius.md,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isSelected ? colors.primaryForeground : colors.textPrimary,
                      fontWeight: isSelected ? '600' : '400',
                      fontSize: 13,
                    }}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
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
        label={busy ? 'Saving...' : 'Create Budget'}
        loading={busy}
        onPress={() => void handleCreate()}
        size="lg"
      />
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  scopeChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
