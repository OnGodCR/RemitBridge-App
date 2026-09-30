import { SymbolView } from 'expo-symbols';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui';
import { Fonts, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { TERMS } from '@/data/glossary';
import { useIconSize } from '@/hooks/use-icon-size';
import { useTheme } from '@/hooks/use-theme';
import { track } from '@/lib/track';

/**
 * The glossary (DECISIONS.md D33, D58), searchable by term or definition. Other screens link
 * to a term ("What's a markup?"); it opens with that term searched, so it's the first thing
 * on screen, and clearing the search shows them all. Terms are the website's divided list.
 */
export default function GlossaryScreen() {
  const t = useTheme();
  const { term } = useLocalSearchParams<{ term?: string }>();
  const [query, setQuery] = useState(() => TERMS.find((x) => x.id === term)?.term ?? '');
  const iconSize = useIconSize(15);
  useEffect(() => track('learn_opened', { page: 'glossary' }), []);

  const q = query.trim().toLowerCase();
  const shown = q
    ? TERMS.filter((x) => x.term.toLowerCase().includes(q) || x.plain.toLowerCase().includes(q)).sort(
        (a, b) => Number(!a.term.toLowerCase().includes(q)) - Number(!b.term.toLowerCase().includes(q)),
      )
    : TERMS;

  return (
    <>
      {/* Dark text: the tab this was opened from had set it light for its green band. */}
      <StatusBar style="auto" />
      <FlatList
        style={{ backgroundColor: t.background }}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        data={shown}
        keyExtractor={(x) => x.id}
        ListHeaderComponent={
          <View style={[styles.search, { backgroundColor: t.card, borderColor: t.border }]}>
            <SymbolView
              pointerEvents="none"
              name="magnifyingglass"
              size={iconSize}
              weight="medium"
              tintColor={t.textSecondary}
              fallback={null}
            />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={`Search ${TERMS.length} terms`}
              placeholderTextColor={t.textSecondary}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
              accessibilityLabel="Search the glossary"
              maxFontSizeMultiplier={2}
              style={[styles.searchInput, { color: t.text }]}
            />
          </View>
        }
        ListEmptyComponent={<AppText muted>No term matches “{query.trim()}”.</AppText>}
        renderItem={({ item }) => (
          <View style={[styles.term, { borderBottomColor: t.border }]}>
            <AppText accessibilityRole="header" style={[styles.termName, { color: t.text }]}>
              {item.term}
            </AppText>
            <AppText style={[styles.plain, { color: t.textSecondary }]}>{item.plain}</AppText>
          </View>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, paddingBottom: Spacing.six },
  search: {
    minHeight: MinTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: { flex: 1, fontFamily: Fonts.medium, fontSize: 16, paddingVertical: Spacing.two },
  term: { borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: Spacing.three, gap: Spacing.one },
  termName: { fontFamily: Fonts.bold, fontSize: 18, lineHeight: 23 },
  plain: { fontSize: 16, lineHeight: 23 },
});
