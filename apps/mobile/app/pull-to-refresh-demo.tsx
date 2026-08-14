import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTokens } from '../src/theme/tokens';
import { Card } from '../src/components/Card';
import { Badge } from '../src/components/Badge';
import { Button } from '../src/components/Button';
import { PullToRefresh, type RefreshState } from '../src/components/pull-to-refresh';

export default function PullToRefreshDemoScreen() {
  const { colors, typography, spacing, radius } = useTokens();

  const [currentState, setCurrentState] = useState<RefreshState>('idle');
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);
  const [simulateError, setSimulateError] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    // Artificial network / async delay
    await new Promise((resolve) => setTimeout(resolve, 1400));

    if (simulateError) {
      throw new Error('Simulated network failure');
    }

    setRefreshCount((c) => c + 1);
    setLastRefreshedAt(new Date().toLocaleTimeString());
  }, [simulateError]);

  const stateColor =
    currentState === 'completed'
      ? colors.income
      : currentState === 'error'
        ? colors.expense
        : currentState === 'ready'
          ? colors.primary
          : currentState === 'refreshing'
            ? colors.warning
            : colors.textSecondary;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Pull-to-Refresh Demo',
          headerShown: true,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
        }}
      />

      <PullToRefresh
        onRefresh={handleRefresh}
        refreshing={isManualRefreshing}
        reducedMotion={reducedMotion}
        enableHaptics={hapticsEnabled}
        onStateChange={setCurrentState}
        threshold={72}
        maxPull={120}
        resistance={110}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { padding: spacing.lg, gap: spacing.md }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Hero Banner */}
          <Card style={[styles.heroCard, { backgroundColor: colors.surfaceElevated }]}>
            <View style={styles.heroRow}>
              <View>
                <Text style={[typography.title, { color: colors.textPrimary }]}>
                  Pull-to-Refresh 2026
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                  Fluid, non-linear elastic physics & vector progress ring
                </Text>
              </View>
              <Badge
                label={currentState.toUpperCase()}
                variant={
                  currentState === 'ready' || currentState === 'completed'
                    ? 'success'
                    : currentState === 'error'
                      ? 'danger'
                      : 'neutral'
                }
              />
            </View>

            {/* Live telemetry row */}
            <View style={[styles.telemetryContainer, { backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: spacing.md }]}>
              <View style={styles.statItem}>
                <Text style={[typography.caption, { color: colors.textTertiary }]}>Active State</Text>
                <Text style={[typography.body, { color: stateColor, fontWeight: '700' }]}>
                  {currentState}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[typography.caption, { color: colors.textTertiary }]}>Sync Count</Text>
                <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '700' }]}>
                  {refreshCount}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[typography.caption, { color: colors.textTertiary }]}>Last Sync</Text>
                <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                  {lastRefreshedAt ?? 'Never'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Core Rules Guide Card */}
          <Card style={{ backgroundColor: colors.surface }}>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
              🎯 Core Interaction Rules
            </Text>
            <View style={{ gap: spacing.xs }}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                • <Text style={{ fontWeight: '600', color: colors.textPrimary }}>Pull downward</Text>: Rubber-band stretch with exponential resistance.
              </Text>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                • <Text style={{ fontWeight: '600', color: colors.textPrimary }}>Circular ring</Text>: Fills dynamically from 0% to 100% threshold.
              </Text>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                • <Text style={{ fontWeight: '700', color: colors.expense }}>Release before 100%</Text>: Springs back to 0. <Text style={{ fontWeight: '700' }}>DOES NOT RELOAD</Text>.
              </Text>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                • <Text style={{ fontWeight: '700', color: colors.income }}>Release at 100%</Text>: Locks state, enters loading spinner, updates data, and confirms.
              </Text>
            </View>
          </Card>

          {/* Test Controls & Toggles */}
          <Card style={{ backgroundColor: colors.surface, gap: spacing.md }}>
            <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>
              ⚙️ Interactive Controls & Test Scenarios
            </Text>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                  Simulate Network Error
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Test error recovery state & haptics
                </Text>
              </View>
              <Switch
                value={simulateError}
                onValueChange={setSimulateError}
                trackColor={{ false: colors.surfaceMuted, true: colors.expense }}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                  Reduced Motion Mode
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Accessible direct transitions without heavy spring bounce
                </Text>
              </View>
              <Switch
                value={reducedMotion}
                onValueChange={setReducedMotion}
                trackColor={{ false: colors.surfaceMuted, true: colors.primary }}
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                  Tactile Haptics
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Threshold, success, and cancel vibrations
                </Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={setHapticsEnabled}
                trackColor={{ false: colors.surfaceMuted, true: colors.primary }}
              />
            </View>

            <Button
              label={isManualRefreshing ? 'Refreshing...' : 'Trigger Programmatic Refresh'}
              variant="outline"
              loading={isManualRefreshing}
              onPress={async () => {
                setIsManualRefreshing(true);
                try {
                  await handleRefresh();
                } catch {
                  // handled
                } finally {
                  setIsManualRefreshing(false);
                }
              }}
            />
          </Card>

          {/* Sample Ledger Items */}
          <Text style={[typography.sectionTitle, { color: colors.textPrimary, marginTop: spacing.sm }]}>
            Recent Transactions (Pull down to test)
          </Text>

          {[
            { id: '1', title: 'Whole Foods Market', amount: '-$84.20', date: 'Today, 2:15 PM', category: 'Groceries' },
            { id: '2', title: 'Salary Direct Deposit', amount: '+$3,450.00', date: 'Yesterday', category: 'Income' },
            { id: '3', title: 'Blue Bottle Coffee', amount: '-$6.50', date: 'Aug 14', category: 'Dining' },
            { id: '4', title: 'Apple Subscription', amount: '-$14.99', date: 'Aug 12', category: 'Services' },
          ].map((item) => (
            <Card key={item.id} style={[styles.sampleRow, { backgroundColor: colors.surface }]}>
              <View>
                <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                  {item.title}
                </Text>
                <Text style={[typography.caption, { color: colors.textTertiary }]}>
                  {item.category} • {item.date}
                </Text>
              </View>
              <Text
                style={[
                  typography.body,
                  {
                    fontWeight: '700',
                    color: item.amount.startsWith('+') ? colors.income : colors.textPrimary,
                  },
                ]}
              >
                {item.amount}
              </Text>
            </Card>
          ))}
        </ScrollView>
      </PullToRefresh>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 48,
  },
  heroCard: {
    gap: 14,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  telemetryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#8882',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sampleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
