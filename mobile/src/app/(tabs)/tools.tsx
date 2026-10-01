import { router, type Href } from 'expo-router';
import type { SFSymbol } from 'expo-symbols';
import { ScrollView, StyleSheet, View } from 'react-native';

import { HeroBackdrop, HeroHeader, StatusBarShield } from '@/components/hero-header';
import { Tile, TileGrid } from '@/components/tile-grid';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';

/**
 * The tools, rebuilt from the website (DECISIONS.md D58), grouped by when you'd reach for
 * them: before a transfer, after one, and to watch rates over time. Cards with an icon and
 * a few words each (D102); the receipt scanner has its own tab (D101).
 */
export default function ToolsScreen() {
  const t = useTheme();
  const copy = useCopy();
  const groups: { title: string; tools: { href: Href; title: string; subtitle: string; icon: SFSymbol }[] }[] = [
    {
      title: copy.tools.before,
      tools: [
        { href: '/fair-rate', title: copy.titles.fairRate, subtitle: copy.tools.fairRateSub, icon: 'scalemass' },
        { href: '/scam-check', title: copy.titles.scamCheck, subtitle: copy.tools.scamCheckSub, icon: 'exclamationmark.shield' },
      ],
    },
    {
      title: copy.tools.after,
      tools: [
        { href: '/true-cost', title: copy.titles.trueCost, subtitle: copy.tools.trueCostSub, icon: 'doc.text.magnifyingglass' },
        { href: '/yearly-cost', title: copy.titles.yearlyCost, subtitle: copy.tools.yearlyCostSub, icon: 'calendar' },
      ],
    },
    {
      title: copy.tools.rates,
      tools: [{ href: '/rate-history', title: copy.titles.rateHistory, subtitle: copy.tools.rateHistorySub, icon: 'chart.line.uptrend.xyaxis' }],
    },
  ];
  return (
    <View style={[styles.fill, { backgroundColor: t.background }]}>
      <HeroBackdrop />
      <ScrollView contentContainerStyle={styles.scroll}>
        <HeroHeader title={copy.tools.title} />
        <View style={[styles.body, { backgroundColor: t.background }]}>
          {groups.map((g) => (
            <TileGrid key={g.title} title={g.title}>
              {g.tools.map((tool) => (
                <Tile key={tool.title} icon={tool.icon} title={tool.title} caption={tool.subtitle} onPress={() => router.push(tool.href)} />
              ))}
            </TileGrid>
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
