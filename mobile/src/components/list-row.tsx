import { SymbolView, type SFSymbol } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** A grouped list: one bordered card, rows divided by hairlines (the Tools and Learn tabs). */
export function ListGroup({ title, children }: { title?: string; children: ReactNode }) {
  const t = useTheme();
  return (
    <View style={styles.group}>
      {title ? (
        <AppText variant="label" muted>
          {title}
        </AppText>
      ) : null}
      <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>{children}</View>
    </View>
  );
}

/**
 * One destination: an icon on a mint tile, a title, one line saying what it's for, and a
 * chevron (or an arrow for pages that open on the website).
 */
export function ListRow({
  icon,
  title,
  subtitle,
  onPress,
  external,
  first,
}: {
  icon: SFSymbol;
  title: string;
  subtitle: string;
  onPress: () => void;
  external?: boolean;
  first?: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={external ? 'link' : 'button'}
      accessibilityLabel={`${title}. ${subtitle}`}
      accessibilityHint={external ? 'Opens on the website' : undefined}
      style={({ pressed }) => [
        styles.row,
        !first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border },
        { backgroundColor: pressed ? t.muted : 'transparent' },
      ]}>
      <View style={[styles.tile, { backgroundColor: t.accent }]}>
        <SymbolView
          pointerEvents="none"
          name={icon}
          size={18}
          weight="semibold"
          tintColor={t.accentForeground}
          fallback={null}
        />
      </View>
      <View style={styles.text}>
        <AppText variant="label" style={styles.title}>
          {title}
        </AppText>
        <AppText variant="small" muted>
          {subtitle}
        </AppText>
      </View>
      <SymbolView
        pointerEvents="none"
        name={external ? 'arrow.up.right' : 'chevron.right'}
        size={13}
        weight="semibold"
        tintColor={t.textSecondary}
        fallback={<AppText muted>›</AppText>}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.two },
  card: { borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: {
    minHeight: MinTapTarget + 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  tile: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  title: { fontSize: 16 },
});
