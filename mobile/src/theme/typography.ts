/**
 * WealthMaster Typography System
 * Inter for UI, JetBrains Mono for financial numbers
 */

export const fonts = {
  heading: 'Inter-Bold',
  headingMedium: 'Inter-SemiBold',
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  mono: 'JetBrainsMono-Regular',
  monoBold: 'JetBrainsMono-Bold',
} as const;

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  hero: 56,
} as const;

export const lineHeight = {
  tight: 1.1,
  normal: 1.4,
  relaxed: 1.6,
} as const;

export const textStyles = {
  heroNumber: {
    fontFamily: fonts.monoBold,
    fontSize: fontSize.hero,
    lineHeight: fontSize.hero * lineHeight.tight,
  },
  h1: {
    fontFamily: fonts.heading,
    fontSize: fontSize['4xl'],
    lineHeight: fontSize['4xl'] * lineHeight.tight,
  },
  h2: {
    fontFamily: fonts.heading,
    fontSize: fontSize['2xl'],
    lineHeight: fontSize['2xl'] * lineHeight.tight,
  },
  h3: {
    fontFamily: fonts.headingMedium,
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * lineHeight.normal,
  },
  h4: {
    fontFamily: fonts.headingMedium,
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.normal,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.relaxed,
  },
  bodySmall: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.relaxed,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  number: {
    fontFamily: fonts.mono,
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.tight,
  },
  numberLarge: {
    fontFamily: fonts.monoBold,
    fontSize: fontSize['3xl'],
    lineHeight: fontSize['3xl'] * lineHeight.tight,
  },
  numberSmall: {
    fontFamily: fonts.mono,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.tight,
  },
} as const;
