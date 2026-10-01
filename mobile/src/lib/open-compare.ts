import { router } from 'expo-router';

import type { DeliveryMethod } from '@/lib/routes';

/**
 * Opens the Compare tab on a route, and optionally an amount and method (a saved
 * comparison, the route board, TrueCost's "compare today"). `at` is new on every call, and
 * Compare keys itself on it, so reopening the same comparison still resets the screen.
 */
export function openCompare(c: { routeId: string; amount?: number; method?: DeliveryMethod }) {
  // dismissTo, not navigate: from a pushed screen (TrueCost, the route board) navigate only
  // switched the tab underneath and left the pushed screen on top. dismissTo pops back to
  // the tabs first, and from inside the tabs it just switches to Compare.
  router.dismissTo({
    pathname: '/compare',
    params: {
      route: c.routeId,
      ...(c.amount ? { amount: String(c.amount) } : {}),
      ...(c.method ? { method: c.method } : {}),
      at: String(Date.now()),
    },
  });
}
