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
      actions={
        <>
          <Button label="Get started" onPress={() => router.push('/onboarding/route')} />
          <Button
            label="I already have an account"
            variant="plain"
            onPress={() => router.push({ pathname: '/sign-in', params: { from: 'onboarding' } })}
          />
        </>
      }>
      <AppText variant="label" style={{ color: t.primary }}>
        RemitBridge
      </AppText>
      <AppText variant="title" style={styles.headline}>
        See what really arrives.
      </AppText>
      <AppText muted>Every fee and hidden markup, side by side.</AppText>

      {/* The idea in one picture: most of the money arrives, some goes to the fee, and
          some disappears into the exchange rate. Illustrative, so no numbers. */}
      <View style={styles.bar} accessible accessibilityLabel="Most of your money arrives. Some goes to the fee, and some to a hidden markup in the exchange rate.">
        <View style={{ flex: 8, backgroundColor: t.moneyReceived }} />
        <View style={{ flex: 1, backgroundColor: t.moneyFee }} />
        <View style={{ flex: 1.4, backgroundColor: t.moneyMarkup }} />
      </View>
      <View style={styles.legend}>
        <Legend color={t.moneyReceived} label="Arrives" />
        <Legend color={t.moneyFee} label="Fee" />
        <Legend color={t.moneyMarkup} label="Hidden markup" />
      </View>
    </Step>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <AppText variant="small" muted>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  headline: { fontSize: 40, lineHeight: 44, letterSpacing: -1.2 },
  bar: {
    height: 20,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    flexDirection: 'row',
    marginTop: Spacing.four,
  },
  legend: { flexDirection: 'row', gap: Spacing.three },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  swatch: { width: 10, height: 10, borderRadius: 5 },
});
