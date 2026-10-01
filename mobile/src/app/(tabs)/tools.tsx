import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { HeroBackdrop, HeroHeader, StatusBarShield } from '@/components/hero-header';
import {
  FairRateArt,
  RateHistoryArt,
  ScamCheckArt,
  TrueCostArt,
  YearlyCostArt,
} from '@/components/illustrations';
import { ListGroup, ListRow } from '@/components/list-row';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';

/**
 * The tools, rebuilt from the website (DECISIONS.md D58), grouped by when you'd reach for
 * them: before a transfer, after one, and to watch rates over time. Each row leads with
 * one of the app's illustrations and a few words (D102, D103); the scanner has its own tab
 * (D101).
 */
export default function ToolsScreen() {
  const t = useTheme();
  const copy = useCopy();
  const groups: { title: string; tools: { href: Href; title: string; subtitle: string; art: ReactNode }[] }[] = [
    {
      title: copy.tools.before,
      tools: [
        { href: '/fair-rate', title: copy.titles.fairRate, subtitle: copy.tools.fairRateSub, art: <FairRateArt /> },
        { href: '/scam-check', title: copy.titles.scamCheck, subtitle: copy.tools.scamCheckSub, art: <ScamCheckArt /> },
      ],
    },
    {
      title: copy.tools.after,
      tools: [
        { href: '/true-cost', title: copy.titles.trueCost, subtitle: copy.tools.trueCostSub, art: <TrueCostArt /> },
        { href: '/yearly-cost', title: copy.titles.yearlyCost, subtitle: copy.tools.yearlyCostSub, art: <YearlyCostArt /> },
      ],
    },
    {
      title: copy.tools.rates,
      tools: [{ href: '/rate-history', title: copy.titles.rateHistory, subtitle: copy.tools.rateHistorySub, art: <RateHistoryArt /> }],
    },
  ];
  return (
    <View style={[styles.fill, { backgroundColor: t.background }]}>
      <HeroBackdrop />
      <ScrollView contentContainerStyle={styles.scroll}>
        <HeroHeader title={copy.tools.title} />
        <View style={[styles.body, { backgroundColor: t.background }]}>
          {groups.map((g) => (
            <ListGroup key={g.title} title={g.title}>
              {g.tools.map((tool) => (
                <ListRow key={tool.title} art={tool.art} title={tool.title} subtitle={tool.subtitle} onPress={() => router.push(tool.href)} />
              ))}
            </ListGroup>
          ))}
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
