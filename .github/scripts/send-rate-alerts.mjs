/**
 * Sends rate alerts (DECISIONS.md D34, D113). Run by the "Rate alerts" workflow after each
 * price update, with the service role: reads due_rate_alerts(), sends each one through
 * Expo's push service in the person's language, stamps it sent (so it waits at least 20
 * hours), and deletes alerts whose phone no longer takes notifications.
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node .github/scripts/send-rate-alerts.mjs
 *
 * Nothing about the person is sent to Expo beyond the push token and the message.
 */
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are needed');
const REST = `${url}/rest/v1`;
// A newer sb_secret_ key goes only in the apikey header; a legacy key is also a bearer token (D137).
const H = { apikey: key, ...(key.startsWith('sb_') ? {} : { Authorization: `Bearer ${key}` }), 'Content-Type': 'application/json' };

const COUNTRY = {
  'us-in': { en: 'India', es: 'India', hi: 'भारत', tl: 'India', vi: 'Ấn Độ' },
  'us-mx': { en: 'Mexico', es: 'México', hi: 'मेक्सिको', tl: 'Mexico', vi: 'Mexico' },
  'us-ph': { en: 'the Philippines', es: 'Filipinas', hi: 'फ़िलीपींस', tl: 'Pilipinas', vi: 'Philippines' },
  'us-vn': { en: 'Vietnam', es: 'Vietnam', hi: 'वियतनाम', tl: 'Vietnam', vi: 'Việt Nam' },
};

const TEXT = {
  en: { title: (c) => `Rate alert: ${c}`, body: (p, r, s, t) => `${p} now gives ${r} for ${s}, above your ${t} target.` },
  es: { title: (c) => `Alerta de tipo de cambio: ${c}`, body: (p, r, s, t) => `${p} ahora da ${r} por ${s}, por encima de tu meta de ${t}.` },
  hi: { title: (c) => `रेट अलर्ट: ${c}`, body: (p, r, s, t) => `${p} अब ${s} पर ${r} दे रहा है, आपके ${t} के लक्ष्य से ज़्यादा।` },
  tl: { title: (c) => `Rate alert: ${c}`, body: (p, r, s, t) => `Nagbibigay na ang ${p} ng ${r} para sa ${s}, higit sa target mong ${t}.` },
  vi: { title: (c) => `Cảnh báo tỷ giá: ${c}`, body: (p, r, s, t) => `${p} hiện trả ${r} cho ${s}, cao hơn mục tiêu ${t} của bạn.` },
};

// Money stays in US format in every language, as in the app.
const money = (n, currency) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(n));

const res = await fetch(`${REST}/rpc/due_rate_alerts`, { method: 'POST', headers: H, body: '{}' });
if (res.status === 404) {
  // The migration isn't pushed yet; nothing to send, and nothing wrong.
  console.log('due_rate_alerts() not found: the rate alerts migration is not live yet.');
  process.exit(0);
}
if (!res.ok) throw new Error(`due_rate_alerts: HTTP ${res.status} ${await res.text()}`);
const due = await res.json();
console.log(`${due.length} alert(s) due`);
if (!due.length) process.exit(0);

const messages = due.map((a) => {
  const lang = TEXT[a.language] ? a.language : 'en';
  const country = COUNTRY[a.route_id]?.[lang] ?? a.receive_currency;
  return {
    to: a.push_token,
    title: TEXT[lang].title(country),
    body: TEXT[lang].body(a.provider_name, money(a.best_received, a.receive_currency), money(a.send_amount, 'USD'), money(a.target_received, a.receive_currency)),
    sound: 'default',
    // The app opens Compare on this route, amount and method when the alert is tapped.
    data: { route: a.route_id, amount: Number(a.send_amount), method: a.delivery_method },
  };
});

const sent = [];
const gone = [];
for (let i = 0; i < messages.length; i += 100) {
  const batch = messages.slice(i, i + 100);
  const r = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(batch),
  });
  if (!r.ok) throw new Error(`Expo push: HTTP ${r.status} ${redactTokens(await r.text())}`);
  const { data } = await r.json();
  data.forEach((ticket, j) => {
    const alert = due[i + j];
    if (ticket.status === 'ok') sent.push(alert.id);
    else if (ticket.details?.error === 'DeviceNotRegistered') gone.push(alert.id);
    else console.log(`alert ${alert.id}: ${redactTokens(ticket.message)}`);
  });
}

const ids = (list) => `(${list.join(',')})`;

// Expo's messages can quote the phone's push token; the Actions log never shows one (D135).
function redactTokens(text) {
  return String(text ?? '').replace(/Expo(nent)?PushToken\[[^\]]*\]/g, 'ExpoPushToken[hidden]');
}
if (sent.length) {
  const r = await fetch(`${REST}/rate_alerts?id=in.${ids(sent)}`, {
    method: 'PATCH',
    headers: { ...H, Prefer: 'return=minimal' },
    body: JSON.stringify({ last_notified_at: new Date().toISOString() }),
  });
  if (!r.ok) throw new Error(`stamping sent alerts: HTTP ${r.status}`);
}
if (gone.length) {
  const r = await fetch(`${REST}/rate_alerts?id=in.${ids(gone)}`, { method: 'DELETE', headers: H });
  if (!r.ok) throw new Error(`deleting dead alerts: HTTP ${r.status}`);
}
console.log(`sent ${sent.length}, removed ${gone.length} for phones that no longer take notifications`);
