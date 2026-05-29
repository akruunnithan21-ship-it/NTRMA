import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, spacing, fonts, fontSize } from '@/theme';

interface NeonButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const NeonButton: React.FC<NeonButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const variantColors = {
    primary: { bg: colors.primary, text: colors.textInverse, glow: colors.primary },
    success: { bg: colors.success, text: colors.textInverse, glow: colors.success },
    danger: { bg: colors.danger, text: colors.textPrimary, glow: colors.danger },
    ghost: { bg: 'transparent', text: colors.primary, glow: colors.primary },
  };

  const sizeStyles = {
    sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.base, fontSize: fontSize.sm },
    md: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, fontSize: fontSize.base },
    lg: { paddingVertical: spacing.base, paddingHorizontal: spacing['2xl'], fontSize: fontSize.lg },
  };

  const { bg, text, glow } = variantColors[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        animatedStyle,
        {
          backgroundColor: bg,
          borderRadius: borderRadius.md,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          opacity: disabled ? 0.5 : 1,
          shadowColor: glow,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: variant === 'ghost' ? 0 : 0.4,
          shadowRadius: 8,
          elevation: variant === 'ghost' ? 0 : 4,
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: variant === 'ghost' ? colors.primary : 'transparent',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={text} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={{
              color: text,
              fontFamily: fonts.headingMedium,
              fontSize: sizeStyle.fontSize,
            }}
          >
            {title}
          </Text>
        </>
      )}
    </AnimatedTouchable>
  );
};
