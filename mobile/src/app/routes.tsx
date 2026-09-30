import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Eyebrow } from '@/components/brand';
import { FlagSlot } from '@/components/flag';
import { Arrow, ListGroup, ListItem } from '@/components/list-row';
import { AppText, Button, TextLink } from '@/components/ui';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useIsAdmin } from '@/lib/admin';
import { countryIn, useCopy } from '@/i18n';
import { countryName } from '@/lib/countries';
import { openCompare } from '@/lib/open-compare';
import { countWaiting, fetchBoard, sendLaunchEmails, type BoardEntry, type RouteStatus } from '@/lib/requests';
import { routeFor } from '@/lib/routes';
import { track } from '@/lib/track';

/**
 * The route board (PRD 6.7, 14.7 screen 5): every route we check or have been asked for,
 * with its status and how many people asked. It shows demand in the open, and it's also
 * where anyone can see that a route is still being built rather than guessing why it has
 * no prices.
 *
 * Status follows the website's rule: small caps and a dot, filled once work has started,
 * hollow before. Never a pill.
 */
const STAGES: { status: RouteStatus; filled: boolean }[] = [
  { status: 'live', filled: true },
  { status: 'building', filled: true },
  { status: 'under_review', filled: false },
  { status: 'requested', filled: false },
  { status: 'not_feasible', filled: false },
];

export default function RouteBoard() {
  const t = useTheme();
  const copy = useCopy();
  const isAdmin = useIsAdmin();
  const [board, setBoard] = useState<{ entries: BoardEntry[]; counted: boolean } | 'error' | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  // Memoized so the admin section below only recounts when the board itself reloads.
  const live = useMemo(
    () => (board && board !== 'error' ? board.entries.filter((e) => e.status === 'live') : []),
    [board],
  );

  const load = useCallback(async () => {
    const b = await fetchBoard();
    setBoard(b ?? 'error');
  }, []);

  useFocusEffect(
    useCallback(() => {
      track('learn_opened', { page: 'route_board' });
      load();
    }, [load]),
  );

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={[styles.fill, { backgroundColor: t.background }]}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
      <StatusBar style="auto" />
      <AppText style={[styles.lede, { color: t.textSecondary }]}>
        {copy.board.lede}
      </AppText>

      {board === null ? <ActivityIndicator style={styles.loading} /> : null}
      {board === 'error' ? (
        <AppText style={{ color: t.textSecondary }}>{copy.board.failed}</AppText>
      ) : null}

      {board && board !== 'error' && !board.counted ? (
        <AppText style={{ color: t.textSecondary }}>{copy.board.countsFailed}</AppText>
      ) : null}

      {board && board !== 'error'
        ? STAGES.map((stage) => {
            const rows = board.entries
              .filter((e) => e.status === stage.status)
              .sort((a, b) => b.requests - a.requests || countryIn(copy, a.to).localeCompare(countryIn(copy, b.to)));
            if (rows.length === 0 && (stage.status !== 'requested' || !board.counted)) return null;
            return (
              <View key={stage.status} style={styles.stage}>
                <View style={styles.stageHead}>
                  <View style={styles.statusLine}>
                    <View
                      style={[
                        styles.dot,
                        { borderColor: t.primary, backgroundColor: stage.filled ? t.primary : 'transparent' },
                      ]}
                    />
                    <Eyebrow header>{copy.board.stages[stage.status].title}</Eyebrow>
                  </View>
                  <AppText variant="small" style={{ color: t.textSecondary }}>
                    {copy.board.stages[stage.status].about}
                  </AppText>
                </View>
                <ListGroup>
                  {rows.length === 0 ? (
                    <ListItem>
                      <AppText style={{ color: t.textSecondary }}>
                        {copy.board.noRequests}
                      </AppText>
                    </ListItem>
                  ) : (
                    rows.map((e) => <BoardRow key={`${e.from}-${e.to}`} entry={e} />)
                  )}
                </ListGroup>
              </View>
            );
          })
        : null}

      <Button label={copy.board.ask} onPress={() => router.push('/request-route')} />

      {isAdmin && live.length > 0 ? <LaunchEmails live={live} /> : null}
    </ScrollView>
  );
}

