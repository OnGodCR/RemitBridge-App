import { useEffect, useState } from 'react';
import { Easing, Keyframe, ReduceMotion, useReducedMotion } from 'react-native-reanimated';

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
