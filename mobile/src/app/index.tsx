import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DoesNotTellYou } from '@/components/does-not-tell-you';
import { QuoteCard } from '@/components/quote-card';
import { AppText, Card, Chip, ChipRow } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { money } from '@/lib/format';
import { fetchQuotes, type QuotesResult } from '@/lib/quotes';
import { AMOUNTS, DELIVERY_LABELS, ROUTES, type DeliveryMethod } from '@/lib/routes';

const LIMITS = [
  'First-transfer promotions are shown apart from standing rates, and may not apply to you.',
  'Charges an agent adds in person, and any tax in the receiving country.',
  'How the rate has moved since the price was checked. The time is on every card.',
  'Prices for amounts between the ones shown. Fees often change at tier breaks.',
];

export default function CompareScreen() {
  const t = useTheme();
  const [routeId, setRouteId] = useState(ROUTES[0].id);
  const [amount, setAmount] = useState<number>(500);
  const route = ROUTES.find((r) => r.id === routeId) ?? ROUTES[0];
  const [method, setMethod] = useState<DeliveryMethod>(route.deliveryMethods[0]);
  const [loaded, setLoaded] = useState<{ key: string; result: QuotesResult } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Each result remembers which selection it answers, so a slow response can never show
  // under a route or amount it wasn't for, and a new selection shows the spinner.
  const key = `${routeId}|${amount}|${method}`;
  const result = loaded?.key === key ? loaded.result : null;

  useEffect(() => {
    let live = true;
    fetchQuotes(routeId, amount, method).then((r) => {
      if (live) setLoaded({ key: `${routeId}|${amount}|${method}`, result: r });
    });
    return () => {
      live = false;
    };
  }, [routeId, amount, method]);

  const refresh = async () => {
    setRefreshing(true);
    setLoaded({ key, result: await fetchQuotes(routeId, amount, method) });
    setRefreshing(false);
  };

  const pickRoute = (id: string) => {
    const next = ROUTES.find((r) => r.id === id)!;
    setRouteId(id);
    if (!next.deliveryMethods.includes(method)) setMethod(next.deliveryMethods[0]);
  };

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: t.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
          />
        }>
        <AppText variant="title">Compare</AppText>
        <AppText muted>
          Ranked by how much your family receives, not by the fee. No ads, no affiliate deals.
        </AppText>

        <Section label="Sending from the US to">
          <ChipRow>
            {ROUTES.map((r) => (
              <Chip
                key={r.id}
                label={`${r.flag} ${r.country}`}
                accessibilityLabel={r.country}
                selected={r.id === routeId}
                onPress={() => pickRoute(r.id)}
              />
            ))}
          </ChipRow>
        </Section>

        <Section label="Amount">
          <ChipRow>
            {AMOUNTS.map((a) => (
              <Chip
                key={a}
                label={money(a, 'USD').replace('.00', '')}
                selected={a === amount}
                onPress={() => setAmount(a)}
              />
            ))}
          </ChipRow>
        </Section>

        <Section label="How it arrives">
          <ChipRow>
            {route.deliveryMethods.map((m) => (
              <Chip
                key={m}
                label={DELIVERY_LABELS[m]}
                selected={m === method}
                onPress={() => setMethod(m)}
              />
            ))}
          </ChipRow>
        </Section>

        <Results result={result} amount={amount} country={route.country} />

        <DoesNotTellYou items={LIMITS} />
        <AppText variant="small" muted>
          Nothing you pick here is saved or tied to you.
        </AppText>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="label" muted>
        {label}
      </AppText>
      {children}
    </View>
  );
}

function Results({
  result,
  amount,
  country,
}: {
  result: QuotesResult | null;
  amount: number;
  country: string;
}) {
  if (!result) return <ActivityIndicator style={styles.loading} />;

  if (result.kind === 'not_connected') {
    return (
      <Card>
        <AppText variant="heading">Not connected yet</AppText>
        <AppText muted>
          This build has no database configured, so there are no prices to show. Set
          EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in mobile/.env.
        </AppText>
      </Card>
    );
  }

  if (result.kind === 'error') {
    return (
      <Card>
        <AppText variant="heading">Prices didn’t load</AppText>
        <AppText muted>Pull down to try again. ({result.message})</AppText>
      </Card>
    );
  }

  const { standing, promotional } = result;
  if (standing.length === 0 && promotional.length === 0) {
    return (
      <Card>
        <AppText variant="heading">No checked prices for this yet</AppText>
        <AppText muted>
          We only show a price once it has passed every check, and none has for this route,
          amount and delivery method in the last 48 hours. A missing price is better than a
          wrong one.
        </AppText>
      </Card>
    );
  }

  const receive = (standing[0] ?? promotional[0]).receive_currency;
  const received = standing.map((q) => q.amount_received);
  return (
    <View style={styles.results}>
      {standing.length > 1 ? (
        <AppText variant="label">
          Sending {money(amount, 'USD')} to {country}: recipients get between{' '}
          {money(Math.min(...received), receive)} and {money(Math.max(...received), receive)}{' '}
          depending on provider.
        </AppText>
      ) : null}
      {standing.map((q, i) => (
        <QuoteCard key={q.id} quote={q} highlight={i === 0 ? 'Most to your family' : undefined} />
      ))}
      {promotional.length > 0 ? (
        <>
          <AppText variant="heading" style={styles.promoHeading}>
            Promotional rates
          </AppText>
          <AppText muted>
            One-time offers, usually for a first transfer. Shown apart because the next
            transfer won’t get them.
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
  section: { gap: Spacing.two },
  results: { gap: Spacing.three },
  loading: { marginVertical: Spacing.four },
  promoHeading: { marginTop: Spacing.two },
});
