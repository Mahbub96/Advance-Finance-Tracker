import { AccountType, type AccountType as AccountTypeName } from '@personal-finance/types';
import { useState, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { ScrollScreen } from '../../../components/Screen';
import { useTokens } from '../../../theme/tokens';
import type { CreateAccountInput } from '../services/account-service';

const TYPES: AccountTypeName[] = [
  AccountType.CASH,
  AccountType.BANK,
  AccountType.WALLET,
  AccountType.SAVINGS,
  AccountType.CREDIT,
  AccountType.OTHER,
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
      <Text style={[typography.title, { color: colors.textPrimary }]}>{title}</Text>
      <Input label="Name" value={name} onChangeText={setName} />
      <View style={{ gap: spacing.sm }}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>Type</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {TYPES.map((item) => (
            <Pressable
              key={item}
              onPress={() => setType(item)}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: radius.pill,
                backgroundColor: type === item ? colors.primary : colors.surfaceMuted,
              }}
            >
              <Text
                style={{
                  color: type === item ? colors.primaryForeground : colors.textPrimary,
                }}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Input
        label="Opening balance"
        value={openingBalance}
        onChangeText={setOpeningBalance}
        keyboardType="decimal-pad"
        editable={!lockOpeningBalance}
      />
      <Input label="Institution (optional)" value={institutionName} onChangeText={setInstitutionName} />
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
      <Button
        label={submitLabel}
        disabled={busy}
        onPress={() => {
          setBusy(true);
          setError(null);
          void onSubmit({
            name,
            type,
            currency: initial?.currency ?? 'BDT',
            openingBalance,
            openingBalanceDate: initial?.openingBalanceDate ?? new Date().toISOString().slice(0, 10),
            institutionName,
          })
            .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not save'))
            .finally(() => setBusy(false));
        }}
      />
      {extra}
    </ScrollScreen>
  );
}
