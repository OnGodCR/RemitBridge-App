/**
 * Brings the website's blog into the app (DECISIONS.md D106). Reads the website repo
 * (never writes to it) and the live site, and writes:
 *
 * - src/data/blog.json: every post's catalogue entry and, for posts written in full, its
 *   body blocks, exactly as the website stores them. A figure block becomes a picture.
 * - assets/blog/: each figure, captured from the live post page at phone width as the
 *   website draws it, and the photo covers, resized.
 * - src/data/blog-images.ts: the require() map React Native needs for bundled images.
 *
 *   node scripts/port-blog.mjs            (from mobile/; needs Google Chrome installed)
 *
 * Rerun it when the website publishes or edits a post. The website repo is found next to
 * this one; WEBSITE_REPO overrides that.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright-core';

const app = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = process.env.WEBSITE_REPO ?? join(app, '..', '..', 'RemitBridge-System-Labs---Website');
const LIVE = 'https://www.remitbridgelabs.org';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const assets = join(app, 'assets', 'blog');

/**
 * No yellow in the app (D105). The website draws series 4 (Cost, speed, failure) in
 * amber; before each capture its five colour classes are restyled to the app's slate
 * teal for that series, the same one blog.ts uses for its label.
 */
const NO_YELLOW = `
  .bg-\\[\\#FAF0E2\\] { background-color: #E6EEF1 !important; }
  .text-\\[\\#8A4E0C\\] { color: #2B5566 !important; }
  .border-\\[\\#EBD9BC\\] { border-color: #C6D6DD !important; }
  .border-l-\\[\\#9A5510\\] { border-left-color: #356A7D !important; }
  .bg-\\[\\#9A5510\\] { background-color: #356A7D !important; }
`;

/** Evaluates one of the website's data modules: `export const x =` becomes `out.x =`. */
function load(file, transform = (s) => s) {
  let src = readFileSync(join(site, file), 'utf8');
  src = src.replace(/^import[\s\S]*?from\s+['"][^'"]+['"];?[ \t]*$/gm, '');
  src = transform(src).replace(/export const (\w+) =/g, 'out.$1 =');
  const out = {};
  new Function('out', src)(out);
  return out;
}

const slugify = (title) =>
  title
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const { posts, seriesCategories } = load('src/data/posts.js');
// A figure is a React component on the website; here it becomes a named placeholder that
// the capture below fills with a picture.
const { bodies } = load('src/data/postBodies.jsx', (s) => s.replace(/render:\s*(\w+)/g, "figure: '$1'"));

// Photo covers: blog.js imports them by id (`import cover3 from '@/assets/x.jpg'`).
const blogJs = readFileSync(join(site, 'src/data/blog.js'), 'utf8');
const coverFiles = Object.fromEntries(
  [...blogJs.matchAll(/import cover(\d+) from '@\/assets\/([^']+)'/g)].map((m) => [Number(m[1]), m[2]]),
);

rmSync(assets, { recursive: true, force: true });
mkdirSync(assets, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 430, height: 900 }, deviceScaleFactor: 2 });
const images = {};
const out = [];

for (const post of posts) {
  const slug = slugify(post.title);
  const body = bodies[post.id] ?? null;
  const entry = { ...post, slug, body: body ? body.map((b) => ({ ...b })) : null, cover: null };

  if (coverFiles[post.id]) {
    const name = `cover-${post.id}.jpg`;
    // 1200 wide is plenty for a phone and keeps the app small.
    execFileSync('sips', ['-Z', '1200', '-s', 'format', 'jpeg', '-s', 'formatOptions', '70', join(site, 'src/assets', coverFiles[post.id]), '--out', join(assets, name)], { stdio: 'ignore' });
    images[`cover-${post.id}`] = name;
    entry.cover = `cover-${post.id}`;
  }

  const figures = entry.body?.filter((b) => b.type === 'figure') ?? [];
  if (figures.length) {
    await page.goto(`${LIVE}/blog/${slug}`, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: NO_YELLOW });
    const shown = page.locator('main figure');
    const count = await shown.count();
    if (count !== figures.length) {
      throw new Error(`post ${post.id}: the page shows ${count} figures, the data has ${figures.length}`);
    }
    for (let i = 0; i < count; i++) {
      const name = `fig-${post.id}-${i + 1}.png`;
      const el = shown.nth(i);
      await el.scrollIntoViewIfNeeded();
      const box = await el.boundingBox();
      await el.screenshot({ path: join(assets, name), animations: 'disabled' });
      images[`fig-${post.id}-${i + 1}`] = name;
      Object.assign(figures[i], { image: `fig-${post.id}-${i + 1}`, width: box.width, height: box.height });
    }
  }
  out.push(entry);
  console.log(`post ${post.id}: ${body ? `${body.length} blocks, ${figures.length} figures` : 'summary only'}`);
}
await browser.close();

writeFileSync(join(app, 'src/data/blog.json'), JSON.stringify({ series: seriesCategories, posts: out }, null, 1) + '\n');
writeFileSync(
  join(app, 'src/data/blog-images.ts'),
  `// Written by scripts/port-blog.mjs. Don't edit by hand; rerun the script.\n` +
    `export const BLOG_IMAGES: Record<string, number> = {\n` +
    Object.entries(images)
      .map(([k, f]) => `  '${k}': require('../../assets/blog/${f}'),`)
      .join('\n') +
    `\n};\n`,
);
const size = readdirSync(assets).length;
console.log(`${out.length} posts, ${size} images in assets/blog`);
