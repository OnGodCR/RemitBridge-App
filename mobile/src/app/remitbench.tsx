import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Breakdown, Section } from '@/components/tool';
import { AppText } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { track } from '@/lib/track';

/**
 * RemitBench (the website's /remitbench, DECISIONS.md D58): the design of a research
 * testbed, not results. Kept in step with the website's copy. The comparison figures are
 * published specifications, never our measurements, and the page says so twice.
 */
const SETUPS = [
  {
    name: 'Sharding (Layer 1)',
    strengths: 'Splits the work across more lanes',
    rows: [
      ['Throughput', '2,500 – 10,000+ TPS'],
      ['Latency', '2.5 s'],
      ['Finality', 'Probabilistic (2–3 blocks)'],
      ['Cost range', '$0.001 – $0.05'],
      ['Talks to banks via', 'API gateway + bridge contract'],
    ],
  },
  {
    name: 'Sidechains (Layer 2)',
    strengths: 'Own rules, own currency handling',
    rows: [
      ['Throughput', '1,500 – 5,000 TPS'],
      ['Latency', '1.2 s'],
      ['Finality', 'Mainnet checkpoint (15 min)'],
      ['Cost range', '$0.005 – $0.02'],
      ['Talks to banks via', 'Custom relay + vault contracts'],
    ],
  },
  {
    name: 'Off-chain payment channels',
    strengths: 'Cheapest and fastest, if the money is already parked',
    rows: [
      ['Throughput', '50,000+ TPS (off-chain)'],
      ['Latency', '< 100 ms'],
      ['Finality', 'Instant (state update)'],
      ['Cost range', '< $0.001'],
      ['Talks to banks via', 'HTLC + ISO 20022 intermediary'],
    ],
  },
  {
    name: 'SWIFT / normal bank transfer',
    strengths: 'Every bank already accepts it',
    rows: [
      ['Throughput', '100 – 500 TPS (batch)'],
      ['Latency', '1 – 5 business days'],
      ['Finality', 'Settlement account credit'],
      ['Cost range', '$15 – $45 (fixed + FX)'],
      ['Talks to banks via', 'Native ISO 20022 / MT messaging'],
    ],
  },
];

const TESTS = [
  {
    id: 'ordinary',
    tab: 'Baseline',
    title: 'A normal week',
    text: 'Regular family transfers, between $50 and $300, across four busy corridors. This is the boring case, and it’s the one that matters most.',
    metrics: [['Target throughput', '500 TPS'], ['Average transfer', '$180'], ['Latency threshold', '< 3.0 s'], ['Failure tolerance', '0.01%']],
  },
  {
    id: 'small',
    tab: 'Small',
    title: 'Small amounts, sent often',
    text: 'Transfers of $10 to $50 every few days for groceries or a doctor visit. Fixed fees hurt most here: a flat $5 on a $30 transfer is a sixth of the money.',
    metrics: [['Target throughput', '2,500 TPS'], ['Average transfer', '$32'], ['Latency threshold', '< 1.5 s'], ['Failure tolerance', '0.005%']],
  },
  {
    id: 'holiday',
    tab: 'Holiday',
    title: 'Holiday rush',
    text: 'Around Lunar New Year, Eid and Christmas, traffic jumps to about five times normal. Systems that look fine in the baseline can fall over here.',
    metrics: [['Target throughput', '8,000 TPS'], ['Average transfer', '$250'], ['Latency threshold', '< 5.0 s'], ['Failure tolerance', '0.02%']],
  },
  {
    id: 'congestion',
    tab: 'Busy',
    title: 'The network is busy',
    text: 'Gas prices spike and cross-shard traffic piles up. We’re mostly watching how much the fee swings: $0.01 one hour and $2 the next is hard to plan around.',
    metrics: [['Target throughput', '10,000 TPS'], ['Average transfer', '$150'], ['Latency threshold', '< 8.0 s'], ['Failure tolerance', '0.05%']],
  },
  {
    id: 'failure',
    tab: 'Failure',
    title: 'Something breaks',
    text: 'We drop nodes offline on purpose and slow the bridges, then time how long the system takes to recover.',
    metrics: [['Target throughput', '1,200 TPS'], ['Average transfer', '$200'], ['Latency threshold', '< 4.0 s'], ['Failure tolerance', '0.10%']],
  },
  {
    id: 'liquidity',
    tab: 'Liquidity',
    title: 'The money runs out on the other end',
    text: 'Payment channels only work if someone on the receiving side holds funds to pay out. When those pools run dry, routing fails, and this test is where that shows.',
    metrics: [['Target throughput', '300 TPS'], ['Average transfer', '$500'], ['Latency threshold', '< 10 s'], ['Failure tolerance', '0.50%']],
  },
];

