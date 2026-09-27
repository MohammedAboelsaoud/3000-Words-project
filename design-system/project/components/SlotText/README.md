# SlotText

Renders a sentence with its ONE changing slot or new chunk in the marker highlight. Bracket the slot in the text: `"Ich hätte gern [die Rechnung]."`

**Provide:** `text`; `highlight={false}` to hide the slot before a comparison is answered.

- Exactly one slot per sentence. Highlighting several parts, or colour-coding parts of speech, reduces comprehension.
- Keep the same slot position highlighted across a whole family.
