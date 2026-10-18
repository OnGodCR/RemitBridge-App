import type { Session } from '@supabase/supabase-js';

import { adoptProgress, onProgressChange, snapshot, type LearnSnapshot } from '@/lib/learn-progress';
import { supabase } from '@/lib/supabase';

/**
 * Keeps Learn progress with the account (D190): on sign-in, the account's row and the
 * phone's progress are merged and both sides get the result; while signed in, each change
 * is written back a moment later. Signed out, nothing is sent and progress stays on the
 * phone. Best effort: offline, the phone keeps going and the next sign-in or change catches
 * the account up.
 */
const WRITE_AFTER_MS = 1500;

let userId: string | null = null;
let stopListening: (() => void) | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

interface Row {
  learned: string[];
  xp: number;
  streak: number;
  last_day: string | null;
  lessons: number;
}

const toSnapshot = (r: Row): LearnSnapshot => ({
  learned: r.learned ?? [],
  stats: { xp: r.xp, streak: r.streak, lastDay: r.last_day, lessons: r.lessons },
});

async function write(id: string) {
  if (!supabase || userId !== id) return;
  const { learned, stats } = snapshot();
  const { error } = await supabase.from('learn_progress').upsert({
    user_id: id,
    learned,
    xp: stats.xp,
    streak: stats.streak,
    last_day: stats.lastDay,
    lessons: stats.lessons,
    updated_at: new Date().toISOString(),
  });
  if (error && __DEV__) console.warn('learn sync: write failed', error.message);
}

function writeSoon() {
  const id = userId;
  if (!id) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    write(id);
  }, WRITE_AFTER_MS);
}

/** Starts or stops syncing for whoever is signed in now. Safe to call on every auth change. */
export async function syncLearnProgress(session: Session | null): Promise<void> {
  const id = session?.user.id ?? null;
  if (id === userId) return;
  stopListening?.();
  stopListening = null;
  if (timer) clearTimeout(timer);
  timer = null;
  userId = id;
  if (!id || !supabase) return;

  const { data, error } = await supabase
    .from('learn_progress')
    .select('learned, xp, streak, last_day, lessons')
    .eq('user_id', id)
    .maybeSingle();
  if (userId !== id) return; // signed out or switched while this was loading
  if (error) {
    // Writing now could overwrite the account's progress with this phone's, so wait: the
    // next auth event (a token refresh, the next launch) tries again.
    if (__DEV__) console.warn('learn sync: read failed', error.message);
    userId = null;
    return;
  }
  if (data) adoptProgress(toSnapshot(data as Row));
  // Write the merged result back (or the phone's own progress, for a first sign-in), then
  // follow every change.
  await write(id);
  stopListening = onProgressChange(writeSoon);
}
