import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, fontSize, spacing, borderRadius } from '@/theme';
import { NeonButton } from '@/components/ui';
import {
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  NECESSITY_LEVELS,
  RECURRENCE_OPTIONS,
  Category,
} from '@/constants/categories';
import { autoCategorize, learnCategorization, getSuggestedNames } from '@/utils/autoCategorize';
import { useFinanceStore } from '@/store/useFinanceStore';

type Step = 'amount' | 'category' | 'details';

export default function AddExpenseModal() {
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [necessityLevel, setNecessityLevel] = useState(3);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState('monthly');
  const [note, setNote] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [quickNames, setQuickNames] = useState<string[]>([]);

  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const nameInputRef = useRef<TextInput>(null);

  // Auto-categorize when name changes
  useEffect(() => {
    if (name.length >= 2) {
      const result = autoCategorize(name, 'expense');
      if (result.confidence >= 0.5 && result.source !== 'fallback') {
        setSuggestedCategory(result.categoryId);
        if (!selectedCategory) {
          const cat = EXPENSE_CATEGORIES.find((c) => c.id === result.categoryId);
          if (cat) {
            setSelectedCategory(cat);
            setNecessityLevel(cat.defaultNecessity);
          }
        }
      }
    }
  }, [name]);

  // Load quick names when category changes
  useEffect(() => {
    if (selectedCategory) {
      setQuickNames(getSuggestedNames(selectedCategory.id));
      setNecessityLevel(selectedCategory.defaultNecessity);
    }
  }, [selectedCategory]);

  const handleAmountKey = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (key === 'del') {
      setAmount(amount.slice(0, -1));
    } else if (key === '.') {
      if (!amount.includes('.')) setAmount(amount + '.');
    } else {
      // Limit to reasonable amount
      if (amount.length < 8) setAmount(amount + key);
    }
  };

  const handleNextFromAmount = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep('category');
  };

  const handleSelectCategory = (cat: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(cat);
    setNecessityLevel(cat.defaultNecessity);
    setStep('details');
  };

  const handleQuickName = (quickName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setName(quickName);
  };

  const handleSave = () => {
    if (!amount || !selectedCategory || !name) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Learn the categorization for future auto-suggest
    learnCategorization(name, selectedCategory.id);

    // Add to store
    addTransaction({
      type: 'expense',
      amount: parseFloat(amount),
      category: selectedCategory.id,
      name: name.trim(),
      date: new Date().toISOString(),
      paymentMethod,
      necessityLevel,
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Expense</Text>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step === 'amount' && styles.stepDotActive]} />
          <View style={[styles.stepDot, step === 'category' && styles.stepDotActive]} />
          <View style={[styles.stepDot, step === 'details' && styles.stepDotActive]} />
        </View>
      </View>

      {/* Step 1: Amount */}
      {step === 'amount' && (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.stepContainer}>
          <Text style={styles.stepLabel}>How much did you spend?</Text>
          <View style={styles.amountDisplay}>
            <Text style={styles.currencySymbol}>₹</Text>
            <Text style={styles.amountText}>{amount || '0'}</Text>
          </View>

          {/* Number pad */}
          <View style={styles.numpad}>
            {[
              ['1', '2', '3'],
              ['4', '5', '6'],
              ['7', '8', '9'],
              ['.', '0', 'del'],
            ].map((row, i) => (
              <View key={i} style={styles.numpadRow}>
                {row.map((key) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.numpadKey}
                    onPress={() => handleAmountKey(key)}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.numpadKeyText}>
                      {key === 'del' ? '⌫' : key}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          <NeonButton
            title="Next →"
            onPress={handleNextFromAmount}
            variant="primary"
            size="lg"
            disabled={!amount || parseFloat(amount) <= 0}
            style={styles.nextBtn}
          />
        </Animated.View>
      )}

      {/* Step 2: Category */}
      {step === 'category' && (
        <Animated.View entering={SlideInRight.duration(300)} style={styles.stepContainer}>
          <Text style={styles.stepLabel}>What was this for?</Text>
          <Text style={styles.amountPreview}>₹{parseFloat(amount).toLocaleString('en-IN')}</Text>

          <ScrollView
            contentContainerStyle={styles.categoryGrid}
            showsVerticalScrollIndicator={false}
          >
            {EXPENSE_CATEGORIES.map((cat, index) => (
              <Animated.View
                key={cat.id}
                entering={FadeInDown.delay(index * 30).duration(200)}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    selectedCategory?.id === cat.id && {
                      borderColor: cat.color,
                      backgroundColor: cat.color + '15',
                    },
                  ]}
                  onPress={() => handleSelectCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryName,
                      selectedCategory?.id === cat.id && { color: cat.color },
                    ]}
                    numberOfLines={1}
                  >
                    {cat.name}
                  </Text>
                  {suggestedCategory === cat.id && (
                    <View style={[styles.aiDot, { backgroundColor: cat.color }]} />
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Step 3: Details */}
      {step === 'details' && (
        <Animated.View entering={SlideInRight.duration(300)} style={styles.stepContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.detailsContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Summary */}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryAmount}>₹{parseFloat(amount).toLocaleString('en-IN')}</Text>
                <View style={styles.summaryCategory}>
                  <Text style={styles.summaryCatIcon}>{selectedCategory?.icon}</Text>
                  <Text style={[styles.summaryCatName, { color: selectedCategory?.color }]}>
                    {selectedCategory?.name}
                  </Text>
                </View>
              </View>

              {/* Name input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>What was it? *</Text>
                <TextInput
                  ref={nameInputRef}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g., Zomato biryani, Metro card..."
                  placeholderTextColor={colors.textMuted}
                  style={styles.textInput}
                  autoFocus
                  returnKeyType="done"
                />
                {/* Quick name suggestions */}
                {quickNames.length > 0 && !name && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickNames}>
                    {quickNames.map((qn) => (
                      <TouchableOpacity
                        key={qn}
                        style={styles.quickNameChip}
                        onPress={() => handleQuickName(qn)}
                      >
                        <Text style={styles.quickNameText}>{qn}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* Payment Method */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Paid with</Text>
                <View style={styles.paymentRow}>
                  {PAYMENT_METHODS.map((pm) => (
                    <TouchableOpacity
                      key={pm.id}
                      style={[
                        styles.paymentChip,
                        paymentMethod === pm.id && styles.paymentChipActive,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setPaymentMethod(pm.id);
                      }}
                    >
                      <Text style={styles.paymentIcon}>{pm.icon}</Text>
                      <Text
                        style={[
                          styles.paymentText,
                          paymentMethod === pm.id && styles.paymentTextActive,
                        ]}
                      >
                        {pm.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Necessity Level */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>How necessary? (helps AI suggest cuts)</Text>
                <View style={styles.necessityRow}>
                  {NECESSITY_LEVELS.map((nl) => (
                    <TouchableOpacity
                      key={nl.level}
                      style={[
                        styles.necessityChip,
                        necessityLevel === nl.level && {
                          borderColor: nl.color,
                          backgroundColor: nl.color + '20',
                        },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setNecessityLevel(nl.level);
                      }}
                    >
                      <Text style={[styles.necessityNumber, { color: nl.color }]}>
                        {nl.level}
                      </Text>
                      <Text style={styles.necessityLabel}>{nl.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Recurring Toggle */}
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsRecurring(!isRecurring);
                }}
              >
                <Text style={styles.toggleLabel}>🔄 Recurring expense?</Text>
                <View style={[styles.toggle, isRecurring && styles.toggleActive]}>
                  <View style={[styles.toggleThumb, isRecurring && styles.toggleThumbActive]} />
                </View>
              </TouchableOpacity>

              {isRecurring && (
                <Animated.View entering={FadeInDown.duration(200)} style={styles.recurrenceRow}>
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.recurrenceChip,
                        recurrence === opt.id && styles.recurrenceChipActive,
                      ]}
                      onPress={() => setRecurrence(opt.id)}
                    >
                      <Text
                        style={[
                          styles.recurrenceText,
                          recurrence === opt.id && styles.recurrenceTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </Animated.View>
              )}

              {/* Note (optional) */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Note (optional)</Text>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Any extra details..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.textInput, { height: 60 }]}
                  multiline
                />
              </View>

              {/* Save Button */}
              <NeonButton
                title="Save Expense"
                onPress={handleSave}
                variant="primary"
                size="lg"
                disabled={!name.trim()}
                style={styles.saveBtn}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.xs },
  backText: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.primary },
  headerTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.lg, color: colors.textPrimary },
  stepIndicator: { flexDirection: 'row', gap: spacing.xs },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  stepDotActive: { backgroundColor: colors.primary, width: 20 },

  stepContainer: { flex: 1, padding: spacing.base },
  stepLabel: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.textPrimary, marginBottom: spacing.md, textAlign: 'center' },

  // Amount step
  amountDisplay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing['2xl'] },
  currencySymbol: { fontFamily: fonts.monoBold, fontSize: fontSize['3xl'], color: colors.textSecondary, marginRight: spacing.xs },
  amountText: { fontFamily: fonts.monoBold, fontSize: 56, color: colors.textPrimary },
  numpad: { gap: spacing.md, marginBottom: spacing.xl },
  numpadRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
  numpadKey: { width: 72, height: 56, borderRadius: borderRadius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  numpadKeyText: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.textPrimary },
  nextBtn: { marginTop: 'auto' },

  // Category step
  amountPreview: { fontFamily: fonts.mono, fontSize: fontSize.lg, color: colors.primary, textAlign: 'center', marginBottom: spacing.base },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingBottom: spacing['3xl'] },
  categoryItem: {
    width: '30%',
    flexBasis: '30%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    position: 'relative',
  },
  categoryIcon: { fontSize: 24 },
  categoryName: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary, textAlign: 'center' },
  aiDot: { position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: 3 },

  // Details step
  detailsContent: { gap: spacing.base, paddingBottom: spacing['5xl'] },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.base, borderWidth: 1, borderColor: colors.border },
  summaryAmount: { fontFamily: fonts.monoBold, fontSize: fontSize['2xl'], color: colors.textPrimary },
  summaryCategory: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  summaryCatIcon: { fontSize: 20 },
  summaryCatName: { fontFamily: fonts.bodyMedium, fontSize: fontSize.md },

  inputGroup: { gap: spacing.sm },
  inputLabel: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.textSecondary },
  textInput: { backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, fontFamily: fonts.body, fontSize: fontSize.base, color: colors.textPrimary },

  quickNames: { marginTop: spacing.xs },
  quickNameChip: { backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.full, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border },
  quickNameText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary },

  paymentRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  paymentChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.surface, borderRadius: borderRadius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border },
  paymentChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  paymentIcon: { fontSize: 14 },
  paymentText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary },
  paymentTextActive: { color: colors.primary },

  necessityRow: { flexDirection: 'row', gap: spacing.sm },
  necessityChip: { flex: 1, alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border, gap: 2 },
  necessityNumber: { fontFamily: fonts.monoBold, fontSize: fontSize.base },
  necessityLabel: { fontFamily: fonts.body, fontSize: 9, color: colors.textMuted },

  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.base, borderWidth: 1, borderColor: colors.border },
  toggleLabel: { fontFamily: fonts.bodyMedium, fontSize: fontSize.md, color: colors.textPrimary },
  toggle: { width: 48, height: 26, borderRadius: 13, backgroundColor: colors.surfaceHighlight, justifyContent: 'center', paddingHorizontal: 3 },
  toggleActive: { backgroundColor: colors.primaryGlow },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.textMuted },
  toggleThumbActive: { backgroundColor: colors.primary, alignSelf: 'flex-end' },

  recurrenceRow: { flexDirection: 'row', gap: spacing.sm },
  recurrenceChip: { flex: 1, alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
  recurrenceChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  recurrenceText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted },
  recurrenceTextActive: { color: colors.primary },

  saveBtn: { marginTop: spacing.md },
});
