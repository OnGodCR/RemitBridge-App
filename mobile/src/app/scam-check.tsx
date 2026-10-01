import { useEffect, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { ScamCheckArt } from '@/components/illustrations';
import { Section, ToolScreen } from '@/components/tool';
import { AppText, Button } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';
import { track } from '@/lib/track';

/**
 * Scam check (the website's /scam-check, DECISIONS.md D58), one question per screen.
 *
 * A list of tickboxes gets skimmed, and someone halfway through being defrauded is exactly
 * the person who skims. So there's no way past a question except by answering it: the
 * friction is the feature. Questions come from FTC and CFPB consumer guidance.
 *
 * The verdict follows the HIGHEST-risk yes, never a total: being asked to pay in gift
 * cards is close to proof on its own, and seven clean answers don't cancel it out. The
 * risk numbers are the lab's own reading of how diagnostic each sign is, not a published
 * statistic, and the result says so. Answers stay on the phone: only "finished" is counted.
 */
/** The questions' words live in i18n (copy.scamCheck.questions), by id; the scores stay here. */
const QUESTIONS = [
  { id: 'payment-method', risk: 10 },
  { id: 'urgency', risk: 5 },
  { id: 'prize', risk: 10 },
  { id: 'romance', risk: 6 },
  { id: 'imposter', risk: 8 },
  { id: 'overpayment', risk: 9 },
  { id: 'emergency', risk: 7 },
  { id: 'mule', risk: 9 },
] as const;

type Answer = 'yes' | 'unsure' | 'no';
const ANSWERS: Answer[] = ['yes', 'unsure', 'no'];

/** Anything at or above this, answered yes, stops the transfer on its own. */
const STOP_AT = 8;

function riskLabel(risk: number, words: { veryHigh: string; high: string; moderate: string; lower: string }) {
  if (risk >= 9) return words.veryHigh;
  if (risk >= 8) return words.high;
  if (risk >= 6) return words.moderate;
  return words.lower;
}

export default function ScamCheckScreen() {
  const t = useTheme();
  const copy = useCopy();
  const sc = copy.scamCheck;
  const words = (id: string) => sc.questions[id];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});

  useEffect(() => track('tool_opened', { tool: 'scam_check' }), []);

  const done = step >= QUESTIONS.length;
  const current = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];

  const answer = (a: Answer) => {
    setAnswers((prev) => ({ ...prev, [current.id]: a }));
    if (step === QUESTIONS.length - 1) track('scam_check_finished');
    setStep((s) => s + 1);
  };

  const bySeverity = (a: { risk: number }, b: { risk: number }) => b.risk - a.risk;
  const flagged = QUESTIONS.filter((q) => answers[q.id] === 'yes').sort(bySeverity);
  const unsure = QUESTIONS.filter((q) => answers[q.id] === 'unsure').sort(bySeverity);
  const top = flagged.length ? flagged[0].risk : 0;

  return (
    <ToolScreen intro={sc.intro} art={<ScamCheckArt />}>
      <View
        style={styles.progress}
        accessible
        accessibilityLabel={done ? sc.allAnswered : sc.questionOf(step + 1, QUESTIONS.length)}>
        <AppText variant="small" muted>
          {done ? sc.allAnswered : sc.questionOf(step + 1, QUESTIONS.length)}
        </AppText>
        <View style={styles.bars}>
          {QUESTIONS.map((q, i) => (
            <View key={q.id} style={[styles.bar, { backgroundColor: i < step ? t.primary : t.border }]} />
          ))}
        </View>
      </View>

      {!done ? (
        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
          <AppText variant="label" style={{ color: t.primary }}>
            {riskLabel(current.risk, sc.risk)} · {current.risk}/10
          </AppText>
          <AppText variant="heading" style={styles.question} accessibilityLiveRegion="polite">
            {words(current.id).ask}
          </AppText>
          <View style={styles.answers}>
            {ANSWERS.map((a) => (
              <Button
                key={a}
                label={sc[a]}
                variant={answers[current.id] === a ? 'primary' : 'secondary'}
                onPress={() => answer(a)}
              />
            ))}
          </View>
          {step > 0 ? <Button label={sc.back} variant="plain" onPress={() => setStep((s) => s - 1)} /> : null}
        </View>
      ) : (
        <>
          <View
            accessibilityLiveRegion="polite"
            style={[
              styles.verdict,
              flagged.length
                ? { backgroundColor: t.hero }
                : { backgroundColor: t.card, borderColor: t.border, borderWidth: StyleSheet.hairlineWidth },
            ]}>
            <AppText variant="title" style={{ color: flagged.length ? t.heroText : t.text }}>
              {flagged.length
                ? top >= STOP_AT
                  ? sc.stop
                  : sc.slowDown
                : unsure.length
                  ? sc.worthChecking
                  : sc.noSigns}
            </AppText>
            <AppText style={{ color: flagged.length ? t.heroMuted : t.textSecondary }}>
              {flagged.length
                ? sc.flaggedBody(top, top >= STOP_AT)
                : unsure.length
                  ? sc.unsureBody(unsure.length)
                  : sc.clearBody}
            </AppText>
          </View>

          {[...flagged, ...unsure].map((q) => (
            <View key={q.id} style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
              <AppText variant="small" style={{ color: answers[q.id] === 'yes' ? t.primary : t.textSecondary }}>
                {answers[q.id] === 'yes' ? sc.saidYes : sc.wasUnsure} · {riskLabel(q.risk, sc.risk)} · {q.risk}/10
              </AppText>
              <AppText variant="label">{words(q.id).ask}</AppText>
              <AppText muted>{words(q.id).why}</AppText>
            </View>
          ))}

          <Section title={sc.ifSent}>
            <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
              <AppText>{sc.step1}</AppText>
              <AppText>
                {sc.step2Before}
                <AppText style={{ color: t.primary }} onPress={() => Linking.openURL('https://reportfraud.ftc.gov')}>
                  reportfraud.ftc.gov
                </AppText>
                {sc.step2After}
              </AppText>
              <AppText>
                {sc.step3Before}
                <AppText
                  style={{ color: t.primary }}
                  onPress={() => Linking.openURL('https://www.consumerfinance.gov/complaint/')}>
                  CFPB
                </AppText>
                {sc.step3After}
              </AppText>
            </View>
          </Section>

          <AppText variant="small" muted>
            {sc.note}
          </AppText>
          <Button
            label={sc.again}
            variant="secondary"
            onPress={() => {
              setAnswers({});
              setStep(0);
            }}
          />
        </>
      )}
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  progress: { gap: Spacing.two },
  bars: { flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  card: { borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.three, gap: Spacing.two },
  question: { fontSize: 20, lineHeight: 27 },
  answers: { gap: Spacing.two, marginTop: Spacing.two },
  verdict: { borderRadius: Radius.lg, padding: Spacing.four, gap: Spacing.two },
});
