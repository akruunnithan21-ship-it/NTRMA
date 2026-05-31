import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlassCard, NeonButton, ScreenHeader, AuroraBackground, StatusPill, Icon } from '@/components/ui';
import { colors, fonts, fontSize, spacing, borderRadius } from '@/theme';
import { LESSONS } from '@/constants/lessons';
import { useLearnStore } from '@/store/useLearnStore';

export default function LessonModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = LESSONS.find((l) => l.id === id) ?? LESSONS[0];
  const isComplete = useLearnStore((s) => s.isComplete(lesson.id));
  const markComplete = useLearnStore((s) => s.markComplete);

  const complete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    markComplete(lesson.id);
    router.back();
  };

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Lesson" onBack={() => router.back()} />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.metaRow}>
            <StatusPill label={`${lesson.duration} min`} color={colors.primary} icon="clock" />
            <StatusPill label={lesson.category} color={colors.accent} />
            {isComplete && <StatusPill label="Completed" color={colors.success} icon="success" />}
          </View>

          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.body}>{lesson.content}</Text>

          <GlassCard animate={false} glowColor={colors.success} style={{ marginTop: spacing.lg }}>
            <View style={styles.takeawayRow}>
              <Icon name="bulb" size={16} color={colors.success} />
              <Text style={styles.takeawayLabel}>KEY TAKEAWAY</Text>
            </View>
            <Text style={styles.takeaway}>{lesson.keyTakeaway}</Text>
          </GlassCard>

          <NeonButton
            title={isComplete ? 'Done' : 'Mark as Complete  (+50 XP)'}
            onPress={complete}
            variant="success"
            size="lg"
            iconName="check"
            style={{ marginTop: spacing.xl }}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: spacing['4xl'] },
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.base, flexWrap: 'wrap' },
  title: { fontFamily: fonts.heading, fontSize: fontSize['2xl'], color: colors.textPrimary, marginBottom: spacing.md },
  body: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.textSecondary, lineHeight: 26 },
  takeawayRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  takeawayLabel: { fontFamily: fonts.headingMedium, fontSize: fontSize.xs, color: colors.success, letterSpacing: 1 },
  takeaway: { fontFamily: fonts.bodyMedium, fontSize: fontSize.md, color: colors.textPrimary, lineHeight: 22 },
});
