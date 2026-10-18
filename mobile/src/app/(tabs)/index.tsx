import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  Keyboard,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import type { FundingMethod } from '@remitbridge/formula';

import { DoesNotTellYou } from '@/components/does-not-tell-you';
import { HeroBackdrop, HeroHeader, StatusBarShield } from '@/components/hero-header';
import { QuoteCard } from '@/components/quote-card';
import { RouteNotCovered } from '@/components/route-request';
import { CountrySelect } from '@/components/select-field';
import { AppText, Button, Segmented, TextLink, useLargeText } from '@/components/ui';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useGutter } from '@/hooks/use-gutter';
import { useTheme } from '@/hooks/use-theme';
import { announce } from '@/lib/announce';
import { saveComparison } from '@/lib/comparisons';
import { availableRoutes, methodsFor, useAvailability } from '@/lib/availability';
import { RECEIVING, SENDING } from '@/lib/countries';
import { agoIn, useCopy, useLanguage } from '@/i18n';
import { money } from '@/lib/format';
import { prefs } from '@/lib/prefs';
import { fundingWord } from '@/lib/receipt-format';
import { atAmount, fetchQuotes, type QuotesResult, type ShownQuote } from '@/lib/quotes';
import { checkedAmountFor, ROUTES, routeFor, type DeliveryMethod, type Route } from '@/lib/routes';
import { track } from '@/lib/track';
import { useTabFocus } from '@/lib/current-tab';
import { FocusRise, RiseIn } from '@/components/motion-views';



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
  useTabFocus('/');
  const p = useLocalSearchParams<{ route?: string; amount?: string; method?: string; at?: string }>();
  return <Compare key={p.at ?? 'home'} routeId={p.route} amount={p.amount} method={p.method} />;
}

function Compare(initial: { routeId?: string; amount?: string; method?: string }) {
  const t = useTheme();
  const gutter = useGutter();
  const copy = useCopy();
  // Only countries and ways of receiving that have prices right now (D190): nothing to pick
  // that would come back empty.
  const availability = useAvailability();
  const live = availableRoutes(availability);
  const shown = live.length ? live : ROUTES;
  const start =
    shown.find((r) => r.id === initial.routeId) ?? shown.find((r) => r.id === prefs.homeRoute()) ?? shown[0];
  const [from, setFrom] = useState(() => start.id.split('-')[0].toUpperCase());
  const [picked, setTo] = useState(() => start.id.split('-')[1].toUpperCase());
  const sending = SENDING.filter((c) => shown.some((r) => r.id.startsWith(`${c.code.toLowerCase()}-`)));
  const receiving = RECEIVING.filter((c) => shown.some((r) => r.id === `${from}-${c.code}`.toLowerCase()));
  // A country whose prices expired while the screen was open gives way to the first one left.
  const to = receiving.some((c) => c.code === picked) ? picked : (receiving[0]?.code ?? picked);
  const route = routeFor(from, to);
  const methods = route ? methodsFor(availability, route) : [];
  const [amountText, setAmountText] = useState(() => cleanAmount(initial.amount ?? '') || '500');
  const amount = Math.min(Number(amountText) || 0, MAX_AMOUNT);
  const [method, setMethod] = useState<DeliveryMethod>(() => (initial.method as DeliveryMethod) ?? 'bank_deposit');
  const activeMethod = methods.length && !methods.includes(method) ? methods[0] : method;
  // Compare offers verified bank-account-funded quotes only.
  const funding: FundingMethod = 'bank_account';
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
        <HeroHeader title={copy.compare.title}>
          {/* Side by side, the names cut off at large text sizes ("In…"), so they stack. */}
          <View style={[styles.countries, large && styles.stacked]}>
            <CountrySelect
              label={copy.common.from}
              title={copy.compare.sendFrom}
              value={from}
              options={sending}
              covered={() => true}
              onChange={setFrom}
            />
            <CountrySelect
              label={copy.common.to}
              title={copy.compare.sendTo}
              value={to}
              options={receiving}
              covered={() => true}
              onChange={setTo}
            />
          </View>

          <View style={[styles.amount, { backgroundColor: t.heroField }]}>
            <AppText variant="small" muted>
              {copy.compare.youSend}
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
                accessibilityLabel={copy.compare.amountLabel}
                style={[styles.amountInput, { color: t.text }]}
              />
              <AppText variant="label" muted>
                {route?.sendCurrency ?? 'USD'}
              </AppText>
            </View>
          </View>
        </HeroHeader>

        <FocusRise style={[styles.body, { backgroundColor: t.background, paddingHorizontal: gutter }]}>
          {route ? (
            <>
              {methods.length > 1 ? (
                <Segmented
                  options={methods.map((m) => ({ value: m, label: copy.delivery[m] }))}
                  value={activeMethod}
                  onChange={setMethod}
                />
              ) : (
                <AppText variant="label">{copy.delivery[activeMethod]}</AppText>
              )}
              <AppText variant="small" muted>{`${copy.funding.compareLabel}: ${copy.payment.bank_account}`}</AppText>
              {amount > 0 ? (
                <>
                  <Results
                    result={quotes.result}
                    amount={amount}
                    funding={funding}
                    onRetry={quotes.refresh}
                    retrying={quotes.refreshing}
                  />
                  <SaveComparison routeId={route.id} amount={amount} method={activeMethod} />
                  <AlertLink routeId={route.id} amount={checked} method={activeMethod} funding={funding} result={quotes.result} />
                </>
              ) : (
                <AppText muted>{copy.compare.enterAmount}</AppText>
              )}
              <DoesNotTellYou items={copy.compare.limits} />
            </>
          ) : (
            <RouteNotCovered from={from} to={to} />
          )}
        </FocusRise>
      </ScrollView>
      <StatusBarShield />
    </View>
  );
}

