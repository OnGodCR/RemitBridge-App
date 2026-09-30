import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { DoesNotTellYou } from '@/components/does-not-tell-you';
import { HeroBackdrop, HeroHeader, StatusBarShield } from '@/components/hero-header';
import { QuoteCard } from '@/components/quote-card';
import { RouteNotCovered } from '@/components/route-request';
import { CountrySelect } from '@/components/select-field';
import { AppText, Button, Segmented, TextLink, useLargeText } from '@/components/ui';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { announce } from '@/lib/announce';
import { saveComparison } from '@/lib/comparisons';
import { RECEIVING, SENDING } from '@/lib/countries';
import { checkedAgo, money } from '@/lib/format';
import { prefs } from '@/lib/prefs';
import { atAmount, fetchQuotes, type QuotesResult, type ShownQuote } from '@/lib/quotes';
import { checkedAmountFor, DELIVERY_LABELS, ROUTES, routeFor, type DeliveryMethod, type Route } from '@/lib/routes';
import { track } from '@/lib/track';

const LIMITS = [
  'Agent fees charged in person',
  'Taxes where the money arrives',
  'Rate moves since the last check',
  'Exact fees between checked amounts',
];

const MAX_AMOUNT = 50000;

/** Digits and at most one decimal point with two places: "1250.5" yes, "12.345" no. */
function cleanAmount(text: string): string {
  const [whole, ...rest] = text.replace(/[^\d.]/g, '').split('.');
  const trimmed = whole.replace(/^0+(?=\d)/, '');
  return rest.length ? `${trimmed}.${rest.join('').slice(0, 2)}` : trimmed;
}

/**
 * Compare. It can be opened on a route, amount and method (a saved comparison, TrueCost's
 * "compare today"), passed as params with a fresh `at` each time: the key remounts the
 * screen, so a second open of the same saved comparison still resets anything changed since.
 */
export default function CompareScreen() {
  const p = useLocalSearchParams<{ route?: string; amount?: string; method?: string; at?: string }>();
  return <Compare key={p.at ?? 'home'} routeId={p.route} amount={p.amount} method={p.method} />;
}

/** Any route that starts in this country. Only the US for now (PRD 6.5). */
const sendsFrom = (code: string) => ROUTES.some((r) => r.id.startsWith(`${code.toLowerCase()}-`));

function Compare(initial: { routeId?: string; amount?: string; method?: string }) {
  const t = useTheme();
  const start =
    ROUTES.find((r) => r.id === initial.routeId) ?? ROUTES.find((r) => r.id === prefs.homeRoute()) ?? ROUTES[0];
  const [from, setFrom] = useState(() => start.id.split('-')[0].toUpperCase());
  const [to, setTo] = useState(() => start.id.split('-')[1].toUpperCase());
  const route = routeFor(from, to);
  const [amountText, setAmountText] = useState(() => cleanAmount(initial.amount ?? '') || '500');
  const amount = Math.min(Number(amountText) || 0, MAX_AMOUNT);
  const [method, setMethod] = useState<DeliveryMethod>(() =>
    start.deliveryMethods.find((m) => m === initial.method) ?? start.deliveryMethods[0],
  );
  const activeMethod = route && !route.deliveryMethods.includes(method) ? route.deliveryMethods[0] : method;
  const checked = checkedAmountFor(amount);
  const quotes = useQuotes(route, checked, activeMethod);
  const large = useLargeText();

  return (
    <View style={[styles.fill, { backgroundColor: t.background }]}>
      <HeroBackdrop />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.scroll}
        refreshControl={
          route ? (
            <RefreshControl refreshing={quotes.refreshing} onRefresh={quotes.refresh} tintColor={t.heroText} />
          ) : undefined
        }>
        <HeroHeader title="Compare">
          {/* Side by side, the names cut off at large text sizes ("In…"), so they stack. */}
          <View style={[styles.countries, large && styles.stacked]}>
            <CountrySelect
              label="From"
              title="Send from"
              value={from}
              options={SENDING}
              covered={sendsFrom}
              onChange={setFrom}
            />
            <CountrySelect
              label="To"
              title="Send to"
              value={to}
              options={RECEIVING}
              covered={(code) => !!routeFor(from, code)}
              onChange={setTo}
            />
          </View>

          <View style={[styles.amount, { backgroundColor: t.heroField }]}>
            <AppText variant="small" muted>
              You send
            </AppText>
            <View style={styles.amountRow}>
              <AppText style={[styles.amountSymbol, { color: t.textSecondary }]}>$</AppText>
              <TextInput
                value={amountText}
                onChangeText={(v) => setAmountText(cleanAmount(v))}
                keyboardType="decimal-pad"
                selectTextOnFocus
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                maxLength={8}
                // Grows with the text setting, but only so far: at full size the number
                // itself was cut to "5…", which is the one thing this field must show.
                maxFontSizeMultiplier={1.5}
                placeholder="0"
                placeholderTextColor={t.textSecondary}
                accessibilityLabel="Amount you send, in US dollars"
                style={[styles.amountInput, { color: t.text }]}
              />
              <AppText variant="label" muted>
                {route?.sendCurrency ?? 'USD'}
              </AppText>
            </View>
          </View>
        </HeroHeader>

        <View style={[styles.body, { backgroundColor: t.background }]}>
          {route ? (
            <>
              <Segmented
                options={route.deliveryMethods.map((m) => ({ value: m, label: DELIVERY_LABELS[m] }))}
                value={activeMethod}
                onChange={setMethod}
              />
              {amount > 0 ? (
                <>
                  <Results result={quotes.result} amount={amount} onRetry={quotes.refresh} retrying={quotes.refreshing} />
                  <SaveComparison routeId={route.id} amount={amount} method={activeMethod} />
                </>
              ) : (
                <AppText muted>Enter an amount.</AppText>
              )}
              <DoesNotTellYou items={LIMITS} />
            </>
          ) : (
            <RouteNotCovered from={from} to={to} />
          )}
        </View>
      </ScrollView>
      <StatusBarShield />
    </View>
  );
}

