import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Step } from '@/components/onboarding';
import { AppText } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { prefs } from '@/lib/prefs';
import { ROUTES } from '@/lib/routes';
import { track } from '@/lib/track';

export default function PickRoute() {
  const t = useTheme();

  const pick = (routeId: string) => {
    prefs.setHomeRoute(routeId);
    track('onboarding_route_picked', { route: routeId });
    router.push({ pathname: '/sign-in', params: { from: 'onboarding' } });
  };

  return (
    <Step step={2} of={3} actions={null}>
      <AppText variant="title">Where do you send money?</AppText>
      <View style={styles.grid}>
        {ROUTES.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => pick(r.id)}
            accessibilityRole="button"
            accessibilityLabel={r.country}
            style={({ pressed }) => [
              styles.tile,
              { backgroundColor: t.card, borderColor: t.border, opacity: pressed ? 0.7 : 1 },
            ]}>
            <AppText style={styles.flag}>{r.flag}</AppText>
            <AppText variant="heading">{r.country}</AppText>
          </Pressable>
        ))}
      </View>
      <AppText variant="small" muted>
        More countries soon.
      </AppText>
    </Step>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, marginTop: Spacing.two },
  tile: {
    width: '47%',
    aspectRatio: 1.15,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
    justifyContent: 'space-between',
  },
  flag: { fontSize: 40, lineHeight: 48 },
});
