import 'expo-sqlite/localStorage/install';

/**
 * The savings counter (D149; Angad, 2026-10-09): the total of "what you could have kept"
 * (D119) across every receipt scanned on this phone. Scanned receipts carry no account or
 * device ID on our server (privacy policy), so the running total lives here, on the phone,
 * and nowhere else: one entry per receipt, so a receipt never counts twice, and deleting
 * the receipt in the app takes it back out.
 *
 * Amounts are in the sending currency, which is US dollars on every route today; anything
 * else is left out rather than added to dollars.
 */
const KEY = 'rb.savings';

interface Entry {
  /** What the cheapest price we had would have saved; 0 when the receipt was already it. */
  kept: number;
  at: string;
}

function load(): Record<string, Entry> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, Entry>) : {};
  } catch {
    return {};
  }
}

function save(all: Record<string, Entry>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // A full or unavailable store only means the counter misses this one.
  }
}

/** Counts a scanned receipt that was compared with the prices we had. */
export function recordSaving(receiptId: string, couldKeep: number, currency: string) {
  if (currency !== 'USD' || !Number.isFinite(couldKeep)) return;
  const all = load();
  all[receiptId] = { kept: Math.max(0, Math.round(couldKeep * 100) / 100), at: new Date().toISOString() };
  save(all);
}

/** The receipt was deleted, so it leaves the total too. */
export function forgetSaving(receiptId: string) {
  const all = load();
  if (!(receiptId in all)) return;
  delete all[receiptId];
  save(all);
}

export interface SavingsSummary {
  /** Receipts counted. */
  count: number;
  /** Their "could have kept", added up, in US dollars. */
  total: number;
}

export function savingsSummary(): SavingsSummary {
  const entries = Object.values(load());
  const total = entries.reduce((sum, e) => sum + e.kept, 0);
  return { count: entries.length, total: Math.round(total * 100) / 100 };
}
