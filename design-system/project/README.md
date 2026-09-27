Satz is a German-first app that teaches the 3,000 most useful sentences through recall, spacing and comparison. The learner presses one button; the app decides everything else. The design exists to keep attention on one sentence at a time and to be honest about progress.

## Principles

1. **One sentence, one task, one screen.** A screen holds a TaskHeader, one task and one next step. Nothing competes with the German sentence.
2. **Recall before reveal.** Every screen asks for an answer before it shows one. There is no "study mode" and no screen that is only for re-reading.
3. **One highlight.** `marker` fills exactly one slot or new chunk per sentence and is used for nothing else in the product. It is never used for emphasis, never on buttons, never on two parts of one sentence.
4. **Minutes, never piles.** Show time ("Today · 22 min"), never how many cards are due.
5. **Information, not rewards.** Feedback states facts ("You now recall 94% of 612 sentences"). No coins, XP, confetti or leaderboards.
6. **Honest ceilings.** The path ends at "a vocabulary and pattern foundation toward A2/B1", not at fluency.

## Content fundamentals

**Voice.** Calm, plain, second person ("you"). Short sentences. Sentence case everywhere. No exclamation marks in the interface, no emoji, no "Amazing!", no urgency ("Don't lose your streak!"). German gets its own capitals; the interface never uses Title Case.

**Instructions** are one imperative line and one reason line (TaskHeader):

- "Type what you hear." / "This trains your ear for words that run together."
- "Tap the part that stays the same." / "Seeing what repeats makes the pattern stick."
- "Say it." / "Speaking it aloud links the sound to the meaning."

**Feedback** names what happened, never judges the person:

- Do: "You now recall 94% of 612 sentences." · "388 to the 1,000 checkpoint." · "Tomorrow · about 24 min"
- Do: "Mostly clear. Retry: hätte" — scores are about being understood.
- Don't: "Wrong!", "Perfect!", "Native-like", "847 reviews due".

**After a gap:** "Welcome back. New sentences are paused while we catch up. Back on track by Thursday." Never mention how many days were missed.

**Grades** use the learner's words: Missed / Partly / Got it (self-grade, after the reveal) and Again / Hard / Good / Easy (the scheduler's grades, shown in GradeChip with a Change link).

**Numbers** use a thousands comma in English UI ("3,000") and tabular figures in `stat`.

## Languages and scripts

- German (the target) is always set in the `target` family (Literata) with `lang="de"`, using `sentence-lg` for the sentence in focus and `sentence` in lists. Interface text is never in Literata; German is never in Plex. This is how the eye finds the language being learned.
- Glosses are English or Arabic, set in `gloss` (IBM Plex Sans; Plex Sans Arabic carries Arabic at the same weight). Arabic glosses get `dir="rtl" lang="ar"`; the German stays LTR above it.
- Slots are written in content with square brackets — `"Ich hätte gern [die Rechnung]."` — and rendered by SlotText. One bracket pair per sentence.
- Literal glosses in the AlignmentStrip are `caption` size; mark words with no counterpart as `none` and words that move as `moves`.

## Visual foundations

**Colour.** Warm `paper` as the ground, `ink` for text, and one brand colour, `tinte` (German for ink), for the Start button, primary actions, links and focus. `tinte-soft` grounds the RuleCard and selected options. `marker` + `marker-edge` is the highlighter for the slot (principle 3). Grades: `good` is blue, `hard` is ochre, `again` is red — good is deliberately not green, so right and wrong never differ by red–green hue alone, and every grade also carries a word. The roadmap uses the teal ramp `band-1` … `band-4`; `band-1` sits below 3:1 on paper, so each band is always labelled with its name.

**Contrast.** Every text token's note names the grounds it reads on; each pair is at least 4.5:1 in both themes. `line` is decorative only; any border that marks a control uses `line-strong` (3:1).

**Type.** Three families: `target` (Literata) for German, `sans` (IBM Plex Sans + Plex Sans Arabic) for the interface and glosses, `mono` (IBM Plex Mono) for dictation diffs, where letters must line up. The scale: `display` 44 · `sentence-lg` 30 · `sentence` 22 · `title` 20 · `gloss` 17 · `body` 16 · `label` 14 · `caption` 12, plus `stat` 36 for the one number on SessionClose and `diff` 16 mono. Fonts load from Google Fonts through the `@import` at the top of `components/bundle.css`.

**Spacing and layout.** 4px base (`space-1` … `space-12`). Screen gutter `space-4` on phones, card padding `space-6`. Text columns stop at `measure` (34em). Tappable things are at least `size-tap` (44px); the Start button is `size-start` (64px) with `space-12` around it. Mobile first: a single column, the task centred, the next step at the bottom within thumb reach.

**Shape.** Index cards, not bubbles: `radius-lg` for sentence cards and sheets, `radius-md` for buttons, options and inputs, `radius-sm` for chips and the slot. `radius-full` is only for the Start button and audio discs.

**Elevation.** Borders do the work. `shadow-card` lifts only the sentence card in focus; `shadow-float` is for bottom sheets.

**Focus.** Keyboard focus is `focus-ring`: a 2px `paper` gap, then 2px solid `tinte`, drawn as a box-shadow so it follows the radius. It meets 3:1 on every surface in both themes.

**Motion.** Minimal and functional: a card slides out when answered; audio playback shows as the disc filling. No celebratory animation except a short, quiet checkpoint screen every 100 sentences.

**Images.** One situation image per depictable sentence (a café counter, a ticket machine), placed inside the SentenceCard directly above the sentence. The gloss is always on screen with it. No decorative stock photos, no images for abstract sentences, no rendered text inside images. Images belong to a meaning, not a language, so one scene serves every future language. Video appears only from Band 3 onward, captioned and trimmed to the sentence.

## Iconography

The product leads with words: "Play", "Slow", "Got it", "Change". The only glyphs are drawn in CSS inside components — the play triangle and pause bars in AudioButton, the → move mark in AlignmentStrip. No icon set has been chosen yet; if one is added, use a single stroke set at 1.5–2px, one colour (`ink` or `tinte`), and always beside a label. No emoji.

## States that must never appear

- A count of due or overdue cards.
- A confidence slider before an answer.
- A re-read-only screen.
- More than one highlighted slot in a sentence.
- A leaderboard, coins, gems, or a paid streak repair.
- A grade without its word.
