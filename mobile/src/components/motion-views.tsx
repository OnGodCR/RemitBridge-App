import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  LinearTransition,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { EASE_OUT, GENTLE, rise } from '@/components/motion';
import { takeSwipeDirection } from '@/lib/current-tab';

/**
 * Motion for the rest of the app (D121), in the website's register (components/motion.ts):
 * short, small, ease-out, and off when the phone asks for reduced motion.
 */

/** Every tab body's "hide me", so the tab coming into view can hide the others. */
const hiders = new Set<() => void>();

/**
 * A tab's body, which rises into place each time the tab comes into view: a fade and a 10pt
 * lift after a tap, or a 28pt slide from the side the person swiped from. Native tabs
 * switch with no animation of their own, so this is what makes the change feel smooth.
 *
 * A body starts hidden, and when a tab comes into view it hides every other tab's body,
 * which is out of sight by then. So a tab only ever animates in, from hidden. Resetting on
 * its own focus showed the content whole for a frame, then hid it, then faded it back (a
 * flash); resetting on blur blanked a tab while a pushed screen slid over it. Coming back
 * from a pushed screen, the body was never hidden, so it simply stays.
 */
export function FocusRise({ style, children }: { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const reduced = useReducedMotion();
  // Opacity and movement run apart: the fade is short and eased, the movement a spring, so
  // the content is solid before it has quite settled, which looks crisp rather than ghostly.
  const progress = useSharedValue(reduced ? 1 : 0);
  const fade = useSharedValue(reduced ? 1 : 0);
  const side = useSharedValue(0);

  const hide = useCallback(() => {
    progress.set(0);
    fade.set(0);
  }, [progress, fade]);
  useEffect(() => {
    hiders.add(hide);
    return () => {
      hiders.delete(hide);
    };
  }, [hide]);

  useFocusEffect(
    useCallback(() => {
      const direction = takeSwipeDirection();
      if (reduced) {
        progress.set(1);
        fade.set(1);
        return;
      }
      for (const other of hiders) if (other !== hide) other();
      side.set(direction);
      progress.set(withSpring(1, GENTLE));
      fade.set(withTiming(1, { duration: 220, easing: EASE_OUT }));
    }, [reduced, progress, fade, side, hide]),
  );

  const animated = useAnimatedStyle(() => {
    const p = progress.get();
    const s = side.get();
    return {
      opacity: fade.get(),
      // After a tap the body also grows from 98.5%, a hint of depth; after a swipe it only
      // slides, following the finger's direction.
      transform: s ? [{ translateX: (1 - p) * -s * 28 }] : [{ translateY: (1 - p) * 10 }, { scale: 0.985 + 0.015 * p }],
    };
  });
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

/** One item in a list that arrives in turn: the site's rise, staggered by its place. */
export function RiseIn({ index, style, children }: { index: number; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return (
    <Animated.View
      entering={rise(index)}
      layout={LinearTransition.springify().damping(22).stiffness(190).reduceMotion(ReduceMotion.System)}
      style={style}>
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
    width.set(reduced ? fraction : withDelay(delay, withTiming(fraction, { duration: 800, easing: EASE_OUT })));
  }, [fraction, delay, reduced, width]);

  const animated = useAnimatedStyle(() => ({ width: `${width.get() * 100}%` }));
  return <Animated.View style={[style, animated]} />;
}

/** The same fill for a group of parts (the quote card's cost bar): grows in from the left. */
export function GrowIn({ style, children }: { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) scale.set(withTiming(1, { duration: 750, easing: EASE_OUT }));
  }, [reduced, scale]);
  const animated = useAnimatedStyle(() => ({ transform: [{ scaleX: scale.get() }] }));
  return <Animated.View style={[{ transformOrigin: 'left' }, style, animated]}>{children}</Animated.View>;
}
