import React, { useEffect, useState } from 'react';
import { Text, TextStyle } from 'react-native';
import {
  useSharedValue,
  useAnimatedReaction,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { colors, fonts, fontSize, duration as motionDuration, easing } from '@/theme';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  style?: TextStyle;
  color?: string;
  colorBySign?: boolean; // green for positive, red for negative
}

/**
 * AnimatedNumber — smoothly counts to `value` using a Reanimated shared value.
 * A `useAnimatedReaction` watches the rounded value and only pushes a React
 * state update when the displayed number actually changes (natural throttle),
 * so it stays buttery without re-rendering every frame.
 */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = motionDuration.number,
  style,
  color,
  colorBySign = false,
}) => {
  const progress = useSharedValue(value);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    progress.value = withTiming(value, { duration, easing: easing.out });
  }, [value, duration]);

  const factor = Math.pow(10, decimals);

  useAnimatedReaction(
    () => Math.round(progress.value * factor) / factor,
    (current, previous) => {
      if (current !== previous) {
        runOnJS(setDisplay)(current);
      }
    },
    [factor]
  );

  const textColor = colorBySign
    ? value >= 0
      ? colors.success
      : colors.danger
    : color || colors.textPrimary;

  const formatted = Number(display).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <Text
      style={[
        { fontFamily: fonts.monoBold, fontSize: fontSize['3xl'], color: textColor },
        style,
      ]}
      numberOfLines={1}
    >
      {prefix}
      {formatted}
      {suffix}
    </Text>
  );
};
