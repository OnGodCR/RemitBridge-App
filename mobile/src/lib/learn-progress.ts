import 'expo-sqlite/localStorage/install';

import { useSyncExternalStore } from 'react';

import { MODULES, type Module } from '@/data/modules';

/**
 * Which Learn lessons have been read (DECISIONS.md D107). A lesson counts as learned once
 * it's opened. Kept on the phone only, like the other preferences: no account needed, and
 * nothing about what someone has read is sent anywhere.
 */
const KEY = 'rb.learned';

let learned: Set<string> = load();
const listeners = new Set<() => void>();

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify([...learned]));
  } catch {
    // Progress is a convenience; never let storage break the app.
  }
}

export function markLearned(termId: string) {
  if (learned.has(termId)) return;
  learned = new Set(learned).add(termId);
  save();
  listeners.forEach((l) => l());
}

/** For tests and "start over". */
export function resetLearned() {
  learned = new Set();
  save();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The learned set, re-rendering whoever reads it when a lesson is opened anywhere. */
export function useLearned(): Set<string> {
  return useSyncExternalStore(subscribe, () => learned);
}

export function moduleProgress(m: Module, done: Set<string>) {
  const read = m.terms.filter((id) => done.has(id)).length;
  return { read, total: m.terms.length, complete: read === m.terms.length };
}

/** Where "Continue" goes: the first module not finished, and its first unread lesson. */
export function nextStep(done: Set<string>): { module: Module; termId: string } | null {
  for (const m of MODULES) {
    const termId = m.terms.find((id) => !done.has(id));
    if (termId) return { module: m, termId };
  }
  return null;
}