const REFETCH_AFTER_MS = 2 * 60 * 1000;

/**
 * The prices for a route, amount and method. Fetched for the checked amount at or below
 * what was typed, so typing only refetches when it crosses into another checked amount.
 * Nothing is fetched for a route we don't cover. Prices are checked every few hours, so
 * coming back to the tab or the app refetches quietly when the last load is over
 * REFETCH_AFTER_MS old; otherwise a screen left open would keep showing old prices.
 */
function useQuotes(route: Route | undefined, checked: number, method: DeliveryMethod) {
  const [loaded, setLoaded] = useState<{ key: string; result: QuotesResult } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const key = route ? `${route.id}|${checked}|${method}` : null;
  const loadedAt = useRef(0);

  useEffect(() => {
    if (!route) return;
    let live = true;
    fetchQuotes(route.id, checked, method).then((r) => {
      if (!live) return;
      setLoaded({ key: `${route.id}|${checked}|${method}`, result: r });
      loadedAt.current = Date.now();
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
    loadedAt.current = Date.now();
    setRefreshing(false);
  };

  const refetchIfOld = useCallback(() => {
    if (!route || !loadedAt.current || Date.now() - loadedAt.current < REFETCH_AFTER_MS) return;
    loadedAt.current = Date.now();
    fetchQuotes(route.id, checked, method).then((r) =>
      setLoaded({ key: `${route.id}|${checked}|${method}`, result: r }),
    );
  }, [route, checked, method]);

  useFocusEffect(refetchIfOld);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refetchIfOld());
    return () => sub.remove();
  }, [refetchIfOld]);

  return { result: key && loaded?.key === key ? loaded.result : null, refresh, refreshing };
}

