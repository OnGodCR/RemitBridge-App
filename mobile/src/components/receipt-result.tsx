import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { receiptCost, taxCheck, valuesFrom, type ConfirmResponse } from '@remitbridge/receipt';

import { DoesNotTellYou } from '@/components/does-not-tell-you';
import { ArrivedBar, Chips, CompareBars, CostScale, RateLine, SplitBar, StatusLine } from '@/components/receipt-charts';
import { Answer, Section, SourceNote } from '@/components/tool';
import { AppText, Button, TextLink } from '@/components/ui';
import { FIGURES } from '@/constants/figures';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { dayIn, useCopy, useLanguage } from '@/i18n';
import { money, pct } from '@/lib/format';
import { openCompare } from '@/lib/open-compare';
import { formatValue, fundingWord } from '@/lib/receipt-format';
import { ROUTES, type DeliveryMethod } from '@/lib/routes';

/**
 * The scan result (Phase 3, item 2; Phase 6; D153). Two answers first, in a few words, for
 * people who won't read a report (Angad, 2026-10-11: "nobody who is using the app will be
 * able to digest these words"): what the transfer cost, with a low, average or high mark,
 * and what they could have saved. Then the two things to do next, Compare and scan
 * another, with the cost's parts and what arrived as two bars between (2026-10-11: two
 * answers alone looked too blank). Everything else waits under "Show the details":
 *   - the true cost: the number, where it sits against the UN target and the world
 *     average, what it was made of, and what arrived of what could have;
 *   - what you could have kept: the cheapest way we had prices for (D119);
 *   - advertised vs. paid: the provider's published rate that day, or plainly why not;
 *   - the federal remittance tax check, in neutral words;
 *   - the standard disclosures not found on the receipt (D95), never as a finding;
 *   - next time: Compare, opened on the same route and amount.
 */
