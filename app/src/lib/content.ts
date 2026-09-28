// The content pack: pattern families of German sentences with English glosses.
import pack from '../../../content/de/pack.json';

export interface Sentence {
  id: string;
  /** German, with the one changing slot / new chunk in [brackets]. */
  de: string;
  en: string;
  /** Other accepted typed answers. */
  alt?: string[];
}

export interface Family {
  id: string;
  band: number;
  theme: string;
  /** "Ich hätte gern ___." — absent for formula families (greetings, repair phrases). */
  frame?: string;
  rule?: string;
  pair?: { a: string; b: string; note: string };
  sentences: Sentence[];
}

export interface ContentPack {
  language: string;
  glossLanguage: string;
  version: number;
  reviewStatus: string;
  families: Family[];
}

export interface Content {
  pack: ContentPack;
  families: Family[];
  familyById: Map<string, Family>;
  sentenceById: Map<string, Sentence>;
  familyOfSentence: Map<string, Family>;
  /** Position of every sentence on the 3,000-sentence path (1-based). */
  orderOf: Map<string, number>;
}

export function buildContent(pack: ContentPack): Content {
  const familyById = new Map<string, Family>();
  const sentenceById = new Map<string, Sentence>();
  const familyOfSentence = new Map<string, Family>();
  const orderOf = new Map<string, number>();
  let n = 0;
  for (const f of pack.families) {
    familyById.set(f.id, f);
    for (const s of f.sentences) {
      sentenceById.set(s.id, s);
      familyOfSentence.set(s.id, f);
      orderOf.set(s.id, ++n);
    }
  }
  return { pack, families: pack.families, familyById, sentenceById, familyOfSentence, orderOf };
}

export const germanContent: Content = buildContent(pack as ContentPack);

/** Two wrong English options for a 3-way meaning choice: same family first, then neighbouring families. */
export function distractors(content: Content, sentenceId: string, rand: () => number = Math.random): string[] {
  const s = content.sentenceById.get(sentenceId)!;
  const fam = content.familyOfSentence.get(sentenceId)!;
  const idx = content.families.indexOf(fam);
  const pool: string[] = [];
  const add = (list: Sentence[]) => {
    for (const o of shuffle(list.slice(), rand)) {
      if (o.id !== s.id && o.en !== s.en && !pool.includes(o.en)) pool.push(o.en);
    }
  };
  add(fam.sentences);
  for (let d = 1; pool.length < 2 && d < content.families.length; d++) {
    for (const j of [idx - d, idx + d]) if (content.families[j]) add(content.families[j].sentences);
  }
  return pool.slice(0, 2);
}

export function shuffle<T>(a: T[], rand: () => number = Math.random): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Small deterministic PRNG so a day's order is stable across reloads. */
export function seeded(seed: number): () => number {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13; x >>>= 0;
    x ^= x >> 17;
    x ^= x << 5; x >>>= 0;
    return x / 4294967296;
  };
}
