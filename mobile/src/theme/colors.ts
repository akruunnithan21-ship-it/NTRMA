/**
 * WealthMaster Color System
 * Dark theme with neon accents (cyan, green, pink)
 */

export const colors = {
  // Backgrounds
  background: '#0A0A0F',
  surface: '#12121A',
  surfaceElevated: '#1A1A2E',
  surfaceHighlight: '#22223A',

  // Borders
  border: '#2A2A3E',
  borderLight: '#3A3A52',

  // Primary Accents
  primary: '#00F0FF',       // Electric cyan
  primaryDim: '#00A8B3',
  primaryGlow: 'rgba(0, 240, 255, 0.15)',
  primaryGlowStrong: 'rgba(0, 240, 255, 0.3)',

  // Success / Profit
  success: '#39FF14',       // Neon green
  successDim: '#2BC40E',
  successGlow: 'rgba(57, 255, 20, 0.15)',

  // Danger / Loss
  danger: '#FF006E',        // Hot pink
  dangerDim: '#CC0058',
  dangerGlow: 'rgba(255, 0, 110, 0.15)',

  // Warning
  warning: '#FFB800',       // Amber
  warningDim: '#CC9300',
  warningGlow: 'rgba(255, 184, 0, 0.15)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8A8AA3',
  textMuted: '#4A4A6A',
  textInverse: '#0A0A0F',

  // Gradients (as arrays for LinearGradient)
  gradientCyan: ['#00F0FF', '#0066FF'] as const,
  gradientGreen: ['#39FF14', '#00F0FF'] as const,
  gradientDanger: ['#FF006E', '#FF6B35'] as const,
  gradientSurface: ['#1A1A2E', '#12121A'] as const,
  gradientGold: ['#FFB800', '#FF6B35'] as const,

  // Functional
  overlay: 'rgba(10, 10, 15, 0.8)',
  glass: 'rgba(18, 18, 26, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',

  // Signal Colors
  signalBuy: '#39FF14',
  signalSell: '#FF006E',
  signalHold: '#FFB800',

  // Confidence meter
  confidenceHigh: '#39FF14',    // 70-100%
  confidenceMedium: '#FFB800',  // 40-69%
  confidenceLow: '#FF006E',     // 0-39%
} as const;

export type ColorKey = keyof typeof colors;
