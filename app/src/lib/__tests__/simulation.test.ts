// Simulates a learner on a 30-minute budget to check the workload maths holds over months.
import { describe, expect, it } from 'vitest';
import { germanContent, seeded } from '../content';
import { accrueCredit, addDays, plan } from '../planner';
import { makeScheduler, newTrace, review, retrievability, State, type Trace } from '../scheduler';

describe('30 minutes a day for 90 days', () => {
  it('stays within budget and introduces about 6–7 sentences a day', () => {
    const f = makeScheduler(0.9);
    const rand = seeded(42);
    const traces = new Map<string, Trace>();
    const introduced = new Set<string>();
    let credit = 0;
    const est: number[] = [];
    // Repeat the pack so the simulation doesn't run out of content.
    const families = [0, 1, 2, 3, 4].flatMap((k) => germanContent.families.map((fam) => ({ ...fam, id: `${fam.id}-${k}`, sentences: fam.sentences.map((s) => ({ ...s, id: `${s.id}-${k}` })) })));
    let day = new Date(2026, 0, 1, 9);
    for (let d = 0; d < 90; d++, day = addDays(day, 1)) {
      credit = accrueCredit(credit, 30);
      const p = plan({ now: day, budgetMin: 30, traces: [...traces.values()], families, introducedFamilies: introduced, secPerReview: 9, newCredit: credit, f });
      est.push(p.estMin);
      credit = p.newCreditAfter;
      let t = day;
      for (const id of p.reviewIds) {
        const tr = traces.get(id)!;
        const pass = rand() < Math.max(0.5, retrievability(f, tr, t));
        const r = review(f, tr, pass ? 'good' : 'again', t, { durationMs: 9000, format: 'choice' });
        traces.set(id, r.trace);
        t = new Date(t.getTime() + 9000);
        if (tr.kind === 'comprehension' && r.trace.card.state === State.Review && r.trace.card.stability >= 7 && !traces.has(`${tr.sentenceId}:p`)) {
          traces.set(`${tr.sentenceId}:p`, newTrace(tr.sentenceId, 'production', t, addDays(new Date(day.getFullYear(), day.getMonth(), day.getDate()), 1)));
        }
      }
      for (const fid of p.newFamilyIds) {
        introduced.add(fid);
        for (const s of families.find((x) => x.id === fid)!.sentences) {
          let tr = review(f, newTrace(s.id, 'comprehension', t), 'again', t, { durationMs: 60000, format: 'intro' }).trace;
          tr = review(f, tr, 'good', new Date(t.getTime() + 60_000), { durationMs: 9000, format: 'choice' }).trace;
          tr = review(f, tr, 'good', new Date(t.getTime() + 660_000), { durationMs: 9000, format: 'dictation' }).trace;
          traces.set(tr.id, tr);
        }
      }
    }
    const sentences = [...traces.values()].filter((t) => t.kind === 'comprehension').length;
    const perDay = sentences / 90;
    const over = est.filter((m) => m > 30).length;
    console.log(`90 days: ${sentences} sentences (${perDay.toFixed(1)}/day); session minutes min ${Math.min(...est)}, median ${est.slice().sort((a, b) => a - b)[45]}, max ${Math.max(...est)}; days over budget: ${over}`);
    expect(perDay).toBeGreaterThan(4.5);
    expect(perDay).toBeLessThan(7.5);
    expect(over).toBeLessThanOrEqual(3);
  });
});
