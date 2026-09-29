import { SymbolView, type SFSymbol } from 'expo-symbols';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { HeroBackdrop, HeroHeader } from '@/components/hero-header';
import { ListGroup, ListRow } from '@/components/list-row';
import { AppText } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
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
            <Point first icon="percent" title="Fee + hidden markup">
              Total cost is the fee plus the markup hidden in the exchange rate.
            </Point>
            <Point icon="checkmark.seal" title="Checked prices only">
              Every price passes our checks, or it isn’t shown. Mid-market rates from Frankfurter.
            </Point>
            <Point icon="hand.raised" title="No affiliate deals">
              Nobody pays to rank. We never touch your money.
            </Point>
            <Point icon="envelope" title="Wrong price?">
              <AppText
                style={{ color: t.primary }}
                accessibilityRole="link"
                onPress={() => Linking.openURL(`mailto:${CONTACT}`)}>
                {CONTACT}
              </AppText>
            </Point>
          </ListGroup>

          <ListGroup title="Go deeper">
            <ListRow
              first
              icon="character.book.closed"
              title="Glossary"
              subtitle="80 terms, in plain English"
              onPress={() => router.push('/glossary')}
            />
            <ListRow
              icon="flask"
              title="RemitBench"
              subtitle="Our research testbed, still being built"
              onPress={() => router.push('/remitbench')}
            />
          </ListGroup>

          <ListGroup title="On the website">
            <ListRow
              first
              external
              icon="newspaper"
              title="Blog"
              subtitle="Stories and explainers"
              onPress={() => openPage(`${WEBSITE}/blog`)}
            />
            <ListRow
              external
              icon="doc.richtext"
              title="Research papers"
              subtitle="The lab’s published work"
              onPress={() => openPage(`${WEBSITE}/papers`)}
            />
            <ListRow
              external
              icon="person.3"
              title="Workshops"
              subtitle="Sessions for communities and schools"
              onPress={() => openPage(`${WEBSITE}/workshops`)}
            />
          </ListGroup>
        </View>
      </ScrollView>
    </View>
  );
}

function Point({
  icon,
  title,
  children,
  first,
}: {
  icon: SFSymbol;
  title: string;
  children: ReactNode;
  first?: boolean;
}) {
  const t = useTheme();
  return (
    <View style={[styles.point, !first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border }]}>
      <View style={[styles.tile, { backgroundColor: t.accent }]}>
        <SymbolView
          pointerEvents="none"
          name={icon}
          size={18}
          weight="semibold"
          tintColor={t.accentForeground}
          fallback={null}
        />
      </View>
      <View style={styles.pointText}>
        <AppText variant="label" style={styles.pointTitle}>
          {title}
        </AppText>
        <AppText variant="small" muted>
          {children}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1 },
  body: { flexGrow: 1, padding: Spacing.three, gap: Spacing.four, paddingBottom: Spacing.six },
  point: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  tile: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  pointText: { flex: 1, gap: 2 },
  pointTitle: { fontSize: 16 },
});
