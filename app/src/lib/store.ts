// IndexedDB persistence. The review log is append-only; traces are a cache that can be
// rebuilt from it; small settings and progress live in a key-value store.
import type { DayRecord } from './progress';
import type { ReviewLog, Trace } from './scheduler';

const DB_NAME = 'satz';
const DB_VERSION = 1;

export interface Settings {
  budgetMin: number;
  retention: number;
  /** "When I …, I do today's session." */
  cue: string;
  speaking: boolean;
  onboarded: boolean;
}

export interface Progress {
  /** Family ids in the order they were introduced. */
  introduced: string[];
  newCredit: number;
  /** Day the credit was last accrued (YYYY-MM-DD). */
  creditDay: string | null;
  /** Day recovery mode last ended, for the ramp back up. */
  recoveredDay: string | null;
  /** Mode of the last planned day, to notice when recovery ends. */
  lastMode: 'normal' | 'recovery';
  days: Record<string, DayRecord>;
}

export const DEFAULT_SETTINGS: Settings = { budgetMin: 30, retention: 0.9, cue: '', speaking: true, onboarded: false };
export const DEFAULT_PROGRESS: Progress = { introduced: [], newCredit: 0, creditDay: null, recoveredDay: null, lastMode: 'normal', days: {} };

function req<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export class Store implements AppStore {
  readonly persistent = true;
  private constructor(private db: IDBDatabase) {}

  static async open(name = DB_NAME): Promise<Store> {
    const open = indexedDB.open(name, DB_VERSION);
    open.onupgradeneeded = () => {
      const db = open.result;
      db.createObjectStore('traces', { keyPath: 'id' });
      db.createObjectStore('log', { autoIncrement: true });
      db.createObjectStore('kv');
    };
    return new Store(await req(open));
  }

  async load(): Promise<Snapshot> {
    const tx = this.db.transaction(['traces', 'log', 'kv'], 'readonly');
    const [traces, log, settings, progress] = await Promise.all([
      req(tx.objectStore('traces').getAll() as IDBRequest<Trace[]>),
      req(tx.objectStore('log').getAll() as IDBRequest<ReviewLog[]>),
      req(tx.objectStore('kv').get('settings') as IDBRequest<Settings | undefined>),
      req(tx.objectStore('kv').get('progress') as IDBRequest<Progress | undefined>),
    ]);
    return {
      traces,
      log,
      settings: { ...DEFAULT_SETTINGS, ...settings },
      progress: { ...DEFAULT_PROGRESS, ...progress },
    };
  }

  /** One review: update the trace(s) and append to the log in a single transaction. */
  async commitReview(traces: Trace[], log: ReviewLog | null): Promise<void> {
    const tx = this.db.transaction(['traces', 'log'], 'readwrite');
    for (const t of traces) tx.objectStore('traces').put(t);
    if (log) tx.objectStore('log').add(log);
    await done(tx);
  }

  async saveSettings(s: Settings): Promise<void> {
    const tx = this.db.transaction('kv', 'readwrite');
    tx.objectStore('kv').put(s, 'settings');
    await done(tx);
  }

  async saveProgress(p: Progress): Promise<void> {
    const tx = this.db.transaction('kv', 'readwrite');
    tx.objectStore('kv').put(p, 'progress');
    await done(tx);
  }

  /** Everything, for a backup file. */
  async exportAll(): Promise<object> {
    const data = await this.load();
    return { app: 'satz', version: 1, exportedAt: new Date().toISOString(), ...data };
  }

  /** Replace everything with a backup (dates arrive as strings from JSON). */
  async importAll(raw: Snapshot): Promise<void> {
    const tx = this.db.transaction(['traces', 'log', 'kv'], 'readwrite');
    tx.objectStore('traces').clear();
    tx.objectStore('log').clear();
    for (const t of raw.traces) {
      const card = { ...t.card, due: new Date(t.card.due), last_review: t.card.last_review ? new Date(t.card.last_review) : undefined };
      tx.objectStore('traces').put({ ...t, card });
    }
    for (const l of raw.log) tx.objectStore('log').add({ ...l, reviewedAt: new Date(l.reviewedAt) });
    tx.objectStore('kv').put(raw.settings, 'settings');
    tx.objectStore('kv').put(raw.progress, 'progress');
    await done(tx);
  }
}

export type Snapshot = { settings: Settings; progress: Progress; traces: Trace[]; log: ReviewLog[] };

/** What the app needs from storage; both stores below provide it. */
export interface AppStore {
  /** False when progress only lives until the page is closed. */
  readonly persistent: boolean;
  load(): Promise<Snapshot>;
  commitReview(traces: Trace[], log: ReviewLog | null): Promise<void>;
  saveSettings(s: Settings): Promise<void>;
  saveProgress(p: Progress): Promise<void>;
  exportAll(): Promise<object>;
  importAll(raw: Snapshot): Promise<void>;
}

/** Fallback when the browser blocks IndexedDB (private windows, blocked site data). */
export class MemoryStore implements AppStore {
  readonly persistent = false;
  private traces = new Map<string, Trace>();
  private log: ReviewLog[] = [];
  private settings: Settings = { ...DEFAULT_SETTINGS };
  private progress: Progress = { ...DEFAULT_PROGRESS };

  async load(): Promise<Snapshot> {
    return { settings: this.settings, progress: this.progress, traces: [...this.traces.values()], log: this.log.slice() };
  }
  async commitReview(traces: Trace[], log: ReviewLog | null) {
    for (const t of traces) this.traces.set(t.id, t);
    if (log) this.log.push(log);
  }
  async saveSettings(s: Settings) { this.settings = s; }
  async saveProgress(p: Progress) { this.progress = p; }
  async exportAll() { return { app: 'satz', version: 1, exportedAt: new Date().toISOString(), ...(await this.load()) }; }
  async importAll(raw: Snapshot) {
    this.traces = new Map(raw.traces.map((t) => [t.id, { ...t, card: { ...t.card, due: new Date(t.card.due), last_review: t.card.last_review ? new Date(t.card.last_review) : undefined } }]));
    this.log = raw.log.map((l) => ({ ...l, reviewedAt: new Date(l.reviewedAt) }));
    this.settings = raw.settings;
    this.progress = raw.progress;
  }
}

/** IndexedDB when the browser allows it, otherwise an in-memory store. */
export async function openStore(): Promise<AppStore> {
  try {
    return await Store.open();
  } catch {
    return new MemoryStore();
  }
}
