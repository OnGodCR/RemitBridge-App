import 'expo-sqlite/localStorage/install';

import { useSyncExternalStore } from 'react';

import { MODULES, type Module } from '@/data/modules';

/**
 * Learn progress (DECISIONS.md D107, D136): which terms have been learned (answered right in
 * a lesson), the XP earned, and the day streak. Kept on the phone only, like the other
 * preferences: no account needed, and nothing about what someone has learned is sent
 * anywhere.
 */
const KEY = 'rb.learned';
const STATS_KEY = 'rb.learnStats';

export interface LearnStats {
  xp: number;
  /** Days in a row with a finished lesson, counting today or yesterday; 0 once it's broken. */
  streak: number;
  lastDay: string | null;
  lessons: number;
}

let learned: Set<string> = load();
let stats: LearnStats = loadStats();
const listeners = new Set<() => void>();

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function loadStats(): LearnStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? { xp: 0, streak: 0, lastDay: null, lessons: 0, ...(JSON.parse(raw) as Partial<LearnStats>) } : { xp: 0, streak: 0, lastDay: null, lessons: 0 };
  } catch {
    return { xp: 0, streak: 0, lastDay: null, lessons: 0 };
  }
}

/** Today on the phone's own calendar, YYYY-MM-DD. */
export function localDay(at = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`;
}

function dayBefore(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  return localDay(new Date(y, m - 1, d - 1));
}

/** A finished lesson: its XP, and the streak (the same day keeps it, the next day adds one). */
export function recordLesson(xp: number, today = localDay()): LearnStats {
  const streak = stats.lastDay === today ? stats.streak : stats.lastDay === dayBefore(today) ? stats.streak + 1 : 1;
  stats = { xp: stats.xp + xp, streak, lastDay: today, lessons: stats.lessons + 1 };
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // Progress is a convenience; never let storage break the app.
  }
  listeners.forEach((l) => l());
  return stats;
}

/** The stats as shown: a streak whose last lesson was before yesterday has lapsed to 0. */
export function shownStats(s: LearnStats, today = localDay()): LearnStats {
  const alive = s.lastDay === today || s.lastDay === dayBefore(today);
  return alive ? s : { ...s, streak: 0 };
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
  stats = { xp: 0, streak: 0, lastDay: null, lessons: 0 };
  save();
  try {
    localStorage.removeItem(STATS_KEY);
  } catch {
    // Nothing stored.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The learned set, re-rendering whoever reads it when a term is learned anywhere. */
export function useLearned(): Set<string> {
  return useSyncExternalStore(subscribe, () => learned);
}

/** XP and streak, re-rendering when a lesson finishes. */
export function useLearnStats(): LearnStats {
  return shownStats(useSyncExternalStore(subscribe, () => stats));
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
