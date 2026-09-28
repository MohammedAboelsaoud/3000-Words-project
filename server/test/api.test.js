import assert from 'node:assert/strict';
import http from 'node:http';
import { after, before, test } from 'node:test';
import { createApp } from '../app.js';
import { openDb } from '../db.js';

let server;
let base;
before(async () => {
  server = http.createServer(createApp({ db: openDb(':memory:') }));
  await new Promise((r) => server.listen(0, r));
  base = `http://localhost:${server.address().port}`;
});
after(() => server.close());

function client() {
  let cookie = '';
  return async (method, path, body, headers = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}), ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0];
    return { status: res.status, body: await res.json().catch(() => null) };
  };
}

test('sign up, save progress, log out, log back in and read it', async () => {
  const c = client();
  assert.equal((await c('GET', '/api/me')).status, 401);
  const signup = await c('POST', '/api/auth/signup', { email: 'Lena@example.com', password: 'long-enough' });
  assert.equal(signup.status, 201);
  assert.equal((await c('GET', '/api/me')).body.user.email, 'Lena@example.com');

  const trace = { id: 'de-1:c', sentenceId: 'de-1', kind: 'comprehension', card: { due: new Date().toISOString(), stability: 1 } };
  const log = { traceId: 'de-1:c', reviewedAt: new Date().toISOString(), grade: 'again', format: 'intro' };
  assert.equal((await c('POST', '/api/reviews', { traces: [trace], log })).status, 200);
  assert.equal((await c('PUT', '/api/settings', { budgetMin: 45, onboarded: true })).status, 200);
  assert.equal((await c('PUT', '/api/progress', { introduced: ['f001'] })).status, 200);
  assert.equal((await c('POST', '/api/auth/logout', {})).status, 200);
  assert.equal((await c('GET', '/api/state')).status, 401);

  assert.equal((await c('POST', '/api/auth/login', { email: 'lena@EXAMPLE.com', password: 'long-enough' })).status, 200);
  const state = (await c('GET', '/api/state')).body;
  assert.equal(state.traces[0].id, 'de-1:c');
  assert.equal(state.log.length, 1);
  assert.equal(state.settings.budgetMin, 45);
  assert.deepEqual(state.progress.introduced, ['f001']);
});

test('accounts are separate', async () => {
  const a = client();
  const b = client();
  await a('POST', '/api/auth/signup', { email: 'a@example.com', password: 'password-a' });
  await b('POST', '/api/auth/signup', { email: 'b@example.com', password: 'password-b' });
  await a('PUT', '/api/settings', { budgetMin: 15 });
  assert.equal((await b('GET', '/api/state')).body.settings, null);
});

test('rejects bad credentials, duplicates, weak passwords and cross-site writes', async () => {
  const c = client();
  await c('POST', '/api/auth/signup', { email: 'x@example.com', password: 'password-x' });
  assert.equal((await client()('POST', '/api/auth/signup', { email: 'X@example.com', password: 'password-y' })).status, 409);
  assert.equal((await client()('POST', '/api/auth/signup', { email: 'y@example.com', password: 'short' })).status, 400);
  assert.equal((await client()('POST', '/api/auth/login', { email: 'x@example.com', password: 'wrong-password' })).status, 401);
  assert.equal((await client()('POST', '/api/auth/login', { email: 'nobody@example.com', password: 'whatever1' })).status, 401);
  assert.equal((await c('PUT', '/api/settings', { budgetMin: 30 }, { Origin: 'https://evil.example' })).status, 403);
  assert.equal((await c('POST', '/api/reviews', { traces: [{ id: 1 }] })).status, 400);
});

test('import replaces progress; account deletion needs the password', async () => {
  const c = client();
  await c('POST', '/api/auth/signup', { email: 'imp@example.com', password: 'password-i' });
  const traces = [1, 2, 3].map((i) => ({ id: `de-${i}:c`, sentenceId: `de-${i}`, kind: 'comprehension', card: { due: new Date().toISOString() } }));
  const log = traces.map((t) => ({ traceId: t.id, reviewedAt: new Date().toISOString(), grade: 'good' }));
  assert.equal((await c('POST', '/api/import', { traces, log, settings: { budgetMin: 60 }, progress: { introduced: [] } })).body.traces, 3);
  assert.equal((await c('GET', '/api/state')).body.traces.length, 3);
  assert.equal((await c('POST', '/api/account/delete', { password: 'nope' })).status, 401);
  assert.equal((await c('POST', '/api/account/delete', { password: 'password-i' })).status, 200);
  assert.equal((await c('GET', '/api/me')).status, 401);
});

test('static files cannot escape the app folder', async () => {
  const res = await fetch(base + '/%2e%2e/%2e%2e/etc/passwd');
  assert.notEqual(res.status, 200);
});
