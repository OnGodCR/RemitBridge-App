import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DoesNotTellYou } from '@/components/does-not-tell-you';
import { QuoteCard } from '@/components/quote-card';
import { AppText, Card, Chip, ChipRow } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { money } from '@/lib/format';
import { prefs } from '@/lib/prefs';
import { fetchQuotes, type QuotesResult } from '@/lib/quotes';
import { AMOUNTS, DELIVERY_LABELS, ROUTES, type DeliveryMethod } from '@/lib/routes';

const LIMITS = [
  'Agent fees charged in person',
  'Taxes where the money arrives',
  'Rate moves since the last check',
  'Amounts between the ones shown',
];

export default function CompareScreen() {
  const t = useTheme();
  const [routeId, setRouteId] = useState(() => {
    const home = prefs.homeRoute();
    return ROUTES.some((r) => r.id === home) ? home! : ROUTES[0].id;
  });
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

        <Section label="To">
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

        <Section label="Delivery">
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

        <Results result={result} />

        <DoesNotTellYou items={LIMITS} />
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

function Results({ result }: { result: QuotesResult | null }) {
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

  const { standing, promotional } = result;
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
  section: { gap: Spacing.two },
  results: { gap: Spacing.three },
  loading: { marginVertical: Spacing.four },
  promoHeading: { marginTop: Spacing.two },
});
