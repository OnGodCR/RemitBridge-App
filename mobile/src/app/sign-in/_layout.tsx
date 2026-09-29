import { Stack } from 'expo-router';

/** Headerless: each step draws its own back button (components/onboarding.tsx). */
export default function SignInLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
