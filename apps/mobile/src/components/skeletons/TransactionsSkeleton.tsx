import { View } from 'react-native';
import { Card } from '../Card';
import { ScrollScreen } from '../Screen';
import { SkeletonBox, SkeletonText } from '../Skeleton';
import { useTokens } from '../../theme/tokens';

export function TransactionsSkeleton() {
  const { colors, spacing, radius } = useTokens();

  return (
    <ScrollScreen>
      {/* Header Skeleton */}
      <View style={{ gap: 4 }}>
        <SkeletonText width={90} height={12} />
        <SkeletonText width={140} height={24} />
      </View>

      {/* Search Input Skeleton */}
      <SkeletonBox width="100%" height={46} borderRadius={radius.md} />

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
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBox key={i} width="23%" height={34} borderRadius={radius.sm} />
        ))}
      </View>

      {/* Grouped Transaction List Skeletons */}
      <View style={{ gap: spacing.md }}>
        {[1, 2].map((group) => (
          <View key={group} style={{ gap: spacing.xs }}>
            {/* Date Group Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
              <SkeletonText width={70} height={13} />
              <SkeletonText width={50} height={11} />
            </View>

            {/* Transaction Items */}
            {[1, 2, 3].map((item) => (
              <Card
                key={item}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 12,
                  paddingHorizontal: spacing.md,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
                  <SkeletonBox width={40} height={40} borderRadius={radius.md} />
                  <View style={{ gap: 6, flex: 1 }}>
                    <SkeletonText width="55%" height={15} />
                    <SkeletonText width="35%" height={12} />
                  </View>
                </View>
                <SkeletonText width={75} height={16} />
              </Card>
            ))}
          </View>
        ))}
      </View>
    </ScrollScreen>
  );
}
