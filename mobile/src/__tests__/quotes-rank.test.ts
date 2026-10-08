import { nearest, rank, type LatestQuote } from '@/lib/quotes';

jest.mock('@/lib/supabase', () => ({ supabase: null }));

const q = (o: Partial<LatestQuote>): LatestQuote =>
  ({
    id: 1,
    provider_id: 'moneygram',
    payment_method: 'bank_account',
    send_amount: 500,
    amount_received: 40000,
    is_promotional: false,
    is_stale: false,
    is_older: false,
    captured_at: '2026-10-07T12:00:00Z',
    ...o,
  }) as LatestQuote;

test('a hand price stored at the total paid stands for the amount below it', () => {
  const rows = nearest([q({ id: 1, send_amount: 501.99 })], 500);
  expect(rows.map((r) => r.id)).toEqual([1]);
});

test('one price per provider: current over older, then nearest, then newest', () => {
  const rows = nearest(
    [
      q({ id: 1, send_amount: 500, is_older: true, captured_at: '2026-10-04T08:29:00Z' }),
      q({ id: 2, send_amount: 502.49 }),
      q({ id: 3, provider_id: 'wise', send_amount: 503 }),
      q({ id: 4, provider_id: 'wise', send_amount: 500 }),
      q({ id: 5, provider_id: 'xe', captured_at: '2026-10-06T00:00:00Z' }),
      q({ id: 6, provider_id: 'xe', captured_at: '2026-10-07T00:00:00Z' }),
    ],
    500,
  );
  expect(rows.map((r) => r.id).sort()).toEqual([2, 4, 6]);
});

test('older prices are ranked apart and never above a current one', () => {
  const r = rank([
    q({ id: 1, amount_received: 41000, is_older: true }),
    q({ id: 2, provider_id: 'wise', amount_received: 40000 }),
    q({ id: 3, provider_id: 'xoom', amount_received: 42000, is_promotional: true }),
  ]);
  expect(r.standing.map((x) => x.id)).toEqual([2]);
  expect(r.promotional.map((x) => x.id)).toEqual([3]);
  expect(r.older.map((x) => x.id)).toEqual([1]);
});
