// A session: planned reviews, then new families (listen → guess → reveal → shadow → compare),
// with the 1-min and 10-min recalls of new sentences slotted in as they come due.
import { useEffect, useMemo, useRef, useState } from 'react';
import { distractors, shuffle, type Content } from '../lib/content';
import { gradeSpoken, gradeTyped, type DiffToken, type Grade, type SpokenResult } from '../lib/grade';
import type { Format, Trace } from '../lib/scheduler';
import { formatFor, pickNext, sharedWords, type Task } from '../lib/session';
import { listen, playSentence, recognitionAvailable, stopAudio, voiceName } from '../lib/speech';
import { blankSlot, slotOf, stripSlots } from '../lib/text';
import {
  AudioButton, Button, ChangePair, ChoiceOption, DictationDiff, FamilyList, GradeChip, RuleCard,
  SentenceCard, SpeakFeedback, TaskHeader,
} from '../ui/ds';

export interface SessionProps {
  content: Content;
  initialQueue: Task[];
  traces: Map<string, Trace>;
  voices: SpeechSynthesisVoice[];
  speaking: boolean;
  estMin: number;
  /** How often each format has been seen, so the reason line can collapse after a few uses. */
  formatSeen: Record<string, number>;
  onIntro(sentenceId: string, familyId: string, durationMs: number): Promise<void>;
  onReview(traceId: string, grade: Grade, meta: { durationMs: number; format: Format; errorTags: string[]; autoGrade: Grade }): Promise<void>;
  onActivity(ms: number): void;
  onFinish(completed: boolean): void;
}

const REASON: Record<string, [string, string]> = {
  intro: ['Listen. What do you think it means?', 'Guessing before the answer helps you remember it, even when the guess is wrong.'],
  choice: ['Listen. What does it mean?', 'Understanding by ear comes before speaking.'],
  dictation: ['Type what you hear.', 'This trains your ear for words that run together.'],
  type: ['Write it in German.', 'Producing the sentence from memory makes it yours.'],
  cloze: ['Fill the gap.', 'Recalling the new part inside the whole sentence.'],
  say: ['Say it in German.', 'Speaking it aloud links the sound to the meaning.'],
  compare: ['Tap the words that stay the same.', 'Seeing what repeats makes the pattern stick.'],
};

