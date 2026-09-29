import { Easing, Keyframe, ReduceMotion } from 'react-native-reanimated';

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
