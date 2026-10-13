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
  sign_in: '/sign-in',
  // Pages on app.remitbridgelabs.org, opened in the browser (the app maps them to LINKS).
  privacy: 'page:privacy',
  terms: 'page:terms',
  support: 'page:support',
} as const;

export type RemmyScreen = keyof typeof REMMY_SCREENS;

export const REMMY_MODULES = ['basics', 'cost', 'arrival', 'safety', 'bigger', 'banks', 'provider', 'crypto'] as const;
export const REMMY_MODES = ['match', 'quick', 'cost', 'receipt', 'safety', 'final'] as const;

export type RemmyAction =
  /** Compare on a route, an amount and a way of receiving. */
  | { type: 'compare'; routeId: string; amount: number; method: DeliveryMethod; now?: boolean; top?: TopPrice[]; checkedAt?: string }
  /** Any screen in REMMY_SCREENS; the glossary can open on one term. */
  | { type: 'screen'; screen: RemmyScreen; term?: string; now?: boolean }
  /** A Learn lesson, in a game mode if one was asked for. */
  | { type: 'lesson'; module: (typeof REMMY_MODULES)[number]; mode?: (typeof REMMY_MODES)[number]; now?: boolean }
  /** Save a comparison to the account, once the person taps Save. */
  | { type: 'save'; routeId: string; amount: number; method: DeliveryMethod };

/** One provider on a Compare card: the same checked prices and ranking as Compare itself. */
export interface TopPrice {
  provider: string;
  /** Already formatted in the receiving currency, as Compare shows it. */
  receives: string;
  /** Total cost as a percent of the amount sent. */
  pct: number;
}

/** Up to three prices from the network, kept only if each is well formed. */
function topPrices(v: unknown): TopPrice[] | null {
  if (!Array.isArray(v) || !v.length || v.length > 3) return null;
  const ok = v.every(
    (p) => p && typeof p === 'object' && typeof p.provider === 'string' && typeof p.receives === 'string' && Number.isFinite(p.pct),
  );
  return ok ? v.map((p) => ({ provider: p.provider.slice(0, 40), receives: p.receives.slice(0, 30), pct: Number(p.pct) })) : null;
}

/** One reply from Remmy: the text, the actions it proposes, and the steps it took to get there. */
export interface RemmyReply {
  reply: string;
  actions: RemmyAction[];
  /** The tools it called, in order: shown as "Checked today's prices" and so on. */
  steps: string[];
  /** Why there's no model answer (over the day's limit, offline), if that's the case. */
  limited?: boolean;
  /** With limited: 'slow' when messages came too fast (wait a minute), 'day' past the day's
   * limits, 'failed' when the models answered but nothing usable came back. */
  reason?: 'slow' | 'day' | 'failed';
}

/**
 * What people call each screen, in the five app languages where it differs. One table for
 * both sides of the harness: the function opens a screen straight from a plain "open my
 * settings" without asking the model, and maps whatever name the model uses ("settings",
 * "user-settings", "Privacy Policy") to a real screen. The longest name that matches wins,
 * so "terms of service" beats "terms" and "rate history" beats "history".
 */
const ALIASES: Record<RemmyScreen, string[]> = {
  compare: ['compare', 'compare tab', 'comparison', 'compare prices', 'price comparison', 'home', 'home screen', 'main screen', 'comparar', 'inicio', 'tulna', 'ihambing', 'so sánh'],
  scan: ['scan', 'scanner', 'receipt scanner', 'scan a receipt', 'scan my receipt', 'scan receipt', 'receipt', 'camera', 'escanear', 'escáner', 'recibo', 'rasid', 'resibo', 'quét', 'quét biên lai'],
  whatsapp: ['whatsapp', 'whatsapp tab', 'whatsapp bot', 'link whatsapp', 'chat on whatsapp', 'whats app'],
  tools: ['tools', 'tools tab', 'tool', 'calculators', 'calculator', 'herramientas', 'mga tool', 'công cụ'],
  learn: ['learn', 'learn tab', 'lessons', 'courses', 'games', 'learning', 'aprender', 'lecciones', 'seekho', 'matuto', 'học'],
  saved: ['saved', 'saved comparisons', 'my saved', 'saved list', 'my comparisons', 'bookmarks', 'favorites', 'favourites', 'guardados', 'guardado', 'naka-save', 'đã lưu'],
  account: [
    'account', 'my account', 'account settings', 'settings', 'user settings', 'app settings', 'setting', 'profile', 'my profile',
    'preferences', 'language', 'change language', 'change my language', 'app language', 'notifications', 'newsletter',
    'sign out', 'log out', 'logout', 'signout', 'delete account', 'delete my account', 'my name', 'change my name',
    'cuenta', 'mi cuenta', 'ajustes', 'configuración', 'perfil', 'idioma', 'khata', 'setting badlo', 'tài khoản', 'cài đặt',
  ],
  sign_in: ['sign in', 'sign-in', 'signin', 'log in', 'login', 'log-in', 'create an account', 'create account', 'make an account', 'sign up', 'signup', 'register', 'iniciar sesión', 'crear cuenta', 'registrarse', 'đăng nhập', 'mag-sign in'],
  glossary: ['glossary', 'dictionary', 'word list', 'definitions', 'glosario', 'shabdkosh', 'thuật ngữ'],
  routes: ['route board', 'routes', 'countries', 'countries you cover', 'supported countries', 'coverage', 'which countries', 'rutas', 'países'],
  request_route: ['request a route', 'request a country', 'ask for a route', 'ask for a country', 'add a country', 'add my country', 'new country', 'suggest a country', 'request route', 'pedir una ruta'],
  fair_rate: ['fair rate', 'fair rate check', 'fair rate tool', 'rate check', 'check a rate', 'tasa justa'],
  scam_check: ['scam check', 'scam checker', 'scam tool', 'check a scam', 'fraud check', 'estafa', 'scam'],
  true_cost: ['true cost', 'truecost', 'true cost calculator', 'real cost', 'costo real'],
  yearly_cost: ['yearly cost', 'annual cost', 'cost per year', 'yearly', 'per year', 'costo anual'],
  rate_history: ['rate history', 'exchange rate history', 'history', 'rate chart', 'chart', 'historial'],
  observatory: ['observatory', 'market observatory', 'observatorio'],
  remitbench: ['remitbench', 'remit bench', 'benchmark'],
  blog: ['blog', 'articles', 'posts', 'news', 'stories', 'artículos', 'noticias'],
  privacy: ['privacy', 'privacy policy', 'data policy', 'my data', 'privacidad', 'política de privacidad'],
  terms: ['terms', 'terms of service', 'terms of use', 'terms and conditions', 'tos', 'términos', 'condiciones'],
  support: ['support', 'help', 'help center', 'help page', 'contact', 'contact us', 'customer support', 'customer service', 'soporte', 'ayuda', 'contacto', 'madad'],
};

