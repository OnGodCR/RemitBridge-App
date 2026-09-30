import { useEffect, useState } from 'react';

import { Answer, Breakdown, Field, Fields, Section, SourceNote, ToolScreen } from '@/components/tool';
import { Segmented } from '@/components/ui';
import { FIGURES } from '@/constants/figures';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';
import { money, pct } from '@/lib/format';
import { track } from '@/lib/track';

/**
 * Yearly cost (the website's /reckoner, DECISIONS.md D58). TrueCost prices one transfer;
 * this multiplies it: the same transfer made every week or month for a year, at the cost
 * you pay, the global average, and the UN target. Plain arithmetic on your own numbers,
 * worked out on the phone; the two benchmarks are published figures and say so.
 */
const FREQUENCIES = [
  { value: 'weekly', perYear: 52 },
  { value: 'fortnightly', perYear: 26 },
  { value: 'monthly', perYear: 12 },
  { value: 'quarterly', perYear: 4 },
] as const;
type Frequency = (typeof FREQUENCIES)[number]['value'];

export default function YearlyCostScreen() {
  const t = useTheme();
  const copy = useCopy();
  const y = copy.yearlyCost;
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
    <ToolScreen intro={y.intro}>
      <Section title={y.yourTransfers}>
        <Fields>
          <Field label={y.amountEach} unit="USD" value={amount} onChange={setAmount} />
          <Field
            label={y.yourCost}
            hint={y.yourCostHint}
            unit="%"
            value={costPct}
            onChange={setCostPct}
            placeholder={y.optional}
            last
          />
        </Fields>
        <Segmented options={FREQUENCIES.map(({ value }) => ({ value, label: y[value] }))} value={freq} onChange={setFreq} />
      </Section>

      {sent > 0 ? (
        <>
          {hasYours ? (
            <Answer
              label={y.atYours(pct(yours, 2))}
              value={money(at(yours), 'USD')}
              note={
                overTarget > 0
                  ? y.moreThanTarget(money(overTarget, 'USD'), FIGURES.targetPct)
                  : y.underTarget(FIGURES.targetPct)
              }
            />
          ) : (
            <Answer
              label={y.atAverage}
              value={money(at(FIGURES.globalCostPct), 'USD')}
              note={y.addYours}
            />
          )}
          <Breakdown
            rows={[
              { label: y.sentYear, value: money(sent, 'USD'), strong: true },
              ...(hasYours ? [{ label: y.atYourCost(pct(yours, 2)), value: money(at(yours), 'USD'), tone: t.moneyMarkup }] : []),
              { label: y.atGlobal(pct(FIGURES.globalCostPct, 2)), value: money(at(FIGURES.globalCostPct), 'USD'), tone: t.moneyFee },
              { label: y.atTarget(FIGURES.targetPct), value: money(at(FIGURES.targetPct), 'USD'), tone: t.moneyReceived },
            ]}
          />
          <SourceNote>
            {y.source(FIGURES.globalCostSource, FIGURES.targetSource)}
          </SourceNote>
        </>
      ) : null}
    </ToolScreen>
  );
}
