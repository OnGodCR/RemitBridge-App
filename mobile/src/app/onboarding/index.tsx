import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { LogoMark } from '@/components/brand';
import { LanguageButton } from '@/components/language-picker';
import { Rise } from '@/components/motion-views';
import { Step } from '@/components/onboarding';
import { AppText, Button } from '@/components/ui';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';
import { track } from '@/lib/track';

/**
 * Welcome (DECISIONS.md D62): the website's home hero, on a phone. The outlined mark, the
 * two-tone display line ("the size and tracking carry it, so it needs no other
 * decoration"), one plain sentence, and two buttons, over the site's tiled-mark ground.
 *
 * The first version had a glowing blob, a shadowed "illustrative" receipt card in grey and
 * amber, and a column of icon-plus-promise bullets. Every one of those is a template move,
 * and the website has none of them, so they went. The figures that make the case come on
 * the next step, as the website shows them: real, sourced, and in green.
 */
export default function Welcome() {
  const t = useTheme();
  const copy = useCopy();
  const w = copy.onboarding.welcome;
  useEffect(() => track('onboarding_started'), []);

  return (
    <Step
      step={1}
      of={5}
      back={false}
      actions={
        <Rise step={4} style={styles.actions}>
          <Button label={w.getStarted} trailingIcon="arrow.right" onPress={() => router.push('/onboarding/route')} />
          <Button
            label={w.haveAccount}
            variant="secondary"
            onPress={() => router.push({ pathname: '/sign-in', params: { from: 'onboarding' } })}
          />
        </Rise>
      }>
      <View style={styles.hero}>
        {/* First thing on the first screen, so nobody has to get through English to find it. */}
        <Rise step={0}>
          <LanguageButton />
        </Rise>
        <Rise step={0}>
          <LogoMark width={88} />
        </Rise>
        <Rise step={1} accessible accessibilityRole="header" accessibilityLabel={`${w.lead} ${w.accent.replace('\n', ' ')}`}>
          <AppText style={[styles.display, { color: t.text }]}>{w.lead}</AppText>
          {/* Broken by hand: left to wrap, the green line strands "much" on its own. */}
          <AppText style={[styles.display, { color: t.primary }]}>{w.accent}</AppText>
        </Rise>
        <Rise step={2}>
          <AppText style={[styles.intro, { color: t.textSecondary }]}>
            {w.intro}
          </AppText>
        </Rise>
      </View>
    </Step>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Spacing.four },
  // The website's h1: bold, -0.025em tracking, 1.1 line height.
  display: { fontFamily: Fonts.bold, fontSize: 34, lineHeight: 37, letterSpacing: -0.85, textAlign: 'center' },
  intro: { fontSize: 17, lineHeight: 26, textAlign: 'center', maxWidth: 330 },
  actions: { gap: Spacing.three },
});
