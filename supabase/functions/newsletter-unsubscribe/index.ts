// Leaves the newsletter (D169) from the link in an email, no sign-in needed: the random
// token in the link is the only key, and using it deletes the person's opt-in row.
//
// Two callers:
// - the site's /unsubscribe page, which POSTs {"token": ...} when the person taps the button;
// - Gmail, Apple Mail and others, which POST to the List-Unsubscribe address (?t=...) with
//   "List-Unsubscribe=One-Click" (RFC 8058) when someone uses their own unsubscribe button.
// A GET (someone opening the header's address, or a link scanner) only redirects to the site's
// page, so nothing is removed until a person or their mail app asks with a POST.
//
// The answer is the same whether or not the token matched, so it can't be used to test tokens.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { secretKey } from '../_shared/keys.ts';

const SITE = 'https://app.remitbridgelabs.org';
const TOKEN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const query = new URL(req.url).searchParams.get('t') ?? '';
  if (req.method === 'GET') {
    const to = TOKEN.test(query) ? `${SITE}/unsubscribe?t=${query}` : `${SITE}/unsubscribe`;
    return new Response(null, { status: 303, headers: { Location: to } });
  }
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  let token = query;
  if (!token && (req.headers.get('content-type') ?? '').includes('application/json')) {
    const body = await req.json().catch(() => ({}));
    token = typeof body.token === 'string' ? body.token : '';
  }
  if (!TOKEN.test(token)) return json({ error: 'not an unsubscribe link' }, 400);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, secretKey(), { auth: { persistSession: false } });
  const { error } = await admin.from('newsletter_subscribers').delete().eq('unsubscribe_token', token.toLowerCase());
  if (error) return json({ error: 'try again' }, 500);
  return json({ unsubscribed: true }, 200);
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
