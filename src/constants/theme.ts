// @ts-ignore
import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1C1B1F',
    background: '#FAF9F6', // Warm Ivory
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EEF2F6',
    textSecondary: '#625F6E',
    primary: '#4F46E5', // Royal Indigo
    primaryLight: '#EEF2FF',
    accent: '#E11D48', // Vibrant Rose
    accentLight: '#FFE4E6',
    cardBackground: '#FFFFFF',
    cardBorder: '#EFECE6',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    shadow: 'rgba(79, 70, 229, 0.04)',
    divider: '#EFECE6',
  },
  dark: {
    text: '#F3F4F6',
    background: '#090714', // Deep space midnight violet
    backgroundElement: '#131127',
    backgroundSelected: '#1E1A3D',
    textSecondary: '#A5A1B8',
    primary: '#818CF8', // Bright Indigo
    primaryLight: '#1E1B4B',
    accent: '#FB7185', // Soft Rose
    accentLight: '#4C0519',
    cardBackground: '#131127',
    cardBorder: '#221E42',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    shadow: 'rgba(0, 0, 0, 0.4)',
    divider: '#221E42',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'Courier',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'system-ui, -apple-system, sans-serif',
    serif: 'Georgia, serif',
    rounded: 'system-ui, -apple-system, sans-serif',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: 4,
  one: 8,
  two: 12,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  eight: 64,
} as const;

export const Borders = {
  radiusXS: 6,
  radiusSM: 12,
  radiusMD: 16,
  radiusLG: 24,
  radiusXL: 32,
  widthThin: 1,
  widthMedium: 2,
};

export const Shadows = {
  light: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  premium: {
    shadowColor: '#818CF8',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const BottomTabInset = Platform.select({ ios: 60, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

