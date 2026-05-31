import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize } from '@/theme';
import { Icon } from './Icon';

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

  const sizes = { sm: fontSize.xs, md: fontSize.sm, lg: fontSize.base };
  const textSize = sizes[size];

  const formatValue = (v: number) =>
    Math.abs(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <View style={styles.container}>
      {showArrow && (
        <Icon name={isPositive ? 'upRight' : 'downRight'} size={textSize + 2} color={color} strokeWidth={2.5} />
      )}
      <Text style={[styles.text, { color, fontSize: textSize }]}>
        {isPositive ? '+' : '-'}₹{formatValue(value)}
        {percentage !== undefined && (
          <Text style={[styles.text, { color, fontSize: textSize }]}>
            {'  '}({isPositive ? '+' : ''}{percentage.toFixed(2)}%)
          </Text>
        )}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  text: { fontFamily: fonts.mono },
});
