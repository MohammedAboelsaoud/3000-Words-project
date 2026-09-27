// Objective grading: typed and spoken answers become FSRS grades without trusting self-ratings.
// Thresholds follow the blueprint (section 5, "Grading turns answers into FSRS ratings").
import { fold, levenshtein, sameIgnoringCase, tokenize } from './text';

export type Grade = 'again' | 'hard' | 'good' | 'easy';
export type ErrorTag = 'lexical' | 'word order' | 'case or agreement' | 'mishearing' | 'spelling';
export type DiffStatus = 'ok' | 'wrong' | 'missing' | 'extra';

export interface DiffToken {
  text?: string;
  expected?: string;
  status: DiffStatus;
  /** A minor slip (capital letter, one letter, article ending): shown as a difference, graded Hard. */
  slip?: 'case' | 'spelling' | 'article';
}

export interface TypedResult {
  grade: Grade;
  tokens: DiffToken[];
  errorTag?: ErrorTag;
  /** Which accepted answer the attempt was compared with. */
  target: string;
}

const ARTICLE_STEMS = ['d', 'ein', 'kein', 'mein', 'dein', 'sein', 'ihr', 'unser', 'euer'];
const ARTICLES = new Set(['der', 'die', 'das', 'den', 'dem', 'des']);

function articleStem(t: string): string | null {
  const f = fold(t);
  if (ARTICLES.has(f)) return 'd';
  for (const stem of ARTICLE_STEMS.slice(1)) {
    if (f === stem || (f.startsWith(stem) && /^(e|en|em|er|es)$/.test(f.slice(stem.length)))) return stem;
  }
  return null;
}

/** Umlaut-tolerant, case-sensitive equality: "muede" matches "müde"; "Müde" does not. */
function exact(a: string, b: string): boolean {
  const k = (s: string) => s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue').replace(/ß/g, 'ss').replace(/’/g, "'");
  return k(a) === k(b);
}

function slipKind(answer: string, target: string): DiffToken['slip'] | null {
  if (sameIgnoringCase(answer, target)) return 'case';
  const sa = articleStem(answer);
  if (sa && sa === articleStem(target)) return 'article';
  const fa = fold(answer);
  const ft = fold(target);
  if (ft.length >= 4 && levenshtein(fa, ft) === 1) return 'spelling';
  return null;
}

interface Op { a?: string; t?: string; kind: 'eq' | 'slip' | 'sub' | 'ins' | 'del'; slip?: DiffToken['slip'] }

/** Token-level alignment (weighted edit distance) of an answer against a target. */
export function align(answer: string[], target: string[], sub: (a: string, t: string) => { cost: number; op: Op }): Op[] {
  const n = answer.length;
  const m = target.length;
  const d: number[][] = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + sub(answer[i - 1], target[j - 1]).cost);
    }
  }
  const ops: Op[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const s = sub(answer[i - 1], target[j - 1]);
      if (d[i][j] === d[i - 1][j - 1] + s.cost) {
        ops.push(s.op);
        i--; j--;
        continue;
      }
    }
    if (j > 0 && d[i][j] === d[i][j - 1] + 1) {
      ops.push({ t: target[j - 1], kind: 'del' });
      j--;
    } else {
      ops.push({ a: answer[i - 1], kind: 'ins' });
      i--;
    }
  }
  return ops.reverse();
}

function typedSub(a: string, t: string): { cost: number; op: Op } {
  if (exact(a, t)) return { cost: 0, op: { a, t, kind: 'eq' } };
  const slip = slipKind(a, t);
  if (slip) return { cost: 0.4, op: { a, t, kind: 'slip', slip } };
  return { cost: 1.2, op: { a, t, kind: 'sub' } };
}

function sortedFold(tokens: string[]): string {
  return tokens.map(fold).sort().join(' ');
}

function gradeOne(answer: string, target: string, mode: 'typed' | 'dictation'): TypedResult & { score: number } {
  const at = tokenize(answer);
  const tt = tokenize(target);
  const ops = align(at, tt, typedSub);
  const tokens: DiffToken[] = ops.map((op) => {
    switch (op.kind) {
      case 'eq': return { text: op.t, status: 'ok' };
      case 'slip': return { text: op.a, expected: op.t, status: 'wrong', slip: op.slip };
      case 'sub': return { text: op.a, expected: op.t, status: 'wrong' };
      case 'del': return { expected: op.t, status: 'missing' };
      default: return { text: op.a, status: 'extra' };
    }
  });
  const slips = ops.filter((o) => o.kind === 'slip');
  const errors = ops.filter((o) => o.kind === 'sub' || o.kind === 'del' || o.kind === 'ins').length;

  let grade: Grade;
  let errorTag: ErrorTag | undefined;
  if (errors === 0 && slips.length === 0) grade = 'good';
  else if (errors === 0 && slips.length === 1) grade = 'hard';
  else grade = 'again';

  if (errors > 0 && at.length === tt.length && sortedFold(at) === sortedFold(tt)) errorTag = 'word order';
  else if (errors > 0) errorTag = mode === 'dictation' ? 'mishearing' : 'lexical';
  else if (slips.some((s) => s.slip === 'article')) errorTag = 'case or agreement';
  else if (slips.length) errorTag = 'spelling';

  return { grade, tokens, errorTag, target, score: errors * 10 + slips.length };
}

/** Grade a typed answer (production, cloze or dictation) against the target and its accepted alternatives. */
export function gradeTyped(answer: string, targets: string[], mode: 'typed' | 'dictation' = 'typed'): TypedResult {
  if (!answer.trim()) {
    const target = targets[0];
    return { grade: 'again', tokens: tokenize(target).map((t) => ({ expected: t, status: 'missing' })), errorTag: 'lexical', target };
  }
  const results = targets.map((t) => gradeOne(answer, t, mode));
  results.sort((x, y) => x.score - y.score);
  const { score: _score, ...best } = results[0];
  return best;
}

export interface SpokenWord { text: string; flag?: 'mispronounced' | 'omitted' }
export interface SpokenResult { grade: Grade; words: SpokenWord[]; errors: number }

/** Speech-recognition fallback: word error count between transcript and target. 0 → Good, 1 → Hard, ≥2 → Again. */
export function gradeSpoken(transcript: string, targets: string[]): SpokenResult {
  const at = tokenize(transcript);
  let best: SpokenResult | null = null;
  for (const target of targets) {
    const tt = tokenize(target);
    const ops = align(at, tt, (a, t) => (fold(a) === fold(t) ? { cost: 0, op: { a, t, kind: 'eq' } } : { cost: 1, op: { a, t, kind: 'sub' } }));
    const words: SpokenWord[] = [];
    let errors = 0;
    for (const op of ops) {
      if (op.kind === 'eq') words.push({ text: op.t! });
      else if (op.kind === 'sub') { words.push({ text: op.t!, flag: 'mispronounced' }); errors++; }
      else if (op.kind === 'del') { words.push({ text: op.t!, flag: 'omitted' }); errors++; }
      else errors++;
    }
    const grade: Grade = errors === 0 ? 'good' : errors === 1 ? 'hard' : 'again';
    if (!best || errors < best.errors) best = { grade, words, errors };
  }
  return best!;
}
