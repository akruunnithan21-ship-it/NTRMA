import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, spacing, borderRadius } from '@/theme';

type SignalType = 'BUY' | 'SELL' | 'HOLD';

interface SignalBadgeProps {
  signal: SignalType;
  size?: 'sm' | 'md';
}

export const SignalBadge: React.FC<SignalBadgeProps> = ({
  signal,
  size = 'md',
}) => {
  const config = {
    BUY: { color: colors.signalBuy, icon: '▲', bg: colors.successGlow },
    SELL: { color: colors.signalSell, icon: '▼', bg: colors.dangerGlow },
    HOLD: { color: colors.signalHold, icon: '■', bg: colors.warningGlow },
  };

  const { color, icon, bg } = config[signal];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: color,
          paddingVertical: isSmall ? 2 : spacing.xs,
          paddingHorizontal: isSmall ? spacing.sm : spacing.md,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color,
            fontSize: isSmall ? fontSize.xs : fontSize.sm,
          },
        ]}
      >
        {icon} {signal}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: fonts.headingMedium,
    letterSpacing: 1,
  },
});
