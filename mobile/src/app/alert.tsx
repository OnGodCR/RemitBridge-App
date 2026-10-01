import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import type { FundingMethod } from '@remitbridge/formula';

import { AppText, Button } from '@/components/ui';
import { Fonts, MinTapTarget, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { countryIn, useCopy, useLanguage } from '@/i18n';
import { money } from '@/lib/format';
import { createAlert, startingTarget, targetStep, type CreateResult } from '@/lib/rate-alerts';
import type { DeliveryMethod } from '@/lib/routes';
import { track } from '@/lib/track';

/**
 * Turning on a rate alert (DECISIONS.md D113), opened from Compare with today's best price
 * for the route, the checked amount, the method and how it's paid. The target starts a
 * little above today's best; − and + move it in round steps.
 */
export default function AlertScreen() {
  const p = useLocalSearchParams<{
    route: string;
    amount: string;
    method: DeliveryMethod;
    funding: FundingMethod;
    best: string;
    currency: string;
    provider: string;
  }>();
  const t = useTheme();
  const copy = useCopy();
  const a = copy.alerts;
  const { language } = useLanguage();
  const best = Number(p.best);
  const amount = Number(p.amount);
  const step = targetStep(best);
  const [target, setTarget] = useState(() => startingTarget(best));
  const [state, setState] = useState<'idle' | 'busy' | CreateResult>('idle');
  const country = countryIn(copy, (p.route ?? '').split('-')[1] ?? '');

  const turnOn = async () => {
    setState('busy');
    const result = await createAlert({
      routeId: p.route,
      amount,
      method: p.method,
      funding: p.funding ?? 'bank_account',
      target,
      language: language.code,
    });
    if (result === 'signed_out') {
      setState('idle');
      Alert.alert(a.signInTitle, a.signInBody, [
        { text: copy.common.notNow, style: 'cancel' },
        { text: copy.common.signIn, onPress: () => router.push('/sign-in') },
      ]);
      return;
    }
    setState(result);
    if (result === 'on') track('rate_alert_on', { route: p.route, method: p.method });
  };

  const message =
    state === 'denied' ? a.denied : state === 'unavailable' ? a.unavailable : state === 'limit' ? a.limit : state === 'error' ? a.failed : null;

  return (
    <ScrollView style={{ backgroundColor: t.background }} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
      <StatusBar style="auto" />
      <AppText style={[styles.intro, { color: t.text }]}>{a.intro(money(amount, 'USD').replace('.00', ''), country)}</AppText>

      <View style={styles.stepper}>
        <Step icon="minus" label={a.less} onPress={() => setTarget((x) => Math.max(step, x - step))} />
        <AppText
          style={[styles.target, { color: t.primary }]}
          accessibilityLiveRegion="polite"
          adjustsFontSizeToFit
          numberOfLines={1}>
          {money(target, p.currency)}
        </AppText>
        <Step icon="plus" label={a.more} onPress={() => setTarget((x) => x + step)} />
      </View>

      <AppText muted style={styles.center}>
        {a.today(money(best, p.currency), p.provider ?? '')}
      </AppText>
      <AppText variant="small" muted style={styles.center}>
        {a.often}
      </AppText>

      {state === 'on' ? (
        <View style={[styles.done, { backgroundColor: t.accent, borderLeftColor: t.primary }]}>
          <AppText style={{ color: t.accentForeground, fontFamily: Fonts.semibold }}>{a.on}</AppText>
          <Button label={a.yours} variant="secondary" trailingIcon="arrow.right" onPress={() => router.replace('/saved')} />
        </View>
      ) : (
        <Button label={a.turnOn} icon={<SymbolView name="bell.fill" size={17} tintColor={t.primaryForeground} fallback={null} />} loading={state === 'busy'} onPress={turnOn} />
      )}
      {message ? <AppText style={{ color: t.destructive }}>{message}</AppText> : null}
    </ScrollView>
  );
}

/** A round − or + button, chunky like the rest. */
function Step({ icon, label, onPress }: { icon: 'minus' | 'plus'; label: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.step,
        {
          backgroundColor: t.card,
          borderColor: t.border,
          borderBottomColor: t.rim,
          borderBottomWidth: pressed ? 1 : 5,
          marginTop: pressed ? 4 : 0,
        },
      ]}>
      <SymbolView name={icon} size={22} weight="bold" tintColor={t.primary} fallback={null} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.four, paddingBottom: Spacing.six },
  intro: { fontFamily: Fonts.bold, fontSize: 22, lineHeight: 29, textAlign: 'center', marginTop: Spacing.three },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  step: { width: MinTapTarget + 12, height: MinTapTarget + 12, borderRadius: 28, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  target: { flexShrink: 1, fontFamily: Fonts.extrabold, fontSize: 40, lineHeight: 48, fontVariant: ['tabular-nums'] },
  center: { textAlign: 'center' },
  done: { borderLeftWidth: 4, borderRadius: 12, padding: Spacing.three, gap: Spacing.three },
});
