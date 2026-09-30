import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { FlagSlot } from '@/components/flag';
import { Arrow, ListGroup, ListItem } from '@/components/list-row';
import { AppText, Button } from '@/components/ui';
import { Fonts, MinTapTarget, Spacing } from '@/constants/theme';
import { useIconSize } from '@/hooks/use-icon-size';
import { useTheme } from '@/hooks/use-theme';
import { deleteComparison, fetchComparisons, type SavedComparison } from '@/lib/comparisons';
import { announce } from '@/lib/announce';
import { money } from '@/lib/format';
import { openCompare } from '@/lib/open-compare';
import { DELIVERY_LABELS, ROUTES } from '@/lib/routes';

/**
 * Comparisons saved from Compare, newest first, on the Account tab (D66). A tap reopens
 * Compare on the route, amount and method with today's prices; the bin beside it deletes.
 */
export function SavedComparisons() {
  const t = useTheme();
  const iconSize = useIconSize(18);
  const [saved, setSaved] = useState<SavedComparison[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      let live = true;
      fetchComparisons().then((c) => live && setSaved(c));
      return () => {
        live = false;
      };
    }, []),
  );

  const open = (c: SavedComparison) =>
    openCompare({ routeId: c.route_id, amount: c.send_amount, method: c.delivery_method });

  const confirmDelete = (c: SavedComparison, name: string) =>
    Alert.alert('Delete this comparison?', name, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (await deleteComparison(c.id)) {
            setSaved((all) => all?.filter((x) => x.id !== c.id) ?? null);
            announce('Comparison deleted.');
          }
        },
      },
    ]);

  if (saved === null) return null;
  if (saved.length === 0) {
    return (
      <ListGroup title="Your comparisons">
        <ListItem style={styles.empty}>
          <AppText muted>Save a comparison on Compare to reopen it here in one tap.</AppText>
          <Button label="Compare prices" variant="secondary" onPress={() => router.navigate('/')} />
        </ListItem>
      </ListGroup>
    );
  }

  return (
    <ListGroup title="Your comparisons">
      {saved.map((c) => {
        const route = ROUTES.find((r) => r.id === c.route_id);
        const name = `${money(c.send_amount, route?.sendCurrency ?? 'USD').replace('.00', '')} to ${route?.country ?? c.route_id}`;
        return (
          // Two targets in one row: the comparison opens it, the bin deletes it. Deleting
          // used to be press-and-hold only, which many people can't do or never find.
          <ListItem key={c.id} style={styles.row}>
            <Pressable
              onPress={() => open(c)}
              accessibilityRole="button"
              accessibilityLabel={`${name}, ${DELIVERY_LABELS[c.delivery_method]}`}
              accessibilityHint="Opens Compare with today’s prices"
              style={({ pressed }) => [styles.open, { opacity: pressed ? 0.6 : 1 }]}>
              <FlagSlot code={c.route_id.split('-')[1] ?? ''} />
              <View style={styles.text}>
                <AppText style={[styles.title, { color: t.text }]}>{name}</AppText>
                <AppText variant="small" muted>
                  {DELIVERY_LABELS[c.delivery_method]}
                </AppText>
              </View>
              <Arrow />
            </Pressable>
            <Pressable
              onPress={() => confirmDelete(c, name)}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${name}`}
              hitSlop={4}
              style={({ pressed }) => [styles.delete, { opacity: pressed ? 0.6 : 1 }]}>
              <SymbolView pointerEvents="none" name="trash" size={iconSize} tintColor={t.textSecondary} fallback={null} />
            </Pressable>
          </ListItem>
        );
      })}
    </ListGroup>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 0 },
  open: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.three },
  delete: { width: MinTapTarget, height: MinTapTarget, alignItems: 'center', justifyContent: 'center' },
  empty: { flexDirection: 'column', alignItems: 'stretch' },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: Fonts.bold, fontSize: 16, lineHeight: 21 },
});
