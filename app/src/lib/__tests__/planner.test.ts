import { describe, expect, it } from 'vitest';
import { germanContent } from '../content';
import { accrueCredit, addDays, dailyNewCap, dueToday, plan, rampFactor } from '../planner';
import { makeScheduler, newTrace, review } from '../scheduler';

const f = makeScheduler(0.9);
const now = new Date(2026, 8, 28, 9, 0);
const base = { now, budgetMin: 30, families: germanContent.families, introducedFamilies: new Set<string>(), secPerReview: 9, f };

describe('plan', () => {
  it('30 min allows about 6–7 new sentences a day at steady state', () => {
    expect(dailyNewCap(30)).toBeCloseTo(6.67, 1);
  });
  it('first day introduces whole families within the credit', () => {
    const p = plan({ ...base, traces: [], newCredit: accrueCredit(0, 30) });
    expect(p.mode).toBe('normal');
    expect(p.newSentences).toBeGreaterThanOrEqual(3);
    expect(p.newSentences).toBeLessThanOrEqual(6.67);
    expect(p.newFamilyIds[0]).toBe(germanContent.families[0].id);
  });
  it('credit carries over and is capped at two days', () => {
    expect(accrueCredit(3.67, 30)).toBeCloseTo(10.33, 1);
    expect(accrueCredit(100, 30)).toBeCloseTo(13.33, 1);
  });
  it('switches to recovery when due reviews exceed the budget, pausing new sentences', () => {
    const traces = Array.from({ length: 400 }, (_, i) => {
      let t = newTrace(`s${i}`, 'comprehension', addDays(now, -40));
      t = review(f, t, 'good', addDays(now, -40), { durationMs: 1, format: 'choice' }).trace;
      t = review(f, t, 'good', addDays(now, -40), { durationMs: 1, format: 'choice' }).trace;
      return t;
    });
    const p = plan({ ...base, traces, newCredit: 10 });
    expect(p.mode).toBe('recovery');
    expect(p.newFamilyIds).toEqual([]);
    expect(p.reviewIds.length).toBe(Math.floor((1.5 * 30 * 60) / 9));
    expect(p.backOnTrackDays).toBeGreaterThan(1);
  });
  it('never schedules both traces of one sentence on the same day', () => {
    const c = newTrace('s1', 'comprehension', addDays(now, -1));
    const p2 = newTrace('s1', 'production', addDays(now, -1));
    expect(dueToday([c, p2], now, f)).toHaveLength(1);
  });
  it('ramps new sentences back after recovery', () => {
    expect(rampFactor(0)).toBe(0.25);
    expect(rampFactor(3)).toBe(1);
    expect(rampFactor(null)).toBe(1);
  });
});
