import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { germanContent } from './lib/content';
import type { Grade } from './lib/grade';
import { accrueCredit, addDays, dayKey, measuredSecPerReview, plan as makePlan, rampFactor, startOfDay } from './lib/planner';
import { nextCheckpoint, streak, trueRetention } from './lib/progress';
import { makeScheduler, newTrace, PRODUCTION_UNLOCK_DAYS, review, State, traceId, type Format, type ReviewLog, type Trace } from './lib/scheduler';
import { buildQueue, type Task } from './lib/session';
import { voicesReady } from './lib/speech';
import { ApiStore, currentUser, deleteAccount, logout, type SyncStatus, type User } from './lib/api';
import { openStore, type AppStore, type Progress, type Settings } from './lib/store';
import { Auth } from './screens/Auth';
import { Home } from './screens/Home';
import { Session } from './screens/Session';
import { Setup } from './screens/Setup';
import { Button, SessionClose } from './ui/ds';

const content = germanContent;
type Screen = 'loading' | 'auth' | 'setup' | 'home' | 'session' | 'close' | 'settings';
const GUEST_KEY = 'satz-guest';

function guestChosen(): boolean {
  try { return localStorage.getItem(GUEST_KEY) === '1'; } catch { return false; }
}
function setGuestChosen(on: boolean) {
  try { if (on) localStorage.setItem(GUEST_KEY, '1'); else localStorage.removeItem(GUEST_KEY); } catch { /* storage blocked */ }
}

/** Families the planner should not introduce: already started, or skipped by placement. */
function plannedFamilies(progress: Progress, settings: Settings): Set<string> {
  const out = new Set(progress.introduced);
  for (const fam of content.families) if (fam.band < settings.startBand) out.add(fam.id);
  return out;
}

/** Sentences in bands skipped at placement (and not practised anyway). */
function skippedSentences(progress: Progress, settings: Settings): number {
  const started = new Set(progress.introduced);
  return content.families.filter((f) => f.band < settings.startBand && !started.has(f.id)).reduce((n, f) => n + f.sentences.length, 0);
}

function daysBetween(fromKey: string | null, to: Date): number | null {
  if (!fromKey) return null;
  const [y, m, d] = fromKey.split('-').map(Number);
  return Math.round((startOfDay(to).getTime() - new Date(y, m - 1, d).getTime()) / 86_400_000);
}

