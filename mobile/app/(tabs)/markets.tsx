import React, { useCallback, useState } from 'react';
import {
  Alert,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import {
  Screen,
  ScreenHeader,
  GlassCard,
  SignalBadge,
  ConfidenceMeter,
  StatusPill,
  Skeleton,
  Icon,
  IconButton,
} from '@/components/ui';
import { colors, fonts, fontSize, spacing, borderRadius } from '@/theme';
import { useMarketStore } from '@/store/useMarketStore';
import { useMarketData } from '@/hooks/useMarketData';
import { useActiveSignals } from '@/hooks/queries';
import type { NormalizedSignal } from '@/hooks/queries';
import { marketAPI } from '@/services/api';
import { useConnectionStore } from '@/store/useConnectionStore';

type Tab = 'watchlist' | 'signals' | 'sectors';

export default function MarketsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('watchlist');
  const [query, setQuery] = useState('');

  const indices = useMarketStore((s) => s.indices);
  const watchlist = useMarketStore((s) => s.watchlist);
  const removeFromWatchlist = useMarketStore((s) => s.removeFromWatchlist);
  const { isLoading, nseOpen, usOpen, lastRefresh, refresh } = useMarketData();
  const connStatus = useConnectionStore((s) => s.status);

  const signalsQuery = useActiveSignals();
  const liveSignals: NormalizedSignal[] = signalsQuery.data ?? [];
  const sectorsQuery = useQuery({
    queryKey: ['market', 'sectors'],
    queryFn: async () => (await marketAPI.getSectors()).data?.sectors ?? [],
    enabled: activeTab === 'sectors',
    staleTime: 5 * 60_000,
    retry: 0,
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Promise.allSettled([refresh(), signalsQuery.refetch(), sectorsQuery.refetch?.()]);
    setRefreshing(false);
  }, [refresh, signalsQuery, sectorsQuery]);

  const filtered = query
    ? watchlist.filter(
        (w) => w.symbol.toLowerCase().includes(query.toLowerCase()) || w.name.toLowerCase().includes(query.toLowerCase())
      )
    : watchlist;

  const openStock = (symbol: string, exchange: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/(modals)/stock-detail', params: { symbol, exchange } });
  };

  const submitSearch = () => {
    const q = query.trim().toUpperCase();
    if (q.length >= 1) openStock(q, 'NSE');
  };

  const confirmRemove = (symbol: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Remove from watchlist', `Remove ${symbol}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFromWatchlist(symbol) },
    ]);
  };

  return (
    <Screen
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      header={
        <ScreenHeader
          title="Markets"
          subtitle="NSE · BSE · US"
          right={
            <View style={{ flexDirection: 'row', gap: spacing.xs }}>
              <StatusPill label={nseOpen ? 'NSE' : 'NSE'} color={nseOpen ? colors.success : colors.textMuted} pulse={nseOpen} />
              <StatusPill label="US" color={usOpen ? colors.success : colors.textMuted} pulse={usOpen} />
            </View>
          }
        />
      }
    >
      {/* Search */}
      <View style={styles.search}>
        <Icon name="search" size={18} color={colors.textMuted} />
        <TextInput
          placeholder="Search any symbol (e.g. RELIANCE)…"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCapitalize="characters"
          onSubmitEditing={submitSearch}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
            <Icon name="close" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Indices */}
      <GlassCard delay={80}>
        <Text style={styles.sectionTitle}>INDICES</Text>
        {indices.length === 0 ? (
          isLoading ? (
            <View style={styles.indicesGrid}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={styles.indexCard}><Skeleton width="70%" height={12} /><Skeleton width="90%" height={16} /></View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              {connStatus === 'online' ? 'Pull to refresh indices.' : 'Backend offline — set your PC address in Settings.'}
            </Text>
          )
        ) : (
          <View style={styles.indicesGrid}>
            {indices.map((idx) => (
              <View key={idx.symbol} style={styles.indexCard}>
                <Text style={styles.indexName}>{idx.name}</Text>
                <Text style={styles.indexValue}>{idx.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                <View style={styles.changeRow}>
                  <Icon name={idx.changePercent >= 0 ? 'up' : 'down'} size={11} color={idx.changePercent >= 0 ? colors.success : colors.danger} strokeWidth={3} />
                  <Text style={[styles.indexChange, { color: idx.changePercent >= 0 ? colors.success : colors.danger }]}>
                    {Math.abs(idx.changePercent).toFixed(2)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </GlassCard>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['watchlist', 'signals', 'sectors'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTab(tab); }}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'watchlist' ? `Watchlist (${watchlist.length})` : tab[0].toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Watchlist */}
      {activeTab === 'watchlist' && (
        <View style={styles.list}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(modals)/add-watchlist')}>
            <GlassCard animate={false} blur={false} style={styles.addRow}>
              <Icon name="plus" size={18} color={colors.primary} />
              <Text style={styles.addText}>Add symbol to watchlist</Text>
            </GlassCard>
          </TouchableOpacity>
          {filtered.length === 0 && query !== '' && (
            <TouchableOpacity onPress={submitSearch}>
              <GlassCard animate={false} blur={false}>
                <Text style={styles.emptyText}>Open "{query.toUpperCase()}" →</Text>
              </GlassCard>
            </TouchableOpacity>
          )}
          {filtered.map((stock) => (
            <TouchableOpacity key={`${stock.symbol}_${stock.exchange}`} activeOpacity={0.8} onPress={() => openStock(stock.symbol, stock.exchange)} onLongPress={() => confirmRemove(stock.symbol)}>
              <GlassCard animate={false} blur={false} style={styles.stockRow}>
                <View style={styles.stockLeft}>
                  <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                  <Text style={styles.stockName} numberOfLines={1}>{stock.name}</Text>
                </View>
                <View style={styles.stockRight}>
                  <Text style={styles.stockPrice}>
                    {stock.price > 0 ? `₹${stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                  </Text>
                  {stock.price > 0 && (
                    <Text style={[styles.stockChange, { color: stock.changePercent >= 0 ? colors.success : colors.danger }]}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </Text>
                  )}
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Signals (live from AI engine) */}
      {activeTab === 'signals' && (
        <View style={styles.list}>
          {signalsQuery.isLoading ? (
            [0, 1].map((i) => (
              <GlassCard key={i} animate={false}><Skeleton width="50%" height={18} /><View style={{ height: 8 }} /><Skeleton width="100%" height={8} /></GlassCard>
            ))
          ) : liveSignals.length > 0 ? (
            liveSignals.map((sig) => (
              <TouchableOpacity
                key={sig.symbol}
                activeOpacity={0.85}
                onPress={() => router.push({ pathname: '/(modals)/signal-detail', params: { symbol: sig.symbol, exchange: sig.exchange ?? 'NSE' } })}
              >
                <GlassCard animate={false} glowColor={sig.direction === 'BUY' ? colors.success : sig.direction === 'SELL' ? colors.danger : colors.warning}>
                  <View style={styles.signalTop}>
                    <View>
                      <Text style={styles.signalName}>{sig.symbol}</Text>
                      <Text style={styles.signalSub}>{sig.exchange ?? 'NSE'} · entry ₹{sig.entryPrice?.toLocaleString('en-IN')}</Text>
                    </View>
                    <SignalBadge signal={sig.direction} />
                  </View>
                  <ConfidenceMeter value={sig.confidence} />
                  <View style={styles.signalMetaRow}>
                    <Text style={styles.signalMeta}>🎯 ₹{sig.targetPrice?.toLocaleString('en-IN')}</Text>
                    <Text style={styles.signalMeta}>🛑 ₹{sig.stopLoss?.toLocaleString('en-IN')}</Text>
                    <Text style={styles.signalMeta}>R:R {sig.riskReward}</Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))
          ) : (
            <GlassCard animate={false}>
              <View style={styles.signalsEmpty}>
                <Icon name={connStatus === 'online' ? 'bot' : 'wifiOff'} size={26} color={colors.textMuted} />
                <Text style={styles.emptyText}>
                  {connStatus === 'online'
                    ? 'No active signals yet. Pull to refresh to scan the market (first scan can take ~30s).'
                    : 'Backend offline. Configure your PC address in Settings to get AI signals.'}
                </Text>
              </View>
            </GlassCard>
          )}
        </View>
      )}

      {/* Sectors (live) */}
      {activeTab === 'sectors' && (
        <View style={styles.list}>
          {sectorsQuery.isLoading ? (
            [0, 1, 2, 3].map((i) => <GlassCard key={i} animate={false}><Skeleton width="100%" height={16} /></GlassCard>)
          ) : sectorsQuery.data && sectorsQuery.data.length > 0 ? (
            sectorsQuery.data.map((sec: any) => {
              const change = sec.change_percent ?? sec.change ?? 0;
              return (
                <GlassCard key={sec.name} animate={false} blur={false} style={styles.sectorRow}>
                  <Text style={styles.sectorName}>{sec.name}</Text>
                  <View style={styles.sectorRight}>
                    <View style={[styles.sectorBar, { width: `${Math.min(Math.abs(change) * 15, 80)}%`, backgroundColor: change >= 0 ? colors.success : colors.danger }]} />
                    <Text style={[styles.sectorChange, { color: change >= 0 ? colors.success : colors.danger }]}>
                      {change >= 0 ? '+' : ''}{Number(change).toFixed(1)}%
                    </Text>
                  </View>
                </GlassCard>
              );
            })
          ) : (
            <GlassCard animate={false}>
              <Text style={styles.emptyText}>
                {connStatus === 'online' ? 'Sector data unavailable right now.' : 'Backend offline — see Settings.'}
              </Text>
            </GlassCard>
          )}
        </View>
      )}

      {lastRefresh && (
        <Text style={styles.lastRefresh}>
          Updated {new Date(lastRefresh).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  searchInput: { flex: 1, paddingVertical: spacing.md, fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textPrimary },
  sectionTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.textSecondary, letterSpacing: 1, marginBottom: spacing.md },
  indicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  indexCard: { width: '48%', backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.md, padding: spacing.md, gap: spacing.xs },
  indexName: { fontFamily: fonts.bodyMedium, fontSize: fontSize.xs, color: colors.textSecondary },
  indexValue: { fontFamily: fonts.mono, fontSize: fontSize.md, color: colors.textPrimary },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  indexChange: { fontFamily: fonts.mono, fontSize: fontSize.sm },
  tabRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.xs },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: borderRadius.sm },
  tabActive: { backgroundColor: colors.surfaceHighlight },
  tabText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.textMuted },
  tabTextActive: { color: colors.primary },
  list: { gap: spacing.sm },
  addRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderStyle: 'dashed' },
  addText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.primary },
  stockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stockLeft: { flex: 1, gap: 2 },
  stockSymbol: { fontFamily: fonts.headingMedium, fontSize: fontSize.md, color: colors.textPrimary },
  stockName: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  stockRight: { alignItems: 'flex-end', gap: 2 },
  stockPrice: { fontFamily: fonts.mono, fontSize: fontSize.md, color: colors.textPrimary },
  stockChange: { fontFamily: fonts.mono, fontSize: fontSize.sm },
  signalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  signalName: { fontFamily: fonts.heading, fontSize: fontSize.lg, color: colors.textPrimary },
  signalSub: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  signalMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  signalMeta: { fontFamily: fonts.mono, fontSize: fontSize.xs, color: colors.textSecondary },
  signalsEmpty: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  sectorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectorName: { fontFamily: fonts.bodyMedium, fontSize: fontSize.base, color: colors.textPrimary, width: 90 },
  sectorRight: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectorBar: { height: 6, borderRadius: 3, minWidth: 4 },
  sectorChange: { fontFamily: fonts.mono, fontSize: fontSize.sm, width: 50, textAlign: 'right' },
  emptyText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.sm, lineHeight: 20 },
  lastRefresh: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center' },
});
