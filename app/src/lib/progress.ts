// Streaks, retention and checkpoints (blueprint sections 4 and 9).
import { addDays, dayKey, startOfDay } from './planner';
import type { ReviewLog } from './scheduler';
import { State } from './scheduler';

export type DayState = 'done' | 'frozen' | 'missed' | 'today' | 'future';

export interface DayRecord {
  /** Milliseconds practised. */
  ms: number;
  /** All of the day's planned reviews were finished. */
  completed: boolean;
}

/** The minimum viable day: 5 minutes, or everything that was due. */
export const MIN_DAY_MS = 5 * 60_000;
export const MAX_FREEZES = 2;

export function counts(r: DayRecord | undefined): boolean {
  return !!r && (r.ms >= MIN_DAY_MS || r.completed);
}

export interface Streak {
  days: number;
  freezes: number;
  /** Monday → Sunday of the current week. */
  week: DayState[];
}

/**
 * Walks the calendar from the first practised day. A missed day spends a freeze if one is left
 * (freezes are free; one is earned back after 7 practised days, up to 2); otherwise the streak restarts.
 */
export function streak(days: Record<string, DayRecord>, now: Date): Streak {
  const keys = Object.keys(days).filter((k) => counts(days[k])).sort();
  const today = startOfDay(now);
  const state = new Map<string, DayState>();
  let run = 0;
  let freezes = MAX_FREEZES;
  let sinceEarn = 0;
  if (keys.length) {
    const [y, m, d] = keys[0].split('-').map(Number);
    for (let day = new Date(y, m - 1, d); day < today; day = addDays(day, 1)) {
      const k = dayKey(day);
      if (counts(days[k])) {
        run++;
        state.set(k, 'done');
        if (++sinceEarn >= 7 && freezes < MAX_FREEZES) { freezes++; sinceEarn = 0; }
      } else if (freezes > 0) {
        freezes--;
        state.set(k, 'frozen');
      } else {
        run = 0;
        sinceEarn = 0;
        state.set(k, 'missed');
      }
    }
  }
  const todayKey = dayKey(today);
  if (counts(days[todayKey])) run++;

  const monday = addDays(today, -((today.getDay() + 6) % 7));
  const week: DayState[] = [];
  for (let i = 0; i < 7; i++) {
    const day = addDays(monday, i);
    const k = dayKey(day);
    if (k === todayKey) week.push(counts(days[k]) ? 'done' : 'today');
    else if (day > today) week.push('future');
    else week.push(state.get(k) ?? 'missed');
  }
  return { days: run, freezes, week };
}

/** True retention: share of reviews of graduated cards (Review state) not graded Again, over the window. */
export function trueRetention(log: ReviewLog[], now: Date, windowDays = 30): number | null {
  const since = addDays(now, -windowDays);
  const rel = log.filter((l) => l.state === State.Review && l.reviewedAt >= since);
  if (rel.length < 10) return null;
  return rel.filter((l) => l.grade !== 'again').length / rel.length;
}

export const CHECKPOINTS = [100, 300, 600, 1000, 1500, 2000, 2500, 3000];

export function nextCheckpoint(sentences: number): number | null {
  return CHECKPOINTS.find((c) => c > sentences) ?? null;
}
