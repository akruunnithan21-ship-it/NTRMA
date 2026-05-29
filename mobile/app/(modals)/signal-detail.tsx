import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, spacing } from '@/theme';

export default function SignalDetailModal() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signal Detail</Text>
      <Text style={styles.placeholder}>Full signal analysis with charges breakdown coming in Phase 4</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.base, justifyContent: 'center', alignItems: 'center' },
  title: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.textPrimary, marginBottom: spacing.md },
  placeholder: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textMuted },
});
