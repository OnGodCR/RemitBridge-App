// Starts the "Manual prices" GitHub workflow right after an admin enters a price in the
// app, so the entry is checked in minutes instead of waiting for the three-hourly schedule
// (DECISIONS.md D54). The price itself is already saved: the app inserts it under RLS
// before calling this. This function only says "go".
//
// Admins only. The caller proves who they are with their own access token, and is_admin()
// is read through their own rights, so a non-admin gets a 403 whatever they send.
//
// GITHUB_DISPATCH_TOKEN is a fine-grained token scoped to the RemitBridge-App repo with
// Actions: read and write, set as a Supabase secret. Until it's set, this answers
// { dispatched: false } and the schedule picks the entry up.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { publishableKey } from '../_shared/keys.ts';

const REPO = 'OnGodCR/RemitBridge-App';
const WORKFLOW = 'manual-prices.yml';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const auth = req.headers.get('Authorization');
  if (!auth) return json({ error: 'not signed in' }, 401);

  const asCaller = createClient(Deno.env.get('SUPABASE_URL')!, publishableKey(), {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });
  const { data: isAdmin, error } = await asCaller.rpc('is_admin');
  if (error) return json({ error: 'not signed in' }, 401);
  if (!isAdmin) return json({ error: 'admins only' }, 403);

  const token = Deno.env.get('GITHUB_DISPATCH_TOKEN');
  if (!token) return json({ dispatched: false, reason: 'no dispatch token; the schedule will run it' }, 200);

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'RemitBridge (remitbridgesystemlabs@gmail.com)',
      },
      body: JSON.stringify({ ref: 'main' }),
    },
  );
  if (!res.ok) {
    // Not fatal for the admin: the entry is saved and the schedule will still run it.
    return json({ dispatched: false, reason: `github answered ${res.status}` }, 200);
  }
  return json({ dispatched: true }, 200);
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
