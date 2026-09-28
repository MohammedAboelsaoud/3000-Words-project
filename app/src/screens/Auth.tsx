// Log in / create an account. Progress is saved to the account on the server.
import { useState } from 'react';
import { ApiError, login, signup, type User } from '../lib/api';
import { Button } from '../ui/ds';

export function Auth(props: { onAuthed(user: User, created: boolean): void; onGuest?(): void; hasLocalProgress?: boolean }) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = mode === 'signup' ? await signup(email, password) : await login(email, password);
      props.onAuthed(user, mode === 'signup');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Can’t reach the server. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="screen auth">
      <header className="auth-head">
        <p className="wordmark" lang="de">Satz</p>
        <p className="home-title">German, one sentence at a time.</p>
        <p className="muted">Your account keeps your progress, so you can continue on any device.</p>
      </header>

      <div className="seg" role="tablist" aria-label="Account">
        <button type="button" role="tab" aria-selected={mode === 'signup'} className={'seg-btn' + (mode === 'signup' ? ' is-on' : '')} onClick={() => setMode('signup')}>Create account</button>
        <button type="button" role="tab" aria-selected={mode === 'login'} className={'seg-btn' + (mode === 'login' ? ' is-on' : '')} onClick={() => setMode('login')}>Log in</button>
      </div>

      <form className="auth-form" onSubmit={submit}>
        <label className="field">
          <span className="field-l">Email</span>
          <input id="email" className="text-input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">
          <span className="field-l">Password</span>
          <input id="password" className="text-input" type="password" required minLength={mode === 'signup' ? 8 : undefined}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} />
          {mode === 'signup' && <span className="muted">At least 8 characters.</span>}
        </label>
        {mode === 'signup' && props.hasLocalProgress && <p className="muted">The progress you made on this device moves into your new account.</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="task-next">
          <Button variant="primary" type="submit" disabled={busy}>{busy ? 'One moment…' : mode === 'signup' ? 'Create account' : 'Log in'}</Button>
        </div>
      </form>

      {props.onGuest && (
        <p className="muted auth-guest">
          <button type="button" className="sz-link" onClick={props.onGuest}>Continue without an account</button> — progress stays in this browser only.
        </p>
      )}
    </main>
  );
}