export function Session(props: SessionProps) {
  const { content, traces } = props;
  const [queue, setQueue] = useState<Task[]>(props.initialQueue);
  const [learning, setLearning] = useState<string[]>([]);
  const [current, setCurrent] = useState<Task | null>(null);
  const [done, setDone] = useState(0);
  const startedAt = useRef(Date.now());
  const lastActivity = useRef(Date.now());
  const total = props.initialQueue.length;

  const advance = (q: Task[], l: string[]) => {
    const next = pickNext(q, l, traces, new Date());
    if (!next) {
      props.onFinish(true);
      return;
    }
    setQueue(next.queue);
    setCurrent(next.task);
  };

  useEffect(() => {
    advance(queue, learning);
    return () => stopAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recordActivity = () => {
    const now = Date.now();
    props.onActivity(Math.min(now - lastActivity.current, 2 * 60_000));
    lastActivity.current = now;
  };

  const finishTask = (touchedTraceId?: string) => {
    recordActivity();
    setDone((d) => d + 1);
    const l = touchedTraceId && !learning.includes(touchedTraceId) ? [...learning, touchedTraceId] : learning;
    setLearning(l);
    setCurrent(null);
    // Let the commit settle so pickNext sees the updated trace.
    setTimeout(() => advance(queue, l), 0);
  };

  const elapsedMin = (Date.now() - startedAt.current) / 60_000;
  const progress = Math.min(1, Math.max(done / Math.max(total, 1), elapsedMin / Math.max(props.estMin, 1)));
  const voiceFor = (i: number) => (props.voices.length ? props.voices[i % props.voices.length] : undefined);

  let body: React.ReactNode = null;
  if (current?.type === 'intro') {
    body = (
      <IntroTask
        key={'i' + current.sentenceId}
        content={content}
        sentenceId={current.sentenceId}
        voice={voiceFor(0)}
        slowVoice={voiceFor(0)}
        shadowVoice={voiceFor(1)}
        speaking={props.speaking}
        progress={progress}
        showReason={(props.formatSeen.intro ?? 0) < 3}
        onDone={async (ms) => {
          await props.onIntro(current.sentenceId, current.familyId, ms);
          finishTask(`${current.sentenceId}:c`);
        }}
      />
    );
  } else if (current?.type === 'compare') {
    body = <CompareTask key={'c' + current.familyId} content={content} familyId={current.familyId} progress={progress} showReason={(props.formatSeen.compare ?? 0) < 3} onDone={() => finishTask()} />;
  } else if (current?.type === 'review') {
    const trace = traces.get(current.traceId);
    if (trace) {
      const format = formatFor(trace, props.speaking && recognitionAvailable());
      body = (
        <ReviewTask
          key={'r' + trace.id + trace.card.reps}
          content={content}
          trace={trace}
          format={format}
          voice={voiceFor(trace.card.reps)}
          progress={progress}
          showReason={(props.formatSeen[format] ?? 0) < 3}
          onDone={async (grade, meta) => {
            await props.onReview(trace.id, grade, { ...meta, format });
            finishTask(trace.id);
          }}
        />
      );
    }
  }

  return (
    <main className="screen session">
      <div className="session-top">
        <Button variant="text" onClick={() => { stopAudio(); recordActivity(); props.onFinish(false); }}>Stop for today</Button>
      </div>
      {body}
    </main>
  );
}

// ---- New sentence: listen → guess → reveal → shadow (→ say) -------------------------------

function IntroTask(props: {
  content: Content; sentenceId: string; voice?: SpeechSynthesisVoice; slowVoice?: SpeechSynthesisVoice; shadowVoice?: SpeechSynthesisVoice;
  speaking: boolean; progress: number; showReason: boolean; onDone(ms: number): void;
}) {
  const s = props.content.sentenceById.get(props.sentenceId)!;
  const fam = props.content.familyOfSentence.get(props.sentenceId)!;
  const text = stripSlots(s.de);
  const options = useMemo(() => shuffle([s.en, ...distractors(props.content, s.id)]), [s.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [picked, setPicked] = useState<string | null>(null);
  const [spoken, setSpoken] = useState<SpokenResult | null>(null);
  const t0 = useRef(Date.now());

  useEffect(() => { void playSentence(text, props.voice); }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (o: string) => {
    if (picked) return;
    setPicked(o);
    void playSentence(text, props.voice);
  };

  const [instr, reason] = picked ? ['Shadow it: play it and say it along, two or three times.', 'Copying the rhythm out loud trains fluency.'] : REASON.intro;
  return (
    <section className="task">
      <TaskHeader instruction={instr} reason={reason} showReason={props.showReason} progress={props.progress} />
      <SentenceCard
        text={s.de}
        gloss={s.en}
        hidden={!picked}
        band={`New · Band ${fam.band}`}
        theme={fam.theme}
        audio={
          <>
            <AudioButton voice={voiceName(props.voice)} onClick={() => void playSentence(text, props.voice)} />
            <AudioButton speed="slow" voice={voiceName(props.slowVoice)} onClick={() => void playSentence(text, props.slowVoice, true)} />
            {picked && props.shadowVoice && props.shadowVoice !== props.voice && (
              <AudioButton voice={voiceName(props.shadowVoice)} onClick={() => void playSentence(text, props.shadowVoice)} />
            )}
          </>
        }
      />
      <div className="choices">
        {options.map((o) => (
          <ChoiceOption key={o} onClick={() => pick(o)} disabled={!!picked} state={!picked ? 'idle' : o === s.en ? 'correct' : o === picked ? 'wrong' : 'idle'}>{o}</ChoiceOption>
        ))}
      </div>
      {picked && props.speaking && recognitionAvailable() && <SayIt targets={[text, ...(s.alt ?? [])]} onResult={setSpoken} />}
      {spoken && <SpeakFeedback words={spoken.words} grade={spoken.grade} />}
      {picked && <div className="task-next"><Button variant="primary" onClick={() => props.onDone(Date.now() - t0.current)}>Continue</Button></div>}
    </section>
  );
}

// ---- Compare a new family: tap what stays the same → rule → one-change pair ----------------

function CompareTask(props: { content: Content; familyId: string; progress: number; showReason: boolean; onDone(): void }) {
  const fam = props.content.familyById.get(props.familyId)!;
  const sentences = fam.sentences.map((s) => s.de);
  const shared = useMemo(() => sharedWords(sentences), [props.familyId]); // eslint-disable-line react-hooks/exhaustive-deps
  const words = stripSlots(sentences[0]).split(/\s+/);
  const [sel, setSel] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(shared.length === 0);
  const clean = (w: string) => w.replace(/[^\p{L}'-]/gu, '');
  const selectedWords = [...sel].map((i) => clean(words[i]));
  const right = shared.length > 0 && selectedWords.length === shared.length && shared.every((w) => selectedWords.some((x) => x.toLowerCase() === w.toLowerCase()));

  return (
    <section className="task">
      <TaskHeader instruction={checked ? 'The pattern' : REASON.compare[0]} reason={REASON.compare[1]} showReason={props.showReason && !checked} progress={props.progress} />
      {!checked && (
        <>
          <FamilyList sentences={sentences} />
          <p className="tap-row" lang="de">
            {words.map((w, i) => (
              <button key={i} type="button" className={'tap-word' + (sel.has(i) ? ' is-on' : '')} aria-pressed={sel.has(i)}
                onClick={() => setSel((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; })}>{w}</button>
            ))}
          </p>
          <div className="task-next"><Button variant="primary" disabled={sel.size === 0} onClick={() => setChecked(true)}>Check</Button></div>
        </>
      )}
      {checked && (
        <>
          {shared.length > 0 && (
            <p className="feedback-line">{right ? 'Yes — ' : 'The part that stays the same: '}<strong lang="de">{shared.join(' ')}</strong></p>
          )}
          <FamilyList sentences={sentences} frame={fam.frame} revealed />
          {fam.frame && fam.rule && <RuleCard frame={fam.frame} rule={fam.rule} />}
          {fam.pair && <ChangePair a={fam.pair.a} b={fam.pair.b} note={fam.pair.note} />}
          <div className="task-next"><Button variant="primary" onClick={props.onDone}>Continue</Button></div>
        </>
      )}
    </section>
  );
}

// ---- Review: one exercise, objective grade, then the answer with native audio ---------------

type Outcome = { grade: Grade; errorTags: string[]; tokens?: DiffToken[]; errorTag?: string; spoken?: SpokenResult; picked?: string; durationMs: number };

function ReviewTask(props: {
  content: Content; trace: Trace; format: Format; voice?: SpeechSynthesisVoice; progress: number; showReason: boolean;
  onDone(grade: Grade, meta: { durationMs: number; errorTags: string[]; autoGrade: Grade }): void;
}) {
  const { content, trace, format } = props;
  const s = content.sentenceById.get(trace.sentenceId)!;
  const fam = content.familyOfSentence.get(trace.sentenceId)!;
  const text = stripSlots(s.de);
  const targets = [text, ...(s.alt ?? [])];
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [answer, setAnswer] = useState('');
  const t0 = useRef(Date.now());
  const options = useMemo(() => shuffle([s.en, ...distractors(content, s.id)]), [s.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const listening = format === 'choice' || format === 'dictation';

  useEffect(() => { if (listening) void playSentence(text, props.voice); }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = (o: Omit<Outcome, 'durationMs'>) => {
    setOutcome({ ...o, durationMs: Date.now() - t0.current });
    setGrade(o.grade);
    void playSentence(text, props.voice);
  };

  const submitTyped = () => {
    if (format === 'cloze') {
      const slot = slotOf(s.de);
      const r = gradeTyped(answer, [slot]);
      finish({ grade: r.grade, errorTags: r.errorTag ? [r.errorTag] : [], tokens: r.tokens, errorTag: r.errorTag });
    } else {
      const r = gradeTyped(answer, targets, format === 'dictation' ? 'dictation' : 'typed');
      finish({ grade: r.grade, errorTags: r.errorTag ? [r.errorTag] : [], tokens: r.tokens, errorTag: r.errorTag });
    }
  };

  const [instr, reason] = REASON[format];
  return (
    <section className="task">
      <TaskHeader instruction={instr} reason={reason} showReason={props.showReason} progress={props.progress} />

      {!outcome && listening && (
        <div className="audio-row">
          <AudioButton voice={voiceName(props.voice)} onClick={() => void playSentence(text, props.voice)} />
          <AudioButton speed="slow" voice={voiceName(props.voice)} onClick={() => void playSentence(text, props.voice, true)} />
        </div>
      )}
      {!outcome && !listening && (
        <div className="prompt">
          <p className="prompt-en" lang="en">{s.en}</p>
          {format === 'cloze' && <p className="sz-sentence-lg" lang="de">{blankSlot(s.de)}</p>}
        </div>
      )}

      {format === 'choice' && (
        <div className="choices">
          {options.map((o) => (
            <ChoiceOption key={o} disabled={!!outcome}
              state={!outcome ? 'idle' : o === s.en ? 'correct' : o === outcome.picked ? 'wrong' : 'idle'}
              onClick={() => finish({ grade: o === s.en ? 'good' : 'again', errorTags: o === s.en ? [] : ['mishearing'], picked: o })}>{o}</ChoiceOption>
          ))}
        </div>
      )}

      {(format === 'dictation' || format === 'type' || format === 'cloze') && !outcome && (
        <form className="answer" onSubmit={(e) => { e.preventDefault(); submitTyped(); }}>
          <label className="sz-sr" htmlFor="answer">Your answer</label>
          <input id="answer" className="answer-input" lang="de" autoFocus autoComplete="off" autoCapitalize="off" spellCheck={false}
            value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder={format === 'cloze' ? 'the missing part' : 'Auf Deutsch …'} />
          <UmlautKeys onKey={(k) => setAnswer((a) => a + k)} />
          <div className="task-next"><Button variant="primary" type="submit">Check</Button></div>
        </form>
      )}

      {format === 'say' && !outcome && (
        <SayIt targets={targets} onResult={(r) => finish({ grade: r.grade, errorTags: r.errors ? ['pronunciation'] : [], spoken: r })} />
      )}

      {outcome && grade && (
        <>
          {outcome.tokens && <DictationDiff tokens={outcome.tokens} errorTag={outcome.errorTag} />}
          {outcome.spoken && <SpeakFeedback words={outcome.spoken.words} grade={outcome.spoken.grade} />}
          <SentenceCard text={s.de} gloss={s.en} band={`Band ${fam.band}`} theme={fam.theme}
            audio={<><AudioButton voice={voiceName(props.voice)} onClick={() => void playSentence(text, props.voice)} /><AudioButton speed="slow" voice={voiceName(props.voice)} onClick={() => void playSentence(text, props.voice, true)} /></>} />
          <GradeChip grade={grade} auto={grade === outcome.grade} onChange={setGrade} />
          <div className="task-next">
            <Button variant="primary" autoFocus onClick={() => props.onDone(grade, { durationMs: outcome.durationMs, errorTags: outcome.errorTags, autoGrade: outcome.grade })}>Continue</Button>
          </div>
        </>
      )}
    </section>
  );
}

function UmlautKeys({ onKey }: { onKey(k: string): void }) {
  return (
    <div className="umlauts" aria-label="Special letters">
      {['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'].map((k) => (
        <button key={k} type="button" className="umlaut" onMouseDown={(e) => e.preventDefault()} onClick={() => onKey(k)}>{k}</button>
      ))}
    </div>
  );
}

function SayIt({ targets, onResult }: { targets: string[]; onResult(r: SpokenResult): void }) {
  const [state, setState] = useState<'idle' | 'listening' | 'error'>('idle');
  const [heard, setHeard] = useState<string | null>(null);
  const stopRef = useRef<() => void>(() => {});
  const start = async () => {
    stopAudio();
    setState('listening');
    const { result, stop } = listen();
    stopRef.current = stop;
    try {
      const transcript = await result;
      setHeard(transcript);
      setState('idle');
      onResult(gradeSpoken(transcript, targets));
    } catch {
      setState('error');
    }
  };
  return (
    <div className="sayit">
      {state === 'listening'
        ? <Button variant="primary" onClick={() => stopRef.current()}>Done speaking</Button>
        : <Button onClick={start}>{heard == null ? 'Say it' : 'Try again'}</Button>}
      {heard != null && <p className="sayit-heard">Heard: <span lang="de">{heard || '(nothing)'}</span></p>}
      {state === 'error' && <p className="sayit-heard">The microphone is not available. You can continue without speaking.</p>}
    </div>
  );
}
