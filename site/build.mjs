// Builds the site into dist/ (DECISIONS.md D141): every page as written, with the operator's
// details from site.config.json filled in. Vercel runs this on each deploy (vercel.json).
//
// The values go into the HTML itself, not in by script, because Meta's domain check reads
// the raw page and runs no JavaScript.
//
//   node build.mjs        writes dist/
//   node build.mjs check  only checks the config and the pages, writes nothing
//
// In a page:
//   <!--HEAD-->                  Meta's domain verification tag, when the value is set
//   <!--FOOTER-->                the footer: links, the © line, the email and the address
//   {{LEGAL_NAME}}               RemitBridge Labs
//   {{CONTACT_EMAIL}}            the contact address
//   {{MAILING_ADDRESS_LINE}}     the mailing address, or, with none set (Angad's choice,
//                                2026-10-03), a line asking people to email for it
// An unknown {{TOKEN}} stops the build, so a typo can't ship as text.
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, 'dist');
/** Kept out of the published site, with every other dotfile except .well-known (Apple's
 *  apple-app-site-association for universal links, D48). */
const SKIP = new Set(['build.mjs', 'site.config.json', 'vercel.json', 'dist', 'node_modules', '.vercel']);

export function loadConfig(text = readFileSync(join(root, 'site.config.json'), 'utf8')) {
  const c = JSON.parse(text);
  const problems = [];
  if (typeof c.LEGAL_NAME !== 'string' || !c.LEGAL_NAME.trim()) problems.push('LEGAL_NAME is empty');
  if (typeof c.CONTACT_EMAIL !== 'string' || !/^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i.test(c.CONTACT_EMAIL)) {
    problems.push('CONTACT_EMAIL is not an email address');
  }
  if (typeof c.MAILING_ADDRESS !== 'string') problems.push('MAILING_ADDRESS must be a string ("" for none)');
  if (typeof c.META_DOMAIN_VERIFICATION !== 'string' || !/^[A-Za-z0-9]*$/.test(c.META_DOMAIN_VERIFICATION)) {
    problems.push('META_DOMAIN_VERIFICATION must be letters and digits only ("" for none)');
  }
  if (typeof c.INCORPORATED !== 'boolean') problems.push('INCORPORATED must be true or false');
  if (problems.length) throw new Error(`site.config.json: ${problems.join('; ')}`);
  return c;
}

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** "© 2026 RemitBridge Labs", plus the legal status only once the state has accepted it. */
export function copyrightLine(c) {
  return `© 2026 ${c.LEGAL_NAME}${c.INCORPORATED ? ', a Washington nonprofit corporation' : ''}`;
}

export function render(html, c) {
  const email = escape(c.CONTACT_EMAIL);
  const address = c.MAILING_ADDRESS.trim();
  const head = c.META_DOMAIN_VERIFICATION
    ? `<meta name="facebook-domain-verification" content="${c.META_DOMAIN_VERIFICATION}">`
    : '';
  const footer = [
    '<footer><div class="wrap">',
    '<nav><a href="/">Home</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/support">Contact</a><a href="https://www.remitbridgelabs.org">remitbridgelabs.org</a></nav>',
    `<p class="legal">${escape(copyrightLine(c))}<br><a href="mailto:${email}">${email}</a>${address ? `<br>${escape(address)}` : ''}</p>`,
    '</div></footer>',
  ].join('\n');
  const tokens = {
    LEGAL_NAME: escape(c.LEGAL_NAME),
    CONTACT_EMAIL: email,
    MAILING_ADDRESS_LINE: address
      ? `<p>${escape(address)}</p>`
      : `<p>Need our mailing address? Email <a href="mailto:${email}">${email}</a> and we'll send it.</p>`,
  };
  return html
    .replace('<!--HEAD-->', head)
    .replace('<!--FOOTER-->', footer)
    .replace(/\{\{([A-Z_]+)\}\}/g, (whole, name) => {
      if (!(name in tokens)) throw new Error(`unknown token ${whole}`);
      return tokens[name];
    });
}

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (SKIP.has(name) || (name.startsWith('.') && name !== '.well-known')) return [];
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

function build({ write }) {
  const config = loadConfig();
  if (write) {
    rmSync(out, { recursive: true, force: true });
    mkdirSync(out, { recursive: true });
  }
  for (const path of files(root)) {
    const target = join(out, relative(root, path));
    if (path.endsWith('.html')) {
      const html = readFileSync(path, 'utf8');
      if (!html.includes('<!--HEAD-->') || !html.includes('<!--FOOTER-->')) {
        throw new Error(`${relative(root, path)}: needs <!--HEAD--> and <!--FOOTER-->`);
      }
      const page = render(html, config);
      if (write) {
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, page);
      }
    } else if (write) {
      mkdirSync(dirname(target), { recursive: true });
      copyFileSync(path, target);
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  build({ write: process.argv[2] !== 'check' });
}
