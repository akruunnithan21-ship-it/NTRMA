import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { colors } from '@/theme';

interface AuroraBackgroundProps {
  /** Accent color of the lower glow. Defaults to the secondary accent. */
  accent?: string;
  /** Primary glow color (top). Defaults to brand primary. */
  primary?: string;
}

/**
 * AuroraBackground — two soft radial "light blooms" over the near-black base.
 * Pure SVG (GPU friendly, no images), sits behind all screen content to give
 * the futuristic cockpit ambience without hurting readability.
 */
export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  accent = colors.accent,
  primary = colors.primary,
}) => {
  const { width, height } = useWindowDimensions();

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="glowTop" cx="20%" cy="8%" r="55%">
            <Stop offset="0" stopColor={primary} stopOpacity={0.16} />
            <Stop offset="1" stopColor={primary} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="glowBottom" cx="88%" cy="92%" r="60%">
            <Stop offset="0" stopColor={accent} stopOpacity={0.14} />
            <Stop offset="1" stopColor={accent} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#glowTop)" />
        <Rect x="0" y="0" width={width} height={height} fill="url(#glowBottom)" />
      </Svg>
    </View>
  );
};