export function ReceiptResult({
  confirmed,
  onAnother,
  footer,
}: {
  confirmed: ConfirmResponse;
  /** Scan another receipt. */
  onAnother: () => void;
  /** Shown at the end of the details (deleting the receipt). */
  footer?: React.ReactNode;
}) {
  const t = useTheme();
  const [details, setDetails] = useState(false);
  const copy = useCopy();
  const { language } = useLanguage();
  const s = copy.result;
  const v = valuesFrom(confirmed.fields);
  const from = v.send_currency ?? 'USD';
  const to = v.receive_currency ?? '';
  const mid = confirmed.mid;
  const cost = mid ? receiptCost(v, mid.rate) : null;
  const tax = taxCheck(v, mid?.rate ?? null);
  const route = ROUTES.find((r) => r.id === confirmed.route_id);
  /** "1 USD = 17.3 MXN": money keeps US formatting in every language (D69). */
  const rate = (x: number) => `1 ${from} = ${x.toLocaleString('en-US', { maximumFractionDigits: 6 })} ${to}`;
  const num = (x: number) => x.toLocaleString('en-US', { maximumFractionDigits: 4 });
  const gap = confirmed.comparison.gap;
  const quote = confirmed.comparison.quote;

  const taxText = () => {
    const funding = v.funding_method ? fundingWord(v.funding_method, copy, language) : '';
    const amount = v.amount_sent !== undefined ? money(v.amount_sent, from) : '';
    const expected = tax.expected !== null ? money(tax.expected, from) : '';
    const found = tax.found !== null ? money(tax.found, from) : '';
    switch (tax.status) {
      case 'matches':
        return s.taxMatches(funding, amount, expected, found);
      case 'not_found':
        return s.taxNotFound(funding, amount, expected);
      case 'differs':
        return s.taxDiffers(funding, amount, expected, found);
      case 'not_taxed':
        return s.taxNotTaxed(funding);
      case 'before_tax':
        return s.taxBefore;
      case 'small_transfer':
        return s.taxSmall;
      default:
        return s.taxUnknown;
    }
  };

  const reason = confirmed.comparison.reason;
  const b = confirmed.best.best;
  const compare = route
    ? () =>
        openCompare({
          routeId: route.id,
          amount: v.amount_sent,
          method: route.deliveryMethods.includes(v.delivery_method as DeliveryMethod) ? (v.delivery_method as DeliveryMethod) : undefined,
        })
    : null;
  // Low at or under the UN target, high above the world average.
  const verdict = cost
    ? cost.totalCostPct <= FIGURES.targetPct
      ? { tone: 'good' as const, text: s.verdictLow(pct(cost.totalCostPct, 1)) }
      : cost.totalCostPct <= FIGURES.globalCostPct
        ? { tone: 'neutral' as const, text: s.verdictAverage(pct(cost.totalCostPct, 1)) }
        : { tone: 'warn' as const, text: s.verdictHigh(pct(cost.totalCostPct, 1)) }
    : null;

  return (
    <>
      {/* The two answers. */}
      {cost && verdict ? (
        <View style={styles.answers}>
          <Answer label={s.costLabel} value={money(cost.totalCost, from)} />
          <StatusLine tone={verdict.tone} text={verdict.text} />
        </View>
      ) : (
        <AppText muted>{mid ? s.missing : s.noMid}</AppText>
      )}
      {b && b.could_keep > 0 ? (
        <View style={[styles.kept, { backgroundColor: t.accent, borderLeftColor: t.primary }]} accessible accessibilityLiveRegion="polite">
          <AppText variant="label" style={{ color: t.accentForeground }}>
            {s.savedLabel(b.provider_name)}
          </AppText>
          <AppText style={[styles.keptValue, { color: t.primary }]}>{money(b.could_keep, from)}</AppText>
        </View>
      ) : b ? (
        <StatusLine tone="good" text={s.bestShort} />
      ) : null}

      {/* Where the cost came from and what arrived, as two bars (Angad, 2026-10-11: two
          answers alone looked too blank). */}
      {cost ? (
        <>
          <Section title={s.costTitle}>
            <SplitBar
              label={[
                [s.fee, cost.feeCost],
                [s.tax, cost.taxCost],
                [s.markup(pct(cost.markupPct, 2)), cost.markupCost],
                [s.pickup, cost.pickupCost],
              ]
                .filter(([, x]) => (x as number) > 0)
                .map(([l, x]) => `${l} ${money(x as number, from)}`)
                .join(', ')}
              parts={[
                { key: 'fee', label: s.fee, amount: cost.feeCost, display: money(cost.feeCost, from), color: t.moneyFee },
                { key: 'tax', label: s.tax, amount: cost.taxCost, display: money(cost.taxCost, from), color: t.textSecondary },
                { key: 'markup', label: s.markup(pct(cost.markupPct, 2)), amount: cost.markupCost, display: money(cost.markupCost, from), color: t.moneyMarkup },
                { key: 'pickup', label: s.pickup, amount: cost.pickupCost, display: money(cost.pickupCost, from), color: t.moneyPickup },
              ]}
            />
            {cost.markupPct < 0 ? (
              <AppText variant="small" muted>
                {s.betterThanMid}
              </AppText>
            ) : null}
          </Section>
          <Section title={s.arrivedTitle}>
            <ArrivedBar
              got={cost.amountReceived}
              possible={cost.benchmarkReceived}
              gotText={s.arrivedGot(money(cost.amountReceived, to), money(cost.benchmarkReceived, to))}
              lostText={s.arrivedLost(money(cost.shortfall, to))}
              label={s.arrivedLabel(money(cost.amountReceived, to), money(cost.benchmarkReceived, to), money(cost.shortfall, to))}
            />
            <SourceNote>{s.source(mid!.source, rate(mid!.rate), dayIn(language, mid!.date))}</SourceNote>
          </Section>
        </>
      ) : null}

      <View style={styles.actions}>
        {compare ? <Button label={s.compare} onPress={compare} /> : null}
        <Button label={copy.scan.another} variant={compare ? 'secondary' : 'primary'} onPress={onAnother} />
      </View>

      <TextLink label={details ? s.hideDetails : s.showDetails} arrow={false} icon={details ? 'chevron.up' : 'chevron.down'} onPress={() => setDetails((d) => !d)} />

      {details ? (
        <>
      {/* 1. Against the world average and the UN target */}
      {cost ? (
        <>
          <CostScale
            you={cost.totalCostPct}
            world={FIGURES.globalCostPct}
            target={FIGURES.targetPct}
            labels={{ you: s.scaleYou(pct(cost.totalCostPct, 1)), world: s.scaleWorld(FIGURES.globalCostPct), target: s.scaleTarget(FIGURES.targetPct) }}
            label={s.scaleLabel(pct(cost.totalCostPct, 2), FIGURES.globalCostPct, FIGURES.targetPct)}
          />
        </>
      ) : null}

      {/* 2. What you could have kept (D119) */}
      <Section title={s.keptTitle}>
        <BestOptionView best={confirmed.best} from={from} to={to} transferDate={v.transfer_date} />
      </Section>

      {/* 3. Advertised vs. paid: three rates on one line. */}
      <Section title={s.advertisedTitle}>
        {quote && gap && mid ? (
          <>
            <RateLine
              label={s.rateLabel(rate(mid.rate), rate(gap.advertisedRate), rate(gap.receiptRate))}
              points={[
                { key: 'mid', name: s.rateMid, value: mid.rate, display: num(mid.rate), color: t.border },
                { key: 'ad', name: s.rateAdvertised(v.provider ?? ''), value: gap.advertisedRate, display: num(gap.advertisedRate), color: t.moneyMarkup },
                { key: 'you', name: s.rateYours, value: gap.receiptRate, display: num(gap.receiptRate), color: t.text, strong: true },
              ]}
            />
            <StatusLine
              tone={gap.gapAmount > 0 ? 'warn' : 'good'}
              text={gap.gapAmount > 0 ? s.gapMore(money(gap.gapAmount, from)) : gap.gapAmount < 0 ? s.gapLess(money(-gap.gapAmount, from)) : s.gapSame}
            />
            <AppText variant="small" muted>
              {s.rateChecked(new Date(quote.captured_at).toLocaleString(language.locale, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }))}
            </AppText>
          </>
        ) : (
          <AppText muted>
            {reason === 'not_tracked' ? s.notTracked : reason === 'no_route' ? s.noRoute : reason === 'missing_values' ? s.missingValues : s.noQuote}
          </AppText>
        )}
      </Section>

      {/* 4. The tax check */}
      <Section title={s.taxTitle}>
        <StatusLine tone={tax.status === 'matches' || tax.status === 'not_taxed' || tax.status === 'small_transfer' || tax.status === 'before_tax' ? 'good' : tax.status === 'differs' || tax.status === 'not_found' ? 'warn' : 'neutral'} text={taxText()} />
        {tax.bankEquivalent && cost ? (
          <CompareBars
            label={s.taxBank(money(tax.bankEquivalent.totalCost, from), money(cost.totalCost - tax.bankEquivalent.totalCost, from))}
            rows={[
              { key: 'paid', name: s.taxPaidBy(v.funding_method ? fundingWord(v.funding_method, copy, language) : ''), value: cost.totalCost, display: money(cost.totalCost, from), color: t.moneyMarkup },
              { key: 'bank', name: s.taxFromBank, value: tax.bankEquivalent.totalCost, display: money(tax.bankEquivalent.totalCost, from), color: t.primary, strong: true },
            ]}
          />
        ) : null}
        {tax.expected !== null ? (
          <AppText variant="small" muted>
            {s.taxAssumption}
          </AppText>
        ) : null}
      </Section>

      {/* 5. Standard disclosures (D95): what wasn't found, and why that isn't a finding. */}
      <Section title={s.disclosuresTitle}>
        {confirmed.disclosures_missing.length ? (
          <>
            <AppText variant="label">{s.notFound}</AppText>
            <Chips icon="xmark" items={confirmed.disclosures_missing.map((d) => s.disclosureItems[d] ?? d)} />
            <AppText variant="small" muted>
              {s.disclosuresNote}
            </AppText>
          </>
        ) : (
          <StatusLine tone="good" text={s.disclosuresAll} />
        )}
      </Section>

      {/* 6. A route we don't check yet: where to ask for it. */}
      {route ? null : (
        <Section title={s.nextTitle}>
          <AppText muted>{s.notCovered}</AppText>
          <TextLink label={s.routeBoard} onPress={() => router.push('/routes')} />
        </Section>
      )}

      {/* What was used, for the record. */}
      <SourceNote>
        {[
          v.provider,
          v.transfer_date ? dayIn(language, v.transfer_date) : null,
          v.amount_sent !== undefined ? formatValue('amount_sent', v.amount_sent, v, copy, language) : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      </SourceNote>
      <DoesNotTellYou items={s.limits} />
      {footer}
        </>
      ) : null}
    </>
  );
}

/**
 * The cheapest way we had prices for to send the same amount, and the difference in true
 * cost. Says which providers were compared, and when the prices are from, every time, so
 * "could have kept" never reads as covering providers or days we don't have.
 */
function BestOptionView({
  best: result,
  from,
  to,
  transferDate,
}: {
  best: ConfirmResponse['best'];
  from: string;
  to: string;
  transferDate: string | undefined;
}) {
  const t = useTheme();
  const copy = useCopy();
  const { language } = useLanguage();
  const s = copy.result;
  if (!result.best) {
    const why = { no_route: s.keptNoRoute, missing_values: s.keptMissing, no_prices: s.keptNoPrices, no_mid: s.keptNoMid }[result.reason];
    return <AppText muted>{why}</AppText>;
  }
  const b = result.best;
  const checked = new Date(b.captured_at).toLocaleString(language.locale, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  const notes = [
    b.when === 'that_day' ? s.keptThatDay(checked) : s.keptToday(transferDate ? dayIn(language, transferDate) : '', checked),
    b.estimated ? s.keptEstimated(money(b.checked_amount, from).replace('.00', '')) : null,
    b.paid_from === 'bank_account' ? s.keptBank : null,
    s.keptCompared(b.providers_compared.join(', ')),
  ].filter((x): x is string => Boolean(x));
  return (
    <>
      {b.could_keep > 0 ? (
        <>
          {/* Mint with a green edge, so it reads apart from the true cost above (D124). */}
          <View style={[styles.kept, { backgroundColor: t.accent, borderLeftColor: t.primary }]} accessible accessibilityLiveRegion="polite">
            <AppText variant="label" style={{ color: t.accentForeground }}>
              {s.keptLabel(b.provider_name)}
            </AppText>
            <AppText style={[styles.keptValue, { color: t.primary }]}>{money(b.could_keep, from)}</AppText>
            <AppText style={{ color: t.accentForeground }}>{s.keptNote(money(b.received, to))}</AppText>
          </View>
          <CompareBars
            label={s.keptBarsLabel(money(b.your_total_cost, from), b.provider_name, money(b.total_cost, from))}
            rows={[
              { key: 'you', name: s.keptYou, value: b.your_total_cost, display: money(b.your_total_cost, from), color: t.moneyMarkup },
              { key: 'best', name: b.provider_name, value: b.total_cost, display: money(b.total_cost, from), color: t.primary, strong: true },
            ]}
          />
        </>
      ) : (
        <View style={[styles.rule, { borderLeftColor: t.primary }]}>
          <AppText>{b.same_provider ? s.keptBest(b.provider_name) : s.keptAsGood}</AppText>
        </View>
      )}
      {notes.map((n) => (
        <AppText key={n} variant="small" muted>
          {n}
        </AppText>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  answers: { gap: Spacing.two },
  actions: { gap: Spacing.two },
  kept: { borderLeftWidth: 4, borderRadius: 12, padding: Spacing.three, gap: Spacing.one },
  keptValue: { fontFamily: Fonts.extrabold, fontSize: 34, lineHeight: 40, fontVariant: ['tabular-nums'] },
  rule: { borderLeftWidth: 3, paddingLeft: Spacing.three, gap: Spacing.one },
});
