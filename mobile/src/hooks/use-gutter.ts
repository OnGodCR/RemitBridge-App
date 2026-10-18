import { useWindowDimensions } from 'react-native';

import { Spacing } from '@/constants/theme';

/** The widest a column of content gets, gutters included: about a large phone's width plus half. */
export const READABLE_WIDTH = 640;

/**
 * Side padding that keeps content in a readable column on an iPad (supportsTablet, Angad
 * 2026-10-17). On a phone it is just `base`; on a wider screen it grows so the content sits
 * in the middle, READABLE_WIDTH wide, while bands and backgrounds still reach both edges.
 */
export function useGutter(base: number = Spacing.three): number {
  return gutterFor(useWindowDimensions().width, base);
}

/** The same padding for a measured width, for views narrower than the window (a sheet). */
export function gutterFor(width: number, base: number = Spacing.three): number {
  return Math.max(base, (width - READABLE_WIDTH) / 2 + base);
}
