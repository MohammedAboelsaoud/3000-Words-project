// HTTP API + static file server for Satz. No framework: node:http and node:sqlite only.
import fs from 'node:fs';
import path from 'node:path';
import {
  createSession, deleteSession, DUMMY_HASH, hashPassword, rateLimiter, SESSION_DAYS, userForToken,
  validEmail, validPassword, verifyPassword,
} from './auth.js';
import { tx } from './db.js';

const COOKIE = 'satz_session';
const MAX_BODY = 256 * 1024;
const MAX_IMPORT_BODY = 50 * 1024 * 1024;
/** How much of the review log the client receives (it only needs recent history). */
const LOG_WINDOW_DAYS = 90;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2',
};

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function send(res, status, body, headers = {}) {
  const data = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(data);
}

async function readJson(req, limit) {
  const type = req.headers['content-type'] ?? '';
  if (!type.startsWith('application/json')) throw new HttpError(415, 'Send JSON.');
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new HttpError(413, 'Request too large.');
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    throw new HttpError(400, 'Invalid JSON.');
  }
}

// ---- Payload checks -------------------------------------------------------------------

const isStr = (v, max = 200) => typeof v === 'string' && v.length > 0 && v.length <= max;

function checkTrace(t) {
  if (!t || typeof t !== 'object' || !isStr(t.id, 80) || !isStr(t.sentenceId, 64) || !['comprehension', 'production'].includes(t.kind)
    || !t.card || typeof t.card !== 'object' || !isStr(String(t.card.due), 40)) {
    throw new HttpError(400, 'Invalid trace.');
  }
  return t;
}

function checkLog(l) {
  if (!l || typeof l !== 'object' || !isStr(l.traceId, 80) || !isStr(String(l.reviewedAt), 40) || !['again', 'hard', 'good', 'easy'].includes(l.grade)) {
    throw new HttpError(400, 'Invalid review.');
  }
  return l;
}

function checkDoc(v, max = 512 * 1024) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new HttpError(400, 'Invalid document.');
  const s = JSON.stringify(v);
  if (s.length > max) throw new HttpError(413, 'Document too large.');
  return s;
}

// ---- The app ------------------------------------------------------------------------------

/**
 * @param {{ db: import('node:sqlite').DatabaseSync, staticDir?: string, secureCookies?: boolean, allowSignup?: boolean, trustProxy?: boolean }} opts
 */
