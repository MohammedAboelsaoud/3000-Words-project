// Passwords (scrypt) and sessions (random tokens, stored only as hashes).
import crypto from 'node:crypto';

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };
export const SESSION_DAYS = 60;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p });
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString('base64')}$${key.toString('base64')}`;
}

export function verifyPassword(password, stored) {
  const [kind, N, r, p, salt, key] = stored.split('$');
  if (kind !== 'scrypt') return false;
  const expected = Buffer.from(key, 'base64');
  const got = crypto.scryptSync(password, Buffer.from(salt, 'base64'), expected.length, { N: +N, r: +r, p: +p });
  return crypto.timingSafeEqual(expected, got);
}

/** A dummy hash so unknown emails take as long as wrong passwords. */
export const DUMMY_HASH = hashPassword(crypto.randomBytes(12).toString('hex'));

export const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

export function createSession(db, userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 86_400_000);
  db.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
    .run(sha256(token), userId, now.toISOString(), expires.toISOString());
  return { token, expires };
}

export function userForToken(db, token) {
  if (!token) return null;
  const row = db.prepare(`SELECT u.id, u.email, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?`).get(sha256(token));
  if (!row) return null;
  if (new Date(row.expires_at) < new Date()) {
    db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
    return null;
  }
  return { id: row.id, email: row.email };
}

export function deleteSession(db, token) {
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
}

/** Small in-memory limiter: at most `max` attempts per key per window. */
export function rateLimiter(max, windowMs) {
  const hits = new Map();
  return (key) => {
    const now = Date.now();
    const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    list.push(now);
    hits.set(key, list);
    if (hits.size > 10_000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
    return list.length <= max;
  };
}

export function validEmail(email) {
  return typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validPassword(pw) {
  return typeof pw === 'string' && pw.length >= 8 && pw.length <= 200;
}
