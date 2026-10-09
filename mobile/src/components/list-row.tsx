import { Icon, type SFSymbol } from '@/components/icon';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { Eyebrow } from '@/components/brand';
import { AppText } from '@/components/ui';
import { Fonts, MinTapTarget, Spacing } from '@/constants/theme';
import { useIconSize } from '@/hooks/use-icon-size';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';

/**
 * The website's divided index (its home page's "Start here" list), for the Tools, Learn and
 * Account tabs (DECISIONS.md D63): hairline rules above and between, no card. The group's
 * name is an eyebrow, as on the site. Since D103 a row can lead with one of the app's own
 * illustrations (components/illustrations.tsx), or, for settings, a small plain symbol.
 */
export function ListGroup({ title, children, cards }: { title?: string; children: ReactNode; cards?: boolean }) {
  const t = useTheme();
  return (
    <View style={styles.group}>
      {title ? <Eyebrow header>{title}</Eyebrow> : null}
      {/* `cards`: a stack of chunky ListRow cards (D112), with room between, no rule above. */}
      <View style={cards ? styles.cards : [styles.index, { borderTopColor: t.border }]}>{children}</View>
    </View>
  );
}

/**
 * One destination: an illustration or a symbol, a bold title, one short line saying what
 * it's for, and the website's green arrow (up and to the right for website pages). Since
 * D112 it's a chunky card, like Learn's path: it sits on a rim and sinks into it when
 * pressed. Put it in a ListGroup with `cards`.
 */
export function ListRow({
  title,
  subtitle,
  onPress,
  external,
  art,
  icon,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  external?: boolean;
  art?: ReactNode;
  icon?: SFSymbol;
}) {
  const t = useTheme();
  const copy = useCopy();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={external ? 'link' : 'button'}
      accessibilityLabel={`${title}. ${subtitle}`}
      accessibilityHint={external ? copy.learn.opensWebsite : undefined}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: t.card,
          borderColor: t.border,
          borderBottomColor: t.rim,
          borderBottomWidth: pressed ? 1 : RIM + 1,
          marginTop: pressed ? RIM : 0,
        },
      ]}>
      <Lead art={art} icon={icon} />
      <View style={styles.text}>
        <AppText style={[styles.title, { color: t.text }]}>{title}</AppText>
        <AppText style={[styles.subtitle, { color: t.textSecondary }]}>{subtitle}</AppText>
      </View>
      <Arrow external={external} />
    </Pressable>
  );
}

/** A row that says something rather than going somewhere: an illustration, a bold title and plain text. */
export function ListPoint({ title, children, art }: { title: string; children: ReactNode; art?: ReactNode }) {
  const t = useTheme();
  return (
    <ListItem>
      <Lead art={art} />
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
 * What leads a row: an illustration (decorative, so hidden from screen readers), or a
 * small symbol in ink for plain settings rows. No tinted square behind either (D103).
 */
function Lead({ art, icon }: { art?: ReactNode; icon?: SFSymbol }) {
  const t = useTheme();
  const size = useIconSize(20);
  if (art) {
    return (
      <View accessible={false} importantForAccessibility="no-hide-descendants">
        {art}
      </View>
    );
  }
  // A symbol gets a soft disc, matching the drawings beside it.
  if (!icon) return null;
  return (
    <View style={[styles.symbol, { backgroundColor: t.accent }]} accessible={false} importantForAccessibility="no-hide-descendants">
      <Icon pointerEvents="none" name={icon} size={size} weight="medium" tintColor={t.accentForeground} fallback={null} />
    </View>
  );
}

/** The website's ArrowRight, in the brand green. */
export function Arrow({ external }: { external?: boolean }) {
  const t = useTheme();
  const size = useIconSize(17);
  return (
    <Icon
      pointerEvents="none"
      name={external ? 'arrow.up.right' : 'arrow.right'}
      size={size}
      weight="semibold"
      tintColor={t.primary}
      fallback={<AppText style={{ color: t.primary }}>{external ? '↗' : '→'}</AppText>}
    />
  );
}

/** How tall a card row's rim is. */
const RIM = 4;

const styles = StyleSheet.create({
  group: { gap: Spacing.three },
  cards: { gap: Spacing.three },
  card: {
    minHeight: MinTapTarget + 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
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
  symbol: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  // The site's index title is text-2xl bold; 19 keeps a long tool name on one line here.
  title: { fontFamily: Fonts.bold, fontSize: 19, lineHeight: 24, letterSpacing: -0.3 },
  subtitle: { fontSize: 15, lineHeight: 21 },
  fact: { minHeight: MinTapTarget + 8, paddingVertical: Spacing.two + 4 },
  factLabel: { fontSize: 16, lineHeight: 22 },
  factValue: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 22, fontVariant: ['tabular-nums'] },
  factStrong: { fontFamily: Fonts.bold, fontSize: 17, lineHeight: 22, fontVariant: ['tabular-nums'] },
});