export function createApp({ db, staticDir, secureCookies = false, allowSignup = true, trustProxy = false }) {
  /** Client address for rate limiting; behind a reverse proxy, the first X-Forwarded-For hop. */
  const clientIp = (req) => (trustProxy && String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim()) || req.socket.remoteAddress;
  const authLimit = rateLimiter(10, 15 * 60_000);
  const q = {
    userByEmail: db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?'),
    insertUser: db.prepare('INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)'),
    kvGet: db.prepare('SELECT key, value FROM kv WHERE user_id = ?'),
    kvPut: db.prepare('INSERT INTO kv (user_id, key, value) VALUES (?, ?, ?) ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value'),
    traces: db.prepare('SELECT data FROM traces WHERE user_id = ?'),
    tracePut: db.prepare('INSERT INTO traces (user_id, id, data) VALUES (?, ?, ?) ON CONFLICT(user_id, id) DO UPDATE SET data = excluded.data'),
    log: db.prepare('SELECT data FROM review_log WHERE user_id = ? AND reviewed_at >= ? ORDER BY id'),
    logCount: db.prepare('SELECT COUNT(*) AS n FROM review_log WHERE user_id = ?'),
    logAdd: db.prepare('INSERT INTO review_log (user_id, reviewed_at, data) VALUES (?, ?, ?)'),
  };

  const sessionCookie = (token, maxAge) =>
    `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secureCookies ? '; Secure' : ''}`;

  function requireUser(req) {
    const user = userForToken(db, parseCookies(req.headers.cookie)[COOKIE]);
    if (!user) throw new HttpError(401, 'Please log in.');
    return user;
  }

  /** Mutating requests must come from this site (JSON-only bodies already block plain cross-site forms). */
  function checkOrigin(req) {
    const origin = req.headers.origin;
    if (!origin) return;
    const host = req.headers['x-forwarded-host'] ?? req.headers.host;
    if (new URL(origin).host !== host) throw new HttpError(403, 'Cross-site request refused.');
  }

  function login(res, user, status = 200) {
    const { token } = createSession(db, user.id);
    send(res, status, { user: { id: user.id, email: user.email } }, { 'Set-Cookie': sessionCookie(token, SESSION_DAYS * 86_400) });
  }

  const routes = {
    'POST /api/auth/signup': async (req, res) => {
      if (!allowSignup) throw new HttpError(403, 'New accounts are closed on this server.');
      if (!authLimit('signup:' + clientIp(req))) throw new HttpError(429, 'Too many attempts. Try again in 15 minutes.');
      const { email, password } = await readJson(req, MAX_BODY);
      if (!validEmail(email)) throw new HttpError(400, 'Enter a valid email address.');
      if (!validPassword(password)) throw new HttpError(400, 'Use a password of at least 8 characters.');
      if (q.userByEmail.get(email.trim())) throw new HttpError(409, 'An account with this email already exists. Log in instead.');
      const { lastInsertRowid } = q.insertUser.run(email.trim(), hashPassword(password), new Date().toISOString());
      login(res, { id: Number(lastInsertRowid), email: email.trim() }, 201);
    },

    'POST /api/auth/login': async (req, res) => {
      const { email, password } = await readJson(req, MAX_BODY);
      const key = 'login:' + clientIp(req) + ':' + String(email).toLowerCase();
      if (!authLimit(key)) throw new HttpError(429, 'Too many attempts. Try again in 15 minutes.');
      const row = typeof email === 'string' ? q.userByEmail.get(email.trim()) : undefined;
      const ok = verifyPassword(String(password ?? ''), row?.password_hash ?? DUMMY_HASH) && !!row;
      if (!ok) throw new HttpError(401, 'That email and password don’t match an account.');
      login(res, row);
    },

    'POST /api/auth/logout': async (req, res) => {
      deleteSession(db, parseCookies(req.headers.cookie)[COOKIE]);
      send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie('', 0) });
    },

    'GET /api/health': async (req, res) => {
      send(res, 200, { ok: true });
    },

    'GET /api/me': async (req, res) => {
      send(res, 200, { user: requireUser(req) });
    },

    'GET /api/state': async (req, res) => {
      const user = requireUser(req);
      const kv = Object.fromEntries(q.kvGet.all(user.id).map((r) => [r.key, JSON.parse(r.value)]));
      const since = new Date(Date.now() - LOG_WINDOW_DAYS * 86_400_000).toISOString();
      send(res, 200, {
        settings: kv.settings ?? null,
        progress: kv.progress ?? null,
        traces: q.traces.all(user.id).map((r) => JSON.parse(r.data)),
        log: q.log.all(user.id, since).map((r) => JSON.parse(r.data)),
        reviewCount: q.logCount.get(user.id).n,
      });
    },

    'POST /api/reviews': async (req, res) => {
      const user = requireUser(req);
      const { traces = [], log = null } = await readJson(req, MAX_BODY);
      if (!Array.isArray(traces) || traces.length > 20) throw new HttpError(400, 'Invalid traces.');
      traces.forEach(checkTrace);
      if (log) checkLog(log);
      tx(db, () => {
        for (const t of traces) q.tracePut.run(user.id, t.id, JSON.stringify(t));
        if (log) q.logAdd.run(user.id, new Date(log.reviewedAt).toISOString(), JSON.stringify(log));
      });
      send(res, 200, { ok: true });
    },

    'PUT /api/settings': async (req, res) => {
      const user = requireUser(req);
      q.kvPut.run(user.id, 'settings', checkDoc(await readJson(req, MAX_BODY)));
      send(res, 200, { ok: true });
    },

    'PUT /api/progress': async (req, res) => {
      const user = requireUser(req);
      q.kvPut.run(user.id, 'progress', checkDoc(await readJson(req, MAX_BODY)));
      send(res, 200, { ok: true });
    },

    /** Replace everything (bringing a device's progress into the account, or restoring a backup). */
    'POST /api/import': async (req, res) => {
      const user = requireUser(req);
      const body = await readJson(req, MAX_IMPORT_BODY);
      const traces = Array.isArray(body.traces) ? body.traces.map(checkTrace) : [];
      const log = Array.isArray(body.log) ? body.log.map(checkLog) : [];
      const settings = body.settings ? checkDoc(body.settings) : null;
      const progress = body.progress ? checkDoc(body.progress) : null;
      tx(db, () => {
        db.prepare('DELETE FROM traces WHERE user_id = ?').run(user.id);
        db.prepare('DELETE FROM review_log WHERE user_id = ?').run(user.id);
        for (const t of traces) q.tracePut.run(user.id, t.id, JSON.stringify(t));
        for (const l of log) q.logAdd.run(user.id, new Date(l.reviewedAt).toISOString(), JSON.stringify(l));
        if (settings) q.kvPut.run(user.id, 'settings', settings);
        if (progress) q.kvPut.run(user.id, 'progress', progress);
      });
      send(res, 200, { ok: true, traces: traces.length, log: log.length });
    },

    /** Everything the account holds, including the full review log. */
    'GET /api/export': async (req, res) => {
      const user = requireUser(req);
      const kv = Object.fromEntries(q.kvGet.all(user.id).map((r) => [r.key, JSON.parse(r.value)]));
      send(res, 200, {
        app: 'satz', version: 1, exportedAt: new Date().toISOString(),
        settings: kv.settings ?? null, progress: kv.progress ?? null,
        traces: q.traces.all(user.id).map((r) => JSON.parse(r.data)),
        log: q.log.all(user.id, '').map((r) => JSON.parse(r.data)),
      }, { 'Content-Disposition': 'attachment; filename="satz-backup.json"' });
    },

    'POST /api/account/delete': async (req, res) => {
      const user = requireUser(req);
      const { password } = await readJson(req, MAX_BODY);
      const row = q.userByEmail.get(user.email);
      if (!row || !verifyPassword(String(password ?? ''), row.password_hash)) throw new HttpError(401, 'That password is not right.');
      db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
      send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie('', 0) });
    },
  };

  function serveStatic(req, res, pathname) {
    if (!staticDir) return send(res, 404, { error: 'Not found.' });
    const base = path.resolve(staticDir);
    const rel = decodeURIComponent(pathname).replace(/^\/+/, '');
    let file = path.resolve(base, rel);
    if (file !== base && !file.startsWith(base + path.sep)) return send(res, 400, { error: 'Bad path.' });
    if (!rel || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(staticDir, 'index.html'); // SPA fallback
    if (!fs.existsSync(file)) {
      res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('The app has not been built yet. Run "npm run build" first.');
    }
    const ext = path.extname(file);
    res.writeHead(200, {
      'Content-Type': MIME[ext] ?? 'application/octet-stream',
      'Cache-Control': rel.startsWith('assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
      'Content-Security-Policy': CSP,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'same-origin',
      'Permissions-Policy': 'microphone=(self), camera=(), geolocation=()',
    });
    fs.createReadStream(file).pipe(res);
  }

  return async function handle(req, res) {
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      if (url.pathname.startsWith('/api/')) {
        const route = routes[`${req.method} ${url.pathname}`];
        if (!route) throw new HttpError(404, 'Not found.');
        if (req.method !== 'GET') checkOrigin(req);
        await route(req, res);
        return;
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') throw new HttpError(405, 'Method not allowed.');
      serveStatic(req, res, url.pathname);
    } catch (e) {
      const status = e instanceof HttpError ? e.status : 500;
      if (status === 500) console.error(e);
      if (!res.headersSent) send(res, status, { error: status === 500 ? 'Something went wrong on the server.' : e.message });
      else res.end();
    }
  };
}
