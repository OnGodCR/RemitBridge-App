import { Pressable, StyleSheet, View } from 'react-native';

import { Arrow } from '@/components/list-row';
import { AppText, Card } from '@/components/ui';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCopy, useLanguage } from '@/i18n';
import { money, moneySpoken } from '@/lib/format';
import type { LatestQuote, ShownQuote } from '@/lib/quotes';
import { GrowIn } from '@/components/motion-views';



/**
 * A compact provider quote: the amount received, then the total cost in dollars, and
 * "Estimated from the $X check" when the amount sits between checked amounts. Tap for details.
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
  const copy = useCopy();
  const q = quote;
  const estimate = q.basedOn !== null ? copy.quote.estimatedFrom(money(q.basedOn, q.send_currency).replace('.00', '')) : null;
  const spoken = `${moneySpoken(q.amount_received, q.receive_currency)} ${copy.quote.arrives}, ${moneySpoken(q.total_cost, q.send_currency)} ${copy.quote.cost}${estimate ? `. ${estimate}` : ''}`;
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
        accessibilityLabel={spoken}>
        <AppText variant="figure" style={{ color: t.moneyReceived }}>
          {money(q.amount_received, q.receive_currency)}
        </AppText>
        <View style={styles.costRow}>
          <View style={styles.flex}>
            <AppText muted>
              {copy.quote.arrives} · {money(q.total_cost, q.send_currency)} {copy.quote.cost}
            </AppText>
            {estimate ? (
              <AppText variant="small" muted>
                {estimate}
              </AppText>
            ) : null}
          </View>
          {onPress ? <Arrow /> : null}
        </View>
      </View>
    </Card>
  );
  if (!onPress) return card;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${q.provider_name}. ${spoken}.${highlight ? ` ${highlight}.` : ''}`}
      accessibilityHint={copy.quote.opensDetail}
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
  const copy = useCopy();
  const markupCost = Math.max(0, q.total_cost - q.fee - q.pickup_charge / q.mid_market_rate);
  const pickupCost = q.pickup_charge / q.mid_market_rate;
  // What's left of the amount sent, so the segments always add up to it, even when a live
  // rate beats the daily reference rate and the markup is below zero.
  const received = Math.max(0, q.send_amount - q.fee - markupCost - pickupCost);
  // `amount`, not `value`: Reanimated's Babel plugin warns about any `x.value` inside an
  // inline style, taking it for a shared value, and this bar renders once per quote.
  const parts = [
    { key: 'received', label: copy.quote.arrived, amount: received, color: t.moneyReceived },
    { key: 'fee', label: copy.quote.fee, amount: q.fee, color: t.moneyFee },
    { key: 'markup', label: copy.quote.markup, amount: markupCost, color: t.moneyMarkup },
    { key: 'pickup', label: copy.quote.pickup, amount: pickupCost, color: t.moneyPickup },
  ].filter((p) => p.amount > 0);

  return (
    <View
      accessible
      accessibilityLabel={copy.quote.whereMoneyWent(
        parts.map((p) => `${p.label} ${moneySpoken(p.amount, q.send_currency)}`).join(', '),
      )}>
      <View style={[styles.bar, { backgroundColor: t.muted }]}>
        <GrowIn style={styles.barParts}>
          {parts.map((p) => (
            <View key={p.key} style={{ flex: p.amount, backgroundColor: p.color }} />
          ))}
        </GrowIn>
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

/** Collection date, time and source, shown after opening a quote. */
export function FreshnessBadge({ quote, showSource = true }: { quote: LatestQuote; showSource?: boolean }) {
  const t = useTheme();
  const copy = useCopy();
  const { language } = useLanguage();
  const checked = copy.time.checked(new Date(quote.captured_at).toLocaleString(language.locale));
  const source = copy.quote.sources[quote.source] ?? quote.source;
  return (
    <AppText
      variant="small"
      style={{ color: t.textSecondary }}
      accessibilityLabel={copy.quote.spokenFreshness(false, checked, source, quote.mid_market_source)}>
      {showSource ? `${checked} · ${source}` : checked}
    </AppText>
  );
}

const styles = StyleSheet.create({
  featured: { borderLeftWidth: 4 },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  flex: { flex: 1, gap: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  tag: { fontFamily: Fonts.semibold },
  bar: { height: 8, borderRadius: Radius.sm, overflow: 'hidden' },
  barParts: { flex: 1, flexDirection: 'row', gap: 1 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, marginTop: Spacing.two },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  dot: { width: 8, height: 8, borderRadius: 2 },
});
