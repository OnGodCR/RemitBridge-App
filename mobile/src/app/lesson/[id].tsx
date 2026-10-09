import * as Haptics from 'expo-haptics';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Icon } from '@/components/icon';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  type SharedValue,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GENTLE, SNAPPY } from '@/components/motion';
import { AppText, Button } from '@/components/ui';
import { Fonts, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import type { Term } from '@/data/glossary';
import { termIn } from '@/data/glossary-translations';
import { moduleFor } from '@/data/modules';
import { useTheme } from '@/hooks/use-theme';
import { useCopy, useLanguage } from '@/i18n';
import { markLearned, recordLesson, useLearned, type LearnStats } from '@/lib/learn-progress';
import {
  accuracy,
  buildLesson,
  firstSentence,
  lessonDone,
  lessonProgress,
  lessonReducer,
  lessonWords,
  startLesson,
  XP_FIRST_TRY,
  XP_RETRY,
  type Question,
  type Step,
} from '@/lib/lesson';
import { track } from '@/lib/track';

/**
 * A Learn lesson (DECISIONS.md D136), in place of the old fold-out definitions: each new word
 * on a card, a question straight after, a review round the other way, missed questions again
 * at the end, then XP, accuracy and the day streak. Full screen, like Duolingo, with its
 * close button top left.
 *
 * A wrong answer is never red: red is kept for real errors (PRD 14.5). It shakes and greys,
 * and the right answer lights up green.
 */
export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const m = moduleFor(id);
  const learnedAtStart = useLearned();
  // Fixed when the lesson opens, so learning a word mid-lesson doesn't reshuffle it.
  const [plan] = useState(() => {
    if (!m) return null;
    const { words, practice } = lessonWords(m, learnedAtStart);
    return { practice, steps: buildLesson(m, words, practice) };
  });
  if (!m || !plan) return <Redirect href="/learn" />;
  return <Lesson moduleId={m.id} practice={plan.practice} steps={plan.steps} />;
}

