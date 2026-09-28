import { describe, expect, it } from 'vitest';
import { germanContent } from '../content';

const fam0 = germanContent.families[0];
const [s1, s2, s3] = fam0.sentences.map((x) => x.id);
import { makeScheduler, newTrace, review, type Trace } from '../scheduler';
import { buildQueue, formatFor, pickNext, sharedWords } from '../session';

const f = makeScheduler();

describe('session queue', () => {
  it('orders reviews first, then intros and the compare step', () => {
    const q = buildQueue({ mode: 'normal', reviewIds: ['x:c'], newFamilyIds: [fam0.id], newSentences: 3, newCreditAfter: 0, estMin: 5, dueMin: 0 }, germanContent, new Map(), []);
    expect(q.map((t) => t.type)).toEqual(['review', 'intro', 'intro', 'intro', 'compare']);
  });
  it('re-queues unfinished intros of a started family', () => {
    const traces = new Map<string, Trace>();
    const t = newTrace(s1, 'comprehension', new Date());
    traces.set(t.id, t);
    const q = buildQueue({ mode: 'normal', reviewIds: [], newFamilyIds: [], newSentences: 0, newCreditAfter: 0, estMin: 0, dueMin: 0 }, germanContent, traces, [fam0.id]);
    expect(q.map((x) => (x.type === 'intro' ? x.sentenceId : x.type))).toEqual([s2, s3]);
  });
  it('shows a learning recall once it is due, and learns ahead at the end', () => {
    const now = new Date(2026, 0, 1, 9);
    const intro = review(f, newTrace(s1, 'comprehension', now), 'again', now, { durationMs: 1, format: 'intro' }).trace;
    const traces = new Map([[intro.id, intro]]);
    const queue = [{ type: 'intro' as const, sentenceId: s2, familyId: fam0.id }];
    expect(pickNext(queue, [intro.id], traces, now)!.task.type).toBe('intro');
    const later = new Date(now.getTime() + 61_000);
    expect(pickNext(queue, [intro.id], traces, later)!.task).toEqual({ type: 'review', traceId: intro.id });
    expect(pickNext([], [intro.id], traces, now)!.task).toEqual({ type: 'review', traceId: intro.id });
  });
  it('rotates formats', () => {
    const t = newTrace('s', 'comprehension', new Date());
    expect(formatFor({ ...t, card: { ...t.card, reps: 1 } }, true)).toBe('choice');
    expect(formatFor({ ...t, card: { ...t.card, reps: 2 } }, true)).toBe('dictation');
    const p = newTrace('s', 'production', new Date());
    expect(formatFor({ ...p, card: { ...p.card, reps: 2 } }, true)).toBe('say');
    expect(formatFor({ ...p, card: { ...p.card, reps: 2 } }, false)).toBe('type');
  });
  it('finds the shared frame words', () => {
    expect(sharedWords(['Ich hätte gern [einen Kaffee].', 'Ich hätte gern [ein Wasser].'])).toEqual(['Ich', 'hätte', 'gern']);
    expect(sharedWords(['Ich [bin] müde.', 'Ich bin [Student].', 'Ich bin [hier].'])).toEqual(['Ich', 'bin']);
  });
});

describe('scheduler', () => {
  it('uses 1 min and 10 min learning steps, then graduates to days', () => {
    const now = new Date(2026, 0, 1, 9);
    let t = review(f, newTrace('s', 'comprehension', now), 'again', now, { durationMs: 1, format: 'intro' }).trace;
    expect((t.card.due.getTime() - now.getTime()) / 60_000).toBeCloseTo(1, 0);
    const t1 = new Date(now.getTime() + 60_000);
    t = review(f, t, 'good', t1, { durationMs: 1, format: 'choice' }).trace;
    expect((t.card.due.getTime() - t1.getTime()) / 60_000).toBeCloseTo(10, 0);
    const t2 = new Date(t1.getTime() + 600_000);
    t = review(f, t, 'good', t2, { durationMs: 1, format: 'dictation' }).trace;
    expect(t.card.due.getTime() - t2.getTime()).toBeGreaterThan(20 * 3600_000);
  });
});
