import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Eyebrow } from '@/components/brand';
import { FlagSlot } from '@/components/flag';
import { ListGroup, ListItem } from '@/components/list-row';
import { AppText, Button } from '@/components/ui';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { countryName } from '@/lib/countries';
import { fetchBoard, type BoardEntry, type RouteStatus } from '@/lib/requests';
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
const STAGES: { status: RouteStatus; title: string; about: string; filled: boolean }[] = [
  { status: 'live', title: 'Live', about: 'Prices checked and published.', filled: true },
  { status: 'building', title: 'Being built', about: 'We’re setting up price checks.', filled: true },
  { status: 'under_review', title: 'Under review', about: 'We’re checking whether we can cover it.', filled: false },
  { status: 'requested', title: 'Requested', about: 'Asked for by people using RemitBridge.', filled: false },
  { status: 'not_feasible', title: 'Not feasible', about: 'We looked, and can’t cover it for now.', filled: false },
];

export default function RouteBoard() {
  const t = useTheme();
  const [board, setBoard] = useState<{ entries: BoardEntry[]; counted: boolean } | 'error' | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
        Where RemitBridge checks prices, and where people have asked us to. Requests decide what we add next.
      </AppText>

      {board === null ? <ActivityIndicator style={styles.loading} /> : null}
      {board === 'error' ? (
        <AppText style={{ color: t.textSecondary }}>The board didn’t load. Pull down to try again.</AppText>
      ) : null}

      {board && board !== 'error' && !board.counted ? (
        <AppText style={{ color: t.textSecondary }}>Request counts didn’t load, so requested routes aren’t shown.</AppText>
      ) : null}

      {board && board !== 'error'
        ? STAGES.map((stage) => {
            const rows = board.entries
              .filter((e) => e.status === stage.status)
              .sort((a, b) => b.requests - a.requests || countryName(a.to).localeCompare(countryName(b.to)));
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
                    <Eyebrow>{stage.title}</Eyebrow>
                  </View>
                  <AppText variant="small" style={{ color: t.textSecondary }}>
                    {stage.about}
                  </AppText>
                </View>
                <ListGroup>
                  {rows.length === 0 ? (
                    <ListItem>
                      <AppText style={{ color: t.textSecondary }}>
                        No requests yet. Pick any country on Compare to ask for it.
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

      <Button label="Ask for a route" onPress={() => router.push('/request-route')} />
    </ScrollView>
  );
}

function BoardRow({ entry: e }: { entry: BoardEntry }) {
  const t = useTheme();
  const asked = e.requests === 1 ? '1 request' : `${e.requests.toLocaleString()} requests`;
  return (
    <ListItem>
      <FlagSlot code={e.to} />
      <View style={styles.rowText}>
        <AppText style={[styles.country, { color: t.text }]}>{countryName(e.to)}</AppText>
        <AppText variant="small" style={{ color: t.textSecondary }}>
          From {e.from === 'US' ? 'the US' : countryName(e.from)}
          {e.requests > 0 ? ` · ${asked}` : ''}
        </AppText>
        {e.status === 'not_feasible' && e.reason ? (
          <AppText variant="small" style={{ color: t.textSecondary }}>
            {e.reason}
          </AppText>
        ) : null}
      </View>
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
