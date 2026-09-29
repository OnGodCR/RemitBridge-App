import { supabase } from '@/lib/supabase';

export interface Provider {
  id: string;
  name: string;
  type: 'bank' | 'credit_union' | 'mto' | 'fintech';
}

/** Every listed provider, for search. The providers table is public (see the RLS tests). */
export async function fetchProviders(): Promise<Provider[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('providers').select('id, name, type').order('name');
  return (data ?? []) as Provider[];
}

/** Case- and accent-insensitive match on the name, anywhere in it. */
export function matchProviders(all: Provider[], query: string): Provider[] {
  const norm = (s: string) =>
    s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const q = norm(query);
  if (!q) return [];
  return all.filter((p) => norm(p.name).includes(q));
}
