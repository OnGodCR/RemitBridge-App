import { Redirect, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import {
  BottomBar,
  ExampleTag,
  Finish,
  haptic,
  Prompt,
  TopBar,
  Tile,
  WordCard,
  type Result,
  type TileState,
} from '@/components/learn-lesson';
import { Rise } from '@/components/motion-views';
import { AppText } from '@/components/ui';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { Term } from '@/data/glossary';
import { termIn } from '@/data/glossary-translations';
import { moduleFor, type Module } from '@/data/modules';
import { useGutter } from '@/hooks/use-gutter';
import { useTheme } from '@/hooks/use-theme';
import { useCopy, useLanguage } from '@/i18n';
import type { Copy } from '@/i18n/en';
import { announce } from '@/lib/announce';
import { money } from '@/lib/format';
import {
  boardDone,
  buildGame,
  gameAccuracy,
  gameDone,
  gameReducer,
  rightChoice,
  startGame,
  type ChoiceQuestion,
  type ExampleTransfer,
  type GameState,
  type ReceiptField,
  type SafetyChoice,
} from '@/lib/learn-games';
import { markLearned, recordLesson, useLearned, type LearnStats } from '@/lib/learn-progress';
import { firstSentence } from '@/lib/lesson';
import { track } from '@/lib/track';

/**
 * A Learn lesson (DECISIONS.md D136, D172), played as one of six games. Every question works
 * the same way, like Duolingo: tap an answer, press Check, and a sheet slides up with the
 * result and Continue. A match board needs no Check: pairs clear as they're found.
 */
export default function LessonScreen() {
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const m = moduleFor(id);
  const [round, setRound] = useState(0);
  if (!m) return <Redirect href="/learn" />;
  return <Lesson key={`${m.id}:${mode}:${round}`} module={m} mode={mode} onReplay={() => setRound((n) => n + 1)} />;
}

const SAFETY_ICONS = {
  flag: 'exclamationmark.circle.fill',
  fine: 'checkmark.circle.fill',
  unsure: 'questionmark.circle',
} as const;

function Lesson({ module: m, mode, onReplay }: { module: Module; mode?: string; onReplay: () => void }) {
  const learnedAtStart = useLearned();
  const [plan] = useState(() => buildGame(m, learnedAtStart, mode));
  const [state, dispatch] = useReducer(gameReducer, plan.steps, startGame);
  const [stats, setStats] = useState<LearnStats | null>(null);
  const recorded = useRef(false);
  // The answer picked but not yet checked.
  const [picked, setPicked] = useState<string>();
  const scroll = useRef<ScrollView>(null);
  const t = useTheme();
  const gutter = useGutter(0);
  const copy = useCopy();
  const g = copy.learn.games;
  const l = copy.learn.lesson;
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const step = state.steps[state.index];
  const done = gameDone(state);
  const shown = (term: Term) => ({
    ...termIn(language.code, term),
    ...(term.id === 'corridor' ? { term: g.routeWord } : {}),
  });

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
    announce(plan.practice ? l.practiceDone : l.done);
  }, [done, state, m.id, plan, l]);

  const next = () => {
    setPicked(undefined);
    dispatch({ type: 'next' });
    scroll.current?.scrollTo({ y: 0, animated: false });
  };

  const check = (choice: string) => {
    const after = gameReducer(state, { type: 'answer', choice });
    if (after === state) return;
    haptic(after.answer?.correct ? 'success' : 'error');
    dispatch({ type: 'answer', choice });
  };

  const tryPair = (word: string, meaning: string): boolean => {
    const after = gameReducer(state, { type: 'answer', choice: meaning, termId: word });
    if (after === state) return false;
    const right = !!after.answer?.correct;
    haptic(right ? 'success' : 'error');
    announce(right ? l.right[after.matched.length % l.right.length] : l.wrong);
    dispatch({ type: 'answer', choice: meaning, termId: word });
    return right;
  };

  // A cleared board moves on by itself after a beat, the way Duolingo's does.
  const cleared = boardDone(state);
  useEffect(() => {
    if (!cleared) return;
    announce(g.allMatched);
    const timer = setTimeout(() => dispatch({ type: 'next' }), 700);
    return () => clearTimeout(timer);
  }, [cleared, g.allMatched]);

  if (done && stats) {
    return (
      <View style={[styles.fill, { backgroundColor: t.background, paddingTop: insets.top }]}>
        <StatusBar style="auto" />
        <Finish
          moduleId={m.id}
          practice={plan.practice}
          xp={state.xp}
          accuracyPct={gameAccuracy(state)}
          stats={stats}
          onReplay={onReplay}
        />
      </View>
    );
  }
  if (!step) return null;

  let body: ReactNode = null;
  let bottom: ReactNode = null;

  if (step.kind === 'teach') {
    const word = shown(step.term);
    body = <WordCard moduleId={m.id} word={word.term} meaning={firstSentence(word.plain)} />;
    bottom = <BottomBar result={null} canCheck label={l.continue} onCheck={next} onContinue={next} />;
  } else if (step.kind === 'match') {
    body = (
      <>
        <Prompt>{g.matchPrompt}</Prompt>
        <MatchBoard
          key={state.index}
          terms={step.terms}
          meanings={step.meanings}
          matched={state.matched}
          word={(term) => shown(term).term}
          meaning={(term) => firstSentence(shown(term).plain)}
          onPair={tryPair}
        />
      </>
    );
    bottom = null;
  } else {
    const answered = state.answer;
    const stateFor = (choice: string): TileState =>
      !answered
        ? picked === choice
          ? 'selected'
          : 'idle'
        : choice === rightChoice(step)
          ? 'right'
          : choice === answered.choice
            ? 'wrong'
            : 'faded';
    const pick = (choice: string) => {
      if (answered) return;
      haptic('tap');
      setPicked(choice);
    };
    body = (
      <>
        {step.retry ? <AppText style={[styles.again, { color: t.textSecondary }]}>{l.again}</AppText> : null}
        <Question step={step} copy={copy} shown={shown} stateFor={stateFor} pick={pick} answered={!!answered} />
      </>
    );
    bottom = (
      <BottomBar
        result={answered ? resultFor(step, state, copy) : null}
        canCheck={!!picked}
        onCheck={() => picked && check(picked)}
        onContinue={next}
      />
    );
  }

  return (
    <View style={[styles.fill, { backgroundColor: t.background, paddingTop: insets.top + Spacing.two, paddingHorizontal: gutter }]}>
      <StatusBar style="auto" />
      <TopBar
        progress={state.steps.length ? state.index / state.steps.length : 0}
        combo={state.combo}
        stepLabel={l.progressLabel(state.index + 1, state.steps.length)}
      />
      <ScrollView ref={scroll} contentContainerStyle={styles.body}>
        <Rise key={state.index} style={styles.stack}>
          {body}
        </Rise>
      </ScrollView>
      {bottom}
    </View>
  );
}

