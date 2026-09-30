import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ListGroup, ListItem } from '@/components/list-row';
import { AppText, Button } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { money, pct } from '@/lib/format';
import { announce } from '@/lib/announce';
import { formatDay } from '@/lib/fx';
import { costOf, deleteCheck, fetchChecks, type SavedCheck } from '@/lib/saved';

/** Receipts saved from TrueCost, newest first, on the Account tab (DECISIONS.md D58). */
export function SavedChecks() {
  const t = useTheme();
  const [checks, setChecks] = useState<SavedCheck[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      let live = true;
      fetchChecks().then((c) => live && setChecks(c));
      return () => {
        live = false;
      };
    }, []),
  );

  const confirmDelete = (c: SavedCheck) =>
    Alert.alert('Delete this check?', `${c.provider_name}, ${formatDay(c.sent_on)}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (await deleteCheck(c.id)) {
            setChecks((all) => all?.filter((x) => x.id !== c.id) ?? null);
            announce('Check deleted.');
          }
        },
      },
    ]);

  if (checks === null) return null;
  if (checks.length === 0) {
    return (
      <ListGroup title="Your checks">
        <ListItem style={styles.empty}>
          <AppText muted>Receipts you check with TrueCost and save show up here.</AppText>
          <Button label="Check a receipt" variant="secondary" onPress={() => router.push('/true-cost')} />
        </ListItem>
      </ListGroup>
    );
  }

  return (
    <ListGroup title="Your checks">
      {checks.map((c) => {
        const cost = costOf(c);
        return (
          <ListItem
            key={c.id}
            onPress={() => confirmDelete(c)}
            accessibilityHint="Offers to delete this check">
            <View style={styles.text}>
              <AppText style={[styles.title, { color: t.text }]}>
                {c.provider_name} · {money(c.sent, c.send_currency)} to {c.receive_currency}
              </AppText>
              <AppText variant="small" muted>
                {formatDay(c.sent_on)}
              </AppText>
            </View>
            {cost ? (
              <View style={styles.cost}>
                <AppText style={[styles.title, { color: t.moneyMarkupText }]}>
                  {money(cost.totalCost, c.send_currency)}
                </AppText>
                <AppText variant="small" muted>
                  {pct(cost.totalCostPct, 2)}
                </AppText>
              </View>
            ) : null}
          </ListItem>
        );
      })}
    </ListGroup>
  );
}

const styles = StyleSheet.create({
  empty: { flexDirection: 'column', alignItems: 'stretch' },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: Fonts.bold, fontSize: 16, lineHeight: 21 },
  cost: { alignItems: 'flex-end', gap: 2 },
});
