import type { SFSymbol } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Eyebrow } from '@/components/brand';
import { IconTile } from '@/components/list-row';
import { AppText, useLargeText } from '@/components/ui';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Two columns of cards, each an icon, a name and a few words (DECISIONS.md D102). For
 * places to go (Tools) and short facts (Learn), so a screen reads by picture first. At the
 * largest text sizes the cards stack one to a row, so no name is cut off.
 */
export function TileGrid({ title, children }: { title?: string; children: ReactNode }) {
  const large = useLargeText();
  return (
    <View style={styles.group}>
      {title ? <Eyebrow header>{title}</Eyebrow> : null}
      <View style={[styles.grid, large && styles.stacked]}>{children}</View>
    </View>
  );
}

/** One card. With `onPress` it's a button; without, it's a fact to read. */
export function Tile({
  icon,
  title,
  caption,
  onPress,
}: {
  icon: SFSymbol;
  title: string;
  caption: string;
  onPress?: () => void;
}) {
  const t = useTheme();
  const large = useLargeText();
  const body = (
    <>
      <IconTile name={icon} />
      <View style={styles.text}>
        <AppText style={[styles.title, { color: t.text }]}>{title}</AppText>
        <AppText variant="small" style={{ color: t.textSecondary }}>
          {caption}
        </AppText>
      </View>
    </>
  );
  const frame = [styles.tile, large && styles.wide, { backgroundColor: t.card, borderColor: t.border }];
  if (!onPress) {
    return (
      <View style={frame} accessible accessibilityLabel={`${title}. ${caption}`}>
        {body}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${caption}`}
      style={({ pressed }) => [...frame, { opacity: pressed ? 0.6 : 1 }]}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.three },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  stacked: { flexDirection: 'column' },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  wide: { flexBasis: 'auto' },
  text: { gap: 2 },
  title: { fontFamily: Fonts.bold, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
});
