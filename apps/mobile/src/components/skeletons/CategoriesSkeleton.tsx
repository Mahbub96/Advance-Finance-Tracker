import { View } from 'react-native';
import { Card } from '../Card';
import { ScrollScreen } from '../Screen';
import { SkeletonBox, SkeletonText } from '../Skeleton';
import { useTokens } from '../../theme/tokens';

export function CategoriesSkeleton() {
  const { colors, spacing, radius } = useTokens();

  return (
    <ScrollScreen>
      {/* Header Skeleton */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 4 }}>
          <SkeletonText width={120} height={12} />
          <SkeletonText width={110} height={24} />
        </View>
        <SkeletonBox width={110} height={36} borderRadius={radius.md} />
      </View>

      {/* Segmented Filter Skeleton */}
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

      {/* Category List Skeletons */}
      <View style={{ gap: spacing.sm }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card
            key={i}
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              paddingVertical: 12,
              paddingHorizontal: spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
                <SkeletonBox width={38} height={38} borderRadius={radius.md} />
                <View style={{ gap: 4, flex: 1 }}>
                  <SkeletonText width="45%" height={15} />
                  <SkeletonText width="30%" height={12} />
                </View>
              </View>
              <SkeletonBox width={16} height={16} borderRadius={radius.xs} />
            </View>
          </Card>
        ))}
      </View>
    </ScrollScreen>
  );
}
