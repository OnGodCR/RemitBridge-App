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
//   {{LEGAL_ENTITY}}             RemitBridge Labs, a Washington nonprofit corporation (the
//                                name alone until INCORPORATED)
//   {{CONTACT_EMAIL}}            the contact address
//   {{MAILING_ADDRESS_LINE}}     the mailing address, or, with none set (Angad's choice,
//                                2026-10-03), a line asking people to email for it
// An unknown {{TOKEN}} stops the build, so a typo can't ship as text.
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { APP_LEGAL, appLegalText, checkAppLegal } from './legal-for-app.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, 'dist');
/** Kept out of the published site, with every other dotfile except .well-known (Apple's
 *  apple-app-site-association for universal links, D48). */
const SKIP = new Set(['build.mjs', '_png', 'site.config.json', 'vercel.json', 'dist', 'node_modules', '.vercel']);

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

/** "RemitBridge Labs, a Washington nonprofit corporation", the status only once the state has accepted it. */
export function legalEntity(c) {
  return `${c.LEGAL_NAME}${c.INCORPORATED ? ', a Washington nonprofit corporation' : ''}`;
}

/** "© 2026 RemitBridge Labs, a Washington nonprofit corporation". */
export function copyrightLine(c) {
  return `© 2026 ${legalEntity(c)}`;
}

export function render(html, c, pagePath = '/') {
  const email = escape(c.CONTACT_EMAIL);
  const address = c.MAILING_ADDRESS.trim();
  const verify = c.META_DOMAIN_VERIFICATION
    ? `<meta name="facebook-domain-verification" content="${c.META_DOMAIN_VERIFICATION}">`
    : '';
  const head = [verify, shareTags(html, pagePath)].filter(Boolean).join('\n');
  const footer = [
    '<footer><div class="wrap">',
    '<nav><a href="/">Home</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/support">Contact</a><a href="https://www.remitbridgelabs.org">remitbridgelabs.org</a></nav>',
    `<p class="legal">${escape(copyrightLine(c))}<br><a href="mailto:${email}">${email}</a>${address ? `<br>${escape(address)}` : ''}</p>`,
    '</div></footer>',
  ].join('\n');
  const tokens = {
    LEGAL_NAME: escape(c.LEGAL_NAME),
    LEGAL_ENTITY: escape(legalEntity(c)),
    CONTACT_EMAIL: email,
    MAILING_ADDRESS_LINE: address
      ? `<p>${escape(address)}</p>`
      : `<p>Need our mailing address? Email <a href="mailto:${email}">${email}</a> and we'll send it.</p>`,
  };
  return html
    .replace(/<body([^>]*)>/, `<body$1>\n${BACKDROP}`)
    .replace('</body>', `${BACKDROP_SCRIPT}\n</body>`)
    .replace('<!--HEAD-->', head)
    .replace('<!--FOOTER-->', footer)
    .replace(/\{\{([A-Z_]+)\}\}/g, (whole, name) => {
      if (!(name in tokens)) throw new Error(`unknown token ${whole}`);
      return tokens[name];
    });
}

/**
 * The document pages (privacy, terms, support) as written are a plain run of headings and
 * text, which is how they should be edited. This lays them out at build time, so it holds
 * without script: the title and date move into a mint hero above the sheet, every h2 gets
 * an id and a number, and a contents list built from those headings sits beside the text
 * on wide screens. A page that opens with "In short" gets that list as a summary card.
 * Pages without <main class="wrap"> (the landing page, partner links) pass through.
 */
const slug = (t) => t.toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;|['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function docLayout(html) {
  const m = html.match(/<main class="wrap">\n?<h1>(.*?)<\/h1>\n?(?:<p class="muted">(.*?)<\/p>\n?)?([\s\S]*?)<\/main>/);
  if (!m) return html;
  const [whole, title, updated, body] = m;
  const heads = [];
  let n = 0;
  let content = body.replace(/<h2>(.*?)<\/h2>/g, (_, text) => {
    n += 1;
    const id = slug(text);
    heads.push({ id, text, n });
    return `<h2 id="${id}"><span class="num">${String(n).padStart(2, '0')}</span>${text}</h2>`;
  });
  content = content.replace(/(<h2 id="in-short">[\s\S]*?<\/h2>\n?<ul>[\s\S]*?<\/ul>)/, '<section class="summary">$1</section>');
  const eyebrow = /support/i.test(title) ? 'Help' : /privacy|terms/i.test(title) ? 'Legal' : 'RemitBridge';
  const toc = heads.map((h) => `<li><a href="#${h.id}">${h.text}</a></li>`).join('');
  return html.replace(whole, [
    '<div class="doc-hero" data-band><div class="wrap">',
    `<p class="eyebrow">${eyebrow}</p><h1>${title}</h1>`,
    updated ? `<p class="updated">${updated}</p>` : '',
    '</div></div>',
    heads.length ? '<div class="doc wrap">' : '<div class="doc solo wrap">',
    heads.length && `<aside class="toc" aria-label="On this page"><p>On this page</p><ol>${toc}</ol></aside>`,
    `<main class="sheet">${content}</main>`,
    '</div>',
    // Highlights the section being read. Only a class changes; without script the list
    // still works as plain links.
    `<script>(function(){var l=document.querySelectorAll('.toc a');if(!('IntersectionObserver'in window))return;var o=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){l.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+x.target.id)})}})},{rootMargin:'-80px 0px -70% 0px'});document.querySelectorAll('.sheet h2[id]').forEach(function(h){o.observe(h)})})()</script>`,
  ].filter(Boolean).join('\n'));
}

