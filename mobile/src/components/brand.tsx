import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppText } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

/**
 * The website's brand elements, for the app (DECISIONS.md D62). The art is rendered by
 * scripts/make-onboarding-art.py from the website's own Logo.jsx and Backdrop.jsx.
 */

/**
 * The bridge mark as an outline, the way the website draws it: two strokes in the brand
 * green. Not the filled app-icon tile, which is for the home screen only. The PNG is white
 * and recoloured here, so light and dark share one file.
 */
export function LogoMark({ width = 96, color }: { width?: number; color?: string }) {
  const t = useTheme();
  return (
    <Image
      source={require('../../assets/images/mark.png')}
      accessible
      accessibilityLabel="RemitBridge"
      style={{ width, height: (width * 35) / 51, tintColor: color ?? t.primary }}
    />
  );
}

/**
 * The website's eyebrow: small, bold, uppercase, widely tracked, in the brand green. It
 * names the section so the heading underneath doesn't have to.
 */
export function Eyebrow({ children, onDark }: { children: string; onDark?: boolean }) {
  const t = useTheme();
  return (
    <AppText style={[brandStyles.eyebrow, { color: onDark ? t.heroText : t.primary, opacity: onDark ? 0.85 : 1 }]}>
      {children.toUpperCase()}
    </AppText>
  );
}

/**
 * The website's DisplayTitle: two lines, the second in the brand green. "The size and
 * tracking carry it, so it needs no other decoration." Bold, -0.025em, line height 1.1.
 */
export function DisplayTitle({
  lead,
  accent,
  size = 32,
  align = 'left',
}: {
  lead: string;
  accent?: string;
  size?: number;
  align?: 'left' | 'center';
}) {
  const t = useTheme();
  const type = { fontFamily: Fonts.bold, fontSize: size, lineHeight: Math.round(size * 1.1), letterSpacing: -size * 0.025, textAlign: align };
  return (
    <View accessible accessibilityRole="header">
      <AppText style={[type, { color: t.text }]}>{lead}</AppText>
      {accent ? <AppText style={[type, { color: t.primary }]}>{accent}</AppText> : null}
    </View>
  );
}

/**
 * The surface behind a full-screen step. `ground` is the website's page ground: the mark
 * tiled at 6% with a mint light at the resting point. `band` is its green band, which takes
 * the light alone. Both are decoration, so they're hidden from screen readers.
 */
export function Ground({ tone = 'ground' }: { tone?: 'ground' | 'band' }) {
  const dark = useColorScheme() === 'dark';
  const source =
    tone === 'band'
      ? dark
        ? require('../../assets/images/band-dark.webp')
        : require('../../assets/images/band-light.webp')
      : dark
        ? require('../../assets/images/ground-dark.webp')
        : require('../../assets/images/ground-light.webp');
  // Sized to the window, not the parent: it sits behind a SafeAreaView whose padding
  // shouldn't change how the pattern is scaled. Anchored top, like the website's.
  const { width, height } = useWindowDimensions();
  return (
    <View pointerEvents="none" style={styles.frame} importantForAccessibility="no-hide-descendants">
      <Image source={source} resizeMode="cover" style={{ width, height }} />
    </View>
  );
}

const brandStyles = StyleSheet.create({
  eyebrow: { fontFamily: Fonts.bold, fontSize: 13, letterSpacing: 1.6 },
});

const styles = StyleSheet.create({
  frame: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' },
});
