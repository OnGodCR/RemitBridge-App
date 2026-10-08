import { router } from 'expo-router';

import type { DeliveryMethod } from '@/lib/routes';

/**
 * Opens the Compare tab on a route, and optionally an amount and method (a saved
 * comparison, the route board, TrueCost's "compare today", a scanned receipt). `at` is new
 * on every call, and Compare keys itself on it, so reopening the same comparison still
 * resets the screen.
 */
export function openCompare(c: { routeId: string; amount?: number; method?: DeliveryMethod }) {
  const href = {
    pathname: '/compare',
    params: {
      route: c.routeId,
      ...(c.amount ? { amount: String(c.amount) } : {}),
      ...(c.method ? { method: c.method } : {}),
      at: String(Date.now()),
    },
  } as const;
  // From a pushed screen (TrueCost, the route board), navigate only switched the tab
  // underneath and left the pushed screen on top, so dismissTo pops back to the tabs first.
  // But from inside a tab (a receipt on Scan, alerts on Account) there's nothing to pop:
  // only a stack handles dismissTo, and the root stack, already on the tabs, just set their
  // params and stayed on the same tab (Angad, on the iPhone build, 2026-10-07).
  if (router.canDismiss()) router.dismissTo(href);
  else router.navigate(href);
}
