import { Icon } from '@/components/icon';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui';
import { Fonts, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { TERMS } from '@/data/glossary';
import { TERM_TRANSLATIONS, termIn } from '@/data/glossary-translations';
import { useIconSize } from '@/hooks/use-icon-size';
import { useGutter } from '@/hooks/use-gutter';
import { useTheme } from '@/hooks/use-theme';
import { useCopy, useLanguage } from '@/i18n';
import { track } from '@/lib/track';

/**
 * The glossary (DECISIONS.md D33, D58), searchable by term or definition. Other screens link
 * to a term ("What's a markup?"); it opens with that term searched, so it's the first thing
 * on screen, and clearing the search shows them all. Terms are the website's divided list.
 */
export default function GlossaryScreen() {
  const t = useTheme();
  const gutter = useGutter();
  const copy = useCopy();
  const { language } = useLanguage();
  const { term } = useLocalSearchParams<{ term?: string }>();
  // English, so a link from another screen finds its term whatever the language.
  const [query, setQuery] = useState(() => TERMS.find((x) => x.id === term)?.term ?? '');
  const iconSize = useIconSize(15);
  useEffect(() => track('learn_opened', { page: 'glossary' }), []);

  // In another language, each entry shows the translated term with the English one under it,
  // because the English word is what's printed on receipts and provider sites.
  const entries = TERMS.map((x) => ({ id: x.id, ...termIn(language.code, x) }));
  const q = query.trim().toLowerCase();
  const matchesTerm = (x: (typeof entries)[number]) =>
    x.term.toLowerCase().includes(q) || !!x.english?.toLowerCase().includes(q);
  const shown = q
    ? entries
        .filter((x) => matchesTerm(x) || x.plain.toLowerCase().includes(q))
        .sort((a, b) => Number(!matchesTerm(a)) - Number(!matchesTerm(b)))
    : entries;

  return (
    <>
      {/* Dark text: the tab this was opened from had set it light for its green band. */}
      <StatusBar style="auto" />
      <FlatList
        style={{ backgroundColor: t.background }}
        contentContainerStyle={[styles.content, { paddingHorizontal: gutter }]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        data={shown}
        keyExtractor={(x) => x.id}
        ListHeaderComponent={
          <View style={[styles.search, { backgroundColor: t.card, borderColor: t.border }]}>
            <Icon
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
              placeholder={copy.glossary.searchPlaceholder(TERMS.length)}
              placeholderTextColor={t.textSecondary}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
              accessibilityLabel={copy.glossary.searchLabel}
              maxFontSizeMultiplier={2}
              style={[styles.searchInput, { color: t.text }]}
            />
          </View>
        }
        ListEmptyComponent={<AppText muted>{copy.glossary.noMatch(query.trim())}</AppText>}
        ListFooterComponent={
          language.code !== 'en' && !TERM_TRANSLATIONS[language.code] ? (
            <AppText variant="small" muted style={styles.footer}>
              {copy.glossary.englishOnly}
            </AppText>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={[styles.term, { borderBottomColor: t.border }]}>
            <AppText accessibilityRole="header" style={[styles.termName, { color: t.text }]}>
            {item.term}
          </AppText>
          {item.english ? (
            <AppText variant="small" accessibilityLanguage="en-US" style={{ color: t.textSecondary }}>
              {item.english}
            </AppText>
          ) : null}
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
  footer: { paddingTop: Spacing.three },
});
