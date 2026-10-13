// Sends a newsletter issue (D169) to everyone who turned the newsletter on in the app. An
// admin writes it on the app's Newsletter screen, sends a test to their own address, then
// sends it to everyone.
//
// Admins only: the caller's own token is checked with is_admin(), as in notify-route-launch.
// A full send needs a postal address in site.config.json (MAILING_ADDRESS): US law
// (CAN-SPAM) asks for one in commercial email, and a newsletter can count as that, so the
// safe default is not to send without it. A test goes only to the admin and needs none.
//
// Each issue is logged in newsletter_issues before the first email goes out, and a second
// full send within 10 minutes is refused, so a double tap can't mail everyone twice.
//
// Mail goes through Resend (RESEND_API_KEY), from the address the launch email uses, in
// batches of 100. Every email carries its own unsubscribe link (the site's /unsubscribe page)
// and List-Unsubscribe headers, so Gmail and Apple Mail show their own one-tap unsubscribe.
// Resend's free plan sends 100 emails a day; past that a batch fails and is counted as failed.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { publishableKey, secretKey } from '../_shared/keys.ts';
import { CONTACT_EMAIL, LEGAL_NAME, MAILING_ADDRESS } from '../_shared/site-config.ts';
import { buildEmail, type Issue } from './email.ts';

const FROM = 'RemitBridge <RemitBridge@remitbridgelabs.org>';
const SITE = 'https://app.remitbridgelabs.org';
const BATCH = 100;
const COOLDOWN_MS = 10 * 60 * 1000;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Recipient {
  email: string;
  unsubscribe_token: string;
  language: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const auth = req.headers.get('Authorization');
  if (!auth) return json({ error: 'not signed in' }, 401);
  const url = Deno.env.get('SUPABASE_URL')!;
  const asCaller = createClient(url, publishableKey(), {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });
  const { data: isAdmin, error: adminError } = await asCaller.rpc('is_admin');
  if (adminError) return json({ error: 'not signed in' }, 401);
  if (!isAdmin) return json({ error: 'admins only' }, 403);

  const body = await req.json().catch(() => ({}));
  const mode = body.mode === 'send' ? 'send' : body.mode === 'test' ? 'test' : null;
  const issue: Issue = {
    subject: typeof body.subject === 'string' ? body.subject.trim() : '',
    body: typeof body.body === 'string' ? body.body.trim() : '',
  };
  if (!mode) return json({ error: 'mode must be "test" or "send"' }, 400);
  if (issue.subject.length < 1 || issue.subject.length > 150) return json({ error: 'subject: 1 to 150 characters' }, 400);
  if (issue.body.length < 1 || issue.body.length > 20000) return json({ error: 'body: 1 to 20,000 characters' }, 400);

  const key = Deno.env.get('RESEND_API_KEY');
  if (!key) return json({ error: 'RESEND_API_KEY is not set' }, 503);
  const sender = { legalName: LEGAL_NAME, mailingAddress: MAILING_ADDRESS, contactEmail: CONTACT_EMAIL };

  if (mode === 'test') {
    const { data } = await asCaller.auth.getUser();
    const to = data?.user?.email;
    if (!to) return json({ error: 'your account has no email address' }, 400);
    const built = buildEmail({ ...issue, subject: `[Test] ${issue.subject}` }, sender, `${SITE}/unsubscribe`);
    const res = await resend(key, '/emails', message(to, built));
    return res.ok ? json({ sent: 1, to }, 200) : json({ error: `Resend refused the test (${res.status})` }, 502);
  }

  if (!MAILING_ADDRESS.trim()) {
    return json({ error: 'Set MAILING_ADDRESS in site/site.config.json and redeploy before sending to everyone' }, 409);
  }

  const admin = createClient(url, secretKey(), { auth: { persistSession: false } });
  const since = new Date(Date.now() - COOLDOWN_MS).toISOString();
  const { data: recent } = await admin.from('newsletter_issues').select('id').gte('created_at', since);
  if (recent?.length) return json({ error: 'An issue went out in the last 10 minutes' }, 409);

  const { data: rows, error: readError } = await admin.rpc('newsletter_recipients');
  if (readError) return json({ error: 'could not read the subscribers' }, 500);
  const recipients = (rows ?? []) as Recipient[];
  if (!recipients.length) return json({ recipients: 0, sent: 0, failed: 0 }, 200);

  const { data: me } = await asCaller.auth.getUser();
  const { data: logged, error: logError } = await admin
    .from('newsletter_issues')
    .insert({ subject: issue.subject, body: issue.body, sent_by: me?.user?.id ?? null, recipients: recipients.length })
    .select('id')
    .single();
  if (logError || !logged) return json({ error: 'could not log the issue' }, 500);

  let sent = 0;
  let failed = 0;
  for (let i = 0; i < recipients.length; i += BATCH) {
    const chunk = recipients.slice(i, i + BATCH);
    const batch = chunk.map((r) => {
      const page = `${SITE}/unsubscribe?t=${r.unsubscribe_token}`;
      const oneClick = `${url}/functions/v1/newsletter-unsubscribe?t=${r.unsubscribe_token}`;
      return {
        ...message(r.email, buildEmail(issue, sender, page)),
        headers: {
          'List-Unsubscribe': `<${oneClick}>, <mailto:${CONTACT_EMAIL}?subject=unsubscribe>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      };
    });
    const res = await resend(key, '/emails/batch', batch);
    if (res.ok) sent += chunk.length;
    else failed += chunk.length;
  }

  await admin.from('newsletter_issues').update({ sent, failed }).eq('id', logged.id);
  return json({ recipients: recipients.length, sent, failed }, 200);
});

function message(to: string, built: { subject: string; text: string; html: string }) {
  return { from: FROM, to: [to], reply_to: CONTACT_EMAIL, subject: built.subject, text: built.text, html: built.html };
}

function resend(key: string, path: string, payload: unknown) {
  return fetch(`https://api.resend.com${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
