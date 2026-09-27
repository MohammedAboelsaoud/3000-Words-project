# StartButton

The one button on the home screen: "Start · 22 min". It turns the learner's minutes budget into today's session, so there is no deck, lesson or mode to choose.

**Provide:** `minutes` (today's planned length, from the planner) and `onClick`. `label` defaults to "Start"; use "Continue" mid-session and "Start recovery" in recovery mode.

- Do: show minutes, never a card count. "Start · 18 min", not "847 due".
- Do: one per screen, centred, with `space-12` around it.
- Don't: add a second primary action beside it.
