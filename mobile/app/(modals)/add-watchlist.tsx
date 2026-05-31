import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { NeonButton, ScreenHeader, AuroraBackground, Icon } from '@/components/ui';
import { colors, fonts, fontSize, spacing, borderRadius } from '@/theme';
import { useMarketStore, StockData } from '@/store/useMarketStore';

const EXCHANGES: StockData['exchange'][] = ['NSE', 'BSE', 'NASDAQ', 'NYSE'];

export default function AddWatchlistModal() {
  const addToWatchlist = useMarketStore((s) => s.addToWatchlist);
  const existing = useMarketStore((s) => s.watchlist);
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [exchange, setExchange] = useState<StockData['exchange']>('NSE');

  const sym = symbol.trim().toUpperCase();
  const dup = existing.some((w) => w.symbol === sym && w.exchange === exchange);
  const canSave = sym.length >= 1 && !dup;

  const save = () => {
    if (!canSave) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addToWatchlist({ symbol: sym, name: name.trim() || sym, exchange, price: 0, change: 0, changePercent: 0 });
    router.back();
  };

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Add to Watchlist" onBack={() => router.back()} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Ticker symbol *</Text>
            <TextInput value={symbol} onChangeText={setSymbol} placeholder="e.g. RELIANCE, AAPL" placeholderTextColor={colors.textMuted} style={[styles.input, styles.mono]} autoCapitalize="characters" autoFocus />
            {dup && <Text style={styles.warn}>Already in your watchlist.</Text>}

            <Text style={styles.label}>Company name (optional)</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Reliance Industries" placeholderTextColor={colors.textMuted} style={styles.input} />

            <Text style={styles.label}>Exchange</Text>
            <View style={styles.segment}>
              {EXCHANGES.map((ex) => (
                <TouchableOpacity key={ex} style={[styles.segBtn, exchange === ex && styles.segBtnActive]} onPress={() => setExchange(ex)}>
                  <Text style={[styles.segText, exchange === ex && { color: colors.primary }]}>{ex}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.note}>
              <Icon name="info" size={14} color={colors.textMuted} />
              <Text style={styles.noteText}>Live price loads from your backend after you add it (pull to refresh on Markets).</Text>
            </View>

            <NeonButton title="Add Symbol" onPress={save} variant="primary" size="lg" disabled={!canSave} iconName="plus" style={{ marginTop: spacing.lg }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: spacing.base, gap: spacing.sm },
  label: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm },
  input: { backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, fontFamily: fonts.body, fontSize: fontSize.base, color: colors.textPrimary },
  mono: { fontFamily: fonts.mono, letterSpacing: 1 },
  warn: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.warning },
  segment: { flexDirection: 'row', gap: spacing.sm },
  segBtn: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: borderRadius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  segBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  segText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.textMuted },
  note: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', marginTop: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md },
  noteText: { flex: 1, fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 18 },
});
