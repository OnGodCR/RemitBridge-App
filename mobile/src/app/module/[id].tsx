import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { MODULE_ART } from '@/components/module-art';
import { ListGroup } from '@/components/list-row';
import { AppText, Button } from '@/components/ui';
import { Fonts, MinTapTarget, Spacing } from '@/constants/theme';
import type { Term } from '@/data/glossary';
import { MODULES, moduleFor, moduleTerms } from '@/data/modules';
import { WORDS_PER_LESSON } from '@/lib/lesson';
import { useTheme } from '@/hooks/use-theme';
import { useCopy, useLanguage } from '@/i18n';
import { termIn } from '@/data/glossary-translations';
import { moduleProgress, useLearned } from '@/lib/learn-progress';
import { track } from '@/lib/track';
import { GrowBar } from '@/components/motion-views';

/**
 * One Learn module (DECISIONS.md D104, D136): its drawing and what it covers, how far you've
 * got, and a lesson to start: the words are taught and quizzed in app/lesson/[id].tsx, in
 * place of the fold-out definitions this screen used to have. Below, the module's words, a
 * tick on each one learned; tapping a word opens it in the glossary. Then the tool that puts
 * the module to use.
 */
export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
  const fresh = Math.min(WORDS_PER_LESSON, total - read);

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

        <Button
          variant={complete ? 'secondary' : 'primary'}
          label={complete ? l.lesson.practice : l.lesson.start(fresh)}
          trailingIcon="arrow.right"
          onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: m.id } })}
        />

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

        <ListGroup title={l.lesson.words}>
          {terms.map((term, i) => (
            <Word key={term.id} n={i + 1} term={term} learned={learned.has(term.id)} />
          ))}
        </ListGroup>

        {tool && toolTitle ? (
          <Button
            variant="secondary"
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

/** One of the module's words: its number (a tick once learned); opens in the glossary. */
function Word({ n, term, learned }: { n: number; term: Term; learned: boolean }) {
  const t = useTheme();
  const copy = useCopy();
  const { language } = useLanguage();
  const shown = termIn(language.code, term);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/glossary', params: { term: term.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${n}. ${learned ? `${copy.learn.learned}. ` : ''}${copy.learn.lesson.lookUp(shown.term)}`}
      style={({ pressed }) => [styles.word, { borderBottomColor: t.border, opacity: pressed ? 0.6 : 1 }]}>
      <View style={[styles.number, { borderColor: t.primary, backgroundColor: learned ? t.primary : 'transparent' }]}>
        {learned ? (
          <SymbolView name="checkmark" size={13} weight="bold" tintColor={t.primaryForeground} fallback={null} />
        ) : (
          <AppText style={[styles.numberText, { color: t.primary }]}>{n}</AppText>
        )}
      </View>
      <View style={styles.termText}>
        <AppText style={[styles.term, { color: t.text }]}>{shown.term}</AppText>
        {shown.english ? (
          <AppText variant="small" muted>
            {shown.english}
          </AppText>
        ) : null}
      </View>
      <SymbolView pointerEvents="none" name="book" size={15} weight="semibold" tintColor={t.textSecondary} fallback={null} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.four, paddingBottom: Spacing.six },
  lead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  flex: { flex: 1, gap: 2 },
  word: { minHeight: MinTapTarget + 12, flexDirection: 'row', alignItems: 'center', gap: Spacing.three, borderBottomWidth: StyleSheet.hairlineWidth },
  number: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontFamily: Fonts.bold, fontSize: 14, lineHeight: 18, fontVariant: ['tabular-nums'] },
  termText: { flex: 1, gap: 2 },
  term: { fontFamily: Fonts.bold, fontSize: 18, lineHeight: 23, letterSpacing: -0.2 },
  progress: { gap: Spacing.two },
  track: { height: 10, borderRadius: 5, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5 },
  done: { borderLeftWidth: 4, borderRadius: 12, padding: Spacing.three, gap: Spacing.three },
  doneHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  tick: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  doneTitle: { fontFamily: Fonts.bold, fontSize: 18, lineHeight: 23 },
});
