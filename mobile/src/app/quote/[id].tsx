import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, View } from 'react-native';

import { Eyebrow } from '@/components/brand';
import { DoesNotTellYou } from '@/components/does-not-tell-you';
import { LineChart } from '@/components/line-chart';
import { ListFact, ListGroup, ListRow } from '@/components/list-row';
import { CostBreakdownBar, FreshnessBadge } from '@/components/quote-card';
import { AppText, TextLink } from '@/components/ui';
import { FIGURES } from '@/constants/figures';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { money, moneySpoken, pct } from '@/lib/format';
import { CONTACT } from '@/lib/links';
import { atAmount, fetchQuote, fetchQuoteHistory, type HistoryPoint, type LatestQuote } from '@/lib/quotes';
import { DELIVERY_LABELS, ROUTES } from '@/lib/routes';
import { track } from '@/lib/track';

const PAYMENT_LABELS: Record<string, string> = {
  bank_account: 'Bank account',
  debit_card: 'Debit card',
  credit_card: 'Credit card',
  cash: 'Cash',
};

const LIMITS = [
  'Whether this provider is available where you live',
  'Fees for paying by card, if you do',
  'What the provider charges at other amounts',
  'How the rate moves before you send',
];

/**
 * Quote detail (PRD 14.7 screen 3): one provider's price in full. The breakdown bar, every
 * figure that goes into the total (each from the one formula, via the engine or atAmount),
 * delivery and payment, promotions, the source and check time, and the provider's recent
 * prices for the same route. Links to Fair rate (PRD 5.7) and to report a wrong price.
 */
