import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, fonts, fontSize, spacing, borderRadius, glow, spring } from '@/theme';
import { Icon, IconName } from './Icon';

const TABS: Record<string, { icon: IconName; label: string }> = {
  index: { icon: 'home', label: 'Home' },
  money: { icon: 'wallet', label: 'Money' },
  markets: { icon: 'markets', label: 'Markets' },
  ai: { icon: 'ai', label: 'AI' },
  learn: { icon: 'learn', label: 'Learn' },
};

/**
 * FloatingTabBar — a frosted, rounded pill that floats above the bottom edge
 * with a glowing indicator that springs to the active tab. Replaces the flat
 * default bar + Unicode icons.
 */
export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);

  const count = state.routes.length;
  const innerPad = spacing.xs;
  const slotWidth = barWidth > 0 ? (barWidth - innerPad * 2) / count : 0;

  const indicatorX = useSharedValue(0);
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: slotWidth,
  }));

  // Keep indicator in sync with the active index
  React.useEffect(() => {
    if (slotWidth > 0) {
      indicatorX.value = withSpring(state.index * slotWidth, spring.gentle);
    }
  }, [state.index, slotWidth]);

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom > 0 ? insets.bottom : spacing.base }]} pointerEvents="box-none">
      <View
        style={[styles.bar, glow(colors.primary, 0.18, 22)]}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      >
        <BlurView intensity={50} tint="dark" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.barTint]} />

        {/* Sliding glow indicator */}
        {slotWidth > 0 && (
          <Animated.View style={[styles.indicator, { left: innerPad }, indicatorStyle]}>
            <LinearGradient
              colors={[colors.primaryGlowStrong, 'transparent']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.indicatorGlow}
            />
            <View style={styles.indicatorBar} />
          </Animated.View>
        )}

        <View style={[styles.row, { padding: innerPad }]}>
          {state.routes.map((route, index) => {
            const cfg = TABS[route.name] ?? { icon: 'dot' as IconName, label: route.name };
            const focused = state.index === index;

            const onPress = () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable key={route.key} onPress={onPress} style={styles.slot} hitSlop={6}>
                <Icon
                  name={cfg.icon}
                  size={focused ? 23 : 21}
                  color={focused ? colors.primary : colors.textMuted}
                  strokeWidth={focused ? 2.6 : 2}
                />
                <Text style={[styles.label, { color: focused ? colors.primary : colors.textMuted }]}>
                  {cfg.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.base,
  },
  bar: {
    width: '100%',
    maxWidth: 460,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    backgroundColor: colors.glassStrong,
  },
  barTint: { backgroundColor: 'rgba(10,10,15,0.35)' },
  row: { flexDirection: 'row', alignItems: 'center' },
  slot: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: spacing.sm },
  label: { fontFamily: fonts.bodyMedium, fontSize: fontSize.xs },
  indicator: { position: 'absolute', top: 0, bottom: 0, alignItems: 'center', justifyContent: 'flex-start' },
  indicatorGlow: { position: 'absolute', top: 0, bottom: 0, left: 8, right: 8, borderRadius: borderRadius.full, opacity: 0.5 },
  indicatorBar: { position: 'absolute', top: 6, width: 26, height: 3, borderRadius: 2, backgroundColor: colors.primary },
});
