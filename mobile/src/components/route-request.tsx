import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { DisplayTitle, Eyebrow } from '@/components/brand';
import { AppText, Button, Segmented, TextLink } from '@/components/ui';
import { Fonts, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { countryName } from '@/lib/countries';
import { fetchRequestCounts, looksLikeEmail, pairKey, requestRoute, type RequestResult } from '@/lib/requests';
import type { DeliveryMethod } from '@/lib/routes';
import { track } from '@/lib/track';

/**
 * "Route not covered" (PRD 14.7 screen 4): what Compare shows for a pair we don't check.
 * It says so plainly, shows how many people have asked, and takes a request. Empty states
 * always offer the next step (PRD 14.6), and for a missing route the next step is asking.
 */
export function RouteNotCovered({ from, to, boardLink = true }: { from: string; to: string; boardLink?: boolean }) {
  const t = useTheme();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let live = true;
    fetchRequestCounts().then((c) => live && setCount(c ? (c.get(pairKey(from, to)) ?? 0) : null));
    return () => {
      live = false;
    };
  }, [from, to]);

  return (
    <View style={styles.panel}>
      <View style={styles.head}>
        <Eyebrow>Not covered yet</Eyebrow>
        <DisplayTitle
          size={26}
          lead={`${countryName(from)} to ${countryName(to)}`}
          accent="isn’t a route we check yet."
        />
        <AppText style={[styles.lede, { color: t.textSecondary }]}>
          We only show prices we’ve checked ourselves. Requests decide which routes we add next.
        </AppText>
        {count !== null ? (
          <AppText style={[styles.count, { color: t.text }]}>
            {count === 0
              ? 'Nobody has asked for it yet.'
              : `${count.toLocaleString()} ${count === 1 ? 'person has' : 'people have'} asked for it.`}
          </AppText>
        ) : null}
      </View>
      <RouteRequestForm from={from} to={to} onCounted={() => setCount((c) => (c === null ? c : c + 1))} />
      {boardLink ? <TextLink label="See every requested route" onPress={() => router.push('/routes')} /> : null}
    </View>
  );
}

const METHODS: { value: DeliveryMethod | 'any'; label: string }[] = [
  { value: 'any', label: 'Any way' },
  { value: 'bank_deposit', label: 'Bank' },
  { value: 'cash_pickup', label: 'Cash pickup' },
  { value: 'mobile_wallet', label: 'Wallet' },
];

/**
 * The request itself: how the money should arrive (optional) and an address to hear back
 * at (optional). What's kept, and when the address is deleted, is said right under the
 * field, because that's where the decision to type it gets made.
 */
export function RouteRequestForm({
  from,
  to,
  onCounted,
}: {
  from: string;
  to: string;
  /** Called when a new request is counted (not when this phone had asked already). */
  onCounted?: () => void;
}) {
  const t = useTheme();
  const [method, setMethod] = useState<DeliveryMethod | 'any'>('any');
  // Never pre-filled from the account: storing an address is opt-in (D19), so it's typed.
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ key: string; value: RequestResult } | null>(null);
  const [emailError, setEmailError] = useState(false);
  // A result belongs to the route it was sent for; picking another route clears it.
  const key = pairKey(from, to);
  const done = result?.key === key ? result.value : null;

  const send = async () => {
    const address = email.trim();
    if (address && !looksLikeEmail(address)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    setBusy(true);
    const value = await requestRoute({ from, to, method: method === 'any' ? null : method, email: address || null });
    setBusy(false);
    setResult({ key, value });
    if (value === 'ok') {
      track('route_requested', { route: key.toLowerCase(), method, with_email: !!address });
      onCounted?.();
    }
  };

  if (done === 'ok' || done === 'already') {
    return (
      <View style={[styles.callout, { borderLeftColor: t.primary }]} accessibilityLiveRegion="polite">
        <AppText style={[styles.calloutText, { color: t.text }]}>
          {done === 'ok' ? 'Thanks. Your request is counted.' : 'You’ve asked for this route already. It’s counted.'}
        </AppText>
        {done === 'ok' && email.trim() ? (
          <AppText style={{ color: t.textSecondary }}>We’ll email you once when it’s live.</AppText>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.form}>
      <View style={styles.field}>
        <AppText variant="label" muted>
          How should the money arrive?
        </AppText>
        <Segmented options={METHODS} value={method} onChange={setMethod} />
      </View>
      <View style={styles.field}>
        <AppText variant="label" muted>
          Email me when it’s live (optional)
        </AppText>
        <TextInput
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            setEmailError(false);
          }}
          placeholder="you@example.com"
          placeholderTextColor={t.textSecondary}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Email address, optional"
          style={[styles.input, { color: t.text, backgroundColor: t.card, borderColor: emailError ? t.destructive : t.border }]}
        />
        <AppText variant="small" style={{ color: emailError ? t.destructive : t.textSecondary }}>
          {emailError
            ? 'That doesn’t look like an email address.'
            : 'One email when the route launches. Then we delete your address.'}
        </AppText>
      </View>
      {done === 'error' ? (
        <AppText variant="label" style={{ color: t.destructive }} accessibilityLiveRegion="polite">
          That didn’t go through. Try again in a moment.
        </AppText>
      ) : null}
      <Button label="Ask for this route" loading={busy} onPress={send} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: Spacing.four },
  head: { gap: Spacing.three },
  lede: { fontSize: 16, lineHeight: 23 },
  count: { fontFamily: Fonts.bold, fontSize: 16 },
  form: { gap: Spacing.four },
  field: { gap: Spacing.two },
  input: {
    minHeight: MinTapTarget + 4,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    fontFamily: Fonts.medium,
    fontSize: 16,
  },
  callout: { borderLeftWidth: 3, paddingLeft: Spacing.three, paddingVertical: Spacing.one, gap: Spacing.one },
  calloutText: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 23 },
});
