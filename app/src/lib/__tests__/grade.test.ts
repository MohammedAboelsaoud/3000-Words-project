import { describe, expect, it } from 'vitest';
import { gradeSpoken, gradeTyped } from '../grade';

describe('gradeTyped', () => {
  it('accepts an exact answer as Good', () => {
    expect(gradeTyped('Ich hätte gern die Rechnung.', ['Ich hätte gern die Rechnung.']).grade).toBe('good');
  });
  it('ignores punctuation and accepts ae/oe/ue/ss', () => {
    expect(gradeTyped('Ich haette gern die Rechnung', ['Ich hätte gern die Rechnung.']).grade).toBe('good');
    expect(gradeTyped('Tschuess', ['Tschüss!']).grade).toBe('good');
  });
  it('treats one capitalisation slip as Hard (spelling)', () => {
    const r = gradeTyped('Ich hätte gern die rechnung.', ['Ich hätte gern die Rechnung.']);
    expect(r.grade).toBe('hard');
    expect(r.errorTag).toBe('spelling');
  });
  it('treats a wrong article ending as Hard (case or agreement)', () => {
    const r = gradeTyped('Ich suche der Bahnhof.', ['Ich suche den Bahnhof.']);
    expect(r.grade).toBe('hard');
    expect(r.errorTag).toBe('case or agreement');
  });
  it('treats a missing word as Again', () => {
    const r = gradeTyped('Hast du heute Zeit?', ['Hast du heute Abend Zeit?'], 'dictation');
    expect(r.grade).toBe('again');
    expect(r.errorTag).toBe('mishearing');
    expect(r.tokens.find((t) => t.status === 'missing')?.expected).toBe('Abend');
  });
  it('flags word order', () => {
    const r = gradeTyped('Ich möchte trinken einen Kaffee.', ['Ich möchte einen Kaffee trinken.']);
    expect(r.grade).toBe('again');
    expect(r.errorTag).toBe('word order');
  });
  it('treats two slips as Again', () => {
    expect(gradeTyped('ich hätte gern die rechnung', ['Ich hätte gern die Rechnung.']).grade).toBe('again');
  });
  it('uses accepted alternatives', () => {
    expect(gradeTyped('Ich hätte gerne einen Kaffee', ['Ich hätte gern einen Kaffee.', 'Ich hätte gerne einen Kaffee.']).grade).toBe('good');
  });
  it('treats an empty answer as Again', () => {
    expect(gradeTyped('  ', ['Ja.']).grade).toBe('again');
  });
});

describe('gradeSpoken', () => {
  it('ignores case and digits vs words', () => {
    expect(gradeSpoken('das kostet 2 euro', ['Das kostet zwei Euro.']).grade).toBe('good');
  });
  it('one wrong word is Hard and flagged', () => {
    const r = gradeSpoken('Ich hatte gern die Rechnung', ['Ich hätte gern die Rechnung.']);
    expect(r.grade).toBe('hard');
    expect(r.words.find((w) => w.flag)?.text).toBe('hätte');
  });
  it('an omitted word counts', () => {
    const r = gradeSpoken('Ich hätte gern', ['Ich hätte gern die Rechnung.']);
    expect(r.grade).toBe('again');
    expect(r.words.filter((w) => w.flag === 'omitted').map((w) => w.text)).toEqual(['die', 'Rechnung']);
  });
});

describe('split slots', async () => {
  const { slotOf, blankSlot } = await import('../text');
  it('joins and blanks both parts of a separable verb', () => {
    expect(slotOf('Ich [stehe] um sieben Uhr [auf].')).toBe('stehe auf');
    expect(blankSlot('Ich [stehe] um sieben Uhr [auf].')).toBe('Ich ___ um sieben Uhr ___.');
    expect(gradeTyped('stehe auf', [slotOf('Ich [stehe] um sieben Uhr [auf].')]).grade).toBe('good');
  });
});
