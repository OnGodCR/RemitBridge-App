import * as AppleAuthentication from 'expo-apple-authentication';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';

import { Step } from '@/components/onboarding';
import { AppText, Button } from '@/components/ui';
import { Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { leaveSignIn } from '@/lib/finish-sign-in';
import { signInWithApple, signInWithGoogle } from '@/lib/sign-in';
import { track } from '@/lib/track';

export default function SignInOptions() {
  const t = useTheme();
  const scheme = useColorScheme();
  const { finishOnboarding } = useAuth();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const onboarding = from === 'onboarding';
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [busy, setBusy] = useState<'apple' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'ios') AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
  }, []);

  const run = async (method: 'apple' | 'google') => {
    setError(null);
    setBusy(method);
    track('sign_in_started', { method });
    const result = method === 'apple' ? await signInWithApple() : await signInWithGoogle();
    setBusy(null);
    if (result === null) {
      track('signed_in', { method });
      finishOnboarding();
      leaveSignIn();
    } else if (result) {
      setError(result);
    }
  };

  const skip = () => {
    track('onboarding_skipped');
    finishOnboarding();
    leaveSignIn();
  };

  return (
    <Step
      step={onboarding ? 3 : undefined}
      of={onboarding ? 3 : undefined}
      actions={
        <>
          {appleAvailable ? (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={
                scheme === 'dark'
                  ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                  : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
              }
              cornerRadius={Radius.md}
              style={styles.apple}
              onPress={() => run('apple')}
            />
          ) : null}
          <Button
            label="Continue with Google"
            variant="secondary"
            loading={busy === 'google'}
            onPress={() => run('google')}
          />
          <Button
            label="Continue with email"
            variant="secondary"
            onPress={() => router.push({ pathname: '/sign-in/email', params: { from } })}
          />
          {onboarding ? <Button label="Skip for now" variant="plain" onPress={skip} /> : null}
        </>
      }>
      <AppText variant="title">{onboarding ? 'Save your transfers' : 'Sign in'}</AppText>
      <AppText muted>Keep your routes and past transfers. Free.</AppText>
      {error ? (
        <AppText variant="label" style={{ color: t.destructive }} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : null}
    </Step>
  );
}

const styles = StyleSheet.create({
  apple: { height: 50, width: "100%" },
});
