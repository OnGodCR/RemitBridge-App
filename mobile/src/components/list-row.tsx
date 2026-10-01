import { SymbolView, type SFSymbol } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { Eyebrow } from '@/components/brand';
import { AppText } from '@/components/ui';
import { Fonts, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useIconSize } from '@/hooks/use-icon-size';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';

/**
 * The website's divided index (its home page's "Start here" list), for the Tools, Learn and
 * Account tabs (DECISIONS.md D63): hairline rules above and between, no card. The group's
 * name is an eyebrow, as on the site. Since D102 each row leads with an icon, so the list
 * can be read by picture before words.
 */
export function ListGroup({ title, children }: { title?: string; children: ReactNode }) {
  const t = useTheme();
  return (
    <View style={styles.group}>
      {title ? <Eyebrow header>{title}</Eyebrow> : null}
      <View style={[styles.index, { borderTopColor: t.border }]}>{children}</View>
    </View>
  );
}

/**
 * One destination: an icon, a bold title, one short line saying what it's for, and the
 * website's green arrow (up and to the right for pages that open on the website).
 */
export function ListRow({
  title,
  subtitle,
  onPress,
  external,
  icon,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  external?: boolean;
  icon?: SFSymbol;
}) {
  const t = useTheme();
  const copy = useCopy();
  return (
    <ListItem
      onPress={onPress}
      accessibilityRole={external ? 'link' : 'button'}
      accessibilityLabel={`${title}. ${subtitle}`}
      accessibilityHint={external ? copy.learn.opensWebsite : undefined}>
      {icon ? <IconTile name={icon} /> : null}
      <View style={styles.text}>
        <AppText style={[styles.title, { color: t.text }]}>{title}</AppText>
        <AppText style={[styles.subtitle, { color: t.textSecondary }]}>{subtitle}</AppText>
      </View>
      <Arrow external={external} />
    </ListItem>
  );
}

/** A row that says something rather than going somewhere: an icon, a bold title and plain text. */
export function ListPoint({ title, children, icon }: { title: string; children: ReactNode; icon?: SFSymbol }) {
  const t = useTheme();
  return (
    <ListItem>
      {icon ? <IconTile name={icon} /> : null}
      <View style={styles.text}>
        <AppText style={[styles.title, { color: t.text }]}>{title}</AppText>
        <AppText style={[styles.subtitle, { color: t.textSecondary }]}>{children}</AppText>
      </View>
    </ListItem>
  );
}

/**
 * A figure in a list: what it is on the left, the value on the right in tabular figures,
 * and an optional line under the label (a source, a rate). `strong` is the total.
 */
export function ListFact({
  label,
  value,
  note,
  strong,
}: {
  label: string;
  value: string;
  note?: string;
  strong?: boolean;
}) {
  const t = useTheme();
  return (
    <ListItem style={styles.fact}>
      <View style={styles.text}>
        <AppText style={[strong ? styles.factStrong : styles.factLabel, { color: t.text }]}>{label}</AppText>
        {note ? <AppText variant="small" style={{ color: t.textSecondary }}>{note}</AppText> : null}
      </View>
      <AppText style={[strong ? styles.factStrong : styles.factValue, { color: t.text }]}>{value}</AppText>
    </ListItem>
  );
}

/**
 * The row itself, for lists whose rows carry their own content (saved checks, saved
 * comparisons): the hairline under it, the height, and the pressed state.
 */
export function ListItem({
  children,
  onPress,
  style,
  ...rest
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
} & Pick<
  PressableProps,
  | 'onLongPress'
  | 'accessibilityRole'
  | 'accessibilityLabel'
  | 'accessibilityHint'
  | 'accessibilityActions'
  | 'onAccessibilityAction'
>) {
  const t = useTheme();
  if (!onPress) return <View style={[styles.row, { borderBottomColor: t.border }, style]}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      {...rest}
      accessibilityRole={rest.accessibilityRole ?? 'button'}
      style={({ pressed }) => [styles.row, { borderBottomColor: t.border, opacity: pressed ? 0.6 : 1 }, style]}>
      {children}
    </Pressable>
  );
}

/**
 * A symbol on a mint square (D102): the icon that leads a row or a step. Decorative, so
 * screen readers skip it; the words next to it carry the meaning.
 */
export function IconTile({ name, size = 44 }: { name: SFSymbol; size?: number }) {
  const t = useTheme();
  const glyph = useIconSize(Math.round(size * 0.48));
  const box = useIconSize(size);
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.tile, { width: box, height: box, backgroundColor: t.accent }]}>
      <SymbolView pointerEvents="none" name={name} size={glyph} weight="semibold" tintColor={t.accentForeground} fallback={null} />
    </View>
  );
}

/** The website's ArrowRight, in the brand green. */
export function Arrow({ external }: { external?: boolean }) {
  const t = useTheme();
  const size = useIconSize(17);
  return (
    <SymbolView
      pointerEvents="none"
      name={external ? 'arrow.up.right' : 'arrow.right'}
      size={size}
      weight="semibold"
      tintColor={t.primary}
      fallback={<AppText style={{ color: t.primary }}>{external ? '↗' : '→'}</AppText>}
    />
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.three },
  index: { borderTopWidth: StyleSheet.hairlineWidth },
  row: {
    minHeight: MinTapTarget + 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  text: { flex: 1, gap: 3 },
  tile: { borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  // The site's index title is text-2xl bold; 19 keeps a long tool name on one line here.
  title: { fontFamily: Fonts.bold, fontSize: 19, lineHeight: 24, letterSpacing: -0.3 },
  subtitle: { fontSize: 15, lineHeight: 21 },
  fact: { minHeight: MinTapTarget + 8, paddingVertical: Spacing.two + 4 },
  factLabel: { fontSize: 16, lineHeight: 22 },
  factValue: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 22, fontVariant: ['tabular-nums'] },
  factStrong: { fontFamily: Fonts.bold, fontSize: 17, lineHeight: 22, fontVariant: ['tabular-nums'] },
});
