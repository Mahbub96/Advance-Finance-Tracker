import { formatMoneyDisplay } from '@personal-finance/types';
import { type Href, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { Badge, type BadgeVariant } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { ProgressBar } from '../../src/components/ProgressBar';
import { ScrollScreen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { StatCard } from '../../src/components/StatCard';
import { useIntelligence } from '../../src/hooks/use-intelligence';
import { useSettings } from '../../src/hooks/use-settings';
import { useTokens } from '../../src/theme/tokens';

function ratingBadgeVariant(rating: string): BadgeVariant {
  switch (rating) {
    case 'EXCELLENT':
      return 'success';
    case 'GOOD':
      return 'primary';
    case 'FAIR':
      return 'warning';
    case 'ATTENTION_NEEDED':
      return 'danger';
    default:
      return 'neutral';
  }
}

function ratingLabel(rating: string): string {
  switch (rating) {
    case 'EXCELLENT':
      return 'Excellent';
    case 'GOOD':
      return 'Good Standing';
    case 'FAIR':
      return 'Fair - Room to Grow';
    case 'ATTENTION_NEEDED':
      return 'Needs Attention';
    default:
      return rating;
  }
}

export default function IntelligenceScreen() {
  const { colors, typography, spacing } = useTokens();
  const { forecast, healthScore, insights } = useIntelligence();
  const { settings } = useSettings();
  const currency = settings?.baseCurrency ?? 'BDT';
  const router = useRouter();

  const score = healthScore?.score ?? 0;
  const rating = healthScore?.rating ?? 'FAIR';
  const badgeVariant = ratingBadgeVariant(rating);
  const scoreColor =
    rating === 'EXCELLENT'
      ? colors.income
      : rating === 'GOOD'
        ? colors.primary
        : rating === 'FAIR'
          ? colors.warning
          : colors.danger;

  return (
    <ScrollScreen>
      {/* Header */}
      <View style={{ gap: 2 }}>
        <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
          AUTONOMOUS INSIGHTS
        </Text>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Intelligence Hub</Text>
      </View>

      {/* 1. Financial Health Score Hero Card */}
      <Card style={{ gap: spacing.md, backgroundColor: colors.surfaceElevated }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <View style={{ gap: spacing.xs }}>
            <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
              FINANCIAL HEALTH SCORE
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs }}>
              <Text style={[typography.display, { color: scoreColor, fontSize: 40 }]}>{score}</Text>
              <Text style={{ color: colors.textTertiary, fontSize: 18 }}>/ 100</Text>
            </View>
          </View>
          <Badge label={ratingLabel(rating)} variant={badgeVariant} dot />
        </View>

        {/* Health Score Progress Bar */}
        <ProgressBar progressPercent={score} color={scoreColor} height={10} />

        {/* Positive & Attention Drivers */}
        <View style={{ gap: spacing.xs, paddingTop: spacing.xs }}>
          {healthScore?.positiveDrivers.map((driver, idx) => (
            <View
              key={`pos-${idx}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
                backgroundColor: colors.incomeMuted,
                paddingVertical: 6,
                paddingHorizontal: spacing.sm,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: colors.income, fontSize: 13, fontWeight: '700' }}>✓</Text>
              <Text style={{ color: colors.textPrimary, fontSize: 13, flex: 1 }}>{driver}</Text>
            </View>
          ))}

          {healthScore?.attentionDrivers.map((driver, idx) => (
            <View
              key={`att-${idx}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
                backgroundColor: colors.warningMuted,
                paddingVertical: 6,
                paddingHorizontal: spacing.sm,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: colors.warning, fontSize: 13, fontWeight: '700' }}>⚠</Text>
              <Text style={{ color: colors.textPrimary, fontSize: 13, flex: 1 }}>{driver}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* 2. Spending Velocity & Month-End Forecast */}
      {forecast && (
        <View style={{ gap: spacing.sm }}>
          <SectionHeader title="Spending Velocity & Forecast" />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <StatCard
              label="Spent So Far"
              value={formatMoneyDisplay(forecast.currentSpend, currency)}
              subtitle={`Day ${forecast.currentDay} of ${forecast.totalDays}`}
              icon="💳"
            />
            <StatCard
              label="Daily Burn Rate"
              value={`${formatMoneyDisplay(forecast.dailyBurnRate, currency)}`}
              subtitle={`${forecast.daysRemaining} days remaining`}
              indicatorColor={colors.expense}
              icon="🔥"
            />
          </View>

          <Card style={{ backgroundColor: colors.surfaceSubtle, gap: spacing.xs }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={[typography.captionMedium, { color: colors.textSecondary }]}>
                Projected Month-End Spend
              </Text>
              <Text style={[typography.numericLarge, { color: colors.textPrimary, fontSize: 20 }]}>
                {formatMoneyDisplay(forecast.projectedMonthEndSpend, currency)}
              </Text>
            </View>
            <Text style={[typography.caption, { color: colors.textTertiary, fontSize: 12 }]}>
              Estimated total month spending if current velocity continues unchanged.
            </Text>
          </Card>
        </View>
      )}

      {/* 3. Contextual AI Recommendations Feed */}
      <View style={{ gap: spacing.md }}>
        <SectionHeader
          title="Contextual Recommendations"
          badge={insights.length ? `${insights.length} active` : undefined}
        />

        {insights.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="All systems optimal"
            description="No immediate financial warnings or budget alerts. You are on track with your finances!"
          />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {insights.map((insight) => {
              const isWarning = insight.type === 'WARNING';
              const isAchievement = insight.type === 'ACHIEVEMENT';
              const badgeType: BadgeVariant = isWarning
                ? 'danger'
                : isAchievement
                  ? 'success'
                  : 'primary';

              return (
                <Card key={insight.id} style={{ gap: spacing.sm }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.xs,
                        flex: 1,
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>
                        {isWarning ? '⚠️' : isAchievement ? '🎉' : '💡'}
                      </Text>
                      <Text
                        style={[
                          typography.sectionTitle,
                          { color: colors.textPrimary, fontSize: 15 },
                        ]}
                        numberOfLines={1}
                      >
                        {insight.title}
                      </Text>
                    </View>
                    <Badge label={insight.type} variant={badgeType} size="sm" />
                  </View>

                  <Text style={[typography.body, { color: colors.textSecondary, fontSize: 14 }]}>
                    {insight.description}
                  </Text>

                  {insight.actionLabel && insight.actionRoute && (
                    <View style={{ marginTop: spacing.xs, alignSelf: 'flex-start' }}>
                      <Button
                        label={`${insight.actionLabel} →`}
                        variant="outline"
                        size="sm"
                        onPress={() => router.push(insight.actionRoute as Href)}
                      />
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        )}
      </View>
    </ScrollScreen>
  );
}
