import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

  const getGradient = (): readonly [string, string] => {
    if (value >= 70) return colors.gradientGreen;
    if (value >= 40) return colors.gradientGold;
    return colors.gradientDanger;
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
              shadowColor: barColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.7,
              shadowRadius: 6,
            },
          ]}
        >
          <LinearGradient
            colors={getGradient()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.full }]}
          />
        </Animated.View>
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