/**
 * The website's backdrop (remitbridgelabs.org src/components/Backdrop.jsx), rebuilt without
 * React and added to every page: the bridge mark tiled faintly behind everything, and a soft
 * green light that follows the pointer. Green bands (`data-band`) carry their own white light,
 * and the page light stands down while the pointer is inside one, so only one glows at a time.
 * Moving the pointer writes custom properties and nothing else. No light on touch screens or
 * under reduced motion, where it would only sit where you tapped.
 */
const BACKDROP = `<div class="backdrop" aria-hidden="true"><svg><defs><pattern id="bridges" width="120" height="90" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)"><g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" transform="translate(36 30) scale(1.05)"><path d="M2 17Q24 3 46 17"/><path d="M14 30v-6q10-9 20 0v6"/></g></pattern></defs><rect width="100%" height="100%" fill="url(#bridges)"/></svg><div class="light"></div></div>`;

const BACKDROP_SCRIPT = `<script>(function(){
if(!matchMedia('(hover: hover)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var page=document.querySelector('.backdrop'),bands=[].slice.call(document.querySelectorAll('[data-band]')),p=null,f=0;
function inside(r){return p&&p.x>=r.left&&p.x<=r.right&&p.y>=r.top&&p.y<=r.bottom}
function paint(){f=0;var inBand=false;bands.forEach(function(b){var r=b.getBoundingClientRect(),lit=inside(r);inBand=inBand||lit;b.style.setProperty('--lit',lit?1:0);if(lit){b.style.setProperty('--x',p.x-r.left+'px');b.style.setProperty('--y',p.y-r.top+'px')}});
page.style.setProperty('--lit',inBand?0:1);if(!inBand){page.style.setProperty('--x',p.x+'px');page.style.setProperty('--y',p.y+'px')}}
function go(){if(p&&!f)f=requestAnimationFrame(paint)}
addEventListener('pointermove',function(e){p={x:e.clientX,y:e.clientY};go()},{passive:true});
addEventListener('scroll',go,{passive:true});
})()</script>`;

const ORIGIN = 'https://app.remitbridgelabs.org';

/** The address a page is served at: privacy.html is /privacy (cleanUrls), index.html is /. */
const pathFor = (file) => '/' + file.replace(/\\/g, '/').replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '');

/** Pages that should be in the sitemap and carry a canonical; the rest are utility pages. */
export const PUBLIC_PATHS = ['/', '/support', '/privacy', '/terms'];

/**
 * Canonical, Open Graph and Twitter tags for a page, read from its own <title> and
 * description so each page previews as itself when a link to it is shared. The 404 and
 * partner pages get the image and title but no canonical.
 */
export function shareTags(html, pagePath) {
  const title = (html.match(/<title>(.*?)<\/title>/) || [])[1] || 'RemitBridge';
  const description = (html.match(/<meta name="description" content="([^"]*)">/) || [])[1] || '';
  const url = ORIGIN + (pagePath === '/' ? '/' : pagePath);
  const canonical = PUBLIC_PATHS.includes(pagePath);
  return [
    canonical && `<link rel="canonical" href="${url}">`,
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="RemitBridge">',
    `<meta property="og:title" content="${title}">`,
    description && `<meta property="og:description" content="${description}">`,
    canonical && `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${ORIGIN}/og-image.png">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta property="og:image:alt" content="RemitBridge: see what your family really receives.">',
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${title}">`,
    description && `<meta name="twitter:description" content="${description}">`,
    `<meta name="twitter:image" content="${ORIGIN}/og-image.png">`,
  ].filter(Boolean).join('\n');
}

/** robots.txt and sitemap.xml, from PUBLIC_PATHS, so a new page is listed by adding it there. */
function crawlerFiles() {
  return {
    'robots.txt': `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`,
    'sitemap.xml': [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...PUBLIC_PATHS.map((p) => `  <url><loc>${ORIGIN}${p}</loc></url>`),
      '</urlset>',
      '',
    ].join('\n'),
  };
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
      const page = docLayout(render(html, config, pathFor(relative(root, path))));
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
  if (process.argv[2] !== 'check') {
    process.on('exit', () => {
      for (const [name, text] of Object.entries(crawlerFiles())) writeFileSync(join(out, name), text);
    });
  }
  build({ write: process.argv[2] !== 'check' });
  // The app carries the terms and privacy policy as text (D188): keep it the same words.
  // Skipped where only site/ is checked out (Vercel's project root), which has no app.
  if (existsSync(dirname(APP_LEGAL))) {
    if (process.argv[2] === 'check') checkAppLegal();
    else writeFileSync(APP_LEGAL, appLegalText());
  }
}
