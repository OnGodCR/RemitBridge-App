import { computeTransferCost } from '@remitbridge/formula';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CurrencySelect } from '@/components/select-field';
import { Answer, Breakdown, Field, Fields, Section, SourceNote, ToolScreen } from '@/components/tool';
import { AppText, Button, TextLink } from '@/components/ui';
import { FIGURES } from '@/constants/figures';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { dayIn, useCopy, useLanguage } from '@/i18n';
import { announce } from '@/lib/announce';
import { useAuth } from '@/lib/auth';
import { money, pct } from '@/lib/format';
import { isoDay, today, useMidRate } from '@/lib/fx';
import { openCompare } from '@/lib/open-compare';
import { ROUTES } from '@/lib/routes';
import { saveCheck } from '@/lib/saved';
import { track } from '@/lib/track';

/**
 * TrueCost (the website's /truecost receipt checker, DECISIONS.md D58). Works backwards
 * from a receipt: what you sent, the fee, and the rate you were given, against the
 * mid-market rate for that day. Uses the one formula (packages/formula), which is pinned
 * to the website's computeReceipt by shared test vectors, so the site and the app agree
 * on every receipt. Signed-in users can save a check to their account.
 */

/** "9/28/2026" or "09/28/2026" to "2026-09-28"; null if it isn't a real past-or-today date. */
function parseDate(text: string): string | null {
  const m = text.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]));
  if (d.getMonth() !== Number(m[1]) - 1 || d.getDate() !== Number(m[2])) return null;
  const day = isoDay(d);
  return day <= today() && day >= '2000-01-01' ? day : null;
}

export default function TrueCostScreen() {
  const t = useTheme();
  const copy = useCopy();
  const c = copy.trueCost;
  const { language } = useLanguage();
  const { session } = useAuth();
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('MXN');
  const [sent, setSent] = useState('200');
  const [fee, setFee] = useState('');
  const [rate, setRate] = useState('');
  const [pickup, setPickup] = useState('');
  const [dateText, setDateText] = useState('');
  const [provider, setProvider] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => track('tool_opened', { tool: 'true_cost' }), []);

  const date = dateText.trim() ? parseDate(dateText) : today();
  const fx = useMidRate(from, to, date ?? undefined);

  const S = Number(sent);
  const compareRoute = ROUTES.find((r) => r.sendCurrency === from && r.receiveCurrency === to);
  const F = Number(fee) || 0;
  const Q = Number(rate);
  const R = Number(pickup) || 0;
  const inputsOk = S > 0 && Q > 0 && F >= 0 && F < S;
  const cost =
    inputsOk && fx.state === 'ready'
      ? computeTransferCost({ sent: S, fee: F, quotedRate: Q, midRate: fx.rate, pickupCharge: R })
      : null;

  const save = async () => {
    if (!cost || fx.state !== 'ready') return;
    setSaving(true);
    const error = await saveCheck({
      provider_name: provider.trim() || c.notNamed,
      send_currency: from,
      receive_currency: to,
      sent: S,
      fee: F,
      quoted_rate: Q,
      mid_rate: fx.rate,
      mid_rate_source: `${fx.source}, ${fx.date}`,
      pickup_charge: R,
      sent_on: date ?? today(),
    });
    setSaving(false);
    if (error) {
      setMessage({ ok: false, text: c.errors[error] });
      announce(c.errors[error]);
      return;
    }
    track('check_saved', { from, to });
    setMessage({ ok: true, text: c.savedToAccount });
    announce(c.savedToAccount);
  };

  return (
    <ToolScreen intro={c.intro}>
      <Section title={c.currencies}>
        <View style={styles.pair}>
          <CurrencySelect label={c.sent} value={from} onChange={setFrom} />
          <CurrencySelect label={c.received} value={to} onChange={setTo} />
        </View>
      </Section>

      <Section title={c.fromReceipt}>
        <Fields>
          <Field label={c.amountSent} hint={c.beforeFee} unit={from} value={sent} onChange={setSent} />
          <Field label={c.fee} hint={c.feeHint} unit={from} value={fee} onChange={setFee} />
          <Field
            label={c.rateYouGot}
            hint={c.perOne(to, from)}
            unit={to}
            value={rate}
            onChange={setRate}
            decimals={6}
          />
          <Field label={c.pickup} hint={c.pickupHint} unit={to} value={pickup} onChange={setPickup} />
          <Field
            label={c.dateSent}
            hint={c.dateHint}
            value={dateText}
            onChange={setDateText}
            placeholder={c.datePlaceholder}
            keyboardType="numbers-and-punctuation"
            last
          />
        </Fields>
        {dateText.trim() && !date ? (
          <AppText variant="small" style={{ color: t.destructive }}>
            {c.badDate}
          </AppText>
        ) : null}
        {F >= S && S > 0 ? (
          <AppText variant="small" style={{ color: t.destructive }}>
            {c.feeTooBig}
          </AppText>
        ) : null}
      </Section>

      {inputsOk && fx.state === 'loading' ? <ActivityIndicator /> : null}
      {inputsOk && fx.state === 'error' ? (
        <AppText muted>{c.rateFailed}</AppText>
      ) : null}

      {cost && fx.state === 'ready' ? (
        <>
          <Answer
            label={c.reallyCost}
            value={money(cost.totalCost, from)}
            note={c.costNote(pct(cost.totalCostPct, 2), FIGURES.globalCostPct, FIGURES.targetPct)}
          />
          <Breakdown
            rows={[
              { label: c.feeSeen, value: money(cost.feeCost, from), tone: t.moneyFee },
              {
                label: c.hidden(pct(cost.markupPct, 2)),
                value: money(cost.markupCost, from),
                tone: t.moneyMarkup,
              },
              ...(R > 0 ? [{ label: c.atPickup, value: money(cost.pickupCost, from), tone: t.moneyPickup }] : []),
              { label: c.theyReceived, value: money(cost.amountReceived, to), strong: true },
              { label: c.atMid, value: money(cost.benchmarkReceived, to) },
            ]}
          />
          {cost.markupPct < 0 ? (
            <AppText variant="small" muted>
              {c.better}
            </AppText>
          ) : null}
          <SourceNote>
            {c.source(
              fx.source,
              `1 ${from} = ${fx.rate.toLocaleString('en-US', { maximumFractionDigits: 4 })} ${to}`,
              dayIn(language, fx.date),
            )}
          </SourceNote>

          {/* PRD 5.7: from a past transfer to what the same one would get today. Only for
              currency pairs Compare covers, so the link never lands on an empty route. */}
          {compareRoute ? (
            <TextLink
              label={c.compareToday(money(S, from).replace('.00', ''))}
              onPress={() => openCompare({ routeId: compareRoute.id, amount: S })}
            />
          ) : null}

          <Section title={c.keep}>
            {session ? (
              <>
                <Fields>
                  <Field
                    label={c.provider}
                    hint={c.optional}
                    value={provider}
                    onChange={setProvider}
                    placeholder={c.providerPlaceholder}
                    keyboardType="default"
                    last
                  />
                </Fields>
                {message ? (
                  <AppText variant="label" style={{ color: message.ok ? t.primary : t.destructive }}>
                    {message.text}
                  </AppText>
                ) : null}
                <Button label={c.saveToAccount} onPress={save} loading={saving} disabled={message?.ok} />
              </>
            ) : (
              <Button label={c.createToSave} variant="secondary" onPress={() => router.push('/sign-in')} />
            )}
          </Section>
        </>
      ) : null}
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  pair: { flexDirection: 'row', gap: Spacing.two },
});
