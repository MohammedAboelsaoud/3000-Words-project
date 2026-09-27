# SentenceCard

The unit of the app: one German sentence, its gloss, its audio and — only if the sentence is depictable — one situation image. Used for the reveal step and for every review answer.

**Provide:** `text` (slot in brackets), `gloss`, `glossDir="rtl"` + `glossLang="ar"` for Arabic, `band`/`theme` metadata, `audio` (AudioButtons), `media` (an `<img>` of the situation), `hidden` for listen-first.

- The gloss is always on screen when the text is; an image never replaces it.
- No decorative "mood" photos. Abstract sentences (*Das bezweifle ich.*) get no image.
- Every exposure ends in a retrieval task on the next screen.
