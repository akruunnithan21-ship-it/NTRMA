/**
 * WealthMaster Color Palettes
 * ---------------------------------------------------------------------------
 * Two complete, key-for-key compatible palettes live here:
 *
 *   1. `neon`    — the original electric cyan / neon green / hot pink theme.
 *   2. `refined` — a calmer, more "premium" futuristic variant kept as a
 *                  redundant backup. Same keys, softer tones, deeper indigo
 *                  background, slightly desaturated accents.
 *
 * Switching themes is a ONE-LINE change in `colors.ts` (set ACTIVE_PALETTE).
 * Because both palettes expose identical keys, every screen/component keeps
 * working without any other edits.
 * ---------------------------------------------------------------------------
 */

export interface Palette {
  // Backgrounds
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceElevated: string;
  surfaceHighlight: string;

  // Borders
  border: string;
  borderLight: string;

  // Primary accent
  primary: string;
  primaryDim: string;
  primaryGlow: string;
  primaryGlowStrong: string;

  // Success / profit
  success: string;
  successDim: string;
  successGlow: string;

  // Danger / loss
  danger: string;
  dangerDim: string;
  dangerGlow: string;

  // Warning
  warning: string;
  warningDim: string;
  warningGlow: string;

  // Secondary accent (used for charts, learn paths, etc.)
  accent: string;
  accentDim: string;
  accentGlow: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Gradients (tuples for expo-linear-gradient)
  gradientCyan: readonly [string, string];
  gradientGreen: readonly [string, string];
  gradientDanger: readonly [string, string];
  gradientSurface: readonly [string, string];
  gradientGold: readonly [string, string];
  gradientAccent: readonly [string, string];
  gradientHero: readonly [string, string, string];

  // Functional
  overlay: string;
  glass: string;
  glassStrong: string;
  glassBorder: string;
  scanline: string;
  grid: string;

  // Signals
  signalBuy: string;
  signalSell: string;
  signalHold: string;

  // Confidence meter
  confidenceHigh: string;
  confidenceMedium: string;
  confidenceLow: string;
}

// ============================================================================
// 1. NEON  (default — electric cyber theme)
// ============================================================================
export const neon: Palette = {
  background: '#0A0A0F',
  backgroundElevated: '#0E0E16',
  surface: '#12121A',
  surfaceElevated: '#1A1A2E',
  surfaceHighlight: '#22223A',

  border: '#2A2A3E',
  borderLight: '#3A3A52',

  primary: '#00F0FF',
  primaryDim: '#00A8B3',
  primaryGlow: 'rgba(0, 240, 255, 0.15)',
  primaryGlowStrong: 'rgba(0, 240, 255, 0.32)',

  success: '#39FF14',
  successDim: '#2BC40E',
  successGlow: 'rgba(57, 255, 20, 0.15)',

  danger: '#FF006E',
  dangerDim: '#CC0058',
  dangerGlow: 'rgba(255, 0, 110, 0.15)',

  warning: '#FFB800',
  warningDim: '#CC9300',
  warningGlow: 'rgba(255, 184, 0, 0.15)',

  accent: '#A855F7',
  accentDim: '#7E3FC0',
  accentGlow: 'rgba(168, 85, 247, 0.15)',

  textPrimary: '#FFFFFF',
  textSecondary: '#8A8AA3',
  textMuted: '#4A4A6A',
  textInverse: '#0A0A0F',

  gradientCyan: ['#00F0FF', '#0066FF'] as const,
  gradientGreen: ['#39FF14', '#00F0FF'] as const,
  gradientDanger: ['#FF006E', '#FF6B35'] as const,
  gradientSurface: ['#1A1A2E', '#12121A'] as const,
  gradientGold: ['#FFB800', '#FF6B35'] as const,
  gradientAccent: ['#A855F7', '#00F0FF'] as const,
  gradientHero: ['#00F0FF', '#7B61FF', '#FF006E'] as const,

  overlay: 'rgba(10, 10, 15, 0.8)',
  glass: 'rgba(18, 18, 26, 0.55)',
  glassStrong: 'rgba(18, 18, 26, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  scanline: 'rgba(0, 240, 255, 0.04)',
  grid: 'rgba(0, 240, 255, 0.05)',

  signalBuy: '#39FF14',
  signalSell: '#FF006E',
  signalHold: '#FFB800',

  confidenceHigh: '#39FF14',
  confidenceMedium: '#FFB800',
  confidenceLow: '#FF006E',
};

// ============================================================================
// 2. REFINED  (redundant backup — calmer "premium" variant)
// ============================================================================
export const refined: Palette = {
  background: '#080A12',
  backgroundElevated: '#0C0F1A',
  surface: '#11151F',
  surfaceElevated: '#171C2A',
  surfaceHighlight: '#1F2536',

  border: '#262D40',
  borderLight: '#374056',

  primary: '#38E1D6',       // softer aqua-teal
  primaryDim: '#2AA89F',
  primaryGlow: 'rgba(56, 225, 214, 0.14)',
  primaryGlowStrong: 'rgba(56, 225, 214, 0.30)',

  success: '#36E27B',       // mint green (less harsh than #39FF14)
  successDim: '#27B061',
  successGlow: 'rgba(54, 226, 123, 0.14)',

  danger: '#FF5C8A',        // rose (softer than hot pink)
  dangerDim: '#D6406C',
  dangerGlow: 'rgba(255, 92, 138, 0.14)',

  warning: '#F5C451',       // warm amber
  warningDim: '#C99B33',
  warningGlow: 'rgba(245, 196, 81, 0.14)',

  accent: '#9B8CFF',        // periwinkle
  accentDim: '#6F61D6',
  accentGlow: 'rgba(155, 140, 255, 0.14)',

  textPrimary: '#F4F6FB',
  textSecondary: '#94A0B8',
  textMuted: '#566077',
  textInverse: '#080A12',

  gradientCyan: ['#38E1D6', '#3B82F6'] as const,
  gradientGreen: ['#36E27B', '#38E1D6'] as const,
  gradientDanger: ['#FF5C8A', '#FF9A6B'] as const,
  gradientSurface: ['#171C2A', '#11151F'] as const,
  gradientGold: ['#F5C451', '#FF9A6B'] as const,
  gradientAccent: ['#9B8CFF', '#38E1D6'] as const,
  gradientHero: ['#38E1D6', '#9B8CFF', '#FF5C8A'] as const,

  overlay: 'rgba(8, 10, 18, 0.82)',
  glass: 'rgba(17, 21, 31, 0.55)',
  glassStrong: 'rgba(17, 21, 31, 0.82)',
  glassBorder: 'rgba(255, 255, 255, 0.07)',
  scanline: 'rgba(56, 225, 214, 0.035)',
  grid: 'rgba(155, 140, 255, 0.05)',

  signalBuy: '#36E27B',
  signalSell: '#FF5C8A',
  signalHold: '#F5C451',

  confidenceHigh: '#36E27B',
  confidenceMedium: '#F5C451',
  confidenceLow: '#FF5C8A',
};

export const palettes = { neon, refined } as const;
export type PaletteName = keyof typeof palettes;
