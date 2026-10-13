import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type SFSymbol } from '@/components/icon';
import { GENTLE, SNAPPY, useCountUp } from '@/components/motion';
import { Rise } from '@/components/motion-views';
import { MODULE_ART } from '@/components/module-art';
import { ReadingAssignment } from '@/components/reading-assignment';
import { AppText, Button } from '@/components/ui';
import { Fonts, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { moduleFor, type ModuleId } from '@/data/modules';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';
import { moduleProgress, useLearned, type LearnStats } from '@/lib/learn-progress';

/**
 * The pieces every Learn game shares (DECISIONS.md D136, D172), in Duolingo's shape: a thick
 * progress bar, chunky answer tiles that sink when pressed, one Check button at the bottom,
 * and a sheet that slides up with the result. A wrong answer shakes and greys; it is never red
 * (red is for real errors, PRD 14.5).
 */

const LIP = 4;

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
    if (combo >= 2 && !reduced) pop.set(withSequence(withTiming(1.25, { duration: 110 }), withSpring(1, SNAPPY)));
  }, [combo, reduced, pop]);
  const fill = useAnimatedStyle(() => ({ width: `${Math.max(0, Math.min(1, width.get())) * 100}%` }));
  const popping = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));
  return (
    <View style={styles.top}>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={copy.learn.lesson.close}
        hitSlop={8}
        style={styles.close}>
        <Icon name="xmark" size={22} weight="bold" tintColor={t.textSecondary} fallback={null} />
      </Pressable>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={stepLabel}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
        style={[styles.track, { backgroundColor: t.muted }]}>
        <Animated.View style={[styles.progress, { backgroundColor: t.primary }, fill]}>
          <View style={[styles.shine, { backgroundColor: t.glow, opacity: 0.35 }]} />
        </Animated.View>
      </View>
      <View style={styles.comboSlot}>
        {combo >= 2 ? (
          <Animated.View
            style={[styles.combo, popping]}
            accessible
            accessibilityLabel={copy.learn.lesson.inARow(combo)}>
            <Icon name="flame.fill" size={20} tintColor={t.primary} fallback={null} />
            <AppText style={[styles.comboText, { color: t.primary }]}>{combo}</AppText>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

/** One big line at the top of a question: the whole instruction. */
export function Prompt({ children }: { children: string }) {
  const t = useTheme();
  return (
    <AppText accessibilityRole="header" style={[styles.prompt, { color: t.text }]}>
      {children}
    </AppText>
  );
}

/** "Example": every made-up amount says so (CLAUDE.md: never a number that looks real). */
export function ExampleTag() {
  const t = useTheme();
  const copy = useCopy();
  return <Tag label={copy.learn.games.example} style={{ backgroundColor: t.accent }} color={t.accentForeground} />;
}

function Tag({ label, style, color }: { label: string; style: StyleProp<ViewStyle>; color: string }) {
  return (
    <View style={[styles.tag, style]}>
      <AppText style={[styles.tagText, { color }]}>{label}</AppText>
    </View>
  );
}

export type TileState = 'idle' | 'selected' | 'right' | 'wrong' | 'faded';

/**
 * An answer tile: white on a grey lip, green-edged when picked, mint and green when right, grey
 * and shaking when wrong. Its content is a label or anything else (a receipt line, a price).
 */
export function Tile({
  label,
  children,
  icon,
  state = 'idle',
  onPress,
  disabled,
  style,
  accessibilityLabel,
}: {
  label?: string;
  children?: ReactNode;
  icon?: SFSymbol;
  state?: TileState;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const t = useTheme();
  const reduced = useReducedMotion();
  const sink = useSharedValue(0);
  const shake = useSharedValue(0);
  const pop = useSharedValue(1);
  useEffect(() => {
    if (reduced) return;
    if (state === 'wrong') {
      shake.set(withSequence(withTiming(-8, { duration: 55 }), withTiming(8, { duration: 55 }), withSpring(0, SNAPPY)));
    }
    if (state === 'right') pop.set(withSequence(withTiming(1.05, { duration: 90 }), withSpring(1, SNAPPY)));
  }, [state, reduced, shake, pop]);
  const moved = useAnimatedStyle(() => ({ transform: [{ translateX: shake.get() }, { scale: pop.get() }] }));
  const face = useAnimatedStyle(() => ({ transform: [{ translateY: sink.get() * LIP }] }));
  const press = (down: boolean) => {
    if (disabled) return;
    sink.set(reduced ? Number(down) : withSpring(Number(down), SNAPPY));
  };
  const colors = {
    idle: { bg: t.card, border: t.border, lip: t.rim, fg: t.text },
    // Picked: a green outline. Right: mint with the green edge, so any text inside stays readable.
    selected: { bg: t.card, border: t.primary, lip: t.primary, fg: t.accentForeground },
    right: { bg: t.accent, border: t.primary, lip: t.primaryDeep, fg: t.accentForeground },
    wrong: { bg: t.muted, border: t.border, lip: t.rim, fg: t.textSecondary },
    faded: { bg: t.card, border: t.border, lip: t.rim, fg: t.textSecondary },
  }[state];
  return (
    <Animated.View style={[style, moved, state === 'faded' && styles.faded]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => press(true)}
        onPressOut={() => press(false)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ selected: state === 'selected', disabled: !!disabled }}>
        <View pointerEvents="none" style={[styles.tileLip, { backgroundColor: colors.lip }]} />
        <Animated.View style={[styles.tile, { backgroundColor: colors.bg, borderColor: colors.border }, face]}>
          {icon ? <Icon name={icon} size={22} weight="bold" tintColor={colors.fg} fallback={null} /> : null}
          {label ? <AppText style={[styles.tileLabel, { color: colors.fg }]}>{label}</AppText> : null}
          {children}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export interface Result {
  correct: boolean;
  title: string;
  line?: string;
  xp: number;
}

/**
 * The bottom of every question. Before answering: Check (or Continue on a word card). After:
 * the result slides up, green when right, grey when not, with the answer in one line.
 */
export function BottomBar({
  result,
  canCheck,
  onCheck,
  onContinue,
  label,
}: {
  result: Result | null;
  canCheck: boolean;
  onCheck: () => void;
  onContinue: () => void;
  label?: string;
}) {
  const t = useTheme();
  const copy = useCopy();
  const insets = useSafeAreaInsets();
  const pad = { paddingBottom: Math.max(insets.bottom, Spacing.three) };
  if (!result) {
    return (
      <View style={[styles.bar, pad, { borderTopColor: t.border, backgroundColor: t.background }]}>
        <Button label={label ?? copy.learn.games.check} disabled={!canCheck} onPress={onCheck} />
      </View>
    );
  }
  return (
    <Rise
      accessibilityLiveRegion="polite"
      style={[styles.bar, styles.sheet, pad, { backgroundColor: result.correct ? t.accent : t.muted }]}>
      <View style={styles.sheetHead}>
        <View style={[styles.badge, { backgroundColor: result.correct ? t.primary : t.card }]}>
          <Icon
            name={result.correct ? 'checkmark' : 'arrow.counterclockwise'}
            size={20}
            weight="bold"
            tintColor={result.correct ? t.primaryForeground : t.textSecondary}
            fallback={null}
          />
        </View>
        <AppText style={[styles.sheetTitle, { color: result.correct ? t.accentForeground : t.text }]}>
          {result.title}
        </AppText>
        {result.xp ? (
          <AppText style={[styles.sheetXp, { color: t.accentForeground }]}>{copy.learn.lesson.xp(result.xp)}</AppText>
        ) : null}
      </View>
      {result.line ? <AppText style={[styles.sheetLine, { color: t.text }]}>{result.line}</AppText> : null}
      <Button label={copy.learn.lesson.continue} onPress={onContinue} />
    </Rise>
  );
}

/** A new word: the module's drawing, the word big, one sentence. */
export function WordCard({ moduleId, word, meaning }: { moduleId: ModuleId; word: string; meaning: string }) {
  const t = useTheme();
  const copy = useCopy();
  const Art = MODULE_ART[moduleId];
  return (
    <View style={styles.wordCard}>
      <Art size={120} />
      <Tag
        label={copy.learn.lesson.newWord}
        style={[styles.centered, { backgroundColor: t.accent }]}
        color={t.accentForeground}
      />
      <AppText accessibilityRole="header" style={[styles.word, { color: t.text }]}>
        {word}
      </AppText>
      <AppText style={[styles.meaning, { color: t.textSecondary }]}>{meaning}</AppText>
    </View>
  );
}

export function Finish({
  moduleId,
  practice,
  xp,
  accuracyPct,
  stats,
  onReplay,
}: {
  moduleId: ModuleId;
  practice: boolean;
  xp: number;
  accuracyPct: number;
  stats: LearnStats;
  onReplay: () => void;
}) {
  const t = useTheme();
  const copy = useCopy();
  const l = copy.learn.lesson;
  const insets = useSafeAreaInsets();
  const known = useLearned();
  const m = moduleFor(moduleId);
  const finished = m && moduleProgress(m, known).complete;
  const Art = MODULE_ART[moduleId];
  const reduced = useReducedMotion();
  const bounce = useSharedValue(reduced ? 1 : 0.6);
  useEffect(() => {
    if (!reduced) bounce.set(withSpring(1, { damping: 9, stiffness: 160 }));
  }, [reduced, bounce]);
  const grow = useAnimatedStyle(() => ({ transform: [{ scale: bounce.get() }] }));
  return (
    <View style={[styles.fill, { paddingBottom: Math.max(insets.bottom, Spacing.three) }]}>
      <ScrollView contentContainerStyle={styles.finish}>
        <Animated.View style={grow}>
          <Art size={150} />
        </Animated.View>
        <AppText accessibilityRole="header" style={[styles.finishTitle, { color: t.primary }]}>
          {practice ? l.practiceDone : l.done}
        </AppText>
        <View style={styles.stats}>
          <Stat icon="bolt.fill" label={l.xpLabel} value={xp} text={`${xp}`} />
          <Stat
            icon="checkmark.circle.fill"
            label={l.accuracyLabel}
            value={accuracyPct}
            text={`${accuracyPct}%`}
            suffix="%"
          />
          <Stat icon="flame.fill" label={l.streakLabel} value={stats.streak} text={l.streakDays(stats.streak)} />
        </View>
        {finished && m ? <ReadingAssignment module={m} learned={known} /> : null}
      </ScrollView>
      <View style={styles.finishButtons}>
        <Button label={l.continue} onPress={() => router.back()} />
        <Button variant="plain" label={copy.learn.games.playAgain} onPress={onReplay} />
      </View>
    </View>
  );
}

function Stat({
  icon,
  label,
  value,
  text,
  suffix = '',
}: {
  icon: SFSymbol;
  label: string;
  value: number;
  text: string;
  suffix?: string;
}) {
  const t = useTheme();
  const shown = useCountUp(value, { delay: 250 });
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${text}`}
      style={[styles.stat, { borderColor: t.primary, backgroundColor: t.card }]}>
      <View style={[styles.statHead, { backgroundColor: t.primary }]}>
        <AppText style={[styles.statLabel, { color: t.primaryForeground }]} numberOfLines={1}>
          {label}
        </AppText>
      </View>
      <View style={styles.statBody}>
        <Icon name={icon} size={20} tintColor={t.primary} fallback={null} />
        <AppText style={[styles.statValue, { color: t.text }]}>{`${shown}${suffix}`}</AppText>
      </View>
    </View>
  );
}

export function haptic(kind: 'success' | 'error' | 'tap') {
  if (kind === 'tap') {
    Haptics.selectionAsync().catch(() => undefined);
    return;
  }
  Haptics.notificationAsync(
    kind === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
  ).catch(() => undefined);
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    minHeight: MinTapTarget,
  },
  close: { width: 32, height: MinTapTarget, alignItems: 'center', justifyContent: 'center' },
  track: { flex: 1, height: 16, borderRadius: Radius.pill, overflow: 'hidden' },
  progress: { height: 16, borderRadius: Radius.pill, paddingTop: 4, paddingHorizontal: 8 },
  shine: { height: 4, borderRadius: Radius.pill },
  comboSlot: { minWidth: 40, alignItems: 'flex-end' },
  combo: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  comboText: { fontFamily: Fonts.extrabold, fontSize: 17 },
  prompt: { fontFamily: Fonts.extrabold, fontSize: 24, lineHeight: 30, letterSpacing: -0.4 },
  tag: { alignSelf: 'flex-start', borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  centered: { alignSelf: 'center' },
  tagText: { fontFamily: Fonts.bold, fontSize: 12, letterSpacing: 0.3, textTransform: 'uppercase' },
  tileLip: { position: 'absolute', left: 0, right: 0, bottom: 0, top: LIP, borderRadius: Radius.lg + 4 },
  tile: {
    minHeight: MinTapTarget + 12,
    marginBottom: LIP,
    borderWidth: 2,
    borderRadius: Radius.lg + 4,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three - 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  tileLabel: { fontFamily: Fonts.bold, fontSize: 17, lineHeight: 22, textAlign: 'center', flexShrink: 1 },
  faded: { opacity: 0.45 },
  bar: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.three,
  },
  sheet: { borderTopWidth: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  badge: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  sheetTitle: { flex: 1, fontFamily: Fonts.extrabold, fontSize: 21, lineHeight: 26 },
  sheetXp: { fontFamily: Fonts.extrabold, fontSize: 15 },
  sheetLine: { fontSize: 16, lineHeight: 22 },
  wordCard: { alignItems: 'center', gap: Spacing.three, paddingTop: Spacing.four },
  word: { fontFamily: Fonts.extrabold, fontSize: 32, lineHeight: 38, letterSpacing: -0.6, textAlign: 'center' },
  meaning: { fontSize: 18, lineHeight: 26, textAlign: 'center' },
  finish: { alignItems: 'center', padding: Spacing.three, paddingTop: Spacing.six, gap: Spacing.four },
  finishTitle: { fontFamily: Fonts.extrabold, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, textAlign: 'center' },
  stats: { flexDirection: 'row', gap: Spacing.two, alignSelf: 'stretch' },
  stat: { flex: 1, borderWidth: 2, borderRadius: Radius.lg + 2, overflow: 'hidden' },
  statHead: { paddingVertical: 4, alignItems: 'center' },
  statLabel: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase' },
  statBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.three,
  },
  statValue: { fontFamily: Fonts.extrabold, fontSize: 20 },
  finishButtons: { paddingHorizontal: Spacing.three, gap: Spacing.one },
});
