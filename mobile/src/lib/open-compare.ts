import { router } from 'expo-router';

import type { DeliveryMethod } from '@/lib/routes';

/**
 * Opens the Compare tab on a route, and optionally an amount and method (a saved
 * comparison, the route board, TrueCost's "compare today"). `at` is new on every call, and
 * Compare keys itself on it, so reopening the same comparison still resets the screen.
 */
export function openCompare(c: { routeId: string; amount?: number; method?: DeliveryMethod }) {
  router.navigate({
    pathname: '/',
    params: {
      route: c.routeId,
      ...(c.amount ? { amount: String(c.amount) } : {}),
      ...(c.method ? { method: c.method } : {}),
      at: String(Date.now()),
    },
  });
}
