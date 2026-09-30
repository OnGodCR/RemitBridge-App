import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { receiptCost, taxCheck, valuesFrom, type ConfirmResponse } from '@remitbridge/receipt';

import { Answer, Breakdown, Section, SourceNote } from '@/components/tool';
import { AppText, Button, TextLink } from '@/components/ui';
import { FIGURES } from '@/constants/figures';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fill, useLanguage, useStrings } from '@/i18n';
import { money, pct } from '@/lib/format';
import { formatDay } from '@/lib/fx';
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
  const strings = useStrings();
  const language = useLanguage();
  const s = strings.result;
  const v = valuesFrom(confirmed.fields);
  const from = v.send_currency ?? 'USD';
  const to = v.receive_currency ?? '';
  const mid = confirmed.mid;
  const cost = mid ? receiptCost(v, mid.rate) : null;
  const tax = taxCheck(v, mid?.rate ?? null);
  const route = ROUTES.find((r) => r.id === confirmed.route_id);
  const rate = (x: number) => x.toLocaleString('en-US', { maximumFractionDigits: 6 });

  return (
    <>
      {/* 1. True cost */}
      {cost ? (
        <>
          <Answer
            label={s.title}
            value={money(cost.totalCost, from)}
            note={fill(s.costNote, { pct: pct(cost.totalCostPct, 2), world: FIGURES.globalCostPct, target: FIGURES.targetPct })}
          />
          <Breakdown
            rows={[
              { label: s.fee, value: money(cost.feeCost, from), tone: t.moneyFee },
              ...(cost.taxCost > 0 ? [{ label: s.tax, value: money(cost.taxCost, from), tone: t.moneyFee }] : []),
              { label: fill(s.markup, { pct: pct(cost.markupPct, 2) }), value: money(cost.markupCost, from), tone: t.moneyMarkup },
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
          <SourceNote>
            {fill(s.source, { source: mid!.source, from, rate: rate(mid!.rate), to, date: formatDay(mid!.date) })}
          </SourceNote>
        </>
      ) : (
        <AppText muted>{mid ? s.missing : s.noMid}</AppText>
      )}

      {/* 2. Advertised vs. paid */}
      <Section title={s.advertisedTitle}>
        {confirmed.comparison.quote && confirmed.comparison.gap ? (
          <View style={[styles.rule, { borderLeftColor: t.primary }]}>
            <AppText>
              {fill(s.advertised, {
                date: formatDay(v.transfer_date!),
                provider: v.provider ?? '',
                from,
                rate: rate(confirmed.comparison.gap.advertisedRate),
                to,
                amount: money(confirmed.comparison.quote.send_amount, from).replace('.00', ''),
                time: new Date(confirmed.comparison.quote.captured_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                }),
              })}
            </AppText>
            <AppText>{fill(s.yourRate, { from, rate: rate(confirmed.comparison.gap.receiptRate), to })}</AppText>
            <AppText variant="label">
              {confirmed.comparison.gap.gapAmount > 0
                ? fill(s.gapMore, { gap: money(confirmed.comparison.gap.gapAmount, from) })
                : confirmed.comparison.gap.gapAmount < 0
                  ? fill(s.gapLess, { gap: money(-confirmed.comparison.gap.gapAmount, from) })
                  : s.gapSame}
            </AppText>
          </View>
        ) : (
          <AppText muted>
            {confirmed.comparison.reason === 'not_tracked'
              ? s.notTracked
              : confirmed.comparison.reason === 'no_route'
                ? s.noRoute
                : confirmed.comparison.reason === 'missing_values'
                  ? s.missingValues
                  : s.noQuote}
          </AppText>
        )}
      </Section>

      {/* 3. The tax check */}
      <Section title={s.taxTitle}>
        <AppText muted>{s.taxRule}</AppText>
        <AppText>
          {(() => {
            const funding = v.funding_method ? fundingWord(v.funding_method, strings, language) : '';
            const amount = v.amount_sent !== undefined ? money(v.amount_sent, from) : '';
            const values = {
              funding,
              amount,
              expected: tax.expected !== null ? money(tax.expected, from) : '',
              found: tax.found !== null ? money(tax.found, from) : '',
            };
            switch (tax.status) {
              case 'matches':
                return fill(s.taxMatches, values);
              case 'not_found':
                return fill(s.taxNotFound, values);
              case 'differs':
                return fill(s.taxDiffers, values);
              case 'not_taxed':
                return fill(s.taxNotTaxed, values);
              case 'before_tax':
                return s.taxBefore;
              default:
                return s.taxUnknown;
            }
          })()}
        </AppText>
        {tax.bankEquivalent && cost ? (
          <AppText>
            {fill(s.taxBank, {
              total: money(tax.bankEquivalent.totalCost, from),
              tax: money(cost.totalCost - tax.bankEquivalent.totalCost, from),
            })}
          </AppText>
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
          v.transfer_date ? formatDay(v.transfer_date) : null,
          v.amount_sent !== undefined ? formatValue('amount_sent', v.amount_sent, v, strings) : null,
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
