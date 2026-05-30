import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard, NeonButton, ConfidenceMeter, SignalBadge } from '@/components/ui';
import { colors, fonts, fontSize, spacing, borderRadius } from '@/theme';

export default function AIScreen() {
  const [strategyMode, setStrategyMode] = useState<'aggressive' | 'balanced' | 'protect'>('aggressive');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>AI Adviser</Text>
            <Text style={styles.subtitle}>Your personal analyst</Text>
          </View>
          <View style={styles.aiStatus}>
            <View style={styles.aiDot} />
            <Text style={styles.aiStatusText}>Ollama Connected</Text>
          </View>
        </Animated.View>

        {/* Strategy Mode Selector */}
        <GlassCard delay={100}>
          <Text style={styles.sectionTitle}>STRATEGY MODE</Text>
          <View style={styles.strategyRow}>
            <StrategyButton
              label="🚀 Aggressive"
              active={strategyMode === 'aggressive'}
              onPress={() => setStrategyMode('aggressive')}
              description="High risk, max returns"
            />
            <StrategyButton
              label="⚖️ Balanced"
              active={strategyMode === 'balanced'}
              onPress={() => setStrategyMode('balanced')}
              description="Growth + stability"
            />
            <StrategyButton
              label="🛡️ Protect"
              active={strategyMode === 'protect'}
              onPress={() => setStrategyMode('protect')}
              description="Capital preservation"
            />
          </View>
        </GlassCard>

        {/* Today's Recommendation */}
        <GlassCard variant="highlighted" glowColor={colors.primary} delay={200}>
          <View style={styles.recoHeader}>
            <Text style={styles.recoTitle}>⬡ TODAY'S RECOMMENDATION</Text>
            <Text style={styles.recoTime}>Updated 9:15 AM</Text>
          </View>

          <View style={styles.recoBody}>
            <View style={styles.recoStockRow}>
              <View>
                <Text style={styles.recoStockName}>TATA MOTORS</Text>
                <Text style={styles.recoStockMeta}>NSE · Auto · Large Cap</Text>
              </View>
              <SignalBadge signal="BUY" />
            </View>

            <ConfidenceMeter value={78} delay={400} size="lg" />

            <View style={styles.recoGrid}>
              <View style={styles.recoGridItem}>
                <Text style={styles.recoGridLabel}>Entry</Text>
                <Text style={styles.recoGridValue}>₹952.40</Text>
              </View>
              <View style={styles.recoGridItem}>
                <Text style={styles.recoGridLabel}>Target</Text>
                <Text style={[styles.recoGridValue, { color: colors.success }]}>₹1,105.60</Text>
              </View>
              <View style={styles.recoGridItem}>
                <Text style={styles.recoGridLabel}>Stop Loss</Text>
                <Text style={[styles.recoGridValue, { color: colors.danger }]}>₹895.00</Text>
              </View>
              <View style={styles.recoGridItem}>
                <Text style={styles.recoGridLabel}>Horizon</Text>
                <Text style={styles.recoGridValue}>2-4 weeks</Text>
              </View>
            </View>

            {/* Why this recommendation */}
            <View style={styles.reasonBox}>
              <Text style={styles.reasonTitle}>💡 Why this call?</Text>
              <Text style={styles.reasonText}>
                Strong momentum breakout above ₹940 resistance with 2.3x average volume.
                RSI at 62 (bullish, not overbought). Sector rotation favoring auto.
                FII net buyers in auto for 5 consecutive sessions.
                Earnings beat expected next quarter.
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Active Signals */}
        <GlassCard delay={300}>
          <Text style={styles.sectionTitle}>ACTIVE SIGNALS (3)</Text>
          <View style={styles.signalsList}>
            <ActiveSignal
              stock="TATAMOTORS"
              signal="BUY"
              confidence={78}
              pnl={4.2}
              status="Running"
            />
            <ActiveSignal
              stock="HDFCBANK"
              signal="BUY"
              confidence={72}
              pnl={1.8}
              status="Running"
            />
            <ActiveSignal
              stock="INFY"
              signal="SELL"
              confidence={65}
              pnl={-0.4}
              status="Watching"
            />
          </View>
        </GlassCard>

        {/* Paper Trading Performance */}
        <GlassCard delay={400}>
          <Text style={styles.sectionTitle}>PAPER TRADING PERFORMANCE</Text>
          <View style={styles.perfRow}>
            <View style={styles.perfItem}>
              <Text style={styles.perfValue}>23</Text>
              <Text style={styles.perfLabel}>Total Signals</Text>
            </View>
            <View style={styles.perfItem}>
              <Text style={[styles.perfValue, { color: colors.success }]}>74%</Text>
              <Text style={styles.perfLabel}>Win Rate</Text>
            </View>
            <View style={styles.perfItem}>
              <Text style={[styles.perfValue, { color: colors.success }]}>+18.4%</Text>
              <Text style={styles.perfLabel}>Total Return</Text>
            </View>
          </View>
        </GlassCard>

        {/* Ask AI */}
        <GlassCard delay={500}>
          <Text style={styles.sectionTitle}>ASK THE AI</Text>
          <View style={styles.chatInput}>
            <TextInput
              placeholder="Should I invest in Reliance right now?"
              placeholderTextColor={colors.textMuted}
              style={styles.chatTextInput}
              multiline
            />
            <NeonButton title="Ask" onPress={() => {}} size="sm" />
          </View>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

