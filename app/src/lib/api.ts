// Accounts and server-side progress. The server is the source of truth for a logged-in
// learner; writes go through an ordered queue that retries when the connection drops.
import type { ReviewLog, Trace } from './scheduler';
import { DEFAULT_PROGRESS, DEFAULT_SETTINGS, type AppStore, type Progress, type Settings, type Snapshot } from './store';

export interface User { id: number; email: string }

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.error ?? `Request failed (${res.status}).`);
  return data as T;
}

/** 'server' when an account server answers; 'none' when the app is served without one. */
export async function currentUser(): Promise<{ server: boolean; user: User | null }> {
  try {
    const res = await fetch('/api/me', { credentials: 'same-origin' });
    if (res.ok) return { server: true, user: (await res.json()).user };
    // A static host answers 404 (or returns index.html); only 401 means "server, not logged in".
    return { server: res.status === 401, user: null };
  } catch {
    return { server: false, user: null };
  }
}

export const signup = (email: string, password: string) => call<{ user: User }>('POST', '/api/auth/signup', { email, password }).then((r) => r.user);
export const login = (email: string, password: string) => call<{ user: User }>('POST', '/api/auth/login', { email, password }).then((r) => r.user);
export const logout = () => call('POST', '/api/auth/logout', {});
export const deleteAccount = (password: string) => call('POST', '/api/account/delete', { password });

function reviveTrace(t: Trace): Trace {
  return { ...t, card: { ...t.card, due: new Date(t.card.due), last_review: t.card.last_review ? new Date(t.card.last_review) : undefined } };
}
function reviveLog(l: ReviewLog): ReviewLog {
  return { ...l, reviewedAt: new Date(l.reviewedAt) };
}

export type SyncStatus = 'saved' | 'saving' | 'retrying' | 'signed-out';

type Op = { kind: 'review' | 'settings' | 'progress'; run: () => Promise<unknown> };

export class ApiStore implements AppStore {
  readonly persistent = true;
  private ops: Op[] = [];
  private flushing = false;
  private retryMs = 2000;
  private listeners = new Set<(s: SyncStatus) => void>();
  status: SyncStatus = 'saved';

  constructor(public user: User) {}

  onStatus(fn: (s: SyncStatus) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  get pending(): number {
    return this.ops.length;
  }

  private setStatus(s: SyncStatus) {
    this.status = s;
    for (const fn of this.listeners) fn(s);
  }

  private enqueue(op: Op): Promise<void> {
    // Settings and progress are whole documents: a newer save replaces a queued one.
    if (op.kind !== 'review') {
      const i = this.ops.findIndex((o, idx) => idx > 0 && o.kind === op.kind);
      if (i >= 0) this.ops.splice(i, 1);
    }
    this.ops.push(op);
    void this.flush();
    return Promise.resolve();
  }

  private async flush() {
    if (this.flushing) return;
    this.flushing = true;
    this.setStatus('saving');
    while (this.ops.length) {
      try {
        await this.ops[0].run();
        this.ops.shift();
        this.retryMs = 2000;
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          this.flushing = false;
          this.setStatus('signed-out');
          return;
        }
        if (e instanceof ApiError && e.status >= 400 && e.status < 500) {
          // The server refused this write for good; drop it rather than retry forever.
          console.error('Dropped a save the server refused:', e.message);
          this.ops.shift();
          continue;
        }
        this.setStatus('retrying');
        await new Promise((r) => setTimeout(r, this.retryMs));
        this.retryMs = Math.min(this.retryMs * 2, 60_000);
      }
    }
    this.flushing = false;
    this.setStatus('saved');
  }

  async load(): Promise<Snapshot> {
    const s = await call<{ settings: Settings | null; progress: Progress | null; traces: Trace[]; log: ReviewLog[] }>('GET', '/api/state');
    return {
      settings: { ...DEFAULT_SETTINGS, ...s.settings },
      progress: { ...DEFAULT_PROGRESS, ...s.progress },
      traces: s.traces.map(reviveTrace),
      log: s.log.map(reviveLog),
    };
  }

  commitReview(traces: Trace[], log: ReviewLog | null) {
    return this.enqueue({ kind: 'review', run: () => call('POST', '/api/reviews', { traces, log }) });
  }

  saveSettings(s: Settings) {
    return this.enqueue({ kind: 'settings', run: () => call('PUT', '/api/settings', s) });
  }

  saveProgress(p: Progress) {
    return this.enqueue({ kind: 'progress', run: () => call('PUT', '/api/progress', p) });
  }

  exportAll(): Promise<object> {
    return call('GET', '/api/export');
  }

  async importAll(raw: Snapshot): Promise<void> {
    await call('POST', '/api/import', raw);
  }
}
