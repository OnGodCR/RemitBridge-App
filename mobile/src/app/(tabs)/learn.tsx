import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { HeroBackdrop, HeroHeader, StatusBarShield } from '@/components/hero-header';
import { ListGroup, ListRow } from '@/components/list-row';
import { Tile, TileGrid } from '@/components/tile-grid';
import { Spacing } from '@/constants/theme';
import { TERMS } from '@/data/glossary';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';
import { CONTACT, openPage, writeToUs } from '@/lib/links';

const WEBSITE = 'https://www.remitbridgelabs.org'; // the bare domain redirects here

/**
 * Learn (DECISIONS.md D33, D58): how RemitBridge works, one line per point (PRD 5.4), then
 * the glossary and research. Long-form writing (blog, papers, workshops) stays on the
 * website and opens there.
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
          <TileGrid title={l.howItWorks}>
            <Tile icon="percent" title={l.feeMarkup} caption={l.feeMarkupBody} />
            <Tile icon="checkmark.seal" title={l.checkedOnly} caption={l.checkedOnlyBody} />
            <Tile icon="hand.raised" title={l.noAffiliate} caption={l.noAffiliateBody} />
            <Tile icon="envelope" title={l.wrongPrice} caption={CONTACT} onPress={() => writeToUs(copy)} />
          </TileGrid>

          <TileGrid title={l.deeper}>
            <Tile icon="character.book.closed" title={copy.titles.glossary} caption={l.glossarySub(TERMS.length)} onPress={() => router.push('/glossary')} />
            <Tile icon="map" title={copy.titles.routeBoard} caption={l.routeBoardSub} onPress={() => router.push('/routes')} />
            <Tile icon="chart.bar.xaxis" title={copy.titles.observatory} caption={l.observatorySub} onPress={() => router.push('/observatory')} />
            <Tile icon="flask" title={copy.titles.remitbench} caption={l.remitbenchSub} onPress={() => router.push('/remitbench')} />
          </TileGrid>

          <ListGroup title={l.website}>
            <ListRow external icon="newspaper" title={l.blog} subtitle={l.blogSub} onPress={() => openPage(`${WEBSITE}/blog`)} />
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
