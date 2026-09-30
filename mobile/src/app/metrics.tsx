import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Share, StyleSheet, View } from 'react-native';

import { ListFact, ListGroup } from '@/components/list-row';
import { AppText, Button, Segmented } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { money } from '@/lib/format';
import { DEFINITIONS, fetchMetrics, toCsv, type MetricDef, type Metrics } from '@/lib/metrics';
import { ROUTES } from '@/lib/routes';
import { EnglishOnly } from '@/i18n';

/**
 * The admin metrics screen (D31, D65). Admins only: the screen is behind a guard, and the
 * database function refuses anyone else with 42501 anyway. Each figure shows its
 * definition underneath, and Export shares the lot as CSV with the definitions attached.
 */
const PERIODS = [
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '365', label: '1 year' },
];

const TOOL_LABELS: Record<string, string> = {
  fair_rate: 'Fair rate',
  scam_check: 'Scam check',
  true_cost: 'TrueCost',
  yearly_cost: 'Yearly cost',
  rate_history: 'Rate history',
};

function MetricsScreen() {
  const t = useTheme();
  const [days, setDays] = useState('30');
  const [data, setData] = useState<{ days: string; value: Metrics | 'forbidden' | 'error' } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let live = true;
    fetchMetrics(Number(days)).then((value) => live && setData({ days, value }));
    return () => {
      live = false;
    };
  }, [days]);

  const refresh = async () => {
    setRefreshing(true);
    setData({ days, value: await fetchMetrics(Number(days)) });
    setRefreshing(false);
  };

  const m = data?.days === days && typeof data.value === 'object' ? data.value : null;
  const failed = data?.days === days && typeof data.value === 'string' ? data.value : null;

  return (
    <ScrollView
      style={[styles.fill, { backgroundColor: t.background }]}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
      <StatusBar style="auto" />
      <AppText style={[styles.lede, { color: t.textSecondary }]}>
        First-party counts from the app’s own events. Internal installs, and any phone ever signed in to an admin
        account, are left out.
      </AppText>
      <Segmented options={PERIODS} value={days} onChange={setDays} />

      {!m && !failed ? <ActivityIndicator style={styles.loading} /> : null}
      {failed === 'forbidden' ? <AppText muted>This account isn’t an admin.</AppText> : null}
      {failed === 'error' ? (
        <AppText muted>Metrics didn’t load. If this is new, the database migration may not be applied yet.</AppText>
      ) : null}

      {m ? (
        <>
          <Group title="Usage" defs={DEFINITIONS.filter((d) => d.group === 'usage')} m={m} />
          <ListGroup title="Retention">
            {(['d1', 'd7', 'd30'] as const).map((n) => {
              const r = m.usage.retention[n];
              return (
                <ListFact
                  key={n}
                  label={`Day ${n.slice(1)}`}
                  note={
                    r
                      ? `Of ${r.cohort.toLocaleString()} installs first seen at least ${Number(n.slice(1)) + 1} days ago`
                      : 'Not enough installs old enough yet'
                  }
                  value={r ? `${r.pct}%` : '–'}
                />
              );
            })}
          </ListGroup>
          <Funnel m={m} />
          <Group title="Activity" defs={DEFINITIONS.filter((d) => d.group === 'activity')} m={m} />
          <Breakdown title="Comparisons by route" map={m.activity.by_route} label={routeLabel} />
          <Breakdown title="Comparisons by amount" map={m.activity.by_amount} label={(k) => money(Number(k), 'USD').replace('.00', '')} />
          <Breakdown title="Comparisons by platform" map={m.activity.by_platform} label={platformLabel} />
          <Breakdown title="Tools opened" map={m.activity.tools} label={(k) => TOOL_LABELS[k] ?? k} />
          <Group title="Impact and engine" defs={DEFINITIONS.filter((d) => d.group === 'impact')} m={m} />
          <Breakdown title="Engine runs" map={m.impact.runs} label={(k) => k[0].toUpperCase() + k.slice(1)} />
          <AppText variant="small" muted>
            Last good engine run:{' '}
            {m.impact.last_good_run ? new Date(m.impact.last_good_run).toLocaleString('en-US') : 'none yet'}. Generated{' '}
            {new Date(m.generated_at).toLocaleString('en-US')}.
          </AppText>
          <Button
            label="Export as CSV"
            variant="secondary"
            trailingIcon="square.and.arrow.up"
            onPress={() => Share.share({ title: 'RemitBridge metrics', message: toCsv(m) }).catch(() => undefined)}
          />
        </>
      ) : null}
    </ScrollView>
  );
}

function Group({ title, defs, m }: { title: string; defs: MetricDef[]; m: Metrics }) {
  return (
    <ListGroup title={title}>
      {defs.map((d) => {
        const raw = (m[d.group] as unknown as Record<string, unknown>)[d.key];
        const value =
          d.key === 'savings_usd' ? money(Number(raw ?? 0), 'USD') : Number(raw ?? 0).toLocaleString('en-US');
        return <ListFact key={d.key} label={d.label} note={d.definition} value={value} />;
      })}
    </ListGroup>
  );
}

/** Each step with its share of the step it follows, so a drop-off is plain to see. */
function Funnel({ m }: { m: Metrics }) {
  const f = m.funnel;
  const steps: [string, number, number | null][] = [
    ['Started onboarding', f.onboarding_started, null],
    ['Picked a route', f.route_picked, f.onboarding_started],
    ['Signed in', f.signed_in, f.route_picked],
    ['Skipped sign-in', f.skipped, f.route_picked],
    ['Ran a comparison', f.compared, null],
    ['Saw prices', f.saw_prices, f.compared],
    ['Opened a quote', f.opened_quote, f.saw_prices],
  ];
  return (
    <ListGroup title="Funnel (installs)">
      {steps.map(([label, n, of]) => (
        <ListFact
          key={label}
          label={label}
          note={of ? `${Math.round((100 * n) / of)}% of the step before` : undefined}
          value={n.toLocaleString('en-US')}
        />
      ))}
    </ListGroup>
  );
}

function Breakdown({
  title,
  map,
  label,
}: {
  title: string;
  map: Record<string, number>;
  label: (key: string) => string;
}) {
  const t = useTheme();
  const rows = Object.entries(map).sort((a, b) => b[1] - a[1]);
  return (
    <ListGroup title={title}>
      {rows.length === 0 ? (
        <View style={styles.none}>
          <AppText style={{ color: t.textSecondary }}>None in this period.</AppText>
        </View>
      ) : (
        rows.map(([k, v]) => <ListFact key={k} label={label(k)} value={v.toLocaleString('en-US')} />)
      )}
    </ListGroup>
  );
}

function routeLabel(id: string): string {
  const r = ROUTES.find((x) => x.id === id);
  return r ? `US to ${r.country}` : id;
}

function platformLabel(k: string): string {
  return ({ ios: 'iPhone', android: 'Android', whatsapp: 'WhatsApp', web: 'Web' } as Record<string, string>)[k] ?? k;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.five, paddingBottom: Spacing.six },
  lede: { fontSize: 15, lineHeight: 21 },
  loading: { marginVertical: Spacing.four },
  none: { paddingVertical: Spacing.three },
});

/** Admin-only, so English whatever the app's language (DECISIONS.md D69). */
export default function MetricsScreenRoute() {
  return (
    <EnglishOnly>
      <MetricsScreen />
    </EnglishOnly>
  );
}
