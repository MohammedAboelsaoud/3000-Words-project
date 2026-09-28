// Onboarding (first run) and Settings share one form.
import { useRef, useState } from 'react';
import type { User } from '../lib/api';
import type { Settings } from '../lib/store';
import { recognitionAvailable, voiceName } from '../lib/speech';
import { Button } from '../ui/ds';

const BUDGETS = [15, 30, 45, 60];
const PACE: Record<number, string> = { 15: 'about 3 new sentences a day', 30: 'about 6–7 new sentences a day', 45: 'about 10 new sentences a day', 60: 'about 13 new sentences a day' };

export function Setup(props: {
  settings: Settings;
  first: boolean;
  voices: SpeechSynthesisVoice[];
  persistent: boolean;
  onSave(s: Settings): void;
  onCancel?(): void;
  onExport?(): void;
  onImport?(file: File): void;
  account?: { server: boolean; user: User | null };
  onLogout?(): void;
  onDeleteAccount?(password: string): Promise<void>;
  onSignIn?(): void;
}) {
  const [s, setS] = useState<Settings>(props.settings);
  const fileRef = useRef<HTMLInputElement>(null);
  const [deleting, setDeleting] = useState(false);
  const [delPassword, setDelPassword] = useState('');
  const [delError, setDelError] = useState<string | null>(null);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((x) => ({ ...x, [k]: v }));

  return (
    <main className="screen setup">
      {props.first ? (
        <header>
          <p className="wordmark" lang="de">Satz</p>
          <p className="home-title">German, one sentence at a time.</p>
          <p className="muted">Each day you press one button. Satz picks what to review and what is new, and checks your answers.</p>
        </header>
      ) : (
        <header className="home-top"><p className="home-title">Settings</p>{props.onCancel && <Button variant="text" onClick={props.onCancel}>Back</Button>}</header>
      )}

      <fieldset className="field">
        <legend>Minutes a day</legend>
        <div className="seg">
          {BUDGETS.map((b) => (
            <button key={b} type="button" className={'seg-btn' + (s.budgetMin === b ? ' is-on' : '')} aria-pressed={s.budgetMin === b} onClick={() => set('budgetMin', b)}>{b}</button>
          ))}
        </div>
        <p className="muted">{PACE[s.budgetMin]}. The whole path takes about 225 hours at any pace; minutes only set the calendar.</p>
      </fieldset>

      <label className="field">
        <span className="field-l">Your everyday cue</span>
        <span className="cue">When <input value={s.cue} onChange={(e) => set('cue', e.target.value)} placeholder="I finish breakfast" aria-label="Cue" />, I do today's session.</span>
        <span className="muted">Tying practice to something you already do builds the habit better than reminders.</span>
      </label>

      <fieldset className="field">
        <legend>Speaking</legend>
        <label className="check">
          <input type="checkbox" checked={s.speaking} onChange={(e) => set('speaking', e.target.checked)} />
          Include speaking tasks
        </label>
        <p className="muted">
          {import.meta.env.VITE_ARTIFACT
            ? 'Speaking tasks need the microphone, which this hosted version cannot use. Run the app from its own address to include them.'
            : recognitionAvailable()
            ? 'Your browser turns your voice into text to check it. In Chrome this audio goes to Google; Satz keeps only the transcript.'
            : 'This browser cannot check speech, so speaking tasks are skipped. Chrome and Edge support them.'}
        </p>
      </fieldset>

      {!props.first && (
        <fieldset className="field">
          <legend>Review load</legend>
          <label className="check">
            <input type="checkbox" checked={s.retention < 0.9} onChange={(e) => set('retention', e.target.checked ? 0.85 : 0.9)} />
            Light mode
          </label>
          <p className="muted">Aims to remember 85% instead of 90% of sentences: fewer reviews, a little more forgetting.</p>
        </fieldset>
      )}

      <div className="field">
        <span className="field-l">German voices on this device</span>
        <p className="muted">{props.voices.length ? props.voices.map((v) => voiceName(v)).join(', ') : 'None found. Install a German voice in your system settings to hear sentences.'}</p>
      </div>

      {!props.first && import.meta.env.VITE_ARTIFACT && (
        <div className="field">
          <span className="field-l">Where your progress lives</span>
          <p className="muted">{props.persistent ? 'In this browser on this device. Opening the app on another device starts fresh.' : 'Nowhere yet: this window blocks storage, so progress resets when you close it.'}</p>
        </div>
      )}

      {!props.first && !import.meta.env.VITE_ARTIFACT && (
        <div className="field">
          <span className="field-l">Backup</span>
          <p className="muted">{props.account?.user ? 'Your progress is saved to your account. You can also keep a copy as a file, or restore one (this replaces what the account holds).' : 'Your progress is stored only in this browser. Save a backup file to keep it safe or move it to another device.'}</p>
          <div className="row">
            <Button onClick={props.onExport}>Save backup</Button>
            <Button onClick={() => fileRef.current?.click()}>Restore backup</Button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) props.onImport?.(f); }} />
          </div>
        </div>
      )}

      {!props.first && props.account?.user && (
        <div className="field">
          <span className="field-l">Account</span>
          <p className="muted">Logged in as {props.account.user.email}. Your progress is saved to this account.</p>
          <div className="row">
            <Button onClick={props.onLogout}>Log out</Button>
            <Button variant="text" onClick={() => setDeleting((d) => !d)}>Delete account…</Button>
          </div>
          {deleting && (
            <form className="delete-box" onSubmit={async (e) => {
              e.preventDefault();
              setDelError(null);
              try { await props.onDeleteAccount?.(delPassword); } catch (err) { setDelError((err as Error).message); }
            }}>
              <p className="muted">This deletes your account and all its progress for good. Enter your password to confirm.</p>
              <input id="delete-password" className="text-input" type="password" autoComplete="current-password" aria-label="Password" value={delPassword} onChange={(e) => setDelPassword(e.target.value)} required />
              {delError && <p className="form-error" role="alert">{delError}</p>}
              <div className="row"><Button type="submit" className="danger">Delete my account</Button><Button variant="text" onClick={() => setDeleting(false)}>Cancel</Button></div>
            </form>
          )}
        </div>
      )}

      {!props.first && props.account?.server && !props.account.user && (
        <div className="field">
          <span className="field-l">Account</span>
          <p className="muted">You're practising without an account, so progress stays in this browser. Create an account to keep it safe and use it on other devices; your progress so far moves with you.</p>
          <div className="row"><Button onClick={props.onSignIn}>Create an account or log in</Button></div>
        </div>
      )}

      <div className="task-next">
        <Button variant="primary" onClick={() => props.onSave({ ...s, cue: s.cue.trim(), onboarded: true })}>{props.first ? 'Continue' : 'Save'}</Button>
      </div>
    </main>
  );
}
