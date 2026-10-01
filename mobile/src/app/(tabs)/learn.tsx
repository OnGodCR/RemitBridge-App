import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { HeroBackdrop, HeroHeader, StatusBarShield } from '@/components/hero-header';
import {
  CheckedArt,
  FeeMarkupArt,
  GlossaryArt,
  NoAffiliateArt,
  ObservatoryArt,
  RemitBenchArt,
  RouteBoardArt,
  WrongPriceArt,
} from '@/components/illustrations';
import { ListGroup, ListPoint, ListRow } from '@/components/list-row';
import { AppText } from '@/components/ui';
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
          <ListGroup title={l.howItWorks}>
            <ListPoint art={<FeeMarkupArt />} title={l.feeMarkup}>{l.feeMarkupBody}</ListPoint>
            <ListPoint art={<CheckedArt />} title={l.checkedOnly}>{l.checkedOnlyBody}</ListPoint>
            <ListPoint art={<NoAffiliateArt />} title={l.noAffiliate}>{l.noAffiliateBody}</ListPoint>
            <ListPoint art={<WrongPriceArt />} title={l.wrongPrice}>
              <AppText style={{ color: t.primary }} accessibilityRole="link" onPress={() => writeToUs(copy)}>
                {CONTACT}
              </AppText>
            </ListPoint>
          </ListGroup>

          <ListGroup title={l.deeper}>
            <ListRow art={<GlossaryArt />} title={copy.titles.glossary} subtitle={l.glossarySub(TERMS.length)} onPress={() => router.push('/glossary')} />
            <ListRow art={<RouteBoardArt />} title={copy.titles.routeBoard} subtitle={l.routeBoardSub} onPress={() => router.push('/routes')} />
            <ListRow art={<ObservatoryArt />} title={copy.titles.observatory} subtitle={l.observatorySub} onPress={() => router.push('/observatory')} />
            <ListRow art={<RemitBenchArt />} title={copy.titles.remitbench} subtitle={l.remitbenchSub} onPress={() => router.push('/remitbench')} />
          </ListGroup>

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
