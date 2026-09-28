// Validates a content pack: ids, one slot per sentence, family sizes, lengths, pairs.
// Usage: node scripts/check-content.mjs [path/to/pack.json] [--freq path/to/de_50k.txt]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const freqAt = args.indexOf('--freq');
const freqPath = freqAt >= 0 ? args[freqAt + 1] : null;
const packPath = args.find((a, i) => !a.startsWith('--') && i !== freqAt + 1) ?? path.join(here, '../../content/de/pack.json');
const pack = JSON.parse(fs.readFileSync(packPath, 'utf8'));

const errors = [];
const warnings = [];
const ids = new Set();
const slotCount = (s) => (s.match(/\[[^\]]+\]/g) || []).length;
const words = (s) => s.replace(/[[\]]/g, '').split(/\s+/).filter(Boolean);

for (const f of pack.families) {
  if (ids.has(f.id)) errors.push(`${f.id}: duplicate family id`);
  ids.add(f.id);
  const n = f.sentences.length;
  if (n < 3 || n > 5) errors.push(`${f.id}: family has ${n} sentences (want 3–5)`);
  if (f.pair) for (const k of ["a", "b"]) if (slotCount(f.pair[k]) > 2) errors.push(`${f.id}: pair.${k} has more than two highlighted parts`);
  if (f.rule && !f.frame) warnings.push(`${f.id}: rule without a frame`);
  for (const s of f.sentences) {
    if (ids.has(s.id)) errors.push(`${s.id}: duplicate sentence id`);
    ids.add(s.id);
    if (slotCount(s.de) < 1 || slotCount(s.de) > 2) errors.push(`${s.id}: needs one [slot], two parts at most — "${s.de}"`);
    const w = words(s.de).length;
    if (w > 12) errors.push(`${s.id}: ${w} words (max 12)`);
    if (!s.en) errors.push(`${s.id}: missing English gloss`);
    for (const a of s.alt ?? []) if (/[[\]]/.test(a)) errors.push(`${s.id}: alt answers must not contain brackets`);
  }
}

const total = pack.families.reduce((n, f) => n + f.sentences.length, 0);
console.log(`${path.basename(packPath)}: ${pack.families.length} families, ${total} sentences`);

if (freqPath) {
  // Frequency statistics only (the list is CC BY-SA; it is never shipped with the app).
  const rank = new Map();
  fs.readFileSync(freqPath, 'utf8').split('\n').forEach((line, i) => {
    const w = line.split(' ')[0];
    if (w && !rank.has(w)) rank.set(w, i + 1);
  });
  const seen = new Set();
  const rows = [];
  for (const f of pack.families) for (const s of f.sentences) {
    const slot = s.de.match(/\[([^\]]+)\]/)?.[1] ?? '';
    const toks = slot.toLowerCase().replace(/[^\p{L}\s'-]/gu, ' ').split(/\s+/).filter(Boolean);
    const unseen = toks.filter((t) => !seen.has(t));
    words(s.de).forEach((t) => seen.add(t.toLowerCase().replace(/[^\p{L}'-]/gu, '')));
    const worst = Math.max(0, ...toks.map((t) => rank.get(t) ?? 99999));
    rows.push(worst);
    if (worst > 10000) warnings.push(`${s.id}: slot "${slot}" is rare (rank ${worst === 99999 ? '>50k' : worst})`);
    if (unseen.length === 0) warnings.push(`${s.id}: slot "${slot}" introduces nothing new`);
  }
  rows.sort((a, b) => a - b);
  console.log(`slot frequency rank: median ${rows[rows.length >> 1]}, 90th pct ${rows[Math.floor(rows.length * 0.9)]}`);
}

for (const w of warnings) console.log('warn  ' + w);
for (const e of errors) console.log('error ' + e);
if (errors.length) process.exit(1);
