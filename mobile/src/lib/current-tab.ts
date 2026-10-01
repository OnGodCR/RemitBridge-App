import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

/**
 * Which tab is showing, for the swipe between tabs ((tabs)/_layout.tsx). Native tabs switch
 * without telling the layout (its usePathname stays "/"), so each tab says so itself when
 * it comes into view.
 */
let current = '/';

export const currentTab = () => current;

/** The direction of the swipe that's changing tabs (-1 left, 1 right), read once by the
 * tab that comes into view so its content slides in from that side (components/motion-views). */
let swipeDirection = 0;
export const setSwipeDirection = (d: number) => {
  swipeDirection = d;
};
export const takeSwipeDirection = () => {
  const d = swipeDirection;
  swipeDirection = 0;
  return d;
};

export function useTabFocus(path: string) {
  useFocusEffect(
    useCallback(() => {
      current = path;
    }, [path]),
  );
}
