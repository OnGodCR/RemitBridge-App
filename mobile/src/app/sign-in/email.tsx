import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput } from 'react-native';

import { Step } from '@/components/onboarding';
import { AppText, Button } from '@/components/ui';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCopy, useLanguage } from '@/i18n';
import { announce } from '@/lib/announce';
import { useAuth } from '@/lib/auth';
import { leaveSignIn } from '@/lib/finish-sign-in';
import { applyPendingOptIn } from '@/lib/newsletter';
import { isReviewEmail, sendEmailCode, signInForReview, type SignInError } from '@/lib/sign-in';
import { track } from '@/lib/track';

const looksLikeEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function EmailStep() {
  const t = useTheme();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { finishOnboarding } = useAuth();
  const { language } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<SignInError | null>(null);
  const copy = useCopy();
  const si = copy.signIn;

  // App Review's account signs in with a password, since reviewers can't get a code (D184).
  const reviewing = isReviewEmail(email);

  const signInReviewer = async () => {
    if (!password) return;
    setBusy(true);
    setError(null);
    const result = await signInForReview(email, password);
    setBusy(false);
    if (result && result !== 'closed') {
      setError(result);
      announce(si.errors[result]);
      return;
    }
    track('signed_in', { method: 'email' });
    applyPendingOptIn(language.code);
    finishOnboarding();
    leaveSignIn();
  };

  const submit = async () => {
    if (!looksLikeEmail(email)) return;
    if (reviewing) return signInReviewer();
    setBusy(true);
    setError(null);
    track('sign_in_started', { method: 'email' });
    const result = await sendEmailCode(email);
    setBusy(false);
    if (result && result !== 'closed') {
      setError(result);
      announce(si.errors[result]);
    } else router.push({ pathname: '/sign-in/code', params: { email: email.trim(), from } });
  };

  return (
    <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Step
        actions={
          <Button
            label={reviewing ? si.signInWithPassword : si.sendCode}
            onPress={submit}
            loading={busy}
            disabled={!looksLikeEmail(email) || (reviewing && !password)}
          />
        }>
        <AppText variant="title" accessibilityRole="header">
          {si.emailTitle}
        </AppText>
        {reviewing ? null : <AppText muted>{si.emailIntro}</AppText>}
        <TextInput
          value={email}
          onChangeText={setEmail}
          onSubmitEditing={submit}
          autoFocus
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="send"
          placeholder="you@example.com"
          placeholderTextColor={t.textSecondary}
          accessibilityLabel={si.emailLabel}
          maxFontSizeMultiplier={2}
          style={[styles.input, { color: t.text, backgroundColor: t.card, borderColor: t.border }]}
        />
        {reviewing ? (
          <TextInput
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={submit}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            returnKeyType="go"
            accessibilityLabel={si.passwordLabel}
            placeholder={si.passwordLabel}
            placeholderTextColor={t.textSecondary}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  input: {
    minHeight: 56,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontFamily: Fonts.medium,
    fontSize: 17,
  },
});
