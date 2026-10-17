import { FUNDING_METHODS, type FundingMethod } from '@remitbridge/formula';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { Eyebrow } from '@/components/brand';
import { DoesNotTellYou } from '@/components/does-not-tell-you';
import { LineChart } from '@/components/line-chart';
import { ListFact, ListGroup, ListRow } from '@/components/list-row';
import { CostBreakdownBar, FreshnessBadge } from '@/components/quote-card';
import { AppText, TextLink } from '@/components/ui';
import { FIGURES } from '@/constants/figures';
import { Fonts, Spacing } from '@/constants/theme';
import { useGutter } from '@/hooks/use-gutter';
import { useTheme } from '@/hooks/use-theme';
import { countryIn, useCopy } from '@/i18n';
import { money, moneySpoken, pct } from '@/lib/format';
import { writeToUs } from '@/lib/links';
import { atAmount, fetchQuote, fetchQuoteHistory, type HistoryPoint, type LatestQuote } from '@/lib/quotes';
import { DELIVERY_LABELS, ROUTES } from '@/lib/routes';
import { track } from '@/lib/track';



/**
 * Quote detail (PRD 14.7 screen 3): one provider's price in full. The breakdown bar, every
 * figure that goes into the total (each from the one formula, via the engine or atAmount),
 * delivery and payment, promotions, the source and check time, and the provider's recent
 * prices for the same route. Links to Fair rate (PRD 5.7) and to report a wrong price.
 */
