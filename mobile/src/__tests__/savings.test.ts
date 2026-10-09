jest.mock('expo-sqlite/localStorage/install', () => ({}));

const store = new Map<string, string>();
(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
};

// eslint-disable-next-line import/first
import { forgetSaving, recordSaving, savingsSummary } from '@/lib/savings';

beforeEach(() => store.clear());

test('adds up what each receipt could have kept, once per receipt', () => {
  recordSaving('a', 12.5, 'USD');
  recordSaving('b', 3.255, 'USD');
  recordSaving('a', 12.5, 'USD'); // the same receipt again: not counted twice
  expect(savingsSummary()).toEqual({ count: 2, total: 15.76 });
});

test('a receipt that was already the cheapest counts, at zero', () => {
  recordSaving('a', -4, 'USD');
  expect(savingsSummary()).toEqual({ count: 1, total: 0 });
});

test('leaves out other currencies rather than adding them to dollars', () => {
  recordSaving('a', 10, 'GBP');
  expect(savingsSummary()).toEqual({ count: 0, total: 0 });
});

test('a deleted receipt leaves the total', () => {
  recordSaving('a', 10, 'USD');
  recordSaving('b', 5, 'USD');
  forgetSaving('a');
  expect(savingsSummary()).toEqual({ count: 1, total: 5 });
});
