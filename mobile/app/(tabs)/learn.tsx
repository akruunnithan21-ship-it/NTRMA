import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen, ScreenHeader, GlassCard, NeonButton, Icon, IconName } from '@/components/ui';
import { colors, fonts, fontSize, spacing, borderRadius } from '@/theme';
import { LESSONS, GLOSSARY } from '@/constants/lessons';
import { useLearnStore } from '@/store/useLearnStore';

const PATHS: { id: string; title: string; category: string; color: string }[] = [
  { id: 'basics', title: 'Stock Market Basics', category: 'basics', color: colors.primary },
  { id: 'technical', title: 'Technical Analysis 101', category: 'technical', color: colors.success },
  { id: 'risk', title: 'Risk Management', category: 'risk', color: colors.danger },
  { id: 'money', title: 'Money Mastery', category: 'money', color: colors.warning },
];

const ACHIEVEMENTS: { id: string; icon: IconName; title: string; need: number }[] = [
  { id: 'first', icon: 'star', title: 'First Lesson', need: 1 },
  { id: 'five', icon: 'book', title: 'Curious Mind', need: 5 },
  { id: 'streak', icon: 'flame', title: 'On Fire', need: 8 },
  { id: 'half', icon: 'target', title: 'Halfway', need: Math.ceil(LESSONS.length / 2) },
  { id: 'brain', icon: 'ai', title: 'Scholar', need: LESSONS.length },
  { id: 'pro', icon: 'trophy', title: 'Pro Investor', need: LESSONS.length },
];

export default function LearnScreen() {
  const completed = useLearnStore((s) => s.completed);
  const streak = useLearnStore((s) => s.streak);
  const xp = useLearnStore((s) => s.getXP());
  const level = useLearnStore((s) => s.getLevel());

  const nextLesson = LESSONS.find((l) => !completed.includes(l.id)) ?? LESSONS[0];

  const openLesson = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/(modals)/lesson', params: { id } });
  };

  return (
    <Screen header={<ScreenHeader title="Learn" subtitle="Level up your financial IQ" />}>
      {/* Daily lesson */}
      <GlassCard variant="highlighted" glowColor={colors.primary} delay={80}>
        <View style={styles.badgeRow}>
          <Icon name="book" size={14} color={colors.primary} />
          <Text style={styles.badgeText}>{completed.includes(nextLesson.id) ? 'REVIEW' : "TODAY'S LESSON"}</Text>
        </View>
        <Text style={styles.lessonTitle}>{nextLesson.title}</Text>
        <Text style={styles.lessonPreview} numberOfLines={3}>{nextLesson.content}</Text>
        <NeonButton
          title={`Start Lesson (${nextLesson.duration} min)`}
          onPress={() => openLesson(nextLesson.id)}
          variant="primary"
          size="sm"
          iconName="chevronRight"
          style={{ marginTop: spacing.md }}
        />
      </GlassCard>

      {/* Progress */}
      <GlassCard delay={150}>
        <Text style={styles.sectionTitle}>YOUR PROGRESS</Text>
        <View style={styles.progressGrid}>
          <Progress label="Lessons" value={`${completed.length}`} sub={`/${LESSONS.length}`} />
          <Progress label="Streak" value={`${streak}`} sub="days" />
          <Progress label="Level" value={level} sub="" />
          <Progress label="XP" value={`${xp}`} sub="pts" />
        </View>
      </GlassCard>

      {/* Learning paths */}
      <GlassCard delay={220}>
        <Text style={styles.sectionTitle}>LEARNING PATHS</Text>
        <View style={styles.pathList}>
          {PATHS.map((p) => {
            const total = LESSONS.filter((l) => l.category === p.category).length;
            const done = completed.filter((id) => LESSONS.find((l) => l.id === id)?.category === p.category).length;
            const firstInPath = LESSONS.find((l) => l.category === p.category);
            return (
              <TouchableOpacity key={p.id} style={styles.pathItem} onPress={() => firstInPath && openLesson(firstInPath.id)} activeOpacity={0.8}>
                <View style={[styles.pathDot, { backgroundColor: p.color }]} />
                <View style={styles.pathContent}>
                  <Text style={styles.pathTitle}>{p.title}</Text>
                  <View style={styles.pathProgress}>
                    <View style={styles.pathTrack}>
                      <View style={[styles.pathFill, { width: `${total ? (done / total) * 100 : 0}%`, backgroundColor: p.color }]} />
                    </View>
                    <Text style={styles.pathCount}>{done}/{total}</Text>
                  </View>
                </View>
                <Icon name="chevronRight" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>
      </GlassCard>

      {/* Achievements */}
      <GlassCard delay={290}>
        <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
        <View style={styles.achievementGrid}>
          {ACHIEVEMENTS.map((a) => {
            const unlocked = a.id === 'streak' ? streak >= a.need : completed.length >= a.need;
            return (
              <View key={a.id} style={[styles.achievement, !unlocked && styles.achievementLocked]}>
                <Icon name={a.icon} size={22} color={unlocked ? colors.warning : colors.textMuted} />
                <Text style={[styles.achievementTitle, !unlocked && { color: colors.textMuted }]}>{a.title}</Text>
              </View>
            );
          })}
        </View>
      </GlassCard>

      {/* Glossary */}
      <GlassCard delay={360}>
        <Text style={styles.sectionTitle}>QUICK GLOSSARY</Text>
        <View style={styles.glossaryList}>
          {GLOSSARY.slice(0, 6).map((g) => (
            <View key={g.term} style={styles.glossaryItem}>
              <Text style={styles.glossaryTerm}>{g.term}</Text>
              <Text style={styles.glossaryDef}>{g.definition}</Text>
            </View>
          ))}
        </View>
      </GlassCard>
    </Screen>
  );
}

const Progress = ({ label, value, sub }: { label: string; value: string; sub: string }) => (
  <View style={styles.progressItem}>
    <Text style={styles.progressValue}>{value}</Text>
    <Text style={styles.progressSub}>{sub}</Text>
    <Text style={styles.progressLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  badgeText: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.primary, letterSpacing: 0.5 },
  lessonTitle: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.textPrimary, marginBottom: spacing.sm },
  lessonPreview: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 22 },
  sectionTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.textSecondary, letterSpacing: 1, marginBottom: spacing.md },
  progressGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  progressItem: { alignItems: 'center', gap: 2 },
  progressValue: { fontFamily: fonts.monoBold, fontSize: fontSize.xl, color: colors.primary },
  progressSub: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  progressLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary },
  pathList: { gap: spacing.md },
  pathItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pathDot: { width: 10, height: 10, borderRadius: 5 },
  pathContent: { flex: 1, gap: spacing.xs },
  pathTitle: { fontFamily: fonts.bodyMedium, fontSize: fontSize.md, color: colors.textPrimary },
  pathProgress: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pathTrack: { flex: 1, height: 4, backgroundColor: colors.surfaceHighlight, borderRadius: 2, overflow: 'hidden' },
  pathFill: { height: '100%', borderRadius: 2 },
  pathCount: { fontFamily: fonts.mono, fontSize: fontSize.xs, color: colors.textMuted, width: 32, textAlign: 'right' },
  achievementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  achievement: { width: '30%', alignItems: 'center', backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.md, padding: spacing.md, gap: spacing.xs },
  achievementLocked: { opacity: 0.4 },
  achievementTitle: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textPrimary, textAlign: 'center' },
  glossaryList: { gap: spacing.base },
  glossaryItem: { gap: spacing.xs, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  glossaryTerm: { fontFamily: fonts.headingMedium, fontSize: fontSize.md, color: colors.primary },
  glossaryDef: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
});
