import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

/**
 * Which tab is showing, for the swipe between tabs ((tabs)/_layout.tsx). Native tabs switch
 * without telling the layout (its usePathname stays "/"), so each tab says so itself when
 * it comes into view.
 */
let current = '/';

export const currentTab = () => current;

export function useTabFocus(path: string) {
  useFocusEffect(
    useCallback(() => {
      current = path;
    }, [path]),
  );
}
