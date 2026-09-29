import { SymbolView, type SFSymbol } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { HeroBackdrop, HeroHeader } from '@/components/hero-header';
import { AppText, Card } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const CONTACT = 'remitbridgesystemlabs@gmail.com';

/**
 * Methodology (PRD 5.4), kept to one line per point. The spot-check accuracy figure and
 * the update schedule join this screen once the engine has produced them; until then it
 * says nothing it can't back up.
 */
export default function MethodologyScreen() {
  const t = useTheme();
  return (
    <View style={[styles.fill, { backgroundColor: t.background }]}>
      <HeroBackdrop />
      <ScrollView contentContainerStyle={styles.scroll}>
        <HeroHeader title="How it works">
          <AppText style={{ color: t.heroMuted }}>What it costs, where prices come from.</AppText>
        </HeroHeader>
        <View style={[styles.body, { backgroundColor: t.background }]}>
          <Point icon="percent" title="Fee + hidden markup">
            Total cost is the fee plus the markup hidden in the exchange rate.
          </Point>
          <Point icon="checkmark.seal" title="Checked prices only">
            Every price passes our checks, or it isn’t shown. Mid-market rates from Frankfurter.
          </Point>
          <Point icon="hand.raised" title="No affiliate deals">
            Nobody pays to rank. We never touch your money.
          </Point>
          <Point icon="envelope" title="Wrong price?">
            <AppText
              style={{ color: t.primary }}
              accessibilityRole="link"
              onPress={() => Linking.openURL(`mailto:${CONTACT}`)}>
              {CONTACT}
            </AppText>
          </Point>
        </View>
      </ScrollView>
    </View>
  );
}

function Point({ icon, title, children }: { icon: SFSymbol; title: string; children: ReactNode }) {
  const t = useTheme();
  return (
    <Card style={styles.point}>
      <View style={[styles.tile, { backgroundColor: t.accent }]}>
        <SymbolView
          pointerEvents="none"
          name={icon}
          size={18}
          weight="semibold"
          tintColor={t.accentForeground}
          fallback={null}
        />
      </View>
      <View style={styles.pointText}>
        <AppText variant="heading">{title}</AppText>
        <AppText muted>{children}</AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1 },
  body: { flexGrow: 1, padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  point: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  tile: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointText: { flex: 1, gap: Spacing.one },
});
