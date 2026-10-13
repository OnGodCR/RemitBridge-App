import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/icon';
import { GENTLE, SNAPPY } from '@/components/motion';
import { Rise } from '@/components/motion-views';
import { ReadingAssignment } from '@/components/reading-assignment';
import { AppText, Button } from '@/components/ui';
import { MinTapTarget, Radius, Spacing } from '@/constants/theme';
import type { Term } from '@/data/glossary';
import { termIn } from '@/data/glossary-translations';
import { moduleFor } from '@/data/modules';
import { useTheme } from '@/hooks/use-theme';
import { useCopy, useLanguage } from '@/i18n';
import { moduleProgress, useLearned, type LearnStats } from '@/lib/learn-progress';

/** Shared lesson chrome: the same progress, raised answers, feedback and finish for every mode. */
export function TopBar({ progress, combo, stepLabel }: { progress: number; combo: number; stepLabel: string }) {
  const t = useTheme();
  const copy = useCopy();
  const reduced = useReducedMotion();
  const width = useSharedValue(progress);
  const pop = useSharedValue(1);
  useEffect(() => {
    width.set(reduced ? progress : withSpring(progress, GENTLE));
  }, [progress, reduced, width]);
  useEffect(() => {
    if (combo >= 2 && !reduced) pop.set(withSequence(withTiming(1.15), withSpring(1, SNAPPY)));
  }, [combo, reduced, pop]);
  const fill = useAnimatedStyle(() => ({ width: `${Math.max(0, Math.min(1, width.get())) * 100}%` }));
  const popping = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));
  return (
    <View style={styles.top}>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={copy.learn.lesson.close}
        style={styles.close}>
        <Icon name="xmark" size={Spacing.four} tintColor={t.textSecondary} fallback={null} />
      </Pressable>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={stepLabel}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
        style={[styles.track, { backgroundColor: t.muted }]}>
        <Animated.View style={[styles.fillBar, { backgroundColor: t.primary }, fill]} />
      </View>
      {combo >= 2 ? (
        <Animated.View style={[styles.combo, popping]} accessible accessibilityLabel={copy.learn.lesson.inARow(combo)}>
          <Icon name="flame.fill" size={Spacing.three} tintColor={t.primary} fallback={null} />
          <AppText variant="label">{combo}</AppText>
        </Animated.View>
      ) : null}
    </View>
  );
}

export function Teach({ term }: { term: Term }) {
  const { language } = useLanguage();
  const copy = useCopy();
  const shown = termIn(language.code, term);
  return (
    <View style={styles.stack}>
      <AppText variant="label" muted>
        {copy.learn.lesson.newWord}
      </AppText>
      <AppText variant="title" accessibilityRole="header">
        {term.id === 'corridor' ? copy.learn.games.routeWord : shown.term}
      </AppText>
      <LessonCard>
        <AppText>{shown.plain}</AppText>
      </LessonCard>
    </View>
  );
}

export function LessonCard({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border, borderBottomColor: t.rim }]}>
      {children}
    </View>
  );
}

export type OptionState = 'idle' | 'selected' | 'right' | 'wrong' | 'faded';
/** The existing raised Button, with the lesson's green check and gray shake feedback. */
export function Option({
  label,
  state = 'idle',
  onPress,
  disabled = false,
}: {
  label: string;
  state?: OptionState;
  onPress: () => void;
  disabled?: boolean;
}) {
  const t = useTheme();
  const copy = useCopy();
  const reduced = useReducedMotion();
  const shake = useSharedValue(0);
  useEffect(() => {
    if (reduced) {
      shake.set(0);
      return;
    }
    if (state === 'wrong')
      shake.set(
        withSequence(
          withTiming(-Spacing.two, { duration: 60 }),
          withTiming(Spacing.two, { duration: 60 }),
          withSpring(0, SNAPPY),
        ),
      );
  }, [state, reduced, shake]);
  const movement = useAnimatedStyle(() => ({ transform: [{ translateX: shake.get() }] }));
  return (
    <Animated.View style={[styles.answer, state === 'wrong' && { backgroundColor: t.muted }, movement]}>
      <Button
        label={label}
        variant={state === 'right' || state === 'selected' ? 'primary' : 'secondary'}
        disabled={disabled || state === 'right' || state === 'wrong' || state === 'faded'}
        onPress={onPress}
      />
      {state === 'right' || state === 'wrong' || state === 'selected' ? (
        <AppText variant="small" style={{ color: state === 'right' ? t.primary : t.textSecondary }}>
          {state === 'right'
            ? copy.learn.games.correct
            : state === 'wrong'
              ? copy.learn.lesson.wrong
              : copy.learn.games.selected}
        </AppText>
      ) : null}
    </Animated.View>
  );
}