/**
 * The prices for a route, amount and method. Fetched for the checked amount at or below
 * what was typed, so typing only refetches when it crosses into another checked amount.
 * Nothing is fetched for a route we don't cover.
 */
function useQuotes(route: Route | undefined, checked: number, method: DeliveryMethod) {
  const [loaded, setLoaded] = useState<{ key: string; result: QuotesResult } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const key = route ? `${route.id}|${checked}|${method}` : null;

  useEffect(() => {
    if (!route) return;
    let live = true;
    fetchQuotes(route.id, checked, method).then((r) => {
      if (!live) return;
      setLoaded({ key: `${route.id}|${checked}|${method}`, result: r });
      // Metrics (D31): the choice and how many prices came back, never the amount typed.
      track('comparison_run', {
        route: route.id,
        checked_amount: checked,
        method,
        quotes: r.kind === 'ok' ? r.standing.length : 0,
      });
    });
    return () => {
      live = false;
    };
  }, [route, checked, method]);

  const refresh = async () => {
    if (!route || !key) return;
    setRefreshing(true);
    setLoaded({ key, result: await fetchQuotes(route.id, checked, method) });
    setRefreshing(false);
  };

  return { result: key && loaded?.key === key ? loaded.result : null, refresh, refreshing };
}

function Results({
  result,
  amount,
  onRetry,
  retrying,
}: {
  result: QuotesResult | null;
  amount: number;
  onRetry: () => void;
  retrying: boolean;
}) {
  const t = useTheme();
  const shown = useMemo(() => {
    if (!result || result.kind !== 'ok') return null;
    const at = (list: typeof result.standing) =>
      list
        .map((q) => atAmount(q, amount))
        .filter((q): q is ShownQuote => q !== null)
        .sort((a, b) => b.amount_received - a.amount_received);
    return { standing: at(result.standing), promotional: at(result.promotional) };
  }, [result, amount]);

  if (!result) return <ActivityIndicator style={styles.loading} />;

  if (result.kind === 'not_connected') {
    return <Notice title="Not connected" body="Set the Supabase env in mobile/.env.local." />;
  }

  if (result.kind === 'error') {
    return (
      <View style={styles.results}>
        <Notice title="Prices didn’t load" body="Check your connection and try again." />
        <Button label="Try again" variant="secondary" loading={retrying} onPress={onRetry} />
      </View>
    );
  }

  const { standing, promotional } = shown!;
  if (standing.length === 0 && promotional.length === 0) {
    if (result.savedAt) {
      return <Notice title="Prices didn’t load" body="You seem to be offline, and there are no saved prices for this choice yet." />;
    }
    return (
      <Notice
        title="No checked prices yet"
        body="This route is still being set up. Prices show here once they pass our checks, and never before."
        action={{ label: 'See where each route stands', onPress: () => router.push('/routes') }}
      />
    );
  }

  const offline = result.savedAt ? (
    <Notice
      title="You’re offline"
      body={`These are the prices from your last visit, loaded ${checkedAgo(result.savedAt).replace('Checked ', '')}. Pull down to try again.`}
    />
  ) : null;
  const open = (q: ShownQuote) =>
    router.push({ pathname: '/quote/[id]', params: { id: String(q.id), amount: String(amount) } });
  const receive = (standing[0] ?? promotional[0]).receive_currency;
  const received = standing.map((q) => q.amount_received);
  return (
    <View style={styles.results}>
      {offline}
      {standing.length > 1 ? (
        <AppText style={[styles.summary, { color: t.text }]}>
          {money(Math.min(...received), receive)} to {money(Math.max(...received), receive)} arrives, depending
          on the provider.
        </AppText>
      ) : null}
      {standing.map((q, i) => (
        <QuoteCard
          key={q.id}
          quote={q}
          featured={i === 0 && standing.length > 1}
          highlight={i === 0 && standing.length > 1 ? 'Most to your family' : undefined}
          onPress={() => open(q)}
        />
      ))}
      {promotional.length > 0 ? (
        <>
          <AppText variant="heading" style={styles.promoHeading}>
            First-transfer offers
          </AppText>
          {promotional.map((q) => (
            <QuoteCard key={q.id} quote={q} highlight="Promotion" onPress={() => open(q)} />
          ))}
        </>
      ) : null}
    </View>
  );
}

