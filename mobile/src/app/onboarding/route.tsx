import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { DisplayTitle, Eyebrow } from '@/components/brand';
import { Flag } from '@/components/flag';
import { rise } from '@/components/motion';
import { Step } from '@/components/onboarding';
import { AppText } from '@/components/ui';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RECEIVING } from '@/lib/countries';
import { prefs } from '@/lib/prefs';
import { DELIVERY_LABELS, ROUTES } from '@/lib/routes';
import { track } from '@/lib/track';

/**
 * Pick the route Compare opens on (DECISIONS.md D62), as the website's divided index
 * ("rather than a card grid... a list you scan down instead of panels you compare"):
 * hairline rows, the country in bold, one plain line, an arrow. One tap moves on.
 *
 * The countries that aren't live yet are a plain line of text, following the site's rule
 * that tags are text and never pills.
 */
export default function PickRoute() {
  const t = useTheme();
  const soon = RECEIVING.filter((c) => !c.live).map((c) => c.short ?? c.name);

  const pick = (routeId: string) => {
    prefs.setHomeRoute(routeId);
    track('onboarding_route_picked', { route: routeId });
    router.push({ pathname: '/sign-in', params: { from: 'onboarding' } });
  };

  return (
    <Step step={3} of={4} actions={null}>
      <Animated.View entering={rise(0)} style={styles.head}>
        <Eyebrow>Your route</Eyebrow>
        <DisplayTitle lead="Where do you" accent="send money?" />
        <AppText style={[styles.intro, { color: t.textSecondary }]}>
          Compare opens on this route. You can change it anytime.
        </AppText>
      </Animated.View>

      <Animated.View entering={rise(1)} style={[styles.index, { borderTopColor: t.border }]}>
        {ROUTES.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => pick(r.id)}
            accessibilityRole="button"
            accessibilityLabel={`${r.country}. ${r.sendCurrency} to ${r.receiveCurrency}`}
            style={({ pressed }) => [styles.row, { borderBottomColor: t.border, opacity: pressed ? 0.6 : 1 }]}>
            <Flag code={r.id.split('-')[1]} height={22} />
            <View style={styles.rowText}>
              <AppText style={[styles.country, { color: t.text }]}>{r.country}</AppText>
              <AppText variant="small" style={{ color: t.textSecondary }}>
                {r.sendCurrency} to {r.receiveCurrency} · {r.deliveryMethods.map((m) => DELIVERY_LABELS[m]).join(', ')}
              </AppText>
            </View>
            <SymbolView pointerEvents="none" name="arrow.right" size={17} weight="semibold" tintColor={t.primary} fallback={null} />
          </Pressable>
        ))}
      </Animated.View>

      <Animated.View entering={rise(2)}>
        <AppText variant="small" style={{ color: t.textSecondary }}>
          Coming next: {soon.join(', ')}.
        </AppText>
      </Animated.View>
    </Step>
  );
}

const styles = StyleSheet.create({
  head: { gap: Spacing.three, marginBottom: Spacing.two },
  intro: { fontSize: 16, lineHeight: 23 },
  index: { borderTopWidth: StyleSheet.hairlineWidth },
  row: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.three,
  },
  rowText: { flex: 1, gap: 3 },
  country: { fontFamily: Fonts.bold, fontSize: 20, letterSpacing: -0.4 },
});
