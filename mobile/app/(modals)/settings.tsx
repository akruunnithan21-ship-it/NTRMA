import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Updates from 'expo-updates';
import { GlassCard, NeonButton, ScreenHeader, StatusPill, Icon, AuroraBackground } from '@/components/ui';
import { colors, fonts, fontSize, spacing, borderRadius } from '@/theme';
import { useConnectionStore, ConnMode } from '@/store/useConnectionStore';
import { useAIStore, StrategyMode } from '@/store/useAIStore';

const STRATEGIES: StrategyMode[] = ['aggressive', 'balanced', 'protect'];

export default function SettingsModal() {
  const conn = useConnectionStore();
  const strategy = useAIStore((s) => s.strategyMode);
  const setStrategy = useAIStore((s) => s.setStrategyMode);

  const [mode, setMode] = useState<ConnMode>(conn.mode);
  const [localIP, setLocalIP] = useState(conn.localIP);
  const [localPort, setLocalPort] = useState(conn.localPort);
  const [tunnelURL, setTunnelURL] = useState(conn.tunnelURL);
  const [testing, setTesting] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  const save = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await conn.update({ mode, localIP: localIP.trim(), localPort: localPort.trim() || '3001', tunnelURL: tunnelURL.trim() });
  };

  const testConnection = async () => {
    setTesting(true);
    await save();
    await conn.checkHealth();
    setTesting(false);
    Haptics.notificationAsync(
      useConnectionStore.getState().status === 'online'
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error
    );
  };

  const checkUpdates = async () => {
    setUpdateMsg('Checking…');
    try {
      if (!Updates.isEnabled) {
        setUpdateMsg('OTA updates are only active in a built APK (not Expo Go).');
        return;
      }
      const res = await Updates.checkForUpdateAsync();
      if (res.isAvailable) {
        setUpdateMsg('Update found — downloading…');
        await Updates.fetchUpdateAsync();
        setUpdateMsg('Update ready. Restarting…');
        await Updates.reloadAsync();
      } else {
        setUpdateMsg('You are on the latest version.');
      }
    } catch (e: any) {
      setUpdateMsg(`Update check failed: ${e?.message ?? 'unknown error'}`);
    }
  };

  const statusColor = conn.status === 'online' ? colors.success : conn.status === 'checking' ? colors.warning : colors.danger;

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader title="Settings" onBack={() => router.back()} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* Connection */}
            <GlassCard animate={false}>
              <View style={styles.cardHead}>
                <Text style={styles.sectionTitle}>BACKEND CONNECTION</Text>
                <StatusPill
                  label={conn.status === 'online' ? 'Online' : conn.status === 'checking' ? 'Checking' : 'Offline'}
                  color={statusColor}
                  pulse={conn.status === 'online'}
                />
              </View>

              <View style={styles.segment}>
                {(['local', 'tunnel'] as ConnMode[]).map((m) => (
                  <TouchableOpacity key={m} style={[styles.segBtn, mode === m && styles.segBtnActive]} onPress={() => setMode(m)}>
                    <Icon name={m === 'local' ? 'wifi' : 'zap'} size={15} color={mode === m ? colors.primary : colors.textMuted} />
                    <Text style={[styles.segText, mode === m && { color: colors.primary }]}>{m === 'local' ? 'Local WiFi' : 'Tunnel'}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {mode === 'local' ? (
                <View style={styles.fieldRow}>
                  <View style={styles.flex2}>
                    <Text style={styles.label}>PC IP address</Text>
                    <TextInput value={localIP} onChangeText={setLocalIP} placeholder="192.168.1.100" placeholderTextColor={colors.textMuted} style={styles.input} keyboardType="numbers-and-punctuation" autoCapitalize="none" />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.label}>Port</Text>
                    <TextInput value={localPort} onChangeText={setLocalPort} placeholder="3001" placeholderTextColor={colors.textMuted} style={styles.input} keyboardType="number-pad" />
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={styles.label}>Cloudflare tunnel URL</Text>
                  <TextInput value={tunnelURL} onChangeText={setTunnelURL} placeholder="https://xyz.trycloudflare.com" placeholderTextColor={colors.textMuted} style={styles.input} autoCapitalize="none" keyboardType="url" />
                </View>
              )}

              <Text style={styles.previewLabel}>
                Will connect to: <Text style={styles.previewUrl}>{mode === 'tunnel' && tunnelURL ? tunnelURL.replace(/\/$/, '') : `http://${localIP}:${localPort || '3001'}`}/api</Text>
              </Text>
              {conn.serverHostname && conn.status === 'online' && (
                <Text style={styles.previewLabel}>Server: <Text style={styles.previewUrl}>{conn.serverHostname}</Text></Text>
              )}

              <View style={styles.btnRow}>
                <NeonButton title="Test" onPress={testConnection} variant="ghost" size="sm" loading={testing} iconName="activity" style={styles.flex1} />
                <NeonButton title="Save" onPress={save} variant="primary" size="sm" iconName="check" style={styles.flex1} />
              </View>
              <Text style={styles.hint}>Find your PC's IP with `ipconfig` (Windows) under your WiFi adapter's IPv4 Address.</Text>
            </GlassCard>

            {/* Strategy */}
            <GlassCard animate={false}>
              <Text style={styles.sectionTitle}>DEFAULT STRATEGY</Text>
              <View style={styles.segment}>
                {STRATEGIES.map((m) => (
                  <TouchableOpacity key={m} style={[styles.segBtn, strategy === m && styles.segBtnActive]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStrategy(m); }}>
                    <Text style={[styles.segText, strategy === m && { color: colors.primary }]}>{m[0].toUpperCase() + m.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>

            {/* App / OTA */}
            <GlassCard animate={false}>
              <Text style={styles.sectionTitle}>APP</Text>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Version</Text><Text style={styles.infoValue}>{Updates.runtimeVersion ?? '1.0.0'}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Update channel</Text><Text style={styles.infoValue}>{Updates.channel ?? 'default'}</Text></View>
              <NeonButton title="Check for updates" onPress={checkUpdates} variant="ghost" size="sm" iconName="refresh" style={{ marginTop: spacing.md }} />
              {updateMsg && <Text style={styles.hint}>{updateMsg}</Text>}
            </GlassCard>
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
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  content: { padding: spacing.base, gap: spacing.base, paddingBottom: spacing['4xl'] },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontFamily: fonts.headingMedium, fontSize: fontSize.sm, color: colors.textSecondary, letterSpacing: 1, marginBottom: spacing.md },
  segment: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.base },
  segBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.sm, borderRadius: borderRadius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  segBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  segText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.textMuted },
  fieldRow: { flexDirection: 'row', gap: spacing.md },
  label: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  input: { backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, fontFamily: fonts.mono, fontSize: fontSize.md, color: colors.textPrimary },
  previewLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.md },
  previewUrl: { fontFamily: fonts.mono, color: colors.primary },
  btnRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.base },
  hint: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 18 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs },
  infoLabel: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary },
  infoValue: { fontFamily: fonts.mono, fontSize: fontSize.sm, color: colors.textPrimary },
});
