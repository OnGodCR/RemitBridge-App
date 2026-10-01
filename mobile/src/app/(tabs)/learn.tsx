import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { HeroBackdrop, HeroHeader, StatusBarShield } from '@/components/hero-header';
import { GlossaryArt, ObservatoryArt, RemitBenchArt, RouteBoardArt } from '@/components/illustrations';
import { ListGroup, ListRow } from '@/components/list-row';
import { MODULE_ART } from '@/components/module-art';
import { Spacing } from '@/constants/theme';
import { TERMS } from '@/data/glossary';
import { MODULES } from '@/data/modules';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';
import { openPage } from '@/lib/links';

const WEBSITE = 'https://www.remitbridgelabs.org'; // the bare domain redirects here

/**
 * Learn (DECISIONS.md D33, D58, D104): modules first, each a short topic built from the
 * glossary's terms, then the glossary A to Z and the research. How RemitBridge works moved
 * to Account (D104). The blog is ported into the app (D106); papers and workshops stay on
 * the website and open there.
 */
export default function LearnScreen() {
  const t = useTheme();
  const copy = useCopy();
  const l = copy.learn;
  return (
    <View style={[styles.fill, { backgroundColor: t.background }]}>
      <HeroBackdrop />
      <ScrollView contentContainerStyle={styles.scroll}>
        <HeroHeader title={l.title} />
        <View style={[styles.body, { backgroundColor: t.background }]}>
          <ListGroup title={l.modulesTitle}>
            {MODULES.map((m) => {
              const Art = MODULE_ART[m.id];
              return (
                <ListRow
                  key={m.id}
                  art={<Art />}
                  title={l.modules[m.id].title}
                  subtitle={l.modules[m.id].line}
                  onPress={() => router.push({ pathname: '/module/[id]', params: { id: m.id } })}
                />
              );
            })}
          </ListGroup>

          {/* The website's blog, in the app (D106). */}
          <ListGroup title={copy.titles.blog}>
            <ListRow icon="newspaper" title={l.blog} subtitle={l.blogSub} onPress={() => router.push('/blog')} />
          </ListGroup>

          <ListGroup title={l.deeper}>
            <ListRow art={<GlossaryArt />} title={copy.titles.glossary} subtitle={l.glossarySub(TERMS.length)} onPress={() => router.push('/glossary')} />
            <ListRow art={<RouteBoardArt />} title={copy.titles.routeBoard} subtitle={l.routeBoardSub} onPress={() => router.push('/routes')} />
            <ListRow art={<ObservatoryArt />} title={copy.titles.observatory} subtitle={l.observatorySub} onPress={() => router.push('/observatory')} />
            <ListRow art={<RemitBenchArt />} title={copy.titles.remitbench} subtitle={l.remitbenchSub} onPress={() => router.push('/remitbench')} />
          </ListGroup>

          <ListGroup title={l.website}>

            <ListRow external icon="doc.richtext" title={l.papers} subtitle={l.papersSub} onPress={() => openPage(`${WEBSITE}/papers`)} />
            <ListRow external icon="person.2" title={l.workshops} subtitle={l.workshopsSub} onPress={() => openPage(`${WEBSITE}/workshops`)} />
          </ListGroup>
        </View>
      </ScrollView>
      <StatusBarShield />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1 },
  body: { flexGrow: 1, padding: Spacing.three, paddingTop: Spacing.four, gap: Spacing.five, paddingBottom: Spacing.six },
});
