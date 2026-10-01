import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Fragment, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AppText, Button } from '@/components/ui';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { BLOG_IMAGES } from '@/data/blog-images';
import { linkTarget, type BlogBlock, type BlogPost } from '@/data/blog';
import { TERMS } from '@/data/glossary';
import { useTheme } from '@/hooks/use-theme';
import { useCopy, useLanguage } from '@/i18n';
import { openPage } from '@/lib/links';

/**
 * The blog's pieces, laid out as the website lays them out (src/pages/Blog.jsx,
 * BlogPost.jsx, components/PostCard.jsx): DECISIONS.md D106.
 */

/** "August 21, 2026", in the app's language. */
export function usePostDate() {
  const { language } = useLanguage();
  return (iso?: string) =>
    iso ? new Date(`${iso}T12:00:00Z`).toLocaleDateString(language.code, { year: 'numeric', month: 'long', day: 'numeric' }) : null;
}

/**
 * A post's cover: its photo, or, as on the website, the post number on the series tint
 * with the bridge's arc behind it ("a generic stock photo on a research post is worse than
 * an honest number").
 */
export function PostCover({ post, rounded }: { post: BlogPost; rounded?: boolean }) {
  const t = useTheme();
  const s = t.series[post.series];
  const frame = [styles.cover, rounded && styles.coverRounded];
  if (post.cover && BLOG_IMAGES[post.cover]) {
    return <Image source={BLOG_IMAGES[post.cover]} style={frame} contentFit="cover" accessible={false} />;
  }
  return (
    <View style={[frame, styles.numberCover, { backgroundColor: s.tint }]} accessible={false}>
      <Svg viewBox="0 0 48 32" width={170} height={113} style={styles.arc}>
        <Path d="M2 17Q24 3 46 17" stroke={s.ink} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.15} />
        <Path d="M14 30v-6q10-9 20 0v6" stroke={s.ink} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.15} />
      </Svg>
      <AppText style={[styles.number, { color: s.ink }]}>{String(post.id).padStart(2, '0')}</AppText>
    </View>
  );
}

/** The series dot and name, in the series colour. */
export function SeriesMark({ series }: { series: BlogPost['series'] }) {
  const t = useTheme();
  const copy = useCopy();
  return (
    <View style={styles.seriesMark}>
      <View style={[styles.dot, { backgroundColor: t.series[series].bar }]} />
      <AppText variant="small" style={{ color: t.series[series].ink, fontFamily: Fonts.bold }}>
        {copy.blog.series[series]}
      </AppText>
    </View>
  );
}

/** A card on the index: the whole card is one target, as on the website. */
export function PostCard({ post }: { post: BlogPost }) {
  const t = useTheme();
  const copy = useCopy();
  const date = usePostDate();
  const meta = [date(post.publishedOn), post.readTime, post.body ? null : copy.blog.summaryOnly].filter(Boolean).join(' · ');
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/blog/[id]', params: { id: String(post.id) } })}
      accessibilityRole="button"
      accessibilityLabel={`${post.title}. ${meta}`}
      style={({ pressed }) => [styles.card, { backgroundColor: t.card, borderColor: t.border, opacity: pressed ? 0.7 : 1 }]}>
      <PostCover post={post} />
      <View style={styles.cardBody}>
        <SeriesMark series={post.series} />
        <AppText style={[styles.cardTitle, { color: t.text }]}>{post.title}</AppText>
        <AppText numberOfLines={3} style={[styles.abstract, { color: t.textSecondary }]}>
          {post.abstract}
        </AppText>
        <AppText variant="small" muted>
          {meta}
        </AppText>
      </View>
    </Pressable>
  );
}

// The body ---------------------------------------------------------------------------

/** **bold**, {{term-id|words}} and [text](/path), the website's three inline tokens. */
const TOKEN = /(\*\*[^*]+\*\*|\{\{[a-z0-9-]+\|[^}]+\}\}|\[[^\]]+\]\(\/[^)]*\))/g;

function go(path: string) {
  const target = linkTarget(path);
  if ('app' in target) router.push(target.app);
  else openPage(target.web);
}

