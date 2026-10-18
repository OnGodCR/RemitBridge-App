// Writes site/licenses.html: the open-source software, fonts and images RemitBridge uses,
// with each package's copyright line and each license's full text once (Angad's legal
// checklist, 2026-10-17). The packages are the app's shipped (non-dev) dependency tree, so
// rerun this after changing the app's dependencies, then build the site:
//
//   node site/licenses-page.mjs
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = dirname(fileURLToPath(import.meta.url));
const repo = join(site, '..');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Every package the app ships, from npm's own resolution, with where it is installed. */
function shippedPackages() {
  let out;
  try {
    out = execFileSync('npm', ['ls', '--omit=dev', '--all', '--long', '--json', '--workspace', 'mobile'], {
      cwd: repo,
      maxBuffer: 256 * 1024 * 1024,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch (e) {
    // npm exits non-zero for peer-version warnings (React's), but the tree it prints is whole.
    out = e.stdout;
    if (!out) throw e;
  }
  const found = new Map();
  const walk = (node) => {
    for (const [name, dep] of Object.entries(node.dependencies ?? {})) {
      if (!dep.version || !dep.path) continue;
      // Our own workspace packages are walked through, not listed.
      if (name.startsWith('@remitbridge/')) {
        walk(dep);
        continue;
      }
      const key = `${name}@${dep.version}`;
      if (found.has(key)) continue;
      found.set(key, { name, version: dep.version, path: dep.path });
      walk(dep);
    }
  };
  walk(JSON.parse(out));
  return [...found.values()].sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version));
}

function licenseOf(pkg) {
  const json = JSON.parse(readFileSync(join(pkg.path, 'package.json'), 'utf8'));
  if (typeof json.license === 'string') return json.license;
  if (json.license?.type) return json.license.type;
  if (Array.isArray(json.licenses)) return json.licenses.map((l) => l.type ?? l).join(' OR ');
  return 'See the package';
}

/** The package's license file, if it ships one. */
function licenseFile(pkg) {
  const name = readdirSync(pkg.path).find((f) => /^(licen[cs]e|copying)(\.(md|txt))?$/i.test(f));
  return name ? readFileSync(join(pkg.path, name), 'utf8') : '';
}

/** The copyright lines from a license file, which the notice requirements are about. */
function copyrightLines(text) {
  return [...new Set(text.split('\n').map((l) => l.trim()).filter((l) => /^(\(c\)|©|copyright\b)/i.test(l) && !/^copyright (notice|holders?|owner)/i.test(l)))].slice(0, 4);
}

// The standard text of each license, taken from the first package that carries it, with
// its own copyright lines removed so it reads as the license itself.
function licenseTexts(packages) {
  const texts = new Map();
  for (const p of packages) {
    if (texts.has(p.license) || !p.text) continue;
    const body = p.text
      .split('\n')
      .filter((l) => !/^\s*(\(c\)|©|copyright\b)/i.test(l.trim()) || /^copyright (notice|holders?|owner)/i.test(l.trim()))
      .join('\n')
      .trim();
    if (body.length > 200) texts.set(p.license, body);
  }
  return texts;
}

const packages = shippedPackages().map((p) => {
  const text = licenseFile(p);
  return { ...p, license: licenseOf(p), text, copyright: copyrightLines(text) };
});
const byLicense = new Map();
for (const p of packages) byLicense.set(p.license, [...(byLicense.get(p.license) ?? []), p]);
const order = [...byLicense.keys()].sort((a, b) => byLicense.get(b).length - byLicense.get(a).length);
const texts = licenseTexts(packages);
const ofl = readFileSync(join(site, 'fonts', 'OFL.txt'), 'utf8').split('\n').slice(2).join('\n').trim();

const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' });
const head = readFileSync(join(site, 'support.html'), 'utf8').split('<main class="wrap">')[0]
  .replace(/<title>[^<]*<\/title>/, '<title>Open-source licenses | RemitBridge</title>')
  .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="The open-source software, fonts and images in the RemitBridge app and this site.">');

const html = `${head}<main class="wrap">
<h1>Open-source licenses</h1>
<p class="muted">Last updated ${today}</p>
<p>RemitBridge is built on work that others share. This page lists the open-source software in the app, and the fonts and images in the app and on this site, with their licenses. Thank you to everyone who made them.</p>

<h2>Fonts</h2>
<ul>
<li><strong>Plus Jakarta Sans</strong>, copyright 2020 The Plus Jakarta Sans Project Authors (https://github.com/tokotype/PlusJakartaSans), under the SIL Open Font License 1.1.</li>
<li><strong>Hind</strong>, copyright 2014 Indian Type Foundry (info@indiantypefoundry.com), under the SIL Open Font License 1.1.</li>
</ul>

<h2>Images and icons</h2>
<ul>
<li>Country flags come from <a href="https://flagcdn.com">flagcdn.com</a>, in the public domain.</li>
<li>This site's feature icons are from <a href="https://lucide.dev">Lucide</a>, under the ISC License.</li>
<li>The app's own drawings, the bridge mark and the screenshots are RemitBridge Labs' own work.</li>
<li>Google's "G" and the Sign in with Apple button are used as Google's and Apple's sign-in guidelines allow; the marks belong to them.</li>
</ul>

<h2>Software from Google and Apple</h2>
<p>The app uses Google's ML Kit (to read receipt text on the phone), Google Sign-In and Firebase Cloud Messaging (for notifications on Android), and Apple's own frameworks, under Google's and Apple's terms for those kits.</p>

<h2>Open-source software in the app</h2>
<p>${packages.length} packages, grouped by license. Each license's full text follows the list.</p>
${order
  .map((license) => {
    const list = byLicense.get(license);
    const items = list
      .map((p) => `<li><strong>${esc(p.name)}</strong> ${esc(p.version)}${p.copyright.length ? `: ${esc(p.copyright.join('; '))}` : ''}</li>`)
      .join('\n');
    return `<h2>${esc(license)} (${list.length})</h2>\n<ul>\n${items}\n</ul>`;
  })
  .join('\n\n')}

<h2>License texts</h2>
${order
  .filter((l) => texts.has(l))
  .map((l) => `<h3>${esc(l)}</h3>\n<pre class="license">${esc(texts.get(l))}</pre>`)
  .join('\n')}
<h3>SIL Open Font License 1.1</h3>
<pre class="license">${esc(ofl)}</pre>
</main>
<!--FOOTER-->
</body>
</html>
`;

writeFileSync(join(site, 'licenses.html'), html);
console.log(`site/licenses.html: ${packages.length} packages, ${order.length} licenses, ${texts.size} texts`);
if (!existsSync(join(site, 'fonts', 'OFL.txt'))) throw new Error('site/fonts/OFL.txt is missing');
