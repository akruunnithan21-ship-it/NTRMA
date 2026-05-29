import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  GlassCard,
  AnimatedNumber,
  ConfidenceMeter,
  SignalBadge,
  PriceChange,
  NeonButton,
} from '@/components/ui';
import { useNetWorthStore } from '@/store/useNetWorthStore';
import { colors, fonts, fontSize, spacing } from '@/theme';

export default function DashboardScreen() {
  // Use real net worth from store
  const netWorth = useNetWorthStore((s) => s.getNetWorth());
  const todayPnL = 234;
  const todayPnLPercent = 1.6;
  const investable = 2400;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.header}
        >
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.title}>WealthMaster</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>AI Active</Text>
          </View>
        </Animated.View>

        {/* Net Worth Card */}
        <GlassCard variant="elevated" glowColor={colors.primary} delay={100}>
          <Text style={styles.cardLabel}>NET WORTH</Text>
          <AnimatedNumber
            value={netWorth}
            prefix="₹"
            style={styles.netWorthValue}
          />
          <View style={styles.netWorthMeta}>
            <PriceChange value={todayPnL} percentage={todayPnLPercent} />
            <Text style={styles.metaText}>today</Text>
          </View>
          {/* Progress bar to goal */}
          <View style={styles.goalProgress}>
            <View style={styles.goalTrack}>
              <View
                style={[
                  styles.goalFill,
                  { width: `${(netWorth / 50000) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.goalText}>Goal: ₹50,000</Text>
          </View>
        </GlassCard>

        {/* Quick Stats Row */}
        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard} delay={200}>
            <Text style={styles.statLabel}>TODAY P&L</Text>
            <AnimatedNumber
              value={todayPnL}
              prefix={todayPnL >= 0 ? '+₹' : '-₹'}
              color={todayPnL >= 0 ? colors.success : colors.danger}
              style={styles.statValue}
            />
          </GlassCard>
          <GlassCard style={styles.statCard} delay={300}>
            <Text style={styles.statLabel}>INVESTABLE</Text>
            <AnimatedNumber
              value={investable}
              prefix="₹"
              suffix="/mo"
              color={colors.primary}
              style={styles.statValue}
            />
          </GlassCard>
        </View>

        {/* AI Signal Card */}
        <GlassCard
          variant="highlighted"
          glowColor={colors.success}
          delay={400}
        >
          <View style={styles.signalHeader}>
            <View style={styles.signalTitleRow}>
              <Text style={styles.signalIcon}>⬡</Text>
              <Text style={styles.signalTitle}>AI SIGNAL OF THE DAY</Text>
            </View>
            <SignalBadge signal="BUY" />
          </View>

          <Text style={styles.signalStock}>TATA MOTORS</Text>
          <Text style={styles.signalExchange}>NSE · ₹952.40</Text>

          <ConfidenceMeter value={78} delay={600} />

          <View style={styles.signalMeta}>
            <View style={styles.signalMetaItem}>
              <Text style={styles.signalMetaLabel}>Target</Text>
              <Text style={[styles.signalMetaValue, { color: colors.success }]}>
                +16.1%
              </Text>
            </View>
            <View style={styles.signalMetaItem}>
              <Text style={styles.signalMetaLabel}>Stop Loss</Text>
              <Text style={[styles.signalMetaValue, { color: colors.danger }]}>
                -6.0%
              </Text>
            </View>
            <View style={styles.signalMetaItem}>
              <Text style={styles.signalMetaLabel}>R:R</Text>
              <Text style={[styles.signalMetaValue, { color: colors.primary }]}>
                1:2.7
              </Text>
            </View>
          </View>

          <NeonButton
            title="View Full Analysis"
            onPress={() => {}}
            variant="ghost"
            size="sm"
            style={{ marginTop: spacing.md }}
          />
        </GlassCard>

        {/* Market Pulse */}
        <GlassCard delay={500}>
          <Text style={styles.sectionTitle}>MARKET PULSE</Text>
          <View style={styles.marketList}>
            <MarketTicker name="NIFTY 50" value={22430} change={0.8} />
            <MarketTicker name="SENSEX" value={73891} change={0.6} />
            <MarketTicker name="S&P 500" value={5892} change={-0.2} />
            <MarketTicker name="NASDAQ" value={19234} change={-0.1} />
          </View>
        </GlassCard>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <NeonButton title="+ Add Expense" onPress={() => {}} variant="ghost" size="sm" />
          <NeonButton title="+ Add Income" onPress={() => {}} variant="ghost" size="sm" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-component for market tickers
const MarketTicker = ({
  name,
  value,
  change,
}: {
  name: string;
  value: number;
  change: number;
}) => (
  <View style={styles.tickerRow}>
    <Text style={styles.tickerName}>{name}</Text>
    <View style={styles.tickerRight}>
      <Text style={styles.tickerValue}>
        {value.toLocaleString('en-IN')}
      </Text>
      <Text
        style={[
          styles.tickerChange,
          { color: change >= 0 ? colors.success : colors.danger },
        ]}
      >
        {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing['5xl'],
    gap: spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  greeting: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  statusText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.success,
  },
  cardLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  netWorthValue: {
    fontSize: fontSize['4xl'],
  },
  netWorthMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  metaText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  goalProgress: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  goalTrack: {
    height: 4,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  goalText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    alignSelf: 'flex-end',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xl,
  },
  signalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  signalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  signalIcon: {
    fontSize: 18,
    color: colors.primary,
  },
  signalTitle: {
    fontFamily: fonts.headingMedium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  signalStock: {
    fontFamily: fonts.heading,
    fontSize: fontSize['2xl'],
    color: colors.textPrimary,
  },
  signalExchange: {
    fontFamily: fonts.mono,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  signalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  signalMetaItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  signalMetaLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  signalMetaValue: {
    fontFamily: fonts.monoBold,
    fontSize: fontSize.base,
  },
  sectionTitle: {
    fontFamily: fonts.headingMedium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  marketList: {
    gap: spacing.md,
  },
  tickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tickerName: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  tickerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  tickerValue: {
    fontFamily: fonts.mono,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  tickerChange: {
    fontFamily: fonts.mono,
    fontSize: fontSize.sm,
    width: 65,
    textAlign: 'right',
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
