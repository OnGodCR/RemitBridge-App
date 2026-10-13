import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { SNAPPY } from '@/components/motion';
import { useTheme } from '@/hooks/use-theme';
import { useCopy } from '@/i18n';

/**
 * Remmy (DECISIONS.md D175): a speech bubble in the brand green with the website's bridge
 * mark arched over its eyes, so it reads as RemitBridge's own, not a generic chat icon.
 * Drawn on a 64-unit square like the app's illustrations (D103), in theme colors only.
 */
export function RemmyMascot({ size = 56 }: { size?: number }) {
  const t = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessible={false}>
      {/* The bubble and its tail, with a soft highlight like the illustrations' discs (D109). */}
      <Path d="M17 47 L11 58 L27 51 Z" fill={t.primary} />
      <Circle cx={32} cy={30} r={24} fill={t.primary} />
      <Ellipse cx={24} cy={17} rx={11} ry={6} fill={t.glow} opacity={0.18} />
      {/* The bridge, as a brow. */}
      <Path d="M17 23 Q32 10 47 23" stroke={t.accent} strokeWidth={3.2} strokeLinecap="round" fill="none" />
      <Ellipse cx={25} cy={30} rx={3.6} ry={4.6} fill={t.primaryForeground} />
      <Ellipse cx={39} cy={30} rx={3.6} ry={4.6} fill={t.primaryForeground} />
      <Circle cx={25.8} cy={31} r={1.7} fill={t.depth} />
      <Circle cx={39.8} cy={31} r={1.7} fill={t.depth} />
      <Path d="M25 39 Q32 44.5 39 39" stroke={t.primaryForeground} strokeWidth={2.8} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/**
 * The floating Remmy button on every tab, above the tab bar: it hovers gently (still when the
 * phone asks for less motion) and opens Remmy. It lives in the tabs' layout, so pushed screens
 * and lessons, which draw over the tabs, cover it.
 */
export function RemmyButton() {
  const t = useTheme();
  const copy = useCopy();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const float = useSharedValue(0);
  const press = useSharedValue(1);
  useEffect(() => {
    if (reduced) return;
    float.set(withRepeat(withSequence(withTiming(-5, { duration: 1400, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) })), -1));
  }, [reduced, float]);
  const hover = useAnimatedStyle(() => ({ transform: [{ translateY: float.get() }, { scale: press.get() }] }));
  const shadow = useAnimatedStyle(() => ({ opacity: 0.22 + float.get() / 60, transform: [{ scaleX: 1 + float.get() / 40 }] }));
  // Above the tab bar: iPhone's is 49pt plus the home indicator; Android's own is about 64.
  const bottom = (Platform.OS === 'ios' ? 49 : 64) + Math.max(insets.bottom, Platform.OS === 'ios' ? 0 : 8) + 14;
  return (
    <View pointerEvents="box-none" style={[styles.slot, { bottom }]}>
      <Animated.View style={[styles.shadow, { backgroundColor: t.depth }, shadow]} />
      <Animated.View style={hover}>
        <Pressable
          onPress={() => router.push('/remmy')}
          onPressIn={() => press.set(withSpring(0.92, SNAPPY))}
          onPressOut={() => press.set(withSpring(1, SNAPPY))}
          accessibilityRole="button"
          accessibilityLabel={copy.remmy.open}
          hitSlop={8}
          style={[styles.button, { backgroundColor: t.card, borderColor: t.border, shadowColor: t.depth }]}>
          <RemmyMascot size={50} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { position: 'absolute', right: 16, alignItems: 'center' },
  button: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  shadow: { position: 'absolute', bottom: -8, width: 40, height: 8, borderRadius: 4 },
});
