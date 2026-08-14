import { formatMoneyDisplay } from '@personal-finance/types';
import { type Href, useRouter } from 'expo-router';

import { Pressable, Text, View } from 'react-native';
import { Card } from '../../src/components/Card';
import { ScrollScreen } from '../../src/components/Screen';
import { useIntelligence } from '../../src/hooks/use-intelligence';
import { useSettings } from '../../src/hooks/use-settings';
import { useTokens } from '../../src/theme/tokens';

import type { lightColors } from '../../src/theme/tokens';

function ratingColor(rating: string, colors: typeof lightColors): string {
  switch (rating) {
    case 'EXCELLENT':
      return colors.income;
    case 'GOOD':
      return colors.primary;
    case 'FAIR':
      return colors.warning;
    case 'ATTENTION_NEEDED':
      return colors.danger;
    default:
      return colors.textSecondary;
  }
}


function ratingLabel(rating: string): string {
  switch (rating) {
    case 'EXCELLENT':
      return 'Excellent';
    case 'GOOD':
      return 'Good';
    case 'FAIR':
      return 'Fair';
    case 'ATTENTION_NEEDED':
      return 'Needs Attention';
    default:
      return rating;
  }
}

export default function IntelligenceScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { forecast, healthScore, insights } = useIntelligence();
  const { settings } = useSettings();
  const currency = settings?.baseCurrency ?? 'BDT';
  const router = useRouter();

  const score = healthScore?.score ?? 0;
  const rating = healthScore?.rating ?? 'FAIR';
  const scoreColor = ratingColor(rating, colors);


  return (
    <ScrollScreen>
      <Text style={[typography.title, { color: colors.textPrimary }]}>Intelligence Hub</Text>
      
      {/* 1. Financial Health Score Card */}
      <Card style={{ gap: spacing.md, backgroundColor: colors.surface }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>FINANCIAL HEALTH SCORE</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs, marginTop: spacing.xs }}>
              <Text style={[typography.display, { color: scoreColor, fontSize: 36 }]}>{score}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>/ 100</Text>
            </View>
          </View>
          <View
            style={{
              paddingVertical: spacing.xs,
              paddingHorizontal: spacing.sm,
              borderRadius: radius.pill,
              backgroundColor: scoreColor + '20',
            }}
          >
            <Text style={{ color: scoreColor, fontWeight: '700', fontSize: 13 }}>
              {ratingLabel(rating)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={{ height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted }}>
          <View
            style={{
              width: `${Math.min(100, score)}%`,
              height: 8,
              borderRadius: radius.pill,
              backgroundColor: scoreColor,
            }}
          />
        </View>

        {/* Drivers */}
        <View style={{ gap: spacing.xs }}>
          {healthScore?.positiveDrivers.map((driver, idx) => (
            <Text key={`pos-${idx}`} style={{ color: colors.income, fontSize: 13 }}>
              ✓ {driver}
            </Text>
          ))}
          {healthScore?.attentionDrivers.map((driver, idx) => (
            <Text key={`att-${idx}`} style={{ color: colors.warning, fontSize: 13 }}>
              ⚠ {driver}
            </Text>
          ))}
        </View>
      </Card>

      {/* 2. Month-End Spending Velocity & Forecast */}
      {forecast && (
        <Card style={{ gap: spacing.sm }}>
          <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
            Spending Velocity & Forecast
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: spacing.xs }}>
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Spent so far</Text>
              <Text style={[typography.numericLarge, { color: colors.textPrimary, fontSize: 18 }]}>
                {formatMoneyDisplay(forecast.currentSpend, currency)}
              </Text>
            </View>
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Daily Burn Rate</Text>
              <Text style={[typography.numericLarge, { color: colors.expense, fontSize: 18 }]}>
                {formatMoneyDisplay(forecast.dailyBurnRate, currency)}/day
              </Text>
            </View>
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Month-End Est.</Text>
              <Text style={[typography.numericLarge, { color: colors.textPrimary, fontSize: 18 }]}>
                {formatMoneyDisplay(forecast.projectedMonthEndSpend, currency)}
              </Text>
            </View>
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            Based on Day {forecast.currentDay} of {forecast.totalDays} ({forecast.daysRemaining} days remaining in this month).
          </Text>
        </Card>
      )}

      {/* 3. AI Insights & Actionable Recommendations Feed */}
      <View style={{ gap: spacing.sm }}>
        <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
          Contextual Insights & Guidance
        </Text>
        
        {insights.length === 0 ? (
          <Card>
            <Text style={{ color: colors.textSecondary }}>
              No immediate financial warnings or alerts. You are on track!
            </Text>
          </Card>
        ) : null}

        {insights.map((insight) => {
          const isWarning = insight.type === 'WARNING';
          const isAchievement = insight.type === 'ACHIEVEMENT';
          const iconColor = isWarning ? colors.danger : isAchievement ? colors.income : colors.primary;

          return (
            <Card key={insight.id} style={{ gap: spacing.xs }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <Text style={{ fontSize: 14 }}>
                  {isWarning ? '⚠️' : isAchievement ? '🎉' : '💡'}
                </Text>
                <Text style={[typography.sectionTitle, { color: iconColor, flex: 1 }]}>
                  {insight.title}
                </Text>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 20 }}>
                {insight.description}
              </Text>
              {insight.actionLabel && insight.actionRoute && (
                <Pressable
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  onPress={() => router.push(insight.actionRoute as Href)}
                  style={{ alignSelf: 'flex-start', marginTop: spacing.xs }}
                >
                  <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>
                    {insight.actionLabel} →
                  </Text>
                </Pressable>
              )}

            </Card>
          );
        })}
      </View>
    </ScrollScreen>
  );
}
