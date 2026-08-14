import { useCallback, useEffect, useState } from 'react';
import type { MonthForecast } from '../features/intelligence/services/forecasting-service';
import type { FinancialHealthResult } from '../features/intelligence/services/health-service';
import type { FinancialInsight } from '../features/intelligence/services/insights-service';
import { useFinance } from '../providers/finance-provider';

export function useIntelligence() {
  const { forecasting, health, insights, nonce } = useFinance();

  const [forecast, setForecast] = useState<MonthForecast | null>(null);
  const [healthScore, setHealthScore] = useState<FinancialHealthResult | null>(null);
  const [insightList, setInsightList] = useState<FinancialInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [f, h, i] = await Promise.all([
        forecasting.getMonthForecast(),
        health.calculateHealth(),
        insights.generateInsights(),
      ]);
      setForecast(f);
      setHealthScore(h);
      setInsightList(i);
    } finally {
      setLoading(false);
    }
  }, [forecasting, health, insights]);

  useEffect(() => {
    void load();
  }, [load, nonce]);

  return {
    forecast,
    healthScore,
    insights: insightList,
    loading,
    reload: load,
  };
}
