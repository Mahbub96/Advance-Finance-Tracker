import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { DeleteConfirmModal } from '../../src/components/DeleteConfirmModal';
import { Input } from '../../src/components/Input';
import { ScrollScreen } from '../../src/components/Screen';
import { SkeletonBox, SkeletonText } from '../../src/components/Skeleton';
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

  // Archive confirm state
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [archiveBusy, setArchiveBusy] = useState(false);

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
        <View style={{ gap: 4 }}>
          <SkeletonText width={100} height={12} />
          <SkeletonText width={140} height={24} />
        </View>

        <Card style={{ gap: spacing.md, backgroundColor: colors.surfaceElevated, padding: spacing.lg }}>
          <SkeletonText width={120} height={13} />
          <SkeletonBox width="100%" height={44} borderRadius={radius.md} />
          <SkeletonText width={150} height={13} />
        </Card>

        <SkeletonBox width="100%" height={48} borderRadius={radius.md} />
        <SkeletonBox width="100%" height={44} borderRadius={radius.md} />
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
    setArchiveBusy(true);
    try {
      if (category.isArchived) {
        await categories.restore(category.id);
      } else {
        await categories.archive(category.id);
      }
      refresh();
      setShowArchiveConfirm(false);
      router.back();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not update archive status');
    } finally {
      setArchiveBusy(false);
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
        onPress={() => {
          if (category.isArchived) {
            // Restore is safe — no warning needed
            void handleToggleArchive();
          } else {
            setShowArchiveConfirm(true);
          }
        }}
        size="md"
      />

      {/* Archive confirmation modal */}
      <DeleteConfirmModal
        visible={showArchiveConfirm}
        title="Archive Category?"
        message={`"${category.name}" will be archived and hidden from transaction forms. Existing transactions using this category are unaffected.`}
        deleteLabel="Archive"
        loading={archiveBusy}
        onConfirm={() => void handleToggleArchive()}
        onCancel={() => setShowArchiveConfirm(false)}
      />
    </ScrollScreen>
  );
}
