import React, { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Screen,
  ScreenHeader,
  IconButton,
  GlassCard,
  GradientText,
  AnimatedNumber,
  ConfidenceMeter,
  SignalBadge,
  PriceChange,
  NeonButton,
  StatusPill,
  Skeleton,
  Icon,
} from '@/components/ui';
import { useNetWorthStore } from '@/store/useNetWorthStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useAIStore } from '@/store/useAIStore';
import { useConnectionStore } from '@/store/useConnectionStore';
import { useTodaySignal, useIndices, useAIStatus } from '@/hooks/queries';
import type { MarketIndex } from '@/hooks/queries';
import { colors, fonts, fontSize, spacing } from '@/theme';

const GOAL = 50000;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen() {
  const netWorth = useNetWorthStore((s) => s.getNetWorth());
  const investable = useFinanceStore((s) => s.getInvestableSurplus());
  const paperPnL = usePortfolioStore((s) => s.getTotalPnL('paper'));
  const strategy = useAIStore((s) => s.strategyMode);

  const connStatus = useConnectionStore((s) => s.status);
  const { data: aiStatus } = useAIStatus();
  const { data: signalData, isLoading: signalLoading, isError: signalError, refetch: refetchSignal } = useTodaySignal(strategy);
  const indicesQuery = useIndices();
  const indices: MarketIndex[] = indicesQuery.data ?? [];
  const indicesLoading = indicesQuery.isLoading;
  const refetchIndices = indicesQuery.refetch;

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Promise.allSettled([refetchSignal(), refetchIndices(), useConnectionStore.getState().checkHealth()]);
    setRefreshing(false);
  }, [refetchSignal, refetchIndices]);

  const online = connStatus === 'online';
  const signal = signalData?.signal ?? null;
  const goalPct = Math.max(0, Math.min(100, (netWorth / GOAL) * 100));

  const openSignal = () => {
    if (!signal) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/(modals)/signal-detail', params: { symbol: signal.symbol, exchange: signal.exchange ?? 'NSE' } });
  };

  return (
    <Screen
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      header={
        <ScreenHeader
          title="WealthMaster"
          gradient
          subtitle={greeting()}
          right={
            <StatusPill
              label={online ? (aiStatus?.ollamaConnected ? 'AI Live' : 'Online') : 'Offline'}
              color={online ? (aiStatus?.ollamaConnected ? colors.success : colors.primary) : colors.textMuted}
              pulse={online}
            />
          }
        />
      }
    >
      {/* Net Worth hero */}
      <GlassCard variant="elevated" glowColor={netWorth >= 0 ? colors.primary : colors.danger} delay={80}>
        <Text style={styles.cardLabel}>NET WORTH</Text>
        <GradientText
          gradient={netWorth >= 0 ? colors.gradientCyan : colors.gradientDanger}
          style={styles.heroNumber}
        >
          {`${netWorth < 0 ? '-' : ''}₹${Math.abs(netWorth).toLocaleString('en-IN')}`}
        </GradientText>
        <View style={styles.netWorthMeta}>
          <PriceChange value={paperPnL.amount} percentage={paperPnL.percent} />
          <Text style={styles.metaText}>paper P&L</Text>
        </View>
        <View style={styles.goalProgress}>
          <View style={styles.goalTrack}>
            <Animated.View style={[styles.goalFill, { width: `${goalPct}%` }]} />
          </View>
          <Text style={styles.goalText}>{goalPct.toFixed(0)}% to ₹{GOAL.toLocaleString('en-IN')}</Text>
        </View>
      </GlassCard>

      {/* Quick stats */}
      <View style={styles.statsRow}>
        <GlassCard style={styles.statCard} delay={150}>
          <View style={styles.statHead}>
            <Icon name="piggy" size={14} color={colors.success} />
            <Text style={styles.statLabel}>INVESTABLE</Text>
          </View>
          <AnimatedNumber value={investable} prefix="₹" suffix="/mo" color={colors.success} style={styles.statValue} />
        </GlassCard>
        <GlassCard style={styles.statCard} delay={210}>
          <View style={styles.statHead}>
            <Icon name="gauge" size={14} color={colors.primary} />
            <Text style={styles.statLabel}>STRATEGY</Text>
          </View>
          <Text style={styles.statValueText}>{strategy[0].toUpperCase() + strategy.slice(1)}</Text>
        </GlassCard>
      </View>

      {/* AI signal of the day */}
      <GlassCard variant="highlighted" glowColor={colors.success} delay={280}>
        <View style={styles.signalHeader}>
          <View style={styles.signalTitleRow}>
            <Icon name="ai" size={16} color={colors.primary} />
            <Text style={styles.signalTitle}>AI SIGNAL OF THE DAY</Text>
          </View>
          {signal && <SignalBadge signal={signal.direction} glowing />}
        </View>

        {signalLoading ? (
          <View style={{ gap: spacing.md, marginTop: spacing.sm }}>
            <Skeleton width={160} height={26} />
            <Skeleton width={110} height={14} />
            <Skeleton width="100%" height={8} />
          </View>
        ) : signal ? (
          <TouchableOpacity activeOpacity={0.85} onPress={openSignal}>
            <Text style={styles.signalStock}>{signal.symbol}</Text>
            <Text style={styles.signalExchange}>
              {signal.exchange ?? 'NSE'} · ₹{signal.entryPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
            <ConfidenceMeter value={signal.confidence} delay={420} />
            <View style={styles.signalMeta}>
              <Meta label="Target" value={`+${signal.targetPercent ?? '—'}%`} color={colors.success} />
              <Meta label="Stop Loss" value={`-${signal.stopLossPercent ?? '—'}%`} color={colors.danger} />
              <Meta label="R:R" value={signal.riskReward} color={colors.primary} />
            </View>
            <NeonButton title="View Full Analysis" onPress={openSignal} variant="ghost" size="sm" iconName="chevronRight" style={{ marginTop: spacing.md }} />
          </TouchableOpacity>
        ) : (
          <EmptySignal online={online} error={signalError} onRetry={() => refetchSignal()} />
        )}
      </GlassCard>

      {/* Market pulse (live indices) */}
      <GlassCard delay={360}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>MARKET PULSE</Text>
          <IconButton icon="refresh" onPress={() => refetchIndices()} />
        </View>
        {indicesLoading && !indices?.length ? (
          <View style={{ gap: spacing.md }}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.tickerRow}>
                <Skeleton width={90} height={14} />
                <Skeleton width={110} height={14} />
              </View>
            ))}
          </View>
        ) : indices && indices.length > 0 ? (
          <View style={styles.marketList}>
            {indices.map((idx) => (
              <View key={idx.symbol} style={styles.tickerRow}>
                <Text style={styles.tickerName}>{idx.name}</Text>
                <View style={styles.tickerRight}>
                  <Text style={styles.tickerValue}>{idx.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                  <View style={styles.tickerChange}>
                    <Icon name={idx.changePercent >= 0 ? 'up' : 'down'} size={12} color={idx.changePercent >= 0 ? colors.success : colors.danger} strokeWidth={3} />
                    <Text style={[styles.tickerChangeText, { color: idx.changePercent >= 0 ? colors.success : colors.danger }]}>
                      {Math.abs(idx.changePercent).toFixed(2)}%
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>
            {online ? 'No index data right now. Pull to refresh.' : 'Connect to your backend (Settings) to see live indices.'}
          </Text>
        )}
      </GlassCard>

      {/* Quick actions */}
      <View style={styles.quickActions}>
        <NeonButton title="Expense" onPress={() => router.push('/(modals)/add-expense')} variant="ghost" size="sm" iconName="minus" style={styles.qa} />
        <NeonButton title="Income" onPress={() => router.push('/(modals)/add-income')} variant="ghost" size="sm" iconName="plus" style={styles.qa} />
      </View>
    </Screen>
  );
}

const Meta = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <View style={styles.metaItem}>
    <Text style={styles.metaLabel}>{label}</Text>
    <Text style={[styles.metaValue, { color }]}>{value}</Text>
  </View>
);

