import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  GlassCard,
  NeonButton,
  ScreenHeader,
  AuroraBackground,
  SignalBadge,
  ConfidenceMeter,
  StatusPill,
  Skeleton,
  Icon,
} from '@/components/ui';
import { colors, fonts, fontSize, spacing, borderRadius } from '@/theme';
import { aiAPI } from '@/services/api';
import type { NormalizedSignal } from '@/hooks/queries';
import { useAIStore } from '@/store/useAIStore';
import { useConnectionStore } from '@/store/useConnectionStore';
import { calculateBuyCharges } from '@/constants/charges';

const FACTOR_META: { key: string; label: string }[] = [
  { key: 'technical', label: 'Technical' },
  { key: 'candlestick', label: 'Candlestick' },
  { key: 'fundamental', label: 'Fundamental' },
  { key: 'sentiment', label: 'Sentiment' },
  { key: 'macro', label: 'Macro' },
];

export default function SignalDetailModal() {
  const { symbol = 'RELIANCE', exchange = 'NSE' } = useLocalSearchParams<{ symbol: string; exchange: string }>();
  const strategy = useAIStore((s) => s.strategyMode);
  const connStatus = useConnectionStore((s) => s.status);
  const [qty, setQty] = useState(1);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['signal-detail', symbol, exchange, strategy],
    queryFn: async (): Promise<NormalizedSignal | null> => {
      const res = await aiAPI.scanWatchlist([{ symbol, exchange }], strategy);
      return res.data?.signals?.[0] ?? res.data?.topPick ?? null;
    },
    staleTime: 5 * 60_000,
  });

  const signal = data ?? null;
  const exch = (exchange === 'BSE' ? 'BSE' : 'NSE') as 'NSE' | 'BSE';
  const charges = signal && signal.entryPrice > 0 ? calculateBuyCharges({ price: signal.entryPrice, quantity: qty, exchange: exch }) : null;

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader
          title={symbol}
          subtitle={`${exchange} · AI signal`}
          onBack={() => router.back()}
          right={<StatusPill label={strategy} color={colors.primary} icon="gauge" />}
        />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <GlassCard animate={false}>
              <Skeleton width={120} height={26} />
              <View style={{ height: 12 }} />
              <Skeleton width="100%" height={10} />
              <View style={{ height: 16 }} />
              <Skeleton width="100%" height={60} />
              <Text style={styles.loadingNote}>Analyzing {symbol} — first scan can take ~20-30s…</Text>
            </GlassCard>
          ) : signal ? (
            <>
              {/* Verdict */}
              <GlassCard animate={false} glowColor={signal.direction === 'BUY' ? colors.success : signal.direction === 'SELL' ? colors.danger : colors.warning}>
                <View style={styles.verdictRow}>
                  <View>
                    <Text style={styles.verdictLabel}>AI VERDICT</Text>
                    <Text style={styles.verdictPrice}>₹{signal.entryPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                  </View>
                  <SignalBadge signal={signal.direction} glowing />
                </View>
                <ConfidenceMeter value={signal.confidence} size="lg" />
                <View style={styles.levels}>
                  <Level label="Target" value={`₹${signal.targetPrice?.toLocaleString('en-IN')}`} pct={signal.targetPercent} color={colors.success} />
                  <Level label="Stop Loss" value={`₹${signal.stopLoss?.toLocaleString('en-IN')}`} pct={signal.stopLossPercent ? -signal.stopLossPercent : undefined} color={colors.danger} />
                  <Level label="R:R" value={signal.riskReward} color={colors.primary} />
                </View>
                <Text style={styles.horizon}>Horizon: {signal.timeHorizon} · Trend: {signal.trend ?? '—'}</Text>
              </GlassCard>

              {/* Factor breakdown */}
              {signal.factors && (
                <GlassCard animate={false}>
                  <Text style={styles.sectionTitle}>FACTOR BREAKDOWN</Text>
                  <View style={{ gap: spacing.md }}>
                    {FACTOR_META.filter((f) => signal.factors?.[f.key] !== undefined).map((f) => (
                      <ConfidenceMeter key={f.key} label={f.label} value={signal.factors![f.key]} size="sm" />
                    ))}
                  </View>
                </GlassCard>
              )}

              {/* Patterns */}
              {signal.patterns && signal.patterns.length > 0 && (
                <GlassCard animate={false}>
                  <Text style={styles.sectionTitle}>CANDLESTICK PATTERNS</Text>
                  <View style={styles.chips}>
                    {signal.patterns.map((p: string) => (
                      <View key={p} style={styles.patternChip}>
                        <Icon name="candles" size={13} color={colors.primary} />
                        <Text style={styles.patternText}>{p}</Text>
                      </View>
                    ))}
                  </View>
                </GlassCard>
              )}

              {/* AI explanation */}
              {!!signal.explanation && (
                <GlassCard animate={false} glowColor={colors.accent}>
                  <View style={styles.reasonHead}>
                    <Icon name="bot" size={15} color={colors.accent} />
                    <Text style={styles.sectionTitleInline}>AI EXPLANATION</Text>
                  </View>
                  <Text style={styles.reason}>{signal.explanation}</Text>
                </GlassCard>
              )}

              {/* Charges for entering this trade */}
              {charges && (
                <GlassCard animate={false}>
                  <View style={styles.chargesHead}>
                    <View style={styles.reasonHead}>
                      <Icon name="rupee" size={15} color={colors.warning} />
                      <Text style={styles.sectionTitleInline}>ENTRY CHARGES</Text>
                    </View>
                    <View style={styles.qtyRow}>
                      {[1, 5, 10, 25].map((q) => (
                        <TouchableOpacity key={q} style={[styles.qtyBtn, qty === q && styles.qtyBtnActive]} onPress={() => setQty(q)}>
                          <Text style={[styles.qtyText, qty === q && { color: colors.primary }]}>{q}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <ChargeRow label={`Market price (${qty} sh)`} value={`₹${charges.grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
                  <ChargeRow label="STT" value={`₹${charges.stt}`} dim />
                  <ChargeRow label="Exchange + SEBI" value={`₹${(charges.exchangeCharge + charges.sebi).toFixed(2)}`} dim />
                  <ChargeRow label="GST" value={`₹${charges.gst}`} dim />
                  <ChargeRow label="Stamp duty" value={`₹${charges.stampDuty}`} dim />
                  <View style={styles.chargeDivider} />
                  <ChargeRow label="You pay" value={`₹${charges.youPay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} bold color={colors.primary} />
                  <Text style={styles.chargeNote}>Total charges: {charges.chargesPercent}% of trade value</Text>
                </GlassCard>
              )}

              <NeonButton title="Re-scan" onPress={() => refetch()} variant="ghost" size="md" iconName="refresh" loading={isRefetching} style={{ marginTop: spacing.sm }} />
            </>
          ) : (
            <GlassCard animate={false}>
              <View style={styles.empty}>
                <Icon name={connStatus === 'online' ? 'bot' : 'wifiOff'} size={28} color={colors.textMuted} />
                <Text style={styles.emptyText}>
                  {connStatus === 'online'
                    ? isError
                      ? 'Could not analyze this stock. The AI engine may be busy or offline.'
                      : 'No signal returned for this symbol.'
                    : 'Backend offline. Configure your PC address in Settings.'}
                </Text>
                <NeonButton title="Try again" onPress={() => refetch()} variant="ghost" size="sm" iconName="refresh" />
              </View>
            </GlassCard>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const Level = ({ label, value, pct, color }: { label: string; value: string; pct?: number; color: string }) => (
  <View style={styles.level}>
    <Text style={styles.levelLabel}>{label}</Text>
    <Text style={[styles.levelValue, { color }]}>{value}</Text>
    {pct !== undefined && <Text style={[styles.levelPct, { color }]}>{pct >= 0 ? '+' : ''}{pct}%</Text>}
  </View>
);

const ChargeRow = ({ label, value, dim, bold, color }: { label: string; value: string; dim?: boolean; bold?: boolean; color?: string }) => (
  <View style={styles.chargeRow}>
    <Text style={[styles.chargeLabel, dim && { color: colors.textMuted }]}>{label}</Text>
    <Text style={[styles.chargeValue, bold && { fontFamily: fonts.monoBold }, color ? { color } : null]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  content: { padding: spacing.base, gap: spacing.base, paddingBottom: spacing['4xl'] },
  loadingNote: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.md, textAlign: 'center' },
  verdictRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.base },
  verdictLabel: { fontFamily: fonts.bodyMedium, fontSize: fontSize.xs, color: colors.textSecondary, letterSpacing: 1 },
  verdictPrice: { fontFamily: fonts.monoBold, fontSize: fontSize['2xl'], color: colors.textPrimary },
  levels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.base, paddingTop: spacing.base, borderTopWidth: 1, borderTopColor: colors.border },
  level: { alignItems: 'center', gap: 2 },
  levelLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  levelValue: { fontFamily: fonts.monoBold, fontSize: fontSize.base },
  levelPct: { fontFamily: fonts.mono, fontSize: fontSize.xs },
  horizon: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.md, textTransform: 'capitalize' },
  sectionTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.textSecondary, letterSpacing: 1, marginBottom: spacing.md },
  sectionTitleInline: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.textSecondary, letterSpacing: 1 },
  reasonHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  reason: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 21 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  patternChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primaryGlow, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderWidth: 1, borderColor: colors.primary },
  patternText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.xs, color: colors.primary },
  chargesHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  qtyRow: { flexDirection: 'row', gap: spacing.xs },
  qtyBtn: { width: 32, height: 28, borderRadius: borderRadius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  qtyBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  qtyText: { fontFamily: fonts.mono, fontSize: fontSize.sm, color: colors.textMuted },
  chargeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3 },
  chargeLabel: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary },
  chargeValue: { fontFamily: fonts.mono, fontSize: fontSize.sm, color: colors.textPrimary },
  chargeDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  chargeNote: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'right', marginTop: spacing.xs },
  empty: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg },
  emptyText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
