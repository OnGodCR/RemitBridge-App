import { router } from 'expo-router';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { HeroBackdrop, HeroHeader, StatusBarShield } from '@/components/hero-header';
import { ListGroup, ListPoint, ListRow } from '@/components/list-row';
import { AppText } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { openPage } from '@/lib/links';

const CONTACT = 'remitbridgesystemlabs@gmail.com';
const WEBSITE = 'https://www.remitbridgelabs.org'; // the bare domain redirects here

/**
 * Learn (DECISIONS.md D33, D58): how RemitBridge works, one line per point (PRD 5.4), then
 * the glossary and research. Long-form writing (blog, papers, workshops) stays on the
 * website and opens there.
 */
export default function LearnScreen() {
  const t = useTheme();
  return (
    <View style={[styles.fill, { backgroundColor: t.background }]}>
      <HeroBackdrop />
      <ScrollView contentContainerStyle={styles.scroll}>
        <HeroHeader title="Learn">
          <AppText style={{ color: t.heroMuted }}>How it works, and the words behind it.</AppText>
        </HeroHeader>
        <View style={[styles.body, { backgroundColor: t.background }]}>
          <ListGroup title="How it works">
            <ListPoint title="Fee + hidden markup">
              Total cost is the fee plus the markup hidden in the exchange rate.
            </ListPoint>
            <ListPoint title="Checked prices only">
              Every price passes our checks, or it isn’t shown. Mid-market rates from Frankfurter.
            </ListPoint>
            <ListPoint title="No affiliate deals">Nobody pays to rank. We never touch your money.</ListPoint>
            <ListPoint title="Wrong price?">
              <AppText
                style={{ color: t.primary }}
                accessibilityRole="link"
                onPress={() => Linking.openURL(`mailto:${CONTACT}`)}>
                {CONTACT}
              </AppText>
            </ListPoint>
          </ListGroup>

          <ListGroup title="Go deeper">
            <ListRow title="Glossary" subtitle="80 terms, in plain English" onPress={() => router.push('/glossary')} />
            <ListRow
              title="Route board"
              subtitle="Which routes we check, and which people want"
              onPress={() => router.push('/routes')}
            />
            <ListRow
              title="RemitBench"
              subtitle="Our research testbed, still being built"
              onPress={() => router.push('/remitbench')}
            />
          </ListGroup>

          <ListGroup title="On the website">
            <ListRow external title="Blog" subtitle="Stories and explainers" onPress={() => openPage(`${WEBSITE}/blog`)} />
            <ListRow
              external
              title="Research papers"
              subtitle="The lab’s published work"
              onPress={() => openPage(`${WEBSITE}/papers`)}
            />
            <ListRow
              external
              title="Workshops"
              subtitle="Sessions for communities and schools"
              onPress={() => openPage(`${WEBSITE}/workshops`)}
            />
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
