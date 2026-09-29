import { computeTransferCost } from '@remitbridge/formula';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CurrencySelect } from '@/components/select-field';
import { Answer, Breakdown, Field, Fields, Section, SourceNote, ToolScreen } from '@/components/tool';
import { AppText, Button } from '@/components/ui';
import { FIGURES } from '@/constants/figures';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { money, pct } from '@/lib/format';
import { formatDay, isoDay, today, useMidRate } from '@/lib/fx';
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
      provider_name: provider.trim() || 'Not named',
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
      setMessage({ ok: false, text: error });
      return;
    }
    track('check_saved', { from, to });
    setMessage({ ok: true, text: 'Saved to your account.' });
  };

  return (
    <ToolScreen intro="Enter what’s on your receipt. See the cost hidden in the exchange rate, not just the fee.">
      <Section title="Currencies">
        <View style={styles.pair}>
          <CurrencySelect label="Sent" value={from} onChange={setFrom} />
          <CurrencySelect label="Received" value={to} onChange={setTo} />
        </View>
      </Section>

      <Section title="From your receipt">
        <Fields>
          <Field label="Amount sent" hint="Before any fee" unit={from} value={sent} onChange={setSent} />
          <Field label="Fee" hint="0 if there was none" unit={from} value={fee} onChange={setFee} />
          <Field
            label="Rate you got"
            hint={`${to} per 1 ${from}`}
            unit={to}
            value={rate}
            onChange={setRate}
            decimals={6}
          />
          <Field label="Pickup charge" hint="Only for cash pickup" unit={to} value={pickup} onChange={setPickup} />
          <Field
            label="Date sent"
            hint="Optional. Blank means today."
            value={dateText}
            onChange={setDateText}
            placeholder="MM/DD/YYYY"
            keyboardType="numbers-and-punctuation"
            last
          />
        </Fields>
        {dateText.trim() && !date ? (
          <AppText variant="small" style={{ color: t.destructive }}>
            Enter a date like 9/28/2026, not in the future.
          </AppText>
        ) : null}
        {F >= S && S > 0 ? (
          <AppText variant="small" style={{ color: t.destructive }}>
            The fee can’t be more than the amount sent.
          </AppText>
        ) : null}
      </Section>

      {inputsOk && fx.state === 'loading' ? <ActivityIndicator /> : null}
      {inputsOk && fx.state === 'error' ? (
        <AppText muted>Couldn’t get the mid-market rate for that day. Check your connection and try again.</AppText>
      ) : null}

      {cost && fx.state === 'ready' ? (
        <>
          <Answer
            label="This transfer really cost"
            value={money(cost.totalCost, from)}
            note={`${pct(cost.totalCostPct, 2)} of what you sent. The world average is ${FIGURES.globalCostPct}%; the UN target is ${FIGURES.targetPct}%.`}
          />
          <Breakdown
            rows={[
              { label: 'Fee you could see', value: money(cost.feeCost, from), tone: t.moneyFee },
              {
                label: `Hidden in the rate (${pct(cost.markupPct, 2)} markup)`,
                value: money(cost.markupCost, from),
                tone: t.moneyMarkup,
              },
              ...(R > 0 ? [{ label: 'Charged at pickup', value: money(cost.pickupCost, from), tone: t.moneyPickup }] : []),
              { label: 'They received', value: money(cost.amountReceived, to), strong: true },
              { label: 'At mid-market, with no fee', value: money(cost.benchmarkReceived, to) },
            ]}
          />
          {cost.markupPct < 0 ? (
            <AppText variant="small" muted>
              Your rate was better than mid-market. That usually means a first-transfer promotion.
            </AppText>
          ) : null}
          <SourceNote>
            Mid-market rate from {fx.source}: 1 {from} = {fx.rate.toLocaleString('en-US', { maximumFractionDigits: 4 })}{' '}
            {to}, for {formatDay(fx.date)}. It’s a daily reference, so rates on the day may have moved.
          </SourceNote>

          <Section title="Keep this check">
            {session ? (
              <>
                <Fields>
                  <Field
                    label="Provider"
                    hint="Optional"
                    value={provider}
                    onChange={setProvider}
                    placeholder="e.g. Remitly"
                    keyboardType="default"
                    last
                  />
                </Fields>
                {message ? (
                  <AppText variant="label" style={{ color: message.ok ? t.primary : t.destructive }}>
                    {message.text}
                  </AppText>
                ) : null}
                <Button label="Save to my account" onPress={save} loading={saving} disabled={message?.ok} />
              </>
            ) : (
              <Button label="Create an account to save checks" variant="secondary" onPress={() => router.push('/sign-in')} />
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
