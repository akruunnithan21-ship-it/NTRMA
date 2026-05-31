import React from 'react';
import { Platform, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, borderRadius, spacing, glow } from '@/theme';

interface GlassCardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'highlighted';
  glowColor?: string;
  animate?: boolean;
  delay?: number;
  /** Render real frosted-glass blur. Disable for long lists (perf). */
  blur?: boolean;
  /** Remove inner padding (e.g. for media / custom layouts). */
  noPadding?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

const VARIANT = {
  default: { intensity: 24, overlay: colors.glass, border: colors.glassBorder },
  elevated: { intensity: 40, overlay: colors.glassStrong, border: colors.borderLight },
  highlighted: { intensity: 34, overlay: colors.glassStrong, border: colors.border },
} as const;

/**
 * GlassCard — frosted-glass surface with a neon edge glow.
 * Backwards compatible with the old API (variant / glowColor / animate / delay).
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'default',
  glowColor,
  animate = true,
  delay = 0,
  blur = true,
  noPadding = false,
  children,
  style,
  ...props
}) => {
  const cfg = VARIANT[variant];

  const outerStyle: ViewStyle = {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface, // base so the glow shadow renders solidly
    ...(glowColor
      ? glow(glowColor, 0.28, 16)
      : Platform.OS === 'android'
      ? { elevation: 3 }
      : {}),
  };

  const innerStyle: ViewStyle = {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: glowColor ? hexWithAlpha(glowColor, 0.35) : cfg.border,
  };

  const contentStyle: ViewStyle = {
    backgroundColor: blur ? cfg.overlay : colors.surfaceElevated,
    padding: noPadding ? 0 : spacing.base,
  };

  const inner = (
    <View style={innerStyle}>
      {blur && (
        <BlurView
          intensity={cfg.intensity}
          tint="dark"
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={contentStyle}>{children}</View>
    </View>
  );

  if (animate) {
    return (
      <Animated.View
        entering={FadeInDown.delay(delay).duration(420).springify().damping(18)}
        style={[outerStyle, style]}
        {...props}
      >
        {inner}
      </Animated.View>
    );
  }

  return (
    <View style={[outerStyle, style]} {...props}>
      {inner}
    </View>
  );
};

/** Convert a #rrggbb (or rgba) color + alpha into an rgba() string. */
function hexWithAlpha(color: string, alpha: number): string {
  if (color.startsWith('rgba')) return color;
  if (color.startsWith('rgb(')) return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  const hex = color.replace('#', '');
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return color;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
