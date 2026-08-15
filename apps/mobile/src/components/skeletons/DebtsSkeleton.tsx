import { View } from 'react-native';
import { Card } from '../Card';
import { ScrollScreen } from '../Screen';
import { SkeletonBox, SkeletonText } from '../Skeleton';
import { useTokens } from '../../theme/tokens';

export function DebtsSkeleton() {
  const { colors, spacing, radius } = useTokens();

  return (
    <ScrollScreen>
      {/* Header Skeleton */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 4 }}>
          <SkeletonText width={110} height={12} />
          <SkeletonText width={140} height={24} />
        </View>
        <SkeletonBox width={100} height={36} borderRadius={radius.md} />
      </View>

      {/* Dual Overview Position Cards Skeleton */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {[1, 2].map((i) => (
          <Card key={i} style={{ flex: 1, backgroundColor: colors.surface, padding: spacing.md, gap: 6 }}>
            <SkeletonText width={70} height={12} />
            <SkeletonText width={100} height={20} />
          </Card>
        ))}
      </View>

      {/* Section 1: Money Others Owe You Skeleton */}
      <View style={{ gap: spacing.xs }}>
        <SkeletonText width={160} height={16} />
        {[1, 2].map((i) => (
          <Card key={i} style={{ gap: spacing.md, backgroundColor: colors.surface }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ gap: 4, flex: 1 }}>
                <SkeletonText width="45%" height={16} />
                <SkeletonText width="65%" height={12} />
              </View>
              <SkeletonBox width={50} height={20} borderRadius={radius.pill} />
            </View>
            <SkeletonBox width="100%" height={7} borderRadius={radius.pill} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <SkeletonText width={110} height={12} />
              <SkeletonText width={110} height={12} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm }}>
              <SkeletonBox width={70} height={28} borderRadius={radius.sm} />
              <SkeletonBox width={60} height={28} borderRadius={radius.sm} />
              <SkeletonBox width={50} height={28} borderRadius={radius.sm} />
            </View>
          </Card>
        ))}
      </View>
    </ScrollScreen>
  );
}
