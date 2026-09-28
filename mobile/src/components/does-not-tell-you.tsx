import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Card } from '@/components/ui';
import { MinTapTarget, Spacing } from '@/constants/theme';

/**
 * The standard "What this does not tell you" block (PRD 14.3 rule 4, 14.6). Every tool
 * gets one. Limitations are part of the method, not an apology.
 */
export function DoesNotTellYou({ items }: { items: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.toggle}>
        <AppText variant="heading">What this does not tell you</AppText>
        <AppText variant="heading" muted>
          {open ? '−' : '+'}
        </AppText>
      </Pressable>
      {open ? (
        <View style={styles.list}>
          {items.map((item) => (
            <AppText key={item} muted>
              • {item}
            </AppText>
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
  list: { gap: Spacing.two },
});
