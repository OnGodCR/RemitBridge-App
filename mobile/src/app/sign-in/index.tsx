import * as AppleAuthentication from 'expo-apple-authentication';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { DisplayTitle, Eyebrow } from '@/components/brand';
import { Rise } from '@/components/motion-views';
import { Step } from '@/components/onboarding';
import { AppText, Button } from '@/components/ui';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';
import { announce } from '@/lib/announce';
import { useAuth } from '@/lib/auth';
import { leaveSignIn } from '@/lib/finish-sign-in';
import { signInWithApple, signInWithGoogle, type SignInError } from '@/lib/sign-in';
import { track } from '@/lib/track';

/**
 * Sign in, and the last onboarding step (DECISIONS.md D62).
 *
 * In the website's vocabulary: an eyebrow, a two-tone title whose green line says the
 * account is optional, a divided list, and one promise set off by the green left rule the
 * site uses for callouts. The buttons carry their providers' own marks (Apple's official
 * button, Google's "G" as its sign-in guidelines require on a custom button, an envelope for
 * email), because a sign-in button people recognize is one they trust.
 */
export default function SignInOptions() {
  const t = useTheme();
  const scheme = useColorScheme();
  const { finishOnboarding } = useAuth();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const onboarding = from === 'onboarding';
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [busy, setBusy] = useState<'apple' | 'google' | null>(null);
  const [error, setError] = useState<SignInError | null>(null);
  const copy = useCopy();
  const si = copy.signIn;

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
    } else if (result !== 'closed') {
      setError(result);
      announce(si.errors[result]);
    }
  };

  const skip = () => {
    track('onboarding_skipped');
    finishOnboarding();
    leaveSignIn();
  };

  return (
    <Step
      step={onboarding ? 4 : undefined}
      of={onboarding ? 4 : undefined}
      actions={
        <Rise step={4} style={styles.actions}>
          {appleAvailable ? (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={
                scheme === 'dark'
                  ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                  : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
              }
              cornerRadius={BUTTON_HEIGHT / 2}
              style={styles.apple}
              onPress={() => run('apple')}
            />
          ) : null}
          <Button
            label={si.google}
            variant="secondary"
            loading={busy === 'google'}
            icon={<Image source={require('../../../assets/images/google-g.svg')} style={styles.mark} contentFit="contain" />}
            onPress={() => run('google')}
          />
          {/* Email is the one green button, like "Get started" on the first step: it works on
              every phone, with no other account needed. Apple's stays black and Google's stays
              white, as their own guidelines ask. */}
          <Button
            label={si.email}
            icon={<SymbolView pointerEvents="none" name="envelope.fill" size={17} tintColor={t.primaryForeground} fallback={null} />}
            onPress={() => router.push({ pathname: '/sign-in/email', params: { from } })}
          />
          {onboarding ? <Button label={si.skip} variant="plain" onPress={skip} /> : null}
        </Rise>
      }>
      <Rise step={0} style={styles.head}>
        <Eyebrow>{onboarding ? si.eyebrowOnboarding : si.eyebrowAccount}</Eyebrow>
        <DisplayTitle
          lead={onboarding ? si.leadOnboarding : si.leadAccount}
          accent={onboarding ? si.accentOnboarding : si.accentAccount}
        />
      </Rise>

      {/* A divided list, the website's way: hairline rows, bold label, one plain line. */}
      <Rise step={1} style={[styles.list, { borderTopColor: t.border }]}>
        {si.benefits.map((b) => (
          <View key={b.title} style={[styles.row, { borderBottomColor: t.border }]}>
            <AppText style={[styles.rowTitle, { color: t.text }]}>{b.title}</AppText>
            <AppText style={{ color: t.textSecondary }}>{b.body}</AppText>
          </View>
        ))}
      </Rise>

      {/* The website's callout: a saturated green left edge, on the plain ground. */}
      <Rise step={2} style={[styles.callout, { borderLeftColor: t.primary }]}>
        <AppText style={[styles.calloutText, { color: t.text }]}>
          {si.promise}
        </AppText>
      </Rise>

      {error ? (
        <AppText variant="label" style={{ color: t.destructive }} accessibilityLiveRegion="polite">
          {si.errors[error]}
        </AppText>
      ) : null}
    </Step>
  );
}



const BUTTON_HEIGHT = 54;

const styles = StyleSheet.create({
  actions: { gap: Spacing.three },
  apple: { height: BUTTON_HEIGHT, width: '100%' },
  mark: { width: 18, height: 18 },
  head: { gap: Spacing.three },
  list: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: Spacing.two },
  row: { borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: Spacing.three, gap: 3 },
  rowTitle: { fontFamily: Fonts.bold, fontSize: 17 },
  callout: { borderLeftWidth: 3, paddingLeft: Spacing.three, paddingVertical: Spacing.one, borderRadius: Radius.sm / 3 },
  calloutText: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 23 },
});
