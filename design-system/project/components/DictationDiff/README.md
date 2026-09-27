# DictationDiff

The token diff after a dictation or typed answer: wrong tokens struck through with the right form beside them, missing tokens in a dashed box, extra tokens struck. The error type is logged underneath.

**Provide:** `tokens` (`{text, expected, status}`), `errorTag` (lexical, word order, case or agreement, mishearing, spelling).

- Accept *ae/oe/ue/ss* for *ä/ö/ü/ß*; a capitalisation slip is Hard, not Again.
- The diff is information, not a scolding: no red banner, no "Wrong!".
