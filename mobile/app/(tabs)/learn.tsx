import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard, NeonButton } from '@/components/ui';
import { colors, fonts, fontSize, spacing, borderRadius } from '@/theme';

export default function LearnScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Text style={styles.title}>Learn</Text>
          <Text style={styles.subtitle}>Level up your financial IQ</Text>
        </Animated.View>

        {/* Daily Lesson */}
        <GlassCard variant="highlighted" glowColor={colors.primary} delay={100}>
          <View style={styles.dailyBadge}>
            <Text style={styles.dailyBadgeText}>📚 TODAY'S LESSON</Text>
          </View>
          <Text style={styles.lessonTitle}>What is a Stop Loss?</Text>
          <Text style={styles.lessonPreview}>
            A stop loss is like a safety net for your investments. It automatically sells your stock
            when it falls to a certain price, protecting you from bigger losses...
          </Text>
          <NeonButton title="Start Lesson (3 min)" onPress={() => {}} variant="primary" size="sm" style={{ marginTop: spacing.md }} />
        </GlassCard>

        {/* Progress */}
        <GlassCard delay={200}>
          <Text style={styles.sectionTitle}>YOUR PROGRESS</Text>
          <View style={styles.progressGrid}>
            <ProgressItem label="Lessons Done" value="7" total="50" />
            <ProgressItem label="Current Streak" value="4" total="days" />
            <ProgressItem label="Level" value="Beginner" total="" />
            <ProgressItem label="XP" value="340" total="pts" />
          </View>
        </GlassCard>

        {/* Learning Paths */}
        <GlassCard delay={300}>
          <Text style={styles.sectionTitle}>LEARNING PATHS</Text>
          <View style={styles.pathList}>
            <LearningPath
              title="Stock Market Basics"
              lessons={12}
              completed={4}
              color={colors.primary}
            />
            <LearningPath
              title="Technical Analysis 101"
              lessons={8}
              completed={2}
              color={colors.success}
            />
            <LearningPath
              title="Mutual Funds & SIPs"
              lessons={6}
              completed={1}
              color={colors.warning}
            />
            <LearningPath
              title="Risk Management"
              lessons={10}
              completed={0}
              color={colors.danger}
            />
            <LearningPath
              title="US Market Investing"
              lessons={8}
              completed={0}
              color="#A855F7"
            />
          </View>
        </GlassCard>

        {/* Achievements */}
        <GlassCard delay={400}>
          <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
          <View style={styles.achievementGrid}>
            <Achievement icon="🎯" title="First Trade" unlocked />
            <Achievement icon="📊" title="Chart Reader" unlocked />
            <Achievement icon="🔥" title="7-Day Streak" unlocked={false} />
            <Achievement icon="💰" title="First Profit" unlocked={false} />
            <Achievement icon="🧠" title="AI Master" unlocked={false} />
            <Achievement icon="📈" title="Doubler" unlocked={false} />
          </View>
        </GlassCard>

        {/* Glossary */}
        <GlassCard delay={500}>
          <Text style={styles.sectionTitle}>QUICK GLOSSARY</Text>
          <View style={styles.glossaryList}>
            <GlossaryItem term="P/E Ratio" definition="Price-to-Earnings ratio. Shows how much investors pay per rupee of earnings." />
            <GlossaryItem term="SIP" definition="Systematic Investment Plan. Auto-invest a fixed amount monthly into mutual funds." />
            <GlossaryItem term="RSI" definition="Relative Strength Index. Momentum indicator showing if a stock is overbought (>70) or oversold (<30)." />
          </View>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-components
const ProgressItem = ({ label, value, total }: { label: string; value: string; total: string }) => (
  <View style={styles.progressItem}>
    <Text style={styles.progressValue}>{value}</Text>
    <Text style={styles.progressTotal}>{total}</Text>
    <Text style={styles.progressLabel}>{label}</Text>
  </View>
);

const LearningPath = ({ title, lessons, completed, color }: { title: string; lessons: number; completed: number; color: string }) => (
  <TouchableOpacity style={styles.pathItem}>
    <View style={[styles.pathDot, { backgroundColor: color }]} />
    <View style={styles.pathContent}>
      <Text style={styles.pathTitle}>{title}</Text>
      <View style={styles.pathProgress}>
        <View style={styles.pathTrack}>
          <View style={[styles.pathFill, { width: `${(completed / lessons) * 100}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.pathCount}>{completed}/{lessons}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const Achievement = ({ icon, title, unlocked }: { icon: string; title: string; unlocked: boolean }) => (
  <View style={[styles.achievementItem, !unlocked && styles.achievementLocked]}>
    <Text style={styles.achievementIcon}>{icon}</Text>
    <Text style={[styles.achievementTitle, !unlocked && styles.achievementTitleLocked]}>{title}</Text>
  </View>
);

const GlossaryItem = ({ term, definition }: { term: string; definition: string }) => (
  <View style={styles.glossaryItem}>
    <Text style={styles.glossaryTerm}>{term}</Text>
    <Text style={styles.glossaryDef}>{definition}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.base, paddingBottom: spacing['5xl'], gap: spacing.base },
  header: { marginBottom: spacing.sm },
  title: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary },
  sectionTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.textSecondary, letterSpacing: 1, marginBottom: spacing.md },
  dailyBadge: { marginBottom: spacing.sm },
  dailyBadgeText: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.primary, letterSpacing: 0.5 },
  lessonTitle: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.textPrimary, marginBottom: spacing.sm },
  lessonPreview: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 22 },
  progressGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  progressItem: { alignItems: 'center', gap: 2 },
  progressValue: { fontFamily: fonts.monoBold, fontSize: fontSize.xl, color: colors.primary },
  progressTotal: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  progressLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary },
  pathList: { gap: spacing.md },
  pathItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pathDot: { width: 10, height: 10, borderRadius: 5 },
  pathContent: { flex: 1, gap: spacing.xs },
  pathTitle: { fontFamily: fonts.bodyMedium, fontSize: fontSize.md, color: colors.textPrimary },
  pathProgress: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pathTrack: { flex: 1, height: 4, backgroundColor: colors.surfaceHighlight, borderRadius: 2, overflow: 'hidden' },
  pathFill: { height: '100%', borderRadius: 2 },
  pathCount: { fontFamily: fonts.mono, fontSize: fontSize.xs, color: colors.textMuted, width: 30 },
  achievementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  achievementItem: { width: '30%', alignItems: 'center', backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.md, padding: spacing.md, gap: spacing.xs },
  achievementLocked: { opacity: 0.4 },
  achievementIcon: { fontSize: 24 },
  achievementTitle: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textPrimary, textAlign: 'center' },
  achievementTitleLocked: { color: colors.textMuted },
  glossaryList: { gap: spacing.base },
  glossaryItem: { gap: spacing.xs, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  glossaryTerm: { fontFamily: fonts.headingMedium, fontSize: fontSize.md, color: colors.primary },
  glossaryDef: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
});
