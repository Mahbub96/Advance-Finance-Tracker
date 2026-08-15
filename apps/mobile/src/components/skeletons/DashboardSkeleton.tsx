import { View } from 'react-native';
import { Card } from '../Card';
import { ScrollScreen } from '../Screen';
import { SkeletonBox, SkeletonCircle, SkeletonText } from '../Skeleton';
import { useTokens } from '../../theme/tokens';

export function DashboardSkeleton() {
  const { colors, spacing, radius } = useTokens();

  return (
    <ScrollScreen>
      {/* 1. Header Skeleton */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: 6 }}>
          <SkeletonText width={160} height={20} />
          <SkeletonText width={200} height={14} />
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
          <SkeletonCircle size={36} />
          <SkeletonCircle size={36} />
        </View>
      </View>

      {/* 2. Total Financial Position Hero Card Skeleton */}
      <Card
        style={{
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          borderRadius: radius.xl,
          padding: spacing.lg,
          gap: spacing.md,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <SkeletonText width={140} height={12} />
          <SkeletonBox width={70} height={22} borderRadius={radius.pill} />
        </View>
        <SkeletonText width={220} height={36} />
        <SkeletonBox width="100%" height={32} borderRadius={radius.sm} />
      </Card>

      {/* 3. Income / Expense / Saved 3-Metric Row Skeleton */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              alignItems: 'center',
              gap: 8,
            }}
          >
            <SkeletonText width={44} height={11} />
            <SkeletonText width={68} height={15} />
          </View>
        ))}
      </View>

      {/* 4. Quick Action Grid Skeleton */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: radius.md,
              gap: 6,
            }}
          >
            <SkeletonCircle size={28} />
            <SkeletonText width={48} height={11} />
          </View>
        ))}
      </View>

      {/* 5. Recent Activity Skeleton */}
      <View style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <SkeletonText width={120} height={18} />
          <SkeletonText width={48} height={14} />
        </View>

        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
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
                <SkeletonText width="60%" height={15} />
                <SkeletonText width="40%" height={12} />
              </View>
            </View>
            <SkeletonText width={70} height={16} />
          </Card>
        ))}
      </View>

      {/* 6. Budget Status Card Skeleton */}
      <View style={{ gap: spacing.sm }}>
        <SkeletonText width={110} height={18} />
        <Card
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            gap: spacing.sm,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ gap: 6 }}>
              <SkeletonText width={120} height={15} />
              <SkeletonText width={160} height={12} />
            </View>
            <SkeletonBox width={64} height={20} borderRadius={radius.pill} />
          </View>
          <SkeletonBox width="100%" height={7} borderRadius={radius.pill} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <SkeletonText width={100} height={11} />
            <SkeletonText width={80} height={11} />
          </View>
        </Card>
      </View>
    </ScrollScreen>
  );
}
