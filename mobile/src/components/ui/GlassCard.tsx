import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, borderRadius, spacing, shadows } from '@/theme';

interface GlassCardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'highlighted';
  glowColor?: string;
  animate?: boolean;
  delay?: number;
  onPressScale?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'default',
  glowColor,
  animate = true,
  delay = 0,
  children,
  style,
  ...props
}) => {
  const backgroundColors = {
    default: colors.glass,
    elevated: colors.surfaceElevated,
    highlighted: colors.surfaceHighlight,
  };

  const cardStyle: ViewStyle = {
    backgroundColor: backgroundColors[variant],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.base,
    ...(glowColor && {
      shadowColor: glowColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 4,
    }),
  };

  if (animate) {
    return (
      <Animated.View
        entering={FadeInDown.delay(delay).duration(400).springify()}
        style={[cardStyle, style]}
        {...props}
      >
        {children}
      </Animated.View>
    );
  }

  return (
    <View style={[cardStyle, style]} {...props}>
      {children}
    </View>
  );
};