export default function QuoteDetail() {
  const t = useTheme();
  const { id, amount } = useLocalSearchParams<{ id: string; amount?: string }>();
  const [raw, setRaw] = useState<{ id: string; value: LatestQuote | 'missing' | 'error' } | null>(null);
  const [history, setHistory] = useState<{ id: string; value: HistoryPoint[] | 'error' } | null>(null);

  useEffect(() => {
    let live = true;
    fetchQuote(Number(id)).then((value) => {
      if (!live) return;
      setRaw({ id, value });
      if (typeof value === 'object') {
        track('quote_opened', { provider: value.provider_id, route: value.route_id });
        fetchQuoteHistory(value).then((h) => live && setHistory({ id, value: h }));
      }
    });
    return () => {
      live = false;
    };
  }, [id]);

  const loaded = raw?.id === id ? raw.value : null;
  const quote = useMemo(() => {
    if (!loaded || typeof loaded !== 'object') return null;
    const typed = Number(amount);
    return typed > 0 ? atAmount(loaded, typed) : { ...loaded, basedOn: null };
  }, [loaded, amount]);

  if (loaded === null) {
    return (
      <View style={[styles.fill, { backgroundColor: t.background }]}>
        <StatusBar style="auto" />
        <ActivityIndicator style={styles.loading} />
      </View>
    );
  }
  if (!quote) {
    return (
      <View style={[styles.fill, { backgroundColor: t.background }]}>
        <StatusBar style="auto" />
        <Stack.Screen options={{ title: 'Quote' }} />
        <View style={styles.content}>
          <AppText style={[styles.lede, { color: t.text }]}>
            {loaded === 'error'
              ? 'This price didn’t load. Check your connection and try again.'
              : 'This price is no longer published.'}
          </AppText>
        </View>
      </View>
    );
  }

  const q = quote;
  const route = ROUTES.find((r) => r.id === q.route_id);
  const markupCost = Math.max(0, q.total_cost - q.fee - q.pickup_charge / q.mid_market_rate);
  const points = history?.id === id && history.value !== 'error' ? history.value : null;

  const report = () => {
    track('price_reported', { provider: q.provider_id, route: q.route_id });
    const subject = `Price looks wrong: ${q.provider_name}, ${route?.country ?? q.route_id}`;
    const body = [
      `Quote ${q.id}: ${q.provider_name}, ${money(Number(q.basedOn ?? q.send_amount), q.send_currency)} to ${route?.country ?? q.route_id}, ${DELIVERY_LABELS[q.delivery_method]}.`,
      `Checked ${new Date(q.captured_at).toUTCString()}.`,
      '',
      'What looks wrong:',
    ].join('\n');
    Linking.openURL(`mailto:${CONTACT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`).catch(
      () => undefined,
    );
  };

  return (
    <ScrollView
      style={[styles.fill, { backgroundColor: t.background }]}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic">
      <Stack.Screen options={{ title: q.provider_name }} />
      <StatusBar style="auto" />

      <View style={styles.head}>
        <Eyebrow>
          {`${money(q.send_amount, q.send_currency).replace('.00', '')} to ${route?.country ?? q.receive_currency} · ${DELIVERY_LABELS[q.delivery_method]}`}
        </Eyebrow>
        <View
          accessible
          accessibilityLabel={`${moneySpoken(q.amount_received, q.receive_currency)} arrive. ${q.total_cost_pct.toFixed(1)} percent total cost.`}>
          <AppText style={[styles.figure, { color: t.moneyReceived }]}>
            {money(q.amount_received, q.receive_currency)}
          </AppText>
          <AppText style={[styles.lede, { color: t.textSecondary }]}>
            arrives · {money(q.total_cost, q.send_currency)} total cost ({pct(q.total_cost_pct)})
          </AppText>
        </View>
        <CostBreakdownBar quote={q} />
        <View>
          <FreshnessBadge quote={q} />
          {q.basedOn !== null ? (
            <AppText variant="small" muted>
              Estimated from the {money(q.basedOn, q.send_currency).replace('.00', '')} check, with the same fee and
              rate.
            </AppText>
          ) : null}
        </View>
      </View>

      {q.is_promotional ? (
        <View style={[styles.callout, { borderLeftColor: t.primary }]}>
          <AppText style={[styles.calloutText, { color: t.text }]}>
            A first-transfer offer. Later transfers usually cost more, so it’s ranked apart from standing prices.
          </AppText>
        </View>
      ) : null}

      <ListGroup title="Where the money goes">
        <ListFact label="Upfront fee" value={money(q.fee, q.send_currency)} />
        <ListFact
          label="Exchange-rate markup"
          note={`Their rate ${rate(q.offered_rate)} vs. mid-market ${rate(q.mid_market_rate)} ${q.receive_currency} per ${q.send_currency}`}
          value={`${money(markupCost, q.send_currency)} (${pct(q.markup_pct, 2)})`}
        />
        {q.pickup_charge > 0 ? (
          <ListFact
            label="Pickup charge"
            note="Charged where the money is collected"
            value={money(q.pickup_charge / q.mid_market_rate, q.send_currency)}
          />
        ) : null}
        <ListFact
          strong
          label="Total cost"
          // The yardstick the website uses everywhere: the UN's 3% goal (SDG 10.c).
          note={
            q.total_cost_pct <= FIGURES.targetPct
              ? `Within the UN’s ${FIGURES.targetPct}% target for 2030`
              : `Over the UN’s ${FIGURES.targetPct}% target for 2030`
          }
          value={`${money(q.total_cost, q.send_currency)} (${pct(q.total_cost_pct, 2)})`}
        />
      </ListGroup>
      <TextLink
        label="What’s an exchange-rate markup?"
        onPress={() => router.push({ pathname: '/glossary', params: { term: 'exchange-rate-markup' } })}
      />

      <ListGroup title="Delivery">
        <ListFact label="Arrives" value={q.delivery_time ?? 'Not stated'} />
        <ListFact label="How it arrives" value={DELIVERY_LABELS[q.delivery_method]} />
        <ListFact label="How you pay" value={PAYMENT_LABELS[q.payment_method] ?? q.payment_method} />
        <ListFact label="Mid-market rate from" value={q.mid_market_source} />
      </ListGroup>

      <ListGroup title="Recent prices">
        {points === null && history?.id !== id ? <ActivityIndicator style={styles.loading} /> : null}
        {points && points.length >= 2 ? (
          <View style={styles.chart}>
            <LineChart
              height={120}
              points={points.map((p) => ({ date: p.date, value: p.amountReceived }))}
              unit={`${q.receive_currency} arriving from ${money(q.basedOn ?? q.send_amount, q.send_currency).replace('.00', '')}`}
              format={(n) => money(n, q.receive_currency)}
            />
          </View>
        ) : null}
        {points && points.length < 2 ? (
          <AppText style={[styles.note, { color: t.textSecondary }]}>
            One check so far. The line fills in as {q.provider_name} is checked on more days.
          </AppText>
        ) : null}
        {history?.id === id && history.value === 'error' ? (
          <AppText style={[styles.note, { color: t.textSecondary }]}>Recent prices didn’t load.</AppText>
        ) : null}
      </ListGroup>

      <ListGroup>
        <ListRow
          title="Is this rate fair?"
          subtitle="See what the mid-market rate would give you"
          onPress={() =>
            router.push({
              pathname: '/fair-rate',
              params: {
                amount: String(q.send_amount),
                from: q.send_currency,
                to: q.receive_currency,
                markup: String(Math.max(0, Math.round(q.markup_pct * 10) / 10)),
              },
            })
          }
        />
        <ListRow title="This price looks wrong" subtitle={`Tell us, and we’ll check it again`} onPress={report} />
      </ListGroup>

      <DoesNotTellYou items={LIMITS} />
    </ScrollView>
  );
}

const rate = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: n >= 100 ? 2 : 4 });

const styles = StyleSheet.create({
  fill: { flex: 1 },
  loading: { marginVertical: Spacing.four },
  content: { padding: Spacing.three, gap: Spacing.five, paddingBottom: Spacing.six },
  head: { gap: Spacing.three },
  figure: { fontFamily: Fonts.extrabold, fontSize: 40, lineHeight: 46, letterSpacing: -0.8, fontVariant: ['tabular-nums'] },
  lede: { fontSize: 16, lineHeight: 23 },
  callout: { borderLeftWidth: 3, paddingLeft: Spacing.three, paddingVertical: Spacing.one },
  calloutText: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 23 },
  chart: { paddingTop: Spacing.three },
  note: { paddingVertical: Spacing.three, fontSize: 15, lineHeight: 21 },
});
