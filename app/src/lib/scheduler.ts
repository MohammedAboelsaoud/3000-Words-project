// FSRS-6 (ts-fsrs) with two memory traces per sentence: comprehension and production.
import { createEmptyCard, fsrs, generatorParameters, Rating, State, type Card, type FSRS, type Grade as FsrsGrade } from 'ts-fsrs';
import type { Grade } from './grade';

export type TraceKind = 'comprehension' | 'production';
export type Format = 'intro' | 'choice' | 'dictation' | 'type' | 'cloze' | 'say';

export interface Trace {
  id: string;
  sentenceId: string;
  kind: TraceKind;
  card: Card;
}

/** Append-only review log entry — the source of truth; FSRS state can be rebuilt from it. */
export interface ReviewLog {
  traceId: string;
  sentenceId: string;
  kind: TraceKind;
  reviewedAt: Date;
  grade: Grade;
  /** FSRS state before this review (New, Learning, Review, Relearning). */
  state: State;
  elapsedDays: number;
  durationMs: number;
  format: Format;
  errorTags: string[];
  /** The grade the app computed, when the learner overrode it. */
  autoGrade?: Grade;
}

/** Production unlocks once comprehension is this stable (days), keeping first attempts out of the ≤50%-success zone. */
export const PRODUCTION_UNLOCK_DAYS = 7;
/** A sentence counts as mastered when both traces are at least this stable (days). */
export const MASTERED_DAYS = 30;

export function makeScheduler(retention = 0.9): FSRS {
  return fsrs(
    generatorParameters({
      request_retention: Math.min(0.95, retention),
      enable_fuzz: true,
      enable_short_term: true,
      learning_steps: ['1m', '10m'],
      relearning_steps: ['10m'],
    }),
  );
}

export function traceId(sentenceId: string, kind: TraceKind): string {
  return `${sentenceId}:${kind === 'comprehension' ? 'c' : 'p'}`;
}

export function newTrace(sentenceId: string, kind: TraceKind, now: Date, due?: Date): Trace {
  const card = createEmptyCard(now);
  if (due) card.due = due;
  return { id: traceId(sentenceId, kind), sentenceId, kind, card };
}

const RATING: Record<Grade, FsrsGrade> = { again: Rating.Again, hard: Rating.Hard, good: Rating.Good, easy: Rating.Easy };

export function review(
  f: FSRS,
  trace: Trace,
  grade: Grade,
  now: Date,
  meta: { durationMs: number; format: Format; errorTags?: string[]; autoGrade?: Grade },
): { trace: Trace; log: ReviewLog } {
  const { card, log } = f.next(trace.card, now, RATING[grade]);
  return {
    trace: { ...trace, card },
    log: {
      traceId: trace.id,
      sentenceId: trace.sentenceId,
      kind: trace.kind,
      reviewedAt: now,
      grade,
      state: trace.card.state,
      elapsedDays: log.elapsed_days,
      durationMs: meta.durationMs,
      format: meta.format,
      errorTags: meta.errorTags ?? [],
      ...(meta.autoGrade && meta.autoGrade !== grade ? { autoGrade: meta.autoGrade } : {}),
    },
  };
}

export function retrievability(f: FSRS, trace: Trace, now: Date): number {
  if (trace.card.state === State.New) return 0;
  return f.get_retrievability(trace.card, now, false);
}

export function isMastered(traces: (Trace | undefined)[]): boolean {
  return traces.length === 2 && traces.every((t) => t && t.card.state === State.Review && t.card.stability >= MASTERED_DAYS);
}

export { State };
