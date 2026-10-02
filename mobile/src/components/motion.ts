import { useEffect, useState } from 'react';
import { Easing, Keyframe, ReduceMotion, useReducedMotion, type WithSpringConfig } from 'react-native-reanimated';

/**
 * The app's motion vocabulary (D132). Things that move because of a touch or a choice (a
 * button sinking, a segment thumb, a tab arriving) use springs: they start at once, carry
 * their speed, and settle without a visible bounce, which reads as physical rather than as
 * a timed effect. Things that fill (bars) use one long, soft ease-out.
 */
/** Under the finger: quick, damped just short of a bounce. */
export const SNAPPY: WithSpringConfig = { damping: 24, stiffness: 340, mass: 0.7, reduceMotion: ReduceMotion.System };
/** A view arriving or a thumb travelling: a little slower, still no wobble. */
export const GENTLE: WithSpringConfig = { damping: 22, stiffness: 190, mass: 1, reduceMotion: ReduceMotion.System };
/** Ease-out expo: fast start, long soft landing, for fills and fades. */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * The website's `rise` entrance (src/index.css): fade in while moving up 0.75rem, over
 * 0.55s on an ease-out curve, staggered 0.06 / 0.14 / 0.22 / 0.3s. Kept short and small on
 * purpose, as the site says: "anything that slides a long way reads as decoration", and
 * "past about half a second the page feels slow". Used on hero content only. Off when the
 * phone asks for reduced motion.
 */
const DELAYS = [0, 60, 140, 220, 300];

export function rise(step: number) {
  return new Keyframe({
    0: { opacity: 0, transform: [{ translateY: 12 }] },
    100: { opacity: 1, transform: [{ translateY: 0 }], easing: Easing.out(Easing.poly(5)) },
  })
    .duration(550)
    .delay(DELAYS[Math.min(step, DELAYS.length - 1)])
    .reduceMotion(ReduceMotion.System);
}

/**
 * The website's figure count-up (src/lib/useInView.js): from zero to the value over 1.1s,
 * ease-out cubic, so a big number lands rather than just appearing. With reduced motion on,
 * it shows the value straight away. Screen readers get the final value from the label, never
 * the number in flight.
 */
export function useCountUp(value: number, { decimals = 0, delay = 0, duration = 1100 } = {}) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      start ??= now;
      const p = Math.min((now - start) / duration, 1);
      setShown(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => (frame = requestAnimationFrame(tick)), delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [value, delay, duration, reduced]);

  return (reduced ? value : shown).toFixed(decimals);
}
