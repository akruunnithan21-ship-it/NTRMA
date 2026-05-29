import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlassCard, AnimatedNumber, NeonButton } from '@/components/ui';
import { NetWorthCard } from '@/components/NetWorthCard';
import { colors, fonts, fontSize, spacing, borderRadius } from '@/theme';
import { useFinanceStore } from '@/store/useFinanceStore';
import { NECESSITY_LEVELS, getCategoryById } from '@/constants/categories';

export default function MoneyScreen() {
  const stats = useFinanceStore((s) => s.getMonthlyStats());
  const recentTxns = useFinanceStore((s) => s.getRecentTransactions(8));
  const necessityBreakdown = useFinanceStore((s) => s.getNecessityBreakdown());
  const insights = useFinanceStore((s) => s.generateInsights());
  const recurringTemplates = useFinanceStore((s) => s.recurringTemplates);

  const monthName = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  // Budget utilization percentage
  const budgetUtilization = useMemo(() => {
    const totalBudget = stats.categoryBreakdown.reduce((s, c) => s + c.limit, 0);
    return totalBudget > 0 ? Math.round((stats.totalExpenses / totalBudget) * 100) : 0;
  }, [stats]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View>
            <Text style={styles.title}>Money</Text>
            <Text style={styles.subtitle}>{monthName}</Text>
          </View>
          <Text style={styles.dailyAvg}>~₹{stats.dailyAverage}/day</Text>
        </Animated.View>

        {/* Monthly Overview Card */}
        <GlassCard variant="elevated" glowColor={colors.primary} delay={100}>
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Income</Text>
              <AnimatedNumber value={stats.totalIncome} prefix="₹" color={colors.success} style={styles.overviewValue} />
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Expenses</Text>
              <AnimatedNumber value={stats.totalExpenses} prefix="₹" color={colors.danger} style={styles.overviewValue} />
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Saved</Text>
              <AnimatedNumber value={stats.saved} prefix="₹" color={stats.saved >= 0 ? colors.primary : colors.danger} style={styles.overviewValue} />
            </View>
          </View>
        </GlassCard>

        {/* Investable Surplus */}
        <GlassCard variant="highlighted" glowColor={colors.success} delay={150}>
          <View style={styles.surplusRow}>
            <View>
              <Text style={styles.surplusLabel}>INVESTABLE SURPLUS</Text>
              <AnimatedNumber value={stats.investableSurplus} prefix="₹" color={colors.success} style={{ fontSize: fontSize['2xl'] }} />
            </View>
            <View style={styles.surplusBreakdown}>
              <Text style={styles.surplusHint}>AI recommends:</Text>
              <Text style={styles.surplusDetail}>₹{Math.round(stats.investableSurplus * 0.6)} → SIPs</Text>
              <Text style={styles.surplusDetail}>₹{Math.round(stats.investableSurplus * 0.4)} → Trades</Text>
            </View>
          </View>
        </GlassCard>

        {/* Debt & Asset Calculator */}
        <NetWorthCard />

        {/* Budget vs Actual */}
        <GlassCard delay={200}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>BUDGET vs ACTUAL</Text>
            <Text style={[styles.utilPercent, { color: budgetUtilization > 90 ? colors.danger : budgetUtilization > 70 ? colors.warning : colors.success }]}>
              {budgetUtilization}% used
            </Text>
          </View>
          <View style={styles.budgetList}>
            {stats.categoryBreakdown
              .filter((cb) => cb.spent > 0 || cb.limit > 0)
              .sort((a, b) => (b.spent / b.limit) - (a.spent / a.limit))
              .map((cb) => {
                const cat = getCategoryById(cb.category);
                const percentage = cb.limit > 0 ? Math.min((cb.spent / cb.limit) * 100, 100) : 0;
                const isOver = cb.spent > cb.limit;
                return (
                  <View key={cb.category} style={styles.budgetItem}>
                    <View style={styles.budgetItemHeader}>
                      <View style={styles.budgetItemLeft}>
                        <Text style={styles.budgetIcon}>{cat?.icon}</Text>
                        <Text style={styles.budgetCategory}>{cat?.name}</Text>
                      </View>
                      <Text style={[styles.budgetAmount, isOver && { color: colors.danger }]}>
                        ₹{cb.spent.toLocaleString('en-IN')} / ₹{cb.limit.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View style={styles.budgetTrack}>
                      <View style={[styles.budgetFill, { width: `${percentage}%`, backgroundColor: isOver ? colors.danger : cb.color }]} />
                    </View>
                  </View>
                );
              })}
          </View>
        </GlassCard>

        {/* Necessity Breakdown (Cut Map) */}
        <GlassCard delay={250}>
          <Text style={styles.sectionTitle}>NECESSITY BREAKDOWN (Cut Map)</Text>
          <Text style={styles.cutMapHint}>Lower levels = easier to reduce</Text>
          <View style={styles.necessityList}>
            {necessityBreakdown.map((nb) => {
              const config = NECESSITY_LEVELS.find((n) => n.level === nb.level);
              return (
                <View key={nb.level} style={styles.necessityItem}>
                  <View style={styles.necessityLeft}>
                    <View style={[styles.necessityDot, { backgroundColor: config?.color }]} />
                    <Text style={styles.necessityLabel}>{config?.label}</Text>
                  </View>
                  <View style={styles.necessityRight}>
                    <Text style={[styles.necessityAmount, { color: config?.color }]}>₹{nb.total.toLocaleString('en-IN')}</Text>
                    <Text style={styles.necessityPercent}>{nb.percent}%</Text>
                  </View>
                </View>
              );
            })}
          </View>
          {necessityBreakdown.filter((n) => n.level <= 2).reduce((s, n) => s + n.total, 0) > 0 && (
            <View style={styles.cutSuggestion}>
              <Text style={styles.cutSuggestionText}>
                💡 Cutting Level 1-2 expenses could free up ₹{necessityBreakdown.filter((n) => n.level <= 2).reduce((s, n) => s + n.total, 0).toLocaleString('en-IN')}/month for investments
              </Text>
            </View>
          )}
        </GlassCard>

        {/* AI Insights */}
        {insights.length > 0 && (
          <GlassCard delay={300}>
            <Text style={styles.sectionTitle}>🤖 AI INSIGHTS</Text>
            <View style={styles.insightsList}>
              {insights.slice(0, 4).map((insight) => (
                <View key={insight.id} style={[styles.insightItem, { borderLeftColor: insight.type === 'warning' ? colors.warning : insight.type === 'suggestion' ? colors.primary : colors.success }]}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightMessage}>{insight.message}</Text>
                  {insight.potentialSaving && (
                    <Text style={styles.insightSaving}>Potential saving: ₹{insight.potentialSaving}/mo</Text>
                  )}
                </View>
              ))}
            </View>
          </GlassCard>
        )}

        {/* Upcoming Recurring */}
        <GlassCard delay={350}>
          <Text style={styles.sectionTitle}>UPCOMING RECURRING</Text>
          <View style={styles.recurringList}>
            {recurringTemplates.filter((r) => r.active).map((r) => {
              const cat = getCategoryById(r.category);
              return (
                <View key={r.id} style={styles.recurringItem}>
                  <View style={styles.recurringLeft}>
                    <Text style={styles.recurringIcon}>{cat?.icon}</Text>
                    <View>
                      <Text style={styles.recurringName}>{r.name}</Text>
                      <Text style={styles.recurringDate}>Due: {r.nextDueDate}</Text>
                    </View>
                  </View>
                  <Text style={[styles.recurringAmount, { color: r.type === 'income' ? colors.success : colors.textPrimary }]}>
                    {r.type === 'income' ? '+' : '-'}₹{r.amount.toLocaleString('en-IN')}
                  </Text>
                </View>
              );
            })}
          </View>
        </GlassCard>

        {/* Recent Transactions */}
        <GlassCard delay={400}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT TRANSACTIONS</Text>
            <Text style={styles.txnCount}>{stats.transactionCount} this month</Text>
          </View>
          <View style={styles.transactionList}>
            {recentTxns.map((tx) => {
              const cat = getCategoryById(tx.category);
              return (
                <View key={tx.id} style={styles.transactionItem}>
                  <View style={styles.txLeft}>
                    <Text style={styles.txIcon}>{cat?.icon}</Text>
                    <View>
                      <Text style={styles.txName}>{tx.name}</Text>
                      <Text style={styles.txMeta}>
                        {cat?.name} · {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        {tx.paymentMethod ? ` · ${tx.paymentMethod.toUpperCase()}` : ''}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.txAmount, { color: tx.type === 'income' ? colors.success : colors.textPrimary }]}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </Text>
                </View>
              );
            })}
          </View>
        </GlassCard>

        {/* Add Transaction Buttons */}
        <View style={styles.fabArea}>
          <NeonButton
            title="+ Expense"
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/(modals)/add-expense'); }}
            variant="danger"
            size="md"
          />
          <NeonButton
            title="+ Income"
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/(modals)/add-income'); }}
            variant="success"
            size="md"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.base, paddingBottom: spacing['5xl'], gap: spacing.base },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  title: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary },
  dailyAvg: { fontFamily: fonts.mono, fontSize: fontSize.sm, color: colors.textMuted, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border },
  overviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  overviewItem: { flex: 1, alignItems: 'center', gap: spacing.xs },
  overviewLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  overviewValue: { fontSize: fontSize.lg },
  overviewDivider: { width: 1, height: 40, backgroundColor: colors.border },
  surplusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  surplusLabel: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.textSecondary, letterSpacing: 1, marginBottom: spacing.xs },
  surplusBreakdown: { alignItems: 'flex-end', gap: 2 },
  surplusHint: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  surplusDetail: { fontFamily: fonts.mono, fontSize: fontSize.xs, color: colors.success },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.textSecondary, letterSpacing: 1, marginBottom: spacing.md },
  utilPercent: { fontFamily: fonts.mono, fontSize: fontSize.sm },
  budgetList: { gap: spacing.md },
  budgetItem: { gap: spacing.xs },
  budgetItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budgetItemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  budgetIcon: { fontSize: 16 },
  budgetCategory: { fontFamily: fonts.bodyMedium, fontSize: fontSize.md, color: colors.textPrimary },
  budgetAmount: { fontFamily: fonts.mono, fontSize: fontSize.sm, color: colors.textSecondary },
  budgetTrack: { height: 4, backgroundColor: colors.surfaceHighlight, borderRadius: 2, overflow: 'hidden' },
  budgetFill: { height: '100%', borderRadius: 2 },
  cutMapHint: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, marginTop: -spacing.sm, marginBottom: spacing.md },
  necessityList: { gap: spacing.sm },
  necessityItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  necessityLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  necessityDot: { width: 10, height: 10, borderRadius: 5 },
  necessityLabel: { fontFamily: fonts.bodyMedium, fontSize: fontSize.md, color: colors.textPrimary },
  necessityRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  necessityAmount: { fontFamily: fonts.mono, fontSize: fontSize.md },
  necessityPercent: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted, width: 35, textAlign: 'right' },
  cutSuggestion: { marginTop: spacing.md, backgroundColor: colors.successGlow, borderRadius: borderRadius.md, padding: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.success },
  cutSuggestionText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.success, lineHeight: 20 },
  insightsList: { gap: spacing.sm },
  insightItem: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, borderLeftWidth: 3, gap: spacing.xs },
  insightTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.md, color: colors.textPrimary },
  insightMessage: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
  insightSaving: { fontFamily: fonts.mono, fontSize: fontSize.sm, color: colors.success },
  recurringList: { gap: spacing.md },
  recurringItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recurringLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  recurringIcon: { fontSize: 20 },
  recurringName: { fontFamily: fonts.bodyMedium, fontSize: fontSize.md, color: colors.textPrimary },
  recurringDate: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  recurringAmount: { fontFamily: fonts.mono, fontSize: fontSize.md },
  txnCount: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  transactionList: { gap: spacing.base },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  txIcon: { fontSize: 20 },
  txName: { fontFamily: fonts.bodyMedium, fontSize: fontSize.base, color: colors.textPrimary },
  txMeta: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  txAmount: { fontFamily: fonts.mono, fontSize: fontSize.base },
  fabArea: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md, marginTop: spacing.md },
});
