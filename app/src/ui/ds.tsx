// Satz design-system components (design-system/project/components), typed for the app.
// Class names and markup match bundle.js so bundle.css styles both.
import { Fragment, type ReactNode } from 'react';
import type { DiffToken, Grade, SpokenWord } from '../lib/grade';
import type { DayState } from '../lib/progress';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
const fmt = (n: number) => n.toLocaleString('en-US');

export function parseSlots(text: string): { t: string; slot?: boolean }[] {
  const out: { t: string; slot?: boolean }[] = [];
  const re = /\[([^\]]+)\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ t: text.slice(last, m.index) });
    out.push({ t: m[1], slot: true });
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ t: text.slice(last) });
  return out;
}

export function SlotText({ text, highlight = true }: { text: string; highlight?: boolean }) {
  return (
    <>
      {parseSlots(text).map((p, i) =>
        p.slot && highlight ? <mark key={i} className="sz-slot">{p.t}</mark> : <Fragment key={i}>{p.t}</Fragment>,
      )}
    </>
  );
}

export function StartButton({ minutes, label = 'Start', onClick, disabled }: { minutes?: number; label?: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button type="button" className="sz-start" onClick={onClick} disabled={disabled}>
      <span>{label}</span>
      {minutes != null && <span className="sz-start-min">· {minutes} min</span>}
    </button>
  );
}

export function Button({ variant = 'quiet', className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'quiet' | 'primary' | 'text' }) {
  return <button type="button" {...rest} className={cx('sz-btn', 'sz-btn-' + variant, className)} />;
}

export function AudioButton({ speed = 'natural', voice, playing, onClick }: { speed?: 'natural' | 'slow'; voice?: string; playing?: boolean; onClick?: () => void }) {
  const label = playing ? 'Pause' : speed === 'slow' ? 'Play slowly' : 'Play';
  return (
    <div className="sz-audio">
      <button type="button" className={cx('sz-audio-disc', speed === 'slow' && 'sz-audio-slow')} aria-label={label} aria-pressed={!!playing} onClick={onClick}>
        <span aria-hidden className={playing ? 'sz-glyph-pause' : 'sz-glyph-play'} />
      </button>
      <span className="sz-audio-meta">
        <span className="sz-audio-speed">{speed === 'slow' ? 'Slow' : 'Natural'}</span>
        {voice && <span className="sz-audio-voice">{voice}</span>}
      </span>
    </div>
  );
}

export function SentenceCard(props: { text: string; gloss?: string; band?: string; theme?: string; hidden?: boolean; audio?: ReactNode; children?: ReactNode }) {
  return (
    <article className="sz-card" lang="de">
      {(props.band || props.theme) && <div className="sz-card-meta">{[props.band, props.theme].filter(Boolean).join(' · ')}</div>}
      {props.hidden ? (
        <p className="sz-card-hidden">Listen first — the text appears after your guess.</p>
      ) : (
        <p className="sz-sentence-lg"><SlotText text={props.text} /></p>
      )}
      {!props.hidden && props.gloss && <p className="sz-gloss" lang="en">{props.gloss}</p>}
      {props.audio && <div className="sz-card-audio">{props.audio}</div>}
      {props.children}
    </article>
  );
}

export function FamilyList({ sentences, frame, revealed }: { sentences: string[]; frame?: string; revealed?: boolean }) {
  return (
    <div className="sz-family">
      {frame && revealed && <p className="sz-family-frame">Same in every line: <strong lang="de">{frame}</strong></p>}
      <ol className="sz-family-list" lang="de">
        {sentences.map((s, i) => <li key={i} className="sz-sentence"><SlotText text={s} highlight={!!revealed} /></li>)}
      </ol>
    </div>
  );
}

export function ChangePair({ a, b, note }: { a: string; b: string; note?: string }) {
  return (
    <div className="sz-pair">
      <div className="sz-pair-row"><span className="sz-pair-k">A</span><p className="sz-sentence" lang="de"><SlotText text={a} /></p></div>
      <div className="sz-pair-row"><span className="sz-pair-k">B</span><p className="sz-sentence" lang="de"><SlotText text={b} /></p></div>
      {note && <p className="sz-pair-note">{note}</p>}
    </div>
  );
}

export function RuleCard({ frame, rule }: { frame: string; rule: string }) {
  return (
    <aside className="sz-rule">
      <span className="sz-rule-k">Rule</span>
      <p className="sz-rule-frame" lang="de">{frame}</p>
      <p className="sz-rule-line">{rule}</p>
    </aside>
  );
}

