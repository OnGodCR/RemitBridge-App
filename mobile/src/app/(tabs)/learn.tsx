import { router } from 'expo-router';
import { Icon } from '@/components/icon';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PostCard } from '@/components/blog';
import { HeroHeader } from '@/components/hero-header';
import { GlossaryArt, ObservatoryArt, RemitBenchArt, RouteBoardArt } from '@/components/illustrations';
import { LearnPath, Ring } from '@/components/learn-path';
import { ListGroup, ListRow } from '@/components/list-row';
import { AppText, Button, Segmented } from '@/components/ui';
import { Fonts, Spacing } from '@/constants/theme';
import { POSTS } from '@/data/blog';
import { TERMS } from '@/data/glossary';
import { MODULES, type Module } from '@/data/modules';
import { useGutter } from '@/hooks/use-gutter';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';
import { nextStep, useLearnStats, useLearned } from '@/lib/learn-progress';
import { openPage } from '@/lib/links';
import { useTabFocus } from '@/lib/current-tab';
import { FocusRise } from '@/components/motion-views';

const WEBSITE = 'https://www.remitbridgelabs.org'; // the bare domain redirects here

/** The first explainer introduces remittances before the technical posts. */
const FIRST_POST = POSTS.find((post) => post.id === 1)!;

/**
 * Learn (DECISIONS.md D33, D58, D104, D107, D111), in two parts under a fixed green band:
 * Modules, with how far you've got, Continue, and the path, which starts at the bottom
 * and climbs; and Library, with the blog, the glossary A to Z and the research.
 */
export default function LearnScreen() {
  useTabFocus('/learn');
  const t = useTheme();
  const gutter = useGutter();
  const copy = useCopy();
  const l = copy.learn;
  const [part, setPart] = useState<'modules' | 'library'>('modules');
  const learned = useLearned();
  const total = MODULES.reduce((n, m) => n + m.terms.length, 0);
  const done = MODULES.reduce((n, m) => n + m.terms.filter((id) => learned.has(id)).length, 0);
  const next = nextStep(learned);
  const stats = useLearnStats();
  const open = (m: Module) => router.push({ pathname: '/module/[id]', params: { id: m.id } });
  // Continue starts the next lesson itself (D136), the way Duolingo's big button does.
  const lesson = (m: Module) => router.push({ pathname: '/lesson/[id]', params: { id: m.id } });

  // Open on the module you're up to, like Duolingo; once, so it doesn't jump while you scroll.
  const path = useRef<ScrollView>(null);
  const placed = useRef(false);
  const [viewport, setViewport] = useState(0);
  const toNext = useCallback(
    (y: number) => {
      if (placed.current || !viewport) return;
      placed.current = true;
      path.current?.scrollTo({ y: Math.max(0, y - viewport / 2), animated: false });
    },
    [viewport],
  );

  return (
    <View style={[styles.fill, { backgroundColor: t.background }]}>
      <HeroHeader title={l.title}>
        <Segmented
          options={[
            { value: 'modules', label: l.modulesTitle },
            { value: 'library', label: l.library },
          ]}
          value={part}
          onChange={(p) => {
            placed.current = false;
            setPart(p);
          }}
        />
        {part === 'modules' ? (
          <>
            {/* One row instead of three (2026-10-10): how far you've got as a ring, with the
                count and the streak beside it. */}
            <View
              style={styles.summary}
              accessible
              accessibilityLabel={[next ? l.progress(done, total) : l.allDone, stats.xp ? l.lesson.streakLine(stats.streak, stats.xp) : null]
                .filter(Boolean)
                .join('. ')}>
              <Ring progress={done / total} color={t.heroText} track={t.heroText} trackOpacity={0.22} size={58} stroke={6}>
                <AppText style={[styles.percent, { color: t.heroText }]}>{`${Math.round((done / total) * 100)}%`}</AppText>
              </Ring>
              <View style={styles.summaryText}>
                <AppText style={[styles.progressText, { color: t.heroText }]}>{next ? l.progress(done, total) : l.allDone}</AppText>
                {stats.xp ? (
                  <View style={styles.stats}>
                    <Icon name={stats.streak ? 'flame.fill' : 'bolt.fill'} size={15} tintColor={t.heroMuted} fallback={null} />
                    <AppText style={[styles.statsText, { color: t.heroMuted }]}>{l.lesson.streakLine(stats.streak, stats.xp)}</AppText>
                  </View>
                ) : null}
              </View>
            </View>
            {next ? (
              <Button
                label={`${done ? l.continue : l.start}: ${l.modules[next.module.id].title}`}
                variant="inverse"
                trailingIcon="arrow.right"
                onPress={() => lesson(next.module)}
              />
            ) : null}
          </>
        ) : null}
      </HeroHeader>

      <FocusRise style={styles.fill}>
      {part === 'modules' ? (
        <ScrollView ref={path} onLayout={(e) => setViewport(e.nativeEvent.layout.height)} contentContainerStyle={[styles.path, { paddingHorizontal: gutter }]}>
          <LearnPath modules={MODULES} learned={learned} next={next?.module.id ?? null} onOpen={(m) => open(m)} onStart={lesson} onNextAt={toNext} />
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={[styles.body, { paddingHorizontal: gutter }]}>
          {/* The website's blog, in the app (D106), starting with its first explainer. */}
          <ListGroup title={l.startHere} cards>
            <PostCard post={FIRST_POST} />
            <ListRow icon="newspaper" title={l.allPosts} subtitle={l.blogSub} onPress={() => router.push('/blog')} />
          </ListGroup>

          <ListGroup title={l.deeper} cards>
            <ListRow art={<GlossaryArt />} title={copy.titles.glossary} subtitle={l.glossarySub(TERMS.length)} onPress={() => router.push('/glossary')} />
            <ListRow art={<RouteBoardArt />} title={copy.titles.routeBoard} subtitle={l.routeBoardSub} onPress={() => router.push('/routes')} />
            <ListRow art={<ObservatoryArt />} title={copy.titles.observatory} subtitle={l.observatorySub} onPress={() => router.push('/observatory')} />
            <ListRow art={<RemitBenchArt />} title={copy.titles.remitbench} subtitle={l.remitbenchSub} onPress={() => router.push('/remitbench')} />
          </ListGroup>

          <ListGroup title={l.website} cards>
            <ListRow external icon="doc.richtext" title={l.papers} subtitle={l.papersSub} onPress={() => openPage(`${WEBSITE}/papers`)} />
            <ListRow external icon="person.2" title={l.workshops} subtitle={l.workshopsSub} onPress={() => openPage(`${WEBSITE}/workshops`)} />
          </ListGroup>
        </ScrollView>
      )}
      </FocusRise>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  path: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two, paddingBottom: Spacing.six + Spacing.five },
  body: { padding: Spacing.three, paddingTop: Spacing.four, gap: Spacing.five, paddingBottom: Spacing.six + Spacing.five },
  summary: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  summaryText: { flex: 1, gap: 2 },
  percent: { fontFamily: Fonts.bold, fontSize: 15, lineHeight: 18 },
  progressText: { fontFamily: Fonts.bold, fontSize: 17, lineHeight: 22 },
  stats: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  statsText: { fontFamily: Fonts.semibold, fontSize: 14, lineHeight: 19 },
});