export function App() {
  const storeRef = useRef<AppStore | null>(null);
  const traces = useRef(new Map<string, Trace>());
  const [log, setLog] = useState<ReviewLog[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [screen, setScreen] = useState<Screen>('loading');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [version, setVersion] = useState(0);
  const [session, setSession] = useState<{ queue: Task[]; estMin: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** server: an account server is reachable; user: who is logged in (null = this device only). */
  const [account, setAccount] = useState<{ server: boolean; user: User | null }>({ server: false, user: null });
  const [sync, setSync] = useState<SyncStatus>('saved');

  const load = useCallback(async (next?: AppStore) => {
    if (next) storeRef.current = next;
    const store = storeRef.current ?? (storeRef.current = await openStore());
    if (store instanceof ApiStore) store.onStatus(setSync);
    const data = await store.load();
    traces.current = new Map(data.traces.map((t) => [t.id, t]));
    setLog(data.log);
    // Accrue today's new-sentence credit once per day.
    const today = dayKey(new Date());
    let p = data.progress;
    if (p.creditDay !== today) {
      p = { ...p, newCredit: accrueCredit(p.newCredit, data.settings.budgetMin, rampFactor(daysBetween(p.recoveredDay, new Date()))), creditDay: today };
      await store.saveProgress(p);
    }
    setSettings(data.settings);
    setProgress(p);
    setScreen(data.settings.onboarded ? 'home' : 'setup');
  }, []);

  // Start: a logged-in account if the server has one, else the login screen, else this device only.
  useEffect(() => {
    voicesReady().then(setVoices);
    (async () => {
      if (import.meta.env.VITE_ARTIFACT) return load();
      const me = await currentUser();
      setAccount(me);
      if (me.user) return load(new ApiStore(me.user));
      if (me.server && !guestChosen()) return setScreen('auth');
      return load();
    })().catch((e) => setError(String(e)));
  }, [load]);

  // Warn before closing the page while answers are still being saved.
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (storeRef.current instanceof ApiStore && storeRef.current.pending > 0) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);

  const f = useMemo(() => makeScheduler(settings?.retention ?? 0.9), [settings?.retention]);
  const secPerReview = useMemo(() => measuredSecPerReview(log.filter((l) => l.format !== 'intro').map((l) => l.durationMs)), [log]);

  const plan = useMemo(() => {
    if (!settings || !progress) return null;
    return makePlan({
      now: new Date(),
      budgetMin: settings.budgetMin,
      traces: [...traces.current.values()],
      families: content.families,
      introducedFamilies: plannedFamilies(progress, settings),
      secPerReview,
      newCredit: progress.newCredit,
      f,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, progress, secPerReview, f, version, screen]);

  const saveProgress = useCallback(async (p: Progress) => {
    setProgress(p);
    await storeRef.current!.saveProgress(p);
  }, []);

  // Notice the end of a recovery period so new sentences ramp back up gently.
  useEffect(() => {
    if (!plan || !progress || screen !== 'home' || plan.mode === progress.lastMode) return;
    void saveProgress({ ...progress, lastMode: plan.mode, recoveredDay: plan.mode === 'normal' ? dayKey(new Date()) : progress.recoveredDay });
  }, [plan, progress, screen, saveProgress]);

  const sentencesStarted = useMemo(() => [...traces.current.values()].filter((t) => t.kind === 'comprehension').length, [version, screen]); // eslint-disable-line react-hooks/exhaustive-deps
  const formatSeen = useMemo(() => {
    const seen: Record<string, number> = {};
    for (const l of log) seen[l.format] = (seen[l.format] ?? 0) + 1;
    return seen;
  }, [log]);

  const onAuthed = async (user: User, created: boolean) => {
    const local = storeRef.current && !(storeRef.current instanceof ApiStore) ? storeRef.current : null;
    const api = new ApiStore(user);
    if (created && local) {
      // A new account starts with the progress made on this device.
      const snap = await local.load();
      if (snap.traces.length || snap.settings.onboarded) await api.importAll(snap);
    }
    setGuestChosen(false);
    setAccount({ server: true, user });
    setScreen('loading');
    await load(api);
  };

  const onLogout = async () => {
    await logout().catch(() => {});
    storeRef.current = null;
    traces.current = new Map();
    setLog([]);
    setSettings(null);
    setProgress(null);
    setAccount({ server: true, user: null });
    setSync('saved');
    setScreen('auth');
  };

  const onDeleteAccount = async (password: string) => {
    await deleteAccount(password);
    await onLogout();
  };

  const onGuest = () => {
    setGuestChosen(true);
    setScreen('loading');
    load().catch((e) => setError(String(e)));
  };

  if (error) return <main className="screen"><p className="home-title">Something went wrong</p><p className="muted">{error}</p></main>;
  if (screen === 'auth') {
    return <Auth onAuthed={(u, c) => { onAuthed(u, c).catch((e) => setError(String(e))); }}
      onGuest={storeRef.current ? () => setScreen('settings') : onGuest}
      hasLocalProgress={!!storeRef.current && traces.current.size > 0} />;
  }
  if (screen === 'loading' || !settings || !progress || !plan) return <main className="screen"><p className="muted">Loading…</p></main>;

  const commit = async (updated: Trace[], entry: ReviewLog | null) => {
    await storeRef.current!.commitReview(updated, entry);
    for (const t of updated) traces.current.set(t.id, t);
    if (entry) setLog((l) => [...l, entry]);
    setVersion((v) => v + 1);
  };

  const onIntro = async (sentenceId: string, familyId: string, durationMs: number) => {
    const now = new Date();
    // First exposure is not yet a memory: it starts on the 1-minute learning step.
    const r = review(f, newTrace(sentenceId, 'comprehension', now), 'again', now, { durationMs, format: 'intro' });
    await commit([r.trace], r.log);
    setProgress((p) => {
      if (!p || p.introduced.includes(familyId)) return p;
      const size = content.familyById.get(familyId)!.sentences.length;
      const next = { ...p, introduced: [...p.introduced, familyId], newCredit: p.newCredit - size };
      void storeRef.current!.saveProgress(next);
      return next;
    });
  };

  const onReview = async (id: string, grade: Grade, meta: { durationMs: number; format: Format; errorTags: string[]; autoGrade: Grade }) => {
    const now = new Date();
    const trace = traces.current.get(id)!;
    const r = review(f, trace, grade, now, meta);
    const updated = [r.trace];
    // Production unlocks once comprehension is stable; it starts tomorrow so siblings never share a day.
    const pid = traceId(trace.sentenceId, 'production');
    if (trace.kind === 'comprehension' && r.trace.card.state === State.Review && r.trace.card.stability >= PRODUCTION_UNLOCK_DAYS && !traces.current.has(pid)) {
      updated.push(newTrace(trace.sentenceId, 'production', now, startOfDay(addDays(now, 1))));
    }
    await commit(updated, r.log);
  };

  const onActivity = (ms: number) => {
    setProgress((p) => {
      if (!p) return p;
      const k = dayKey(new Date());
      const day = p.days[k] ?? { ms: 0, completed: false };
      const next = { ...p, days: { ...p.days, [k]: { ...day, ms: day.ms + ms } } };
      void storeRef.current!.saveProgress(next);
      return next;
    });
  };

  const onFinish = (completed: boolean) => {
    if (completed) {
      setProgress((p) => {
        if (!p) return p;
        const k = dayKey(new Date());
        const next = { ...p, days: { ...p.days, [k]: { ms: p.days[k]?.ms ?? 0, completed: true } } };
        void storeRef.current!.saveProgress(next);
        return next;
      });
    }
    setSession(null);
    setScreen(completed ? 'close' : 'home');
  };

  const start = () => {
    setSession({ queue: buildQueue(plan, content, traces.current, progress.introduced), estMin: plan.estMin });
    setScreen('session');
  };

  const saveSettings = async (s: Settings) => {
    await storeRef.current!.saveSettings(s);
    setSettings(s);
    setScreen('home');
  };

  const exportBackup = async () => {
    const data = await storeRef.current!.exportAll();
    const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `satz-backup-${dayKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (file: File) => {
    try {
      const raw = JSON.parse(await file.text());
      if (raw.app !== 'satz') throw new Error('This is not a Satz backup file.');
      await storeRef.current!.importAll(raw);
      await load();
    } catch (e) {
      setError(String(e));
    }
  };

  if (screen === 'setup' || screen === 'settings') {
    return <Setup settings={settings} first={screen === 'setup'} voices={voices} onSave={saveSettings} persistent={storeRef.current?.persistent ?? true}
      onCancel={() => setScreen('home')} onExport={exportBackup} onImport={importBackup}
      account={account} onLogout={onLogout} onDeleteAccount={onDeleteAccount} onSignIn={() => setScreen('auth')} />;
  }

  if (screen === 'session' && session) {
    return <Session sync={sync} content={content} initialQueue={session.queue} traces={traces.current} voices={voices}
      speaking={settings.speaking} estMin={session.estMin} formatSeen={formatSeen}
      onIntro={onIntro} onReview={onReview} onActivity={onActivity} onFinish={onFinish} />;
  }

  if (screen === 'close') {
    const now = new Date();
    const r = trueRetention(log, now);
    const tomorrow = new Date(startOfDay(addDays(now, 1)).getTime() + 9 * 3600_000);
    const tomorrowPlan = makePlan({
      now: tomorrow, budgetMin: settings.budgetMin, traces: [...traces.current.values()], families: content.families,
      introducedFamilies: plannedFamilies(progress, settings), secPerReview, newCredit: accrueCredit(progress.newCredit, settings.budgetMin), f,
    });
    return (
      <main className="screen close">
        <SessionClose recallPct={r == null ? null : Math.round(r * 100)} total={sentencesStarted} nextCheckpoint={nextCheckpoint(sentencesStarted)} tomorrowMin={tomorrowPlan.estMin} />
        <div className="task-next"><Button variant="primary" onClick={() => setScreen('home')}>Done</Button></div>
      </main>
    );
  }

  const introducedIds = plannedFamilies(progress, settings);
  return (
    <Home skipped={skippedSentences(progress, settings)} sync={sync} onSignIn={() => setScreen('auth')} persistent={storeRef.current?.persistent ?? true} plan={plan} sentences={sentencesStarted} streak={streak(progress.days, new Date())} cue={settings.cue}
      contentLeft={content.families.some((fam) => !introducedIds.has(fam.id))} onStart={start} onSettings={() => setScreen('settings')} />
  );
}
