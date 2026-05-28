import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, spacing } from '@/theme';

export default function AddExpenseModal() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Expense</Text>
      <Text style={styles.placeholder}>Expense form coming in Phase 2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.base, justifyContent: 'center', alignItems: 'center' },
  title: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.textPrimary, marginBottom: spacing.md },
  placeholder: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textMuted },
});
