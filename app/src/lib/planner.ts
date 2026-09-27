// The planner: turns a minutes budget into today's session (blueprint section 5, "Workload math"
// and "Backlog rules"). Pure — every input is passed in, so it is easy to test.
import type { FSRS } from 'ts-fsrs';
import type { Family } from './content';
import { seeded, shuffle } from './content';
import { retrievability, type Trace } from './scheduler';

export const DEFAULT_SEC_PER_REVIEW = 9;
export const MIN_PER_NEW_SENTENCE = 1.5;
/** Each new sentence per day costs ≈ 4.5 min/day at steady state (1.5 today + ≈3 of future reviews). */
export const STEADY_MIN_PER_NEW_PER_DAY = 4.5;
export const RECOVERY_CAP = 1.5;

export interface PlanInput {
  now: Date;
  budgetMin: number;
  traces: Trace[];
  /** All families in path order. */
  families: Family[];
  introducedFamilies: Set<string>;
  secPerReview: number;
  /** New-sentence credit available today (already includes today's accrual). */
  newCredit: number;
  f: FSRS;
}

export interface Plan {
  mode: 'normal' | 'recovery';
  /** Trace ids to review today, in order. */
  reviewIds: string[];
  newFamilyIds: string[];
  newSentences: number;
  /** Credit left after today's new families. */
  newCreditAfter: number;
  /** Planned session length in minutes. */
  estMin: number;
  /** Minutes of reviews due today (before any recovery cap). */
  dueMin: number;
  /** Recovery mode: days until the backlog is cleared. */
  backOnTrackDays?: number;
}

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** New sentences a day the budget can carry at steady state (30 min → ≈ 6.7). */
export function dailyNewCap(budgetMin: number): number {
  return budgetMin / STEADY_MIN_PER_NEW_PER_DAY;
}

/** Due traces for the day, keeping only one trace per sentence (siblings never share a day). */
export function dueToday(traces: Trace[], now: Date, f: FSRS): Trace[] {
  const end = addDays(startOfDay(now), 1);
  const bySentence = new Map<string, Trace>();
  for (const t of traces) {
    if (t.card.due >= end) continue;
    const other = bySentence.get(t.sentenceId);
    if (!other || retrievability(f, t, now) < retrievability(f, other, now)) bySentence.set(t.sentenceId, t);
  }
  return [...bySentence.values()];
}

export function plan(input: PlanInput): Plan {
  const { now, budgetMin, traces, families, introducedFamilies, secPerReview, newCredit, f } = input;
  const due = dueToday(traces, now, f);
  const perReviewMin = secPerReview / 60;
  const dueMin = due.length * perReviewMin;

  if (dueMin > budgetMin) {
    // Recovery: rescue the most-forgotten first, cap the day, pause new sentences.
    const ordered = due.slice().sort((a, b) => retrievability(f, a, now) - retrievability(f, b, now));
    const cap = Math.floor((RECOVERY_CAP * budgetMin) / perReviewMin);
    const reviewIds = ordered.slice(0, cap).map((t) => t.id);
    const overflow = dueMin - RECOVERY_CAP * budgetMin;
    return {
      mode: 'recovery',
      reviewIds,
      newFamilyIds: [],
      newSentences: 0,
      newCreditAfter: newCredit,
      estMin: Math.ceil(reviewIds.length * perReviewMin),
      dueMin,
      backOnTrackDays: 1 + Math.max(0, Math.ceil(overflow / (0.5 * budgetMin))),
    };
  }

  // Normal day: reviews in a shuffled order (a fixed order makes answers guessable from context).
  const reviewIds = shuffle(due.map((t) => t.id), seeded(Number(dayKey(now).replace(/-/g, ''))));

  // Forecast the coming week's review load so today's new sentences don't create a pile-up.
  const start = addDays(startOfDay(now), 1);
  let upcoming = 0;
  for (const t of traces) if (t.card.due >= start && t.card.due < addDays(start, 7)) upcoming++;
  const forecastMin = Math.max(dueMin, (upcoming / 7) * perReviewMin);
  const roomForNew = Math.max(0, (budgetMin - forecastMin) / MIN_PER_NEW_SENTENCE);
  const available = Math.min(newCredit, roomForNew);

  const newFamilyIds: string[] = [];
  let used = 0;
  for (const fam of families) {
    if (introducedFamilies.has(fam.id)) continue;
    if (used + fam.sentences.length > available) break;
    newFamilyIds.push(fam.id);
    used += fam.sentences.length;
  }
  const compareMin = newFamilyIds.length; // ≈ 1 min per family for the compare step
  return {
    mode: 'normal',
    reviewIds,
    newFamilyIds,
    newSentences: used,
    newCreditAfter: newCredit - used,
    estMin: Math.max(1, Math.ceil(dueMin + used * MIN_PER_NEW_SENTENCE + compareMin)),
    dueMin,
  };
}

/** Accrue one day's new-sentence credit (capped at two days' worth), scaled by the post-recovery ramp. */
export function accrueCredit(credit: number, budgetMin: number, ramp = 1): number {
  const cap = dailyNewCap(budgetMin);
  return Math.min(credit + cap * ramp, 2 * cap);
}

/** After recovery, new sentences ramp back 25% → 50% → 75% → 100% over the following days. */
export function rampFactor(daysSinceRecovery: number | null): number {
  if (daysSinceRecovery == null) return 1;
  return Math.min(1, 0.25 * (daysSinceRecovery + 1));
}

/** Median answer time of recent reviews, clamped to a sane range. */
export function measuredSecPerReview(durationsMs: number[]): number {
  const xs = durationsMs.filter((d) => d > 0 && d < 5 * 60_000).slice(-200).sort((a, b) => a - b);
  if (xs.length < 20) return DEFAULT_SEC_PER_REVIEW;
  const med = xs[xs.length >> 1] / 1000;
  return Math.min(30, Math.max(5, med));
}
