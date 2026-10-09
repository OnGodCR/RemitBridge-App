import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { G, Path } from 'react-native-svg';

import { AccountButton } from '@/components/account-button';
import { Icon } from '@/components/icon';
import { AppText } from '@/components/ui';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';

/**
 * The brand-green band at the top of each tab: the website's full-bleed feature band.
 * It runs under the status bar, so the status bar turns light while it's on screen.
 * Behind the title, the website's bridge mark, drawn large and faint, so the band has some
 * texture instead of being a flat slab of green (D112).
 *
 * Every tab shows Account's button in the top-right corner (D147); Account itself, a pushed
 * screen, shows a back button there instead (onBack).
 */
export function HeroHeader({
  title,
  greeting,
  children,
  onBack,
}: {
  title: string;
  greeting?: string;
  children?: ReactNode;
  onBack?: () => void;
}) {
  const t = useTheme();
  const copy = useCopy();
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
      <View style={styles.topRow}>
        {onBack ? (
          <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={copy.common.back} hitSlop={10} style={styles.back}>
            <Icon name="chevron.left" size={22} weight="semibold" tintColor={t.heroText} fallback={null} />
          </Pressable>
        ) : (
          <AccountButton />
        )}
      </View>
      {/* "Good morning, Angad" above the title on the home tab (D114, D128). */}
      {greeting ? <AppText style={[styles.greeting, { color: t.heroMuted }]}>{greeting}</AppText> : null}
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
  // Account's button sits right, the back button left; the title starts below either.
  topRow: { flexDirection: 'row', justifyContent: 'flex-end', minHeight: 38, marginBottom: -Spacing.one },
  back: { marginRight: 'auto', height: 38, justifyContent: 'center' },
  greeting: { fontFamily: Fonts.semibold, fontSize: 18, lineHeight: 23, marginBottom: -Spacing.two },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, height: 420 },
  shield: { position: 'absolute', top: 0, left: 0, right: 0 },
});