function Lesson({ moduleId, practice, steps }: { moduleId: string; practice: boolean; steps: Step[] }) {
  const t = useTheme();
  const copy = useCopy();
  const l = copy.learn.lesson;
  const insets = useSafeAreaInsets();
  const [state, dispatch] = useReducer(lessonReducer, steps, startLesson);
  const [stats, setStats] = useState<LearnStats | null>(null);
  const done = lessonDone(state);
  const step = state.steps[state.index];

  useEffect(() => track('lesson_started', { module: moduleId, practice }), [moduleId, practice]);

  // A word answered right counts as learned at once, so leaving early keeps it.
  useEffect(() => state.learned.forEach(markLearned), [state.learned]);

  // Moving on: past the last step, the lesson is recorded (XP, streak) and the end shows.
  const next = () => {
    const after = lessonReducer(state, { type: 'next' });
    if (lessonDone(after) && !stats) {
      setStats(recordLesson(after.xp));
      track('lesson_finished', { module: moduleId, practice, xp: after.xp, accuracy: accuracy(after) });
      haptic('success');
    }
    dispatch({ type: 'next' });
  };

  const answer = (choice: string) => {
    if (!step || step.kind === 'teach' || state.answer) return;
    const correct = choice === step.term.id;
    haptic(correct ? 'success' : 'error');
    dispatch({ type: 'answer', choice });
  };

  // Announce the result for VoiceOver, which can't see the colors.
  const { language } = useLanguage();
  useEffect(() => {
    if (!state.answer || !step || step.kind === 'teach') return;
    const shown = termIn(language.code, step.term);
    const right = step.kind === 'pickTerm' ? shown.term : firstSentence(shown.plain);
    AccessibilityInfo.announceForAccessibility(state.answer.correct ? pick(l.right, state.index) : `${l.wrong} ${l.answerWas(right)}`);
  }, [state.answer, step, language.code, l, state.index]);

  return (
    <View style={[styles.fill, { backgroundColor: t.background, paddingTop: insets.top + Spacing.two }]}>
      <StatusBar style="auto" />
      {done && stats ? (
        <Finish practice={practice} xp={state.xp} accuracyPct={accuracy(state)} learned={state.learned.length} stats={stats} />
      ) : (
        <>
          <TopBar progress={lessonProgress(state)} combo={state.combo} stepLabel={l.progressLabel(state.index + 1, state.steps.length)} />
          <ScrollView contentContainerStyle={[styles.body, { paddingBottom: Spacing.six + 140 }]}>
            {step ? (
              <Arrive key={state.index} from={14} style={styles.step}>
                {step.kind === 'teach' ? (
                  <Teach term={step.term} />
                ) : (
                  <Ask question={step} answer={state.answer} onAnswer={answer} />
                )}
              </Arrive>
            ) : null}
          </ScrollView>
          {step?.kind === 'teach' ? (
            <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.three, borderTopColor: t.border }]}>
              <Button label={l.gotIt} onPress={next} />
            </View>
          ) : state.answer && step ? (
            <Feedback
              key={state.index}
              correct={state.answer.correct}
              term={step.term}
              // The word, when the question asked for one; a meaning question already shows
              // the right definition lit up in green, so it says no more.
              showAnswer={step.kind === 'pickTerm'}
              xp={state.answer.correct ? (step.retry ? XP_RETRY : XP_FIRST_TRY) : 0}
              index={state.index}
              bottom={insets.bottom}
              onContinue={next}
            />
          ) : null}
        </>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------------------
// The bar at the top: close, progress, and the combo once it's two or more
// ---------------------------------------------------------------------------------------

function TopBar({ progress, combo, stepLabel }: { progress: number; combo: number; stepLabel: string }) {
  const t = useTheme();
  const copy = useCopy();
  const reduced = useReducedMotion();
  const width = useSharedValue(progress);
  useEffect(() => {
    width.set(reduced ? progress : withSpring(progress, GENTLE));
  }, [progress, reduced, width]);
  const fill = useAnimatedStyle(() => ({ width: `${Math.max(0.03, width.get()) * 100}%` }));

  // The combo pops each time it grows.
  const pop = useSharedValue(1);
  useEffect(() => {
    if (combo >= 2 && !reduced) pop.set(withSequence(withTiming(1.25, { duration: 110 }), withSpring(1, SNAPPY)));
  }, [combo, reduced, pop]);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));

  return (
    <View style={styles.top}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={copy.learn.lesson.close}
        style={({ pressed }) => [styles.close, { opacity: pressed ? 0.5 : 1 }]}>
        <Icon name="xmark" size={20} weight="bold" tintColor={t.textSecondary} fallback={null} />
      </Pressable>
      <View accessible accessibilityRole="progressbar" accessibilityLabel={stepLabel} style={[styles.track, { backgroundColor: t.muted }]}>
        <Animated.View style={[styles.trackFill, { backgroundColor: t.primary }, fill]} />
      </View>
      {combo >= 2 ? (
        <Animated.View style={[styles.combo, popStyle]} accessible accessibilityLabel={copy.learn.lesson.inARow(combo)}>
          <Icon name="flame.fill" size={18} tintColor={t.primary} fallback={null} />
          <AppText style={[styles.comboText, { color: t.primary }]}>{combo}</AppText>
        </Animated.View>
      ) : (
        <View style={styles.comboSpace} />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------------------
// A new word
// ---------------------------------------------------------------------------------------

function Teach({ term }: { term: Term }) {
  const t = useTheme();
  const copy = useCopy();
  const { language } = useLanguage();
  const shown = termIn(language.code, term);
  return (
    <>
      <View style={[styles.tag, { backgroundColor: t.accent }]}>
        <Icon name="sparkles" size={14} tintColor={t.accentForeground} fallback={null} />
        <AppText style={[styles.tagText, { color: t.accentForeground }]}>{copy.learn.lesson.newWord}</AppText>
      </View>
      <View style={styles.wordHead}>
        <AppText accessibilityRole="header" style={[styles.bigWord, { color: t.text }]}>
          {shown.term}
        </AppText>
        {shown.english ? (
          <AppText accessibilityLanguage="en-US" style={{ color: t.textSecondary }}>
            {shown.english}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.definition, { backgroundColor: t.card, borderColor: t.border, borderBottomColor: t.rim, borderLeftColor: t.primary }]}>
        <AppText style={[styles.definitionText, { color: t.text }]}>{shown.plain}</AppText>
      </View>
    </>
  );
}

// ---------------------------------------------------------------------------------------
// A question
// ---------------------------------------------------------------------------------------

function Ask({
  question,
  answer,
  onAnswer,
}: {
  question: Question;
  answer: { choice: string; correct: boolean } | null;
  onAnswer: (choice: string) => void;
}) {
  const t = useTheme();
  const copy = useCopy();
  const l = copy.learn.lesson;
  const { language } = useLanguage();
  const target = termIn(language.code, question.term);
  return (
    <>
      {question.retry ? (
        <View style={[styles.tag, { backgroundColor: t.muted }]}>
          <Icon name="arrow.counterclockwise" size={13} tintColor={t.textSecondary} fallback={null} />
          <AppText style={[styles.tagText, { color: t.textSecondary }]}>{l.again}</AppText>
        </View>
      ) : null}
      {question.kind === 'pickTerm' ? (
        <>
          <AppText accessibilityRole="header" style={[styles.prompt, { color: t.text }]}>
            {l.whichWord}
          </AppText>
          <View style={[styles.definition, { backgroundColor: t.card, borderColor: t.border, borderBottomColor: t.rim, borderLeftColor: t.primary }]}>
            <AppText style={[styles.definitionText, { color: t.text }]}>{firstSentence(target.plain)}</AppText>
          </View>
        </>
      ) : (
        <AppText accessibilityRole="header" style={[styles.prompt, { color: t.text }]}>
          {l.whatMeans(target.term)}
        </AppText>
      )}
      <View style={styles.options}>
        {question.options.map((o) => {
          const shown = termIn(language.code, o);
          const label = question.kind === 'pickTerm' ? shown.term : firstSentence(shown.plain);
          const state: OptionState = !answer
            ? 'idle'
            : o.id === question.term.id
              ? 'right'
              : o.id === answer.choice
                ? 'wrong'
                : 'faded';
          return <Option key={o.id} label={label} long={question.kind === 'pickMeaning'} state={state} onPress={() => onAnswer(o.id)} />;
        })}
      </View>
    </>
  );
}

type OptionState = 'idle' | 'right' | 'wrong' | 'faded';

/** One answer: a chunky button that sinks when pressed, lights up if right, shakes if wrong. */
function Option({ label, long, state, onPress }: { label: string; long: boolean; state: OptionState; onPress: () => void }) {
  const t = useTheme();
  const reduced = useReducedMotion();
  const sink = useSharedValue(0);
  const shake = useSharedValue(0);
  const grow = useSharedValue(1);

  useEffect(() => {
    if (reduced) return;
    if (state === 'wrong') {
      shake.set(
        withSequence(
          withTiming(-9, { duration: 50 }),
          withTiming(9, { duration: 70 }),
          withTiming(-6, { duration: 60 }),
          withTiming(5, { duration: 55 }),
          withSpring(0, SNAPPY),
        ),
      );
    }
    if (state === 'right') grow.set(withSequence(withTiming(1.04, { duration: 120 }), withSpring(1, SNAPPY)));
  }, [state, reduced, shake, grow]);

  const face = useAnimatedStyle(() => ({
    transform: [{ translateY: sink.get() * 4 }, { translateX: shake.get() }, { scale: grow.get() }],
  }));

  const right = state === 'right';
  const faded = state === 'faded' || state === 'wrong';
  const bg = right ? t.primary : t.card;
  const fg = right ? t.primaryForeground : t.text;
  const border = right ? t.primary : state === 'wrong' ? t.textSecondary : t.border;
  const rim = right ? t.primaryDeep : t.rim;

  return (
    <Pressable
      onPress={onPress}
      disabled={state !== 'idle'}
      onPressIn={() => state === 'idle' && sink.set(reduced ? 1 : withSpring(1, SNAPPY))}
      onPressOut={() => sink.set(reduced ? 0 : withSpring(0, SNAPPY))}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: state !== 'idle', selected: right }}
      style={{ opacity: faded ? 0.45 : 1 }}>
      <View pointerEvents="none" style={[styles.optionLip, { backgroundColor: rim }]} />
      <Animated.View style={[styles.option, long && styles.optionLong, { backgroundColor: bg, borderColor: border }, face]}>
        <AppText style={[long ? styles.optionTextLong : styles.optionText, { color: fg }]}>{label}</AppText>
        {right ? <Icon name="checkmark.circle.fill" size={22} tintColor={fg} fallback={null} /> : null}
      </Animated.View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------------------
// After an answer: the panel that slides up
// ---------------------------------------------------------------------------------------

function Feedback({
  correct,
  term,
  showAnswer,
  xp,
  index,
  bottom,
  onContinue,
}: {
  correct: boolean;
  term: Term;
  showAnswer: boolean;
  xp: number;
  index: number;
  bottom: number;
  onContinue: () => void;
}) {
  const t = useTheme();
  const copy = useCopy();
  const l = copy.learn.lesson;
  const { language } = useLanguage();
  const shown = termIn(language.code, term);
  return (
    <Arrive
      from={220}
      fade={false}
      accessibilityLiveRegion="polite"
      style={[
        styles.feedback,
        { backgroundColor: correct ? t.accent : t.card, borderTopColor: correct ? t.primary : t.border, paddingBottom: bottom + Spacing.three },
      ]}>
      <View style={styles.feedbackHead}>
        <Icon
          name={correct ? 'checkmark.circle.fill' : 'arrow.uturn.left.circle.fill'}
          size={28}
          tintColor={correct ? t.primary : t.textSecondary}
          fallback={null}
        />
        <AppText style={[styles.feedbackTitle, { color: correct ? t.accentForeground : t.text }]}>
          {correct ? pick(l.right, index) : l.wrong}
        </AppText>
        {correct && xp ? (
          <Arrive from={8} delay={120} style={[styles.xpPill, { backgroundColor: t.primary }]}>
            <AppText style={[styles.xpText, { color: t.primaryForeground }]}>{l.xp(xp)}</AppText>
          </Arrive>
        ) : null}
      </View>
      {!correct && showAnswer ? <AppText style={[styles.feedbackAnswer, { color: t.text }]}>{l.answerWas(shown.term)}</AppText> : null}
      <Button label={l.continue} onPress={onContinue} />
    </Arrive>
  );
}

/**
 * Slides (and fades) a view in from below when it mounts, with a spring on its transform.
 * Not a Reanimated `entering` animation: a view with one of those ignored taps for a few
 * seconds in the simulator, so Continue seemed broken; a transform never blocks touches.
 */
function Arrive({
  from,
  delay = 0,
  fade = true,
  style,
  children,
  accessibilityLiveRegion,
}: {
  from: number;
  delay?: number;
  fade?: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  accessibilityLiveRegion?: 'polite';
}) {
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) p.set(withDelay(delay, withSpring(1, GENTLE)));
  }, [reduced, p, delay]);
  const animated = useAnimatedStyle(() => ({
    opacity: fade ? Math.min(1, p.get() * 1.6) : 1,
    transform: [{ translateY: (1 - p.get()) * from }],
  }));
  return (
    <Animated.View accessibilityLiveRegion={accessibilityLiveRegion} style={[style, animated]}>
      {children}
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------------------
// The end
// ---------------------------------------------------------------------------------------

function Finish({ practice, xp, accuracyPct, learned, stats }: { practice: boolean; xp: number; accuracyPct: number; learned: number; stats: LearnStats }) {
  const t = useTheme();
  const copy = useCopy();
  const l = copy.learn.lesson;
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.fill, styles.finish, { paddingBottom: insets.bottom + Spacing.three }]}>
      <View style={styles.finishTop}>
        <Celebration />
        <Arrive from={14} delay={120} style={styles.finishWords}>
          <AppText accessibilityRole="header" style={[styles.finishTitle, { color: t.text }]}>
            {practice ? l.practiceDone : l.done}
          </AppText>
          {!practice && learned ? <AppText style={{ color: t.textSecondary }}>{l.wordsLearned(learned)}</AppText> : null}
        </Arrive>
        <Arrive from={14} delay={220} style={styles.tiles}>
          <Tile icon="bolt.fill" label={l.xpLabel} value={`${xp}`} />
          <Tile icon="scope" label={l.accuracyLabel} value={`${accuracyPct}%`} />
          <Tile icon="flame.fill" label={l.streakLabel} value={l.streakDays(stats.streak)} />
        </Arrive>
      </View>
      <Arrive from={14} delay={320}>
        <Button label={l.continue} onPress={() => router.back()} />
      </Arrive>
    </View>
  );
}

