import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSize, spacing, borderRadius } from '@/theme';

interface Props {
  children: React.ReactNode;
}
interface State {
  hasError: boolean;
  message?: string;
}

/**
 * Catches render errors anywhere in the tree and shows a friendly retry screen
 * instead of a white crash. Keeps a single bad screen from killing the app.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message };
  }

  componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.warn('Caught by ErrorBoundary:', error?.message);
  }

  reset = () => this.setState({ hasError: false, message: undefined });

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.message ?? 'An unexpected error occurred.'}</Text>
          <TouchableOpacity style={styles.btn} onPress={this.reset} activeOpacity={0.85}>
            <Text style={styles.btnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  emoji: { fontSize: 40 },
  title: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.textPrimary },
  message: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  btn: { marginTop: spacing.md, backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.md, paddingHorizontal: spacing['2xl'] },
  btnText: { fontFamily: fonts.headingMedium, fontSize: fontSize.base, color: colors.textInverse },
});
