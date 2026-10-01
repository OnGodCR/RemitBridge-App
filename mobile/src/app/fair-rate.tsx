import { computeTransferCost } from '@remitbridge/formula';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { FairRateArt } from '@/components/illustrations';
import { CurrencySelect } from '@/components/select-field';
import { Answer, Breakdown, cleanNumber, Field, Fields, Section, Slider, SourceNote, ToolScreen } from '@/components/tool';
import { AppText } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { dayIn, useCopy, useLanguage } from '@/i18n';
import { CURRENCIES } from '@/lib/currencies';
import { money, pct } from '@/lib/format';
import { useMidRate } from '@/lib/fx';
import { track } from '@/lib/track';

/**
 * Fair rate (ported from the website's /fair-rate, DECISIONS.md D58). Works forwards from
 * a quote: here's the mid-market rate now, what your amount would be at it, and what each
 * point of markup takes. The slider is the lesson: watch the amount fall as markup climbs.
 * The arithmetic is the shared formula with no fee, so it can't disagree with Compare.
 */

export default function FairRateScreen() {
  const t = useTheme();
  const copy = useCopy();
  const f = copy.fairRate;
  const { language } = useLanguage();
  // Opened from a quote's detail, it starts on that quote (PRD 5.7: "linked from quote
  // detail"); otherwise on the website's example.
  const p = useLocalSearchParams<{ amount?: string; from?: string; to?: string; markup?: string }>();
  const [amount, setAmount] = useState(() => cleanNumber(p.amount ?? '') || '200');
  const [from, setFrom] = useState(() => knownCurrency(p.from) ?? 'USD');
  const [to, setTo] = useState(() => knownCurrency(p.to) ?? 'MXN');
  const [markup, setMarkup] = useState(() => {
    const m = Number(p.markup);
    return Number.isFinite(m) && m >= 0 && m <= 10 ? m : 3;
  });
  const fx = useMidRate(from, to);

  useEffect(() => track('tool_opened', { tool: 'fair_rate' }), []);

  const amt = Number(amount);
  const ready = fx.state === 'ready' && amt > 0;
  const atMid = ready ? amt * fx.rate : 0;
  const cost = ready
    ? computeTransferCost({ sent: amt, fee: 0, quotedRate: fx.rate * (1 - markup / 100), midRate: fx.rate })
    : null;

  return (
    <ToolScreen intro={f.intro} art={<FairRateArt />}>
      <Section title={f.yourTransfer}>
        <Fields>
          <Field label={f.amountToSend} unit={from} value={amount} onChange={setAmount} last />
        </Fields>
        <View style={styles.pair}>
          <CurrencySelect label={copy.common.from} value={from} onChange={setFrom} />
          <CurrencySelect label={copy.common.to} value={to} onChange={setTo} />
        </View>
      </Section>

      <Section title={f.markup}>
        <View style={[styles.sliderCard, { backgroundColor: t.card, borderColor: t.border }]}>
          <View style={styles.sliderHead}>
            <AppText muted variant="small" style={styles.flex}>
              {f.drag}
            </AppText>
            <AppText variant="heading" style={{ color: t.primary }}>
              {pct(markup)}
            </AppText>
          </View>
          <Slider
            label={f.markup}
            value={markup}
            min={0}
            max={10}
            step={0.1}
            onChange={setMarkup}
            format={(v) => copy.tool.sliderValue(v.toFixed(1))}
          />
        </View>
      </Section>

      {fx.state === 'loading' ? <ActivityIndicator /> : null}
      {fx.state === 'error' ? (
        <AppText muted>{f.rateFailed}</AppText>
      ) : null}

      {ready && cost ? (
        <>
          <Answer
            label={f.theyReceive(pct(markup))}
            value={money(cost.amountReceived, to)}
            note={f.atMid(money(atMid, to))}
          />
          <Breakdown
            rows={[
              { label: f.midRate, value: `1 ${from} = ${fx.rate.toLocaleString('en-US', { maximumFractionDigits: 4 })} ${to}` },
              { label: f.withMarkup, value: `${(fx.rate * (1 - markup / 100)).toLocaleString('en-US', { maximumFractionDigits: 4 })} ${to}` },
              { label: f.lost, value: money(cost.shortfall, to), tone: t.moneyMarkup },
              { label: f.worth, value: money(cost.markupCost, from), strong: true },
            ]}
          />
          <SourceNote>
            {f.source(fx.source, dayIn(language, fx.date))}
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

function knownCurrency(code?: string): string | undefined {
  return CURRENCIES.find((c) => c.code === code)?.code;
}
