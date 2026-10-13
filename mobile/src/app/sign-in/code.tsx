import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput } from 'react-native';

import { Step } from '@/components/onboarding';
import { AppText, Button } from '@/components/ui';
import { Fonts, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCopy, useLanguage } from '@/i18n';
import { announce } from '@/lib/announce';
import { useAuth } from '@/lib/auth';
import { leaveSignIn } from '@/lib/finish-sign-in';
import { applyPendingOptIn } from '@/lib/newsletter';
import { sendEmailCode, verifyEmailCode, type SignInError } from '@/lib/sign-in';
import { track } from '@/lib/track';

const RESEND_AFTER_S = 60; // matches auth.email.max_frequency in supabase/config.toml

export default function CodeStep() {
  const t = useTheme();
  const { finishOnboarding } = useAuth();
  const { language } = useLanguage();
  const { email = '' } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<SignInError | null>(null);
  const copy = useCopy();
  const si = copy.signIn;
  const [wait, setWait] = useState(RESEND_AFTER_S);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  const verify = async (value: string) => {
    setBusy(true);
    setError(null);
    const result = await verifyEmailCode(email, value);
    setBusy(false);
    if (result && result !== 'closed') {
      setError(result);
      announce(si.errors[result]);
      setCode('');
      return;
    }
    track('signed_in', { method: 'email' });
    applyPendingOptIn(language.code);
    finishOnboarding();
    leaveSignIn();
  };

  const onChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    if (digits.length === 6) verify(digits);
  };

  const resend = async () => {
    setError(null);
    setWait(RESEND_AFTER_S);
    const result = await sendEmailCode(email);
    if (result && result !== 'closed') setError(result);
  };

  return (
    <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Step
        actions={
          <Button
            label={wait > 0 ? si.resendIn(wait) : si.resend}
            variant="plain"
            disabled={wait > 0}
            onPress={resend}
          />
        }>
        <AppText variant="title" accessibilityRole="header">
          {si.codeTitle}
        </AppText>
        <AppText muted>{si.sentTo(email)}</AppText>
        <TextInput
          value={code}
          onChangeText={onChange}
          editable={!busy}
          autoFocus
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={6}
          accessibilityLabel={si.codeLabel}
          maxFontSizeMultiplier={1.5}
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
    minHeight: 64,
    borderRadius: Radius.md,
    borderWidth: 1,
    textAlign: 'center',
    fontFamily: Fonts.extrabold,
    fontSize: 32,
    letterSpacing: 12,
    fontVariant: ['tabular-nums'],
  },
});