const EmptySignal = ({ online, error, onRetry }: { online: boolean; error: boolean; onRetry: () => void }) => (
  <View style={styles.empty}>
    <Icon name={online ? 'bot' : 'wifiOff'} size={26} color={colors.textMuted} />
    <Text style={styles.emptyText}>
      {online
        ? error
          ? 'AI engine is busy or offline. Make sure the Python engine + Ollama are running.'
          : 'No signal yet. Tap below to scan the market.'
        : 'Backend offline. Set your PC address in Settings to get live signals.'}
    </Text>
    <NeonButton title="Generate Signal" onPress={onRetry} variant="ghost" size="sm" iconName="sparkles" />
  </View>
);

const styles = StyleSheet.create({
  cardLabel: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.textSecondary, letterSpacing: 1, marginBottom: spacing.xs },
  heroNumber: { fontFamily: fonts.monoBold, fontSize: fontSize['4xl'], lineHeight: fontSize['4xl'] * 1.1 },
  netWorthMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  metaText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted },
  goalProgress: { marginTop: spacing.md, gap: spacing.xs },
  goalTrack: { height: 5, backgroundColor: colors.surfaceHighlight, borderRadius: 3, overflow: 'hidden' },
  goalFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  goalText: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, alignSelf: 'flex-end' },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statCard: { flex: 1 },
  statHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  statLabel: { fontFamily: fonts.bodyMedium, fontSize: fontSize.xs, color: colors.textMuted, letterSpacing: 0.5 },
  statValue: { fontSize: fontSize.lg },
  statValueText: { fontFamily: fonts.heading, fontSize: fontSize.lg, color: colors.textPrimary },
  signalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  signalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  signalTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.textSecondary, letterSpacing: 1 },
  signalStock: { fontFamily: fonts.heading, fontSize: fontSize['2xl'], color: colors.textPrimary },
  signalExchange: { fontFamily: fonts.mono, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md },
  signalMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  metaItem: { alignItems: 'center', gap: spacing.xs },
  metaLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  metaValue: { fontFamily: fonts.monoBold, fontSize: fontSize.base },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.textSecondary, letterSpacing: 1 },
  marketList: { gap: spacing.md },
  tickerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tickerName: { fontFamily: fonts.bodyMedium, fontSize: fontSize.md, color: colors.textPrimary },
  tickerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  tickerValue: { fontFamily: fonts.mono, fontSize: fontSize.md, color: colors.textPrimary },
  tickerChange: { flexDirection: 'row', alignItems: 'center', gap: 3, width: 70, justifyContent: 'flex-end' },
  tickerChangeText: { fontFamily: fonts.mono, fontSize: fontSize.sm },
  empty: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  emptyText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  quickActions: { flexDirection: 'row', gap: spacing.md },
  qa: { flex: 1 },
});
