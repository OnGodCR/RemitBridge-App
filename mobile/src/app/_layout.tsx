import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Hind_400Regular, Hind_500Medium, Hind_600SemiBold, Hind_700Bold } from '@expo-google-fonts/hind';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AccessibilityProvider } from '@/components/accessibility';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { stackOptions } from '@/components/stack-options';
import { useTheme } from '@/hooks/use-theme';
import { LanguageProvider, useCopy } from '@/i18n';
import { useIsAdmin } from '@/lib/admin';
import { AuthProvider, useAuth } from '@/lib/auth';
import { openCompare } from '@/lib/open-compare';
import type { DeliveryMethod } from '@/lib/routes';
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
    // Hindi's matched Devanagari face (constants/theme.ts, DevanagariFonts).
    Hind_400Regular,
    Hind_500Medium,
    Hind_600SemiBold,
    Hind_700Bold,
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    // Gestures (the swipe between tabs) need one root for the whole app.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AccessibilityProvider>
          <LanguageProvider>
            <AuthProvider>
              <Navigator />
            </AuthProvider>
          </LanguageProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function Navigator() {
  const { ready, onboarded } = useAuth();
  const isAdmin = useIsAdmin();
  const t = useTheme();
  const { titles, devPreview } = useCopy();
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
  useAlertTaps();

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!onboarded}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={onboarded}>
        <Stack.Screen name="(tabs)" />
        {/* Account left the bottom bar for WhatsApp (D147): pushed from the button at the
            top right of every tab, with its own back button in the green band. */}
        <Stack.Screen name="account" />
        <Stack.Screen name="fair-rate" options={{ ...pushed, title: titles.fairRate }} />
        <Stack.Screen name="scam-check" options={{ ...pushed, title: titles.scamCheck }} />
        <Stack.Screen name="true-cost" options={{ ...pushed, title: titles.trueCost }} />
        <Stack.Screen name="yearly-cost" options={{ ...pushed, title: titles.yearlyCost }} />
        <Stack.Screen name="rate-history" options={{ ...pushed, title: titles.rateHistory }} />
        <Stack.Screen name="glossary" options={{ ...pushed, title: titles.glossary }} />
        <Stack.Screen name="dev/receipt-preview" options={{ ...pushed, title: devPreview.title }} />
        <Stack.Screen name="module/[id]" options={{ ...pushed, title: '' }} />
        {/* A lesson (D136) takes the whole screen, like Duolingo's, and closes with its own button. */}
        <Stack.Screen name="lesson/[id]" options={{ presentation: 'fullScreenModal', headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="blog/index" options={{ ...pushed, title: titles.blog }} />
        <Stack.Screen name="blog/[id]" options={{ ...pushed, title: '' }} />
        <Stack.Screen name="saved" options={{ ...pushed, title: titles.saved }} />
        <Stack.Screen name="alert" options={{ ...pushed, title: titles.alert }} />
        <Stack.Screen name="remitbench" options={{ ...pushed, title: titles.remitbench }} />
        <Stack.Screen name="observatory" options={{ ...pushed, title: titles.observatory }} />
        <Stack.Screen name="quote/[id]" options={{ ...pushed, title: titles.quote }} />
        <Stack.Screen name="routes" options={{ ...pushed, title: titles.routeBoard }} />
        <Stack.Screen name="request-route" options={{ ...pushed, title: titles.askForRoute }} />
      </Stack.Protected>
      {/* Reachable from onboarding and from Account. */}
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

// A rate alert that arrives while the app is open still shows as a banner (D113).
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

/** Tapping a rate alert opens Compare on its route, amount and method (D113). */
function useAlertTaps() {
  useEffect(() => {
    const open = (data: Record<string, unknown> | undefined) => {
      if (typeof data?.route !== 'string') return;
      openCompare({
        routeId: data.route,
        amount: typeof data.amount === 'number' ? data.amount : undefined,
        method: typeof data.method === 'string' ? (data.method as DeliveryMethod) : undefined,
      });
    };
    // Opened from a notification while the app was closed.
    const last = Notifications.getLastNotificationResponse();
    if (last) open(last.notification.request.content.data);
    const sub = Notifications.addNotificationResponseReceivedListener((r) => open(r.notification.request.content.data));
    return () => sub.remove();
  }, []);
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
