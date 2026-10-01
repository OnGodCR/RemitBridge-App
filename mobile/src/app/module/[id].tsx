import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { MODULE_ART } from '@/components/module-art';
import { ListGroup } from '@/components/list-row';
import { AppText, Button } from '@/components/ui';
import { Fonts, MinTapTarget, Spacing } from '@/constants/theme';
import type { Term } from '@/data/glossary';
import { moduleFor, moduleTerms } from '@/data/modules';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';
import { track } from '@/lib/track';

/**
 * One Learn module (DECISIONS.md D104): its drawing and what it covers, then its terms as
 * numbered lessons in reading order, each opening to the glossary's plain definition (so
 * the page starts as a short list, not a wall of text), then the tool that puts it to use.
 * Definitions are English in every language for now, as in the glossary.
 */
export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const m = moduleFor(id);
  const t = useTheme();
  const copy = useCopy();
  const l = copy.learn;

  useEffect(() => {
    if (m) track('learn_opened', { page: 'module', module: m.id });
  }, [m]);

  if (!m) return <Redirect href="/learn" />;
  const words = l.modules[m.id];
  const terms = moduleTerms(m);
  const Art = MODULE_ART[m.id];
  const tool = m.tool;
  const toolTitle = tool ? (tool.title === 'compare' ? copy.tabs.compare : copy.titles[tool.title]) : null;

  return (
    <>
      <Stack.Screen options={{ title: words.title }} />
      <StatusBar style="auto" />
      <ScrollView
        style={{ backgroundColor: t.background }}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic">
        <View style={styles.lead}>
          <Art size={64} />
          <View style={styles.flex}>
            <AppText style={{ color: t.text }}>{words.line}</AppText>
            <AppText variant="small" muted>
              {l.terms(terms.length)}
            </AppText>
          </View>
        </View>

        <ListGroup>
          {terms.map((term, i) => (
            <Lesson key={term.id} n={i + 1} term={term} />
          ))}
        </ListGroup>

        {tool && toolTitle ? (
          <Button
            label={l.tryIt(toolTitle)}
            trailingIcon="arrow.right"
            // Compare is a tab: go back to the tabs and switch, rather than stacking a copy.
            onPress={() => (tool.href === '/compare' ? router.dismissTo('/compare') : router.push(tool.href))}
          />
        ) : null}
      </ScrollView>
    </>
  );
}

/** One term: its number and name; tap to read the definition, tap again to fold it. */
function Lesson({ n, term }: { n: number; term: Term }) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View style={[styles.lesson, { borderBottomColor: t.border }]}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${n}. ${term.term}`}
        style={({ pressed }) => [styles.lessonHead, { opacity: pressed ? 0.6 : 1 }]}>
        <View style={[styles.number, { borderColor: t.primary }]}>
          <AppText style={[styles.numberText, { color: t.primary }]}>{n}</AppText>
        </View>
        <AppText style={[styles.term, { color: t.text }]}>{term.term}</AppText>
        <SymbolView
          pointerEvents="none"
          name={open ? 'chevron.up' : 'chevron.down'}
          size={15}
          weight="semibold"
          tintColor={t.textSecondary}
          fallback={null}
        />
      </Pressable>
      {open ? <AppText style={[styles.plain, { color: t.textSecondary }]}>{term.plain}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.four, paddingBottom: Spacing.six },
  lead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  flex: { flex: 1, gap: 2 },
  lesson: { borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: Spacing.two },
  lessonHead: { minHeight: MinTapTarget + 12, flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  number: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontFamily: Fonts.bold, fontSize: 14, lineHeight: 18, fontVariant: ['tabular-nums'] },
  term: { flex: 1, fontFamily: Fonts.bold, fontSize: 18, lineHeight: 23, letterSpacing: -0.2 },
  plain: { fontSize: 16, lineHeight: 23, paddingLeft: 30 + Spacing.three, paddingBottom: Spacing.two },
});
