import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Screen,
  ScreenHeader,
  GlassCard,
  NeonButton,
  ConfidenceMeter,
  SignalBadge,
  StatusPill,
  Skeleton,
  Icon,
  IconName,
} from '@/components/ui';
import { colors, fonts, fontSize, spacing, borderRadius } from '@/theme';
import { useAIStore, StrategyMode } from '@/store/useAIStore';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useConnectionStore } from '@/store/useConnectionStore';
import { useTodaySignal, useActiveSignals, useAIStatus, useAskAI } from '@/hooks/queries';
import type { NormalizedSignal } from '@/hooks/queries';
import { aiAPI } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';

const STRATEGIES: { id: StrategyMode; label: string; icon: IconName; desc: string }[] = [
  { id: 'aggressive', label: 'Aggressive', icon: 'rocket', desc: 'High risk, max returns' },
  { id: 'balanced', label: 'Balanced', icon: 'scale', desc: 'Growth + stability' },
  { id: 'protect', label: 'Protect', icon: 'shieldCheck', desc: 'Capital preservation' },
];

export default function AIScreen() {
  const strategy = useAIStore((s) => s.strategyMode);
  const setStrategy = useAIStore((s) => s.setStrategyMode);
  const connStatus = useConnectionStore((s) => s.status);
  const qc = useQueryClient();

  const { data: aiStatus } = useAIStatus();
  const signalQ = useTodaySignal(strategy);
  const activeQ = useActiveSignals();
  const activeSignals: NormalizedSignal[] = activeQ.data ?? [];
  const ask = useAskAI();

  const tradeHistory = usePortfolioStore((s) => s.tradeHistory);
  const winRate = usePortfolioStore((s) => s.getWinRate());
  const paperPnL = usePortfolioStore((s) => s.getTotalPnL('paper'));

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const online = connStatus === 'online';
  const signal = signalQ.data?.signal ?? null;

  const changeStrategy = async (mode: StrategyMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStrategy(mode);
    try { await aiAPI.setStrategy(mode); } catch {}
    qc.invalidateQueries({ queryKey: ['ai'] });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([signalQ.refetch(), activeQ.refetch()]);
    setRefreshing(false);
  };

  const submitQuestion = async () => {
    if (!question.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAnswer(null);
    try {
      const res = await ask.mutateAsync({ question: question.trim() });
      setAnswer(res.answer);
    } catch {
      setAnswer('AI engine is offline. Start the Python engine + Ollama and try again.');
    }
  };

  return (
    <Screen
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      header={
        <ScreenHeader
          title="AI Adviser"
          subtitle="Your personal analyst"
          right={
            <StatusPill
              label={aiStatus?.ollamaConnected ? `${aiStatus.model ?? 'Ollama'}` : online ? 'No model' : 'Offline'}
              color={aiStatus?.ollamaConnected ? colors.success : colors.textMuted}
              icon="bot"
              pulse={!!aiStatus?.ollamaConnected}
            />
          }
        />
      }
    >
      {/* Strategy selector */}
      <GlassCard delay={80}>
        <Text style={styles.sectionTitle}>STRATEGY MODE</Text>
        <View style={styles.strategyRow}>
          {STRATEGIES.map((s) => {
            const active = strategy === s.id;
            return (
              <TouchableOpacity key={s.id} onPress={() => changeStrategy(s.id)} style={[styles.strategyBtn, active && styles.strategyActive]} activeOpacity={0.8}>
                <Icon name={s.icon} size={18} color={active ? colors.primary : colors.textSecondary} />
                <Text style={[styles.strategyLabel, active && { color: colors.primary }]}>{s.label}</Text>
                <Text style={styles.strategyDesc}>{s.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </GlassCard>

      {/* Today's recommendation */}
      <GlassCard variant="highlighted" glowColor={colors.primary} delay={150}>
        <View style={styles.recoHeader}>
          <View style={styles.recoTitleRow}>
            <Icon name="sparkles" size={15} color={colors.primary} />
            <Text style={styles.recoTitle}>TODAY'S RECOMMENDATION</Text>
          </View>
          {signal && <SignalBadge signal={signal.direction} glowing />}
        </View>

        {signalQ.isLoading ? (
          <View style={{ gap: spacing.md, marginTop: spacing.sm }}>
            <Skeleton width={170} height={28} /><Skeleton width={120} height={14} /><Skeleton width="100%" height={10} /><Skeleton width="100%" height={48} />
          </View>
        ) : signal ? (
          <View style={{ gap: spacing.base }}>
            <TouchableOpacity activeOpacity={0.85} onPress={() => router.push({ pathname: '/(modals)/signal-detail', params: { symbol: signal.symbol, exchange: signal.exchange ?? 'NSE' } })}>
              <View style={styles.recoStockRow}>
                <View>
                  <Text style={styles.recoStock}>{signal.symbol}</Text>
                  <Text style={styles.recoMeta}>{signal.exchange ?? 'NSE'} · {signal.timeHorizon}</Text>
                </View>
                <Icon name="chevronRight" size={20} color={colors.textMuted} />
              </View>
            </TouchableOpacity>

            <ConfidenceMeter value={signal.confidence} size="lg" />

            <View style={styles.recoGrid}>
              <RecoCell label="Entry" value={`₹${signal.entryPrice?.toLocaleString('en-IN')}`} />
              <RecoCell label="Target" value={`₹${signal.targetPrice?.toLocaleString('en-IN')}`} color={colors.success} />
              <RecoCell label="Stop Loss" value={`₹${signal.stopLoss?.toLocaleString('en-IN')}`} color={colors.danger} />
              <RecoCell label="R:R" value={signal.riskReward} color={colors.primary} />
            </View>

            {!!signal.explanation && (
              <View style={styles.reasonBox}>
                <View style={styles.reasonTitleRow}>
                  <Icon name="bulb" size={14} color={colors.primary} />
                  <Text style={styles.reasonTitle}>Why this call?</Text>
                </View>
                <Text style={styles.reasonText}>{signal.explanation}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.empty}>
            <Icon name={online ? 'bot' : 'wifiOff'} size={26} color={colors.textMuted} />
            <Text style={styles.emptyText}>
              {online ? 'No recommendation yet. Pull down to scan the market.' : 'Backend offline. Set your PC address in Settings.'}
            </Text>
            <NeonButton title="Scan now" onPress={onRefresh} variant="ghost" size="sm" iconName="refresh" />
          </View>
        )}
      </GlassCard>

      {/* Active signals */}
      <GlassCard delay={220}>
        <Text style={styles.sectionTitle}>ACTIVE SIGNALS {activeSignals.length ? `(${activeSignals.length})` : ''}</Text>
        {activeQ.isLoading ? (
          <View style={{ gap: spacing.md }}>{[0, 1, 2].map((i) => <Skeleton key={i} width="100%" height={20} />)}</View>
        ) : activeSignals.length > 0 ? (
          <View style={styles.signalsList}>
            {activeSignals.map((sig) => (
              <TouchableOpacity
                key={sig.symbol}
                style={styles.activeRow}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/(modals)/signal-detail', params: { symbol: sig.symbol, exchange: sig.exchange ?? 'NSE' } })}
              >
                <View style={styles.activeLeft}>
                  <Text style={styles.activeStock}>{sig.symbol}</Text>
                  <View style={styles.activeMetaRow}>
                    <SignalBadge signal={sig.direction} size="sm" />
                    {!!sig.trend && <Text style={styles.activeStatus}>{sig.trend}</Text>}
                  </View>
                </View>
                <View style={styles.activeRight}>
                  <Text style={styles.activeConf}>{sig.confidence}%</Text>
                  <Text style={styles.activeConfLabel}>confidence</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>{online ? 'No active signals. Pull to refresh.' : 'Offline — configure backend in Settings.'}</Text>
        )}
      </GlassCard>

      {/* Paper trading performance (real from portfolio store) */}
      <GlassCard delay={290}>
        <Text style={styles.sectionTitle}>PAPER TRADING PERFORMANCE</Text>
        <View style={styles.perfRow}>
          <Perf value={`${tradeHistory.length}`} label="Trades" />
          <Perf value={`${winRate.rate}%`} label="Win Rate" color={colors.success} />
          <Perf value={`${paperPnL.percent >= 0 ? '+' : ''}${paperPnL.percent}%`} label="Return" color={paperPnL.percent >= 0 ? colors.success : colors.danger} />
        </View>
      </GlassCard>

      {/* Ask the AI */}
      <GlassCard delay={360}>
        <Text style={styles.sectionTitle}>ASK THE AI</Text>
        <View style={styles.chatInput}>
          <TextInput
            placeholder="Should I invest in Reliance right now?"
            placeholderTextColor={colors.textMuted}
            style={styles.chatText}
            value={question}
            onChangeText={setQuestion}
            multiline
          />
          <NeonButton title="Ask" onPress={submitQuestion} size="sm" loading={ask.isPending} iconName="send" />
        </View>
        {(ask.isPending || answer) && (
          <View style={styles.answerBox}>
            {ask.isPending ? (
              <View style={{ gap: spacing.sm }}><Skeleton width="100%" height={12} /><Skeleton width="90%" height={12} /><Skeleton width="60%" height={12} /></View>
            ) : (
              <Text style={styles.answerText}>{answer}</Text>
            )}
          </View>
        )}
        {!online && !answer && <Text style={styles.hint}>Tip: the AI answers using your local Ollama model via the backend.</Text>}
      </GlassCard>
    </Screen>
  );
}

const RecoCell = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <View style={styles.recoCell}>
    <Text style={styles.recoCellLabel}>{label}</Text>
    <Text style={[styles.recoCellValue, color ? { color } : null]}>{value}</Text>
  </View>
);

const Perf = ({ value, label, color }: { value: string; label: string; color?: string }) => (
  <View style={styles.perfItem}>
    <Text style={[styles.perfValue, color ? { color } : null]}>{value}</Text>
    <Text style={styles.perfLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  sectionTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.textSecondary, letterSpacing: 1, marginBottom: spacing.md },
  strategyRow: { gap: spacing.sm },
  strategyBtn: { backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: 2 },
  strategyActive: { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  strategyLabel: { fontFamily: fonts.headingMedium, fontSize: fontSize.base, color: colors.textSecondary, marginTop: spacing.xs },
  strategyDesc: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  recoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.base },
  recoTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  recoTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.primary, letterSpacing: 0.5 },
  recoStockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recoStock: { fontFamily: fonts.heading, fontSize: fontSize['2xl'], color: colors.textPrimary },
  recoMeta: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted },
  recoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  recoCell: { width: '45%', gap: 2 },
  recoCellLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  recoCellValue: { fontFamily: fonts.mono, fontSize: fontSize.base, color: colors.textPrimary },
  reasonBox: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.primary, gap: spacing.xs },
  reasonTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  reasonTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.primary },
  reasonText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
  signalsList: { gap: spacing.sm },
  activeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  activeLeft: { gap: spacing.xs },
  activeStock: { fontFamily: fonts.headingMedium, fontSize: fontSize.base, color: colors.textPrimary },
  activeMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  activeStatus: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, textTransform: 'capitalize' },
  activeRight: { alignItems: 'flex-end' },
  activeConf: { fontFamily: fonts.monoBold, fontSize: fontSize.lg, color: colors.primary },
  activeConfLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  perfRow: { flexDirection: 'row', justifyContent: 'space-around' },
  perfItem: { alignItems: 'center', gap: spacing.xs },
  perfValue: { fontFamily: fonts.monoBold, fontSize: fontSize.xl, color: colors.textPrimary },
  perfLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  chatInput: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end' },
  chatText: { flex: 1, backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.md, padding: spacing.md, fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textPrimary, maxHeight: 110, borderWidth: 1, borderColor: colors.border },
  answerBox: { marginTop: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.success },
  answerText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textPrimary, lineHeight: 21 },
  empty: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  emptyText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  hint: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
});