function Tile({ icon, label, value }: { icon: 'bolt.fill' | 'scope' | 'flame.fill'; label: string; value: string }) {
  const t = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.tile, { backgroundColor: t.card, borderColor: t.border, borderBottomColor: t.rim }]}>
      <AppText variant="small" style={[styles.tileLabel, { color: t.textSecondary }]}>
        {label}
      </AppText>
      <View style={styles.tileValue}>
        <Icon name={icon} size={18} tintColor={t.primary} fallback={null} />
        <AppText style={[styles.tileNumber, { color: t.text }]}>{value}</AppText>
      </View>
    </View>
  );
}

/** A big tick that springs in, with a ring of dots bursting out from it. */
function Celebration() {
  const t = useTheme();
  const reduced = useReducedMotion();
  const scale = useSharedValue(reduced ? 1 : 0);
  const burst = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    scale.set(withSpring(1, { damping: 11, stiffness: 180, mass: 0.8 }));
    burst.set(withDelay(120, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })));
  }, [reduced, scale, burst]);
  const badge = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const dots = useMemo(() => Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2), []);
  return (
    <View style={styles.celebration} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {dots.map((angle, i) => (
        <BurstDot key={i} angle={angle} progress={burst} color={i % 2 ? t.moneyMarkup : t.primary} />
      ))}
      <Animated.View style={[styles.badge, { backgroundColor: t.primary, borderBottomColor: t.primaryDeep }, badge]}>
        <Icon name="checkmark" size={54} weight="heavy" tintColor={t.primaryForeground} fallback={null} />
      </Animated.View>
    </View>
  );
}

