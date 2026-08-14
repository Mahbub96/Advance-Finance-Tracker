import { useColorScheme } from 'react-native';

export const lightColors = {
  primary: '#2563EB',
  primaryForeground: '#FFFFFF',
  primaryMuted: '#EFF6FF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  surfaceSubtle: '#F8FAFC',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  income: '#10B981',
  incomeMuted: '#ECFDF5',
  expense: '#EF4444',
  expenseMuted: '#FEF2F2',
  transfer: '#64748B',
  transferMuted: '#F1F5F9',
  danger: '#EF4444',
  dangerMuted: '#FEF2F2',
  warning: '#F59E0B',
  warningMuted: '#FFFBEB',
  info: '#3B82F6',
  infoMuted: '#EFF6FF',
  accentPurple: '#8B5CF6',
  accentPurpleMuted: '#F5F3FF',
  cardShadow: 'rgba(15, 23, 42, 0.04)',
};

export const darkColors: typeof lightColors = {
  primary: '#3B82F6',
  primaryForeground: '#090D16',
  primaryMuted: '#1E293B',
  background: '#0B0F17',
  surface: '#131A29',
  surfaceElevated: '#1A2336',
  surfaceMuted: '#1E293B',
  surfaceSubtle: '#0F1523',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  border: '#243048',
  borderLight: '#1A2336',
  income: '#34D399',
  incomeMuted: '#064E3B',
  expense: '#F87171',
  expenseMuted: '#451A1A',
  transfer: '#94A3B8',
  transferMuted: '#1E293B',
  danger: '#F87171',
  dangerMuted: '#451A1A',
  warning: '#FBBF24',
  warningMuted: '#452B0E',
  info: '#60A5FA',
  infoMuted: '#172554',
  accentPurple: '#A78BFA',
  accentPurpleMuted: '#2E1065',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const typography = {
  display: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  title: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  sectionTitle: { fontSize: 17, fontWeight: '600' as const, letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyMedium: { fontSize: 15, fontWeight: '500' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  captionMedium: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  micro: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.2 },
  numericLarge: {
    fontSize: 28,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums' as const],
    letterSpacing: -0.5,
  },
  numericMedium: {
    fontSize: 20,
    fontWeight: '600' as const,
    fontVariant: ['tabular-nums' as const],
  },
  button: { fontSize: 15, fontWeight: '600' as const, letterSpacing: 0.1 },
};

export function useTokens() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? darkColors : lightColors;
  return { colors, spacing, radius, typography, scheme };
}

export type Tokens = ReturnType<typeof useTokens>;
