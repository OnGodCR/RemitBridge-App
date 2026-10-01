import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  LinearTransition,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { rise } from '@/components/motion';
import { takeSwipeDirection } from '@/lib/current-tab';

/**
 * Motion for the rest of the app (D121), in the website's register (components/motion.ts):
 * short, small, ease-out, and off when the phone asks for reduced motion.
 */

const EASE = Easing.out(Easing.cubic);

/**
 * A tab's body, which rises into place each time the tab comes into view: a fade and a 10pt
 * lift after a tap, or a 28pt slide from the side the person swiped from. Native tabs
 * switch with no animation of their own, so this is what makes the change feel smooth.
 */
export function FocusRise({ style, children }: { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(1);
  const side = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      const direction = takeSwipeDirection();
      if (reduced) return;
      side.set(direction);
      progress.set(0);
      progress.set(withTiming(1, { duration: 320, easing: EASE }));
    }, [reduced, progress, side]),
  );

  const animated = useAnimatedStyle(() => {
    const p = progress.get();
    const s = side.get();
    return {
      opacity: 0.2 + 0.8 * p,
      transform: s ? [{ translateX: (1 - p) * -s * 28 }] : [{ translateY: (1 - p) * 10 }],
    };
  });
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

/** One item in a list that arrives in turn: the site's rise, staggered by its place. */
export function RiseIn({ index, style, children }: { index: number; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return (
    <Animated.View entering={rise(index)} layout={LinearTransition.duration(220).reduceMotion(ReduceMotion.System)} style={style}>
      {children}
    </Animated.View>
  );
}

/**
 * A bar that fills from the left when it appears, and again when its value changes, so a
 * share or a progress reads as an amount rather than a block. `fraction` is 0 to 1; the
 * width animates (not a stretch), so rounded ends and a minimum width stay as styled.
 */
export function GrowBar({ fraction, delay = 0, style }: { fraction: number; delay?: number; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const width = useSharedValue(reduced ? fraction : 0);

  useEffect(() => {
    width.set(reduced ? fraction : withDelay(delay, withTiming(fraction, { duration: 700, easing: EASE })));
  }, [fraction, delay, reduced, width]);

  const animated = useAnimatedStyle(() => ({ width: `${width.get() * 100}%` }));
  return <Animated.View style={[style, animated]} />;
}

/** The same fill for a group of parts (the quote card's cost bar): grows in from the left. */
export function GrowIn({ style, children }: { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) scale.set(withTiming(1, { duration: 650, easing: EASE }));
  }, [reduced, scale]);
  const animated = useAnimatedStyle(() => ({ transform: [{ scaleX: scale.get() }] }));
  return <Animated.View style={[{ transformOrigin: 'left' }, style, animated]}>{children}</Animated.View>;
}
