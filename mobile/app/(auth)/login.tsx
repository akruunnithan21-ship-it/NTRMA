import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Vibration } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { colors, fonts, fontSize, spacing, borderRadius } from '@/theme';
import { Icon, GradientText } from '@/components/ui';

const PIN_LENGTH = 4;

export default function LoginScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const shakeX = useSharedValue(0);

  // Correct PIN (stored securely in production via expo-secure-store)
  const CORRECT_PIN = '1234';

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();

    if (compatible && enrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock WealthMaster',
        cancelLabel: 'Use PIN',
        disableDeviceFallback: true,
      });

      if (result.success) {
        router.replace('/(tabs)');
      }
    }
  };

  const handlePinPress = (digit: string) => {
    if (pin.length >= PIN_LENGTH) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newPin = pin + digit;
    setPin(newPin);
    setError(false);

    if (newPin.length === PIN_LENGTH) {
      if (newPin === CORRECT_PIN) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      } else {
        // Wrong PIN - shake animation
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(true);
        shakeX.value = withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 500);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPin(pin.slice(0, -1));
  };

  const handleBiometric = () => {
    checkBiometric();
  };

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Logo / Title */}
      <Animated.View entering={FadeInDown.duration(600)} style={styles.logoArea}>
        <View style={styles.logoBadge}>
          <Icon name="activity" size={34} color={colors.primary} strokeWidth={2.5} />
        </View>
        <GradientText style={styles.appName} gradient={colors.gradientCyan}>WealthMaster</GradientText>
        <Text style={styles.tagline}>Enter your PIN</Text>
      </Animated.View>

      {/* PIN Dots */}
      <Animated.View style={[styles.pinDots, shakeStyle]}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              pin.length > i && styles.dotFilled,
              error && pin.length > i && styles.dotError,
            ]}
          />
        ))}
      </Animated.View>

      {error && (
        <Text style={styles.errorText}>Wrong PIN. Try again.</Text>
      )}

      {/* Number Pad */}
      <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.numpad}>
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['bio', '0', 'del'],
        ].map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numpadRow}>
            {row.map((key) => {
              if (key === 'bio') {
                return (
                  <TouchableOpacity
                    key={key}
                    style={styles.numpadKey}
                    onPress={handleBiometric}
                  >
                    <Icon name="biometric" size={26} color={colors.primary} />
                  </TouchableOpacity>
                );
              }
              if (key === 'del') {
                return (
                  <TouchableOpacity
                    key={key}
                    style={styles.numpadKey}
                    onPress={handleDelete}
                    onLongPress={() => { setPin(''); }}
                  >
                    <Icon name="backspace" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.numpadKey}
                  onPress={() => handlePinPress(key)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.numpadDigit}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logoBadge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryGlow,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.base,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 8,
  },
  appName: {
    fontFamily: fonts.heading,
    fontSize: fontSize['2xl'],
    color: colors.textPrimary,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  pinDots: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  dotError: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
    shadowColor: colors.danger,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.danger,
    marginBottom: spacing.base,
  },
  numpad: {
    width: '100%',
    maxWidth: 300,
    gap: spacing.md,
  },
  numpadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  numpadKey: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  numpadDigit: {
    fontFamily: fonts.heading,
    fontSize: fontSize['2xl'],
    color: colors.textPrimary,
  },
  numpadBio: {
    fontSize: 24,
  },
  numpadDel: {
    fontSize: 22,
    color: colors.textSecondary,
  },
});
