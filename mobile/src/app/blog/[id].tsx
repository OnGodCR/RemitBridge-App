import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PostBlock, PostCard, PostCover, SeriesMark, usePostDate } from '@/components/blog';
import { Eyebrow } from '@/components/brand';
import { AppText } from '@/components/ui';
import { Fonts, Spacing } from '@/constants/theme';
import { postById, relatedTo } from '@/data/blog';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';
import { track } from '@/lib/track';

/**
 * One post (DECISIONS.md D106), laid out as the website's post page: the cover, the
 * series, the title, who wrote it and when, the summary, then the body, then more to read.
 */
export default function BlogPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = postById(id);
  const t = useTheme();
  const copy = useCopy();
  const date = usePostDate();

  useEffect(() => {
    if (post) track('learn_opened', { page: 'blog_post', post: post.id });
  }, [post]);

  if (!post) return <Redirect href="/blog" />;
  const meta = [date(post.publishedOn), post.readTime].filter(Boolean).join(' · ');

  return (
    <>
      <Stack.Screen options={{ title: '' }} />
      <StatusBar style="auto" />
      <ScrollView style={{ backgroundColor: t.background }} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
        <PostCover post={post} rounded />
        <View style={styles.head}>
          <SeriesMark series={post.series} />
          <AppText accessibilityRole="header" style={[styles.title, { color: t.text }]}>
            {post.title}
          </AppText>
          <AppText variant="small" muted>
            {`${post.author.name}, ${post.author.role}`}
          </AppText>
          {meta ? (
            <AppText variant="small" muted>
              {meta}
            </AppText>
          ) : null}
        </View>
        <AppText style={[styles.lede, { color: t.textSecondary }]}>{post.abstract}</AppText>

        {post.body ? (
          post.body.map((block, i) => <PostBlock key={i} block={block} series={post.series} />)
        ) : (
          <AppText muted>{copy.blog.notYet}</AppText>
        )}

        <View style={styles.more}>
          <Eyebrow header>{copy.blog.keepReading}</Eyebrow>
          {relatedTo(post).map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.four - 4, paddingBottom: Spacing.six },
  head: { gap: Spacing.two, marginTop: Spacing.two },
  title: { fontFamily: Fonts.extrabold, fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  lede: { fontSize: 19, lineHeight: 28 },
  more: { gap: Spacing.four, marginTop: Spacing.five },
});