/**
 * An empty or error state, as the website's callout: a green left rule, plain words, and
 * the next step as a link when there is one (PRD 14.6: always offer the next step).
 */
function Notice({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { label: string; onPress: () => void };
}) {
  const t = useTheme();
  return (
    <View style={[styles.notice, { borderLeftColor: t.primary }]}>
      <View accessible>
        <AppText style={[styles.noticeTitle, { color: t.text }]}>{title}</AppText>
        <AppText style={{ color: t.textSecondary }}>{body}</AppText>
      </View>
      {action ? <TextLink label={action.label} onPress={action.onPress} /> : null}
    </View>
  );
}

/**
 * Save this comparison to the account (D66). Signed out, it says what signing in is for
 * rather than hiding the option, since that's the reason to have an account at all.
 */
function SaveComparison({ routeId, amount, method }: { routeId: string; amount: number; method: DeliveryMethod }) {
  const key = `${routeId}|${amount}|${method}`;
  const [state, setState] = useState<{ key: string; value: 'busy' | 'saved' | 'already' | 'error' } | null>(null);
  const current = state?.key === key ? state.value : null;

  const save = async () => {
    setState({ key, value: 'busy' });
    const result = await saveComparison({ routeId, amount, method });
    if (result === 'signed_out') {
      setState(null);
      Alert.alert('Sign in to save comparisons', 'Saved comparisons open in one tap, on any phone you sign in on.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'Sign in', onPress: () => router.push('/sign-in') },
      ]);
      return;
    }
    setState({ key, value: result });
    announce(result === 'saved' ? 'Saved to your account.' : result === 'already' ? 'Already saved.' : 'Couldn’t save. Try again.');
    if (result === 'saved') track('comparison_saved', { route: routeId, method });
  };

  if (current === 'saved' || current === 'already') {
    return (
      <TextLink
        icon="bookmark.fill"
        label={current === 'saved' ? 'Saved. Find it on Account' : 'Already saved. Find it on Account'}
        onPress={() => router.navigate('/account')}
      />
    );
  }
  return (
    <TextLink
      icon="bookmark"
      arrow={false}
      busy={current === 'busy'}
      label={current === 'error' ? 'Couldn’t save. Try again' : 'Save this comparison'}
      onPress={save}
    />
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1 },
  body: { flexGrow: 1, padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  countries: { flexDirection: 'row', gap: Spacing.two },
  stacked: { flexDirection: 'column' },
  amount: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  amountSymbol: { fontFamily: Fonts.medium, fontSize: 26, lineHeight: 40 },
  amountInput: {
    flex: 1,
    fontFamily: Fonts.bold,
    fontSize: 32,
    letterSpacing: -0.6,
    paddingVertical: Spacing.one,
    fontVariant: ['tabular-nums'],
  },
  results: { gap: Spacing.three },
  summary: { fontFamily: Fonts.semibold, fontSize: 15, lineHeight: 21 },
  loading: { marginVertical: Spacing.four },
  promoHeading: { marginTop: Spacing.two },
  notice: { borderLeftWidth: 3, paddingLeft: Spacing.three, paddingVertical: Spacing.one, gap: Spacing.one },
  noticeTitle: { fontFamily: Fonts.bold, fontSize: 17 },
});