export function Feedback({
  correct,
  answerText,
  xp,
  onContinue,
  children,
}: {
  correct: boolean;
  answerText: string;
  xp: number;
  onContinue: () => void;
  children?: ReactNode;
}) {
  const t = useTheme();
  const copy = useCopy();
  return (
    <Rise
      style={[
        styles.feedback,
        { backgroundColor: correct ? t.accent : t.card, borderColor: correct ? t.primary : t.border },
      ]}>
      <View style={styles.feedbackHead}>
        <Icon
          name={correct ? 'checkmark.circle.fill' : 'arrow.uturn.left.circle.fill'}
          size={Spacing.four}
          tintColor={correct ? t.primary : t.textSecondary}
          fallback={null}
        />
        <AppText variant="heading" style={styles.flex}>
          {correct ? copy.learn.games.correct : copy.learn.lesson.wrong}
        </AppText>
        {xp > 0 ? <AppText variant="label">{copy.learn.lesson.xp(xp)}</AppText> : null}
      </View>
      {!correct ? <AppText>{copy.learn.lesson.answerWas(answerText)}</AppText> : null}
      {children}
      <Button label={copy.learn.games.next} onPress={onContinue} />
    </Rise>
  );
}

export function Finish({
  moduleId,
  practice,
  xp,
  accuracyPct,
  learned,
  stats,
  onReplay,
}: {
  moduleId: string;
  practice: boolean;
  xp: number;
  accuracyPct: number;
  learned: number;
  stats: LearnStats;
  onReplay: () => void;
}) {
  const copy = useCopy();
  const t = useTheme();
  const l = copy.learn.lesson;
  const known = useLearned();
  const m = moduleFor(moduleId);
  const finished = m && moduleProgress(m, known).complete;
  return (
    <ScrollView contentContainerStyle={styles.finish}>
      <Rise style={styles.stack}>
        <View style={[styles.badge, { backgroundColor: t.accent }]}>
          <Icon name="checkmark" size={Spacing.five} tintColor={t.primary} fallback={null} />
        </View>
        <AppText variant="title" accessibilityRole="header">
          {practice ? l.practiceDone : l.done}
        </AppText>
        {!practice && learned > 0 ? <AppText muted>{l.wordsLearned(learned)}</AppText> : null}
        <View style={styles.tiles}>
          <Tile label={l.xpLabel} value={`${xp}`} />
          <Tile label={l.accuracyLabel} value={`${accuracyPct}%`} />
          <Tile label={l.streakLabel} value={l.streakDays(stats.streak)} />
        </View>
      </Rise>
      {finished && m ? <ReadingAssignment module={m} learned={known} /> : null}
      <Button label={copy.learn.games.playAgain} onPress={onReplay} />
      <Button variant="secondary" label={l.continue} onPress={() => router.back()} />
    </ScrollView>
  );
}
function Tile({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.tile, { backgroundColor: t.card, borderColor: t.border }]}>
      <AppText variant="small" muted>
        {label}
      </AppText>
      <AppText variant="heading">{value}</AppText>
    </View>
  );
}
export function haptic(kind: 'success' | 'error') {
  Haptics.notificationAsync(
    kind === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
  ).catch(() => undefined);
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three },
  close: { width: MinTapTarget, height: MinTapTarget, alignItems: 'center', justifyContent: 'center' },
  track: { flex: 1, height: Spacing.three, borderRadius: Radius.md, overflow: 'hidden' },
  fillBar: { height: Spacing.three, borderRadius: Radius.md },
  combo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  stack: { gap: Spacing.three },
  card: {
    padding: Spacing.three,
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: Spacing.one,
    borderRadius: Radius.lg,
  },
  answer: { gap: Spacing.one, borderRadius: Radius.lg },
  feedback: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderTopWidth: Spacing.one,
    borderRadius: Radius.lg,
  },
  feedbackHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  finish: { padding: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.four },
  badge: {
    width: Spacing.six,
    height: Spacing.six,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  tile: {
    flexGrow: 1,
    padding: Spacing.three,
    gap: Spacing.one,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
  },
});