export default function RemitBenchScreen() {
  const t = useTheme();
  const [test, setTest] = useState(TESTS[0].id);
  const current = TESTS.find((x) => x.id === test) ?? TESTS[0];
  useEffect(() => track('learn_opened', { page: 'remitbench' }), []);

  return (
    <>
      <StatusBar style="auto" />
      <ScrollView
        style={{ backgroundColor: t.background }}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic">
        <AppText muted>
          An open testbed for comparing blockchain scaling setups against an ordinary bank transfer, using synthetic
          traffic that behaves like real remittance traffic.
        </AppText>

        <View style={[styles.notice, { backgroundColor: t.accent, borderLeftColor: t.primary }]}>
          <AppText variant="label" style={{ color: t.accentForeground }}>
            Still being built
          </AppText>
          <AppText variant="small" style={{ color: t.text }}>
            RemitBench hasn’t produced results we’re willing to publish. This is the design: the question, the setups,
            and the six tests. When there are real numbers, they’ll appear with the code and runs behind them.
          </AppText>
        </View>

        <AppText>
          The question: which setup (sharding, sidechains, or off-chain channels) moves more transfers for less money,
          and can any of them talk to the bank rails that already exist? A fast system that can’t hand off to SWIFT or
          RTGS isn’t much use to a family whose bank is the only place to pick up cash. Everything runs on synthetic
          traffic, so no real family’s transfers are involved.
        </AppText>

        <Section title="How the setups compare">
          <AppText variant="small" muted>
            From each system’s published specifications, not our measurements. Don’t quote these as results.
          </AppText>
          {SETUPS.map((s) => (
            <View key={s.name} style={styles.setup}>
              <AppText variant="heading">{s.name}</AppText>
              <AppText variant="small" muted>
                {s.strengths}
              </AppText>
              <Breakdown rows={s.rows.map(([label, value]) => ({ label, value }))} />
            </View>
          ))}
        </Section>

        <Section title="The six tests">
          <AppText variant="small" muted>
            Each is a different kind of bad day. None has been run yet.
          </AppText>
          <View style={styles.chips}>
            {TESTS.map((x) => (
              <AppText
                key={x.id}
                variant="label"
                accessibilityRole="button"
                accessibilityState={{ selected: x.id === test }}
                onPress={() => setTest(x.id)}
                style={[
                  styles.chip,
                  x.id === test
                    ? { backgroundColor: t.primary, color: t.primaryForeground, borderColor: t.primary }
                    : { backgroundColor: t.card, color: t.textSecondary, borderColor: t.border },
                ]}>
                {x.tab}
              </AppText>
            ))}
          </View>
          <View style={styles.setup}>
            <AppText variant="heading">{current.title}</AppText>
            <AppText muted>{current.text}</AppText>
            <Breakdown rows={current.metrics.map(([label, value]) => ({ label, value }))} />
          </View>
        </Section>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.four, paddingBottom: Spacing.six },
  notice: { borderRadius: Radius.md, borderLeftWidth: 3, padding: Spacing.three, gap: Spacing.one },
  setup: { gap: Spacing.two },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    overflow: 'hidden',
  },
});
