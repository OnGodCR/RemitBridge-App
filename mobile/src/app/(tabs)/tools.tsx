import { router, type Href } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { HeroBackdrop, HeroHeader } from '@/components/hero-header';
import { ListGroup, ListRow } from '@/components/list-row';
import { AppText } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * The tools, rebuilt from the website (DECISIONS.md D58), grouped by when you'd reach for
 * them: before a transfer, after one, and to watch rates over time.
 */
const GROUPS: {
  title: string;
  tools: { href: Href; icon: Parameters<typeof ListRow>[0]['icon']; title: string; subtitle: string }[];
}[] = [
  {
    title: 'Before you send',
    tools: [
      {
        href: '/fair-rate',
        icon: 'scalemass',
        title: 'Fair rate',
        subtitle: 'What the mid-market rate would give you',
      },
      {
        href: '/scam-check',
        icon: 'exclamationmark.shield',
        title: 'Scam check',
        subtitle: 'Eight questions before you send to a stranger',
      },
    ],
  },
  {
    title: 'After you send',
    tools: [
      {
        href: '/true-cost',
        icon: 'doc.text.magnifyingglass',
        title: 'TrueCost',
        subtitle: 'Check a receipt for the cost you didn’t see',
      },
      {
        href: '/yearly-cost',
        icon: 'calendar',
        title: 'Yearly cost',
        subtitle: 'What a year of sending adds up to',
      },
    ],
  },
  {
    title: 'Rates',
    tools: [
      {
        href: '/rate-history',
        icon: 'chart.xyaxis.line',
        title: 'Rate history',
        subtitle: 'The mid-market rate, day by day',
      },
    ],
  },
];

export default function ToolsScreen() {
  const t = useTheme();
  return (
    <View style={[styles.fill, { backgroundColor: t.background }]}>
      <HeroBackdrop />
      <ScrollView contentContainerStyle={styles.scroll}>
        <HeroHeader title="Tools">
          <AppText style={{ color: t.heroMuted }}>Check a rate, a receipt, or a request.</AppText>
        </HeroHeader>
        <View style={[styles.body, { backgroundColor: t.background }]}>
          {GROUPS.map((g) => (
            <ListGroup key={g.title} title={g.title}>
              {g.tools.map((tool, i) => (
                <ListRow
                  key={tool.title}
                  first={i === 0}
                  icon={tool.icon}
                  title={tool.title}
                  subtitle={tool.subtitle}
                  onPress={() => router.push(tool.href)}
                />
              ))}
            </ListGroup>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1 },
  body: { flexGrow: 1, padding: Spacing.three, gap: Spacing.four, paddingBottom: Spacing.six },
});
