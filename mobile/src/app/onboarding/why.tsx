import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Eyebrow } from '@/components/brand';
import { rise, useCountUp } from '@/components/motion';
import { Step } from '@/components/onboarding';
import { AppText, Button } from '@/components/ui';
import { FIGURES } from '@/constants/figures';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Why it matters (DECISIONS.md D62): the website's green figures band, as its own step.
 * Three published figures, each a big number, a bold label and one plain line, with the
 * sources underneath. This is what makes the case, so it's real and cited rather than an
 * "illustrative" example: the same numbers, words and sources as remitbridgelabs.org.
 */
const STATS = [
  {
    value: FIGURES.flowsUsdBn,
    prefix: '$',
    suffix: 'B',
    label: 'Sent home each year',
    note: 'Money migrant workers send to family in other countries.',
  },
  {
    value: FIGURES.globalCostPct,
    decimals: 2,
    suffix: '%',
    label: 'Average cost to send',
    note: 'The global average on a $200 transfer.',
  },
  {
    value: FIGURES.targetPct,
    suffix: '%',
    label: 'What it should be',
    note: 'The UN target the world agreed to hit by 2030.',
  },
];

export default function Why() {
  const t = useTheme();
  return (
    <Step
      step={2}
      of={4}
      tone="band"
      actions={
        <Animated.View entering={rise(4)}>
          <Button label="Continue" variant="inverse" trailingIcon="arrow.right" onPress={() => router.push('/onboarding/route')} />
        </Animated.View>
      }>
      <Animated.View entering={rise(0)} style={styles.head}>
        <Eyebrow onDark>Why it matters</Eyebrow>
        <AppText style={[styles.heading, { color: t.heroText }]}>The world takes a cut of every dollar sent home.</AppText>
      </Animated.View>
      <View style={styles.stats}>
        {STATS.map((s, i) => (
          <Stat key={s.label} stat={s} step={i + 1} />
        ))}
      </View>
      {/* 90% white, like the notes: 75% measured about 3.8:1 on the band, under AA. */}
      <AppText variant="small" style={{ color: t.heroText, opacity: 0.9 }}>
        Sources: {FIGURES.flowsSource}; {FIGURES.globalCostSource}; {FIGURES.targetSource}.
      </AppText>
    </Step>
  );
}

/** One figure: counts up like the website's, from just after its row rises in. */
function Stat({ stat: s, step }: { stat: (typeof STATS)[number]; step: number }) {
  const t = useTheme();
  const decimals = s.decimals ?? 0;
  const shown = useCountUp(s.value, { decimals, delay: 150 + step * 80 });
  const final = `${s.prefix ?? ''}${s.value.toFixed(decimals)}${s.suffix}`;
  return (
    <Animated.View entering={rise(step)} accessible accessibilityLabel={`${final}. ${s.label}. ${s.note}`}>
      <AppText style={[styles.value, { color: t.heroText }]}>
        {s.prefix ?? ''}
        {shown}
        {s.suffix}
      </AppText>
      <AppText style={[styles.label, { color: t.heroText }]}>{s.label}</AppText>
      {/* The website measured its muted grey at 1.1:1 on this green; 90% white is 5.2:1. */}
      <AppText style={[styles.note, { color: t.heroText, opacity: 0.9 }]}>{s.note}</AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // The extra space under the heading keeps it from reading as the first figure's label.
  head: { gap: Spacing.three, marginBottom: Spacing.three },
  heading: { fontFamily: Fonts.bold, fontSize: 28, lineHeight: 31, letterSpacing: -0.7 },
  stats: { gap: Spacing.four },
  value: { fontFamily: Fonts.extrabold, fontSize: 44, lineHeight: 50, letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  label: { fontFamily: Fonts.bold, fontSize: 17, marginTop: Spacing.two },
  note: { fontSize: 15, lineHeight: 21, marginTop: 2 },
});
