// Compiles content/de/src/*.txt (a plain-text format for writers and reviewers) into
// content/de/pack.json, which the app loads. Files are read in name order; that order is
// the learning path.
//
// Format:
//   ## band 2                         sets the band for the families that follow
//   # theme | frame | rule            starts a family (frame and rule may be "-")
//   = A sentence || B sentence || note   optional one-change pair
//   German with one [slot]. | English gloss | other accepted answer | …
//   // comment lines and blank lines are ignored
//
// Ids are hashes of the text, so reordering never changes them; editing a sentence
// makes it a new sentence.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(here, '../../content/de/src');
const out = path.join(here, '../../content/de/pack.json');

const hash = (s) => crypto.createHash('sha1').update(s.normalize('NFC')).digest('hex').slice(0, 10);
const norm = (s) => s.replace(/[[\]]/g, '').replace(/\s+/g, ' ').trim();

const errors = [];
const families = [];
let band = 1;
let fam = null;

for (const file of fs.readdirSync(srcDir).filter((f) => f.endsWith('.txt')).sort()) {
  const lines = fs.readFileSync(path.join(srcDir, file), 'utf8').split('\n');
  lines.forEach((raw, i) => {
    const line = raw.trim();
    const where = `${file}:${i + 1}`;
    if (!line || line.startsWith('//')) return;
    if (line.startsWith('## band')) {
      band = Number(line.slice(7).trim());
      return;
    }
    if (line.startsWith('# ')) {
      const [theme, frame, rule] = line.slice(2).split('|').map((x) => x.trim());
      fam = { band, theme, frame: frame && frame !== '-' ? frame : undefined, rule: rule && rule !== '-' ? rule : undefined, sentences: [], where };
      families.push(fam);
      return;
    }
    if (!fam) return errors.push(`${where}: sentence before any family`);
    if (line.startsWith('= ')) {
      const [a, b, note] = line.slice(2).split('||').map((x) => x.trim());
      if (!a || !b || !note) errors.push(`${where}: a pair needs "A || B || note"`);
      fam.pair = { a, b, note };
      return;
    }
    const [de, en, ...alt] = line.split('|').map((x) => x.trim());
    if (!de || !en) return errors.push(`${where}: needs "German | English"`);
    fam.sentences.push({ de, en, ...(alt.length ? { alt } : {}), where });
  });
}

const seen = new Map();
const packFamilies = families.map((f) => {
  const sentences = f.sentences.map((s) => {
    const key = norm(s.de).toLowerCase();
    if (seen.has(key)) errors.push(`${s.where}: duplicate of ${seen.get(key)} — "${norm(s.de)}"`);
    seen.set(key, s.where);
    const { where: _w, ...rest } = s;
    return { id: 'de-' + hash(norm(s.de)), ...rest };
  });
  const { where: _w, ...rest } = f;
  return { id: 'f-' + hash(f.sentences.map((s) => norm(s.de)).join('|')), ...rest, sentences };
});

if (errors.length) {
  for (const e of errors) console.error('error ' + e);
  process.exit(1);
}

const pack = {
  language: 'de',
  glossLanguage: 'en',
  version: 2,
  reviewStatus: 'draft — needs native-speaker review',
  families: packFamilies,
};
fs.writeFileSync(out, JSON.stringify(pack, null, 1) + '\n');
const total = packFamilies.reduce((n, f) => n + f.sentences.length, 0);
const byBand = {};
for (const f of packFamilies) byBand[f.band] = (byBand[f.band] ?? 0) + f.sentences.length;
console.log(`wrote content/de/pack.json: ${packFamilies.length} families, ${total} sentences`, byBand);
