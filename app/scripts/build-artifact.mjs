// Builds the app as one self-contained HTML page for hosting as a claude.ai artifact:
// app JS and CSS inlined, fonts from Google Fonts, no microphone or service worker.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'dist-artifact');
execSync('node scripts/tokens-css.mjs', { cwd: root, stdio: 'inherit' });
execSync(`npx vite build --base ./ --outDir ${outDir} --emptyOutDir`, {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, VITE_ARTIFACT: '1' },
});

const assets = path.join(outDir, 'assets');
const files = fs.readdirSync(assets);
const js = files.filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(path.join(assets, f), 'utf8')).join('\n');
let css = files.filter((f) => f.endsWith('.css')).map((f) => fs.readFileSync(path.join(assets, f), 'utf8')).join('\n');

// The font stylesheet becomes a <link>; everything else is inlined.
const fontImport = /@import\s*(?:url\()?(["'])(https:\/\/fonts\.googleapis\.com.*?)\1\)?;?/g;
const imports = [...css.matchAll(fontImport)];
css = css.replace(fontImport, '');
const fontLinks = imports.map((m) => `<link rel="stylesheet" href="${m[2].replace(/&/g, '&amp;')}">`).join('\n');
const safe = (s, tag) => s.replace(new RegExp(`</${tag}`, 'gi'), `<\\/${tag}`);

const html = `<title>Satz German</title>
<meta name="description" content="Learn the 3,000 most useful German sentences through recall, spacing and comparison.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fontLinks}
<style>${safe(css, 'style')}</style>
<div id="root"></div>
<script type="module">${safe(js, 'script')}</script>
`;
const out = path.join(root, 'dist-artifact', 'satz.html');
fs.writeFileSync(out, html);
console.log(`wrote ${path.relative(root, out)} (${(html.length / 1024).toFixed(0)} KB)`);