export function TaskHeader({ instruction, reason, showReason = true, progress }: { instruction: string; reason?: string; showReason?: boolean; progress?: number }) {
  const pct = progress != null ? Math.max(0, Math.min(1, progress)) : null;
  return (
    <header className="sz-task">
      {pct != null && (
        <div className="sz-task-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct * 100)} aria-label="Session progress">
          <span style={{ width: `${pct * 100}%` }} />
        </div>
      )}
      <p className="sz-task-do">{instruction}</p>
      {reason && showReason && <p className="sz-task-why">{reason}</p>}
    </header>
  );
}

const CHOICE_WORD = { correct: 'Correct', wrong: 'Not this one' } as const;
export function ChoiceOption({ state = 'idle', children, onClick, disabled }: { state?: 'idle' | 'selected' | 'correct' | 'wrong'; children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button type="button" className={cx('sz-choice', 'sz-choice-' + state)} onClick={onClick} disabled={disabled} aria-pressed={state === 'selected' || undefined}>
      <span className="sz-choice-text">{children}</span>
      {(state === 'correct' || state === 'wrong') && <span className="sz-choice-word">{CHOICE_WORD[state]}</span>}
    </button>
  );
}

export function DictationDiff({ tokens, errorTag }: { tokens: DiffToken[]; errorTag?: string }) {
  return (
    <div className="sz-diff">
      <p className="sz-diff-line" lang="de">
        {tokens.map((t, i) => (
          <Fragment key={i}>
            {t.status === 'ok' && <span className="sz-tok sz-tok-ok">{t.text}</span>}
            {t.status === 'missing' && <span className="sz-tok sz-tok-missing" title="missing">{t.expected}<span className="sz-sr"> (missing)</span></span>}
            {t.status === 'extra' && <del className="sz-tok sz-tok-extra">{t.text}<span className="sz-sr"> (extra)</span></del>}
            {t.status === 'wrong' && <span className="sz-tok sz-tok-wrong"><del>{t.text}</del><ins>{t.expected}</ins></span>}{' '}
          </Fragment>
        ))}
      </p>
      {tokens.some((t) => t.status !== 'ok') && <p className="sz-diff-legend">
        <span className="sz-leg sz-leg-wrong">wrong → right</span>
        <span className="sz-leg sz-leg-missing">missing</span>
        <span className="sz-leg sz-leg-extra">extra</span>
      </p>}
      {errorTag && <p className="sz-diff-tag">Logged as <strong>{errorTag}</strong></p>}
    </div>
  );
}

export function SpeakFeedback({ words, grade }: { words: SpokenWord[]; grade: Grade }) {
  const head = grade === 'good' ? ['Clear', 'good'] : grade === 'hard' ? ['Mostly clear', 'hard'] : ['Not clear yet', 'again'];
  const flagged = words.filter((w) => w.flag);
  return (
    <div className="sz-speak">
      <p className={cx('sz-speak-head', 'sz-tone-' + head[1])}>{head[0]}</p>
      <p className="sz-sentence" lang="de">
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className={cx('sz-word', w.flag && 'sz-word-' + w.flag)}>{w.text}{w.flag && <span className="sz-sr"> ({w.flag})</span>}</span>{' '}
          </Fragment>
        ))}
      </p>
      {flagged.length > 0 && <p className="sz-speak-retry">Retry: {flagged.map((w) => w.text).join(', ')}</p>}
    </div>
  );
}

const GRADE_WORD: Record<Grade, string> = { again: 'Again', hard: 'Hard', good: 'Good', easy: 'Easy' };
export function GradeChip({ grade, auto = true, onChange }: { grade: Grade; auto?: boolean; onChange?: (g: Grade) => void }) {
  const tone = grade === 'easy' ? 'good' : grade;
  return (
    <div className="sz-gradechip">
      <span className={cx('sz-chip', 'sz-chip-' + tone)}>{GRADE_WORD[grade]}</span>
      <span className="sz-gradechip-how">{auto ? 'graded automatically' : 'your grade'}</span>
      {onChange && (
        <label className="sz-grade-change">
          <span className="sz-sr">Change grade</span>
          <select value={grade} onChange={(e) => onChange(e.target.value as Grade)} aria-label="Change grade">
            {(['again', 'hard', 'good', 'easy'] as Grade[]).map((g) => <option key={g} value={g}>{GRADE_WORD[g]}</option>)}
          </select>
        </label>
      )}
    </div>
  );
}

