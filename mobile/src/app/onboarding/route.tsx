import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Step } from '@/components/onboarding';
import { AppText, CodeBadge } from '@/components/ui';
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
      <View style={[styles.list, { backgroundColor: t.card, borderColor: t.border }]}>
        {ROUTES.map((r, i) => (
          <Pressable
            key={r.id}
            onPress={() => pick(r.id)}
            accessibilityRole="button"
            accessibilityLabel={r.country}
            style={({ pressed }) => [
              styles.row,
              i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border },
              { backgroundColor: pressed ? t.muted : 'transparent' },
            ]}>
            <CodeBadge code={r.id.split('-')[1].toUpperCase()} />
            <AppText variant="label" style={styles.name}>
              {r.country}
            </AppText>
            <AppText variant="small" muted>
              {r.receiveCurrency}
            </AppText>
            <SymbolView
              pointerEvents="none"
              name="chevron.right"
              size={13}
              weight="semibold"
              tintColor={t.textSecondary}
              fallback={<AppText muted>›</AppText>}
            />
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
  list: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginTop: Spacing.two,
  },
  row: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  name: { flex: 1, fontSize: 16 },
});
