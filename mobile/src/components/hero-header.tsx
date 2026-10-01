import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { G, Path } from 'react-native-svg';

import { AppText } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * The brand-green band at the top of each tab: the website's full-bleed feature band.
 * It runs under the status bar, so the status bar turns light while it's on screen.
 * Behind the title, the website's bridge mark, drawn large and faint, so the band has some
 * texture instead of being a flat slab of green (D112).
 */
export function HeroHeader({ title, children }: { title: string; children?: ReactNode }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.band, { backgroundColor: t.hero, paddingTop: insets.top + Spacing.three }]}>
      <StatusBar style="light" />
      <Svg width={260} height={174} viewBox="0 0 48 32" style={[styles.mark, { top: insets.top - 30 }]} pointerEvents="none" accessible={false}>
        <G stroke={t.heroText} strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.09}>
          <Path d="M2 17Q24 3 46 17" />
          <Path d="M14 30v-6q10-9 20 0v6" />
        </G>
      </Svg>
      <AppText variant="title" accessibilityRole="header" style={{ color: t.heroText }}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

/**
 * The green strip behind the status bar, fixed while the page scrolls. The header turns
 * the status bar's text white; without this, scrolling slid white page content under
 * white clock and battery icons and they vanished.
 */
export function StatusBarShield() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return <View pointerEvents="none" style={[styles.shield, { height: insets.top, backgroundColor: t.hero }]} />;
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
    overflow: 'hidden',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  mark: { position: 'absolute', right: -70 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, height: 420 },
  shield: { position: 'absolute', top: 0, left: 0, right: 0 },
});