/**
 * A match board, like Duolingo's: words on the left, meanings on the right. Tap one on either
 * side, then its partner on the other. A right pair flashes green and greys out; a wrong one
 * shakes. The board moves on once every pair is found.
 */
function MatchBoard({
  terms,
  meanings,
  matched,
  word,
  meaning,
  onPair,
}: {
  terms: Term[];
  meanings: Term[];
  matched: string[];
  word: (term: Term) => string;
  meaning: (term: Term) => string;
  onPair: (word: string, meaning: string) => boolean;
}) {
  const [picked, setPicked] = useState<{ side: 'word' | 'meaning'; id: string } | null>(null);
  const [flash, setFlash] = useState<{ kind: 'right' | 'wrong'; word: string; meaning: string } | null>(null);
  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), flash.kind === 'right' ? 450 : 600);
    return () => clearTimeout(timer);
  }, [flash]);

  const tap = (side: 'word' | 'meaning', id: string) => {
    if (!picked || picked.side === side) {
      haptic('tap');
      setPicked(picked?.side === side && picked.id === id ? null : { side, id });
      return;
    }
    const pair = side === 'word' ? { word: id, meaning: picked.id } : { word: picked.id, meaning: id };
    setPicked(null);
    setFlash({ kind: onPair(pair.word, pair.meaning) ? 'right' : 'wrong', ...pair });
  };
  const stateOf = (side: 'word' | 'meaning', id: string): TileState => {
    if (flash && flash[side] === id) return flash.kind;
    if (matched.includes(id)) return 'done';
    return picked?.side === side && picked.id === id ? 'selected' : 'idle';
  };
  return (
    <View style={styles.board}>
      <View style={styles.wordColumn}>
        {terms.map((term) => (
          <Tile
            key={term.id}
            label={word(term)}
            state={stateOf('word', term.id)}
            disabled={matched.includes(term.id)}
            onPress={() => tap('word', term.id)}
          />
        ))}
      </View>
      <View style={styles.meaningColumn}>
        {meanings.map((term) => (
          <Tile
            key={term.id}
            label={meaning(term)}
            small
            state={stateOf('meaning', term.id)}
            disabled={matched.includes(term.id)}
            onPress={() => tap('meaning', term.id)}
          />
        ))}
      </View>
    </View>
  );
}

