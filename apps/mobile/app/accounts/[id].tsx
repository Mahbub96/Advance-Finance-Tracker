import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { Button } from '../../src/components/Button';
import { AccountForm } from '../../src/features/accounts/components/AccountForm';
import type { AccountRecord } from '../../src/database/records';
import { useFinance } from '../../src/providers/finance-provider';

export default function EditAccountScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accounts, refresh } = useFinance();
  const router = useRouter();
  const [account, setAccount] = useState<AccountRecord | null>(null);

  useEffect(() => {
    if (!id) return;
    void accounts.get(id).then(setAccount);
  }, [accounts, id]);

  if (!account) {
    return <Text>Loading…</Text>;
  }

  return (
    <AccountForm
      title="Edit account"
      initial={account}
      lockOpeningBalance
      submitLabel="Save"
      onSubmit={async (input) => {
        await accounts.update(account.id, {
          name: input.name,
          type: input.type,
          institutionName: input.institutionName,
        });
        refresh();
        router.back();
      }}
      extra={
        <Button
          label={account.isArchived ? 'Restore' : 'Archive'}
          variant="secondary"
          onPress={() => {
            void (
              account.isArchived ? accounts.restore(account.id) : accounts.archive(account.id)
            ).then(() => {
              refresh();
              router.back();
            });
          }}
        />
      }
    />
  );
}
