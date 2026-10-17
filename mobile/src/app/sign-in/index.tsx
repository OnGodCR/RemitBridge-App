import * as AppleAuthentication from 'expo-apple-authentication';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Icon } from '@/components/icon';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, TextInput } from 'react-native';

import { SavedArt } from '@/components/illustrations';
import { Rise } from '@/components/motion-views';
import { Step } from '@/components/onboarding';
import { AppText, Button } from '@/components/ui';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { useCopy, useLanguage } from '@/i18n';
import { announce } from '@/lib/announce';
import { useAuth } from '@/lib/auth';
import { leaveSignIn } from '@/lib/finish-sign-in';
import { applyPendingOptIn, setPendingOptIn } from '@/lib/newsletter';
import { prefs } from '@/lib/prefs';
import { signInWithApple, signInWithGoogle, type SignInError } from '@/lib/sign-in';
import { track } from '@/lib/track';

/**
 * Sign in, and the last onboarding step (DECISIONS.md D62).
 *
 * One picture, one question and one plain line, then the buttons. It used to stack an
 * eyebrow, a two-tone title, a two-row benefits list and a green callout, which Angad found
 * read as machine-made (2026-10-07); the saved-receipt drawing says "keep what you check"
 * without the list. The buttons carry their providers' own marks (Apple's official
 * button, Google's "G" as its sign-in guidelines require on a custom button, an envelope for
 * email), because a sign-in button people recognize is one they trust.
 *
 * The questions (year of birth, the newsletter) come before this, on onboarding/about
 * (Angad, 2026-10-17). Reached without an answer, it asks first: a neutral age screen
 * (COPPA; the FTC's guidance), the year of birth with no hint of the cutoff. Anyone 13 or younger by year is told accounts
 * are for 13 and up, and the phone remembers it so going back can't change the answer.
 * Only that pass or block flag is kept, on the phone; the year is never stored or sent.
 * Comparing never needs an account, so nobody loses the app itself.
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
  const [gate, setGate] = useState(prefs.ageGate);
  const { language } = useLanguage();
  const [year, setYear] = useState('');
  const thisYear = new Date().getFullYear();
  const yearOk = /^\d{4}$/.test(year) && Number(year) >= 1900 && Number(year) <= thisYear;

  const checkAge = () => {
    if (!yearOk) return;
    // By year alone a 13 could still be 12, so 13 counts as under.
    const next = thisYear - Number(year) <= 13 ? 'blocked' : 'ok';
    prefs.setAgeGate(next);
    setGate(next);
    if (next === 'blocked') announce(si.tooYoung);
  };

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
      applyPendingOptIn(language.code);
      finishOnboarding();
      leaveSignIn();
    } else if (result !== 'closed') {
      setError(result);
      announce(si.errors[result]);
    }
  };

  const skip = () => {
    setPendingOptIn(false);
    track('onboarding_skipped');
    finishOnboarding();
    leaveSignIn();
  };

  return (
    <Step
      step={onboarding ? 5 : undefined}
      of={onboarding ? 5 : undefined}
      actions={
        gate !== 'ok' ? (
          <Rise step={4} style={styles.actions}>
            {gate === null ? <Button label={si.continue} onPress={checkAge} disabled={!yearOk} /> : null}
            {onboarding ? <Button label={si.skip} variant="plain" onPress={skip} /> : null}
          </Rise>
        ) : (
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
              icon={
                <Image
                  source={require('../../../assets/images/google-g.svg')}
                  style={styles.mark}
                  contentFit="contain"
                />
              }
              onPress={() => run('google')}
            />
            {/* Email is the one green button, like "Get started" on the first step: it works on
              every phone, with no other account needed. Apple's stays black and Google's stays
              white, as their own guidelines ask. */}
            <Button
              label={si.email}
              icon={
                <Icon
                  pointerEvents="none"
                  name="envelope.fill"
                  size={17}
                  tintColor={t.primaryForeground}
                  fallback={null}
                />
              }
              onPress={() => router.push({ pathname: '/sign-in/email', params: { from } })}
            />
            {onboarding ? <Button label={si.skip} variant="plain" onPress={skip} /> : null}
          </Rise>
        )
      }>
      <Rise step={0} style={styles.art}>
        <SavedArt size={112} />
      </Rise>

      <Rise step={1} style={styles.head}>
        <AppText accessibilityRole="header" style={[styles.heading, { color: t.text }]}>
          {onboarding ? si.titleOnboarding : si.titleAccount}
        </AppText>
        <AppText style={[styles.body, { color: t.textSecondary }]}>
          {gate === 'blocked' ? si.tooYoung : onboarding ? si.bodyOnboarding : si.bodyAccount}
        </AppText>
      </Rise>

      {gate === null ? (
        <TextInput
          value={year}
          onChangeText={(v) => setYear(v.replace(/\D/g, '').slice(0, 4))}
          onSubmitEditing={checkAge}
          keyboardType="number-pad"
          returnKeyType="done"
          maxLength={4}
          placeholder={si.birthYear}
          placeholderTextColor={t.textSecondary}
          accessibilityLabel={si.birthYear}
          maxFontSizeMultiplier={2}
          style={[styles.input, { color: t.text, backgroundColor: t.card, borderColor: t.border }]}
        />
      ) : null}

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
  art: { marginTop: Spacing.four, marginBottom: Spacing.two },
  head: { gap: Spacing.three },
  heading: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    lineHeight: 31,
    letterSpacing: -0.7,
  },
  body: { fontSize: 17, lineHeight: 24 },
  input: {
    minHeight: 56,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontFamily: Fonts.medium,
    fontSize: 17,
  },
});
