import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors, fonts, fontSize, spacing, borderRadius } from '@/theme';

interface ConfidenceMeterProps {
  value: number; // 0-100
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  delay?: number;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  value,
  label = 'Confidence',
  size = 'md',
  delay = 0,
}) => {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      delay,
      withTiming(value, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );
  }, [value]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  const getColor = () => {
    if (value >= 70) return colors.confidenceHigh;
    if (value >= 40) return colors.confidenceMedium;
    return colors.confidenceLow;
  };

  const barColor = getColor();

  const heights = { sm: 4, md: 6, lg: 10 };
  const barHeight = heights[size];

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: barColor }]}>{value}%</Text>
      </View>
      <View style={[styles.track, { height: barHeight }]}>
        <Animated.View
          style={[
            styles.fill,
            animatedBarStyle,
            {
              height: barHeight,
              backgroundColor: barColor,
              shadowColor: barColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 6,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  value: {
    fontFamily: fonts.monoBold,
    fontSize: fontSize.sm,
  },
  track: {
    width: '100%',
    backgroundColor: colors.surfaceHighlight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: borderRadius.full,
  },
});
