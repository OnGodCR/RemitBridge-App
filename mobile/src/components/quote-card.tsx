import { StyleSheet, View } from 'react-native';

import { AppText, Card } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { checkedAgo, money, moneySpoken, pct } from '@/lib/format';
import type { LatestQuote, ShownQuote } from '@/lib/quotes';

const SOURCE_LABEL: Record<LatestQuote['source'], string> = {
  scraper: 'Public calculator',
  api: 'Official API',
  manual: 'Checked by hand',
  partner: 'Partner',
};

/**
 * One provider's quote (PRD 14.6): the amount received is the largest text, then total
 * cost, the breakdown, and where the number came from and when.
 */
export function QuoteCard({ quote, highlight }: { quote: ShownQuote; highlight?: string }) {
  const t = useTheme();
  const q = quote;
  return (
    <Card>
      <View style={styles.header}>
        <AppText variant="heading">{q.provider_name}</AppText>
        {highlight ? (
          <View style={[styles.tag, { backgroundColor: t.accent }]}>
            <AppText variant="label" style={{ color: t.accentForeground }}>
              {highlight}
            </AppText>
          </View>
        ) : null}
      </View>

      <View
        accessible
        accessibilityLabel={`${moneySpoken(q.amount_received, q.receive_currency)} arrive, ${q.total_cost_pct.toFixed(1)} percent total cost`}>
        <AppText variant="figure" style={{ color: t.moneyReceived }}>
          {money(q.amount_received, q.receive_currency)}
        </AppText>
        <AppText muted>
          arrives · {pct(q.total_cost_pct)} cost{q.delivery_time ? ` · ${q.delivery_time}` : ''}
        </AppText>
      </View>

      <CostBreakdownBar quote={q} />

      <FreshnessBadge quote={q} />
      {q.basedOn !== null ? (
        <AppText variant="small" muted>
          Estimated from the {money(q.basedOn, q.send_currency).replace('.00', '')} check
        </AppText>
      ) : null}
    </Card>
  );
}

/**
 * "Where your money went" (PRD 5.2): the amount sent, split into what arrived, the fee,
 * the markup and any pickup charge, all in the sending currency. Every segment carries a
 * text label, so colour is never the only signal (PRD 14.5).
 */
export function CostBreakdownBar({ quote: q }: { quote: LatestQuote }) {
  const t = useTheme();
  const markupCost = Math.max(0, q.total_cost - q.fee - q.pickup_charge / q.mid_market_rate);
  const pickupCost = q.pickup_charge / q.mid_market_rate;
  const received = Math.max(0, q.send_amount - q.total_cost);
  const parts = [
    { key: 'received', label: 'Arrived', value: received, color: t.moneyReceived },
    { key: 'fee', label: 'Fee', value: q.fee, color: t.moneyFee },
    { key: 'markup', label: 'Markup', value: markupCost, color: t.moneyMarkup },
    { key: 'pickup', label: 'Pickup', value: pickupCost, color: t.moneyPickup },
  ].filter((p) => p.value > 0);

  return (
    <View
      accessible
      accessibilityLabel={
        'Where the money went: ' +
        parts.map((p) => `${p.label} ${moneySpoken(p.value, q.send_currency)}`).join(', ')
      }>
      <View style={[styles.bar, { backgroundColor: t.muted }]}>
        {parts.map((p) => (
          <View key={p.key} style={{ flex: p.value, backgroundColor: p.color }} />
        ))}
      </View>
      <View style={styles.legend}>
        {parts.map((p) => (
          <View key={p.key} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: p.color }]} />
            <AppText variant="small" muted>
              {p.label} {money(p.value, q.send_currency)}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * "Checked 3h ago · Public calculator" (PRD 14.6): freshness and source in one line.
 * Stale gets a word, never colour alone. The mid-market source is in the accessibility
 * label and on How it works.
 */
export function FreshnessBadge({ quote }: { quote: LatestQuote }) {
  const t = useTheme();
  return (
    <AppText
      variant="small"
      style={{ color: quote.is_stale ? t.stale : t.textSecondary }}
      accessibilityLabel={`${quote.is_stale ? 'Stale. ' : ''}${checkedAgo(quote.captured_at)}. Source: ${SOURCE_LABEL[quote.source]}. Mid-market rate from ${quote.mid_market_source}.`}>
      {quote.is_stale ? 'Stale · ' : ''}
      {checkedAgo(quote.captured_at)} · {SOURCE_LABEL[quote.source]}
    </AppText>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  tag: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.half, borderRadius: Radius.pill },
  bar: { height: 12, borderRadius: Radius.pill, overflow: 'hidden', flexDirection: 'row' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, marginTop: Spacing.two },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
