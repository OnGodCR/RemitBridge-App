import { Icon } from '@/components/icon';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Card } from '@/components/ui';
import { MinTapTarget, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';

/**
 * The standard "What this does not tell you" block (PRD 14.3 rule 4, 14.6). Every tool
 * gets one. Limitations are part of the method, not an apology.
 */
export function DoesNotTellYou({ items }: { items: string[] }) {
  const t = useTheme();
  const copy = useCopy();
  const [open, setOpen] = useState(false);
  return (
    <Card style={{ backgroundColor: t.accent, borderColor: t.accent }}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.toggle}>
        <AppText variant="heading" style={{ color: t.accentForeground }}>
          {copy.limitsBlock.heading}
        </AppText>
        <Icon
          pointerEvents="none"
          name={open ? 'chevron.up' : 'chevron.down'}
          size={13}
          weight="semibold"
          tintColor={t.accentForeground}
          fallback={<AppText muted>{open ? '−' : '+'}</AppText>}
        />
      </Pressable>
      {open ? (
        <View>
          {items.map((item) => (
            <View
              key={item}
              style={[styles.item, { borderTopColor: t.border }]}>
              <AppText muted>{item}</AppText>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  toggle: {
    minHeight: MinTapTarget,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  item: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: Spacing.two },
});
