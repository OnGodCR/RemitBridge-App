// Sends the one launch email promised to people who asked for a route (PRD 6.7,
// DECISIONS.md D64, D67), then deletes their address. An admin starts it from the route
// board once the route is marked live.
//
// Admins only: the caller's own token is checked with is_admin(), as in process-prices.
// The route must be 'live' in the routes table, so nobody is told about a launch that
// hasn't happened. Each address is cleared in the same update that stamps notified_at,
// and the table's check makes it impossible to keep one after notifying.
//
// Mail goes through Resend's API from the address auth mail already uses (D53).
// RESEND_API_KEY is a Supabase secret; until it's set this sends nothing and says so.
import { createClient } from 'npm:@supabase/supabase-js@2';

const FROM = 'RemitBridge <RemitBridge@remitbridgelabs.org>';
const REPLY_TO = 'remitbridgesystemlabs@gmail.com';
const SITE = 'https://app.remitbridgelabs.org';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const auth = req.headers.get('Authorization');
  if (!auth) return json({ error: 'not signed in' }, 401);
  const url = Deno.env.get('SUPABASE_URL')!;
  const asCaller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });
  const { data: isAdmin, error: adminError } = await asCaller.rpc('is_admin');
  if (adminError) return json({ error: 'not signed in' }, 401);
  if (!isAdmin) return json({ error: 'admins only' }, 403);

  const body = await req.json().catch(() => ({}));
  const routeId = typeof body.route_id === 'string' ? body.route_id.toLowerCase() : '';
  if (!/^[a-z]{2}-[a-z]{2}$/.test(routeId)) return json({ error: 'route_id like "us-np" required' }, 400);

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const { data: route } = await admin
    .from('routes')
    .select('id, status, send_country, receive_country')
    .eq('id', routeId)
    .maybeSingle();
  if (!route) return json({ error: 'no such route' }, 404);
  if (route.status !== 'live') return json({ error: `route is ${route.status}, not live` }, 409);

  const { data: waiting, error: readError } = await admin
    .from('route_requests')
    .select('id, notify_email')
    .eq('send_country', route.send_country)
    .eq('receive_country', route.receive_country)
    .not('notify_email', 'is', null)
    .is('notified_at', null);
  if (readError) return json({ error: 'could not read requests' }, 500);
  if (!waiting?.length) return json({ sent: 0, failed: 0 }, 200);

  const key = Deno.env.get('RESEND_API_KEY');
  if (!key) return json({ sent: 0, failed: 0, waiting: waiting.length, reason: 'RESEND_API_KEY is not set' }, 200);

  const to = countryName(route.receive_country);
  const from = countryName(route.send_country);
  let sent = 0;
  let failed = 0;
  // One at a time: a handful of addresses per route, and a failure on one mustn't lose
  // track of which were sent.
  for (const r of waiting) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [r.notify_email],
        reply_to: REPLY_TO,
        subject: `RemitBridge now checks prices for sending to ${to}`,
        text: [
          'Hi,',
          '',
          `You asked us to check prices for sending money from ${from} to ${to}. We do now, so you can see what your family would receive with each provider before you send.`,
          '',
          `Open RemitBridge and pick ${to}: ${SITE}`,
          '',
          'This is the only email we’ll send you about it, and your address has been deleted from your request.',
          '',
          'RemitBridge',
          REPLY_TO,
        ].join('\n'),
      }),
    });
    if (!res.ok) {
      failed++;
      continue;
    }
    const { error } = await admin
      .from('route_requests')
      .update({ notify_email: null, notified_at: new Date().toISOString() })
      .eq('id', r.id);
    // The mail went out even if the update didn't; count it as sent and report the rest.
    sent++;
    if (error) failed++;
  }
  return json({ sent, failed }, 200);
});

// The receiving countries a route can have (mobile/src/lib/countries.ts). A code not
// listed here is shown as the code, which is still correct, just less friendly.
const NAMES: Record<string, string> = {
  US: 'the US', CA: 'Canada', GB: 'the UK', AE: 'the UAE', SA: 'Saudi Arabia', AU: 'Australia',
  IN: 'India', MX: 'Mexico', PH: 'the Philippines', VN: 'Vietnam', CN: 'China', GT: 'Guatemala',
  SV: 'El Salvador', HN: 'Honduras', DO: 'the Dominican Republic', ET: 'Ethiopia', KE: 'Kenya',
  NG: 'Nigeria', PK: 'Pakistan', BD: 'Bangladesh', KR: 'South Korea', UA: 'Ukraine', CO: 'Colombia',
  EC: 'Ecuador', PE: 'Peru', NI: 'Nicaragua', JM: 'Jamaica', HT: 'Haiti', BR: 'Brazil', GH: 'Ghana',
  NP: 'Nepal', LK: 'Sri Lanka', EG: 'Egypt', UG: 'Uganda', SO: 'Somalia', ER: 'Eritrea', CU: 'Cuba',
  AF: 'Afghanistan', VE: 'Venezuela',
};

function countryName(code: string): string {
  return NAMES[code] ?? code;
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
