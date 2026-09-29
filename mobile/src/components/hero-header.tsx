import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * The brand-green band at the top of each tab: the website's full-bleed feature band.
 * It runs under the status bar, so the status bar turns light while it's on screen.
 */
export function HeroHeader({ title, children }: { title: string; children?: ReactNode }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.band, { backgroundColor: t.hero, paddingTop: insets.top + Spacing.three }]}>
      <StatusBar style="light" />
      <AppText variant="title" style={{ color: t.heroText }}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

/**
 * Full-screen scroll layout under a HeroHeader: green shows if you pull down past the
 * top, the page colour if you pull up past the bottom.
 */
export function HeroBackdrop() {
  const t = useTheme();
  return <View pointerEvents="none" style={[styles.backdrop, { backgroundColor: t.hero }]} />;
}

const styles = StyleSheet.create({
  band: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, height: 420 },
});
