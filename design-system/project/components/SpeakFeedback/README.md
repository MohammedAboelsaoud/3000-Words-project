# SpeakFeedback

Word-level feedback after the learner says a sentence. The headline is intelligibility — "Clear", "Mostly clear", "Not clear yet" — never native-likeness. Mispronounced words get a wavy underline; omitted words are struck.

**Provide:** `words` (`{text, flag}`), `score` (0–100 from the speech engine).

- Offer a retry of the flagged words only.
- The learner can override the grade: engines have no published agreement with human raters.
- Audio is deleted after scoring unless the learner opted in.
