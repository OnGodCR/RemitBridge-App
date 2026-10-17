import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PostCard } from '@/components/blog';
import { AppText } from '@/components/ui';
import { Fonts, MinTapTarget, Spacing } from '@/constants/theme';
import { POSTS, SERIES, type SeriesId } from '@/data/blog';
import { useGutter } from '@/hooks/use-gutter';
import { useTheme } from '@/hooks/use-theme';
import { useCopy, useLanguage } from '@/i18n';
import { track } from '@/lib/track';

/**
 * The blog index (DECISIONS.md D106), as on the website: no hero, a count of what's written
 * in full, the series as text toggles that double as the colour key, then the cards.
 */
export default function BlogIndex() {
  const t = useTheme();
  const gutter = useGutter();
  const copy = useCopy();
  const b = copy.blog;
  const { language } = useLanguage();
  const [series, setSeries] = useState<SeriesId>('all');
  const shown = POSTS.filter((p) => series === 'all' || p.series === series);
  const written = POSTS.filter((p) => p.body).length;

  useEffect(() => track('learn_opened', { page: 'blog' }), []);

  return (
    <ScrollView style={{ backgroundColor: t.background }} contentContainerStyle={[styles.content, { paddingHorizontal: gutter }]} contentInsetAdjustmentBehavior="automatic">
      <StatusBar style="auto" />
      <AppText muted>{b.written(written, POSTS.length)}</AppText>
      {language.code !== 'en' ? <AppText muted>{b.englishOnly}</AppText> : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toggles}>
        {SERIES.map((id) => {
          const active = series === id;
          const ink = t.series[id].ink;
          return (
            <Pressable
              key={id}
              onPress={() => setSeries(id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.toggle, { borderBottomColor: active ? ink : 'transparent' }]}>
              <AppText style={[styles.toggleText, { color: active ? ink : t.textSecondary }]}>
                {id === 'all' ? b.all : b.series[id]}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      <AppText variant="small" muted accessibilityLiveRegion="polite">
        {b.shown(shown.length, POSTS.length)}
      </AppText>
      <View style={styles.cards}>
        {shown.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  toggles: { gap: Spacing.four, paddingRight: Spacing.three },
  toggle: { minHeight: MinTapTarget, justifyContent: 'flex-end', paddingBottom: Spacing.one, borderBottomWidth: 2 },
  toggleText: { fontFamily: Fonts.semibold, fontSize: 15, lineHeight: 20 },
  cards: { gap: Spacing.four },
});
