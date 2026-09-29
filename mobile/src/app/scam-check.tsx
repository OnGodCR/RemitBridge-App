import { useEffect, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { Section, ToolScreen } from '@/components/tool';
import { AppText, Button } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
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
const QUESTIONS = [
  {
    id: 'payment-method',
    risk: 10,
    ask: 'Have you been asked to pay with a gift card, cryptocurrency, a crypto ATM, or a wire to someone you have never met in person?',
    why: 'These are hard to reverse and hard to trace, which is exactly why scammers ask for them. No legitimate business or government agency demands payment this way.',
  },
  {
    id: 'urgency',
    risk: 5,
    ask: 'Are you being rushed, or told to keep this transfer to yourself?',
    why: 'Pressure and secrecy exist to stop you asking someone you trust. Real institutions give you time and put things in writing.',
  },
  {
    id: 'prize',
    risk: 10,
    ask: 'Do you have to send money first in order to receive a prize, a lottery win, or an inheritance?',
    why: 'A real prize never costs money to collect. The fee is the scam.',
  },
  {
    id: 'romance',
    risk: 6,
    ask: 'Is the person asking for money someone you have only ever met online?',
    why: 'Someone you have never met in person asking for a transfer is among the most common patterns the FTC records, however long you have been talking and however well you feel you know them.',
  },
  {
    id: 'imposter',
    risk: 8,
    ask: 'Did someone contact you saying they are from the government, your bank, or a company, and that money has to move right now?',
    why: 'Agencies do not demand transfers by phone. Hang up and call the organization back on a number you looked up yourself, not one they gave you.',
  },
  {
    id: 'overpayment',
    risk: 9,
    ask: 'Did someone pay you too much and ask you to send the difference back?',
    why: 'The original payment reverses later and the money you sent back is gone. This is classic overpayment fraud.',
  },
  {
    id: 'emergency',
    risk: 7,
    ask: 'Did you get a sudden message that a relative is in trouble somewhere and needs money quickly and quietly?',
    why: 'The family emergency is scripted, and the "tell nobody" is part of the script. Verify with the person directly, or with other family, before anything moves.',
  },
  {
    id: 'mule',
    risk: 9,
    ask: 'Does a job, a prize, or a new friend involve you receiving money and passing it on to someone else?',
    why: 'Moving money for someone else is how money mules are recruited. It can make you part of laundering somebody else’s fraud, with real legal consequences, even if you did not know.',
  },
] as const;

type Answer = 'yes' | 'unsure' | 'no';
const ANSWERS: { value: Answer; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'unsure', label: 'I’m not sure' },
  { value: 'no', label: 'No' },
];

/** Anything at or above this, answered yes, stops the transfer on its own. */
const STOP_AT = 8;

function riskLabel(risk: number) {
  if (risk >= 9) return 'Very high risk';
  if (risk >= 8) return 'High risk';
  if (risk >= 6) return 'Moderate risk';
  return 'Lower risk on its own';
}

export default function ScamCheckScreen() {
  const t = useTheme();
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
    <ToolScreen intro="Eight questions about your situation, one at a time. Nothing you answer leaves your phone.">
      <View style={styles.progress} accessible accessibilityLabel={done ? 'All eight answered' : `Question ${step + 1} of 8`}>
        <AppText variant="small" muted>
          {done ? 'All eight answered' : `Question ${step + 1} of ${QUESTIONS.length}`}
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
            {riskLabel(current.risk)} · {current.risk}/10
          </AppText>
          <AppText variant="heading" style={styles.question} accessibilityLiveRegion="polite">
            {current.ask}
          </AppText>
          <View style={styles.answers}>
            {ANSWERS.map((a) => (
              <Button
                key={a.value}
                label={a.label}
                variant={answers[current.id] === a.value ? 'primary' : 'secondary'}
                onPress={() => answer(a.value)}
              />
            ))}
          </View>
          {step > 0 ? <Button label="Back" variant="plain" onPress={() => setStep((s) => s - 1)} /> : null}
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
                  ? 'Stop. Don’t send anything yet.'
                  : 'Slow down and check this properly.'
                : unsure.length
                  ? 'Worth checking before you send'
                  : 'None of the common warning signs'}
            </AppText>
            <AppText style={{ color: flagged.length ? t.heroMuted : t.textSecondary }}>
              {flagged.length
                ? `The most serious thing you said yes to scores ${top}/10. ${
                    top >= STOP_AT
                      ? 'A sign that serious is close to proof on its own, and money sent this way is rarely recoverable.'
                      : 'On its own it’s a warning rather than proof, but it’s a good reason to check before anything moves.'
                  } Talk to someone you trust first.`
                : unsure.length
                  ? `Nothing here is a definite warning sign, but you weren’t sure about ${unsure.length}. Being unsure is a reason to slow down. Find out for certain first.`
                  : 'You said no to all eight. That’s not a guarantee: this list isn’t everything, and new scams appear all the time. If something still feels wrong, wait a day and ask someone you trust.'}
            </AppText>
          </View>

          {[...flagged, ...unsure].map((q) => (
            <View key={q.id} style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
              <AppText variant="small" style={{ color: answers[q.id] === 'yes' ? t.primary : t.textSecondary }}>
                {answers[q.id] === 'yes' ? 'You said yes' : 'You weren’t sure'} · {riskLabel(q.risk)} · {q.risk}/10
              </AppText>
              <AppText variant="label">{q.ask}</AppText>
              <AppText muted>{q.why}</AppText>
            </View>
          ))}

          <Section title="If money already went">
            <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
              <AppText>1. Contact your transfer provider now and ask them to stop or reverse it.</AppText>
              <AppText>
                2. Report it to the FTC at{' '}
                <AppText style={{ color: t.primary }} onPress={() => Linking.openURL('https://reportfraud.ftc.gov')}>
                  reportfraud.ftc.gov
                </AppText>
                .
              </AppText>
              <AppText>
                3. File a complaint with the{' '}
                <AppText
                  style={{ color: t.primary }}
                  onPress={() => Linking.openURL('https://www.consumerfinance.gov/complaint/')}>
                  CFPB
                </AppText>
                , which takes money-transfer complaints.
              </AppText>
            </View>
          </Section>

          <AppText variant="small" muted>
            The risk numbers are our own reading of how strongly each sign points to fraud on its own, drawn from FTC
            and CFPB guidance. They aren’t a published statistic or your odds of being defrauded. This is education,
            not legal or financial advice, and we can’t recover money or step in with a company.
          </AppText>
          <Button
            label="Start again"
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