/** A run of post text with its inline tokens, inside an AppText. */
function Inline({ text, color }: { text: string; color: string }): ReactNode {
  const t = useTheme();
  return text
    .split(TOKEN)
    .filter(Boolean)
    .map((token, i) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return (
          <AppText key={i} style={{ fontFamily: Fonts.bold, color: t.text }}>
            <Inline text={token.slice(2, -2)} color={t.text} />
          </AppText>
        );
      }
      if (token.startsWith('{{') && token.endsWith('}}')) {
        const [id, ...rest] = token.slice(2, -2).split('|');
        const term = TERMS.find((x) => x.id === id);
        return (
          <AppText
            key={i}
            accessibilityRole="link"
            onPress={term ? () => router.push({ pathname: '/glossary', params: { term: term.term } }) : undefined}
            style={[styles.term, { color, textDecorationColor: t.primary }]}>
            {rest.join('|')}
          </AppText>
        );
      }
      const link = /^\[([^\]]+)\]\((\/[^)]*)\)$/.exec(token);
      if (link) {
        return (
          <AppText key={i} accessibilityRole="link" onPress={() => go(link[2])} style={[styles.link, { color: t.primary }]}>
            {link[1].replace(/\{\{[a-z0-9-]+\|([^}]+)\}\}/g, '$1')}
          </AppText>
        );
      }
      return <Fragment key={i}>{token}</Fragment>;
    });
}

