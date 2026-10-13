/**
 * What Remmy may do in the app (DECISIONS.md D175), shared by the remmy Edge Function, which
 * proposes actions, and the app, which carries them out. Plain TypeScript with no React
 * Native imports (and no imports at all), so the function can read it too. Every action is checked against these
 * lists on both sides: a model can only ask for a screen or module that exists.
 *
 * Actions only navigate or save to the person's own account. Nothing here moves money,
 * contacts a provider or changes a setting.
 */

/** A route's delivery method ("bank_deposit", "upi"...), as routes.ts names them. No import, so Deno can read this file. */
type DeliveryMethod = string;

/** Screens Remmy can open, by the name the model uses, with their paths. */
export const REMMY_SCREENS = {
  compare: '/',
  scan: '/scan',
  whatsapp: '/whatsapp',
  tools: '/tools',
  learn: '/learn',
  saved: '/saved',
  account: '/account',
  glossary: '/glossary',
  routes: '/routes',
  request_route: '/request-route',
  fair_rate: '/fair-rate',
  scam_check: '/scam-check',
  true_cost: '/true-cost',
  yearly_cost: '/yearly-cost',
  rate_history: '/rate-history',
  observatory: '/observatory',
  remitbench: '/remitbench',
  blog: '/blog',
} as const;

export type RemmyScreen = keyof typeof REMMY_SCREENS;

export const REMMY_MODULES = ['basics', 'cost', 'arrival', 'safety', 'bigger', 'banks', 'provider', 'crypto'] as const;
export const REMMY_MODES = ['match', 'quick', 'cost', 'receipt', 'safety', 'final'] as const;

export type RemmyAction =
  /** Compare on a route, an amount and a way of receiving. */
  | { type: 'compare'; routeId: string; amount: number; method: DeliveryMethod; now?: boolean }
  /** Any screen in REMMY_SCREENS; the glossary can open on one term. */
  | { type: 'screen'; screen: RemmyScreen; term?: string; now?: boolean }
  /** A Learn lesson, in a game mode if one was asked for. */
  | { type: 'lesson'; module: (typeof REMMY_MODULES)[number]; mode?: (typeof REMMY_MODES)[number]; now?: boolean }
  /** Save a comparison to the account, once the person taps Save. */
  | { type: 'save'; routeId: string; amount: number; method: DeliveryMethod };

/** One reply from Remmy: the text, the actions it proposes, and the steps it took to get there. */
export interface RemmyReply {
  reply: string;
  actions: RemmyAction[];
  /** The tools it called, in order: shown as "Checked today's prices" and so on. */
  steps: string[];
  /** Why there's no model answer (over the day's limit, offline), if that's the case. */
  limited?: boolean;
}

const isScreen = (s: unknown): s is RemmyScreen => typeof s === 'string' && s in REMMY_SCREENS;

/** An action as it arrived from the network, kept only if it's one Remmy may take. */
export function validAction(a: unknown, routeIds: readonly string[]): RemmyAction | null {
  if (!a || typeof a !== 'object') return null;
  const o = a as Record<string, unknown>;
  const now = o.now === true;
  const amount = Number(o.amount);
  const route = typeof o.routeId === 'string' && routeIds.includes(o.routeId) ? o.routeId : null;
  const method = typeof o.method === 'string' && o.method ? o.method : null;
  switch (o.type) {
    case 'compare':
      return route && method && amount > 0 ? { type: 'compare', routeId: route, amount, method, now } : null;
    case 'save':
      return route && method && amount > 0 ? { type: 'save', routeId: route, amount, method } : null;
    case 'screen':
      return isScreen(o.screen)
        ? { type: 'screen', screen: o.screen, ...(typeof o.term === 'string' ? { term: o.term } : {}), now }
        : null;
    case 'lesson': {
      const m = REMMY_MODULES.find((x) => x === o.module);
      const mode = REMMY_MODES.find((x) => x === o.mode);
      return m ? { type: 'lesson', module: m, ...(mode ? { mode } : {}), now } : null;
    }
    default:
      return null;
  }
}