/** The sheet after Check: a cheer or "Not quite", the answer when it was missed, and why for scams. */
function resultFor(step: ChoiceQuestion, state: GameState, copy: Copy): Result {
  const g = copy.learn.games;
  const l = copy.learn.lesson;
  const answer = state.answer!;
  const title = answer.correct ? l.right[state.index % l.right.length] : l.wrong;
  if (step.kind === 'safety')
    return { correct: answer.correct, title, xp: answer.xp, line: g.scenarios[step.scenario].why };
  if (answer.correct) return { correct: true, title, xp: answer.xp };
  const right = rightChoice(step);
  const label =
    step.kind === 'quick'
      ? g[step.correct]
      : step.kind === 'cost'
        ? right.toUpperCase()
        : g.receiptLines[right as ReceiptField];
  return { correct: false, title, xp: 0, line: g.answerIs(label) };
}

function Question({
  step,
  copy,
  shown,
  stateFor,
  pick,
  answered,
}: {
  step: ChoiceQuestion;
  copy: Copy;
  shown: (term: Term) => { term: string; plain: string };
  stateFor: (choice: string) => TileState;
  pick: (choice: string) => void;
  answered: boolean;
}) {
  const t = useTheme();
  const g = copy.learn.games;
  if (step.kind === 'quick') {
    return (
      <>
        <Prompt>{g.quickPrompt}</Prompt>
        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border, borderBottomColor: t.rim }]}>
          <AppText style={[styles.cardWord, { color: t.primary }]}>{shown(step.term).term}</AppText>
          <AppText style={[styles.cardText, { color: t.text }]}>{firstSentence(shown(step.meaning).plain)}</AppText>
        </View>
        <View style={styles.row}>
          {(['true', 'false'] as const).map((value) => (
            <Tile
              key={value}
              style={styles.half}
              icon={value === 'true' ? 'checkmark' : 'xmark'}
              label={g[value]}
              state={stateFor(value)}
              disabled={answered}
              onPress={() => pick(value)}
            />
          ))}
        </View>
      </>
    );
  }
  if (step.kind === 'cost') {
    return (
      <>
        <Prompt>{g.costPrompt}</Prompt>
        <ExampleTag />
        <View style={styles.row}>
          {step.examples.map((example, i) => {
            const choice = i === 0 ? 'a' : 'b';
            return (
              <Tile
                key={choice}
                style={styles.half}
                state={stateFor(choice)}
                disabled={answered}
                accessibilityLabel={`${choice.toUpperCase()}. ${g.fee} ${money(example.cost.feeCost, 'USD')}. ${g.rate} ${rate(example)}`}
                onPress={() => pick(choice)}>
                <PriceCard letter={choice.toUpperCase()} example={example} reveal={answered} copy={copy} />
              </Tile>
            );
          })}
        </View>
      </>
    );
  }
  if (step.kind === 'receipt') {
    return (
      <>
        <Prompt>{g.receiptPrompt[step.field]}</Prompt>
        <View style={[styles.receipt, { backgroundColor: t.card, borderColor: t.border }]}>
          <View style={styles.receiptHead}>
            <Icon name="doc.text" size={20} tintColor={t.textSecondary} fallback={null} />
            <AppText style={[styles.receiptTitle, { color: t.text }]}>{g.receiptTitle}</AppText>
            <ExampleTag />
          </View>
          <View style={[styles.dashed, { borderColor: t.border }]} />
          {(['fee', 'rate', 'received'] as ReceiptField[]).map((field) => (
            <Tile
              key={field}
              state={stateFor(field)}
              disabled={answered}
              accessibilityLabel={`${g.receiptLines[field]}: ${receiptValue(field, step.example)}`}
              onPress={() => pick(field)}>
              <View style={styles.receiptLine}>
                <AppText style={styles.receiptLabel}>{g.receiptLines[field]}</AppText>
                <AppText style={styles.receiptValue}>{receiptValue(field, step.example)}</AppText>
              </View>
            </Tile>
          ))}
        </View>
      </>
    );
  }
  return (
    <>
      <Prompt>{g.safetyPrompt}</Prompt>
      <View style={styles.chat}>
        <View style={[styles.avatar, { backgroundColor: t.muted }]}>
          <Icon name="person.crop.circle" size={26} tintColor={t.textSecondary} fallback={null} />
        </View>
        <View style={[styles.bubble, { backgroundColor: t.card, borderColor: t.border }]}>
          <AppText style={[styles.cardText, { color: t.text }]}>{g.scenarios[step.scenario].text}</AppText>
        </View>
      </View>
      <View style={styles.stack}>
        {(Object.keys(g.safetyChoices) as SafetyChoice[]).map((value) => (
          <Tile
            key={value}
            icon={SAFETY_ICONS[value]}
            label={g.safetyChoices[value]}
            state={stateFor(value)}
            disabled={answered}
            onPress={() => pick(value)}
          />
        ))}
      </View>
    </>
  );
}

