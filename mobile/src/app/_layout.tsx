import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { AccessibilityProvider } from '@/components/accessibility';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { stackOptions } from '@/components/stack-options';
import { useTheme } from '@/hooks/use-theme';
import { useIsAdmin } from '@/lib/admin';
import { AuthProvider, useAuth } from '@/lib/auth';
import { track } from '@/lib/track';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AccessibilityProvider>
        <AuthProvider>
          <Navigator />
        </AuthProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}

function Navigator() {
  const { ready, onboarded } = useAuth();
  const isAdmin = useIsAdmin();
  const t = useTheme();
  // Pushed screens (tools, learn, admin) sit on this root stack with a native header, so
  // each gets a back button to the tab it came from. Nested stacks gave their first screen
  // no back button, because nothing came before it inside that stack.
  const pushed = { ...stackOptions(t), headerShown: true };

  useEffect(() => {
    // Hold the splash until the stored session is read, so nobody sees onboarding flash
    // before the app knows they're already signed in.
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  useSessionEvents();

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!onboarded}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={onboarded}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="fair-rate" options={{ ...pushed, title: 'Fair rate' }} />
        <Stack.Screen name="scam-check" options={{ ...pushed, title: 'Scam check' }} />
        <Stack.Screen name="true-cost" options={{ ...pushed, title: 'TrueCost' }} />
        <Stack.Screen name="yearly-cost" options={{ ...pushed, title: 'Yearly cost' }} />
        <Stack.Screen name="rate-history" options={{ ...pushed, title: 'Rate history' }} />
        <Stack.Screen name="glossary" options={{ ...pushed, title: 'Glossary' }} />
        <Stack.Screen name="remitbench" options={{ ...pushed, title: 'RemitBench' }} />
        <Stack.Screen name="quote/[id]" options={{ ...pushed, title: 'Quote' }} />
        <Stack.Screen name="routes" options={{ ...pushed, title: 'Route board' }} />
        <Stack.Screen name="request-route" options={{ ...pushed, title: 'Ask for a route' }} />
      </Stack.Protected>
      {/* Reachable from onboarding and from the Account tab. */}
      <Stack.Screen name="sign-in" />
      {/* Price entry (D54). The screen is hidden from everyone else, and RLS refuses the
          insert anyway: the guard is convenience, the policy is the protection. */}
      <Stack.Protected guard={isAdmin}>
        <Stack.Screen name="admin" options={{ ...pushed, title: 'Add a price' }} />
        <Stack.Screen name="metrics" options={{ ...pushed, title: 'Metrics' }} />
      </Stack.Protected>
    </Stack>
  );
}

/**
 * Sessions for the metrics screen (D31, D65): `app_opened` at launch, and again when the
 * app comes back after 30 minutes or more in the background. Shorter trips away (a glance
 * at a message) stay part of the same session.
 */
const SESSION_GAP_MS = 30 * 60 * 1000;

function useSessionEvents() {
  useEffect(() => {
    track('app_opened');
    let left: number | null = null;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') left = Date.now();
      if (state === 'active' && left !== null && Date.now() - left >= SESSION_GAP_MS) track('app_opened');
      if (state === 'active') left = null;
    });
    return () => sub.remove();
  }, []);
}
