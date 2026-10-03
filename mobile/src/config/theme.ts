import { APP_COLORS, MIN_TOUCH_TARGET } from '../lib/constants';

/**
 * GEMINI.md Theme tokens for FPT Campus Second-Hand Market
 */
export const THEME = {
  colors: APP_COLORS,
  touchTarget: {
    minHeight: MIN_TOUCH_TARGET,
    minWidth: MIN_TOUCH_TARGET,
  },
  borderRadius: {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  typography: {
    title: { fontSize: 18, fontWeight: '800' as const, color: APP_COLORS.textPrimary },
    subtitle: { fontSize: 14, fontWeight: '600' as const, color: APP_COLORS.textSecondary },
    body: { fontSize: 13, fontWeight: '400' as const, color: APP_COLORS.textSecondary },
    caption: { fontSize: 11, fontWeight: '500' as const, color: APP_COLORS.textMuted },
    price: { fontSize: 15, fontWeight: '900' as const, color: APP_COLORS.primary },
  },
} as const;

export default THEME;