// Strategy button
const StrategyButton = ({ label, active, onPress, description }: { label: string; active: boolean; onPress: () => void; description: string }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.strategyBtn, active && styles.strategyBtnActive]}
  >
    <Text style={[styles.strategyLabel, active && styles.strategyLabelActive]}>{label}</Text>
    <Text style={styles.strategyDesc}>{description}</Text>
  </TouchableOpacity>
);

// Active signal row
const ActiveSignal = ({ stock, signal, confidence, pnl, status }: { stock: string; signal: 'BUY' | 'SELL' | 'HOLD'; confidence: number; pnl: number; status: string }) => (
  <View style={styles.activeSignalRow}>
    <View style={styles.activeSignalLeft}>
      <Text style={styles.activeSignalStock}>{stock}</Text>
      <View style={styles.activeSignalMeta}>
        <SignalBadge signal={signal} size="sm" />
        <Text style={styles.activeSignalStatus}>{status}</Text>
      </View>
    </View>
    <View style={styles.activeSignalRight}>
      <Text style={[styles.activeSignalPnl, { color: pnl >= 0 ? colors.success : colors.danger }]}>
        {pnl >= 0 ? '+' : ''}{pnl.toFixed(1)}%
      </Text>
      <Text style={styles.activeSignalConf}>{confidence}% conf</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.base, paddingBottom: spacing['5xl'], gap: spacing.base },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  headerLeft: {},
  title: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary },
  aiStatus: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border },
  aiDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  aiStatusText: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.success },
  sectionTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.textSecondary, letterSpacing: 1, marginBottom: spacing.md },
  strategyRow: { gap: spacing.sm },
  strategyBtn: { backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  strategyBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  strategyLabel: { fontFamily: fonts.headingMedium, fontSize: fontSize.base, color: colors.textSecondary },
  strategyLabelActive: { color: colors.primary },
  strategyDesc: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  recoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.base },
  recoTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.primary, letterSpacing: 0.5 },
  recoTime: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  recoBody: { gap: spacing.base },
  recoStockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recoStockName: { fontFamily: fonts.heading, fontSize: fontSize['2xl'], color: colors.textPrimary },
  recoStockMeta: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted },
  recoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  recoGridItem: { width: '45%', gap: spacing.xs },
  recoGridLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  recoGridValue: { fontFamily: fonts.mono, fontSize: fontSize.base, color: colors.textPrimary },
  reasonBox: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.primary },
  reasonTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.primary, marginBottom: spacing.xs },
  reasonText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
  signalsList: { gap: spacing.md },
  activeSignalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  activeSignalLeft: { gap: spacing.xs },
  activeSignalStock: { fontFamily: fonts.headingMedium, fontSize: fontSize.base, color: colors.textPrimary },
  activeSignalMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  activeSignalStatus: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  activeSignalRight: { alignItems: 'flex-end', gap: 2 },
  activeSignalPnl: { fontFamily: fonts.monoBold, fontSize: fontSize.base },
  activeSignalConf: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  perfRow: { flexDirection: 'row', justifyContent: 'space-around' },
  perfItem: { alignItems: 'center', gap: spacing.xs },
  perfValue: { fontFamily: fonts.monoBold, fontSize: fontSize.xl, color: colors.textPrimary },
  perfLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  chatInput: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end' },
  chatTextInput: { flex: 1, backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.md, padding: spacing.md, fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textPrimary, maxHeight: 100, borderWidth: 1, borderColor: colors.border },
});
