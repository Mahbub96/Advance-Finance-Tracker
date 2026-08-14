import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeAccent = 'blue' | 'emerald';
export type ThemeMode = 'system' | 'light' | 'dark' | 'oled';

export const blueColorsLight = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryForeground: '#FFFFFF',
  primaryMuted: '#EFF6FF',
  gradientStart: '#1E40AF',
  gradientEnd: '#3B82F6',
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
  cardShadow: 'rgba(15, 23, 42, 0.06)',
};

export const blueColorsDark: typeof blueColorsLight = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryForeground: '#090D16',
  primaryMuted: '#1E293B',
  gradientStart: '#1E3A8A',
  gradientEnd: '#2563EB',
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
  cardShadow: 'rgba(0, 0, 0, 0.4)',
};

export const emeraldColorsLight: typeof blueColorsLight = {
  ...blueColorsLight,
  primary: '#10B981',
  primaryDark: '#059669',
  primaryForeground: '#FFFFFF',
  primaryMuted: '#ECFDF5',
  gradientStart: '#047857',
  gradientEnd: '#10B981',
  info: '#10B981',
  infoMuted: '#ECFDF5',
};

export const emeraldColorsDark: typeof blueColorsLight = {
  ...blueColorsDark,
  primary: '#34D399',
  primaryDark: '#10B981',
  primaryForeground: '#064E3B',
  primaryMuted: '#064E3B',
  gradientStart: '#064E3B',
  gradientEnd: '#059669',
  info: '#34D399',
  infoMuted: '#064E3B',
};

export const oledDarkColors: typeof blueColorsLight = {
  ...blueColorsDark,
  background: '#000000',
  surface: '#0A0A0A',
  surfaceElevated: '#141414',
  surfaceMuted: '#1E1E1E',
  surfaceSubtle: '#050505',
  border: '#262626',
  borderLight: '#171717',
};

type ThemeContextType = {
  accent: ThemeAccent;
  setAccent: (accent: ThemeAccent) => void;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  hideBalance: boolean;
  setHideBalance: React.Dispatch<React.SetStateAction<boolean>>;
  colors: typeof blueColorsLight;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [accent, setAccent] = useState<ThemeAccent>('blue');
  const [mode, setMode] = useState<ThemeMode>('system');
  const [hideBalance, setHideBalance] = useState<boolean>(false);

  const effectiveScheme = mode === 'system' ? (systemScheme ?? 'light') : mode;
  const isDark = effectiveScheme === 'dark' || effectiveScheme === 'oled';

  const colors = useMemo(() => {
    if (mode === 'oled') {
      return accent === 'emerald'
        ? { ...oledDarkColors, primary: '#34D399', primaryForeground: '#064E3B' }
        : oledDarkColors;
    }
    if (isDark) {
      return accent === 'emerald' ? emeraldColorsDark : blueColorsDark;
    }
    return accent === 'emerald' ? emeraldColorsLight : blueColorsLight;
  }, [mode, isDark, accent]);

  return (
    <ThemeContext.Provider
      value={{
        accent,
        setAccent,
        mode,
        setMode,
        hideBalance,
        setHideBalance,
        colors,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      accent: 'blue' as ThemeAccent,
      setAccent: () => {},
      mode: 'system' as ThemeMode,
      setMode: () => {},
      hideBalance: false,
      setHideBalance: () => {},
      colors: blueColorsLight,
      isDark: false,
    };
  }
  return ctx;
}
