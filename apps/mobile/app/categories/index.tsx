import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ScrollScreen } from '../../src/components/Screen';
import { useCategories } from '../../src/hooks/use-categories';
import { useTokens } from '../../src/theme/tokens';

export default function CategoriesListScreen() {
  const { colors, typography, spacing } = useTokens();
  const { categories } = useCategories(true);

  return (
    <ScrollScreen>
      <Text style={[typography.title, { color: colors.textPrimary }]}>Categories</Text>
      <Link href="/categories/new" asChild>
        <Button label="Add category" />
      </Link>
      <View style={{ gap: spacing.md }}>
        {categories.map((category) => (
          <Link key={category.id} href={`/categories/${category.id}`} asChild>
            <Pressable>
              <Card>
                <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
                  {category.name}
                  {category.isArchived ? ' (archived)' : ''}
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  {category.type}
                  {category.isSystem ? ' · system' : ''}
                </Text>
              </Card>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollScreen>
  );
}
