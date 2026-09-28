// Sentence text helpers. Content marks the one changing slot / new chunk with [brackets].

export function stripSlots(s: string): string {
  return s.replace(/[[\]]/g, '');
}

/** The slot text. A split item (Ich [stehe] … [auf]) gives both parts: "stehe auf". */
export function slotOf(s: string): string {
  return [...s.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]).join(' ');
}

/** "Ich hätte gern [die Rechnung]." → "Ich hätte gern ___." (every part of a split slot is blanked) */
export function blankSlot(s: string): string {
  return s.replace(/\[[^\]]+\]/g, '___');
}

/** Split into word tokens, dropping sentence punctuation but keeping inner ' and - (geht's, U-Bahn). */
export function tokenize(s: string): string[] {
  return stripSlots(s)
    .split(/\s+/)
    .map((t) => t.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
    .filter(Boolean);
}

const NUMBERS: Record<string, string> = {
  '0': 'null', '1': 'eins', '2': 'zwei', '3': 'drei', '4': 'vier', '5': 'fünf', '6': 'sechs', '7': 'sieben',
  '8': 'acht', '9': 'neun', '10': 'zehn', '11': 'elf', '12': 'zwölf', '20': 'zwanzig', '30': 'dreißig',
};

/** Case-insensitive, umlaut-tolerant form: ä→ae, ö→oe, ü→ue, ß→ss, and digits spelled out. */
export function fold(token: string): string {
  const t = NUMBERS[token] ?? token;
  return t
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');
}

/** The same token apart from letter case (and umlaut spelling). */
export function sameIgnoringCase(a: string, b: string): boolean {
  return fold(a) === fold(b);
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}
