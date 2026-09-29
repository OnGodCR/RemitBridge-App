import { computeTransferCost } from '@remitbridge/formula';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CurrencySelect } from '@/components/select-field';
import { Answer, Breakdown, Field, Fields, Section, Slider, SourceNote, ToolScreen } from '@/components/tool';
import { AppText } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { money, pct } from '@/lib/format';
import { formatDay, useMidRate } from '@/lib/fx';
import { track } from '@/lib/track';

/**
 * Fair rate (ported from the website's /fair-rate, DECISIONS.md D58). Works forwards from
 * a quote: here's the mid-market rate now, what your amount would be at it, and what each
 * point of markup takes. The slider is the lesson: watch the amount fall as markup climbs.
 * The arithmetic is the shared formula with no fee, so it can't disagree with Compare.
 */

export default function FairRateScreen() {
  const t = useTheme();
  const [amount, setAmount] = useState('200');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('MXN');
  const [markup, setMarkup] = useState(3);
  const fx = useMidRate(from, to);

  useEffect(() => track('tool_opened', { tool: 'fair_rate' }), []);

  const amt = Number(amount);
  const ready = fx.state === 'ready' && amt > 0;
  const atMid = ready ? amt * fx.rate : 0;
  const cost = ready
    ? computeTransferCost({ sent: amt, fee: 0, quotedRate: fx.rate * (1 - markup / 100), midRate: fx.rate })
    : null;

  return (
    <ToolScreen intro="The mid-market rate is the honest yardstick. Every point a quote sits below it comes out of your transfer.">
      <Section title="Your transfer">
        <Fields>
          <Field label="Amount to send" unit={from} value={amount} onChange={setAmount} last />
        </Fields>
        <View style={styles.pair}>
          <CurrencySelect label="From" value={from} onChange={setFrom} />
          <CurrencySelect label="To" value={to} onChange={setTo} />
        </View>
      </Section>

      <Section title="Exchange-rate markup">
        <View style={[styles.sliderCard, { backgroundColor: t.card, borderColor: t.border }]}>
          <View style={styles.sliderHead}>
            <AppText muted variant="small" style={styles.flex}>
              Drag to see what each point costs. Fees come on top.
            </AppText>
            <AppText variant="heading" style={{ color: t.primary }}>
              {pct(markup)}
            </AppText>
          </View>
          <Slider
            label="Exchange-rate markup"
            value={markup}
            min={0}
            max={10}
            step={0.1}
            onChange={setMarkup}
            format={(v) => `${v.toFixed(1)} percent`}
          />
        </View>
      </Section>

      {fx.state === 'loading' ? <ActivityIndicator /> : null}
      {fx.state === 'error' ? (
        <AppText muted>Couldn’t get the mid-market rate. Check your connection and try again.</AppText>
      ) : null}

      {ready && cost ? (
        <>
          <Answer
            label={`With a ${pct(markup)} markup, they’d receive`}
            value={money(cost.amountReceived, to)}
            note={`At the mid-market rate: ${money(atMid, to)}`}
          />
          <Breakdown
            rows={[
              { label: 'Mid-market rate', value: `1 ${from} = ${fx.rate.toLocaleString('en-US', { maximumFractionDigits: 4 })} ${to}` },
              { label: 'Rate with this markup', value: `${(fx.rate * (1 - markup / 100)).toLocaleString('en-US', { maximumFractionDigits: 4 })} ${to}` },
              { label: 'Lost to the markup', value: money(cost.shortfall, to), tone: t.moneyMarkup },
              { label: 'Worth, in what you sent', value: money(cost.markupCost, from), strong: true },
            ]}
          />
          <SourceNote>
            Mid-market rate from {fx.source}, for {formatDay(fx.date)}. It’s a daily reference, not a live
            rate, and no provider offers it exactly.
          </SourceNote>
        </>
      ) : null}
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pair: { flexDirection: 'row', gap: Spacing.two },
  sliderCard: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.three, gap: Spacing.two },
  sliderHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
});
