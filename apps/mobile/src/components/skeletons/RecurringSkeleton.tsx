import { View } from 'react-native';
import { Card } from '../Card';
import { ScrollScreen } from '../Screen';
import { SkeletonBox, SkeletonText } from '../Skeleton';
import { useTokens } from '../../theme/tokens';

export function RecurringSkeleton() {
  const { colors, spacing, radius } = useTokens();

  return (
    <ScrollScreen>
      {/* Header Skeleton */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 4 }}>
          <SkeletonText width={140} height={12} />
          <SkeletonText width={110} height={24} />
        </View>
        <SkeletonBox width={120} height={36} borderRadius={radius.md} />
      </View>

      {/* Monthly Commitments Hero Banner Skeleton */}
      <Card
        style={{
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          gap: spacing.xs,
          padding: spacing.md,
        }}
      >
        <SkeletonText width={160} height={13} />
        <SkeletonText width={180} height={28} />
        <SkeletonText width={140} height={11} />
      </Card>

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
        <SkeletonBox width="48%" height={34} borderRadius={radius.sm} />
        <SkeletonBox width="48%" height={34} borderRadius={radius.sm} />
      </View>

      {/* Rules List Skeleton */}
      <View style={{ gap: spacing.sm }}>
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            style={{
              gap: spacing.md,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
                <SkeletonBox width={44} height={44} borderRadius={radius.md} />
                <View style={{ flex: 1, gap: 6 }}>
                  <SkeletonText width="55%" height={16} />
                  <SkeletonText width="40%" height={12} />
                </View>
              </View>
              <SkeletonBox width={64} height={20} borderRadius={radius.pill} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <SkeletonText width={120} height={12} />
              <SkeletonText width={80} height={16} />
            </View>

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm }}>
              <SkeletonBox width={85} height={28} borderRadius={radius.sm} />
              <SkeletonBox width={65} height={28} borderRadius={radius.sm} />
              <SkeletonBox width={55} height={28} borderRadius={radius.sm} />
            </View>
          </Card>
        ))}
      </View>
    </ScrollScreen>
  );
}