/** One side of "who sends more?": the fee and rate, and once checked, what arrives. */
function PriceCard({
  letter,
  example,
  reveal,
  copy,
}: {
  letter: string;
  example: ExampleTransfer;
  reveal: boolean;
  copy: Copy;
}) {
  const t = useTheme();
  const g = copy.learn.games;
  return (
    <View style={styles.price}>
      <AppText style={[styles.letter, { color: t.primary }]}>{letter}</AppText>
      <View>
        <AppText style={[styles.priceLabel, { color: t.textSecondary }]}>{g.fee}</AppText>
        <AppText style={[styles.priceValue, { color: t.text }]}>{money(example.cost.feeCost, 'USD')}</AppText>
      </View>
      <View>
        <AppText style={[styles.priceLabel, { color: t.textSecondary }]}>{g.rate}</AppText>
        <AppText style={[styles.priceValue, { color: t.text }]}>{rate(example)}</AppText>
      </View>
      {reveal ? (
        <View>
          <AppText style={[styles.priceLabel, { color: t.textSecondary }]}>{g.arrives}</AppText>
          <AppText style={[styles.priceValue, { color: t.moneyReceived }]}>
            {money(example.cost.amountReceived, 'MXN')}
          </AppText>
          {example.cost.markupCost > 0 ? (
            <AppText style={[styles.priceLabel, { color: t.moneyMarkupText }]}>
              {g.hidden(money(example.cost.markupCost, 'USD'))}
            </AppText>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const rate = (example: ExampleTransfer) => `${example.input.quotedRate.toFixed(2)} MXN`;

/** A receipt line as providers print it: their wording and the unit, so the player has to know which is which. */
function receiptValue(field: ReceiptField, example: ExampleTransfer): string {
  if (field === 'fee') return money(example.cost.feeCost, 'USD');
  if (field === 'rate') return `1 USD = ${example.input.quotedRate.toFixed(2)} MXN`;
  return money(example.cost.amountReceived, 'MXN');
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  body: { flexGrow: 1, padding: Spacing.three, paddingTop: Spacing.four, paddingBottom: Spacing.five },
  stack: { gap: Spacing.three },
  row: { flexDirection: 'row', gap: Spacing.three },
  half: { flex: 1 },
  board: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start' },
  wordColumn: { flex: 2, gap: Spacing.two },
  meaningColumn: { flex: 3, gap: Spacing.two },
  again: { fontFamily: Fonts.bold, fontSize: 13, letterSpacing: 0.3, textTransform: 'uppercase' },
  card: { borderWidth: 2, borderBottomWidth: 5, borderRadius: Radius.lg + 4, padding: Spacing.three, gap: Spacing.two },
  cardWord: { fontFamily: Fonts.extrabold, fontSize: 24, lineHeight: 30 },
  cardText: { fontSize: 18, lineHeight: 26 },
  price: { alignSelf: 'stretch', flex: 1, gap: Spacing.two },
  letter: { fontFamily: Fonts.extrabold, fontSize: 26, lineHeight: 30 },
  priceLabel: { fontFamily: Fonts.semibold, fontSize: 13, lineHeight: 17 },
  priceValue: { fontFamily: Fonts.extrabold, fontSize: 18, lineHeight: 23, fontVariant: ['tabular-nums'] },
  receipt: { borderWidth: 2, borderRadius: Radius.lg + 4, padding: Spacing.three, gap: Spacing.two },
  receiptHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  receiptTitle: { flex: 1, fontFamily: Fonts.extrabold, fontSize: 18 },
  dashed: { borderTopWidth: 2, borderStyle: 'dashed', marginBottom: Spacing.one },
  receiptLine: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  receiptLabel: { fontFamily: Fonts.semibold, fontSize: 15, flexShrink: 1 },
  receiptValue: { fontFamily: Fonts.extrabold, fontSize: 16, fontVariant: ['tabular-nums'] },
  chat: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  bubble: { flex: 1, borderWidth: 2, borderRadius: 18, borderBottomLeftRadius: 4, padding: Spacing.three },
});
