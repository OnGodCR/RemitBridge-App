/**
 * What Compare and onboarding offer (D190): only routes and ways of receiving with prices.
 */
import { availableRoutes, fromRows, methodsFor } from '@/lib/availability';
import { ROUTES } from '@/lib/routes';

jest.mock('@/lib/supabase', () => ({ supabase: null }));

const rows = [
  { route_id: 'us-mx', delivery_method: 'cash_pickup' },
  { route_id: 'us-mx', delivery_method: 'bank_deposit' },
  { route_id: 'us-in', delivery_method: 'bank_deposit' },
  { route_id: 'us-in', delivery_method: 'upi' },
  { route_id: 'us-zz', delivery_method: 'bank_deposit' },
];

it('groups prices by route, bank deposit first, and drops routes the app does not know', () => {
  const a = fromRows(rows);
  expect(a).toEqual({ 'us-in': ['bank_deposit', 'upi'], 'us-mx': ['bank_deposit', 'cash_pickup'] });
});

it('leaves out a route with no prices, like Uganda', () => {
  const ids = availableRoutes(fromRows(rows)).map((r) => r.id);
  expect(ids).toEqual(['us-in', 'us-mx']);
  expect(ids).not.toContain('us-ug');
});

it('offers bank deposit when a route has not loaded yet', () => {
  expect(methodsFor({}, ROUTES[0])).toEqual(['bank_deposit']);
});
