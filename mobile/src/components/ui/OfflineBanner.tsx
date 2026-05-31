import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useConnectionStore } from '@/store/useConnectionStore';
import { colors, fonts, fontSize, spacing, borderRadius, layout } from '@/theme';
import { Icon } from './Icon';

/**
 * Thin banner shown on the tab screens whenever the backend is unreachable.
 * Tapping it jumps straight to Settings to fix the connection.
 */
export const OfflineBanner: React.FC = () => {
  const status = useConnectionStore((s) => s.status);
  if (status !== 'offline') return null;

  return (
    <Animated.View entering={FadeInDown.duration(300)} style={styles.wrap}>
      <TouchableOpacity
        style={styles.banner}
        activeOpacity={0.85}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/(modals)/settings');
        }}
      >
        <Icon name="wifiOff" size={14} color={colors.warning} />
        <Text style={styles.text}>Backend offline — tap to configure connection</Text>
        <Icon name="chevronRight" size={14} color={colors.warning} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: layout.screenPadding, paddingBottom: spacing.xs },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warningGlow,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: fontSize.xs, color: colors.warning },
});
