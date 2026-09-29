import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { Step } from '@/components/onboarding';
import { AppText, Button } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { track } from '@/lib/track';

export default function Welcome() {
  const t = useTheme();
  useEffect(() => track('onboarding_started'), []);

  return (
    <Step
      step={1}
      of={3}
      tone="hero"
      actions={
        <>
          <Button
            label="Get started"
            variant="inverse"
            onPress={() => router.push('/onboarding/route')}
          />
          <Button
            label="I already have an account"
            variant="inverse-plain"
            onPress={() => router.push({ pathname: '/sign-in', params: { from: 'onboarding' } })}
          />
        </>
      }>
      <AppText variant="label" style={{ color: t.heroMuted }}>
        RemitBridge
      </AppText>
      <AppText variant="title" style={[styles.headline, { color: t.heroText }]}>
        See what really arrives.
      </AppText>
      <AppText style={{ color: t.heroMuted }}>Every fee and hidden markup, side by side.</AppText>

      {/* The idea in one picture: most of the money arrives, some goes to the fee, and
          some disappears into the exchange rate. Illustrative, so no numbers. */}
      <View style={styles.bar} accessible accessibilityLabel="Most of your money arrives. Some goes to the fee, and some to a hidden markup in the exchange rate.">
        {/* On the green band, "arrives" is white so it doesn't vanish into the ground. */}
        <View style={{ flex: 8, backgroundColor: t.heroText }} />
        <View style={{ flex: 1, backgroundColor: t.moneyFee }} />
        <View style={{ flex: 1.4, backgroundColor: t.moneyMarkup }} />
      </View>
      <View style={styles.legend}>
        <Legend color={t.heroText} label="Arrives" />
        <Legend color={t.moneyFee} label="Fee" />
        <Legend color={t.moneyMarkup} label="Hidden markup" />
      </View>
    </Step>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  const t = useTheme();
  return (
    <View style={styles.legendItem}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <AppText variant="small" style={{ color: t.heroMuted }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  headline: { fontSize: 32, lineHeight: 38, letterSpacing: -0.8 },
  bar: {
    height: 12,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    flexDirection: 'row',
    marginTop: Spacing.four,
  },
  legend: { flexDirection: 'row', gap: Spacing.three },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  swatch: { width: 10, height: 10, borderRadius: 2 },
});
