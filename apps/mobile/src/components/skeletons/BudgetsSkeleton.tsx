import { View } from 'react-native';
import { Card } from '../Card';
import { ScrollScreen } from '../Screen';
import { SkeletonBox, SkeletonText } from '../Skeleton';
import { useTokens } from '../../theme/tokens';

export function BudgetsSkeleton() {
  const { colors, spacing, radius } = useTokens();

  return (
    <ScrollScreen>
      {/* Header & Button */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 4 }}>
          <SkeletonText width={110} height={12} />
          <SkeletonText width={100} height={24} />
        </View>
        <SkeletonBox width={110} height={36} borderRadius={radius.md} />
      </View>

      {/* Month Navigator Bar Skeleton */}
      <SkeletonBox width="100%" height={44} borderRadius={radius.md} />

      {/* Overall Budget Hero Card Skeleton */}
      <Card
        style={{
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          gap: spacing.md,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ gap: 6 }}>
            <SkeletonText width={130} height={12} />
            <SkeletonText width={190} height={22} />
          </View>
          <SkeletonBox width={50} height={22} borderRadius={radius.pill} />
        </View>
        <SkeletonBox width="100%" height={8} borderRadius={radius.pill} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <SkeletonText width={110} height={12} />
          <SkeletonText width={90} height={13} />
        </View>
      </Card>

      {/* Category Budget Card Skeletons */}
      <View style={{ gap: spacing.md }}>
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              gap: spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <SkeletonBox width={40} height={40} borderRadius={radius.md} />
              <View style={{ flex: 1, gap: 6 }}>
                <SkeletonText width="50%" height={16} />
                <SkeletonText width="70%" height={12} />
              </View>
              <SkeletonBox width={64} height={20} borderRadius={radius.pill} />
            </View>

            {/* Progress bar */}
            <SkeletonBox width="100%" height={8} borderRadius={radius.pill} />

            {/* Spent / Remaining numbers */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ gap: 4 }}>
                <SkeletonText width={40} height={11} />
                <SkeletonText width={90} height={14} />
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <SkeletonText width={60} height={11} />
                <SkeletonText width={80} height={14} />
              </View>
            </View>

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
