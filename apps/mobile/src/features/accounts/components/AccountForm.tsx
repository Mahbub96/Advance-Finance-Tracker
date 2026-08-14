import { AccountType, type AccountType as AccountTypeName } from '@personal-finance/types';
import { useState, type ReactNode } from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Input } from '../../../components/Input';
import { Screen } from '../../../components/Screen';
import { useTokens } from '../../../theme/tokens';
import type { CreateAccountInput } from '../services/account-service';

const TYPES: { type: AccountTypeName; icon: string }[] = [
  { type: AccountType.CASH, icon: '💵' },
  { type: AccountType.BANK, icon: '🏦' },
  { type: AccountType.WALLET, icon: '📱' },
  { type: AccountType.SAVINGS, icon: '🐖' },
  { type: AccountType.CREDIT, icon: '💳' },
  { type: AccountType.OTHER, icon: '📂' },
];

const PRESETS = ['bKash', 'Nagad', 'BRAC Bank', 'City Bank', 'Cash Wallet', 'Dutch-Bangla Bank'];

type Props = {
  title: string;
  initial?: Partial<CreateAccountInput>;
  submitLabel: string;
  lockOpeningBalance?: boolean;
  onSubmit: (input: CreateAccountInput) => Promise<void>;
  extra?: ReactNode;
};

export function AccountForm({
  title,
  initial,
  submitLabel,
  lockOpeningBalance,
  onSubmit,
  extra,
}: Props) {
  const { colors, spacing, typography, radius } = useTokens();
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<AccountTypeName>(initial?.type ?? AccountType.CASH);
  const [openingBalance, setOpeningBalance] = useState(initial?.openingBalance ?? '0');
  const [institutionName, setInstitutionName] = useState(initial?.institutionName ?? '');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation
  const nameError = submitted && !name.trim() ? 'Account or wallet name is required' : null;
  const numBalance = parseFloat(openingBalance);
  const isBalanceValid = !isNaN(numBalance);
  const balanceError = submitted && !isBalanceValid ? 'Enter a valid opening balance number' : null;

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!name.trim() || !isBalanceValid) {
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        type,
        currency: initial?.currency ?? 'BDT',
        openingBalance: openingBalance.trim() || '0.00',
        openingBalanceDate: initial?.openingBalanceDate ?? new Date().toISOString().slice(0, 10),
        institutionName: institutionName.trim() || null,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save account');
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
            <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
              WALLET SETUP
            </Text>
            <Text style={[typography.title, { color: colors.textPrimary }]}>{title}</Text>
          </View>

          {/* Quick Presets */}
          <View style={{ gap: spacing.xs }}>
            <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
              Popular Quick Presets
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.xs }}
            >
              {PRESETS.map((preset) => (
                <Pressable
                  key={preset}
                  onPress={() => {
                    setName(preset);
                    if (preset.includes('Bank')) setType(AccountType.BANK);
                    else if (preset === 'Cash Wallet') setType(AccountType.CASH);
                    else setType(AccountType.WALLET);
                    if (submitted) setSubmitted(false);
                  }}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radius.pill,
                    },
                  ]}
                >
                  <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '500' }}>
                    {preset}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <Card style={{ gap: spacing.md, backgroundColor: colors.surfaceElevated }}>
            <Input
              label="Account / Wallet Name"
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (submitted) setSubmitted(false);
              }}
              placeholder="e.g. bKash, BRAC Bank, Daily Cash"
              error={nameError}
              clearable
              onClear={() => setName('')}
            />

            <View style={{ gap: spacing.xs }}>
              <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                Account Type
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {TYPES.map((item) => {
                  const isSelected = type === item.type;
                  return (
                    <Pressable
                      key={item.type}
                      onPress={() => setType(item.type)}
                      style={[
                        styles.typeChip,
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
                        {item.icon} {item.type}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Input
              label="Opening Balance"
              value={openingBalance}
              onChangeText={(t) => {
                setOpeningBalance(t);
                if (submitted) setSubmitted(false);
              }}
              keyboardType="decimal-pad"
              editable={!lockOpeningBalance}
              prefix={initial?.currency ?? 'BDT'}
              error={balanceError}
              helperText={
                lockOpeningBalance ? 'Opening balance is locked after account creation.' : undefined
              }
            />

            <Input
              label="Institution / Bank Name (Optional)"
              value={institutionName}
              onChangeText={setInstitutionName}
              placeholder="e.g. City Bank, Standard Chartered"
              clearable
              onClear={() => setInstitutionName('')}
            />
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
            label={busy ? 'Saving...' : submitLabel}
            loading={busy}
            onPress={() => void handleSubmit()}
            size="lg"
          />

          {extra}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  typeChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChip: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderWidth: 1,
  },
});