const BANDS = [
  { n: 1, name: 'Survival', cefr: 'Pre-A1 → A1', from: 0, to: 300 },
  { n: 2, name: 'Foundations', cefr: 'A1', from: 300, to: 1000 },
  { n: 3, name: 'Everyday life', cefr: 'A2', from: 1000, to: 2000 },
  { n: 4, name: 'Threshold', cefr: 'A2+ → B1', from: 2000, to: 3000 },
];
const CHECKPOINTS = [100, 300, 600, 1000, 1500, 2000, 2500, 3000];
/** `sentences` = sentences started; `skipped` = sentences in bands skipped at placement (drawn as done, not counted). */
export function BandRoadmap({ sentences: learned, skipped = 0 }: { sentences: number; skipped?: number }) {
  const sentences = learned + skipped;
  const next = CHECKPOINTS.find((c) => c > sentences);
  return (
    <section className="sz-road" aria-label="Roadmap">
      <p className="sz-road-head"><strong>{fmt(learned)}</strong> {learned === 1 ? 'sentence' : 'sentences'} learned{skipped > 0 && <span className="sz-road-next"> · {fmt(skipped)} skipped at placement</span>}{next && <span className="sz-road-next"> · next checkpoint {fmt(next)}</span>}</p>
      <div className="sz-road-track">
        {BANDS.map((b) => {
          const fill = Math.max(0, Math.min(1, (sentences - b.from) / (b.to - b.from)));
          return <div key={b.n} className="sz-road-seg" style={{ flexGrow: b.to - b.from }}><span className={'sz-road-fill sz-band-' + b.n} style={{ width: `${fill * 100}%` }} /></div>;
        })}
        {CHECKPOINTS.map((c) => <span key={c} className={cx('sz-road-cp', c <= sentences && 'is-done')} style={{ left: `${(c / 3000) * 100}%` }} title={fmt(c)} />)}
      </div>
      <ol className="sz-road-bands">
        {BANDS.map((b) => (
          <li key={b.n}>
            <span className="sz-road-bn"><span className={'sz-road-sw sz-band-' + b.n} />{b.n} · {b.name}</span>
            <span className="sz-road-cefr">{b.cefr} · {fmt(b.from + 1)}–{fmt(b.to)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function SessionClose({ recallPct, total, nextCheckpoint, tomorrowMin }: { recallPct: number | null; total: number; nextCheckpoint: number | null; tomorrowMin: number }) {
  return (
    <section className="sz-close">
      {recallPct != null ? (
        <>
          <p className="sz-close-stat">{recallPct}%</p>
          <p className="sz-close-line">You now recall {recallPct}% of {fmt(total)} sentences.</p>
        </>
      ) : (
        <>
          <p className="sz-close-stat">{fmt(total)}</p>
          <p className="sz-close-line">You have started {fmt(total)} sentences. Your recall rate appears after a few days of reviews.</p>
        </>
      )}
      <dl className="sz-close-dl">
        {nextCheckpoint != null && <><dt>Next checkpoint</dt><dd>{fmt(nextCheckpoint)} · {fmt(nextCheckpoint - total)} to go</dd></>}
        <dt>Tomorrow</dt><dd>about {tomorrowMin} min</dd>
      </dl>
    </section>
  );
}

const DAY = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_STATE: Record<DayState, string> = { done: 'practised', frozen: 'covered by a freeze', missed: 'missed', today: 'today', future: '' };
export function StreakMeter({ days, freezes, week }: { days: number; freezes: number; week: DayState[] }) {
  return (
    <section className="sz-streak">
      <p className="sz-streak-head"><strong>{days} {days === 1 ? 'day' : 'days'}</strong><span className="sz-streak-fz">{freezes} of 2 freezes left</span></p>
      <ol className="sz-streak-week">
        {week.map((s, i) => (
          <li key={i} className={'sz-day sz-day-' + s} title={DAY_STATE[s]}>
            <span className="sz-day-dot" /><span className="sz-day-l">{DAY[i]}</span>
            {DAY_STATE[s] && <span className="sz-sr"> {DAY_STATE[s]}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function RecoveryNotice({ date, children }: { date: string; children?: ReactNode }) {
  return (
    <section className="sz-recover">
      <p className="sz-recover-head">Welcome back.</p>
      <p>New sentences are paused while we catch up. The most-forgotten come first.</p>
      <p className="sz-recover-date">Back on track by <strong>{date}</strong></p>
      {children}
    </section>
  );
}
