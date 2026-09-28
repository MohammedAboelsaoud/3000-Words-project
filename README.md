# Satz — 3,000 sentences

A free language app that teaches the 3,000 most useful sentences of a language through retrieval practice, FSRS-6 spaced repetition and guided comparison of sentence patterns. German first, with English glosses.

| Folder | What |
|---|---|
| `docs/blueprint.md` | The product and learning-science blueprint: what the app does and why. |
| `content/de/` | German content packs: pattern families of sentences with English glosses. |
| `app/` | The web app (React + TypeScript PWA). Runs entirely in the browser. |
| `design-system/project/` | The Satz design system: tokens, brand book and components. The app uses its stylesheet. |

## Run it

```sh
cd app
npm install
npm run dev          # http://localhost:5173
npm test             # unit tests + a 90-day workload simulation
npm run content:check
```

`npm run build:artifact` packs the app into one self-contained page (`app/dist-artifact/satz.html`) for hosting as a claude.ai artifact. That version skips speaking tasks (the hosted frame has no microphone) and backups.

Speaking tasks need Chrome or Edge (browser speech recognition). Audio uses the German voices installed on the device.

## How a day works

1. The home screen shows one button: **Start · N min**.
2. The planner fills the session with the day's due reviews, then adds new pattern families as the 30-minute budget allows: about 6–7 new sentences a day at steady state. Early sessions are short on purpose, because each new sentence adds about 3 minutes a day of future reviews.
3. For each new sentence you listen with the text hidden, guess the meaning, see the answer, and shadow it (say it along with the audio). Then you spot the part the family shares, read a one-line rule, and see a pair of sentences that differ in one place.
4. New sentences come back after 1 and 10 minutes. After that, FSRS-6 (target: remember 90%) decides when each one is due.
5. Every sentence has two memories: **comprehension** (pick the meaning, dictation) and **production** (write it, fill the gap, say it). Production unlocks once comprehension has held for 7 days. The two memories of one sentence never fall on the same day.
6. Answers are graded automatically:
   - *ae/oe/ue/ss* is accepted for *ä/ö/ü/ß*.
   - One slip (a capital letter, one letter, or an article ending) is graded Hard.
   - A wrong or missing word is graded Again.
   - You can change any grade.
7. If the day's reviews don't fit in the budget, recovery mode starts: new sentences pause and the most-forgotten sentences come first. Each day is capped at 1.5× the budget, and the app shows the date you'll be back on track.

## Decisions taken

| Decision | Choice |
|---|---|
| Gloss language | English only |
| Free or paid | Free. Tatoeba audio and KELLY word lists are usable on non-commercial terms; FrequencyWords (CC BY-SA) is used for statistics only and is never shipped. |
| Daily budget | 30 min default (15/45/60 available); target retention 0.90, or 0.85 in Light mode |
| Where scheduling runs | In the browser (ts-fsrs, MIT). Data stays on the device in IndexedDB. The review log is append-only, and you can export and restore a backup file from Settings. |
| Audio | The browser's own text-to-speech voices (free). Slow audio is always followed by natural speed. |
| Speaking | Browser speech recognition, graded by word errors (0 = Good, 1 = Hard, 2+ = Again). In Chrome the audio goes to Google to be transcribed; the app says so. |
| Hosting | GitHub Pages via `.github/workflows/pages.yml` (enable Pages → Source: GitHub Actions). |

## Content status

`content/de/band1.json` has **171 sentences in 43 families** of Band 1 (Survival, sentences 1–300): greetings, thanks and apologies, asking for a repeat, introducing yourself, the café, prices, directions, time, transport, shopping, health and plans. It covers the 100-sentence checkpoint and most of the 300 one.

The sentences were written to fit the blueprint's rules. **They are drafts and need review by a native German speaker** before anyone relies on them. Tatoeba could not be reached from the build environment. When it can be, `scripts/check-content.mjs --freq <FrequencyWords de_50k.txt>` reports how frequent each sentence's new part is.

## Not built yet

- The rest of Band 1 (sentences 172–300) and Bands 2–4.
- Pre-generated neural audio with several voices, and images for sentences that can be pictured.
- Checkpoint tests (retention, listening with an unfamiliar voice, speaking).
- Per-user FSRS parameter optimisation (it needs a few hundred reviews first).
- Monday review, fresh-start messages and reminders.