/**
 * Admins only: the launch emails owed for live routes (D67). Each route shows how many
 * people are waiting to hear, and sends their one email on request.
 */
function LaunchEmails({ live }: { live: BoardEntry[] }) {
  const t = useTheme();
  const [waiting, setWaiting] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    let on = true;
    Promise.all(live.map(async (e) => [`${e.from}-${e.to}`, await countWaiting(e.from, e.to)] as const)).then(
      (pairs) => on && setWaiting(Object.fromEntries(pairs.filter(([, n]) => n > 0))),
    );
    return () => {
      on = false;
    };
  }, [live]);

  if (!waiting || Object.keys(waiting).length === 0) return null;

  const send = (key: string, n: number) =>
    Alert.alert(`Email ${n} ${n === 1 ? 'person' : 'people'}?`, 'Each gets one email saying the route is live, and their address is deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Send',
        onPress: async () => {
          const result = await sendLaunchEmails(key.toLowerCase());
          if (typeof result === 'string') return Alert.alert('Not sent', result);
          Alert.alert(
            result.reason ? 'Not sent' : 'Sent',
            result.reason ?? `${result.sent} sent${result.failed ? `, ${result.failed} failed` : ''}.`,
          );
          setWaiting((w) => (w ? { ...w, [key]: result.failed } : w));
        },
      },
    ]);

  return (
    <ListGroup title="Launch emails (admin)">
      {Object.entries(waiting).map(([key, n]) => (
        <ListItem key={key}>
          <View style={styles.rowText}>
            <AppText style={[styles.country, { color: t.text }]}>{countryName(key.split('-')[1])}</AppText>
            <AppText variant="small" style={{ color: t.textSecondary }}>
              {n} waiting to hear it’s live
            </AppText>
          </View>
          <TextLink label="Send" arrow={false} onPress={() => send(key, n)} />
        </ListItem>
      ))}
    </ListGroup>
  );
}

function BoardRow({ entry: e }: { entry: BoardEntry }) {
  const t = useTheme();
  const copy = useCopy();
  const asked = copy.board.requests(e.requests);
  const toName = countryIn(copy, e.to);
  const fromName = e.from === 'US' ? copy.common.theUS : countryIn(copy, e.from);
  // A route the app can compare opens there; the rest are information only.
  const route = routeFor(e.from, e.to);
  return (
    <ListItem
      onPress={route ? () => openCompare({ routeId: route.id }) : undefined}
      accessibilityLabel={`${toName}. ${copy.board.fromCountry(fromName)}${e.requests > 0 ? `. ${asked}` : ''}`}
      accessibilityHint={route ? copy.board.opensCompare : undefined}>
      <FlagSlot code={e.to} />
      <View style={styles.rowText}>
        <AppText style={[styles.country, { color: t.text }]}>{toName}</AppText>
        <AppText variant="small" style={{ color: t.textSecondary }}>
          {copy.board.fromCountry(fromName)}
          {e.requests > 0 ? ` · ${asked}` : ''}
        </AppText>
        {e.status === 'not_feasible' && e.reason ? (
          <AppText variant="small" style={{ color: t.textSecondary }}>
            {e.reason}
          </AppText>
        ) : null}
      </View>
      {route ? <Arrow /> : null}
    </ListItem>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.five, paddingBottom: Spacing.six },
  lede: { fontSize: 16, lineHeight: 23 },
  loading: { marginVertical: Spacing.four },
  stage: { gap: Spacing.three },
  stageHead: { gap: Spacing.one },
  statusLine: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  dot: { width: 9, height: 9, borderRadius: 5, borderWidth: 1.5 },
  rowText: { flex: 1, gap: 2 },
  country: { fontFamily: Fonts.bold, fontSize: 17 },
});
