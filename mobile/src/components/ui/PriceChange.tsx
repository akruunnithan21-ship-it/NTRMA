import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, spacing } from '@/theme';

interface PriceChangeProps {
  value: number;
  percentage?: number;
  showArrow?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PriceChange: React.FC<PriceChangeProps> = ({
  value,
  percentage,
  showArrow = true,
  size = 'md',
}) => {
  const isPositive = value >= 0;
  const color = isPositive ? colors.success : colors.danger;
  const arrow = isPositive ? '▲' : '▼';

  const sizes = {
    sm: fontSize.xs,
    md: fontSize.sm,
    lg: fontSize.base,
  };

  const textSize = sizes[size];

  const formatValue = (v: number) => {
    const abs = Math.abs(v);
    return abs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color, fontSize: textSize }]}>
        {showArrow && arrow}{' '}
        {isPositive ? '+' : '-'}₹{formatValue(value)}
        {percentage !== undefined && (
          <Text style={[styles.text, { color, fontSize: textSize }]}>
            {' '}({isPositive ? '+' : ''}{percentage.toFixed(2)}%)
          </Text>
        )}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontFamily: fonts.mono,
  },
});
