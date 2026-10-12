import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ListGroup } from '@/components/list-row';
import { AppText, Segmented, TextLink } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { EnglishOnly } from '@/i18n';
import { supabase } from '@/lib/supabase';

/**
 * Suggestions people sent through the WhatsApp bot (D159): what they asked for, when, and
 * in which language, newest first, with no phone number (there isn't one to show). Admins
 * only: the table's RLS returns nothing to anyone else. Marking one done or declined is
 * just for keeping track; nobody is notified.
 */
type Status = 'new' | 'read' | 'done' | 'declined';
interface Suggestion {
  id: number;
  text: string;
  language: string;
  source: string;
  status: Status;
  created_at: string;
}

const FILTERS = [
  { value: 'open', label: 'Open' },
  { value: 'all', label: 'All' },
];

async function fetchSuggestions(filter: 'open' | 'all'): Promise<Suggestion[] | 'error'> {
  if (!supabase) return 'error';
  let q = supabase.from('suggestions').select('id, text, language, source, status, created_at').order('created_at', { ascending: false }).limit(200);
  if (filter === 'open') q = q.in('status', ['new', 'read']);
  const { data, error } = await q;
  return error ? 'error' : ((data ?? []) as Suggestion[]);
}

function SuggestionsScreen() {
  const t = useTheme();
  const [filter, setFilter] = useState<'open' | 'all'>('open');
  const [rows, setRows] = useState<Suggestion[] | 'error' | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => setRows(await fetchSuggestions(filter)), [filter]);

  useEffect(() => {
    let live = true;
    fetchSuggestions(filter).then((value) => live && setRows(value));
    return () => {
      live = false;
    };
  }, [filter]);

  const mark = async (id: number, status: Status) => {
    if (!supabase) return;
    await supabase.from('suggestions').update({ status }).eq('id', id);
    load();
  };

  return (
    <ScrollView
      style={{ backgroundColor: t.background }}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
        />
      }>
      <StatusBar style="auto" />
      <Segmented options={FILTERS} value={filter} onChange={(v) => setFilter(v as 'open' | 'all')} />
      {rows === null ? <ActivityIndicator /> : null}
      {rows === 'error' ? <AppText muted>Suggestions didn’t load. Pull down to try again.</AppText> : null}
      {Array.isArray(rows) && rows.length === 0 ? <AppText muted>No suggestions yet.</AppText> : null}
      {Array.isArray(rows) && rows.length ? (
        <ListGroup title={`${rows.length} ${filter === 'open' ? 'open' : 'in all'}`}>
          {rows.map((s) => (
            <View key={s.id} style={[styles.row, { borderBottomColor: t.border }]}>
              <AppText>{s.text}</AppText>
              <AppText variant="small" muted>
                {new Date(s.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} ·{' '}
                {s.source} · {s.language} · {s.status}
              </AppText>
              <View style={styles.actions}>
                {s.status !== 'done' ? <TextLink label="Done" arrow={false} onPress={() => mark(s.id, 'done')} /> : null}
                {s.status !== 'declined' ? <TextLink label="Decline" arrow={false} onPress={() => mark(s.id, 'declined')} /> : null}
                {s.status === 'new' ? <TextLink label="Mark read" arrow={false} onPress={() => mark(s.id, 'read')} /> : null}
              </View>
            </View>
          ))}
        </ListGroup>
      ) : null}
    </ScrollView>
  );
}

/** Admin-only, so English whatever the app's language (DECISIONS.md D69). */
export default function SuggestionsScreenRoute() {
  return (
    <EnglishOnly>
      <SuggestionsScreen />
    </EnglishOnly>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  row: { paddingVertical: Spacing.two, gap: Spacing.one, borderBottomWidth: StyleSheet.hairlineWidth },
  actions: { flexDirection: 'row', gap: Spacing.three },
});
