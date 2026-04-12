// src/constants/theme.js
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary:       '#0f172a', // slate-900 
  secondary:     '#f97316', // brand-500 (Vibrant Orange)
  accent:        '#3b82f6', // accent-500 (Blue) // Teal
  success:       '#10b981', // emerald-500
  danger:        '#ef4444', // red-500
  warning:       '#f59e0b', // amber-500
  background:    '#f8fafc', // slate-50
  surface:       '#ffffff', // Pure White for Cards/Modals
  white:         '#ffffff',
  black:         '#000000',
  textPrimary:   '#0f172a', // slate-900
  textSecondary: '#64748b', // slate-500
  textLight:     '#cbd5e1', // slate-300
  border:        '#e2e8f0', // slate-200
  card:          '#ffffff',
  overlay:       'rgba(15, 23, 42, 0.6)',
  transparent:   'transparent',
  // Tailwind specific ramps
  slate900:      '#0f172a',
  slate800:      '#1e293b',
  brand500:      '#f97316',
  brand50:       '#fff7ed',
  accent50:      '#eff6ff',
};

export const SIZES = {
  // Global sizes
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,

  // Font sizes
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  title: 28,
  hero: 34,

  // Dimensions
  width,
  height,
};

export const FONTS = {
  sizes: SIZES, // For backwards compatibility
  hero:  { fontSize: SIZES.hero, fontWeight: '900' },
  title: { fontSize: SIZES.title, fontWeight: '800' },
  h1:    { fontSize: SIZES.xxl, fontWeight: '800' },
  h2:    { fontSize: SIZES.xl, fontWeight: '700' },
  h3:    { fontSize: SIZES.lg, fontWeight: '700' },
  body1: { fontSize: SIZES.lg, fontWeight: '400', lineHeight: 24 },
  body2: { fontSize: SIZES.md, fontWeight: '400', lineHeight: 22 },
  body3: { fontSize: SIZES.sm, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: SIZES.xs, fontWeight: '400', lineHeight: 16 },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  glow: {
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  }
};

export default { COLORS, SIZES, FONTS, SPACING, SHADOWS };
