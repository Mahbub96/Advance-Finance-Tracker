import { AccountType, type AccountType as AccountTypeName } from '@personal-finance/types';
import { useState, type ReactNode } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Input } from '../../../components/Input';
import { ScrollScreen } from '../../../components/Screen';
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
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <ScrollScreen>
      <View style={{ gap: 2 }}>
        <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>WALLET SETUP</Text>
        <Text style={[typography.title, { color: colors.textPrimary }]}>{title}</Text>
      </View>

      <Card style={{ gap: spacing.md, backgroundColor: colors.surfaceElevated }}>
        <Input
          label="Account / Wallet Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. bKash, BRAC Bank, Daily Cash"
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
          onChangeText={setOpeningBalance}
          keyboardType="decimal-pad"
          editable={!lockOpeningBalance}
          prefix={initial?.currency ?? 'BDT'}
          helperText={lockOpeningBalance ? 'Opening balance is locked after creation.' : undefined}
        />

        <Input
          label="Institution / Bank Name (Optional)"
          value={institutionName}
          onChangeText={setInstitutionName}
          placeholder="e.g. City Bank, Standard Chartered"
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
        onPress={() => {
          setBusy(true);
          setError(null);
          void onSubmit({
            name: name.trim(),
            type,
            currency: initial?.currency ?? 'BDT',
            openingBalance: openingBalance.trim(),
            openingBalanceDate:
              initial?.openingBalanceDate ?? new Date().toISOString().slice(0, 10),
            institutionName: institutionName.trim() || null,
          })
            .catch((err: unknown) =>
              setError(err instanceof Error ? err.message : 'Could not save'),
            )
            .finally(() => setBusy(false));
        }}
        size="lg"
      />

      {extra}
    </ScrollScreen>
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
});
