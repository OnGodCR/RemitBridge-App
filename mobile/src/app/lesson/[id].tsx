import { Redirect, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useReducer, useRef, useState } from 'react';
import { AppState, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Feedback,
  Finish,
  haptic,
  LessonCard,
  Option,
  Teach,
  TopBar,
  type OptionState,
} from '@/components/learn-lesson';
import { Rise } from '@/components/motion-views';
import { AppText, Button, Segmented } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import type { Term } from '@/data/glossary';
import { termIn } from '@/data/glossary-translations';
import { moduleFor, type Module } from '@/data/modules';
import { useTheme } from '@/hooks/use-theme';
import { useCopy, useLanguage } from '@/i18n';
import type { Copy } from '@/i18n/en';
import { announce } from '@/lib/announce';
import {
  buildGame,
  gameAccuracy,
  gameDone,
  gameReducer,
  rightChoice,
  SAFETY,
  startGame,
  type ExampleTransfer,
  type GameQuestion,
  type GameState,
  type ReceiptField,
  type SafetyChoice,
} from '@/lib/learn-games';
import { markLearned, recordLesson, useLearned, type LearnStats } from '@/lib/learn-progress';
import { track } from '@/lib/track';
import { firstSentence } from '@/lib/lesson';

export default function LessonScreen() {
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const m = moduleFor(id);
  const [round, setRound] = useState(0);
  if (!m) return <Redirect href="/learn" />;
  return <Lesson key={`${m.id}:${mode}:${round}`} module={m} mode={mode} onReplay={() => setRound((n) => n + 1)} />;
}

