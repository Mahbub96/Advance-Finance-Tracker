import {
  useThemeContext,
  blueColorsLight,
  blueColorsDark,
  emeraldColorsLight,
  emeraldColorsDark,
  oledDarkColors,
} from './theme-context';

export {
  blueColorsLight as lightColors,
  blueColorsDark as darkColors,
  emeraldColorsLight,
  emeraldColorsDark,
  oledDarkColors,
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
  const theme = useThemeContext();
  const colors = theme.colors ?? blueColorsLight;
  const scheme = theme.isDark ? 'dark' : 'light';
  return { colors, spacing, radius, typography, scheme, theme };
}

export type Tokens = ReturnType<typeof useTokens>;
