import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ListGroup, ListItem } from '@/components/list-row';
import { AppText, Button } from '@/components/ui';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { dayIn, useCopy, useLanguage } from '@/i18n';
import { money, pct } from '@/lib/format';
import { announce } from '@/lib/announce';

import { costOf, deleteCheck, fetchChecks, type SavedCheck } from '@/lib/saved';

/** Receipts saved from TrueCost, newest first, on the Account tab (DECISIONS.md D58). */
export function SavedChecks() {
  const t = useTheme();
  const copy = useCopy();
  const { language } = useLanguage();
  const sv = copy.saved;
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
    Alert.alert(sv.deleteCheckTitle, `${c.provider_name}, ${dayIn(language, c.sent_on)}`, [
      { text: copy.common.cancel, style: 'cancel' },
      {
        text: copy.common.delete,
        style: 'destructive',
        onPress: async () => {
          if (await deleteCheck(c.id)) {
            setChecks((all) => all?.filter((x) => x.id !== c.id) ?? null);
            announce(sv.checkDeleted);
          }
        },
      },
    ]);

  if (checks === null) return null;
  if (checks.length === 0) {
    return (
      <ListGroup title={sv.checks}>
        <ListItem style={styles.empty}>
          <AppText muted>{sv.checksEmpty}</AppText>
          <Button label={sv.checkReceipt} variant="secondary" onPress={() => router.push('/true-cost')} />
        </ListItem>
      </ListGroup>
    );
  }

  return (
    <ListGroup title={sv.checks}>
      {checks.map((c) => {
        const cost = costOf(c);
        return (
          <ListItem
            key={c.id}
            onPress={() => confirmDelete(c)}
            accessibilityHint={sv.offersDelete}>
            <View style={styles.text}>
              <AppText style={[styles.title, { color: t.text }]}>
                {sv.checkTitle(c.provider_name, money(c.sent, c.send_currency), c.receive_currency)}
              </AppText>
              <AppText variant="small" muted>
                {dayIn(language, c.sent_on)}
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