function Lesson({ module: m, mode, onReplay }: { module: Module; mode?: string; onReplay: () => void }) {
  const learnedAtStart = useLearned();
  const [plan] = useState(() => buildGame(m, learnedAtStart, mode));
  const [state, dispatch] = useReducer(gameReducer, plan.steps, startGame);
  const [stats, setStats] = useState<LearnStats | null>(null);
  const recorded = useRef(false);
  const [selected, setSelected] = useState<string>();
  const [details, setDetails] = useState(false);
  const [timed, setTimed] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const t = useTheme();
  const copy = useCopy();
  const g = copy.learn.games;
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const step = state.steps[state.index];
  const done = gameDone(state);
  const shown = (term: Term) => ({
    ...termIn(language.code, term),
    ...(term.id === 'corridor' ? { term: g.routeWord } : {}),
  });
  const answerText = step && step.kind !== 'teach' ? answerLabel(step, state, copy, (term) => shown(term).plain) : '';

  useEffect(() => track('lesson_started', { module: m.id, mode: plan.mode, practice: plan.practice }), [m.id, plan]);
  useEffect(() => state.learned.forEach(markLearned), [state.learned]);
  useEffect(() => {
    if (!done || recorded.current) return;
    recorded.current = true;
    setStats(recordLesson(state.xp));
    track('lesson_finished', {
      module: m.id,
      mode: plan.mode,
      practice: plan.practice,
      xp: state.xp,
      accuracy: gameAccuracy(state),
    });
    haptic('success');
    announce(plan.practice ? copy.learn.lesson.practiceDone : copy.learn.lesson.done);
  }, [done, state, m.id, plan, copy.learn.lesson]);
  useEffect(() => {
    if (state.answer)
      announce(
        state.answer.correct ? g.correct : `${copy.learn.lesson.wrong} ${copy.learn.lesson.answerWas(answerText)}`,
      );
  }, [state.answer, answerText, copy.learn.lesson, g.correct]);

  const next = () => {
    setSelected(undefined);
    setDetails(false);
    dispatch({ type: 'next' });
    scroll.current?.scrollTo({ y: 0, animated: false });
  };
  const answer = (choice: string, termId?: string) => {
    const action = { type: 'answer' as const, choice, termId };
    const after = gameReducer(state, action);
    if (after === state) return;
    haptic(after.answer?.correct ? 'success' : 'error');
    dispatch(action);
  };
  return (
    <View
      style={[
        styles.fill,
        { backgroundColor: t.background, paddingTop: insets.top + Spacing.two, paddingBottom: insets.bottom },
      ]}>
      <StatusBar style="auto" />
      {done && stats ? (
        <Finish
          moduleId={m.id}
          practice={plan.practice}
          xp={state.xp}
          accuracyPct={gameAccuracy(state)}
          learned={state.learned.length}
          stats={stats}
          onReplay={onReplay}
        />
      ) : (
        <>
          <TopBar
            progress={state.steps.length ? state.index / state.steps.length : 0}
            combo={state.combo}
            stepLabel={copy.learn.lesson.progressLabel(state.index + 1, state.steps.length)}
          />
          <ScrollView
            ref={scroll}
            contentContainerStyle={styles.body}
            onContentSizeChange={() => {
              if (state.answer && !details) scroll.current?.scrollToEnd({ animated: false });
            }}>
            <AppText variant="label" muted>
              {g.modes[plan.mode]}
            </AppText>
            {step?.kind === 'teach' ? (
              <Rise key={state.index} style={styles.stack}>
                <Teach term={step.term} />
                <Button label={copy.learn.lesson.gotIt} onPress={next} />
              </Rise>
            ) : step ? (
              <Rise key={state.index} style={styles.stack}>
                {'retry' in step && step.retry ? (
                  <AppText variant="label" muted>
                    {copy.learn.lesson.again}
                  </AppText>
                ) : null}
                {step.kind === 'match' ? (
                  <>
                    <AppText variant="heading" accessibilityRole="header">
                      {g.matchPrompt}
                    </AppText>
                    <View style={styles.words}>
                      {step.terms.map((term) => (
                        <View key={term.id} style={styles.word}>
                          {state.matched.includes(term.id) ? (
                            <LessonCard>
                              <AppText variant="label">{shown(term).term}</AppText>
                              <AppText variant="small" muted>
                                {g.matched}
                              </AppText>
                            </LessonCard>
                          ) : (
                            <Option
                              label={shown(term).term}
                              state={selected === term.id ? 'selected' : 'idle'}
                              disabled={!!state.answer}
                              onPress={() => {
                                setSelected(term.id);
                                announce(`${shown(term).term}. ${g.selected}`);
                              }}
                            />
                          )}
                        </View>
                      ))}
                    </View>
                    {step.meanings
                      .filter((term) => !state.matched.includes(term.id))
                      .map((term) => (
                        <Option
                          key={term.id}
                          label={firstSentence(shown(term).plain)}
                          state={
                            state.answer
                              ? term.id === state.answer.termId
                                ? 'right'
                                : term.id === state.answer.choice
                                  ? 'wrong'
                                  : 'faded'
                              : 'idle'
                          }
                          disabled={!selected}
                          onPress={() => answer(term.id, selected)}
                        />
                      ))}
                  </>
                ) : step.kind === 'quick' ? (
                  <>
                    <View style={styles.stack}>
                      <Segmented
                        options={[
                          { value: 'off', label: g.timerOff },
                          { value: 'on', label: g.timerOn },
                        ]}
                        value={timed ? 'on' : 'off'}
                        onChange={(value) => setTimed(value === 'on')}
                      />
                      {timed ? <Elapsed running={!state.answer} label={g.elapsed} /> : null}
                    </View>
                    <AppText variant="heading" accessibilityRole="header">
                      {g.quickPrompt}
                    </AppText>
                    <LessonCard>
                      <AppText variant="title">{shown(step.term).term}</AppText>
                      <AppText>{firstSentence(shown(step.meaning).plain)}</AppText>
                    </LessonCard>
                    {(['true', 'false'] as const).map((value) => (
                      <Option
                        key={value}
                        label={g[value]}
                        state={optionState(value, step, state)}
                        onPress={() => answer(value)}
                      />
                    ))}
                  </>
                ) : step.kind === 'cost' ? (
                  <>
                    <AppText variant="heading" accessibilityRole="header">
                      {g.costPrompt}
                    </AppText>
                    <ExampleHeading />
                    {step.examples.map((example, i) => (
                      <LessonCard key={i}>
                        <AppText variant="heading">{i === 0 ? g.providerA : g.providerB}</AppText>
                        <MoneyRow label={g.budget} value={example.input.sent} />
                        <MoneyRow label={g.fee} value={example.cost.feeCost} color={t.moneyFee} />
                        <MoneyRow label={g.rate} value={example.input.quotedRate} />
                        <MoneyRow label={g.received} value={example.cost.amountReceived} color={t.moneyReceived} />
                      </LessonCard>
                    ))}
                    {(['a', 'b', 'tie'] as const).map((value) => (
                      <Option
                        key={value}
                        label={value === 'a' ? g.providerA : value === 'b' ? g.providerB : g.tie}
                        state={optionState(value, step, state)}
                        onPress={() => answer(value)}
                      />
                    ))}
                  </>
                ) : step.kind === 'receipt' ? (
                  <>
                    <AppText variant="heading" accessibilityRole="header">
                      {g.receiptPrompt[step.field]}
                    </AppText>
                    <ExampleHeading />
                    <LessonCard>
                      <MoneyRow label={g.budget} value={step.example.input.sent} />
                      {(['fee', 'rate', 'received'] as ReceiptField[]).map((field) => (
                        <Option
                          key={field}
                          label={`${g.receiptLines[field]}: ${receiptValue(field, step.example)}`}
                          state={optionState(field, step, state)}
                          onPress={() => answer(field)}
                        />
                      ))}
                    </LessonCard>
                  </>
                ) : (
                  <>
                    <AppText variant="heading" accessibilityRole="header">
                      {g.safetyPrompt}
                    </AppText>
                    <LessonCard>
                      <AppText>{g.scenarios[step.scenario].text}</AppText>
                    </LessonCard>
                    {(Object.keys(g.safetyChoices) as SafetyChoice[]).map((value) => (
                      <Option
                        key={value}
                        label={g.safetyChoices[value]}
                        state={optionState(value, step, state)}
                        onPress={() => answer(value)}
                      />
                    ))}
                  </>
                )}
                {state.answer ? (
                  <Feedback
                    correct={state.answer.correct}
                    answerText={answerText}
                    xp={state.answer.xp}
                    onContinue={next}>
                    <Button
                      variant="plain"
                      label={details ? g.hideDetails : g.details}
                      onPress={() => setDetails(!details)}
                    />
                    {details ? (
                      step.kind === 'cost' ? (
                        <>
                          <AppText>{g.costWhy}</AppText>
                          {step.examples.map((example, i) => (
                            <CostDetails key={i} example={example} title={i === 0 ? g.providerA : g.providerB} />
                          ))}
                        </>
                      ) : step.kind === 'receipt' ? (
                        <CostDetails example={step.example} />
                      ) : step.kind === 'safety' ? (
                        <AppText>{g.scenarios[step.scenario].why}</AppText>
                      ) : (
                        <AppText>
                          {step.kind === 'quick'
                            ? shown(step.term).plain
                            : shown(step.terms.find((term) => term.id === state.answer?.termId)!).plain}
                        </AppText>
                      )
                    ) : null}
                  </Feedback>
                ) : null}
              </Rise>
            ) : null}
          </ScrollView>
        </>
      )}
    </View>
  );
}

