import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { CurrencySelect } from '@/components/select-field';
import { Breakdown, Section, SourceNote, ToolScreen } from '@/components/tool';
import { AppText, Segmented } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { daysAgo, FX_SOURCE, fetchRateSeries, formatDay, today, type RatePoint } from '@/lib/fx';
import { track } from '@/lib/track';

/**
 * Rate history (the website's /rate-history, DECISIONS.md D58): the mid-market rate for a
 * pair, one point per day. The website charts its own stored table; the app asks
 * Frankfurter for the range directly, so every pair has a full history from day one.
 *
 * The chart is plain views, each segment a thin rotated bar, so no charting or SVG
 * dependency is needed. Drag across it to read any day.
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
          <Chart points={points} unit={`${to} per 1 ${from}`} />
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

const H = 180;

function Chart({ points, unit }: { points: RatePoint[]; unit: string }) {
  const t = useTheme();
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);

  const { lo, hi } = useMemo(() => {
    const rates = points.map((p) => p.rate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    // A flat series has no range; pad it so the line runs through the middle.
    const pad = max - min < Number.EPSILON ? Math.max(max * 0.002, 0.0001) : (max - min) * 0.1;
    return { lo: min - pad, hi: max + pad };
  }, [points]);

  const xy = (i: number) => ({
    x: (i / (points.length - 1)) * width,
    y: H - ((points[i].rate - lo) / (hi - lo)) * H,
  });

  const pick = (x: number) =>
    setActive(Math.max(0, Math.min(points.length - 1, Math.round((x / Math.max(1, width)) * (points.length - 1)))));

  const shown = points[active ?? points.length - 1];

  return (
    <View style={[styles.chartCard, { backgroundColor: t.card, borderColor: t.border }]}>
      <View style={styles.chartHead}>
        <AppText variant="figure" style={{ color: t.primary }}>
          {fmt(shown.rate)}
        </AppText>
        <AppText variant="small" muted>
          {unit} · {formatDay(shown.date)}
        </AppText>
      </View>
      <View
        style={styles.chart}
        onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={(e) => pick(e.nativeEvent.locationX)}
        onResponderMove={(e) => pick(e.nativeEvent.locationX)}
        onResponderRelease={() => setActive(null)}
        accessible
        accessibilityLabel={`${unit}, ${points.length} days from ${formatDay(points[0].date)} to ${formatDay(
          points[points.length - 1].date,
        )}. Low ${fmt(Math.min(...points.map((p) => p.rate)))}, high ${fmt(Math.max(...points.map((p) => p.rate)))}.`}>
        {width > 0
          ? points.slice(1).map((_, k) => {
              const a = xy(k);
              const b = xy(k + 1);
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              return (
                <View
                  key={points[k + 1].date}
                  pointerEvents="none"
                  style={[
                    styles.segment,
                    {
                      width: len + 1,
                      left: (a.x + b.x) / 2 - (len + 1) / 2,
                      top: (a.y + b.y) / 2 - 1,
                      backgroundColor: t.primary,
                      transform: [{ rotate: `${Math.atan2(dy, dx)}rad` }],
                    },
                  ]}
                />
              );
            })
          : null}
        {active !== null && width > 0 ? (
          <>
            <View pointerEvents="none" style={[styles.cursor, { left: xy(active).x, backgroundColor: t.border }]} />
            <View
              pointerEvents="none"
              style={[
                styles.dot,
                { left: xy(active).x - 5, top: xy(active).y - 5, backgroundColor: t.card, borderColor: t.primary },
              ]}
            />
          </>
        ) : null}
      </View>
      <View style={styles.axis}>
        <AppText variant="small" muted>
          {formatDay(points[0].date)}
        </AppText>
        <AppText variant="small" muted>
          {formatDay(points[points.length - 1].date)}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pair: { flexDirection: 'row', gap: Spacing.two },
  chartCard: { borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.three, gap: Spacing.three },
  chartHead: { gap: 2 },
  chart: { height: H },
  segment: { position: 'absolute', height: 2, borderRadius: 1 },
  cursor: { position: 'absolute', top: 0, bottom: 0, width: 1 },
  dot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  axis: { flexDirection: 'row', justifyContent: 'space-between' },
});
