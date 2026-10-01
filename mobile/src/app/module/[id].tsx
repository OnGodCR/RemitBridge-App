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
import { MODULES, moduleFor, moduleTerms } from '@/data/modules';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';
import { markLearned, moduleProgress, useLearned } from '@/lib/learn-progress';
import { track } from '@/lib/track';
import { GrowBar } from '@/components/motion-views';

/**
 * One Learn module (DECISIONS.md D104): its drawing and what it covers, then its terms as
 * numbered lessons in reading order, each opening to the glossary's plain definition (so
 * the page starts as a short list, not a wall of text), then the tool that puts it to use.
 * Definitions are English in every language for now, as in the glossary.
 *
 * Progress (D107): opening a lesson counts it as learned; the bar at the top fills, the
 * number turns into a tick, and once every lesson is read the module says so and offers
 * the next one. Learn's Continue opens the module on its first unread lesson (`open`).
 */
export default function ModuleScreen() {
  const { id, open } = useLocalSearchParams<{ id: string; open?: string }>();
  const m = moduleFor(id);
  const learned = useLearned();
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
  const { read, total, complete } = moduleProgress(m, learned);
  const following = MODULES[MODULES.findIndex((x) => x.id === m.id) + 1];

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

        <View style={styles.progress} accessible accessibilityLabel={l.moduleCount(read, total)}>
          <View style={[styles.track, { backgroundColor: t.border }]}>
            <GrowBar fraction={read / total} delay={150} style={[styles.fill, { backgroundColor: t.primary }]} />
          </View>
          <AppText variant="small" style={{ color: complete ? t.primary : t.textSecondary, fontFamily: Fonts.semibold }}>
            {complete ? l.moduleDone : l.moduleCount(read, total)}
          </AppText>
        </View>

        <ListGroup>
          {terms.map((term, i) => (
            <Lesson key={term.id} n={i + 1} term={term} learned={learned.has(term.id)} startOpen={term.id === open} />
          ))}
        </ListGroup>

        {complete ? (
          <View style={[styles.done, { backgroundColor: t.accent, borderLeftColor: t.primary }]}>
            <View style={styles.doneHead}>
              <View style={[styles.tick, { backgroundColor: t.primary }]}>
                <SymbolView name="checkmark" size={14} weight="bold" tintColor={t.primaryForeground} fallback={null} />
              </View>
              <AppText style={[styles.doneTitle, { color: t.accentForeground }]}>{l.moduleDone}</AppText>
            </View>
            {following ? (
              <Button
                label={l.nextModule(l.modules[following.id].title)}
                trailingIcon="arrow.right"
                onPress={() => router.replace({ pathname: '/module/[id]', params: { id: following.id } })}
              />
            ) : (
              <AppText style={{ color: t.accentForeground }}>{l.allDone}</AppText>
            )}
          </View>
        ) : null}

        {tool && toolTitle ? (
          <Button
            variant={complete ? 'secondary' : 'primary'}
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

/**
 * One term: its number (a tick once learned) and name; tap to read the definition, which
 * counts it as learned, and tap again to fold it.
 */
function Lesson({ n, term, learned, startOpen }: { n: number; term: Term; learned: boolean; startOpen: boolean }) {
  const t = useTheme();
  const copy = useCopy();
  const [open, setOpen] = useState(startOpen);
  useEffect(() => {
    if (open) markLearned(term.id);
  }, [open, term.id]);
  return (
    <View style={[styles.lesson, { borderBottomColor: t.border }]}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${n}. ${term.term}${learned ? `, ${copy.learn.learned}` : ''}`}
        style={({ pressed }) => [styles.lessonHead, { opacity: pressed ? 0.6 : 1 }]}>
        <View style={[styles.number, { borderColor: t.primary, backgroundColor: learned ? t.primary : 'transparent' }]}>
          {learned ? (
            <SymbolView name="checkmark" size={13} weight="bold" tintColor={t.primaryForeground} fallback={null} />
          ) : (
            <AppText style={[styles.numberText, { color: t.primary }]}>{n}</AppText>
          )}
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
  progress: { gap: Spacing.two },
  track: { height: 10, borderRadius: 5, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5 },
  done: { borderLeftWidth: 4, borderRadius: 12, padding: Spacing.three, gap: Spacing.three },
  doneHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  tick: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  doneTitle: { fontFamily: Fonts.bold, fontSize: 18, lineHeight: 23 },
});
