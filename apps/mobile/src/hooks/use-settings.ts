import { useCallback, useEffect, useState } from 'react';
import type { SettingsRecord } from '../database/records';
import { nowIso } from '../lib/clock';
import { useFinance } from '../providers/finance-provider';

const LOCAL_SETTINGS_ID = 'local-user';

export function useSettings() {
  const { settings, nonce, refresh } = useFinance();
  const [record, setRecord] = useState<SettingsRecord | null>(null);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    setRecord(await settings.get());
    setReady(true);
  }, [settings]);

  useEffect(() => {
    void load();
  }, [load, nonce]);

  const completeOnboarding = useCallback(
    async (input: { baseCurrency: string; defaultAccountId: string }) => {
      const now = nowIso();
      const current = await settings.get();
      await settings.upsert({
        id: current?.id ?? LOCAL_SETTINGS_ID,
        displayName: current?.displayName ?? null,
        locale: current?.locale ?? 'en-US',
        timezone: current?.timezone ?? 'Asia/Dhaka',
        theme: current?.theme ?? 'system',
        createdAt: current?.createdAt ?? now,
        baseCurrency: input.baseCurrency,
        defaultAccountId: input.defaultAccountId,
        onboardingCompleted: true,
        updatedAt: now,
      });
      refresh();
    },
    [settings, refresh],
  );

  const updateCurrency = useCallback(
    async (baseCurrency: string) => {
      const current = await settings.get();
      if (!current) return;
      await settings.upsert({ ...current, baseCurrency, updatedAt: nowIso() });
      refresh();
    },
    [settings, refresh],
  );

  return { settings: record, ready, completeOnboarding, updateCurrency, reload: load };
}
