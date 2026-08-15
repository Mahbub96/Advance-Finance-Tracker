import { View } from 'react-native';
import { Card } from '../Card';
import { ScrollScreen } from '../Screen';
import { SkeletonBox, SkeletonText } from '../Skeleton';
import { useTokens } from '../../theme/tokens';

export function GoalsSkeleton() {
  const { colors, spacing, radius } = useTokens();

  return (
    <ScrollScreen>
      {/* Header Skeleton */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 4 }}>
          <SkeletonText width={110} height={12} />
          <SkeletonText width={90} height={24} />
        </View>
        <SkeletonBox width={100} height={36} borderRadius={radius.md} />
      </View>

      {/* Goal Cards Skeleton */}
      <View style={{ gap: spacing.md }}>
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
                  <SkeletonText width="50%" height={16} />
                  <SkeletonText width="70%" height={12} />
                </View>
              </View>
              <SkeletonBox width={50} height={20} borderRadius={radius.pill} />
            </View>

            {/* Progress bar */}
            <SkeletonBox width="100%" height={8} borderRadius={radius.pill} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <SkeletonText width={100} height={12} />
              <SkeletonText width={100} height={12} />
            </View>

            {/* Target pace tip banner */}
            <SkeletonBox width="100%" height={32} borderRadius={radius.md} />

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md }}>
              <SkeletonBox width={70} height={28} borderRadius={radius.sm} />
              <SkeletonBox width={60} height={28} borderRadius={radius.sm} />
            </View>
          </Card>
        ))}
      </View>
    </ScrollScreen>
  );
}