/** A bare domain in a source line, made tappable in place. */
const DOMAIN = /((?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s,"]*)?)/g;
const IS_DOMAIN = /^(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s,"]*)?$/;

function Linkified({ text }: { text: string }) {
  const t = useTheme();
  return (
    <>
      {text
        .split(DOMAIN)
        .filter(Boolean)
        .map((token, i) =>
          IS_DOMAIN.test(token) ? (
            <AppText key={i} accessibilityRole="link" onPress={() => openPage(`https://${token}`)} style={[styles.link, { color: t.primary }]}>
              {token}
            </AppText>
          ) : (
            <Fragment key={i}>{token}</Fragment>
          ),
        )}
    </>
  );
}

/** One block of a post, styled as the website styles it. */
export function PostBlock({ block, series }: { block: BlogBlock; series: BlogPost['series'] }) {
  const t = useTheme();
  const s = t.series[series];
  const body = t.text;
  switch (block.type) {
    case 'h':
      return (
        <AppText accessibilityRole="header" style={[block.level === 3 ? styles.h3 : styles.h2, { color: t.text }]}>
          {block.text}
        </AppText>
      );
    case 'label':
      return <AppText style={[styles.label, { color: t.text }]}>{block.text}</AppText>;
    case 'quote':
      return (
        <View style={[styles.quote, { borderLeftColor: s.bar }]}>
          <AppText style={[styles.quoteText, { color: body }]}>
            <Inline text={block.text ?? ''} color={body} />
          </AppText>
          {block.cite ? (
            <AppText variant="small" muted>
              {block.cite}
            </AppText>
          ) : null}
        </View>
      );
    case 'callout':
      return (
        <View style={[styles.callout, { backgroundColor: t.card, borderColor: t.border, borderLeftColor: s.bar }]}>
          <AppText style={[styles.p, { color: body }]}>
            <Inline text={block.text ?? ''} color={body} />
          </AppText>
        </View>
      );
    case 'list':
      return (
        <View style={styles.list}>
          {(block.items ?? []).map((item) => (
            <View key={item} style={styles.listItem}>
              {block.icon ? (
                <SymbolView
                  name={block.icon === 'pro' ? 'checkmark' : 'xmark'}
                  size={15}
                  weight="semibold"
                  tintColor={block.icon === 'pro' ? s.ink : t.textSecondary}
                  style={styles.listIcon}
                  fallback={null}
                />
              ) : (
                <View style={[styles.bullet, { backgroundColor: s.bar }]} />
              )}
              <AppText style={[styles.p, styles.flex, { color: body }]}>
                <Inline text={item} color={body} />
              </AppText>
            </View>
          ))}
        </View>
      );
    case 'table':
      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableScroll}>
          <View>
            <View style={[styles.tr, { borderBottomColor: t.border }]}>
              <AppText style={[styles.th, styles.rowHead, { color: t.text }]}>{block.rowHeaderHidden ? '' : block.rowHeader}</AppText>
              {(block.columns ?? []).map((c) => (
                <AppText key={c} style={[styles.th, { color: t.text }]}>
                  {c}
                </AppText>
              ))}
            </View>
            {(block.rows ?? []).map(([label, ...cells]) => (
              <View key={label} style={[styles.tr, { borderBottomColor: t.border }]}>
                <AppText style={[styles.th, styles.rowHead, { color: t.text }]}>{label}</AppText>
                {cells.map((cell, i) => (
                  <AppText key={i} style={[styles.td, { color: body }]}>
                    {cell}
                  </AppText>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      );
    case 'figure':
      return block.image && BLOG_IMAGES[block.image] ? (
        <Image
          source={BLOG_IMAGES[block.image]}
          style={[styles.figure, { aspectRatio: (block.width ?? 4) / (block.height ?? 3) }]}
          contentFit="contain"
          accessibilityIgnoresInvertColors
        />
      ) : null;
    case 'equation':
      return (
        <View style={[styles.equation, { borderColor: t.border, backgroundColor: t.background }]}>
          <AppText style={[styles.equationText, { color: body }]}>{block.text}</AppText>
        </View>
      );
    case 'cta':
      return (
        <View style={[styles.cta, { borderColor: t.border, backgroundColor: t.background }]}>
          <AppText style={[styles.p, { color: body }]}>
            <Inline text={block.text ?? ''} color={body} />
          </AppText>
          {block.label && block.to ? <Button label={block.label} trailingIcon="arrow.right" onPress={() => go(block.to!)} /> : null}
        </View>
      );
    case 'sources':
      return (
        <View style={styles.sources}>
          {(block.items ?? []).map((item, i) => (
            <View key={item} style={styles.source}>
              <AppText variant="small" muted style={styles.sourceNumber}>
                {i + 1}.
              </AppText>
              <AppText variant="small" style={[styles.flex, { color: t.textSecondary }]}>
                <Linkified text={item} />
              </AppText>
            </View>
          ))}
        </View>
      );
    default:
      return (
        <AppText style={[styles.p, { color: body }]}>
          <Inline text={block.text ?? ''} color={body} />
        </AppText>
      );
  }
}

const styles = StyleSheet.create({
  cover: { width: '100%', aspectRatio: 16 / 9 },
  coverRounded: { borderRadius: Radius.lg, overflow: 'hidden' },
  numberCover: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  arc: { position: 'absolute', right: -24, top: -16 },
  number: { fontFamily: Fonts.extrabold, fontSize: 48, lineHeight: 56, fontVariant: ['tabular-nums'] },
  seriesMark: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  dot: { width: 8, height: 8, borderRadius: 4 },
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  cardBody: { padding: Spacing.three + 4, gap: Spacing.two },
  cardTitle: { fontFamily: Fonts.bold, fontSize: 19, lineHeight: 25, letterSpacing: -0.2 },
  abstract: { fontSize: 15, lineHeight: 22 },
  p: { fontSize: 17, lineHeight: 27 },
  h2: { fontFamily: Fonts.bold, fontSize: 23, lineHeight: 29, letterSpacing: -0.3, marginTop: Spacing.four },
  h3: { fontFamily: Fonts.bold, fontSize: 19, lineHeight: 25, marginTop: Spacing.three },
  label: { fontFamily: Fonts.bold, fontSize: 17, lineHeight: 24, marginTop: Spacing.three, marginBottom: -Spacing.two },
  quote: { borderLeftWidth: 4, paddingLeft: Spacing.three + 4, gap: Spacing.one },
  quoteText: { fontSize: 19, lineHeight: 29 },
  callout: { borderWidth: StyleSheet.hairlineWidth, borderLeftWidth: 4, borderRadius: 16, padding: Spacing.three + 4 },
  list: { gap: Spacing.two + 2 },
  listItem: { flexDirection: 'row', gap: Spacing.three },
  listIcon: { marginTop: 6 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 11 },
  flex: { flex: 1 },
  tableScroll: { paddingRight: Spacing.three },
  tr: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
  th: { fontFamily: Fonts.bold, fontSize: 14, lineHeight: 20, width: 120, paddingVertical: Spacing.two + 2, paddingRight: Spacing.three },
  rowHead: { width: 140 },
  td: { fontSize: 14, lineHeight: 20, width: 120, paddingVertical: Spacing.two + 2, paddingRight: Spacing.three, fontVariant: ['tabular-nums'] },
  // The website draws each figure as a card with 16px corners; the capture includes the
  // page behind those corners, so the picture is clipped to the same radius.
  figure: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  equation: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, paddingHorizontal: Spacing.three + 4, paddingVertical: Spacing.three },
  equationText: { fontFamily: Fonts.medium, fontSize: 16, lineHeight: 25, fontVariant: ['tabular-nums'] },
  cta: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: Spacing.four, gap: Spacing.three },
  sources: { gap: Spacing.three },
  source: { flexDirection: 'row', gap: Spacing.three },
  sourceNumber: { fontVariant: ['tabular-nums'] },
  term: { textDecorationLine: 'underline', textDecorationStyle: 'dotted' },
  link: { textDecorationLine: 'underline' },
});
