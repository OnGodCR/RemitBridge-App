import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DoesNotTellYou } from '@/components/does-not-tell-you';
import { QuoteCard } from '@/components/quote-card';
import { CountrySelect } from '@/components/select-field';
import { AppText, Card, Chip, ChipRow } from '@/components/ui';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RECEIVING, SENDING } from '@/lib/countries';
import { money } from '@/lib/format';
import { prefs } from '@/lib/prefs';
import {
  atAmount,
  checkedAmountFor,
  fetchQuotes,
  type QuotesResult,
  type ShownQuote,
} from '@/lib/quotes';
import { DELIVERY_LABELS, ROUTES, routeFor, type DeliveryMethod } from '@/lib/routes';
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

export default function CompareScreen() {
  const t = useTheme();
  const [from, setFrom] = useState('US');
  const [to, setTo] = useState(() => {
    const home = ROUTES.find((r) => r.id === prefs.homeRoute());
    return (home ?? ROUTES[0]).id.split('-')[1].toUpperCase();
  });
  const route = routeFor(from, to) ?? ROUTES[0];
  const [amountText, setAmountText] = useState('500');
  const amount = Math.min(Number(amountText) || 0, MAX_AMOUNT);
  const [method, setMethod] = useState<DeliveryMethod>(route.deliveryMethods[0]);
  const activeMethod = route.deliveryMethods.includes(method) ? method : route.deliveryMethods[0];

  // Quotes are fetched for the checked amount at or below what was typed, so typing only
  // refetches when it crosses into another checked amount.
  const checked = checkedAmountFor(amount);
  const [loaded, setLoaded] = useState<{ key: string; result: QuotesResult } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const key = `${route.id}|${checked}|${activeMethod}`;
  const result = loaded?.key === key ? loaded.result : null;

  useEffect(() => {
    let live = true;
    fetchQuotes(route.id, checked, activeMethod).then((r) => {
      if (!live) return;
      setLoaded({ key: `${route.id}|${checked}|${activeMethod}`, result: r });
      // Metrics (D31): the choice, never the exact amount typed.
      track('comparison_run', { route: route.id, checked_amount: checked, method: activeMethod });
    });
    return () => {
      live = false;
    };
  }, [route.id, checked, activeMethod]);

  const refresh = async () => {
    setRefreshing(true);
    setLoaded({ key, result: await fetchQuotes(route.id, checked, activeMethod) });
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: t.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        <AppText variant="title">Compare</AppText>

        <View style={styles.countries}>
          <CountrySelect
            label="From"
            title="Send from"
            value={from}
            options={SENDING}
            onChange={setFrom}
          />
          <CountrySelect label="To" title="Send to" value={to} options={RECEIVING} onChange={setTo} />
        </View>

        <View style={[styles.amount, { backgroundColor: t.card, borderColor: t.border }]}>
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
              placeholder="0"
              placeholderTextColor={t.textSecondary}
              accessibilityLabel="Amount you send, in US dollars"
              style={[styles.amountInput, { color: t.text }]}
            />
            <AppText variant="label" muted>
              {route.sendCurrency}
            </AppText>
          </View>
        </View>

        <ChipRow>
          {route.deliveryMethods.map((m) => (
            <Chip
              key={m}
              label={DELIVERY_LABELS[m]}
              selected={m === activeMethod}
              onPress={() => setMethod(m)}
            />
          ))}
        </ChipRow>

        {amount > 0 ? (
          <Results result={result} amount={amount} />
        ) : (
          <AppText muted>Enter an amount.</AppText>
        )}

        <DoesNotTellYou items={LIMITS} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Results({ result, amount }: { result: QuotesResult | null; amount: number }) {
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
    return (
      <Card>
        <AppText variant="heading">Not connected</AppText>
        <AppText muted>Set the Supabase env in mobile/.env.local.</AppText>
      </Card>
    );
  }

  if (result.kind === 'error') {
    return (
      <Card>
        <AppText variant="heading">Prices didn’t load</AppText>
        <AppText muted>Pull down to retry.</AppText>
      </Card>
    );
  }

  const { standing, promotional } = shown!;
  if (standing.length === 0 && promotional.length === 0) {
    return (
      <Card>
        <AppText variant="heading">No prices yet</AppText>
        <AppText muted>Only checked prices show here.</AppText>
      </Card>
    );
  }

  const receive = (standing[0] ?? promotional[0]).receive_currency;
  const received = standing.map((q) => q.amount_received);
  return (
    <View style={styles.results}>
      {standing.length > 1 ? (
        <AppText variant="label">
          {money(Math.min(...received), receive)} – {money(Math.max(...received), receive)} arrives
        </AppText>
      ) : null}
      {standing.map((q, i) => (
        <QuoteCard key={q.id} quote={q} highlight={i === 0 ? 'Most to your family' : undefined} />
      ))}
      {promotional.length > 0 ? (
        <>
          <AppText variant="heading" style={styles.promoHeading}>
            First-transfer offers
          </AppText>
          {promotional.map((q) => (
            <QuoteCard key={q.id} quote={q} highlight="Promotion" />
          ))}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  countries: { flexDirection: 'row', gap: Spacing.two },
  amount: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  amountSymbol: { fontFamily: Fonts.medium, fontSize: 28, lineHeight: 44 },
  amountInput: {
    flex: 1,
    fontFamily: Fonts.extrabold,
    fontSize: 36,
    letterSpacing: -0.8,
    paddingVertical: Spacing.one,
    fontVariant: ['tabular-nums'],
  },
  results: { gap: Spacing.three },
  loading: { marginVertical: Spacing.four },
  promoHeading: { marginTop: Spacing.two },
});
