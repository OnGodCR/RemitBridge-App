import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { HeroBackdrop, HeroHeader, StatusBarShield } from '@/components/hero-header';
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
        <HeroHeader title={l.title}>
          <AppText style={{ color: t.heroMuted }}>{l.subtitle}</AppText>
        </HeroHeader>
        <View style={[styles.body, { backgroundColor: t.background }]}>
          <ListGroup title={l.howItWorks}>
            <ListPoint title={l.feeMarkup}>{l.feeMarkupBody}</ListPoint>
            <ListPoint title={l.checkedOnly}>{l.checkedOnlyBody}</ListPoint>
            <ListPoint title={l.noAffiliate}>{l.noAffiliateBody}</ListPoint>
            <ListPoint title={l.wrongPrice}>
              <AppText
                style={{ color: t.primary }}
                accessibilityRole="link"
                onPress={() => writeToUs(copy)}>
                {CONTACT}
              </AppText>
            </ListPoint>
          </ListGroup>

          <ListGroup title={l.deeper}>
            <ListRow title={copy.titles.glossary} subtitle={l.glossarySub(TERMS.length)} onPress={() => router.push('/glossary')} />
            <ListRow title={copy.titles.routeBoard} subtitle={l.routeBoardSub} onPress={() => router.push('/routes')} />
            <ListRow title={copy.titles.observatory} subtitle={l.observatorySub} onPress={() => router.push('/observatory')} />
            <ListRow title={copy.titles.remitbench} subtitle={l.remitbenchSub} onPress={() => router.push('/remitbench')} />
          </ListGroup>

          <ListGroup title={l.website}>
            <ListRow external title={l.blog} subtitle={l.blogSub} onPress={() => openPage(`${WEBSITE}/blog`)} />
            <ListRow external title={l.papers} subtitle={l.papersSub} onPress={() => openPage(`${WEBSITE}/papers`)} />
            <ListRow external title={l.workshops} subtitle={l.workshopsSub} onPress={() => openPage(`${WEBSITE}/workshops`)} />
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
