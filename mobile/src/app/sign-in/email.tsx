import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput } from 'react-native';

import { Step } from '@/components/onboarding';
import { AppText, Button } from '@/components/ui';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';
import { announce } from '@/lib/announce';
import { sendEmailCode, type SignInError } from '@/lib/sign-in';
import { track } from '@/lib/track';

const looksLikeEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function EmailStep() {
  const t = useTheme();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<SignInError | null>(null);
  const copy = useCopy();
  const si = copy.signIn;

  const submit = async () => {
    if (!looksLikeEmail(email)) return;
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
          <Button label={si.sendCode} onPress={submit} loading={busy} disabled={!looksLikeEmail(email)} />
        }>
        <AppText variant="title" accessibilityRole="header">
          {si.emailTitle}
        </AppText>
        <AppText muted>{si.emailIntro}</AppText>
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