function Results({
  result,
  amount,
  funding,
  onRetry,
  retrying,
}: {
  result: QuotesResult | null;
  amount: number;
  funding: FundingMethod;
  onRetry: () => void;
  retrying: boolean;
}) {
  const t = useTheme();
  const copy = useCopy();
  const { language } = useLanguage();
  const shown = useMemo(() => {
    if (!result || result.kind !== 'ok') return null;
    const at = (list: typeof result.standing) =>
      list
        .filter((q) => q.payment_method === funding)
        .map((q) => atAmount(q, amount, funding))
        .filter((q): q is ShownQuote => q !== null)
        .sort((a, b) => b.amount_received - a.amount_received);
    return {
      standing: at(result.standing),
      promotional: at(result.promotional),
      older: at(result.older),
      otherMethods: result.standing.length + result.promotional.length + result.older.length > 0,
    };
  }, [result, amount, funding]);

  if (!result) return <ActivityIndicator style={styles.loading} />;

  if (result.kind === 'not_connected') {
    return <Notice title={copy.compare.notConnectedTitle} body={copy.compare.notConnectedBody} />;
  }

  if (result.kind === 'error') {
    return (
      <View style={styles.results}>
        <Notice title={copy.compare.errorTitle} body={copy.compare.errorBody} />
        <Button label={copy.common.tryAgain} variant="secondary" loading={retrying} onPress={onRetry} />
      </View>
    );
  }

  const { standing, promotional, older, otherMethods } = shown!;
  const none = standing.length === 0 && promotional.length === 0 && older.length === 0;
  if (none && otherMethods) {
    return <Notice title={copy.payment[funding]} body={copy.funding.compareNone} />;
  }
  if (none) {
    if (result.savedAt) {
      return <Notice title={copy.compare.errorTitle} body={copy.compare.offlineNothing} />;
    }
    return (
      <Notice
        title={copy.compare.noPricesTitle}
        body={copy.compare.noPricesBody}
        action={{ label: copy.compare.whereRoutesStand, onPress: () => router.push('/routes') }}
      />
    );
  }

  const offline = result.savedAt ? (
    <Notice
      title={copy.compare.offlineTitle}
      body={copy.compare.offlineBody(agoIn(copy, result.savedAt))}
    />
  ) : null;
  const open = (q: ShownQuote) =>
    router.push({ pathname: '/quote/[id]', params: { id: String(q.id), amount: String(amount), funding } });
  const first = standing[0] ?? promotional[0] ?? older[0];
  const tax = first.tax;
  const receive = first.receive_currency;
  const received = standing.map((q) => q.amount_received);
  return (
    <View style={styles.results}>
      {offline}
      {standing.length > 1 ? (
        <AppText style={[styles.summary, { color: t.text }]}>
          {copy.compare.summary(money(Math.min(...received), receive), money(Math.max(...received), receive))}
        </AppText>
      ) : null}
      {tax > 0 ? (
        <AppText variant="small" muted>
          {copy.funding.compareTaxLine(fundingWord(funding, copy, language), money(tax, first.send_currency))}
        </AppText>
      ) : null}
      {standing.map((q, i) => (
        // Each set of prices arrives in turn, best first (D121).
        <RiseIn key={q.id} index={i}>
          <QuoteCard
            quote={q}
            featured={i === 0}
            highlight={i === 0 ? copy.compare.mostToFamily : undefined}
            onPress={() => open(q)}
          />
        </RiseIn>
      ))}
      {promotional.length > 0 ? (
        <>
          <AppText variant="heading" style={styles.promoHeading}>
            {copy.compare.firstTransferOffers}
          </AppText>
          {promotional.map((q) => (
            <QuoteCard key={q.id} quote={q} highlight={copy.compare.promotion} onPress={() => open(q)} />
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
 * "Tell me when it's better" (D113): opens the rate alert screen on this route, the checked
 * amount, the method and how it's paid, starting from today's best standing price.
 */
function AlertLink({
  routeId,
  amount,
  method,
  funding,
  result,
}: {
  routeId: string;
  amount: number;
  method: DeliveryMethod;
  funding: FundingMethod;
  result: QuotesResult | null;
}) {
  const copy = useCopy();
  if (result?.kind !== 'ok') return null;
  const best = result.standing
    .filter((q) => q.payment_method === funding)
    .reduce<(typeof result.standing)[number] | null>((top, q) => (!top || Number(q.amount_received) > Number(top.amount_received) ? q : top), null);
  if (!best) return null;
  return (
    <TextLink
      icon="bell"
      label={copy.alerts.link}
      onPress={() =>
        router.push({
          pathname: '/alert',
          params: {
            route: routeId,
            amount: String(amount),
            method,
            funding,
            best: String(best.amount_received),
            currency: best.receive_currency,
            provider: best.provider_name,
          },
        })
      }
    />
  );
}

/**
 * Save this comparison to the account (D66). Signed out, it says what signing in is for
 * rather than hiding the option, since that's the reason to have an account at all.
 */
function SaveComparison({ routeId, amount, method }: { routeId: string; amount: number; method: DeliveryMethod }) {
  const copy = useCopy();
  const key = `${routeId}|${amount}|${method}`;
  const [state, setState] = useState<{ key: string; value: 'busy' | 'saved' | 'already' | 'error' } | null>(null);
  const current = state?.key === key ? state.value : null;

  const save = async () => {
    setState({ key, value: 'busy' });
    const result = await saveComparison({ routeId, amount, method });
    if (result === 'signed_out') {
      setState(null);
      Alert.alert(copy.compare.signInToSaveTitle, copy.compare.signInToSaveBody, [
        { text: copy.common.notNow, style: 'cancel' },
        { text: copy.common.signIn, onPress: () => router.push('/sign-in') },
      ]);
      return;
    }
    setState({ key, value: result });
    announce(
      result === 'saved' ? copy.compare.savedSpoken : result === 'already' ? copy.compare.alreadySpoken : copy.compare.saveFailed,
    );
    if (result === 'saved') track('comparison_saved', { route: routeId, method });
  };

  if (current === 'saved' || current === 'already') {
    return (
      <TextLink
        icon="bookmark.fill"
        label={current === 'saved' ? copy.compare.saved : copy.compare.alreadySaved}
        onPress={() => router.push('/saved')}
      />
    );
  }
  return (
    <View style={styles.saveLinks}>
      <TextLink
        icon="bookmark"
        arrow={false}
        busy={current === 'busy'}
        label={current === 'error' ? copy.compare.saveFailed : copy.compare.save}
        onPress={save}
      />
      {/* Where saved comparisons live (D108), so nobody has to hunt through Account. */}
      <TextLink icon="list.bullet" label={copy.saved.seeAll} onPress={() => router.push('/saved')} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1 },
  body: { flexGrow: 1, padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  countries: { flexDirection: 'row', gap: Spacing.two },
  saveLinks: { gap: Spacing.three },
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
