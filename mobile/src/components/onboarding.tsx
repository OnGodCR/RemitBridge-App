import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ground } from '@/components/brand';
import { AppText } from '@/components/ui';
import { MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useIconSize } from '@/hooks/use-icon-size';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';

/**
 * Full-screen onboarding and sign-in step: a back button (when there's somewhere to go
 * back to), progress bars, content in the middle, actions pinned to the bottom.
 *
 * The surface is the website's (D62): its page ground with the tiled mark, or for one
 * step its green band. Flat fills made these screens look like a template.
 */
export function Step({
  step,
  of,
  children,
  actions,
  tone = 'ground',
  back = true,
}: {
  step?: number;
  of?: number;
  children: ReactNode;
  actions: ReactNode;
  /** 'band' puts the step on the brand-green band, with light text. */
  tone?: 'ground' | 'band';
  /** False on the first step, which has nothing to go back to even when replayed. */
  back?: boolean;
}) {
  const t = useTheme();
  const hero = tone === 'band';
  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: hero ? t.hero : t.background }]}>
      <Ground tone={tone} />
      <StatusBar style={hero ? 'light' : 'auto'} />
      <View style={styles.top}>
        {back && router.canGoBack() ? <BackButton light={hero} /> : <View style={styles.backSpace} />}
        {step && of ? <Dots step={step} of={of} light={hero} /> : null}
        <View style={styles.backSpace} />
      </View>
      {/* Scrolls, so the largest text sizes push content down rather than off the screen. */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
      <View style={styles.actions}>{actions}</View>
    </SafeAreaView>
  );
}

function BackButton({ light }: { light?: boolean }) {
  const t = useTheme();
  const copy = useCopy();
  const size = useIconSize(22);
  return (
    <Pressable
      onPress={() => router.back()}
      accessibilityRole="button"
      accessibilityLabel={copy.common.back}
      hitSlop={8}
      style={styles.back}>
      {/* The native symbol view would swallow the touch; let the Pressable have it. */}
      <SymbolView
        pointerEvents="none"
        name="chevron.left"
        tintColor={light ? t.heroText : t.text}
        size={size}
        weight="semibold"
        fallback={<AppText variant="heading">‹</AppText>}
      />
    </Pressable>
  );
}

function Dots({ step, of, light }: { step: number; of: number; light?: boolean }) {
  const t = useTheme();
  const copy = useCopy();
  const on = light ? t.heroText : t.primary;
  const off = light ? t.heroMuted : t.border;
  return (
    <View style={styles.dots} accessible accessibilityLabel={copy.common.stepOf(step, of)}>
      {Array.from({ length: of }, (_, i) => (
        <View
          key={i}
          style={[styles.dot, { backgroundColor: i < step ? on : off, opacity: i < step ? 1 : 0.4 }]}
        />
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
  scroll: { flex: 1 },
  body: { flexGrow: 1, justifyContent: 'center', gap: Spacing.three, paddingVertical: Spacing.three },
  actions: { gap: Spacing.two, paddingBottom: Spacing.three },
});
