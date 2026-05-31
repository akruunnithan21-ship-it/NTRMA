import React from 'react';
import { Text, TouchableOpacity, ViewStyle, ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, spacing, fonts, fontSize, glow, spring } from '@/theme';
import { Icon, IconName } from './Icon';

interface NeonButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconName?: IconName;
  fullWidth?: boolean;
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
  iconName,
  fullWidth = false,
  style,
}) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const VARIANT = {
    primary: { gradient: colors.gradientCyan, text: colors.textInverse, glow: colors.primary },
    success: { gradient: colors.gradientGreen, text: colors.textInverse, glow: colors.success },
    danger: { gradient: colors.gradientDanger, text: colors.textPrimary, glow: colors.danger },
    ghost: { gradient: null, text: colors.primary, glow: colors.primary },
  } as const;

  const SIZES = {
    sm: { padV: spacing.sm, padH: spacing.base, font: fontSize.sm, icon: 15 },
    md: { padV: spacing.md, padH: spacing.xl, font: fontSize.base, icon: 18 },
    lg: { padV: spacing.base, padH: spacing['2xl'], font: fontSize.lg, icon: 20 },
  } as const;

  const v = VARIANT[variant];
  const s = SIZES[size];
  const isGhost = variant === 'ghost';
  const gradientColors = v.gradient ?? colors.gradientCyan;

  const inner = (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <>
          {iconName ? <Icon name={iconName} size={s.icon} color={v.text} strokeWidth={2.5} /> : icon}
          <Text style={{ color: v.text, fontFamily: fonts.headingMedium, fontSize: s.font }}>{title}</Text>
        </>
      )}
    </View>
  );

  const containerStyle: ViewStyle = {
    borderRadius: borderRadius.md,
    opacity: disabled ? 0.5 : 1,
    alignSelf: fullWidth ? 'stretch' : undefined,
    ...(isGhost ? {} : glow(v.glow, 0.4, 10)),
  };

  const padStyle: ViewStyle = {
    paddingVertical: s.padV,
    paddingHorizontal: s.padH,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={() => (scale.value = withSpring(0.95, spring.press))}
      onPressOut={() => (scale.value = withSpring(1, spring.press))}
      activeOpacity={0.85}
      disabled={disabled || loading}
      style={[animatedStyle, containerStyle, style]}
    >
      {isGhost ? (
        <View style={[padStyle, styles.ghost]}>{inner}</View>
      ) : (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={padStyle}
        >
          {inner}
        </LinearGradient>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  ghost: { borderWidth: 1, borderColor: colors.primary, backgroundColor: 'rgba(0,240,255,0.06)' },
});
