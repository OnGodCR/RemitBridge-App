import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui';
import { Fonts, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { TERMS } from '@/data/glossary';
import { useTheme } from '@/hooks/use-theme';
import { track } from '@/lib/track';

/** The glossary (DECISIONS.md D33, D58), searchable by term or definition. */
export default function GlossaryScreen() {
  const t = useTheme();
  const [query, setQuery] = useState('');
  useEffect(() => track('learn_opened', { page: 'glossary' }), []);

  const q = query.trim().toLowerCase();
  const shown = q
    ? TERMS.filter((x) => x.term.toLowerCase().includes(q) || x.plain.toLowerCase().includes(q)).sort(
        (a, b) => Number(!a.term.toLowerCase().includes(q)) - Number(!b.term.toLowerCase().includes(q)),
      )
    : TERMS;

  return (
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
            size={15}
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
            style={[styles.searchInput, { color: t.text }]}
          />
        </View>
      }
      ListEmptyComponent={<AppText muted>No term matches “{query.trim()}”.</AppText>}
      renderItem={({ item }) => (
        <View style={[styles.term, { backgroundColor: t.card, borderColor: t.border }]}>
          <AppText variant="heading">{item.term}</AppText>
          <AppText muted>{item.plain}</AppText>
        </View>
      )}
      ItemSeparatorComponent={() => <View style={styles.gap} />}
    />
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
  term: { borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.three, gap: Spacing.one },
  gap: { height: Spacing.two },
});
