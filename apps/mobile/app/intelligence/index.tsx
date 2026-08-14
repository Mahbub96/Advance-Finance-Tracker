import { formatMoneyDisplay } from '@personal-finance/types';
import { type Href, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Badge, type BadgeVariant } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { ProgressBar } from '../../src/components/ProgressBar';
import { ScrollScreen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { StatCard } from '../../src/components/StatCard';
import { TrendLineChart } from '../../src/components/charts/TrendLineChart';
import { useAccounts } from '../../src/hooks/use-accounts';
import { useBudgets } from '../../src/hooks/use-budgets';
import { useIntelligence } from '../../src/hooks/use-intelligence';
import { useSettings } from '../../src/hooks/use-settings';
import { useFinance } from '../../src/providers/finance-provider';
import { useTokens } from '../../src/theme/tokens';
import {
  AIAssistantService,
  type ChatMessage,
} from '../../src/features/intelligence/services/ai-assistant-service';

type IntelligenceTab = 'ASSISTANT' | 'OVERVIEW' | 'FORECAST';

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

const QUICK_PROMPTS = [
  'How much did I spend on food?',
  'Am I on track this month?',
  'Why did my expenses increase?',
  'When will I reach my savings goal?',
];

export default function IntelligenceScreen() {
  const { colors, typography, spacing, radius } = useTokens();
  const { forecast, healthScore, insights } = useIntelligence();
  const { accounts, totalBalance } = useAccounts();
  const { budgets } = useBudgets();
  const { settings } = useSettings();
  const { analytics, nonce } = useFinance();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<IntelligenceTab>('ASSISTANT');
  const [chatQuery, setChatQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [trajectoryPoints, setTrajectoryPoints] = useState<
    Array<{ day: number; label: string; value: number }>
  >([]);

  useEffect(() => {
    void analytics.getDailySpendingTrajectory().then(setTrajectoryPoints);
  }, [analytics, nonce]);

  const currency = settings?.baseCurrency ?? 'BDT';
  const userName = settings?.displayName ?? 'Ahmed';

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

  const handleSendQuery = (textToSend?: string) => {
    const query = (textToSend || chatQuery).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const aiMsg = AIAssistantService.generateResponse(query, {
      userName,
      currency,
      totalBalance,
      accounts,
      budgets,
      forecast,
      healthScore,
    });

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setChatQuery('');
  };

  const navTabs = [
    { id: 'ASSISTANT' as const, label: '✨ Assistant' },
    { id: 'OVERVIEW' as const, label: 'Overview' },
    { id: 'FORECAST' as const, label: 'Trends' },
  ];

  return (
    <ScrollScreen>
      {/* Header */}
      <View style={{ gap: 2 }}>
        <Text style={[typography.captionMedium, { color: colors.textTertiary }]}>
          AUTONOMOUS INTELLIGENCE
        </Text>
        <Text style={[typography.title, { color: colors.textPrimary }]}>AI Assistant & Hub</Text>
      </View>

      {/* Tabs */}
      <SegmentedControl options={navTabs} value={activeTab} onChange={setActiveTab} />

      {/* TAB 1: AI ASSISTANT CHAT */}
      {activeTab === 'ASSISTANT' && (
        <View style={{ gap: spacing.md }}>
          {/* Greeting Hero Card */}
          <Card
            style={{
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              gap: spacing.sm,
              paddingVertical: spacing.lg,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View
                style={[
                  styles.aiAvatar,
                  {
                    backgroundColor: colors.primaryMuted,
                    borderRadius: radius.pill,
                  },
                ]}
              >
                <Text style={{ fontSize: 22 }}>🤖</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[typography.title, { color: colors.textPrimary, fontSize: 20 }]}>
                  Hi {userName}! 👋
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Ask me anything about your finances or spending habits.
                </Text>
              </View>
            </View>

            {/* Quick Prompts Chips */}
            <View style={{ gap: spacing.xs, marginTop: spacing.xs }}>
              <Text style={[typography.micro, { color: colors.textTertiary }]}>
                SUGGESTED QUESTIONS
              </Text>
              <View style={{ gap: 6 }}>
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => handleSendQuery(prompt)}
                    style={({ pressed }) => [
                      styles.promptChip,
                      {
                        backgroundColor: colors.surfaceMuted,
                        borderColor: colors.border,
                        borderRadius: radius.md,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 13, color: colors.primary, fontWeight: '500' }}>
                      💬 {prompt}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </Card>

          {/* Chat Messages Feed */}
          {messages.length > 0 && (
            <View style={{ gap: spacing.sm }}>
              <SectionHeader title="Conversation" />
              {messages.map((msg) => {
                const isAi = msg.sender === 'ai';
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageBubble,
                      {
                        alignSelf: isAi ? 'flex-start' : 'flex-end',
                        backgroundColor: isAi ? colors.surface : colors.primary,
                        borderColor: isAi ? colors.border : colors.primary,
                        borderRadius: radius.lg,
                        maxWidth: '88%',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.body,
                        {
                          color: isAi ? colors.textPrimary : colors.primaryForeground,
                          fontSize: 14,
                        },
                      ]}
                    >
                      {msg.text}
                    </Text>

                    {msg.actionRoute && msg.actionLabel && (
                      <View style={{ marginTop: spacing.xs, alignSelf: 'flex-start' }}>
                        <Button
                          label={`${msg.actionLabel} →`}
                          size="sm"
                          variant={isAi ? 'outline' : 'secondary'}
                          onPress={() => router.push(msg.actionRoute as Href)}
                        />
                      </View>
                    )}

                    <Text
                      style={[
                        typography.micro,
                        {
                          color: isAi ? colors.textTertiary : 'rgba(255, 255, 255, 0.7)',
                          alignSelf: 'flex-end',
                          marginTop: 4,
                        },
                      ]}
                    >
                      {msg.timestamp}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Interactive Chat Input */}
          <View style={[styles.inputRow, { gap: spacing.xs, alignItems: 'center' }]}>
            <View style={{ flex: 1 }}>
              <Input
                label=""
                placeholder="Ask a financial question..."
                value={chatQuery}
                onChangeText={setChatQuery}
              />
            </View>
            <Pressable
              onPress={() => handleSendQuery()}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: radius.pill,
                },
              ]}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>➤</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* TAB 2: OVERVIEW & HEALTH SCORE */}
      {activeTab === 'OVERVIEW' && (
        <View style={{ gap: spacing.md }}>
          {/* Key Insight Card */}
          {insights[0] && (
            <Card
              style={{
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                gap: spacing.xs,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <Text style={{ fontSize: 18 }}>💡</Text>
                <Text
                  style={[typography.sectionTitle, { color: colors.textPrimary, fontSize: 16 }]}
                >
                  Key Insight
                </Text>
              </View>
              <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4 }]}>
                {insights[0].description}
              </Text>
            </Card>
          )}

          {/* Financial Health Score Hero Card */}
          <Card
            style={{ gap: spacing.md, backgroundColor: colors.surface, borderColor: colors.border }}
          >
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
                  <Text style={[typography.display, { color: scoreColor, fontSize: 38 }]}>
                    {score}
                  </Text>
                  <Text style={{ color: colors.textTertiary, fontSize: 18 }}>/ 100</Text>
                </View>
              </View>
              <Badge label={ratingLabel(rating)} variant={badgeVariant} dot />
            </View>

            <ProgressBar progressPercent={score} color={scoreColor} height={10} />

            {/* Drivers */}
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

          {/* Recommendations Feed */}
          <View style={{ gap: spacing.sm }}>
            <SectionHeader title="Actionable Insights" />
            {insights.map((insight) => (
              <Card
                key={insight.id}
                style={{
                  gap: spacing.sm,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={[typography.sectionTitle, { color: colors.textPrimary, fontSize: 15 }]}
                  >
                    {insight.title}
                  </Text>
                  <Badge label={insight.type} variant="neutral" size="sm" />
                </View>
                <Text style={[typography.body, { color: colors.textSecondary, fontSize: 14 }]}>
                  {insight.description}
                </Text>
                {insight.actionRoute && insight.actionLabel && (
                  <View style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                    <Button
                      label={`${insight.actionLabel} →`}
                      variant="outline"
                      size="sm"
                      onPress={() => router.push(insight.actionRoute as Href)}
                    />
                  </View>
                )}
              </Card>
            ))}
          </View>
        </View>
      )}

      {/* TAB 3: TRENDS & FORECAST */}
      {activeTab === 'FORECAST' && (
        <View style={{ gap: spacing.md }}>
          {/* Spending Trend Line Chart */}
          <Card
            style={{ backgroundColor: colors.surface, borderColor: colors.border, gap: spacing.md }}
          >
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
              Spending Trend
            </Text>
            <TrendLineChart
              points={
                trajectoryPoints.length > 0
                  ? trajectoryPoints
                  : [
                      { label: 'Day 1', value: 0 },
                      { label: 'Today', value: parseFloat(forecast?.currentSpend || '0') },
                    ]
              }
              height={120}
            />
          </Card>

          {/* Velocity & Burn Rate Metrics */}
          {forecast && (
            <View style={{ gap: spacing.sm }}>
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
                  subtitle={`${forecast.daysRemaining} days left`}
                  indicatorColor={colors.expense}
                  icon="🔥"
                />
              </View>

              <Card
                style={{
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  gap: spacing.xs,
                }}
              >
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
                  <Text
                    style={[typography.numericLarge, { color: colors.textPrimary, fontSize: 20 }]}
                  >
                    {formatMoneyDisplay(forecast.projectedMonthEndSpend, currency)}
                  </Text>
                </View>
                <Text style={[typography.caption, { color: colors.textTertiary, fontSize: 12 }]}>
                  Estimated total spending by month end if current velocity continues unchanged.
                </Text>
              </Card>
            </View>
          )}
        </View>
      )}
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  aiAvatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  messageBubble: {
    padding: 12,
    borderWidth: 1,
    gap: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sendBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
