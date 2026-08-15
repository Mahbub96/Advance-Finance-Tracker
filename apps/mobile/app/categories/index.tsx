import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { ScrollScreen } from '../../src/components/Screen';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { CategoriesSkeleton } from '../../src/components/skeletons/CategoriesSkeleton';
import { useCategories } from '../../src/hooks/use-categories';
import { useTokens } from '../../src/theme/tokens';

type FilterType = 'ALL' | 'EXPENSE' | 'INCOME';

export default function CategoriesListScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { categories, loading } = useCategories(true);
  const router = useRouter();

  const [filter, setFilter] = useState<FilterType>('ALL');

  const visible = useMemo(() => {
    if (filter === 'ALL') return categories;
    return categories.filter((c) => c.type === filter);
  }, [categories, filter]);

  const counts = useMemo(
    () => ({
      ALL: categories.length,
      EXPENSE: categories.filter((c) => c.type === 'EXPENSE').length,
      INCOME: categories.filter((c) => c.type === 'INCOME').length,
    }),
    [categories],
  );

  if (loading) {
    return <CategoriesSkeleton />;
  }

  const filterOptions = [
    { id: 'ALL' as const, label: 'All', count: counts.ALL },
    { id: 'EXPENSE' as const, label: 'Expenses', count: counts.EXPENSE },
    { id: 'INCOME' as const, label: 'Income', count: counts.INCOME },
  ];

  return (
    <ScrollScreen>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 2 }}>
          <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
            TAXONOMY & LABELS
          </Text>
          <Text style={[typography.title, { color: colors.textPrimary }]}>Categories</Text>
        </View>
        <Button label="+ Add Category" size="sm" onPress={() => router.push('/categories/new')} />
      </View>

      {/* Segmented Filter */}
      <SegmentedControl options={filterOptions} value={filter} onChange={setFilter} />

      {/* Category List */}
      <View style={{ gap: spacing.sm }}>
        {visible.length === 0 ? (
          <EmptyState
            icon="🏷️"
            title="No categories found"
            description="Create custom categories to organize your financial transactions."
            actionLabel="Add Category"
            onAction={() => router.push('/categories/new')}
          />
        ) : (
          visible.map((category) => {
            const isExpense = category.type === 'EXPENSE';
            return (
              <Pressable
                key={category.id}
                onPress={() => router.push(`/categories/${category.id}`)}
              >
                {({ pressed }) => (
                  <Card
                    style={[
                      styles.card,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                        <View
                          style={[
                            styles.iconBox,
                            {
                              backgroundColor: isExpense ? colors.expenseMuted : colors.incomeMuted,
                              borderRadius: radius.md,
                            },
                          ]}
                        >
                          <Text style={{ fontSize: 18 }}>
                            {category.icon || (isExpense ? '💸' : '💰')}
                          </Text>
                        </View>

                        <View style={{ gap: 2 }}>
                          <Text
                            style={[
                              typography.sectionTitle,
                              { color: colors.textPrimary, fontSize: 15 },
                            ]}
                          >
                            {category.name}
                          </Text>
                          <Text
                            style={[
                              typography.caption,
                              { color: colors.textSecondary, fontSize: 12 },
                            ]}
                          >
                            {category.type} {category.isSystem ? '· System Default' : ''}
                          </Text>
                        </View>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                        {category.isArchived && (
                          <Badge label="ARCHIVED" size="sm" variant="neutral" />
                        )}
                        <Text style={{ color: colors.textTertiary, fontSize: 16 }}>→</Text>
                      </View>
                    </View>
                  </Card>
                )}
              </Pressable>
            );
          })
        )}
      </View>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
    paddingVertical: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