const fold = (s: string) =>
  ` ${s
    .toLowerCase()
    .normalize('NFC')
    .replace(/[_\-/]+/g, ' ')
    .replace(/[^\p{L}\p{N}\s']+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `;

const ALIAS_LIST = (Object.entries(ALIASES) as [RemmyScreen, string[]][])
  .flatMap(([screen, names]) => [screen, ...names].map((n) => ({ screen, name: fold(n) })))
  .sort((a, b) => b.name.length - a.name.length);

/** The screen a name means ("settings", "Privacy Policy", "user-settings"), or null. */
export function screenFor(name: unknown): RemmyScreen | null {
  if (typeof name !== 'string' || !name.trim()) return null;
  if (isScreen(name)) return name;
  const f = fold(name);
  return ALIAS_LIST.find((a) => a.name === f)?.screen ?? ALIAS_LIST.find((a) => f.includes(a.name))?.screen ?? null;
}

/** "open", "take me to", "where's", in the app's five languages. */
const NAV =
  /(^| )(open|opening|go to|go back to|goto|take me|bring me|bring up|pull up|show me|navigate|launch|get me to|jump to|switch to|where is|where's|wheres|where are|where do i|where can i|how do i get to|i want to see|i need to see|let me see|abre|abrir|ábreme|llévame|ir a|vamos a|muéstrame|enséñame|kholo|khol do|khol|dikhao|dikha do|le chalo|le jao|buksan|pumunta|ipakita|mở|đi đến|cho tôi xem)( |$)/;
const FILLER = / (please|pls|the|my|a|page|screen|tab|section|menu|now|for me|app|thanks|thank you|por favor|el|la|mi|los|las|ko|kripya|na|ang|cho tôi|trang) /g;

/**
 * A plain request to go to a screen ("open user settings", "where's the glossary",
 * "settings"), or null. Short messages only: a longer one ("open settings and tell me how
 * to change the language") is a question for the model, which can still open the screen.
 */
export function matchIntent(message: string, maxWords = 9, loose = false): { screen: RemmyScreen; now: boolean } | null {
  const f = fold(message);
  if (f.trim().split(' ').length > maxWords) return null;
  const hit = ALIAS_LIST.find((a) => f.includes(a.name));
  if (!hit) return null;
  // Without a verb, only the name on its own counts: "settings", "delete my account".
  if (NAV.test(f.trim()) || bare(f) === bare(hit.name)) return { screen: hit.screen, now: true };
  // Loose, for when the model can't answer: any screen named becomes a card to tap.
  return loose ? { screen: hit.screen, now: false } : null;
}

function bare(folded: string): string {
  let rest = folded;
  for (let i = 0; i < 3; i++) rest = rest.replace(FILLER, ' ');
  return rest.trim();
}

const isScreen = (s: unknown): s is RemmyScreen => typeof s === 'string' && Object.hasOwn(REMMY_SCREENS, s);

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
      if (!route || !method || !(amount > 0)) return null;
      {
        const top = topPrices(o.top);
        const checkedAt = typeof o.checkedAt === 'string' && !Number.isNaN(Date.parse(o.checkedAt)) ? o.checkedAt : null;
        return { type: 'compare', routeId: route, amount, method, now, ...(top ? { top } : {}), ...(top && checkedAt ? { checkedAt } : {}) };
      }
    case 'save':
      return route && method && amount > 0 ? { type: 'save', routeId: route, amount, method } : null;
    case 'screen': {
      const screen = screenFor(o.screen);
      return screen ? { type: 'screen', screen, ...(typeof o.term === 'string' && screen === 'glossary' ? { term: o.term } : {}), now } : null;
    }
    case 'lesson': {
      const m = REMMY_MODULES.find((x) => x === o.module);
      const mode = REMMY_MODES.find((x) => x === o.mode);
      return m ? { type: 'lesson', module: m, ...(mode ? { mode } : {}), now } : null;
    }
    default:
      return null;
  }
}
