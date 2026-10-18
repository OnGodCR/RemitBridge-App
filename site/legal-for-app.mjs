// The terms and privacy policy inside the app (D188, Angad 2026-10-17): the same words as
// site/terms.html and site/privacy.html, turned into plain blocks the app draws with its own
// text styles, so the app and the site can never say different things.
//
//   node site/legal-for-app.mjs          writes mobile/src/content/legal.json
//   node site/legal-for-app.mjs check    fails if that file is out of date
//
// site/build.mjs runs the same check, so a change to either page that isn't carried into
// the app stops the site build.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadConfig, render } from './build.mjs';

const root = dirname(fileURLToPath(import.meta.url));
export const APP_LEGAL = join(root, '..', 'mobile', 'src', 'content', 'legal.json');

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
const decode = (s) => s.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m]);

/** One run of text: plain, bold, or a link (made absolute, so the app can open it). */
function spans(html) {
  const out = [];
  const re = /<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>|<strong>([\s\S]*?)<\/strong>|([^<]+)|<[^>]+>/g;
  for (const m of html.matchAll(re)) {
    if (m[1] !== undefined) {
      const href = m[1].startsWith('/') ? `https://app.remitbridgelabs.org${m[1]}` : m[1];
      out.push({ text: decode(m[2].replace(/<[^>]+>/g, '')), href });
    } else if (m[3] !== undefined) out.push({ text: decode(m[3].replace(/<[^>]+>/g, '')), bold: true });
    else if (m[4] !== undefined) out.push({ text: decode(m[4]) });
  }
  // Collapse the source's line breaks and indentation into single spaces.
  return out.map((s) => ({ ...s, text: s.text.replace(/\s+/g, ' ') })).filter((s) => s.text.trim());
}

/** The page's main column as blocks: title, updated line, headings, paragraphs, list items. */
export function blocks(html) {
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1];
  if (!main) throw new Error('no <main> in a legal page');
  const doc = { title: '', updated: '', blocks: [] };
  const re = /<h1>([\s\S]*?)<\/h1>|<p class="muted">([\s\S]*?)<\/p>|<h2[^>]*>([\s\S]*?)<\/h2>|<p>([\s\S]*?)<\/p>|<li>([\s\S]*?)<\/li>/g;
  for (const m of main.matchAll(re)) {
    if (m[1] !== undefined) doc.title = decode(m[1].trim());
    else if (m[2] !== undefined && !doc.updated) doc.updated = decode(m[2].trim());
    else if (m[3] !== undefined) doc.blocks.push({ kind: 'heading', text: decode(m[3].replace(/<[^>]+>/g, '').trim()) });
    else if (m[4] !== undefined) doc.blocks.push({ kind: 'paragraph', spans: spans(m[4].trim()) });
    else if (m[5] !== undefined) doc.blocks.push({ kind: 'item', spans: spans(m[5].trim()) });
  }
  if (!doc.title || !doc.updated || !doc.blocks.length) throw new Error('a legal page lost its title, date or text');
  return doc;
}

export function appLegal(config = loadConfig()) {
  const page = (name) => blocks(render(readFileSync(join(root, `${name}.html`), 'utf8'), config, `/${name}`));
  const terms = page('terms');
  const privacy = page('privacy');
  // The version people agree to: both dates, so a change to either asks again.
  const date = (d) => d.updated.replace(/^Last updated /, '');
  return { version: `terms ${date(terms)}; privacy ${date(privacy)}`, terms, privacy };
}

export const appLegalText = (config) => `${JSON.stringify(appLegal(config), null, 2)}\n`;

export function checkAppLegal(config) {
  let current = '';
  try {
    current = readFileSync(APP_LEGAL, 'utf8');
  } catch {
    // Missing counts as out of date.
  }
  if (current !== appLegalText(config)) {
    throw new Error('mobile/src/content/legal.json is out of date: run node site/legal-for-app.mjs');
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === 'check') checkAppLegal();
  else writeFileSync(APP_LEGAL, appLegalText());
}
