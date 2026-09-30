import { Pressable, StyleSheet, View } from 'react-native';

import { Arrow } from '@/components/list-row';
import { AppText, Card } from '@/components/ui';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { checkedAgo, money, moneySpoken, pct } from '@/lib/format';
import type { LatestQuote, ShownQuote } from '@/lib/quotes';

export const SOURCE_LABEL: Record<LatestQuote['source'], string> = {
  scraper: 'Public calculator',
  api: 'Official API',
  manual: 'Checked by hand',
  partner: 'Partner',
};

/**
 * One provider's quote (PRD 14.6): the amount received is the largest text, then total
 * cost, the breakdown, and where the number came from and when.
 */
export function QuoteCard({
  quote,
  highlight,
  featured,
  onPress,
}: {
  quote: ShownQuote;
  highlight?: string;
  /** The top-ranked card: a saturated left edge, the website's mark for "this one counts". */
  featured?: boolean;
  /** Opens the quote's detail (PRD 14.7 screen 3). */
  onPress?: () => void;
}) {
  const t = useTheme();
  const q = quote;
  const card = (
    <Card style={featured ? [styles.featured, { borderLeftColor: t.primary }] : undefined}>
      <View style={styles.header}>
        <AppText variant="heading">{q.provider_name}</AppText>
        {highlight ? (
          <AppText variant="small" style={[styles.tag, { color: t.primary }]}>
            {highlight}
          </AppText>
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

      <View style={styles.footer}>
        <View style={styles.flex}>
          <FreshnessBadge quote={q} />
          {q.basedOn !== null ? (
            <AppText variant="small" muted>
              Estimated from the {money(q.basedOn, q.send_currency).replace('.00', '')} check
            </AppText>
          ) : null}
        </View>
        {onPress ? <Arrow /> : null}
      </View>
    </Card>
  );
  if (!onPress) return card;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${q.provider_name}. ${moneySpoken(q.amount_received, q.receive_currency)} arrive, ${q.total_cost_pct.toFixed(1)} percent total cost.${highlight ? ` ${highlight}.` : ''}`}
      accessibilityHint="Opens the full breakdown"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      {card}
    </Pressable>
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
  // `amount`, not `value`: Reanimated's Babel plugin warns about any `x.value` inside an
  // inline style, taking it for a shared value, and this bar renders once per quote.
  const parts = [
    { key: 'received', label: 'Arrived', amount: received, color: t.moneyReceived },
    { key: 'fee', label: 'Fee', amount: q.fee, color: t.moneyFee },
    { key: 'markup', label: 'Markup', amount: markupCost, color: t.moneyMarkup },
    { key: 'pickup', label: 'Pickup', amount: pickupCost, color: t.moneyPickup },
  ].filter((p) => p.amount > 0);

  return (
    <View
      accessible
      accessibilityLabel={
        'Where the money went: ' +
        parts.map((p) => `${p.label} ${moneySpoken(p.amount, q.send_currency)}`).join(', ')
      }>
      <View style={[styles.bar, { backgroundColor: t.muted }]}>
        {parts.map((p) => (
          <View key={p.key} style={{ flex: p.amount, backgroundColor: p.color }} />
        ))}
      </View>
      <View style={styles.legend}>
        {parts.map((p) => (
          <View key={p.key} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: p.color }]} />
            <AppText variant="small" muted>
              {p.label} {money(p.amount, q.send_currency)}
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
  featured: { borderLeftWidth: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  flex: { flex: 1, gap: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  tag: { fontFamily: Fonts.semibold },
  bar: { height: 8, borderRadius: Radius.sm, overflow: 'hidden', flexDirection: 'row', gap: 1 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, marginTop: Spacing.two },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  dot: { width: 8, height: 8, borderRadius: 2 },
});
