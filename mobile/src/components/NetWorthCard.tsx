import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GlassCard, AnimatedNumber } from '@/components/ui';
import { colors, fonts, fontSize, spacing, borderRadius } from '@/theme';
import {
  useNetWorthStore,
  ASSET_CATEGORIES,
  DEBT_CATEGORIES,
  ViewMode,
} from '@/store/useNetWorthStore';

export const NetWorthCard: React.FC = () => {
  const viewMode = useNetWorthStore((s) => s.viewMode);
  const setViewMode = useNetWorthStore((s) => s.setViewMode);
  const totalAssets = useNetWorthStore((s) => s.getTotalAssets());
  const totalDebts = useNetWorthStore((s) => s.getTotalDebts());
  const netWorth = useNetWorthStore((s) => s.getNetWorth());
  const assets = useNetWorthStore((s) => s.assets);
  const debts = useNetWorthStore((s) => s.debts);
  const assetsByCategory = useNetWorthStore((s) => s.getAssetsByCategory());
  const debtsByCategory = useNetWorthStore((s) => s.getDebtsByCategory());
  const monthlyObligation = useNetWorthStore((s) => s.getMonthlyDebtObligation());
  const deleteAsset = useNetWorthStore((s) => s.deleteAsset);
  const deleteDebt = useNetWorthStore((s) => s.deleteDebt);

  const confirmDeleteAsset = (id: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Delete asset', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAsset(id) },
    ]);
  };

  const confirmDeleteDebt = (id: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Delete debt', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteDebt(id) },
    ]);
  };

  const handleToggle = (mode: ViewMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewMode(mode);
  };

  const showAssets = viewMode === 'both' || viewMode === 'assets_only';
  const showDebts = viewMode === 'both' || viewMode === 'debts_only';

  return (
    <GlassCard variant="elevated" glowColor={netWorth >= 0 ? colors.success : colors.danger} delay={175}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>NET WORTH</Text>
        <AnimatedNumber
          value={netWorth}
          prefix={netWorth >= 0 ? '₹' : '-₹'}
          color={netWorth >= 0 ? colors.success : colors.danger}
          style={styles.netWorthValue}
        />
      </View>

      {/* Toggle Buttons */}
      <View style={styles.toggleRow}>
        <ToggleBtn label="Both" active={viewMode === 'both'} onPress={() => handleToggle('both')} />
        <ToggleBtn label="Assets" active={viewMode === 'assets_only'} onPress={() => handleToggle('assets_only')} color={colors.success} />
        <ToggleBtn label="Debts" active={viewMode === 'debts_only'} onPress={() => handleToggle('debts_only')} color={colors.danger} />
      </View>

      {/* Summary Row */}
      <View style={styles.summaryRow}>
        {showAssets && (
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Assets</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              ₹{totalAssets.toLocaleString('en-IN')}
            </Text>
          </View>
        )}
        {showAssets && showDebts && <View style={styles.summaryDivider} />}
        {showDebts && (
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Debts</Text>
            <Text style={[styles.summaryValue, { color: colors.danger }]}>
              ₹{totalDebts.toLocaleString('en-IN')}
            </Text>
          </View>
        )}
      </View>

      {/* Assets Breakdown */}
      {showAssets && assets.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subTitle}>📈 Assets ({assets.length})</Text>
          {assets.map((asset) => {
            const catConfig = ASSET_CATEGORIES.find((c) => c.id === asset.category);
            const gain = asset.purchaseValue ? asset.value - asset.purchaseValue : 0;
            return (
              <TouchableOpacity key={asset.id} style={styles.itemRow} activeOpacity={0.7} onLongPress={() => confirmDeleteAsset(asset.id, asset.name)}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemIcon}>{catConfig?.icon}</Text>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{asset.name}</Text>
                    <Text style={styles.itemCategory}>{catConfig?.name}</Text>
                  </View>
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.itemValue}>₹{asset.value.toLocaleString('en-IN')}</Text>
                  {gain !== 0 && (
                    <Text style={[styles.itemGain, { color: gain >= 0 ? colors.success : colors.danger }]}>
                      {gain >= 0 ? '+' : ''}₹{gain.toLocaleString('en-IN')}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Debts Breakdown */}
      {showDebts && debts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.subTitle}>🔴 Debts ({debts.length})</Text>
          {debts.map((debt) => {
            const catConfig = DEBT_CATEGORIES.find((c) => c.id === debt.category);
            const paidPercent = debt.totalAmount > 0
              ? Math.round(((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100)
              : 0;
            return (
              <TouchableOpacity key={debt.id} style={styles.itemRow} activeOpacity={0.7} onLongPress={() => confirmDeleteDebt(debt.id, debt.name)}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemIcon}>{catConfig?.icon}</Text>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{debt.name}</Text>
                    <View style={styles.debtMeta}>
                      <Text style={styles.itemCategory}>{catConfig?.name}</Text>
                      {debt.emiAmount ? (
                        <Text style={styles.emiText}>EMI: ₹{debt.emiAmount}/mo</Text>
                      ) : null}
                    </View>
                    {/* Progress bar */}
                    <View style={styles.debtTrack}>
                      <View style={[styles.debtFill, { width: `${paidPercent}%` }]} />
                    </View>
                    <Text style={styles.debtProgress}>{paidPercent}% paid off</Text>
                  </View>
                </View>
                <Text style={[styles.itemValue, { color: colors.danger }]}>
                  ₹{debt.remainingAmount.toLocaleString('en-IN')}
                </Text>
              </TouchableOpacity>
            );
          })}
          {monthlyObligation > 0 && (
            <View style={styles.obligationRow}>
              <Text style={styles.obligationLabel}>Monthly debt obligation:</Text>
              <Text style={styles.obligationValue}>₹{monthlyObligation.toLocaleString('en-IN')}/mo</Text>
            </View>
          )}
        </View>
      )}

      {/* Empty states */}
      {showAssets && assets.length === 0 && (
        <Text style={styles.emptyText}>No assets added yet. Tap to add your first asset.</Text>
      )}
      {showDebts && debts.length === 0 && (
        <Text style={styles.emptyText}>No debts! You're debt-free 🎉</Text>
      )}
    </GlassCard>
  );
};

// Toggle button sub-component
const ToggleBtn = ({ label, active, onPress, color }: { label: string; active: boolean; onPress: () => void; color?: string }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.toggleBtn, active && { backgroundColor: (color || colors.primary) + '20', borderColor: color || colors.primary }]}
  >
    <Text style={[styles.toggleBtnText, active && { color: color || colors.primary }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.textSecondary, letterSpacing: 1 },
  netWorthValue: { fontSize: fontSize.xl },
  toggleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.base },
  toggleBtn: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: borderRadius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  toggleBtnText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.textMuted },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.base, paddingVertical: spacing.sm, backgroundColor: colors.surface, borderRadius: borderRadius.md },
  summaryItem: { alignItems: 'center', gap: 2 },
  summaryLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  summaryValue: { fontFamily: fonts.monoBold, fontSize: fontSize.base },
  summaryDivider: { width: 1, height: 30, backgroundColor: colors.border },
  section: { gap: spacing.sm, marginTop: spacing.sm },
  subTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  itemLeft: { flexDirection: 'row', gap: spacing.sm, flex: 1 },
  itemIcon: { fontSize: 18, marginTop: 2 },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontFamily: fonts.bodyMedium, fontSize: fontSize.md, color: colors.textPrimary },
  itemCategory: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  itemRight: { alignItems: 'flex-end', gap: 2 },
  itemValue: { fontFamily: fonts.mono, fontSize: fontSize.md, color: colors.textPrimary },
  itemGain: { fontFamily: fonts.mono, fontSize: fontSize.xs },
  debtMeta: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  emiText: { fontFamily: fonts.mono, fontSize: fontSize.xs, color: colors.warning },
  debtTrack: { height: 3, backgroundColor: colors.surfaceHighlight, borderRadius: 2, marginTop: 4, width: '80%', overflow: 'hidden' },
  debtFill: { height: '100%', backgroundColor: colors.success, borderRadius: 2 },
  debtProgress: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted, marginTop: 2 },
  obligationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  obligationLabel: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary },
  obligationValue: { fontFamily: fonts.monoBold, fontSize: fontSize.sm, color: colors.danger },
  emptyText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.md },
});
