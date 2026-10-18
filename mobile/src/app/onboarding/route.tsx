import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { DisplayTitle, Eyebrow } from '@/components/brand';
import { Flag } from '@/components/flag';
import { Arrow } from '@/components/list-row';
import { Rise } from '@/components/motion-views';
import { Step } from '@/components/onboarding';
import { AppText } from '@/components/ui';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { countryIn, currencyIn, useCopy } from '@/i18n';
import { availableRoutes, useAvailability } from '@/lib/availability';
import { prefs } from '@/lib/prefs';
import { track } from '@/lib/track';

/**
 * Pick the route Compare opens on (DECISIONS.md D62), as the website's divided index
 * ("rather than a card grid... a list you scan down instead of panels you compare"):
 * hairline rows, the country in bold, one plain line (the currency the family receives), an
 * arrow. One tap moves on. The delivery methods wait for Compare, where they're a choice.
 *
 * Everywhere else is one plain line pointing at the route board in Account (PRD 6.7),
 * following the site's rule that tags are text and never pills.
 */
export default function PickRoute() {
  const t = useTheme();
  const copy = useCopy();
  const o = copy.onboarding.route;
  // Only routes with prices right now (D190).
  const routes = availableRoutes(useAvailability());

  const pick = (routeId: string) => {
    prefs.setHomeRoute(routeId);
    track('onboarding_route_picked', { route: routeId });
    router.push('/onboarding/about');
  };

  return (
    <Step step={2} of={5} actions={null}>
      <Rise step={0} style={styles.head}>
        <Eyebrow>{o.eyebrow}</Eyebrow>
        <DisplayTitle lead={o.lead} accent={o.accent} />
        <AppText style={[styles.intro, { color: t.textSecondary }]}>
          {o.intro}
        </AppText>
      </Rise>

      <Rise step={1} style={[styles.index, { borderTopColor: t.border }]}>
        {routes.map((route) => {
          const code = route.id.split('-')[1];
          const country = countryIn(copy, code);
          const money = currencyIn(copy, route.receiveCurrency);
          return (
            <Pressable
              key={route.id}
              onPress={() => pick(route.id)}
              accessibilityRole="button"
              accessibilityLabel={o.paidIn(country, money)}
              style={({ pressed }) => [styles.row, { borderBottomColor: t.border, opacity: pressed ? 0.6 : 1 }]}>
              {/* A fixed column, so the names line up whatever each flag's proportions. */}
              <View style={styles.flag}>
                <Flag code={code} height={22} />
              </View>
              <View style={styles.rowText}>
                <AppText style={[styles.country, { color: t.text }]}>{country}</AppText>
                <AppText variant="small" style={{ color: t.textSecondary }}>
                  {money} · {route.receiveCurrency}
                </AppText>
              </View>
              <Arrow />
            </Pressable>
          );
        })}
      </Rise>

      <Rise step={2}>
        <AppText variant="small" style={{ color: t.textSecondary }}>
          {o.elsewhere}
        </AppText>
      </Rise>
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
  // Wide enough for a 2:1 flag at 22pt, the widest of the live routes (the Philippines).
  flag: { width: 44 },
  rowText: { flex: 1, gap: 3 },
  country: { fontFamily: Fonts.bold, fontSize: 20, letterSpacing: -0.4 },
});
