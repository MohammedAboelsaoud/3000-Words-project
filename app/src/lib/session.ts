// The session queue: planned reviews first, then new families (intro → compare), with
// same-day learning recalls (1 min, 10 min steps) slotted in as they come due.
import type { Content } from './content';
import type { Plan } from './planner';
import { State, type Format, type Trace } from './scheduler';

export type Task =
  | { type: 'review'; traceId: string }
  | { type: 'intro'; sentenceId: string; familyId: string }
  | { type: 'compare'; familyId: string };

/** Learning recalls due within this window may be shown early when nothing else is left. */
export const LEARN_AHEAD_MS = 20 * 60_000;

/** Words shared by every sentence of a family — the frame the learner is asked to spot. */
export function sharedWords(sentences: string[]): string[] {
  const words = (s: string) => s.replace(/[[\]]/g, '').split(/\s+/).map((w) => w.replace(/[^\p{L}'-]/gu, '')).filter(Boolean);
  const [first, ...rest] = sentences.map(words);
  if (!first) return [];
  return first.filter((w) => rest.every((r) => r.some((x) => x.toLowerCase() === w.toLowerCase())));
}

export function familyHasCompare(content: Content, familyId: string): boolean {
  const f = content.familyById.get(familyId);
  return !!f?.frame;
}

export function buildQueue(plan: Plan, content: Content, traces: Map<string, Trace>, introduced: string[]): Task[] {
  const tasks: Task[] = plan.reviewIds.map((traceId) => ({ type: 'review', traceId }));
  // Sentences of families already started but never introduced (a session left early).
  for (const familyId of introduced) {
    const fam = content.familyById.get(familyId);
    if (!fam) continue;
    for (const s of fam.sentences) if (!traces.has(`${s.id}:c`)) tasks.push({ type: 'intro', sentenceId: s.id, familyId });
  }
  for (const familyId of plan.newFamilyIds) {
    const fam = content.familyById.get(familyId)!;
    for (const s of fam.sentences) tasks.push({ type: 'intro', sentenceId: s.id, familyId });
    if (fam.frame) tasks.push({ type: 'compare', familyId });
  }
  return tasks;
}

function inLearning(t: Trace): boolean {
  return t.card.state === State.Learning || t.card.state === State.Relearning;
}

/**
 * Next task: a learning recall that is due now; else the next planned task; else a learning
 * recall due soon (learn ahead). `learning` holds trace ids touched this session.
 */
export function pickNext(queue: Task[], learning: string[], traces: Map<string, Trace>, now: Date): { task: Task; queue: Task[] } | null {
  const active = learning
    .map((id) => traces.get(id))
    .filter((t): t is Trace => !!t && inLearning(t))
    .sort((a, b) => a.card.due.getTime() - b.card.due.getTime());
  const dueNow = active.find((t) => t.card.due <= now);
  if (dueNow) return { task: { type: 'review', traceId: dueNow.id }, queue: queue.filter((q) => !(q.type === 'review' && q.traceId === dueNow.id)) };
  if (queue.length) return { task: queue[0], queue: queue.slice(1) };
  const soon = active.find((t) => t.card.due.getTime() - now.getTime() <= LEARN_AHEAD_MS);
  if (soon) return { task: { type: 'review', traceId: soon.id }, queue };
  return null;
}

/** Exercise formats rotate between reviews; production only uses speaking when available. */
export function formatFor(trace: Trace, speaking: boolean): Format {
  const reps = trace.card.reps;
  if (trace.kind === 'comprehension') return reps % 2 === 1 ? 'choice' : 'dictation';
  const formats: Format[] = speaking ? ['type', 'cloze', 'say'] : ['type', 'cloze'];
  return formats[reps % formats.length];
}
