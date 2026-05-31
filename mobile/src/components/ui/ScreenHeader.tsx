import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, fonts, fontSize, spacing, borderRadius, layout } from '@/theme';
import { Icon, IconName } from './Icon';
import { GradientText } from './GradientText';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Render the title with the brand gradient (hero screens). */
  gradient?: boolean;
  /** Right-aligned content (e.g. a StatusPill or IconButton). */
  right?: React.ReactNode;
  /** Show a back chevron and call this on press. */
  onBack?: () => void;
  style?: ViewStyle;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  gradient = false,
  right,
  onBack,
  style,
}) => {
  return (
    <Animated.View entering={FadeInDown.duration(360)} style={[styles.header, style]}>
      <View style={styles.left}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={8} activeOpacity={0.7}>
            <Icon name="back" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        <View style={styles.titleWrap}>
          {gradient ? (
            <GradientText style={styles.title} gradient={colors.gradientCyan}>
              {title}
            </GradientText>
          ) : (
            <Text style={styles.title}>{title}</Text>
          )}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </Animated.View>
  );
};

/** Small circular icon button used in headers (settings, refresh, etc.). */
export const IconButton: React.FC<{
  icon: IconName;
  onPress: () => void;
  color?: string;
  haptic?: boolean;
}> = ({ icon, onPress, color = colors.textSecondary, haptic = true }) => (
  <TouchableOpacity
    onPress={() => {
      if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }}
    style={styles.iconBtn}
    activeOpacity={0.7}
    hitSlop={8}
  >
    <Icon name={icon} size={20} color={color} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: layout.headerHeight,
    paddingHorizontal: layout.screenPadding,
    gap: spacing.md,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  titleWrap: { flex: 1 },
  title: { fontFamily: fonts.heading, fontSize: fontSize['2xl'], color: colors.textPrimary },
  subtitle: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
