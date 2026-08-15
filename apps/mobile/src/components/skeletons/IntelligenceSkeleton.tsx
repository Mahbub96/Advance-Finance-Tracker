import { View } from 'react-native';
import { Card } from '../Card';
import { ScrollScreen } from '../Screen';
import { SkeletonBox, SkeletonCircle, SkeletonText } from '../Skeleton';
import { useTokens } from '../../theme/tokens';

export function IntelligenceSkeleton() {
  const { colors, spacing, radius } = useTokens();

  return (
    <ScrollScreen>
      {/* Header Skeleton */}
      <View style={{ gap: 4 }}>
        <SkeletonText width={120} height={12} />
        <SkeletonText width={180} height={24} />
      </View>

      {/* Segmented Control Skeleton */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.surfaceMuted,
          padding: 4,
          borderRadius: radius.md,
          gap: 4,
        }}
      >
        <SkeletonBox width="32%" height={34} borderRadius={radius.sm} />
        <SkeletonBox width="32%" height={34} borderRadius={radius.sm} />
        <SkeletonBox width="32%" height={34} borderRadius={radius.sm} />
      </View>

      {/* Financial Health Score Gauge Card Skeleton */}
      <Card
        style={{
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          gap: spacing.md,
          padding: spacing.lg,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ gap: 6 }}>
            <SkeletonText width={140} height={13} />
            <SkeletonText width={90} height={36} />
          </View>
          <SkeletonBox width={80} height={26} borderRadius={radius.pill} />
        </View>

        {/* 4 Score Component Progress Bars Skeleton */}
        <View style={{ gap: spacing.sm }}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <SkeletonText width={100} height={12} />
                <SkeletonText width={40} height={12} />
              </View>
              <SkeletonBox width="100%" height={6} borderRadius={radius.pill} />
            </View>
          ))}
        </View>
      </Card>

      {/* 2-Column Burn Rate & Safe Daily Spend StatCards Skeleton */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {[1, 2].map((i) => (
          <Card key={i} style={{ flex: 1, backgroundColor: colors.surface, padding: spacing.md, gap: 6 }}>
            <SkeletonText width={90} height={12} />
            <SkeletonText width={110} height={20} />
          </Card>
        ))}
      </View>

      {/* AI Insights Advice Cards Skeleton */}
      <View style={{ gap: spacing.xs }}>
        <SkeletonText width={150} height={16} />
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              padding: spacing.md,
              gap: 8,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <SkeletonText width={140} height={15} />
              <SkeletonCircle size={18} />
            </View>
            <SkeletonText width="90%" height={13} />
            <SkeletonText width="70%" height={13} />
          </Card>
        ))}
      </View>
    </ScrollScreen>
  );
}
