# Satz — 3,000 German sentences

A free language app that teaches the 3,000 most useful German sentences through retrieval practice, FSRS-6 spaced repetition and guided comparison of sentence patterns. Each learner has an account, so progress is saved on the server and follows them to any device.

| Folder | What |
|---|---|
| `app/` | The web app (React + TypeScript, installable as a PWA). |
| `server/` | The account server: login, saved progress, and it serves the built app. Plain Node.js with its built-in SQLite, no other dependencies. |
| `content/de/src/` | The German sentences, in a plain-text format anyone can read and correct. |
| `content/de/pack.json` | The compiled content the app loads (generated; edit the `src/` files instead). |
| `design-system/project/` | The Satz design system: tokens, brand book and components. |
| `docs/blueprint.md` | The product and learning-science blueprint. |

## Run it on your computer

You need **Node.js 22.13 or newer** ([nodejs.org](https://nodejs.org), choose the LTS version). Check with `node --version`.

```sh
git clone https://github.com/MohammedAboelsaoud/3000-Words-project.git
cd 3000-Words-project
git checkout claude/elegant-fermat-1tvszy   # until this branch is merged into main
npm run local
```

`npm run local` installs the app's packages, builds it, and starts the server. Then open **http://localhost:8080**, create an account and start.

- Next time, `npm start` is enough. Run `npm run build` first if you changed code or sentences.
- Progress is stored in `server/data/satz.db`. Back up that file to keep everyone's progress.
- To use the app from your phone on the same Wi-Fi, open `http://<your computer's IP>:8080`. Browsers only allow the microphone on `localhost` or HTTPS, so speaking tasks work on the phone only once the app is hosted with HTTPS (below).

For development with live reload: `npm run dev`, then open http://localhost:5173.

Other commands: `npm test` runs every test (app, a 90-day workload simulation, and the server API). `npm run content:check` validates the sentences.

## Put it online

The app, the server and the database run as one small process, so anything that runs a Docker container or Node.js with a persistent disk can host it.

```sh
docker build -t satz .
docker run -d -p 8080:8080 -v satz-data:/data -e COOKIE_SECURE=1 -e TRUST_PROXY=1 --restart unless-stopped satz
```

Put it behind HTTPS: `COOKIE_SECURE=1` makes the login cookie HTTPS-only, and the microphone needs HTTPS. Free or cheap ways to do that:

- **Your own computer + Cloudflare Tunnel:** run `npm start`, then `cloudflared tunnel --url http://localhost:8080` gives you a public HTTPS address at no cost. The app is only online while your computer is.
- **A small virtual server** (for example a free-tier VM from Oracle Cloud or Google Cloud, or a paid one from Hetzner or similar): install Docker, run the command above, and put Caddy in front for automatic HTTPS.
- **Platforms such as Fly.io, Railway or Render:** deploy the Dockerfile and attach a persistent volume at `/data`. Without a volume, accounts are lost on every restart. Check each platform's current prices and free limits.

Server settings (environment variables):

| Variable | Default | Meaning |
|---|---|---|
| `PORT` | `8080` | Port to listen on |
| `DATA_DIR` | `server/data` (`/data` in Docker) | Where the database lives |
| `COOKIE_SECURE` | off | `1` when served over HTTPS |
| `TRUST_PROXY` | off | `1` behind a reverse proxy, so rate limits see real client addresses |
| `ALLOW_SIGNUP` | on | `0` to stop new accounts, for example once your own accounts exist |

## Accounts and privacy

- Email and password. Passwords are hashed with scrypt, sessions are random tokens stored only as hashes, and login attempts are rate-limited.
- Each account has its own settings, FSRS memory state and an append-only review log. Settings can download a full backup, restore one, or delete the account for good.
- "Continue without an account" keeps progress in that browser only. Creating an account later moves that progress into the account.
- There is no password reset by email yet, because sending email needs a mail service.
- Speaking tasks use the browser's speech recognition. In Chrome, audio goes to Google to be transcribed. Satz keeps only the transcript and the grade.

## How a day works

1. The home screen shows one button: **Start · N min**.
2. The planner fills the session with the day's due reviews, then new pattern families as the budget allows (about 6–7 new sentences a day at 30 minutes). A new learner can start at Band 1, 2, 3 or 4.
3. For each new sentence you listen with the text hidden, guess the meaning, see the answer, and shadow it (say it along with the audio). Then you spot what the family shares, read a one-line rule, and see a pair of sentences that differ in one place.
4. New sentences come back after 1 and 10 minutes. After that, FSRS-6 (target: remember 90%) decides when each is due.
5. Every sentence has two memories: comprehension (pick the meaning, dictation) and production (write it, fill the gap, say it). Production starts once comprehension has held for 7 days.
6. Answers are graded automatically:
   - *ae/oe/ue/ss* is accepted for *ä/ö/ü/ß*.
   - One slip (a capital letter, one letter, or an article ending) is graded Hard.
   - A wrong or missing word is graded Again.
   - You can change any grade.
7. If the day's reviews don't fit in the budget, recovery mode starts: new sentences pause, the most-forgotten sentences come first, and the app shows the date you'll be back on track.

## Content

**3,051 sentences in 757 pattern families**, each with an English translation:

| Band | Sentences | Level | Focus |
|---|---|---|---|
| 1 · Survival | 310 | Pre-A1 → A1 | Greetings, repair phrases, numbers, café, prices, directions, hotel, emergencies |
| 2 · Foundations | 652 | A1 | Present tense, verb-second order, questions, modal verbs, accusative, separable verbs, daily life |
| 3 · Everyday life | 1,033 | A2 | Perfekt, dative, place prepositions, reflexive verbs, comparisons, polite requests, spoken particles |
| 4 · Threshold | 1,056 | A2+ → B1 | weil/dass/wenn/ob clauses, Konjunktiv II, relative clauses, Präteritum, passive, opinions, work, society |

The sentences were written for this app, not taken from a corpus: the build environment could not reach Tatoeba. **They are drafts and need review by a native German speaker.** A sentence file looks like this:

```
# cafe | Ich hätte gern ___. | Ich hätte gern + a thing = the polite “I'd like”.
= Ich hätte gern [einen] Kaffee. || Ich hätte gern [ein] Wasser. || Kaffee is a der-word → einen.
Ich hätte gern [einen Kaffee]. | I'd like a coffee. | Ich hätte gerne einen Kaffee.
```

The format is:
- `#` starts a family: theme | frame | rule.
- `=` is a one-change pair: sentence A || sentence B || what changed.
- Every other line is one sentence: German | English | other accepted answers.
- `[brackets]` mark the part that changes or is new.

Fix a sentence in `content/de/src/*.txt`, then run `npm run content:check`. Each sentence's id comes from its text, so a corrected sentence counts as a new card; learners' other progress is untouched.

Coverage against the OpenSubtitles frequency list (FrequencyWords, used for statistics only): the sentences contain 98% of the 100 most frequent German word forms, 88% of the top 500 and 74% of the top 1,000. Most of what's missing is film vocabulary (*töten, verdammt, Captain*) or inflected forms of words that are included.

## Not built yet

- Checkpoint tests (retention, listening with an unfamiliar voice, speaking) at 1,000, 2,000 and 3,000.
- Per-learner FSRS parameter optimisation (it needs a few hundred reviews per learner first).
- Recorded or neural audio with several voices, and pictures for sentences that can be pictured. Both cost money; the app uses the device's own German voices.
- Password reset by email; offline answering while logged in.
