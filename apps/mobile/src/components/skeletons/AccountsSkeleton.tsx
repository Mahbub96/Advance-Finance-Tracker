import { View } from 'react-native';
import { Card } from '../Card';
import { ScrollScreen } from '../Screen';
import { SkeletonBox, SkeletonCircle, SkeletonText } from '../Skeleton';
import { useTokens } from '../../theme/tokens';

export function AccountsSkeleton() {
  const { colors, spacing, radius } = useTokens();

  return (
    <ScrollScreen>
      {/* Header Skeleton */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 4 }}>
          <SkeletonText width={120} height={12} />
          <SkeletonText width={110} height={24} />
        </View>
        <SkeletonBox width={100} height={36} borderRadius={radius.md} />
      </View>

      {/* Hero Total Balance Skeleton */}
      <Card
        style={{
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          gap: spacing.xs,
          padding: spacing.lg,
        }}
      >
        <SkeletonText width={90} height={13} />
        <SkeletonText width={180} height={32} />
      </Card>

      {/* Account List Skeletons */}
      <View style={{ gap: spacing.sm }}>
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <SkeletonBox width={44} height={44} borderRadius={radius.md} />
              <View style={{ flex: 1, gap: 6 }}>
                <SkeletonText width="50%" height={16} />
                <SkeletonText width="30%" height={12} />
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <SkeletonText width={75} height={16} />
                <SkeletonText width={40} height={11} />
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* Account Summary Donut Chart Skeleton */}
      <Card
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          gap: spacing.md,
          alignItems: 'center',
          paddingVertical: spacing.lg,
        }}
      >
        <SkeletonText width={130} height={16} style={{ alignSelf: 'flex-start' }} />
        <SkeletonCircle size={150} />
      </Card>
    </ScrollScreen>
  );
}
