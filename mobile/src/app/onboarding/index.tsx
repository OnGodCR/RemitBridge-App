import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { LogoMark } from '@/components/brand';
import { rise } from '@/components/motion';
import { Step } from '@/components/onboarding';
import { AppText, Button } from '@/components/ui';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
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
  useEffect(() => track('onboarding_started'), []);

  return (
    <Step
      step={1}
      of={4}
      actions={
        <Animated.View entering={rise(4)} style={styles.actions}>
          <Button label="Get started" trailingIcon="arrow.right" onPress={() => router.push('/onboarding/why')} />
          <Button
            label="I already have an account"
            variant="secondary"
            onPress={() => router.push({ pathname: '/sign-in', params: { from: 'onboarding' } })}
          />
        </Animated.View>
      }>
      <View style={styles.hero}>
        <Animated.View entering={rise(0)}>
          <LogoMark width={88} />
        </Animated.View>
        <Animated.View entering={rise(1)}>
          <AppText style={[styles.display, { color: t.text }]}>Sending money home</AppText>
          {/* Broken by hand: left to wrap, the green line strands "much" on its own. */}
          <AppText style={[styles.display, { color: t.primary }]}>{'shouldn’t cost\nthis much'}</AppText>
        </Animated.View>
        <Animated.View entering={rise(2)}>
          <AppText style={[styles.intro, { color: t.textSecondary }]}>
            RemitBridge shows what a transfer really costs, and which provider leaves your family the most.
          </AppText>
        </Animated.View>
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
