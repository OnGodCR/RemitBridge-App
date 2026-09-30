import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { receiptCost, taxCheck, valuesFrom, type ConfirmResponse } from '@remitbridge/receipt';

import { Answer, Breakdown, Section, SourceNote } from '@/components/tool';
import { AppText, Button, TextLink } from '@/components/ui';
import { FIGURES } from '@/constants/figures';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { dayIn, useCopy, useLanguage } from '@/i18n';
import { money, pct } from '@/lib/format';
import { openCompare } from '@/lib/open-compare';
import { formatValue, fundingWord } from '@/lib/receipt-format';
import { ROUTES, type DeliveryMethod } from '@/lib/routes';

/**
 * The scan result (Phase 3, item 2), in four parts:
 *   - the true cost, with TrueCost's own Answer and Breakdown and the one formula;
 *   - advertised vs. paid: the provider's published rate that day, or plainly why not;
 *   - the federal remittance tax check, in neutral words;
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

      {/* 2. Advertised vs. paid */}
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

      {/* 3. The tax check */}
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

      {/* 4. Next time */}
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
    </>
  );
}

const styles = StyleSheet.create({
  rule: { borderLeftWidth: 3, paddingLeft: Spacing.three, gap: Spacing.one },
});
