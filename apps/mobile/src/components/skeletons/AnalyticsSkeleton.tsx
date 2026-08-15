import { View } from 'react-native';
import { Card } from '../Card';
import { ScrollScreen } from '../Screen';
import { SkeletonBox, SkeletonCircle, SkeletonText } from '../Skeleton';
import { useTokens } from '../../theme/tokens';

export function AnalyticsSkeleton() {
  const { colors, spacing, radius } = useTokens();

  return (
    <ScrollScreen>
      {/* Header & Export Button Skeleton */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 4 }}>
          <SkeletonText width={120} height={12} />
          <SkeletonText width={130} height={24} />
        </View>
        <SkeletonBox width={90} height={36} borderRadius={radius.md} />
      </View>

      {/* Month Navigator Skeleton */}
      <SkeletonBox width="100%" height={44} borderRadius={radius.md} />

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

      {/* Overview Stat Cards Skeleton */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              padding: 12,
              borderRadius: radius.lg,
              alignItems: 'center',
              gap: 6,
            }}
          >
            <SkeletonText width={44} height={11} />
            <SkeletonText width={64} height={15} />
          </View>
        ))}
      </View>

      {/* Donut / Bar Chart Hero Card Skeleton */}
      <Card
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          gap: spacing.md,
          alignItems: 'center',
          paddingVertical: spacing.lg,
        }}
      >
        <SkeletonText width={160} height={16} style={{ alignSelf: 'flex-start' }} />
        <SkeletonCircle size={160} />
      </Card>

      {/* Category List Skeletons */}
      <View style={{ gap: spacing.xs }}>
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              paddingVertical: 12,
              paddingHorizontal: spacing.md,
              gap: 8,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <SkeletonCircle size={10} />
                <SkeletonText width={100} height={15} />
              </View>
              <SkeletonText width={70} height={15} />
            </View>
            <SkeletonBox width="100%" height={6} borderRadius={radius.pill} />
          </Card>
        ))}
      </View>
    </ScrollScreen>
  );
}
