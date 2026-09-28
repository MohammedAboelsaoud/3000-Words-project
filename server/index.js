// Starts the Satz server: the API plus the built app.
//   PORT           port to listen on (default 8080)
//   DATA_DIR       where the SQLite database lives (default ./data next to this file)
//   STATIC_DIR     the built app (default ../app/dist)
//   COOKIE_SECURE  "1" to mark the login cookie Secure (set this when serving over HTTPS)
//   TRUST_PROXY    "1" when running behind a reverse proxy that sets X-Forwarded-For
//   ALLOW_SIGNUP   "0" to stop new accounts being created
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { openDb } from './db.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? 8080);
const dataDir = path.resolve(process.env.DATA_DIR ?? path.join(here, 'data'));
const staticDir = path.resolve(process.env.STATIC_DIR ?? path.join(here, '../app/dist'));

const db = openDb(path.join(dataDir, 'satz.db'));
db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(new Date().toISOString());

const handle = createApp({
  db,
  staticDir,
  secureCookies: process.env.COOKIE_SECURE === '1',
  trustProxy: process.env.TRUST_PROXY === '1',
  allowSignup: process.env.ALLOW_SIGNUP !== '0',
});

http.createServer(handle).listen(port, () => {
  console.log(`Satz is running at http://localhost:${port}`);
  console.log(`Database: ${path.join(dataDir, 'satz.db')}`);
});
