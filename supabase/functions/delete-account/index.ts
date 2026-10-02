// Deletes the signed-in user's account and everything tied to it (DECISIONS.md D19;
// Apple requires in-app account deletion).
//
// Deleting the auth user cascades: profiles, saved_comparisons and saved_transfers go with
// it (on delete cascade), and events keep their row but lose the user_id (on delete set
// null), so aggregate counts stay honest without keeping anything that points to a person.
//
// The service-role key never leaves this function: the platform injects it. The caller
// proves who they are with their own access token, and can only ever delete themselves.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { secretKey } from '../_shared/keys.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'not signed in' }, 401);

  const url = Deno.env.get('SUPABASE_URL')!;
  const admin = createClient(url, secretKey(), {
    auth: { persistSession: false },
  });

  // Who is asking? getUser validates the token with the auth server.
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return json({ error: 'not signed in' }, 401);

  const { error: deleteError } = await admin.auth.admin.deleteUser(data.user.id);
  if (deleteError) return json({ error: 'could not delete account' }, 500);

  return json({ deleted: true }, 200);
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
