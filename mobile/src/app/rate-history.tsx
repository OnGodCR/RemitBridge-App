import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { LineChart } from '@/components/line-chart';
import { CurrencySelect } from '@/components/select-field';
import { Breakdown, Section, SourceNote, ToolScreen } from '@/components/tool';
import { AppText, Segmented } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { daysAgo, FX_SOURCE, fetchRateSeries, formatDay, today, type RatePoint } from '@/lib/fx';
import { track } from '@/lib/track';

/**
 * Rate history (the website's /rate-history, DECISIONS.md D58): the mid-market rate for a
 * pair, one point per day. The website charts its own stored table; the app asks
 * Frankfurter for the range directly, so every pair has a full history from day one.
 *
 * The chart is components/line-chart.tsx, shared with the quote detail.
 */
const PERIODS = [
  { value: '30', label: '1M' },
  { value: '90', label: '3M' },
  { value: '180', label: '6M' },
  { value: '365', label: '1Y' },
];

const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: n >= 100 ? 2 : 4 });

export default function RateHistoryScreen() {
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('MXN');
  const [days, setDays] = useState('90');
  const key = `${from}|${to}|${days}`;
  const [answer, setAnswer] = useState<{ key: string; points: RatePoint[] | 'error' } | null>(null);

  useEffect(() => track('tool_opened', { tool: 'rate_history' }), []);

  useEffect(() => {
    let live = true;
    fetchRateSeries(from, to, daysAgo(Number(days)), today()).then(
      (points) => live && setAnswer({ key, points }),
      () => live && setAnswer({ key, points: 'error' }),
    );
    return () => {
      live = false;
    };
  }, [from, to, days, key]);

  const points = answer?.key === key && answer.points !== 'error' ? answer.points : null;
  const failed = answer?.key === key && answer.points === 'error';
  const first = points?.[0];
  const last = points?.[points.length - 1];
  const change = first && last ? ((last.rate - first.rate) / first.rate) * 100 : 0;

  return (
    <ToolScreen intro="The mid-market rate, day by day. A rising line means each dollar buys more.">
      <Section title="Pair">
        <View style={styles.pair}>
          <CurrencySelect label="From" value={from} onChange={setFrom} />
          <CurrencySelect label="To" value={to} onChange={setTo} />
        </View>
        <Segmented options={PERIODS} value={days} onChange={setDays} />
      </Section>

      {!points && !failed ? <ActivityIndicator /> : null}
      {failed ? <AppText muted>Couldn’t load the history. Check your connection and try again.</AppText> : null}
      {points && points.length < 2 ? <AppText muted>Not enough days published for this pair yet.</AppText> : null}

      {points && points.length >= 2 && first && last ? (
        <>
          <LineChart points={points.map((p) => ({ date: p.date, value: p.rate }))} unit={`${to} per 1 ${from}`} format={fmt} />
          <Breakdown
            rows={[
              { label: `Latest (${formatDay(last.date)})`, value: fmt(last.rate), strong: true },
              {
                label: `Change since ${formatDay(first.date)}`,
                value: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
              },
              { label: 'Highest', value: fmt(Math.max(...points.map((p) => p.rate))) },
              { label: 'Lowest', value: fmt(Math.min(...points.map((p) => p.rate))) },
            ]}
          />
          <SourceNote>
            {points.length} daily reference rates from {FX_SOURCE}, which aggregates central bank publications.
            Providers’ rates sit below these by their markup.
          </SourceNote>
        </>
      ) : null}
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  pair: { flexDirection: 'row', gap: Spacing.two },
});
