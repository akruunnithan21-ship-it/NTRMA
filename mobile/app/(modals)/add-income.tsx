import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, fontSize, spacing, borderRadius } from '@/theme';
import { NeonButton } from '@/components/ui';
import { INCOME_CATEGORIES, RECURRENCE_OPTIONS, Category } from '@/constants/categories';
import { autoCategorize, learnCategorization, getSuggestedNames } from '@/utils/autoCategorize';
import { useFinanceStore } from '@/store/useFinanceStore';

type Step = 'amount' | 'category' | 'details';

export default function AddIncomeModal() {
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState('monthly');
  const [note, setNote] = useState('');
  const [quickNames, setQuickNames] = useState<string[]>([]);

  const addTransaction = useFinanceStore((s) => s.addTransaction);

  useEffect(() => {
    if (selectedCategory) {
      setQuickNames(getSuggestedNames(selectedCategory.id));
    }
  }, [selectedCategory]);

  const handleAmountKey = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (key === 'del') setAmount(amount.slice(0, -1));
    else if (key === '.' && !amount.includes('.')) setAmount(amount + '.');
    else if (key !== '.' && amount.length < 8) setAmount(amount + key);
  };

  const handleNextFromAmount = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep('category');
  };

  const handleSelectCategory = (cat: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(cat);
    setStep('details');
  };

  const handleSave = () => {
    if (!amount || !selectedCategory || !name) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    learnCategorization(name, selectedCategory.id);

    addTransaction({
      type: 'income',
      amount: parseFloat(amount),
      category: selectedCategory.id,
      name: name.trim(),
      date: new Date().toISOString(),
      paymentMethod: 'net_banking',
      necessityLevel: 5,
      isRecurring,
      recurrence: isRecurring ? recurrence : undefined,
      note: note.trim() || undefined,
    });

    router.back();
  };

  const handleBack = () => {
    if (step === 'category') setStep('amount');
    else if (step === 'details') setStep('category');
    else router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Income</Text>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step === 'amount' && styles.stepDotActive]} />
          <View style={[styles.stepDot, step === 'category' && styles.stepDotActive]} />
          <View style={[styles.stepDot, step === 'details' && styles.stepDotActive]} />
        </View>
      </View>

      {step === 'amount' && (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.stepContainer}>
          <Text style={styles.stepLabel}>How much did you earn?</Text>
          <View style={styles.amountDisplay}>
            <Text style={styles.currencySymbol}>₹</Text>
            <Text style={[styles.amountText, { color: colors.success }]}>{amount || '0'}</Text>
          </View>
          <View style={styles.numpad}>
            {[['1','2','3'],['4','5','6'],['7','8','9'],['.','0','del']].map((row, i) => (
              <View key={i} style={styles.numpadRow}>
                {row.map((key) => (
                  <TouchableOpacity key={key} style={styles.numpadKey} onPress={() => handleAmountKey(key)} activeOpacity={0.6}>
                    <Text style={styles.numpadKeyText}>{key === 'del' ? '⌫' : key}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
          <NeonButton title="Next →" onPress={handleNextFromAmount} variant="success" size="lg" disabled={!amount || parseFloat(amount) <= 0} style={styles.nextBtn} />
        </Animated.View>
      )}

      {step === 'category' && (
        <Animated.View entering={SlideInRight.duration(300)} style={styles.stepContainer}>
          <Text style={styles.stepLabel}>Source of income?</Text>
          <Text style={[styles.amountPreview, { color: colors.success }]}>+₹{parseFloat(amount).toLocaleString('en-IN')}</Text>
          <View style={styles.categoryGrid}>
            {INCOME_CATEGORIES.map((cat, index) => (
              <Animated.View key={cat.id} entering={FadeInDown.delay(index * 40).duration(200)}>
                <TouchableOpacity
                  style={[styles.categoryItem, selectedCategory?.id === cat.id && { borderColor: cat.color, backgroundColor: cat.color + '15' }]}
                  onPress={() => handleSelectCategory(cat)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[styles.categoryName, selectedCategory?.id === cat.id && { color: cat.color }]}>{cat.name}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      )}

      {step === 'details' && (
        <Animated.View entering={SlideInRight.duration(300)} style={styles.stepContainer}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.detailsContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryAmount, { color: colors.success }]}>+₹{parseFloat(amount).toLocaleString('en-IN')}</Text>
                <View style={styles.summaryCategory}>
                  <Text style={styles.summaryCatIcon}>{selectedCategory?.icon}</Text>
                  <Text style={[styles.summaryCatName, { color: selectedCategory?.color }]}>{selectedCategory?.name}</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Describe it *</Text>
                <TextInput value={name} onChangeText={setName} placeholder="e.g., May Salary, Freelance project..." placeholderTextColor={colors.textMuted} style={styles.textInput} autoFocus />
                {quickNames.length > 0 && !name && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickNames}>
                    {quickNames.map((qn) => (
                      <TouchableOpacity key={qn} style={styles.quickNameChip} onPress={() => setName(qn)}>
                        <Text style={styles.quickNameText}>{qn}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              <TouchableOpacity style={styles.toggleRow} onPress={() => setIsRecurring(!isRecurring)}>
                <Text style={styles.toggleLabel}>🔄 Recurring income?</Text>
                <View style={[styles.toggle, isRecurring && styles.toggleActive]}>
                  <View style={[styles.toggleThumb, isRecurring && styles.toggleThumbActive]} />
                </View>
              </TouchableOpacity>

              {isRecurring && (
                <Animated.View entering={FadeInDown.duration(200)} style={styles.recurrenceRow}>
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <TouchableOpacity key={opt.id} style={[styles.recurrenceChip, recurrence === opt.id && styles.recurrenceChipActive]} onPress={() => setRecurrence(opt.id)}>
                      <Text style={[styles.recurrenceText, recurrence === opt.id && styles.recurrenceTextActive]}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </Animated.View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Note (optional)</Text>
                <TextInput value={note} onChangeText={setNote} placeholder="Extra details..." placeholderTextColor={colors.textMuted} style={[styles.textInput, { height: 60 }]} multiline />
              </View>

              <NeonButton title="Save Income" onPress={handleSave} variant="success" size="lg" disabled={!name.trim()} style={styles.saveBtn} />
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.base, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { padding: spacing.xs },
  backText: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.primary },
  headerTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.lg, color: colors.textPrimary },
  stepIndicator: { flexDirection: 'row', gap: spacing.xs },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  stepDotActive: { backgroundColor: colors.success, width: 20 },
  stepContainer: { flex: 1, padding: spacing.base },
  stepLabel: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.textPrimary, marginBottom: spacing.md, textAlign: 'center' },
  amountDisplay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing['2xl'] },
  currencySymbol: { fontFamily: fonts.monoBold, fontSize: fontSize['3xl'], color: colors.textSecondary, marginRight: spacing.xs },
  amountText: { fontFamily: fonts.monoBold, fontSize: 56 },
  numpad: { gap: spacing.md, marginBottom: spacing.xl },
  numpadRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
  numpadKey: { width: 72, height: 56, borderRadius: borderRadius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  numpadKeyText: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.textPrimary },
  nextBtn: { marginTop: 'auto' },
  amountPreview: { fontFamily: fonts.mono, fontSize: fontSize.lg, textAlign: 'center', marginBottom: spacing.base },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  categoryItem: { width: '47%', flexGrow: 1, backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.base, alignItems: 'center', gap: spacing.xs },
  categoryIcon: { fontSize: 28 },
  categoryName: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center' },
  detailsContent: { gap: spacing.base, paddingBottom: spacing['5xl'] },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.base, borderWidth: 1, borderColor: colors.border },
  summaryAmount: { fontFamily: fonts.monoBold, fontSize: fontSize['2xl'] },
  summaryCategory: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  summaryCatIcon: { fontSize: 20 },
  summaryCatName: { fontFamily: fonts.bodyMedium, fontSize: fontSize.md },
  inputGroup: { gap: spacing.sm },
  inputLabel: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.textSecondary },
  textInput: { backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, fontFamily: fonts.body, fontSize: fontSize.base, color: colors.textPrimary },
  quickNames: { marginTop: spacing.xs },
  quickNameChip: { backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.full, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border },
  quickNameText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.base, borderWidth: 1, borderColor: colors.border },
  toggleLabel: { fontFamily: fonts.bodyMedium, fontSize: fontSize.md, color: colors.textPrimary },
  toggle: { width: 48, height: 26, borderRadius: 13, backgroundColor: colors.surfaceHighlight, justifyContent: 'center', paddingHorizontal: 3 },
  toggleActive: { backgroundColor: colors.primaryGlow },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.textMuted },
  toggleThumbActive: { backgroundColor: colors.success, alignSelf: 'flex-end' },
  recurrenceRow: { flexDirection: 'row', gap: spacing.sm },
  recurrenceChip: { flex: 1, alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
  recurrenceChipActive: { borderColor: colors.success, backgroundColor: colors.successGlow },
  recurrenceText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted },
  recurrenceTextActive: { color: colors.success },
  saveBtn: { marginTop: spacing.md },
});
