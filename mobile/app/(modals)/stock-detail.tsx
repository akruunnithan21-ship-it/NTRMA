import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '@/components/ui';
import { colors, fonts, fontSize, spacing, borderRadius } from '@/theme';
import { marketAPI } from '@/services/api';
import { calculateBuyCharges, calculateSellCharges, calculateBreakEven } from '@/constants/charges';

interface StockInfo {
  name: string;
  sector: string;
  industry: string;
  market_cap: number;
  pe_ratio: number;
  pb_ratio: number;
  eps: number;
  dividend_yield: number;
  roe: number;
  debt_to_equity: number;
  profit_margin: number;
  '52w_high': number;
  '52w_low': number;
  avg_volume: number;
  beta: number;
  description: string;
  error?: string;
}

interface PriceData {
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  prev_close: number;
  change: number;
  change_percent: number;
  volume: number;
  market_open: boolean;
  error?: string;
}

type Period = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y';

export default function StockDetailModal() {
  const { symbol = 'RELIANCE', exchange = 'NSE' } = useLocalSearchParams<{ symbol: string; exchange: string }>();
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('1mo');
  const [showCharges, setShowCharges] = useState(false);
  const [tradeQty, setTradeQty] = useState(1);

  useEffect(() => {
    fetchData();
  }, [symbol, exchange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [priceRes, infoRes] = await Promise.allSettled([
        marketAPI.getStockWithExchange(symbol, exchange),
        marketAPI.getStockInfo(symbol, exchange),
      ]);

      if (priceRes.status === 'fulfilled') setPriceData(priceRes.value.data);
      if (infoRes.status === 'fulfilled') setStockInfo(infoRes.value.data);
    } catch (e) {
      // Silently handle - UI shows empty state
    }
    setLoading(false);
  };

  const price = priceData?.price || 0;
  const change = priceData?.change || 0;
  const changePct = priceData?.change_percent || 0;
  const isPositive = change >= 0;

  // Charges calculation
  const buyCharges = price > 0 ? calculateBuyCharges({ price, quantity: tradeQty, exchange: exchange as 'NSE' | 'BSE' }) : null;
  const sellCharges = price > 0 ? calculateSellCharges({ price: price * 1.1, quantity: tradeQty, exchange: exchange as 'NSE' | 'BSE' }) : null;
  const breakEven = price > 0 ? calculateBreakEven({ buyPrice: price, quantity: tradeQty, exchange: exchange as 'NSE' | 'BSE' }) : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading {symbol}...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSymbol}>{symbol}</Text>
          <Text style={styles.headerExchange}>{exchange}</Text>
        </View>
        <View style={styles.marketStatus}>
          <View style={[styles.statusDot, { backgroundColor: priceData?.market_open ? colors.success : colors.danger }]} />
          <Text style={styles.statusLabel}>{priceData?.market_open ? 'Live' : 'Closed'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Price Hero */}
        <Animated.View entering={FadeInDown.duration(300)}>
          <GlassCard variant="elevated" glowColor={isPositive ? colors.success : colors.danger}>
            <Text style={styles.stockName}>{stockInfo?.name || symbol}</Text>
            <Text style={[styles.priceHero, { color: isPositive ? colors.success : colors.danger }]}>
              ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
            <View style={styles.changeRow}>
              <Text style={[styles.changeText, { color: isPositive ? colors.success : colors.danger }]}>
                {isPositive ? '▲' : '▼'} ₹{Math.abs(change).toFixed(2)} ({isPositive ? '+' : ''}{changePct.toFixed(2)}%)
              </Text>
              <Text style={styles.prevClose}>Prev: ₹{priceData?.prev_close?.toFixed(2)}</Text>
            </View>

            {/* OHLC */}
            <View style={styles.ohlcRow}>
              <OHLCItem label="Open" value={priceData?.open || 0} />
              <OHLCItem label="High" value={priceData?.high || 0} highlight="green" />
              <OHLCItem label="Low" value={priceData?.low || 0} highlight="red" />
              <OHLCItem label="Vol" value={priceData?.volume || 0} isVolume />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Period Selector */}
        <View style={styles.periodRow}>
          {(['1d', '5d', '1mo', '3mo', '6mo', '1y'] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, selectedPeriod === p && styles.periodBtnActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedPeriod(p); }}
            >
              <Text style={[styles.periodText, selectedPeriod === p && styles.periodTextActive]}>
                {p.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Stats */}
        {stockInfo && !stockInfo.error && (
          <GlassCard delay={100}>
            <Text style={styles.sectionTitle}>KEY STATS</Text>
            <View style={styles.statsGrid}>
              <StatItem label="P/E Ratio" value={stockInfo.pe_ratio?.toFixed(1) || 'N/A'} />
              <StatItem label="P/B Ratio" value={stockInfo.pb_ratio?.toFixed(2) || 'N/A'} />
              <StatItem label="EPS" value={`₹${stockInfo.eps?.toFixed(2) || '0'}`} />
              <StatItem label="Market Cap" value={formatLargeNumber(stockInfo.market_cap)} />
              <StatItem label="Div Yield" value={`${((stockInfo.dividend_yield || 0) * 100).toFixed(1)}%`} />
              <StatItem label="ROE" value={`${((stockInfo.roe || 0) * 100).toFixed(1)}%`} />
              <StatItem label="D/E Ratio" value={stockInfo.debt_to_equity?.toFixed(2) || 'N/A'} />
              <StatItem label="Beta" value={stockInfo.beta?.toFixed(2) || 'N/A'} />
              <StatItem label="52W High" value={`₹${stockInfo['52w_high']?.toLocaleString('en-IN') || '—'}`} highlight="green" />
              <StatItem label="52W Low" value={`₹${stockInfo['52w_low']?.toLocaleString('en-IN') || '—'}`} highlight="red" />
              <StatItem label="Avg Volume" value={formatLargeNumber(stockInfo.avg_volume)} />
              <StatItem label="Profit Margin" value={`${((stockInfo.profit_margin || 0) * 100).toFixed(1)}%`} />
            </View>
            {stockInfo.sector && (
              <View style={styles.sectorInfo}>
                <Text style={styles.sectorLabel}>Sector: {stockInfo.sector}</Text>
                <Text style={styles.sectorLabel}>Industry: {stockInfo.industry}</Text>
              </View>
            )}
          </GlassCard>
        )}

        {/* Transaction Charges Calculator */}
        <GlassCard delay={200}>
          <TouchableOpacity
            style={styles.chargesToggle}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowCharges(!showCharges); }}
          >
            <Text style={styles.sectionTitle}>💰 CHARGES CALCULATOR</Text>
            <Text style={styles.toggleArrow}>{showCharges ? '▼' : '▶'}</Text>
          </TouchableOpacity>

          {showCharges && price > 0 && (
            <Animated.View entering={FadeInDown.duration(200)}>
              {/* Quantity selector */}
              <View style={styles.qtyRow}>
                <Text style={styles.qtyLabel}>Shares:</Text>
                {[1, 5, 10, 25].map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={[styles.qtyBtn, tradeQty === q && styles.qtyBtnActive]}
                    onPress={() => setTradeQty(q)}
                  >
                    <Text style={[styles.qtyText, tradeQty === q && styles.qtyTextActive]}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Buy charges */}
              {buyCharges && (
                <View style={styles.chargesBox}>
                  <Text style={styles.chargesTitle}>BUY {tradeQty}x {symbol}</Text>
                  <ChargesRow label="Market Price" value={`₹${(price * tradeQty).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
                  <ChargesRow label="STT" value={`₹${buyCharges.stt}`} dim />
                  <ChargesRow label="Exchange" value={`₹${buyCharges.exchangeCharge}`} dim />
                  <ChargesRow label="GST" value={`₹${buyCharges.gst}`} dim />
                  <ChargesRow label="Stamp Duty" value={`₹${buyCharges.stampDuty}`} dim />
                  <View style={styles.chargesDivider} />
                  <ChargesRow label="You Pay" value={`₹${buyCharges.youPay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} bold color={colors.primary} />
                  <Text style={styles.chargesPercent}>Total charges: {buyCharges.chargesPercent}% of trade</Text>
                </View>
              )}

              {/* Break-even */}
              <View style={styles.breakEvenRow}>
                <Text style={styles.breakEvenLabel}>Break-even price (incl. buy+sell charges):</Text>
                <Text style={styles.breakEvenValue}>₹{breakEven.toFixed(2)}</Text>
              </View>
            </Animated.View>
          )}
        </GlassCard>

        {/* About (truncated description) */}
        {stockInfo?.description && (
          <GlassCard delay={300}>
            <Text style={styles.sectionTitle}>ABOUT</Text>
            <Text style={styles.aboutText} numberOfLines={5}>
              {stockInfo.description}
            </Text>
          </GlassCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ===== Sub-components =====
const OHLCItem = ({ label, value, highlight, isVolume }: { label: string; value: number; highlight?: 'green' | 'red'; isVolume?: boolean }) => (
  <View style={styles.ohlcItem}>
    <Text style={styles.ohlcLabel}>{label}</Text>
    <Text style={[styles.ohlcValue, highlight === 'green' && { color: colors.success }, highlight === 'red' && { color: colors.danger }]}>
      {isVolume ? formatLargeNumber(value) : `₹${value.toFixed(2)}`}
    </Text>
  </View>
);

const StatItem = ({ label, value, highlight }: { label: string; value: string; highlight?: 'green' | 'red' }) => (
  <View style={styles.statItem}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, highlight === 'green' && { color: colors.success }, highlight === 'red' && { color: colors.danger }]}>{value}</Text>
  </View>
);

const ChargesRow = ({ label, value, dim, bold, color }: { label: string; value: string; dim?: boolean; bold?: boolean; color?: string }) => (
  <View style={styles.chargesRow}>
    <Text style={[styles.chargesLabel, dim && { color: colors.textMuted }]}>{label}</Text>
    <Text style={[styles.chargesValue, bold && { fontFamily: fonts.monoBold }, color ? { color } : null]}>{value}</Text>
  </View>
);

// ===== Helpers =====
function formatLargeNumber(num: number): string {
  if (!num || num === 0) return '—';
  if (num >= 1e12) return `₹${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `₹${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e7) return `₹${(num / 1e7).toFixed(1)}Cr`;
  if (num >= 1e5) return `₹${(num / 1e5).toFixed(1)}L`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toLocaleString('en-IN');
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  loadingText: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textMuted },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.base, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { padding: spacing.xs },
  backText: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.primary },
  headerCenter: { alignItems: 'center' },
  headerSymbol: { fontFamily: fonts.heading, fontSize: fontSize.lg, color: colors.textPrimary },
  headerExchange: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  marketStatus: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary },
  scrollContent: { padding: spacing.base, paddingBottom: spacing['5xl'], gap: spacing.base },
  stockName: { fontFamily: fonts.body, fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.xs },
  priceHero: { fontFamily: fonts.monoBold, fontSize: fontSize['4xl'] },
  changeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  changeText: { fontFamily: fonts.mono, fontSize: fontSize.base },
  prevClose: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  ohlcRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.base, paddingTop: spacing.base, borderTopWidth: 1, borderTopColor: colors.border },
  ohlcItem: { alignItems: 'center', gap: 2 },
  ohlcLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  ohlcValue: { fontFamily: fonts.mono, fontSize: fontSize.sm, color: colors.textPrimary },
  periodRow: { flexDirection: 'row', gap: spacing.xs },
  periodBtn: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, backgroundColor: colors.surface, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.border },
  periodBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  periodText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.xs, color: colors.textMuted },
  periodTextActive: { color: colors.primary },
  sectionTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.textSecondary, letterSpacing: 1, marginBottom: spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statItem: { width: '48%', backgroundColor: colors.surface, borderRadius: borderRadius.sm, padding: spacing.sm, gap: 2 },
  statLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  statValue: { fontFamily: fonts.mono, fontSize: fontSize.md, color: colors.textPrimary },
  sectorInfo: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.xs },
  sectorLabel: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary },
  chargesToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleArrow: { color: colors.textMuted, fontSize: fontSize.sm },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  qtyLabel: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary },
  qtyBtn: { width: 40, height: 32, borderRadius: borderRadius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  qtyBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  qtyText: { fontFamily: fonts.mono, fontSize: fontSize.sm, color: colors.textMuted },
  qtyTextActive: { color: colors.primary },
  chargesBox: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, gap: spacing.sm },
  chargesTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.primary, marginBottom: spacing.xs },
  chargesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chargesLabel: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary },
  chargesValue: { fontFamily: fonts.mono, fontSize: fontSize.sm, color: colors.textPrimary },
  chargesDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  chargesPercent: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'right', marginTop: spacing.xs },
  breakEvenRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.md, padding: spacing.md },
  breakEvenLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textSecondary, flex: 1 },
  breakEvenValue: { fontFamily: fonts.monoBold, fontSize: fontSize.base, color: colors.warning },
  aboutText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 },
});
