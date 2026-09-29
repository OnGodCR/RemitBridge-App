import { useEffect, useState } from 'react';

import { Answer, Breakdown, Field, Fields, Section, SourceNote, ToolScreen } from '@/components/tool';
import { Segmented } from '@/components/ui';
import { FIGURES } from '@/constants/figures';
import { useTheme } from '@/hooks/use-theme';
import { money, pct } from '@/lib/format';
import { track } from '@/lib/track';

/**
 * Yearly cost (the website's /reckoner, DECISIONS.md D58). TrueCost prices one transfer;
 * this multiplies it: the same transfer made every week or month for a year, at the cost
 * you pay, the global average, and the UN target. Plain arithmetic on your own numbers,
 * worked out on the phone; the two benchmarks are published figures and say so.
 */
const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly', perYear: 52 },
  { value: 'fortnightly', label: '2 weeks', perYear: 26 },
  { value: 'monthly', label: 'Monthly', perYear: 12 },
  { value: 'quarterly', label: 'Quarterly', perYear: 4 },
] as const;
type Frequency = (typeof FREQUENCIES)[number]['value'];

export default function YearlyCostScreen() {
  const t = useTheme();
  const [amount, setAmount] = useState('200');
  const [freq, setFreq] = useState<Frequency>('monthly');
  const [costPct, setCostPct] = useState('');

  useEffect(() => track('tool_opened', { tool: 'yearly_cost' }), []);

  const perYear = FREQUENCIES.find((f) => f.value === freq)?.perYear ?? 12;
  const amt = Number(amount);
  const yours = Number(costPct);
  const hasYours = costPct !== '' && yours >= 0 && yours <= 50;
  const sent = amt > 0 ? amt * perYear : 0;
  const at = (p: number) => (sent * p) / 100;
  const overTarget = hasYours && yours > FIGURES.targetPct ? at(yours - FIGURES.targetPct) : 0;

  return (
    <ToolScreen intro="The same transfer, made all year. See what it adds up to at your cost and at the benchmarks.">
      <Section title="Your transfers">
        <Fields>
          <Field label="Amount each time" unit="USD" value={amount} onChange={setAmount} />
          <Field
            label="Your total cost"
            hint="Fee plus markup, as a % of what you send. TrueCost can work it out."
            unit="%"
            value={costPct}
            onChange={setCostPct}
            placeholder="Optional"
            last
          />
        </Fields>
        <Segmented options={FREQUENCIES.map(({ value, label }) => ({ value, label }))} value={freq} onChange={setFreq} />
      </Section>

      {sent > 0 ? (
        <>
          {hasYours ? (
            <Answer
              label={`At ${pct(yours, 2)}, a year of sending costs`}
              value={money(at(yours), 'USD')}
              note={
                overTarget > 0
                  ? `${money(overTarget, 'USD')} more than at the UN’s ${FIGURES.targetPct}% target.`
                  : `At or under the UN’s ${FIGURES.targetPct}% target.`
              }
            />
          ) : (
            <Answer
              label="At the global average, a year of sending costs"
              value={money(at(FIGURES.globalCostPct), 'USD')}
              note="Add your own cost above to compare."
            />
          )}
          <Breakdown
            rows={[
              { label: 'Sent in a year', value: money(sent, 'USD'), strong: true },
              ...(hasYours ? [{ label: `At your cost (${pct(yours, 2)})`, value: money(at(yours), 'USD'), tone: t.moneyMarkup }] : []),
              { label: `At the global average (${pct(FIGURES.globalCostPct, 2)})`, value: money(at(FIGURES.globalCostPct), 'USD'), tone: t.moneyFee },
              { label: `At the UN target (${FIGURES.targetPct}%)`, value: money(at(FIGURES.targetPct), 'USD'), tone: t.moneyReceived },
            ]}
          />
          <SourceNote>
            Global average: {FIGURES.globalCostSource}, for sending $200. Target: {FIGURES.targetSource}. Your own
            figure is multiplied as entered; costs vary with the amount and the provider.
          </SourceNote>
        </>
      ) : null}
    </ToolScreen>
  );
}