function BurstDot({ angle, progress, color }: { angle: number; progress: SharedValue<number>; color: string }) {
  const style = useAnimatedStyle(() => {
    const p = progress.get();
    const r = 46 + p * 46;
    return {
      opacity: p < 0.85 ? Math.min(1, p * 4) : (1 - p) / 0.15,
      transform: [{ translateX: Math.cos(angle) * r }, { translateY: Math.sin(angle) * r }, { scale: 1 - p * 0.4 }],
    };
  });
  return <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />;
}

// ---------------------------------------------------------------------------------------

/** A different cheer each time, in a fixed order so tests and screen readers agree. */
function pick(xs: string[], i: number): string {
  return xs[i % xs.length];
}

function haptic(kind: 'success' | 'error') {
  Haptics.notificationAsync(kind === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(
    () => undefined,
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingBottom: Spacing.two },
  close: { width: MinTapTarget - 8, height: MinTapTarget - 8, alignItems: 'center', justifyContent: 'center' },
  track: { flex: 1, height: 16, borderRadius: 8, overflow: 'hidden' },
  trackFill: { height: 16, borderRadius: 8 },
  combo: { flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 44, justifyContent: 'flex-end' },
  comboSpace: { width: 44 },
  comboText: { fontFamily: Fonts.extrabold, fontSize: 18, lineHeight: 22, fontVariant: ['tabular-nums'] },
  body: { padding: Spacing.three, paddingTop: Spacing.four },
  step: { gap: Spacing.four },
  tag: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, alignSelf: 'flex-start', borderRadius: Radius.pill, paddingHorizontal: Spacing.three, paddingVertical: Spacing.one },
  tagText: { fontFamily: Fonts.bold, fontSize: 13, lineHeight: 18, letterSpacing: 0.4, textTransform: 'uppercase' },
  wordHead: { gap: Spacing.one },
  bigWord: { fontFamily: Fonts.extrabold, fontSize: 34, lineHeight: 40, letterSpacing: -0.6 },
  definition: { borderWidth: StyleSheet.hairlineWidth, borderBottomWidth: 3, borderLeftWidth: 4, borderRadius: Radius.lg, padding: Spacing.three },
  definitionText: { fontSize: 18, lineHeight: 27 },
  prompt: { fontFamily: Fonts.extrabold, fontSize: 24, lineHeight: 30, letterSpacing: -0.3 },
  options: { gap: Spacing.three },
  optionLip: { position: 'absolute', left: 0, right: 0, top: 4, bottom: 0, borderRadius: Radius.lg },
  option: {
    minHeight: 58,
    marginBottom: 4,
    borderWidth: 2,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  optionLong: { minHeight: 72 },
  optionText: { flex: 1, fontFamily: Fonts.bold, fontSize: 18, lineHeight: 23, textAlign: 'center' },
  optionTextLong: { flex: 1, fontFamily: Fonts.medium, fontSize: 16, lineHeight: 22 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: Spacing.three, borderTopWidth: StyleSheet.hairlineWidth },
  feedback: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: Spacing.three, gap: Spacing.two, borderTopWidth: 3, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg },
  feedbackHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  feedbackTitle: { flex: 1, fontFamily: Fonts.extrabold, fontSize: 22, lineHeight: 28 },
  feedbackAnswer: { fontFamily: Fonts.bold, fontSize: 17, lineHeight: 23 },
  xpPill: { borderRadius: Radius.pill, paddingHorizontal: Spacing.three, paddingVertical: Spacing.one },
  xpText: { fontFamily: Fonts.extrabold, fontSize: 15, lineHeight: 20 },
  finish: { paddingHorizontal: Spacing.three, justifyContent: 'space-between' },
  finishTop: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.four },
  finishWords: { alignItems: 'center', gap: Spacing.one },
  finishTitle: { fontFamily: Fonts.extrabold, fontSize: 30, lineHeight: 36, letterSpacing: -0.5, textAlign: 'center' },
  tiles: { flexDirection: 'row', gap: Spacing.two, alignSelf: 'stretch' },
  tile: { flex: 1, borderWidth: StyleSheet.hairlineWidth, borderBottomWidth: 3, borderRadius: Radius.lg, padding: Spacing.three, gap: Spacing.one, alignItems: 'center' },
  tileLabel: { fontFamily: Fonts.semibold, textAlign: 'center' },
  tileValue: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  tileNumber: { fontFamily: Fonts.extrabold, fontSize: 20, lineHeight: 26 },
  celebration: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  badge: { width: 112, height: 112, borderRadius: 56, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 6 },
  dot: { position: 'absolute', width: 12, height: 12, borderRadius: 6 },
});
