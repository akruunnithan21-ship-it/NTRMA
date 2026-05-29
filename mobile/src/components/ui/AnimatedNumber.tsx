import React, { useEffect } from 'react';
import { Text, TextStyle, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  useDerivedValue,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { colors, fonts, fontSize } from '@/theme';

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

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 800,
  style,
  color,
  colorBySign = false,
}) => {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value]);

  // For now, use a simpler approach with state
  const [displayValue, setDisplayValue] = React.useState(value);

  useEffect(() => {
    const startValue = displayValue;
    const diff = value - startValue;
    const steps = 30;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startValue + diff * eased);

      if (currentStep >= steps) {
        clearInterval(interval);
        setDisplayValue(value);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [value]);

  const textColor = colorBySign
    ? value >= 0
      ? colors.success
      : colors.danger
    : color || colors.textPrimary;

  const formattedValue = displayValue.toFixed(decimals);
  const formattedWithCommas = Number(formattedValue).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <Text
      style={[
        {
          fontFamily: fonts.monoBold,
          fontSize: fontSize['3xl'],
          color: textColor,
        },
        style,
      ]}
    >
      {prefix}
      {formattedWithCommas}
      {suffix}
    </Text>
  );
};
