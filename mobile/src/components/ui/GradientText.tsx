import React from 'react';
import { Text, TextStyle, StyleProp, TextProps } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/theme';

interface GradientTextProps extends TextProps {
  children: React.ReactNode;
  /** Gradient stops. Defaults to the cyan brand gradient. */
  gradient?: readonly [string, string, ...string[]];
  style?: StyleProp<TextStyle>;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

/**
 * GradientText — fills the glyphs themselves with a linear gradient using a
 * MaskedView (the text shape masks a LinearGradient layer). This is what gives
 * the hero numbers their premium neon look.
 */
export const GradientText: React.FC<GradientTextProps> = ({
  children,
  gradient = colors.gradientCyan,
  style,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  ...textProps
}) => {
  return (
    <MaskedView
      maskElement={
        <Text {...textProps} style={[style, { backgroundColor: 'transparent' }]}>
          {children}
        </Text>
      }
    >
      <LinearGradient colors={gradient} start={start} end={end}>
        {/* Invisible copy sizes the gradient box to match the text */}
        <Text {...textProps} style={[style, { opacity: 0 }]}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
};
