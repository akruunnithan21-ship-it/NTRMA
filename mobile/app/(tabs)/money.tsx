import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard, AnimatedNumber, NeonButton } from '@/components/ui';
import { colors, fonts, fontSize, spacing } from '@/theme';

export default function MoneyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Text style={styles.title}>Money</Text>
          <Text style={styles.subtitle}>Track every rupee</Text>
        </Animated.View>

        {/* Monthly Overview */}
        <GlassCard variant="elevated" glowColor={colors.primary} delay={100}>
          <Text style={styles.cardLabel}>MAY 2026</Text>
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Income</Text>
              <AnimatedNumber
                value={13000}
                prefix="₹"
                color={colors.success}
                style={styles.overviewValue}
              />
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Expenses</Text>
              <AnimatedNumber
                value={9200}
                prefix="₹"
                color={colors.danger}
                style={styles.overviewValue}
              />
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Saved</Text>
              <AnimatedNumber
                value={3800}
                prefix="₹"
                color={colors.primary}
                style={styles.overviewValue}
              />
            </View>
          </View>
        </GlassCard>

        {/* Budget Breakdown */}
        <GlassCard delay={200}>
          <Text style={styles.sectionTitle}>BUDGET vs ACTUAL</Text>
          <View style={styles.budgetList}>
            <BudgetItem category="Rent" spent={5000} budget={5000} color="#FF6B35" />
            <BudgetItem category="Food" spent={2800} budget={3000} color="#FFB800" />
            <BudgetItem category="Transport" spent={650} budget={800} color="#00F0FF" />
            <BudgetItem category="Subscriptions" spent={499} budget={500} color="#A855F7" />
            <BudgetItem category="Miscellaneous" spent={251} budget={500} color="#8A8AA3" />
          </View>
        </GlassCard>

        {/* Investable Surplus */}
        <GlassCard variant="highlighted" glowColor={colors.success} delay={300}>
          <Text style={styles.cardLabel}>INVESTABLE SURPLUS</Text>
          <AnimatedNumber
            value={2600}
            prefix="₹"
            color={colors.success}
            style={{ fontSize: fontSize['2xl'] }}
          />
          <Text style={styles.surplusHint}>
            AI recommends: ₹1,500 to SIPs + ₹1,100 for swing trades
          </Text>
        </GlassCard>

        {/* Recent Transactions */}
        <GlassCard delay={400}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT TRANSACTIONS</Text>
            <Text style={styles.seeAll}>See all →</Text>
          </View>
          <View style={styles.transactionList}>
            <TransactionItem
              name="Zomato"
              category="Food"
              amount={-345}
              date="Today"
            />
            <TransactionItem
              name="Salary Credited"
              category="Income"
              amount={13000}
              date="28 May"
            />
            <TransactionItem
              name="Metro Card"
              category="Transport"
              amount={-200}
              date="27 May"
            />
            <TransactionItem
              name="Netflix"
              category="Subscription"
              amount={-199}
              date="26 May"
            />
          </View>
        </GlassCard>

        {/* Add Transaction FAB area */}
        <View style={styles.fabArea}>
          <NeonButton title="+ Add Transaction" onPress={() => {}} variant="primary" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Budget item sub-component
const BudgetItem = ({
  category,
  spent,
  budget,
  color,
}: {
  category: string;
  spent: number;
  budget: number;
  color: string;
}) => {
  const percentage = Math.min((spent / budget) * 100, 100);
  const isOver = spent > budget;

  return (
    <View style={styles.budgetItem}>
      <View style={styles.budgetItemHeader}>
        <View style={styles.budgetItemLeft}>
          <View style={[styles.budgetDot, { backgroundColor: color }]} />
          <Text style={styles.budgetCategory}>{category}</Text>
        </View>
        <Text style={[styles.budgetAmount, isOver && { color: colors.danger }]}>
          ₹{spent.toLocaleString('en-IN')} / ₹{budget.toLocaleString('en-IN')}
        </Text>
      </View>
      <View style={styles.budgetTrack}>
        <View
          style={[
            styles.budgetFill,
            {
              width: `${percentage}%`,
              backgroundColor: isOver ? colors.danger : color,
            },
          ]}
        />
      </View>
    </View>
  );
};

// Transaction item sub-component
const TransactionItem = ({
  name,
  category,
  amount,
  date,
}: {
  name: string;
  category: string;
  amount: number;
  date: string;
}) => (
  <View style={styles.transactionItem}>
    <View>
      <Text style={styles.transactionName}>{name}</Text>
      <Text style={styles.transactionCategory}>{category} · {date}</Text>
    </View>
    <Text
      style={[
        styles.transactionAmount,
        { color: amount >= 0 ? colors.success : colors.textPrimary },
      ]}
    >
      {amount >= 0 ? '+' : ''}₹{Math.abs(amount).toLocaleString('en-IN')}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.base, paddingBottom: spacing['5xl'], gap: spacing.base },
  header: { marginBottom: spacing.sm },
  title: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary },
  cardLabel: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.textSecondary, letterSpacing: 1, marginBottom: spacing.sm },
  overviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  overviewItem: { flex: 1, alignItems: 'center', gap: spacing.xs },
  overviewLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  overviewValue: { fontSize: fontSize.lg },
  overviewDivider: { width: 1, height: 40, backgroundColor: colors.border },
  sectionTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.textSecondary, letterSpacing: 1, marginBottom: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  seeAll: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.primary },
  budgetList: { gap: spacing.md },
  budgetItem: { gap: spacing.xs },
  budgetItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budgetItemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  budgetDot: { width: 8, height: 8, borderRadius: 4 },
  budgetCategory: { fontFamily: fonts.bodyMedium, fontSize: fontSize.md, color: colors.textPrimary },
  budgetAmount: { fontFamily: fonts.mono, fontSize: fontSize.sm, color: colors.textSecondary },
  budgetTrack: { height: 4, backgroundColor: colors.surfaceHighlight, borderRadius: 2, overflow: 'hidden' },
  budgetFill: { height: '100%', borderRadius: 2 },
  surplusHint: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm },
  transactionList: { gap: spacing.base },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  transactionName: { fontFamily: fonts.bodyMedium, fontSize: fontSize.base, color: colors.textPrimary },
  transactionCategory: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted },
  transactionAmount: { fontFamily: fonts.mono, fontSize: fontSize.base },
  fabArea: { alignItems: 'center', marginTop: spacing.md },
});
