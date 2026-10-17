import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Eyebrow } from '@/components/brand';
import { useCountUp } from '@/components/motion';
import { Rise } from '@/components/motion-views';
import { Step } from '@/components/onboarding';
import { AppText, Button } from '@/components/ui';
import { FIGURES } from '@/constants/figures';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';

/**
 * Why it matters (DECISIONS.md D62): the website's green figures band, as its own step.
 * Three published figures, each a big number, a bold label and one plain line, with the
 * sources underneath. This is what makes the case, so it's real and cited rather than an
 * "illustrative" example: the same numbers, words and sources as remitbridgelabs.org.
 */
const STATS = [
  { value: FIGURES.flowsUsdBn, prefix: '$', suffix: 'B', key: 'flows' },
  { value: FIGURES.globalCostPct, decimals: 2, suffix: '%', key: 'cost' },
  { value: FIGURES.targetPct, suffix: '%', key: 'target' },
] as const;

export default function Why() {
  const t = useTheme();
  const copy = useCopy();
  const w = copy.onboarding.why;
  return (
    <Step
      step={4}
      of={5}
      tone="band"
      actions={
        <Rise step={4}>
          <Button label={w.continue} variant="inverse" trailingIcon="arrow.right" onPress={() => router.push({ pathname: '/sign-in', params: { from: 'onboarding' } })} />
        </Rise>
      }>
      <Rise step={0} style={styles.head}>
        <Eyebrow onDark>{w.eyebrow}</Eyebrow>
        <AppText accessibilityRole="header" style={[styles.heading, { color: t.heroText }]}>
          {w.heading}
        </AppText>
      </Rise>
      <View style={styles.stats}>
        {STATS.map((s, i) => (
          <Stat key={s.key} stat={s} step={i + 1} />
        ))}
      </View>
      {/* 90% white, like the notes: 75% measured about 3.8:1 on the band, under AA. */}
      <AppText variant="small" style={{ color: t.heroText, opacity: 0.9 }}>
        {w.sources([FIGURES.flowsSource, FIGURES.globalCostSource, FIGURES.targetSource].join('; '))}
      </AppText>
    </Step>
  );
}

/** One figure: counts up like the website's, from just after its row rises in. */
function Stat({ stat: s, step }: { stat: (typeof STATS)[number]; step: number }) {
  const t = useTheme();
  const w = useCopy().onboarding.why;
  const label = w[`${s.key}Label`];
  const note = w[`${s.key}Note`];
  const decimals = 'decimals' in s ? s.decimals : 0;
  const shown = useCountUp(s.value, { decimals, delay: 150 + step * 80 });
  const prefix = 'prefix' in s ? s.prefix : '';
  const final = `${prefix}${s.value.toFixed(decimals)}${s.suffix}`;
  return (
    <Rise step={step} accessible accessibilityLabel={`${final}. ${label}. ${note}`}>
      <AppText style={[styles.value, { color: t.heroText }]}>
        {prefix}
        {shown}
        {s.suffix}
      </AppText>
      <AppText style={[styles.label, { color: t.heroText }]}>{label}</AppText>
      {/* The website measured its muted grey at 1.1:1 on this green; 90% white is 5.2:1. */}
      <AppText style={[styles.note, { color: t.heroText, opacity: 0.9 }]}>{note}</AppText>
    </Rise>
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
