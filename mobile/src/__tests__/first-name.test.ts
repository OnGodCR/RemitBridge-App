import type { Session } from '@supabase/supabase-js';

import { firstName } from '@/lib/name';

jest.mock('@/lib/supabase', () => ({ supabase: null }));

const session = (data: Record<string, unknown>) => ({ user: { user_metadata: data } }) as unknown as Session;

test('greets a lowercase name with a capital', () => {
  expect(firstName(session({ name: 'angad kochar' }))).toBe('Angad');
});

test('leaves the rest of the name as typed', () => {
  expect(firstName(session({ full_name: 'McKenzie Ray' }))).toBe('McKenzie');
});

test('no name, no greeting name', () => {
  expect(firstName(session({}))).toBeNull();
  expect(firstName(null)).toBeNull();
});
