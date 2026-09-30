import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { FlagSlot } from '@/components/flag';
import { Arrow, ListGroup, ListItem } from '@/components/list-row';
import { AppText, Button } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { deleteComparison, fetchComparisons, type SavedComparison } from '@/lib/comparisons';
import { money } from '@/lib/format';
import { openCompare } from '@/lib/open-compare';
import { DELIVERY_LABELS, ROUTES } from '@/lib/routes';

/**
 * Comparisons saved from Compare, newest first, on the Account tab (D66). A tap reopens
 * Compare on the route, amount and method with today's prices; pressing and holding offers
 * to delete it.
 */
export function SavedComparisons() {
  const t = useTheme();
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
          if (await deleteComparison(c.id)) setSaved((all) => all?.filter((x) => x.id !== c.id) ?? null);
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
    <View style={styles.wrap}>
      <ListGroup title="Your comparisons">
        {saved.map((c) => {
          const route = ROUTES.find((r) => r.id === c.route_id);
          const name = `${money(c.send_amount, route?.sendCurrency ?? 'USD').replace('.00', '')} to ${route?.country ?? c.route_id}`;
          return (
            <ListItem
              key={c.id}
              onPress={() => open(c)}
              onLongPress={() => confirmDelete(c, name)}
              accessibilityLabel={`${name}, ${DELIVERY_LABELS[c.delivery_method]}`}
              accessibilityHint="Opens Compare with today’s prices. Press and hold to delete."
              accessibilityActions={[{ name: 'delete', label: 'Delete' }]}
              onAccessibilityAction={(e) => e.nativeEvent.actionName === 'delete' && confirmDelete(c, name)}>
              <FlagSlot code={c.route_id.split('-')[1] ?? ''} />
              <View style={styles.text}>
                <AppText style={[styles.title, { color: t.text }]}>{name}</AppText>
                <AppText variant="small" muted>
                  {DELIVERY_LABELS[c.delivery_method]}
                </AppText>
              </View>
              <Arrow />
            </ListItem>
          );
        })}
      </ListGroup>
      <AppText variant="small" muted>
        Press and hold one to delete it.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  empty: { flexDirection: 'column', alignItems: 'stretch' },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: Fonts.bold, fontSize: 16, lineHeight: 21 },
});
