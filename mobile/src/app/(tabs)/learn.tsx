import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { HeroHeader } from '@/components/hero-header';
import { GlossaryArt, ObservatoryArt, RemitBenchArt, RouteBoardArt } from '@/components/illustrations';
import { LearnPath } from '@/components/learn-path';
import { ListGroup, ListRow } from '@/components/list-row';
import { AppText, Button, Segmented } from '@/components/ui';
import { Fonts, Spacing } from '@/constants/theme';
import { TERMS } from '@/data/glossary';
import { MODULES, type Module } from '@/data/modules';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';
import { nextStep, useLearned } from '@/lib/learn-progress';
import { openPage } from '@/lib/links';

const WEBSITE = 'https://www.remitbridgelabs.org'; // the bare domain redirects here

/**
 * Learn (DECISIONS.md D33, D58, D104, D107, D111), in two parts under a fixed green band:
 * Modules, with how far you've got, Continue, and the path, which starts at the bottom
 * and climbs; and Library, with the blog, the glossary A to Z and the research.
 */
export default function LearnScreen() {
  const t = useTheme();
  const copy = useCopy();
  const l = copy.learn;
  const [part, setPart] = useState<'modules' | 'library'>('modules');
  const learned = useLearned();
  const total = MODULES.reduce((n, m) => n + m.terms.length, 0);
  const done = MODULES.reduce((n, m) => n + m.terms.filter((id) => learned.has(id)).length, 0);
  const next = nextStep(learned);
  const open = (m: Module, termId?: string) =>
    router.push({ pathname: '/module/[id]', params: termId ? { id: m.id, open: termId } : { id: m.id } });

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
            <View style={styles.progress}>
              <AppText style={[styles.progressText, { color: t.heroText }]}>{next ? l.progress(done, total) : l.allDone}</AppText>
              <View style={[styles.bar, { backgroundColor: t.heroMuted, opacity: 0.25 }]} />
              <View style={[styles.bar, styles.fillBar, { backgroundColor: t.heroText, width: `${(done / total) * 100}%` }]} />
            </View>
            {next ? (
              <Button
                label={`${done ? l.continue : l.start}: ${l.modules[next.module.id].title}`}
                variant="inverse"
                trailingIcon="arrow.right"
                onPress={() => open(next.module, next.termId)}
              />
            ) : null}
          </>
        ) : null}
      </HeroHeader>

      {part === 'modules' ? (
        <ScrollView ref={path} onLayout={(e) => setViewport(e.nativeEvent.layout.height)} contentContainerStyle={styles.path}>
          <LearnPath modules={MODULES} learned={learned} next={next?.module.id ?? null} onOpen={(m) => open(m)} onNextAt={toNext} />
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.body}>
          {/* The website's blog, in the app (D106). */}
          <ListGroup title={copy.titles.blog} cards>
            <ListRow icon="newspaper" title={l.blog} subtitle={l.blogSub} onPress={() => router.push('/blog')} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  path: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two, paddingBottom: Spacing.six + Spacing.five },
  body: { padding: Spacing.three, paddingTop: Spacing.four, gap: Spacing.five, paddingBottom: Spacing.six + Spacing.five },
  progress: { gap: Spacing.two },
  progressText: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 21 },
  bar: { height: 8, borderRadius: 4 },
  fillBar: { position: 'absolute', left: 0, bottom: 0, minWidth: 8 },
});
