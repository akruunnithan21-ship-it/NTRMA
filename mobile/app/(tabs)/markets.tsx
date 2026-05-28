import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard, SignalBadge, PriceChange } from '@/components/ui';
import { colors, fonts, fontSize, spacing, borderRadius } from '@/theme';

export default function MarketsScreen() {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'signals' | 'sectors'>('watchlist');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Text style={styles.title}>Markets</Text>
          <Text style={styles.subtitle}>Live data · NSE · BSE · US</Text>
        </Animated.View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search stocks, MFs, indices..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
        </View>

        {/* Market Indices */}
        <GlassCard delay={100}>
          <Text style={styles.sectionTitle}>INDICES</Text>
          <View style={styles.indicesGrid}>
            <IndexCard name="NIFTY 50" value={22430.85} change={178.5} changePercent={0.8} />
            <IndexCard name="SENSEX" value={73891.20} change={442.3} changePercent={0.6} />
            <IndexCard name="BANK NIFTY" value={48234.60} change={-156.2} changePercent={-0.32} />
            <IndexCard name="S&P 500" value={5892.40} change={-11.8} changePercent={-0.2} />
          </View>
        </GlassCard>

        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          {(['watchlist', 'signals', 'sectors'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Watchlist */}
        {activeTab === 'watchlist' && (
          <View style={styles.stockList}>
            <StockRow symbol="TATAMOTORS" name="Tata Motors" price={952.4} change={12.5} changePercent={1.33} signal="BUY" />
            <StockRow symbol="RELIANCE" name="Reliance Industries" price={2834.75} change={-28.4} changePercent={-0.99} signal="HOLD" />
            <StockRow symbol="HDFCBANK" name="HDFC Bank" price={1678.90} change={15.2} changePercent={0.91} signal="BUY" />
            <StockRow symbol="INFY" name="Infosys" price={1456.30} change={-8.6} changePercent={-0.59} signal="SELL" />
            <StockRow symbol="TCS" name="TCS" price={3890.15} change={45.8} changePercent={1.19} signal="BUY" />
            <StockRow symbol="AAPL" name="Apple Inc (US)" price={189.45} change={2.3} changePercent={1.23} signal="HOLD" />
          </View>
        )}

        {/* AI Signals Tab */}
        {activeTab === 'signals' && (
          <View style={styles.stockList}>
            <GlassCard variant="highlighted" glowColor={colors.success}>
              <View style={styles.signalCard}>
                <View style={styles.signalCardTop}>
                  <View>
                    <Text style={styles.signalStockName}>TATAMOTORS</Text>
                    <Text style={styles.signalStockExchange}>NSE · Auto</Text>
                  </View>
                  <SignalBadge signal="BUY" />
                </View>
                <View style={styles.signalCardMeta}>
                  <Text style={styles.signalMetaText}>Confidence: 78%</Text>
                  <Text style={styles.signalMetaText}>Target: ₹1,105</Text>
                  <Text style={styles.signalMetaText}>SL: ₹895</Text>
                </View>
              </View>
            </GlassCard>
            <GlassCard variant="highlighted" glowColor={colors.danger}>
              <View style={styles.signalCard}>
                <View style={styles.signalCardTop}>
                  <View>
                    <Text style={styles.signalStockName}>INFY</Text>
                    <Text style={styles.signalStockExchange}>NSE · IT</Text>
                  </View>
                  <SignalBadge signal="SELL" />
                </View>
                <View style={styles.signalCardMeta}>
                  <Text style={styles.signalMetaText}>Confidence: 65%</Text>
                  <Text style={styles.signalMetaText}>Target: ₹1,380</Text>
                  <Text style={styles.signalMetaText}>SL: ₹1,490</Text>
                </View>
              </View>
            </GlassCard>
          </View>
        )}

        {/* Sectors Tab */}
        {activeTab === 'sectors' && (
          <View style={styles.stockList}>
            <SectorRow name="Auto" change={2.4} flow="inflow" />
            <SectorRow name="Banking" change={0.8} flow="inflow" />
            <SectorRow name="IT" change={-1.2} flow="outflow" />
            <SectorRow name="Pharma" change={1.6} flow="inflow" />
            <SectorRow name="FMCG" change={-0.3} flow="neutral" />
            <SectorRow name="Metal" change={3.1} flow="inflow" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Index card sub-component
const IndexCard = ({ name, value, change, changePercent }: { name: string; value: number; change: number; changePercent: number }) => (
  <View style={styles.indexCard}>
    <Text style={styles.indexName}>{name}</Text>
    <Text style={styles.indexValue}>{value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
    <Text style={[styles.indexChange, { color: change >= 0 ? colors.success : colors.danger }]}>
      {change >= 0 ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}%
    </Text>
  </View>
);

// Stock row sub-component
const StockRow = ({ symbol, name, price, change, changePercent, signal }: { symbol: string; name: string; price: number; change: number; changePercent: number; signal: 'BUY' | 'SELL' | 'HOLD' }) => (
  <GlassCard animate={false} style={styles.stockRow}>
    <View style={styles.stockRowLeft}>
      <Text style={styles.stockSymbol}>{symbol}</Text>
      <Text style={styles.stockName}>{name}</Text>
    </View>
    <View style={styles.stockRowRight}>
      <Text style={styles.stockPrice}>₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
      <View style={styles.stockChangeBadge}>
        <Text style={[styles.stockChangeText, { color: change >= 0 ? colors.success : colors.danger }]}>
          {change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
        </Text>
        <SignalBadge signal={signal} size="sm" />
      </View>
    </View>
  </GlassCard>
);

// Sector row
const SectorRow = ({ name, change, flow }: { name: string; change: number; flow: 'inflow' | 'outflow' | 'neutral' }) => (
  <GlassCard animate={false} style={styles.sectorRow}>
    <Text style={styles.sectorName}>{name}</Text>
    <View style={styles.sectorRight}>
      <Text style={[styles.sectorChange, { color: change >= 0 ? colors.success : colors.danger }]}>
        {change >= 0 ? '+' : ''}{change.toFixed(1)}%
      </Text>
      <Text style={[styles.sectorFlow, { color: flow === 'inflow' ? colors.success : flow === 'outflow' ? colors.danger : colors.textMuted }]}>
        {flow === 'inflow' ? '↑ FII Buy' : flow === 'outflow' ? '↓ FII Sell' : '— Neutral'}
      </Text>
    </View>
  </GlassCard>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.base, paddingBottom: spacing['5xl'], gap: spacing.base },
  header: { marginBottom: spacing.sm },
  title: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary },
  searchContainer: { marginBottom: spacing.sm },
  searchInput: { backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textPrimary },
  sectionTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.textSecondary, letterSpacing: 1, marginBottom: spacing.md },
  indicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  indexCard: { width: '47%', backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.md, padding: spacing.md, gap: spacing.xs },
  indexName: { fontFamily: fonts.bodyMedium, fontSize: fontSize.xs, color: colors.textSecondary },
  indexValue: { fontFamily: fonts.mono, fontSize: fontSize.md, color: colors.textPrimary },
  indexChange: { fontFamily: fonts.mono, fontSize: fontSize.sm },
  tabRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.xs },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: borderRadius.sm },
  tabActive: { backgroundColor: colors.surfaceHighlight },
  tabText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.md, color: colors.textMuted },
  tabTextActive: { color: colors.primary },
  stockList: { gap: spacing.sm },
  stockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stockRowLeft: { flex: 1, gap: 2 },
  stockSymbol: { fontFamily: fonts.headingMedium, fontSize: fontSize.md, color: colors.textPrimary },
  stockName: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  stockRowRight: { alignItems: 'flex-end', gap: spacing.xs },
  stockPrice: { fontFamily: fonts.mono, fontSize: fontSize.md, color: colors.textPrimary },
  stockChangeBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stockChangeText: { fontFamily: fonts.mono, fontSize: fontSize.sm },
  signalCard: { gap: spacing.sm },
  signalCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  signalStockName: { fontFamily: fonts.heading, fontSize: fontSize.lg, color: colors.textPrimary },
  signalStockExchange: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted },
  signalCardMeta: { flexDirection: 'row', gap: spacing.base },
  signalMetaText: { fontFamily: fonts.mono, fontSize: fontSize.sm, color: colors.textSecondary },
  sectorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectorName: { fontFamily: fonts.bodyMedium, fontSize: fontSize.base, color: colors.textPrimary },
  sectorRight: { alignItems: 'flex-end', gap: 2 },
  sectorChange: { fontFamily: fonts.mono, fontSize: fontSize.md },
  sectorFlow: { fontFamily: fonts.body, fontSize: fontSize.xs },
});
