import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, TextInput } from 'react-native';

import { DisplayTitle, Eyebrow } from '@/components/brand';
import { Rise } from '@/components/motion-views';
import { Step } from '@/components/onboarding';
import { AppText, Button } from '@/components/ui';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';
import { announce } from '@/lib/announce';
import { setPendingOptIn } from '@/lib/newsletter';
import { prefs } from '@/lib/prefs';

/**
 * The questions, together and before sign-up (Angad, 2026-10-17): the year of birth and
 * the newsletter, which used to sit on the sign-in step beside the buttons.
 *
 * The age check is the same neutral screen as before (COPPA; the FTC's guidance): no hint
 * of the cutoff, 13 or younger by year counts as under, and only the pass or block flag is
 * kept on the phone, never the year. "Not now" moves on without answering; the sign-in step
 * then asks the year itself before showing any account button, as it always has.
 */
export default function AboutYou() {
  const t = useTheme();
  const copy = useCopy();
  const o = copy.onboarding.about;
  const si = copy.signIn;
  const [gate, setGate] = useState(prefs.ageGate);
  const [year, setYear] = useState('');
  const [optIn, setOptIn] = useState(false);
  const thisYear = new Date().getFullYear();
  const yearOk = /^\d{4}$/.test(year) && Number(year) >= 1900 && Number(year) <= thisYear;

  const next = () => router.push('/onboarding/why');

  const answer = () => {
    if (gate === null) {
      if (!yearOk) return;
      const result = thisYear - Number(year) <= 13 ? 'blocked' : 'ok';
      prefs.setAgeGate(result);
      setGate(result);
      if (result === 'blocked') {
        setPendingOptIn(false);
        announce(si.tooYoung);
        return;
      }
    }
    setPendingOptIn(optIn);
    next();
  };

  return (
    <Step
      step={3}
      of={5}
      actions={
        <Rise step={4} style={styles.actions}>
          <Button
            label={si.continue}
            trailingIcon="arrow.right"
            onPress={gate === 'blocked' ? next : answer}
            disabled={gate === null && !yearOk}
          />
          {gate === null ? (
            <Button
              label={si.skip}
              variant="plain"
              onPress={() => {
                setPendingOptIn(false);
                next();
              }}
            />
          ) : null}
        </Rise>
      }>
      <Rise step={0} style={styles.head}>
        <Eyebrow>{o.eyebrow}</Eyebrow>
        <DisplayTitle lead={o.lead} accent={o.accent} />
        <AppText style={[styles.intro, { color: t.textSecondary }]}>
          {gate === 'blocked' ? si.tooYoung : o.intro}
        </AppText>
      </Rise>

      {gate === null ? (
        <Rise step={1}>
          <TextInput
            value={year}
            onChangeText={(v) => setYear(v.replace(/\D/g, '').slice(0, 4))}
            onSubmitEditing={answer}
            keyboardType="number-pad"
            returnKeyType="done"
            maxLength={4}
            placeholder={si.birthYear}
            placeholderTextColor={t.textSecondary}
            accessibilityLabel={si.birthYear}
            maxFontSizeMultiplier={2}
            style={[styles.input, { color: t.text, backgroundColor: t.card, borderColor: t.border }]}
          />
        </Rise>
      ) : null}

      {/* The newsletter (D169): off unless turned on here or in Account, never by default. */}
      {gate !== 'blocked' ? (
        <Rise step={2} style={styles.optIn}>
          <AppText style={[styles.optInText, { color: t.text }]}>{si.newsletterOptIn}</AppText>
          <Switch
            value={optIn}
            onValueChange={setOptIn}
            trackColor={{ true: t.primary, false: t.border }}
            accessibilityLabel={si.newsletterOptIn}
          />
        </Rise>
      ) : null}
    </Step>
  );
}

const styles = StyleSheet.create({
  head: { gap: Spacing.three, marginBottom: Spacing.two },
  intro: { fontSize: 16, lineHeight: 23 },
  actions: { gap: Spacing.three },
  input: {
    minHeight: 56,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontFamily: Fonts.medium,
    fontSize: 17,
  },
  optIn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginTop: Spacing.two },
  optInText: { flex: 1, fontSize: 17, lineHeight: 24 },
});
