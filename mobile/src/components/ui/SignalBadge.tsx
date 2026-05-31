import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, spacing, borderRadius, glow } from '@/theme';
import { Icon, IconName } from './Icon';

type SignalType = 'BUY' | 'SELL' | 'HOLD';

interface SignalBadgeProps {
  signal: SignalType;
  size?: 'sm' | 'md';
  /** Add a soft neon glow (for hero placements). */
  glowing?: boolean;
}

const CONFIG: Record<SignalType, { color: string; icon: IconName; bg: string }> = {
  BUY: { color: colors.signalBuy, icon: 'up', bg: colors.successGlow },
  SELL: { color: colors.signalSell, icon: 'down', bg: colors.dangerGlow },
  HOLD: { color: colors.signalHold, icon: 'minus', bg: colors.warningGlow },
};

export const SignalBadge: React.FC<SignalBadgeProps> = ({ signal, size = 'md', glowing = false }) => {
  const { color, icon, bg } = CONFIG[signal];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: color,
          paddingVertical: isSmall ? 3 : spacing.xs,
          paddingHorizontal: isSmall ? spacing.sm : spacing.md,
        },
        glowing && glow(color, 0.5, 10),
      ]}
    >
      <Icon name={icon} size={isSmall ? 11 : 13} color={color} strokeWidth={3} />
      <Text style={[styles.text, { color, fontSize: isSmall ? fontSize.xs : fontSize.sm }]}>
        {signal}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: { fontFamily: fonts.headingMedium, letterSpacing: 1 },
});
