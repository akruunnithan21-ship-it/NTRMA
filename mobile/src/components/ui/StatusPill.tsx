import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { colors, fonts, fontSize, spacing, borderRadius } from '@/theme';
import { Icon, IconName } from './Icon';

interface StatusPillProps {
  label: string;
  color?: string;
  icon?: IconName;
  /** Animate the leading dot (for "live"/"connected" states). */
  pulse?: boolean;
  style?: ViewStyle;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  label,
  color = colors.success,
  icon,
  pulse = false,
  style,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (pulse) {
      scale.value = withRepeat(withSequence(withTiming(1.6, { duration: 800 }), withTiming(1, { duration: 800 })), -1, false);
      opacity.value = withRepeat(withSequence(withTiming(0.4, { duration: 800 }), withTiming(1, { duration: 800 })), -1, false);
    }
  }, [pulse]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.pill, { borderColor: hexA(color, 0.4) }, style]}>
      {icon ? (
        <Icon name={icon} size={12} color={color} />
      ) : (
        <View style={styles.dotWrap}>
          {pulse && <Animated.View style={[styles.dotPulse, { backgroundColor: color }, dotStyle]} />}
          <View style={[styles.dot, { backgroundColor: color }]} />
        </View>
      )}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
};

function hexA(color: string, a: number) {
  if (!color.startsWith('#')) return color;
  const h = color.slice(1);
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(f.slice(0, 2), 16);
  const g = parseInt(f.slice(2, 4), 16);
  const b = parseInt(f.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  dotWrap: { width: 8, height: 8, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotPulse: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
  label: { fontFamily: fonts.bodyMedium, fontSize: fontSize.xs, letterSpacing: 0.3 },
});
