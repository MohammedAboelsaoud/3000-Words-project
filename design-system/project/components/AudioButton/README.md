# AudioButton

Plays a sentence: `natural` speed, or `slow` (dashed ring). Slow audio is always followed by natural speed, and the slow button disappears once the comprehension memory is mature.

**Provide:** `speed`, `voice` (the speaker's name — voices rotate between reviews, so naming them makes the variety visible), `playing`, `onClick`.

- Generate slow audio with real TTS rate control; never time-stretch playback.
- Keep the natural button first.
