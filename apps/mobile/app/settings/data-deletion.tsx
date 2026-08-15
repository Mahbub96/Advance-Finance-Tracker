import {
  DataDeletionScope,
  type DeletionPreviewCounts,
  type SyncOperationRecord,
} from '@personal-finance/types';
import { normalizeEmail, validateTypedEmailConfirmation } from '@personal-finance/validation';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { DeleteConfirmModal } from '../../src/components/DeleteConfirmModal';
import { Input } from '../../src/components/Input';
import { Screen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { useAuth } from '../../src/providers/auth-provider';
import { useFinance } from '../../src/providers/finance-provider';
import { useUndoDelete } from '../../src/providers/undo-delete-provider';
import { AuthRepository } from '../../src/repositories/auth-repository';
import {
  computeLocalDeletionPreview,
  executeLocalDataDeletion,
  getLocalDeletionTombstones,
} from '../../src/services/data-deletion-local';
import { useTokens } from '../../src/theme/tokens';

export default function DataDeletionScreen() {
  const { colors, spacing, typography, radius } = useTokens();
  const { api, db, refresh } = useFinance();
  const { user } = useAuth();
  const { scheduleDelete } = useUndoDelete();
  const router = useRouter();

  const [scope, setScope] = useState<DataDeletionScope>(DataDeletionScope.CURRENT_MONTH);
  const [typedEmail, setTypedEmail] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [confirmationToken, setConfirmationToken] = useState<string | null>(null);
  const [counts, setCounts] = useState<DeletionPreviewCounts | null>(null);
  const [periodText, setPeriodText] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [executionPhase, setExecutionPhase] = useState<string | null>(null);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);

  const accountEmail = user?.email || 'user@example.com';
  const isEmailMatch = validateTypedEmailConfirmation(typedEmail, accountEmail);

  // Fetch read-only deletion preview whenever scope changes
  useEffect(() => {
    let active = true;

    async function fetchPreview() {
      setLoadingPreview(true);
      setConfirmationToken(null);
      setTypedEmail('');

      try {
        const preview = await api.dataDeletion.preview({ scope });
        if (active) {
          setCounts(preview.counts);
          setConfirmationToken(preview.confirmationToken);
          if (preview.period) {
            setPeriodText(`${preview.period.startDate} → ${preview.period.endDate}`);
          } else {
            setPeriodText('All historical records');
          }
        }
      } catch {
        // Offline fallback preview from local SQLite
        if (active) {
          await computeLocalPreview(scope);
        }
      } finally {
        if (active) setLoadingPreview(false);
      }
    }

    void fetchPreview();

    return () => {
      active = false;
    };
  }, [scope, api]);

  const computeLocalPreview = async (targetScope: DataDeletionScope) => {
    try {
      const preview = await computeLocalDeletionPreview(db, targetScope);
      setCounts(preview.counts);
      setPeriodText(preview.periodText);
      setConfirmationToken(`local_token_${Date.now()}`);
    } catch {
      // ignore
    }
  };

  const publishCloudDeletionMarkers = async () => {
    const tombstones = await getLocalDeletionTombstones(db, scope);
    if (tombstones.length === 0) return;

    const now = new Date().toISOString();
    const deviceId = user?.id ? `delete-${user.id.slice(0, 8)}` : 'delete-mobile-client';
    const operations: SyncOperationRecord[] = tombstones.map((tombstone, index) => ({
      operationId: `delete-${scope}-${tombstone.entityType}-${tombstone.entityId}-${Date.now()}-${index}`,
      deviceId,
      entityType: tombstone.entityType,
      entityId: tombstone.entityId,
      operationType: 'DELETE',
      entityVersion: 9999,
      payload: {
        id: tombstone.entityId,
        deleted_at: now,
        deletion_scope: scope,
      },
      createdAt: now,
    }));

    const uploadResult = await api.sync.uploadBatch({
      deviceId,
      operations,
    });

    if (uploadResult.latestRevision > 0) {
      await new AuthRepository(db).updateLastSyncedRevision(uploadResult.latestRevision);
    }
  };

  const executeDeletion = async () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setBusy(true);
    setExecutionPhase('Verifying confirmation token...');

    try {
      // 1. If online and has server token, execute on backend API
      if (confirmationToken && !confirmationToken.startsWith('local_token')) {
        setExecutionPhase('Executing server-side ledger deletion...');
        await api.dataDeletion.execute({
          scope,
          confirmationToken,
          typedEmail: normalizeEmail(typedEmail),
        });
      }

      // 2. Publish sync tombstones before removing local rows, so refresh cannot restore them.
      setExecutionPhase('Publishing cloud deletion markers...');
      await publishCloudDeletionMarkers();

      // 3. Perform local SQLite database purge
      setExecutionPhase('Purging local database records...');
      await executeLocalDataDeletion(db, scope);

      setExecutionPhase('Refreshing local financial state...');
      refresh();

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        'Deletion Completed',
        `The requested financial data has been permanently deleted. Your authentication account remains active.`,
        [{ text: 'Return to Dashboard', onPress: () => router.back() }],
      );
    } catch (err: unknown) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Deletion Error',
        err instanceof Error ? err.message : 'Could not complete data deletion',
      );
    } finally {
      setBusy(false);
      setExecutionPhase(null);
    }
  };

  const handleExecute = () => {
    if (!isEmailMatch || busy) return;
    setShowFinalConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowFinalConfirm(false);
    setExecutionPhase('Deletion scheduled. Use Undo within 5 seconds to cancel.');
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    scheduleDelete({
      id: `financial-data-${scope}`,
      message: `${getActionLabel()} scheduled`,
      durationMs: 5000,
      onUndo: () => {
        setExecutionPhase(null);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      onExecute: async () => {
        await executeDeletion();
      },
    });
  };

  const getActionLabel = () => {
    if (scope === DataDeletionScope.CURRENT_MONTH) return 'Delete Current Month Data';
    if (scope === DataDeletionScope.CURRENT_YEAR) return 'Delete Current Year Data';
    return 'Permanently Delete All Financial Data';
  };

  const totalAffected = counts
    ? Object.values(counts).reduce((sum, c) => sum + c, 0)
    : 0;

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.xxl }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ gap: 2 }}>
            <Text style={[typography.captionMedium, { color: colors.danger }]}>
              DATA & PRIVACY — HIGH RISK
            </Text>
            <Text style={[typography.title, { color: colors.textPrimary }]}>
              Delete Financial Data
            </Text>
          </View>

          {/* 1. Caution Warning Banner */}
          <Card
            style={{
              backgroundColor: '#FEF2F2',
              borderColor: '#EF4444',
              borderWidth: 1.5,
              gap: spacing.xs,
              padding: spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Text style={{ fontSize: 18 }}>⚠️</Text>
              <Text style={[typography.sectionTitle, { color: '#991B1B', fontSize: 15 }]}>
                Permanent Destructive Action
              </Text>
            </View>
            <Text style={[typography.caption, { color: '#B91C1C', lineHeight: 18 }]}>
              Deleted records cannot be restored. Your authentication profile and account credentials
              will remain active, but the selected financial records will be permanently removed across all devices.
            </Text>
          </Card>

          {/* 2. Choose Scope Selection */}
          <View style={{ gap: spacing.xs }}>
            <SectionHeader title="1. Select Deletion Scope" />
            <View style={{ flexDirection: 'row', gap: spacing.xs }}>
              {[
                { id: DataDeletionScope.CURRENT_MONTH, label: 'Current Month', desc: 'Active Month' },
                { id: DataDeletionScope.CURRENT_YEAR, label: 'Current Year', desc: 'Active Year' },
                { id: DataDeletionScope.ALL_DATA, label: 'All Records', desc: 'Entire Ledger' },
              ].map((opt) => {
                const isSelected = scope === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => {
                      void Haptics.selectionAsync();
                      setScope(opt.id);
                    }}
                    style={[
                      styles.scopeChip,
                      {
                        backgroundColor: isSelected ? colors.danger : colors.surface,
                        borderColor: isSelected ? colors.danger : colors.border,
                        borderRadius: radius.md,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: isSelected ? '#FFFFFF' : colors.textPrimary,
                        fontWeight: isSelected ? '700' : '600',
                        fontSize: 13,
                      }}
                    >
                      {opt.label}
                    </Text>
                    <Text
                      style={{
                        color: isSelected ? 'rgba(255,255,255,0.85)' : colors.textTertiary,
                        fontSize: 10,
                        marginTop: 2,
                      }}
                    >
                      {opt.desc}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Special Scope Warnings */}
          {scope === DataDeletionScope.ALL_DATA && (
            <Card style={{ backgroundColor: colors.surfaceMuted, borderColor: colors.danger, borderWidth: 1, padding: spacing.sm, gap: 4 }}>
              <Text style={[typography.captionMedium, { color: colors.danger, fontWeight: '700' }]}>
                🚨 Complete Financial Reset:
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                This will delete all accounts, transactions, budgets, goals, debt records, and recurring schedules. User profile authentication is retained.
              </Text>
            </Card>
          )}

          {/* 3. Server-Generated Deletion Preview */}
          <Card style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, gap: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <SectionHeader title="2. Authoritative Preview" />
              <Badge
                label={loadingPreview ? 'CALCULATING...' : `${totalAffected} RECORDS`}
                variant={totalAffected > 0 ? 'danger' : 'neutral'}
                size="sm"
              />
            </View>

            <View style={{ gap: 2 }}>
              <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                Scope Calendar Period:
              </Text>
              <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                {periodText}
              </Text>
            </View>

            {counts && (
              <View style={{ gap: spacing.xs, backgroundColor: colors.surfaceSubtle, padding: spacing.sm, borderRadius: radius.sm }}>
                <View style={styles.countRow}>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>Transactions:</Text>
                  <Text style={[typography.captionMedium, { color: colors.textPrimary }]}>{counts.transactions}</Text>
                </View>
                {scope === DataDeletionScope.ALL_DATA && (
                  <View style={styles.countRow}>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>Accounts & Wallets:</Text>
                    <Text style={[typography.captionMedium, { color: colors.textPrimary }]}>{counts.accounts}</Text>
                  </View>
                )}
                <View style={styles.countRow}>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>Lending & Debt Records:</Text>
                  <Text style={[typography.captionMedium, { color: colors.textPrimary }]}>{counts.debts}</Text>
                </View>
                {scope === DataDeletionScope.ALL_DATA && (
                  <>
                    <View style={styles.countRow}>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>Budgets & Goals:</Text>
                      <Text style={[typography.captionMedium, { color: colors.textPrimary }]}>{counts.budgets + counts.goals}</Text>
                    </View>
                    <View style={styles.countRow}>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>Recurring Rules:</Text>
                      <Text style={[typography.captionMedium, { color: colors.textPrimary }]}>{counts.recurringRules}</Text>
                    </View>
                  </>
                )}
              </View>
            )}
          </Card>

          {/* 4. GitHub-Style Typed Account Email Confirmation */}
          <Card style={{ backgroundColor: colors.surfaceElevated, borderColor: isEmailMatch ? colors.income : colors.border, borderWidth: 1, gap: spacing.md }}>
            <SectionHeader title="3. Confirm Your Account Email" />

            <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 20 }]}>
              To prevent accidental financial data loss, please type your account email address (
              <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{accountEmail}</Text>
              ) to unlock the deletion button.
            </Text>

            <Input
              label="Type Account Email to Continue"
              value={typedEmail}
              onChangeText={(t) => {
                setTypedEmail(t);
                if (validateTypedEmailConfirmation(t, accountEmail)) {
                  void Haptics.selectionAsync();
                }
              }}
              placeholder={accountEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              clearable
              onClear={() => setTypedEmail('')}
              helperText={
                isEmailMatch
                  ? '✓ Email confirmed. You may now proceed.'
                  : 'Button remains disabled until email matches exactly.'
              }
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Pressable
                onPress={() => {
                  void Haptics.selectionAsync();
                  setTypedEmail(accountEmail);
                }}
                style={{ paddingVertical: 4, paddingHorizontal: 8 }}
              >
                <Text style={[typography.captionMedium, { color: colors.primary }]}>
                  Autofill current account email
                </Text>
              </Pressable>
            </View>
          </Card>

          {/* Phase progress indicator during execution */}
          {busy && executionPhase && (
            <Card style={{ backgroundColor: colors.surfaceMuted, borderColor: colors.danger, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <ActivityIndicator color={colors.danger} />
              <Text style={[typography.captionMedium, { color: colors.textPrimary, flex: 1 }]}>
                {executionPhase}
              </Text>
            </Card>
          )}

          {/* Destructive Action CTA */}
          <Button
            label={busy ? 'Deleting...' : getActionLabel()}
            variant="danger"
            size="lg"
            disabled={!isEmailMatch || busy}
            loading={busy}
            onPress={handleExecute}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <DeleteConfirmModal
        visible={showFinalConfirm}
        title="Delete Financial Data?"
        message={`This will schedule ${getActionLabel().toLowerCase()} for ${periodText}. You will have 5 seconds to undo before records are permanently removed.`}
        deleteLabel="Schedule Delete"
        noticeText="Permanent delete — 5 second undo window"
        loading={busy}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowFinalConfirm(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scopeChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
});
