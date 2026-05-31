import React from 'react';
import {
  RefreshControlProps,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { AuroraBackground } from './AuroraBackground';
import { colors, spacing, layout } from '@/theme';

interface ScreenProps {
  children: React.ReactNode;
  /** Wrap content in a ScrollView (default true). */
  scroll?: boolean;
  /** Apply horizontal screen padding (default true). */
  padded?: boolean;
  /** Show the ambient aurora background (default true). */
  aurora?: boolean;
  /** Optional fixed header rendered above the scroll area. */
  header?: React.ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  contentContainerStyle?: ViewStyle;
  edges?: readonly Edge[];
}

/**
 * Screen — standard page scaffold: SafeAreaView + aurora background + optional
 * scroll. Replaces the copy-pasted SafeAreaView/ScrollView blocks that were on
 * every tab, and guarantees consistent padding and bottom clearance for the
 * floating tab bar.
 */
export const Screen: React.FC<ScreenProps> = ({
  children,
  scroll = true,
  padded = true,
  aurora = true,
  header,
  refreshControl,
  contentContainerStyle,
  edges = ['top'],
}) => {
  const innerPad: ViewStyle = {
    paddingHorizontal: padded ? layout.screenPadding : 0,
    paddingTop: spacing.sm,
    paddingBottom: layout.tabBarHeight + spacing['3xl'],
    gap: spacing.base,
  };

  return (
    <View style={styles.root}>
      {aurora && <AuroraBackground />}
      <SafeAreaView style={styles.safe} edges={edges}>
        {header}
        {scroll ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[innerPad, contentContainerStyle]}
            refreshControl={refreshControl}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, innerPad, contentContainerStyle]}>{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  flex: { flex: 1 },
});
