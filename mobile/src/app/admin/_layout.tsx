import { Stack } from 'expo-router';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Admin tools. Reachable only when the account is an admin (the guard in app/_layout.tsx). */
export default function AdminLayout() {
  const t = useTheme();
  return (
    <Stack
      screenOptions={{
        headerTintColor: t.primary,
        headerTitleStyle: { fontFamily: Fonts.semibold, color: t.text },
        headerStyle: { backgroundColor: t.background },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: t.background },
      }}>
      <Stack.Screen name="index" options={{ title: 'Add a price', headerBackTitle: 'Account' }} />
    </Stack>
  );
}