export default function QuoteDetail() {
  const t = useTheme();
  const gutter = useGutter();
  const copy = useCopy();
  const { id, amount, funding } = useLocalSearchParams<{ id: string; amount?: string; funding?: string }>();
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
    const pays = (FUNDING_METHODS as readonly string[]).includes(funding ?? '') ? (funding as FundingMethod) : undefined;
    return typed > 0 ? atAmount(loaded, typed, pays) : { ...loaded, basedOn: null, tax: 0 };
  }, [loaded, amount, funding]);

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
        <Stack.Screen options={{ title: copy.titles.quote }} />
        <View style={styles.content}>
          <AppText style={[styles.lede, { color: t.text }]}>
            {loaded === 'error'
              ? copy.quoteDetail.loadFailed
              : copy.quoteDetail.gone}
          </AppText>
        </View>
      </View>
    );
  }

  const q = quote;
  const route = ROUTES.find((r) => r.id === q.route_id);
  // Signed, so the rows add up to the total. A live rate can beat the daily reference rate.
  const markupCost = q.total_cost - q.fee - q.pickup_charge / q.mid_market_rate;
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
    writeToUs(copy, subject, body);
  };

  return (
    <ScrollView
      style={[styles.fill, { backgroundColor: t.background }]}
      contentContainerStyle={[styles.content, { paddingHorizontal: gutter }]}
      contentInsetAdjustmentBehavior="automatic">
      <Stack.Screen options={{ title: q.provider_name }} />
      <StatusBar style="auto" />

      <View style={styles.head}>
        <Eyebrow>
          {copy.quoteDetail.heading(
            money(q.send_amount, q.send_currency).replace('.00', ''),
            countryIn(copy, q.route_id.split('-')[1] ?? q.receive_currency),
            copy.delivery[q.delivery_method],
          )}
        </Eyebrow>
        <View
          accessible
          accessibilityLabel={copy.quote.spokenArrive(moneySpoken(q.amount_received, q.receive_currency), q.total_cost_pct.toFixed(1))}>
          <AppText style={[styles.figure, { color: t.moneyReceived }]}>
            {money(q.amount_received, q.receive_currency)}
          </AppText>
          <AppText style={[styles.lede, { color: t.textSecondary }]}>
            {copy.quoteDetail.totalLine(money(q.total_cost, q.send_currency), pct(q.total_cost_pct))}
          </AppText>
        </View>
        <CostBreakdownBar quote={q} />
        <View>
          <FreshnessBadge quote={q} />
          {q.basedOn !== null ? (
            <AppText variant="small" muted>
              {copy.quoteDetail.estimatedFull(money(q.basedOn, q.send_currency).replace('.00', ''))}
            </AppText>
          ) : null}
        </View>
      </View>

      {q.is_promotional ? (
        <View style={[styles.callout, { borderLeftColor: t.primary }]}>
          <AppText style={[styles.calloutText, { color: t.text }]}>
            {copy.quoteDetail.promo}
          </AppText>
        </View>
      ) : null}

      <ListGroup title={copy.quoteDetail.whereMoneyGoes}>
        <ListFact label={copy.quoteDetail.upfrontFee} value={money(q.fee, q.send_currency)} />
        <ListFact
          label={copy.quoteDetail.markup}
          note={`${copy.quoteDetail.rateNote(
            rate(q.offered_rate),
            rate(q.mid_market_rate),
            copy.trueCost.perOne(q.receive_currency, q.send_currency),
          )}${markupCost < 0 ? `. ${copy.quoteDetail.betterThanMid}` : ''}`}
          value={`${money(markupCost, q.send_currency)} (${pct(q.markup_pct, 2)})`}
        />
        {q.pickup_charge > 0 ? (
          <ListFact
            label={copy.quoteDetail.pickupCharge}
            note={copy.quoteDetail.pickupNote}
            value={money(q.pickup_charge / q.mid_market_rate, q.send_currency)}
          />
        ) : null}
        <ListFact
          strong
          label={copy.quoteDetail.totalCost}
          // The yardstick the website uses everywhere: the UN's 3% goal (SDG 10.c).
          note={
            q.total_cost_pct <= FIGURES.targetPct
              ? copy.quoteDetail.withinTarget(FIGURES.targetPct)
              : copy.quoteDetail.overTarget(FIGURES.targetPct)
          }
          value={`${money(q.total_cost, q.send_currency)} (${pct(q.total_cost_pct, 2)})`}
        />
      </ListGroup>
      <TextLink
        label={copy.quoteDetail.whatsMarkup}
        onPress={() => router.push({ pathname: '/glossary', params: { term: 'exchange-rate-markup' } })}
      />

      <ListGroup title={copy.quoteDetail.delivery}>
        <ListFact label={copy.quoteDetail.arrivesIn} value={q.delivery_time ?? copy.quoteDetail.notStated} />
        <ListFact label={copy.quoteDetail.howArrives} value={copy.delivery[q.delivery_method]} />
        <ListFact label={copy.quoteDetail.howPay} value={copy.payment[q.payment_method] ?? q.payment_method} />
        <ListFact label={copy.quoteDetail.midFrom} value={q.mid_market_source} />
      </ListGroup>

      <ListGroup title={copy.quoteDetail.recent}>
        {points === null && history?.id !== id ? <ActivityIndicator style={styles.loading} /> : null}
        {points && points.length >= 2 ? (
          <View style={styles.chart}>
            <LineChart
              height={120}
              points={points.map((p) => ({ date: p.date, value: p.amountReceived }))}
              unit={copy.quoteDetail.arrivingFrom(
                q.receive_currency,
                money(q.basedOn ?? q.send_amount, q.send_currency).replace('.00', ''),
              )}
              format={(n) => money(n, q.receive_currency)}
            />
          </View>
        ) : null}
        {points && points.length < 2 ? (
          <AppText style={[styles.note, { color: t.textSecondary }]}>
            {copy.quoteDetail.oneCheck(q.provider_name)}
          </AppText>
        ) : null}
        {history?.id === id && history.value === 'error' ? (
          <AppText style={[styles.note, { color: t.textSecondary }]}>{copy.quoteDetail.recentFailed}</AppText>
        ) : null}
      </ListGroup>

      <ListGroup cards>
        <ListRow
          title={copy.quoteDetail.isFair}
          subtitle={copy.quoteDetail.isFairSub}
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
        <ListRow title={copy.quoteDetail.looksWrong} subtitle={copy.quoteDetail.looksWrongSub} onPress={report} />
      </ListGroup>

      <DoesNotTellYou items={copy.quoteDetail.limits} />
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
