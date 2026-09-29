import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ListGroup } from '@/components/list-row';
import { AppText, Button } from '@/components/ui';
import { MinTapTarget, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { money, pct } from '@/lib/format';
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
          if (await deleteCheck(c.id)) setChecks((all) => all?.filter((x) => x.id !== c.id) ?? null);
        },
      },
    ]);

  if (checks === null) return null;
  if (checks.length === 0) {
    return (
      <ListGroup title="Your checks">
        <View style={styles.empty}>
          <AppText muted>Receipts you check with TrueCost and save show up here.</AppText>
          <Button label="Check a receipt" variant="secondary" onPress={() => router.push('/true-cost')} />
        </View>
      </ListGroup>
    );
  }

  return (
    <ListGroup title="Your checks">
      {checks.map((c, i) => {
        const cost = costOf(c);
        return (
          <Pressable
            key={c.id}
            onPress={() => confirmDelete(c)}
            accessibilityRole="button"
            accessibilityHint="Offers to delete this check"
            style={({ pressed }) => [
              styles.row,
              i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border },
              { backgroundColor: pressed ? t.muted : 'transparent' },
            ]}>
            <View style={styles.text}>
              <AppText variant="label" style={styles.title}>
                {c.provider_name} · {money(c.sent, c.send_currency)} to {c.receive_currency}
              </AppText>
              <AppText variant="small" muted>
                {formatDay(c.sent_on)}
              </AppText>
            </View>
            {cost ? (
              <View style={styles.cost}>
                <AppText variant="label" style={{ color: t.moneyMarkup }}>
                  {money(cost.totalCost, c.send_currency)}
                </AppText>
                <AppText variant="small" muted>
                  {pct(cost.totalCostPct, 2)}
                </AppText>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ListGroup>
  );
}

const styles = StyleSheet.create({
  empty: { padding: Spacing.three, gap: Spacing.three },
  row: {
    minHeight: MinTapTarget + 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  text: { flex: 1, gap: 2 },
  title: { fontSize: 15 },
  cost: { alignItems: 'flex-end', gap: 2 },
});
