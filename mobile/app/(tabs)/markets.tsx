import React, { useState, useCallback } from 'react';
import {
  ScrollView, StyleSheet, Text, View, TextInput,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlassCard, SignalBadge } from '@/components/ui';
import { colors, fonts, fontSize, spacing, borderRadius } from '@/theme';
import { useMarketStore } from '@/store/useMarketStore';
import { useMarketData } from '@/hooks/useMarketData';

export default function MarketsScreen() {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'signals' | 'sectors'>('watchlist');
  const [searchQuery, setSearchQuery] = useState('');

  const indices = useMarketStore((s) => s.indices);
  const watchlist = useMarketStore((s) => s.watchlist);
  const { isLoading, isStale, nseOpen, usOpen, lastRefresh, refresh } = useMarketData();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const filteredWatchlist = searchQuery
    ? watchlist.filter((w) =>
        w.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : watchlist;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View>
            <Text style={styles.title}>Markets</Text>
            <Text style={styles.subtitle}>
              {nseOpen ? '🟢 NSE Open' : '🔴 NSE Closed'}
              {'  '}
              {usOpen ? '🟢 US Open' : '🔴 US Closed'}
            </Text>
          </View>
          {isLoading && <ActivityIndicator color={colors.primary} size="small" />}
          {isStale && !isLoading && (
            <View style={styles.staleBadge}>
              <Text style={styles.staleText}>⚠️ Stale</Text>
            </View>
          )}
        </Animated.View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search stocks, MFs, indices..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={() => setSearchQuery('')}>
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Market Indices */}
        <GlassCard delay={100}>
          <Text style={styles.sectionTitle}>INDICES</Text>
          <View style={styles.indicesGrid}>
            {indices.map((idx) => (
              <View key={idx.symbol} style={styles.indexCard}>
                <Text style={styles.indexName}>{idx.name}</Text>
                <Text style={styles.indexValue}>
                  {idx.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
                <Text style={[styles.indexChange, { color: idx.changePercent >= 0 ? colors.success : colors.danger }]}>
                  {idx.changePercent >= 0 ? '▲' : '▼'} {Math.abs(idx.changePercent).toFixed(2)}%
                </Text>
              </View>
            ))}
            {indices.length === 0 && (
              <Text style={styles.emptyText}>Pull down to refresh market data</Text>
            )}
          </View>
        </GlassCard>

        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          {(['watchlist', 'signals', 'sectors'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tab); }}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'watchlist' ? `Watchlist (${watchlist.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Watchlist */}
        {activeTab === 'watchlist' && (
          <View style={styles.stockList}>
            {filteredWatchlist.length === 0 && searchQuery && (
              <Text style={styles.emptyText}>No stocks match "{searchQuery}"</Text>
            )}
            {filteredWatchlist.map((stock) => (
              <TouchableOpacity
                key={`${stock.symbol}_${stock.exchange}`}
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({ pathname: '/(modals)/stock-detail', params: { symbol: stock.symbol, exchange: stock.exchange } });
                }}
              >
                <GlassCard animate={false} style={styles.stockRow}>
                  <View style={styles.stockRowLeft}>
                    <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                    <Text style={styles.stockName} numberOfLines={1}>{stock.name}</Text>
                  </View>
                  <View style={styles.stockRowRight}>
                    <Text style={styles.stockPrice}>
                      ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Text>
                    <Text style={[styles.stockChange, { color: stock.changePercent >= 0 ? colors.success : colors.danger }]}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Signals Tab */}
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
            <Text style={styles.signalNote}>
              💡 Signals are generated by AI after market analysis. Connect Ollama for live signals.
            </Text>
          </View>
        )}

        {/* Sectors Tab */}
        {activeTab === 'sectors' && (
          <View style={styles.stockList}>
            <SectorRow name="Auto" change={2.4} />
            <SectorRow name="Banking" change={0.8} />
            <SectorRow name="IT" change={-1.2} />
            <SectorRow name="Pharma" change={1.6} />
            <SectorRow name="FMCG" change={-0.3} />
            <SectorRow name="Metal" change={3.1} />
            <SectorRow name="Energy" change={0.5} />
            <SectorRow name="Realty" change={-0.8} />
          </View>
        )}

        {/* Last refresh info */}
        {lastRefresh && (
          <Text style={styles.lastRefreshText}>
            Last updated: {new Date(lastRefresh).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Sector row sub-component
const SectorRow = ({ name, change }: { name: string; change: number }) => (
  <GlassCard animate={false} style={styles.sectorRow}>
    <Text style={styles.sectorName}>{name}</Text>
    <View style={styles.sectorRight}>
      <View style={[styles.sectorBar, { width: `${Math.min(Math.abs(change) * 15, 80)}%`, backgroundColor: change >= 0 ? colors.success : colors.danger }]} />
      <Text style={[styles.sectorChange, { color: change >= 0 ? colors.success : colors.danger }]}>
        {change >= 0 ? '+' : ''}{change.toFixed(1)}%
      </Text>
    </View>
  </GlassCard>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.base, paddingBottom: spacing['5xl'], gap: spacing.base },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  title: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  staleBadge: { backgroundColor: colors.warningGlow, borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 2, borderWidth: 1, borderColor: colors.warning },
  staleText: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.warning },
  searchContainer: { position: 'relative' },
  searchInput: { backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, paddingRight: spacing['2xl'], fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textPrimary },
  clearBtn: { position: 'absolute', right: spacing.md, top: spacing.md },
  clearBtnText: { color: colors.textMuted, fontSize: fontSize.lg },
  sectionTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.textSecondary, letterSpacing: 1, marginBottom: spacing.md },
  indicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  indexCard: { width: '48%', backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.md, padding: spacing.md, gap: spacing.xs },
  indexName: { fontFamily: fonts.bodyMedium, fontSize: fontSize.xs, color: colors.textSecondary },
  indexValue: { fontFamily: fonts.mono, fontSize: fontSize.md, color: colors.textPrimary },
  indexChange: { fontFamily: fonts.mono, fontSize: fontSize.sm },
  tabRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.xs },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: borderRadius.sm },
  tabActive: { backgroundColor: colors.surfaceHighlight },
  tabText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.textMuted },
  tabTextActive: { color: colors.primary },
  stockList: { gap: spacing.sm },
  stockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stockRowLeft: { flex: 1, gap: 2 },
  stockSymbol: { fontFamily: fonts.headingMedium, fontSize: fontSize.md, color: colors.textPrimary },
  stockName: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  stockRowRight: { alignItems: 'flex-end', gap: 2 },
  stockPrice: { fontFamily: fonts.mono, fontSize: fontSize.md, color: colors.textPrimary },
  stockChange: { fontFamily: fonts.mono, fontSize: fontSize.sm },
  signalCard: { gap: spacing.sm },
  signalCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  signalStockName: { fontFamily: fonts.heading, fontSize: fontSize.lg, color: colors.textPrimary },
  signalStockExchange: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted },
  signalCardMeta: { flexDirection: 'row', gap: spacing.base },
  signalMetaText: { fontFamily: fonts.mono, fontSize: fontSize.sm, color: colors.textSecondary },
  signalNote: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.md },
  sectorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectorName: { fontFamily: fonts.bodyMedium, fontSize: fontSize.base, color: colors.textPrimary, width: 80 },
  sectorRight: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectorBar: { height: 6, borderRadius: 3, minWidth: 4 },
  sectorChange: { fontFamily: fonts.mono, fontSize: fontSize.sm, width: 50, textAlign: 'right' },
  emptyText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl },
  lastRefreshText: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
});
