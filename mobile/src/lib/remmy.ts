import { router } from 'expo-router';
import { Platform } from 'react-native';
import { useSyncExternalStore } from 'react';

import { saveComparison, type SaveResult } from '@/lib/comparisons';
import { LINKS, openPage } from '@/lib/links';
import { openCompare } from '@/lib/open-compare';
import { prefs } from '@/lib/prefs';
import { REMMY_SCREENS, validAction, type RemmyAction, type RemmyReply } from '@/lib/remmy-actions';
import type { DeliveryMethod } from '@/lib/routes';
import { ROUTES } from '@/lib/routes';
import { supabase } from '@/lib/supabase';

/**
 * Remmy's side in the app (DECISIONS.md D175): the conversation, sending a message to the
 * remmy Edge Function, and carrying out the actions it proposes. The conversation lives in
 * memory for this session only, so closing and reopening Remmy keeps it, and quitting the
 * app forgets it. Nothing is written to the phone or the account.
 */
export type RemmyMessage =
  | { id: number; role: 'user'; text: string }
  | { id: number; role: 'remmy'; text: string; actions: RemmyAction[]; steps: string[]; limited?: boolean; reason?: 'slow' | 'day'; failed?: boolean };

let messages: RemmyMessage[] = [];
let thinking = false;
let nextId = 1;
/** When the last message went out: a second send within MIN_GAP_MS is dropped (a double tap). */
let lastSent = 0;
const MIN_GAP_MS = 1500;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useRemmy(): { messages: RemmyMessage[]; thinking: boolean } {
  const list = useSyncExternalStore(subscribe, () => messages);
  const busy = useSyncExternalStore(subscribe, () => thinking);
  return { messages: list, thinking: busy };
}

export function newChat() {
  messages = [];
  lastSent = 0;
  thinking = false;
  emit();
}

const ROUTE_IDS = ROUTES.map((r) => r.id);

/** Sends a message and adds Remmy's reply, or a failed one the person can retry. */
export async function sendToRemmy(text: string, language: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed || thinking || Date.now() - lastSent < MIN_GAP_MS) return;
  lastSent = Date.now();
  const history = messages.slice(-8).map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', text: m.text }));
  messages = [...messages, { id: nextId++, role: 'user', text: trimmed }];
  thinking = true;
  emit();
  let reply: RemmyMessage;
  try {
    if (!supabase) throw new Error('offline');
    const { data, error } = await supabase.functions.invoke('remmy', {
      method: 'POST',
      body: {
        message: trimmed,
        history,
        language,
        install_id: prefs.installId(),
        platform: Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : null,
      },
    });
    if (error || !data) throw error ?? new Error('no reply');
    const r = data as Partial<RemmyReply>;
    reply = {
      id: nextId++,
      role: 'remmy',
      text: typeof r.reply === 'string' ? r.reply : '',
      // The app checks every action again: only screens and routes that exist.
      actions: (Array.isArray(r.actions) ? r.actions : []).map((a) => validAction(a, ROUTE_IDS)).filter((a): a is RemmyAction => !!a),
      steps: Array.isArray(r.steps) ? r.steps.filter((s): s is string => typeof s === 'string') : [],
      limited: r.limited === true,
      ...(r.reason === 'slow' || r.reason === 'day' ? { reason: r.reason } : {}),
    };
  } catch {
    reply = { id: nextId++, role: 'remmy', text: '', actions: [], steps: [], failed: true };
  }
  messages = [...messages, reply];
  thinking = false;
  emit();
}

/** Sends the last thing the person said again, after a failed reply. */
export function retryLast(language: string) {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUser) return;
  messages = messages.filter((m) => m.id < lastUser.id);
  emit();
  return sendToRemmy(lastUser.text, language);
}

const TABS = new Set(['/', '/scan', '/whatsapp', '/tools', '/learn']);

/** Carries out an action: closes Remmy and goes there, or saves. Saving reports how it went. */
export async function runAction(action: RemmyAction): Promise<SaveResult | 'done'> {
  switch (action.type) {
    case 'compare':
      openCompare({ routeId: action.routeId, amount: action.amount, method: action.method as DeliveryMethod });
      return 'done';
    case 'screen': {
      const path = REMMY_SCREENS[action.screen];
      // The privacy policy, terms and support open in the browser, over Remmy.
      if (path.startsWith('page:')) {
        openPage(LINKS[path.slice(5) as keyof typeof LINKS]);
        return 'done';
      }
      if (TABS.has(path)) {
        router.dismissTo(path);
      } else {
        router.back();
        router.push(action.screen === 'glossary' && action.term ? { pathname: '/glossary', params: { term: action.term } } : path);
      }
      return 'done';
    }
    case 'lesson':
      router.back();
      router.push({ pathname: '/lesson/[id]', params: { id: action.module, ...(action.mode ? { mode: action.mode } : {}) } });
      return 'done';
    case 'save':
      return saveComparison({ routeId: action.routeId, amount: action.amount, method: action.method as DeliveryMethod });
  }
}

/** **bold** spans in a reply, as plain and bold pieces. */
export function boldParts(text: string): { text: string; bold: boolean }[] {
  return text
    .split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g)
    .filter(Boolean)
    .map((part) => {
      const m = part.match(/^\*\*?([^*]+)\*\*?$/);
      return m && part.startsWith('*') ? { text: m[1], bold: true } : { text: part, bold: false };
    });
}
