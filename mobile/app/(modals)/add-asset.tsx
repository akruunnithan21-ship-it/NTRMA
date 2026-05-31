import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { NeonButton, ScreenHeader, AuroraBackground } from '@/components/ui';
import { colors, fonts, fontSize, spacing, borderRadius } from '@/theme';
import { useNetWorthStore, ASSET_CATEGORIES, AssetCategory } from '@/store/useNetWorthStore';

export default function AddAssetModal() {
  const addAsset = useNetWorthStore((s) => s.addAsset);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('cash_savings');
  const [value, setValue] = useState('');
  const [purchaseValue, setPurchaseValue] = useState('');

  const canSave = name.trim().length > 0 && parseFloat(value) > 0;

  const save = () => {
    if (!canSave) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addAsset({
      name: name.trim(),
      category,
      value: parseFloat(value),
      purchaseValue: purchaseValue ? parseFloat(purchaseValue) : undefined,
      date: new Date().toISOString(),
    });
    router.back();
  };

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Add Asset" onBack={() => router.back()} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>What is it? *</Text>
            <TextInput value={name} onChangeText={setName} placeholder="e.g. SBI Savings, Tata Motors shares" placeholderTextColor={colors.textMuted} style={styles.input} autoFocus />

            <Text style={styles.label}>Category</Text>
            <View style={styles.grid}>
              {ASSET_CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, category === c.id && { borderColor: c.color, backgroundColor: c.color + '20' }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCategory(c.id); }}
                >
                  <Text style={styles.chipIcon}>{c.icon}</Text>
                  <Text style={[styles.chipText, category === c.id && { color: c.color }]} numberOfLines={1}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>Current value (₹) *</Text>
                <TextInput value={value} onChangeText={setValue} placeholder="0" placeholderTextColor={colors.textMuted} style={styles.input} keyboardType="numeric" />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.label}>Bought for (₹)</Text>
                <TextInput value={purchaseValue} onChangeText={setPurchaseValue} placeholder="optional" placeholderTextColor={colors.textMuted} style={styles.input} keyboardType="numeric" />
              </View>
            </View>

            <NeonButton title="Save Asset" onPress={save} variant="success" size="lg" disabled={!canSave} iconName="check" style={{ marginTop: spacing.lg }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  flex: { flex: 1 },
  flex1: { flex: 1 },
  content: { padding: spacing.base, gap: spacing.sm, paddingBottom: spacing['4xl'] },
  label: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm },
  input: { backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, fontFamily: fonts.body, fontSize: fontSize.base, color: colors.textPrimary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { width: '31%', flexGrow: 1, alignItems: 'center', gap: 4, backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.sm },
  chipIcon: { fontSize: 20 },
  chipText: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary, textAlign: 'center' },
  row: { flexDirection: 'row', gap: spacing.md },
});
