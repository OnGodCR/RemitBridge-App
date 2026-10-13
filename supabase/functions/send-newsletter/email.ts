// The newsletter email (D169), as text and as HTML, kept free of Deno and network calls so
// packages/bot's vitest can check it. The HTML follows the sign-in code email
// (supabase/templates/code.html): tables and inline styles only, since Gmail and Outlook strip
// <style>. The issue is written as plain text: a blank line starts a paragraph, and web
// addresses become links. No images besides the logo, no open or click tracking.

export interface Issue {
  subject: string;
  body: string;
}

export interface Sender {
  legalName: string;
  /** Printed in every issue once site.config.json has one. */
  mailingAddress: string;
  contactEmail: string;
}

export interface Built {
  subject: string;
  text: string;
  html: string;
}

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Paragraphs: split on blank lines, trimmed, empty ones dropped. */
export function paragraphs(body: string): string[] {
  return body
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const URL_RE = /\bhttps:\/\/[^\s<>"]+[^\s<>".,;:!?)]/g;

/** One paragraph as HTML: escaped, line breaks kept, https addresses linked. */
function paragraphHtml(p: string): string {
  let out = '';
  let last = 0;
  for (const m of p.matchAll(URL_RE)) {
    out += escape(p.slice(last, m.index));
    const url = escape(m[0]);
    out += `<a href="${url}" style="color:#14705a;">${url}</a>`;
    last = m.index! + m[0].length;
  }
  out += escape(p.slice(last));
  return out.replace(/\n/g, '<br>');
}

export function buildEmail(issue: Issue, sender: Sender, unsubscribeUrl: string): Built {
  const paras = paragraphs(issue.body);
  const why = 'You get this because you turned on the RemitBridge newsletter in the app.';
  const off = 'To stop it, unsubscribe here in one tap, or turn it off in the app under Account, Newsletter:';
  const signature = [sender.legalName, sender.mailingAddress, sender.contactEmail].filter((s) => s.trim());

  const text = `${paras.join('\n\n')}\n\n--\n${why}\n${off}\n${unsubscribeUrl}\n\n${signature.join('\n')}\n`;

  const body = paras
    .map((p) => `<p style="margin:0 0 16px; font-size:16px; line-height:24px;">${paragraphHtml(p)}</p>`)
    .join('\n');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escape(issue.subject)}</title>
</head>
<body style="margin:0; padding:0; background-color:#e8f2ee;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#e8f2ee;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; background-color:#ffffff; border-radius:16px; overflow:hidden; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#1c2024;">
        <tr>
          <td style="background-color:#14705a; padding:24px 28px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align:middle; padding-right:12px;">
                  <img src="https://app.remitbridgelabs.org/apple-touch-icon.png" width="36" height="36" alt="" style="display:block; border:0; border-radius:9px;">
                </td>
                <td style="vertical-align:middle; font-size:18px; font-weight:700; color:#ffffff; letter-spacing:-0.2px;">RemitBridge</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 28px 16px;">
            <p style="margin:0 0 20px; font-size:22px; line-height:28px; font-weight:700; letter-spacing:-0.3px;">${escape(issue.subject)}</p>
${body}
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid #e4e7eb; padding:18px 28px 22px; font-size:12px; line-height:18px; color:#5b6470;">
            ${escape(why)} <a href="${escape(unsubscribeUrl)}" style="color:#14705a;">Unsubscribe</a>, or turn it off in the app under Account, Newsletter.<br><br>
            ${signature.map(escape).join('<br>')}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  return { subject: issue.subject, text, html };
}
