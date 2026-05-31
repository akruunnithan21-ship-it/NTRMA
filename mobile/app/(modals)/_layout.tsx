import { Stack } from 'expo-router';
import { colors } from '@/theme';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="add-expense" />
      <Stack.Screen name="add-income" />
      <Stack.Screen name="add-asset" />
      <Stack.Screen name="add-debt" />
      <Stack.Screen name="add-watchlist" />
      <Stack.Screen name="stock-detail" />
      <Stack.Screen name="signal-detail" />
      <Stack.Screen name="lesson" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
