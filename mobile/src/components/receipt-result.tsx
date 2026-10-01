import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { receiptCost, taxCheck, valuesFrom, type ConfirmResponse } from '@remitbridge/receipt';

import { DoesNotTellYou } from '@/components/does-not-tell-you';
import { Answer, Breakdown, Section, SourceNote } from '@/components/tool';
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
 * The scan result (Phase 3, item 2; Phase 6), in six parts:
 *   - the true cost, with TrueCost's own Answer and Breakdown and the one formula;
 *   - what you could have kept: the cheapest way we had prices for (D119);
 *   - advertised vs. paid: the provider's published rate that day, or plainly why not;
 *   - the federal remittance tax check, in neutral words;
 *   - the standard disclosures not found on the receipt (D95), never as a finding;
 *   - next time: Compare, opened on the same route and amount.
 */
export function ReceiptResult({ confirmed }: { confirmed: ConfirmResponse }) {
  const t = useTheme();
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

  return (
    <>
      {/* 1. True cost */}
      {cost ? (
        <>
          <Answer label={s.title} value={money(cost.totalCost, from)} note={s.costNote(pct(cost.totalCostPct, 2), FIGURES.globalCostPct, FIGURES.targetPct)} />
          <Breakdown
            rows={[
              { label: s.fee, value: money(cost.feeCost, from), tone: t.moneyFee },
              ...(cost.taxCost > 0 ? [{ label: s.tax, value: money(cost.taxCost, from), tone: t.moneyFee }] : []),
              { label: s.markup(pct(cost.markupPct, 2)), value: money(cost.markupCost, from), tone: t.moneyMarkup },
              ...(cost.pickupCost > 0 ? [{ label: s.pickup, value: money(cost.pickupCost, from), tone: t.moneyPickup }] : []),
              { label: s.received, value: money(cost.amountReceived, to), strong: true },
              { label: s.benchmark, value: money(cost.benchmarkReceived, to) },
            ]}
          />
          {cost.markupPct < 0 ? (
            <AppText variant="small" muted>
              {s.betterThanMid}
            </AppText>
          ) : null}
          <SourceNote>{s.source(mid!.source, rate(mid!.rate), dayIn(language, mid!.date))}</SourceNote>
        </>
      ) : (
        <AppText muted>{mid ? s.missing : s.noMid}</AppText>
      )}

      {/* 2. What you could have kept (D119) */}
      <Section title={s.keptTitle}>
        <BestOptionView best={confirmed.best} from={from} to={to} transferDate={v.transfer_date} />
      </Section>

      {/* 3. Advertised vs. paid */}
      <Section title={s.advertisedTitle}>
        {quote && gap ? (
          <View style={[styles.rule, { borderLeftColor: t.primary }]}>
            <AppText>
              {s.advertised(
                dayIn(language, v.transfer_date!),
                v.provider ?? '',
                rate(gap.advertisedRate),
                money(quote.send_amount, from).replace('.00', ''),
                new Date(quote.captured_at).toLocaleString(language.locale, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
              )}
            </AppText>
            <AppText>{s.yourRate(rate(gap.receiptRate))}</AppText>
            <AppText variant="label">
              {gap.gapAmount > 0 ? s.gapMore(money(gap.gapAmount, from)) : gap.gapAmount < 0 ? s.gapLess(money(-gap.gapAmount, from)) : s.gapSame}
            </AppText>
          </View>
        ) : (
          <AppText muted>
            {reason === 'not_tracked' ? s.notTracked : reason === 'no_route' ? s.noRoute : reason === 'missing_values' ? s.missingValues : s.noQuote}
          </AppText>
        )}
      </Section>

      {/* 4. The tax check */}
      <Section title={s.taxTitle}>
        <AppText muted>{s.taxRule}</AppText>
        <AppText>{taxText()}</AppText>
        {tax.bankEquivalent && cost ? (
          <AppText>{s.taxBank(money(tax.bankEquivalent.totalCost, from), money(cost.totalCost - tax.bankEquivalent.totalCost, from))}</AppText>
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
            <AppText>{s.disclosuresMissing(confirmed.disclosures_missing.map((d) => s.disclosureItems[d] ?? d).join(', '))}</AppText>
            <AppText variant="small" muted>
              {s.disclosuresNote}
            </AppText>
          </>
        ) : (
          <AppText muted>{s.disclosuresAll}</AppText>
        )}
      </Section>

      {/* 6. Next time */}
      <Section title={s.nextTitle}>
        {route ? (
          <Button
            label={s.compare}
            variant="secondary"
            onPress={() =>
              openCompare({
                routeId: route.id,
                amount: v.amount_sent,
                method: route.deliveryMethods.includes(v.delivery_method as DeliveryMethod) ? (v.delivery_method as DeliveryMethod) : undefined,
              })
            }
          />
        ) : (
          <>
            <AppText muted>{s.notCovered}</AppText>
            <TextLink label={s.routeBoard} onPress={() => router.push('/routes')} />
          </>
        )}
      </Section>

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
          <AppText>{s.keptCosts(b.provider_name, money(b.total_cost, from), money(b.your_total_cost, from))}</AppText>
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
  kept: { borderLeftWidth: 4, borderRadius: 12, padding: Spacing.three, gap: Spacing.one },
  keptValue: { fontFamily: Fonts.extrabold, fontSize: 34, lineHeight: 40, fontVariant: ['tabular-nums'] },
  rule: { borderLeftWidth: 3, paddingLeft: Spacing.three, gap: Spacing.one },
});