function answerLabel(step: GameQuestion, state: GameState, copy: Copy, plain: (term: Term) => string): string {
  const g = copy.learn.games;
  if (step.kind === 'match') {
    const term = step.terms.find((t) => t.id === state.answer?.termId);
    return term ? firstSentence(plain(term)) : '';
  }
  if (step.kind === 'quick') return `${g[step.correct]}. ${firstSentence(plain(step.term))}`;
  if (step.kind === 'receipt') return g[step.field];
  if (step.kind === 'safety') return g.safetyChoices[SAFETY[step.scenario].answer];
  const choice = rightChoice(step);
  return choice === 'a' ? g.providerA : choice === 'b' ? g.providerB : g.tie;
}
function optionState(choice: string, step: Exclude<GameQuestion, { kind: 'match' }>, state: GameState): OptionState {
  return !state.answer
    ? 'idle'
    : choice === rightChoice(step)
      ? 'right'
      : choice === state.answer.choice
        ? 'wrong'
        : 'faded';
}
function ExampleHeading() {
  const g = useCopy().learn.games;
  return (
    <View>
      <AppText variant="label">{g.example}</AppText>
      <AppText variant="small" muted>
        {g.exampleNote}
      </AppText>
    </View>
  );
}
/** A receipt line as providers print it: the provider's own wording and the unit, so the player has to know which is which. */
function receiptValue(field: ReceiptField, example: ExampleTransfer): string {
  if (field === 'fee') return `${number(example.cost.feeCost)} USD`;
  if (field === 'rate') return `1 USD = ${number(example.input.quotedRate)} MXN`;
  return `${number(example.cost.amountReceived)} MXN`;
}
const number = (value: number) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function MoneyRow({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <View style={styles.moneyRow}>
      <AppText variant="small" style={styles.flex}>
        {label}
      </AppText>
      <AppText variant="heading" style={color ? { color } : undefined}>
        {number(value)}
      </AppText>
    </View>
  );
}
function CostDetails({ example, title }: { example: ExampleTransfer; title?: string }) {
  const g = useCopy().learn.games;
  const t = useTheme();
  return (
    <LessonCard>
      {title ? <AppText variant="heading">{title}</AppText> : null}
      <MoneyRow label={g.midRate} value={example.input.midRate} />
      <MoneyRow label={g.fee} value={example.cost.feeCost} color={t.moneyFee} />
      <MoneyRow label={g.markup} value={example.cost.markupCost} color={t.moneyMarkupText} />
      <MoneyRow label={g.totalCost} value={example.cost.totalCost} />
      <MoneyRow label={g.received} value={example.cost.amountReceived} color={t.moneyReceived} />
    </LessonCard>
  );
}
/** Opt-in elapsed time, paused on feedback and in the background. No deadline or score penalty. */
function Elapsed({ running, label }: { running: boolean; label: string }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      if (AppState.currentState === 'active') setSeconds((n) => n + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);
  return (
    <AppText
      variant="small"
      muted>{`${label}: ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`}</AppText>
  );
}
const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  body: { padding: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.three },
  stack: { gap: Spacing.three },
  words: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  word: { flexGrow: 1, flexBasis: Spacing.six + Spacing.five },
  moneyRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.two },
});
