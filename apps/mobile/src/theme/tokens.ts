import { useColorScheme } from 'react-native';

export const lightColors = {
  primary: '#1F6FEB',
  primaryForeground: '#FFFFFF',
  background: '#F4F6F8',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF1F4',
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  income: '#0F9D58',
  expense: '#D93025',
  transfer: '#5F6B7A',
  danger: '#B42318',
  warning: '#B54708',
};

export const darkColors: typeof lightColors = {
  primary: '#4C8DFF',
  primaryForeground: '#0B1220',
  background: '#0B1220',
  surface: '#151C2C',
  surfaceMuted: '#1E2738',
  textPrimary: '#F3F4F6',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  border: '#2A3447',
  income: '#34D399',
  expense: '#F87171',
  transfer: '#94A3B8',
  danger: '#F97066',
  warning: '#FDB022',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const typography = {
  display: { fontSize: 32, fontWeight: '700' as const },
  title: { fontSize: 22, fontWeight: '700' as const },
  sectionTitle: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  numericLarge: { fontSize: 28, fontWeight: '700' as const },
  button: { fontSize: 16, fontWeight: '600' as const },
};

export function useTokens() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? darkColors : lightColors;
  return { colors, spacing, radius, typography, scheme };
}

export type Tokens = ReturnType<typeof useTokens>;
