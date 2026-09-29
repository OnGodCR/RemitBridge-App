import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui';
import { MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Full-screen onboarding step: a back button (when there's somewhere to go back to),
 * progress dots, content in the middle, actions pinned to the bottom.
 */
export function Step({
  step,
  of,
  children,
  actions,
}: {
  step?: number;
  of?: number;
  children: ReactNode;
  actions: ReactNode;
}) {
  const t = useTheme();
  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: t.background }]}>
      <View style={styles.top}>
        {router.canGoBack() ? <BackButton /> : <View style={styles.backSpace} />}
        {step && of ? <Dots step={step} of={of} /> : null}
        <View style={styles.backSpace} />
      </View>
      <View style={styles.body}>{children}</View>
      <View style={styles.actions}>{actions}</View>
    </SafeAreaView>
  );
}

function BackButton() {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => router.back()}
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={8}
      style={styles.back}>
      {/* The native symbol view would swallow the touch; let the Pressable have it. */}
      <SymbolView
        pointerEvents="none"
        name="chevron.left"
        tintColor={t.text}
        size={22}
        weight="semibold"
        fallback={<AppText variant="heading">‹</AppText>}
      />
    </Pressable>
  );
}

function Dots({ step, of }: { step: number; of: number }) {
  const t = useTheme();
  return (
    <View style={styles.dots} accessible accessibilityLabel={`Step ${step} of ${of}`}>
      {Array.from({ length: of }, (_, i) => (
        <View key={i} style={[styles.dot, { backgroundColor: i < step ? t.primary : t.border }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, paddingHorizontal: Spacing.four },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: MinTapTarget,
    marginTop: Spacing.two,
  },
  back: { width: MinTapTarget, height: MinTapTarget, justifyContent: 'center' },
  backSpace: { width: MinTapTarget },
  dots: { flex: 1, flexDirection: 'row', gap: 4, marginHorizontal: Spacing.three },
  dot: { flex: 1, height: 3, borderRadius: Radius.pill },
  body: { flex: 1, justifyContent: 'center', gap: Spacing.three },
  actions: { gap: Spacing.two, paddingBottom: Spacing.three },
});
