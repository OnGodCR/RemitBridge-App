import { useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { FlagSlot } from '@/components/flag';
import { ListGroup, ListItem } from '@/components/list-row';
import { AppText } from '@/components/ui';
import { Fonts, MinTapTarget, Spacing } from '@/constants/theme';
import { useIconSize } from '@/hooks/use-icon-size';
import { useTheme } from '@/hooks/use-theme';
import { countryIn, useCopy } from '@/i18n';
import { announce } from '@/lib/announce';
import { money } from '@/lib/format';
import { openCompare } from '@/lib/open-compare';
import { deleteAlert, fetchAlerts, type RateAlert } from '@/lib/rate-alerts';
import { ROUTES } from '@/lib/routes';

/**
 * The rate alerts turned on from Compare (D113), on the Saved screen: each opens Compare on
 * its route, and the bin beside it deletes it. Shown only once there's at least one.
 */
export function RateAlerts() {
  const t = useTheme();
  const copy = useCopy();
  const a = copy.alerts;
  const iconSize = useIconSize(18);
  const [alerts, setAlerts] = useState<RateAlert[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      let live = true;
      fetchAlerts().then((x) => live && setAlerts(x));
      return () => {
        live = false;
      };
    }, []),
  );

  if (!alerts?.length) return null;

  const confirmDelete = (x: RateAlert, name: string) =>
    Alert.alert(a.deleteNamed(name), undefined, [
      { text: copy.common.cancel, style: 'cancel' },
      {
        text: copy.common.delete,
        style: 'destructive',
        onPress: async () => {
          if (await deleteAlert(x.id)) {
            setAlerts((all) => all?.filter((y) => y.id !== x.id) ?? null);
            announce(a.deleted);
          }
        },
      },
    ]);

  return (
    <ListGroup title={a.yours}>
      {alerts.map((x) => {
        const route = ROUTES.find((r) => r.id === x.route_id);
        const code = x.route_id.split('-')[1] ?? '';
        const name = a.row(
          money(x.send_amount, route?.sendCurrency ?? 'USD').replace('.00', ''),
          countryIn(copy, code),
          money(x.target_received, route?.receiveCurrency ?? 'USD'),
        );
        return (
          <ListItem key={x.id} style={styles.row}>
            <Pressable
              onPress={() => openCompare({ routeId: x.route_id, amount: x.send_amount, method: x.delivery_method })}
              accessibilityRole="button"
              accessibilityLabel={`${name}, ${copy.delivery[x.delivery_method]}`}
              style={({ pressed }) => [styles.open, { opacity: pressed ? 0.6 : 1 }]}>
              <FlagSlot code={code} />
              <View style={styles.text}>
                <AppText style={[styles.title, { color: t.text }]}>{name}</AppText>
                <AppText variant="small" muted>
                  {x.channel === 'whatsapp' ? `${copy.delivery[x.delivery_method]} · ${a.byWhatsApp}` : copy.delivery[x.delivery_method]}
                </AppText>
              </View>
              <SymbolView
                pointerEvents="none"
                name={x.channel === 'whatsapp' ? 'message.fill' : 'bell.fill'}
                size={iconSize}
                tintColor={t.primary}
                fallback={null}
              />
            </Pressable>
            <Pressable
              onPress={() => confirmDelete(x, name)}
              accessibilityRole="button"
              accessibilityLabel={a.deleteNamed(name)}
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
  text: { flex: 1, gap: 2 },
  title: { fontFamily: Fonts.bold, fontSize: 16, lineHeight: 21 },
});
